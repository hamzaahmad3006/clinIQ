from fastapi import Request, HTTPException
from typing import Optional
from database import supabase


async def verify_treatment_relationship(
    clinician_id: str, patient_id: str
) -> dict:
    result = (
        supabase.table("treatment_relationships")
        .select("*")
        .eq("patient_id", patient_id)
        .eq("clinician_id", clinician_id)
        .eq("status", "active")
        .execute()
    )

    if not result.data:
        return {"allowed": False, "reason": "no_treatment_relationship"}

    tr = result.data[0]
    if tr.get("valid_until") and tr["valid_until"] < __now_iso():
        return {"allowed": False, "reason": "relationship_expired"}

    return {"allowed": True}


def get_current_clinician(request: Request) -> dict:
    clinician_id = request.headers.get("X-Clinician-Id", "clin-henderson-001")
    clinician_name = request.headers.get("X-Clinician-Name", "Dr. Henderson")
    clinician_role = request.headers.get("X-Clinician-Role", "specialist")
    return {
        "id": clinician_id,
        "name": clinician_name,
        "role": clinician_role,
    }


def __now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()
