# Infrastructure Layer Documentation

## Overview

The infrastructure layer provides core system utilities for database access, logging, time management, and error handling. This layer ensures reliable, maintainable, and scalable operation of the application.

## Components

### 1. Database (`database.js`)

The database module provides a robust data access layer with connection pooling, caching, and retry logic.

#### Features

- **Connection Pooling**: Manages concurrent database operations efficiently
- **Query Caching**: Reduces redundant database queries with intelligent caching
- **Retry Logic**: Automatically retries failed operations
- **Transaction Support**: Simulated transaction support with rollback capability
- **Error Handling**: Comprehensive error handling with detailed logging

#### Usage

```javascript
import { getDatabase, initializeDatabase } from './infrastructure/database.js';

// Initialize database
await initializeDatabase();

// Get database instance
const db = getDatabase();

// Query data
const accounts = await db.query('accounts', (acc) => acc.status === 'active');

// Insert data
await db.insert('accounts', { accountNumber: '1234', ... });

// Update data
await db.update('accounts', (acc) => acc.accountNumber === '1234', { status: 'closed' });

// Delete data
await db.delete('accounts', (acc) => acc.status === 'closed');

// Get statistics
const stats = db.getStats();
console.log(stats);
```

#### Connection Pool

The connection pool manages concurrent database operations:

```javascript
// Pool automatically manages connections
const pool = db.pool;

// Get pool statistics
const poolStats = pool.getStats();
console.log(`Active: ${poolStats.activeConnections}/${poolStats.maxSize}`);
```

#### Query Cache

The cache reduces redundant queries:

```javascript
// Cached queries (default behavior)
const data1 = await db.query('accounts'); // Hits database
const data2 = await db.query('accounts'); // Returns cached result

// Bypass cache
const fresh = await db.query('accounts', null, false);

// Clear cache
db.cache.clear();
```

### 2. Logger (`logger.js`)

The logging module provides centralized logging with levels, persistence, and formatting.

#### Features

- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Colored Console Output**: Visual distinction between log levels
- **Persistence**: Automatic storage of logs in localStorage
- **Filtering**: Filter logs by level, context, or time range
- **Statistics**: Generate log statistics and reports

#### Usage

```javascript
import { Logger } from './infrastructure/logger.js';

const logger = new Logger('MyComponent');

// Log messages
logger.debug('Debug message', { data: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', new Error('Something went wrong'));
logger.fatal('Fatal error', error);

// Get logs
const logs = logger.getLogs();

// Create child logger
const childLogger = logger.child('SubComponent');
```

#### System Logs

```javascript
import { getSystemLogs, clearSystemLogs, getLogStatistics } from './infrastructure/logger.js';

// Get all system logs
const allLogs = getSystemLogs();

// Get filtered logs
const errorLogs = getSystemLogs({ level: LogLevel.ERROR, limit: 50 });

// Get statistics
const stats = getLogStatistics();
console.log(`Total logs: ${stats.total}`);

// Clear logs
clearSystemLogs();
```

### 3. Time Service (`timeService.js`)

The time service provides centralized time management and formatting utilities.

#### Features

- **Multiple Formats**: ISO, timestamp, date, time, datetime, relative
- **Date Arithmetic**: Add, subtract, diff operations
- **Validation**: Check if dates are valid
- **Timezone Support**: Get timezone information
- **Performance Timing**: Measure function execution time

#### Usage

```javascript
import { TimeService, getCurrentTimestamp } from './infrastructure/timeService.js';

// Get current timestamp
const now = TimeService.getCurrentTimestamp(); // ISO format
const unixTime = TimeService.getCurrentUnixTimestamp();

// Format dates
const formatted = TimeService.formatDate(new Date()); // "January 1, 2024"
const time = TimeService.formatTime(new Date()); // "12:30:45 PM"
const dateTime = TimeService.formatDateTime(new Date()); // "Jan 1, 2024, 12:30:45 PM"

// Relative time
const relative = TimeService.getRelativeTime('2024-01-01'); // "2 hours ago"

// Date arithmetic
const tomorrow = TimeService.add(new Date(), 1, 'days');
const lastWeek = TimeService.subtract(new Date(), 7, 'days');

// Date difference
const diff = TimeService.diff(date1, date2, 'days'); // Difference in days

// Date checks
const isPast = TimeService.isPast('2024-01-01');
const isFuture = TimeService.isFuture('2025-01-01');
const isToday = TimeService.isToday(new Date());

// Performance measurement
await TimeService.measureTime(async () => {
  // Some operation
}, 'Operation Name');
```

