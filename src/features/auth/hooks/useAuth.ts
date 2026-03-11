// ── Error code → human message map ───────────────────────────
// These match your backend's exact error codes from the API docs
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Your email or password is incorrect.',
  USER_NOT_FOUND: 'No account found with that email address.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_TAKEN: 'This username is already taken. Try another.',
  EMAIL_NOT_VERIFIED:
    'Please verify your email before signing in. Check your inbox.',
  ACCOUNT_DELETED: 'This account has been deleted.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_REFRESH_TOKEN: 'Your session is invalid. Please sign in again.',
  PASSWORD_TOO_WEAK:
    'Password is too weak. Use 8+ characters, uppercase, and numbers.',
  SOCIAL_ACCOUNT_EXISTS:
    'An account with this email already exists. Try signing in with email instead.',
};

// ── extractErrorMessage ───────────────────────────────────────
// This is what your SignInPage imports:
//   import { extractErrorMessage } from '../hooks/useAuth';
//
// It takes an unknown error from a catch block and returns
// a readable string to show the user.
//
// Example:
//   catch (error) {
//     const message = extractErrorMessage(error); // "Your email or password is incorrect."
//     setApiError(message);
//   }
export const extractErrorMessage = (error: unknown): string => {
  // Try to read the error code from Axios error response
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = (error.response as { data?: { error?: { code?: string; message?: string } } }).data;
    const code = data?.error?.code;
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
    // Fall back to the message from the server if code not in our map
    if (data?.error?.message) {
      return data.error.message;
    }
  }

  // Generic fallback
  return 'Something went wrong. Please try again.';
};
