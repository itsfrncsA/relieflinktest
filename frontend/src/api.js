// Central API URL for frontend requests with automatic localhost detection
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = isLocalhost 
  ? (import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5001/api')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

