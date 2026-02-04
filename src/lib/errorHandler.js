/**
 * Production-grade error handling utilities
 */

import { logger } from "./logger";

/**
 * Firebase error codes mapped to user-friendly messages
 */
const FIREBASE_ERROR_MESSAGES = {
  // Auth errors
  "auth/email-already-in-use":
    "This email is already registered. Please sign in instead.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled. Please contact support.",
  "auth/weak-password":
    "Password is too weak. Please use at least 8 characters with mixed case and numbers.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/user-not-found":
    "No account found with this email. Please sign up first.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/too-many-requests":
    "Too many failed attempts. Please try again later or reset your password.",
  "auth/popup-closed-by-user": "Sign-in cancelled. Please try again.",
  "auth/popup-blocked":
    "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
  "auth/timeout": "Request timed out. Please try again.",
  "auth/cancelled-popup-request":
    "Only one pop-up request is allowed at a time.",
  "auth/internal-error": "An internal error occurred. Please try again.",
  "auth/invalid-api-key": "Invalid API configuration. Please contact support.",
  "auth/app-deleted": "App configuration error. Please contact support.",
  "auth/expired-action-code":
    "This link has expired. Please request a new one.",
  "auth/invalid-action-code": "This link is invalid. Please request a new one.",
  "auth/requires-recent-login":
    "For security, please sign in again to continue.",

  // Network errors
  "auth/network-error": "Network error. Please check your internet connection.",

  // Storage errors
  "storage/unauthorized": "You do not have permission to access this file.",
  "storage/canceled": "Upload was cancelled.",
  "storage/unknown": "An unknown error occurred during upload.",
};

/**
 * Get user-friendly error message from Firebase error
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred";

  // Check if it's a Firebase error
  if (error.code && FIREBASE_ERROR_MESSAGES[error.code]) {
    return FIREBASE_ERROR_MESSAGES[error.code];
  }

  // Check for network errors
  if (error.message?.includes("network") || error.message?.includes("fetch")) {
    return "Network error. Please check your internet connection and try again.";
  }

  // Check for timeout errors
  if (error.message?.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // Return error message if available, otherwise generic message
  return error.message || "An unexpected error occurred. Please try again.";
};

/**
 * Handle authentication errors
 */
export const handleAuthError = (error, context = {}) => {
  const userMessage = getErrorMessage(error);

  logger.error("Authentication error", error, {
    ...context,
    errorCode: error.code,
    errorName: error.name,
  });

  return {
    userMessage,
    shouldRetry: [
      "auth/network-request-failed",
      "auth/timeout",
      "auth/internal-error",
    ].includes(error.code),
    shouldReauth: error.code === "auth/requires-recent-login",
  };
};

/**
 * Retry logic for network failures
 */
export const retryOperation = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    delayMs = 1000,
    exponentialBackoff = true,
    onRetry = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on user errors (400-499) except for network issues
      if (
        error.code &&
        !error.code.includes("network") &&
        !error.code.includes("timeout")
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with optional exponential backoff
      const delay = exponentialBackoff
        ? delayMs * Math.pow(2, attempt)
        : delayMs;

      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        operation: operation.name,
        delay,
        error: error.message,
      });

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if user is online
 */
export const isOnline = () => {
  return typeof window !== "undefined" && window.navigator.onLine;
};

/**
 * Wait for network connection
 */
export const waitForNetwork = (timeoutMs = 10000) => {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      window.removeEventListener("online", onOnline);
      reject(new Error("Network connection timeout"));
    }, timeoutMs);

    const onOnline = () => {
      clearTimeout(timeout);
      window.removeEventListener("online", onOnline);
      resolve(true);
    };

    window.addEventListener("online", onOnline);
  });
};

/**
 * Global error boundary handler
 */
export const handleGlobalError = (error, errorInfo = {}) => {
  logger.error("Global error", error, errorInfo);

  // In production, you might want to show a user-friendly error page
  if (process.env.NODE_ENV === "production") {
    // TODO: Redirect to error page or show notification
  }
};
