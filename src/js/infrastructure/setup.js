/**
 * Database Setup Scripts
 * Initializes database schemas, migrations, and system configuration
 */

import { getDatabase } from './database.js';
import { Logger } from './logger.js';
import { TimeService } from './timeService.js';
import { getErrorHandler } from './errorHandler.js';

const logger = new Logger('DatabaseSetup');

/**
 * Database schema definitions
 */
const SCHEMAS = {
  accounts: {
    name: 'accounts',
    version: '1.0.0',
    fields: [
      { name: 'accountNumber', type: 'string', required: true, unique: true },
      { name: 'accountType', type: 'string', required: true },
      { name: 'customerName', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'phone', type: 'string', required: true },
      { name: 'address', type: 'string', required: true },
      { name: 'ssn', type: 'string', required: true },
      { name: 'balance', type: 'number', required: true, default: 0 },
      { name: 'status', type: 'string', required: true, default: 'active' },
      { name: 'createdAt', type: 'string', required: true },
      { name: 'updatedAt', type: 'string', required: true },
      { name: 'metadata', type: 'object', required: false },
    ],
    indexes: ['accountNumber', 'email', 'status'],
  },
  auditLogs: {
    name: 'auditLogs',
    version: '1.0.0',
    fields: [
      { name: 'id', type: 'string', required: true, unique: true },
      { name: 'action', type: 'string', required: true },
      { name: 'accountNumber', type: 'string', required: false },
      { name: 'details', type: 'object', required: false },
      { name: 'timestamp', type: 'string', required: true },
      { name: 'userAgent', type: 'string', required: false },
      { name: 'ipAddress', type: 'string', required: false },
    ],
    indexes: ['id', 'accountNumber', 'action', 'timestamp'],
  },
  metadata: {
    name: 'metadata',
    version: '1.0.0',
    fields: [
      { name: 'key', type: 'string', required: true, unique: true },
      { name: 'value', type: 'any', required: true },
      { name: 'updatedAt', type: 'string', required: true },
    ],
  },
};

/**
 * Setup database with initial schemas
 * @returns {Promise<Object>} Setup result
 */
export async function setupDatabase() {
  logger.info('Starting database setup...');

  try {
    const db = getDatabase();

    // Initialize database
    const initResult = await db.initialize();
    if (!initResult.success) {
      throw new Error('Database initialization failed');
    }

    // Verify schemas
    const verifyResult = await verifySchemas();
    if (!verifyResult.success) {
      throw new Error('Schema verification failed');
    }

    // Run migrations
    const migrateResult = await runMigrations();
    if (!migrateResult.success) {
      throw new Error('Migration failed');
    }

    // Seed initial data if needed
    const seedResult = await seedInitialData();
    if (!seedResult.success) {
      logger.warn('Initial data seeding had issues', seedResult.error);
    }

    // Verify integrity
    const integrityResult = await verifyDataIntegrity();
    if (!integrityResult.success) {
      logger.warn('Data integrity check had issues', integrityResult.error);
    }

    logger.info('Database setup completed successfully');

    return {
      success: true,
      message: 'Database setup completed',
      timestamp: TimeService.getCurrentTimestamp(),
      details: {
        schemas: Object.keys(SCHEMAS).length,
        migrations: migrateResult.migrations || 0,
        seeded: seedResult.seeded || false,
        integrityChecks: integrityResult.checks || 0,
      },
    };
  } catch (error) {
    logger.error('Database setup failed', error);
    const errorHandler = getErrorHandler();
    return errorHandler.handle(error, 'DatabaseSetup');
  }
}

/**
 * Verify that all schemas exist and are valid
 * @returns {Promise<Object>} Verification result
 */
