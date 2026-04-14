import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { getAccessToken } from '../features/auth/utils/token.utils';
import { api } from '../features/auth/services/api';
import type { AppDispatch } from '../app/store';

const useRestoreSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    api.get('/users/me')
      .then((res) => {
        const user = res.data;
        dispatch(setUser({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
        }));
      })
      .catch(() => {
        // token invalid — axios interceptor handles redirect
      });
  }, []);
};

export default useRestoreSession;