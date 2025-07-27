from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import uuid
from utils.auth_utils import token_required

# Load .env variables
load_dotenv()

my_tickets = Blueprint('my_tickets', __name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
ticket_collection = db["tickets"]
active_filters_collection = db["active_filters"]


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def add_to_active_filters(movie, city):
    active_filters_collection.update_one(
        {},
        {
            '$addToSet': {
                'movies': movie,
                'cities': city
            }
        },
        upsert=True
    )

def remove_from_active_filters(movie, city):
    remaining = ticket_collection.count_documents({
        'event_name': movie,
        'city': city,
        'is_sold': False,
        'deleted': False
    })
    if remaining == 0:
        active_filters_collection.update_one(
            {},
            {
                '$pull': {
                    'movies': movie,
                    'cities': city
                }
            }
        )


# Upload ticket file
@my_tickets.route('/upload', methods=['POST'])
@token_required
def upload_ticket_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        return jsonify({'file_url': f"/uploads/{filename}"}), 200
    return jsonify({'error': 'Invalid file type'}), 400


# Post a ticket
@my_tickets.route('/tickets', methods=['POST'])
@token_required
def post_ticket():
    data = request.get_json()
    required = [
        'event_name', 'venue', 'datetime', 'original_price',
        'selling_price', 'contact_info', 'ticket_url',
        'seat_numbers', 'count', 'city'
    ]
    if not all(field in data for field in required):
        return jsonify({'error': 'Missing required fields'}), 400

    if not isinstance(data['seat_numbers'], list) or len(data['seat_numbers']) != int(data['count']):
        return jsonify({'error': 'Seat numbers must match the ticket count'}), 400

    ticket = {
        '_id': str(uuid.uuid4()),
        'user_id': request.user_id,
        'sold_by': request.user_id,
        'bought_by': None,
        'is_sold': False,
        'city':data['city'],
        'event_name': data['event_name'],
        'venue': data['venue'],
        'datetime': data['datetime'],
        'original_price': data['original_price'],
        'selling_price': data['selling_price'],
        'contact_info': data['contact_info'],
        'ticket_url': data['ticket_url'],
        'seat_numbers': data['seat_numbers'],
        'count': data['count'],
        'created_at': datetime.utcnow().isoformat(),
        'deleted': False  # Soft delete flag
    }

    ticket_collection.insert_one(ticket)
    add_to_active_filters(data['event_name'], data['city'])
    return jsonify({'message': 'Ticket posted', 'ticket_id': ticket['_id']}), 201

# GET: Retrieve current user's tickets
@my_tickets.route('/my-tickets', methods=['GET'])
@token_required
def get_my_tickets():
    user_id = request.user_id
    tickets = ticket_collection.find({'user_id': user_id, 'deleted': False})
    result = []
    for t in tickets:
        t['ticket_id'] = t.pop('_id')
        result.append(t)
    return jsonify(result), 200


# PATCH: Update ticket price
@my_tickets.route('/my-tickets/<ticket_id>/price', methods=['PATCH'])
@token_required
def update_ticket_price(ticket_id):
    user_id = request.user_id
    data = request.get_json()
    new_price = data.get('new_price')

    if new_price is None or new_price <= 0:
        return jsonify({'error': 'Valid new price is required'}), 400

    result = ticket_collection.update_one(
        {
            '_id': ticket_id,
            'user_id': user_id,
            'deleted': False,
            'is_sold': False
        },
        {'$set': {'selling_price': new_price}}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'Ticket not found, already sold, or not authorized'}), 404

    return jsonify({'message': 'Ticket price updated successfully'}), 200


# GET: Retrieve tickets the current user bought
@my_tickets.route('/bought-tickets', methods=['GET'])
@token_required
def get_bought_tickets():
    user_id = request.user_id
    tickets = ticket_collection.find({'bought_by': user_id, 'deleted': False})

    result = []
    for t in tickets:
        t['ticket_id'] = t.pop('_id')
        result.append(t)

    return jsonify(result), 200




# DELETE: Soft delete a ticket (only if not sold)
@my_tickets.route('/my-tickets/<ticket_id>', methods=['DELETE'])
@token_required
def delete_my_ticket(ticket_id):
    user_id = request.user_id
    ticket = ticket_collection.find_one({'_id': ticket_id, 'user_id': user_id})

    if not ticket:
        return jsonify({'error': 'Ticket not found or not authorized'}), 404
    if ticket.get('is_sold'):
        return jsonify({'error': 'Cannot delete a sold ticket'}), 400

    ticket_collection.update_one(
        {'_id': ticket_id},
        {'$set': {'deleted': True}}
    )
    remove_from_active_filters(ticket['event_name'], ticket['city'])
    return jsonify({'message': 'Ticket soft-deleted successfully'}), 200

