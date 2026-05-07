from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/", response_model=List[ReminderResponse])
def get_reminders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    active_only: bool = False
):
    """Pobrać przypomnienia aktualnego użytkownika"""
    query = db.query(Reminder).filter(Reminder.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Reminder.is_active == True)
    
    reminders = query.all()
    return reminders


@router.get("/today", response_model=List[ReminderResponse])
def get_today_reminders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać przypomnienia na dziś"""
    today = datetime.now().weekday()  # 0=Пн, 6=Вс
    
    reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.day_of_week == today,
        Reminder.is_active == True
    ).all()
    
    return reminders


@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_data: ReminderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Utworzyć przypomnienie"""
    new_reminder = Reminder(
        user_id=current_user.id,
        title=reminder_data.title,
        message=reminder_data.message,
        day_of_week=reminder_data.day_of_week,
        reminder_time=reminder_data.reminder_time,
        is_active=reminder_data.is_active
    )
    
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    
    return new_reminder


@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać przypomnienie po ID"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    return reminder


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить напоминание"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    update_data = reminder_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reminder, field, value)
    
    db.commit()
    db.refresh(reminder)
    
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Usunąć przypomnienie"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    db.delete(reminder)
    db.commit()
    
    return None
