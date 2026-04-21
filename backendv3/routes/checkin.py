from flask import Blueprint, jsonify, request
from db import get_db

checkin_bp = Blueprint("checkin", __name__)


@checkin_bp.route("/search_id", methods=["POST"])
def search_id():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    id_number = data.get("id_number")
    event_id  = data.get("event_id")

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

        return jsonify({"code": 0, "success": True, "message": "Guest is found", "id_number": id_number, "guest_details": guest})
    finally:
        conn.close()


@checkin_bp.route("/check_in", methods=["POST"])
def check_in():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    id_number = data.get("id_number")
    event_id  = data.get("event_id")
    token     = data.get("token")

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
                "UPDATE visitation_invite_record SET checked_in = 1, checkedin_timestamp = NOW() WHERE serial_no = %s",
                (guest["serial_no"],)
            )
            conn.commit()

        cursor.close()
        return jsonify({"code": 0, "success": True, "message": "Guest status updated", "id_number": id_number, "data": guest})
    finally:
        conn.close()