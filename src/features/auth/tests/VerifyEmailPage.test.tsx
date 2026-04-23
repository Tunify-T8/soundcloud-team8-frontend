import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VerifyEmailPage from '../pages/VerifyEmailPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: { email: 'test@tunify.com' },
      pathname: '/verify-email',
    }),
  };
});

vi.mock('../services/index', () => ({
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
}));

vi.mock('../utils/token.utils', () => ({
  storeTokens: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  clearTokens: vi.fn(),
}));

import { verifyEmail, resendVerification } from '../services/index';
import { storeTokens } from '../utils/token.utils';

const renderPage = () =>
  render(
    <MemoryRouter>
      <VerifyEmailPage />
    </MemoryRouter>
  );

// IMPORTANT: only grab the 6 verification boxes, not the navbar search input
const getCodeInputs = () =>
  screen
    .getAllByRole('textbox')
    .filter((input) => input.getAttribute('maxlength') === '1') as HTMLInputElement[];

const typeCode = async (code = 'ABC123') => {
  const inputs = getCodeInputs();

  for (let i = 0; i < Math.min(code.length, inputs.length); i++) {
    fireEvent.change(inputs[i], { target: { value: code[i] } });
  }
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(verifyEmail).mockResolvedValue({
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
    expiresIn: 3600,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@tunify.com',
      avatarUrl: null,
      isCertified: true,
      role: 'user',
    },
  });

  vi.mocked(resendVerification).mockResolvedValue({
    message: 'Code resent.',
  });
});

describe('VerifyEmailPage — initial render', () => {
  it('renders the Verify your email title', () => {
    renderPage();
    expect(screen.getByText('Verify your email')).toBeInTheDocument();
  });

  it('renders the email address from location state', () => {
    renderPage();
    expect(screen.getByText('test@tunify.com')).toBeInTheDocument();
  });

  it('renders the instruction text', () => {
    renderPage();
    expect(screen.getByText(/we sent a 6-character code/i)).toBeInTheDocument();
  });

  it('renders 6 code input boxes', () => {
    renderPage();
    expect(getCodeInputs()).toHaveLength(6);
  });

  it('renders the Verify email button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
  });

  it('Verify email button is disabled on initial render', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /verify email/i })).toBeDisabled();
  });

  it('renders the Resend code button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument();
  });

  it('renders the back button', () => {
    renderPage();
    const buttons = screen.getAllByRole('button');
    const backBtn = buttons.find((b) => b.querySelector('.lucide-chevron-left'));
    expect(backBtn).toBeInTheDocument();
  });

  it('does not show any error on initial load', () => {
    renderPage();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('all code inputs start empty', () => {
    renderPage();
    getCodeInputs().forEach((input) => {
      expect(input.value).toBe('');
    });
  });
});

describe('VerifyEmailPage — code input behavior', () => {
  it('typing a character fills the input box', () => {
    renderPage();
    const inputs = getCodeInputs();

    fireEvent.change(inputs[0], { target: { value: 'A' } });

    expect(inputs[0].value).toBe('A');
  });

  it('input converts lowercase to uppercase', () => {
    renderPage();
    const inputs = getCodeInputs();

    fireEvent.change(inputs[0], { target: { value: 'a' } });

    expect(inputs[0].value).toBe('A');
  });

  it('non-alphanumeric characters are ignored', () => {
    renderPage();
    const inputs = getCodeInputs();

    fireEvent.change(inputs[0], { target: { value: '!' } });

    expect(inputs[0].value).toBe('');
  });

  it('Verify button remains disabled when fewer than 6 characters entered', () => {
    renderPage();
    const inputs = getCodeInputs();

    fireEvent.change(inputs[0], { target: { value: 'A' } });
    fireEvent.change(inputs[1], { target: { value: 'B' } });

    expect(screen.getByRole('button', { name: /verify email/i })).toBeDisabled();
  });

  it('Verify button becomes enabled when all 6 boxes are filled', async () => {
    renderPage();

    await typeCode('ABC123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify email/i })).not.toBeDisabled();
    });
  });

  it('paste fills all 6 boxes at once', async () => {
    renderPage();
    const inputs = getCodeInputs();

    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => 'XYZ789',
      },
    });

    await waitFor(() => {
      const updatedInputs = getCodeInputs();
      expect(updatedInputs[0].value).toBe('X');
      expect(updatedInputs[1].value).toBe('Y');
      expect(updatedInputs[2].value).toBe('Z');
      expect(updatedInputs[3].value).toBe('7');
      expect(updatedInputs[4].value).toBe('8');
      expect(updatedInputs[5].value).toBe('9');
    });
  });

  it('backspace on empty box does not throw', () => {
    renderPage();
    const inputs = getCodeInputs();

    expect(() => {
      fireEvent.keyDown(inputs[1], { key: 'Backspace', code: 'Backspace' });
    }).not.toThrow();
  });
});

describe('VerifyEmailPage — verify flow', () => {
  it('calls verifyEmail with correct email and code on submit', async () => {
    renderPage();

    await typeCode('ABC123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify email/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith('test@tunify.com', 'ABC123');
    });
  });

  it('stores tokens on successful verification', async () => {
    renderPage();

    await typeCode('ABC123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify email/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(storeTokens).toHaveBeenCalledWith(
        'mock.access.token',
        'mock.refresh.token',
        3600
      );
    });
  });

  it('navigates to / after successful verification', async () => {
    renderPage();

    await typeCode('ABC123');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify email/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows error message on failed verification', async () => {
    vi.mocked(verifyEmail).mockRejectedValue({
      response: {
        status: 400,
        data: { error: { message: 'Invalid or expired code.' } },
      },
    });

    renderPage();

    await typeCode('WRONG1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify email/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('does not call verifyEmail when button is disabled', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

    expect(verifyEmail).not.toHaveBeenCalled();
  });
});

describe('VerifyEmailPage — resend flow', () => {
  it('calls resendVerification with correct email', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      expect(resendVerification).toHaveBeenCalledWith('test@tunify.com');
    });
  });

  it('shows success message after resend', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      expect(screen.getByText(/a new code has been sent/i)).toBeInTheDocument();
    });
  });

  it('clears code boxes after successful resend', async () => {
    renderPage();

    await typeCode('ABC123');

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      getCodeInputs().forEach((input) => {
        expect(input.value).toBe('');
      });
    });
  });

  it('shows error message on failed resend', async () => {
    vi.mocked(resendVerification).mockRejectedValue({
      response: {
        status: 500,
        data: { error: { message: 'Failed to resend code.' } },
      },
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('VerifyEmailPage — back button', () => {
  it('back button navigates to /create-account', () => {
    renderPage();

    const buttons = screen.getAllByRole('button');
    const backBtn = buttons.find((b) => b.querySelector('.lucide-chevron-left')) as HTMLElement;

    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/create-account');
  });
});