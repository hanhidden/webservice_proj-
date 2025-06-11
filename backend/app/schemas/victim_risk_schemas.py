from pydantic import BaseModel
from typing import List
from datetime import datetime

class RiskAssessmentSchema(BaseModel):
    level: str
    threats: List[str]
    protection_needed: bool

class SupportServiceSchema(BaseModel):
    type: str
    provider: str
    status: str

class VictimRiskAssessmentSchema(BaseModel):
    victim_id: str
    risk_assessment: RiskAssessmentSchema
    support_services: List[SupportServiceSchema]
    role: str  # victim or witness
    created_at: datetime
    updated_at: datetime
