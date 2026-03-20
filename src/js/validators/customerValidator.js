/**
 * Customer Validator
 * Validates customer data before creation and updates
 */

/**
 * Validate customer data for creation
 * @param {Object} data - Customer data to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateCustomerData(data) {
  const errors = [];

  // Validate first name
  if (!data.firstName || data.firstName.trim() === '') {
    errors.push({
      field: 'firstName',
      message: 'First name is required',
    });
  } else if (data.firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters',
    });
  } else if (data.firstName.trim().length > 50) {
    errors.push({
      field: 'firstName',
      message: 'First name must not exceed 50 characters',
    });
  } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName)) {
    errors.push({
      field: 'firstName',
      message: 'First name contains invalid characters',
    });
  }

  // Validate last name
  if (!data.lastName || data.lastName.trim() === '') {
    errors.push({
      field: 'lastName',
      message: 'Last name is required',
    });
  } else if (data.lastName.trim().length < 2) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be at least 2 characters',
    });
  } else if (data.lastName.trim().length > 50) {
    errors.push({
      field: 'lastName',
      message: 'Last name must not exceed 50 characters',
    });
  } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName)) {
    errors.push({
      field: 'lastName',
      message: 'Last name contains invalid characters',
    });
  }

  // Validate email
  if (!data.email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else if (!isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
    });
  }

  // Validate phone
  if (!data.phone) {
    errors.push({
      field: 'phone',
      message: 'Phone number is required',
    });
  } else if (!isValidPhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format (must be 10 digits)',
    });
  }

  // Validate date of birth
  if (!data.dateOfBirth) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Date of birth is required',
    });
  } else if (!isValidDateOfBirth(data.dateOfBirth)) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Invalid date of birth or customer must be at least 18 years old',
    });
  }

  // Validate SSN
  if (!data.ssn) {
    errors.push({
      field: 'ssn',
      message: 'SSN is required',
    });
  } else if (!isValidSSN(data.ssn)) {
    errors.push({
      field: 'ssn',
      message: 'SSN must be 4 or 9 digits',
    });
  }

  // Validate address
  if (!data.address || data.address.trim() === '') {
    errors.push({
      field: 'address',
      message: 'Street address is required',
    });
  } else if (data.address.trim().length < 5) {
    errors.push({
      field: 'address',
      message: 'Street address must be at least 5 characters',
    });
  } else if (data.address.trim().length > 200) {
    errors.push({
      field: 'address',
      message: 'Street address must not exceed 200 characters',
    });
  }

  // Validate city
  if (!data.city || data.city.trim() === '') {
    errors.push({
      field: 'city',
      message: 'City is required',
    });
  } else if (data.city.trim().length < 2) {
    errors.push({
      field: 'city',
      message: 'City must be at least 2 characters',
    });
  } else if (data.city.trim().length > 50) {
    errors.push({
      field: 'city',
      message: 'City must not exceed 50 characters',
    });
  }

  // Validate state
  if (!data.state || data.state.trim() === '') {
    errors.push({
      field: 'state',
      message: 'State is required',
    });
  } else if (!isValidState(data.state)) {
    errors.push({
      field: 'state',
      message: 'Invalid state abbreviation',
    });
  }

  // Validate ZIP code
  if (!data.zipCode) {
    errors.push({
      field: 'zipCode',
      message: 'ZIP code is required',
    });
  } else if (!isValidZipCode(data.zipCode)) {
    errors.push({
      field: 'zipCode',
      message: 'Invalid ZIP code format (must be 5 or 9 digits)',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate customer data for updates
 * @param {Object} data - Customer data to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateCustomerUpdate(data) {
  const errors = [];

  // Validate first name if provided
  if (data.firstName !== undefined) {
    if (data.firstName.trim() === '') {
      errors.push({
        field: 'firstName',
        message: 'First name cannot be empty',
      });
    } else if (data.firstName.trim().length < 2) {
      errors.push({
        field: 'firstName',
        message: 'First name must be at least 2 characters',
      });
    } else if (data.firstName.trim().length > 50) {
      errors.push({
        field: 'firstName',
        message: 'First name must not exceed 50 characters',
      });
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName)) {
      errors.push({
        field: 'firstName',
        message: 'First name contains invalid characters',
      });
    }
  }

  // Validate last name if provided
  if (data.lastName !== undefined) {
    if (data.lastName.trim() === '') {
      errors.push({
        field: 'lastName',
        message: 'Last name cannot be empty',
      });
    } else if (data.lastName.trim().length < 2) {
      errors.push({
        field: 'lastName',
        message: 'Last name must be at least 2 characters',
      });
    } else if (data.lastName.trim().length > 50) {
      errors.push({
        field: 'lastName',
        message: 'Last name must not exceed 50 characters',
      });
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName)) {
      errors.push({
        field: 'lastName',
        message: 'Last name contains invalid characters',
      });
    }
  }

  // Validate email if provided
  if (data.email !== undefined) {
    if (!isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
      });
    }
  }

  // Validate phone if provided
  if (data.phone !== undefined) {
    if (!isValidPhone(data.phone)) {
      errors.push({
        field: 'phone',
        message: 'Invalid phone number format (must be 10 digits)',
      });
    }
  }

  // Validate date of birth if provided
  if (data.dateOfBirth !== undefined) {
    if (!isValidDateOfBirth(data.dateOfBirth)) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Invalid date of birth or customer must be at least 18 years old',
      });
    }
  }

  // Validate address if provided
  if (data.address !== undefined) {
    if (data.address.trim() === '') {
      errors.push({
        field: 'address',
        message: 'Street address cannot be empty',
      });
    } else if (data.address.trim().length < 5) {
      errors.push({
        field: 'address',
        message: 'Street address must be at least 5 characters',
      });
    } else if (data.address.trim().length > 200) {
      errors.push({
        field: 'address',
        message: 'Street address must not exceed 200 characters',
      });
    }
  }

  // Validate city if provided
  if (data.city !== undefined) {
    if (data.city.trim() === '') {
      errors.push({
        field: 'city',
        message: 'City cannot be empty',
      });
    } else if (data.city.trim().length < 2) {
      errors.push({
        field: 'city',
        message: 'City must be at least 2 characters',
      });
    } else if (data.city.trim().length > 50) {
      errors.push({
        field: 'city',
        message: 'City must not exceed 50 characters',
      });
    }
  }

  // Validate state if provided
  if (data.state !== undefined) {
    if (!isValidState(data.state)) {
      errors.push({
        field: 'state',
        message: 'Invalid state abbreviation',
      });
    }
  }

  // Validate ZIP code if provided
  if (data.zipCode !== undefined) {
    if (!isValidZipCode(data.zipCode)) {
      errors.push({
        field: 'zipCode',
        message: 'Invalid ZIP code format (must be 5 or 9 digits)',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Must have exactly 10 digits
  return digitsOnly.length === 10;
}

/**
 * Validate date of birth
 * @param {string} dateOfBirth - Date of birth to validate
 * @returns {boolean} True if valid and customer is at least 18 years old
 */
