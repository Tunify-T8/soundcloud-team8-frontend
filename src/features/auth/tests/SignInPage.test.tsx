import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignInPage from '../pages/SignInPage';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockGoogleLoginTrigger = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('../components/AuthNavbar', () => ({
  default: () => <div data-testid="auth-navbar">AuthNavbar</div>,
}));

vi.mock('../../../store/userSlice', () => ({
  setUser: (payload: unknown) => ({ type: 'user/setUser', payload }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {},
      pathname: '/signin',
    }),
  };
});

vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: (options: any) => {
    mockGoogleLoginTrigger.mockImplementation(() => {
      options.onSuccess?.({ code: 'mock_google_code' });
    });
    return mockGoogleLoginTrigger;
  },
}));

vi.mock('../services/index', () => ({
  login: vi.fn(),
  socialLogin: vi.fn(),
  googleSignIn: vi.fn(),
  googleLink: vi.fn(),
  checkEmail: vi.fn(),
}));

vi.mock('../utils/token.utils', () => ({
  storeTokens: vi.fn(),
  storeUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  extractErrorMessage: (error: any) =>
    error?.message || error?.response?.data?.message || 'Something went wrong.',
}));

import {
  login,
  socialLogin,
  googleSignIn,
  checkEmail,
} from '../services/index';
import { storeTokens } from '../utils/token.utils';

const renderSignInPage = () =>
  render(
    <MemoryRouter>
      <SignInPage />
    </MemoryRouter>
  );

const focusIntoEmailStep = async () => {
  const socialEmailInput = screen.getByPlaceholderText(/your email address or profile url/i);
  fireEvent.focus(socialEmailInput);

  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: /sign in or create an account/i })
    ).toBeInTheDocument();
  });
};

const goToPasswordStep = async (email = 'test@tunify.com') => {
  vi.mocked(checkEmail).mockResolvedValue({ exists: true, message: 'ok' });

  renderSignInPage();
  await focusIntoEmailStep();

  const emailInput = screen.getByPlaceholderText(/your email address or profile url/i);
  await userEvent.clear(emailInput);
  await userEvent.type(emailInput, email);

  fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

  await waitFor(() => {
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
  });
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(checkEmail).mockResolvedValue({ exists: true, message: 'ok' });

  vi.mocked(login).mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    user: {
      id: '1',
      username: 'asma',
      email: 'test@tunify.com',
      role: 'user',
      isCertified: true,
      avatarUrl: null,
    },
  });

  vi.mocked(socialLogin).mockResolvedValue({
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    expiresIn: 3600,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@tunify.com',
      avatarUrl: null,
      isCertified: true,
      role: 'user' as const,
    },
  });

  vi.mocked(googleSignIn).mockResolvedValue({
    accessToken: 'google-access',
    refreshToken: 'google-refresh',
    user: {
      id: '1',
      username: 'asma',
      email: 'test@tunify.com',
      role: 'user',
      isCertified: true,
      avatarUrl: null,
    },
  });
});

describe('SignInPage — initial render (social step)', () => {
  it('renders the social step by default', () => {
    renderSignInPage();
    expect(screen.getByRole('heading', { name: /sign in or create an account/i })).toBeInTheDocument();
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
    expect(screen.getByText(/or with email/i)).toBeInTheDocument();
  });

  it('renders the current branding/copy from the page', () => {
    renderSignInPage();
    expect(screen.getByTestId('auth-navbar')).toBeInTheDocument();
    expect(screen.getByText(/soundcloud's/i)).toBeInTheDocument();
  });

  it('renders the Need help link', () => {
    renderSignInPage();
    expect(screen.getByText(/need help\?/i)).toBeInTheDocument();
  });

  it('renders the Create one for free link', () => {
    renderSignInPage();
    expect(screen.getByText(/create one for free/i)).toBeInTheDocument();
  });

  it('Continue button is disabled when email is empty', () => {
    renderSignInPage();
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeDisabled();
  });
});

describe('SignInPage — email step transition', () => {
  it('moves to email step when email input is focused', async () => {
    renderSignInPage();
    await focusIntoEmailStep();
    expect(screen.getByPlaceholderText(/your email address or profile url/i)).toBeInTheDocument();
  });

  it('back button from email step returns to social step', async () => {
    renderSignInPage();
    await focusIntoEmailStep();

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
    });
  });

  it('email input is cleared when going back to social step', async () => {
    renderSignInPage();
    await focusIntoEmailStep();

    const emailInput = screen.getByPlaceholderText(/your email address or profile url/i);
    await userEvent.type(emailInput, 'hello@test.com');

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      const socialInput = screen.getByPlaceholderText(/your email address or profile url/i) as HTMLInputElement;
      expect(socialInput.value).toBe('');
    });
  });
});

describe('SignInPage — email validation', () => {
  it('clears error when user starts typing after an error', async () => {
    renderSignInPage();
    await focusIntoEmailStep();

    const emailInput = screen.getByPlaceholderText(/your email address or profile url/i);
    await userEvent.type(emailInput, 'bad');
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address or profile url\./i)).toBeInTheDocument();
    });

    await userEvent.type(emailInput, 'a');

    await waitFor(() => {
      expect(screen.queryByText(/enter a valid email address or profile url\./i)).not.toBeInTheDocument();
    });
  });
});

