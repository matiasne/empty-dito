/**
 * Time Service
 * Centralized time management and formatting utilities
 */

/**
 * Time formats
 */
export const TimeFormat = {
  ISO: 'iso',
  TIMESTAMP: 'timestamp',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime',
  RELATIVE: 'relative',
};

/**
 * Time Service class
 */
export class TimeService {
  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get current Unix timestamp
   * @returns {number} Unix timestamp
   */
  static getCurrentUnixTimestamp() {
    return Date.now();
  }

  /**
   * Get current date
   * @returns {Date} Current date
   */
  static getCurrentDate() {
    return new Date();
  }

  /**
   * Format timestamp
   * @param {string|Date} timestamp - Timestamp to format
   * @param {string} format - Format type
   * @returns {string} Formatted timestamp
   */
  static format(timestamp, format = TimeFormat.DATETIME) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    switch (format) {
      case TimeFormat.ISO:
        return date.toISOString();

      case TimeFormat.TIMESTAMP:
        return date.getTime().toString();

      case TimeFormat.DATE:
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case TimeFormat.TIME:
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

      case TimeFormat.DATETIME:
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

      case TimeFormat.RELATIVE:
        return this.getRelativeTime(date);

      default:
        return date.toISOString();
    }
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  static formatDate(date) {
    return this.format(date, TimeFormat.DATE);
  }

  /**
   * Format time for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted time
   */
  static formatTime(date) {
    return this.format(date, TimeFormat.TIME);
  }

  /**
   * Format datetime for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted datetime
   */
  static formatDateTime(date) {
    return this.format(date, TimeFormat.DATETIME);
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {string|Date} timestamp - Timestamp
   * @returns {string} Relative time string
   */
  static getRelativeTime(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Parse date string
   * @param {string} dateString - Date string to parse
   * @returns {Date} Parsed date
   */
  static parse(dateString) {
    return new Date(dateString);
  }

  /**
   * Check if date is valid
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if valid
   */
  static isValid(date) {
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime());
  }

  /**
   * Add time to date
   * @param {Date} date - Base date
   * @param {number} amount - Amount to add
   * @param {string} unit - Unit (seconds, minutes, hours, days)
   * @returns {Date} New date
   */
  static add(date, amount, unit = 'days') {
    const newDate = new Date(date);

    switch (unit) {
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + amount);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + amount);
        break;
      case 'days':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'weeks':
        newDate.setDate(newDate.getDate() + amount * 7);
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case 'years':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }

    return newDate;
  }

  /**
   * Subtract time from date
   * @param {Date} date - Base date
   * @param {number} amount - Amount to subtract
   * @param {string} unit - Unit (seconds, minutes, hours, days)
   * @returns {Date} New date
   */
  static subtract(date, amount, unit = 'days') {
    return this.add(date, -amount, unit);
  }

  /**
   * Get difference between two dates
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @param {string} unit - Unit for difference
   * @returns {number} Difference
   */
  static diff(date1, date2, unit = 'milliseconds') {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    const diffMs = Math.abs(d1 - d2);

    switch (unit) {
      case 'seconds':
        return Math.floor(diffMs / 1000);
      case 'minutes':
        return Math.floor(diffMs / 60000);
      case 'hours':
        return Math.floor(diffMs / 3600000);
      case 'days':
        return Math.floor(diffMs / 86400000);
      case 'weeks':
        return Math.floor(diffMs / 604800000);
      default:
        return diffMs;
    }
  }

  /**
   * Check if date is in the past
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if in the past
   */
  static isPast(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d < new Date();
  }

  /**
   * Check if date is in the future
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if in the future
   */
  static isFuture(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d > new Date();
  }

  /**
   * Check if date is today
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if today
   */
  static isToday(date) {
    const d = date instanceof Date ? date : new Date(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Get start of day
   * @param {Date} date - Date
   * @returns {Date} Start of day
   */
  static startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get end of day
   * @param {Date} date - Date
   * @returns {Date} End of day
   */
  static endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Get timezone offset in hours
   * @returns {number} Timezone offset
   */
  static getTimezoneOffset() {
    return -new Date().getTimezoneOffset() / 60;
  }

  /**
   * Get timezone name
   * @returns {string} Timezone name
   */
  static getTimezoneName() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Create a timer that executes callback after delay
   * @param {Function} callback - Callback function
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Timer ID
   */
  static setTimeout(callback, delay) {
    return setTimeout(callback, delay);
  }

  /**
   * Create a timer that executes callback repeatedly
   * @param {Function} callback - Callback function
   * @param {number} interval - Interval in milliseconds
   * @returns {number} Timer ID
   */
  static setInterval(callback, interval) {
    return setInterval(callback, interval);
  }

  /**
   * Clear a timer
   * @param {number} timerId - Timer ID
   */
  static clearTimeout(timerId) {
    clearTimeout(timerId);
  }

  /**
   * Clear an interval
   * @param {number} intervalId - Interval ID
   */
  static clearInterval(intervalId) {
    clearInterval(intervalId);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Measure execution time of a function
   * @param {Function} fn - Function to measure
   * @param {string} label - Label for console output
   * @returns {Promise<*>} Function result
   */
  static async measureTime(fn, label = 'Function') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);

    console.log(`${label} took ${duration}ms`);

    return result;
  }

  /**
   * Get performance timestamp
   * @returns {number} High-resolution timestamp
   */
  static getPerformanceTimestamp() {
    return performance.now();
  }
}

// Export convenience functions
export const getCurrentTimestamp = TimeService.getCurrentTimestamp.bind(TimeService);
export const formatDate = TimeService.formatDate.bind(TimeService);
export const formatTime = TimeService.formatTime.bind(TimeService);
export const formatDateTime = TimeService.formatDateTime.bind(TimeService);
export const getRelativeTime = TimeService.getRelativeTime.bind(TimeService);
