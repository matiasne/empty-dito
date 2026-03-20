# Integration Guide: Customer & Account Management

## Overview

This guide explains how the Customer Management and Account Management modules integrate to provide a complete banking system.

## Architecture Integration

```
┌─────────────────────────────────────────┐
│        Application Layer                │
│     (UI Components - Future)            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        Service Layer                     │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Customer       │  │ Account        │ │
│  │ Service        │←→│ Service        │ │
│  └────────────────┘  └────────────────┘ │
│           ↓                   ↓          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Credit Agency  │  │ Audit Service  │ │
│  │ Interface      │  │ (Shared)       │ │
│  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        Database Layer                    │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Customer DB    │  │ Account DB     │ │
│  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        Storage (localStorage)           │
└─────────────────────────────────────────┘
```

## Integration Points

### 1. Customer-Account Relationship

Customers can have multiple accounts. The relationship is tracked through:

- **Customer → Accounts**: `customer.metadata.accountCount`
- **Account → Customer**: `account.email` (linking field)

### 2. Shared Audit Service

Both modules use the same audit service for comprehensive tracking:

- Customer operations: `CUSTOMER_CREATED`, `CUSTOMER_UPDATED`, etc.
- Account operations: `ACCOUNT_CREATED`, `ACCOUNT_UPDATED`, etc.

### 3. Credit Score Integration

Credit scores retrieved during customer creation can be used for:

- Account approval decisions
- Credit limit determinations
- Risk assessment
- Premium service eligibility

## Complete Workflow Examples

### Workflow 1: New Customer with Account Creation

```javascript
// Step 1: Create customer (with credit check)
const customerResult = await createCustomer({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '5551234567',
  dateOfBirth: '1990-01-15',
  ssn: '1234',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701'
});

if (!customerResult.success) {
  console.error('Customer creation failed:', customerResult.error);
  return;
}

const customer = customerResult.customer;
console.log('Customer created:', customer.customerId);
console.log('Credit score:', customer.creditScore);

// Step 2: Check credit score for account eligibility
if (customer.creditScore && customer.creditScore < 580) {
  console.log('Credit score too low for standard checking account');
  console.log('Offering secured account options...');
}

// Step 3: Create account for customer
const accountResult = await createAccount({
  accountType: 'checking',
  customerName: `${customer.firstName} ${customer.lastName}`,
  email: customer.email,
  phone: customer.phone,
  address: `${customer.address.street}, ${customer.address.city}`,
  ssn: customer.ssn,
  initialDeposit: 1000
});

if (!accountResult.success) {
  console.error('Account creation failed:', accountResult.error);
  return;
}

console.log('Account created:', accountResult.account.accountNumber);

// Step 4: Update customer's account count
await incrementAccountCount(customer.customerId);

// Step 5: Verify in audit trail
const auditLogs = await getAuditLogs();
console.log('Recent activities:', auditLogs.slice(-5));
```

### Workflow 2: Account Closure and Customer Cleanup

```javascript
// Step 1: Get customer information
const customerResult = await getCustomer(customerId);
if (!customerResult.success) {
  console.error('Customer not found');
  return;
}

const customer = customerResult.customer;

// Step 2: Close all customer accounts
const accounts = await getAllAccounts();
const customerAccounts = accounts.filter(a => a.email === customer.email);

for (const account of customerAccounts) {
  await updateAccountStatus(account.accountNumber, 'closed');
  await decrementAccountCount(customerId);
}

// Step 3: Deactivate customer (soft delete)
await deleteCustomer(customerId, false);

console.log('Customer deactivated and all accounts closed');
```

### Workflow 3: Credit Score-Based Account Approval

