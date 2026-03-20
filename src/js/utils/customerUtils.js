/**
 * Customer Utilities
 * Helper functions for customer operations
 */

/**
 * Generate a unique customer ID
 * Format: CUST-XXXXXXXX (CUST prefix + 8 alphanumeric characters)
 * @returns {string} Generated customer ID
 */
export function generateCustomerId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `CUST-${timestamp}${random}`.substr(0, 13);
}

/**
 * Format customer name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Formatted full name
 */
export function formatCustomerName(firstName, lastName) {
  if (!firstName && !lastName) return 'Unknown';
  if (!firstName) return lastName;
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
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
  }

  return phone;
}

/**
 * Format SSN
 * @param {string} ssn - SSN to format
 * @param {boolean} mask - Whether to mask the SSN (default: true)
 * @returns {string} Formatted SSN
 */
export function formatSSN(ssn, mask = true) {
  if (!ssn) return '';

  const digits = ssn.replace(/\D/g, '');

  if (mask) {
    if (digits.length === 4) {
      return `***-**-${digits}`;
    } else if (digits.length === 9) {
      return `***-**-${digits.substr(5, 4)}`;
    }
    return '***-**-****';
  }

  if (digits.length === 9) {
    return `${digits.substr(0, 3)}-${digits.substr(3, 2)}-${digits.substr(5, 4)}`;
  } else if (digits.length === 4) {
    return `***-**-${digits}`;
  }

  return ssn;
}

/**
 * Format ZIP code
 * @param {string} zipCode - ZIP code to format
 * @returns {string} Formatted ZIP code
 */
export function formatZipCode(zipCode) {
  if (!zipCode) return '';

  const digits = zipCode.replace(/\D/g, '');

  if (digits.length === 9) {
    return `${digits.substr(0, 5)}-${digits.substr(5, 4)}`;
  } else if (digits.length === 5) {
    return digits;
  }

  return zipCode;
}

/**
 * Format customer address
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
export function formatAddress(address) {
  if (!address) return '';

  const parts = [];

  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(formatZipCode(address.zipCode));

  return parts.join(', ');
}

/**
 * Get customer status display info
 * @param {string} status - Customer status
 * @returns {Object} Status display information
 */
export function getCustomerStatusInfo(status) {
  const statusInfo = {
    active: {
      label: 'Active',
      color: 'success',
      icon: '✓',
      description: 'Customer is active and in good standing',
    },
    inactive: {
      label: 'Inactive',
      color: 'default',
      icon: '○',
      description: 'Customer account is inactive',
    },
    suspended: {
      label: 'Suspended',
      color: 'warning',
      icon: '⚠',
      description: 'Customer account is temporarily suspended',
    },
    blocked: {
      label: 'Blocked',
      color: 'error',
      icon: '✗',
      description: 'Customer account is blocked',
    },
  };

  return statusInfo[status] || { label: status, color: 'default', icon: '•', description: '' };
}

/**
 * Get credit score rating
 * @param {number} score - Credit score
 * @returns {Object} Credit score rating information
 */
export function getCreditScoreRating(score) {
  if (score === null || score === undefined) {
    return {
      rating: 'Unknown',
      color: 'default',
      description: 'Credit score not available',
    };
  }

  if (score >= 800) {
    return {
      rating: 'Excellent',
      color: 'success',
      description: 'Exceptional credit',
    };
  } else if (score >= 740) {
    return {
      rating: 'Very Good',
      color: 'success',
      description: 'Very good credit',
    };
  } else if (score >= 670) {
    return {
      rating: 'Good',
      color: 'info',
      description: 'Good credit',
    };
  } else if (score >= 580) {
    return {
      rating: 'Fair',
      color: 'warning',
      description: 'Fair credit',
    };
  } else {
    return {
      rating: 'Poor',
      color: 'error',
      description: 'Poor credit',
    };
  }
}

/**
 * Calculate age from date of birth
 * @param {string|Date} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
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
  }).format(d);
}

/**
 * Format date to short string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDateShort(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

/**
 * Validate customer ID format
 * @param {string} customerId - Customer ID to validate
 * @returns {boolean} True if valid format
 */
export function isValidCustomerId(customerId) {
  if (!customerId) return false;
  return /^CUST-[A-Z0-9]{8}$/.test(customerId);
}

/**
 * Generate initials from name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials (e.g., "JD")
 */
export function generateInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last || '??';
}

/**
 * Mask email for privacy
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
export function maskEmail(email) {
  if (!email) return '';

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const visibleChars = Math.min(3, Math.floor(localPart.length / 2));
  const masked =
    localPart.substr(0, visibleChars) + '*'.repeat(localPart.length - visibleChars);

  return `${masked}@${domain}`;
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
 * Get customer risk level based on credit score and other factors
 * @param {Object} customer - Customer object
 * @returns {Object} Risk level information
 */
export function getCustomerRiskLevel(customer) {
  if (!customer) {
    return { level: 'Unknown', color: 'default', description: 'Unable to assess risk' };
  }

  let riskScore = 0;

  // Factor 1: Credit score (60% weight)
  if (customer.creditScore) {
    if (customer.creditScore >= 740) riskScore += 60;
    else if (customer.creditScore >= 670) riskScore += 45;
    else if (customer.creditScore >= 580) riskScore += 30;
    else riskScore += 15;
  } else {
    riskScore += 30; // Neutral if no credit score
  }

  // Factor 2: Account history (20% weight)
  if (customer.metadata && customer.metadata.accountCount > 0) {
    riskScore += 20;
  } else {
    riskScore += 10; // New customer
  }

  // Factor 3: Status (20% weight)
  if (customer.status === 'active') {
    riskScore += 20;
  } else if (customer.status === 'inactive') {
    riskScore += 10;
  } else {
    riskScore += 0; // Suspended or blocked
  }

  // Determine risk level
  if (riskScore >= 80) {
    return { level: 'Low', color: 'success', description: 'Low risk customer' };
  } else if (riskScore >= 60) {
    return { level: 'Medium', color: 'info', description: 'Medium risk customer' };
  } else if (riskScore >= 40) {
    return { level: 'High', color: 'warning', description: 'High risk customer' };
  } else {
    return { level: 'Very High', color: 'error', description: 'Very high risk customer' };
  }
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string for display
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (!str) return '';
  return str.replace(/[<>]/g, '');
}

/**
 * Generate customer summary
 * @param {Object} customer - Customer object
 * @returns {string} Summary text
 */
export function generateCustomerSummary(customer) {
  if (!customer) return 'No customer information available';

  const name = formatCustomerName(customer.firstName, customer.lastName);
  const age = calculateAge(customer.dateOfBirth);
  const creditRating = getCreditScoreRating(customer.creditScore);
  const accountCount = customer.metadata?.accountCount || 0;

  return `${name}, ${age} years old, ${creditRating.rating} credit (${customer.creditScore || 'N/A'}), ${accountCount} account${accountCount !== 1 ? 's' : ''}`;
}
