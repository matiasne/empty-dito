# Customer Management Feature Documentation

## Overview

The Customer Management module provides comprehensive functionality for managing bank customers, including creation, updates, deletion, and inquiry operations. It integrates with a credit agency interface for credit score retrieval and maintains a complete audit trail of all customer-related activities.

## Features

### Core Operations

1. **Customer Creation** - Register new customers with full validation
2. **Customer Update** - Modify customer information with conflict checking
3. **Customer Deletion** - Soft or hard delete with safety checks
4. **Customer Inquiry** - Retrieve individual or multiple customers
5. **Customer Search** - Search by name, email, phone, or ID
6. **Status Management** - Update customer status (active, inactive, suspended, blocked)
7. **Credit Score Integration** - Retrieve and refresh credit scores from credit agencies

### Key Characteristics

- ✅ Comprehensive data validation
- ✅ Credit score integration via mock credit agency
- ✅ Complete audit trail
- ✅ Soft and hard delete options
- ✅ Duplicate prevention
- ✅ Age verification (18+ only)
- ✅ Address validation with US state support
- ✅ Phone and email validation
- ✅ SSN masking for security

## Architecture

### Module Structure

```
src/js/
├── services/
│   ├── customerService.js           # Business logic layer
│   └── creditAgencyInterface.js     # Credit score integration
├── database/
│   └── customerDatabase.js          # Data persistence layer
├── validators/
│   └── customerValidator.js         # Input validation
├── utils/
│   └── customerUtils.js             # Helper functions
└── tests/
    └── customerServiceTest.js       # Test suite
```

### Layer Responsibilities

#### Service Layer (`customerService.js`)
- Business logic for CRUD operations
- Integration with credit agency
- Audit trail creation
- Business rule enforcement
- Data sanitization

#### Database Layer (`customerDatabase.js`)
- Data persistence using localStorage
- CRUD operations at data level
- Query and search operations
- Statistics generation

#### Validation Layer (`customerValidator.js`)
- Input validation
- Format checking
- Age verification
- State and ZIP code validation
- Data sanitization

#### Credit Agency Interface (`creditAgencyInterface.js`)
- Mock credit bureau integration
- Credit score retrieval
- Credit report generation
- Credit monitoring setup
- Credit limit recommendations

#### Utilities (`customerUtils.js`)
- Customer ID generation
- Formatting functions
- Status and risk assessment
- Credit score interpretation
- Display helpers

## API Reference

### Customer Service

#### `createCustomer(customerData)`

Create a new customer with credit score retrieval.

**Parameters:**
```javascript
{
  firstName: string,      // Required, 2-50 chars
  lastName: string,       // Required, 2-50 chars
  email: string,         // Required, valid email format
  phone: string,         // Required, 10 digits
  dateOfBirth: string,   // Required, ISO date, must be 18+
  ssn: string,           // Required, 4 or 9 digits
  address: string,       // Required, 5-200 chars
  city: string,          // Required, 2-50 chars
  state: string,         // Required, valid US state code
  zipCode: string        // Required, 5 or 9 digits
}
```

**Returns:**
```javascript
{
  success: boolean,
  customer: {
    customerId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    creditScore: number | null,
    status: string,
    createdAt: string
  },
  message: string
}
```

**Example:**
```javascript
const result = await createCustomer({
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

if (result.success) {
  console.log('Customer created:', result.customer.customerId);
  console.log('Credit score:', result.customer.creditScore);
}
```

#### `updateCustomer(customerId, updates)`

Update an existing customer's information.

**Parameters:**
- `customerId` (string): Customer ID
- `updates` (object): Fields to update (partial customer data)

**Returns:**
```javascript
{
  success: boolean,
  customer: object,
  message: string
}
```

**Example:**
```javascript
const result = await updateCustomer('CUST-12345678', {
  phone: '5559876543',
  address: '456 Oak Avenue'
});
```

#### `deleteCustomer(customerId, hardDelete)`

Delete a customer (soft or hard delete).

**Parameters:**
- `customerId` (string): Customer ID
- `hardDelete` (boolean): If true, permanently delete; if false, set status to inactive (default: false)

**Returns:**
```javascript
{
  success: boolean,
  message: string
}
```

**Example:**
```javascript
// Soft delete (deactivate)
const result = await deleteCustomer('CUST-12345678');

// Hard delete (permanent)
const result = await deleteCustomer('CUST-12345678', true);
```

#### `getCustomer(customerId, includeSensitive)`

Retrieve a specific customer by ID.

**Parameters:**
- `customerId` (string): Customer ID
- `includeSensitive` (boolean): Include sensitive data like SSN (default: false)

**Returns:**
```javascript
{
  success: boolean,
  customer: object
}
```

#### `getAllCustomers(filters)`

Retrieve all customers with optional filtering.

**Parameters:**
```javascript
{
  status: string,     // Optional: Filter by status
  search: string      // Optional: Search term for name or email
}
```

**Returns:**
```javascript
{
  success: boolean,
  customers: array,
  count: number
}
```

