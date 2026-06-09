from fastapi import APIRouter, Query
from typing import Optional
from controllers.audit_controller import get_audit_logs, create_audit_log
from models.audit import AuditLogCreate

router = APIRouter()


@router.get("/api/audit-logs")
async def list_audit_logs(
    action: Optional[str] = Query(None),
    limit: int = Query(100),
):
    logs = get_audit_logs(action_filter=action, limit=limit)
    return {"logs": [l.model_dump() for l in logs], "total": len(logs)}


@router.post("/api/audit-logs", status_code=201)
async def create_audit_log_entry(entry: AuditLogCreate):
    log = create_audit_log(entry)
    return {"log": log.model_dump()}
