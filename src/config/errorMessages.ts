export const ERROR_MESSAGES: Record<string, string> = {
  // BACKEND-RELATED MESSAGES
  // Authentication & Credentials
  INVALID_CREDENTIALS: "The username or password is incorrect.",
  AUTH_FAILED: "Authentication failed. Please try signing in again.",
  INCORRECT_PASSWORD:
    "Your current password appears to be incorrect. Please verify and try again.",
  ACCOUNT_NOT_FOUND: "No account was found with those details.",
  ACCOUNT_HAS_NO_EMAIL: "This account does not have a linked email address.",
  USERNAME_OR_EMAIL_TAKEN: "Username or email is already taken",
  INCORRECT_EMAIL: "Your old email is not correct",

  // One-Time Passwords (OTP)
  OTP_NOT_FOUND:
    "No active verification code was found. Please request a new one.",
  OTP_EXPIRED: "Your verification code has expired. Please send a new code.",
  INVALID_OTP:
    "The verification code you entered is invalid. Please double-check it.",

  // Collections Management
  COLLECTION_ALREADY_EXISTS: "You already have this collection.",

  // Bricks Management
  BRICK_EDIT_FORBIDDEN: "You do not have permission to modify this item.",

  // External / AI Engine Errors
  INVALID_EXPLANATION_RESPONSE:
    "We couldn't generate a clear explanation right now. Please try again in a moment.",

  // FRONTEND-RELATED LOGIC
  // Fallbacks
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  UNKNOWN_ERROR: "Sorry, something unknown went wrong.",
};
