/**
 * Account Creation Form Component
 * Handles UI for creating new accounts
 */

import { createAccount, ACCOUNT_TYPES } from '../services/accountService.js';
import { sanitizeAccountData } from '../validators/accountValidator.js';
import {
  formatCurrency,
  getAccountTypeDisplayName,
  formatAccountNumber,
  formatPhoneNumber,
  formatDate,
} from '../utils/accountUtils.js';

/**
 * Initialize account creation form
 */
export function initAccountForm() {
  const formContainer = document.getElementById('account-form-container');
  if (!formContainer) {
    console.error('Account form container not found');
    return;
  }

  formContainer.innerHTML = renderAccountForm();
  setupFormEventListeners();
}

/**
 * Render account creation form HTML
 * @returns {string} HTML string
 */
function renderAccountForm() {
  return `
    <div class="account-form-wrapper">
      <div class="form-header">
        <h2>Create New Account</h2>
        <p>Fill in the details below to create a new bank account</p>
      </div>

      <form id="account-creation-form" class="account-form" novalidate>
        <!-- Account Type -->
        <div class="form-group">
          <label for="accountType" class="form-label">
            Account Type <span class="required">*</span>
          </label>
          <select id="accountType" name="accountType" class="form-input" required>
            <option value="">Select account type</option>
            <option value="${ACCOUNT_TYPES.CHECKING}">
              ${getAccountTypeDisplayName(ACCOUNT_TYPES.CHECKING)} (Min. $25)
            </option>
            <option value="${ACCOUNT_TYPES.SAVINGS}">
              ${getAccountTypeDisplayName(ACCOUNT_TYPES.SAVINGS)} (Min. $100)
            </option>
            <option value="${ACCOUNT_TYPES.BUSINESS}">
              ${getAccountTypeDisplayName(ACCOUNT_TYPES.BUSINESS)} (Min. $500)
            </option>
            <option value="${ACCOUNT_TYPES.MONEY_MARKET}">
              ${getAccountTypeDisplayName(ACCOUNT_TYPES.MONEY_MARKET)} (Min. $2,500)
            </option>
          </select>
          <div class="form-error" id="accountType-error"></div>
        </div>

        <!-- Customer Name -->
        <div class="form-group">
          <label for="customerName" class="form-label">
            Full Name <span class="required">*</span>
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            class="form-input"
            placeholder="John Doe"
            required
          />
          <div class="form-error" id="customerName-error"></div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">
            Email Address <span class="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            class="form-input"
            placeholder="john.doe@example.com"
            required
          />
          <div class="form-error" id="email-error"></div>
        </div>

        <!-- Phone -->
        <div class="form-group">
          <label for="phone" class="form-label">
            Phone Number <span class="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            class="form-input"
            placeholder="(555) 123-4567"
            required
          />
          <div class="form-error" id="phone-error"></div>
        </div>

        <!-- SSN -->
        <div class="form-group">
          <label for="ssn" class="form-label">
            SSN (Last 4 Digits) <span class="required">*</span>
          </label>
          <input
            type="text"
            id="ssn"
            name="ssn"
            class="form-input"
            placeholder="1234"
            maxlength="4"
            pattern="\\d{4}"
            required
          />
          <div class="form-error" id="ssn-error"></div>
        </div>

        <!-- Address -->
        <div class="form-group">
          <label for="address" class="form-label">
            Address <span class="required">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            class="form-input form-textarea"
            placeholder="123 Main St, City, State ZIP"
            rows="3"
            required
          ></textarea>
          <div class="form-error" id="address-error"></div>
        </div>

        <!-- Initial Deposit -->
        <div class="form-group">
          <label for="initialDeposit" class="form-label">
            Initial Deposit <span class="required">*</span>
          </label>
          <div class="input-with-prefix">
            <span class="input-prefix">$</span>
            <input
              type="number"
              id="initialDeposit"
              name="initialDeposit"
              class="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-error" id="initialDeposit-error"></div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="submit-btn">
            Create Account
          </button>
          <button type="button" class="btn btn-secondary" id="reset-btn">
            Reset Form
          </button>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div id="form-message" class="form-message hidden"></div>

      <!-- Account Created Success Display -->
      <div id="account-success" class="account-success hidden"></div>
    </div>
  `;
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
  const form = document.getElementById('account-creation-form');
  const resetBtn = document.getElementById('reset-btn');

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handleFormReset);
  }

  // Real-time validation
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
    input.addEventListener('input', () => {
      clearFieldError(input.name);
    });
  });

  // Phone number formatting
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const formatted = formatPhoneNumber(e.target.value);
      if (formatted !== e.target.value) {
        e.target.value = formatted;
      }
    });
  }
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-btn');
  const messageDiv = document.getElementById('form-message');

  // Clear previous messages
  clearAllErrors();
  messageDiv.classList.add('hidden');

  // Get form data
  const formData = new FormData(e.target);
  const accountData = {
    accountType: formData.get('accountType'),
    customerName: formData.get('customerName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    ssn: formData.get('ssn'),
    address: formData.get('address'),
    initialDeposit: parseFloat(formData.get('initialDeposit')) || 0,
  };

  // Sanitize data
  const sanitizedData = sanitizeAccountData(accountData);

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    // Create account
    const result = await createAccount(sanitizedData);

    if (result.success) {
      // Show success message
      showSuccessMessage(result.account, result.message);
      e.target.reset();

      // Dispatch custom event to notify other components
      document.dispatchEvent(new CustomEvent('accountCreated', { detail: result.account }));
    } else {
      // Show errors
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((error) => {
          showFieldError(error.field, error.message);
        });
      }
      showMessage(result.error || 'Failed to create account', 'error');
    }
  } catch (error) {
    showMessage('An unexpected error occurred. Please try again.', 'error');
    console.error('Account creation error:', error);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
}

