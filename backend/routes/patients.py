from fastapi import APIRouter, Request, HTTPException
from controllers.patient_controller import (
    resolve_patient_id,
    get_patients,
    get_patient_detail,
    get_encounters,
    get_clinical_flags,
    get_clinical_flags_by_patient,
    filter_patient_by_tier,
)
from controllers.break_glass_controller import get_active_break_glass
from controllers.audit_controller import create_audit_log
from controllers.config_controller import get_config
from middleware.auth import verify_treatment_relationship, get_current_clinician
from models.audit import AuditLogCreate
from typing import Optional

router = APIRouter()


@router.get("/api/patients")
async def list_patients():
    patients = get_patients()
    encounters = get_encounters()
    flags = get_clinical_flags()

    unacknowledged_flags = [f for f in flags if not f.acknowledged_by]
    ready_count = sum(1 for e in encounters if e.brief_status == "ready")

    return {
        "patients": [p.model_dump() for p in patients],
        "encounters": [e.model_dump() for e in encounters],
        "flags": [f.model_dump() for f in flags],
        "stats": {
            "todayEncounters": len(encounters),
            "briefsReady": ready_count,
            "briefsPercentage": round((ready_count / len(encounters) * 100)) if encounters else 0,
            "activeFlags": len(unacknowledged_flags),
            "criticalFlags": sum(1 for f in unacknowledged_flags if f.severity == "critical"),
            "highFlags": sum(1 for f in unacknowledged_flags if f.severity == "high"),
        },
    }


@router.get("/api/patients/{patient_id}")
async def get_patient(patient_id: str, request: Request):
    internal_id = await resolve_patient_id(patient_id)
    if not internal_id:
        raise HTTPException(status_code=404, detail="Patient not found")

    config = get_config()
    clinician = get_current_clinician(request)

    trv = await verify_treatment_relationship(clinician["id"], internal_id)
    if not trv["allowed"]:
        create_audit_log(AuditLogCreate(
            actor_id=clinician["id"],
            actor_name=clinician["name"],
            actor_role=clinician["role"],
            action="phi.access_denied.no_treatment_relationship",
            resource_type="patient_brief",
            resource_id=patient_id,
            patient_id=internal_id,
            access_result="denied",
        ))
        raise HTTPException(
            status_code=403,
            detail={"error": "Access denied", "reason": trv["reason"], "canBreakGlass": True},
        )

    patient = get_patient_detail(internal_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    flags = get_clinical_flags_by_patient(internal_id)
    filtered_patient, blocked_tiers = filter_patient_by_tier(patient, config.tier3_authorized)

    if blocked_tiers:
        create_audit_log(AuditLogCreate(
            actor_id=clinician["id"],
            actor_name=clinician["name"],
            actor_role=clinician["role"],
            action="phi.tier_restricted",
            resource_type="patient_brief",
            resource_id=patient_id,
            patient_id=internal_id,
            access_result="granted",
            sensitivity_tier=blocked_tiers[0],
        ))

    create_audit_log(AuditLogCreate(
        actor_id=clinician["id"],
        actor_name=clinician["name"],
        actor_role=clinician["role"],
        action="phi.brief.viewed",
        resource_type="patient_brief",
        resource_id=patient_id,
        patient_id=internal_id,
        access_result="granted",
        sensitivity_tier=2,
    ))

    active_bg = get_active_break_glass(clinician["id"], internal_id)

    return {
        "patient": filtered_patient.model_dump(mode="json"),
        "flags": [f.model_dump() for f in flags],
        "blockedTiers": blocked_tiers,
        "activeBreakGlass": active_bg.model_dump() if active_bg else None,
    }
