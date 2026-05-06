from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.training_history import TrainingHistory
from app.schemas.training_history import TrainingHistoryCreate, TrainingHistoryUpdate, TrainingHistoryResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/training-history", tags=["training-history"])


@router.get("/", response_model=List[TrainingHistoryResponse])
def get_training_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Pobrać historię treningów aktualnego użytkownikaя"""
    history = db.query(TrainingHistory).filter(
        TrainingHistory.user_id == current_user.id
    ).order_by(TrainingHistory.date.desc()).offset(skip).limit(limit).all()
    
    return history


@router.post("/", response_model=TrainingHistoryResponse, status_code=status.HTTP_201_CREATED)
def create_training_record(
    record_data: TrainingHistoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Зафиксировать выполненную тренировку"""
    new_record = TrainingHistory(
        user_id=current_user.id,
        training_plan_id=record_data.training_plan_id,
        notes=record_data.notes,
        exercises_data=record_data.exercises_data,
        duration_minutes=record_data.duration_minutes,
        calories_burned=record_data.calories_burned
    )
    
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    return new_record


@router.get("/{record_id}", response_model=TrainingHistoryResponse)
def get_training_record(
    record_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить запись о тренировке по ID"""
    record = db.query(TrainingHistory).filter(
        TrainingHistory.id == record_id,
        TrainingHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found"
        )
    
    return record


@router.put("/{record_id}", response_model=TrainingHistoryResponse)
def update_training_record(
    record_id: int,
    record_data: TrainingHistoryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить запись о тренировке"""
    record = db.query(TrainingHistory).filter(
        TrainingHistory.id == record_id,
        TrainingHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found"
        )
    
    if record_data.notes is not None:
        record.notes = record_data.notes
    if record_data.duration_minutes is not None:
        record.duration_minutes = record_data.duration_minutes
    if record_data.calories_burned is not None:
        record.calories_burned = record_data.calories_burned
    if record_data.exercises_data is not None:
        record.exercises_data = record_data.exercises_data
    if record_data.training_plan_id is not None:
        record.training_plan_id = record_data.training_plan_id
    
    db.commit()
    db.refresh(record)
    
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_record(
    record_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить запись о тренировке"""
    record = db.query(TrainingHistory).filter(
        TrainingHistory.id == record_id,
        TrainingHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found"
        )
    
    db.delete(record)
    db.commit()
    
    return None
