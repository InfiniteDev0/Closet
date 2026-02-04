/**
 * Production-grade input validation utilities
 */

/**
 * Email validation with comprehensive regex
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  if (email.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }

  return { isValid: true, error: null };
};

/**
 * Password validation with strength requirements
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  if (!password) {
    return { isValid: false, error: "Password is required", strength: 0 };
  }

  const errors = [];
  let strength = 0;

  // Length check
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  } else {
    strength += 20;
  }

  if (password.length >= 12) {
    strength += 10;
  }

  // Uppercase check
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (/[A-Z]/.test(password)) {
    strength += 20;
  }

  // Lowercase check
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (/[a-z]/.test(password)) {
    strength += 20;
  }

  // Number check
  if (requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else if (/\d/.test(password)) {
    strength += 20;
  }

  // Special character check
  if (
    requireSpecial &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 10;
  }

  // Check for common weak passwords
  const weakPasswords = ["password", "12345678", "qwerty123", "abc12345"];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common");
    strength = 10;
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(". "),
    strength: Math.min(strength, 100),
  };
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

/**
 * Validate display name
 */
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }

  const sanitizedName = sanitizeInput(name);

  if (sanitizedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters" };
  }

  if (sanitizedName.length > 50) {
    return { isValid: false, error: "Name is too long (max 50 characters)" };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(sanitizedName)) {
    return { isValid: false, error: "Name contains invalid characters" };
  }

  return { isValid: true, error: null, sanitizedName };
};

/**
 * Validate URL
 */
export const validateUrl = (url) => {
  if (!url) {
    return { isValid: false, error: "URL is required" };
  }

  try {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";

    return {
      isValid: true,
      error: null,
      isSecure: isHttps,
      warning: !isHttps ? "URL should use HTTPS for security" : null,
    };
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }
};
