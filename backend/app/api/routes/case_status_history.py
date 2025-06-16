from typing import List
from bson import ObjectId
from app.core.database import get_database
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import logging

router = APIRouter()

@router.get("/{case_id}")
async def get_status_history(case_id: str, db=Depends(get_database)):
    doc = await db.case_status_history.find_one({"case_id": case_id})
    if not doc or "history" not in doc:
        raise HTTPException(status_code=404, detail="No history found")

    # Normalize and format the history entries
    normalized_history = []
    for item in doc["history"]:
        # Create a normalized entry
        normalized_item = {
            "new_status": item.get("new_status") or item.get("state", "unknown"),
            "description": item.get("description", ""),
            "date_changed": None,
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at")
        }
        
        # Handle date_changed field (could be updated_at for older entries)
        date_field = item.get("date_changed") or item.get("updated_at")
        if date_field:
            if isinstance(date_field, datetime):
                normalized_item["date_changed"] = date_field.isoformat()
            elif isinstance(date_field, str):
                normalized_item["date_changed"] = date_field
        
        # Format other datetime fields
        for field in ["created_at", "updated_at"]:
            if isinstance(item.get(field), datetime):
                normalized_item[field] = item[field].isoformat()
        
        normalized_history.append(normalized_item)

    # Sort by date_changed descending (newest first)
    normalized_history.sort(key=lambda x: x.get("date_changed", ""), reverse=True)
    
    return normalized_history


@router.post("/{case_id}")
async def add_status_history(case_id: str, payload: dict, db=Depends(get_database)):
    new_status = payload.get("new_status")
    description = payload.get("description", "")
    now = datetime.utcnow()

    # Create the new history entry with consistent field names
    new_entry = {
        "new_status": new_status,  # Always use new_status for consistency
        "description": description,
        "date_changed": now,
        "created_at": now,
        "updated_at": now
    }

    # Try to find existing document and append to history
    doc = await db.case_status_history.find_one({"case_id": case_id})
    
    if doc:
        # Document exists, append to history array
        result = await db.case_status_history.update_one(
            {"case_id": case_id},
            {
                "$push": {"history": new_entry},
                "$set": {"updated_at": now}
            }
        )
    else:
        # Document doesn't exist, create new one with history array
        new_doc = {
            "case_id": case_id,
            "history": [new_entry],
            "created_at": now,
            "updated_at": now
        }
        result = await db.case_status_history.insert_one(new_doc)

    # Update the case status
    case_result = await db.cases.update_one(
        {"case_id": case_id}, 
        {"$set": {"status": new_status, "updated_at": now}}
    )
    
    if case_result.modified_count == 0:
        # Check if case exists at all
        case_exists = await db.cases.find_one({"case_id": case_id})
        if not case_exists:
            raise HTTPException(status_code=404, detail="Case not found")

    return {"message": "Status updated successfully", "new_status": new_status}


@router.delete("/{case_id}/index/{history_index}")
async def delete_status_by_index(case_id: str, history_index: int, db=Depends(get_database)):
    doc = await db.case_status_history.find_one({"case_id": case_id})
    if not doc or "history" not in doc:
        raise HTTPException(status_code=404, detail="No history found")

    history = doc["history"]

    if history_index < 0 or history_index >= len(history):
        raise HTTPException(status_code=404, detail="Invalid history index")

    # Remove the item by index
    deleted_entry = history.pop(history_index)

    # Update the document in MongoDB
    await db.case_status_history.update_one(
        {"case_id": case_id},
        {"$set": {"history": history, "updated_at": datetime.utcnow()}}
    )

    # Determine the new status from last history item, or default
    new_status = history[-1]["new_status"] if history else "new"

    await db.cases.update_one(
        {"case_id": case_id}, 
        {"$set": {"status": new_status}}
    )

    return {
        "message": f"Deleted history at index {history_index}",
        "new_status": new_status,
        "deleted_entry": deleted_entry
    }