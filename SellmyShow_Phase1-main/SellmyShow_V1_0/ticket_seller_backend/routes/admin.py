from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os
from utils.auth_utils import token_required, admin_required

from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

admin_tickets = Blueprint('admin_tickets', __name__)

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
ticket_collection = db["tickets"]
users = db["users"]

# Helper: Check admin role
def is_admin(user_id):
    user = users.find_one({'_id': ObjectId(user_id)})
    return user and user.get('role') == 'admin'

# View all tickets
@admin_tickets.route('/admin/tickets', methods=['GET'])
@token_required
@admin_required
def view_all_tickets():
    tickets = list(ticket_collection.find({}))

    formatted = []
    for ticket in tickets:
        ticket['ticket_id'] = ticket.pop('_id')  # rename _id to ticket_id
        formatted.append(ticket)

    return jsonify(formatted), 200


# Post a new ticket as admin
@admin_tickets.route('/admin/tickets', methods=['POST'])
@token_required
@admin_required
def admin_post_ticket():

    data = request.get_json()
    required = ['event_name', 'venue', 'datetime', 'original_price', 'selling_price', 'contact_info', 'ticket_url']
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing required fields'}), 400

    ticket = {
        '_id': str(uuid.uuid4()),
        'event_name': data['event_name'],
        'venue': data['venue'],
        'datetime': data['datetime'],
        'original_price': data['original_price'],
        'selling_price': data['selling_price'],
        'contact_info': data['contact_info'],
        'ticket_url': data['ticket_url'],
        'created_at': datetime.utcnow().isoformat(),
        'user_id': str(request.user_id)  # track who created
    }

    ticket_collection.insert_one(ticket)
    return jsonify({'message': 'Ticket posted by admin', 'ticket_id': ticket['_id']}), 201

# Delete any ticket by ID
@admin_tickets.route('/admin/tickets/<ticket_id>', methods=['DELETE'])
@token_required
def admin_delete_ticket(ticket_id):
    if not is_admin(request.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    result = ticket_collection.delete_one({'_id': ticket_id})
    if result.deleted_count == 0:
        return jsonify({'error': 'Ticket not found'}), 404
    return jsonify({'message': 'Ticket deleted by admin'}), 200
