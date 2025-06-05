# app/core/user_crud.py
from app.core.database import db

async def get_user_by_email(email: str):
    return await db["users"].find_one({"email": email})

async def create_user(user_data: dict):
    result = await db["users"].insert_one(user_data)
    return result.inserted_id
