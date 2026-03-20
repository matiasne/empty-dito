/**
 * Account List Component
 * Displays list of created accounts
 */

import { getAllAccounts } from '../services/accountService.js';
import { getRecentAuditLogs, getAuditStatistics } from '../services/auditService.js';
import {
  formatAccountNumber,
  formatCurrency,
  getAccountTypeDisplayName,
  getAccountStatusInfo,
  formatDate,
  getRelativeTime,
  maskAccountNumber,
} from '../utils/accountUtils.js';

/**
 * Initialize account list display
 */
export async function initAccountList() {
  const listContainer = document.getElementById('account-list-container');
  if (!listContainer) {
    console.error('Account list container not found');
    return;
  }

  await renderAccountList();
  setupListEventListeners();
}

/**
 * Render account list
 */
async function renderAccountList() {
  const listContainer = document.getElementById('account-list-container');
  const accounts = await getAllAccounts();
  const auditStats = await getAuditStatistics();

  listContainer.innerHTML = `
    <div class="account-list-wrapper">
      <div class="list-header">
        <h2>Account Management</h2>
        <div class="list-stats">
          <div class="stat-card">
            <span class="stat-label">Total Accounts</span>
            <span class="stat-value">${accounts.length}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Balance</span>
            <span class="stat-value">${formatCurrency(calculateTotalBalance(accounts))}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Audit Entries</span>
            <span class="stat-value">${auditStats.totalEntries}</span>
          </div>
        </div>
      </div>

      <div class="list-tabs">
        <button class="tab-btn active" data-tab="accounts">
          Accounts (${accounts.length})
        </button>
        <button class="tab-btn" data-tab="audit">
          Audit Trail
        </button>
      </div>

      <div class="tab-content">
        <div id="accounts-tab" class="tab-pane active">
          ${renderAccountsTable(accounts)}
        </div>
        <div id="audit-tab" class="tab-pane hidden">
          ${renderAuditTable()}
        </div>
      </div>
    </div>
  `;

  await loadAuditLogs();
}

/**
 * Render accounts table
 * @param {Array} accounts - Array of accounts
 * @returns {string} HTML string
 */
