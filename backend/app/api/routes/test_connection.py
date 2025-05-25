from fastapi import APIRouter, HTTPException
from app.core.database import client, MONGO_DB_NAME

router = APIRouter()

@router.get("/test-connection/")
async def test_connection():
    try:
        await client.admin.command("ping")
        return {"status": "Connected to MongoDB!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/collections")
async def list_collections():
    try:
        db = client[MONGO_DB_NAME]
        collections = await db.list_collection_names()
        return {"collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))