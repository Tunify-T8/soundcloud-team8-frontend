import type { enumUtil } from "node_modules/zod/v3/helpers/enumUtil.d.cts";

// ── Social provider type ──────────────────────────────────────
export type SocialProvider = 'google' | 'facebook' | 'apple';

// ── User ─────────────────────────────────────────────────────
export type UserRole = 'user' | 'artist' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  isCertified: boolean;
  role: UserRole;
  isDeleted?: boolean;
}

// ── API Request types ─────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  date_of_birth : string;
}

export interface SocialLoginRequest {
  provider: SocialProvider;
  providerToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// ── API Response types ────────────────────────────────────────
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface MessageResponse {
  message: string;
}
