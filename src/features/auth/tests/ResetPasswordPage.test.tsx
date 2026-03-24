import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordPage from '../pages/ResetPasswordPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: { email: 'test@tunify.com' },
      pathname: '/reset-password',
    }),
  };
});

vi.mock('../services/index', () => ({
  resetPassword: vi.fn(),
}));

import { resetPassword } from '../services/index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ResetPasswordPage />
    </MemoryRouter>
  );

const getTokenInput = () =>
  screen.getByPlaceholderText(/e\.g\.\s*21d9e4/i);

const getEmailInput = () =>
  screen.getByPlaceholderText('your@email.com') as HTMLInputElement;

const getPasswordInputs = () =>
  document.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>;

const getSaveButton = () =>
  screen.getByRole('button', { name: /save new password/i });

const fillValidForm = async (token = 'ABC123', password = 'Test@1234') => {
  const user = userEvent.setup();

  await user.clear(getTokenInput());
  await user.type(getTokenInput(), token);

  const pwInputs = getPasswordInputs();
  await user.type(pwInputs[0], password);
  await user.type(pwInputs[1], password);

  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(resetPassword).mockResolvedValue({
    message: 'Password reset successfully.',
  });
});

describe('ResetPasswordPage — initial render', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
  });

  it('renders email input pre-filled from state', () => {
    renderPage();
    expect(getEmailInput().value).toBe('test@tunify.com');
  });

  it('renders the reset code input', () => {
    renderPage();
    expect(getTokenInput()).toBeInTheDocument();
  });

  it('renders the new password label', () => {
    renderPage();
    expect(screen.getByText('New password')).toBeInTheDocument();
  });

  it('renders the confirm password label', () => {
    renderPage();
    expect(screen.getByText('Confirm new password')).toBeInTheDocument();
  });

  it('renders helper text under the email field', () => {
    renderPage();
    expect(
      screen.getByText(/enter the email address associated with your account/i)
    ).toBeInTheDocument();
  });

  it('renders helper text under the reset code field', () => {
    renderPage();
    expect(
      screen.getByText(/enter the 6-character code we sent to your email inbox/i)
    ).toBeInTheDocument();
  });

  it('renders the save button', () => {
    renderPage();
    expect(getSaveButton()).toBeInTheDocument();
  });

  it('does not show any error on initial load', () => {
    renderPage();
    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/incorrect/i)).not.toBeInTheDocument();
  });

  it('renders the back button', () => {
    renderPage();
    const backBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('.lucide-chevron-left'));
    expect(backBtn).toBeInTheDocument();
  });
});

describe('ResetPasswordPage — Save button state', () => {
  it('save button is disabled when token and passwords are empty', () => {
    renderPage();
    expect(getSaveButton()).toBeDisabled();
  });

  it('save button is disabled when only passwords are filled', async () => {
    renderPage();
    const user = userEvent.setup();

    const pwInputs = getPasswordInputs();
    await user.type(pwInputs[0], 'Test@1234');
    await user.type(pwInputs[1], 'Test@1234');

    expect(getSaveButton()).toBeDisabled();
  });

  it('save button is disabled when token is less than 6 characters', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(getTokenInput(), 'ABC');

    const pwInputs = getPasswordInputs();
    await user.type(pwInputs[0], 'Test@1234');
    await user.type(pwInputs[1], 'Test@1234');

    expect(getSaveButton()).toBeDisabled();
  });

  it('save button is enabled when all fields are valid', async () => {
    renderPage();
    await fillValidForm();

    await waitFor(() => {
      expect(getSaveButton()).not.toBeDisabled();
    });
  });
});

describe('ResetPasswordPage — validation errors', () => {
  it('shows error when passwords do not match', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(getTokenInput(), 'ABC123');

    const pwInputs = getPasswordInputs();
    await user.type(pwInputs[0], 'Test@1234');
    await user.type(pwInputs[1], 'Different@1');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('clears mismatch error when user corrects confirm password to match', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.type(getTokenInput(), 'ABC123');

    const pwInputs = getPasswordInputs();
    await user.type(pwInputs[0], 'Test@1234');
    await user.type(pwInputs[1], 'Different@1');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    await user.clear(pwInputs[1]);
    await user.type(pwInputs[1], 'Test@1234');

    await waitFor(() => {
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
  });
});

describe('ResetPasswordPage — success state', () => {
  it('calls resetPassword service with correct params on submit', async () => {
    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    await waitFor(() => {
      expect(getSaveButton()).not.toBeDisabled();
    });

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith(
        'test@tunify.com',
        'ABC123',
        'Test@1234',
        'Test@1234',
        true
      );
    });
  });

  it('navigates to /signin after successful password reset', async () => {
    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    await waitFor(() => {
      expect(getSaveButton()).not.toBeDisabled();
    });

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });
});

describe('ResetPasswordPage — password visibility toggle', () => {
  it('both password inputs are hidden by default', () => {
    renderPage();
    expect(getPasswordInputs().length).toBe(2);
  });

  it('eye button toggles password visibility', async () => {
    renderPage();

    const pwInput = getPasswordInputs()[0];
    const eyeBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('.lucide-eye')) as HTMLElement;

    expect(pwInput).toHaveAttribute('type', 'password');

    fireEvent.click(eyeBtn);

    await waitFor(() => {
      const visibleInputs = document.querySelectorAll('input[type="text"]');
      expect(visibleInputs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
describe('ResetPasswordPage — extra coverage', () => {
  

  it('shows error for invalid token length', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.clear(getTokenInput());
    await user.type(getTokenInput(), 'ABC');

    const pwInputs = getPasswordInputs();
    await user.type(pwInputs[0], 'Test@1234');
    await user.type(pwInputs[1], 'Test@1234');

    expect(getSaveButton()).toBeDisabled();
  });

  

  it('handles backend array error', async () => {
    vi.mocked(resetPassword).mockRejectedValue({
      response: { data: { message: ['Array error'] } },
    });

    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(screen.getByText('Array error')).toBeInTheDocument();
    });
  });

  it('handles token error message', async () => {
    vi.mocked(resetPassword).mockRejectedValue({
      response: { data: { message: 'invalid token' } },
    });

    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(
        screen.getByText(/incorrect or has expired/i)
      ).toBeInTheDocument();
    });
  });

  it('handles email error message', async () => {
    vi.mocked(resetPassword).mockRejectedValue({
      response: { data: { message: 'email not found' } },
    });

    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(
        screen.getByText(/no account found with that email address/i)
      ).toBeInTheDocument();
    });
  });

  it('handles generic backend error', async () => {
    vi.mocked(resetPassword).mockRejectedValue({
      response: { data: { message: 'custom error' } },
    });

    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(screen.getByText('custom error')).toBeInTheDocument();
    });
  });

  it('handles fallback error', async () => {
    vi.mocked(resetPassword).mockRejectedValue({});

    renderPage();
    await fillValidForm('ABC123', 'Test@1234');

    fireEvent.click(getSaveButton());

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong\. please try again\./i)
      ).toBeInTheDocument();
    });
  });

  it('toggles password visibility for the first password field', async () => {
    renderPage();

    const pwInput = getPasswordInputs()[0];
    const eyeBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('.lucide-eye')) as HTMLElement;

    expect(pwInput).toHaveAttribute('type', 'password');

    fireEvent.click(eyeBtn);

    await waitFor(() => {
      expect(pwInput).toHaveAttribute('type', 'text');
    });
  });

  it('navigates back when clicking the chevron button', () => {
    renderPage();

    const backBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('.lucide-chevron-left')) as HTMLElement;

    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalled();
  });
});