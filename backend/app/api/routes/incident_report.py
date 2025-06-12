# backend/app/api/routes/incident_report.py
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import uuid
from app.models import incident_report_models, victim_models
from app.schemas.incident_report_schemas import CreateIncidentReportSchema, IncidentReportOutSchema

from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Path, Query

router = APIRouter()

def serialize_document(doc):
    """Helper function to convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    
    # Convert ObjectId to string
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    
    # Handle any nested ObjectIds
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list):
            doc[key] = [str(item) if isinstance(item, ObjectId) else item for item in value]
        elif isinstance(value, dict):
            doc[key] = serialize_document(value)
    
    return doc

@router.post("/reports", response_model=IncidentReportOutSchema)
async def submit_incident_report(
    report: CreateIncidentReportSchema,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    data = report.dict()
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow() 
    data["status"] = "new"
    data["report_id"] = data.get("report_id", f"IR-{uuid.uuid4().hex[:8]}")

    # Victim logic
    if report.reporter_type == "victim" or (report.reporter_type == "witness" and report.victim_details):
        v = report.victim_details
        existing = await db.victims.find_one({
            "demographics.first_name": v.demographics.first_name,
            "demographics.last_name": v.demographics.last_name,
            "demographics.birthdate": v.demographics.birthdate
        })
        case_id = data["report_id"]
        if existing:
            await db.victims.update_one(
                {"_id": existing["_id"]},
                {"$push": {"cases_involved": case_id}}
            )
            data["victim_id"] = str(existing["_id"])
        else:
            new_v = v.dict()
            new_v["cases_involved"] = [case_id]
            new_v["type"] = "victim"
            new_v["anonymous"] = report.anonymous
            new_v["created_at"] = new_v["updated_at"] = datetime.utcnow()
            res = await db.victims.insert_one(new_v)
            data["victim_id"] = str(res.inserted_id)

    try:
        result = await db.incident_reports.insert_one(data)
        print("✅ Incident report inserted with ID:", result.inserted_id)
        
        # Fetch the inserted document and serialize it
        inserted_doc = await db.incident_reports.find_one({"_id": result.inserted_id})
        return serialize_document(inserted_doc)
        
    except Exception as e:
        print("❌ Failed to insert incident report:", str(e))
        raise HTTPException(status_code=500, detail="Failed to create incident report")

@router.get("/reports", response_model=List[IncidentReportOutSchema])
async def list_reports(status: Optional[str] = None, db: AsyncIOMotorDatabase = Depends(get_database)):
    print("Endpoint hit")
    query = {"status": status} if status else {}
    cursor = db.incident_reports.find(query)
    docs = []
    async for doc in cursor:
        serialized_doc = serialize_document(doc)
        docs.append(serialized_doc)
    return docs

@router.get("/reports/{report_id}", response_model=IncidentReportOutSchema)
async def get_report_by_id(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        object_id = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID format")

    report = await db.incident_reports.find_one({"_id": object_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return serialize_document(report)

@router.patch("/reports/{report_id}")
async def update_report_status(
    report_id: str = Path(...),
    status: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    valid_statuses = ["new", "pending", "turned-into-case"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    # Try to update using _id
    try:
        object_id = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID format")

    result = await db.incident_reports.update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    updated = await db.incident_reports.find_one({"_id": object_id})
    if updated:
        return serialize_document(updated)

    raise HTTPException(status_code=500, detail="Unexpected error updating report")

@router.get("/reports/analytics")
async def report_analytics(db: AsyncIOMotorDatabase = Depends(get_database)):
    pipeline = [
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}}
    ]
    result = await db.incident_reports.aggregate(pipeline).to_list(length=None)
    
    # Serialize the analytics result
    serialized_result = []
    for item in result:
        serialized_item = {
            "violation_type": str(item["_id"]) if item["_id"] else "Unknown",
            "count": item["count"]
        }
        serialized_result.append(serialized_item)
    
    return {"analytics": serialized_result}