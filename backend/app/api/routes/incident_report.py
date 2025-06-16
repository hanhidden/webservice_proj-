# # backend/app/api/routes/incident_report.py
# from fastapi import (
#     APIRouter, HTTPException, Depends, UploadFile, File, Form, Path, Query
# )
# from fastapi.responses import JSONResponse
# from bson import ObjectId
# from datetime import datetime
# from typing import List, Optional
# import uuid

# from app.models import incident_report_models, victim_models
# from app.schemas.incident_report_schemas import (
#     CreateIncidentReportSchema,
#     IncidentReportOutSchema
# )
# from app.core.database import get_database
# from motor.motor_asyncio import AsyncIOMotorDatabase


# router = APIRouter()


# def serialize_document(doc):
#     """Helper function to convert MongoDB document to JSON serializable format"""
#     if doc is None:
#         return None

#     if "_id" in doc:
#         doc["id"] = str(doc["_id"])
#         del doc["_id"]

#     for key, value in doc.items():
#         if isinstance(value, ObjectId):
#             doc[key] = str(value)
#         elif isinstance(value, list):
#             doc[key] = [str(item) if isinstance(item, ObjectId) else item for item in value]
#         elif isinstance(value, dict):
#             doc[key] = serialize_document(value)

#     return doc


# @router.post("/reports", response_model=IncidentReportOutSchema)
# async def submit_incident_report(
#     report: CreateIncidentReportSchema,
#     db: AsyncIOMotorDatabase = Depends(get_database)
# ):
#     data = report.dict()
#     data["created_at"] = datetime.utcnow()
#     data["updated_at"] = datetime.utcnow()
#     data["status"] = "new"
#     data["report_id"] = data.get("report_id", f"IR-{uuid.uuid4().hex[:8]}")

#     # Victim logic
#     if report.reporter_type == "victim" or (
#         report.reporter_type == "witness" and report.victim_details
#     ):
#         v = report.victim_details
#         existing = await db.victims.find_one({
#             "demographics.first_name": v.demographics.first_name,
#             "demographics.last_name": v.demographics.last_name,
#             "demographics.birthdate": v.demographics.birthdate
#         })
#         case_id = data["report_id"]
#         if existing:
#             await db.victims.update_one(
#                 {"_id": existing["_id"]},
#                 {"$push": {"cases_involved": case_id}}
#             )
#             data["victim_id"] = str(existing["_id"])
#         else:
#             new_v = v.dict()
#             new_v["cases_involved"] = [case_id]
#             new_v["type"] = "victim"
#             new_v["anonymous"] = report.anonymous
#             new_v["created_at"] = new_v["updated_at"] = datetime.utcnow()
#             res = await db.victims.insert_one(new_v)
#             data["victim_id"] = str(res.inserted_id)

#     try:
#         result = await db.incident_reports.insert_one(data)
#         print("✅ Incident report inserted with ID:", result.inserted_id)
#         inserted_doc = await db.incident_reports.find_one({"_id": result.inserted_id})
#         return serialize_document(inserted_doc)

#     except Exception as e:
#         print("❌ Failed to insert incident report:", str(e))
#         raise HTTPException(status_code=500, detail="Failed to create incident report")


# @router.get("/reports", response_model=List[IncidentReportOutSchema])
# async def list_reports(status: Optional[str] = None, db: AsyncIOMotorDatabase = Depends(get_database)):
#     print("Endpoint hit")
#     query = {"status": status} if status else {}
#     cursor = db.incident_reports.find(query)
#     docs = []
#     async for doc in cursor:
#         serialized_doc = serialize_document(doc)
#         docs.append(serialized_doc)
#     return docs


# @router.get("/reports/{report_id}", response_model=IncidentReportOutSchema)
# async def get_report_by_id(
#     report_id: str,
#     db: AsyncIOMotorDatabase = Depends(get_database)
# ):
#     try:
#         object_id = ObjectId(report_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid report ID format")