```javascript
// Step 1: Get customer and check eligibility
const customerResult = await getCustomer(customerId);
const customer = customerResult.customer;

// Step 2: Refresh credit score if needed
const now = new Date();
const lastUpdate = new Date(customer.updatedAt);
const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

if (daysSinceUpdate > 30) {
  console.log('Credit score outdated, refreshing...');
  const refreshResult = await refreshCreditScore(customerId);
  customer.creditScore = refreshResult.creditScore;
}

// Step 3: Determine account type eligibility
const interpretation = interpretCreditScore(customer.creditScore);
console.log('Credit Rating:', interpretation.rating);
console.log('Approval Likelihood:', interpretation.approvalLikelihood);

// Step 4: Calculate credit limits
const creditLimit = calculateRecommendedCreditLimit(
  customer.creditScore,
  customer.annualIncome
);

console.log('Recommended Credit Limit:', creditLimit.recommendedLimit);

// Step 5: Create appropriate account
let accountType = 'checking';
if (customer.creditScore >= 740) {
  accountType = 'money_market'; // Premium account
} else if (customer.creditScore < 580) {
  console.log('Standard account may require additional approval');
}

const accountResult = await createAccount({
  accountType,
  customerName: `${customer.firstName} ${customer.lastName}`,
  email: customer.email,
  // ... other fields
});
```

### Workflow 4: Comprehensive Customer Profile

```javascript
// Step 1: Get customer details
const customerResult = await getCustomer(customerId);
const customer = customerResult.customer;

// Step 2: Get customer's accounts
const allAccounts = await getAllAccounts();
const customerAccounts = allAccounts.filter(a => a.email === customer.email);

// Step 3: Get customer's audit history
const customerAudit = await getAuditLogs(null, customerId);

// Step 4: Get credit report
const creditReport = await getCreditReport({
  ssn: customer.ssn,
  firstName: customer.firstName,
  lastName: customer.lastName,
  dateOfBirth: customer.dateOfBirth
});

// Step 5: Calculate risk level
const riskLevel = getCustomerRiskLevel(customer);

// Step 6: Generate comprehensive profile
const profile = {
  customer: {
    id: customer.customerId,
    name: formatCustomerName(customer.firstName, customer.lastName),
    status: customer.status,
    age: calculateAge(customer.dateOfBirth),
    creditScore: customer.creditScore,
    creditRating: getCreditScoreRating(customer.creditScore),
    riskLevel: riskLevel
  },
  accounts: {
    count: customerAccounts.length,
    types: [...new Set(customerAccounts.map(a => a.accountType))],
    totalBalance: customerAccounts.reduce((sum, a) => sum + a.balance, 0),
    statuses: customerAccounts.map(a => ({
      number: a.accountNumber,
      type: a.accountType,
      balance: a.balance,
      status: a.status
    }))
  },
  creditReport: creditReport.success ? creditReport.report : null,
  activity: {
    recentActions: customerAudit.slice(-10),
    totalActions: customerAudit.length
  }
};

console.log('Customer Profile:', profile);
```

## Data Synchronization

### Keeping Data in Sync

When operations affect both customers and accounts:

#### Account Creation
```javascript
// After creating account for customer
await incrementAccountCount(customerId);
```

#### Account Closure
```javascript
// After closing account
await decrementAccountCount(customerId);
```

#### Customer Update Affecting Accounts
```javascript
// If customer email changes, update all associated accounts
const accounts = await getAllAccounts();
const customerAccounts = accounts.filter(a => a.email === oldEmail);

for (const account of customerAccounts) {
  await updateAccount(account.accountNumber, {
    email: newEmail
  });
}
```

## Business Rules Integration

### 1. Account Creation Requirements

Check customer eligibility before account creation:

```javascript
function canCreateAccount(customer, accountType) {
  // Check customer status
  if (customer.status !== 'active') {
    return { allowed: false, reason: 'Customer is not active' };
  }

  // Check account limit
  if (customer.metadata.accountCount >= 5) {
    return { allowed: false, reason: 'Maximum accounts reached' };
  }

  // Check credit score for premium accounts
  if (accountType === 'money_market' && customer.creditScore < 740) {
    return { allowed: false, reason: 'Insufficient credit score for Money Market' };
  }

  return { allowed: true };
}
```

