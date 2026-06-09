import os
from database import supabase
from models.config import AppConfig, AppConfigUpdate

CONFIG_ID = 1


def get_config() -> AppConfig:
    result = supabase.table("app_config").select("*").eq("id", CONFIG_ID).execute()
    if result.data:
        row = result.data[0]
        return AppConfig(
            data_source=row.get("data_source", "mock"),
            fhir_base_url=row.get("fhir_base_url", ""),
            gp_connect_endpoint=row.get("gp_connect_endpoint", ""),
            api_key=row.get("api_key", ""),
            groq_api_key=row.get("groq_api_key", "") or os.getenv("GROQ_API_KEY", ""),
            current_clinician_id=row.get("current_clinician_id", "clin-henderson-001"),
            current_clinician_name=row.get("current_clinician_name", "Dr. Henderson"),
            current_clinician_role=row.get("current_clinician_role", "specialist"),
            tier3_authorized=row.get("tier3_authorized", False),
        )
    return AppConfig(groq_api_key=os.getenv("GROQ_API_KEY", ""))


def update_config(update: AppConfigUpdate) -> AppConfig:
    updates = update.model_dump(exclude_none=True)
    if updates:
        supabase.table("app_config").update(updates).eq("id", CONFIG_ID).execute()
    return get_config()
