
# app/models/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class Role(str, Enum):
    user = "user"
    admin = "admin"
    organization = "organization"
    secretaria = "secretaria"

class User(BaseModel):
    id: Optional[str]
    first_name: str
    last_name: str
    email: EmailStr
    hashed_password: str
    role: Role
    is_approved: bool = False

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    hashed_password: str
    role: Role

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Response schema for getting all users (without sensitive data)
class UserResponse(BaseModel):
    id: str
    name: str  # Combined first_name and last_name
    email: EmailStr
    role: Role
    is_approved: bool

class UsersListResponse(BaseModel):
    users: list[UserResponse]
    total: int

