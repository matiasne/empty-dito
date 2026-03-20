/**
 * Customer Service
 * Handles customer creation, update, deletion, and inquiry operations
 */

import { validateCustomerData, validateCustomerUpdate } from '../validators/customerValidator.js';
import {
  saveCustomer,
  getCustomerById,
  updateCustomer as updateCustomerDB,
  deleteCustomer as deleteCustomerDB,
  getAllCustomers as getAllCustomersDB,
  customerExists,
} from '../database/customerDatabase.js';
import { logAudit } from '../services/auditService.js';
import { generateCustomerId } from '../utils/customerUtils.js';
import { getCreditScore } from '../services/creditAgencyInterface.js';

/**
 * Customer status values
 */
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer creation data
 * @param {string} customerData.firstName - Customer's first name
 * @param {string} customerData.lastName - Customer's last name
 * @param {string} customerData.email - Customer's email address
 * @param {string} customerData.phone - Customer's phone number
 * @param {string} customerData.dateOfBirth - Customer's date of birth
 * @param {string} customerData.ssn - Social Security Number (full or last 4 digits)
 * @param {string} customerData.address - Customer's street address
 * @param {string} customerData.city - City
 * @param {string} customerData.state - State
 * @param {string} customerData.zipCode - ZIP code
 * @returns {Promise<Object>} Created customer object or error
 */
export async function createCustomer(customerData) {
  try {
    // Step 1: Validate customer data
    const validation = validateCustomerData(customerData);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      };
    }

    // Step 2: Check if customer already exists
    const existingCustomer = await customerExists({ email: customerData.email });
    if (existingCustomer) {
      return {
        success: false,
        error: 'Customer with this email already exists',
        errors: [{ field: 'email', message: 'Email already registered' }],
      };
    }

    // Step 3: Check for SSN duplicate
    if (customerData.ssn) {
      const existingBySSN = await customerExists({ ssn: customerData.ssn });
      if (existingBySSN) {
        return {
          success: false,
          error: 'Customer with this SSN already exists',
          errors: [{ field: 'ssn', message: 'SSN already registered' }],
        };
      }
    }

    // Step 4: Generate customer ID
    const customerId = generateCustomerId();

    // Step 5: Retrieve credit score from credit agency
    let creditScore = null;
    try {
      const creditResult = await getCreditScore({
        ssn: customerData.ssn,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        dateOfBirth: customerData.dateOfBirth,
      });
      if (creditResult.success) {
        creditScore = creditResult.creditScore;
      }
    } catch (error) {
      console.warn('Failed to retrieve credit score:', error);
      // Continue without credit score
    }

    // Step 6: Create customer object
    const customer = {
      customerId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      dateOfBirth: customerData.dateOfBirth,
      ssn: customerData.ssn,
      address: {
        street: customerData.address,
        city: customerData.city,
        state: customerData.state,
        zipCode: customerData.zipCode,
      },
      creditScore,
      status: CUSTOMER_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        createdBy: 'system',
        lastModifiedBy: 'system',
        accountCount: 0,
      },
    };

    // Step 7: Save customer to database
    const saveResult = await saveCustomer(customer);
    if (!saveResult.success) {
      return {
        success: false,
        error: 'Failed to save customer',
        details: saveResult.error,
      };
    }

    // Step 8: Create audit trail
    await logAudit({
      action: 'CUSTOMER_CREATED',
      customerId: customer.customerId,
      details: {
        customerName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        creditScore: customer.creditScore,
      },
      timestamp: new Date().toISOString(),
    });

    // Step 9: Return success response (excluding sensitive data)
    return {
      success: true,
      customer: {
        customerId: customer.customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        creditScore: customer.creditScore,
        status: customer.status,
        createdAt: customer.createdAt,
      },
      message: 'Customer created successfully',
    };
  } catch (error) {
    // Log error to audit trail
    await logAudit({
      action: 'CUSTOMER_CREATION_FAILED',
      details: {
        error: error.message,
        customerData: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
        },
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: 'Customer creation failed',
      details: error.message,
    };
  }
}

