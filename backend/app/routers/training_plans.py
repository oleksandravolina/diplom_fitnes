from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.training_plan import TrainingPlan
from app.schemas.training_plan import TrainingPlanCreate, TrainingPlanUpdate, TrainingPlanResponse
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/training-plans", tags=["training-plans"])


@router.get("/", response_model=List[TrainingPlanResponse])
def get_training_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać wszystkie plany treningowe aktualnego użytkownika"""
    plans = db.query(TrainingPlan).filter(TrainingPlan.user_id == current_user.id).all()
    return plans


@router.post("/", response_model=TrainingPlanResponse, status_code=status.HTTP_201_CREATED)
def create_training_plan(
    plan_data: TrainingPlanCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Utworzyć nowy plan treningowy"""
    new_plan = TrainingPlan(
        name=plan_data.name,
        description=plan_data.description,
        is_active=plan_data.is_active,
        user_id=current_user.id
    )
    
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    return new_plan


@router.get("/{plan_id}", response_model=TrainingPlanResponse)
def get_training_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać plan treningowy po ID"""
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found"
        )
    
    return plan


@router.put("/{plan_id}", response_model=TrainingPlanResponse)
def update_training_plan(
    plan_id: int,
    plan_data: TrainingPlanUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Zaktualizować plan treningowy"""
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found"
        )
    
    # Aktualizujemy tylko przekazane pola
    update_data = plan_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Usunąć plan treningowy"""
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.id == plan_id,
        TrainingPlan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training plan not found"
        )
    
    db.delete(plan)
    db.commit()
    
    return None
