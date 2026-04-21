from flask_socketio import emit


def register_socket_events(socketio):

    @socketio.on("connect")
    def handle_connect():
        print("Client connected")
        emit("welcome", {"msg": "Connected to WebSocket!"})

    @socketio.on("ping")
    def handle_ping(data):
        print("Got ping:", data)
        emit("pong", {"msg": "pong from server"})