async function verifySchemas() {
  logger.info('Verifying database schemas...');

  try {
    for (const schemaName in SCHEMAS) {
      const schema = SCHEMAS[schemaName];
      const exists = localStorage.getItem(schemaName);

      if (!exists) {
        logger.info(`Creating schema: ${schemaName}`);
        localStorage.setItem(schemaName, JSON.stringify([]));
      } else {
        logger.debug(`Schema exists: ${schemaName}`);
      }

      // Validate schema structure
      const data = JSON.parse(localStorage.getItem(schemaName) || '[]');
      if (!Array.isArray(data)) {
        throw new Error(`Invalid schema structure for ${schemaName}`);
      }
    }

    logger.info('All schemas verified successfully');
    return { success: true, schemas: Object.keys(SCHEMAS).length };
  } catch (error) {
    logger.error('Schema verification failed', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run database migrations
 * @returns {Promise<Object>} Migration result
 */
async function runMigrations() {
  logger.info('Running database migrations...');

  try {
    const db = getDatabase();
    const metadata = db.getMetadata();
    const currentVersion = metadata.schemaVersion || '0.0.0';

    logger.info(`Current schema version: ${currentVersion}`);

    // Define migrations
    const migrations = [
      {
        version: '1.0.0',
        name: 'Initial schema setup',
        up: async () => {
          logger.info('Running migration: Initial schema setup');
          // Already handled by initialize
          return { success: true };
        },
      },
      // Add more migrations here as needed
    ];

    // Run pending migrations
    let appliedMigrations = 0;
    for (const migration of migrations) {
      if (compareVersions(migration.version, currentVersion) > 0) {
        logger.info(`Applying migration: ${migration.name} (${migration.version})`);
        await migration.up();
        appliedMigrations++;
      }
    }

    // Update schema version
    if (appliedMigrations > 0) {
      const latestVersion = migrations[migrations.length - 1].version;
      db.setMetadata({
        ...metadata,
        schemaVersion: latestVersion,
        lastMigration: TimeService.getCurrentTimestamp(),
      });
    }

    logger.info(`Migrations completed. Applied: ${appliedMigrations}`);
    return { success: true, migrations: appliedMigrations };
  } catch (error) {
    logger.error('Migration failed', error);
    return { success: false, error: error.message };
  }
}

/**
 * Seed initial data if database is empty
 * @returns {Promise<Object>} Seed result
 */
async function seedInitialData() {
  logger.info('Checking if initial data seeding is needed...');

  try {
    const db = getDatabase();

    // Check if data already exists
    const accounts = await db.query('accounts');
    if (accounts.length > 0) {
      logger.info('Data already exists, skipping seed');
      return { success: true, seeded: false };
    }

    // Check if seed flag is set
    const metadata = db.getMetadata();
    if (metadata.seeded) {
      logger.info('Database already seeded, skipping');
      return { success: true, seeded: false };
    }

    // Seed initial configuration
    logger.info('Seeding initial configuration...');

    db.setMetadata({
      ...metadata,
      seeded: true,
      seedDate: TimeService.getCurrentTimestamp(),
      config: {
        maxAccountsPerCustomer: 5,
        minimumDeposits: {
          checking: 25,
          savings: 100,
          business: 500,
          money_market: 2500,
        },
        features: {
          auditTrail: true,
          notifications: false,
          twoFactorAuth: false,
        },
      },
    });

    logger.info('Initial data seeding completed');
    return { success: true, seeded: true };
  } catch (error) {
    logger.error('Initial data seeding failed', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify data integrity
 * @returns {Promise<Object>} Verification result
 */
async function verifyDataIntegrity() {
  logger.info('Verifying data integrity...');

  try {
    const db = getDatabase();
    const issues = [];
    let checks = 0;

    // Check accounts
    const accounts = await db.query('accounts');
    checks++;

    accounts.forEach((account, index) => {
      // Check required fields
      const requiredFields = SCHEMAS.accounts.fields
        .filter((f) => f.required)
        .map((f) => f.name);

      requiredFields.forEach((field) => {
        if (!account[field]) {
          issues.push(`Account at index ${index} missing required field: ${field}`);
        }
      });

      // Check unique fields
      const duplicates = accounts.filter((a) => a.accountNumber === account.accountNumber);
      if (duplicates.length > 1) {
        issues.push(`Duplicate account number: ${account.accountNumber}`);
      }
    });

    // Check audit logs
    const auditLogs = await db.query('auditLogs');
    checks++;

    auditLogs.forEach((log, index) => {
      if (!log.id || !log.action || !log.timestamp) {
        issues.push(`Audit log at index ${index} missing required fields`);
      }
    });

    if (issues.length > 0) {
      logger.warn(`Data integrity issues found: ${issues.length}`, issues);
      return {
        success: false,
        checks,
        issues: issues.length,
        details: issues.slice(0, 10), // Return first 10 issues
      };
    }

    logger.info(`Data integrity verified. Checks: ${checks}, Issues: 0`);
    return { success: true, checks, issues: 0 };
  } catch (error) {
    logger.error('Data integrity verification failed', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset database to initial state
 * @param {boolean} confirm - Confirmation flag
 * @returns {Promise<Object>} Reset result
 */
export async function resetDatabase(confirm = false) {
  if (!confirm) {
    logger.warn('Database reset requires confirmation');
    return {
      success: false,
      error: 'Reset requires confirmation. Pass true to confirm.',
    };
  }

  logger.warn('Resetting database...');

  try {
    const db = getDatabase();

    // Clear all collections
    await db.clearAll();

    // Clear metadata
    localStorage.removeItem('metadata');

    // Reinitialize
    const setupResult = await setupDatabase();

    logger.info('Database reset completed');
    return {
      success: true,
      message: 'Database reset successfully',
      setupResult,
    };
  } catch (error) {
    logger.error('Database reset failed', error);
    const errorHandler = getErrorHandler();
    return errorHandler.handle(error, 'DatabaseReset');
  }
}

/**
 * Export database
 * @returns {Promise<Object>} Export result
 */
export async function exportDatabase() {
  logger.info('Exporting database...');

  try {
    const db = getDatabase();
    const exportData = {
      version: '1.0.0',
      exportDate: TimeService.getCurrentTimestamp(),
      metadata: db.getMetadata(),
      data: {},
    };

    // Export all collections
    for (const schemaName in SCHEMAS) {
      exportData.data[schemaName] = await db.query(schemaName);
    }

    logger.info('Database exported successfully');
    return {
      success: true,
      data: exportData,
      json: JSON.stringify(exportData, null, 2),
    };
  } catch (error) {
    logger.error('Database export failed', error);
    const errorHandler = getErrorHandler();
    return errorHandler.handle(error, 'DatabaseExport');
  }
}

/**
 * Import database from export
 * @param {Object} importData - Data to import
 * @returns {Promise<Object>} Import result
 */
export async function importDatabase(importData) {
  logger.info('Importing database...');

  try {
    const db = getDatabase();

    // Validate import data
    if (!importData.version || !importData.data) {
      throw new Error('Invalid import data format');
    }

    // Clear existing data
    await db.clearAll();

    // Import collections
    for (const schemaName in importData.data) {
      const data = importData.data[schemaName];
      if (Array.isArray(data) && data.length > 0) {
        await db.insert(schemaName, data);
      }
    }

    // Import metadata
    if (importData.metadata) {
      db.setMetadata(importData.metadata);
    }

    logger.info('Database imported successfully');
    return {
      success: true,
      message: 'Database imported successfully',
      imported: Object.keys(importData.data).length,
    };
  } catch (error) {
    logger.error('Database import failed', error);
    const errorHandler = getErrorHandler();
    return errorHandler.handle(error, 'DatabaseImport');
  }
}

/**
 * Get database health status
 * @returns {Promise<Object>} Health status
 */
export async function getDatabaseHealth() {
  try {
    const db = getDatabase();
    const stats = db.getStats();
    const metadata = db.getMetadata();

    const health = {
      status: 'healthy',
      initialized: stats.initialized,
      uptime: metadata.lastAccess
        ? TimeService.diff(metadata.lastAccess, TimeService.getCurrentTimestamp(), 'seconds')
        : 0,
      collections: stats.collections,
      storage: stats.storage,
      pool: stats.pool,
      cache: stats.cache,
      lastAccess: metadata.lastAccess,
      version: metadata.version,
    };

    // Determine health status
    if (!stats.initialized) {
      health.status = 'uninitialized';
    } else if (stats.pool.utilizationPercent > 90) {
      health.status = 'degraded';
    } else if (parseInt(stats.storage.usedMB) > 4) {
      health.status = 'warning';
    }

    return {
      success: true,
      health,
    };
  } catch (error) {
    logger.error('Health check failed', error);
    return {
      success: false,
      health: { status: 'unhealthy' },
      error: error.message,
    };
  }
}

/**
 * Compare version strings
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Get schema information
 * @returns {Object} Schema information
 */
export function getSchemaInfo() {
  return {
    schemas: Object.keys(SCHEMAS).map((name) => ({
      name,
      version: SCHEMAS[name].version,
      fields: SCHEMAS[name].fields.length,
      indexes: SCHEMAS[name].indexes?.length || 0,
    })),
    total: Object.keys(SCHEMAS).length,
  };
}
