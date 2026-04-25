import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/userSlice';
import type { AppDispatch } from '../../../app/store';
import {
  getRefreshToken,
  getStoredUser,
  isAccessTokenExpired,
  storeTokens,
  clearTokens,
} from '../utils/token.utils';
import axios from 'axios';
import { BASE_URL } from '../../../config/env';

export const useAuthInit = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    const restoreSession = async () => {
      try {
        if (isAccessTokenExpired()) {
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          storeTokens(data.accessToken, data.refreshToken ?? refreshToken, 900);
        }

        const stored = getStoredUser();
        if (stored) {
          dispatch(setUser({
            id: stored.id,
            username: stored.username,
            email: stored.email,
            role: stored.role,
            isVerified: stored.isVerified,
            avatarUrl: stored.avatarUrl,
          }));
        }
      } catch {
        clearTokens();
      }
    };

    restoreSession();
  }, [dispatch]);
};