from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from db import init_db_pool
from sockets import register_socket_events

ALLOWED_ORIGINS = [
    'https://192.168.14.77:5173',
    'https://192.168.1.128:5173',
    'http://192.168.1.128:5173',
    "https://localhost:5173",
    'https://events.yote.me',
    'https://events.yote.me:5000',
    'http://100.114.44.16:5000'
]

socketio = SocketIO()

def create_app():
    app = Flask(__name__)

    CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

    app.db_pool = init_db_pool()

    # Register blueprints
    from routes.guests import guests_bp
    from routes.events import events_bp
    from routes.checkin import checkin_bp
    from routes.users import users_bp

    app.register_blueprint(guests_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(checkin_bp)
    app.register_blueprint(users_bp)

    register_socket_events(socketio)
    socketio.init_app(app, cors_allowed_origins=ALLOWED_ORIGINS)

    return app


if __name__ == "__main__":
    app = create_app()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)