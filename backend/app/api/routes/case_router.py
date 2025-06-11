
from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Query, Depends
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.case_models import Case, Evidence
from app.core.database import get_database
from app.core.database import gridfs_bucket  # Assuming you have a shared GridFS bucket
from fastapi import Depends, APIRouter
#from app.api.routes.auth import get_current_user  # path
from app.models.user import User  #  user model
from bson import json_util
router = APIRouter()



def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    elif isinstance(value, datetime):
        return value.isoformat()
    elif isinstance(value, list):
        return [serialize_value(v) for v in value]
    elif isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    else:
        return value

def serialize_case_document(case_doc):
    if not case_doc:
        return case_doc
    return serialize_value(case_doc)


# eliaa keep this when u mergre 
@router.get("/getall")
async def get_all_case_ids(db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Returns all case IDs and their MongoDB _id from the database.
    """
    cases_cursor = db.cases.find({}, {"case_id": 1, "_id": 1})  # Project both 'case_id' and '_id'
    case_ids = [
        {"_id": str(doc["_id"]), "case_id": doc["case_id"]}
        async for doc in cases_cursor
    ]
    return {"case_ids": case_ids}



@router.post("/")
async def create_case(case: Case, db: AsyncIOMotorDatabase = Depends(get_database)):
    case_dict = case.dict(by_alias=True)
    # Ensure date_reported and updated_at are datetime objects before insertion
    if 'date_reported' not in case_dict or not isinstance(case_dict['date_reported'], datetime):
        case_dict['date_reported'] = datetime.utcnow()
    case_dict['updated_at'] = datetime.utcnow() # Always set or update this on creation

    result = await db.cases.insert_one(case_dict)
    # Return the inserted ID as a string. No full document serialization needed here.
    return {"id": str(result.inserted_id)}



@router.get("/")
async def list_cases(
    status: Optional[str] = None,
    violation_type: Optional[str] = None,
    secretaria_id: Optional[str] = None,
    location: Optional[str] = None,
    date_occurred: Optional[str] = Query(None),
    date_reported: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {}

    if status:
        query["status"] = status

    if violation_type:
        query["violation_types"] = violation_type

    if secretaria_id:
        try:
            query["assigned_secretaria"] = ObjectId(secretaria_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid secretaria ObjectId")

    if location:
        query["location"] = location

    if date_occurred:
        try:
            query["date_occurred"] = datetime.strptime(date_occurred, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_occurred format")

    if date_reported:
        try:
            query["date_reported"] = datetime.strptime(date_reported, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_reported format")

    cases_cursor = db.cases.find(query)
    cases_list = await cases_cursor.to_list(length=1000)
    serialized_cases = [serialize_case_document(case) for case in cases_list]
    return JSONResponse(content=serialized_cases)
@router.get("/count-by-status")
async def count_cases_by_status(
    secretaria_id: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    print(f"Debug: Querying cases for secretaria ID = {secretaria_id}")

    try:
        secretaria_object_id = ObjectId(secretaria_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid secretaria ObjectId")

    open_cases = await db["cases"].count_documents({"status": "open", "assigned_secretaria": secretaria_object_id})
    closed_cases = await db["cases"].count_documents({"status": "closed", "assigned_secretaria": secretaria_object_id})
    waiting_for_approval = await db["cases"].count_documents({"status": "waiting_for_approval", "assigned_secretaria": secretaria_object_id})
    approved_cases = await db["cases"].count_documents({"status": "approved", "assigned_secretaria": secretaria_object_id})

    return {
        "open": open_cases or 0,
        "closed": closed_cases or 0,
        "waiting_for_approval": waiting_for_approval or 0,
        "approved": approved_cases or 0,
    }

@router.get("/{case_id}")
async def get_case(case_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    case = await db.cases.find_one({"_id": ObjectId(case_id)})

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case



@router.patch("/{case_id}")
async def update_status(
    case_id: str,
    new_status: str = Body(...),
    description: Optional[str] = Body(None),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    case = await db.cases.find_one({"_id": ObjectId(case_id)})

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    await db.cases.update_one(
        {"case_id": case_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Status updated"}


@router.delete("/{case_id}")
async def archive_case(case_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    result = await db.cases.delete_one({"case_id": case_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case archived"}


@router.post("/{case_id}/evidence/upload")
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    evidence_type: str = Query(..., description="Evidence type: image, video, file, report"),
    description: Optional[str] = Query(None),
    evidence_id: Optional[str] = Query(None, description="ID of evidence to update (optional)"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if case exists
    case = await db.cases.find_one({"_id": ObjectId(case_id)})

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Read file contents
    contents = await file.read()

    # Upload to GridFS
    file_id = await gridfs_bucket.upload_from_stream(
        file.filename,
        contents,
        metadata={
            "content_type": file.content_type,
            "uploaded_at": datetime.utcnow(),
            "case_id": case_id,
            "evidence_type": evidence_type,
        },
    )

    # Create evidence object
    new_evidence = Evidence(
        type=evidence_type,
        url=str(file_id),
        filename=file.filename,
        content_type=file.content_type,
        description=description,
        date_captured=datetime.utcnow(),
    ).dict()

    # Update existing evidence or add new one
    if evidence_id:
        update_result = await db.cases.update_one(
            {"case_id": case_id, "evidence.id": evidence_id},
            {"$set": {"evidence.$": new_evidence}},
        )
        if update_result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Evidence not found in case")
    else:
        await db.cases.update_one(
            {"case_id": case_id},
            {"$push": {"evidence": new_evidence}},
        )

    return JSONResponse(
        status_code=200,
        content={
            "message": "Evidence uploaded successfully",
            "evidence": new_evidence,
        },
    )

