#.\models\victim_models.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class Demographics(BaseModel):
    first_name: str
    last_name: str
    gender: str
    age: int
    birthdate: Optional[str]  # e.g. "1990-05-12"
    occupation: str

class ContactInfo(BaseModel):
    email: EmailStr
    phone: str

class RiskAssessment(BaseModel):
    level: str  # low, medium, high, critical, extreme
    threats: List[str]
    protection_needed: bool

class Victim(BaseModel):
    id: Optional[str] = Field(alias="_id")
    type: str  # victim or witness
    anonymous: bool
    demographics: Optional[Demographics]
    contact_info: Optional[ContactInfo]
    cases_involved: List[str]
    risk_assessment: RiskAssessment
    created_at: datetime
    updated_at: datetime
