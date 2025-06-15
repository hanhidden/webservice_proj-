# backend/app/models/incident_report_models.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class Coordinates(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]

class Location(BaseModel):
    country: str
    city: str
    coordinates: Coordinates

class ContactInfo(BaseModel):
    email: Optional[EmailStr]
    phone: Optional[str]
    preferred_contact: Optional[str]

class EvidenceItem(BaseModel):
    type: str  # video, image, pdf
    url: str
    description: Optional[str]=None

class IncidentDetails(BaseModel):
    date: datetime
    incident_title: str
    description: str
    location: Location
    violation_types: List[str]

class Demographics(BaseModel):
    first_name: str
    last_name: str
    gender: str
    age: int
    birthdate: Optional[str]

class VictimDetails(BaseModel):
    demographics: Demographics
    contact_info: Optional[ContactInfo]

class IncidentReport(BaseModel):
    report_id: str
    reporter_type: str  # victim or witness
    anonymous: bool
    contact_info: Optional[ContactInfo]
    incident_details: IncidentDetails
    evidence: List[EvidenceItem]
    victim_details: Optional[VictimDetails]
    status: Optional[str]
    created_at: Optional[datetime]

class CreateIncidentReport(BaseModel):
    reporter_type: str
    anonymous: bool
    contact_info: Optional[ContactInfo]
    incident_details: IncidentDetails
    evidence: List[EvidenceItem]
    victim_details: Optional[VictimDetails]

class IncidentReportOut(IncidentReport):
    id: str