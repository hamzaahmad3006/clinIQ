from typing import Optional
from .base import BaseModel


class AppConfig(BaseModel):
    data_source: str = "mock"
    fhir_base_url: str = ""
    gp_connect_endpoint: str = ""
    api_key: str = ""
    groq_api_key: str = ""
    current_clinician_id: str = "clin-henderson-001"
    current_clinician_name: str = "Dr. Henderson"
    current_clinician_role: str = "specialist"
    tier3_authorized: bool = False


class AppConfigUpdate(BaseModel):
    data_source: Optional[str] = None
    fhir_base_url: Optional[str] = None
    gp_connect_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    current_clinician_id: Optional[str] = None
    current_clinician_name: Optional[str] = None
    current_clinician_role: Optional[str] = None
    tier3_authorized: Optional[bool] = None
