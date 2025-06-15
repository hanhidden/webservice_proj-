# app/api/routes/users.py
from fastapi import APIRouter, HTTPException

from app.schemas.user_crud import get_all_users, update_user_approval,get_users_by_role
from app.models.user import UserResponse, UsersListResponse
from typing import List

router = APIRouter()

@router.get("/all", response_model=UsersListResponse)
async def get_all_users_endpoint():
   
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
    

    

# ✅ Approve user

@router.put("/approve/{user_id}")

async def approve_user(user_id: str):

    updated = await update_user_approval(user_id, True)

    if updated == 0:

        raise HTTPException(status_code=404, detail="User not found or already approved.")

    return {"message": "User approved successfully."}



# ❌ Reject user

@router.put("/reject/{user_id}")

async def reject_user(user_id: str):

    updated = await update_user_approval(user_id, False)

    if updated == 0:

        raise HTTPException(status_code=404, detail="User not found or already rejected.")

    return {"message": "User rejected successfully."}


# app/api/routes/users.py
@router.get("/role/secretaria", response_model=UsersListResponse)
async def get_secretaria_users():
    try:
        users_data = await get_users_by_role("secretaria")

        users_response = [
            UserResponse(
                id=str(user["_id"]),
                name=f"{user['first_name']} {user['last_name']}",
                email=user["email"],
                role=user["role"],
                is_approved=user.get("is_approved", False)
            )
            for user in users_data
        ]

        return UsersListResponse(users=users_response, total=len(users_response))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching secretaria users: {str(e)}")
