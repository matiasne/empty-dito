/**
 * Account Database
 * Simulates database operations using localStorage
 */

/**
 * Save account to database
 * @param {Object} account - Account object to save
 * @returns {Promise<Object>} Save result
 */
export async function saveAccount(account) {
  try {
    // Get existing accounts
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    // Check if account number already exists
    const exists = accounts.some((acc) => acc.accountNumber === account.accountNumber);
    if (exists) {
      return {
        success: false,
        error: 'Account number already exists',
      };
    }

    // Add new account
    accounts.push(account);

    // Save to localStorage
    localStorage.setItem('accounts', JSON.stringify(accounts));

    return {
      success: true,
      account,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if an account exists with given criteria
 * @param {Object} criteria - Search criteria (e.g., { email: 'test@example.com' })
 * @returns {Promise<Object|null>} Account object if found, null otherwise
 */
export async function accountExists(criteria) {
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    const account = accounts.find((acc) => {
      return Object.keys(criteria).every((key) => acc[key] === criteria[key]);
    });

    return account || null;
  } catch (error) {
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
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const account = accounts.find((acc) => acc.accountNumber === accountNumber);
    return account || null;
  } catch (error) {
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
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const accountIndex = accounts.findIndex((acc) => acc.accountNumber === accountNumber);

    if (accountIndex === -1) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    // Update account
    accounts[accountIndex] = {
      ...accounts[accountIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('accounts', JSON.stringify(accounts));

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

/**
 * Delete account from database
 * @param {string} accountNumber - Account number
 * @returns {Promise<Object>} Delete result
 */
export async function deleteAccount(accountNumber) {
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const filteredAccounts = accounts.filter((acc) => acc.accountNumber !== accountNumber);

    if (accounts.length === filteredAccounts.length) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    localStorage.setItem('accounts', JSON.stringify(filteredAccounts));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all accounts
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
 * Clear all accounts (for testing purposes)
 * @returns {Promise<Object>} Result
 */
export async function clearAllAccounts() {
  try {
    localStorage.removeItem('accounts');
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
