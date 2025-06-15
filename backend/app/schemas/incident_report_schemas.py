# from pydantic import BaseModel, EmailStr, Field
# from typing import List, Optional
# from datetime import datetime
# from app.models.incident_report_models import EvidenceItem


# # Location schema using GeoJSON-like structure
# class CoordinatesSchema(BaseModel):
#     type: str = "Point"
#     coordinates: List[float]  # [longitude, latitude]


# class LocationSchema(BaseModel):
#     country: str
#     city: str
#     coordinates: CoordinatesSchema


# class ContactInfoSchema(BaseModel):
#     email: Optional[EmailStr]
#     phone: Optional[str]
#     preferred_contact: Optional[str] = "email"


# class DemographicsSchema(BaseModel):
#     first_name: Optional[str]
#     last_name: Optional[str]
#     gender: Optional[str]
#     age: Optional[int]
#     birthdate: Optional[str]


# class VictimDetailsSchema(BaseModel):
#     demographics: Optional[DemographicsSchema] = None
#     contact_info: Optional[ContactInfoSchema] = None


# class IncidentDetailsSchema(BaseModel):
#     date: datetime
#     incident_title: str
#     description: str
#     location: LocationSchema
#     violation_types: List[str]


# class CreateIncidentReportSchema(BaseModel):
#     reporter_type: str  # "victim" or "witness"
#     anonymous: bool = False
#     contact_info: Optional[ContactInfoSchema] = None
#     incident_details: IncidentDetailsSchema
#     evidence: Optional[List[EvidenceItem]] = []
#    # evidence: Optional[List[str]] = []  # Placeholder for now
#     victim_details: Optional[VictimDetailsSchema] = None


# class IncidentReportOutSchema(CreateIncidentReportSchema):
#     id: str
#     status: Optional[str]
#     created_at: datetime
#     updated_at: datetime

# backend/app/schemas/incident_report_schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from datetime import datetime
from app.models.incident_report_models import EvidenceItem

# Location schema using GeoJSON-like structure
class CoordinatesSchema(BaseModel):
    type: str = "Point"
    coordinates: List[float] = []  # Allow empty list initially

class LocationSchema(BaseModel):
    country: Optional[str] = None  # Make optional to handle empty strings
    city: Optional[str] = None     # Make optional to handle empty strings
    coordinates: CoordinatesSchema

class ContactInfoSchema(BaseModel):
    email: Optional[str] = None    # Changed from EmailStr to str to handle "anonymous"
    phone: Optional[str] = None
    preferred_contact: Optional[str] = "email"
    
    @validator('email')
    def validate_email(cls, v):
        # Allow "anonymous" or None, otherwise validate as email
        if v in [None, "anonymous", ""]:
            return v
        # Basic email validation (you can make this stricter if needed)
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v

class DemographicsSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    birthdate: Optional[str] = None  # Keep as string, convert later if needed

class VictimDetailsSchema(BaseModel):
    demographics: Optional[DemographicsSchema] = None
    contact_info: Optional[ContactInfoSchema] = None

class IncidentDetailsSchema(BaseModel):
    date: datetime  # Changed from datetime to str to match frontend
    incident_title: str
    description: str
    location: LocationSchema
    violation_types: List[str]

    @validator('date', pre=True)
    def validate_date(cls, v):
        if isinstance(v, datetime):
            return v
        try:
            return datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')

class CreateIncidentReportSchema(BaseModel):
    reporter_type: str  # "victim", "witness", or "organization"
    reporter_id: Optional[str] = None  # Added for organization user ID
    anonymous: bool = False
    contact_info: Optional[ContactInfoSchema] = None
    incident_details: IncidentDetailsSchema
    evidence: Optional[List[dict]] = []  # Changed to dict to match frontend
    victim_details: Optional[VictimDetailsSchema] = None

class IncidentReportOutSchema(BaseModel):
    id: str
    reporter_type: str
    reporter_id: Optional[str] = None  # Added for organization user ID
    anonymous: bool = False
    contact_info: Optional[ContactInfoSchema] = None
    incident_details: IncidentDetailsSchema
    evidence: Optional[List[dict]] = []
    victim_details: Optional[VictimDetailsSchema] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    report_id: Optional[str] = None
    org_id: Optional[str] = None  # Added for backward compatibility and clarity