# app/core/database.py

import motor.motor_asyncio
from dotenv import load_dotenv
import os
from pathlib import Path

# Explicitly give the path to the .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
print("MONGO_DB_NAME:", MONGO_DB_NAME)
print("MONGO_URL:", MONGO_URL)
print("Type:", type(MONGO_DB_NAME))


client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]