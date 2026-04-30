import { api } from '../services/api';
import { getRefreshToken, clearTokens } from '../utils/token.utils';
import type {
  LoginRequest,
  AuthResponse,
  SocialLoginRequest,
  RegisterRequest,
} from '../types/auth.types';

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const CLIENT_CACHE_KEYS = [
  "profile_context_cache_v1",
  "discover_page_cache_v1",
  "feed_page_cache_v1",
  "ad-popup-seen",
] as const;

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock auth response ────────────────────────────────────────
const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: {
    id: 'mock-user-001',
    username: 'tunify_dev',
    email: 'test@tunify.com',
    avatarUrl: null,
    isCertified: true,
    role: 'user',
  },
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
  expiresIn: 3600,
};

const mockError = (code: string, message: string, status: number) => {
  const err = new Error(message) as Error & { response: unknown };
  err.response = { status, data: { error: { code, message, statusCode: status } } };
  return err;
};

// ── 1. Check Email ────────────────────────────────────────────
// POST /auth/check-email → { exists: boolean, message: string }
const mockCheckEmail = async (email: string): Promise<{ exists: boolean; message: string }> => {
  await delay(400);
  const knownEmails = ['test@tunify.com', 'test@soundcloud.com', 'sara@tunify.com', 'ahmed@tunify.com', 'nada@tunify.com'];
  const exists = knownEmails.includes(email.toLowerCase());
  return {
    exists,
    message: exists ? 'Welcome back! Please sign in.' : 'Email available. Please continue with registration.',
  };
};

const realCheckEmail = async (email: string): Promise<{ exists: boolean; message: string }> => {
  const res = await api.post('/auth/check-email', { email });
  return res.data;
};

export const checkEmail = IS_MOCK ? mockCheckEmail : realCheckEmail;

// ── 2. Login ──────────────────────────────────────────────────
// POST /auth/login → AuthResponse (tokens only if isCertified: true)
const mockLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  await delay();
  if (data.email === 'test@tunify.com' && data.password === 'Password123') {
    return MOCK_AUTH_RESPONSE;
  }
  if (data.email !== 'test@tunify.com') {
    throw mockError('USER_NOT_FOUND', 'No account with that email.', 404);
  }
  throw mockError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
};

const realLogin = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const login = IS_MOCK ? mockLogin : realLogin;

// ── 3. Register ───────────────────────────────────────────────
// POST /auth/register → user info only (NO tokens — needs email verification)
// Required fields: email, username, password, gender (MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY), date_of_birth (ISO string)
const mockRegister = async (_data: RegisterRequest): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

const realRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const register = IS_MOCK ? mockRegister : realRegister;

// ── 4. Verify Email ───────────────────────────────────────────
// POST /auth/verify-email → returns tokens — user is now logged in
const mockVerifyEmail = async (_email: string, _token: string): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

const realVerifyEmail = async (email: string, token: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/verify-email', { email, token });
  return res.data;
};

export const verifyEmail = IS_MOCK ? mockVerifyEmail : realVerifyEmail;

// ── 5. Resend Verification Email ──────────────────────────────
const mockResendVerification = async (_email: string): Promise<{ message: string }> => {
  await delay();
  return { message: 'Verification email resent.' };
};

const realResendVerification = async (email: string): Promise<{ message: string }> => {
  const res = await api.post('/auth/resend-verification', { email });
  return res.data;
};

export const resendVerification = IS_MOCK ? mockResendVerification : realResendVerification;

// ── 6. Social Login (mock only — real uses Google OAuth flow) ─
const mockSocialLogin = async (_data: SocialLoginRequest): Promise<AuthResponse> => {
  await delay();
  return MOCK_AUTH_RESPONSE;
};

const realSocialLogin = async (data: SocialLoginRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/social-login', data);
  return res.data;
};

export const socialLogin = IS_MOCK ? mockSocialLogin : realSocialLogin;

// ── 7. Google OAuth ───────────────────────────────────────────
const sendGoogleCode = async (code: string) => {
  const res = await api.post('/auth/google', { code });
  return res.data;
};

const linkGoogleAccount = async (linkingToken: string, password: string) => {
  const res = await api.post('/auth/google/link', { linkingToken, password });
  return res.data;
};

export const googleSignIn = sendGoogleCode;
export const googleLink = linkGoogleAccount;
export const clearClientSessionData = () => {
  try {
    for (const key of CLIENT_CACHE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage cleanup failures during sign-out cleanup.
  }
};

// ── 8. Logout ─────────────────────────────────────────────────
const mockLogout = async (): Promise<void> => {
  await delay();
  clearTokens();
};

const realLogout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await api.post('/auth/signout', { refreshToken });
    }
  } finally {
    clearTokens();
  }
};

export const logout = IS_MOCK ? mockLogout : realLogout;

// ── 9. Forgot Password ────────────────────────────────────────
const mockForgotPassword = async (_email: string): Promise<{ message: string }> => {
  await delay();
  return { message: 'If an account exists with this email, you will receive a password reset link shortly.' };
};

const realForgotPassword = async (email: string): Promise<{ message: string }> => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const forgotPassword = IS_MOCK ? mockForgotPassword : realForgotPassword;

// ── 10. Reset Password ────────────────────────────────────────
// Token is 6-char from email, not JWT
const mockResetPassword = async (_email: string, _token: string, _newPassword: string, _confirmPassword: string): Promise<{ message: string }> => {
  await delay();
  return { message: 'Password reset successfully.' };
};

const realResetPassword = async (
  email: string,
  token: string,
  newPassword: string,
  confirmPassword: string,
  signoutAll = true
): Promise<{ message: string }> => {
  const res = await api.post('/auth/reset-password', {
    email,
    token,
    newPassword,
    confirmPassword,
    signoutAll,
  });
  return res.data;
};

export const resetPassword = IS_MOCK ? mockResetPassword : realResetPassword;
