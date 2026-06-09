from fastapi import APIRouter, Request
from controllers.audit_controller import create_audit_log
from controllers.config_controller import get_config
from middleware.auth import get_current_clinician
from models.audit import AuditLogCreate
from llm import generate_patient_brief
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class BriefGenerateRequest(BaseModel):
    patient_id: Optional[str] = None
    patient_data: dict


@router.post("/api/brief/generate")
async def generate_brief(body: BriefGenerateRequest, request: Request):
    config = get_config()
    clinician = get_current_clinician(request)

    result = await generate_patient_brief(
        body.patient_data,
        api_key_override=config.groq_api_key,
    )

    create_audit_log(AuditLogCreate(
        actor_id=clinician["id"],
        actor_name=clinician["name"],
        actor_role=clinician["role"],
        action="brief.generated",
        resource_type="patient_brief",
        resource_id=body.patient_id or "unknown",
        patient_id=body.patient_id,
        access_result="granted",
        sensitivity_tier=2,
    ))

    return {"brief": result["brief"], "model": result["model"]}
