from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExerciseCatalogBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    difficulty: str
    equipment: Optional[str] = "brak"


class ExerciseCatalogCreate(ExerciseCatalogBase):
    pass


class ExerciseCatalogUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    equipment: Optional[str] = None


class ExerciseCatalogResponse(ExerciseCatalogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
