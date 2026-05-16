/**
 * AuthContext.jsx - Authentication State Management
 * ===================================================
 * Provides auth state (user, token) to the entire app using React Context.
 * Handles login, signup, and logout functionality.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Create the Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the app and provides auth state to all child components.
 */
export function AuthProvider({ children }) {
  // State for user info and auth token
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login function
   * Sends credentials to the backend and stores the JWT token.
   */
  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    // Save to state
    setToken(newToken);
    setUser(userData);

    // Save to localStorage (persists across page refreshes)
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return response.data;
  };

  /**
   * Signup function
   * Creates a new user account.
   */
  const signup = async (name, email, password) => {
    const response = await api.post('/signup', { name, email, password });
    return response.data;
  };

  /**
   * Logout function
   * Clears all auth data.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Value object passed to all consumers
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Custom hook to easily access auth context from any component.
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
