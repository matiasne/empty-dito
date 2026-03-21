# Infrastructure Layer - Quick Reference

## Console Commands (Copy & Paste Ready)

### Database

```javascript
// Get database statistics
db.stats()

// Query all accounts
await db.accounts()

// Query audit logs
await db.auditLogs()

// Check database health
await db.health()

// Export database (returns JSON string)
const backup = await db.export()

// Import database
await db.import(backup)

// Reset database (with confirmation)
await db.reset()

// Clear all data
await db.clear()
```

### Logging

```javascript
// Get all logs
logs.all()

// Get recent logs (default 50)
logs.recent(100)

// Get logs by level
logs.byLevel(LogLevel.ERROR)

// Get logs by context
logs.byContext('Database')

// Get log statistics
logs.stats()

// Clear all logs
logs.clear()
```

### Errors

```javascript
// Get all errors
errors.all()

// Get recent errors (default 20)
errors.recent(50)

// Get errors by type
errors.byType('DatabaseError')

// Get error statistics
errors.stats()

// Clear error logs
errors.clear()
```

### Infrastructure

```javascript
// Get infrastructure status
await infra.status()

// Run all infrastructure tests
await infra.test()

// Get complete system report
await infra.report()
```

### Print (Formatted Output)

```javascript
// Print database stats as table
print.dbStats()

// Print infrastructure status
await print.status()

// Print full system report
await print.report()
```

### Help

```javascript
// Show all available commands
help()
```

---

## Code Examples

### Using Database

```javascript
import { getDatabase } from './infrastructure/database.js';

const db = getDatabase();

// Initialize (done automatically)
await db.initialize();

// Query with caching
const accounts = await db.query('accounts', (acc) => acc.status === 'active');

// Insert data
await db.insert('accounts', { 
  accountNumber: '1234',
  customerName: 'John Doe',
  email: 'john@example.com'
});

// Update data
await db.update(
  'accounts',
  (acc) => acc.accountNumber === '1234',
  { status: 'closed' }
);

// Delete data
await db.delete('accounts', (acc) => acc.status === 'closed');

// Transaction with rollback
await db.transaction(async (db) => {
  await db.insert('accounts', data);
  await db.insert('auditLogs', log);
  // If any operation fails, all operations rollback
});

// Get statistics
const stats = db.getStats();
console.log('Pool utilization:', stats.pool.utilizationPercent + '%');
```

### Using Logger

```javascript
import { Logger } from './infrastructure/logger.js';

const logger = new Logger('MyComponent');

// Log at different levels
logger.debug('Debug message', { data: 'value' });
logger.info('Operation started');
logger.warn('Warning: approaching limit');
logger.error('Error occurred', error);
logger.fatal('Critical system failure', error);

// Create child logger
const childLogger = logger.child('SubComponent');
childLogger.info('Child logger message');

// Get logs
const logs = logger.getLogs();
const errorLogs = logger.getLogs(LogLevel.ERROR);

// Clear logs
logger.clearLogs();
```

### Using Time Service

```javascript
import { TimeService } from './infrastructure/timeService.js';

// Get current timestamp
const now = TimeService.getCurrentTimestamp(); // ISO format
const unix = TimeService.getCurrentUnixTimestamp();

// Format dates
const date = TimeService.formatDate(new Date()); // "January 1, 2024"
const time = TimeService.formatTime(new Date()); // "12:30:45 PM"
const dateTime = TimeService.formatDateTime(new Date()); // "Jan 1, 2024, 12:30:45 PM"
const relative = TimeService.getRelativeTime('2024-01-01'); // "2 hours ago"

// Date arithmetic
const tomorrow = TimeService.add(new Date(), 1, 'days');
const lastWeek = TimeService.subtract(new Date(), 7, 'days');
const diff = TimeService.diff(date1, date2, 'hours'); // Difference in hours

// Date checks
const isPast = TimeService.isPast('2024-01-01');
const isFuture = TimeService.isFuture('2025-01-01');
const isToday = TimeService.isToday(new Date());

// Performance measurement
await TimeService.measureTime(async () => {
  // Your operation here
}, 'Operation Name');
```

