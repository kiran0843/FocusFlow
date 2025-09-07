const express = require('express');
const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateDailyTaskLimit,
  validateTaskOwnership,
  validateTaskDate,
  validateTaskCompletion,
  validateTaskReordering,
  validateStatsDateRange
} = require('../middleware/taskValidation');
const {
  createTaskValidation,
  updateTaskValidation,
  completeTaskValidation,
  getTasksValidation,
  getStatsValidation
} = require('../utils/taskValidators');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/tasks
 * @desc    Get tasks for a specific date or date range
 * @access  Private
 */
router.get('/', getTasksValidation(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { date, startDate, endDate, completed, priority } = req.query;
  const userId = req.user._id;

  let query = { userId };

  // Filter by date (match only YYYY-MM-DD part)
  if (date) {
    query.$expr = {
      $eq: [
        { $dateToString: { format: "%Y-%m-%d", date: "$taskDate" } },
        date
      ]
    };
  } else if (startDate && endDate) {
    query.taskDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Filter by completion status
  if (completed !== undefined) {
    query.completed = completed === 'true';
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  const tasks = await Task.find(query)
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.json({
    success: true,
    data: { tasks },
    count: tasks.length
  });
}));

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for a date range
 * @access  Private
 */
router.get('/stats', validateStatsDateRange, getStatsValidation(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { startDate, endDate } = req.query;
  const userId = req.user._id;

  const stats = await Task.getTaskStats(
    userId,
    new Date(startDate),
    new Date(endDate)
  );

  res.json({
    success: true,
    data: { stats: stats[0] || {} }
  });
}));

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validateTaskDate, validateDailyTaskLimit, createTaskValidation(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.user._id;
  const { taskDate, ...taskData } = req.body;

  // Create task (daily limit already validated by middleware)
  const task = new Task({
    ...taskData,
    userId,
    taskDate: new Date(taskDate),
    order: req.taskCount // Set order based on current count from middleware
  });

  await task.save();

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
}));

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task
 * @access  Private
 */
router.get('/:id', validateTaskOwnership, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { task: req.task }
  });
}));

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', validateTaskOwnership, updateTaskValidation(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Update task (ownership already validated by middleware)
  Object.assign(req.task, req.body);
  await req.task.save();

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task: req.task }
  });
}));

/**
 * @route   PATCH /api/tasks/:id/complete
 * @desc    Mark a task as completed
 * @access  Private
 */
router.patch('/:id/complete', validateTaskOwnership, validateTaskCompletion, completeTaskValidation(), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const result = req.task.completeTask(req.body.actualTime);
  await req.task.save();

  // Award XP to user
  const user = req.user;
  const xpResult = user.addXP(result.xpAwarded);
  await user.save();

  res.json({
    success: true,
    message: 'Task completed successfully',
    data: {
      task: req.task,
      xpResult
    }
  });
}));

/**
 * @route   PATCH /api/tasks/:id/uncomplete
 * @desc    Mark a task as not completed
 * @access  Private
 */
router.patch('/:id/uncomplete', validateTaskOwnership, validateTaskCompletion, asyncHandler(async (req, res) => {
  req.task.completed = false;
  req.task.completedAt = null;
  await req.task.save();

  res.json({
    success: true,
    message: 'Task marked as incomplete',
    data: { task: req.task }
  });
}));

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', validateTaskOwnership, asyncHandler(async (req, res) => {
  await Task.findByIdAndDelete(req.task._id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

/**
 * @route   PATCH /api/tasks/reorder
 * @desc    Reorder tasks for a specific date
 * @access  Private
 */
router.patch('/reorder', validateTaskReordering, asyncHandler(async (req, res) => {
  const { taskDate, taskOrders } = req.body;
  const userId = req.user._id;

  // Update task orders
  const updatePromises = taskOrders.map(({ id, order }) =>
    Task.findOneAndUpdate(
      { _id: id, userId },
      { order },
      { new: true }
    )
  );

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Tasks reordered successfully'
  });
}));

module.exports = router;
