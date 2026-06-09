from database import supabase
from models.audit import AuditLog, AuditLogCreate
from typing import Optional
from datetime import datetime, timezone


def get_audit_logs(
    action_filter: Optional[str] = None, limit: int = 100
) -> list[AuditLog]:
    query = supabase.table("audit_logs").select("*").order("id", desc=True)
    result = query.execute()

    logs = [AuditLog(**row) for row in (result.data or [])]

    if action_filter:
        logs = [l for l in logs if action_filter in l.action]

    return logs[:limit]


def create_audit_log(entry: AuditLogCreate) -> AuditLog:
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "actor_id": entry.actor_id,
        "actor_name": entry.actor_name,
        "actor_role": entry.actor_role,
        "action": entry.action,
        "resource_type": entry.resource_type,
        "resource_id": entry.resource_id,
        "patient_id": entry.patient_id,
        "access_result": entry.access_result,
        "sensitivity_tier": entry.sensitivity_tier,
        "timestamp": now,
    }
    result = supabase.table("audit_logs").insert(data).execute()
    if result.data:
        return AuditLog(**result.data[0])
    raise Exception("Failed to create audit log")
