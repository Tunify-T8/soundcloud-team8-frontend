import axios from 'axios';//library to send api requests instead of using fetch
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '@/features/auth/utils/token.utils';
 
import { BASE_URL } from '../../../config/env'; //This imports the base backend URL from your config.

export const api = axios.create({ //create a pre configured axios object
  baseURL: BASE_URL,
 headers: {
    'Content-Type': 'application/json',
  },
});
 
api.interceptors.request.use(
  (config) => { //config is the request settings object It contains things like: URL headers method data


    const token = getAccessToken();
 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;//This is how protected backend routes know who the user is.
    }
 
    return config; // must always return config
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
 
// This flag prevents multiple refresh calls happening at the same time
let isRefreshing = false;
let failedQueue: Array<{ //queue of pending requests waiting for refresh to finish.
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
 
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
 
api.interceptors.response.use(
  (response) => response,
 
  async (error) => {
    const originalRequest = error.config;
  
    const PUBLIC_AUTH_ENDPOINTS = [
      '/auth/verify-email',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/resend-verification',
      '/auth/check-email',
      '/auth/google',
    ];
    const isPublicRoute = PUBLIC_AUTH_ENDPOINTS.some(
      (ep) => originalRequest.url?.includes(ep)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
 
      originalRequest._retry = true;
      isRefreshing = true;
 
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        clearTokens();
        window.location.href = '/signin';
        return Promise.reject(error);
      }
 
      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
 
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
         storeTokens(accessToken, newRefreshToken ?? refreshToken, expiresIn ?? 3600);
         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
 
        processQueue(null, accessToken);
 
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
  
);
 