function renderAccountsTable(accounts) {
  if (accounts.length === 0) {
    return `
      <div class="empty-state">
        <p>No accounts found. Create your first account above!</p>
      </div>
    `;
  }

  return `
    <div class="table-container">
      <table class="accounts-table">
        <thead>
          <tr>
            <th>Account Number</th>
            <th>Customer Name</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${accounts.map((account) => renderAccountRow(account)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render single account row
 * @param {Object} account - Account object
 * @returns {string} HTML string
 */
function renderAccountRow(account) {
  const statusInfo = getAccountStatusInfo(account.status);

  return `
    <tr data-account-number="${account.accountNumber}">
      <td class="account-number">${formatAccountNumber(account.accountNumber)}</td>
      <td>${account.customerName}</td>
      <td>${getAccountTypeDisplayName(account.accountType)}</td>
      <td class="balance">${formatCurrency(account.balance)}</td>
      <td>
        <span class="status-badge status-${statusInfo.color}">
          ${statusInfo.icon} ${statusInfo.label}
        </span>
      </td>
      <td class="date-cell" title="${formatDate(account.createdAt)}">
        ${getRelativeTime(account.createdAt)}
      </td>
      <td class="actions">
        <button class="btn-icon" onclick="viewAccountDetails('${account.accountNumber}')" title="View Details">
          👁️
        </button>
      </td>
    </tr>
  `;
}

/**
 * Render audit trail table placeholder
 * @returns {string} HTML string
 */
function renderAuditTable() {
  return `
    <div id="audit-logs-container">
      <p>Loading audit logs...</p>
    </div>
  `;
}

/**
 * Load and display audit logs
 */
async function loadAuditLogs() {
  const auditLogs = await getRecentAuditLogs(100);
  const container = document.getElementById('audit-logs-container');

  if (!container) return;

  if (auditLogs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No audit logs found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table class="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Account Number</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${auditLogs.map((log) => renderAuditRow(log)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render single audit log row
 * @param {Object} log - Audit log object
 * @returns {string} HTML string
 */
function renderAuditRow(log) {
  const details = formatAuditDetails(log.details);
  const accountNumber = log.accountNumber ? maskAccountNumber(log.accountNumber) : 'N/A';

  return `
    <tr>
      <td class="date-cell" title="${formatDate(log.timestamp)}">
        ${getRelativeTime(log.timestamp)}
      </td>
      <td>
        <span class="action-badge">${formatActionName(log.action)}</span>
      </td>
      <td class="account-number">${accountNumber}</td>
      <td class="details-cell">${details}</td>
    </tr>
  `;
}

/**
 * Format audit details for display
 * @param {Object} details - Audit details object
 * @returns {string} Formatted details
 */
function formatAuditDetails(details) {
  if (!details || Object.keys(details).length === 0) {
    return '-';
  }

  const entries = Object.entries(details)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join(', ');

  return entries.length > 100 ? entries.substring(0, 100) + '...' : entries;
}

/**
 * Format action name for display
 * @param {string} action - Action name
 * @returns {string} Formatted action name
 */
function formatActionName(action) {
  return action
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate total balance across all accounts
 * @param {Array} accounts - Array of accounts
 * @returns {number} Total balance
 */
function calculateTotalBalance(accounts) {
  return accounts.reduce((total, account) => total + (account.balance || 0), 0);
}

/**
 * Setup list event listeners
 */
function setupListEventListeners() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

/**
 * Switch between tabs
 * @param {string} tabName - Tab name to switch to
 */
function switchTab(tabName) {
  // Update button states
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((btn) => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update pane visibility
  const accountsPane = document.getElementById('accounts-tab');
  const auditPane = document.getElementById('audit-tab');

  if (tabName === 'accounts') {
    accountsPane.classList.remove('hidden');
    accountsPane.classList.add('active');
    auditPane.classList.add('hidden');
    auditPane.classList.remove('active');
  } else if (tabName === 'audit') {
    auditPane.classList.remove('hidden');
    auditPane.classList.add('active');
    accountsPane.classList.add('hidden');
    accountsPane.classList.remove('active');
  }
}

/**
 * View account details (global function)
 * @param {string} accountNumber - Account number
 */
window.viewAccountDetails = async function (accountNumber) {
  const { getAccount } = await import('../services/accountService.js');
  const { getAuditLogs } = await import('../services/auditService.js');

  const account = await getAccount(accountNumber);
  const auditLogs = await getAuditLogs(accountNumber);

  if (!account) {
    alert('Account not found');
    return;
  }

  const statusInfo = getAccountStatusInfo(account.status);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Account Details</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="account-detail-grid">
          <div class="detail-item">
            <span class="label">Account Number</span>
            <span class="value">${formatAccountNumber(account.accountNumber)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Account Type</span>
            <span class="value">${getAccountTypeDisplayName(account.accountType)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Customer Name</span>
            <span class="value">${account.customerName}</span>
          </div>
          <div class="detail-item">
            <span class="label">Email</span>
            <span class="value">${account.email}</span>
          </div>
          <div class="detail-item">
            <span class="label">Phone</span>
            <span class="value">${account.phone}</span>
          </div>
          <div class="detail-item">
            <span class="label">Address</span>
            <span class="value">${account.address}</span>
          </div>
          <div class="detail-item">
            <span class="label">Balance</span>
            <span class="value balance-value">${formatCurrency(account.balance)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Status</span>
            <span class="value">
              <span class="status-badge status-${statusInfo.color}">
                ${statusInfo.icon} ${statusInfo.label}
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">Created</span>
            <span class="value">${formatDate(account.createdAt)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Last Updated</span>
            <span class="value">${formatDate(account.updatedAt)}</span>
          </div>
        </div>
        
        <div class="audit-logs-section">
          <h4>Activity Log (${auditLogs.length})</h4>
          ${
            auditLogs.length > 0
              ? `
            <div class="audit-logs-list">
              ${auditLogs
                .slice(0, 10)
                .map(
                  (log) => `
                <div class="audit-log-item">
                  <span class="log-time">${getRelativeTime(log.timestamp)}</span>
                  <span class="log-action">${formatActionName(log.action)}</span>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : '<p>No activity recorded yet.</p>'
          }
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

/**
 * Refresh the account list
 */
export async function refreshAccountList() {
  await renderAccountList();
  setupListEventListeners();
}
