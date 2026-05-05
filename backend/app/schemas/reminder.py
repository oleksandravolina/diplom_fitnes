from pydantic import BaseModel, Field
from datetime import datetime, time
from typing import Optional


class ReminderBase(BaseModel):
    title: str
    message: Optional[str] = None
    day_of_week: int = Field(..., ge=0, le=6, description="0=Пн, 1=Вт, ..., 6=Вс")
    reminder_time: time
    is_active: bool = True


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    reminder_time: Optional[time] = None
    is_active: Optional[bool] = None


class ReminderResponse(ReminderBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
