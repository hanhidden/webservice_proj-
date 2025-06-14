from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_next_custom_id(db: AsyncIOMotorDatabase, victim_type: str) -> str:
    # Set prefix based on victim type
    prefix = "vict" if victim_type == "victim" else "witn"

    # Atomically update the counter for the type
    result = await db.counters.find_one_and_update(
        {"_id": victim_type},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )

    sequence_number = result["seq"]
    return f"{prefix}-{sequence_number:06d}"  # Pads with zeros (e.g., 000001)