function isValidDateOfBirth(dateOfBirth) {
  const date = new Date(dateOfBirth);

  // Check if valid date
  if (isNaN(date.getTime())) {
    return false;
  }

  // Check if date is not in the future
  if (date > new Date()) {
    return false;
  }

  // Check if customer is at least 18 years old
  const age = calculateAge(date);
  return age >= 18;
}

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate SSN format
 * @param {string} ssn - SSN to validate
 * @returns {boolean} True if valid
 */
function isValidSSN(ssn) {
  const digitsOnly = ssn.replace(/\D/g, '');
  // Accept either 4 digits (last 4) or 9 digits (full SSN)
  return digitsOnly.length === 4 || digitsOnly.length === 9;
}

/**
 * Validate state abbreviation
 * @param {string} state - State to validate
 * @returns {boolean} True if valid
 */
function isValidState(state) {
  const states = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
    'DC',
  ];

  return states.includes(state.toUpperCase());
}

/**
 * Validate ZIP code format
 * @param {string} zipCode - ZIP code to validate
 * @returns {boolean} True if valid
 */
function isValidZipCode(zipCode) {
  const digitsOnly = zipCode.replace(/\D/g, '');
  // Accept 5 digits or 9 digits (ZIP+4)
  return digitsOnly.length === 5 || digitsOnly.length === 9;
}

/**
 * Sanitize customer data before saving
 * @param {Object} data - Customer data to sanitize
 * @returns {Object} Sanitized data
 */
export function sanitizeCustomerData(data) {
  const sanitized = {
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim(),
    email: data.email?.toLowerCase().trim(),
    phone: data.phone?.replace(/\D/g, ''),
    dateOfBirth: data.dateOfBirth,
    ssn: data.ssn?.replace(/\D/g, ''),
    address: data.address?.trim(),
    city: data.city?.trim(),
    state: data.state?.toUpperCase().trim(),
    zipCode: data.zipCode?.replace(/\D/g, ''),
  };

  // Remove undefined values
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
}

/**
 * Get list of US states
 * @returns {Array} Array of state objects with code and name
 */
export function getUSStates() {
  return [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];
}