/**
 * Update an existing customer
 * @param {string} customerId - Customer ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateCustomer(customerId, updates) {
  try {
    // Step 1: Validate customer ID
    if (!customerId) {
      return {
        success: false,
        error: 'Customer ID is required',
      };
    }

    // Step 2: Get existing customer
    const existingCustomer = await getCustomerById(customerId);
    if (!existingCustomer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    // Step 3: Validate update data
    const validation = validateCustomerUpdate(updates);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      };
    }

    // Step 4: Check for email conflicts if email is being updated
    if (updates.email && updates.email !== existingCustomer.email) {
      const existingByEmail = await customerExists({ email: updates.email });
      if (existingByEmail && existingByEmail.customerId !== customerId) {
        return {
          success: false,
          error: 'Email already in use by another customer',
          errors: [{ field: 'email', message: 'Email already registered' }],
        };
      }
    }

    // Step 5: Prepare updated customer data
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...existingCustomer.metadata,
        lastModifiedBy: 'system',
      },
    };

    // Step 6: Update address if provided
    if (updates.address || updates.city || updates.state || updates.zipCode) {
      updatedData.address = {
        ...existingCustomer.address,
        ...(updates.address && { street: updates.address }),
        ...(updates.city && { city: updates.city }),
        ...(updates.state && { state: updates.state }),
        ...(updates.zipCode && { zipCode: updates.zipCode }),
      };
      // Remove individual address fields from updates
      delete updatedData.city;
      delete updatedData.state;
      delete updatedData.zipCode;
    }

    // Step 7: Update customer in database
    const updateResult = await updateCustomerDB(customerId, updatedData);
    if (!updateResult.success) {
      return {
        success: false,
        error: 'Failed to update customer',
        details: updateResult.error,
      };
    }

    // Step 8: Create audit trail
    await logAudit({
      action: 'CUSTOMER_UPDATED',
      customerId,
      details: {
        customerName: `${updateResult.customer.firstName} ${updateResult.customer.lastName}`,
        updatedFields: Object.keys(updates),
      },
      timestamp: new Date().toISOString(),
    });

    // Step 9: Return success response (excluding sensitive data)
    const { ssn, ...safeCustomer } = updateResult.customer;
    return {
      success: true,
      customer: safeCustomer,
      message: 'Customer updated successfully',
    };
  } catch (error) {
    await logAudit({
      action: 'CUSTOMER_UPDATE_FAILED',
      customerId,
      details: {
        error: error.message,
        updates: Object.keys(updates),
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: 'Customer update failed',
      details: error.message,
    };
  }
}

/**
 * Delete a customer (soft delete - changes status to inactive)
 * @param {string} customerId - Customer ID
 * @param {boolean} hardDelete - If true, permanently delete (default: false)
 * @returns {Promise<Object>} Delete result
 */
