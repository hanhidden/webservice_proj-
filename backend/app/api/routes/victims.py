#\api\routes\victims.py
from fastapi import APIRouter, HTTPException,Depends
from datetime import datetime
from bson import ObjectId

from app.schemas.victim_schemas import CreateVictimSchema, VictimOutSchema
from app.core.database import db
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi.responses import JSONResponse



router = APIRouter()




@router.get("/all", response_model=list[dict])
async def list_victims(db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.victims.find({}, {"_id": 1, "type": 1})
    victims = []
    async for doc in cursor:
        victims.append({
            "id": str(doc["_id"]),
            "type": doc.get("type", "unknown")
        })
    return JSONResponse(content=victims)

@router.post("/", response_model=VictimOutSchema)
async def create_victim(victim: CreateVictimSchema):
    data = victim.dict()
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()

    result = await db.victims.insert_one(data)  # Await the insert
    data["_id"] = str(result.inserted_id)

    return VictimOutSchema(
        id=data["_id"],
        **victim.dict(),
        created_at=str(data["created_at"]),
        updated_at=str(data["updated_at"])
    )




@router.get("/{victim_id}", response_model=VictimOutSchema)
async def get_victim(victim_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    victim = await db.victims.find_one({"_id": ObjectId(victim_id)})
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    # Transform _id to id
    victim["id"] = str(victim.pop("_id"))

    # Transform datetime fields to strings
    victim["created_at"] = victim["created_at"].isoformat()
    victim["updated_at"] = victim["updated_at"].isoformat()

    # Defensive: ensure sub-documents are present
    victim["demographics"] = victim.get("demographics")
    victim["contact_info"] = victim.get("contact_info")
    victim["risk_assessment"] = victim.get("risk_assessment")
    victim["support_services"] = victim.get("support_services", [])

    return VictimOutSchema(**victim)




@router.patch("/{victim_id}")
def update_risk(victim_id: str, risk_level: str):
    updated = db.victims.update_one(
        {"_id": ObjectId(victim_id)},
        {"$set": {"risk_assessment.level": risk_level, "updated_at": datetime.utcnow()}}
    )
    if updated.modified_count == 0:
        raise HTTPException(status_code=404, detail="Victim not found")

    return {"msg": "Risk level updated"}
