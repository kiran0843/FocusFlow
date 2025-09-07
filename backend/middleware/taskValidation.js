const Task = require('../models/Task');
const { asyncHandler } = require('./errorHandler');

/**
 * Middleware to validate daily task limit
 * Ensures users cannot exceed 3 tasks per day
 */
const validateDailyTaskLimit = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { taskDate } = req.body;
  
  if (!taskDate) {
    return res.status(400).json({
      success: false,
      message: 'Task date is required'
    });
  }

  // Get user preferences for daily limit (default 3)
  const userPreferences = req.user.preferences;
  const dailyLimit = userPreferences?.dailyTaskLimit || 3;

  // Check current task count for the day
  const taskCount = await Task.getDailyTaskCount(userId, new Date(taskDate));

  if (taskCount >= dailyLimit) {
    return res.status(400).json({
      success: false,
      message: `Daily task limit of ${dailyLimit} reached for this date`,
      data: {
        currentCount: taskCount,
        dailyLimit,
        taskDate
      }
    });
  }

  // Add task count info to request for use in route handlers
  req.taskCount = taskCount;
  req.dailyLimit = dailyLimit;
  
  next();
});

/**
 * Middleware to validate task ownership
 * Ensures users can only access their own tasks
 */
const validateTaskOwnership = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user._id;

  const task = await Task.findOne({
    _id: taskId,
    userId
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found or access denied'
    });
  }

  // Add task to request for use in route handlers
  req.task = task;
  next();
});

/**
 * Middleware to validate task date is not in the past
 * Prevents creating tasks for past dates
 */
const validateTaskDate = asyncHandler(async (req, res, next) => {
  const { taskDate } = req.body;
  
  if (!taskDate) {
    return next(); // Let other validators handle missing date
  }

  const targetDate = new Date(taskDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  // Allow tasks for today and future dates
  if (targetDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Cannot create tasks for past dates',
      data: {
        taskDate,
        today: today.toISOString().split('T')[0]
      }
    });
  }

  next();
});

/**
 * Middleware to validate task completion status
 * Prevents completing already completed tasks
 */
const validateTaskCompletion = asyncHandler(async (req, res, next) => {
  const task = req.task; // From validateTaskOwnership middleware
  
  if (!task) {
    return res.status(400).json({
      success: false,
      message: 'Task not found'
    });
  }

  const action = req.route.path.includes('complete') ? 'complete' : 'uncomplete';
  
  if (action === 'complete' && task.completed) {
    return res.status(400).json({
      success: false,
      message: 'Task is already completed'
    });
  }

  if (action === 'uncomplete' && !task.completed) {
    return res.status(400).json({
      success: false,
      message: 'Task is not completed'
    });
  }

  next();
});

/**
 * Middleware to validate task reordering
 * Ensures all tasks belong to the user and date
 */
const validateTaskReordering = asyncHandler(async (req, res, next) => {
  const { taskDate, taskOrders } = req.body;
  const userId = req.user._id;

  if (!taskOrders || !Array.isArray(taskOrders)) {
    return res.status(400).json({
      success: false,
      message: 'Task orders must be an array'
    });
  }

  // Validate all task IDs belong to the user and date
  const taskIds = taskOrders.map(order => order.id);
  const tasks = await Task.find({
    _id: { $in: taskIds },
    userId,
    taskDate: new Date(taskDate)
  });

  if (tasks.length !== taskIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Some tasks not found or access denied'
    });
  }

  // Validate order values are unique
  const orders = taskOrders.map(order => order.order);
  const uniqueOrders = [...new Set(orders)];
  
  if (orders.length !== uniqueOrders.length) {
    return res.status(400).json({
      success: false,
      message: 'Task orders must be unique'
    });
  }

  next();
});

/**
 * Middleware to validate task statistics date range
 * Ensures date range is reasonable
 */
const validateStatsDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required'
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return res.status(400).json({
      success: false,
      message: 'Start date must be before end date'
    });
  }

  // Limit date range to 1 year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (start < oneYearAgo) {
    return res.status(400).json({
      success: false,
      message: 'Date range cannot exceed 1 year'
    });
  }

  next();
});

module.exports = {
  validateDailyTaskLimit,
  validateTaskOwnership,
  validateTaskDate,
  validateTaskCompletion,
  validateTaskReordering,
  validateStatsDateRange
};

