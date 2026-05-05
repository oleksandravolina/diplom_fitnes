from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Integer as SqlInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    sets = Column(SqlInteger, default=3)
    reps = Column(SqlInteger, default=10)
    weight = Column(SqlInteger, default=0)  # в кг, 0 = вес тела
    rest_seconds = Column(SqlInteger, default=60)
    training_plan_id = Column(Integer, ForeignKey("training_plans.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    training_plan = relationship("TrainingPlan", back_populates="exercises")
