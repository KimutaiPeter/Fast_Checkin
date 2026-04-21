from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mysql.connector
import ssl

app = Flask(__name__)
CORS(app,supports_credentials=True, origins=['https://192.168.14.77:5173','https://192.168.1.128:5173',"https://localhost:5173",'https://events.yote.me','https://events.yote.me:5000'])

# initialize SocketIO with eventlet async mode
#socketio = SocketIO(app, cors_allowed_origins="*")

socketio = SocketIO(app,cors_allowed_origins=['https://192.168.14.77:5173','https://192.168.1.128:5173',"https://localhost:5173",'https://events.yote.me','https://events.yote.me:5000','http://100.114.44.16:5000'])

# Setup DB connection
db = mysql.connector.connect(
    host="localhost",
    user="me",
    password="123",
    database="Fast_checkin"
)

@app.route("/")
def home():
    return jsonify({"message":"hello from backend"})

# ---- Regular Flask API endpoint ----
@app.route("/search",methods=['GET', 'POST'])
def search():
    print(request.data)
    data = request.get_json()  # get JSON body
    q = data.get("query", "").strip() if data else ""
    if not q:
        return jsonify([])


    db = mysql.connector.connect(
        host="localhost",
        user="me",
        password="123",
        database="Fast_checkin"
    )
    cursor = db.cursor(dictionary=True)

    # Example fields to search in
    fields = ["id_number", "phone_number", "name"]

    # Build WHERE clause dynamically
    like_clauses = " OR ".join([f"{field} LIKE %s" for field in fields])
    sql = f"SELECT * FROM guests WHERE {like_clauses} LIMIT 10"

    # Create params list for all fields
    params = ["%" + q + "%" for _ in fields]

    #print(sql)

    cursor.execute(sql, params)
    results = cursor.fetchall()
    cursor.close()

    return jsonify(results)


# ---- Search Endpoint ----
@app.route("/search2", methods=['GET', 'POST'])
def search2():
    data = request.get_json()
    q = data.get("query", "").strip() if data else ""
    event_id = data.get("event_id") if data else None
    # event_id=3

    if not q or not event_id:
        return jsonify([])

    conn = mysql.connector.connect(
        host="localhost",
        user="me",
        password="123",
        database="Fast_checkin"
    )
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
    conn.close()

    return jsonify(results)
    

# ---- Update Guest Endpoint ----
@app.route("/update_guest", methods=["POST"])
def update_guest():
    # Parse incoming JSON body
    print("received request")
    data = request.get_json()
    print(data)
    # Ensure client sent data
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extract the identifier for the row we want to update
    # Here we assume "id_number" is the unique index column in your guests table
    index = data.get("no")
    if not index:
        return jsonify({"error": "Missing id_number"}), 400

    # Define which fields are allowed to be updated (security measure)
    # Prevents someone from trying to update columns like "id_number" or others you don't want touched
    allowed_fields = ["name", "phone_number","id_number","checked_in"]

    # Prepare SQL update parts
    updates = []   # will store things like "name = %s"
    params = []    # will store actual values like ["John Doe", "0712345678"]

    # Loop through allowed fields and check if they are present in the request
    for field in allowed_fields:
        if field in data:
            updates.append(f'`{field}` = "{data[field]}"')  # e.g. "name = %s"
            

    # If no valid fields were included, abort
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    # Add the "id_number" to the params for the WHERE clause
    params.append(index)

    # Build the SQL dynamically with only the fields we want to update
    sql = f"UPDATE guests SET {', '.join(updates)} WHERE no = {index}"
    print(sql)

    # Execute query
    cursor = db.cursor()
    cursor.execute(sql)
    db.commit()
    cursor.close()

    # Respond with success message and details of what was updated
    return jsonify({
        "success": True,
        "updated_fields": updates,   # shows which columns got updated
        "id_number": index           # which record was updated
    })




# ---- Search if an id is present in an invitation ----
@app.route("/search_id", methods=["POST"])
def search_id():
    # Parse incoming JSON
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400
    print(data)

    id_number = data.get("id_number")
    event_id = data.get("event_id")
    print(id_number,event_id)
    if not id_number or not event_id:

        return jsonify({"success":False,"error": "Missing id_number" ,'code':2})

    # Step 1: Check if guest exists
    cursor = db.cursor(dictionary=True)
    cursor.execute(
    "SELECT * FROM visitation_invite_record WHERE id_number = %s AND event_id = %s",
    (id_number, event_id))
    guest = cursor.fetchone()
    print(guest)

    if not guest:
        # Guest not found, return false
        cursor.close()
        return jsonify({'code':1,"success": False, "message": "Guest not found"})
    

    # Step 3: Return success with updated info
    return jsonify({
        'code':0,
        "success": True,
        "message": "Guest is found",
        "id_number": id_number,
        "guest_details":guest
    })




