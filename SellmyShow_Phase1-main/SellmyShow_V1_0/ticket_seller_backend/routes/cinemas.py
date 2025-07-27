from flask import Blueprint, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
cinema = Blueprint('cinema', __name__)
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
cinema_collection = db["cinema_data"]

@cinema.route('/cinema-data', methods=['GET'])
def get_cinema_data():
    data = list(cinema_collection.find({}, {'_id': 0}))  # Remove _id
    return jsonify(data), 200
