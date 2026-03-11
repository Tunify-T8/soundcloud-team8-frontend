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
    username: 'soundcloud_dev',
    email: 'test@soundcloud.com',
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
  // Valid test credentials
  if (
    data.email === 'test@soundcloud.com' &&
    data.password === 'Password123'
  ) {
    return MOCK_AUTH_RESPONSE;
  }
  // Wrong email
  if (data.email !== 'test@soundcloud.com') {
    throw mockError('USER_NOT_FOUND', 'No account with that email.', 404);
  }
  // Wrong password
  throw mockError('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
};

// ── Real login (calls your backend) ──────────────────────────
const realLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const err = new Error('Login failed') as Error & { response: unknown };
    err.response = { status: res.status, data: errorData };
    throw err;
  }
  return res.json();
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
  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${BASE_URL}/auth/social-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const err = new Error('Social login failed') as Error & { response: unknown };
    err.response = { status: res.status, data: errorData };
    throw err;
  }
  return res.json();
};



// ── Mock register ─────────────────────────────────────────────
const mockRegister = async (_data: RegisterRequest): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

// ── Real register ─────────────────────────────────────────────
const realRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const err = new Error('Register failed') as Error & { response: unknown };
    err.response = { status: res.status, data: errorData };
    throw err;
  }
  return res.json();
};


// ── Exported functions (what your pages import) ───────────────
export const login = IS_MOCK ? mockLogin : realLogin;
export const socialLogin = IS_MOCK ? mockSocialLogin : realSocialLogin;
export const register = IS_MOCK ? mockRegister : realRegister;