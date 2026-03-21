/**
 * Error Handler Infrastructure
 * Centralized error handling with logging, categorization, and recovery
 */

import { Logger } from './logger.js';
import { TimeService } from './timeService.js';

/**
 * Error types
 */
export const ErrorType = {
  VALIDATION: 'ValidationError',
  DATABASE: 'DatabaseError',
  NETWORK: 'NetworkError',
  AUTHENTICATION: 'AuthenticationError',
  AUTHORIZATION: 'AuthorizationError',
  NOT_FOUND: 'NotFoundError',
  CONFLICT: 'ConflictError',
  BUSINESS_RULE: 'BusinessRuleError',
  SYSTEM: 'SystemError',
  UNKNOWN: 'UnknownError',
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, severity = ErrorSeverity.MEDIUM, details = {}) {
    super(message);
    this.name = type;
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = TimeService.getCurrentTimestamp();
    this.stack = new Error().stack;
  }

  /**
   * Convert error to JSON
   * @returns {Object} Error object
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Error Handler class
 */
export class ErrorHandler {
  constructor() {
    this.logger = new Logger('ErrorHandler');
    this.errors = [];
    this.errorCallbacks = [];
  }

  /**
   * Handle an error
   * @param {Error|AppError} error - Error to handle
   * @param {string} context - Context where error occurred
   * @returns {Object} Handled error result
   */
  handle(error, context = 'Unknown') {
    const handledError = this.processError(error, context);

    // Log the error
    this.logError(handledError);

    // Store the error
    this.storeError(handledError);

    // Execute callbacks
    this.executeCallbacks(handledError);

    // Return formatted error response
    return this.formatErrorResponse(handledError);
  }

  /**
   * Process error into standard format
   * @param {Error} error - Raw error
   * @param {string} context - Context
   * @returns {Object} Processed error
   */
  processError(error, context) {
    if (error instanceof AppError) {
      return {
        ...error.toJSON(),
        context,
      };
    }

    // Categorize error by type
    const type = this.categorizeError(error);
    const severity = this.determineSeverity(error, type);

    return {
      name: error.name || 'Error',
      type,
      message: error.message || 'An unknown error occurred',
      severity,
      details: {
        originalError: error.toString(),
        cause: error.cause,
      },
      timestamp: TimeService.getCurrentTimestamp(),
      context,
      stack: error.stack,
    };
  }

  /**
   * Categorize error by analyzing message and properties
   * @param {Error} error - Error to categorize
   * @returns {string} Error type
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (
      message.includes('database') ||
      message.includes('storage') ||
      message.includes('query')
    ) {
      return ErrorType.DATABASE;
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('request')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('not found') || message.includes('missing')) {
      return ErrorType.NOT_FOUND;
    }
    if (message.includes('conflict') || message.includes('duplicate')) {
      return ErrorType.CONFLICT;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('authorization')) {
      return ErrorType.AUTHORIZATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   * @param {Error} error - Error
   * @param {string} type - Error type
   * @returns {string} Severity level
   */
  determineSeverity(error, type) {
    switch (type) {
      case ErrorType.VALIDATION:
        return ErrorSeverity.LOW;
      case ErrorType.NOT_FOUND:
        return ErrorSeverity.LOW;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.MEDIUM;
      case ErrorType.DATABASE:
      case ErrorType.NETWORK:
        return ErrorSeverity.HIGH;
      case ErrorType.SYSTEM:
        return ErrorSeverity.CRITICAL;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Log error with appropriate level
   * @param {Object} error - Processed error
   */
  logError(error) {
    const logMessage = `${error.type} in ${error.context}: ${error.message}`;

    switch (error.severity) {
      case ErrorSeverity.LOW:
        this.logger.warn(logMessage, error);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.error(logMessage, error);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        this.logger.fatal(logMessage, error);
        break;
      default:
        this.logger.error(logMessage, error);
    }
  }

  /**
   * Store error for later analysis
   * @param {Object} error - Processed error
   */
  storeError(error) {
    this.errors.push(error);

    // Persist to storage
    try {
      const storedErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      storedErrors.push(error);

      // Keep only last 500 errors
      const trimmed = storedErrors.slice(-500);
      localStorage.setItem('error_logs', JSON.stringify(trimmed));
    } catch (e) {
      // Fail silently
    }
  }

  /**
   * Execute error callbacks
   * @param {Object} error - Processed error
   */
  executeCallbacks(error) {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (e) {
        console.error('Error in error callback:', e);
      }
    });
  }

