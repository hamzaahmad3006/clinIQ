import re
from typing import Any
from pydantic import BaseModel as PydanticBaseModel, ConfigDict, model_validator


def camel_to_snake(name: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def snake_to_camel(name: str) -> str:
    first, *rest = name.split("_")
    return first + "".join(word.capitalize() for word in rest)


class BaseModel(PydanticBaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )

    @model_validator(mode="before")
    @classmethod
    def convert_camel_case_keys(cls, data: Any) -> Any:
        if isinstance(data, dict):
            return {camel_to_snake(k): v for k, v in data.items()}
        return data

    def model_dump(self, **kwargs) -> dict:
        data = super().model_dump(**kwargs)
        return {snake_to_camel(k): v for k, v in data.items()}
