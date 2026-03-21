/**
 * Infrastructure Module Index
 * Central export point for all infrastructure components
 */

// Database
export { Database, getDatabase, initializeDatabase } from './database.js';

// Logging
export { Logger, LogLevel, getSystemLogs, clearSystemLogs, exportLogs, getLogStatistics } from './logger.js';

// Time Service
export {
  TimeService,
  TimeFormat,
  getCurrentTimestamp,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
} from './timeService.js';

// Error Handling
export {
  ErrorHandler,
  ErrorType,
  ErrorSeverity,
  AppError,
  getErrorHandler,
  createError,
  setupGlobalErrorHandling,
} from './errorHandler.js';

// Setup Scripts
export {
  setupDatabase,
  resetDatabase,
  exportDatabase,
  importDatabase,
  getDatabaseHealth,
  getSchemaInfo,
} from './setup.js';

/**
 * Initialize all infrastructure components
 * @returns {Promise<Object>} Initialization result
 */
export async function initializeInfrastructure() {
  const results = {
    database: null,
    errorHandling: null,
  };

  try {
    // Setup global error handling
    const { setupGlobalErrorHandling: setup } = await import('./errorHandler.js');
    setup();
    results.errorHandling = { success: true };

    // Initialize database
    const { setupDatabase: dbSetup } = await import('./setup.js');
    results.database = await dbSetup();

    return {
      success: true,
      message: 'Infrastructure initialized successfully',
      results,
    };
  } catch (error) {
    console.error('Infrastructure initialization failed:', error);
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

/**
 * Get infrastructure status
 * @returns {Promise<Object>} Status information
 */
export async function getInfrastructureStatus() {
  try {
    const { getDatabaseHealth } = await import('./setup.js');
    const { getLogStatistics } = await import('./logger.js');
    const { getErrorHandler } = await import('./errorHandler.js');
    const { getDatabase } = await import('./database.js');

    const dbHealth = await getDatabaseHealth();
    const logStats = getLogStatistics();
    const errorHandler = getErrorHandler();
    const errorStats = errorHandler.getStatistics();
    const db = getDatabase();
    const dbStats = db.getStats();

    return {
      success: true,
      status: {
        database: dbHealth.health,
        logging: logStats,
        errors: errorStats,
        storage: dbStats.storage,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
