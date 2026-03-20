/**
 * Main application entry point
 */

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
 * Placeholder for future event listeners
 */
function setupEventListeners() {
  // Event listeners will be added here as needed
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
