from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class ExerciseCatalog(Base):
    __tablename__ = "exercise_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(50), nullable=False)  # np. "klatka_piersiowa", "nogi", "plecy", "brzuch", "ramiona", "kardio"
    difficulty = Column(String(20), nullable=False)  # "latwy", "sredni", "trudny"
    equipment = Column(String(100), nullable=True)  # np. "brak", "hantle", "sztanga", "maszyna"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
