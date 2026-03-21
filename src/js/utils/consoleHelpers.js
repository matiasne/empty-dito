/**
 * Console Helper Utilities
 * Provides convenient console commands for testing and debugging
 */

import { getDatabase } from '../infrastructure/database.js';
import { getSystemLogs, clearSystemLogs, getLogStatistics } from '../infrastructure/logger.js';
import { getErrorHandler } from '../infrastructure/errorHandler.js';
import { getDatabaseHealth, exportDatabase, importDatabase, resetDatabase } from '../infrastructure/setup.js';
import { getInfrastructureStatus } from '../infrastructure/index.js';
import { runInfrastructureTests } from '../tests/infrastructureTest.js';

/**
 * Database utilities
 */
export const db = {
  /**
   * Get database statistics
   */
  stats: () => {
    const database = getDatabase();
    return database.getStats();
  },

  /**
   * Query accounts
   */
  accounts: async () => {
    const database = getDatabase();
    return await database.query('accounts');
  },

  /**
   * Query audit logs
   */
  auditLogs: async () => {
    const database = getDatabase();
    return await database.query('auditLogs');
  },

  /**
   * Get database health
   */
  health: async () => {
    return await getDatabaseHealth();
  },

  /**
   * Export database
   */
  export: async () => {
    const result = await exportDatabase();
    console.log('Database exported. Use db.import() to restore.');
    return result.json;
  },

  /**
   * Import database
   */
  import: async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      return await importDatabase(data);
    } catch (error) {
      console.error('Import failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reset database
   */
  reset: async () => {
    const confirm = window.confirm('Are you sure you want to reset the database? This will delete all data!');
    if (confirm) {
      return await resetDatabase(true);
    }
    return { success: false, error: 'Reset cancelled' };
  },

  /**
   * Clear all data
   */
  clear: async () => {
    const database = getDatabase();
    return await database.clearAll();
  },
};

/**
 * Logging utilities
 */
export const logs = {
  /**
   * Get all system logs
   */
  all: () => {
    return getSystemLogs();
  },

  /**
   * Get recent logs
   */
  recent: (limit = 50) => {
    return getSystemLogs({ limit });
  },

  /**
   * Get logs by level
   */
  byLevel: (level) => {
    return getSystemLogs({ level });
  },

  /**
   * Get logs by context
   */
  byContext: (context) => {
    return getSystemLogs({ context });
  },

  /**
   * Get log statistics
   */
  stats: () => {
    return getLogStatistics();
  },

  /**
   * Clear all logs
   */
  clear: () => {
    clearSystemLogs();
    console.log('System logs cleared');
  },
};

/**
 * Error utilities
 */
export const errors = {
  /**
   * Get all errors
   */
  all: () => {
    const errorHandler = getErrorHandler();
    return errorHandler.getErrors();
  },

  /**
   * Get recent errors
   */
  recent: (limit = 20) => {
    const errorHandler = getErrorHandler();
    return errorHandler.getErrors({ limit });
  },

  /**
   * Get errors by type
   */
  byType: (type) => {
    const errorHandler = getErrorHandler();
    return errorHandler.getErrors({ type });
  },

  /**
   * Get error statistics
   */
  stats: () => {
    const errorHandler = getErrorHandler();
    return errorHandler.getStatistics();
  },

  /**
   * Clear all errors
   */
  clear: () => {
    const errorHandler = getErrorHandler();
    errorHandler.clearErrors();
    console.log('Error logs cleared');
  },
};

/**
 * Infrastructure utilities
 */
export const infra = {
  /**
   * Get infrastructure status
   */
  status: async () => {
    return await getInfrastructureStatus();
  },

  /**
   * Run infrastructure tests
   */
  test: async () => {
    return await runInfrastructureTests();
  },

  /**
   * Get complete system report
   */
  report: async () => {
    const status = await getInfrastructureStatus();
    const dbHealth = await getDatabaseHealth();
    const dbStats = db.stats();
    const logStats = logs.stats();
    const errorStats = errors.stats();

    return {
      status: status.status,
      database: {
        health: dbHealth.health,
        stats: dbStats,
      },
      logging: logStats,
      errors: errorStats,
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Helper to print formatted output
 */
export const print = {
  /**
   * Print database stats
   */
  dbStats: () => {
    const stats = db.stats();
    console.log('📊 Database Statistics:');
    console.table({
      'Initialized': stats.initialized,
      'Active Connections': `${stats.pool.activeConnections}/${stats.pool.maxSize}`,
      'Pool Utilization': `${stats.pool.utilizationPercent}%`,
      'Cache Size': stats.cache.size,
      'Accounts': stats.collections.accounts,
      'Audit Logs': stats.collections.auditLogs,
      'Storage Used': `${stats.storage.usedKB} KB`,
    });
  },

  /**
   * Print infrastructure status
   */
  status: async () => {
    const status = await infra.status();
    console.log('🏗️  Infrastructure Status:');
    console.log('Database:', status.status.database.status);
    console.log('Total Logs:', status.status.logging.total);
    console.log('Total Errors:', status.status.errors.total);
    console.log('Storage:', `${status.status.storage.usedKB} KB`);
  },

  /**
   * Print full report
   */
  report: async () => {
    const report = await infra.report();
    console.log('📋 System Report:');
    console.log(JSON.stringify(report, null, 2));
  },
};

/**
 * Quick reference
 */
export const help = () => {
  console.log(`
🛠️  Console Helpers Available:

📦 Database (db):
  db.stats()           - Get database statistics
  db.accounts()        - Query all accounts
  db.auditLogs()       - Query all audit logs
  db.health()          - Check database health
  db.export()          - Export database
  db.import(json)      - Import database
  db.reset()           - Reset database (with confirmation)
  db.clear()           - Clear all data

📝 Logging (logs):
  logs.all()           - Get all system logs
  logs.recent(50)      - Get recent logs
  logs.byLevel(level)  - Get logs by level
  logs.byContext(ctx)  - Get logs by context
  logs.stats()         - Get log statistics
  logs.clear()         - Clear all logs

❌ Errors (errors):
  errors.all()         - Get all errors
  errors.recent(20)    - Get recent errors
  errors.byType(type)  - Get errors by type
  errors.stats()       - Get error statistics
  errors.clear()       - Clear error logs

🏗️  Infrastructure (infra):
  infra.status()       - Get infrastructure status
  infra.test()         - Run infrastructure tests
  infra.report()       - Get complete system report

📊 Print (print):
  print.dbStats()      - Print database stats table
  print.status()       - Print infrastructure status
  print.report()       - Print full system report

❓ Help:
  help()               - Show this message

Example:
  await db.health()
  print.dbStats()
  await infra.test()
  `);
};

// Register global helpers
if (typeof window !== 'undefined') {
  window.db = db;
  window.logs = logs;
  window.errors = errors;
  window.infra = infra;
  window.print = print;
  window.help = help;

  // Show help on load
  console.log('💡 Console helpers loaded! Type help() for available commands.');
}
