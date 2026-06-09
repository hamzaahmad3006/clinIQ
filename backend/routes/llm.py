import os
from fastapi import APIRouter
from controllers.config_controller import get_config
from llm import test_groq_key

router = APIRouter()


@router.get("/api/llm/test")
async def test_llm():
    config = get_config()
    api_key = config.groq_api_key or os.getenv("GROQ_API_KEY", "")

    if not api_key:
        return {"valid": False, "error": "No API key configured"}

    valid = await test_groq_key(api_key)
    return {"valid": valid, "error": None if valid else "Invalid API key"}
