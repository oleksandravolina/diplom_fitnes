# Fitness Virtual Trainer

System wsparcia treningów z wirtualnym trenerem.

## Architektura

```
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── models/    # SQLAlchemy модели
│   │   ├── schemas/   # Pydantic схемы
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Logika biznesowa
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── index.html
│
├── DATABASE_SCHEMA.md # Dokumentacja BD
└── API_DOCUMENTATION.md # Dokumentacja API
```

## Szybki start

### Pierwsze wdrożenie

#### Backend

```bash
cd backend

# Utworzyć środowisko wirtualne
python -m venv .venv

# Aktywować środowisko wirtualne
source .venv/bin/activate  # Linux/Mac
# albo
.venv\Scripts\activate  # Windows

# Zainstalować zależności
pip install -r requirements.txt

# Uruchomić serwer
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Zainstalować zależności
npm install

# Uruchomić serwer developerski
npm run dev
```

---

### Ponowne uruchomienie

#### Backend

```bash
# Z głównego katalogu projektu:
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm run dev
```

---

**Dostęp:**
- API: http://localhost:8000
- Frontend: http://localhost:3000
- Swagger dokumentacja: http://localhost:8000/docs

## Funkcjonalność

### Zarządzanie użytkownikami
Rejestracja i autoryzacja (JWT)
Przechowywanie profilu

### Zarządzanie planami treningowymi
Tworzenie i edycja planów
Dodawanie ćwiczeń do planu z katalogu
Przypisywanie planów do użytkownika

### Katalog ćwiczeń
37 predefiniowanych ćwiczeń
9 kategorii: klatka piersiowa, nogi, plecy, brzuch, barki, biceps, triceps, cardio, rozgrzewka
3 poziomy trudności: łatwy, średni, trudny
Filtrowanie według kategorii, poziomu trudności, nazwy

### Historia treningów
Rejestrowanie wykonanych treningów
Przeglądanie historii ze szczegółami
Edycja wpisów (czas trwania, kalorie, notatki)

### Przypomnienia
Tworzenie harmonogramu treningów
Przypomnienia według dni tygodnia
Wyświetlanie dzisiejszych przypomnień

### Wirtualny trener
Analiza historii treningów
Spersonalizowane rekomendacje
Wiadomości motywacyjne
Określanie typu treningu (lekki/średni/intensywny) na podstawie:
Liczby dni od ostatniego treningu
Liczby treningów w tygodniu

## Technologie

**Backend:**
- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite
- JWT uwierzytelnianie
- bcrypt do hashowania haseł

**Frontend:**
- React 18
- TypeScript
- Material-UI (MUI)
- React Query
- React Router
- date-fns (z polską lokalizacją)
- Vite

## Interfejs

**Język**: Polski (cały interfejs UI, komunikaty API, wirtualny trener)
**Design**: Nowoczesny z gradientami
**Responsywność**: Obsługa urządzeń mobilnych
**Cechy**:
Rozmyty górny pasek (backdrop blur)
Interfejs oparty na kartach
Responsywne tabele (karty na urządzeniach mobilnych)

## Testowanie w Postman

Zaimportuj kolekcję z API_DOCUMENTATION.md
Utwórz Environment ze zmienną base_url = http://localhost:8000
Zarejestruj się przez POST /auth/register
Zautoryzuj się przez POST /auth/login
Zapisz otrzymany token do zmiennej token
Używaj tokenu w nagłówku Authorization: Bearer {{token}}

## Struktura bazy danych

 [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## API Endpoints

С [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Dane początkowe

Przy pierwszym uruchomieniu tworzony jest użytkownik-administrator:
- Email: admin@fittrainer.pl
- Password: admin123

Administrator może dodawać ćwiczenia do katalogu przez API lub skrypt `backend/seed_exercises.py`.