describe('SignInPage — known vs unknown email', () => {
  it('navigates to /create-account for unknown email', async () => {
    vi.mocked(checkEmail).mockResolvedValue({ exists: false, message: 'ok' });

    renderSignInPage();
    await focusIntoEmailStep();

    const emailInput = screen.getByPlaceholderText(/your email address or profile url/i);
    await userEvent.type(emailInput, 'newuser@tunify.com');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/create-account', {
        state: { email: 'newuser@tunify.com' },
      });
    });
  });

  it('moves to password step for known email', async () => {
    await goToPasswordStep('test@tunify.com');
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByText('test@tunify.com')).toBeInTheDocument();
  });

  it('shows backend email check failure message when checkEmail throws', async () => {
    vi.mocked(checkEmail).mockRejectedValue(new Error('boom'));

    renderSignInPage();
    await focusIntoEmailStep();

    const emailInput = screen.getByPlaceholderText(/your email address or profile url/i);
    await userEvent.type(emailInput, 'test@tunify.com');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong\. please try again\./i)).toBeInTheDocument();
    });
  });
});

describe('SignInPage — password step', () => {
  it('shows the entered email in the password step', async () => {
    await goToPasswordStep('test@tunify.com');
    expect(screen.getByText('test@tunify.com')).toBeInTheDocument();
  });

  it('shows forgot password link in password step', async () => {
    await goToPasswordStep();
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument();
  });

  it('back button from password step returns to email step', async () => {
    await goToPasswordStep();

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in or create an account/i })).toBeInTheDocument();
    });
  });

  it('calls login service with correct credentials on submit', async () => {
    await goToPasswordStep('test@tunify.com');

    const passwordInput = screen.getByPlaceholderText(/your password/i);
    await userEvent.type(passwordInput, 'Test@1234');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@tunify.com',
        password: 'Test@1234',
      });
    });
  });

  it('stores tokens and navigates on successful login', async () => {
    await goToPasswordStep('test@tunify.com');

    const passwordInput = screen.getByPlaceholderText(/your password/i);
    await userEvent.type(passwordInput, 'Test@1234');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith('access-token', 'refresh-token', 3600);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('shows error message on failed login', async () => {
    vi.mocked(login).mockRejectedValue(new Error('wrong password'));

    await goToPasswordStep('test@tunify.com');

    const passwordInput = screen.getByPlaceholderText(/your password/i);
    await userEvent.type(passwordInput, 'Wrong@123');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(screen.getByText(/this password is incorrect\./i)).toBeInTheDocument();
    });
  });

  it('redirects to /create-account when login says user not found', async () => {
    vi.mocked(login).mockRejectedValue(new Error('user not found'));

    await goToPasswordStep('missing@tunify.com');

    const passwordInput = screen.getByPlaceholderText(/your password/i);
    await userEvent.type(passwordInput, 'Test@1234');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/create-account', {
        state: { email: 'missing@tunify.com' },
      });
    });
  });

  it('redirects to verify-email when backend says user is not certified', async () => {
    vi.mocked(login).mockResolvedValue({
      user: {
        id: '1',
        username: 'asma',
        email: 'test@tunify.com',
        role: 'user',
        isCertified: false,
        avatarUrl: null,
      },
    } as any);

    await goToPasswordStep('test@tunify.com');

    const passwordInput = screen.getByPlaceholderText(/your password/i);
    await userEvent.type(passwordInput, 'Test@1234');

    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify-email', {
        state: { email: 'test@tunify.com' },
      });
    });
  });
});

describe('SignInPage — social login', () => {
  it('calls socialLogin with facebook provider', async () => {
    renderSignInPage();
    fireEvent.click(screen.getByText('Continue with Facebook'));
    await waitFor(() => {
      expect(socialLogin).toHaveBeenCalledWith({
        provider: 'facebook',
        providerToken: 'mock_oauth_token',
      });
    });
  });

  it('calls googleSignIn when clicking Continue with Google', async () => {
    renderSignInPage();
    fireEvent.click(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(mockGoogleLoginTrigger).toHaveBeenCalled();
      expect(googleSignIn).toHaveBeenCalledWith('mock_google_code');
    });
  });

  it('stores tokens and navigates on successful Google sign in', async () => {
    renderSignInPage();
    fireEvent.click(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith('google-access', 'google-refresh', 3600);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('stores tokens and navigates on successful facebook social login', async () => {
    renderSignInPage();
    fireEvent.click(screen.getByText('Continue with Facebook'));
    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith('mock.access.token', 'mock.refresh.token', 3600);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('renders Apple sign in button', () => {
    renderSignInPage();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
  });
});

describe('SignInPage — loading states', () => {
  it('disables social buttons while login is in progress', async () => {
    vi.mocked(socialLogin).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        accessToken: 'fb-access',
        refreshToken: 'fb-refresh',
        expiresIn: 3600,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@tunify.com',
          avatarUrl: null,
          isCertified: true,
          role: 'user' as const,
        },
      }), 50))
    );

    renderSignInPage();

    const facebookButton = screen.getByText('Continue with Facebook').closest('button');
    expect(facebookButton).not.toBeDisabled();

    fireEvent.click(screen.getByText('Continue with Facebook'));

    await waitFor(() => {
      expect(facebookButton).toBeDisabled();
    });
  });
});
