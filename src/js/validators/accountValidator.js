/**
 * Account Validator
 * Validates account data before creation
 */

import { ACCOUNT_TYPES } from '../services/accountService.js';

/**
 * Validate account data
 * @param {Object} data - Account data to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateAccountData(data) {
  const errors = [];

  // Validate account type
  if (!data.accountType) {
    errors.push({
      field: 'accountType',
      message: 'Account type is required',
    });
  } else if (!Object.values(ACCOUNT_TYPES).includes(data.accountType)) {
    errors.push({
      field: 'accountType',
      message: 'Invalid account type',
    });
  }

  // Validate customer name
  if (!data.customerName || data.customerName.trim() === '') {
    errors.push({
      field: 'customerName',
      message: 'Customer name is required',
    });
  } else if (data.customerName.trim().length < 2) {
    errors.push({
      field: 'customerName',
      message: 'Customer name must be at least 2 characters',
    });
  } else if (data.customerName.trim().length > 100) {
    errors.push({
      field: 'customerName',
      message: 'Customer name must not exceed 100 characters',
    });
  } else if (!/^[a-zA-Z\s'-]+$/.test(data.customerName)) {
    errors.push({
      field: 'customerName',
      message: 'Customer name contains invalid characters',
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
      message: 'Invalid phone number format',
    });
  }

  // Validate SSN (last 4 digits)
  if (!data.ssn) {
    errors.push({
      field: 'ssn',
      message: 'SSN (last 4 digits) is required',
    });
  } else if (!/^\d{4}$/.test(data.ssn)) {
    errors.push({
      field: 'ssn',
      message: 'SSN must be exactly 4 digits',
    });
  }

  // Validate address
  if (!data.address || data.address.trim() === '') {
    errors.push({
      field: 'address',
      message: 'Address is required',
    });
  } else if (data.address.trim().length < 10) {
    errors.push({
      field: 'address',
      message: 'Address must be at least 10 characters',
    });
  } else if (data.address.trim().length > 200) {
    errors.push({
      field: 'address',
      message: 'Address must not exceed 200 characters',
    });
  }

  // Validate initial deposit
  if (data.initialDeposit === undefined || data.initialDeposit === null) {
    errors.push({
      field: 'initialDeposit',
      message: 'Initial deposit is required',
    });
  } else if (typeof data.initialDeposit !== 'number') {
    errors.push({
      field: 'initialDeposit',
      message: 'Initial deposit must be a number',
    });
  } else if (data.initialDeposit < 0) {
    errors.push({
      field: 'initialDeposit',
      message: 'Initial deposit cannot be negative',
    });
  } else if (data.initialDeposit > 1000000) {
    errors.push({
      field: 'initialDeposit',
      message: 'Initial deposit cannot exceed $1,000,000',
    });
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
  // Must have 10 or 11 digits (with or without country code)
  return digitsOnly.length === 10 || digitsOnly.length === 11;
}

/**
 * Sanitize account data before saving
 * @param {Object} data - Account data to sanitize
 * @returns {Object} Sanitized data
 */
export function sanitizeAccountData(data) {
  return {
    accountType: data.accountType?.toLowerCase().trim(),
    customerName: data.customerName?.trim(),
    email: data.email?.toLowerCase().trim(),
    phone: data.phone?.replace(/\D/g, ''),
    ssn: data.ssn?.trim(),
    address: data.address?.trim(),
    initialDeposit: parseFloat(data.initialDeposit) || 0,
  };
}
