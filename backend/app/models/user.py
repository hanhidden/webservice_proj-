##\app\models\user.py

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