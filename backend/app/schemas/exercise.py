from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExerciseBase(BaseModel):
    name: str
    description: Optional[str] = None
    sets: int = 3
    reps: int = 10
    weight: int = 0
    rest_seconds: int = 60


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[int] = None
    rest_seconds: Optional[int] = None


class ExerciseResponse(ExerciseBase):
    id: int
    training_plan_id: int
    created_at: datetime

    class Config:
        from_attributes = True
