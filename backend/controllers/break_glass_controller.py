from database import supabase
from models.break_glass import BreakGlassEvent, BreakGlassCreate
from controllers.audit_controller import create_audit_log
from models.audit import AuditLogCreate
from datetime import datetime, timezone, timedelta
from typing import Optional, Union


def create_break_glass_event(
    clinician_id: str,
    clinician_name: str,
    patient_id: str,
    patient_name: str,
    justification: str,
) -> Union[BreakGlassEvent, dict]:
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    count_result = (
        supabase.table("break_glass_events")
        .select("*", count="exact")
        .eq("clinician_id", clinician_id)
        .gte("created_at", thirty_days_ago)
        .execute()
    )

    if count_result.count and count_result.count >= 3:
        return {"error": "Break-Glass limit reached (max 3 per 30 days)"}

    event_id = f"bg-{int(datetime.now().timestamp())}-{__random_str(4)}"
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=72)

    event_data = {
        "id": event_id,
        "clinician_id": clinician_id,
        "clinician_name": clinician_name,
        "patient_id": patient_id,
        "patient_name": patient_name,
        "justification": justification,
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "privacy_officer_notified": True,
        "review_status": "pending",
    }

    supabase.table("break_glass_events").insert(event_data).execute()

    supabase.table("treatment_relationships").insert({
        "patient_id": patient_id,
        "clinician_id": clinician_id,
        "clinician_name": clinician_name,
        "relationship_type": "break_glass",
        "valid_from": now.isoformat(),
        "valid_until": expires_at.isoformat(),
        "status": "active",
    }).execute()

    create_audit_log(AuditLogCreate(
        actor_id=clinician_id,
        actor_name=clinician_name,
        actor_role="specialist",
        action="break_glass.initiated",
        resource_type="patient_brief",
        resource_id=patient_id,
        patient_id=patient_id,
        access_result="break_glass",
        sensitivity_tier=2,
    ))

    return BreakGlassEvent(**event_data)


def get_active_break_glass(
    clinician_id: str, patient_id: str
) -> Optional[BreakGlassEvent]:
    now = datetime.now(timezone.utc).isoformat()
    result = (
        supabase.table("break_glass_events")
        .select("*")
        .eq("clinician_id", clinician_id)
        .eq("patient_id", patient_id)
        .gt("expires_at", now)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if result.data:
        return BreakGlassEvent(**result.data[0])
    return None


def get_all_break_glass_events() -> list[BreakGlassEvent]:
    result = (
        supabase.table("break_glass_events")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return [BreakGlassEvent(**row) for row in (result.data or [])]


def __random_str(length: int) -> str:
    import random
    import string
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))
