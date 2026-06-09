from fastapi import APIRouter
from controllers.rounds_controller import get_ward_beds, get_overnight_events, generate_briefs_for_ward
from controllers.patient_controller import get_clinical_flags
from controllers.audit_controller import create_audit_log
from controllers.config_controller import get_config
from models.audit import AuditLogCreate
from llm import generate_ward_round_summary

router = APIRouter()


@router.get("/api/rounds")
async def get_rounds():
    beds = get_ward_beds()
    events = get_overnight_events()
    flags = get_clinical_flags()

    unacknowledged = [f for f in flags if not f.acknowledged_by]

    return {
        "beds": [b.model_dump() for b in beds],
        "events": [e.model_dump() for e in events],
        "flags": [f.model_dump() for f in flags],
        "stats": {
            "totalBeds": 14,
            "occupiedBeds": len(beds),
            "criticalFlags": sum(1 for f in unacknowledged if f.severity == "critical"),
            "highFlags": sum(1 for f in unacknowledged if f.severity == "high"),
        },
    }


@router.post("/api/rounds/generate")
async def generate_round_briefs():
    config = get_config()
    beds = generate_briefs_for_ward()

    create_audit_log(AuditLogCreate(
        actor_id=config.current_clinician_id,
        actor_name=config.current_clinician_name,
        actor_role=config.current_clinician_role,
        action="briefs.generated",
        resource_type="ward_round",
        resource_id="ward-4b",
        patient_id=None,
        access_result="granted",
    ))

    beds_data = [
        {
            "bed": b.bed,
            "patientName": b.patient_name,
            "age": b.age,
            "overnightChanges": b.overnight_changes,
            "flagSeverity": b.flag_severity,
        }
        for b in beds
    ]

    llm_result = await generate_ward_round_summary(
        "Ward 4B — General Medicine",
        beds_data,
        api_key_override=config.groq_api_key,
    )

    return {
        "beds": [b.model_dump() for b in beds],
        "summary": llm_result["summary"],
        "model": llm_result["model"],
        "generated": True,
    }
