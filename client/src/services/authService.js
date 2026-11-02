import api from './api';

export const authService = {
  // Register new account
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Login existing account
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Fetch currently authenticated user
  getMe: async () => {
    return await api.get('/auth/me');
  },

  // Update user profile settings
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  }
};
