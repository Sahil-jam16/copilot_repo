from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import os
import uuid
import json
import re
import google.generativeai as genai
from utils.auth_utils import token_required
from bson import ObjectId


load_dotenv()

upload2 = Blueprint('upload2', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
ticket_collection = db["tickets"]
active_filters_collection = db["active_filters"]
users_collection = db["users"]
movie_names_collection = db["movie_names"]


movie_docs = list(movie_names_collection.find({}, {'_id': 0, 'name': 1, 'poster_url': 1}))
movie_names = [doc['name'] for doc in movie_docs]


# Gemini setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_using_gemini(ocr_text):
    movie_names_str = ', '.join(f'"{name}"' for name in movie_names)

    prompt = f"""You will receive ticket text. Your job is to extract the data in this strict format:

    {{
    "event_name": string (must match exactly from the list below),
    "venue": string,
    "datetime": string in ISO format or null,
    "original_price": number or null,
    "seat_numbers": [string],
    "count": number,
    "city": string
    }}

    Only choose the event_name from this list of movies: [{movie_names_str}]

    If no matching name is found, set event_name to null. Seat numbers must be strings. Count = number of seat numbers.

    Text:
    \"\"\"{ocr_text}\"\"\"
    """

    try:
        response = model.generate_content(prompt)
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
        else:
            return {'error': 'No valid JSON found in Gemini response'}
    except Exception as e:
        return {'error': f'Gemini parsing error: {str(e)}'}

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


@upload2.route('/upload2', methods=['POST'])
@token_required
def upload_ticket2():
    print('request.form:', request.form)
    print('request.files:', request.files)

    try:
        selling_price = float(request.form.get('selling_price'))
    except (TypeError, ValueError):
        return jsonify({'error': 'Missing or invalid selling_price in request'}), 400

    try:
        user = users_collection.find_one({'_id': ObjectId(request.user_id)})
    except Exception:
        return jsonify({'error': 'Invalid user ID'}), 400

    contact_info = user['phone_number']

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    if not allowed_file(image.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{secure_filename(image.filename)}"
    temp_filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    image.save(temp_filepath)

    try:
        ocr_text = pytesseract.image_to_string(Image.open(temp_filepath))
        structured_data = extract_using_gemini(ocr_text)

        required = [
            'event_name', 'venue', 'datetime', 'original_price',
            'seat_numbers', 'count', 'city'
        ]
        if not all(field in structured_data for field in required):
            os.remove(temp_filepath)
            return jsonify({'error': 'Missing fields in extracted data', 'data': structured_data}), 400

        if not isinstance(structured_data['seat_numbers'], list) or len(structured_data['seat_numbers']) != int(structured_data['count']):
            os.remove(temp_filepath)
            return jsonify({'error': 'Seat numbers mismatch in extracted data'}), 400

        # ✅ Step 3: Fetch poster_url from movie_names collection
        poster_url = None
        if structured_data.get("event_name"):
            movie_doc = movie_names_collection.find_one({"name": structured_data["event_name"]})
            if movie_doc:
                poster_url = movie_doc.get("poster_url")

        ticket_url = f"/uploads/{unique_filename}"

        # ✅ Step 4: Add poster_url to the ticket
        ticket = {
            '_id': str(uuid.uuid4()),
            'user_id': request.user_id,
            'sold_by': request.user_id,
            'bought_by': None,
            'is_sold': False,
            'city': structured_data['city'],
            'event_name': structured_data['event_name'],
            'venue': structured_data['venue'],
            'datetime': structured_data['datetime'],
            'original_price': structured_data['original_price'],
            'selling_price': selling_price,
            'contact_info': contact_info,
            'ticket_url': ticket_url,
            'poster_url': poster_url,
            'seat_numbers': structured_data['seat_numbers'],
            'count': structured_data['count'],
            'created_at': datetime.utcnow().isoformat(),
            'deleted': False
        }

        ticket_collection.insert_one(ticket)
        add_to_active_filters(ticket['event_name'], ticket['city'])

        return jsonify({'message': 'Ticket posted', 'ticket_id': ticket['_id']}), 201

    except Exception as e:
        os.remove(temp_filepath)
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500