### Using Error Handler

```javascript
import { 
  getErrorHandler, 
  createError, 
  ErrorType, 
  ErrorSeverity 
} from './infrastructure/errorHandler.js';

const errorHandler = getErrorHandler();

// Handle errors
try {
  await someOperation();
} catch (error) {
  const result = errorHandler.handle(error, 'OperationContext');
  console.log(result.error.message); // User-friendly message
  console.log(result.error.code); // Error code
}

// Create custom errors
const error = createError(
  'Invalid email address',
  ErrorType.VALIDATION,
  ErrorSeverity.LOW,
  { field: 'email', value: 'invalid' }
);

// Register error callbacks
errorHandler.onError((error) => {
  // Do something with every error
  console.log('Error occurred:', error);
});

// Get error statistics
const stats = errorHandler.getStatistics();
console.log('Total errors:', stats.total);
console.log('By type:', stats.byType);
console.log('Recent:', stats.recentErrors);
```

### Using Setup Scripts

```javascript
import { 
  setupDatabase, 
  getDatabaseHealth,
  exportDatabase,
  importDatabase,
  resetDatabase 
} from './infrastructure/setup.js';

// Setup database (run once on init)
const result = await setupDatabase();
console.log('Setup:', result.success);

// Check health
const health = await getDatabaseHealth();
console.log('Status:', health.health.status);
console.log('Collections:', health.health.collections);

// Export database
const exportResult = await exportDatabase();
const json = exportResult.json; // JSON string

// Import database
const data = JSON.parse(json);
await importDatabase(data);

// Reset database (requires confirmation)
await resetDatabase(true);
```

---

## Error Types

```javascript
ErrorType.VALIDATION      // Input validation errors
ErrorType.DATABASE        // Database operation errors
ErrorType.NETWORK         // Network/API errors
ErrorType.AUTHENTICATION  // Auth errors
ErrorType.AUTHORIZATION   // Permission errors
ErrorType.NOT_FOUND       // Resource not found
ErrorType.CONFLICT        // Data conflicts
ErrorType.BUSINESS_RULE   // Business logic violations
ErrorType.SYSTEM          // System-level errors
ErrorType.UNKNOWN         // Unknown errors
```

## Log Levels

```javascript
LogLevel.DEBUG   // Detailed debug information
LogLevel.INFO    // General information
LogLevel.WARN    // Warning messages
LogLevel.ERROR   // Error conditions
LogLevel.FATAL   // Critical failures
```

## Time Formats

```javascript
TimeFormat.ISO       // 2024-01-01T12:00:00.000Z
TimeFormat.TIMESTAMP // 1704110400000
TimeFormat.DATE      // January 1, 2024
TimeFormat.TIME      // 12:00:00 PM
TimeFormat.DATETIME  // Jan 1, 2024, 12:00:00 PM
TimeFormat.RELATIVE  // 2 hours ago
```

---

## Configuration

### Database Config

```javascript
{
  storageType: 'localStorage',
  maxRetries: 3,              // Retry attempts
  retryDelay: 1000,           // Initial delay (ms)
  maxPoolSize: 10,            // Max connections
  poolTimeout: 5000,          // Connection timeout (ms)
  enableLogging: true,        // Enable logging
  enableCaching: true,        // Enable caching
  cacheTimeout: 300000,       // Cache timeout (ms)
}
```

### Logger Config

```javascript
{
  minLevel: LogLevel.DEBUG,   // Minimum log level
  enableConsole: true,        // Console output
  enablePersistence: true,    // Save to storage
  maxStoredLogs: 1000,        // Max stored logs
}
```

---

## Database Schema

### Accounts

```javascript
{
  accountNumber: 'string (unique)',
  accountType: 'string',
  customerName: 'string',
  email: 'string',
  phone: 'string',
  address: 'string',
  ssn: 'string',
  balance: 'number',
  status: 'string',
  createdAt: 'string (ISO)',
  updatedAt: 'string (ISO)',
  metadata: 'object'
}
```

