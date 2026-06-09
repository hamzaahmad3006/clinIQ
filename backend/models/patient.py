from typing import Optional, List
from .base import BaseModel


class Patient(BaseModel):
    id: str
    name: str
    initials: str
    nhs_number: str
    date_of_birth: str
    age: int
    gender: str
    avatar_color: str
    avatar_text_color: str
    consent_status: str
    organisation_id: str


class Allergy(BaseModel):
    name: str
    severity: str
    reaction: str


class Condition(BaseModel):
    name: str
    status: str
    onset: str
    icd10: str


class Medication(BaseModel):
    name: str
    dose: str
    route: str
    frequency: str
    status: str


class Investigation(BaseModel):
    name: str
    result: str
    date: str
    status: str


class Warning(BaseModel):
    type: str
    title: str
    description: str


class PatientDetail(BaseModel):
    id: str
    name: str
    full_name: str
    nhs_number: str
    date_of_birth: str
    age: int
    gender: str
    department: str
    clinician: str
    allergies: List[Allergy]
    conditions: List[Condition]
    medications: List[Medication]
    investigations: List[Investigation]
    warnings: List[Warning]


class Encounter(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    patient_initials: str
    nhs_number: str
    encounter_type: str
    department: str
    status: str
    status_label: str
    status_color: str
    border_color: str
    brief_status: str
    brief_percentage: int
    flag_count: int
    avatar_color: str
    avatar_text_color: str


class ClinicalFlag(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    flag_type: str
    severity: str
    description: str
    source: str
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[str] = None
    created_at: str


class WardBed(BaseModel):
    bed: str
    patient_id: str
    patient_name: str
    age: int
    gender: str
    brief_status: str
    overnight_changes: List[str]
    overnight_detail: str
    flag_count: int
    flag_severity: str


class OvernightEvent(BaseModel):
    patient_name: str
    bed: str
    time: str
    severity: str
    title: str
    description: str


class EmergencyData(BaseModel):
    patient_id: str
    patient_name: str
    loading_sources: dict
    allergies: List[dict]
    critical_flags: List[dict]
    medications: List[dict]
    conditions: List[dict]
    labs: List[dict]
    blocked_tiers: str


class PatientBrief(BaseModel):
    id: str
    encounter_id: str
    patient_id: str
    generated_at: str
    model_version: Optional[str] = None
    brief_json: Optional[dict] = None
    sources_used: Optional[List[dict]] = None
    sources_failed: Optional[List[dict]] = None
    flags_count: int = 0
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    break_glass: bool = False
    generation_latency_ms: Optional[int] = None
