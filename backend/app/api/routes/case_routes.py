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
