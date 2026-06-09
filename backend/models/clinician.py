from typing import Optional
from .base import BaseModel


class Clinician(BaseModel):
    id: str
    name: str
    role: str
    department: Optional[str] = None
    organisation_id: str = "nhs-trust-001"
    is_active: bool = True


class TreatmentRelationship(BaseModel):
    id: int
    patient_id: str
    clinician_id: str
    clinician_name: str
    relationship_type: str
    valid_from: str
    valid_until: Optional[str] = None
    status: str
