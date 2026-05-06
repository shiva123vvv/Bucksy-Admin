import axios from 'axios';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://bucksyserver-production.up.railway.app/api',
});

/**
 * Helper to wait for Firebase Auth initialization and return a valid token
 */
const getAuthToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    // 1. Check if user is already there
    if (auth.currentUser) {
      return auth.currentUser.getIdToken().then(resolve).catch(() => resolve(null));
    }

    // 2. Otherwise, wait for onAuthStateChanged (up to 5 seconds)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const token = await user.getIdToken();
        resolve(token);
      } else {
        resolve(null);
      }
    });

    // Timeout safety
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);
  });
};

// Request interceptor: Attach token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('[API] Failed to attach auth token:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = auth.currentUser;
      
      if (user) {
        try {
          // Force refresh token
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest); // Retry original request
        } catch (refreshErr) {
          console.error('[API] Token refresh failed:', refreshErr);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
