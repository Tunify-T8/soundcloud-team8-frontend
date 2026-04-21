// ============================================================
// tokenUtils.test.ts
// Location: src/features/auth/tests/tokenUtils.test.ts
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from '../utils/token.utils';

// ── Clear localStorage before each test ──────────────────────
beforeEach(() => {
  localStorage.clear();
});

// storeTokens
describe('storeTokens', () => {
  it('stores the access token in localStorage', () => {
    storeTokens('access123', 'refresh123', 3600);
    expect(localStorage.getItem('sc_access_token')).toBe('access123');
  });

  it('stores the refresh token in localStorage', () => {
    storeTokens('access123', 'refresh123', 3600);
    expect(localStorage.getItem('sc_refresh_token')).toBe('refresh123');
  });

  it('stores sc_expires_at in localStorage', () => {
    storeTokens('access123', 'refresh123', 3600);
    expect(localStorage.getItem('sc_expires_at')).toBeTruthy();
  });

  it('sc_expires_at is in the future', () => {
    const before = Date.now();
    storeTokens('access123', 'refresh123', 3600);
    const expiresAt = Number(localStorage.getItem('sc_expires_at'));
    expect(expiresAt).toBeGreaterThan(before);
  });

  it('sc_expires_at is approximately now + expiresIn seconds', () => {
    const before = Date.now();
    storeTokens('access123', 'refresh123', 3600);
    const expiresAt = Number(localStorage.getItem('sc_expires_at'));
    const expected = before + 3600 * 1000;
    // Allow 500ms tolerance for test execution time
    expect(expiresAt).toBeGreaterThanOrEqual(expected - 500);
    expect(expiresAt).toBeLessThanOrEqual(expected + 500);
  });

  it('overwrites existing tokens when called again', () => {
    storeTokens('old_access', 'old_refresh', 3600);
    storeTokens('new_access', 'new_refresh', 7200);
    expect(localStorage.getItem('sc_access_token')).toBe('new_access');
    expect(localStorage.getItem('sc_refresh_token')).toBe('new_refresh');
  });
});

// getAccessToken
describe('getAccessToken', () => {
  it('returns null when no token is stored', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('returns the stored access token', () => {
    storeTokens('myAccessToken', 'myRefreshToken', 3600);
    expect(getAccessToken()).toBe('myAccessToken');
  });

  it('returns null after tokens are cleared', () => {
    storeTokens('myAccessToken', 'myRefreshToken', 3600);
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });
});

// getRefreshToken
describe('getRefreshToken', () => {
  it('returns null when no token is stored', () => {
    expect(getRefreshToken()).toBeNull();
  });

  it('returns the stored refresh token', () => {
    storeTokens('myAccessToken', 'myRefreshToken', 3600);
    expect(getRefreshToken()).toBe('myRefreshToken');
  });

  it('returns null after tokens are cleared', () => {
    storeTokens('myAccessToken', 'myRefreshToken', 3600);
    clearTokens();
    expect(getRefreshToken()).toBeNull();
  });
});

// clearTokens
describe('clearTokens', () => {
  it('removes sc_access_token from localStorage', () => {
    storeTokens('access123', 'refresh123', 3600);
    clearTokens();
    expect(localStorage.getItem('sc_access_token')).toBeNull();
  });

  it('removes sc_refresh_token from localStorage', () => {
    storeTokens('access123', 'refresh123', 3600);
    clearTokens();
    expect(localStorage.getItem('sc_refresh_token')).toBeNull();
  });

  it('removes sc_expires_at from localStorage', () => {
    storeTokens('access123', 'refresh123', 3600);
    clearTokens();
    expect(localStorage.getItem('sc_expires_at')).toBeNull();
  });

  it('does not throw when called with nothing stored', () => {
    expect(() => clearTokens()).not.toThrow();
  });

  it('clears all three keys in one call', () => {
    storeTokens('access123', 'refresh123', 3600);
    clearTokens();
    expect(localStorage.getItem('sc_access_token')).toBeNull();
    expect(localStorage.getItem('sc_refresh_token')).toBeNull();
    expect(localStorage.getItem('sc_expires_at')).toBeNull();
  });
});

// FULL FLOW
describe('tokenUtils — full flow', () => {
  it('store → get → clear works end to end', () => {
    // Store
    storeTokens('access_abc', 'refresh_abc', 3600);

    // Get
    expect(getAccessToken()).toBe('access_abc');
    expect(getRefreshToken()).toBe('refresh_abc');

    // Clear
    clearTokens();

    // Verify cleared
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('multiple store calls always reflect the latest values', () => {
    storeTokens('first_access', 'first_refresh', 3600);
    storeTokens('second_access', 'second_refresh', 7200);
    storeTokens('third_access', 'third_refresh', 1800);

    expect(getAccessToken()).toBe('third_access');
    expect(getRefreshToken()).toBe('third_refresh');
  });
});
describe('tokenUtils — expiry edge cases', () => {
  it('stores expiry with expiresIn of 0', () => {
    storeTokens('a', 'b', 0);
    const val = localStorage.getItem('sc_expires_at');
    expect(Number(val)).toBeGreaterThanOrEqual(Date.now() - 1000);
  });

  it('returns null for access token when localStorage is empty', () => {
    localStorage.clear();
    expect(getAccessToken()).toBeNull();
  });

  it('returns null for refresh token when localStorage is empty', () => {
    localStorage.clear();
    expect(getRefreshToken()).toBeNull();
  });
});