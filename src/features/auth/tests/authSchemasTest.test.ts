import { describe, it, expect } from 'vitest';
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas';

describe('authSchemas — additional coverage', () => {
  // ================= SIGN IN =================
  it('signInSchema passes with valid data', () => {
    const result = signInSchema.safeParse({
      email: 'test@tunify.com',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
  });

  it('signInSchema fails with invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'invalid',
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
  });

  // IMPORTANT: your schema does NOT enforce strong password
  it('signInSchema allows short password', () => {
    const result = signInSchema.safeParse({
      email: 'test@tunify.com',
      password: 'ab',
    });
    expect(result.success).toBe(true);
  });

  // ================= SIGN UP =================
  it('signUpSchema passes with all required fields', () => {
  const result = signUpSchema.safeParse({
    username: 'testuser',
    email: 'test@tunify.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    gender: 'FEMALE',
    date_of_birth: '2000-03-15',
    agreeToTerms: true,
  });

  expect(result.success).toBe(true);
});
  it('signUpSchema fails when passwords do not match', () => {
    const result = signUpSchema.safeParse({
      username: 'testuser',
      email: 'test@tunify.com',
      password: 'Password123!',
      confirmPassword: 'Different1!',
      gender: 'male',
      dateOfBirth: '2000-01-01',
      agreeToTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('signUpSchema fails when agreeToTerms is false', () => {
    const result = signUpSchema.safeParse({
      username: 'testuser',
      email: 'test@tunify.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      gender: 'male',
      dateOfBirth: '2000-01-01',
      agreeToTerms: false,
    });
    expect(result.success).toBe(false);
  });

  // ================= FORGOT PASSWORD =================
  it('forgotPasswordSchema passes with valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('forgotPasswordSchema fails with invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'notvalid',
    });
    expect(result.success).toBe(false);
  });

  // ================= RESET PASSWORD =================
  it('resetPasswordSchema passes with valid data', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'ABC123',
      newPassword: 'Password123!',
      confirmPassword: 'Password123!', // REQUIRED
    });
    expect(result.success).toBe(true);
  });

  it('resetPasswordSchema fails when passwords do not match', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'ABC123',
      newPassword: 'Password123!',
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
  });

  it('resetPasswordSchema fails when token is missing', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });
    expect(result.success).toBe(false);
  });
});