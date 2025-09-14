from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mysql.connector
import ssl

app = Flask(__name__)
CORS(app,supports_credentials=True, origins=["https://192.168.1.141:5173","https://localhost:5173"])

# initialize SocketIO with eventlet async mode
#socketio = SocketIO(app, cors_allowed_origins="*")

socketio = SocketIO(app,cors_allowed_origins=["https://192.168.1.141:5173","https://localhost:5173"])

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


# ---- Check & Update Guest Status Endpoint ----
@app.route("/check_in", methods=["POST"])
def check_in():
    # Parse incoming JSON
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    id_number = data.get("id_number")
    if not id_number:
        return jsonify({"success":False,"error": "Missing id_number"})

    # Step 1: Check if guest exists
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM guests WHERE id_number = %s", (id_number,))
    guest = cursor.fetchone()
    print(guest)

    if not guest:
        # Guest not found, return false
        cursor.close()
        return jsonify({"success": False, "message": "Guest not found"})
    
    if(guest["checked_in"]!=1):
        # Step 2: Update status (you can change 'status' value as needed)
        cursor.execute(f'UPDATE guests SET checked_in = 1 WHERE `no` = "{guest["no"]}"')
        db.commit()
        cursor.close()

    # Step 3: Return success with updated info
    return jsonify({
        "success": True,
        "message": "Guest status updated",
        "id_number": id_number,
        "guest_details":guest
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
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, ssl_context=("server.pem", "server_key.pem"))
