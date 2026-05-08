# API Documentation

## Bazowy URL
```
http://localhost:8000
```

## Dokumentacja Swagger
```
http://localhost:8000/docs
```

---

## Uwierzytelnianie

API używa tokenów JWT do uwierzytelniania.

### Получение токена
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=email@example.com&password=password
```

### Использование токена
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Auth

#### POST /auth/register
Rejestracja nowego użytkownika

**Request:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

#### POST /auth/login
Autoryzacja (format OAuth2)

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

---

### Users

#### GET /users/me
Pobrać informacje o aktualnym użytkowniku

**Response:**
```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

#### DELETE /users/me
Usunąć konto aktualnego użytkownika

---

### Training Plans

#### GET /training-plans/
Pobrać wszystkie plany aktualnego użytkownika

#### POST /training-plans/
Utworzyć nowy plan

**Request:**
```json
{
  "name": "Poranny trening",
  "description": "Trening na wszystkie grupy mięśni",
  "is_active": true
}
```

#### GET /training-plans/{plan_id}
Pobrać plan po ID

#### PUT /training-plans/{plan_id}
Zaktualizować plan

**Request:**
```json
{
  "name": "Zaktualizowana nazwa",
  "description": "Nowy opis",
  "is_active": false
}
```

#### DELETE /training-plans/{plan_id}
Usunąć plan

---

### Exercises

#### GET /training-plans/{plan_id}/exercises/
Pobrać wszystkie ćwiczenia planu

#### POST /training-plans/{plan_id}/exercises/
Dodać ćwiczenie do planu

**Request:**
```json
{
  "name": "Pompki",
  "description": "Klasyczne pompki z podłogi",
  "sets": 3,
  "reps": 15,
  "weight": 0,
  "rest_seconds": 60
}
```

#### GET /training-plans/{plan_id}/exercises/{exercise_id}
Pobrać ćwiczenie po ID

#### PUT /training-plans/{plan_id}/exercises/{exercise_id}
Zaktualizować ćwiczenie

#### DELETE /training-plans/{plan_id}/exercises/{exercise_id}
Usunąć ćwiczenie

---

### Training History

#### GET /training-history/
Pobrać historię treningów

**Query Parameters:**
- `skip` - pominąć N rekordów
- `limit` - limit rekordów (domyślnie: 100)

#### POST /training-history/
Zapisać wykonany trening

**Request:**
```json
{
  "training_plan_id": 1,
  "notes": "Dobry trening",
  "exercises_data": [
    {
      "exercise_id": 1,
      "name": "Pompki",
      "sets": 3,
      "reps": 15,
      "weight": 0
    }
  ],
  "duration_minutes": 45,
  "calories_burned": 300
}
```

#### GET /training-history/{record_id}
Pobrać wpis o treningu

#### PUT /training-history/{record_id}
Zaktualizować wpis o treningu

**Request:**
```json
{
  "notes": "Zaktualizowane notatki",
  "duration_minutes": 50,
  "calories_burned": 350
}
```

#### DELETE /training-history/{record_id}
Usunąć wpis

---

### Reminders

#### GET /reminders/
Pobrać wszystkie przypomnienia

**Query Parameters:**
- `active_only` - tylko aktywne (true/false)

#### GET /reminders/today
Pobrać przypomnienia na dziś

#### POST /reminders/
Utworzyć przypomnienie

**Request:**
```json
{
  "title": "Poranny trening",
  "message": "Nie zapomnij się rozgrzać!",
  "day_of_week": 1,
  "reminder_time": "07:00:00",
  "is_active": true
}
```

#### PUT /reminders/{reminder_id}
Zaktualizować przypomnienie

#### DELETE /reminders/{reminder_id}
Usunąć przypomnienie

---

### Exercise Catalog

#### GET /exercise-catalog/
Pobrać katalog ćwiczeń

**Query Parameters:**
- `category` - filtr według kategorii (np. `klatka_piersiowa`, `nogi`, `plecy`)
- `difficulty` - filtr według poziomu trudności (`łatwy`, `średni`, `trudny`)
- `search` - поиск по названию

**Response:**
```json
[
  {
    "id": 1,
    "name": "Pompki",
    "description": "Klasyczne pompki...",
    "category": "klatka_piersiowa",
    "difficulty": "średni",
    "equipment": "Brak"
  }
]
```

#### GET /exercise-catalog/categories
Pobrać listę kategorii

**Response:**
```json
["klatka_piersiowa", "nogi", "plecy", "brzuch", "ramiona", "biceps", "triceps", "kardio", "rozgrzewka"]
```

#### GET /exercise-catalog/{exercise_id}
Pobrać ćwiczenie z katalogu po ID

#### POST /exercise-catalog/
Dodać ćwiczenie do katalogu (tylko admin)

**Request:**
```json
{
  "name": "Nowe ćwiczenie",
  "description": "Opis techniki wykonania",
  "category": "klatka_piersiowa",
  "difficulty": "średni",
  "equipment": "Hantle"
}
```

#### PUT /exercise-catalog/{exercise_id}
Zaktualizować ćwiczenie w katalogu

#### DELETE /exercise-catalog/{exercise_id}
Usunąć ćwiczenie z katalogu

---

### Virtual Trainer

#### GET /virtual-trainer/recommendation
Pobrać rekomendację od wirtualnego trenera

**Response:**
```json
{
  "message": "Odpoczywałeś 3 dni — czas wrócić! Zacznij od lekkiego treningu.",
  "motivation": "Odpoczynek to część treningu. Dziś wracamy do formy stopniowo!",
  "suggested_exercises": [
    {
      "name": "Rozgrzewka (5 min)",
      "sets": 1,
      "reps": 1,
      "weight": 0
    }
  ],
  "workout_type": "light",
  "reason": "Krótka przerwa — lekki trening na powrót"
}
```

#### GET /virtual-trainer/progress
Pobrać analizę postępów

**Response:**
```json
{
  "total_workouts": 25,
  "workouts_this_month": 8,
  "total_duration_minutes": 1250,
  "average_duration_minutes": 50.0
}
```

---

## Kody błędów

| Kod | Opis |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |

---

## Przykłady użycia w Postman

### 1. Rejestracja
```
POST http://localhost:8000/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Autoryzacja
```
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=test@example.com&password=password123
```

### 3. Tworzenie planu (z tokenem)
```
POST http://localhost:8000/training-plans/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mój trening",
  "description": "Opis"
}
```

### 4. Dodanie ćwiczenia z katalogu do planu
```
POST http://localhost:8000/training-plans/1/exercises/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pompki",
  "description": "Klasyczne pompki",
  "sets": 3,
  "reps": 15,
  "weight": 0,
  "rest_seconds": 60
}
```