#### `searchCustomers(criteria)`

Search customers by various criteria.

**Parameters:**
```javascript
{
  email: string,        // Optional: Search by email
  phone: string,        // Optional: Search by phone
  name: string,         // Optional: Search by name
  customerId: string    // Optional: Search by ID
}
```

**Returns:**
```javascript
{
  success: boolean,
  customers: array,
  count: number
}
```

#### `updateCustomerStatus(customerId, status)`

Update a customer's status.

**Parameters:**
- `customerId` (string): Customer ID
- `status` (string): New status ('active', 'inactive', 'suspended', 'blocked')

**Returns:**
```javascript
{
  success: boolean,
  customer: object,
  message: string
}
```

#### `refreshCreditScore(customerId)`

Refresh a customer's credit score from the credit agency.

**Parameters:**
- `customerId` (string): Customer ID

**Returns:**
```javascript
{
  success: boolean,
  creditScore: number,
  message: string
}
```

### Credit Agency Interface

#### `getCreditScore(customerInfo)`

Retrieve credit score from credit agency.

**Parameters:**
```javascript
{
  ssn: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  creditScore: number,
  creditReport: object,
  agency: string,
  retrievedAt: string,
  expiresAt: string
}
```

#### `getCreditReport(customerInfo)`

Get detailed credit report.

**Returns:**
```javascript
{
  success: boolean,
  report: {
    score: number,
    rating: string,
    factors: object,
    accounts: object,
    inquiries: object,
    paymentHistory: object,
    creditUtilization: object,
    creditAge: object,
    derogatory: object,
    recommendations: array
  }
}
```

#### `interpretCreditScore(score)`

Get interpretation of a credit score.

**Returns:**
```javascript
{
  rating: string,
  description: string,
  color: string,
  lendingTerms: string,
  approvalLikelihood: string
}
```

## Data Models

### Customer Object

```javascript
{
  customerId: string,           // Unique ID (format: CUST-XXXXXXXX)
  firstName: string,
  lastName: string,
  email: string,
  phone: string,                // Stored as digits only
  dateOfBirth: string,          // ISO date format
  ssn: string,                  // Stored as digits only (4 or 9)
  address: {
    street: string,
    city: string,
    state: string,              // Two-letter state code
    zipCode: string
  },
  creditScore: number | null,   // 300-850 or null
  status: string,               // 'active', 'inactive', 'suspended', 'blocked'
  createdAt: string,            // ISO timestamp
  updatedAt: string,            // ISO timestamp
  metadata: {
    createdBy: string,
    lastModifiedBy: string,
    accountCount: number        // Number of associated accounts
  }
}
```

### Customer Status Values

```javascript
{
  ACTIVE: 'active',           // Customer is active and in good standing
  INACTIVE: 'inactive',       // Customer account is inactive
  SUSPENDED: 'suspended',     // Customer account is temporarily suspended
  BLOCKED: 'blocked'          // Customer account is blocked
}
```

## Validation Rules

### Field Requirements

| Field | Required | Min Length | Max Length | Format |
|-------|----------|------------|------------|--------|
| firstName | Yes | 2 | 50 | Letters, spaces, hyphens, apostrophes |
| lastName | Yes | 2 | 50 | Letters, spaces, hyphens, apostrophes |
| email | Yes | - | - | Valid email format |
| phone | Yes | 10 digits | 10 digits | Digits only |
| dateOfBirth | Yes | - | - | ISO date, must be 18+ |
| ssn | Yes | 4 or 9 digits | 4 or 9 digits | Digits only |
| address | Yes | 5 | 200 | Any characters |
| city | Yes | 2 | 50 | Any characters |
| state | Yes | 2 | 2 | Valid US state code |
| zipCode | Yes | 5 or 9 digits | 5 or 9 digits | Digits only |

### Business Rules

1. **Age Requirement**: Customer must be at least 18 years old
2. **Unique Email**: Each customer must have a unique email address
3. **Unique SSN**: Each customer must have a unique SSN
4. **Valid State**: State must be a valid US state abbreviation
5. **Account Deletion**: Cannot delete customer with active accounts (accountCount > 0)

## Audit Trail

All customer operations are logged to the audit trail with the following actions:

- `CUSTOMER_CREATED` - Customer successfully created
- `CUSTOMER_CREATION_FAILED` - Customer creation failed
- `CUSTOMER_UPDATED` - Customer information updated
- `CUSTOMER_UPDATE_FAILED` - Update operation failed
- `CUSTOMER_DELETED` - Customer soft deleted (deactivated)
- `CUSTOMER_DELETED_PERMANENTLY` - Customer hard deleted
- `CUSTOMER_DELETE_FAILED` - Delete operation failed
- `CUSTOMER_INQUIRY` - Customer information retrieved
- `CUSTOMER_STATUS_UPDATED` - Customer status changed
- `CREDIT_SCORE_REFRESHED` - Credit score updated from agency

## Testing

### Running Tests

