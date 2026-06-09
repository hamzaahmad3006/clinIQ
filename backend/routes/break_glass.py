from fastapi import APIRouter, Request, HTTPException
from controllers.break_glass_controller import create_break_glass_event
from controllers.patient_controller import get_patient_by_id
from controllers.config_controller import get_config
from middleware.auth import get_current_clinician
from models.break_glass import BreakGlassCreate

router = APIRouter()


@router.post("/api/break-glass", status_code=201)
async def break_glass(body: BreakGlassCreate, request: Request):
    if not body.justification or len(body.justification) < 20:
        raise HTTPException(
            status_code=400,
            detail="Justification must be at least 20 characters",
        )

    patient = get_patient_by_id(body.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    config = get_config()
    clinician = get_current_clinician(request)

    result = create_break_glass_event(
        clinician["id"],
        clinician["name"],
        body.patient_id,
        patient.name,
        body.justification,
    )

    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=429, detail=result["error"])

    return {"event": result.model_dump(), "patientName": patient.name}
