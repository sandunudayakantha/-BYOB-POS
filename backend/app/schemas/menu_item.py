from pydantic import BaseModel, ConfigDict, Field, model_validator

class MenuItemReorderItem(BaseModel):
    id: int
    sort_order: int = Field(default=0, ge=0)

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data

class MenuItemReorderRequest(BaseModel):
    items: list[MenuItemReorderItem] = []
