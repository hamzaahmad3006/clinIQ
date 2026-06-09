from typing import Optional, Any
from .base import BaseModel


class AuditLog(BaseModel):
    id: int
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: str
    patient_id: Optional[str] = None
    access_result: str
    sensitivity_tier: Optional[int] = None
    timestamp: str


class AuditLogCreate(BaseModel):
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: str
    patient_id: Optional[str] = None
    access_result: str = "granted"
    sensitivity_tier: Optional[int] = None