export async function deleteCustomer(customerId, hardDelete = false) {
  try {
    // Step 1: Validate customer ID
    if (!customerId) {
      return {
        success: false,
        error: 'Customer ID is required',
      };
    }

    // Step 2: Get existing customer
    const existingCustomer = await getCustomerById(customerId);
    if (!existingCustomer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    // Step 3: Check if customer has active accounts
    if (existingCustomer.metadata.accountCount > 0) {
      return {
        success: false,
        error: 'Cannot delete customer with active accounts',
        details: 'Please close all accounts before deleting customer',
      };
    }

    let result;
    if (hardDelete) {
      // Permanent deletion
      result = await deleteCustomerDB(customerId);
    } else {
      // Soft delete - change status to inactive
      result = await updateCustomerDB(customerId, {
        status: CUSTOMER_STATUS.INACTIVE,
        updatedAt: new Date().toISOString(),
      });
    }

    if (!result.success) {
      return {
        success: false,
        error: 'Failed to delete customer',
        details: result.error,
      };
    }

    // Step 4: Create audit trail
    await logAudit({
      action: hardDelete ? 'CUSTOMER_DELETED_PERMANENTLY' : 'CUSTOMER_DELETED',
      customerId,
      details: {
        customerName: `${existingCustomer.firstName} ${existingCustomer.lastName}`,
        hardDelete,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: hardDelete
        ? 'Customer permanently deleted'
        : 'Customer deactivated successfully',
    };
  } catch (error) {
    await logAudit({
      action: 'CUSTOMER_DELETE_FAILED',
      customerId,
      details: {
        error: error.message,
        hardDelete,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: 'Customer deletion failed',
      details: error.message,
    };
  }
}

/**
 * Get customer by ID (inquiry)
 * @param {string} customerId - Customer ID
 * @param {boolean} includeSensitive - Include sensitive data like SSN (default: false)
 * @returns {Promise<Object>} Customer object or null
 */
export async function getCustomer(customerId, includeSensitive = false) {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    // Create audit trail
    await logAudit({
      action: 'CUSTOMER_INQUIRY',
      customerId,
      details: {
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
      timestamp: new Date().toISOString(),
    });

    // Remove sensitive data if not requested
    if (!includeSensitive) {
      const { ssn, ...safeCustomer } = customer;
      return {
        success: true,
        customer: safeCustomer,
      };
    }

    return {
      success: true,
      customer,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to retrieve customer',
      details: error.message,
    };
  }
}

/**
 * Get all customers (inquiry)
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status
 * @param {string} filters.search - Search term for name or email
 * @returns {Promise<Object>} Array of customers
 */
export async function getAllCustomers(filters = {}) {
  try {
    let customers = await getAllCustomersDB();

    // Apply filters
    if (filters.status) {
      customers = customers.filter((c) => c.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      );
    }

    // Remove sensitive data
    const safeCustomers = customers.map(({ ssn, ...customer }) => customer);

    return {
      success: true,
      customers: safeCustomers,
      count: safeCustomers.length,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to retrieve customers',
      details: error.message,
      customers: [],
      count: 0,
    };
  }
}

/**
 * Search customers by various criteria
 * @param {Object} criteria - Search criteria
 * @returns {Promise<Object>} Search results
 */
export async function searchCustomers(criteria) {
  try {
    let customers = await getAllCustomersDB();

    // Apply search criteria
    if (criteria.email) {
      customers = customers.filter((c) =>
        c.email.toLowerCase().includes(criteria.email.toLowerCase())
      );
    }

    if (criteria.phone) {
      const phoneDigits = criteria.phone.replace(/\D/g, '');
      customers = customers.filter((c) => c.phone.replace(/\D/g, '').includes(phoneDigits));
    }

    if (criteria.name) {
      const nameLower = criteria.name.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.firstName.toLowerCase().includes(nameLower) ||
          c.lastName.toLowerCase().includes(nameLower) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(nameLower)
      );
    }

    if (criteria.customerId) {
      customers = customers.filter((c) => c.customerId === criteria.customerId);
    }

    // Remove sensitive data
    const safeCustomers = customers.map(({ ssn, ...customer }) => customer);

    return {
      success: true,
      customers: safeCustomers,
      count: safeCustomers.length,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Search failed',
      details: error.message,
      customers: [],
      count: 0,
    };
  }
}

/**
 * Update customer status
 * @param {string} customerId - Customer ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Update result
 */
export async function updateCustomerStatus(customerId, status) {
  try {
    if (!Object.values(CUSTOMER_STATUS).includes(status)) {
      return {
        success: false,
        error: 'Invalid status value',
      };
    }

    const customer = await getCustomerById(customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    const result = await updateCustomerDB(customerId, {
      status,
      updatedAt: new Date().toISOString(),
    });

    if (!result.success) {
      return result;
    }

    await logAudit({
      action: 'CUSTOMER_STATUS_UPDATED',
      customerId,
      details: {
        customerName: `${customer.firstName} ${customer.lastName}`,
        oldStatus: customer.status,
        newStatus: status,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      customer: result.customer,
      message: 'Customer status updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update customer status',
      details: error.message,
    };
  }
}

/**
 * Refresh customer credit score
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Updated credit score
 */
export async function refreshCreditScore(customerId) {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    const creditResult = await getCreditScore({
      ssn: customer.ssn,
      firstName: customer.firstName,
      lastName: customer.lastName,
      dateOfBirth: customer.dateOfBirth,
    });

    if (!creditResult.success) {
      return {
        success: false,
        error: 'Failed to retrieve credit score',
        details: creditResult.error,
      };
    }

    const result = await updateCustomerDB(customerId, {
      creditScore: creditResult.creditScore,
      updatedAt: new Date().toISOString(),
    });

    await logAudit({
      action: 'CREDIT_SCORE_REFRESHED',
      customerId,
      details: {
        customerName: `${customer.firstName} ${customer.lastName}`,
        oldScore: customer.creditScore,
        newScore: creditResult.creditScore,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      creditScore: creditResult.creditScore,
      message: 'Credit score refreshed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to refresh credit score',
      details: error.message,
    };
  }
}
