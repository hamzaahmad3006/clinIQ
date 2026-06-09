import os
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


def get_api_key(override_key: Optional[str] = None) -> str:
    return override_key or os.getenv("GROQ_API_KEY", "")


async def generate_patient_brief(
    patient_data: dict,
    api_key_override: Optional[str] = None,
    model_override: Optional[str] = None,
) -> dict:
    api_key = get_api_key(api_key_override)
    if not api_key:
        return {
            "brief": "AI generation unavailable: GROQ_API_KEY not configured.",
            "model": "none",
        }

    prompt = (
        f"You are ClinIQ AI, a clinical summarisation assistant. "
        f"Generate a structured 60-second clinical brief for the following patient. "
        f"Format in clear sections. Do NOT add diagnostic conclusions or treatment recommendations "
        f"— only summarise the provided data.\n\n"
        f"Patient: {patient_data.get('name', 'Unknown')} "
        f"({patient_data.get('age', '?')}y, {patient_data.get('gender', 'Unknown')})\n"
        f"Department: {patient_data.get('department', 'Unknown')}\n\n"
        f"Allergies: {_format_list(patient_data.get('allergies', []), 'name', 'severity', 'reaction')}\n\n"
        f"Active Conditions: {_format_list(patient_data.get('conditions', []), 'name', 'status')}\n\n"
        f"Medications: {_format_meds(patient_data.get('medications', []))}\n\n"
        f"Investigations: {_format_list(patient_data.get('investigations', []), 'name', 'result', 'status')}\n\n"
        f"Generate a brief with sections: SUMMARY, ALLERGIES & ALERTS, "
        f"ACTIVE CONDITIONS, CURRENT MEDICATIONS, RECENT INVESTIGATIONS."
    )

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            res = await client.post(
                GROQ_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": model_override or GROQ_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are ClinIQ AI — a HIPAA-compliant clinical "
                                "summarisation assistant. You only summarise provided "
                                "data. You never add diagnostic conclusions or "
                                "treatment recommendations."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1024,
                },
            )
            if not res.is_success:
                return {"brief": f"AI generation failed: {res.text}", "model": "none"}

            data = res.json()
            return {
                "brief": data["choices"][0]["message"]["content"],
                "model": data["model"],
            }
        except Exception as e:
            return {"brief": f"AI generation error: {str(e)}", "model": "none"}


async def generate_ward_round_summary(
    ward_name: str,
    beds: list[dict],
    api_key_override: Optional[str] = None,
    model_override: Optional[str] = None,
) -> dict:
    api_key = get_api_key(api_key_override)
    if not api_key:
        return {"summary": "AI summary unavailable: GROQ_API_KEY not configured.", "model": "none"}

    beds_text = "\n".join(
        f"{b.get('bed', '?')}: {b.get('patientName', 'Unknown')} "
        f"({b.get('age', '?')}y) — "
        f"Overnight: {', '.join(b.get('overnightChanges', [])) or 'None'} "
        f"— Flags: {b.get('flagSeverity', 'none')}"
        for b in beds
    )

    prompt = (
        f"Summarise the overnight status for {ward_name}:\n\n"
        f"{beds_text}\n\n"
        f"Provide a concise ward round handover summary highlighting "
        f"critical patients, significant overnight changes, and "
        f"recommended review priorities."
    )

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            res = await client.post(
                GROQ_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": model_override or GROQ_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a clinical handover assistant. "
                            "Summarise ward data concisely for shift handover.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 512,
                },
            )
            if not res.is_success:
                return {"summary": f"AI summary failed: {res.text}", "model": "none"}

            data = res.json()
            return {
                "summary": data["choices"][0]["message"]["content"],
                "model": data["model"],
            }
        except Exception as e:
            return {"summary": f"AI summary error: {str(e)}", "model": "none"}


async def test_groq_key(api_key: str) -> bool:
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            res = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            return res.is_success
        except Exception:
            return False


def _format_list(items: list, *keys: str) -> str:
    if not items:
        return "None recorded"
    parts = []
    for item in items:
        vals = [str(item.get(k, "?")) for k in keys]
        parts.append(f"{' ('.join(vals)})" if len(vals) > 1 else vals[0])
    return ", ".join(parts)


def _format_meds(meds: list) -> str:
    if not meds:
        return "None recorded"
    return " | ".join(
        f"{m.get('name', '?')} {m.get('dose', '?')}, "
        f"{m.get('route', '?')}, {m.get('frequency', '?')}"
        for m in meds
    )
