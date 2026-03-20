/**
 * Account Utilities
 * Helper functions for account operations
 */

/**
 * Generate a unique account number
 * Format: XXXX-XXXX-XXXX (12 digits)
 * @returns {string} Generated account number
 */
export function generateAccountNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().substr(2, 6);
  const combined = (timestamp + random).substr(0, 12);

  // Format as XXXX-XXXX-XXXX
  return `${combined.substr(0, 4)}-${combined.substr(4, 4)}-${combined.substr(8, 4)}`;
}

/**
 * Format account number for display
 * @param {string} accountNumber - Account number to format
 * @returns {string} Formatted account number
 */
export function formatAccountNumber(accountNumber) {
  if (!accountNumber) return '';

  // Remove existing formatting
  const digits = accountNumber.replace(/\D/g, '');

  // Format as XXXX-XXXX-XXXX
  if (digits.length === 12) {
    return `${digits.substr(0, 4)}-${digits.substr(4, 4)}-${digits.substr(8, 4)}`;
  }

  return accountNumber;
}

/**
 * Mask account number for security
 * Shows only last 4 digits
 * @param {string} accountNumber - Account number to mask
 * @returns {string} Masked account number
 */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return '';

  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length < 4) return '****';

  const lastFour = digits.slice(-4);
  return `****-****-${lastFour}`;
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString === 'number') return currencyString;

  const cleaned = currencyString.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6, 4)}`;
  } else if (digits.length === 11) {
    return `+${digits.substr(0, 1)} (${digits.substr(1, 3)}) ${digits.substr(4, 3)}-${digits.substr(7, 4)}`;
  }

  return phone;
}

/**
 * Validate account number format
 * @param {string} accountNumber - Account number to validate
 * @returns {boolean} True if valid format
 */
export function isValidAccountNumber(accountNumber) {
  if (!accountNumber) return false;

  const digits = accountNumber.replace(/\D/g, '');
  return digits.length === 12;
}

/**
 * Get account type display name
 * @param {string} accountType - Account type code
 * @returns {string} Display name
 */
export function getAccountTypeDisplayName(accountType) {
  const displayNames = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    business: 'Business Account',
    money_market: 'Money Market Account',
  };

  return displayNames[accountType] || accountType;
}

/**
 * Get account status display info
 * @param {string} status - Account status
 * @returns {Object} Status display information
 */
export function getAccountStatusInfo(status) {
  const statusInfo = {
    active: {
      label: 'Active',
      color: 'success',
      icon: '✓',
    },
    pending: {
      label: 'Pending',
      color: 'warning',
      icon: '⏳',
    },
    suspended: {
      label: 'Suspended',
      color: 'warning',
      icon: '⚠',
    },
    closed: {
      label: 'Closed',
      color: 'error',
      icon: '✗',
    },
  };

  return statusInfo[status] || { label: status, color: 'default', icon: '•' };
}

/**
 * Calculate interest for savings accounts
 * @param {number} balance - Account balance
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} days - Number of days
 * @returns {number} Interest earned
 */
export function calculateInterest(balance, annualRate, days) {
  const dailyRate = annualRate / 100 / 365;
  return balance * dailyRate * days;
}

/**
 * Validate SSN (last 4 digits)
 * @param {string} ssn - SSN to validate
 * @returns {boolean} True if valid
 */
export function isValidSSN(ssn) {
  if (!ssn) return false;
  return /^\d{4}$/.test(ssn);
}

/**
 * Mask SSN
 * @param {string} ssn - SSN to mask
 * @returns {string} Masked SSN
 */
export function maskSSN(ssn) {
  if (!ssn) return '';
  return `***-**-${ssn}`;
}

/**
 * Generate a random reference number for transactions
 * @returns {string} Reference number
 */
export function generateReferenceNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `REF-${timestamp}-${random}`;
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - Date to convert
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
}
