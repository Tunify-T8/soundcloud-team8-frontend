import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../utils/token.utils', () => ({
  getRefreshToken: vi.fn(),
  clearTokens: vi.fn(),
  storeTokens: vi.fn(),
  getAccessToken: vi.fn(),
}));

import { api } from '../services/api';
import { clearTokens, getRefreshToken } from '../utils/token.utils';
import {
  checkEmail,
  login,
  register,
  verifyEmail,
  resendVerification,
  socialLogin,
  forgotPassword,
  resetPassword,
  logout,
} from '../services/index';

const mockPost = vi.mocked(api.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('services — checkEmail', () => {
  it('returns exists true for known email', async () => {
    mockPost.mockResolvedValue({ data: { exists: true, message: 'Welcome back.' } });
    const result = await checkEmail('test@tunify.com');
    expect(result.exists).toBe(true);
    expect(mockPost).toHaveBeenCalledWith('/auth/check-email', { email: 'test@tunify.com' });
  });

  it('returns exists false for unknown email', async () => {
    mockPost.mockResolvedValue({ data: { exists: false, message: 'Email available.' } });
    const result = await checkEmail('new@example.com');
    expect(result.exists).toBe(false);
  });
});

describe('services — login', () => {
  it('calls POST /auth/login with credentials', async () => {
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        user: { id: '1', username: 'asma', email: 'test@tunify.com', role: 'user', isCertified: true, avatarUrl: null },
      },
    });
    const result = await login({ email: 'test@tunify.com', password: 'Password1!' });
    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'test@tunify.com',
      password: 'Password1!',
    });
    expect(result.accessToken).toBe('token');
  });

  it('throws on invalid credentials', async () => {
    mockPost.mockRejectedValue(new Error('Invalid credentials'));
    await expect(login({ email: 'bad@email.com', password: 'wrong' })).rejects.toThrow();
  });
});

describe('services — register', () => {
  it('calls POST /auth/register', async () => {
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        user: { id: '2', username: 'newuser', email: 'new@tunify.com', role: 'user', isCertified: false, avatarUrl: null },
      },
    });
    const result = await register({
      email: 'new@tunify.com',
      username: 'newuser',
      password: 'Password1!',
      gender: 'FEMALE',
      date_of_birth: '2000-01-01',
    });
    expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
      email: 'new@tunify.com',
    }));
    expect(result.user.username).toBe('newuser');
  });
});

describe('services — verifyEmail', () => {
  it('calls POST /auth/verify-email', async () => {
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        user: { id: '1', username: 'asma', email: 'test@tunify.com', role: 'user', isCertified: true, avatarUrl: null },
      },
    });
    await verifyEmail('test@tunify.com', 'ABC123');
    expect(mockPost).toHaveBeenCalledWith('/auth/verify-email', {
      email: 'test@tunify.com',
      token: 'ABC123',
    });
  });
});

describe('services — resendVerification', () => {
  it('calls POST /auth/resend-verification', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Sent.' } });
    const result = await resendVerification('test@tunify.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification', {
      email: 'test@tunify.com',
    });
    expect(result.message).toBe('Sent.');
  });
});

describe('services — socialLogin', () => {
  it('calls POST /auth/social-login', async () => {
    mockPost.mockResolvedValue({
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        user: { id: '1', username: 'asma', email: 'test@tunify.com', role: 'user', isCertified: true, avatarUrl: null },
      },
    });
    await socialLogin({ provider: 'facebook', providerToken: 'fb_token' });
    expect(mockPost).toHaveBeenCalledWith('/auth/social-login', {
      provider: 'facebook',
      providerToken: 'fb_token',
    });
  });
});

describe('services — forgotPassword', () => {
  it('calls POST /auth/forgot-password', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Reset link sent.' } });
    const result = await forgotPassword('test@tunify.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'test@tunify.com',
    });
    expect(result.message).toBe('Reset link sent.');
  });
});

describe('services — resetPassword', () => {
  it('calls POST /auth/reset-password with all params', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Password reset.' } });
    await resetPassword('test@tunify.com', 'ABC123', 'NewPass1!', 'NewPass1!', true);
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
      email: 'test@tunify.com',
      token: 'ABC123',
      newPassword: 'NewPass1!',
      confirmPassword: 'NewPass1!',
      signoutAll: true,
    });
  });

  it('uses signoutAll=true by default', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Password reset.' } });
    await resetPassword('test@tunify.com', 'ABC123', 'NewPass1!', 'NewPass1!');
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', expect.objectContaining({
      signoutAll: true,
    }));
  });
});

describe('services — logout', () => {
  it('calls POST /auth/signout when refresh token exists', async () => {
    vi.mocked(getRefreshToken).mockReturnValue('refresh-token');
    mockPost.mockResolvedValue({ data: {} });
    await logout();
    expect(mockPost).toHaveBeenCalledWith('/auth/signout', { refreshToken: 'refresh-token' });
    expect(clearTokens).toHaveBeenCalled();
  });

  it('clears tokens even when no refresh token', async () => {
    vi.mocked(getRefreshToken).mockReturnValue(null);
    await logout();
    expect(clearTokens).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });
});