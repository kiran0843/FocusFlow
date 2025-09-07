const Task = require('../models/Task');
const User = require('../models/User');

/**
 * Utility functions for task operations
 */

/**
 * Get tasks for a specific date with additional metadata
 * @param {string} userId - User ID
 * @param {Date} date - Date to get tasks for
 * @returns {Promise<Object>} - Tasks with metadata
 */
const getTasksForDateWithMetadata = async (userId, date) => {
  const tasks = await Task.getTasksForDate(userId, date);
  const taskCount = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const completionRate = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
  
  return {
    tasks,
    metadata: {
      totalTasks: taskCount,
      completedTasks: completedCount,
      pendingTasks: taskCount - completedCount,
      completionRate: Math.round(completionRate * 100) / 100,
      date: date.toISOString().split('T')[0]
    }
  };
};

/**
 * Get tasks for a date range with statistics
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Tasks with statistics
 */
const getTasksForDateRange = async (userId, startDate, endDate) => {
  const tasks = await Task.find({
    userId,
    taskDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ taskDate: -1, order: 1 });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Group by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.taskDate.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Calculate daily statistics
  const dailyStats = Object.entries(tasksByDate).map(([date, dateTasks]) => {
    const completed = dateTasks.filter(task => task.completed).length;
    return {
      date,
      totalTasks: dateTasks.length,
      completedTasks: completed,
      completionRate: dateTasks.length > 0 ? (completed / dateTasks.length) * 100 : 0
    };
  });

  return {
    tasks,
    statistics: {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTasksPerDay: totalTasks / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))),
      dailyStats
    }
  };
};

/**
 * Create a task with automatic ordering
 * @param {Object} taskData - Task data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Created task
 */
const createTaskWithOrdering = async (taskData, userId) => {
  const { taskDate, ...otherData } = taskData;
  
  // Get current task count for ordering
  const taskCount = await Task.getDailyTaskCount(userId, new Date(taskDate));
  
  const task = new Task({
    ...otherData,
    userId,
    taskDate: new Date(taskDate),
    order: taskCount
  });

  await task.save();
  return task;
};

/**
 * Reorder tasks for a specific date
 * @param {string} userId - User ID
 * @param {Date} taskDate - Date to reorder tasks for
 * @param {Array} taskOrders - Array of {id, order} objects
 * @returns {Promise<Array>} - Updated tasks
 */
const reorderTasks = async (userId, taskDate, taskOrders) => {
  const updatePromises = taskOrders.map(({ id, order }) =>
    Task.findOneAndUpdate(
      { _id: id, userId, taskDate: new Date(taskDate) },
      { order },
      { new: true }
    )
  );

  const updatedTasks = await Promise.all(updatePromises);
  return updatedTasks.filter(task => task !== null);
};

/**
 * Complete a task and award XP
 * @param {string} taskId - Task ID
 * @param {string} userId - User ID
 * @param {number} actualTime - Actual time spent (optional)
 * @returns {Promise<Object>} - Completion result
 */
const completeTaskWithXP = async (taskId, userId, actualTime = null) => {
  const task = await Task.findOne({ _id: taskId, userId });
  
  if (!task) {
    throw new Error('Task not found');
  }

  if (task.completed) {
    throw new Error('Task is already completed');
  }

  // Complete the task
  const completionResult = task.completeTask(actualTime);
  await task.save();

  // Award XP to user
  const user = await User.findById(userId);
  if (user) {
    const xpResult = user.addXP(completionResult.xpAwarded);
    await user.save();
    
    return {
      task,
      xpResult,
      completionResult
    };
  }

  return {
    task,
    completionResult
  };
};

/**
 * Get task statistics for analytics
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Detailed statistics
 */
const getTaskAnalytics = async (userId, startDate, endDate) => {
  const stats = await Task.getTaskStats(userId, startDate, endDate);
  const basicStats = stats[0] || {};

  // Get additional analytics
  const tasks = await Task.find({
    userId,
    taskDate: { $gte: startDate, $lte: endDate }
  });

  // Priority distribution
  const priorityStats = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  // Category distribution
  const categoryStats = tasks.reduce((acc, task) => {
    const category = task.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Completion time analysis
  const completedTasks = tasks.filter(task => task.completed && task.actualTime > 0);
  const completionTimes = completedTasks.map(task => task.actualTime);
  const averageCompletionTime = completionTimes.length > 0 
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
    : 0;

  // Daily completion streak
  const dailyCompletions = tasks.reduce((acc, task) => {
    if (task.completed) {
      const date = task.taskDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    ...basicStats,
    priorityDistribution: priorityStats,
    categoryDistribution: categoryStats,
    averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
    dailyCompletions,
    totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
    activeDays: Object.keys(dailyCompletions).length
  };
};

/**
 * Get overdue tasks for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Overdue tasks
 */
const getOverdueTasks = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await Task.find({
    userId,
    taskDate: { $lt: today },
    completed: false
  }).sort({ taskDate: 1 });
};

/**
 * Get upcoming tasks for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look ahead (default 7)
 * @returns {Promise<Array>} - Upcoming tasks
 */
const getUpcomingTasks = async (userId, days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setHours(23, 59, 59, 999);

  return await Task.find({
    userId,
    taskDate: { $gte: today, $lte: futureDate },
    completed: false
  }).sort({ taskDate: 1, order: 1 });
};

/**
 * Get task completion streak
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Streak information
 */
const getTaskCompletionStreak = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all completed tasks
  const completedTasks = await Task.find({
    userId,
    completed: true
  }).sort({ taskDate: -1 });

  if (completedTasks.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  for (const task of completedTasks) {
    const taskDate = new Date(task.taskDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === checkDate.getTime()) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (taskDate < checkDate) {
      break;
    }
  }

  // Calculate longest streak
  const dailyCompletions = completedTasks.reduce((acc, task) => {
    const date = task.taskDate.toISOString().split('T')[0];
    acc[date] = true;
    return acc;
  }, {});

  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = Object.keys(dailyCompletions).sort();
  
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 || sortedDates[i] === getNextDay(sortedDates[i - 1])) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: completedTasks[0]?.taskDate || null
  };
};

/**
 * Helper function to get next day
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Next day in YYYY-MM-DD format
 */
const getNextDay = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

/**
 * Validate task data before creation
 * @param {Object} taskData - Task data to validate
 * @returns {Object} - Validation result
 */
const validateTaskData = (taskData) => {
  const errors = [];

  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (taskData.title && taskData.title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  if (taskData.description && taskData.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  if (!taskData.taskDate) {
    errors.push('Task date is required');
  } else {
    const date = new Date(taskData.taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) {
      errors.push('Cannot create tasks for past dates');
    }
  }

  if (taskData.priority && !['low', 'medium', 'high'].includes(taskData.priority)) {
    errors.push('Priority must be low, medium, or high');
  }

  if (taskData.estimatedTime && (taskData.estimatedTime < 1 || taskData.estimatedTime > 480)) {
    errors.push('Estimated time must be between 1 and 480 minutes');
  }

  if (taskData.tags && (!Array.isArray(taskData.tags) || taskData.tags.length > 10)) {
    errors.push('Tags must be an array with maximum 10 items');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  getTasksForDateWithMetadata,
  getTasksForDateRange,
  createTaskWithOrdering,
  reorderTasks,
  completeTaskWithXP,
  getTaskAnalytics,
  getOverdueTasks,
  getUpcomingTasks,
  getTaskCompletionStreak,
  validateTaskData
};

