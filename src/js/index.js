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

  // Demo button functionality
  const demoButton = document.getElementById('demo-button');
  const demoOutput = document.getElementById('demo-output');

  if (demoButton && demoOutput) {
    demoButton.addEventListener('click', function () {
      // Simulate demo loading
      demoButton.disabled = true;
      demoButton.textContent = 'Loading Demo...';
      demoOutput.innerHTML = '<p>🔄 Initializing demo environment...</p>';

      // Simulate async operation
      setTimeout(() => {
        demoOutput.innerHTML = `
          <div class="demo-result">
            <h4>Demo Results</h4>
            <p>✅ Successfully connected to demo server</p>
            <p>📊 Sample data loaded: 1,234 records</p>
            <p>⚡ Response time: 142ms</p>
            <p>🎯 Demo ready for interaction!</p>
          </div>
        `;
        demoButton.textContent = 'Restart Demo';
        demoButton.disabled = false;
      }, 2000);
    });
  }

  // Add hover effects to activity items
  const activityItems = document.querySelectorAll('.activity-item');
  activityItems.forEach((item) => {
    item.addEventListener('mouseenter', function () {
      this.style.backgroundColor = 'var(--color-bg-tertiary)';
      this.style.transition = 'background-color var(--transition-base)';
    });

    item.addEventListener('mouseleave', function () {
      this.style.backgroundColor = 'transparent';
    });
  });

  // Animate stats on scroll
  const observeStats = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStats();
          observeStats.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    observeStats.observe(statsSection);
  }
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
 * Animate statistics numbers
 */
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');

  statNumbers.forEach((stat) => {
    const finalText = stat.textContent;
    const hasPlus = finalText.includes('+');
    const hasPercent = finalText.includes('%');
    const hasSlash = finalText.includes('/');

    // Extract numeric value
    const targetNumber = parseInt(finalText.replace(/[^0-9]/g, ''));

    if (!isNaN(targetNumber) && targetNumber > 0) {
      let currentNumber = 0;
      const increment = targetNumber / 50;
      const timer = setInterval(() => {
        currentNumber += increment;

        if (currentNumber >= targetNumber) {
          currentNumber = targetNumber;
          clearInterval(timer);

          // Restore original format
          let displayText = currentNumber.toLocaleString();
          if (hasPlus) {
            displayText += '+';
          }
          if (hasPercent) {
            displayText += '%';
          }
          if (hasSlash) {
            displayText = '24/7'; // Special case for 24/7
          }

          stat.textContent = displayText;
        } else {
          stat.textContent = Math.floor(currentNumber).toLocaleString();
        }
      }, 30);
    }
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