/**
 * Handle form reset
 */
function handleFormReset() {
  const form = document.getElementById('account-creation-form');
  const messageDiv = document.getElementById('form-message');
  const successDiv = document.getElementById('account-success');

  if (form) {
    form.reset();
  }

  clearAllErrors();
  messageDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
}

/**
 * Validate a single form field
 * @param {HTMLElement} field - Form field to validate
 */
function validateField(field) {
  const value = field.value.trim();
  const name = field.name;

  clearFieldError(name);

  if (field.required && !value) {
    showFieldError(name, 'This field is required');
    return false;
  }

  // Additional validation based on field type
  if (name === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(name, 'Invalid email format');
      return false;
    }
  }

  if (name === 'ssn' && value) {
    if (!/^\d{4}$/.test(value)) {
      showFieldError(name, 'SSN must be exactly 4 digits');
      return false;
    }
  }

  return true;
}

/**
 * Show field error message
 * @param {string} fieldName - Field name
 * @param {string} message - Error message
 */
function showFieldError(fieldName, message) {
  const errorDiv = document.getElementById(`${fieldName}-error`);
  const field =
    document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);

  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('visible');
  }

  if (field) {
    field.classList.add('error');
  }
}

/**
 * Clear field error message
 * @param {string} fieldName - Field name
 */
function clearFieldError(fieldName) {
  const errorDiv = document.getElementById(`${fieldName}-error`);
  const field =
    document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);

  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.classList.remove('visible');
  }

  if (field) {
    field.classList.remove('error');
  }
}

/**
 * Clear all form errors
 */
function clearAllErrors() {
  const errorDivs = document.querySelectorAll('.form-error');
  const errorFields = document.querySelectorAll('.form-input.error');

  errorDivs.forEach((div) => {
    div.textContent = '';
    div.classList.remove('visible');
  });

  errorFields.forEach((field) => {
    field.classList.remove('error');
  });
}

/**
 * Show general message
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('form-message');

  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 5000);
  }
}

/**
 * Show success message with account details
 * @param {Object} account - Created account
 * @param {string} message - Success message
 */
function showSuccessMessage(account, message) {
  const successDiv = document.getElementById('account-success');
  const messageDiv = document.getElementById('form-message');

  if (successDiv) {
    successDiv.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✓</div>
        <h3>${message}</h3>
        <div class="account-details">
          <div class="detail-row">
            <span class="detail-label">Account Number:</span>
            <span class="detail-value">${formatAccountNumber(account.accountNumber)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Account Type:</span>
            <span class="detail-value">${getAccountTypeDisplayName(account.accountType)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Customer Name:</span>
            <span class="detail-value">${account.customerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Initial Balance:</span>
            <span class="detail-value">${formatCurrency(account.balance)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-${account.status}">${account.status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Created:</span>
            <span class="detail-value">${formatDate(account.createdAt)}</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Create Another Account
        </button>
      </div>
    `;
    successDiv.classList.remove('hidden');

    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  messageDiv.classList.add('hidden');
}
