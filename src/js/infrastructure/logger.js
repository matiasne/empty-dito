/**
 * Logger Infrastructure
 * Provides centralized logging with levels, formatting, and persistence
 */

import { TimeService } from './timeService.js';

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

/**
 * Log level names
 */
const LogLevelNames = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR',
  4: 'FATAL',
};

/**
 * Logger configuration
 */
const LOGGER_CONFIG = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  enablePersistence: true,
  maxStoredLogs: 1000,
  colors: {
    DEBUG: '#6c757d',
    INFO: '#0dcaf0',
    WARN: '#ffc107',
    ERROR: '#dc3545',
    FATAL: '#6f42c1',
  },
};

/**
 * Logger class
 */
export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logs = [];
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  debug(message, data = null) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  info(message, data = null) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  warn(message, data = null) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error|*} error - Error object or data
   */
  error(message, error = null) {
    this.log(LogLevel.ERROR, message, error);
  }

  /**
   * Log fatal error message
   * @param {string} message - Message to log
   * @param {Error|*} error - Error object or data
   */
  fatal(message, error = null) {
    this.log(LogLevel.FATAL, message, error);
  }

  /**
   * Core logging method
   * @param {number} level - Log level
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  log(level, message, data = null) {
    if (level < LOGGER_CONFIG.minLevel) {
      return;
    }

    const logEntry = {
      timestamp: TimeService.getCurrentTimestamp(),
      level: LogLevelNames[level],
      context: this.context,
      message,
      data: data,
    };

    // Console output
    if (LOGGER_CONFIG.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Store log
    this.logs.push(logEntry);

    // Persist logs
    if (LOGGER_CONFIG.enablePersistence) {
      this.persistLog(logEntry);
    }
  }

  /**
   * Log to console with formatting
   * @param {Object} logEntry - Log entry
   */
  logToConsole(logEntry) {
    const { timestamp, level, context, message, data } = logEntry;
    const color = LOGGER_CONFIG.colors[level];
    const time = TimeService.formatTime(timestamp);

    const prefix = `%c[${time}] [${level}] [${context}]`;
    const style = `color: ${color}; font-weight: bold;`;

    if (data) {
      if (data instanceof Error) {
        console.log(prefix, style, message);
        console.error(data);
      } else {
        console.log(prefix, style, message, data);
      }
    } else {
      console.log(prefix, style, message);
    }
  }

  /**
   * Persist log to storage
   * @param {Object} logEntry - Log entry
   */
  persistLog(logEntry) {
    try {
      const logs = this.getPersistedLogs();
      logs.push(logEntry);

      // Keep only the last N logs
      const trimmedLogs = logs.slice(-LOGGER_CONFIG.maxStoredLogs);

      localStorage.setItem('system_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      // Fail silently to avoid infinite loop
      console.error('Failed to persist log:', error);
    }
  }

  /**
   * Get persisted logs
   * @returns {Array} Array of log entries
   */
  getPersistedLogs() {
    try {
      return JSON.parse(localStorage.getItem('system_logs') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Get logs for this logger instance
   * @param {number} level - Minimum log level
   * @returns {Array} Filtered logs
   */
  getLogs(level = LogLevel.DEBUG) {
    return this.logs.filter((log) => LogLevel[log.level] >= level);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Create a child logger with a sub-context
   * @param {string} subContext - Sub-context name
   * @returns {Logger} Child logger
   */
  child(subContext) {
    return new Logger(`${this.context}:${subContext}`);
  }
}

/**
 * Get all system logs
 * @param {Object} options - Filter options
 * @returns {Array} Filtered logs
 */
export function getSystemLogs(options = {}) {
  try {
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');

    let filtered = logs;

    if (options.level) {
      filtered = filtered.filter((log) => LogLevel[log.level] >= options.level);
    }

    if (options.context) {
      filtered = filtered.filter((log) => log.context === options.context);
    }

    if (options.startTime) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(options.startTime));
    }

    if (options.endTime) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(options.endTime));
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  } catch (error) {
    return [];
  }
}

/**
 * Clear all system logs
 */
export function clearSystemLogs() {
  localStorage.removeItem('system_logs');
}

/**
 * Export logs as JSON
 * @returns {string} JSON string
 */
export function exportLogs() {
  try {
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    return '[]';
  }
}

/**
 * Get log statistics
 * @returns {Object} Log statistics
 */
export function getLogStatistics() {
  try {
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');

    const stats = {
      total: logs.length,
      byLevel: {},
      byContext: {},
      timeRange: {
        oldest: null,
        newest: null,
      },
    };

    logs.forEach((log) => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by context
      stats.byContext[log.context] = (stats.byContext[log.context] || 0) + 1;

      // Track time range
      const logTime = new Date(log.timestamp);
      if (!stats.timeRange.oldest || logTime < new Date(stats.timeRange.oldest)) {
        stats.timeRange.oldest = log.timestamp;
      }
      if (!stats.timeRange.newest || logTime > new Date(stats.timeRange.newest)) {
        stats.timeRange.newest = log.timestamp;
      }
    });

    return stats;
  } catch (error) {
    return {
      total: 0,
      byLevel: {},
      byContext: {},
      timeRange: { oldest: null, newest: null },
    };
  }
}
