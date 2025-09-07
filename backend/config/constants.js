/**
 * Application constants and configuration
 */

// XP and Level Configuration
const XP_REWARDS = {
  COMPLETED_POMODORO: 25,
  COMPLETED_TASK: 10,
  DAILY_STREAK: 50,
  WEEKLY_GOAL: 100,
  LEVEL_UP_BONUS: 100
};

const LEVEL_CONFIG = {
  XP_PER_LEVEL: 100,
  MAX_LEVEL: 100
};

// Pomodoro Configuration
const POMODORO_CONFIG = {
  WORK_DURATION: 25, // minutes
  SHORT_BREAK: 5, // minutes
  LONG_BREAK: 15, // minutes
  SESSIONS_PER_LONG_BREAK: 4
};

// Task Configuration
const TASK_CONFIG = {
  MAX_DAILY_TASKS: 3,
  MAX_TASK_LENGTH: 100,
  PRIORITY_LEVELS: ['low', 'medium', 'high']
};

// Validation Rules
const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    MESSAGE: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Name must be between 2 and 50 characters'
  }
};

// File Upload Configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_PATH: 'uploads/'
};

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5 // limit auth endpoints to 5 requests per windowMs
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d'
};

// Database Configuration
const DB_CONFIG = {
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  SOCKET_TIMEOUT: 45000, // 45 seconds
  MAX_POOL_SIZE: 10,
  MIN_POOL_SIZE: 5
};

// Error Messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  TASK_LIMIT_REACHED: 'Daily task limit reached.',
  SESSION_ALREADY_ACTIVE: 'You already have an active session.',
  INVALID_SESSION_STATE: 'Invalid session state for this operation.'
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully',
  PROFILE_UPDATE: 'Profile updated successfully',
  PASSWORD_CHANGE: 'Password changed successfully',
  TASK_CREATE: 'Task created successfully',
  TASK_UPDATE: 'Task updated successfully',
  TASK_DELETE: 'Task deleted successfully',
  TASK_COMPLETE: 'Task completed successfully',
  POMODORO_START: 'Pomodoro session started',
  POMODORO_PAUSE: 'Pomodoro session paused',
  POMODORO_RESUME: 'Pomodoro session resumed',
  POMODORO_COMPLETE: 'Great work! Pomodoro session completed',
  POMODORO_CANCEL: 'Pomodoro session cancelled'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Environment Configuration
const ENV_CONFIG = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

module.exports = {
  XP_REWARDS,
  LEVEL_CONFIG,
  POMODORO_CONFIG,
  TASK_CONFIG,
  VALIDATION_RULES,
  UPLOAD_CONFIG,
  RATE_LIMIT_CONFIG,
  JWT_CONFIG,
  DB_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  ENV_CONFIG
};
