#!/usr/bin/env python3
"""
Skrypt do wypełniania katalogu ćwiczeń bezpośrednio w bazie danych
"""

import sys
import os

# Dodaj ścieżkę do app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.exercise_catalog import ExerciseCatalog
from app.models.user import User
from app.services.auth import get_password_hash

# Ćwiczenia do dodania
EXERCISES = [
    # Klatka piersiowa
    {"name": "Pompki", "description": "Klasyczne pompki. Utrzymuj prostą linię ciała.", "category": "klatka_piersiowa", "difficulty": "średni", "equipment": "Brak"},
    {"name": "Rozpiętki z hantlami", "description": "Rozpiętki na ławce płaskiej z hantlami.", "category": "klatka_piersiowa", "difficulty": "średni", "equipment": "Hantle"},
    {"name": "Wyciskanie sztangi", "description": "Wyciskanie sztangi na ławce płaskiej.", "category": "klatka_piersiowa", "difficulty": "trudny", "equipment": "Sztanga"},
    {"name": "Pompki diamentowe", "description": "Pompki z rękoma w kształcie diamentu. Trudniejsza wersja.", "category": "klatka_piersiowa", "difficulty": "trudny", "equipment": "Brak"},
    {"name": "Wyciskanie hantli", "description": "Wyciskanie hantli na ławce płaskiej.", "category": "klatka_piersiowa", "difficulty": "średni", "equipment": "Hantle"},
    
    # Nogi
    {"name": "Przysiady", "description": "Klasyczne przysiady ze sztangą lub bez.", "category": "nogi", "difficulty": "średni", "equipment": "Brak/Sztanga"},
    {"name": "Wykroki", "description": "Wykroki z hantlami lub bez.", "category": "nogi", "difficulty": "łatwy", "equipment": "Hantle"},
    {"name": "Martwy ciąg", "description": "Martwy ciąg na prostych nogach lub klasyczny.", "category": "nogi", "difficulty": "trudny", "equipment": "Sztanga"},
    {"name": "Wypychanie nóg", "description": "Wypychanie nóg na maszynie.", "category": "nogi", "difficulty": "łatwy", "equipment": "Maszyna"},
    {"name": "Uginanie nóg", "description": "Uginanie nóg w leżeniu na maszynie.", "category": "nogi", "difficulty": "łatwy", "equipment": "Maszyna"},
    {"name": "Wspięcia na palce", "description": "Wspięcia na palce stojąc lub siedząc.", "category": "nogi", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Przysiady bułgarskie", "description": "Przysiady z jedną nogą na ławce.", "category": "nogi", "difficulty": "średni", "equipment": "Hantle"},
    
    # Plecy
    {"name": "Podciąganie", "description": "Podciąganie na drążku. Chwyt szeroki lub wąski.", "category": "plecy", "difficulty": "trudny", "equipment": "Drążek"},
    {"name": "Wiosłowanie sztangą", "description": "Wiosłowanie sztangą w opadzie tułowia.", "category": "plecy", "difficulty": "średni", "equipment": "Sztanga"},
    {"name": "Wiosłowanie hantlem", "description": "Wiosłowanie hantlem na ławce.", "category": "plecy", "difficulty": "łatwy", "equipment": "Hantle"},
    {"name": "Ściąganie drążka", "description": "Ściąganie drążka wyciągu górnego.", "category": "plecy", "difficulty": "łatwy", "equipment": "Wyciąg"},
    {"name": "Martwy ciąg rumuński", "description": "Martwy ciąg na jednej nodze lub obu.", "category": "plecy", "difficulty": "średni", "equipment": "Hantle"},
    {"name": "Superman", "description": "Unoszenie tułowia i nóg w leżeniu na brzuchu.", "category": "plecy", "difficulty": "łatwy", "equipment": "Brak"},
    
    # Brzuch
    {"name": "Deska (planka)", "description": "Statyczne utrzymanie pozycji deski. Prosta linia ciała.", "category": "brzuch", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Brzuszki", "description": "Klasyczne brzuszki z unoszeniem barków. Nie ciągnij za szyję.", "category": "brzuch", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Mountain climbers", "description": "Bieg w pozycji deski. Dynamiczne ćwiczenie na brzuch i kardio.", "category": "brzuch", "difficulty": "średni", "equipment": "Brak"},
    {"name": "Russian twists", "description": "Skręty tułowia z nogami uniesionymi lub na podłodze.", "category": "brzuch", "difficulty": "średni", "equipment": "Brak/Hantle"},
    {"name": "Unoszenie nóg", "description": "Unoszenie prostych nóg w leżeniu.", "category": "brzuch", "difficulty": "średni", "equipment": "Brak"},
    {"name": "Bicycle crunches", "description": "Brzuszki z naprzemiennym przyciąganiem kolan do łokci.", "category": "brzuch", "difficulty": "średni", "equipment": "Brak"},
    {"name": "Dead bug", "description": "Ćwiczenie na stabilizację core z przeciwstawnym ruchem kończyn.", "category": "brzuch", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Hollow body hold", "description": "Statyczne utrzymanie pozycji łódki.", "category": "brzuch", "difficulty": "trudny", "equipment": "Brak"},
    
    # Ramiona
    {"name": "Wyciskanie nad głowę", "description": "Wyciskanie sztangi lub hantli nad głowę.", "category": "ramiona", "difficulty": "średni", "equipment": "Sztanga/Hantle"},
    {"name": "Unoszenie ramion bokiem", "description": "Unoszenie ramion bokiem z hantlami.", "category": "ramiona", "difficulty": "łatwy", "equipment": "Hantle"},
    {"name": "Arnoldki", "description": "Wyciskanie hantli z rotacją. Nazwane od Arnolda Schwarzeneggera.", "category": "ramiona", "difficulty": "średni", "equipment": "Hantle"},
    {"name": "Face pulls", "description": "Przyciąganie liny do twarzy na wyciągu.", "category": "ramiona", "difficulty": "łatwy", "equipment": "Wyciąg"},
    {"name": "Unoszenie ramion w przód", "description": "Unoszenie ramion w przód z hantlami.", "category": "ramiona", "difficulty": "łatwy", "equipment": "Hantle"},
    
    # Biceps
    {"name": "Uginanie ramion ze sztangą", "description": "Klasyczne uginanie ramion ze sztangą prostą lub łamaną.", "category": "biceps", "difficulty": "łatwy", "equipment": "Sztanga"},
    {"name": "Uginanie ramion z hantlami", "description": "Uginanie ramion z hantlami stojąc lub siedząc.", "category": "biceps", "difficulty": "łatwy", "equipment": "Hantle"},
    {"name": "Młotki", "description": "Uginanie ramion z hantlami chwytem młotkowym.", "category": "biceps", "difficulty": "łatwy", "equipment": "Hantle"},
    {"name": "Uginanie na modlitewniku", "description": "Uginanie ramion z oparciem łokci. Izolacja bicepsa.", "category": "biceps", "difficulty": "łatwy", "equipment": "Hantle"},
    
    # Triceps
    {"name": "Pompki na triceps", "description": "Pompki z wąskim rozstawem dłoni. Akcent na triceps.", "category": "triceps", "difficulty": "średni", "equipment": "Brak"},
    {"name": "Wyciskanie francuskie", "description": "Wyciskanie sztangi lub hantli za głowę siedząc.", "category": "triceps", "difficulty": "średni", "equipment": "Sztanga/Hantle"},
    {"name": "Prostowanie ramion na wyciągu", "description": "Prostowanie ramion z linką na wyciągu górnym.", "category": "triceps", "difficulty": "łatwy", "equipment": "Wyciąg"},
    {"name": "Dipy", "description": "Pompki na poręczach lub krzesłach. Akcent na triceps.", "category": "triceps", "difficulty": "średni", "equipment": "Poręcze/Krzesło"},
    {"name": "Wyciskanie wąskie", "description": "Wyciskanie sztangi wąskim chwytem na ławce płaskiej.", "category": "triceps", "difficulty": "średni", "equipment": "Sztanga"},
    
    # Kardio
    {"name": "Burpees", "description": "Dynamiczne ćwiczenie: przysiad, wyrzut nóg, pompka, skok.", "category": "kardio", "difficulty": "trudny", "equipment": "Brak"},
    {"name": "Jumping jacks", "description": "Skoki z rozstawianiem nóg i rąk. Rozgrzewka lub kardio.", "category": "kardio", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "High knees", "description": "Bieg w miejscu z wysokim unoszeniem kolan.", "category": "kardio", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Skakanie na skakance", "description": "Klasyczne skakanie na skakance.", "category": "kardio", "difficulty": "łatwy", "equipment": "Skakanka"},
    {"name": "Bieg w miejscu", "description": "Bieg w miejscu z wysokim unoszeniem kolan.", "category": "kardio", "difficulty": "łatwy", "equipment": "Brak"},
    
    # Rozgrzewka
    {"name": "Krążenia ramion", "description": "Duże krążenia ramion w przód i w tył.", "category": "rozgrzewka", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Skręty tułowia", "description": "Łagodne skręty tułowia w staniu.", "category": "rozgrzewka", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Marsz w miejscu", "description": "Marsz w miejscu z wysokim unoszeniem kolan.", "category": "rozgrzewka", "difficulty": "łatwy", "equipment": "Brak"},
    {"name": "Rotacje kostek", "description": "Krążenia kostkami w jedną i drugą stronę.", "category": "rozgrzewka", "difficulty": "łatwy", "equipment": "Brak"},
]


def seed_exercises():
    db = SessionLocal()
    try:
        print("🚀 Rozpoczynam wypełnianie katalogu ćwiczeń...")
        print(f"Liczba ćwiczeń do dodania: {len(EXERCISES)}")
        print("=" * 50)
        
        added = 0
        skipped = 0
        
        for exercise_data in EXERCISES:
            # Sprawdź czy ćwiczenie już istnieje
            existing = db.query(ExerciseCatalog).filter(
                ExerciseCatalog.name == exercise_data["name"]
            ).first()
            
            if existing:
                print(f"⏭️  Pominięto (już istnieje): {exercise_data['name']}")
                skipped += 1
                continue
            
            # Dodaj nowe ćwiczenie
            new_exercise = ExerciseCatalog(**exercise_data)
            db.add(new_exercise)
            db.commit()
            
            print(f"✅ Dodano: {exercise_data['name']} ({exercise_data['category']})")
            added += 1
        
        print("=" * 50)
        print(f"\n🎉 Zakończono!")
        print(f"   Dodano: {added} ćwiczeń")
        print(f"   Pominięto: {skipped} ćwiczeń")
        print(f"   Razem w bazie: {added + skipped} ćwiczeń")
        
    except Exception as e:
        print(f"\n❌ Błąd: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_exercises()
