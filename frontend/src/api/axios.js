/**
 * axios.js - API Client Configuration
 * ====================================
 * Sets up Axios with base URL and JWT token interceptor.
 * All API calls in the app use this configured instance.
 */

import axios from 'axios';

// Create an Axios instance with default settings
const api = axios.create({
  // Use VITE_API_URL environment variable if available, otherwise fallback to local '/api'
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds the JWT token to every request.
 * This way we don't have to manually add it each time.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * If we get a 401 (unauthorized), clear the token and redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
