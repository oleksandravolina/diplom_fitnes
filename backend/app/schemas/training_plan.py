from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .exercise import ExerciseResponse


class TrainingPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class TrainingPlanCreate(TrainingPlanBase):
    pass


class TrainingPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TrainingPlanResponse(TrainingPlanBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    exercises: List[ExerciseResponse] = []

    class Config:
        from_attributes = True
