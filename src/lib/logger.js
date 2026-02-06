/**
 * Production-grade logging utility
 * Provides structured logging with different levels
 */

import * as Sentry from "@sentry/nextjs";

const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Format log message with timestamp and context
   */
  _formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...context,
      environment: process.env.NODE_ENV,
    };
  }

  /**
   * Send logs to external service in production
   * Integrated with Sentry for error tracking
   */
  _sendToLoggingService(logData) {
    if (this.isProduction) {
      try {
        // Send to Sentry based on log level
        if (logData.level === LOG_LEVELS.ERROR) {
          if (logData.error) {
            // Capture exception with context
            Sentry.captureException(new Error(logData.message), {
              level: "error",
              extra: logData,
            });
          } else {
            // Capture message
            Sentry.captureMessage(logData.message, "error");
          }
        } else if (logData.level === LOG_LEVELS.WARN) {
          Sentry.captureMessage(logData.message, "warning");
        } else {
          // For info/debug, add breadcrumb
          Sentry.addBreadcrumb({
            message: logData.message,
            level: logData.level,
            data: logData,
          });
        }
      } catch (error) {
        // Fallback to console if Sentry fails
        console.error("[Logger] Failed to send to Sentry:", error);
        console.log("[PRODUCTION LOG]", logData);
      }
    }
  }

  error(message, error = null, context = {}) {
    const logData = this._formatMessage(LOG_LEVELS.ERROR, message, {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          }
        : null,
    });

    console.error(message, logData);
    this._sendToLoggingService(logData);

    return logData;
  }

  warn(message, context = {}) {
    const logData = this._formatMessage(LOG_LEVELS.WARN, message, context);
    console.warn(message, logData);

    if (this.isProduction) {
      this._sendToLoggingService(logData);
    }

    return logData;
  }

  info(message, context = {}) {
    if (this.isDevelopment) {
      const logData = this._formatMessage(LOG_LEVELS.INFO, message, context);
      console.info(message, logData);
      return logData;
    }
  }

  debug(message, context = {}) {
    if (this.isDevelopment) {
      const logData = this._formatMessage(LOG_LEVELS.DEBUG, message, context);
      console.debug(message, logData);
      return logData;
    }
  }

  /**
   * Log authentication events
   */
  authEvent(event, userId = null, metadata = {}) {
    const message = `Auth Event: ${event}`;
    const context = {
      event,
      userId,
      ...metadata,
    };

    if (this.isDevelopment) {
      this.info(message, context);
    } else {
      // In production, send auth events to analytics
      this._sendToLoggingService(
        this._formatMessage(LOG_LEVELS.INFO, message, context),
      );
    }
  }

  /**
   * Log performance metrics
   */
  performance(metric, value, context = {}) {
    if (this.isDevelopment) {
      console.log(`[PERFORMANCE] ${metric}: ${value}ms`, context);
    }

    // Send to Sentry performance monitoring
    if (this.isProduction) {
      Sentry.addBreadcrumb({
        category: "performance",
        message: `${metric}: ${value}ms`,
        level: "info",
        data: context,
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
