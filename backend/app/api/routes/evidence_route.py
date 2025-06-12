from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorGridFSBucket
from datetime import datetime
from typing import Optional
from fastapi.responses import StreamingResponse
from bson import ObjectId
from app.schemas.evidence_schemas import EvidenceOutSchema
from app.core.database import get_database
import base64
import io

router = APIRouter()



@router.post("/", response_model=EvidenceOutSchema)
async def upload_evidence(
    type: str = Form(...),
    description: Optional[str] = Form(None),
    report_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not file.content_type.startswith(type + "/") and not (type == "pdf" and file.content_type == "application/pdf"):
        raise HTTPException(status_code=400, detail="Type mismatch")

    content = await file.read()
    encoded_content = base64.b64encode(content).decode("utf-8")

    # Prepare inserted document ID in advance
    fake_id = ObjectId()
    url = f"/api/evidence/{str(fake_id)}"

    doc = {
        "_id": fake_id,  # manually set ObjectId so we can use it in URL
        "type": type,
        "description": description,
        "filename": file.filename,
        "content": encoded_content,
        "content_type": file.content_type,
        "report_id": report_id,
        "url": url,  # Store the URL in the database
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db["evidence"].insert_one(doc)

    return EvidenceOutSchema(
        id=str(fake_id),
        type=type,
        description=description,
        url=url,
        content_type=file.content_type,
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("/{evidence_id}")
async def get_evidence(evidence_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        document = await db["evidence"].find_one({"_id": ObjectId(evidence_id)})
        if not document:
            raise HTTPException(status_code=404, detail="Evidence not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    file_data = base64.b64decode(document["content"])
    return StreamingResponse(io.BytesIO(file_data), media_type=document["content_type"])