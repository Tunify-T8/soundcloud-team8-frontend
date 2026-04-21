import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialAuthButton } from '../components/SocialAuthButton';

describe('SocialAuthButton — facebook', () => {
  it('renders Continue with Facebook label', () => {
    render(<SocialAuthButton provider="facebook" />);
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<SocialAuthButton provider="facebook" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SocialAuthButton provider="facebook" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<SocialAuthButton provider="facebook" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<SocialAuthButton provider="facebook" isLoading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows Connecting... when isLoading is true', () => {
    render(<SocialAuthButton provider="facebook" isLoading />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });
});

describe('SocialAuthButton — google', () => {
  it('renders Continue with Google label', () => {
    render(<SocialAuthButton provider="google" />);
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('is not disabled by default', () => {
    render(<SocialAuthButton provider="google" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});

describe('SocialAuthButton — apple', () => {
  it('renders Continue with Apple label', () => {
    render(<SocialAuthButton provider="apple" />);
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
  });

  it('is not disabled by default', () => {
    render(<SocialAuthButton provider="apple" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});

describe('SocialAuthButton — general behavior', () => {
  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<SocialAuthButton provider="facebook" disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has type button to prevent form submission', () => {
    render(<SocialAuthButton provider="google" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('shows provider label when not loading', () => {
    render(<SocialAuthButton provider="apple" isLoading={false} />);
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
  });
});