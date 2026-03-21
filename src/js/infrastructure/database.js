/**
 * Database Infrastructure Layer
 * Provides core database access with error handling, connection pooling, and resource management
 */

import { Logger } from './logger.js';
import { TimeService } from './timeService.js';
import { ErrorHandler } from './errorHandler.js';

/**
 * Database configuration
 */
const DB_CONFIG = {
  storageType: 'localStorage', // Can be extended to indexedDB, etc.
  maxRetries: 3,
  retryDelay: 1000,
  maxPoolSize: 10,
  poolTimeout: 5000,
  enableLogging: true,
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
};

/**
 * Connection pool for managing concurrent database operations
 */
class ConnectionPool {
  constructor(maxSize = DB_CONFIG.maxPoolSize) {
    this.maxSize = maxSize;
    this.activeConnections = 0;
    this.queue = [];
    this.logger = new Logger('ConnectionPool');
  }

  /**
   * Acquire a connection from the pool
   * @returns {Promise<Object>} Connection object
   */
  async acquire() {
    if (this.activeConnections < this.maxSize) {
      this.activeConnections++;
      this.logger.debug(`Connection acquired. Active: ${this.activeConnections}/${this.maxSize}`);
      return { id: Date.now(), timestamp: TimeService.getCurrentTimestamp() };
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.queue.findIndex((item) => item.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        reject(new Error('Connection pool timeout'));
      }, DB_CONFIG.poolTimeout);

      this.queue.push({ resolve, reject, timeout });
    });
  }

  /**
   * Release a connection back to the pool
   * @param {Object} connection - Connection to release
   */
  release(connection) {
    this.activeConnections--;
    this.logger.debug(`Connection released. Active: ${this.activeConnections}/${this.maxSize}`);

    if (this.queue.length > 0) {
      const { resolve, timeout } = this.queue.shift();
      clearTimeout(timeout);
      this.activeConnections++;
      resolve({ id: Date.now(), timestamp: TimeService.getCurrentTimestamp() });
    }
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   */
  getStats() {
    return {
      maxSize: this.maxSize,
      activeConnections: this.activeConnections,
      queuedRequests: this.queue.length,
      utilizationPercent: ((this.activeConnections / this.maxSize) * 100).toFixed(2),
    };
  }
}

/**
 * Simple cache implementation for database queries
 */
class QueryCache {
  constructor(timeout = DB_CONFIG.cacheTimeout) {
    this.cache = new Map();
    this.timeout = timeout;
    this.logger = new Logger('QueryCache');
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.timeout) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
    this.logger.debug(`Cache set: ${key}`);
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      timeout: this.timeout,
    };
  }
}

/**
 * Database class with connection pooling and error handling
 */
export class Database {
  constructor() {
    this.pool = new ConnectionPool();
    this.cache = new QueryCache();
    this.logger = new Logger('Database');
    this.errorHandler = new ErrorHandler();
    this.initialized = false;
  }

  /**
   * Initialize database
   * @returns {Promise<Object>} Initialization result
   */
  async initialize() {
    if (this.initialized) {
      this.logger.warn('Database already initialized');
      return { success: true, message: 'Already initialized' };
    }

    try {
      this.logger.info('Initializing database...');

      // Check storage availability
      if (!this.isStorageAvailable()) {
        throw new Error('Storage is not available');
      }

      // Initialize schemas
      await this.initializeSchemas();

      this.initialized = true;
      this.logger.info('Database initialized successfully');

      return {
        success: true,
        message: 'Database initialized',
        timestamp: TimeService.getCurrentTimestamp(),
      };
    } catch (error) {
      this.logger.error('Database initialization failed', error);
      return this.errorHandler.handle(error, 'Database initialization');
    }
  }

