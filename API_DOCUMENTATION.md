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
Регистрация нового пользователя

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
Авторизация (OAuth2 формат)

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
Получить информацию о текущем пользователе

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
Удалить аккаунт текущего пользователя

---

### Training Plans

#### GET /training-plans/
Получить все планы текущего пользователя

#### POST /training-plans/
Создать новый план

**Request:**
```json
{
  "name": "Утренняя тренировка",
  "description": "Тренировка на все группы мышц",
  "is_active": true
}
```

#### GET /training-plans/{plan_id}
Получить план по ID

#### PUT /training-plans/{plan_id}
Обновить план

**Request:**
```json
{
  "name": "Обновленное название",
  "description": "Новое описание",
  "is_active": false
}
```

#### DELETE /training-plans/{plan_id}
Удалить план

---

### Exercises

#### GET /training-plans/{plan_id}/exercises/
Получить все упражнения плана

#### POST /training-plans/{plan_id}/exercises/
Добавить упражнение в план

**Request:**
```json
{
  "name": "Отжимания",
  "description": "Классические отжимания от пола",
  "sets": 3,
  "reps": 15,
  "weight": 0,
  "rest_seconds": 60
}
```

#### GET /training-plans/{plan_id}/exercises/{exercise_id}
Получить упражнение по ID

#### PUT /training-plans/{plan_id}/exercises/{exercise_id}
Обновить упражнение

#### DELETE /training-plans/{plan_id}/exercises/{exercise_id}
Удалить упражнение

---

### Training History

#### GET /training-history/
Получить историю тренировок

**Query Parameters:**
- `skip` - пропустить N записей
- `limit` - лимит записей (default: 100)

#### POST /training-history/
Записать выполненную тренировку

**Request:**
```json
{
  "training_plan_id": 1,
  "notes": "Хорошая тренировка",
  "exercises_data": [
    {
      "exercise_id": 1,
      "name": "Отжимания",
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
Получить запись о тренировке

#### PUT /training-history/{record_id}
Обновить запись о тренировке

**Request:**
```json
{
  "notes": "Обновленные заметки",
  "duration_minutes": 50,
  "calories_burned": 350
}
```

#### DELETE /training-history/{record_id}
Удалить запись

---

### Reminders

#### GET /reminders/
Получить все напоминания

**Query Parameters:**
- `active_only` - только активные (true/false)

#### GET /reminders/today
Получить напоминания на сегодня

#### POST /reminders/
Создать напоминание

**Request:**
```json
{
  "title": "Утренняя тренировка",
  "message": "Не забудь размяться!",
  "day_of_week": 1,
  "reminder_time": "07:00:00",
  "is_active": true
}
```

#### PUT /reminders/{reminder_id}
Обновить напоминание

#### DELETE /reminders/{reminder_id}
Удалить напоминание

---

### Exercise Catalog

#### GET /exercise-catalog/
Получить каталог упражнений

**Query Parameters:**
- `category` - фильтр по категории (np. `klatka_piersiowa`, `nogi`, `plecy`)
- `difficulty` - фильтр по сложности (`łatwy`, `średni`, `trudny`)
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
Получить список категорий

**Response:**
```json
["klatka_piersiowa", "nogi", "plecy", "brzuch", "ramiona", "biceps", "triceps", "kardio", "rozgrzewka"]
```

#### GET /exercise-catalog/{exercise_id}
Получить упражнение из каталога по ID

#### POST /exercise-catalog/
Добавить упражнение в каталог (только admin)

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
Обновить упражнение в каталоге

#### DELETE /exercise-catalog/{exercise_id}
Удалить упражнение из каталога

---

### Virtual Trainer

#### GET /virtual-trainer/recommendation
Получить рекомендацию от виртуального тренера

**Response:**
```json
{
  "message": "Ты отдыхал 3 дня - время вернуться! Начни с лёгкой тренировки.",
  "motivation": "Отдых - часть тренировки. Сегодня возвращаемся в форму плавно!",
  "suggested_exercises": [
    {
      "name": "Разминка (5 мин)",
      "sets": 1,
      "reps": 1,
      "weight": 0
    }
  ],
  "workout_type": "light",
  "reason": "Небольшой перерыв - лёгкая тренировка для возвращения"
}
```

#### GET /virtual-trainer/progress
Получить анализ прогресса

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

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |

---

## Примеры использования в Postman

### 1. Регистрация
```
POST http://localhost:8000/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Авторизация
```
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=test@example.com&password=password123
```

### 3. Создание плана (с токеном)
```
POST http://localhost:8000/training-plans/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Моя тренировка",
  "description": "Описание"
}
```

### 4. Добавление упражнения из каталога в план
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
