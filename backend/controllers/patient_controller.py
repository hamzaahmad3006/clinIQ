from database import supabase
from models.patient import Patient, PatientDetail, Encounter, ClinicalFlag, EmergencyData, Warning as PatientWarning
from typing import Optional

OPAQUE_ID_MAP = {
    "enc_a7f3b9c2": "j-wilson",
    "enc_b8d4e0f3": "m-thompson",
    "enc_c9e5f1a4": "r-johnson",
    "enc_d0f6a2b5": "d-brown",
    "enc_e1a7b3c6": "w-davis",
    "enc_f2b8c4d7": "s-miller",
}

TIER3_PATIENT_IDS = {
    "j-wilson": ["Mental health records"],
    "r-johnson": ["Substance use treatment records"],
}


async def resolve_patient_id(input_id: str) -> Optional[str]:
    if input_id in OPAQUE_ID_MAP:
        return OPAQUE_ID_MAP[input_id]
    result = supabase.table("patients").select("id").eq("id", input_id).execute()
    return result.data[0]["id"] if result.data else None


def get_patients() -> list[Patient]:
    result = supabase.table("patients").select("*").execute()
    return [Patient(**row) for row in (result.data or [])]


def get_patient_by_id(patient_id: str) -> Optional[Patient]:
    result = supabase.table("patients").select("*").eq("id", patient_id).execute()
    return Patient(**result.data[0]) if result.data else None


def get_patient_detail(patient_id: str) -> Optional[PatientDetail]:
    result = supabase.table("patient_details").select("*").eq("id", patient_id).execute()
    if not result.data:
        return None
    row = result.data[0]
    return PatientDetail(
        id=row["id"],
        name=row.get("full_name", ""),
        full_name=row.get("full_name", ""),
        nhs_number=row.get("nhs_number", ""),
        date_of_birth=row.get("date_of_birth", ""),
        age=row.get("age", 0),
        gender=row.get("gender", ""),
        department=row.get("department", ""),
        clinician=row.get("clinician", ""),
        allergies=row.get("allergies", []),
        conditions=row.get("conditions", []),
        medications=row.get("medications", []),
        investigations=row.get("investigations", []),
        warnings=row.get("warnings", []),
    )


def get_encounters() -> list[Encounter]:
    result = supabase.table("encounters").select("*").execute()
    return [Encounter(**row) for row in (result.data or [])]


def get_clinical_flags() -> list[ClinicalFlag]:
    result = supabase.table("clinical_flags").select("*").execute()
    return [ClinicalFlag(**row) for row in (result.data or [])]


def get_clinical_flags_by_patient(patient_id: str) -> list[ClinicalFlag]:
    result = (
        supabase.table("clinical_flags")
        .select("*")
        .eq("patient_id", patient_id)
        .execute()
    )
    return [ClinicalFlag(**row) for row in (result.data or [])]


def filter_patient_by_tier(
    patient: PatientDetail, tier3_authorized: bool
) -> tuple[PatientDetail, list[int]]:
    blocked_tiers: list[int] = []
    if not tier3_authorized and patient.id in TIER3_PATIENT_IDS:
        blocked_tiers.append(3)
        filtered = patient.model_copy(deep=True)
        filtered.conditions = [
            c for c in filtered.conditions
            if "Mental" not in c.name and "Substance" not in c.name
        ]
        filtered.medications = [
            m for m in filtered.medications
            if "Antidepressant" not in m.name and "Methadone" not in m.name
        ]
        filtered.investigations = [
            i for i in filtered.investigations if "Psychiatric" not in i.name
        ]
        label = TIER3_PATIENT_IDS[patient.id][0]
        filtered.warnings = [
            w for w in filtered.warnings if w.type != "restricted"
        ]
        filtered.warnings.append(
            PatientWarning(
                type="restricted",
                title=f"Tier 3 Records Blocked: {label}",
                description=f"{label} are restricted under separate consent and are not included in this brief.",
            )
        )
        return filtered, blocked_tiers
    return patient, blocked_tiers


def get_emergency_data() -> EmergencyData:
    return EmergencyData(
        patient_id="r-johnson",
        patient_name="R. Johnson",
        loading_sources={"current": 4, "total": 5},
        allergies=[
            {"name": "Penicillin", "severity": "critical", "reaction": "Anaphylaxis"},
            {"name": "Aspirin", "severity": "high", "reaction": "Asthma exacerbation"},
        ],
        critical_flags=[
            {"title": "DNACPR", "detail": "Do Not Attempt CPR — Signed 2024-01-15", "code": "ReSPECT"},
            {"title": "High Falls Risk", "detail": "Waterlow Score 22 — Very High Risk", "code": "NICE CG161"},
        ],
        medications=[
            {"name": "Warfarin", "dose": "5mg", "frequency": "OD", "category": "Anticoagulant"},
            {"name": "Metformin", "dose": "1000mg", "frequency": "BD", "category": "Antidiabetic"},
            {"name": "Bisoprolol", "dose": "2.5mg", "frequency": "OD", "category": "Beta-Blocker"},
            {"name": "Atorvastatin", "dose": "40mg", "frequency": "ON", "category": "Statin"},
        ],
        conditions=[
            {"name": "T2DM", "status": "Active"},
            {"name": "CKD Stage 3", "status": "Active"},
            {"name": "Hypercholesterolemia", "status": "Active"},
        ],
        labs=[
            {"name": "Serum Creatinine", "value": "142", "unit": "µmol/L", "trend": "up"},
            {"name": "eGFR", "value": "48", "unit": "mL/min", "trend": "down"},
            {"name": "HbA1c", "value": "62", "unit": "mmol/mol", "trend": "stable"},
        ],
        blocked_tiers="T3–T5 sensitive records blocked. Override requires Break-Glass authorisation.",
    )
