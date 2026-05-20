import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // Important for cookies
});

// Response interceptor to handle session expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoggingOut = error.config && error.config.url && error.config.url.includes('/auth/logout');
      if (!isLoggingOut) {
        localStorage.removeItem('userInfo');
        toast.error('Session expired. Please log in again.');
        if (window.location.pathname !== '/login') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