### 4. Error Handler (`errorHandler.js`)

The error handler provides centralized error handling with categorization and recovery.

#### Features

- **Error Types**: Validation, Database, Network, Authentication, etc.
- **Severity Levels**: Low, Medium, High, Critical
- **Custom Errors**: Create typed errors with context
- **Error Logging**: Automatic logging of all errors
- **User-Friendly Messages**: Convert technical errors to user-friendly messages
- **Error Statistics**: Track and analyze error patterns

#### Usage

```javascript
import { ErrorHandler, createError, ErrorType, ErrorSeverity } from './infrastructure/errorHandler.js';

const errorHandler = new ErrorHandler();

// Handle errors
try {
  // Some operation
} catch (error) {
  const result = errorHandler.handle(error, 'MyOperation');
  console.log(result.error.message); // User-friendly message
}

// Create custom errors
const error = createError(
  'Invalid input',
  ErrorType.VALIDATION,
  ErrorSeverity.LOW,
  { field: 'email' }
);

// Register error callbacks
errorHandler.onError((error) => {
  console.log('Error occurred:', error);
});

// Get error statistics
const stats = errorHandler.getStatistics();
console.log(`Total errors: ${stats.total}`);
```

#### Global Error Handling

```javascript
import { setupGlobalErrorHandling } from './infrastructure/errorHandler.js';

// Setup global handlers for unhandled errors
setupGlobalErrorHandling();
```

### 5. Setup Scripts (`setup.js`)

The setup module provides database initialization, migration, and maintenance utilities.

#### Features

- **Schema Initialization**: Automatic schema setup
- **Migrations**: Version-based database migrations
- **Data Seeding**: Initial data population
- **Integrity Checks**: Validate data integrity
- **Export/Import**: Backup and restore database
- **Health Monitoring**: Check database health

#### Usage

```javascript
import { 
  setupDatabase, 
  resetDatabase, 
  exportDatabase, 
  importDatabase,
  getDatabaseHealth 
} from './infrastructure/setup.js';

// Setup database
const result = await setupDatabase();

// Reset database (requires confirmation)
await resetDatabase(true);

// Export database
const exportResult = await exportDatabase();
const json = exportResult.json; // JSON string

// Import database
await importDatabase(JSON.parse(json));

// Check health
const health = await getDatabaseHealth();
console.log(`Status: ${health.health.status}`);
```

## Database Schema

### Accounts Collection

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

### Audit Logs Collection

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

### Metadata Collection

```javascript
{
  initialized: 'boolean',
  version: 'string',
  createdAt: 'string (ISO)',
  lastAccess: 'string (ISO)',
  schemaVersion: 'string',
  config: 'object'
}
```

## Configuration

### Database Configuration

```javascript
const DB_CONFIG = {
  storageType: 'localStorage',
  maxRetries: 3,
  retryDelay: 1000,
  maxPoolSize: 10,
  poolTimeout: 5000,
  enableLogging: true,
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
};
```

### Logger Configuration

```javascript
const LOGGER_CONFIG = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  enablePersistence: true,
  maxStoredLogs: 1000,
};
```

## Initialization

The infrastructure is automatically initialized when the application starts:

```javascript
// In index.js
import { initializeInfrastructure, getInfrastructureStatus } from './infrastructure/index.js';

// Initialize all infrastructure components
const result = await initializeInfrastructure();

// Get status
const status = await getInfrastructureStatus();
```

## Error Handling Pattern

All infrastructure operations follow a consistent error handling pattern:

```javascript
try {
  const result = await operation();
  if (!result.success) {
    // Handle failure
  }
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  return errorHandler.handle(error, 'OperationName');
}
```

## Performance Optimization

### Connection Pooling

The connection pool prevents resource exhaustion:

- Maximum 10 concurrent connections
- Queuing for excess requests
- Automatic connection release
- Timeout handling (5 seconds)

