const ACCESS_TOKEN_KEY = 'sc_access_token';
const REFRESH_TOKEN_KEY = 'sc_refresh_token';
const EXPIRES_AT_KEY = 'sc_expires_at';
const USER_KEY = 'sc_user';

export const storeTokens = (
  accessToken: string,
  refreshToken: string,
  expiresIn?: number
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  const expiry = expiresIn ?? 900;
  localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiry * 1000));
};

export const storeUser = (user: {
  id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
}): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): {
  id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
} | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(USER_KEY);
};

export const hasTokens = (): boolean =>
  !!(getAccessToken() || getRefreshToken());

export const hasValidSession = (): boolean => !!getRefreshToken();

export const isAccessTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt);
};