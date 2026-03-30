import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/token.utils', () => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  storeTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock('../../../config/env', () => ({
  BASE_URL: 'https://api.test.com',
}));

import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../utils/token.utils';
import { api } from '../services/api';

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetRefreshToken = vi.mocked(getRefreshToken);
const mockStoreTokens = vi.mocked(storeTokens);
const mockClearTokens = vi.mocked(clearTokens);

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  });
});

describe('api — request interceptor', () => {
  it('attaches Bearer token when access token exists', async () => {
    mockGetAccessToken.mockReturnValue('valid-token');

    const config = { headers: {} as Record<string, string> };
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = interceptor(config);

    expect(result.headers.Authorization).toBe('Bearer valid-token');
  });

  it('does not attach Authorization header when no token', async () => {
    mockGetAccessToken.mockReturnValue(null);

    const config = { headers: {} as Record<string, string> };
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = interceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('returns config unchanged', () => {
    mockGetAccessToken.mockReturnValue(null);
    const config = { headers: {}, url: '/test' };
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = interceptor(config);
    expect(result.url).toBe('/test');
  });
});

describe('api — response interceptor', () => {
  it('passes through successful responses unchanged', async () => {
    const response = { data: { ok: true }, status: 200 };
    const interceptor = (api.interceptors.response as any).handlers[0].fulfilled;
    const result = interceptor(response);
    expect(result).toEqual(response);
  });

  it('redirects to /signin when no refresh token on 401', async () => {
    mockGetRefreshToken.mockReturnValue(null);

    const error = {
      response: { status: 401 },
      config: { _retry: false, headers: {} },
    };

    const interceptor = (api.interceptors.response as any).handlers[0].rejected;

    await expect(interceptor(error)).rejects.toBeDefined();
    expect(mockClearTokens).toHaveBeenCalled();
    expect(window.location.href).toBe('/signin');
  });

  it('passes non-401 errors through', async () => {
    const error = {
      response: { status: 500 },
      config: { headers: {} },
    };

    const interceptor = (api.interceptors.response as any).handlers[0].rejected;
    await expect(interceptor(error)).rejects.toEqual(error);
  });

  
});