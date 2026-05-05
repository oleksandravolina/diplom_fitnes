# Fitness Virtual Trainer

Система поддержки тренировок с виртуальным тренером.

## Архитектура

```
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── models/    # SQLAlchemy модели
│   │   ├── schemas/   # Pydantic схемы
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Бизнес-логика
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
├── DATABASE_SCHEMA.md # Документация БД
└── API_DOCUMENTATION.md # Документация API
```

## Быстрый старт

### Первое развёртывание

#### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv .venv

# Активировать виртуальное окружение
source .venv/bin/activate  # Linux/Mac
# или
.venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

---

### Повторный запуск

#### Backend

```bash
# Из корня проекта:
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

**Доступ:**
- API: http://localhost:8000
- Frontend: http://localhost:3000
- Swagger документация: http://localhost:8000/docs

## Функциональность

### Управление пользователями
- Регистрация и авторизация (JWT)
- Хранение профиля

### Управление планами тренировок
- Создание и редактирование планов
- Добавление упражнений в план из каталога
- Привязка планов к пользователю

### Каталог упражнений
- 37 предопределенных упражнений
- 9 категорий: клетка грудная, ноги, спина, пресс, плечи, бицепс, трицепс, кардио, разминка
- 3 уровня сложности: легкий, средний, сложный
- Фильтрация по категории, сложности, названию

### История тренировок
- Фиксация выполненных тренировок
- Просмотр истории с деталями
- Редактирование записей (длительность, калории, заметки)

### Напоминания
- Создание расписания тренировок
- Напоминания по дням недели
- Отображение сегодняшних напоминаний

### Виртуальный тренер
- Анализ истории тренировок
- Персонализированные рекомендации
- Мотивационные сообщения
- Определение типа тренировки (лёгкая/средняя/интенсивная) на основе:
  - Дней с последней тренировки
  - Количества тренировок за неделю

## Технологии

**Backend:**
- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite (можно заменить на PostgreSQL)
- JWT аутентификация
- bcrypt для хеширования паролей

**Frontend:**
- React 18
- TypeScript
- Material-UI (MUI)
- React Query
- React Router
- date-fns (с польской локализацией)
- Vite

## Интерфейс

- **Язык:** Польский (весь UI, API сообщения, виртуальный тренер)
- **Дизайн:** Современный с градиентами
- **Адаптивность:** Поддержка мобильных устройств
- **Особенности:**
  - Размытый верхний бар (backdrop blur)
  - Карточный интерфейс
  - Адаптивные таблицы (карточки на мобильных)

## Тестирование в Postman

1. Импортируйте коллекцию из `API_DOCUMENTATION.md`
2. Создайте Environment с переменной `base_url` = `http://localhost:8000`
3. Зарегистрируйтесь через `POST /auth/register`
4. Авторизуйтесь через `POST /auth/login`
5. Сохраните полученный токен в переменную `token`
6. Используйте токен в заголовке Authorization: Bearer {{token}}

## Структура базы данных

См. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## API Endpoints

См. [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Начальные данные

При первом запуске создается пользователь-администратор:
- Email: admin@fittrainer.pl
- Password: admin123

Администратор может добавлять упражнения в каталог через API или скрипт `backend/seed_exercises.py`.
