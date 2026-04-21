from flask import Blueprint, jsonify, request
from db import get_db

events_bp = Blueprint("events", __name__)


@events_bp.route("/add_event", methods=["POST"])
def add_event():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    date = data.get("date")
    if not name or not date:
        return jsonify({"error": "Missing required fields: name and date"}), 400

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO events (name, description, date, venue, features, status) VALUES (%s, %s, %s, %s, %s, %s)",
            (name, data.get("description", ""), date, data.get("venue", ""), data.get("features", ""), data.get("status", "active"))
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return jsonify({"success": True, "serial_no": new_id, "name": name, "code": 0}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@events_bp.route("/get_events", methods=["GET", "POST"])
def get_events():
    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.*,
                   COUNT(i.serial_no) AS total_invites,
                   SUM(i.checked_in) AS total_checkedin
            FROM events e
            LEFT JOIN visitation_invite_record i ON i.event_id = e.serial_no
            GROUP BY e.serial_no
        """)
        events = cursor.fetchall()
        cursor.close()
        return jsonify({"events": events, "code": 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@events_bp.route("/delete_event", methods=["POST"])
def delete_event():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    serial_no = data.get("serial_no")
    if not serial_no:
        return jsonify({"error": "Missing serial_no"}), 400

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM events WHERE serial_no = %s", (serial_no,))
        conn.commit()
        affected = cursor.rowcount
        cursor.close()
        if affected == 0:
            return jsonify({"error": "Event not found"}), 404
        return jsonify({"code": 0, "success": True, "serial_no": serial_no})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@events_bp.route("/get_event_data", methods=["POST"])
def get_event_data():
    data = request.get_json() or {}
    page     = int(data.get("page", 1))
    per_page = int(data.get("per_page", 25))
    event_id = data.get("event_id")
    sort_by  = data.get("sort_by", "name")
    order    = "DESC" if data.get("order", "asc").lower() == "desc" else "ASC"

    allowed_sort = {"name": "m.name", "id_number": "m.id_number", "phone": "m.phone_number"}
    sort_column = allowed_sort.get(sort_by, "m.name")

    conn, cursor = None, None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT COUNT(DISTINCT m.id_number) AS total FROM master_record m INNER JOIN visitation_invite_record i ON i.id_number = m.id_number WHERE i.event_id = %s",
            [event_id]
        )
        total = cursor.fetchone()["total"]
        offset = (page - 1) * per_page

        cursor.execute(
            f"SELECT DISTINCT m.id_number FROM master_record m INNER JOIN visitation_invite_record i ON i.id_number = m.id_number WHERE i.event_id = %s ORDER BY {sort_column} {order} LIMIT %s OFFSET %s",
            [event_id, per_page, offset]
        )
        ids = [row["id_number"] for row in cursor.fetchall()]

        meta = {"page": page, "per_page": per_page, "total": total, "pages": -(-total // per_page), "has_next": (page * per_page) < total, "has_prev": page > 1}

        if not ids:
            return jsonify({"code": 0, "data": [], "meta": {**meta, "has_next": False}})

        format_strings = ",".join(["%s"] * len(ids))
        cursor.execute(
            f"SELECT m.name, m.id_number, m.phone_number AS phone, m.county, m.subcounty, COUNT(i.serial_no) AS visits, MAX(i.checked_in) AS checked_in, MAX(i.checkedin_timestamp) AS checkin_timestamp, MAX(i.token) AS token, MAX(i.person_id) AS checked_by FROM master_record m INNER JOIN visitation_invite_record i ON i.id_number = m.id_number WHERE i.event_id = %s AND m.id_number IN ({format_strings}) GROUP BY m.id_number",
            [event_id] + ids
        )
        return jsonify({"code": 0, "data": cursor.fetchall(), "meta": meta})
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@events_bp.route("/search_event_data", methods=["POST"])
def search_event_data():
    data = request.get_json() or {}
    page     = int(data.get("page", 1))
    per_page = int(data.get("per_page", 25))
    event_id = data.get("event_id")
    search   = data.get("search", "").strip()
    sort_by  = data.get("sort_by", "name")
    order    = "DESC" if data.get("order", "asc").lower() == "desc" else "ASC"

    allowed_sort = {"name": "m.name", "id_number": "m.id_number", "phone": "m.phone_number"}
    sort_column = allowed_sort.get(sort_by, "m.name")

    fields = ["m.name", "m.id_number", "m.phone_number"]
    like_clauses = " OR ".join([f"{f} LIKE %s" for f in fields])
    search_sql    = f"AND ({like_clauses})" if search else ""
    search_params = ["%" + search + "%" for _ in fields] if search else []

    conn, cursor = None, None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            f"SELECT COUNT(DISTINCT m.id_number) AS total FROM master_record m INNER JOIN visitation_invite_record i ON i.id_number = m.id_number WHERE i.event_id = %s {search_sql}",
            [event_id] + search_params
        )
        total = cursor.fetchone()["total"]
        offset = (page - 1) * per_page

        cursor.execute(
            f"SELECT DISTINCT m.id_number FROM master_record m INNER JOIN visitation_invite_record i ON i.id_number = m.id_number WHERE i.event_id = %s {search_sql} ORDER BY {sort_column} {order} LIMIT %s OFFSET %s",
            [event_id] + search_params + [per_page, offset]
        )
        ids = [row["id_number"] for row in cursor.fetchall()]

        meta = {"page": page, "per_page": per_page, "total": total, "pages": -(-total // per_page), "has_next": (page * per_page) < total, "has_prev": page > 1}

        if not ids:
            return jsonify({"code": 0, "data": [], "meta": {**meta, "has_next": False}})

        format_strings = ",".join(["%s"] * len(ids))
        cursor.execute(
            f"SELECT m.name, m.id_number, m.phone_number AS phone, m.county, m.subcounty, COUNT(i.serial_no) AS visits, MAX(i.checked_in) AS checked_in, MAX(i.checkedin_timestamp) AS checkin_timestamp, MAX(i.token) AS token, MAX(i.person_id) AS checked_by FROM master_record m INNER JOIN visitation_invite_record i ON i.id_number = m.id_number WHERE i.event_id = %s AND m.id_number IN ({format_strings}) GROUP BY m.id_number",
            [event_id] + ids
        )
        return jsonify({"code": 0, "data": cursor.fetchall(), "meta": meta})
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@events_bp.route("/get_person_event_history", methods=["POST"])
def get_person_event_history():
    data = request.get_json() or {}
    id_number = data.get("id_number")

    if not id_number:
        return jsonify({"code": 1, "message": "id_number is required"}), 400

    conn, cursor = None, None
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.serial_no AS event_id, e.name, e.description, e.date, e.venue,
                   v.checked_in, v.token, v.person_id AS checked_by, v.checkedin_timestamp
            FROM visitation_invite_record v
            INNER JOIN events e ON e.serial_no = v.event_id
            WHERE v.id_number = %s
            ORDER BY e.date DESC
        """, [id_number])
        return jsonify({"code": 0, "data": cursor.fetchall()})
    finally:
        if cursor: cursor.close()
        if conn: conn.close()