```javascript
// In browser console
import { runCustomerTests } from './src/js/tests/customerServiceTest.js';
await runCustomerTests();
```

### Test Coverage

The test suite includes 15 comprehensive tests:

1. ✅ Create valid customer
2. ✅ Create customer with invalid email
3. ✅ Create customer with invalid phone
4. ✅ Create customer under 18 years old
5. ✅ Create duplicate customer
6. ✅ Update customer
7. ✅ Update customer email with conflict check
8. ✅ Delete customer (soft delete)
9. ✅ Get customer by ID
10. ✅ Get all customers
11. ✅ Search customers
12. ✅ Update customer status
13. ✅ Refresh credit score
14. ✅ Delete customer with accounts (should fail)
15. ✅ Soft vs hard delete

## Integration with Account Management

The customer management module integrates with the account management system:

1. **Account Creation**: When creating an account, link to existing customer or create new customer
2. **Account Count**: Track number of accounts per customer in `metadata.accountCount`
3. **Customer Deletion**: Prevent deletion of customers with active accounts
4. **Credit Assessment**: Use customer credit score for account approval decisions

## Security Considerations

### Sensitive Data Handling

1. **SSN Masking**: SSN is masked in all display operations
2. **Limited Exposure**: By default, sensitive data is not included in query results
3. **Audit Trail**: All access to customer data is logged
4. **Data Sanitization**: All input is sanitized before storage

### Privacy

1. Customer data is stored locally (localStorage in this implementation)
2. In production, use secure backend storage with encryption
3. Implement proper authentication and authorization
4. Follow data protection regulations (GDPR, CCPA, etc.)

## Usage Examples

### Complete Customer Lifecycle

```javascript
// 1. Create a new customer
const createResult = await createCustomer({
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@example.com',
  phone: '5551234567',
  dateOfBirth: '1985-03-15',
  ssn: '5678',
  address: '789 Elm Street',
  city: 'Chicago',
  state: 'IL',
  zipCode: '60601'
});

const customerId = createResult.customer.customerId;
console.log('Customer created:', customerId);
console.log('Credit score:', createResult.customer.creditScore);

// 2. Update customer information
await updateCustomer(customerId, {
  phone: '5559876543',
  address: '456 New Street'
});

// 3. Check customer status
const customer = await getCustomer(customerId);
console.log('Status:', customer.customer.status);

// 4. Refresh credit score
const creditUpdate = await refreshCreditScore(customerId);
console.log('New credit score:', creditUpdate.creditScore);

// 5. Search for customers
const searchResults = await searchCustomers({
  name: 'Alice'
});
console.log('Found customers:', searchResults.count);

// 6. Update status
await updateCustomerStatus(customerId, CUSTOMER_STATUS.SUSPENDED);

// 7. Soft delete (deactivate)
await deleteCustomer(customerId, false);
```

### Credit Score Integration

```javascript
// Get credit score for new customer
const creditResult = await getCreditScore({
  ssn: '1234',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-15'
});

if (creditResult.success) {
  console.log('Credit Score:', creditResult.creditScore);
  console.log('Rating:', creditResult.creditReport.rating);
  console.log('Factors:', creditResult.creditReport.factors);
  console.log('Recommendations:', creditResult.creditReport.recommendations);
}

// Interpret credit score
const interpretation = interpretCreditScore(750);
console.log('Rating:', interpretation.rating);
console.log('Lending Terms:', interpretation.lendingTerms);
console.log('Approval Likelihood:', interpretation.approvalLikelihood);
```

## Best Practices

1. **Always validate input** before creating or updating customers
2. **Use soft delete** by default to maintain data integrity
3. **Refresh credit scores periodically** for accurate assessments
4. **Check audit logs** for compliance and troubleshooting
5. **Handle credit agency failures gracefully** (service may be unavailable)
6. **Sanitize data** before display to prevent XSS attacks
7. **Limit sensitive data exposure** in API responses

## Future Enhancements

- Backend API integration for production use
- Real credit bureau integration (Equifax, Experian, TransUnion)
- Document upload and storage (ID verification)
- Multi-factor authentication
- Customer portal for self-service
- Batch operations for customer import/export
- Advanced analytics and reporting
- Customer segmentation and profiling
- Integration with marketing systems
- Fraud detection and prevention

## Troubleshooting

### Common Issues

**Issue**: Credit score not retrieved
- **Cause**: Credit agency service may be unavailable (5% failure rate in mock)
- **Solution**: Retry credit score refresh or continue without credit score

**Issue**: Customer creation fails with duplicate error
- **Cause**: Email or SSN already exists
- **Solution**: Check for existing customer or update existing record

**Issue**: Cannot delete customer
- **Cause**: Customer has active accounts
- **Solution**: Close all accounts before deleting customer

**Issue**: Validation errors
- **Cause**: Input data doesn't meet requirements
- **Solution**: Check validation rules and error messages

## Support

For issues or questions:
- Review this documentation
- Check test suite for examples
- Review audit logs for troubleshooting
- Consult inline code comments (JSDoc)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
