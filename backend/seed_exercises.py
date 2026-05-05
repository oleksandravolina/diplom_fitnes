"""
Skrypt do wypełnienia katalogu ćwiczeń przykładowymi danymi.
Uruchom: python seed_exercises.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

# Dane logowania (zmień jeśli masz inne)
LOGIN_DATA = {
    "username": "test6@example.com",
    "password": "password123"
}

# Katalog ćwiczeń do dodania
EXERCISES = [
    # Klatka piersiowa
    {
        "name": "Pompki",
        "description": "Klasyczne pompki z podłogi. Utrzymuj prostą linię ciała.",
        "category": "klatka_piersiowa",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    {
        "name": "Pompki na poręczach",
        "description": "Pompki z użyciem poręczy lub krzeseł. Większy zakres ruchu.",
        "category": "klatka_piersiowa",
        "difficulty": "trudny",
        "equipment": "brak"
    },
    {
        "name": "Wyciskanie hantli",
        "description": "Wyciskanie hantli leżąc na ławce. Kontroluj ruch w górę i w dół.",
        "category": "klatka_piersiowa",
        "difficulty": "sredni",
        "equipment": "hantle"
    },
    {
        "name": "Rozpiętki z hantlami",
        "description": "Rozpiętki leżąc na ławce. Ściągnij łopatki i kontroluj ruch.",
        "category": "klatka_piersiowa",
        "difficulty": "latwy",
        "equipment": "hantle"
    },
    
    # Nogi
    {
        "name": "Przysiady",
        "description": "Klasyczne przysiady ze sztangą lub bez. Kolana w linii ze stopami.",
        "category": "nogi",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    {
        "name": "Przysiady bułgarskie",
        "description": "Przysiady z jedną nogą na ławce za sobą. Doskonałe dla równowagi.",
        "category": "nogi",
        "difficulty": "trudny",
        "equipment": "brak"
    },
    {
        "name": "Wykroki",
        "description": "Wykroki do przodu z hantlami. Utrzymuj proste plecy.",
        "category": "nogi",
        "difficulty": "latwy",
        "equipment": "hantle"
    },
    {
        "name": "Martwy ciąg",
        "description": "Martwy ciąg klasyczny. Prowadź sztangę blisko nóg.",
        "category": "nogi",
        "difficulty": "trudny",
        "equipment": "sztanga"
    },
    {
        "name": "Wspięcia na palce",
        "description": "Wspięcia na palce stojąc. Można wykonywać na podwyższeniu.",
        "category": "nogi",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    
    # Plecy
    {
        "name": "Podciąganie na drążku",
        "description": "Podciąganie nachwytem na drążku. Pełny zakres ruchu.",
        "category": "plecy",
        "difficulty": "trudny",
        "equipment": "brak"
    },
    {
        "name": "Wiosłowanie hantlem",
        "description": "Wiosłowanie w opadzie z hantlem. Prowadź łokieć wzdłuż ciała.",
        "category": "plecy",
        "difficulty": "sredni",
        "equipment": "hantle"
    },
    {
        "name": "Ściąganie drążka wyciągu",
        "description": "Ściąganie drążka wyciągu górnego do klatki.",
        "category": "plecy",
        "difficulty": "latwy",
        "equipment": "maszyna"
    },
    {
        "name": "Superman",
        "description": "Unoszenie rąk i nóg leżąc na brzuchu. Wzmacnia dolne plecy.",
        "category": "plecy",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    
    # Brzuch
    {
        "name": "Deska (planka)",
        "description": "Statyczne utrzymanie pozycji deski. Prosta linia ciała.",
        "category": "brzuch",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    {
        "name": "Brzuszki",
        "description": "Klasyczne brzuszki z unoszeniem barków. Nie ciągnij szyi.",
        "category": "brzuch",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Unoszenie nóg w leżeniu",
        "description": "Unoszenie prostych nóg leżąc na plecach. Wzmacnia dolny brzuch.",
        "category": "brzuch",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    {
        "name": "Mountain climbers",
        "description": "Bieg w pozycji deski. Dynamiczne ćwiczenie na brzuch i kardio.",
        "category": "brzuch",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    {
        "name": "Russian twists",
        "description": "Skręty tułowia z nogami uniesionymi. Można dodać ciężar.",
        "category": "brzuch",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    
    # Ramiona
    {
        "name": "Wyciskanie nad głowę",
        "description": "Wyciskanie hantli lub sztangi nad głowę stojąc lub siedząc.",
        "category": "ramiona",
        "difficulty": "sredni",
        "equipment": "hantle"
    },
    {
        "name": "Unoszenie ramion bokiem",
        "description": "Unoszenie hantli bokiem do wysokości ramion.",
        "category": "ramiona",
        "difficulty": "latwy",
        "equipment": "hantle"
    },
    {
        "name": "Arnoldki",
        "description": "Wyciskanie hantli z rotacją. Nazwane od Arnolda Schwarzeneggera.",
        "category": "ramiona",
        "difficulty": "sredni",
        "equipment": "hantle"
    },
    
    # Biceps
    {
        "name": "Uginanie ramion z hantlami",
        "description": "Klasyczne uginanie ramion z hantlami stojąc.",
        "category": "biceps",
        "difficulty": "latwy",
        "equipment": "hantle"
    },
    {
        "name": "Młotki",
        "description": "Uginanie ramion chwytem młotkowym. Pracuje biceps i przedramię.",
        "category": "biceps",
        "difficulty": "latwy",
        "equipment": "hantle"
    },
    {
        "name": "Uginanie ramion na modlitewniku",
        "description": "Uginanie ramion z oparciem łokci. Izolacja bicepsa.",
        "category": "biceps",
        "difficulty": "latwy",
        "equipment": "hantle"
    },
    
    # Triceps
    {
        "name": "Pompki na triceps",
        "description": "Pompki z wąskim rozstawem dłoni. Akcent na triceps.",
        "category": "triceps",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    {
        "name": "Wyciskanie francuskie",
        "description": "Wyciskanie hantli lub sztangi nad głowę leżąc.",
        "category": "triceps",
        "difficulty": "sredni",
        "equipment": "hantle"
    },
    {
        "name": "Pompki w oparciu o ławkę",
        "description": "Pompki z oparciem rąk o ławkę za plecami.",
        "category": "triceps",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    
    # Kardio
    {
        "name": "Bieg w miejscu",
        "description": "Bieg z unoszeniem kolan wysoko. Dynamiczne ćwiczenie.",
        "category": "kardio",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Skakanie na skakance",
        "description": "Klasyczne skakanie na skakance. Doskonałe kardio.",
        "category": "kardio",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Burpees",
        "description": "Połączenie pompki, wyskoku i przysiadu. Intensywne ćwiczenie.",
        "category": "kardio",
        "difficulty": "trudny",
        "equipment": "brak"
    },
    {
        "name": "Jumping jacks",
        "description": "Skakanie z rozstawianiem nóg i rąk. Rozgrzewka lub kardio.",
        "category": "kardio",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Wyskoki na skrzynię",
        "description": "Wyskoki na podwyższenie. Wzmacnia nogi i poprawia eksplozywność.",
        "category": "kardio",
        "difficulty": "sredni",
        "equipment": "brak"
    },
    
    # Rozgrzewka
    {
        "name": "Skłony tułowia",
        "description": "Skłony tułowia w przód, dotykając palców stóp.",
        "category": "rozgrzewka",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Krążenia ramion",
        "description": "Duże krążenia ramion do przodu i do tyłu. Rozgrzewka barków.",
        "category": "rozgrzewka",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Krążenia biodrami",
        "description": "Krążenia biodrami w jedną i drugą stronę.",
        "category": "rozgrzewka",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Podskoki",
        "description": "Lekkie podskoki na palcach. Rozgrzewka łydek.",
        "category": "rozgrzewka",
        "difficulty": "latwy",
        "equipment": "brak"
    },
    {
        "name": "Rotacje tułowia",
        "description": "Skręty tułowia z wyprostowanymi ramionami. Rozgrzewka kręgosłupa.",
        "category": "rozgrzewka",
        "difficulty": "latwy",
        "equipment": "brak"
    },
]


def get_token():
    """Pobierz token JWT logując się"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data=LOGIN_DATA,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"Błąd logowania: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Błąd połączenia: {e}")
        return None


def seed_exercises():
    """Dodaj ćwiczenia do katalogu"""
    token = get_token()
    if not token:
        print("Nie udało się zalogować. Sprawdź dane logowania.")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    added = 0
    skipped = 0
    
    for exercise in EXERCISES:
        try:
            response = requests.post(
                f"{BASE_URL}/exercise-catalog/",
                json=exercise,
                headers=headers
            )
            
            if response.status_code == 201:
                print(f"✅ Dodano: {exercise['name']}")
                added += 1
            elif response.status_code == 400 and "już istnieje" in response.text:
                print(f"⏭️  Pominięto (już istnieje): {exercise['name']}")
                skipped += 1
            else:
                print(f"❌ Błąd dodawania {exercise['name']}: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Błąd: {e}")
    
    print(f"\n{'='*50}")
    print(f"Dodano: {added} ćwiczeń")
    print(f"Pominięto: {skipped} ćwiczeń (już istniały)")
    print(f"Razem: {added + skipped}")


if __name__ == "__main__":
    print("🚀 Rozpoczynam wypełnianie katalogu ćwiczeń...")
    print(f"Łączę się z: {BASE_URL}")
    print("="*50)
    seed_exercises()
