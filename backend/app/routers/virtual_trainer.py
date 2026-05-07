from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.models.user import User
from app.schemas.virtual_trainer import VirtualTrainerRecommendation
from app.services.virtual_trainer import VirtualTrainerService
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/virtual-trainer", tags=["virtual-trainer"])


@router.get("/recommendation", response_model=VirtualTrainerRecommendation)
def get_recommendation(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pobrać rekomendację od wirtualnego trenera"""
    return VirtualTrainerService.get_recommendation(current_user.id, db)


@router.get("/progress")
def get_progress(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Pobrać analizę postępów"""
    return VirtualTrainerService.analyze_progress(current_user.id, db)
