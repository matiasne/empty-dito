/**
 * Account Service Test Suite
 * Manual tests to verify account creation feature
 */

import { createAccount, getAllAccounts, getAccount } from '../services/accountService.js';
import { getAuditLogs, getAuditStatistics } from '../services/auditService.js';
import { clearAllAccounts } from '../database/accountDatabase.js';
import { clearAuditLogs } from '../services/auditService.js';

/**
 * Run all tests
 */
export async function runTests() {
  console.log('🧪 Starting Account Service Tests...\n');

  let passedTests = 0;
  let failedTests = 0;

  // Clear existing data
  await clearAllAccounts();
  await clearAuditLogs();

  // Test 1: Create valid checking account
  console.log('Test 1: Create valid checking account');
  try {
    const result = await createAccount({
      accountType: 'checking',
      customerName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '5551234567',
      ssn: '1234',
      address: '123 Main St, City, State 12345',
      initialDeposit: 100,
    });

    if (result.success && result.account) {
      console.log('✅ PASS: Checking account created successfully');
      console.log('   Account Number:', result.account.accountNumber);
      passedTests++;
    } else {
      console.log('❌ FAIL:', result.error);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 2: Create savings account
  console.log('Test 2: Create valid savings account');
  try {
    const result = await createAccount({
      accountType: 'savings',
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '5559876543',
      ssn: '5678',
      address: '456 Oak Ave, Town, State 67890',
      initialDeposit: 500,
    });

    if (result.success) {
      console.log('✅ PASS: Savings account created successfully');
      passedTests++;
    } else {
      console.log('❌ FAIL:', result.error);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 3: Fail with insufficient deposit
  console.log('Test 3: Reject account with insufficient minimum deposit');
  try {
    const result = await createAccount({
      accountType: 'savings',
      customerName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '5551112222',
      ssn: '9012',
      address: '789 Pine Rd, Village, State 11111',
      initialDeposit: 50, // Less than $100 minimum for savings
    });

    if (!result.success && result.errors) {
      console.log('✅ PASS: Correctly rejected insufficient deposit');
      console.log('   Error:', result.errors[0]?.message);
      passedTests++;
    } else {
      console.log('❌ FAIL: Should have rejected low deposit');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 4: Fail with invalid email
  console.log('Test 4: Reject account with invalid email');
  try {
    const result = await createAccount({
      accountType: 'checking',
      customerName: 'Alice Brown',
      email: 'invalid-email',
      phone: '5553334444',
      ssn: '3456',
      address: '321 Elm St, City, State 22222',
      initialDeposit: 100,
    });

    if (!result.success && result.errors) {
      console.log('✅ PASS: Correctly rejected invalid email');
      passedTests++;
    } else {
      console.log('❌ FAIL: Should have rejected invalid email');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 5: Retrieve all accounts
  console.log('Test 5: Retrieve all created accounts');
  try {
    const accounts = await getAllAccounts();
    if (accounts.length === 2) {
      console.log('✅ PASS: Retrieved all accounts (2 total)');
      passedTests++;
    } else {
      console.log(`❌ FAIL: Expected 2 accounts, got ${accounts.length}`);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 6: Retrieve specific account
  console.log('Test 6: Retrieve specific account by number');
  try {
    const accounts = await getAllAccounts();
    if (accounts.length > 0) {
      const accountNumber = accounts[0].accountNumber;
      const account = await getAccount(accountNumber);

      if (account && account.accountNumber === accountNumber) {
        console.log('✅ PASS: Retrieved specific account');
        console.log('   Account:', account.customerName);
        passedTests++;
      } else {
        console.log('❌ FAIL: Account not found');
        failedTests++;
      }
    } else {
      console.log('❌ FAIL: No accounts available');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 7: Verify audit trail
  console.log('Test 7: Verify audit trail created');
  try {
    const stats = await getAuditStatistics();
    if (stats.totalEntries >= 2) {
      console.log('✅ PASS: Audit trail contains entries');
      console.log('   Total entries:', stats.totalEntries);
      console.log('   Actions:', Object.keys(stats.actionCounts).join(', '));
      passedTests++;
    } else {
      console.log('❌ FAIL: Expected at least 2 audit entries');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 8: Create business account
  console.log('Test 8: Create business account');
  try {
    const result = await createAccount({
      accountType: 'business',
      customerName: 'Tech Startup Inc',
      email: 'info@techstartup.com',
      phone: '5557778888',
      ssn: '7890',
      address: '100 Innovation Dr, Tech City, State 33333',
      initialDeposit: 5000,
    });

    if (result.success) {
      console.log('✅ PASS: Business account created successfully');
      passedTests++;
    } else {
      console.log('❌ FAIL:', result.error);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 9: Prevent duplicate account type
  console.log('Test 9: Prevent duplicate account type for same customer');
  try {
    const result = await createAccount({
      accountType: 'checking',
      customerName: 'John Doe',
      email: 'john.doe@example.com', // Same email as Test 1
      phone: '5551234567',
      ssn: '1234',
      address: '123 Main St, City, State 12345',
      initialDeposit: 100,
    });

    if (!result.success && result.errors) {
      console.log('✅ PASS: Correctly prevented duplicate account type');
      passedTests++;
    } else {
      console.log('❌ FAIL: Should have rejected duplicate account');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 10: Money market account with high minimum
  console.log('Test 10: Create money market account with high minimum deposit');
  try {
    const result = await createAccount({
      accountType: 'money_market',
      customerName: 'Wealthy Investor',
      email: 'investor@wealth.com',
      phone: '5554445555',
      ssn: '2468',
      address: '500 Luxury Lane, Rich City, State 44444',
      initialDeposit: 10000,
    });

    if (result.success) {
      console.log('✅ PASS: Money market account created successfully');
      passedTests++;
    } else {
      console.log('❌ FAIL:', result.error);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
    failedTests++;
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('Test Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Total: ${passedTests + failedTests}`);
  console.log('═══════════════════════════════════════════\n');

  // Display final state
  const finalAccounts = await getAllAccounts();
  const finalStats = await getAuditStatistics();

  console.log('Final State:');
  console.log(`Accounts in database: ${finalAccounts.length}`);
  console.log(`Audit log entries: ${finalStats.totalEntries}`);
  console.log('');

  return {
    passed: passedTests,
    failed: failedTests,
    total: passedTests + failedTests,
  };
}

// Auto-run tests in console
if (typeof window !== 'undefined') {
  window.runAccountTests = runTests;
  console.log('To run tests, execute: runAccountTests()');
}
