from fastapi import APIRouter
from controllers.config_controller import get_config, update_config
from models.config import AppConfigUpdate

router = APIRouter()


@router.get("/api/config")
async def get_app_config():
    return {"config": get_config().model_dump()}


@router.put("/api/config")
async def update_app_config(update: AppConfigUpdate):
    config = update_config(update)
    return {"config": config.model_dump()}
