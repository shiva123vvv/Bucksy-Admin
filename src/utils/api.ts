import axios from 'axios';
import { getToken } from '../lib/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://bucksyserver-production.up.railway.app/api',
});

// Request interceptor: Attach token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = getToken();
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
    // If error is 401 (Unauthorized), it might mean token expired
    if (error.response?.status === 401) {
       // Optional: Redirect to login or clear token
       // removeToken();
       // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
