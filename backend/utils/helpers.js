/**
 * Utility helper functions for FocusFlow backend
 */

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  };

  return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(date);
};

/**
 * Calculate time difference in minutes
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {number} - Difference in minutes
 */
const getTimeDifferenceInMinutes = (startTime, endTime) => {
  return Math.floor((endTime - startTime) / (1000 * 60));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (password.length >= 6) {
    result.score += 1;
  } else {
    result.feedback.push('Password must be at least 6 characters long');
  }

  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password must contain at least one lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password must contain at least one uppercase letter');
  }

  if (/\d/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Password must contain at least one number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1;
  }

  result.isValid = result.score >= 4;
  return result;
};

/**
 * Calculate XP for next level
 * @param {number} currentXP - Current XP amount
 * @returns {number} - XP needed for next level
 */
const getXPForNextLevel = (currentXP) => {
  const currentLevel = Math.floor(currentXP / 100) + 1;
  const nextLevelXP = currentLevel * 100;
  return nextLevelXP - currentXP;
};

/**
 * Calculate level progress percentage
 * @param {number} currentXP - Current XP amount
 * @returns {number} - Progress percentage (0-100)
 */
const getLevelProgress = (currentXP) => {
  const currentLevel = Math.floor(currentXP / 100) + 1;
  const currentLevelXP = (currentLevel - 1) * 100;
  const nextLevelXP = currentLevel * 100;
  const progressXP = currentXP - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;
  
  return Math.min(100, Math.max(0, (progressXP / totalXPNeeded) * 100));
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} - Pagination metadata
 */
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Generate success response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
const successResponse = (data = null, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

/**
 * Generate error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Additional error details
 * @returns {Object} - Formatted error response
 */
const errorResponse = (message = 'Error', statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    errors,
    statusCode
  };
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getDate() === checkDate.getDate() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getFullYear() === checkDate.getFullYear();
};

/**
 * Get start and end of day for a given date
 * @param {Date} date - Date to get boundaries for
 * @returns {Object} - Object with startOfDay and endOfDay
 */
const getDayBoundaries = (date) => {
  const targetDate = new Date(date);
  
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

/**
 * Calculate streak days
 * @param {Array} dates - Array of dates
 * @returns {number} - Current streak
 */
const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(date => new Date(date))
    .sort((a, b) => b - a); // Sort descending
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculate XP rewards for different activities
 * @param {string} activity - Type of activity
 * @param {Object} options - Additional options
 * @returns {number} - XP amount to award
 */
const calculateXPReward = (activity, options = {}) => {
  const XP_REWARDS = {
    COMPLETED_POMODORO: 25,
    COMPLETED_TASK: 10,
    DAILY_STREAK: 50,
    WEEKLY_GOAL: 100,
    BREAK_SESSION: 5,
    LONG_BREAK: 10
  };

  switch (activity) {
    case 'pomodoro':
      return XP_REWARDS.COMPLETED_POMODORO;
    case 'task':
      return XP_REWARDS.COMPLETED_TASK;
    case 'streak':
      return XP_REWARDS.DAILY_STREAK;
    case 'weekly_goal':
      return XP_REWARDS.WEEKLY_GOAL;
    case 'break':
      return options.isLongBreak ? XP_REWARDS.LONG_BREAK : XP_REWARDS.BREAK_SESSION;
    default:
      return 0;
  }
};

/**
 * Calculate session duration in minutes
 * @param {Date} startTime - Session start time
 * @param {Date} endTime - Session end time
 * @returns {number} - Duration in minutes
 */
const calculateSessionDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  return Math.round((endTime - startTime) / (1000 * 60));
};

/**
 * Check if session was completed on time
 * @param {number} plannedDuration - Planned duration in minutes
 * @param {number} actualDuration - Actual duration in minutes
 * @param {number} tolerance - Tolerance percentage (default 10%)
 * @returns {boolean} - True if completed on time
 */
const isSessionOnTime = (plannedDuration, actualDuration, tolerance = 0.1) => {
  const minDuration = plannedDuration * (1 - tolerance);
  return actualDuration >= minDuration;
};

/**
 * Format session duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
const formatSessionDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get session type display name
 * @param {string} sessionType - Session type
 * @returns {string} - Display name
 */
const getSessionTypeDisplayName = (sessionType) => {
  const displayNames = {
    work: 'Work Session',
    short_break: 'Short Break',
    long_break: 'Long Break'
  };
  
  return displayNames[sessionType] || sessionType;
};

/**
 * Calculate focus score based on session data
 * @param {Object} sessionData - Session data
 * @returns {number} - Focus score (0-100)
 */
const calculateFocusScore = (sessionData) => {
  const { duration, distractions, completed, rating } = sessionData;
  
  if (!completed) return 0;
  
  let score = 50; // Base score
  
  // Adjust based on distractions
  const distractionPenalty = Math.min(distractions.length * 5, 30);
  score -= distractionPenalty;
  
  // Adjust based on rating
  if (rating) {
    score += (rating - 3) * 10; // -20 to +20 based on rating
  }
  
  // Bonus for longer sessions
  if (duration >= 25) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

module.exports = {
  generateRandomString,
  formatDate,
  getTimeDifferenceInMinutes,
  isValidEmail,
  validatePasswordStrength,
  getXPForNextLevel,
  getLevelProgress,
  generatePagination,
  sanitizeInput,
  successResponse,
  errorResponse,
  isToday,
  getDayBoundaries,
  calculateStreak,
  calculateXPReward,
  calculateSessionDuration,
  isSessionOnTime,
  formatSessionDuration,
  getSessionTypeDisplayName,
  calculateFocusScore
};
