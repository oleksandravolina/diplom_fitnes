from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class ExerciseData(BaseModel):
    exercise_id: int
    name: str
    sets: int
    reps: int
    weight: int


class TrainingHistoryBase(BaseModel):
    notes: Optional[str] = None
    exercises_data: List[Dict[str, Any]]
    duration_minutes: int = 0
    calories_burned: int = 0


class TrainingHistoryCreate(TrainingHistoryBase):
    training_plan_id: Optional[int] = None


class TrainingHistoryUpdate(BaseModel):
    notes: Optional[str] = None
    exercises_data: Optional[List[Dict[str, Any]]] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[int] = None
    training_plan_id: Optional[int] = None


class TrainingHistoryResponse(TrainingHistoryBase):
    id: int
    user_id: int
    training_plan_id: Optional[int] = None
    date: datetime

    class Config:
        from_attributes = True
