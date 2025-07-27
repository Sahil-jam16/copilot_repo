from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from pymongo import MongoClient
import os
import time
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["ticket_db"]
collection = db["movie_names"]

# Setup Chrome
options = webdriver.ChromeOptions()
# options.add_argument("--headless")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.get("https://in.bookmyshow.com/explore/movies-coimbatore")

time.sleep(5)

# Extract image info
movies = []
images = driver.find_elements(By.XPATH, "//img[@alt]")

for img in images:
    alt = img.get_attribute("alt")
    src = img.get_attribute("src")
    if alt and src and "portrait" in src:
        print(f"Movie: {alt}")
        print(f"Poster: {src}")
        print("-" * 50)
        movies.append({"name": alt, "poster_url": src})
driver.quit()

# Insert into MongoDB if not already present
for movie in movies:
    # if not collection.find_one({"name": movie["name"]}):
        collection.insert_one(movie)
