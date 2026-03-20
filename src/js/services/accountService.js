/**
 * Account Service
 * Handles account creation, validation, and management
 */

import { validateAccountData } from '../validators/accountValidator.js';
import { saveAccount, accountExists } from '../database/accountDatabase.js';
import { logAudit } from '../services/auditService.js';
import { generateAccountNumber } from '../utils/accountUtils.js';

/**
 * Account types allowed in the system
 */
export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  BUSINESS: 'business',
  MONEY_MARKET: 'money_market',
};

/**
 * Account status values
 */
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
};

/**
 * Create a new bank account
 * @param {Object} accountData - Account creation data
 * @param {string} accountData.accountType - Type of account (checking, savings, etc.)
 * @param {string} accountData.customerName - Customer's full name
 * @param {string} accountData.email - Customer's email address
 * @param {string} accountData.phone - Customer's phone number
 * @param {number} accountData.initialDeposit - Initial deposit amount
 * @param {string} accountData.ssn - Social Security Number (last 4 digits)
 * @param {string} accountData.address - Customer's address
 * @returns {Promise<Object>} Created account object or error
 */
export async function createAccount(accountData) {
  try {
    // Step 1: Validate account data
    const validation = validateAccountData(accountData);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      };
    }

    // Step 2: Check business rules
    const businessRulesCheck = await validateBusinessRules(accountData);
    if (!businessRulesCheck.valid) {
      return {
        success: false,
        error: 'Business rules validation failed',
        errors: businessRulesCheck.errors,
      };
    }

    // Step 3: Generate account number
    const accountNumber = generateAccountNumber();

    // Step 4: Create account object
    const account = {
      accountNumber,
      accountType: accountData.accountType,
      customerName: accountData.customerName,
      email: accountData.email,
      phone: accountData.phone,
      address: accountData.address,
      ssn: accountData.ssn,
      balance: accountData.initialDeposit || 0,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        createdBy: 'system',
        lastModifiedBy: 'system',
      },
    };

    // Step 5: Save account to database
    const saveResult = await saveAccount(account);
    if (!saveResult.success) {
      return {
        success: false,
        error: 'Failed to save account',
        details: saveResult.error,
      };
    }

    // Step 6: Create audit trail
    await logAudit({
      action: 'ACCOUNT_CREATED',
      accountNumber: account.accountNumber,
      details: {
        accountType: account.accountType,
        customerName: account.customerName,
        initialDeposit: account.balance,
      },
      timestamp: new Date().toISOString(),
    });

    // Step 7: Return success response
    return {
      success: true,
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        customerName: account.customerName,
        balance: account.balance,
        status: account.status,
        createdAt: account.createdAt,
      },
      message: 'Account created successfully',
    };
  } catch (error) {
    // Log error to audit trail
    await logAudit({
      action: 'ACCOUNT_CREATION_FAILED',
      details: {
        error: error.message,
        accountData: {
          accountType: accountData.accountType,
          customerName: accountData.customerName,
        },
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: 'Account creation failed',
      details: error.message,
    };
  }
}

/**
 * Validate business rules for account creation
 * @param {Object} accountData - Account data to validate
 * @returns {Promise<Object>} Validation result
 */
async function validateBusinessRules(accountData) {
  const errors = [];

  // Rule 1: Minimum deposit requirements by account type
  const minDeposits = {
    [ACCOUNT_TYPES.CHECKING]: 25,
    [ACCOUNT_TYPES.SAVINGS]: 100,
    [ACCOUNT_TYPES.BUSINESS]: 500,
    [ACCOUNT_TYPES.MONEY_MARKET]: 2500,
  };

  const minDeposit = minDeposits[accountData.accountType] || 0;
  const initialDeposit = accountData.initialDeposit || 0;

  if (initialDeposit < minDeposit) {
    errors.push({
      field: 'initialDeposit',
      message: `Minimum deposit for ${accountData.accountType} account is $${minDeposit}`,
    });
  }

  // Rule 2: Check if customer already has an account with same email
  const existingAccount = await accountExists({ email: accountData.email });
  if (existingAccount && accountData.accountType === ACCOUNT_TYPES.BUSINESS) {
    // Allow multiple business accounts
  } else if (existingAccount && existingAccount.accountType === accountData.accountType) {
    errors.push({
      field: 'email',
      message: `Customer already has a ${accountData.accountType} account`,
    });
  }

  // Rule 3: Maximum number of accounts per customer
  const customerAccounts = await getAccountsByEmail(accountData.email);
  if (customerAccounts.length >= 5) {
    errors.push({
      field: 'general',
      message: 'Customer has reached maximum number of accounts (5)',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get all accounts for a customer by email
 * @param {string} email - Customer email
 * @returns {Promise<Array>} Array of accounts
 */
async function getAccountsByEmail(email) {
  // This would query the database
  // For now, return empty array as we're using localStorage
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    return accounts.filter((acc) => acc.email === email);
  } catch (error) {
    return [];
  }
}

/**
 * Get account by account number
 * @param {string} accountNumber - Account number
 * @returns {Promise<Object|null>} Account object or null
 */
export async function getAccount(accountNumber) {
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find((acc) => acc.accountNumber === accountNumber);
    return account || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get all accounts (for admin purposes)
 * @returns {Promise<Array>} Array of all accounts
 */
export async function getAllAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    return accounts;
  } catch (error) {
    return [];
  }
}

/**
 * Update account status
 * @param {string} accountNumber - Account number
 * @param {string} status - New status
 * @returns {Promise<Object>} Update result
 */
export async function updateAccountStatus(accountNumber, status) {
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const accountIndex = accounts.findIndex((acc) => acc.accountNumber === accountNumber);

    if (accountIndex === -1) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    accounts[accountIndex].status = status;
    accounts[accountIndex].updatedAt = new Date().toISOString();

    localStorage.setItem('accounts', JSON.stringify(accounts));

    await logAudit({
      action: 'ACCOUNT_STATUS_UPDATED',
      accountNumber,
      details: {
        oldStatus: accounts[accountIndex].status,
        newStatus: status,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      account: accounts[accountIndex],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
