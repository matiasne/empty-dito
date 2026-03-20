/**
 * Credit Agency Interface
 * Mock service for retrieving credit scores from external credit agencies
 * In a real system, this would integrate with actual credit bureaus (Equifax, Experian, TransUnion)
 */

/**
 * Simulated credit score database
 * In production, this would be an API call to a real credit agency
 */
const MOCK_CREDIT_SCORES = {
  // High credit scores
  excellent: { min: 800, max: 850 },
  veryGood: { min: 740, max: 799 },
  good: { min: 670, max: 739 },
  fair: { min: 580, max: 669 },
  poor: { min: 300, max: 579 },
};

/**
 * Get credit score from credit agency
 * @param {Object} customerInfo - Customer information for credit check
 * @param {string} customerInfo.ssn - Social Security Number
 * @param {string} customerInfo.firstName - First name
 * @param {string} customerInfo.lastName - Last name
 * @param {string} customerInfo.dateOfBirth - Date of birth
 * @returns {Promise<Object>} Credit score result
 */
export async function getCreditScore(customerInfo) {
  try {
    // Simulate API delay
    await simulateDelay(500, 1500);

    // Validate required fields
    if (!customerInfo.ssn || !customerInfo.firstName || !customerInfo.lastName) {
      return {
        success: false,
        error: 'Missing required customer information',
        errorCode: 'MISSING_INFO',
      };
    }

    // Simulate occasional API failures (5% failure rate)
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: 'Credit agency service temporarily unavailable',
        errorCode: 'SERVICE_UNAVAILABLE',
      };
    }

    // Generate mock credit score based on SSN (deterministic for testing)
    const creditScore = generateMockCreditScore(customerInfo.ssn);

    // Get credit report details
    const creditReport = generateMockCreditReport(creditScore, customerInfo);

    return {
      success: true,
      creditScore,
      creditReport,
      agency: 'Mock Credit Bureau',
      retrievedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to retrieve credit score',
      errorCode: 'UNKNOWN_ERROR',
      details: error.message,
    };
  }
}

/**
 * Get detailed credit report
 * @param {Object} customerInfo - Customer information
 * @returns {Promise<Object>} Detailed credit report
 */
export async function getCreditReport(customerInfo) {
  try {
    await simulateDelay(1000, 2000);

    if (!customerInfo.ssn || !customerInfo.firstName || !customerInfo.lastName) {
      return {
        success: false,
        error: 'Missing required customer information',
      };
    }

    const creditScore = generateMockCreditScore(customerInfo.ssn);
    const creditReport = generateMockCreditReport(creditScore, customerInfo);

    return {
      success: true,
      report: creditReport,
      agency: 'Mock Credit Bureau',
      retrievedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to retrieve credit report',
      details: error.message,
    };
  }
}

/**
 * Check if credit score is available for customer
 * @param {Object} customerInfo - Customer information
 * @returns {Promise<Object>} Availability result
 */
export async function checkCreditScoreAvailability(customerInfo) {
  try {
    await simulateDelay(200, 500);

    if (!customerInfo.ssn) {
      return {
        success: false,
        available: false,
        reason: 'SSN required',
      };
    }

    // 95% availability rate
    const available = Math.random() < 0.95;

    return {
      success: true,
      available,
      reason: available ? 'Credit score available' : 'No credit history found',
    };
  } catch (error) {
    return {
      success: false,
      available: false,
      reason: error.message,
    };
  }
}

/**
 * Request credit monitoring for customer
 * @param {string} customerId - Customer ID
 * @param {Object} customerInfo - Customer information
 * @returns {Promise<Object>} Monitoring setup result
 */
