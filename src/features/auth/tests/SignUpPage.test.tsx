import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignUpPage from '../pages/SignUpPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: { email: 'newuser@example.com' },
      pathname: '/create-account',
    }),
  };
});

vi.mock('../services/index', () => ({
  register: vi.fn(),
  checkEmail: vi.fn(),
}));

vi.mock('../utils/token.utils', () => ({
  storeTokens: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock('../data/mockUsers', () => ({
  isDisplayNameTaken: vi.fn(),
}));

import { register, checkEmail } from '../services/index';
import { isDisplayNameTaken } from '../data/mockUsers';

const MOCK_AUTH_RESPONSE = {
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
  expiresIn: 3600,
  user: {
    id: '2',
    username: 'newuser',
    email: 'newuser@example.com',
    avatarUrl: null,
    isVerified: false,
    isCertified: false,
    role: 'user' as const,
  },
};

const renderSignUpPage = () =>
  render(
    <MemoryRouter initialEntries={['/create-account']}>
      <SignUpPage />
    </MemoryRouter>
  );

const getBackButton = () => {
  const buttons = screen.getAllByRole('button');
  return buttons.find((b) => b.querySelector('.lucide-chevron-left')) as HTMLElement;
};

// Password that meets all requirements: uppercase, lowercase, number, special char
const VALID_PASSWORD = 'Password1!';

const goToProfileStep = async () => {
  renderSignUpPage();
  const user = userEvent.setup();
  const passwordInput = screen.getByPlaceholderText('Choose a password (min. 8 characters)');
  await user.type(passwordInput, VALID_PASSWORD);
  await waitFor(() => {
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).not.toBeDisabled();
  });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  await waitFor(() => {
    expect(screen.getByText('Tell us more about you')).toBeInTheDocument();
  });
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isDisplayNameTaken).mockReturnValue(false);
  vi.mocked(checkEmail).mockResolvedValue({ exists: false, message: 'Email available.' });
});

describe('SignUpPage — initial render (password step)', () => {
  it('renders the Create an account title', () => {
    renderSignUpPage();
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });

  it('renders the pre-filled email as read-only text', () => {
    renderSignUpPage();
    expect(screen.getByText('newuser@example.com')).toBeInTheDocument();
  });

  it('renders the password input', () => {
    renderSignUpPage();
    expect(screen.getByPlaceholderText('Choose a password (min. 8 characters)')).toBeInTheDocument();
  });

  it('renders the Need help link', () => {
    renderSignUpPage();
    expect(screen.getByText('Need help?')).toBeInTheDocument();
  });

  it('renders the navbar with logo', () => {
    renderSignUpPage();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('renders the back button', () => {
    renderSignUpPage();
    expect(getBackButton()).toBeInTheDocument();
  });
});

describe('SignUpPage — password button state', () => {
  it('Continue button is disabled when password is empty', () => {
    renderSignUpPage();
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('Continue button is disabled when password has less than 8 characters', async () => {
    renderSignUpPage();
    const user = userEvent.setup();
    const passwordInput = screen.getByPlaceholderText('Choose a password (min. 8 characters)');
    await user.type(passwordInput, 'short');
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('Continue button is enabled when password meets all requirements', async () => {
    renderSignUpPage();
    const user = userEvent.setup();
    const passwordInput = screen.getByPlaceholderText('Choose a password (min. 8 characters)');
    await user.type(passwordInput, VALID_PASSWORD);
    await waitFor(() => {
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).not.toBeDisabled();
    });
  });
});

describe('SignUpPage — password visibility toggle', () => {
  it('password input is hidden by default', () => {
    renderSignUpPage();
    const passwordInput = screen.getByPlaceholderText('Choose a password (min. 8 characters)');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when eye button is clicked', async () => {
    renderSignUpPage();
    const passwordInput = screen.getByPlaceholderText('Choose a password (min. 8 characters)');
    const eyeBtn = screen.getAllByRole('button').find(
      (b) => b.querySelector('.lucide-eye')
    ) as HTMLElement;
    fireEvent.click(eyeBtn);
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });
});

describe('SignUpPage — back button', () => {
  it('back button on password step navigates to /signin', () => {
    renderSignUpPage();
    fireEvent.click(getBackButton());
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('back button on profile step returns to password step', async () => {
    await goToProfileStep();
    fireEvent.click(getBackButton());
    await waitFor(() => {
      expect(screen.getByText('Create an account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Choose a password (min. 8 characters)')).toBeInTheDocument();
    });
  });
});

describe('SignUpPage — profile step', () => {
  it('moves to profile step after valid password', async () => {
    await goToProfileStep();
    expect(screen.getByText('Tell us more about you')).toBeInTheDocument();
  });

  it('renders display name field with email prefix pre-filled', async () => {
    await goToProfileStep();
    const displayNameInput = screen.getByDisplayValue('newuser') as HTMLInputElement;
    expect(displayNameInput).toBeInTheDocument();
  });

  it('renders date of birth dropdowns', async () => {
    await goToProfileStep();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
  });

  it('renders gender dropdown', async () => {
    await goToProfileStep();
    expect(screen.getByText(/gender \(required\)/i)).toBeInTheDocument();
  });

  it('Continue button is disabled when profile fields are incomplete', async () => {
    await goToProfileStep();
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it('shows error when display name is already taken', async () => {
    vi.mocked(isDisplayNameTaken).mockReturnValue(true);
    await goToProfileStep();
    const user = userEvent.setup();
    const displayNameInput = screen.getByDisplayValue('newuser');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'TakenName');
    await waitFor(() => {
      expect(screen.getByText(/already taken/i)).toBeInTheDocument();
    });
  });

  it('shows error when display name is empty', async () => {
    await goToProfileStep();
    const user = userEvent.setup();
    const displayNameInput = screen.getByDisplayValue('newuser');
    await user.clear(displayNameInput);
    await waitFor(() => {
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
    });
  });
});

describe('SignUpPage — profile form completion', () => {
  const fillProfileForm = async () => {
    const user = await goToProfileStep();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '3' } });
    fireEvent.change(selects[1], { target: { value: '15' } });
    fireEvent.change(selects[2], { target: { value: '2000' } });
    fireEvent.change(selects[3], { target: { value: 'FEMALE' } });
    return user;
  };

  it('Continue button activates when all profile fields are filled', async () => {
    await fillProfileForm();
    await waitFor(() => {
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).not.toBeDisabled();
    });
  });

  it('calls register service with correct data on submit', async () => {
    vi.mocked(register).mockResolvedValue(MOCK_AUTH_RESPONSE);
    await fillProfileForm();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newuser@example.com',
          password: VALID_PASSWORD,
        })
      );
    });
  });

  it('navigates to /verify-email on successful registration', async () => {
    vi.mocked(register).mockResolvedValue(MOCK_AUTH_RESPONSE);
    await fillProfileForm();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/verify-email',
        expect.objectContaining({ state: expect.objectContaining({ email: 'newuser@example.com' }) })
      );
    });
  });

  it('shows error message on failed registration', async () => {
    vi.mocked(register).mockRejectedValue({
      response: {
        status: 409,
        data: { error: { message: 'Email already in use.' } },
      },
    });
    await fillProfileForm();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });
});