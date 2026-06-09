from typing import Optional
from .base import BaseModel


class BreakGlassEvent(BaseModel):
    id: str
    clinician_id: str
    clinician_name: str
    patient_id: str
    patient_name: str
    justification: str
    created_at: str
    expires_at: str
    privacy_officer_notified: bool
    review_status: str


class BreakGlassCreate(BaseModel):
    patient_id: str
    justification: str


class BreakGlassResponse(BaseModel):
    event: BreakGlassEvent
    patient_name: str
