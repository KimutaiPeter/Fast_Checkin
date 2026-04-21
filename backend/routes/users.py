from flask import Blueprint, jsonify
 
users_bp = Blueprint("users", __name__, url_prefix="/users")
 
@users_bp.route("/")
def get_users():
    return jsonify([{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}])
 
@users_bp.route("/<int:user_id>")
def get_user(user_id):
    return jsonify({"id": user_id, "name": "Alice"})
 