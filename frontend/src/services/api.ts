import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptordo dodania tokenu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/users/me'),
};

// Training Plans API
export const plansApi = {
  getAll: () => api.get('/training-plans/'),
  getById: (id: number) => api.get(`/training-plans/${id}`),
  create: (data: { name: string; description?: string; is_active?: boolean }) =>
    api.post('/training-plans/', data),
  update: (id: number, data: Partial<{ name: string; description: string; is_active: boolean }>) =>
    api.put(`/training-plans/${id}`, data),
  delete: (id: number) => api.delete(`/training-plans/${id}`),
};

// Exercises API
export const exercisesApi = {
  getAll: (planId: number) => api.get(`/training-plans/${planId}/exercises/`),
  getById: (planId: number, exerciseId: number) =>
    api.get(`/training-plans/${planId}/exercises/${exerciseId}`),
  create: (planId: number, data: {
    name: string;
    description?: string;
    sets?: number;
    reps?: number;
    weight?: number;
    rest_seconds?: number;
  }) => api.post(`/training-plans/${planId}/exercises/`, data),
  update: (planId: number, exerciseId: number, data: Partial<{
    name: string;
    description: string;
    sets: number;
    reps: number;
    weight: number;
    rest_seconds: number;
  }>) => api.put(`/training-plans/${planId}/exercises/${exerciseId}`, data),
  delete: (planId: number, exerciseId: number) =>
    api.delete(`/training-plans/${planId}/exercises/${exerciseId}`),
};

// Training History API
export const historyApi = {
  getAll: () => api.get('/training-history/'),
  getById: (id: number) => api.get(`/training-history/${id}`),
  create: (data: {
    training_plan_id?: number;
    notes?: string;
    exercises_data: Array<{
      exercise_id: number;
      name: string;
      sets: number;
      reps: number;
      weight: number;
    }>;
    duration_minutes?: number;
    calories_burned?: number;
  }) => api.post('/training-history/', data),
  update: (id: number, data: Partial<{
    notes: string;
    duration_minutes: number;
    calories_burned: number;
  }>) => api.put(`/training-history/${id}`, data),
  delete: (id: number) => api.delete(`/training-history/${id}`),
};

// Reminders API
export const remindersApi = {
  getAll: (activeOnly?: boolean) =>
    api.get('/reminders/', { params: { active_only: activeOnly } }),
  getToday: () => api.get('/reminders/today'),
  getById: (id: number) => api.get(`/reminders/${id}`),
  create: (data: {
    title: string;
    message?: string;
    day_of_week: number;
    reminder_time: string;
    is_active?: boolean;
  }) => api.post('/reminders/', data),
  update: (id: number, data: Partial<{
    title: string;
    message: string;
    day_of_week: number;
    reminder_time: string;
    is_active: boolean;
  }>) => api.put(`/reminders/${id}`, data),
  delete: (id: number) => api.delete(`/reminders/${id}`),
};

// Virtual Trainer API
export const trainerApi = {
  getRecommendation: () => api.get('/virtual-trainer/recommendation'),
  getProgress: () => api.get('/virtual-trainer/progress'),
};

// Exercise Catalog API
export const exerciseCatalogApi = {
  getAll: (params?: { category?: string; difficulty?: string; search?: string }) =>
    api.get('/exercise-catalog/', { params }),
  getCategories: () => api.get('/exercise-catalog/categories'),
  getById: (id: number) => api.get(`/exercise-catalog/${id}`),
  create: (data: {
    name: string;
    description?: string;
    category: string;
    difficulty: string;
    equipment?: string;
  }) => api.post('/exercise-catalog/', data),
  update: (id: number, data: Partial<{
    name: string;
    description: string;
    category: string;
    difficulty: string;
    equipment: string;
  }>) => api.put(`/exercise-catalog/${id}`, data),
  delete: (id: number) => api.delete(`/exercise-catalog/${id}`),
};

export default api;
