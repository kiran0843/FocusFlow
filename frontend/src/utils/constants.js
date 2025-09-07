// API Configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    UPDATE: '/tasks',
    DELETE: '/tasks'
  },
  POMODORO: {
    SESSIONS: '/pomodoro/sessions',
    START: '/pomodoro/start',
    PAUSE: '/pomodoro/pause',
    COMPLETE: '/pomodoro/complete'
  }
}

// App Configuration
export const APP_CONFIG = {
  NAME: 'FocusFlow',
  VERSION: '1.0.0',
  DESCRIPTION: 'Gamified Productivity App',
  AUTHOR: 'FocusFlow Team'
}

// XP and Level Configuration
export const XP_REWARDS = {
  COMPLETED_POMODORO: 25,
  COMPLETED_TASK: 10,
  DAILY_STREAK: 50,
  WEEKLY_GOAL: 100,
  LEVEL_UP_BONUS: 100,
  BREAK_SESSION: 5,
  LONG_BREAK: 10
}

export const LEVEL_CONFIG = {
  XP_PER_LEVEL: 100,
  MAX_LEVEL: 100
}

// Pomodoro Configuration
export const POMODORO_CONFIG = {
  WORK_DURATION: 25, // minutes
  SHORT_BREAK: 5, // minutes
  LONG_BREAK: 15, // minutes
  SESSIONS_PER_LONG_BREAK: 4
}

// Task Configuration
export const TASK_CONFIG = {
  MAX_DAILY_TASKS: 3,
  MAX_TASK_LENGTH: 100,
  PRIORITY_LEVELS: ['low', 'medium', 'high']
}

// Theme Configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'focusflow-theme',
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark']
}

// Form Validation
export const VALIDATION_RULES = {
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
}

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
}

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right',
  STYLE: {
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }
}

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'focusflow-token',
  THEME: 'focusflow-theme',
  USER_PREFERENCES: 'focusflow-preferences',
  TASKS: 'focusflow-tasks',
  POMODORO_SESSIONS: 'focusflow-pomodoro-sessions'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully',
  PROFILE_UPDATE: 'Profile updated successfully',
  PASSWORD_CHANGE: 'Password changed successfully',
  TASK_CREATE: 'Task created successfully',
  TASK_UPDATE: 'Task updated successfully',
  TASK_DELETE: 'Task deleted successfully',
  POMODORO_COMPLETE: 'Great work! Pomodoro session completed'
}
