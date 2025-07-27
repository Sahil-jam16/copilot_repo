from flask import Blueprint, request, jsonify
import random, bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import os

load_dotenv()

req_otp = Blueprint('req_otp', __name__)
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]

otp_requests = db["otp_requests"]

@req_otp.route('/request-otp', methods=['POST'])
def request_otp():
    data = request.json
    phone = data.get('phone_number')
    source = data.get('source')  # "signup" or "login"

    if not phone or not source:
        return jsonify({'error': 'Phone number and source are required'}), 400

    existing_user = otp_requests.find_one({'phone_number': phone})

    if source == 'signup':
        otp = str(random.randint(100000, 999999))
        otp_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt())
        expiry = datetime.utcnow() + timedelta(minutes=5)

        otp_requests.update_one(
            {'phone_number': phone},
            {'$set': {'otp_hash': otp_hash, 'otp_expiry': expiry}},
            upsert=True
        )
        print(f"Send OTP {otp} to {phone}")
        return jsonify({'message': 'OTP sent'}), 200

    elif source == 'login':
        if not existing_user:
            return jsonify({'error': 'User not found. Please sign up first.'}), 404

        #test user
        if phone=="9364393901":
            otp = "123456"
            otp_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt())
            otp_requests.update_one(
            {'phone_number': phone},
            {'$set': {'otp_hash': otp_hash, 'otp_expiry': datetime.utcnow() + timedelta(minutes=10)}},
            upsert=False
        )
            print(f"Send OTP {otp} to {phone}")
            return jsonify({'message': 'OTP sent'}), 200
        # Proceed to send OTP for login
        otp = str(random.randint(100000, 999999))
        otp_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt())
        expiry = datetime.utcnow() + timedelta(minutes=5)

        otp_requests.update_one(
            {'phone_number': phone},
            {'$set': {'otp_hash': otp_hash, 'otp_expiry': expiry}},
            upsert=False
        )
        print(f"Send OTP {otp} to {phone}")
        return jsonify({'message': 'OTP sent'}), 200

    else:
        return jsonify({'error': 'Invalid source'}), 400

