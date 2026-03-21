/**
 * Infrastructure Test Suite
 * Tests for database, logging, error handling, and time services
 */

import { getDatabase, initializeDatabase } from '../infrastructure/database.js';
import { Logger, getSystemLogs, clearSystemLogs } from '../infrastructure/logger.js';
import { TimeService } from '../infrastructure/timeService.js';
import { 
  getErrorHandler, 
  createError, 
  ErrorType, 
  ErrorSeverity 
} from '../infrastructure/errorHandler.js';
import { 
  setupDatabase, 
  getDatabaseHealth,
  exportDatabase,
  importDatabase,
  resetDatabase 
} from '../infrastructure/setup.js';

const logger = new Logger('InfrastructureTest');

/**
 * Run all infrastructure tests
 */
export async function runInfrastructureTests() {
  console.log('🧪 Starting Infrastructure Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test 1: Database Initialization
  await runTest(results, 'Database Initialization', async () => {
    const result = await initializeDatabase();
    assert(result.success, 'Database should initialize successfully');
    
    const db = getDatabase();
    assert(db.initialized, 'Database should be marked as initialized');
  });

  // Test 2: Database Insert and Query
  await runTest(results, 'Database Insert and Query', async () => {
    const db = getDatabase();
    
    const testData = {
      accountNumber: 'TEST-1234',
      customerName: 'Test User',
      email: 'test@example.com',
    };
    
    await db.insert('accounts', testData);
    
    const results = await db.query('accounts', (acc) => acc.accountNumber === 'TEST-1234');
    assert(results.length === 1, 'Should find inserted account');
    assert(results[0].customerName === 'Test User', 'Data should match');
  });

  // Test 3: Database Update
  await runTest(results, 'Database Update', async () => {
    const db = getDatabase();
    
    await db.update(
      'accounts',
      (acc) => acc.accountNumber === 'TEST-1234',
      { customerName: 'Updated User' }
    );
    
    const results = await db.query('accounts', (acc) => acc.accountNumber === 'TEST-1234');
    assert(results[0].customerName === 'Updated User', 'Data should be updated');
  });

  // Test 4: Database Delete
  await runTest(results, 'Database Delete', async () => {
    const db = getDatabase();
    
    await db.delete('accounts', (acc) => acc.accountNumber === 'TEST-1234');
    
    const results = await db.query('accounts', (acc) => acc.accountNumber === 'TEST-1234');
    assert(results.length === 0, 'Account should be deleted');
  });

  // Test 5: Connection Pool
  await runTest(results, 'Connection Pool', async () => {
    const db = getDatabase();
    const stats = db.pool.getStats();
    
    assert(stats.maxSize === 10, 'Pool should have max size of 10');
    assert(typeof stats.activeConnections === 'number', 'Should track active connections');
  });

  // Test 6: Query Cache
  await runTest(results, 'Query Cache', async () => {
    const db = getDatabase();
    
    // Insert test data
    await db.insert('accounts', { accountNumber: 'CACHE-TEST', name: 'Cache Test' });
    
    // First query (hits database)
    const result1 = await db.query('accounts', (acc) => acc.accountNumber === 'CACHE-TEST');
    
    // Second query (should use cache)
    const result2 = await db.query('accounts', (acc) => acc.accountNumber === 'CACHE-TEST');
    
    assert(result1.length === result2.length, 'Cache should return same results');
    
    // Clear cache and test data
    db.cache.clear();
    await db.delete('accounts', (acc) => acc.accountNumber === 'CACHE-TEST');
  });

  // Test 7: Logger
  await runTest(results, 'Logger', async () => {
    const testLogger = new Logger('TestLogger');
    
    testLogger.info('Test info message');
    testLogger.warn('Test warning message');
    testLogger.error('Test error message');
    
    const logs = testLogger.getLogs();
    assert(logs.length >= 3, 'Should log all messages');
  });

  // Test 8: System Logs
  await runTest(results, 'System Logs', async () => {
    clearSystemLogs();
    
    const testLogger = new Logger('SystemTest');
    testLogger.info('System test message');
    
    const logs = getSystemLogs();
    assert(logs.length > 0, 'Should persist system logs');
  });

  // Test 9: Time Service
  await runTest(results, 'Time Service', async () => {
    const timestamp = TimeService.getCurrentTimestamp();
    assert(timestamp.includes('T'), 'Should return ISO timestamp');
    
    const date = TimeService.formatDate(new Date());
    assert(date.length > 0, 'Should format date');
    
    const future = TimeService.add(new Date(), 1, 'days');
    const diff = TimeService.diff(future, new Date(), 'days');
    assert(diff === 1, 'Should calculate date difference correctly');
  });

  // Test 10: Error Handler
  await runTest(results, 'Error Handler', async () => {
    const errorHandler = getErrorHandler();
    
    const error = new Error('Test error');
    const result = errorHandler.handle(error, 'TestContext');
    
    assert(!result.success, 'Error result should indicate failure');
    assert(result.error.message, 'Should have error message');
    assert(result.error.code, 'Should have error code');
  });

  // Test 11: Custom Errors
  await runTest(results, 'Custom Errors', async () => {
    const error = createError(
      'Test validation error',
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      { field: 'test' }
    );
    
    assert(error.type === ErrorType.VALIDATION, 'Should have correct type');
    assert(error.severity === ErrorSeverity.LOW, 'Should have correct severity');
    assert(error.details.field === 'test', 'Should include details');
  });

  // Test 12: Database Setup
  await runTest(results, 'Database Setup', async () => {
    const result = await setupDatabase();
    assert(result.success, 'Setup should complete successfully');
  });

  // Test 13: Database Health
  await runTest(results, 'Database Health Check', async () => {
    const health = await getDatabaseHealth();
    assert(health.success, 'Health check should succeed');
    assert(health.health.status, 'Should have status');
  });

  // Test 14: Database Export/Import
  await runTest(results, 'Database Export/Import', async () => {
    const db = getDatabase();
    
    // Insert test data
    await db.insert('accounts', { accountNumber: 'EXPORT-TEST', name: 'Export Test' });
    
    // Export
    const exportResult = await exportDatabase();
    assert(exportResult.success, 'Export should succeed');
    assert(exportResult.json, 'Should have JSON export');
    
    // Import
    const importResult = await importDatabase(exportResult.data);
    assert(importResult.success, 'Import should succeed');
    
    // Verify data
    const accounts = await db.query('accounts', (acc) => acc.accountNumber === 'EXPORT-TEST');
    assert(accounts.length > 0, 'Imported data should exist');
    
    // Cleanup
    await db.delete('accounts', (acc) => acc.accountNumber === 'EXPORT-TEST');
  });

  // Test 15: Transaction Support
  await runTest(results, 'Transaction Support', async () => {
    const db = getDatabase();
    
    try {
      await db.transaction(async (db) => {
        await db.insert('accounts', { accountNumber: 'TX-TEST', name: 'Transaction Test' });
        // Simulate error
        throw new Error('Transaction rollback test');
      });
    } catch (error) {
      // Transaction should rollback
    }
    
    // Verify rollback
    const accounts = await db.query('accounts', (acc) => acc.accountNumber === 'TX-TEST');
    assert(accounts.length === 0, 'Transaction should rollback on error');
  });

  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All infrastructure tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.error}`);
    });
  }

  return results;
}

/**
 * Run a single test
 */
async function runTest(results, name, testFn) {
  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Export for use in console
if (typeof window !== 'undefined') {
  window.runInfrastructureTests = runInfrastructureTests;
}
