from flask import Blueprint, jsonify, request
from db import get_db
import bcrypt
import pyotp
from cryptography.fernet import Fernet

from invitation import send_invite

users_bp = Blueprint("users", __name__)


def generate_2fa_secret(email, app_name="events"):
    """
    Generates a TOTP secret.
    Returns the secret (to be stored) and a base64 QR code image (to show the user once).
    """
    secret      = pyotp.random_base32()
    totp_uri    = pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=app_name)
    return secret


# Load once at the top of your file
fernet = Fernet("ZmDfcTF7_60GrrY167zsiPd67pEvs0aGOv2oasOM1Pg=".encode())

def encrypt_password(plain_text):
    return fernet.encrypt(plain_text.encode("utf-8")).decode("utf-8")

def decrypt_password(cipher_text):
    return fernet.decrypt(cipher_text.encode("utf-8")).decode("utf-8")

SECRET = 783921  # keep this private

def encode_index(n):
    mixed = n + SECRET
    return base36encode(mixed)

def base36encode(number):
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    result = ""
    while number:
        number, i = divmod(number, 36)
        result = chars[i] + result
    return result or "0"


@users_bp.route("/register_member", methods=["POST"])
def register_member():
    data              = request.get_json() or {}
    name              = data.get("name", "").strip()
    email             = data.get("email", "").strip()
    security_protocol = data.get("security_protocol", "").strip()
    added_by          = data.get("added_by")
    password          = data.get("password")
    role          = data.get("role")
    print(data)

    if not name or not security_protocol:
        return jsonify({"code": 1, "message": "name, security_protocol and password are required"}), 400

    conn, cursor = None, None
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        if security_protocol == "password":
            cursor.execute("SELECT serial_no FROM team WHERE email = %s", [email])
            if cursor.fetchone():
                return jsonify({"code": 1, "message": "A member with this email already exists"})

            totp_secret = generate_2fa_secret(email)
            encrypted_secret = encrypt_password(totp_secret)

            cursor.execute(
                "INSERT INTO team (name, email,role ,security_protocol, passphrase, status, added_by) VALUES (%s,%s ,%s, %s, %s, %s, %s)",
                [name, email,role, security_protocol, totp_secret, "invite_pending", added_by]
            )
            conn.commit()
            print('something',cursor.lastrowid,' ',encode_index(cursor.lastrowid))
            send_invite(email, encode_index(cursor.lastrowid))
            return jsonify({"code": 0, "message": "Member registered successfully"})

        elif security_protocol == "pin_only":
            encrypted_pin = encrypt_password(password)
            cursor.execute(
                "INSERT INTO team (name, role, security_protocol, password, status, added_by) VALUES (%s,%s, %s, %s, %s, %s)",
                [name, role, security_protocol, password, "active", added_by]
            )
            conn.commit()
            return jsonify({"code": 0, "message": "Member registered successfully"})

    finally:
        if cursor: cursor.close()
        if conn:   conn.close()

@users_bp.route("/invite")
def home():
    return jsonify({"message": "hello from backend"})



@users_bp.route("/verify_2fa", methods=["POST"])
def verify_2fa():
    data       = request.get_json() or {}
    serial_no      = data.get("index",None)
    auth_code = data.get("auth_code", "").strip()
    if not serial_no or not auth_code:
        return jsonify({"code": 1, "message": "email and passphrase are required"}), 400

    conn, cursor = None, None
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM team WHERE serial_no = %s",
            [serial_no]
        )
        member = cursor.fetchone()

        if not member or not member["passphrase"]:
            return jsonify({"code": 1, "message": "Invalid request"})
        if verify_otp(member['passphrase'],auth_code):
            return jsonify({
                "code": 0,
                "message": "authentication successful",
                "data": member
            })
        else:
            return jsonify({"code": 1, "message": "Invalid request"})

    finally:
        if cursor: cursor.close()
        if conn:   conn.close()



def verify_otp(passphrase,auth_code):
    # Create a TOTP object
    totp = pyotp.TOTP(passphrase)
    # Generate a 6-digit code
    code = totp.now()
    # Verify a user-entered code
    if str(code)==auth_code:
        return True
    else:
        return False



@users_bp.route("/get_member", methods=["POST"])
def get_member():
    data      = request.get_json() or {}
    serial_no = data.get("serial_no")

    if not serial_no:
        return jsonify({"code": 1, "message": "serial_no is required"}), 400

    conn, cursor = None, None
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM team WHERE serial_no = %s",
            [serial_no]
        )
        member = cursor.fetchone()

        if not member:
            return jsonify({"code": 1, "message": "Member not found"})

        return jsonify({"code": 0, "data": member})

    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


@users_bp.route("/get_members", methods=["GET"])
def get_members():
    conn, cursor = None, None
    try:
        conn   = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM team ORDER BY name ASC"
        )
        members = cursor.fetchall()

        return jsonify({"code": 0, "data": members, "total": len(members)})

    finally:
        if cursor: cursor.close()
        if conn:   conn.close()