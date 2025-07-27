# ================================================================
# FLASK BACKEND SETUP FOR SELLMYSHOW
# Place this in your Flask backend main file (e.g., app.py)
# ================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)

# ===== CORS CONFIGURATION =====
# This is CRITICAL for connecting React frontend to Flask backend
CORS(app, origins=[
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
], supports_credentials=True)

# Alternative: Allow all origins (less secure, for development only)
# CORS(app, origins="*")

# ===== REQUIRED ENDPOINTS FOR YOUR FRONTEND =====

@app.route('/tickets', methods=['GET'])
def get_tickets():
    """Get all tickets - called by Home.jsx and filtering"""
    try:
        # Your existing ticket fetching logic here
        tickets = []  # Replace with your actual data
        return jsonify({
            'success': True,
            'data': tickets,
            'message': 'Tickets fetched successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/active-filters', methods=['GET'])
def get_active_filters():
    """Get filter options - called by FilterBar component"""
    try:
        filters = {
            'cities': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
            'categories': ['Sports', 'Concert', 'Theater', 'Comedy'],
            'price_ranges': ['0-500', '500-1000', '1000-2000', '2000+']
        }
        return jsonify({
            'success': True,
            'data': filters
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/request-otp', methods=['POST'])
def request_otp():
    """Send OTP - called by Login/Signup"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        # Your OTP generation logic here
        return jsonify({
            'success': True,
            'message': 'OTP sent successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/login', methods=['POST'])
def login():
    """User login - called by Login.jsx"""
    try:
        data = request.get_json()
        # Your login logic here
        return jsonify({
            'success': True,
            'token': 'your_jwt_token_here',
            'user': {
                'id': 1,
                'name': 'John Doe',
                'email': 'john@example.com'
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@app.route('/signup', methods=['POST'])
def signup():
    """User registration - called by Signup.jsx"""
    try:
        data = request.get_json()
        # Your signup logic here
        return jsonify({
            'success': True,
            'message': 'User registered successfully'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@app.route('/my-tickets', methods=['GET'])
def get_my_tickets():
    """Get user's selling tickets - called by MyTickets.jsx"""
    try:
        # Get user from JWT token
        tickets = []  # Your logic here
        return jsonify({
            'success': True,
            'data': tickets
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/bought-tickets', methods=['GET'])
def get_bought_tickets():
    """Get user's purchased tickets - called by MyTickets.jsx"""
    try:
        tickets = []  # Your logic here
        return jsonify({
            'success': True,
            'data': tickets
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile - called by EditProfile.jsx"""
    try:
        user = {}  # Your logic here
        return jsonify({
            'success': True,
            'data': user
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/edit-profile', methods=['PUT'])
def edit_profile():
    """Update user profile - called by EditProfile.jsx"""
    try:
        data = request.get_json()
        # Your update logic here
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/ticket/<int:ticket_id>', methods=['GET'])
def get_ticket_details(ticket_id):
    """Get single ticket details - called by BuyTicket.jsx"""
    try:
        ticket = {}  # Your logic here
        return jsonify({
            'success': True,
            'data': ticket
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/upload2', methods=['POST'])
def upload_ticket():
    """Upload ticket image - called by UploadTicket.jsx"""
    try:
        # Handle file upload
        return jsonify({
            'success': True,
            'message': 'Ticket uploaded successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/create-order/<int:ticket_id>', methods=['POST'])
def create_order(ticket_id):
    """Create Razorpay order - called by BuyTicket.jsx"""
    try:
        # Your Razorpay order creation logic
        return jsonify({
            'success': True,
            'order_id': 'razorpay_order_id',
            'amount': 1000
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    """Verify Razorpay payment - called by BuyTicket.jsx"""
    try:
        data = request.get_json()
        # Your payment verification logic
        return jsonify({
            'success': True,
            'message': 'Payment verified successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

# ===== HEALTH CHECK ENDPOINT =====
@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check"""
    return jsonify({
        'success': True,
        'message': 'Flask backend is running!',
        'status': 'healthy'
    }), 200

if __name__ == '__main__':
    # Make sure your Flask app runs on port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)

# ================================================================
# INSTALLATION REQUIREMENTS
# ================================================================
# pip install flask flask-cors
#
# Then run: python app.py
# Your backend should be accessible at http://localhost:5000
# ================================================================
