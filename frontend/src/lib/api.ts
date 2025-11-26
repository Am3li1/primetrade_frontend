import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  login: (userData: { email: string; password: string }) =>
    api.post('/auth/login', userData),
};

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (taskData: { title: string; description?: string; status?: string }) =>
    api.post('/tasks', taskData),
  update: (id: number, taskData: { title?: string; description?: string; status?: string }) =>
    api.put(`/tasks/${id}`, taskData),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};