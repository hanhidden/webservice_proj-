from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends


class CreateEvidenceSchema(BaseModel):
    type: str = Field(..., pattern="^(video|image|pdf)$")
    description: Optional[str]
    file: bytes  # raw upload

class EvidenceOutSchema(BaseModel):
    id: str
    type: str
    description: Optional[str]
    url: Optional[str] = None
    content_type: str
    created_at: datetime
    updated_at: datetime


