from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import os

# Load .env variables
load_dotenv()

tickets = Blueprint('tickets', __name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
ticket_collection = db["tickets"]
report_collection = db["reports"]

# 1. Get all tickets (public view, only unsold tickets)
@tickets.route('/tickets', methods=['GET'])
def get_tickets():
    query = {'is_sold': False, 'deleted': False}

    city = request.args.get('city')
    if city:
        query['city'] = {'$regex': city, '$options': 'i'}  # case-insensitive city match from venue

    count = request.args.get('count')
    if count:
        try:
            query['count'] = {'$gte': int(count)}
        except ValueError:
            return jsonify({'error': 'Invalid count'}), 400

    projection = {'ticket_url': 0, 'contact_info': 0}
    tickets = list(ticket_collection.find(query, projection))

    # Sort logic
    sort = request.args.get('sort')
    if sort:
        if sort == 'price_asc':
            tickets.sort(key=lambda x: x.get('selling_price', 0))
        elif sort == 'price_desc':
            tickets.sort(key=lambda x: x.get('selling_price', 0), reverse=True)
        elif sort == 'date_asc':
            tickets.sort(key=lambda x: x.get('datetime', ''))
        elif sort == 'date_desc':
            tickets.sort(key=lambda x: x.get('datetime', ''), reverse=True)

    return jsonify(tickets), 200
    


# 2. Report a ticket
@tickets.route('/tickets/<ticket_id>/report', methods=['POST'])
def report_ticket(ticket_id):
    if ticket_collection.find_one({'_id': ticket_id}):
        report_collection.insert_one({'ticket_id': ticket_id, 'reported_at': datetime.utcnow().isoformat()})
        return jsonify({'message': 'Ticket reported'}), 200
    return jsonify({'error': 'Ticket not found'}), 404
