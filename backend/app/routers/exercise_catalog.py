from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exercise_catalog import ExerciseCatalog
from app.schemas.exercise_catalog import (
    ExerciseCatalogCreate, ExerciseCatalogUpdate, ExerciseCatalogResponse
)
from app.services.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/exercise-catalog", tags=["exercise-catalog"])


@router.get("/", response_model=List[ExerciseCatalogResponse])
def get_exercise_catalog(
    category: Optional[str] = Query(None, description="Filtruj po kategorii"),
    difficulty: Optional[str] = Query(None, description="Filtruj po poziomie trudności"),
    equipment: Optional[str] = Query(None, description="Filtruj po sprzęcie"),
    search: Optional[str] = Query(None, description="Wyszukaj po nazwie"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Pobierz katalog ćwiczeń z opcjonalnym filtrowaniem"""
    query = db.query(ExerciseCatalog)
    
    if category:
        query = query.filter(ExerciseCatalog.category == category)
    
    if difficulty:
        query = query.filter(ExerciseCatalog.difficulty == difficulty)
    
    if equipment:
        query = query.filter(ExerciseCatalog.equipment == equipment)
    
    if search:
        query = query.filter(ExerciseCatalog.name.ilike(f"%{search}%"))
    
    exercises = query.order_by(ExerciseCatalog.category, ExerciseCatalog.name).all()
    return exercises


@router.get("/categories", response_model=List[str])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Pobierz wszystkie dostępne kategorie"""
    categories = db.query(ExerciseCatalog.category).distinct().all()
    return [cat[0] for cat in categories]


@router.get("/{exercise_id}", response_model=ExerciseCatalogResponse)
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Pobierz szczegóły ćwiczenia"""
    exercise = db.query(ExerciseCatalog).filter(ExerciseCatalog.id == exercise_id).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ćwiczenie nie znalezione"
        )
    
    return exercise


@router.post("/", response_model=ExerciseCatalogResponse, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise_data: ExerciseCatalogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Dodaj nowe ćwiczenie do katalogu"""
    # Sprawdź czy ćwiczenie o tej nazwie już istnieje
    existing = db.query(ExerciseCatalog).filter(
        ExerciseCatalog.name.ilike(exercise_data.name)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ćwiczenie o tej nazwie już istnieje"
        )
    
    new_exercise = ExerciseCatalog(**exercise_data.dict())
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)
    
    return new_exercise


@router.put("/{exercise_id}", response_model=ExerciseCatalogResponse)
def update_exercise(
    exercise_id: int,
    exercise_data: ExerciseCatalogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Zaktualizuj ćwiczenie"""
    exercise = db.query(ExerciseCatalog).filter(ExerciseCatalog.id == exercise_id).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ćwiczenie nie znalezione"
        )
    
    update_data = exercise_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    db.commit()
    db.refresh(exercise)
    
    return exercise


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Usuń ćwiczenie z katalogu"""
    exercise = db.query(ExerciseCatalog).filter(ExerciseCatalog.id == exercise_id).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ćwiczenie nie znalezione"
        )
    
    db.delete(exercise)
    db.commit()
    
    return None
