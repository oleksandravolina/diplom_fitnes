from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.training_plan import TrainingPlan
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, ExerciseResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/training-plans/{plan_id}/exercises", tags=["exercises"])


def check_plan_ownership(plan_id: int, user_id: int, db: Session):
    """Sprawdzić, czy plan należy do użytkownika"""
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == user_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found"
        )
    return plan


@router.get("/", response_model=List[ExerciseResponse])
def get_exercises(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać wszystkie ćwiczenia planu"""
    check_plan_ownership(plan_id, current_user.id, db)
    
    exercises = db.query(Exercise).filter(Exercise.training_plan_id == plan_id).all()
    return exercises


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    plan_id: int,
    exercise_data: ExerciseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Dodać ćwiczenie do planu"""
    check_plan_ownership(plan_id, current_user.id, db)
    
    new_exercise = Exercise(
        name=exercise_data.name,
        description=exercise_data.description,
        sets=exercise_data.sets,
        reps=exercise_data.reps,
        weight=exercise_data.weight,
        rest_seconds=exercise_data.rest_seconds,
        training_plan_id=plan_id
    )
    
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)
    
    return new_exercise


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    plan_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać ćwiczenie po ID"""
    check_plan_ownership(plan_id, current_user.id, db)
    
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.training_plan_id == plan_id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    return exercise


@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    plan_id: int,
    exercise_id: int,
    exercise_data: ExerciseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Zaktualizować ćwiczenie"""
    check_plan_ownership(plan_id, current_user.id, db)
    
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.training_plan_id == plan_id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    update_data = exercise_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    db.commit()
    db.refresh(exercise)
    
    return exercise


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    plan_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Usunąć ćwiczenie"""
    check_plan_ownership(plan_id, current_user.id, db)
    
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.training_plan_id == plan_id
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    db.delete(exercise)
    db.commit()
    
    return None
