# Struktura bazy danych

## Przegląd

Baza danych systemu wsparcia treningów z wirtualnym trenerem wykorzystuje model relacyjny oparty na SQLAlchemy ORM

## Tabele

### 1. Users (Użytkownicy)

Przechowuje informacje o zarejestrowanych użytkownikach.

| Pole | Typ | Opis |
|------|-----|----------|
| id | Integer (PK) | Unikalny identyfikator |
| name | String(100) | Imię użytkownika |
| email | String(100), Unique | Email  |
| hashed_password | String(255) | Zahaszowane hasło (bcrypt) |
| created_at | DateTime | Data utworzenia |
| updated_at | DateTime | Data ostatniej aktualizacji |

**Relacje:**
- `training_plans` → One-to-Many → TrainingPlans
- `training_history` → One-to-Many → TrainingHistory
- `reminders` → One-to-Many → Reminders

---

### 2. TrainingPlans (Data ostatniej aktualizacji)

Przechowuje plany treningowe użytkowników.

| Pole | Typ | Opis |
|------|-----|----------|
| id | Integer (PK) | Unikalny identyfikator |
| name | String(100) | Nazwa planu |
| description | String(500) | Opis planu |
| user_id | Integer (FK) | ID użytkownika-właściciela |
| is_active | Boolean | Czy plan jest aktywny |
| created_at | DateTime | Data utworzenia |
| updated_at | DateTime | Data aktualizacji |

**Relacje:**
- `user` → Many-to-One → Users
- `exercises` → One-to-Many → Exercises

---

### 3. Exercises (Ćwiczenia)

Przechowuje ćwiczenia wchodzące w skład planów treningowych.

| Pole | Typ | Opis |
|------|-----|----------|
| id | Integer (PK) | Unikalny identyfikator |
| name | String(100) | Nazwa ćwiczenia |
| description | String(500) | Opis techniki |
| sets | Integer | Liczba serii |
| reps | Integer | Liczba powtórzeń |
| weight | Integer | Waga w kg (0 = masa ciała) |
| rest_seconds | Integer | Odpoczynek między seriami w sekundach |
| training_plan_id | Integer (FK) | ID planu treningowego |
| created_at | DateTime | Data utworzenia |

**Relacje:**
- `training_plan` → Many-to-One → TrainingPlans

---

### 4. TrainingHistory (Historia treningów)

Przechowuje wpisy o wykonanych treningach.

| Pole | Typ | Opis |
|------|-----|----------|
| id | Integer (PK) | Unikalny identyfikator |
| user_id | Integer (FK) | ID użytkownika |
| training_plan_id | Integer (FK, nullable) | ID planu (może być null) |
| date | DateTime | Data i godzina treningu |
| notes | String(500) | Notatki o treningu |
| exercises_data | JSON | Dane o wykonanych ćwiczeniach |
| duration_minutes | Integer | Czas trwania w minutach |
| calories_burned | Integer | Spalone kalorie |

**Relacje:**
- `user` → Many-to-One → Users

**Format exercises_data:**
```json
[
  {
    "exercise_id": 1,
    "name": "Pompki",
    "sets": 3,
    "reps": 10,
    "weight": 0
  }
]
```

---

### 5. Reminders (Przypomnienia)

Przechowuje harmonogram przypomnień o treningach.

| Pole | Typ | Opis |
|------|-----|----------|
| id | Integer (PK) | Unikalny identyfikator |
| user_id | Integer (FK) | ID użytkownika |
| title | String(100) | Tytuł przypomnienia |
| message | String(500) | Tytuł przypomnienia |
| day_of_week | Integer | Dzień tygodnia (0=Pon, 6=Nd) |
| reminder_time | Time | Godzina przypomnienia |
| is_active | Boolean | Czy przypomnienie jest aktywne |
| created_at | DateTime | Data utworzenia |

**Relacje:**
- `user` → Many-to-One → Users

---

### 6. ExerciseCatalog (Katalog ćwiczeń)

Przechowuje predefiniowane ćwiczenia dostępne do dodania do planów.

| Pole | Typ | Opis |
|------|-----|----------|
| id | Integer (PK) | Unikalny identyfikator |
| name | String(100) | Nazwa ćwiczenia |
| description | String(500) | Opis techniki |
| category | String(50) | Kategoria (klatka_piersiowa, nogi, plecy, brzuch, ramiona, biceps, triceps, kardio, rozgrzewka) |
| difficulty | String(20) | Poziom trudności (łatwy, średni, trudny) |
| equipment | String(100) | Wymagany sprzęt |
| created_at | DateTime | Data utworzenia |

**Kategorie:**
- `klatka_piersiowa` - Klatka piersiowa
- `nogi` - Nogi
- `plecy` - Plecy
- `brzuch` - Brzuch
- `ramiona` - Barki
- `biceps` - Biceps
- `triceps` - Triceps
- `kardio` - Cardio
- `rozgrzewka` - Rozgrzewka

---

## Diagram relacji

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    Users    │       │   TrainingPlans  │       │  Exercises  │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ user_id (FK)     │◄──────┤ training_   │
│ name        │  1:M  │ id (PK)          │  1:M  │   plan_id   │
│ email       │       │ name             │       │ id (PK)     │
│ hashed_pass │       │ description      │       │ name        │
│ created_at  │       │ is_active        │       │ sets        │
└─────────────┘       └──────────────────┘       │ reps        │
         │                                       │ weight      │
         │                                       └─────────────┘
         │
         │              ┌──────────────────┐
         │              │ TrainingHistory  │
         │              ├──────────────────┤
         └─────────────►│ user_id (FK)     │
                   1:M  │ id (PK)          │
                        │ date             │
                        │ exercises_data   │
                        │ duration_minutes │
                        └──────────────────┘
         │
         │              ┌──────────────────┐
         │              │    Reminders     │
         │              ├──────────────────┤
         └─────────────►│ user_id (FK)     │
                   1:M  │ id (PK)          │
                        │ title            │
                        │ day_of_week      │
                        │ reminder_time    │
                        └──────────────────┘

┌──────────────────┐
│ ExerciseCatalog  │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ category         │
│ difficulty       │
│ equipment        │
└──────────────────┘
```

---

## Indeksy

- `users.email` - unikalny indeks do szybkiego wyszukiwania przy autoryzacji
- `training_plans.user_id` - indeks do filtrowania planów użytkownika
- `training_history.user_id` + `date` - indeks złożony do szybkiego pobierania historii
- `reminders.user_id` + `day_of_week` - indeks do pobierania przypomnień na dany dzień
- `exercise_catalog.category` - indeks do filtrowania według kategorii
- `exercise_catalog.difficulty` - indeks do filtrowania według poziomu trudności

---

## Migracje

Do zarządzania migracjami używany jest Alembic. Główne komendy:

```bash
# Utworzyć migrację
alembic revision --autogenerate -m "description"

# Zastosować migracje
alembic upgrade head

# Cofnąć ostatnią migrację
alembic downgrade -1
```

---

## Dane początkowe

Przy pierwszym uruchomieniu tworzony jest użytkownik-administrator:
- Email: admin@fittrainer.pl
- Password: admin123

Administrator może dodawać ćwiczenia do katalogu przez API.
