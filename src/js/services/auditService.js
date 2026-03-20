/**
 * Audit Service
 * Manages audit trail for account operations
 */

/**
 * Log an audit entry
 * @param {Object} auditEntry - Audit entry to log
 * @param {string} auditEntry.action - Action performed
 * @param {string} auditEntry.accountNumber - Account number (optional)
 * @param {string} auditEntry.customerId - Customer ID (optional)
 * @param {Object} auditEntry.details - Additional details
 * @param {string} auditEntry.timestamp - Timestamp of action
 * @returns {Promise<Object>} Log result
 */
export async function logAudit(auditEntry) {
  try {
    // Get existing audit logs
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');

    // Create audit entry with unique ID
    const entry = {
      id: generateAuditId(),
      action: auditEntry.action,
      accountNumber: auditEntry.accountNumber || null,
      customerId: auditEntry.customerId || null,
      details: auditEntry.details || {},
      timestamp: auditEntry.timestamp || new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'N/A', // In a real system, this would be captured server-side
    };

    // Add to audit logs
    auditLogs.push(entry);

    // Save to localStorage (keep last 1000 entries)
    const trimmedLogs = auditLogs.slice(-1000);
    localStorage.setItem('auditLogs', JSON.stringify(trimmedLogs));

    // Also log to console in development
    console.log('[AUDIT]', entry);

    return {
      success: true,
      entry,
    };
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get audit logs for an account or customer
 * @param {string} accountNumber - Account number (optional)
 * @param {string} customerId - Customer ID (optional)
 * @returns {Promise<Array>} Array of audit entries
 */
export async function getAuditLogs(accountNumber, customerId) {
  try {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');

    if (accountNumber) {
      return auditLogs.filter((log) => log.accountNumber === accountNumber);
    }

    if (customerId) {
      return auditLogs.filter((log) => log.customerId === customerId);
    }

    return auditLogs;
  } catch (error) {
    return [];
  }
}

/**
 * Get recent audit logs
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<Array>} Array of recent audit entries
 */
export async function getRecentAuditLogs(limit = 50) {
  try {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    return auditLogs.slice(-limit).reverse();
  } catch (error) {
    return [];
  }
}

/**
 * Get audit logs by action type
 * @param {string} action - Action type to filter by
 * @returns {Promise<Array>} Array of audit entries
 */
export async function getAuditLogsByAction(action) {
  try {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    return auditLogs.filter((log) => log.action === action);
  } catch (error) {
    return [];
  }
}

/**
 * Get audit logs within a date range
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<Array>} Array of audit entries
 */
export async function getAuditLogsByDateRange(startDate, endDate) {
  try {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    return auditLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  } catch (error) {
    return [];
  }
}

/**
 * Clear all audit logs (for testing purposes)
 * @returns {Promise<Object>} Result
 */
export async function clearAuditLogs() {
  try {
    localStorage.removeItem('auditLogs');
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
 * Generate unique audit ID
 * @returns {string} Unique ID
 */
function generateAuditId() {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export audit logs as JSON
 * @returns {Promise<string>} JSON string of all audit logs
 */
export async function exportAuditLogs() {
  try {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    return JSON.stringify(auditLogs, null, 2);
  } catch (error) {
    return '[]';
  }
}

/**
 * Get audit statistics
 * @returns {Promise<Object>} Audit statistics
 */
export async function getAuditStatistics() {
  try {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');

    const stats = {
      totalEntries: auditLogs.length,
      actionCounts: {},
      accountsAudited: new Set(),
      dateRange: {
        oldest: null,
        newest: null,
      },
    };

    const customersAudited = new Set();

    auditLogs.forEach((log) => {
      // Count actions
      stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;

      // Track accounts
      if (log.accountNumber) {
        stats.accountsAudited.add(log.accountNumber);
      }

      // Track customers
      if (log.customerId) {
        customersAudited.add(log.customerId);
      }

      // Track date range
      const logDate = new Date(log.timestamp);
      if (!stats.dateRange.oldest || logDate < new Date(stats.dateRange.oldest)) {
        stats.dateRange.oldest = log.timestamp;
      }
      if (!stats.dateRange.newest || logDate > new Date(stats.dateRange.newest)) {
        stats.dateRange.newest = log.timestamp;
      }
    });

    stats.uniqueAccountsAudited = stats.accountsAudited.size;
    stats.uniqueCustomersAudited = customersAudited.size;
    delete stats.accountsAudited; // Remove the Set object

    return stats;
  } catch (error) {
    return {
      totalEntries: 0,
      actionCounts: {},
      uniqueAccountsAudited: 0,
      dateRange: { oldest: null, newest: null },
    };
  }
}
