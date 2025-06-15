from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List
from bson import ObjectId
from app.core.database import get_database
import logging

router = APIRouter()
@router.get("/{case_id}")
async def get_status_history(case_id: str, db=Depends(get_database)):
    doc = await db.case_status_history.find_one({"case_id": case_id})
    if not doc or "history" not in doc:
        raise HTTPException(status_code=404, detail="No history found")

    # Format datetime and IDs inside history array
    for item in doc["history"]:
        for field in ["date_changed"]:
            if isinstance(item.get(field), datetime):
                item[field] = item[field].isoformat()

    return doc["history"]


@router.post("/{case_id}")
async def add_status_history(case_id: str, payload: dict, db=Depends(get_database)):
    new_status = payload.get("new_status")
    description = payload.get("description", "")
    now = datetime.utcnow()

    entry = {
        "case_id": case_id,
        "new_status": new_status,
        "description": description,
        "date_changed": now,
        "created_at": now,
        "updated_at": now
    }

    await db.case_status_history.insert_one(entry)
    # ✅ Update case using `case_id`, not `_id`
    result = await db.cases.update_one({"case_id": case_id}, {"$set": {"status": new_status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")

    return {"message": "Status updated"}


# @router.delete("/{case_id}/{history_id}")
# async def delete_status_history(case_id: str, history_id: str, db=Depends(get_database)):
#     doc = await db.case_status_history.find_one({"case_id": case_id})
#     if not doc:
#         logging.warning(f"No document found for case_id={case_id}")
#         raise HTTPException(status_code=404, detail="No history found")
#     if "history" not in doc:
#         logging.warning(f"Document for case_id={case_id} has no history")
#         raise HTTPException(status_code=404, detail="No history found")

#     original_length = len(doc["history"])
#     updated_history = [h for h in doc["history"] if h.get("history_id") != history_id]

#     if len(updated_history) == original_length:
#         logging.warning(f"History ID {history_id} not found in case_id={case_id}")
#         raise HTTPException(status_code=404, detail="History entry not found")

#     await db.case_status_history.update_one(
#         {"case_id": case_id},
#         {"$set": {"history": updated_history}}
#     )

#     new_status = updated_history[-1]["new_status"] if updated_history else "new"
#     await db.cases.update_one({"case_id": case_id}, {"$set": {"status": new_status}})

#     return {"message": "History entry deleted", "new_status": new_status}
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
        {"$set": {"history": history}}
    )

    # Determine the new status from last history item, or default
    new_status = history[-1]["new_status"] if history else "new"

    await db.cases.update_one({"case_id": case_id}, {"$set": {"status": new_status}})

    return {
        "message": f"Deleted history at index {history_index}",
        "new_status": new_status
    }