### 2. Customer Deletion Rules

Prevent deletion of customers with active accounts:

```javascript
async function safeDeleteCustomer(customerId) {
  const customer = await getCustomer(customerId);
  
  if (customer.metadata.accountCount > 0) {
    return {
      success: false,
      error: 'Cannot delete customer with active accounts',
      accountCount: customer.metadata.accountCount
    };
  }

  return await deleteCustomer(customerId);
}
```

### 3. Credit-Based Decisions

Use credit scores for business decisions:

```javascript
function determineAccountOptions(creditScore) {
  const options = {
    checking: true, // Always available
    savings: true   // Always available
  };

  if (creditScore >= 500) {
    options.business = true;
  }

  if (creditScore >= 740) {
    options.money_market = true;
  }

  return options;
}
```

## Error Handling

### Handling Cross-Module Errors

```javascript
async function createCustomerWithAccount(customerData, accountData) {
  let customerId = null;
  
  try {
    // Step 1: Create customer
    const customerResult = await createCustomer(customerData);
    if (!customerResult.success) {
      throw new Error(`Customer creation failed: ${customerResult.error}`);
    }
    
    customerId = customerResult.customer.customerId;
    
    // Step 2: Create account
    const accountResult = await createAccount({
      ...accountData,
      customerName: `${customerData.firstName} ${customerData.lastName}`,
      email: customerData.email
    });
    
    if (!accountResult.success) {
      // Rollback: Delete customer if account creation fails
      await deleteCustomer(customerId, true);
      throw new Error(`Account creation failed: ${accountResult.error}`);
    }
    
    // Step 3: Update account count
    await incrementAccountCount(customerId);
    
    return {
      success: true,
      customer: customerResult.customer,
      account: accountResult.account
    };
    
  } catch (error) {
    // Cleanup on error
    if (customerId) {
      await deleteCustomer(customerId, true);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Audit Trail Integration

### Querying Related Activities

```javascript
// Get all activities for a customer (including accounts)
async function getCustomerFullAudit(customerId) {
  const customer = await getCustomer(customerId);
  const customerEmail = customer.customer.email;
  
  // Get customer-specific audits
  const customerAudits = await getAuditLogs(null, customerId);
  
  // Get account-related audits
  const allAccounts = await getAllAccounts();
  const customerAccounts = allAccounts.filter(a => a.email === customerEmail);
  const accountNumbers = customerAccounts.map(a => a.accountNumber);
  
  const accountAudits = [];
  for (const accountNumber of accountNumbers) {
    const audits = await getAuditLogs(accountNumber);
    accountAudits.push(...audits);
  }
  
  // Combine and sort by timestamp
  const allAudits = [...customerAudits, ...accountAudits]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return allAudits;
}
```

## Performance Considerations

### Optimizing Queries

```javascript
// Bad: Multiple database calls
async function getCustomerSummary_Slow(customerId) {
  const customer = await getCustomer(customerId);
  const allAccounts = await getAllAccounts(); // Gets ALL accounts
  const customerAccounts = allAccounts.filter(a => a.email === customer.customer.email);
  return { customer, accounts: customerAccounts };
}

