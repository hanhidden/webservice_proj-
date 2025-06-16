from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase  # <-- important
from datetime import datetime
from typing import Optional
from app.core.database import get_database  # This should return AsyncIOMotorDatabase

router = APIRouter()

async def serialize_cursor(cursor):
    return [doc async for doc in cursor]  # <-- use async iterationgit push -u origin haneenfixed 


@router.get("/violations")
async def get_violations_count(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        pipeline = [
            {"$unwind": "$violation_types"},
            {"$group": {"_id": "$violation_types", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        cursor = db.cases.aggregate(pipeline)
        return await serialize_cursor(cursor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geodata")
async def get_geo_data(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        pipeline = [
            {
                "$project": {
                    "_id": 0,
                    "violation_types": "$incident_details.violation_types",
                    "location": {
                        "$concat": [
                            "$incident_details.location.city",
                            ", ",
                            "$incident_details.location.country"
                        ]
                    },
                    "date_occurred": "$incident_details.date",
                    "coordinates": "$incident_details.location.coordinates"
                }
            }
        ]
        cursor = db.incident_reports.aggregate(pipeline)
        return await serialize_cursor(cursor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/timeline")
async def get_case_timeline(
    db: AsyncIOMotorDatabase = Depends(get_database),
    start: Optional[str] = None,
    end: Optional[str] = None
):
    try:
        match = {}
        if start and end:
            match["date_occurred"] = {
                "$gte": datetime.fromisoformat(start),
                "$lte": datetime.fromisoformat(end)
            }

        pipeline = [
            {"$match": match} if match else {"$match": {}},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$date_occurred"},
                        "month": {"$month": "$date_occurred"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        cursor = db.cases.aggregate(pipeline)
        return await serialize_cursor(cursor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
