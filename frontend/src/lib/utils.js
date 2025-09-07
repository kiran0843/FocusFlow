import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * @param {...string} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date))
}

/**
 * Format time duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Calculate XP needed for next level
 * @param {number} currentXP - Current XP amount
 * @returns {number} - XP needed for next level
 */
export function getXPForNextLevel(currentXP) {
  const currentLevel = Math.floor(currentXP / 100) + 1
  const nextLevelXP = currentLevel * 100
  return nextLevelXP - currentXP
}

/**
 * Calculate level progress percentage
 * @param {number} currentXP - Current XP amount
 * @returns {number} - Progress percentage (0-100)
 */
export function getLevelProgress(currentXP) {
  const currentLevel = Math.floor(currentXP / 100) + 1
  const currentLevelXP = (currentLevel - 1) * 100
  const nextLevelXP = currentLevel * 100
  const progressXP = currentXP - currentLevelXP
  const totalXPNeeded = nextLevelXP - currentLevelXP
  
  return Math.min(100, Math.max(0, (progressXP / totalXPNeeded) * 100))
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID string
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export function validatePassword(password) {
  const result = {
    score: 0,
    feedback: [],
    isValid: false
  }
  
  if (password.length >= 6) {
    result.score += 1
  } else {
    result.feedback.push('Password must be at least 6 characters long')
  }
  
  if (/[a-z]/.test(password)) {
    result.score += 1
  } else {
    result.feedback.push('Password must contain at least one lowercase letter')
  }
  
  if (/[A-Z]/.test(password)) {
    result.score += 1
  } else {
    result.feedback.push('Password must contain at least one uppercase letter')
  }
  
  if (/\d/.test(password)) {
    result.score += 1
  } else {
    result.feedback.push('Password must contain at least one number')
  }
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1
  }
  
  result.isValid = result.score >= 4
  
  return result
}

/**
 * Get theme from localStorage or system preference
 * @returns {string} - Theme preference ('light' or 'dark')
 */
export function getInitialTheme() {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('focusflow-theme')
    if (savedTheme) {
      return savedTheme
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  return 'light'
}

/**
 * Save theme to localStorage
 * @param {string} theme - Theme to save
 */
export function saveTheme(theme) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('focusflow-theme', theme)
  }
}
