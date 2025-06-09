from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from .shared import PyObjectId  # Move your PyObjectId class into shared.py

class Evidence(BaseModel):
    type: str
    url: str
    description: Optional[str]
    date_captured: datetime

class Perpetrator(BaseModel):
    name: str
    type: str  # e.g. "military_unit", "individual"

class Case(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    case_id: str
    title: str
    description: Optional[str] = None
    violation_types: List[str]
    status: str
    priority: Optional[str]
    date_occurred: datetime
    date_reported: datetime
    victims: List[PyObjectId]
    perpetrators: List[Perpetrator]
    evidence: List[Evidence]
    list_of_reports_IDs: List[int]
    created_by: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "populate_by_name": True
    }

class CaseStatusHistory(BaseModel):
    case_id: str
    history: List[dict]  # You can make this a structured model too
