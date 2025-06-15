#case router 
from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Query, Depends
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
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

# ADD OPTIONS HANDLER FOR PREFLIGHT REQUESTS
# @router.options("/")
# async def options_create_case():
#     return JSONResponse(content={}, status_code=200)

# Add OPTIONS handler for the specific case ID endpoint
@router.options("/{case_id}")
async def options_update_case(case_id: str):
    return JSONResponse(
        content={},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

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
async def create_case(case_data: dict, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Create a new case - using dict instead of Pydantic model to handle frontend payload better
    """
    try:
        print("Received case data:", case_data)  # DEBUG
        
        # Extract and validate required fields
        case_id = case_data.get("case_id")
        if not case_id:
            raise HTTPException(status_code=400, detail="case_id is required")
        
        # Prepare the document for MongoDB
        case_doc = {
            "case_id": case_id,
            "title": case_data.get("title", ""),
            "description": case_data.get("description", ""),
            "status": case_data.get("status", "new"),
            "priority": case_data.get("priority", ""),
            "violation_types": case_data.get("violation_types", []),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "deleted": False
        }
        
        # Handle dates
        date_occurred = case_data.get("date_occurred")
        if date_occurred:
            try:
                if isinstance(date_occurred, str):
                    case_doc["date_occurred"] = datetime.fromisoformat(date_occurred.replace('Z', '+00:00'))
                else:
                    case_doc["date_occurred"] = date_occurred
            except:
                case_doc["date_occurred"] = datetime.utcnow()
        
        date_reported = case_data.get("date_reported")
        if date_reported:
            try:
                if isinstance(date_reported, str):
                    case_doc["date_reported"] = datetime.fromisoformat(date_reported.replace('Z', '+00:00'))
                else:
                    case_doc["date_reported"] = date_reported
            except:
                case_doc["date_reported"] = datetime.utcnow()
        else:
            case_doc["date_reported"] = datetime.utcnow()
            
        #handle user
        assigned_secretaria = case_data.get("assigned_secretaria")
        if not assigned_secretaria:
            raise HTTPException(status_code=400, detail="assigned_secretaria is required")
        try:
            case_doc["assigned_secretaria"] = ObjectId(assigned_secretaria)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid assigned_secretaria ObjectId")

        # Handle perpetrator
        perpetrator = case_data.get("perpetrator", {})
        if perpetrator and (perpetrator.get("name") or perpetrator.get("type")):
            case_doc["perpetrators"] = [perpetrator]
        else:
            case_doc["perpetrators"] = []
        
        # Handle selected reports and inherit their evidence
        selected_reports = case_data.get("selectedReports", [])
        case_doc["list_of_reports_IDs"] = selected_reports
        
        # FETCH EVIDENCE FROM SELECTED REPORTS
        case_doc["evidence"] = []
        if selected_reports:
            print(f"Fetching evidence from {len(selected_reports)} selected reports")
            
            # Convert report IDs to ObjectIds for querying
            report_object_ids = []
            for report_id in selected_reports:
                try:
                    report_object_ids.append(ObjectId(report_id))
                except:
                    print(f"Warning: Invalid report ID format: {report_id}")
                    continue
            
            if report_object_ids:
                # Fetch reports and extract their evidence
                reports_cursor = db.incident_reports.find(
                    {"_id": {"$in": report_object_ids}},
                    {"evidence": 1, "report_id": 1}  # Only fetch evidence and report_id fields
                )
                
                async for report in reports_cursor:
                    report_evidence = report.get("evidence", [])
                    if report_evidence:
                        print(f"Found {len(report_evidence)} evidence items in report {report.get('report_id')}")
                        # Add source report info to each evidence item
                        for evidence_item in report_evidence:
                            evidence_with_source = evidence_item.copy()
                            evidence_with_source["source_report_id"] = str(report["_id"])
                            evidence_with_source["source_report_ref"] = report.get("report_id")
                            case_doc["evidence"].append(evidence_with_source)
                
                print(f"Total evidence items inherited: {len(case_doc['evidence'])}")
        
        # Handle victims and witnesses
        case_doc["victims"] = []
        case_doc["witnesses"] = []
        
        # Handle additional victims/witnesses
        additional_victims = case_data.get("additionalVictims", [])
        additional_witnesses = case_data.get("additionalWitnesses", [])
        
        for victim_id in additional_victims:
            try:
                case_doc["victims"].append(ObjectId(victim_id))
            except:
                pass
                
        for witness_id in additional_witnesses:
            try:
                case_doc["witnesses"].append(ObjectId(witness_id))
            except:
                pass
        
        print("Final case document:", case_doc)  # DEBUG
        
        # Insert into database
        result = await db.cases.insert_one(case_doc)
        
        return JSONResponse(
            content={"id": str(result.inserted_id), "message": "Case created successfully"},
            status_code=201
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating case: {e}")
        print(f"Case data received: {case_data}")
        raise HTTPException(status_code=500, detail=f"Failed to create case: {str(e)}")
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
    new_cases = await db["cases"].count_documents({"status": "new", "assigned_secretaria": secretaria_object_id})
    closed_cases = await db["cases"].count_documents({"status": "closed", "assigned_secretaria": secretaria_object_id})
    waiting_for_approval = await db["cases"].count_documents({"status": "waiting_for_approval", "assigned_secretaria": secretaria_object_id})
    approved_cases = await db["cases"].count_documents({"status": "approved", "assigned_secretaria": secretaria_object_id})

    return {
        "new": new_cases or 0,
        "open": open_cases or 0,
        "closed": closed_cases or 0,
        "waiting_for_approval": waiting_for_approval or 0,
        "approved": approved_cases or 0,
    }


# GET single case
@router.get("/{case_id}")
async def get_case(case_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get a single case by ID with proper ObjectId serialization"""
    try:
        case = await db.cases.find_one({"_id": ObjectId(case_id)})
        
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        serialized_case = serialize_case_document(case)
        return JSONResponse(content=serialized_case)
        
    except HTTPException:
        raise
    except Exception as e:
        if "invalid ObjectId" in str(e).lower():
            raise HTTPException(status_code=400, detail="Invalid case ID format")
        print(f"Error fetching case: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch case")
# Fix your update_status function:
# @router.patch("/{case_id}")
# async def update_status(
#     case_id: str,
#     new_status: str = Body(...),
#     description: Optional[str] = Body(None),
#     db: AsyncIOMotorDatabase = Depends(get_database)
# ):
#     case = await db.cases.find_one({"_id": ObjectId(case_id)})
#     if not case:
#         raise HTTPException(status_code=404, detail="Case not found")
    
#     # Use the same ID format for both find and update
#     await db.cases.update_one(
#     {"_id": ObjectId(case_id)},  # Changed from case_id to _id
#         {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
#     )
#     return {"message": "Status updated"}

#new
@router.patch("/{case_id}")
async def update_case(
    case_id: str,
    case_update: Dict[Any, Any] = Body(...),  # Accept any dict structure
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update case details - handles both status updates and general case updates
    """
    try:
        # Validate case exists
        case = await db.cases.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Prepare update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        # Handle different update types
        for key, value in case_update.items():
            if key in ["title", "description", "priority", "status"]:
                update_doc[key] = value
            elif key == "violation_types" and isinstance(value, list):
                update_doc[key] = value
            elif key == "perpetrators" and isinstance(value, list):
                update_doc[key] = value
            elif key in ["date_occurred", "date_reported"]:
                if isinstance(value, str):
                    try:
                        update_doc[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        update_doc[key] = datetime.fromisoformat(value)
                else:
                    update_doc[key] = value
        
        # Perform the update
        result = await db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {"$set": update_doc}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made to case")
        
        return JSONResponse(
            content={"message": "Case updated successfully", "modified_count": result.modified_count},
            status_code=200
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating case: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update case: {str(e)}")

#new
@router.patch("/{case_id}/status")
async def update_case_status(
    case_id: str,
    status_data: Dict[str, Any] = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Specifically for status updates with description
    """
    try:
        case = await db.cases.find_one({"_id": ObjectId(case_id)})
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        new_status = status_data.get("new_status") or status_data.get("status")
        description = status_data.get("description", "")
        
        if not new_status:
            raise HTTPException(status_code=400, detail="new_status is required")
        
        # Update case status
        await db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )
        
        # Add to status history if description provided
        if description:
            history_entry = {
                "case_id": case_id,
                "new_status": new_status,
                "description": description,
                "date_changed": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.case_status_history.insert_one(history_entry)
        
        return {"message": "Status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating case status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update case status: {str(e)}")
    
@router.delete("/{case_id}")
async def archive_case(case_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    result = await db.cases.delete_one({"case_id": case_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case archived"}

