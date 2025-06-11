# app/api/routes/users.py
from fastapi import APIRouter, HTTPException
from app.schemas.user_crud import get_all_users
from app.models.user import UserResponse, UsersListResponse
from typing import List

router = APIRouter()

@router.get("/all", response_model=UsersListResponse)
async def get_all_users_endpoint():
    """
    Get all users in the system
    Returns user information without sensitive data like passwords
    """
    try:
        users_data = await get_all_users()
        
        # Transform the data to match our response schema
        users_response = []
        for user in users_data:
            user_response = UserResponse(
                id=str(user["_id"]),
                name=f"{user['first_name']} {user['last_name']}",
                email=user["email"],
                role=user["role"],
                is_approved=user.get("is_approved", False)
            )
            users_response.append(user_response)
        
        return UsersListResponse(
            users=users_response,
            total=len(users_response)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")