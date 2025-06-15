from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Custom ObjectId validator (usually in shared.py)
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Evidence model
class Evidence(BaseModel):
    type: str
    url: Optional[str] = None  # you might store url or filename
    description: Optional[str] = None
    date_captured: Optional[datetime] = None

# Perpetrator model
class Perpetrator(BaseModel):
    name: str
    type: str  # e.g. "military_unit", "individual"

# Main Case model for DB
class Case(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    case_id: str
    title: str
    description: Optional[str]
    violation_types: List[str]
    status: str
    priority: Optional[str] = None
    date_occurred: datetime
    date_reported: datetime
    victims: List[PyObjectId]
    perpetrators: List[Perpetrator]
    evidence: List[Evidence] = []
    list_of_reports_IDs: List[str]  # e.g. ["reports[2891]"]
    created_by: PyObjectId
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    assigned_secretaria: Optional[PyObjectId] = None
    deleted: Optional[bool] = False
    witnesses: Optional[List[PyObjectId]] = []

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True


# Input model for creating a Case (POST payload)
class CaseCreate(BaseModel):
    case_id: str
    title: str
    description: Optional[str]
    violation_types: List[str]
    status: str
    priority: Optional[str] = None
    date_occurred: datetime
    date_reported: datetime
    victims: List[str]  # ObjectId hex strings
    perpetrators: List[Perpetrator]
    evidence: Optional[List[Evidence]] = []
    list_of_reports_IDs: List[str]
    created_by: str  # ObjectId hex string
    assigned_secretaria: Optional[str] = None
    deleted: Optional[bool] = False
    witnesses: Optional[List[str]] = []

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
