import axios from 'axios';

const instance = axios.create({
  // baseURL: 'http://192.168.0.102:5000', // Your Flask backend
  baseURL: '/api',  // Proxy through Nginx
});

// Request interceptor to attach token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle expired token
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert('Session expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
