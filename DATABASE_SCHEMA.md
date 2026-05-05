# Структура базы данных

## Обзор

База данных системы поддержки тренировок с виртуальным тренером использует реляционную модель на основе SQLAlchemy ORM.

## Таблицы

### 1. Users (Пользователи)

Хранит информацию о зарегистрированных пользователях.

| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer (PK) | Уникальный идентификатор |
| name | String(100) | Имя пользователя |
| email | String(100), Unique | Email адрес |
| hashed_password | String(255) | Хешированный пароль (bcrypt) |
| created_at | DateTime | Дата создания |
| updated_at | DateTime | Дата последнего обновления |

**Связи:**
- `training_plans` → One-to-Many → TrainingPlans
- `training_history` → One-to-Many → TrainingHistory
- `reminders` → One-to-Many → Reminders

---

### 2. TrainingPlans (Планы тренировок)

Хранит планы тренировок пользователей.

| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer (PK) | Уникальный идентификатор |
| name | String(100) | Название плана |
| description | String(500) | Описание плана |
| user_id | Integer (FK) | ID пользователя-владельца |
| is_active | Boolean | Активен ли план |
| created_at | DateTime | Дата создания |
| updated_at | DateTime | Дата обновления |

**Связи:**
- `user` → Many-to-One → Users
- `exercises` → One-to-Many → Exercises

---

### 3. Exercises (Упражнения)

Хранит упражнения, входящие в планы тренировок.

| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer (PK) | Уникальный идентификатор |
| name | String(100) | Название упражнения |
| description | String(500) | Описание техники |
| sets | Integer | Количество подходов |
| reps | Integer | Количество повторений |
| weight | Integer | Вес в кг (0 = вес тела) |
| rest_seconds | Integer | Отдых между подходами в секундах |
| training_plan_id | Integer (FK) | ID плана тренировок |
| created_at | DateTime | Дата создания |

**Связи:**
- `training_plan` → Many-to-One → TrainingPlans

---

### 4. TrainingHistory (История тренировок)

Хранит записи о выполненных тренировках.

| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer (PK) | Уникальный идентификатор |
| user_id | Integer (FK) | ID пользователя |
| training_plan_id | Integer (FK, nullable) | ID плана (может быть null) |
| date | DateTime | Дата и время тренировки |
| notes | String(500) | Заметки о тренировке |
| exercises_data | JSON | Данные о выполненных упражнениях |
| duration_minutes | Integer | Длительность в минутах |
| calories_burned | Integer | Сожжено калорий |

**Связи:**
- `user` → Many-to-One → Users

**Формат exercises_data:**
```json
[
  {
    "exercise_id": 1,
    "name": "Отжимания",
    "sets": 3,
    "reps": 10,
    "weight": 0
  }
]
```

---

### 5. Reminders (Напоминания)

Хранит расписание напоминаний о тренировках.

| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer (PK) | Уникальный идентификатор |
| user_id | Integer (FK) | ID пользователя |
| title | String(100) | Заголовок напоминания |
| message | String(500) | Текст сообщения |
| day_of_week | Integer | День недели (0=Пн, 6=Вс) |
| reminder_time | Time | Время напоминания |
| is_active | Boolean | Активно ли напоминание |
| created_at | DateTime | Дата создания |

**Связи:**
- `user` → Many-to-One → Users

---

### 6. ExerciseCatalog (Каталог упражнений)

Хранит предопределенные упражнения, доступные для добавления в планы.

| Поле | Тип | Описание |
|------|-----|----------|
| id | Integer (PK) | Уникальный идентификатор |
| name | String(100) | Название упражнения |
| description | String(500) | Описание техники |
| category | String(50) | Категория (klatka_piersiowa, nogi, plecy, brzuch, ramiona, biceps, triceps, kardio, rozgrzewka) |
| difficulty | String(20) | Сложность (łatwy, średni, trudny) |
| equipment | String(100) | Необходимое оборудование |
| created_at | DateTime | Дата создания |

**Категории:**
- `klatka_piersiowa` - Клетка грудная
- `nogi` - Ноги
- `plecy` - Спина
- `brzuch` - Пресс
- `ramiona` - Плечи
- `biceps` - Бицепс
- `triceps` - Трицепс
- `kardio` - Кардио
- `rozgrzewka` - Разминка

---

## Диаграмма связей

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

## Индексы

- `users.email` - уникальный индекс для быстрого поиска при авторизации
- `training_plans.user_id` - индекс для фильтрации планов пользователя
- `training_history.user_id` + `date` - составной индекс для быстрого получения истории
- `reminders.user_id` + `day_of_week` - индекс для получения напоминаний на день
- `exercise_catalog.category` - индекс для фильтрации по категории
- `exercise_catalog.difficulty` - индекс для фильтрации по сложности

---

## Миграции

Для управления миграциями используется Alembic. Основные команды:

```bash
# Создать миграцию
alembic revision --autogenerate -m "description"

# Применить миграции
alembic upgrade head

# Откатить последнюю миграцию
alembic downgrade -1
```

---

## Начальные данные

При первом запуске создается пользователь-администратор:
- Email: admin@fittrainer.pl
- Password: admin123

Администратор может добавлять упражнения в каталог через API.
