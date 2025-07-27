from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from utils.auth_utils import token_required

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configurations
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max upload size

# Create uploads folder if not exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Register blueprints
from routes.request_otp import req_otp
from routes.tickets import tickets
from routes.auth import auth
from routes.my_tickets import my_tickets
from routes.admin import admin_tickets
from routes.checkout import checkout_bp
from routes.cinemas import cinema
from routes.edit_profile import profile
from routes.filter import filter_bp
from routes.upload2 import upload2

app.register_blueprint(filter_bp)
app.register_blueprint(checkout_bp)
app.register_blueprint(tickets)
app.register_blueprint(auth)
app.register_blueprint(my_tickets)
app.register_blueprint(admin_tickets, url_prefix='/admin')
app.register_blueprint(cinema)
app.register_blueprint(profile)
app.register_blueprint(upload2)
app.register_blueprint(req_otp)



# Route to serve uploaded files
@token_required
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)







#AYGCkbYQkhIQnCG6

#ticketadmin->AYGCkbYQkhIQnCG6

#mongodb+srv://harshadkrishnas:AYGCkbYQkhIQnCG6@ticket-seller-db.7q6iyoq.mongodb.net/?retryWrites=true&w=majority&appName=ticket-seller-db