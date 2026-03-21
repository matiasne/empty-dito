/**
 * Main application entry point
 */

import { initAccountForm } from './components/accountForm.js';
import { initAccountList } from './components/accountList.js';
import { initializeInfrastructure, getInfrastructureStatus } from './infrastructure/index.js';
import { Logger } from './infrastructure/logger.js';
import './utils/consoleHelpers.js';

const logger = new Logger('Application');

/**
 * Initialize the application
 */
async function init() {
  console.log('Bank Account Management System initializing...');

  try {
    // Initialize infrastructure (database, error handling, logging)
    logger.info('Initializing infrastructure...');
    const infraResult = await initializeInfrastructure();
    
    if (!infraResult.success) {
      throw new Error('Infrastructure initialization failed: ' + infraResult.error);
    }
    
    logger.info('Infrastructure initialized successfully', infraResult.results);

    // Initialize account creation form
    logger.info('Initializing account form...');
    initAccountForm();

    // Initialize account list
    logger.info('Initializing account list...');
    await initAccountList();

    // Setup event listeners
    setupEventListeners();

    // Animate sections on load
    animateOnLoad();

    // Log infrastructure status
    const status = await getInfrastructureStatus();
    logger.info('Infrastructure status', status.status);

    console.log('✅ Application ready');
    logger.info('Application initialization complete');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    logger.error('Application initialization failed', error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Listen for custom events
  document.addEventListener('accountCreated', async () => {
    console.log('Account created event received');
    // Refresh account list when a new account is created
    const { refreshAccountList } = await import('./components/accountList.js');
    await refreshAccountList();
  });

  console.log('Event listeners ready');
}

/**
 * Animate sections on page load
 */
function animateOnLoad() {
  const sections = document.querySelectorAll('section');

  sections.forEach((section, index) => {
    setTimeout(() => {
      section.classList.add('fade-in');
    }, index * 100);
  });
}

/**
 * Wait for DOM to be ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential testing
export { init, setupEventListeners };
