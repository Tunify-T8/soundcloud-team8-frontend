import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import {
  getRefreshToken,
  isAccessTokenExpired,
  storeTokens,
  clearTokens,
} from '../features/auth/utils/token.utils';
import { api } from '../features/auth/services/api';
import axios from 'axios';
import { BASE_URL } from '../config/env';
import type { AppDispatch } from '../app/store';

const useRestoreSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    const restore = async () => {
      try {
        if (isAccessTokenExpired()) {
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          storeTokens(data.accessToken, data.refreshToken ?? refreshToken, 900);
        }

        const res = await api.get('/users/me');
        const user = res.data;
        dispatch(setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified ?? user.isCertified ?? false,
          avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
        }));
      } catch (err:any) {
        const status = err?.response?.status;
        if (status === 401) {
          clearTokens();
        }
      }
    };

    restore();
  }, []);
};

export default useRestoreSession;