// ── What is this file? ────────────────────────────────────────
// Your SignInPage imports like this:
//   import { login } from '../services';
//   import { socialLogin } from '../services';
//
// This file is the "services" folder's index.
// It checks VITE_USE_MOCK and returns either mock or real functions.
//
// Right now VITE_USE_MOCK=true in your .env.development,
// so ALL calls go to the mock functions below.
// When your backend is ready, set VITE_USE_MOCK=false.

import axiosInstance from '../services/axiosInstance';
import type {
  LoginRequest,
  AuthResponse,
  SocialLoginRequest,
  RegisterRequest,
} from '../types/auth.types';

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Simulated network delay for mock ─────────────────────────
const delay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock user returned on successful login ────────────────────
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

// ── Helper to create a mock error ────────────────────────────
const mockError = (code: string, message: string, status: number) => {
  const err = new Error(message) as Error & { response: unknown };
  err.response = {
    status,
    data: { error: { code, message, statusCode: status } },
  };
  return err;
};

// ── Mock login ────────────────────────────────────────────────
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

// ── Real login (uses axiosInstance — token attached automatically) ──
const realLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data;
};

// ── Mock social login ─────────────────────────────────────────
const mockSocialLogin = async (
  _data: SocialLoginRequest
): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

// ── Real social login ─────────────────────────────────────────
const realSocialLogin = async (
  data: SocialLoginRequest
): Promise<AuthResponse> => {
  const res = await axiosInstance.post('/auth/social-login', data);
  return res.data;
};

// ── Mock register ─────────────────────────────────────────────
const mockRegister = async (_data: RegisterRequest): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

// ── Real register ─────────────────────────────────────────────
const realRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};

// ── Exported functions (what your pages import) ───────────────
export const login = IS_MOCK ? mockLogin : realLogin;
export const socialLogin = IS_MOCK ? mockSocialLogin : realSocialLogin;
export const register = IS_MOCK ? mockRegister : realRegister;