### Audit Logs

```javascript
{
  id: 'string (unique)',
  action: 'string',
  accountNumber: 'string',
  details: 'object',
  timestamp: 'string (ISO)',
  userAgent: 'string',
  ipAddress: 'string'
}
```

---

## Common Patterns

### Database Operation Pattern

```javascript
try {
  const db = getDatabase();
  const result = await db.query('collection', filter);
  logger.info('Operation successful', { count: result.length });
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  return errorHandler.handle(error, 'OperationName');
}
```

### Service Method Pattern

```javascript
export async function myServiceMethod(params) {
  try {
    // Validate
    const validation = validate(params);
    if (!validation.valid) {
      throw createError(
        'Validation failed',
        ErrorType.VALIDATION,
        ErrorSeverity.LOW,
        validation.errors
      );
    }

    // Execute
    const db = getDatabase();
    const result = await db.insert('collection', data);
    
    // Audit
    await logAudit({
      action: 'ACTION_NAME',
      details: { ... },
    });

    // Return
    logger.info('Method completed successfully');
    return { success: true, data: result };
    
  } catch (error) {
    logger.error('Method failed', error);
    return errorHandler.handle(error, 'myServiceMethod');
  }
}
```

---

## Testing

### Run Tests

```javascript
// Run all infrastructure tests
await runInfrastructureTests()

// Or via helper
await infra.test()
```

### Test Individual Components

```javascript
// Test database
const db = getDatabase();
await db.initialize();
const stats = db.getStats();
console.log('Database initialized:', db.initialized);

// Test logger
const logger = new Logger('Test');
logger.info('Test message');
const logs = logger.getLogs();
console.log('Logs:', logs.length);

// Test time service
const timestamp = TimeService.getCurrentTimestamp();
console.log('Valid timestamp:', TimeService.isValid(timestamp));

// Test error handler
const error = createError('Test', ErrorType.VALIDATION);
const result = errorHandler.handle(error, 'Test');
console.log('Error handled:', !result.success);
```

---

## Troubleshooting

### Database Not Initialized

```javascript
const db = getDatabase();
if (!db.initialized) {
  await db.initialize();
}
```

### Storage Full

```javascript
const stats = db.getStorageStats();
if (parseInt(stats.usedMB) > 4) {
  await db.clearAll();
}
```

### Pool Exhausted

```javascript
const poolStats = db.pool.getStats();
if (poolStats.utilizationPercent > 90) {
  console.warn('Pool nearly exhausted');
  // Wait for operations to complete
}
```

### Clear Everything

```javascript
// Clear all data and logs
await db.clearAll();
logs.clear();
errors.clear();
```

---

## Links to Documentation

- **Complete Guide**: `docs/INFRASTRUCTURE.md`
- **Implementation Summary**: `INFRASTRUCTURE_IMPLEMENTATION.md`
- **Verification Checklist**: `IMPLEMENTATION_CHECKLIST.md`
- **Executive Summary**: `INFRASTRUCTURE_SUMMARY.md`

---

## Quick Diagnostic

```javascript
// Check everything is working
const diagnostic = async () => {
  console.log('🔍 Running diagnostic...\n');
  
  // Database
  const dbStats = db.stats();
  console.log('✅ Database:', dbStats.initialized ? 'OK' : 'FAIL');
  
  // Logs
  const logStats = logs.stats();
  console.log('✅ Logging:', logStats.total >= 0 ? 'OK' : 'FAIL');
  
  // Time Service
  const timestamp = TimeService.getCurrentTimestamp();
  console.log('✅ Time Service:', timestamp ? 'OK' : 'FAIL');
  
  // Error Handler
  const errorStats = errors.stats();
  console.log('✅ Error Handler:', errorStats ? 'OK' : 'FAIL');
  
  // Health
  const health = await getDatabaseHealth();
  console.log('✅ Health:', health.success ? 'OK' : 'FAIL');
  
  console.log('\n🎉 Diagnostic complete!');
};

await diagnostic();
```

---

**Quick Start**: Type `help()` in console for all available commands!
