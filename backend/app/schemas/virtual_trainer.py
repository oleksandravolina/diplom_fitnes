from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class VirtualTrainerRecommendation(BaseModel):
    message: str
    motivation: str
    suggested_exercises: List[Dict[str, Any]]
    workout_type: str  # "light", "moderate", "intense"
    reason: str
