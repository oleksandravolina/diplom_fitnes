from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TrainingHistory(Base):
    __tablename__ = "training_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    training_plan_id = Column(Integer, ForeignKey("training_plans.id"), nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String(500), nullable=True)
    # Przechowujemy wykonane ćwiczenia w formacie JSON
    # [{"exercise_id": 1, "name": "Отжимания", "sets": 3, "reps": 10, "weight": 0}]
    exercises_data = Column(JSON, nullable=False)
    duration_minutes = Column(Integer, default=0)
    calories_burned = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="training_history")
