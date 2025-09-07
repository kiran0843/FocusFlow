const { body, param, query } = require('express-validator');

/**
 * Custom validation functions for task-related operations
 */

/**
 * Validates task title
 */
const validateTitle = () => {
  return body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .withMessage('Title contains invalid characters');
};

/**
 * Validates task description
 */
const validateDescription = () => {
  return body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()\n\r]*$/)
    .withMessage('Description contains invalid characters');
};

/**
 * Validates task date
 */
const validateTaskDate = () => {
  return body('taskDate')
    .isISO8601()
    .withMessage('Task date must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      // Allow tasks for today and future dates
      if (date < today) {
        throw new Error('Cannot create tasks for past dates');
      }
      
      // Don't allow tasks too far in the future (1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (date > oneYearFromNow) {
        throw new Error('Cannot create tasks more than 1 year in the future');
      }
      
      return true;
    });
};

/**
 * Validates task priority
 */
const validatePriority = () => {
  return body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high');
};

/**
 * Validates task category
 */
const validateCategory = () => {
  return body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Category contains invalid characters');
};

/**
 * Validates estimated time
 */
const validateEstimatedTime = () => {
  return body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage('Estimated time must be between 1 and 480 minutes (8 hours)');
};

/**
 * Validates actual time
 */
const validateActualTime = () => {
  return body('actualTime')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Actual time must be between 0 and 1440 minutes (24 hours)');
};

/**
 * Validates task tags
 */
const validateTags = () => {
  return [
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with maximum 10 items'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Tags contain invalid characters')
  ];
};

/**
 * Validates task order
 */
const validateOrder = () => {
  return body('order')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('Order must be between 0 and 2 (daily task limit)');
};

/**
 * Validates MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`);
};

/**
 * Validates date query parameters
 */
const validateDateQuery = () => {
  return [
    query('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (req.query.startDate && value) {
          const startDate = new Date(req.query.startDate);
          const endDate = new Date(value);
          
          if (startDate > endDate) {
            throw new Error('End date must be after start date');
          }
          
          // Limit date range to 1 year
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          
          if (startDate < oneYearAgo) {
            throw new Error('Date range cannot exceed 1 year');
          }
        }
        
        return true;
      })
  ];
};

/**
 * Validates completion status query
 */
const validateCompletionQuery = () => {
  return query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value');
};

/**
 * Validates priority query
 */
const validatePriorityQuery = () => {
  return query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high');
};

/**
 * Validates task reordering data
 */
const validateReordering = () => {
  return [
    body('taskDate')
      .isISO8601()
      .withMessage('Task date is required and must be valid'),
    body('taskOrders')
      .isArray({ min: 1, max: 3 })
      .withMessage('Task orders must be an array with 1-3 items'),
    body('taskOrders.*.id')
      .isMongoId()
      .withMessage('Invalid task ID'),
    body('taskOrders.*.order')
      .isInt({ min: 0, max: 2 })
      .withMessage('Order must be between 0 and 2')
  ];
};

/**
 * Validation rules for creating a task
 */
const createTaskValidation = () => {
  return [
    validateTitle(),
    validateDescription(),
    validateTaskDate(),
    validatePriority(),
    validateCategory(),
    validateEstimatedTime(),
    ...validateTags(),
    validateOrder()
  ];
};

/**
 * Validation rules for updating a task
 */
const updateTaskValidation = () => {
  return [
    validateObjectId(),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    validateDescription(),
    validatePriority(),
    validateCategory(),
    validateEstimatedTime(),
    validateActualTime(),
    ...validateTags(),
    validateOrder()
  ];
};

/**
 * Validation rules for completing a task
 */
const completeTaskValidation = () => {
  return [
    validateObjectId(),
    validateActualTime()
  ];
};

/**
 * Validation rules for getting tasks
 */
const getTasksValidation = () => {
  return [
    ...validateDateQuery(),
    validateCompletionQuery(),
    validatePriorityQuery()
  ];
};

/**
 * Validation rules for task statistics
 */
const getStatsValidation = () => {
  return [
    query('startDate')
      .isISO8601()
      .withMessage('Start date is required and must be valid'),
    query('endDate')
      .isISO8601()
      .withMessage('End date is required and must be valid')
      .custom((value, { req }) => {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        
        if (startDate > endDate) {
          throw new Error('End date must be after start date');
        }
        
        return true;
      })
  ];
};

module.exports = {
  // Individual validators
  validateTitle,
  validateDescription,
  validateTaskDate,
  validatePriority,
  validateCategory,
  validateEstimatedTime,
  validateActualTime,
  validateTags,
  validateOrder,
  validateObjectId,
  validateDateQuery,
  validateCompletionQuery,
  validatePriorityQuery,
  validateReordering,
  
  // Validation rule sets
  createTaskValidation,
  updateTaskValidation,
  completeTaskValidation,
  getTasksValidation,
  getStatsValidation
};

