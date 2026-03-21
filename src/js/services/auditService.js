/**
 * Audit Service
 * Manages audit trail for account operations using infrastructure layer
 */

import { getDatabase } from '../infrastructure/database.js';
import { Logger } from '../infrastructure/logger.js';
import { TimeService } from '../infrastructure/timeService.js';
import { getErrorHandler } from '../infrastructure/errorHandler.js';

const logger = new Logger('AuditService');
const errorHandler = getErrorHandler();

/**
 * Log an audit entry
 * @param {Object} auditEntry - Audit entry to log
 * @param {string} auditEntry.action - Action performed
 * @param {string} auditEntry.accountNumber - Account number (optional)
 * @param {Object} auditEntry.details - Additional details
 * @param {string} auditEntry.timestamp - Timestamp of action
 * @returns {Promise<Object>} Log result
 */
export async function logAudit(auditEntry) {
  try {
    const db = getDatabase();

    // Create audit entry with unique ID
    const entry = {
      id: generateAuditId(),
      action: auditEntry.action,
      accountNumber: auditEntry.accountNumber || null,
      details: auditEntry.details || {},
      timestamp: auditEntry.timestamp || TimeService.getCurrentTimestamp(),
      userAgent: navigator.userAgent,
      ipAddress: 'N/A', // In a real system, this would be captured server-side
    };

    // Insert using infrastructure layer
    await db.insert('auditLogs', entry);

    // Log to system logger
    logger.info(`Audit: ${entry.action}`, {
      accountNumber: entry.accountNumber,
      details: entry.details,
    });

    return {
      success: true,
      entry,
    };
  } catch (error) {
    logger.error('Failed to log audit entry', error);
    return errorHandler.handle(error, 'logAudit');
  }
}

/**
 * Get audit logs for an account
 * @param {string} accountNumber - Account number
 * @returns {Promise<Array>} Array of audit entries
 */
export async function getAuditLogs(accountNumber) {
  try {
    const db = getDatabase();

    if (accountNumber) {
      return await db.query('auditLogs', (log) => log.accountNumber === accountNumber);
    }

    return await db.query('auditLogs');
  } catch (error) {
    logger.error('Failed to get audit logs', error);
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
    const db = getDatabase();
    const auditLogs = await db.query('auditLogs');
    return auditLogs.slice(-limit).reverse();
  } catch (error) {
    logger.error('Failed to get recent audit logs', error);
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
    const db = getDatabase();
    return await db.query('auditLogs', (log) => log.action === action);
  } catch (error) {
    logger.error('Failed to get audit logs by action', error);
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
    const db = getDatabase();
    return await db.query('auditLogs', (log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  } catch (error) {
    logger.error('Failed to get audit logs by date range', error);
    return [];
  }
}

/**
 * Clear all audit logs (for testing purposes)
 * @returns {Promise<Object>} Result
 */
export async function clearAuditLogs() {
  try {
    logger.warn('Clearing all audit logs');
    
    const db = getDatabase();
    await db.delete('auditLogs', () => true);
    
    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to clear audit logs', error);
    return errorHandler.handle(error, 'clearAuditLogs');
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
    const db = getDatabase();
    const auditLogs = await db.query('auditLogs');

    const stats = {
      totalEntries: auditLogs.length,
      actionCounts: {},
      accountsAudited: new Set(),
      dateRange: {
        oldest: null,
        newest: null,
      },
    };

    auditLogs.forEach((log) => {
      // Count actions
      stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;

      // Track accounts
      if (log.accountNumber) {
        stats.accountsAudited.add(log.accountNumber);
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
    delete stats.accountsAudited; // Remove the Set object

    return stats;
  } catch (error) {
    logger.error('Failed to get audit statistics', error);
    return {
      totalEntries: 0,
      actionCounts: {},
      uniqueAccountsAudited: 0,
      dateRange: { oldest: null, newest: null },
    };
  }
}
