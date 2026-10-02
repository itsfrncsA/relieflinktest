import axios from 'axios';

// Central API URL for frontend requests with automatic localhost detection
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = isLocalhost 
  ? (import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5001/api')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

let isHandlingAuthExpired = false;

// Global Axios Response Interceptor for 401 / Token Expired handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                             error.config?.url?.includes('/auth/register') ||
                             error.config?.url?.includes('/auth/forgot-password');

      // Only trigger session expiration logout if not an initial login/auth submission
      if (!isAuthEndpoint && !isHandlingAuthExpired) {
        isHandlingAuthExpired = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        const expiredMsg = error.response.data?.message || 'Your session has expired. You have been logged out. Please sign in again.';
        sessionStorage.setItem('auth_expired_message', expiredMsg);

        // Notify app to clear user state and show login screen with error
        window.dispatchEvent(new CustomEvent('auth:expired', { 
          detail: { message: expiredMsg } 
        }));

        setTimeout(() => {
          isHandlingAuthExpired = false;
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);
