from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal
from app.routers import auth, users, training_plans, exercises, training_history, reminders, virtual_trainer, exercise_catalog
from app.services.auth import get_password_hash


# Tworzymy tabele i administratora przy starcie
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    # Tworzymy administratora, jeśli go nie ma
    db = SessionLocal()
    try:
        from app.models.user import User
        admin = db.query(User).filter(User.email == "admin@fittrainer.pl").first()
        if not admin:
            admin = User(
                name="Admin",
                email="admin@fittrainer.pl",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin)
            db.commit()
            print("Admin user created: admin@fittrainer.pl / admin123")
    finally:
        db.close()
    
    yield


app = FastAPI(
    title="Fitness Virtual Trainer API",
    description="API dla systemu wsparcia treningów z wirtualnym trenerem",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware CORS do pracy z frontendem
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Podłączamy routery
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(training_plans.router)
app.include_router(exercises.router)
app.include_router(training_history.router)
app.include_router(reminders.router)
app.include_router(virtual_trainer.router)
app.include_router(exercise_catalog.router)


@app.get("/")
def root():
    return {
        "message": "Fitness Virtual Trainer API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
