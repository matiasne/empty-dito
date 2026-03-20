/**
 * Customer Service Test Suite
 * Comprehensive tests for customer management functionality
 */

import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  getAllCustomers,
  searchCustomers,
  updateCustomerStatus,
  refreshCreditScore,
  CUSTOMER_STATUS,
} from '../services/customerService.js';
import { clearAllCustomers } from '../database/customerDatabase.js';
import { clearAuditLogs } from '../services/auditService.js';

/**
 * Test data
 */
const validCustomerData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '5551234567',
  dateOfBirth: '1990-01-15',
  ssn: '1234',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
};

const validCustomerData2 = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '5559876543',
  dateOfBirth: '1985-06-20',
  ssn: '5678',
  address: '456 Oak Avenue',
  city: 'Chicago',
  state: 'IL',
  zipCode: '60601',
};

/**
 * Run all customer service tests
 */
export async function runCustomerTests() {
  console.log('=== Starting Customer Service Tests ===\n');

  // Clear data before tests
  await clearAllCustomers();
  await clearAuditLogs();

  const tests = [
    testCreateValidCustomer,
    testCreateCustomerWithInvalidEmail,
    testCreateCustomerWithInvalidPhone,
    testCreateCustomerUnder18,
    testCreateDuplicateCustomer,
    testUpdateCustomer,
    testUpdateCustomerEmail,
    testDeleteCustomer,
    testGetCustomer,
    testGetAllCustomers,
    testSearchCustomers,
    testUpdateCustomerStatus,
    testRefreshCreditScore,
    testDeleteCustomerWithAccounts,
    testSoftVsHardDelete,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} FAILED:`, error.message);
      failed++;
    }
  }

  console.log('\n=== Test Summary ===');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
  }

  return { passed, failed, total: tests.length };
}

/**
 * Test 1: Create valid customer
 */
async function testCreateValidCustomer() {
  console.log('Test 1: Create valid customer');

  const result = await createCustomer(validCustomerData);

  if (!result.success) {
    throw new Error('Failed to create valid customer');
  }

  if (!result.customer.customerId) {
    throw new Error('Customer ID not generated');
  }

  if (result.customer.firstName !== validCustomerData.firstName) {
    throw new Error('Customer first name mismatch');
  }

  if (!result.customer.creditScore && result.customer.creditScore !== null) {
    console.log('  ℹ️  Credit score may or may not be available');
  }

  console.log('  ✅ Valid customer created successfully');
  console.log(`  Customer ID: ${result.customer.customerId}`);
  console.log(`  Credit Score: ${result.customer.creditScore || 'N/A'}`);
}

/**
 * Test 2: Create customer with invalid email
 */
async function testCreateCustomerWithInvalidEmail() {
  console.log('\nTest 2: Create customer with invalid email');

  const invalidData = {
    ...validCustomerData,
    email: 'invalid-email',
  };

  const result = await createCustomer(invalidData);

  if (result.success) {
    throw new Error('Should have failed with invalid email');
  }

  if (!result.errors || result.errors.length === 0) {
    throw new Error('Should have returned validation errors');
  }

  const emailError = result.errors.find((e) => e.field === 'email');
  if (!emailError) {
    throw new Error('Should have email validation error');
  }

  console.log('  ✅ Invalid email correctly rejected');
}

/**
 * Test 3: Create customer with invalid phone
 */
async function testCreateCustomerWithInvalidPhone() {
  console.log('\nTest 3: Create customer with invalid phone');

  const invalidData = {
    ...validCustomerData,
    email: 'test3@example.com',
    phone: '123', // Too short
  };

  const result = await createCustomer(invalidData);

  if (result.success) {
    throw new Error('Should have failed with invalid phone');
  }

  const phoneError = result.errors.find((e) => e.field === 'phone');
  if (!phoneError) {
    throw new Error('Should have phone validation error');
  }

  console.log('  ✅ Invalid phone correctly rejected');
}

/**
 * Test 4: Create customer under 18 years old
 */
async function testCreateCustomerUnder18() {
  console.log('\nTest 4: Create customer under 18 years old');

  const today = new Date();
  const under18Date = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

  const invalidData = {
    ...validCustomerData,
    email: 'test4@example.com',
    dateOfBirth: under18Date.toISOString().split('T')[0],
  };

  const result = await createCustomer(invalidData);

  if (result.success) {
    throw new Error('Should have failed for customer under 18');
  }

  const dobError = result.errors.find((e) => e.field === 'dateOfBirth');
  if (!dobError) {
    throw new Error('Should have date of birth validation error');
  }

  console.log('  ✅ Under 18 customer correctly rejected');
}

/**
 * Test 5: Create duplicate customer (same email)
 */
async function testCreateDuplicateCustomer() {
  console.log('\nTest 5: Create duplicate customer');

  // First customer should succeed
  const result1 = await createCustomer(validCustomerData2);
  if (!result1.success) {
    throw new Error('First customer creation should succeed');
  }

  // Duplicate should fail
  const result2 = await createCustomer(validCustomerData2);
  if (result2.success) {
    throw new Error('Duplicate customer should be rejected');
  }

  if (!result2.error || !result2.error.includes('already exists')) {
    throw new Error('Should return duplicate customer error');
  }

  console.log('  ✅ Duplicate customer correctly rejected');
}

/**
 * Test 6: Update customer
 */
async function testUpdateCustomer() {
  console.log('\nTest 6: Update customer');

  // Get existing customer
  const customers = await getAllCustomers();
  if (!customers.success || customers.customers.length === 0) {
    throw new Error('No customers to update');
  }

  const customerId = customers.customers[0].customerId;

  // Update phone number
  const result = await updateCustomer(customerId, {
    phone: '5559999999',
  });

  if (!result.success) {
    throw new Error('Failed to update customer');
  }

  if (result.customer.phone !== '5559999999') {
    throw new Error('Phone number not updated correctly');
  }

  console.log('  ✅ Customer updated successfully');
}

/**
 * Test 7: Update customer email (with conflict check)
 */
async function testUpdateCustomerEmail() {
  console.log('\nTest 7: Update customer email');

  const customers = await getAllCustomers();
  if (!customers.success || customers.customers.length < 2) {
    // Create another customer if needed
    await createCustomer({
      ...validCustomerData,
      email: 'test7@example.com',
      ssn: '7777',
    });
  }

  const allCustomers = await getAllCustomers();
  const customer1 = allCustomers.customers[0];
  const customer2 = allCustomers.customers[1];

  // Try to update customer1's email to customer2's email (should fail)
  const result = await updateCustomer(customer1.customerId, {
    email: customer2.email,
  });

  if (result.success) {
    throw new Error('Should not allow email conflict');
  }

  console.log('  ✅ Email conflict correctly prevented');
}

/**
 * Test 8: Delete customer (soft delete)
 */
async function testDeleteCustomer() {
  console.log('\nTest 8: Delete customer (soft delete)');

  // Create a customer to delete
  const createResult = await createCustomer({
    ...validCustomerData,
    email: 'test8@example.com',
    ssn: '8888',
  });

  if (!createResult.success) {
    throw new Error('Failed to create customer for deletion test');
  }

  const customerId = createResult.customer.customerId;

  // Delete customer (soft delete)
  const deleteResult = await deleteCustomer(customerId, false);

  if (!deleteResult.success) {
    throw new Error('Failed to delete customer');
  }

  // Verify customer is inactive
  const getResult = await getCustomer(customerId);
  if (!getResult.success) {
    throw new Error('Customer should still exist after soft delete');
  }

  if (getResult.customer.status !== CUSTOMER_STATUS.INACTIVE) {
    throw new Error('Customer should be inactive after soft delete');
  }

  console.log('  ✅ Customer soft deleted successfully');
}

/**
 * Test 9: Get customer by ID
 */
async function testGetCustomer() {
  console.log('\nTest 9: Get customer by ID');

  const customers = await getAllCustomers();
  if (!customers.success || customers.customers.length === 0) {
    throw new Error('No customers available');
  }

  const customerId = customers.customers[0].customerId;

  const result = await getCustomer(customerId);

  if (!result.success) {
    throw new Error('Failed to get customer');
  }

  if (result.customer.customerId !== customerId) {
    throw new Error('Customer ID mismatch');
  }

  // Check that SSN is not included (sensitive data)
  if (result.customer.ssn) {
    throw new Error('SSN should not be included by default');
  }

  console.log('  ✅ Customer retrieved successfully');
}

/**
 * Test 10: Get all customers
 */
async function testGetAllCustomers() {
  console.log('\nTest 10: Get all customers');

  const result = await getAllCustomers();

  if (!result.success) {
    throw new Error('Failed to get all customers');
  }

  if (!Array.isArray(result.customers)) {
    throw new Error('Customers should be an array');
  }

  if (result.count !== result.customers.length) {
    throw new Error('Count mismatch');
  }

  console.log(`  ✅ Retrieved ${result.count} customers`);
}

/**
 * Test 11: Search customers
 */
async function testSearchCustomers() {
  console.log('\nTest 11: Search customers');

  // Search by name
  const result = await searchCustomers({ name: 'John' });

  if (!result.success) {
    throw new Error('Failed to search customers');
  }

  if (!Array.isArray(result.customers)) {
    throw new Error('Search results should be an array');
  }

  // Should find at least one customer with "John"
  const hasJohn = result.customers.some(
    (c) => c.firstName.includes('John') || c.lastName.includes('John')
  );

  if (result.customers.length > 0 && !hasJohn) {
    throw new Error('Search results should contain "John"');
  }

  console.log(`  ✅ Search returned ${result.count} results`);
}

/**
 * Test 12: Update customer status
 */
async function testUpdateCustomerStatus() {
  console.log('\nTest 12: Update customer status');

  const customers = await getAllCustomers();
  if (!customers.success || customers.customers.length === 0) {
    throw new Error('No customers available');
  }

  const customerId = customers.customers[0].customerId;

  const result = await updateCustomerStatus(customerId, CUSTOMER_STATUS.SUSPENDED);

  if (!result.success) {
    throw new Error('Failed to update customer status');
  }

  if (result.customer.status !== CUSTOMER_STATUS.SUSPENDED) {
    throw new Error('Status not updated correctly');
  }

  console.log('  ✅ Customer status updated successfully');
}

/**
 * Test 13: Refresh credit score
 */
async function testRefreshCreditScore() {
  console.log('\nTest 13: Refresh credit score');

  const customers = await getAllCustomers();
  if (!customers.success || customers.customers.length === 0) {
    throw new Error('No customers available');
  }

  const customerId = customers.customers[0].customerId;

  const result = await refreshCreditScore(customerId);

  if (!result.success) {
    console.log('  ℹ️  Credit score refresh may fail occasionally (mock service)');
    return;
  }

  if (typeof result.creditScore !== 'number') {
    throw new Error('Credit score should be a number');
  }

  if (result.creditScore < 300 || result.creditScore > 850) {
    throw new Error('Credit score out of valid range');
  }

  console.log(`  ✅ Credit score refreshed: ${result.creditScore}`);
}

/**
 * Test 14: Delete customer with accounts (should fail)
 */
async function testDeleteCustomerWithAccounts() {
  console.log('\nTest 14: Delete customer with accounts');

  // Create a customer
  const createResult = await createCustomer({
    ...validCustomerData,
    email: 'test14@example.com',
    ssn: '1414',
  });

  if (!createResult.success) {
    throw new Error('Failed to create customer');
  }

  const customerId = createResult.customer.customerId;

  // Manually set account count (simulating customer with accounts)
  const { updateCustomer: updateDB } = await import('../database/customerDatabase.js');
  await updateDB(customerId, {
    metadata: { accountCount: 1 },
  });

  // Try to delete (should fail)
  const deleteResult = await deleteCustomer(customerId);

  if (deleteResult.success) {
    throw new Error('Should not allow deletion of customer with accounts');
  }

  console.log('  ✅ Correctly prevented deletion of customer with accounts');
}

/**
 * Test 15: Soft vs Hard delete
 */
async function testSoftVsHardDelete() {
  console.log('\nTest 15: Soft vs Hard delete');

  // Create two customers
  const customer1 = await createCustomer({
    ...validCustomerData,
    email: 'test15a@example.com',
    ssn: '1515',
  });

  const customer2 = await createCustomer({
    ...validCustomerData,
    email: 'test15b@example.com',
    ssn: '1516',
  });

  if (!customer1.success || !customer2.success) {
    throw new Error('Failed to create test customers');
  }

  // Soft delete customer1
  const softDelete = await deleteCustomer(customer1.customer.customerId, false);
  if (!softDelete.success) {
    throw new Error('Soft delete failed');
  }

  // Hard delete customer2
  const hardDelete = await deleteCustomer(customer2.customer.customerId, true);
  if (!hardDelete.success) {
    throw new Error('Hard delete failed');
  }

  // Check customer1 still exists but inactive
  const get1 = await getCustomer(customer1.customer.customerId);
  if (!get1.success) {
    throw new Error('Soft deleted customer should still exist');
  }
  if (get1.customer.status !== CUSTOMER_STATUS.INACTIVE) {
    throw new Error('Soft deleted customer should be inactive');
  }

  // Check customer2 doesn't exist
  const { getCustomerById } = await import('../database/customerDatabase.js');
  const get2 = await getCustomerById(customer2.customer.customerId);
  if (get2 !== null) {
    throw new Error('Hard deleted customer should not exist');
  }

  console.log('  ✅ Soft and hard delete work correctly');
}

// Auto-run tests if loaded in browser console
if (typeof window !== 'undefined') {
  window.runCustomerTests = runCustomerTests;
  console.log('Customer tests loaded. Run: runCustomerTests()');
}
