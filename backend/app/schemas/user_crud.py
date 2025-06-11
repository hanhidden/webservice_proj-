# # app/core/user_crud.py
# from app.core.database import db

# async def get_user_by_email(email: str):
#     return await db["users"].find_one({"email": email})

# async def create_user(user_data: dict):
#     result = await db["users"].insert_one(user_data)
#     return result.inserted_id

# app/core/user_crud.py
from app.core.database import db
from typing import List

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