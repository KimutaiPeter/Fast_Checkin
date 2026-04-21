from flask import Blueprint, jsonify, request
from db import get_db

guests_bp = Blueprint("guests", __name__)


@guests_bp.route("/")
def home():
    return jsonify({"message": "hello from backend"})


@guests_bp.route("/search", methods=["GET", "POST"])
def search():
    data = request.get_json()
    q = data.get("query", "").strip() if data else ""
    if not q:
        return jsonify([])

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        fields = ["id_number", "phone_number", "name"]
        like_clauses = " OR ".join([f"{f} LIKE %s" for f in fields])
        cursor.execute(
            f"SELECT * FROM guests WHERE {like_clauses} LIMIT 10",
            ["%" + q + "%" for _ in fields]
        )
        results = cursor.fetchall()
        cursor.close()
        return jsonify(results)
    finally:
        conn.close()


@guests_bp.route("/search2", methods=["GET", "POST"])
def search2():
    data = request.get_json()
    q = data.get("query", "").strip() if data else ""
    event_id = data.get("event_id") if data else None

    if not q or not event_id:
        return jsonify([])

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        fields = ["m.id_number", "m.phone_number", "m.name"]
        like_clauses = " OR ".join([f"{f} LIKE %s" for f in fields])
        sql = f"""
            SELECT m.*, i.serial_no AS invite_id, i.checked_in, i.token,
                   i.checkedin_timestamp, i.person_id, i.event_id,
                   (SELECT COUNT(*) FROM visitation_invite_record
                    WHERE id_number = m.id_number) AS total_invitations
            FROM master_record m
            INNER JOIN visitation_invite_record i ON i.id_number = m.id_number
            WHERE i.event_id = %s AND ({like_clauses})
            LIMIT 10
        """
        cursor.execute(sql, [event_id] + ["%" + q + "%" for _ in fields])
        results = cursor.fetchall()
        cursor.close()
        return jsonify(results)
    finally:
        conn.close()


@guests_bp.route("/update_guest", methods=["POST"])
def update_guest():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    index = data.get("no")
    if not index:
        return jsonify({"error": "Missing id_number"}), 400

    allowed_fields = ["name", "phone_number", "id_number", "checked_in"]
    updates, params = [], []

    for field in allowed_fields:
        if field in data:
            updates.append(f"`{field}` = %s")
            params.append(data[field])

    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    params.append(index)
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE guests SET {', '.join(updates)} WHERE no = %s", params)
        conn.commit()
        cursor.close()
        return jsonify({"success": True, "updated_fields": updates, "id_number": index})
    finally:
        conn.close()


@guests_bp.route("/count_guests", methods=["GET"])
def count_guests():
    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) AS total FROM guests")
        total_rows = cursor.fetchone()["total"]
        cursor.execute("SELECT COUNT(*) AS checkedin FROM guests WHERE checked_in = TRUE")
        active_rows = cursor.fetchone()["checkedin"]
        cursor.close()
        return jsonify({"total_rows": total_rows, "checkedin_rows": active_rows})
    finally:
        conn.close()