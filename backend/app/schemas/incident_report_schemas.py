from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from app.models.incident_report_models import EvidenceItem


# Location schema using GeoJSON-like structure
class CoordinatesSchema(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]


class LocationSchema(BaseModel):
    country: str
    city: str
    coordinates: CoordinatesSchema


class ContactInfoSchema(BaseModel):
    email: Optional[EmailStr]
    phone: Optional[str]
    preferred_contact: Optional[str] = "email"


class DemographicsSchema(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    gender: Optional[str]
    age: Optional[int]
    birthdate: Optional[str]


class VictimDetailsSchema(BaseModel):
    demographics: Optional[DemographicsSchema] = None
    contact_info: Optional[ContactInfoSchema] = None


class IncidentDetailsSchema(BaseModel):
    date: datetime
    incident_title: str
    description: str
    location: LocationSchema
    violation_types: List[str]


class CreateIncidentReportSchema(BaseModel):
    reporter_type: str  # "victim" or "witness"
    anonymous: bool = False
    contact_info: Optional[ContactInfoSchema] = None
    incident_details: IncidentDetailsSchema
    evidence: Optional[List[EvidenceItem]] = []
   # evidence: Optional[List[str]] = []  # Placeholder for now
    victim_details: Optional[VictimDetailsSchema] = None


class IncidentReportOutSchema(CreateIncidentReportSchema):
    id: str
    status: Optional[str]
    created_at: datetime
    updated_at: datetime