export async function setupCreditMonitoring(customerId, customerInfo) {
  try {
    await simulateDelay(500, 1000);

    if (!customerId || !customerInfo.ssn) {
      return {
        success: false,
        error: 'Missing required information',
      };
    }

    return {
      success: true,
      monitoringId: `MON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      customerId,
      status: 'active',
      alertsEnabled: true,
      message: 'Credit monitoring activated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to setup credit monitoring',
      details: error.message,
    };
  }
}

/**
 * Generate mock credit score based on SSN (deterministic)
 * @param {string} ssn - Social Security Number
 * @returns {number} Credit score (300-850)
 */
function generateMockCreditScore(ssn) {
  const digits = ssn.replace(/\D/g, '');

  // Use last 4 digits to generate deterministic score
  const seed = parseInt(digits.slice(-4), 10);

  // Map to credit score range
  // This ensures same SSN always gets same score
  const scoreRange = 850 - 300; // 550 points range
  const normalizedSeed = seed / 10000; // Normalize to 0-1
  const score = Math.floor(300 + normalizedSeed * scoreRange);

  return Math.min(850, Math.max(300, score));
}

/**
 * Generate mock credit report
 * @param {number} creditScore - Credit score
 * @param {Object} customerInfo - Customer information
 * @returns {Object} Credit report
 */
function generateMockCreditReport(creditScore, customerInfo) {
  // Determine credit rating
  let rating, factors;

  if (creditScore >= 800) {
    rating = 'Excellent';
    factors = {
      positive: [
        'Long credit history',
        'No late payments',
        'Low credit utilization',
        'Mix of credit types',
      ],
      negative: [],
    };
  } else if (creditScore >= 740) {
    rating = 'Very Good';
    factors = {
      positive: ['Good payment history', 'Low debt-to-income ratio', 'Multiple credit accounts'],
      negative: ['One minor late payment in past year'],
    };
  } else if (creditScore >= 670) {
    rating = 'Good';
    factors = {
      positive: ['Consistent payment history', 'Moderate credit utilization'],
      negative: ['Limited credit history', 'Few credit accounts'],
    };
  } else if (creditScore >= 580) {
    rating = 'Fair';
    factors = {
      positive: ['Recent payments on time'],
      negative: ['High credit utilization', 'Some late payments', 'Limited credit mix'],
    };
  } else {
    rating = 'Poor';
    factors = {
      positive: [],
      negative: [
        'Multiple late payments',
        'High credit utilization',
        'Recent delinquencies',
        'Short credit history',
      ],
    };
  }

  return {
    score: creditScore,
    rating,
    factors,
    accounts: {
      total: Math.floor(Math.random() * 10) + 3,
      open: Math.floor(Math.random() * 8) + 2,
      closed: Math.floor(Math.random() * 3),
    },
    inquiries: {
      hard: Math.floor(Math.random() * 3),
      soft: Math.floor(Math.random() * 5),
    },
    paymentHistory: {
      onTime: creditScore >= 700 ? '98%' : creditScore >= 600 ? '85%' : '70%',
      late30Days: creditScore >= 700 ? 0 : Math.floor(Math.random() * 3),
      late60Days: creditScore >= 700 ? 0 : Math.floor(Math.random() * 2),
      late90Days: creditScore >= 700 ? 0 : Math.floor(Math.random() * 1),
    },
    creditUtilization: {
      overall: creditScore >= 700 ? '25%' : creditScore >= 600 ? '45%' : '75%',
      recommendation:
        creditScore >= 700
          ? 'Excellent - Keep it below 30%'
          : creditScore >= 600
            ? 'Fair - Try to reduce below 30%'
            : 'High - Should reduce significantly',
    },
    creditAge: {
      oldest: `${Math.floor(Math.random() * 15) + 5} years`,
      average: `${Math.floor(Math.random() * 8) + 3} years`,
    },
    derogatory: {
      collections: creditScore < 600 ? Math.floor(Math.random() * 2) : 0,
      publicRecords: creditScore < 550 ? Math.floor(Math.random() * 1) : 0,
      bankruptcies: 0,
    },
    recommendations:
      creditScore >= 740
        ? ['Maintain current excellent payment habits', 'Keep credit utilization low']
        : creditScore >= 670
          ? [
              'Continue making on-time payments',
              'Reduce credit utilization below 30%',
              'Avoid opening too many new accounts',
            ]
          : [
              'Focus on making all payments on time',
              'Work to reduce outstanding balances',
              'Avoid applying for new credit',
              'Consider credit counseling if needed',
            ],
  };
}

/**
 * Simulate API delay
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {Promise<void>}
 */
function simulateDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Get credit score interpretation
 * @param {number} score - Credit score
 * @returns {Object} Interpretation details
 */
export function interpretCreditScore(score) {
  if (score === null || score === undefined) {
    return {
      rating: 'Unknown',
      description: 'Credit score not available',
      color: 'gray',
      lendingTerms: 'Cannot determine lending terms',
    };
  }

  if (score >= 800) {
    return {
      rating: 'Excellent',
      description: 'Exceptional credit - Best available terms',
      color: 'green',
      lendingTerms: 'Lowest interest rates, best terms available',
      approvalLikelihood: 'Very High',
    };
  } else if (score >= 740) {
    return {
      rating: 'Very Good',
      description: 'Very good credit - Favorable terms',
      color: 'green',
      lendingTerms: 'Low interest rates, favorable terms',
      approvalLikelihood: 'High',
    };
  } else if (score >= 670) {
    return {
      rating: 'Good',
      description: 'Good credit - Competitive terms',
      color: 'blue',
      lendingTerms: 'Competitive interest rates',
      approvalLikelihood: 'Moderate to High',
    };
  } else if (score >= 580) {
    return {
      rating: 'Fair',
      description: 'Fair credit - Higher rates may apply',
      color: 'yellow',
      lendingTerms: 'Higher interest rates, may require additional documentation',
      approvalLikelihood: 'Moderate',
    };
  } else {
    return {
      rating: 'Poor',
      description: 'Poor credit - Limited options',
      color: 'red',
      lendingTerms: 'Very high interest rates, may require collateral or co-signer',
      approvalLikelihood: 'Low',
    };
  }
}

/**
 * Calculate recommended credit limit based on credit score
 * @param {number} creditScore - Credit score
 * @param {number} annualIncome - Annual income (optional)
 * @returns {Object} Recommended credit limit
 */
export function calculateRecommendedCreditLimit(creditScore, annualIncome = null) {
  if (!creditScore) {
    return {
      success: false,
      error: 'Credit score required',
    };
  }

  let baseLimit;

  if (creditScore >= 800) {
    baseLimit = 25000;
  } else if (creditScore >= 740) {
    baseLimit = 15000;
  } else if (creditScore >= 670) {
    baseLimit = 8000;
  } else if (creditScore >= 580) {
    baseLimit = 3000;
  } else {
    baseLimit = 500;
  }

  // Adjust based on income if provided
  if (annualIncome && annualIncome > 0) {
    const incomeBasedLimit = Math.floor(annualIncome * 0.1); // 10% of annual income
    baseLimit = Math.max(baseLimit, Math.min(incomeBasedLimit, 50000)); // Cap at $50k
  }

  return {
    success: true,
    recommendedLimit: baseLimit,
    minimumLimit: Math.floor(baseLimit * 0.5),
    maximumLimit: Math.floor(baseLimit * 2),
    notes:
      creditScore >= 740
        ? 'Customer qualifies for premium credit limits'
        : creditScore >= 670
          ? 'Customer qualifies for standard credit limits'
          : 'Customer may require secured credit or lower limits',
  };
}

/**
 * Export for testing
 */
export const __testing__ = {
  generateMockCreditScore,
  generateMockCreditReport,
  MOCK_CREDIT_SCORES,
};
