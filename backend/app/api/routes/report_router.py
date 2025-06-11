from fastapi import APIRouter, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.core.database import get_database
from fastapi import Depends



router = APIRouter()

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
