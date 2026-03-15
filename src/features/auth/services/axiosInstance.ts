// ============================================================
// AXIOS INSTANCE — Tunify
// Handles JWT token attachment and silent refresh on 401
// ============================================================
 
import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../utils/token.utils';
 
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
 
// ── Create the axios instance ──────────────────────────────────
// This is what every service in the app will use instead of raw fetch
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// ── REQUEST INTERCEPTOR ────────────────────────────────────────
// Runs automatically before EVERY request
// Attaches the access token to the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
 
    return config; // must always return config
  },
  (error) => {
    // If something goes wrong building the request
    return Promise.reject(error);
  }
);
 
// ── RESPONSE INTERCEPTOR ───────────────────────────────────────
// Runs automatically after EVERY response
// If the server returns 401 (token expired), silently refreshes and retries
 
// This flag prevents multiple refresh calls happening at the same time
let isRefreshing = false;
 
// Queue of requests that failed while we were refreshing
// They will all be retried once the new token arrives
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
 
// Process the queue — either retry all with new token or reject all
const processQueue = (error: unknown, token: string | null = null) => {
  for (let i = 0; i < failedQueue.length; i++) {
    if (error) {
      failedQueue[i].reject(error);
    } else if (token) {
      failedQueue[i].resolve(token);
    }
  }
  failedQueue = [];
};
 
axiosInstance.interceptors.response.use(
  // Success — just pass the response through, no action needed
  (response) => response,
 
  // Error — check if it's a 401 (expired token)
  async (error) => {
    const originalRequest = error.config;
 
    // Only handle 401 errors
    // _retry flag prevents infinite loops if refresh itself fails
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
 
      // Mark this request so it won't loop
      originalRequest._retry = true;
      isRefreshing = true;
 
      const refreshToken = getRefreshToken();
 
      // No refresh token means user needs to log in again
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/signin';
        return Promise.reject(error);
      }
 
      try {
        // Call the refresh endpoint
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
 
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
 
        // Store the new tokens
        storeTokens(accessToken, newRefreshToken ?? refreshToken, expiresIn ?? 3600);
 
        // Update the Authorization header for the retried request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
 
        // Let all queued requests know the new token is ready
        processQueue(null, accessToken);
 
        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — tokens are invalid, force login
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
 
    // For all other errors (400, 403, 404, 500 etc.) just pass them through
    return Promise.reject(error);
  }
);
 
export default axiosInstance;