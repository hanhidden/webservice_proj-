from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Evidence(BaseModel):
    type: str  # video, image, pdf
    description: Optional[str]
    filename: str
    content_type: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class EvidenceInDB(Evidence):
    id: str



