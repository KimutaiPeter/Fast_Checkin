from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from mysql.connector import pooling

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    'https://192.168.14.77:5173',
    'https://192.168.1.128:5173',
    'http://192.168.1.128:5173',
    "https://localhost:5173",
    'https://events.yote.me',
    'https://events.yote.me:5000'
])

socketio = SocketIO(app, cors_allowed_origins=[
    'https://192.168.14.77:5173',
    'https://192.168.1.128:5173',
    "https://localhost:5173",
    'https://events.yote.me',
    'https://events.yote.me:5000',
    'http://100.114.44.16:5000'
])

# ---- Connection Pool (replaces the global `db` connection) ----
db_pool = pooling.MySQLConnectionPool(
    pool_name="fast_checkin_pool",
    pool_size=20,
    pool_reset_session=True,
    host="localhost",
    user="me",
    password="123",
    database="fast_checkin"
)

def get_db():
    """Get a connection from the pool. Always use inside a try/finally to ensure it's closed."""
    return db_pool.get_connection()


# ---- Pagination Helper ----
def paginate_query(cursor, sql, params, page, per_page):
    """
    Runs a paginated query and returns data + meta.
    sql      - base SELECT query (no LIMIT/OFFSET)
    params   - list of params for the WHERE clause
    """
    count_sql = f"SELECT COUNT(*) AS total FROM ({sql}) AS subquery"
    cursor.execute(count_sql, params)
    total = cursor.fetchone()["total"]

    offset = (page - 1) * per_page
    paginated_sql = f"{sql} LIMIT %s OFFSET %s"
    cursor.execute(paginated_sql, params + [per_page, offset])
    rows = cursor.fetchall()

    return {
        "data": rows,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": -(-total // per_page),  # ceiling division
            "has_next": (page * per_page) < total,
            "has_prev": page > 1
        }
    }


@app.route("/")
def home():
    return jsonify({"message": "hello from backend"})


# ---- Search Endpoint ----
@app.route("/search", methods=['GET', 'POST'])
def search():
    data = request.get_json()
    q = data.get("query", "").strip() if data else ""
    if not q:
        return jsonify([])

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        fields = ["id_number", "phone_number", "name"]
        like_clauses = " OR ".join([f"{field} LIKE %s" for field in fields])
        sql = f"SELECT * FROM guests WHERE {like_clauses} LIMIT 10"
        params = ["%" + q + "%" for _ in fields]
        cursor.execute(sql, params)
        results = cursor.fetchall()
        cursor.close()
        return jsonify(results)
    finally:
        conn.close()


# ---- Search2 Endpoint ----
@app.route("/search2", methods=['GET', 'POST'])
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
        like_clauses = " OR ".join([f"{field} LIKE %s" for field in fields])
        sql = f"""
            SELECT m.*, i.serial_no AS invite_id, i.checked_in, i.token,
                   i.checkedin_timestamp, i.person_id, i.event_id,
                   (SELECT COUNT(*) FROM visitation_invite_record
                    WHERE id_number = m.id_number) AS total_invitations
            FROM master_record m
            INNER JOIN visitation_invite_record i ON i.id_number = m.id_number
            WHERE i.event_id = %s
              AND ({like_clauses})
            LIMIT 10
        """
        params = [event_id] + ["%" + q + "%" for _ in fields]
        cursor.execute(sql, params)
        results = cursor.fetchall()
        cursor.close()
        return jsonify(results)
    finally:
        conn.close()


