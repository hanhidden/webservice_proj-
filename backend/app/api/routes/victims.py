#\api\routes\victims.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId

from app.schemas.victim_schemas import CreateVictimSchema, VictimOutSchema
from app.core.database import db

router = APIRouter()

# @router.post("/", response_model=VictimOutSchema)
# def create_victim(victim: CreateVictimSchema):
#     data = victim.dict()
#     data["created_at"] = datetime.utcnow()
#     data["updated_at"] = datetime.utcnow()

#     result = db.victims.insert_one(data)
#     data["_id"] = str(result.inserted_id)

#     return VictimOutSchema(
#         id=data["_id"],
#         **victim.dict(),
#         created_at=str(data["created_at"]),
#         updated_at=str(data["updated_at"])
#     )


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
def get_victim(victim_id: str):
    victim = db.victims.find_one({"_id": ObjectId(victim_id)})
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    victim["id"] = str(victim["_id"])
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
