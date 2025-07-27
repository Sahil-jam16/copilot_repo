import os
import uuid
import hmac
import hashlib
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import razorpay
from datetime import datetime
from utils.auth_utils import token_required

checkout_bp = Blueprint('checkout', __name__)

# Load env vars
RAZORPAY_KEY = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
MONGO_URI = os.getenv("MONGO_URI")

print("Key:", os.getenv("RAZORPAY_KEY_ID"))
print("Secret:", os.getenv("RAZORPAY_KEY_SECRET"))


# Mongo client
client = MongoClient(MONGO_URI)
db = client["ticket_db"]
ticket_collection = db["tickets"]
active_filters_collection = db["active_filters"]

# Razorpay client
razorpay_client = razorpay.Client(auth=("rzp_test_WBqA0ZuXePL0o0", "aCv97pbnWL1zUXVCySeRX6R5"))




def remove_from_active_filters(movie, city):
    remaining = ticket_collection.count_documents({
        'event_name': movie,
        'venue': city,
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



@checkout_bp.route('/ticket/<ticket_id>', methods=['GET'])
@token_required
def get_ticket(ticket_id):
    ticket = ticket_collection.find_one({'_id': ticket_id}, {'contact_info': 0, 'ticket_url': 0})
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404

    ticket['ticket_id'] = ticket.pop('_id')
    return jsonify(ticket), 200


@checkout_bp.route('/create-order/<ticket_id>', methods=['POST'])
@token_required
def create_order(ticket_id):
    ticket = ticket_collection.find_one({'_id': ticket_id})
    count = ticket['count']
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404

    amount = int(ticket['selling_price']) * 100 * count  # INR to paise
    print("Ticket:", ticket)
    print("Amount:", amount)

    try:
        order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1,
            "receipt": str(uuid.uuid4())
        })
    except Exception as e:
        print("Razorpay Error:", e)
        return jsonify({'error': str(e)}), 500
    

    return jsonify({
        'order_id': order['id'],
        'amount': amount,
        'currency': 'INR',
        'key': RAZORPAY_KEY
    }), 200


@checkout_bp.route('/verify-payment', methods=['POST'])
@token_required
def verify_payment():
    data = request.json
    order_id = data.get('razorpay_order_id')
    payment_id = data.get('razorpay_payment_id')
    signature = data.get('razorpay_signature')
    ticket_id = data.get('ticket_id')

    if not all([order_id, payment_id, signature, ticket_id]):
        return jsonify({'error': 'Missing fields'}), 400

    generated_signature = hmac.new(
        bytes("aCv97pbnWL1zUXVCySeRX6R5", 'utf-8'),
        bytes(order_id + "|" + payment_id, 'utf-8'),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != signature:
        return jsonify({"error": "Signature verification failed"}), 400

    ticket = ticket_collection.find_one({'_id': ticket_id})
    movie = ticket.get('event_name')
    city = ticket.get('city')
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    if ticket.get('is_sold'):
        return jsonify({'error': 'Ticket already sold'}), 403

    ticket_collection.update_one(
        {'_id': ticket_id},
        {
            '$set': {
                'bought_by': request.user_id,
                'sold_at': datetime.utcnow().isoformat(),
                'is_sold': True,
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id
            }
        }

    )

    remove_from_active_filters(movie, city)


    return jsonify({'message': 'Payment verified and ticket marked as sold'}), 200
