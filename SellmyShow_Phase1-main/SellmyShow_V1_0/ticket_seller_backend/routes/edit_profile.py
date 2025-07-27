from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId
import os
from utils.auth_utils import token_required

# Load environment variables
load_dotenv()

profile = Blueprint('profile', __name__)

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
users = db["users"]

# PUT: Edit profile
@profile.route('/edit-profile', methods=['PUT'])
@token_required
def edit_profile():
    data = request.get_json()
    upi_id = data.get('upiId')
    name = data.get('name')

    if not upi_id and not name:
        return jsonify({'error': 'Nothing to update'}), 400

    update_fields = {}
    if upi_id:
        update_fields['upiId'] = upi_id
    if name:
        update_fields['name'] = name

    update_fields['updatedAt'] = datetime.utcnow()

    result = users.update_one(
        {'_id': ObjectId(request.user_id)},
        {'$set': update_fields}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'Profile updated successfully'}), 200

# GET: Get profile details
@profile.route('/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        user = users.find_one({'_id': ObjectId(request.user_id)})
    except Exception:
        return jsonify({'error': 'Invalid user ID'}), 400

    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile_data = {
        'name': user.get('name', ''),
        'email': user.get('email'),
        'upiId': user.get('upiId', '')
    }

    return jsonify(profile_data), 200
