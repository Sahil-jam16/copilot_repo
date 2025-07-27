# ================================================================
# ENHANCED FLASK BACKEND - SEAT SELECTION & LAYOUT IMAGES
# Updated endpoints for BuyTicket v2.0 functionality
# ================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5175"])

# ===== ENHANCED TICKET ENDPOINT =====
@app.route('/ticket/<int:ticket_id>', methods=['GET'])
def get_ticket_details(ticket_id):
    """
    Enhanced ticket details with seat numbers and layout images
    """
    try:
        # Your existing ticket fetching logic
        ticket = {
            'id': ticket_id,
            'event_name': 'Sample Concert',
            'venue': 'Madison Square Garden',
            'datetime': '2024-08-15T19:30:00Z',
            'selling_price': 1500,
            'original_price': 2000,
            'count': 45,
            'poster_url': 'https://example.com/poster.jpg',
            
            # NEW: Available seat numbers array
            'seat_numbers': [
                'A1', 'A2', 'A3', 'A4', 'A5',
                'B1', 'B2', 'B3', 'B4', 'B5',
                'C1', 'C2', 'C3', 'C4', 'C5',
                'D1', 'D2', 'D3', 'D4', 'D5',
                'E1', 'E2', 'E3', 'E4', 'E5',
                'F1', 'F2', 'F3', 'F4', 'F5',
                'G1', 'G2', 'G3', 'G4', 'G5',
                'H1', 'H2', 'H3', 'H4', 'H5',
                'I1', 'I2', 'I3', 'I4', 'I5'
            ],
            
            # NEW: Seat layout images from MongoDB
            'seat_layout_images': [
                'https://example.com/mongodb/layout_section1.jpg',
                'https://example.com/mongodb/layout_section2.jpg',
                'https://example.com/mongodb/layout_section3.jpg'
            ]
        }
        
        return jsonify({
            'success': True,
            'data': ticket  # Return as 'data' or directly, based on your frontend expectation
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ===== ENHANCED ORDER CREATION =====
@app.route('/create-order/<int:ticket_id>', methods=['POST'])
def create_order(ticket_id):
    """
    Create Razorpay order with seat selection data
    """
    try:
        data = request.get_json()
        
        # NEW: Extract seat selection data
        quantity = data.get('quantity', 1)
        selected_seats = data.get('selected_seats', [])
        total_amount = data.get('total_amount', 0)
        
        # Validate seat selection
        if not selected_seats and quantity > 0:
            return jsonify({
                'success': False,
                'message': 'Please select seats for your tickets'
            }), 400
            
        if len(selected_seats) != quantity:
            return jsonify({
                'success': False,
                'message': f'Please select exactly {quantity} seats'
            }), 400
        
        # Your Razorpay order creation logic
        # Example order creation:
        order_data = {
            'key': 'your_razorpay_key',
            'amount': total_amount * 100,  # Amount in paise
            'currency': 'INR',
            'order_id': f'order_{ticket_id}_{quantity}',
            
            # Include seat information in order
            'notes': {
                'ticket_id': ticket_id,
                'quantity': quantity,
                'selected_seats': ', '.join(selected_seats),
                'total_amount': total_amount
            }
        }
        
        return jsonify({
            'success': True,
            **order_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ===== ENHANCED PAYMENT VERIFICATION =====
@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    """
    Verify payment with seat allocation
    """
    try:
        data = request.get_json()
        
        # Extract payment data
        payment_id = data.get('payment_id')
        order_id = data.get('order_id')
        signature = data.get('signature')
        
        # NEW: Extract seat selection data
        ticket_id = data.get('ticket_id')
        quantity = data.get('quantity', 1)
        selected_seats = data.get('selected_seats', [])
        total_amount = data.get('total_amount', 0)
        
        # Your payment verification logic here
        # Example verification:
        payment_verified = True  # Your actual verification logic
        
        if payment_verified:
            # NEW: Update seat availability in database
            # Remove selected seats from available seats
            # Create booking record with seat information
            
            booking_data = {
                'ticket_id': ticket_id,
                'quantity': quantity,
                'selected_seats': selected_seats,
                'total_amount': total_amount,
                'payment_id': payment_id,
                'status': 'confirmed'
            }
            
            # Save booking to database
            # Update seat availability
            
            return jsonify({
                'success': True,
                'message': 'Payment verified and seats booked successfully',
                'booking': booking_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Payment verification failed'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ===== SAMPLE DATA GENERATION =====
def generate_seat_layout_for_venue(venue_name):
    """
    Helper function to generate seat numbers based on venue
    """
    seat_layouts = {
        'Madison Square Garden': {
            'rows': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
            'seats_per_row': 20,
            'layout_images': [
                'https://mongodb.com/msg_layout1.jpg',
                'https://mongodb.com/msg_layout2.jpg'
            ]
        },
        'Wembley Stadium': {
            'rows': ['AA', 'BB', 'CC', 'DD', 'EE'],
            'seats_per_row': 30,
            'layout_images': [
                'https://mongodb.com/wembley_layout1.jpg',
                'https://mongodb.com/wembley_layout2.jpg',
                'https://mongodb.com/wembley_layout3.jpg'
            ]
        }
    }
    
    return seat_layouts.get(venue_name, {
        'rows': ['A', 'B', 'C'],
        'seats_per_row': 10,
        'layout_images': ['https://mongodb.com/default_layout.jpg']
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# ================================================================
# DATABASE SCHEMA UPDATES NEEDED
# ================================================================
"""
1. Add seat_numbers column to tickets table:
   ALTER TABLE tickets ADD COLUMN seat_numbers JSON;

2. Add seat_layout_images column to venues/events table:
   ALTER TABLE venues ADD COLUMN seat_layout_images JSON;

3. Create bookings table for seat tracking:
   CREATE TABLE bookings (
       id INT PRIMARY KEY AUTO_INCREMENT,
       ticket_id INT,
       user_id INT,
       selected_seats JSON,
       quantity INT,
       total_amount DECIMAL(10,2),
       payment_id VARCHAR(255),
       status VARCHAR(50),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

4. MongoDB for images:
   - Store venue layout images in GridFS or as URLs
   - Reference in seat_layout_images array field
"""

# ================================================================
# FRONTEND INTEGRATION CHECKLIST
# ================================================================
"""
✅ Frontend Updated: BuyTicketNew.jsx v2.0
✅ Seat selection UI implemented
✅ Image gallery component added
✅ Enhanced purchase flow
✅ Mobile responsive design
✅ Documentation updated

🔄 Backend Updates Needed:
   1. Add seat_numbers to ticket response
   2. Add seat_layout_images to ticket response
   3. Handle quantity/seats in create-order
   4. Handle seat booking in verify-payment
   5. Update database schema
   6. Integrate MongoDB images

📋 Testing Checklist:
   - Test seat selection with different quantities
   - Test image gallery navigation
   - Test payment flow with seat data
   - Test mobile responsiveness
   - Test error handling for missing seats/images
"""
