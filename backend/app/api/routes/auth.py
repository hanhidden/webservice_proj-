# #auth.py
# from fastapi import APIRouter, HTTPException, Depends, status, FastAPI
# from fastapi.security import OAuth2PasswordBearer
# from jose import JWTError, jwt
# from app.models.user import User, Role, UserCreate
# from app.auth.jwt_handler import create_access_token
# from app.schemas.user_crud import get_user_by_email, create_user
# from pydantic import BaseModel
# from passlib.context import CryptContext

# # JWT Config (you can move this to a separate jwt_config.py if you prefer)
# SECRET_KEY = "your-secret-key"  # Use env var in production!
# ALGORITHM = "HS256"

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# app = FastAPI()
# router = APIRouter()
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # ----------- Signup -----------
# @router.post("/signup")
# async def signup(user: UserCreate):
#     existing_user = await get_user_by_email(user.email)
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
#     user_dict = user.dict()
#     user_dict['hashed_password'] = pwd_context.hash(user_dict['hashed_password'])
#     user_dict['is_approved'] = user.role == Role.user
#     await create_user(user_dict)
#     return {"message": "User created successfully"}

# # ----------- Login -----------
# class LoginRequest(BaseModel):
#     email: str
#     password: str

# @router.post("/login")
# async def login(request: LoginRequest):
#     user = await get_user_by_email(request.email)
#     if not user or not pwd_context.verify(request.password, user['hashed_password']):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     if user['role'] != Role.user and not user['is_approved']:
#         raise HTTPException(status_code=403, detail="Account not approved")
    
#     token_data = {
#         "sub": user['email'],
#         "role": user['role'],
#         "user_id": str(user['_id'])  # Add ObjectID here as string
#     }
#     token = create_access_token(token_data)

#     return {
#         "access_token": token,
#         "token_type": "bearer",
#         "role": user['role'],
#         "is_approved": user['is_approved']
#     }

# # ----------- Get Current User -----------
# async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         email: str = payload.get("sub")
#         if email is None:
#             raise credentials_exception
#     except JWTError:
#         raise credentials_exception

#     user = await get_user_by_email(email)
#     if user is None:
#         raise credentials_exception

#     return User(**user)
from fastapi import APIRouter, HTTPException
from app.models.user import UserCreate, Role
from app.schemas.user_crud import get_user_by_email, create_user
from app.auth.jwt_handler import create_access_token
from pydantic import BaseModel
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/signup")
async def signup(user: UserCreate):
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_dict = user.dict()
    user_dict['hashed_password'] = pwd_context.hash(user_dict['hashed_password'])
    if user.role == Role.user:
        user_dict['is_approved'] = True
    else:
        user_dict['is_approved'] = False
    await create_user(user_dict)
    return {"message": "User created successfully"}


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(request: LoginRequest):
    user = await get_user_by_email(request.email)

    if not user or not pwd_context.verify(request.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user['role'] != Role.user and not user['is_approved']:
        raise HTTPException(status_code=403, detail="Account not approved")

    token = create_access_token({"sub": user['email'], "role": user['role']})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user['role'],
        "is_approved": user['is_approved'],
        "user_id": str(user['_id'])  # 👈 convert ObjectId to string

    }
