# from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Query
# from fastapi.responses import JSONResponse
# from typing import Optional
# from datetime import datetime
# from bson import ObjectId
# from motor.motor_asyncio import AsyncIOMotorGridFSBucket

# from app.models.case_models import Case, Evidence
# from app.core.database import db, cases  # your db client and cases collection

# router = APIRouter(prefix="/cases", tags=["Cases"])


# @router.post("/")
# async def create_case(case: Case):
#     case_dict = case.dict(by_alias=True)
#     result = await cases.insert_one(case_dict)
#     return {"id": str(result.inserted_id)}


# @router.get("/{case_id}")
# async def get_case(case_id: str):
#     case = await cases.find_one({"case_id": case_id})
#     if not case:
#         raise HTTPException(status_code=404, detail="Case not found")
#     return case


# @router.get("/")
# async def list_cases(status: Optional[str] = None, violation_type: Optional[str] = None):
#     query = {}
#     if status:
#         query["status"] = status
#     if violation_type:
#         query["violation_types"] = violation_type
#     cases_list = await cases.find(query).to_list(100)
#     return cases_list


# @router.patch("/{case_id}")
# async def update_status(case_id: str, new_status: str = Body(...), description: Optional[str] = Body(None)):
#     case = await cases.find_one({"case_id": case_id})
#     if not case:
#         raise HTTPException(status_code=404, detail="Case not found")

#     await cases.update_one({"case_id": case_id}, {"$set": {"status": new_status, "updated_at": datetime.utcnow()}})
#     # Also update status history collection if you have it (not shown here)
#     return {"message": "Status updated"}


# @router.delete("/{case_id}")
# async def archive_case(case_id: str):
#     result = await cases.delete_one({"case_id": case_id})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Case not found")
#     return {"message": "Case archived"}


# @router.post("/{case_id}/evidence/upload")
# async def upload_evidence(
#     case_id: str,
#     file: UploadFile = File(...),
#     evidence_type: str = Query(..., description="Evidence type: image, video, file, report"),
#     description: Optional[str] = Query(None),
#     evidence_id: Optional[str] = Query(None, description="ID of evidence to update (optional)"),
# ):
#     # Check if case exists
#     case = await cases.find_one({"case_id": case_id})
#     if not case:
#         raise HTTPException(status_code=404, detail="Case not found")

#     # Read file contents
#     contents = await file.read()

#     # Upload to GridFS using shared bucket
#     file_id = await gridfs_bucket.upload_from_stream(
#         file.filename,
#         contents,
#         metadata={
#             "content_type": file.content_type,
#             "uploaded_at": datetime.utcnow(),
#             "case_id": case_id,
#             "evidence_type": evidence_type,
#         },
#     )

#     # Create evidence object
#     new_evidence = Evidence(
#         id=str(ObjectId()),
#         type=evidence_type,
#         file_id=file_id,
#         filename=file.filename,
#         content_type=file.content_type,
#         description=description,
#         date_captured=datetime.utcnow(),
#     ).dict()

#     # Update existing evidence or add new one
#     if evidence_id:
#         update_result = await cases.update_one(
#             {"case_id": case_id, "evidence.id": evidence_id},
#             {"$set": {"evidence.$": new_evidence}},
#         )
#         if update_result.modified_count == 0:
#             raise HTTPException(status_code=404, detail="Evidence not found in case")
#     else:
#         await cases.update_one(
#             {"case_id": case_id},
#             {"$push": {"evidence": new_evidence}},
#         )

#     return JSONResponse(
#         status_code=200,
#         content={
#             "message": "Evidence uploaded successfully",
#             "evidence": new_evidence,
#         },
#     )

# app/api/routes/case_router.py

from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Query, Depends
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.case_models import Case, Evidence
from app.core.database import get_database
from app.core.database import gridfs_bucket  # Assuming you have a shared GridFS bucket

router = APIRouter()



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
    result = await db.cases.insert_one(case_dict)
    return {"id": str(result.inserted_id)}


@router.get("/{case_id}")
async def get_case(case_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    case = await db.cases.find_one({"case_id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.get("/")
async def list_cases(
    status: Optional[str] = None,
    violation_type: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {}
    if status:
        query["status"] = status
    if violation_type:
        query["violation_types"] = violation_type
    cases_list = await db.cases.find(query).to_list(100)
    return cases_list


@router.patch("/{case_id}")
async def update_status(
    case_id: str,
    new_status: str = Body(...),
    description: Optional[str] = Body(None),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    case = await db.cases.find_one({"case_id": case_id})
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
    case = await db.cases.find_one({"case_id": case_id})
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

