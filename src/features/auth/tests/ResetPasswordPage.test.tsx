// ============================================================
// ResetPasswordPage.test.tsx
// Location: src/features/auth/tests/ResetPasswordPage.test.tsx
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// ── Mocks ──────────────────────────────────────────────────────
const mockNavigate = vi.fn();

// We control the token via this variable
// Tests can change it before rendering
let mockToken: string | null = 'abc123';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [
      {
        get: (key: string) => (key === 'token' ? mockToken : null),
      },
    ],
  };
});

// ── Helpers ───────────────────────────────────────────────────
const renderPage = () =>
  render(
    <MemoryRouter>
      <ResetPasswordPage />
    </MemoryRouter>
  );

// Gets password inputs by type since they have no placeholder after typing
const getPasswordInputs = () =>
  document.querySelectorAll('input[type="password"], input[type="text"]');

beforeEach(() => {
  vi.clearAllMocks();
  mockToken = 'abc123'; // reset to valid token before each test
});

// ════════════════════════════════════════════════════════════════
// INITIAL RENDER
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — initial render', () => {
  it('renders the Change your password title', () => {
    renderPage();
    expect(screen.getByText('Change your password')).toBeInTheDocument();
  });

  it('renders the subtitle help text', () => {
    renderPage();
    expect(screen.getByText(/choose a strong, unique password/i)).toBeInTheDocument();
  });

  it('renders new password label', () => {
    renderPage();
    expect(screen.getByText('Type your new password')).toBeInTheDocument();
  });

  it('renders confirm password label', () => {
    renderPage();
    expect(screen.getByText('Type your new password again, to confirm')).toBeInTheDocument();
  });

  it('renders the sign out everywhere checkbox text', () => {
    renderPage();
    expect(screen.getByText('Also sign me out everywhere')).toBeInTheDocument();
  });

  it('renders the Save button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders Tunify branding', () => {
    renderPage();
    expect(screen.getByText('Tunify')).toBeInTheDocument();
  });

  it('does NOT show any error on initial load', () => {
    renderPage();
    expect(screen.queryByText(/do not match/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/at least 8/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid or has expired/i)).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════
// SAVE BUTTON STATE
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — Save button state', () => {
  it('Save button is disabled when both fields are empty', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('Save button is disabled when only new password is filled', async () => {
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');
    await user.type(pwInputs[0], 'Password123');
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('Save button is disabled when both fields have less than 8 characters', async () => {
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');
    await user.type(pwInputs[0], 'short');
    await user.type(pwInputs[1], 'short');
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('Save button is enabled when both fields have 8+ characters', async () => {
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');
    await user.type(pwInputs[0], 'Password123');
    await user.type(pwInputs[1], 'Password123');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });
  });
});

// ════════════════════════════════════════════════════════════════
// VALIDATION ERRORS
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — validation errors', () => {
  it('shows error when passwords do not match', async () => {
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');

    await user.type(pwInputs[0], 'Password123');
    await user.type(pwInputs[1], 'Different456');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });
  });

  it('clears error when user types after mismatch error', async () => {
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');

    await user.type(pwInputs[0], 'Password123');
    await user.type(pwInputs[1], 'Different456');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument();
    });

    // Type more — error should clear
    await user.type(pwInputs[1], 'x');

    await waitFor(() => {
      expect(screen.queryByText(/do not match/i)).not.toBeInTheDocument();
    });
  });
});

// ════════════════════════════════════════════════════════════════
// NO TOKEN IN URL
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — no token in URL', () => {
  it('shows invalid link error when no token and Save is clicked', async () => {
    mockToken = null; // simulate no token in URL
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');

    await user.type(pwInputs[0], 'Password123');
    await user.type(pwInputs[1], 'Password123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
    });
  });
});

// ════════════════════════════════════════════════════════════════
// SUCCESS STATE
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — success state', () => {
  const submitValidForm = async () => {
    renderPage();
    const user = userEvent.setup();
    const pwInputs = document.querySelectorAll('input[type="password"]');

    await user.type(pwInputs[0], 'Password123');
    await user.type(pwInputs[1], 'Password123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Password changed')).toBeInTheDocument();
    });
  };

  it('shows Password changed heading on success', async () => {
    await submitValidForm();
    expect(screen.getByText('Password changed')).toBeInTheDocument();
  });

  it('shows updated successfully text on success', async () => {
    await submitValidForm();
    expect(screen.getByText(/updated successfully/i)).toBeInTheDocument();
  });

  it('shows Sign in button on success', async () => {
    await submitValidForm();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('Sign in button navigates to /signin', async () => {
    await submitValidForm();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('does NOT show the password form on success', async () => {
    await submitValidForm();
    expect(screen.queryByText('Type your new password')).not.toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════
// CHECKBOX
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — sign out everywhere checkbox', () => {
  it('checkbox is checked by default', () => {
    renderPage();
    // The checked state uses bg-[#f50] class
    const checkboxDiv = screen.getByText('Also sign me out everywhere')
      .closest('div')!
      .querySelector('div');
    expect(checkboxDiv?.className).toContain('#f50');
  });

  it('clicking checkbox area toggles it off', async () => {
    renderPage();
    const checkboxArea = screen.getByText('Also sign me out everywhere').closest('div')!;
    fireEvent.click(checkboxArea);

    await waitFor(() => {
      const checkboxDiv = checkboxArea.querySelector('div');
      expect(checkboxDiv?.className).toContain('#2a2a2a');
    });
  });

  it('clicking checkbox area twice returns to checked state', async () => {
    renderPage();
    const checkboxArea = screen.getByText('Also sign me out everywhere').closest('div')!;
    fireEvent.click(checkboxArea); // off
    fireEvent.click(checkboxArea); // back on

    await waitFor(() => {
      const checkboxDiv = checkboxArea.querySelector('div');
      expect(checkboxDiv?.className).toContain('#f50');
    });
  });
});

// ════════════════════════════════════════════════════════════════
// PASSWORD VISIBILITY TOGGLE
// ════════════════════════════════════════════════════════════════
describe('ResetPasswordPage — password visibility toggle', () => {
  it('both password inputs are hidden by default', () => {
    renderPage();
    const pwInputs = document.querySelectorAll('input[type="password"]');
    expect(pwInputs.length).toBe(2);
  });

  it('first eye button toggles new password visibility', async () => {
    renderPage();
    const pwInput = document.querySelectorAll('input[type="password"]')[0] as HTMLInputElement;

    const eyeBtns = screen.getAllByRole('button').filter(
      (b) => b.querySelector('.lucide-eye')
    );

    expect(pwInput).toHaveAttribute('type', 'password');
    fireEvent.click(eyeBtns[0]);

    await waitFor(() => {
      // After toggle, input type becomes text
      const inputs = document.querySelectorAll('input[type="text"]');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