#     report = await db.incident_reports.find_one({"_id": object_id})
#     if not report:
#         raise HTTPException(status_code=404, detail="Report not found")

#     return serialize_document(report)


# @router.patch("/reports/{report_id}")
# async def update_report_status(
#     report_id: str = Path(...),
#     status: str = Query(...),
#     db: AsyncIOMotorDatabase = Depends(get_database)
# ):
#     valid_statuses = ["new", "pending", "turned-into-case"]
#     if status not in valid_statuses:
#         raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

#     try:
#         object_id = ObjectId(report_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid report ID format")

#     result = await db.incident_reports.update_one(
#         {"_id": object_id},
#         {"$set": {"status": status, "updated_at": datetime.utcnow()}}
#     )

#     if result.matched_count == 0:
#         raise HTTPException(status_code=404, detail="Report not found")

#     updated = await db.incident_reports.find_one({"_id": object_id})
#     if updated:
#         return serialize_document(updated)

#     raise HTTPException(status_code=500, detail="Unexpected error updating report")


# @router.get("/reports/analytics")
# async def report_analytics(db: AsyncIOMotorDatabase = Depends(get_database)):
#     pipeline = [
#         {"$unwind": "$incident_details.violation_types"},
#         {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}}
#     ]
#     result = await db.incident_reports.aggregate(pipeline).to_list(length=None)

#     serialized_result = []
#     for item in result:
#         serialized_item = {
#             "violation_type": str(item["_id"]) if item["_id"] else "Unknown",
#             "count": item["count"]
#         }
#         serialized_result.append(serialized_item)

#     return {"analytics": serialized_result}

# @router.get("/assigned")
# async def get_assigned_reports(
#     secretaria_id: str = Query(...),
#     db: AsyncIOMotorDatabase = Depends(get_database),
# ):
#     try:
#         secretaria_object_id = ObjectId(secretaria_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid secretaria ObjectId")

#     reports_cursor = db["incident_reports"].find({
#         "assigned_secretaria": secretaria_object_id,
#         "status": "assigned"
#     }, {
#         "_id": 1,
#         "report_id": 1,
#         "incident_details": 1,
#         "location": 1,
#         "evidence": 1,
#         "victim_id": 1
#     })

#     reports = []
#     async for report in reports_cursor:
#         report["_id"] = str(report["_id"])
#         if "victim_id" in report:
#             report["victim_id"] = str(report["victim_id"])
#         reports.append(report)

#     return {"assigned_reports": reports}



# @router.get("/assigned/count")
# async def count_assigned_reports(
#     secretaria_id: str = Query(...),
#     db: AsyncIOMotorDatabase = Depends(get_database),
# ):
#     try:
#         secretaria_object_id = ObjectId(secretaria_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid secretaria ObjectId")

#     count = await db["incident_reports"].count_documents({
#         "assigned_secretaria": secretaria_object_id,
#         "status": "assigned"
#     })

#     return {"assigned_reports": count or 0}
# backend/app/api/routes/incident_report.py
from fastapi import (APIRouter, HTTPException, Depends, UploadFile, File, Form, Path, Query)
from fastapi.responses import JSONResponse
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import uuid


from app.models import incident_report_models, victim_models
from app.schemas.incident_report_schemas import (
    CreateIncidentReportSchema,
    IncidentReportOutSchema
)
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase


router = APIRouter()


