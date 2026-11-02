import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5208';

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

// Normalize errors + handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spine_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    // Prefer FluentValidation / ProblemDetails errors
    let message = 'Something went wrong. Please try again.';
    const data = error.response?.data;

    if (data?.errors && typeof data.errors === 'object') {
      // FluentValidation shape: { errors: { Field: ["msg1", "msg2"] } }
      const messages = Object.values(data.errors).flat() as string[];
      if (messages.length) message = messages.join(' ');
    } else if (typeof data?.error === 'string' && data.error) {
      message = data.error;
    } else if (typeof data?.message === 'string' && data.message) {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);