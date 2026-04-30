const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Your email or password is incorrect.',
  USER_NOT_FOUND: 'No account found with that email address.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_TAKEN: 'This username is already taken. Try another.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before signing in. Check your inbox.',
  ACCOUNT_DELETED: 'This account has been deleted.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_REFRESH_TOKEN: 'Your session is invalid. Please sign in again.',
  PASSWORD_TOO_WEAK: 'Password is too weak. Use 8+ characters, uppercase, and numbers.',
  SOCIAL_ACCOUNT_EXISTS: 'An account with this email already exists. Try signing in with email instead.',
};

export const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as any)?.response?.data;
    if (!data) return 'Something went wrong. Please try again.';

    // Mock format: { error: { code, message } }
    if (data.error && typeof data.error === 'object') {
      const code = data.error?.code;
      if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
      if (data.error?.message) return data.error.message;
    }

    if (Array.isArray(data.message) && data.message.length > 0) {
      return data.message[0];
    }
    if (typeof data.message === 'string' && data.message) {
      return data.message;
    }
  }
  return 'Something went wrong. Please try again.';
};