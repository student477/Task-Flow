import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('taskflow_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify user on mount if token exists
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (isMounted && response?.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('taskflow_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        // If token is invalid or expired, clear credentials
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('taskflow_token');
          localStorage.removeItem('taskflow_user');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    // Listen for 401 session expiration from API interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    };

    window.addEventListener('taskflow_auth_expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('taskflow_auth_expired', handleSessionExpired);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await authService.login({ email, password });
      const { user: loggedInUser, token: authToken } = response.data;

      localStorage.setItem('taskflow_token', authToken);
      localStorage.setItem('taskflow_user', JSON.stringify(loggedInUser));

      setToken(authToken);
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await authService.register(userData);
      const { user: registeredUser, token: authToken } = response.data;

      localStorage.setItem('taskflow_token', authToken);
      localStorage.setItem('taskflow_user', JSON.stringify(registeredUser));

      setToken(authToken);
      setUser(registeredUser);
      return { success: true, user: registeredUser };
    } catch (err) {
      const message = err.message || 'Registration failed. Please check your inputs.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