# ---- Check & Update Guest Status Endpoint ----
@app.route("/check_in", methods=["POST"])
def check_in():
    # Parse incoming JSON
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    id_number = data.get("id_number")
    event_id = data.get("event_id")
    token = data.get("token")
    if not id_number or not event_id:
        return jsonify({"success":False,"error": "Missing id_number"})

    # Step 1: Check if guest exists
    cursor = db.cursor(dictionary=True)
    if token:
        cursor.execute(
        "SELECT * FROM visitation_invite_record WHERE id_number = %s AND event_id = %s AND token = %s",
        (id_number, event_id,token))
    else:
        cursor.execute(
        "SELECT * FROM visitation_invite_record WHERE id_number = %s AND event_id = %s",
        (id_number, event_id))
    guest = cursor.fetchone()
    print(guest)

    if not guest:
        # Guest not found, return false
        cursor.close()
        return jsonify({"success": False, "message": "Guest not found"})
    
    if(guest["checked_in"]!=1):
        # Step 2: Update status (you can change 'status' value as needed)
        cursor.execute(f'UPDATE visitation_invite_record SET checked_in = 1 WHERE `serial_no` = "{guest["serial_no"]}"')
        db.commit()
        cursor.close()

    # Step 3: Return success with updated info
    return jsonify({
        'code':0,
        "success": True,
        "message": "Guest status updated",
        "id_number": id_number,
        "data":guest
    })


# ---- Count Guests Endpoint ----
@app.route("/count_guests", methods=["GET"])
def count_guests():
    cursor = db.cursor(dictionary=True)

    # Query 1: Total rows in guests table
    cursor.execute("SELECT COUNT(*) AS total FROM guests")
    total_rows = cursor.fetchone()["total"]

    # Query 2: Rows with status = TRUE
    cursor.execute("SELECT COUNT(*) AS checkedin FROM guests WHERE checked_in = TRUE")
    active_rows = cursor.fetchone()["checkedin"]

    cursor.close()

    # Return both counts as JSON
    return jsonify({
        "total_rows": total_rows,
        "checkedin_rows": active_rows
    })


# ---- Add Event Endpoint ----
@app.route("/add_event", methods=["POST"])
def add_event():
    data = request.get_json()
    print(data)

    if not data:
        return jsonify({"error": "No data provided"}), 400
    # Required fields
    name = data.get("name")
    date = data.get("date")

    if not name or not date:
        return jsonify({"error": "Missing required fields: name and date"}), 400

    # Optional fields
    description = data.get("description", "")
    venue       = data.get("venue", "")
    features    = data.get("features", "")
    status      = data.get("status", "active")

    sql = """INSERT INTO events (name, description, date, venue, features, status) VALUES (%s, %s, %s, %s, %s, %s)"""
    params = (name, description, date, venue, features, status)

    try:
        cursor = db.cursor()
        cursor.execute(sql,params)
        db.commit()
        new_id = cursor.lastrowid
        cursor.close()
    except Exception as e:
        print(str(e), sql)
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "serial_no": new_id,
        "name": name,
        'code':0
    }), 201


# ---- Get Events Endpoint ----
@app.route("/get_events", methods=["GET",'POST'])
def get_events():
    try:
        cursor = db.cursor(dictionary=True)
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
        return jsonify({'events':events,'code':0})
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500
    

# ---- Delete Event Endpoint ----
@app.route("/delete_event", methods=["POST"])
def delete_event():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    serial_no = data.get("serial_no")
    if not serial_no:
        return jsonify({"error": "Missing serial_no"}), 400

    try:
        cursor = db.cursor()
        cursor.execute("DELETE FROM events WHERE serial_no = %s", (serial_no,))
        db.commit()
        affected = cursor.rowcount
        cursor.close()

        if affected == 0:
            return jsonify({"error": "Event not found"}), 404

        return jsonify({'code':0,"success": True, "serial_no": serial_no})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---- WebSocket event ----
@socketio.on("connect")
def handle_connect():
    print("Client connected")
    emit("welcome", {"msg": "Connected to WebSocket!"})

@socketio.on("ping")
def handle_ping(data):
    print("Got ping:", data)
    emit("pong", {"msg": "pong from server"})

# ---- Run with eventlet, not werkzeug ----
if __name__ == "__main__":
    # socketio.run(app, host="0.0.0.0", port=5000, debug=True, ssl_context=("server.pem", "server_key.pem"))
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
