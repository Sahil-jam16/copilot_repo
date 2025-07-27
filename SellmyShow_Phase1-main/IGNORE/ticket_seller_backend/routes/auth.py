from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import jwt as pyjwt
import os
import bcrypt

load_dotenv()
auth = Blueprint('auth', __name__)
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
users = db["users"]
otp_requests = db["otp_requests"]

JWT_SECRET = os.getenv("JWT_SECRET")

JWT_SECRET = "N8^!@3gf9sdfgdsadskfjnkjn"


# Signup route

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    upi_id = data.get('upiId')
    phone = data.get('phone_number')
    otp = data.get('otp')

    if users.find_one({'phone_number': phone}):
        return jsonify({'error': 'Phone number already registered'}), 400
    if users.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 400

    # Verify OTP
    record = otp_requests.find_one({'phone_number': phone})
    if not record or datetime.utcnow() > record['otp_expiry']:
        return jsonify({'error': 'OTP expired or not found'}), 400
    if not bcrypt.checkpw(otp.encode(), record['otp_hash']):
        return jsonify({'error': 'Invalid OTP'}), 401

    user_doc = {
        'name': name,
        'email': email,
        'phone_number': phone,
        'upiId': upi_id,
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }

    result = users.insert_one(user_doc)

    payload = {
        'user_id': str(result.inserted_id),
        'role': 'user',
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }
    token = pyjwt.encode(payload, JWT_SECRET, algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode()

    return jsonify({'message': 'Signup successful', 'token': token}), 201


#Login route
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    phone = data.get('phone_number')
    otp = data.get('otp')

    user = users.find_one({'phone_number': phone})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    record = otp_requests.find_one({'phone_number': phone})
    if not record or datetime.utcnow() > record['otp_expiry']:
        return jsonify({'error': 'OTP expired or not found'}), 400
    if not bcrypt.checkpw(otp.encode(), record['otp_hash']):
        return jsonify({'error': 'Invalid OTP'}), 401

    payload = {
        'user_id': str(user['_id']),
        'role': user.get('role', 'user'),
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }
    token = pyjwt.encode(payload, JWT_SECRET, algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode()

    return jsonify({'token': token}), 200