  /**
   * Format error response
   * @param {Object} error - Processed error
   * @returns {Object} Error response
   */
  formatErrorResponse(error) {
    return {
      success: false,
      error: {
        type: error.type,
        message: this.getUserFriendlyMessage(error),
        code: this.getErrorCode(error.type),
        timestamp: error.timestamp,
      },
      details: this.shouldExposeDetails(error) ? error.details : undefined,
    };
  }

  /**
   * Get user-friendly error message
   * @param {Object} error - Error
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(error) {
    const messages = {
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.DATABASE]: 'Unable to access data. Please try again later.',
      [ErrorType.NETWORK]: 'Network error. Please check your connection.',
      [ErrorType.AUTHENTICATION]: 'Authentication failed. Please log in again.',
      [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.CONFLICT]: 'This operation conflicts with existing data.',
      [ErrorType.BUSINESS_RULE]: error.message,
      [ErrorType.SYSTEM]: 'A system error occurred. Please contact support.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return messages[error.type] || error.message || messages[ErrorType.UNKNOWN];
  }

  /**
   * Get error code
   * @param {string} type - Error type
   * @returns {string} Error code
   */
  getErrorCode(type) {
    const codes = {
      [ErrorType.VALIDATION]: 'ERR_VALIDATION',
      [ErrorType.DATABASE]: 'ERR_DATABASE',
      [ErrorType.NETWORK]: 'ERR_NETWORK',
      [ErrorType.AUTHENTICATION]: 'ERR_AUTH',
      [ErrorType.AUTHORIZATION]: 'ERR_AUTHZ',
      [ErrorType.NOT_FOUND]: 'ERR_NOT_FOUND',
      [ErrorType.CONFLICT]: 'ERR_CONFLICT',
      [ErrorType.BUSINESS_RULE]: 'ERR_BUSINESS_RULE',
      [ErrorType.SYSTEM]: 'ERR_SYSTEM',
      [ErrorType.UNKNOWN]: 'ERR_UNKNOWN',
    };

    return codes[type] || 'ERR_UNKNOWN';
  }

  /**
   * Determine if error details should be exposed
   * @param {Object} error - Error
   * @returns {boolean} True if details should be shown
   */
  shouldExposeDetails(error) {
    // In production, only expose details for low severity errors
    const isDevelopment = process?.env?.NODE_ENV === 'development' || true;

    return isDevelopment || error.severity === ErrorSeverity.LOW;
  }

  /**
   * Register error callback
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Get all stored errors
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered errors
   */
  getErrors(filters = {}) {
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');

      let filtered = errors;

      if (filters.type) {
        filtered = filtered.filter((e) => e.type === filters.type);
      }

      if (filters.severity) {
        filtered = filtered.filter((e) => e.severity === filters.severity);
      }

      if (filters.context) {
        filtered = filtered.filter((e) => e.context === filters.context);
      }

      if (filters.startTime) {
        filtered = filtered.filter((e) => new Date(e.timestamp) >= new Date(filters.startTime));
      }

      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }

      return filtered;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getStatistics() {
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');

      const stats = {
        total: errors.length,
        byType: {},
        bySeverity: {},
        byContext: {},
        recentErrors: errors.slice(-10).reverse(),
      };

      errors.forEach((error) => {
        stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
      });

      return stats;
    } catch (error) {
      return {
        total: 0,
        byType: {},
        bySeverity: {},
        byContext: {},
        recentErrors: [],
      };
    }
  }

  /**
   * Clear error logs
   */
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('error_logs');
    this.logger.info('Error logs cleared');
  }
}

// Singleton instance
let errorHandlerInstance = null;

/**
 * Get error handler instance
 * @returns {ErrorHandler} Error handler
 */
export function getErrorHandler() {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandler();
  }
  return errorHandlerInstance;
}

/**
 * Create custom error
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {string} severity - Error severity
 * @param {Object} details - Additional details
 * @returns {AppError} Custom error
 */
export function createError(
  message,
  type = ErrorType.UNKNOWN,
  severity = ErrorSeverity.MEDIUM,
  details = {}
) {
  return new AppError(message, type, severity, details);
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling() {
  const handler = getErrorHandler();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handler.handle(
      new AppError(event.reason?.message || 'Unhandled promise rejection', ErrorType.SYSTEM),
      'UnhandledPromise'
    );
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    handler.handle(
      new AppError(event.message || 'Global error', ErrorType.SYSTEM),
      'GlobalError'
    );
  });

  console.log('Global error handling initialized');
}