def serialize_document(doc):
    """Helper function to convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None

    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]

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
    try:
        print(f"Received report data: {report.dict()}")  # Debug logging
        
        data = report.dict()
        
        # Convert date string to datetime object for storage
        if isinstance(data["incident_details"]["date"], str):
            try:
                data["incident_details"]["date"] = datetime.strptime(
                    data["incident_details"]["date"], '%Y-%m-%d'
                )
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow() 
        data["status"] = "new"
        data["report_id"] = data.get("report_id", f"IR-{uuid.uuid4().hex[:8]}")

        # Handle organization reporter logic
        if report.reporter_type == "organization":
            if report.reporter_id:
                data["org_id"] = report.reporter_id  # Store as org_id for clarity
                # Keep reporter_id as well for consistency
                data["reporter_id"] = report.reporter_id
            else:
                raise HTTPException(status_code=400, detail="Organization reporter must have reporter_id")
        
        # Handle anonymous logic based on reporter type
        if report.reporter_type == "witness":
            if report.anonymous:
                # For anonymous witnesses, store "anonymous" in contact fields
                data["contact_info"] = {
                    "email": "anonymous",
                    "phone": "anonymous", 
                    "preferred_contact": "anonymous"
                }
            # If witness is not anonymous, keep their contact info as provided
        elif report.reporter_type == "victim":
            # For victims, don't store reporter contact info
            data["contact_info"] = {
                "email": None,
                "phone": None,
                "preferred_contact": None
            }
        elif report.reporter_type == "organization":
            # For organizations, keep their contact info as provided
            pass
        
        # Handle victim details if provided
        victim_id = None
        if hasattr(report, 'victim_details') and report.victim_details:
            # You can either store victim details in the same document
            # or create a separate victim record and reference it
            victim_id = str(ObjectId())  # Generate a victim ID if needed
            data["victim_id"] = victim_id

        print(f"Inserting data: {data}")  # Debug logging
        
        # Insert the report into the database
        result = await db.incident_reports.insert_one(data)
        
        # Fetch the inserted document
        inserted_report = await db.incident_reports.find_one({"_id": result.inserted_id})
        
        if not inserted_report:
            raise HTTPException(status_code=500, detail="Failed to create report")
        
        print(f"Successfully created report with ID: {result.inserted_id}")  # Debug logging
        
        # Serialize and return the document
        return serialize_document(inserted_report)
        
    except Exception as e:
        print(f"Error creating incident report: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")






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



@router.get("/reports/{report_id}", response_model=IncidentReportOutSchema)
async def get_report_by_id(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    report = await db.incident_reports.find_one({"report_id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return serialize_document(report)



# old
# @router.patch("/reports/{report_id}")
# async def update_report_status(
#     report_id: str = Path(...),
#     status: str = Query(...),
#     db: AsyncIOMotorDatabase = Depends(get_database)
# ):
#     valid_statuses = ["new", "pending", "turned-into-case"]
#     if status not in valid_statuses:
#         raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

#     # Try to update using _id
#     try:
#         object_id = ObjectId(report_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid report ID format")

#     result = await db.incident_reports.update_one(
#         {"_id": object_id},
#         {"$set": {"status": status, "updated_at": datetime.utcnow()}}
#     )

#     if result.matched_count == 0:
#         raise HTTPException(status_code=404, detail="Report not found")

#     updated = await db.incident_reports.find_one({"_id": object_id})
#     if updated:
#         return serialize_document(updated)

#     raise HTTPException(status_code=500, detail="Unexpected error updating report")


# @router.patch("/reports/{report_id}")
# async def update_report_status(
#     report_id: str = Path(...),
#     status: str = Query(...),
#     db: AsyncIOMotorDatabase = Depends(get_database)
# ):
#     valid_statuses = ["new", "pending", "turned-into-case","assigned"]
#     if status not in valid_statuses:
#         raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

#     result = await db.incident_reports.update_one(
#         {"report_id": report_id},  # Use report_id field, NOT _id
#         {"$set": {"status": status, "updated_at": datetime.utcnow()}}
#     )

#     if result.matched_count == 0:
#         raise HTTPException(status_code=404, detail="Report not found")

#     updated = await db.incident_reports.find_one({"report_id": report_id})
#     if updated:
#         return serialize_document(updated)

#     raise HTTPException(status_code=500, detail="Unexpected error updating report")



@router.patch("/reports/{report_id}")
async def update_report_status(
    report_id: str = Path(...),
    status: str = Query(...),
    secretaria_id: str = Query(None),  # optional, but required if status is 'assigned'
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    valid_statuses = ["new", "pending", "turned-into-case", "assigned"]

    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    update_fields = {
        "status": status,
        "updated_at": datetime.utcnow()
    }

    # If assigning, require secretaria_id
    if status == "assigned":
        if not secretaria_id:
            raise HTTPException(status_code=400, detail="secretaria_id is required when status is 'assigned'")
        try:
            update_fields["assigned_secretaria"] = ObjectId(secretaria_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid secretaria_id")

    result = await db.incident_reports.update_one(
        {"report_id": report_id},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    updated = await db.incident_reports.find_one({"report_id": report_id})
    if updated:
        return serialize_document(updated)

    raise HTTPException(status_code=500, detail="Unexpected error updating report")


# Add endpoint to get reports by organization
@router.get("/organization/{org_id}", response_model=List[IncidentReportOutSchema])
async def get_reports_by_organization(
    org_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all reports submitted by a specific organization"""
    cursor = db.incident_reports.find({"reporter_id": org_id})  # <-- changed here
    docs = []
    async for doc in cursor:
        serialized_doc = serialize_document(doc)
        docs.append(serialized_doc)
    return docs


