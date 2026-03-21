import { api } from "@/services/api";
import { getRefreshToken, clearTokens } from '../utils/token.utils';
import type {
  LoginRequest,
  AuthResponse,
  SocialLoginRequest,
  RegisterRequest,
} from '../types/auth.types';

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: {
    id: 'mock-user-001',
    username: 'tunify_dev',
    email: 'test@tunify.com',
    avatarUrl: null,
    isVerified: true,
    role: 'user',
  },
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
  expiresIn: 3600,
};

const mockError = (code: string, message: string, status: number) => {
  const err = new Error(message) as Error & { response: unknown };
  err.response = {
    status,
    data: { error: { code, message, statusCode: status } },
  };
  return err;
};

const mockLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  await delay();
  if (
    data.email === 'test@tunify.com' &&
    data.password === 'Password123'
  ) {
    return MOCK_AUTH_RESPONSE;
  }
  if (data.email !== 'test@tunify.com') {
    throw mockError('USER_NOT_FOUND', 'No account with that email.', 404);
  }
  throw mockError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
};

const realLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

const mockSocialLogin = async (
  _data: SocialLoginRequest
): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

const realSocialLogin = async (
  data: SocialLoginRequest
): Promise<AuthResponse> => {
  const res = await api.post('/auth/social-login', data);
  return res.data;
};

const mockRegister = async (_data: RegisterRequest): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

const realRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

const mockLogout = async (): Promise<void> => {
  await delay();
  clearTokens();
};

const realLogout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await api.post('/auth/logout', { refreshToken });
  }
  clearTokens();
};

export const logout = IS_MOCK ? mockLogout : realLogout;

export const login = IS_MOCK ? mockLogin : realLogin;
export const socialLogin = IS_MOCK ? mockSocialLogin : realSocialLogin;
export const register = IS_MOCK ? mockRegister : realRegister;
