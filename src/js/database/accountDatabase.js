/**
 * Account Database
 * Database operations for accounts using the infrastructure layer
 */

import { getDatabase } from '../infrastructure/database.js';
import { Logger } from '../infrastructure/logger.js';
import { getErrorHandler, ErrorType, createError } from '../infrastructure/errorHandler.js';

const logger = new Logger('AccountDatabase');
const errorHandler = getErrorHandler();

/**
 * Save account to database
 * @param {Object} account - Account object to save
 * @returns {Promise<Object>} Save result
 */
export async function saveAccount(account) {
  try {
    logger.debug('Saving account', { accountNumber: account.accountNumber });
    
    const db = getDatabase();
    
    // Check if account number already exists
    const exists = await db.query('accounts', (acc) => acc.accountNumber === account.accountNumber);
    if (exists.length > 0) {
      throw createError(
        'Account number already exists',
        ErrorType.CONFLICT,
        'medium',
        { accountNumber: account.accountNumber }
      );
    }

    // Insert account using infrastructure layer
    const result = await db.insert('accounts', account);

    logger.info('Account saved successfully', { accountNumber: account.accountNumber });

    return {
      success: true,
      account: result.data[0],
    };
  } catch (error) {
    logger.error('Failed to save account', error);
    return errorHandler.handle(error, 'saveAccount');
  }
}

/**
 * Check if an account exists with given criteria
 * @param {Object} criteria - Search criteria (e.g., { email: 'test@example.com' })
 * @returns {Promise<Object|null>} Account object if found, null otherwise
 */
export async function accountExists(criteria) {
  try {
    logger.debug('Checking account existence', criteria);
    
    const db = getDatabase();
    const accounts = await db.query('accounts', (acc) => {
      return Object.keys(criteria).every((key) => acc[key] === criteria[key]);
    });

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    logger.error('Failed to check account existence', error);
    return null;
  }
}

/**
 * Get account by account number
 * @param {string} accountNumber - Account number
 * @returns {Promise<Object|null>} Account object or null
 */
export async function getAccountByNumber(accountNumber) {
  try {
    logger.debug('Getting account by number', { accountNumber });
    
    const db = getDatabase();
    const accounts = await db.query('accounts', (acc) => acc.accountNumber === accountNumber);
    
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    logger.error('Failed to get account', error);
    return null;
  }
}

/**
 * Update account in database
 * @param {string} accountNumber - Account number
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateAccount(accountNumber, updates) {
  try {
    logger.debug('Updating account', { accountNumber, updates });
    
    const db = getDatabase();
    const result = await db.update(
      'accounts',
      (acc) => acc.accountNumber === accountNumber,
      updates
    );

    if (result.updated === 0) {
      throw createError('Account not found', ErrorType.NOT_FOUND);
    }

    logger.info('Account updated successfully', { accountNumber });

    // Get updated account
    const updatedAccount = await getAccountByNumber(accountNumber);

    return {
      success: true,
      account: updatedAccount,
    };
  } catch (error) {
    logger.error('Failed to update account', error);
    return errorHandler.handle(error, 'updateAccount');
  }
}

/**
 * Delete account from database
 * @param {string} accountNumber - Account number
 * @returns {Promise<Object>} Delete result
 */
export async function deleteAccount(accountNumber) {
  try {
    logger.debug('Deleting account', { accountNumber });
    
    const db = getDatabase();
    const result = await db.delete('accounts', (acc) => acc.accountNumber === accountNumber);

    if (result.deleted === 0) {
      throw createError('Account not found', ErrorType.NOT_FOUND);
    }

    logger.info('Account deleted successfully', { accountNumber });

    return {
      success: true,
      deleted: result.deleted,
    };
  } catch (error) {
    logger.error('Failed to delete account', error);
    return errorHandler.handle(error, 'deleteAccount');
  }
}

/**
 * Get all accounts
 * @returns {Promise<Array>} Array of all accounts
 */
export async function getAllAccounts() {
  try {
    logger.debug('Getting all accounts');
    
    const db = getDatabase();
    const accounts = await db.query('accounts');
    
    logger.debug(`Retrieved ${accounts.length} accounts`);
    
    return accounts;
  } catch (error) {
    logger.error('Failed to get all accounts', error);
    return [];
  }
}

/**
 * Clear all accounts (for testing purposes)
 * @returns {Promise<Object>} Result
 */
export async function clearAllAccounts() {
  try {
    logger.warn('Clearing all accounts');
    
    const db = getDatabase();
    await db.delete('accounts', () => true);
    
    logger.info('All accounts cleared');
    
    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to clear accounts', error);
    return errorHandler.handle(error, 'clearAllAccounts');
  }
}
