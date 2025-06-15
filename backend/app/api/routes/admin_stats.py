from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        users = await db.users.find().to_list(None)
        total_users = len(users)
        pending_approval = len([u for u in users if not u.get("is_approved", False)])

        total_cases = await db.cases.count_documents({})
        new_cases = await db.cases.count_documents({"status": "new"})

        total_reports = await db.incident_reports.count_documents({})
        new_reports = await db.incident_reports.count_documents({"status": "new"})

        return {
            "total_users": total_users,
            "pending_approval": pending_approval,
            "total_cases": total_cases,
            "new_cases": new_cases,
            "total_reports": total_reports,
            "new_reports": new_reports
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
