import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/forgot-password' }),
  };
});

vi.mock('../services/index', () => ({
  forgotPassword: vi.fn().mockResolvedValue({ message: 'Reset email sent.' }),
}));

import { forgotPassword } from '../services/index';

const renderForgotPage = () =>
  render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ForgotPasswordPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(forgotPassword).mockResolvedValue({ message: 'Reset email sent.' });
});

describe('ForgotPasswordPage — initial render', () => {
  it('renders the Reset password title', () => {
    renderForgotPage();
    expect(screen.getByText('Reset password')).toBeInTheDocument();
  });

  it('renders the email input field', () => {
    renderForgotPage();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
  });

  it('renders the Send reset link button', () => {
    renderForgotPage();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('renders the help text', () => {
    renderForgotPage();
    expect(screen.getByText(/if the email address is in our database/i)).toBeInTheDocument();
  });

  it('renders the visit our Help Center link', () => {
    renderForgotPage();
    expect(screen.getByText(/visit our help center/i)).toBeInTheDocument();
  });

  it('renders the navbar with logo', () => {
    renderForgotPage();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('does NOT show error message on initial render', () => {
    renderForgotPage();
    expect(screen.queryByText(/not valid/i)).not.toBeInTheDocument();
  });

  it('renders the back button', () => {
    renderForgotPage();
    const buttons = screen.getAllByRole('button');
    const backBtn = buttons.find((b) => b.querySelector('.lucide-chevron-left'));
    expect(backBtn).toBeInTheDocument();
  });
});

describe('ForgotPasswordPage — validation', () => {
  it('shows error when submitting with empty input', async () => {
    renderForgotPage();
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/not valid/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'notanemail');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/not valid/i)).toBeInTheDocument();
    });
  });

  it('shows error for partial email like abc@', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'abc@');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/not valid/i)).toBeInTheDocument();
    });
  });

  it('clears error when user starts typing after an error', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/not valid/i)).toBeInTheDocument();
    });
    await user.type(screen.getByPlaceholderText('your@email.com'), 'a');
    await waitFor(() => {
      expect(screen.queryByText(/not valid/i)).not.toBeInTheDocument();
    });
  });

  it('does NOT show error for valid email format before submit', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    expect(screen.queryByText(/not valid/i)).not.toBeInTheDocument();
  });
});

describe('ForgotPasswordPage — unknown email submit', () => {
  it('always shows success for any valid email format', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'unknown@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});

describe('ForgotPasswordPage — successful submit', () => {
  it('shows success card after valid email submit', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('success card shows correct instruction text', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/we've sent instructions/i)).toBeInTheDocument();
    });
  });

  it('success card shows Enter reset code button', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enter reset code/i })).toBeInTheDocument();
    });
  });

  it('success card shows spam folder help text', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/spam folder/i)).toBeInTheDocument();
    });
  });

  it('Enter reset code button navigates to /reset-password with email state', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enter reset code/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /enter reset code/i }));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/reset-password',
      expect.objectContaining({ state: expect.objectContaining({ email: 'test@tunify.com' }) })
    );
  });

  it('calls forgotPassword service with the entered email', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('test@tunify.com');
    });
  });
});

describe('ForgotPasswordPage — back button', () => {
  it('back button calls navigate(-1)', () => {
    renderForgotPage();
    const buttons = screen.getAllByRole('button');
    const backBtn = buttons.find((b) => b.querySelector('.lucide-chevron-left')) as HTMLElement;
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('back button on success card returns to email input card', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'test@tunify.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
    const buttons = screen.getAllByRole('button');
    const backBtn = buttons.find((b) => b.querySelector('.lucide-chevron-left')) as HTMLElement;
    fireEvent.click(backBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    });
  });
});

describe('ForgotPasswordPage — keyboard interaction', () => {
  it('pressing Enter in email input triggers submit', async () => {
    renderForgotPage();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('your@email.com'), 'bad');
    fireEvent.keyDown(screen.getByPlaceholderText('your@email.com'), {
      key: 'Enter',
      code: 'Enter',
    });
    await waitFor(() => {
      expect(screen.getByText(/not valid/i)).toBeInTheDocument();
    });
  });
});