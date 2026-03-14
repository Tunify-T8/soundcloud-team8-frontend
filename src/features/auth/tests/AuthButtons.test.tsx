import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthButtons from '../components/AuthButtons';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

describe('AuthButtons', () => {
  it('renders Sign In and Sign Up buttons', () => {
    render(<AuthButtons />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});

//running a single file: e.g. npm run test -- src/features/auth/tests/AuthButtons.test.tsx