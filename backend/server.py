from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mysql.connector
import ssl

app = Flask(__name__)
CORS(app,supports_credentials=True, origins=["https://192.168.1.141:5173"])

# initialize SocketIO with eventlet async mode
#socketio = SocketIO(app, cors_allowed_origins="*")

socketio = SocketIO(app,cors_allowed_origins=["https://192.168.1.141:5173"])

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

    cursor = db.cursor(dictionary=True)

    # Example fields to search in
    fields = ["id_number", "phone_number", "name"]

    # Build WHERE clause dynamically
    like_clauses = " OR ".join([f"{field} LIKE %s" for field in fields])
    sql = f"SELECT * FROM guests WHERE {like_clauses} LIMIT 10"

    # Create params list for all fields
    params = ["%" + q + "%" for _ in fields]

    cursor.execute(sql, params)
    results = cursor.fetchall()
    cursor.close()

    return jsonify(results)
    return jsonify([f"Result for"])

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
