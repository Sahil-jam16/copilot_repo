from flask import Blueprint, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

filter_bp = Blueprint('filter', __name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
active_filters_collection = db["active_filters"]

@filter_bp.route('/active-filters', methods=['GET'])
def get_active_filters():
    filters = active_filters_collection.find_one({}, {'_id': 0}) or {'movies': [], 'cities': []}
    return jsonify(filters), 200