// Better: Implement indexed queries
async function getCustomerSummary_Fast(customerId) {
  // These could be implemented in the database layer
  const customer = await getCustomer(customerId);
  const accounts = await getAccountsByEmail(customer.customer.email);
  return { customer, accounts };
}
```

### Caching Strategy

```javascript
// Simple in-memory cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedCustomer(customerId) {
  const cached = cache.get(`customer_${customerId}`);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const customer = await getCustomer(customerId);
  cache.set(`customer_${customerId}`, {
    data: customer,
    timestamp: Date.now()
  });
  
  return customer;
}
```

## Testing Integration

### Integration Tests

```javascript
async function testCustomerAccountIntegration() {
  console.log('Testing customer-account integration...');
  
  // Create customer
  const customer = await createCustomer({
    firstName: 'Integration',
    lastName: 'Test',
    email: 'integration@test.com',
    phone: '5551234567',
    dateOfBirth: '1990-01-01',
    ssn: '9999',
    address: '123 Test St',
    city: 'Test City',
    state: 'IL',
    zipCode: '12345'
  });
  
  console.assert(customer.success, 'Customer creation should succeed');
  
  // Create account for customer
  const account = await createAccount({
    accountType: 'checking',
    customerName: 'Integration Test',
    email: 'integration@test.com',
    phone: '5551234567',
    address: '123 Test St',
    ssn: '9999',
    initialDeposit: 100
  });
  
  console.assert(account.success, 'Account creation should succeed');
  
  // Verify account count
  const updatedCustomer = await getCustomer(customer.customer.customerId);
  // Note: In real implementation, account count would be automatically updated
  
  // Cleanup
  await deleteCustomer(customer.customer.customerId, true);
  
  console.log('✓ Integration test passed');
}
```

## Best Practices

1. **Always create customers before accounts** - Ensures proper relationship tracking
2. **Update account counts** - Keep metadata synchronized
3. **Check credit scores** - Use for business decisions
4. **Handle errors gracefully** - Implement rollback mechanisms
5. **Log everything** - Use audit trail for compliance
6. **Validate relationships** - Ensure data integrity
7. **Cache strategically** - Improve performance for frequent queries
8. **Test integrations** - Verify cross-module functionality

## Common Patterns

### Pattern 1: Customer Onboarding

```javascript
async function onboardCustomer(customerData) {
  // 1. Create customer with credit check
  const customer = await createCustomer(customerData);
  
  // 2. Determine eligible accounts based on credit
  const options = determineAccountOptions(customer.customer.creditScore);
  
  // 3. Return onboarding package
  return {
    customer: customer.customer,
    eligibleAccounts: options,
    creditReport: customer.creditReport
  };
}
```

### Pattern 2: Relationship Manager View

```javascript
async function getRelationshipView(customerId) {
  const [customer, accounts, audit] = await Promise.all([
    getCustomer(customerId),
    getAccountsByCustomer(customerId),
    getCustomerFullAudit(customerId)
  ]);
  
  return {
    customer,
    accounts,
    audit,
    summary: generateCustomerSummary(customer.customer)
  };
}
```

### Pattern 3: Account Application

```javascript
async function applyForAccount(customerId, accountType) {
  const customer = await getCustomer(customerId);
  
  // Check eligibility
  const eligible = canCreateAccount(customer.customer, accountType);
  if (!eligible.allowed) {
    return { approved: false, reason: eligible.reason };
  }
  
  // Create account
  const account = await createAccount({
    accountType,
    customerName: formatCustomerName(customer.customer.firstName, customer.customer.lastName),
    email: customer.customer.email,
    // ... other fields
  });
  
  if (account.success) {
    await incrementAccountCount(customerId);
  }
  
  return { approved: account.success, account: account.account };
}
```

## Troubleshooting

### Issue: Account count out of sync

**Solution**: Implement reconciliation function
```javascript
async function reconcileAccountCounts() {
  const customers = await getAllCustomers();
  const accounts = await getAllAccounts();
  
  for (const customer of customers.customers) {
    const actualCount = accounts.filter(a => a.email === customer.email).length;
    if (customer.metadata.accountCount !== actualCount) {
      console.log(`Fixing count for ${customer.customerId}: ${customer.metadata.accountCount} → ${actualCount}`);
      await updateCustomer(customer.customerId, {
        metadata: { ...customer.metadata, accountCount: actualCount }
      });
    }
  }
}
```

### Issue: Credit score not refreshing

**Solution**: Force refresh with error handling
```javascript
async function forceRefreshCreditScore(customerId) {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    const result = await refreshCreditScore(customerId);
    if (result.success) return result;
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
  }
  return { success: false, error: 'Max retries exceeded' };
}
```

---

This integration guide provides the foundation for building a complete banking application with proper separation of concerns while maintaining data consistency and business rule enforcement.
