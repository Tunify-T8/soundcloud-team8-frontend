import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '@/features/auth/utils/token.utils';
 
import { BASE_URL } from '../../../config/env';

export const api = axios.create({
  baseURL: BASE_URL,
 headers: {
    'Content-Type': 'application/json',
  },
});
 
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
 
    return config; // must always return config
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
 
// This flag prevents multiple refresh calls happening at the same time
let isRefreshing = false;
let failedQueue: Array<{
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
  

    if (error.response?.status === 401 && !originalRequest._retry) {
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
 