import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api/v1')) {
  rawBaseUrl += '/api/v1';
}
const API_BASE_URL = rawBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized Error Normalization
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    const errors = error.response?.data?.errors || null;

    // Handle token expiration or invalid session (401)
    if (status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        window.dispatchEvent(new Event('taskflow_auth_expired'));
      }
    }

    return Promise.reject({
      status,
      message,
      errors,
      original: error
    });
  }
);

export default api;
