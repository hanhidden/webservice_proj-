#\api\routes\victims.py
from fastapi import APIRouter, HTTPException,Depends,Body
from datetime import datetime
from bson import ObjectId
from app.schemas.victim_schemas import CreateVictimSchema, VictimOutSchema, VictimPatchSchema
from app.core.database import db
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi.responses import JSONResponse
from app.utils.id_generator import get_next_custom_id
from collections import Counter
from dateutil.relativedelta import relativedelta

from typing import List, Dict


router = APIRouter()

@router.get("/all", response_model=List[Dict])
async def list_victims(db: AsyncIOMotorDatabase = Depends(get_database)):

    cursor = db.victims.find({}, {
    "_id": 1,
    "victimId": 1,
    "type": 1,
    "demographics.name": 1,
    "contact_info.name": 1,
    "anonymous": 1
})

   

    victims = []
    async for doc in cursor:
        # Try to get name from demographics first, then contact_info
        name = None
        if not doc.get("anonymous", False):
            if doc.get("demographics") and doc["demographics"].get("name"):
                name = doc["demographics"]["name"]
            elif doc.get("contact_info") and doc["contact_info"].get("name"):
                name = doc["contact_info"]["name"]
        
        victims.append({
            "id": str(doc["_id"]),
            "type": doc.get("type", "unknown"),

            "name": name,
            #"victimId": doc.get("victimId"),  # fixed here

            "anonymous": doc.get("anonymous", False),

            "victimId": doc.get("victimId", None)

        })
    return JSONResponse(content=victims)

