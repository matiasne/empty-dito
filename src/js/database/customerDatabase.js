/**
 * Customer Database
 * Data persistence layer for customer operations using localStorage
 */

/**
 * Save customer to database
 * @param {Object} customer - Customer object to save
 * @returns {Promise<Object>} Save result
 */
export async function saveCustomer(customer) {
  try {
    // Get existing customers
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    // Check if customer ID already exists
    const exists = customers.some((c) => c.customerId === customer.customerId);
    if (exists) {
      return {
        success: false,
        error: 'Customer ID already exists',
      };
    }

    // Add new customer
    customers.push(customer);

    // Save to localStorage
    localStorage.setItem('customers', JSON.stringify(customers));

    return {
      success: true,
      customer,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if a customer exists with given criteria
 * @param {Object} criteria - Search criteria (e.g., { email: 'test@example.com' })
 * @returns {Promise<Object|null>} Customer object if found, null otherwise
 */
export async function customerExists(criteria) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    const customer = customers.find((c) => {
      return Object.keys(criteria).every((key) => {
        // Handle nested address object
        if (key === 'street' || key === 'city' || key === 'state' || key === 'zipCode') {
          return c.address && c.address[key] === criteria[key];
        }
        return c[key] === criteria[key];
      });
    });

    return customer || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get customer by customer ID
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object|null>} Customer object or null
 */
export async function getCustomerById(customerId) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find((c) => c.customerId === customerId);
    return customer || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get customer by email
 * @param {string} email - Email address
 * @returns {Promise<Object|null>} Customer object or null
 */
export async function getCustomerByEmail(email) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    return customer || null;
  } catch (error) {
    return null;
  }
}

/**
 * Update customer in database
 * @param {string} customerId - Customer ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateCustomer(customerId, updates) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customerIndex = customers.findIndex((c) => c.customerId === customerId);

    if (customerIndex === -1) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    // Update customer
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('customers', JSON.stringify(customers));

    return {
      success: true,
      customer: customers[customerIndex],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete customer from database
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteCustomer(customerId) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const filteredCustomers = customers.filter((c) => c.customerId !== customerId);

    if (customers.length === filteredCustomers.length) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    localStorage.setItem('customers', JSON.stringify(filteredCustomers));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all customers
 * @returns {Promise<Array>} Array of all customers
 */
export async function getAllCustomers() {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    return customers;
  } catch (error) {
    return [];
  }
}

/**
 * Get customers by status
 * @param {string} status - Customer status
 * @returns {Promise<Array>} Array of customers
 */
export async function getCustomersByStatus(status) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    return customers.filter((c) => c.status === status);
  } catch (error) {
    return [];
  }
}

/**
 * Search customers by name
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching customers
 */
export async function searchCustomersByName(searchTerm) {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const searchLower = searchTerm.toLowerCase();

    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(searchLower) ||
        c.lastName.toLowerCase().includes(searchLower) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    return [];
  }
}

/**
 * Get customer count
 * @returns {Promise<number>} Total number of customers
 */
export async function getCustomerCount() {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    return customers.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Get customer statistics
 * @returns {Promise<Object>} Customer statistics
 */
export async function getCustomerStatistics() {
  try {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    const stats = {
      total: customers.length,
      active: 0,
      inactive: 0,
      suspended: 0,
      blocked: 0,
      withAccounts: 0,
      averageCreditScore: 0,
    };

    let totalCreditScore = 0;
    let customersWithCreditScore = 0;

    customers.forEach((c) => {
      // Count by status
      if (c.status === 'active') stats.active++;
      else if (c.status === 'inactive') stats.inactive++;
      else if (c.status === 'suspended') stats.suspended++;
      else if (c.status === 'blocked') stats.blocked++;

      // Count customers with accounts
      if (c.metadata.accountCount > 0) {
        stats.withAccounts++;
      }

      // Calculate average credit score
      if (c.creditScore !== null && c.creditScore !== undefined) {
        totalCreditScore += c.creditScore;
        customersWithCreditScore++;
      }
    });

    if (customersWithCreditScore > 0) {
      stats.averageCreditScore = Math.round(totalCreditScore / customersWithCreditScore);
    }

    return stats;
  } catch (error) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      blocked: 0,
      withAccounts: 0,
      averageCreditScore: 0,
    };
  }
}

/**
 * Increment customer's account count
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Update result
 */
export async function incrementAccountCount(customerId) {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    return await updateCustomer(customerId, {
      metadata: {
        ...customer.metadata,
        accountCount: (customer.metadata.accountCount || 0) + 1,
      },
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Decrement customer's account count
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Update result
 */
export async function decrementAccountCount(customerId) {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
      };
    }

    return await updateCustomer(customerId, {
      metadata: {
        ...customer.metadata,
        accountCount: Math.max(0, (customer.metadata.accountCount || 0) - 1),
      },
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Clear all customers (for testing purposes)
 * @returns {Promise<Object>} Result
 */
export async function clearAllCustomers() {
  try {
    localStorage.removeItem('customers');
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