# @router.get("/organization/{org_id}/count-by-status")
# async def count_reports_by_status(org_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
#     pipeline = [
#         {"$match": {"reporter_id": org_id}},  # changed here
#         {"$group": {"_id": "$status", "count": {"$sum": 1}}}
#     ]
#     result = await db.incident_reports.aggregate(pipeline).to_list(length=None)
#     return {item["_id"]: item["count"] for item in result}





@router.get("/organization/{org_id}/count-by-status")
async def count_reports_by_status(org_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    pipeline = [
    {"$match": {"reporter_id": org_id}},
    {
        "$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "report_ids": {"$push": "$report_id"}  # <-- Push your custom report_id here
        }
    }
    ]
    result = await db.incident_reports.aggregate(pipeline).to_list(length=None)

    return {
        item["_id"]: {
            "count": item["count"],
            "report_ids": item["report_ids"]  # no need to convert ObjectId, this is string
        }
        for item in result
    }






@router.get("/organization/{org_id}/violation-types")
async def count_violation_types(org_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    pipeline = [
        {"$match": {"reporter_id": org_id}},  # changed here
        {"$unwind": "$incident_details.violation_types"},
        {"$group": {"_id": "$incident_details.violation_types", "count": {"$sum": 1}}}
    ]
    result = await db.incident_reports.aggregate(pipeline).to_list(length=None)
    return [{"name": item["_id"], "count": item["count"]} for item in result]


@router.get("/organization/{org_id}/locations")
async def count_locations(org_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": "$incident_details.location", "count": {"$sum": 1}}}
    ]
    result = await db.incident_reports.aggregate(pipeline).to_list(length=None)
    return [{"name": item["_id"], "count": item["count"]} for item in result]




@router.get("/assigned")
async def get_assigned_reports(
    secretaria_id: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    try:
        secretaria_object_id = ObjectId(secretaria_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid secretaria ObjectId")

    reports_cursor = db["incident_reports"].find({
        "assigned_secretaria": secretaria_object_id,
        "status": "assigned"
    }, {
        "_id": 1,
        "report_id": 1,
        "incident_details": 1,
        "location": 1,
        "evidence": 1,
        "victim_id": 1
    })

    reports = []
    async for report in reports_cursor:
        report["_id"] = str(report["_id"])
        if "victim_id" in report:
            report["victim_id"] = str(report["victim_id"])
        reports.append(report)

    return {"assigned_reports": reports}


@router.get("/assigned/count")
async def count_assigned_reports(
    secretaria_id: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    try:
        secretaria_object_id = ObjectId(secretaria_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid secretaria ObjectId")

    count = await db["incident_reports"].count_documents({
        "assigned_secretaria": secretaria_object_id,
        "status": "assigned"
    })

    return {"assigned_reports": count or 0}
