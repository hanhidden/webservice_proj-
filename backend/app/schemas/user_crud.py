# app/core/user_crud.py
from app.core.database import db
from typing import List
from bson import ObjectId

async def get_user_by_email(email: str):
    return await db["users"].find_one({"email": email})

async def create_user(user_data: dict):
    result = await db["users"].insert_one(user_data)
    return result.inserted_id

async def get_all_users() -> List[dict]:
    """
    Get all users from the database
    Returns a list of user documents
    """
    cursor = db["users"].find({})
    users = await cursor.to_list(length=None)
    return users



async def update_user_approval(user_id: str, is_approved: bool):
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_approved": is_approved}}
    )
    return result.modified_count



