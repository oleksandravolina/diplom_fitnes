from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.training_history import TrainingHistory
from app.models.exercise import Exercise
from app.schemas.virtual_trainer import VirtualTrainerRecommendation


class VirtualTrainerService:
    """Serwis wirtualnego trenera do analizy i rekomendacji"""
    
    MOTIVATIONAL_MESSAGES = {
        "missed_3_days": [
            "Odpoczywałeś 3 dni - czas wracać! Zacznij od lekkiego treningu.",
            "Przerwa była przydatna, ale teraz naprzód! Lekka rozgrzewka czeka na ciebie.",
            "Odpoczynek to część treningu. Dziś wracamy do formy płynnie!",
        ],
        "missed_week": [
            "Cały tydzień bez treningów? Nic strasznego! Dziś zaczynamy od nowa 💪",
            "Powrót bohatera! Zacznij od prostego i stopniowo zwiększaj tempo.",
        ],
        "consistent": [
            "Świetna seria treningów! Kontynuuj w tym samym duchu! 🔥",
            "Jesteś prawdziwym mistrzem! Zróbmy dziś kolejny krok do celu!",
            "Twoja dyscyplina imponuje! Gotowy na nowy rekord?",
        ],
        "beginner": [
            "Każda wielka podróż zaczyna się od pierwszego kroku! 🌟",
            "Podjąłeś właściwą decyzję, zaczynając trenować!",
            "Dziś jesteś silniejszy niż wczoraj. Zacznijmy trening!",
        ],
    }
    
    LIGHT_EXERCISES = [
        {"name": "Rozgrzewka (5 min)", "sets": 1, "reps": 1, "weight": 0},
        {"name": "Marsz w miejscu", "sets": 3, "reps": 60, "weight": 0},
        {"name": "Pochylenia do przodu", "sets": 2, "reps": 10, "weight": 0},
        {"name": "Obracanie ramionami", "sets": 2, "reps": 10, "weight": 0},
        {"name": "Mostek", "sets": 2, "reps": 10, "weight": 0},
    ]
    
    MODERATE_EXERCISES = [
        {"name": "Pompki", "sets": 3, "reps": 10, "weight": 0},
        {"name": "Przysiady", "sets": 3, "reps": 15, "weight": 0},
        {"name": "Deska", "sets": 3, "reps": 30, "weight": 0},
        {"name": "Wykroki", "sets": 3, "reps": 10, "weight": 0},
        {"name": "Unoszenie nóg", "sets": 3, "reps": 15, "weight": 0},
    ]
    
    INTENSE_EXERCISES = [
        {"name": "Burpees", "sets": 4, "reps": 10, "weight": 0},
        {"name": "Pompki z klaskaniem", "sets": 3, "reps": 8, "weight": 0},
        {"name": "Przysiady z podskokiem", "sets": 4, "reps": 15, "weight": 0},
        {"name": "Wspinaczka", "sets": 4, "reps": 20, "weight": 0},
        {"name": "Deska z unoszeniem rąk", "sets": 3, "reps": 10, "weight": 0},
    ]
    
    @classmethod
    def get_recommendation(cls, user_id: int, db: Session) -> VirtualTrainerRecommendation:
        """Otrzymaj rekomendację od wirtualnego trenera"""
        
        # Pobieramy historię treningów użytkownika
        last_workout = db.query(TrainingHistory).filter(
            TrainingHistory.user_id == user_id
        ).order_by(TrainingHistory.date.desc()).first()
        
        # Pobieramy liczbę treningów z ostatnich 7 dni
        week_ago = datetime.utcnow() - timedelta(days=7)
        workouts_this_week = db.query(TrainingHistory).filter(
            TrainingHistory.user_id == user_id,
            TrainingHistory.date >= week_ago
        ).count()
        
        # Określamy dni od ostatniego treningu
        days_since_last = None
        if last_workout:
            days_since_last = (datetime.utcnow() - last_workout.date).days
        
        # Logika rekomendacji
        if last_workout is None:
            # Nowy użytkownik
            return VirtualTrainerRecommendation(
                message="Witaj! Zacznijmy twoją podróż do zdrowego stylu życia.",
                motivation=cls._get_random_message("beginner"),
                suggested_exercises=cls.LIGHT_EXERCISES[:3],
                workout_type="light",
                reason="Pierwszy trening - zacznijmy od prostego!"
            )
        
        elif days_since_last > 7:
            # Pominięty tydzień lub więcej
            return VirtualTrainerRecommendation(
                message=f"Nie trenowałeś od {days_since_last} dni. Czas wracać!",
                motivation=cls._get_random_message("missed_week"),
                suggested_exercises=cls.LIGHT_EXERCISES,
                workout_type="light",
                reason="Długa przerwa - odbudowujemy formę stopniowo"
            )
        
        elif days_since_last > 3:
            # Pominięte 3+ dni
            return VirtualTrainerRecommendation(
                message=f"Minęły {days_since_last} dni od ostatniego treningu.",
                motivation=cls._get_random_message("missed_3_days"),
                suggested_exercises=cls.LIGHT_EXERCISES[:4],
                workout_type="light",
                reason="Krótka przerwa - lekki trening na powrót"
            )
        
        elif workouts_this_week >= 4:
            # Aktywny użytkownik
            return VirtualTrainerRecommendation(
                message=f"Świetnie! Trenowałeś {workouts_this_week} razy w tym tygodniu!",
                motivation=cls._get_random_message("consistent"),
                suggested_exercises=cls.INTENSE_EXERCISES,
                workout_type="intense",
                reason="Jesteś w świetnej formie - utrudnijmy!"
            )
        
        else:
            # Zwykły tryb
            return VirtualTrainerRecommendation(
                message=f"Kontynuujemy pracę! Treningów w tym tygodniu: {workouts_this_week}",
                motivation=cls._get_random_message("consistent"),
                suggested_exercises=cls.MODERATE_EXERCISES,
                workout_type="moderate",
                reason="Stabilny postęp - utrzymujemy tempo"
            )
    
    @classmethod
    def _get_random_message(cls, category: str) -> str:
        """Pobierz losowy motywacyjny komunikat z kategorii"""
        import random
        messages = cls.MOTIVATIONAL_MESSAGES.get(category, ["Zacznijmy trening!"])
        return random.choice(messages)
    
    @classmethod
    def analyze_progress(cls, user_id: int, db: Session) -> Dict[str, Any]:
        """Analiza postępów użytkownika"""
        
        # Całkowita liczba treningów
        total_workouts = db.query(TrainingHistory).filter(
            TrainingHistory.user_id == user_id
        ).count()
        
        # Treningi w ostatnim miesiącu
        month_ago = datetime.utcnow() - timedelta(days=30)
        workouts_this_month = db.query(TrainingHistory).filter(
            TrainingHistory.user_id == user_id,
            TrainingHistory.date >= month_ago
        ).count()
        
        # Całkowity czas treningów
        total_duration = db.query(func.sum(TrainingHistory.duration_minutes)).filter(
            TrainingHistory.user_id == user_id
        ).scalar() or 0
        
        # Średni czas trwania
        avg_duration = 0
        if total_workouts > 0:
            avg_duration = total_duration / total_workouts
        
        return {
            "total_workouts": total_workouts,
            "workouts_this_month": workouts_this_month,
            "total_duration_minutes": total_duration,
            "average_duration_minutes": round(avg_duration, 1),
        }
