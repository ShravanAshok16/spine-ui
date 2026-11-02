import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5208';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('spine_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spine_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);