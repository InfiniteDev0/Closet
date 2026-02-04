/**
 * Production-grade token management
 * Handles token refresh, expiry, and secure storage
 */

import { auth } from "./firebase";
import { logger } from "./logger";

const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes (tokens expire at 60 min)
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

let refreshTimer = null;

/**
 * Get current auth token with automatic refresh
 */
export const getAuthToken = async (forceRefresh = false) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      logger.warn("No authenticated user found");
      return null;
    }

    // Get token result to check expiry
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    const expirationTime = new Date(tokenResult.expirationTime).getTime();
    const now = Date.now();

    // If token expires soon, force refresh
    if (expirationTime - now < TOKEN_EXPIRY_BUFFER) {
      logger.info("Token expiring soon, forcing refresh");
      return await user.getIdToken(true);
    }

    return tokenResult.token;
  } catch (error) {
    logger.error("Failed to get auth token", error);
    throw error;
  }
};

/**
 * Start automatic token refresh
 */
export const startTokenRefresh = () => {
  // Clear existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Set up refresh timer
  refreshTimer = setInterval(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true);
        logger.info("Token refreshed automatically");

        // Update cookie with new token
        const newToken = await user.getIdToken();
        updateAuthCookie(newToken);
      }
    } catch (error) {
      logger.error("Auto token refresh failed", error);
      // If refresh fails, user might need to re-authenticate
      stopTokenRefresh();
    }
  }, TOKEN_REFRESH_INTERVAL);

  logger.info("Token refresh started");
};

/**
 * Stop automatic token refresh
 */
export const stopTokenRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    logger.info("Token refresh stopped");
  }
};

/**
 * Update auth token in cookie
 */
export const updateAuthCookie = (token, maxAge = 3600) => {
  if (typeof document !== "undefined") {
    document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`;
  }
};

/**
 * Get token from cookie
 */
export const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const authCookie = cookies.find((row) => row.startsWith("authToken="));

  return authCookie ? authCookie.split("=")[1] : null;
};

/**
 * Verify token is still valid
 */
export const verifyToken = async (token) => {
  if (!token) return false;

  try {
    const user = auth.currentUser;
    if (!user) return false;

    const currentToken = await user.getIdToken();
    return token === currentToken;
  } catch {
    return false;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  if (typeof window === "undefined") return;

  // Clear localStorage
  localStorage.removeItem("closet-owner");

  // Clear cookies
  document.cookie = "authToken=; path=/; max-age=0";
  document.cookie = "owner=; path=/; max-age=0";

  // Stop token refresh
  stopTokenRefresh();

  logger.info("Auth data cleared");
};

/**
 * Store user data securely
 */
export const storeUserData = async (user) => {
  try {
    const token = await user.getIdToken();

    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split("@")[0] || "User",
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      lastLogin: Date.now(),
    };

    // Store in localStorage
    localStorage.setItem("closet-owner", JSON.stringify(userData));

    // Store token in cookie
    updateAuthCookie(token);

    // Also store user data in cookie for SSR
    document.cookie = `owner=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=3600; SameSite=Strict`;

    // Start token refresh
    startTokenRefresh();

    logger.authEvent("user_data_stored", user.uid);

    return userData;
  } catch (error) {
    logger.error("Failed to store user data", error);
    throw error;
  }
};

/**
 * Get stored user data
 */
export const getStoredUserData = () => {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem("closet-owner");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error("Failed to parse stored user data", error);
    return null;
  }
};

/**
 * Validate stored data matches current user
 */
export const validateStoredData = (storedData) => {
  const user = auth.currentUser;

  if (!user || !storedData) {
    return false;
  }

  return storedData.uid === user.uid;
};

/**
 * Session timeout handler
 */
export const setupSessionTimeout = (timeoutMinutes = 60) => {
  let timeout;

  const resetTimeout = () => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(
      () => {
        logger.warn("Session timeout - logging out user");
        clearAuthData();
        window.location.href = "/account/auth?reason=timeout";
      },
      timeoutMinutes * 60 * 1000,
    );
  };

  // Reset on user activity
  if (typeof window !== "undefined") {
    ["mousedown", "keydown", "scroll", "touchstart"].forEach((event) => {
      document.addEventListener(event, resetTimeout, true);
    });
  }

  resetTimeout();

  return () => {
    if (timeout) clearTimeout(timeout);
  };
};
