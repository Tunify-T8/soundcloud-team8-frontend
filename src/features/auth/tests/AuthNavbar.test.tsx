import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <AuthNavbar />
    </MemoryRouter>
  );

describe('AuthNavbar — rendering', () => {
  it('renders the navbar', () => {
    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the Home link', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders the Feed link', () => {
    renderNavbar();
    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  it('renders the Library link', () => {
    renderNavbar();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('renders the Sign in link', () => {
    renderNavbar();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders the Create account link', () => {
    renderNavbar();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('renders the Upload link', () => {
    renderNavbar();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderNavbar();
    expect(screen.getByPlaceholderText(/search for artists/i)).toBeInTheDocument();
  });

  it('Sign in link points to /signin', () => {
    renderNavbar();
    const link = screen.getByText('Sign in').closest('a');
    expect(link).toHaveAttribute('href', '/signin');
  });

  it('Create account link points to /create-account', () => {
    renderNavbar();
    const link = screen.getByText('Create account').closest('a');
    expect(link).toHaveAttribute('href', '/create-account');
  });
});