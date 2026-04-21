import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from '../components/AuthLayout';

describe('AuthLayout — rendering', () => {
  it('renders children inside the layout', () => {
    render(
      <AuthLayout>
        <p>Test content</p>
      </AuthLayout>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders the SoundCloud branding text', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(screen.getByText('SoundCloud')).toBeInTheDocument();
  });

  it('renders the Sign in link', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders the Create account link', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<AuthLayout><div /></AuthLayout>);
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('Sign in link points to /signin', () => {
    render(<AuthLayout><div /></AuthLayout>);
    const signInLink = screen.getByText('Sign in').closest('a');
    expect(signInLink).toHaveAttribute('href', '/signin');
  });

  it('Create account link points to /create-account', () => {
    render(<AuthLayout><div /></AuthLayout>);
    const createLink = screen.getByText('Create account').closest('a');
    expect(createLink).toHaveAttribute('href', '/create-account');
  });

  it('renders the logo SVG', () => {
    render(<AuthLayout><div /></AuthLayout>);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders a header element', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(document.querySelector('header')).toBeInTheDocument();
  });

  it('renders a main element', () => {
    render(<AuthLayout><div /></AuthLayout>);
    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <AuthLayout>
        <p>First</p>
        <p>Second</p>
      </AuthLayout>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});