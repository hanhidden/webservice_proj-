# # from fastapi import APIRouter
# # from app.models.case_models import Case

# # router = APIRouter()

# # @router.get("/")
# # async def get_cases():
# #     return {"message": "List of cases"}

# from fastapi import APIRouter, HTTPException
# from app.models.case_models import Case
# from pymongo import MongoClient
# import os
# import motor.motor_asyncio

# router = APIRouter()

# MONGO_URL = "mongodb+srv://1210711:QUH4hhKzXB0jbfQc@humanrightsmonitor.u8iggao.mongodb.net/?retryWrites=true&w=majority&appName=HumanRightsMonitor"
# # client = MongoClient(MONGO_URL)

# # db = client["humanRights"]
# client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
# db = client.humanRights

# cases_collection = db["cases"]

# @router.post("/cases/")
# async def create_case(case: Case):
#     result = cases_collection.insert_one(case.dict(by_alias=True))
#     return {"inserted_id": str(result.inserted_id)}

# @router.get("/cases/")
# async def list_cases():
#     cases = list(cases_collection.find())
#     return [Case(**case) for case in cases]

# @router.get("/test-connection/")
# async def test_connection():
#     try:
#         client.admin.command('ping')
#         return {"status": "Connected to MongoDB!"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


from fastapi import APIRouter, HTTPException
from app.models.case_models import Case
from app.core.database import get_cases_collection

router = APIRouter()
cases_collection = get_cases_collection()

@router.post("/cases/")
async def create_case(case: Case):
    result = await cases_collection.insert_one(case.model_dump(by_alias=True))
    return {"inserted_id": str(result.inserted_id)}

@router.get("/cases/")
async def list_cases():
    cursor = cases_collection.find()
    cases = await cursor.to_list(length=100)
    return [Case(**case) for case in cases]
