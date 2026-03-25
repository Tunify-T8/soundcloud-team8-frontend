import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthInput } from '../components/AuthInput';

describe('AuthInput — rendering', () => {
  it('renders input element', () => {
    render(<AuthInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<AuthInput label="Email" id="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(<AuthInput />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<AuthInput error="This field is required" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does not render error message when no error', () => {
    render(<AuthInput />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('associates label with input via id', () => {
    render(<AuthInput label="Password" id="password" type="password" />);
    const label = screen.getByText('Password');
    expect(label).toHaveAttribute('for', 'password');
  });

  it('passes through placeholder prop', () => {
    render(<AuthInput placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('passes through type prop', () => {
    render(<AuthInput type="password" />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('renders as disabled when disabled prop is passed', () => {
    render(<AuthInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<AuthInput className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-class');
  });

  it('applies error border styles when error is present', () => {
    render(<AuthInput error="Error!" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('applies normal border styles when no error', () => {
    render(<AuthInput />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-white/10');
  });
});