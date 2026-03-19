// ── Token storage keys ────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'sc_access_token';
const REFRESH_TOKEN_KEY = 'sc_refresh_token';

// ── Store tokens ──────────────────────────────────────────────
// Called right after a successful login or register.
// expiresIn is optional (comes from the API response).
export const storeTokens = (
  accessToken: string,
  refreshToken: string,
  expiresIn?: number
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (expiresIn) {
    // Store expiry time as a timestamp so we can check later
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('sc_expires_at', String(expiresAt));
  }
};

// ── Get tokens ────────────────────────────────────────────────
export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

// ── Clear tokens (on logout) ──────────────────────────────────
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('sc_expires_at');
};

// ── Check if user has tokens (is logged in) ───────────────────
export const hasTokens = (): boolean =>
  !!(getAccessToken() || getRefreshToken());

// ── Check if access token is expired ─────────────────────────
export const isAccessTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('sc_expires_at');
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt);
};
