/**
 * Enhanced Axios Instance Configuration
 * 
 * This module creates a configured axios instance with:
 * - Automatic token attachment for authenticated requests
 * - Global error handling for expired tokens
 * - Request/Response interceptors for better UX
 * - Retry mechanism for failed requests
 * - Request timeout configuration
 * 
 * @author SellMyShow Team
 * @version 2.0
 */

import axios from 'axios';

// Configuration constants
const CONFIG = {
  baseURL: 'http://localhost:5000', // Flask backend URL
  timeout: 15000, // 15 seconds timeout
  retryAttempts: 3,
  retryDelay: 1000, // 1 second delay between retries
};

// Create axios instance with base configuration
const instance = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request ID generator for tracking
let requestCounter = 0;

/**
 * Request interceptor to:
 * - Attach authorization token
 * - Add request ID for tracking
 * - Log requests in development
 */
instance.interceptors.request.use(
  (config) => {
    // Attach token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.metadata = { requestId: ++requestCounter, startTime: Date.now() };

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Request [${config.metadata.requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to:
 * - Handle authentication errors
 * - Implement retry logic
 * - Log responses in development
 * - Handle network errors gracefully
 */
instance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`✅ Response [${response.config.metadata.requestId}]:`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Response Error [${originalRequest?.metadata?.requestId}]:`, {
        status: error.response?.status,
        message: error.message,
        url: originalRequest?.url,
      });
    }

    // Handle authentication errors (401, 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 'Session expired. Please log in again.';
      
      // Only show alert if not already on login page
      if (!window.location.pathname.includes('/login')) {
        alert(errorMessage);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Implement retry logic for network errors and 5xx errors
    if (shouldRetry(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= CONFIG.retryAttempts) {
        console.log(`🔄 Retrying request [${originalRequest.metadata?.requestId}] - Attempt ${originalRequest._retryCount}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * originalRequest._retryCount));
        
        return instance(originalRequest);
      }
    }

    // Handle specific error cases
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error: Please check your internet connection');
      // You could show a toast notification here instead of alert
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout: The request took too long to complete');
    }

    return Promise.reject(error);
  }
);

/**
 * Determines if a request should be retried
 * @param {Object} error - The error object
 * @returns {boolean} - Whether the request should be retried
 */
function shouldRetry(error) {
  // Retry on network errors
  if (!error.response) {
    return true;
  }

  // Retry on 5xx server errors
  if (error.response.status >= 500) {
    return true;
  }

  // Retry on specific 4xx errors (like 429 - Too Many Requests)
  if (error.response.status === 429) {
    return true;
  }

  return false;
}

/**
 * Enhanced request methods with additional features
 */
const api = {
  /**
   * GET request with optional caching
   */
  get: (url, config = {}) => instance.get(url, config),

  /**
   * POST request with automatic JSON stringification
   */
  post: (url, data, config = {}) => instance.post(url, data, config),

  /**
   * PUT request for updates
   */
  put: (url, data, config = {}) => instance.put(url, data, config),

  /**
   * DELETE request
   */
  delete: (url, config = {}) => instance.delete(url, config),

  /**
   * PATCH request for partial updates
   */
  patch: (url, data, config = {}) => instance.patch(url, data, config),

  /**
   * Upload file with progress tracking
   */
  uploadFile: (url, formData, onProgress = null) => {
    return instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user token
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Clear authentication
   */
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

// Export both the instance and enhanced API
export default instance;
export { api, CONFIG };