  /**
   * Initialize database schemas
   * @private
   */
  async initializeSchemas() {
    const schemas = ['accounts', 'auditLogs', 'metadata'];

    for (const schema of schemas) {
      if (!localStorage.getItem(schema)) {
        localStorage.setItem(schema, JSON.stringify([]));
        this.logger.info(`Schema initialized: ${schema}`);
      }
    }

    // Initialize metadata
    const metadata = this.getMetadata();
    if (!metadata.initialized) {
      this.setMetadata({
        initialized: true,
        version: '1.0.0',
        createdAt: TimeService.getCurrentTimestamp(),
        lastAccess: TimeService.getCurrentTimestamp(),
      });
    } else {
      // Update last access time
      this.setMetadata({
        ...metadata,
        lastAccess: TimeService.getCurrentTimestamp(),
      });
    }
  }

  /**
   * Execute a database operation with retry logic
   * @param {Function} operation - Operation to execute
   * @param {string} operationName - Name for logging
   * @returns {Promise<*>} Operation result
   */
  async executeWithRetry(operation, operationName = 'operation') {
    let lastError;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= DB_CONFIG.maxRetries; attempt++) {
      let connection;
      try {
        // Acquire connection from pool
        connection = await this.pool.acquire();

        // Execute operation
        const result = await operation();

        // Log success
        const duration = Date.now() - startTime;
        this.logger.debug(`${operationName} completed in ${duration}ms`);

        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `${operationName} attempt ${attempt}/${DB_CONFIG.maxRetries} failed: ${error.message}`
        );

        if (attempt < DB_CONFIG.maxRetries) {
          await this.sleep(DB_CONFIG.retryDelay * attempt);
        }
      } finally {
        // Always release connection
        if (connection) {
          this.pool.release(connection);
        }
      }
    }

    // All retries failed
    const error = new Error(`${operationName} failed after ${DB_CONFIG.maxRetries} attempts`);
    error.cause = lastError;
    throw error;
  }

  /**
   * Query data with caching
   * @param {string} collection - Collection name
   * @param {Function} filter - Filter function
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} Query results
   */
  async query(collection, filter = null, useCache = true) {
    const cacheKey = `query_${collection}_${filter ? filter.toString() : 'all'}`;

    // Check cache
    if (useCache && DB_CONFIG.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    return this.executeWithRetry(async () => {
      try {
        const data = JSON.parse(localStorage.getItem(collection) || '[]');
        const results = filter ? data.filter(filter) : data;

        // Cache results
        if (useCache && DB_CONFIG.enableCaching) {
          this.cache.set(cacheKey, results);
        }

        return results;
      } catch (error) {
        throw new Error(`Failed to query ${collection}: ${error.message}`);
      }
    }, `Query ${collection}`);
  }

  /**
   * Insert data
   * @param {string} collection - Collection name
   * @param {Object|Array} data - Data to insert
   * @returns {Promise<Object>} Insert result
   */
  async insert(collection, data) {
    return this.executeWithRetry(async () => {
      try {
        const existing = JSON.parse(localStorage.getItem(collection) || '[]');
        const newData = Array.isArray(data) ? data : [data];

        // Add timestamps
        const timestamp = TimeService.getCurrentTimestamp();
        const dataWithTimestamps = newData.map((item) => ({
          ...item,
          createdAt: item.createdAt || timestamp,
          updatedAt: timestamp,
        }));

        const updated = [...existing, ...dataWithTimestamps];
        localStorage.setItem(collection, JSON.stringify(updated));

        // Clear cache for this collection
        this.cache.clear();

        this.logger.info(`Inserted ${newData.length} item(s) into ${collection}`);

        return {
          success: true,
          inserted: dataWithTimestamps.length,
          data: dataWithTimestamps,
        };
      } catch (error) {
        throw new Error(`Failed to insert into ${collection}: ${error.message}`);
      }
    }, `Insert into ${collection}`);
  }

  /**
   * Update data
   * @param {string} collection - Collection name
   * @param {Function} filter - Filter function to find items
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Update result
   */
  async update(collection, filter, updates) {
    return this.executeWithRetry(async () => {
      try {
        const data = JSON.parse(localStorage.getItem(collection) || '[]');
        let updatedCount = 0;

        const updated = data.map((item) => {
          if (filter(item)) {
            updatedCount++;
            return {
              ...item,
              ...updates,
              updatedAt: TimeService.getCurrentTimestamp(),
            };
          }
          return item;
        });

        if (updatedCount > 0) {
          localStorage.setItem(collection, JSON.stringify(updated));
          this.cache.clear();
          this.logger.info(`Updated ${updatedCount} item(s) in ${collection}`);
        }

        return {
          success: true,
          updated: updatedCount,
        };
      } catch (error) {
        throw new Error(`Failed to update ${collection}: ${error.message}`);
      }
    }, `Update ${collection}`);
  }

  /**
   * Delete data
   * @param {string} collection - Collection name
   * @param {Function} filter - Filter function to find items to delete
   * @returns {Promise<Object>} Delete result
   */
  async delete(collection, filter) {
    return this.executeWithRetry(async () => {
      try {
        const data = JSON.parse(localStorage.getItem(collection) || '[]');
        const filtered = data.filter((item) => !filter(item));
        const deletedCount = data.length - filtered.length;

        if (deletedCount > 0) {
          localStorage.setItem(collection, JSON.stringify(filtered));
          this.cache.clear();
          this.logger.info(`Deleted ${deletedCount} item(s) from ${collection}`);
        }

        return {
          success: true,
          deleted: deletedCount,
        };
      } catch (error) {
        throw new Error(`Failed to delete from ${collection}: ${error.message}`);
      }
    }, `Delete from ${collection}`);
  }

  /**
   * Transaction support (simulated for localStorage)
   * @param {Function} operations - Function containing operations
   * @returns {Promise<*>} Transaction result
   */
  async transaction(operations) {
    const backup = this.createBackup();

    try {
      const result = await operations(this);
      return result;
    } catch (error) {
      // Rollback on error
      this.restoreBackup(backup);
      this.logger.error('Transaction failed, rolled back', error);
      throw error;
    }
  }

  /**
   * Create backup of all data
   * @private
   */
  createBackup() {
    const backup = {};
    const keys = ['accounts', 'auditLogs', 'metadata'];

    keys.forEach((key) => {
      backup[key] = localStorage.getItem(key);
    });

    return backup;
  }

  /**
   * Restore from backup
   * @private
   */
  restoreBackup(backup) {
    Object.keys(backup).forEach((key) => {
      if (backup[key] !== null) {
        localStorage.setItem(key, backup[key]);
      }
    });
    this.cache.clear();
  }

  /**
   * Get database metadata
   * @returns {Object} Metadata
   */
  getMetadata() {
    try {
      return JSON.parse(localStorage.getItem('metadata') || '{}');
    } catch (error) {
      return {};
    }
  }

  /**
   * Set database metadata
   * @param {Object} metadata - Metadata to set
   */
  setMetadata(metadata) {
    localStorage.setItem('metadata', JSON.stringify(metadata));
  }

  /**
   * Get database statistics
   * @returns {Object} Database statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      pool: this.pool.getStats(),
      cache: this.cache.getStats(),
      collections: {
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]').length,
        auditLogs: JSON.parse(localStorage.getItem('auditLogs') || '[]').length,
      },
      storage: this.getStorageStats(),
    };
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage stats
   */
  getStorageStats() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }

    return {
      usedBytes: total,
      usedKB: (total / 1024).toFixed(2),
      usedMB: (total / 1024 / 1024).toFixed(2),
    };
  }

  /**
   * Check if storage is available
   * @returns {boolean} True if available
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Clear all data (for testing)
   * @returns {Promise<Object>} Clear result
   */
  async clearAll() {
    return this.executeWithRetry(async () => {
      const schemas = ['accounts', 'auditLogs'];
      schemas.forEach((schema) => {
        localStorage.setItem(schema, JSON.stringify([]));
      });
      this.cache.clear();
      this.logger.warn('All data cleared');
      return { success: true };
    }, 'Clear all data');
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let dbInstance = null;

/**
 * Get database instance
 * @returns {Database} Database instance
 */
export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

/**
 * Initialize database (convenience function)
 * @returns {Promise<Object>} Initialization result
 */
export async function initializeDatabase() {
  const db = getDatabase();
  return await db.initialize();
}
