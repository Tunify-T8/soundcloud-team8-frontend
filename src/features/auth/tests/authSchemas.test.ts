// ============================================================
// authSchemas.test.ts
// Location: src/features/auth/tests/authSchemas.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas';

// signInSchema
describe('signInSchema', () => {
  it('passes with valid email and password', () => {
    const result = signInSchema.safeParse({
      email: 'test@tunify.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('fails when email is empty', () => {
    const result = signInSchema.safeParse({
      email: '',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
  });

  it('fails when email is invalid format', () => {
    const result = signInSchema.safeParse({
      email: 'notanemail',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
  });

  it('fails when password is empty', () => {
    const result = signInSchema.safeParse({
      email: 'test@tunify.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails when both fields are missing', () => {
    const result = signInSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('returns email error message for invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'bademail',
      password: 'Password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === 'email');
      expect(emailError).toBeDefined();
    }
  });
});

// signUpSchema
describe('signUpSchema', () => {
  const validData = {
    username: 'testuser',
    email: 'test@tunify.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    agreeToTerms: true,
  };

  it('passes with all valid fields', () => {
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails when email is empty', () => {
    const result = signUpSchema.safeParse({ ...validData, email: '' });
    expect(result.success).toBe(false);
  });

  it('fails when email is invalid format', () => {
    const result = signUpSchema.safeParse({ ...validData, email: 'bademail' });
    expect(result.success).toBe(false);
  });

  it('fails when password is less than 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('passes when password is exactly 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: 'Exact123',
      confirmPassword: 'Exact123',
    });
    expect(result.success).toBe(true);
  });

  it('fails when passwords do not match', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: 'Password123',
      confirmPassword: 'Different123',
    });
    expect(result.success).toBe(false);
  });

  it('fails when agreeToTerms is false', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      agreeToTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('fails when username is missing', () => {
    const { username, ...rest } = validData;
    const result = signUpSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('returns confirmPassword error when passwords do not match', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      confirmPassword: 'DifferentPassword',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === 'confirmPassword'
      );
      expect(confirmError).toBeDefined();
    }
  });
});

// forgotPasswordSchema
describe('forgotPasswordSchema', () => {
  it('passes with a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'test@tunify.com' });
    expect(result.success).toBe(true);
  });

  it('fails with an empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('fails with an invalid email format', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'notanemail' });
    expect(result.success).toBe(false);
  });

  it('fails when email field is missing', () => {
    const result = forgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('passes with different valid email formats', () => {
    const emails = [
      'user@example.com',
      'user.name@domain.co',
      'user+tag@mail.org',
    ];
    for (let i = 0; i < emails.length; i++) {
      const result = forgotPasswordSchema.safeParse({ email: emails[i] });
      expect(result.success).toBe(true);
    }
  });
});

// resetPasswordSchema (if it exists in your schemas file)
describe('resetPasswordSchema', () => {
  it('passes with valid token and new password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      newPassword: 'NewPassword123',
    });
    expect(result.success).toBe(true);
  });

  it('fails when token is missing', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'NewPassword123',
    });
    expect(result.success).toBe(false);
  });

  it('fails when newPassword is missing', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123' });
    expect(result.success).toBe(false);
  });

  it('fails when newPassword is less than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      newPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('passes when newPassword is exactly 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      newPassword: 'Exact123',
    });
    expect(result.success).toBe(true);
  });
});