@app.route("/get_event_data", methods=["POST"])
def get_event_data():
    data = request.get_json() or {}

    page     = int(data.get("page", 1))
    per_page = int(data.get("per_page", 25))
    event_id = data.get("event_id")

    sort_by  = data.get("sort_by", "name")
    order    = "DESC" if data.get("order", "asc").lower() == "desc" else "ASC"

    # ✅ Sorting whitelist
    allowed_sort = {
        "name": "m.name",
        "id_number": "m.id_number",
        "phone": "m.phone_number"
    }

    sort_column = allowed_sort.get(sort_by, "m.name")

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # ---- COUNT (FAST) ----
        count_sql = """
            SELECT COUNT(DISTINCT m.id_number) AS total
            FROM master_record m
            INNER JOIN visitation_invite_record i
                ON i.id_number = m.id_number
            WHERE i.event_id = %s
        """

        cursor.execute(count_sql, [event_id])
        total = cursor.fetchone()["total"]

        offset = (page - 1) * per_page

        # ---- STEP 1: GET IDS ONLY (VERY FAST) ----
        base_sql = f"""
            SELECT DISTINCT m.id_number
            FROM master_record m
            INNER JOIN visitation_invite_record i
                ON i.id_number = m.id_number
            WHERE i.event_id = %s
            ORDER BY {sort_column} {order}
            LIMIT %s OFFSET %s
        """

        cursor.execute(base_sql, [event_id, per_page, offset])
        ids = [row["id_number"] for row in cursor.fetchall()]

        if not ids:
            return jsonify({
                "code": 0,
                "data": [],
                "meta": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": -(-total // per_page),
                    "has_next": False,
                    "has_prev": page > 1
                }
            })

        # ---- STEP 2: GET FULL DATA FOR THESE IDS ----
        format_strings = ",".join(["%s"] * len(ids))

        sql = f"""
            SELECT 
                m.name,
                m.id_number,
                m.phone_number AS phone,
                m.county,
                m.subcounty,

                COUNT(i.serial_no) AS visits,

                MAX(i.checked_in) AS checked_in,
                MAX(i.checkedin_timestamp) AS checkin_timestamp,
                MAX(i.token) AS token,
                MAX(i.person_id) AS checked_by

            FROM master_record m
            INNER JOIN visitation_invite_record i
                ON i.id_number = m.id_number

            WHERE i.event_id = %s
            AND m.id_number IN ({format_strings})

            GROUP BY m.id_number
        """

        cursor.execute(sql, [event_id] + ids)
        rows = cursor.fetchall()

        return jsonify({
            "code": 0,
            "data": rows,
            "meta": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": -(-total // per_page),
                "has_next": (page * per_page) < total,
                "has_prev": page > 1
            }
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/search_event_data", methods=["POST"])
def get_search_data():
    data = request.get_json() or {}

    page     = int(data.get("page", 1))
    per_page = int(data.get("per_page", 25))
    event_id = data.get("event_id")
    search   = data.get("search", "").strip()

    sort_by  = data.get("sort_by", "name")
    order    = "DESC" if data.get("order", "asc").lower() == "desc" else "ASC"

    allowed_sort = {
        "name": "m.name",
        "id_number": "m.id_number",
        "phone": "m.phone_number"
    }
    print(data)

    sort_column = allowed_sort.get(sort_by, "m.name")

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # ---- SEARCH ----
        fields = ["m.name", "m.id_number", "m.phone_number"]
        like_clauses = " OR ".join([f"{f} LIKE %s" for f in fields])
        search_sql = f"AND ({like_clauses})" if search else ""
        search_params = ["%" + search + "%" for _ in fields] if search else []

        # ---- COUNT (FAST) ----
        count_sql = f"""
            SELECT COUNT(DISTINCT m.id_number) AS total
            FROM master_record m
            INNER JOIN visitation_invite_record i
                ON i.id_number = m.id_number
            WHERE i.event_id = %s
            {search_sql}
        """

        cursor.execute(count_sql, [event_id] + search_params)
        total = cursor.fetchone()["total"]

        offset = (page - 1) * per_page

        # ---- STEP 1: GET ONLY IDS (FAST) ----
        base_sql = f"""
            SELECT DISTINCT m.id_number
            FROM master_record m
            INNER JOIN visitation_invite_record i
                ON i.id_number = m.id_number
            WHERE i.event_id = %s
            {search_sql}
            ORDER BY {sort_column} {order}
            LIMIT %s OFFSET %s
        """

        cursor.execute(base_sql, [event_id] + search_params + [per_page, offset])
        ids = [row["id_number"] for row in cursor.fetchall()]

        if not ids:
            return jsonify({
                "code": 0,
                "data": [],
                "meta": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": -(-total // per_page),
                    "has_next": False,
                    "has_prev": page > 1
                }
            })

        # ---- STEP 2: GET FULL DATA ONLY FOR THESE IDS ----
        format_strings = ",".join(["%s"] * len(ids))

        sql = f"""
            SELECT 
                m.name,
                m.id_number,
                m.phone_number AS phone,
                m.county,
                m.subcounty,

                COUNT(i.serial_no) AS visits,

                MAX(i.checked_in) AS checked_in,
                MAX(i.checkedin_timestamp) AS checkin_timestamp,
                MAX(i.token) AS token,
                MAX(i.person_id) AS checked_by

            FROM master_record m
            INNER JOIN visitation_invite_record i
                ON i.id_number = m.id_number

            WHERE i.event_id = %s
            AND m.id_number IN ({format_strings})

            GROUP BY m.id_number
        """

        cursor.execute(sql, [event_id] + ids)
        rows = cursor.fetchall()

        return jsonify({
            "code": 0,
            "data": rows,
            "meta": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": -(-total // per_page),
                "has_next": (page * per_page) < total,
                "has_prev": page > 1
            }
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()




@app.route("/get_person_event_history", methods=["POST"])
def get_person_event_history():
    data = request.get_json() or {}
    id_number = data.get("id_number")

    if not id_number:
        return jsonify({
            "code": 1,
            "message": "id_number is required"
        }), 400

    conn = None
    cursor = None

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT
                e.serial_no AS event_id,
                e.name,
                e.description,
                e.date,
                e.venue,

                v.checked_in,
                v.token,
                v.person_id AS checked_by,
                v.checkedin_timestamp

            FROM visitation_invite_record v
            INNER JOIN events e
                ON e.serial_no = v.event_id

            WHERE v.id_number = %s
            ORDER BY e.date DESC
        """

        cursor.execute(sql, [id_number])
        rows = cursor.fetchall()

        return jsonify({
            "code": 0,
            "data": rows
        })

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()




# ---- Update Guest Endpoint ----
@app.route("/update_guest", methods=["POST"])
def update_guest():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    index = data.get("no")
    if not index:
        return jsonify({"error": "Missing id_number"}), 400

    allowed_fields = ["name", "phone_number", "id_number", "checked_in"]

    updates = []
    params = []

    for field in allowed_fields:
        if field in data:
            updates.append(f'`{field}` = %s')   # parameterized — no injection risk
            params.append(data[field])

    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    params.append(index)  # for the WHERE clause
    sql = f"UPDATE guests SET {', '.join(updates)} WHERE no = %s"

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        conn.commit()
        cursor.close()
        return jsonify({
            "success": True,
            "updated_fields": updates,
            "id_number": index
        })
    finally:
        conn.close()


# ---- Search ID Endpoint ----
@app.route("/search_id", methods=["POST"])
def search_id():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    id_number = data.get("id_number")
    event_id = data.get("event_id")

    if not id_number or not event_id:
        return jsonify({"success": False, "error": "Missing id_number", "code": 2})

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM visitation_invite_record WHERE id_number = %s AND event_id = %s",
            (id_number, event_id)
        )
        guest = cursor.fetchone()
        cursor.close()

        if not guest:
            return jsonify({"code": 1, "success": False, "message": "Guest not found"})

        return jsonify({
            "code": 0,
            "success": True,
            "message": "Guest is found",
            "id_number": id_number,
            "guest_details": guest
        })
    finally:
        conn.close()


# ---- Check In Endpoint ----
@app.route("/check_in", methods=["POST"])
def check_in():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    id_number = data.get("id_number")
    event_id = data.get("event_id")
    token = data.get("token")

    if not id_number or not event_id:
        return jsonify({"success": False, "error": "Missing id_number"})

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        if token:
            cursor.execute(
                "SELECT * FROM visitation_invite_record WHERE id_number = %s AND event_id = %s AND token = %s",
                (id_number, event_id, token)
            )
        else:
            cursor.execute(
                "SELECT * FROM visitation_invite_record WHERE id_number = %s AND event_id = %s",
                (id_number, event_id)
            )

        guest = cursor.fetchone()

        if not guest:
            cursor.close()
            return jsonify({"success": False, "message": "Guest not found"})

        if guest["checked_in"] != 1:
            cursor.execute(
                "UPDATE visitation_invite_record SET checked_in = 1,checkedin_timestamp = NOW() WHERE serial_no = %s",
                (guest["serial_no"],)
            )
            conn.commit()

        cursor.close()
        return jsonify({
            "code": 0,
            "success": True,
            "message": "Guest status updated",
            "id_number": id_number,
            "data": guest
        })
    finally:
        conn.close()


# ---- Count Guests Endpoint ----
@app.route("/count_guests", methods=["GET"])
def count_guests():
    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) AS total FROM guests")
        total_rows = cursor.fetchone()["total"]
        cursor.execute("SELECT COUNT(*) AS checkedin FROM guests WHERE checked_in = TRUE")
        active_rows = cursor.fetchone()["checkedin"]
        cursor.close()
        return jsonify({
            "total_rows": total_rows,
            "checkedin_rows": active_rows
        })
    finally:
        conn.close()


# ---- Add Event Endpoint ----
@app.route("/add_event", methods=["POST"])
def add_event():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    date = data.get("date")

    if not name or not date:
        return jsonify({"error": "Missing required fields: name and date"}), 400

    description = data.get("description", "")
    venue       = data.get("venue", "")
    features    = data.get("features", "")
    status      = data.get("status", "active")

    sql = "INSERT INTO events (name, description, date, venue, features, status) VALUES (%s, %s, %s, %s, %s, %s)"
    params = (name, description, date, venue, features, status)

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return jsonify({
            "success": True,
            "serial_no": new_id,
            "name": name,
            "code": 0
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# ---- Get Events Endpoint ----
@app.route("/get_events", methods=["GET", "POST"])
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


# ---- Delete Event Endpoint ----
@app.route("/delete_event", methods=["POST"])
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


# ---- WebSocket Events ----
@socketio.on("connect")
def handle_connect():
    print("Client connected")
    emit("welcome", {"msg": "Connected to WebSocket!"})

@socketio.on("ping")
def handle_ping(data):
    print("Got ping:", data)
    emit("pong", {"msg": "pong from server"})


# ---- Run ----
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)