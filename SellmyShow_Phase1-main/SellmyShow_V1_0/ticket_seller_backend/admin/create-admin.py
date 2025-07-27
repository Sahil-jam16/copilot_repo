from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
users = db["users"]

admin_email = "admin@tickets.com"
admin_password = "admin123"  # change this to something secure
hashed_password = generate_password_hash(admin_password)

admin_user = {
    "email": admin_email,
    "password": hashed_password,
    "role": "admin",
    "created_at": datetime.utcnow().isoformat()
}

# Insert only if not exists
if not users.find_one({"email": admin_email}):
    users.insert_one(admin_user)
    print("Admin user created successfully.")
else:
    print("Admin user already exists.")