### Query Caching

The cache improves performance:

- 5-minute cache timeout
- Automatic cache invalidation on writes
- Bypass option for fresh data
- Cache statistics tracking

### Retry Logic

Failed operations are automatically retried:

- Maximum 3 attempts
- Exponential backoff (1s, 2s, 3s)
- Detailed error logging
- Final error reporting

## Monitoring and Debugging

### Database Statistics

```javascript
const db = getDatabase();
const stats = db.getStats();

console.log('Initialized:', stats.initialized);
console.log('Pool:', stats.pool);
console.log('Cache:', stats.cache);
console.log('Collections:', stats.collections);
console.log('Storage:', stats.storage);
```

### Log Statistics

```javascript
import { getLogStatistics } from './infrastructure/logger.js';

const stats = getLogStatistics();
console.log('Total logs:', stats.total);
console.log('By level:', stats.byLevel);
console.log('By context:', stats.byContext);
```

### Error Statistics

```javascript
const errorHandler = getErrorHandler();
const stats = errorHandler.getStatistics();

console.log('Total errors:', stats.total);
console.log('By type:', stats.byType);
console.log('By severity:', stats.bySeverity);
console.log('Recent errors:', stats.recentErrors);
```

### Health Check

```javascript
import { getDatabaseHealth } from './infrastructure/setup.js';

const health = await getDatabaseHealth();
console.log('Status:', health.health.status);
console.log('Uptime:', health.health.uptime);
console.log('Collections:', health.health.collections);
```

## Testing

The infrastructure layer includes built-in support for testing:

```javascript
// Clear data for testing
await db.clearAll();

// Reset database
await resetDatabase(true);

// Export for backup
const backup = await exportDatabase();

// Run operations
// ...

// Restore from backup
await importDatabase(JSON.parse(backup.json));
```

## Best Practices

1. **Always initialize infrastructure first**
   ```javascript
   await initializeInfrastructure();
   ```

2. **Use the logger for all logging**
   ```javascript
   const logger = new Logger('MyComponent');
   logger.info('Operation started');
   ```

3. **Handle errors properly**
   ```javascript
   const result = errorHandler.handle(error, 'Operation');
   ```

4. **Use TimeService for all time operations**
   ```javascript
   const timestamp = TimeService.getCurrentTimestamp();
   ```

5. **Check database health periodically**
   ```javascript
   const health = await getDatabaseHealth();
   ```

6. **Monitor statistics**
   ```javascript
   const stats = db.getStats();
   ```

## Troubleshooting

### Database Not Initialized

```javascript
// Check if initialized
const db = getDatabase();
if (!db.initialized) {
  await db.initialize();
}
```

### Storage Full

```javascript
// Check storage
const stats = db.getStorageStats();
if (parseInt(stats.usedMB) > 4) {
  // Clear old data
  await db.clearAll();
}
```

### Performance Issues

```javascript
// Check pool utilization
const poolStats = db.pool.getStats();
if (poolStats.utilizationPercent > 90) {
  // Increase pool size or optimize queries
}
```

### Log Overflow

```javascript
// Clear old logs
import { clearSystemLogs } from './infrastructure/logger.js';
clearSystemLogs();
```

## Security Considerations

1. **Data Validation**: All inputs are validated before database operations
2. **Error Messages**: Technical details are hidden from users in production
3. **Audit Trail**: All operations are logged for accountability
4. **Access Control**: Can be extended with authentication/authorization

## Future Enhancements

Potential improvements to the infrastructure layer:

1. **IndexedDB Support**: For larger datasets
2. **WebSocket Integration**: Real-time updates
3. **Compression**: Reduce storage usage
4. **Encryption**: Secure sensitive data
5. **Rate Limiting**: Prevent abuse
6. **Metrics Collection**: Advanced monitoring
7. **Multi-tenancy**: Support multiple databases

## Conclusion

The infrastructure layer provides a solid foundation for the application with:

- ✅ Robust database access with pooling and caching
- ✅ Comprehensive error handling
- ✅ Centralized logging
- ✅ Time management utilities
- ✅ Database setup and maintenance scripts
- ✅ Monitoring and debugging tools

This ensures reliable, maintainable, and scalable operation of the application.
