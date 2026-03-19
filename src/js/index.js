/**
 * Main application entry point
 */

import { formatMessage, getRandomMessage } from './utils.js';

/**
 * Initialize the application
 */
function init() {
  console.log('Application initialized');
  setupEventListeners();
  animateOnLoad();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  const demoButton = document.getElementById('demoButton');
  const demoOutput = document.getElementById('demoOutput');

  if (demoButton && demoOutput) {
    demoButton.addEventListener('click', handleDemoButtonClick);
  }
}

/**
 * Handle demo button click
 */
function handleDemoButtonClick() {
  const demoOutput = document.getElementById('demoOutput');
  const demoButton = document.getElementById('demoButton');

  if (!demoOutput || !demoButton) return;

  // Get a random message
  const message = getRandomMessage();
  const formattedMessage = formatMessage(message);

  // Update the output
  demoOutput.textContent = formattedMessage;
  demoOutput.classList.add('fade-in');

  // Add a visual feedback to the button
  demoButton.textContent = 'Click Again!';

  // Remove animation class after it completes
  setTimeout(() => {
    demoOutput.classList.remove('fade-in');
  }, 300);
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
export { init, setupEventListeners, handleDemoButtonClick };
