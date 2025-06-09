#.\app\schemas\victim_schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime




class DemographicsSchema(BaseModel):
    first_name: str
    last_name: str
    gender: str
    age: int
    birthdate: Optional[str] = None
    ethnicity: Optional[str] = None
    occupation: str

class ContactInfoSchema(BaseModel):
    email: EmailStr
    phone: str

class RiskAssessmentSchema(BaseModel):
    level: str  # low, medium, high, etc.
    threats: List[str]
    protection_needed: bool

class SupportServiceSchema(BaseModel):
    type: str
    provider: str
    status: str

class CreateVictimSchema(BaseModel):
    type: str
    anonymous: bool
    demographics: Optional[DemographicsSchema] = None
    contact_info: Optional[ContactInfoSchema] = None
    cases_involved: List[str]
    risk_assessment: RiskAssessmentSchema
    support_services: Optional[List[SupportServiceSchema]] = []

class VictimOutSchema(CreateVictimSchema):
    id: str
    created_at: str
    updated_at: str



class RiskAssessmentPatchSchema(BaseModel):
    level: Optional[str] = None
    threats: Optional[List[str]] = None
    protection_needed: Optional[bool] = None

class SupportServicePatchSchema(BaseModel):
    type: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None

class VictimPatchSchema(BaseModel):
    risk_assessment: Optional[RiskAssessmentPatchSchema] = None
    support_services: Optional[List[SupportServicePatchSchema]] = None

