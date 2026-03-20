/**
 * Main application entry point
 */

import { initAccountForm } from './components/accountForm.js';
import { initAccountList } from './components/accountList.js';

/**
 * Initialize the application
 */
async function init() {
  console.log('Bank Account Management System initialized');

  // Initialize account creation form
  initAccountForm();

  // Initialize account list
  await initAccountList();

  // Setup event listeners
  setupEventListeners();

  // Animate sections on load
  animateOnLoad();

  console.log('Application ready');
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
