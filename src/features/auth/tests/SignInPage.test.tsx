import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignInPage from '../pages/SignInPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/signin' }),
  };
});

vi.mock('../services/index', () => ({
  login: vi.fn(),
  socialLogin: vi.fn(),
  initiateGoogleOAuth: vi.fn(),
}));

vi.mock('../utils/token.utils', () => ({
  storeTokens: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock('../data/mockUsers', () => ({
  isKnownEmail: vi.fn(),
}));

import { login, socialLogin } from '../services/index';
import { storeTokens } from '../utils/token.utils';
import { isKnownEmail } from '../data/mockUsers';

const MOCK_AUTH_RESPONSE = {
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
};

const renderSignInPage = () =>
  render(
    <MemoryRouter initialEntries={['/signin']}>
      <SignInPage />
    </MemoryRouter>
  );

const getBackButton = () => {
  const buttons = screen.getAllByRole('button');
  return buttons.find((b) => b.querySelector('.lucide-chevron-left')) as HTMLElement;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isKnownEmail).mockReturnValue(false);
});

// INITIAL RENDER — SOCIAL STEP

describe('SignInPage — initial render (social step)', () => {
  it('renders the social step by default', () => {
    renderSignInPage();
    expect(screen.getByText('Sign in or create an account')).toBeInTheDocument();
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email address or profile URL')).toBeInTheDocument();
  });

  it('renders the Tunify branding', () => {
    renderSignInPage();
    expect(screen.getByText('Tunify')).toBeInTheDocument();
  });

  it('renders the Need help link', () => {
    renderSignInPage();
    expect(screen.getByText('Need help?')).toBeInTheDocument();
  });

  it('renders the Create one for free link', () => {
    renderSignInPage();
    expect(screen.getByText('Create one for free')).toBeInTheDocument();
  });

  it('Continue button is disabled when email is empty', () => {
    renderSignInPage();
    const buttons = screen.getAllByRole('button');
    const continueBtn = buttons.find((b) => b.textContent?.trim() === 'Continue');
    expect(continueBtn).toBeDisabled();
  });
});

// EMAIL STEP TRANSITION

describe('SignInPage — email step transition', () => {
  it('moves to email step when email input is focused', async () => {
    renderSignInPage();
    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(() => {
      expect(getBackButton()).toBeInTheDocument();
    });
  });

  it('back button from email step returns to social step', async () => {
    renderSignInPage();
    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(() => {
      expect(getBackButton()).toBeInTheDocument();
    });

    fireEvent.click(getBackButton());

    await waitFor(() => {
      expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
    });
  });

  it('email input is cleared when going back to social step', async () => {
    renderSignInPage();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(async () => {
      const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
      await user.type(inputs[inputs.length - 1], 'test@tunify.com');
    });

    fireEvent.click(getBackButton());

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Your email address or profile URL') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });
});

// EMAIL VALIDATION

describe('SignInPage — email validation', () => {
  it('shows error for invalid email format', async () => {
    renderSignInPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(async () => {
      const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
      await user.type(inputs[inputs.length - 1], 'notanemail');
    });

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });
  });

 it('shows error for empty submit', async () => {
  renderSignInPage();
  const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
  fireEvent.focus(emailInput);

  await waitFor(() => {
    expect(getBackButton()).toBeInTheDocument();
  });

  // Button is disabled when empty so we call the handler directly via Enter key
  const input = screen.getByPlaceholderText('Your email address or profile URL');
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  await waitFor(() => {
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
  });
});

 it('shows error message on failed social login', async () => {
  vi.mocked(socialLogin).mockRejectedValue(new Error('Social login failed'));
  renderSignInPage();

  fireEvent.click(screen.getByText('Continue with Facebook'));

  await waitFor(() => {
    expect(screen.getByText(/social login failed/i)).toBeInTheDocument();
  });
});

  it('clears error when user starts typing after an error', async () => {
    renderSignInPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(async () => {
      const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
      await user.type(inputs[inputs.length - 1], 'bad');
    });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });

    const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
    await user.type(inputs[inputs.length - 1], 'x');

    await waitFor(() => {
      expect(screen.queryByText(/enter a valid email/i)).not.toBeInTheDocument();
    });
  });
});

// KNOWN vs UNKNOWN EMAIL

describe('SignInPage — known vs unknown email', () => {
  it('navigates to /create-account for unknown email', async () => {
    vi.mocked(isKnownEmail).mockReturnValue(false);
    renderSignInPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(async () => {
      const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
      await user.type(inputs[inputs.length - 1], 'newuser@example.com');
    });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/create-account',
        { state: { email: 'newuser@example.com' } }
      );
    });
  });

  it('moves to password step for known email', async () => {
    vi.mocked(isKnownEmail).mockReturnValue(true);
    renderSignInPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(async () => {
      const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
      await user.type(inputs[inputs.length - 1], 'test@tunify.com');
    });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });
  });
});


