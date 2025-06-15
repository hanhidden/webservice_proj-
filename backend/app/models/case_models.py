#cases model 
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from .shared import PyObjectId

class Evidence(BaseModel):
    type: str
    url: str
    description: Optional[str] = None
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
    priority: Optional[str] = None
    date_occurred: datetime
    date_reported: datetime

    victims: List[PyObjectId] = Field(default_factory=list)
    perpetrators: List[Perpetrator] = Field(default_factory=list)
    evidence: List[Evidence] = Field(default_factory=list)
    list_of_reports_IDs: List[int] = Field(default_factory=list)
    
    created_by: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    assigned_secretaria: Optional[PyObjectId] = None
    deleted: bool = False
    witnesses: List[PyObjectId] = Field(default_factory=list)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True


class CaseStatusHistory(BaseModel):
    case_id: str
    history: List[dict]  # You can create a proper model if needed

# Add a proper model for case updates
#also new
class CaseUpdateModel(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    violation_types: Optional[list] = None
    priority: Optional[str] = None
    date_occurred: Optional[str] = None
    date_reported: Optional[str] = None
    perpetrators: Optional[list] = None
    status: Optional[str] = None