@router.post("/", response_model=VictimOutSchema)
async def create_victim(victim: CreateVictimSchema, db: AsyncIOMotorDatabase = Depends(get_database)):
    data = victim.dict()
    now = datetime.utcnow()
    data["created_at"] = now
    data["updated_at"] = now
    custom_victim_id = await get_next_custom_id(db, victim.type)
    data["victimId"] =   custom_victim_id

   


    # Insert victim
    result = await db.victims.insert_one(data)
    victim_id = result.inserted_id  # keep as ObjectId

    # Insert into victim_risk_assessment
    risk_data = {
        "victim_id": str(victim_id),  # store victim id as string here if needed
        "risk_assessment": data["risk_assessment"],
        "support_services": data.get("support_services", []),
        "role": data["type"],  # victim or witness
        "created_at": now,
        "updated_at": now
    }
    await db.victim_risk_assessment.insert_one(risk_data)

    # Append victim_id to each corresponding case in the cases collection
    cases_involved = data.get("cases_involved", [])
    for case_id in cases_involved:
        await db.cases.update_one(
            {"case_id": case_id},
            {"$addToSet": {"victims": victim_id}}  # push ObjectId directly
        )

    # return VictimOutSchema(
    #     id=str(victim_id),
    #     **victim.dict(),
    #     created_at=str(now),
    #     updated_at=str(now)
    # )
    return VictimOutSchema(
    id=str(victim_id),
    victimId=custom_victim_id,
    **victim.dict(),
    created_at=str(now),
    updated_at=str(now)
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
async def update_victim(
    victim_id: str,
    patch_data: VictimPatchSchema = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    victim_object_id = ObjectId(victim_id)

    victim = await db.victims.find_one({"_id": victim_object_id})
    if not victim:
        raise HTTPException(status_code=404, detail="Victim not found")

    update_fields = {}
    now = datetime.utcnow()

    # Patch risk_assessment
    if patch_data.risk_assessment:
        if patch_data.risk_assessment.level is not None:
            update_fields["risk_assessment.level"] = patch_data.risk_assessment.level
        if patch_data.risk_assessment.threats is not None:
            update_fields["risk_assessment.threats"] = patch_data.risk_assessment.threats
        if patch_data.risk_assessment.protection_needed is not None:
            update_fields["risk_assessment.protection_needed"] = patch_data.risk_assessment.protection_needed

    # Patch support_services (replace whole list if provided)
    if patch_data.support_services is not None:
        update_fields["support_services"] = [
            service.model_dump(exclude_unset=True)
            for service in patch_data.support_services
        ]

    update_fields["updated_at"] = now

    if update_fields:
        result = await db.victims.update_one(
            {"_id": victim_object_id},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="No changes applied.")

        # Re-fetch the updated victim to create an accurate snapshot
        updated_victim = await db.victims.find_one({"_id": victim_object_id})

        # Prepare risk snapshot
        risk_snapshot = {
            "victim_id": victim_id,
            "risk_assessment": updated_victim.get("risk_assessment", {}).copy(),
            "support_services": updated_victim.get("support_services", []).copy(),
            "role": updated_victim.get("type", "unknown"),
            "created_at": now,
            "updated_at": now
        }

        # Insert snapshot into victim_risk_assessment collection
        await db.victim_risk_assessment.insert_one(risk_snapshot)

      

        return {"msg": "Risk level and support services updated, and risk assessment recorded"}

    else:
        raise HTTPException(status_code=400, detail="No valid fields provided for update.")



@router.get("/risk-history/{victim_id}")
async def get_risk_history(victim_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):

    """
    Get risk assessment history for a given victim.
    """
    # Validate victim existence (optional but recommended)
    victim_exists = await db.victims.find_one({"_id": ObjectId(victim_id)})
    if not victim_exists:
        raise HTTPException(status_code=404, detail="Victim not found")

    # Query the risk assessment snapshots
    cursor = db.victim_risk_assessment.find(
        {"victim_id": victim_id}
    ).sort("created_at", -1)  # sort by created_at descending

    risk_history = []
    async for snapshot in cursor:
        risk_history.append({
            "id": str(snapshot["_id"]),
            "victim_id": snapshot["victim_id"],
            "risk_assessment": snapshot.get("risk_assessment"),
            "support_services": snapshot.get("support_services", []),
            "role": snapshot.get("role"),
            "created_at": snapshot["created_at"].isoformat(),
            "updated_at": snapshot["updated_at"].isoformat()
        })

    return JSONResponse(content=risk_history)



@router.get("/case/{case_id}", response_model=List[VictimOutSchema])
async def get_victims_by_case(case_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.victims.find({"cases_involved": case_id})
    victims = []

    async for victim in cursor:
        victim["id"] = str(victim.pop("_id"))
        # Convert datetime fields to isoformat strings
        victim["created_at"] = victim["created_at"].isoformat() if "created_at" in victim else None
        victim["updated_at"] = victim["updated_at"].isoformat() if "updated_at" in victim else None

        # Defensive defaults
        victim["demographics"] = victim.get("demographics")
        victim["contact_info"] = victim.get("contact_info")
        victim["risk_assessment"] = victim.get("risk_assessment")
        victim["support_services"] = victim.get("support_services", [])

        victims.append(VictimOutSchema(**victim))

    return victims
@router.get("/summary/victim-demographics-summary")
async def get_victim_demographics_summary(db: AsyncIOMotorDatabase = Depends(get_database)):
    pipeline = [
        {"$match": {"type": "victim"}},
        {"$group": {
            "_id": None,
            "gender_counts": {
                "$push": "$demographics.gender"
            },
            "ethnicity_counts": {
                "$push": "$demographics.ethnicity"  
            },
            "occupation_counts": {
                "$push": "$demographics.occupation"
            },
            "ages": {
                "$push": "$demographics.age"
            }
        }},
        {"$project": {
            "_id": 0,
            "gender_counts": 1,
            "ethnicity_counts": 1,
            "occupation_counts": 1,
            "ages": 1
        }}
    ]
    
    result = await db.victims.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "gender": {},
            "ethnicity": {},
            "age_groups": {},
            "occupation": {}
        }
    
    data = result[0]
    
    # Count occurrences
    from collections import Counter
    
    gender_counts = Counter([g for g in data.get("gender_counts", []) if g])
    ethnicity_counts = Counter([e for e in data.get("ethnicity_counts", []) if e])
    occupation_counts = Counter([o for o in data.get("occupation_counts", []) if o])
    
    # Group ages
    age_groups = {"0-18": 0, "19-35": 0, "36-50": 0, "51+": 0}
    for age in data.get("ages", []):
        if age and isinstance(age, int):
            if age <= 18:
                age_groups["0-18"] += 1
            elif age <= 35:
                age_groups["19-35"] += 1
            elif age <= 50:
                age_groups["36-50"] += 1
            else:
                age_groups["51+"] += 1
    
    return {
        "gender": dict(gender_counts),
        "ethnicity": dict(ethnicity_counts),
        "age_groups": age_groups,
        "occupation": dict(occupation_counts)
    }