// PASSWORD STEP


describe('SignInPage — password step', () => {
  const goToPasswordStep = async () => {
    vi.mocked(isKnownEmail).mockReturnValue(true);
    renderSignInPage();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('Your email address or profile URL');
    fireEvent.focus(emailInput);

    await waitFor(async () => {
      const inputs = screen.getAllByPlaceholderText('Your email address or profile URL');
      await user.type(inputs[inputs.length - 1], 'test@tunify.com');
    });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });

    return user;
  };

  it('shows the entered email in the password step', async () => {
    await goToPasswordStep();
    expect(screen.getByText('test@tunify.com')).toBeInTheDocument();
  });

  it('shows forgot password link in password step', async () => {
    await goToPasswordStep();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('back button from password step returns to email step', async () => {
    await goToPasswordStep();
    fireEvent.click(getBackButton());

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Your email address or profile URL')
      ).toBeInTheDocument();
    });
  });

  it('calls login service with correct credentials on submit', async () => {
    vi.mocked(login).mockResolvedValue(MOCK_AUTH_RESPONSE);
    const user = await goToPasswordStep();

    const passwordInput = screen.getByPlaceholderText('Your password');
    await user.type(passwordInput, 'Password123');

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'Password123' })
      );
    });
  });

  it('stores tokens and navigates on successful login', async () => {
    vi.mocked(login).mockResolvedValue(MOCK_AUTH_RESPONSE);
    const user = await goToPasswordStep();

    const passwordInput = screen.getByPlaceholderText('Your password');
    await user.type(passwordInput, 'Password123');

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith('mock.access.token', 'mock.refresh.token', 3600);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('shows error message on failed login', async () => {
    vi.mocked(login).mockRejectedValue({
      response: {
        status: 401,
        data: { error: { message: 'Email or password is incorrect.' } },
      },
    });
    const user = await goToPasswordStep();

    const passwordInput = screen.getByPlaceholderText('Your password');
    await user.type(passwordInput, 'wrongpassword');

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/email or password is incorrect/i)).toBeInTheDocument();
    });
  });

  it('redirects to /create-account when login says user not found', async () => {
    vi.mocked(login).mockRejectedValue({
      response: {
        status: 404,
        data: { error: { message: 'No account with that email.' } },
      },
    });
    const user = await goToPasswordStep();

    const passwordInput = screen.getByPlaceholderText('Your password');
    await user.type(passwordInput, 'somepassword');

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/create-account',
        expect.objectContaining({ state: expect.objectContaining({ email: expect.any(String) }) })
      );
    });
  });
});


// SOCIAL LOGIN

describe('SignInPage — social login', () => {
  it('calls socialLogin with facebook provider', async () => {
    vi.mocked(socialLogin).mockResolvedValue(MOCK_AUTH_RESPONSE);
    renderSignInPage();

    fireEvent.click(screen.getByText('Continue with Facebook'));

    await waitFor(() => {
      expect(socialLogin).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'facebook' })
      );
    });
  });

  it('calls socialLogin with google provider', async () => {
    vi.mocked(socialLogin).mockResolvedValue(MOCK_AUTH_RESPONSE);
    renderSignInPage();

    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(socialLogin).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      );
    });
  });

  it('stores tokens and navigates on successful social login', async () => {
    vi.mocked(socialLogin).mockResolvedValue(MOCK_AUTH_RESPONSE);
    renderSignInPage();

    fireEvent.click(screen.getByText('Continue with Facebook'));

    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith('mock.access.token', 'mock.refresh.token', 3600);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

 it('shows error message on failed social login', async () => {
  vi.mocked(socialLogin).mockRejectedValue({
    response: {
      status: 500,
      data: { error: { message: 'Something went wrong. Please try again.' } },
    },
  });
  renderSignInPage();

  fireEvent.click(screen.getByText('Continue with Facebook'));

  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
});

// LOADING STATES

describe('SignInPage — loading states', () => {
  it('disables social buttons while login is in progress', async () => {
    vi.mocked(socialLogin).mockImplementation(() => new Promise(() => {}));
    renderSignInPage();

    const fbBtn = screen.getByText('Continue with Facebook').closest('button')!;
    fireEvent.click(fbBtn);

    await waitFor(() => {
      expect(fbBtn).toBeDisabled();
    });
  });
});
