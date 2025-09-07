const express = require('express');
const { query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const PomodoroSession = require('../models/PomodoroSession');
const Distraction = require('../models/Distraction');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getDayBoundaries, calculateStreak } = require('../utils/helpers');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics for a date range
 * @access  Private
 */
router.get('/dashboard', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no date range provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get task statistics
    let taskStats, pomodoroStats, distractionStats, user;
    try {
      taskStats = await Task.getTaskStats(userId, start, end);
    } catch (err) {
      console.error('Task.getTaskStats error:', err);
      throw new Error('Task stats error: ' + err.message);
    }
    try {
      pomodoroStats = await PomodoroSession.getSessionStats(userId, start, end);
    } catch (err) {
      console.error('PomodoroSession.getSessionStats error:', err);
      throw new Error('Pomodoro stats error: ' + err.message);
    }
    try {
      distractionStats = await Distraction.getDistractionStats(userId, start, end);
    } catch (err) {
      console.error('Distraction.getDistractionStats error:', err);
      throw new Error('Distraction stats error: ' + err.message);
    }
    try {
      user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    } catch (err) {
      console.error('User.findById error:', err);
      throw new Error('User fetch error: ' + err.message);
    }

    // Calculate productivity score (0-100)
    const taskCompletionRate = taskStats[0]?.completionRate || 0;
    const pomodoroCompletionRate = pomodoroStats[0]?.completionRate || 0;
    const distractionImpact = Math.max(0, 100 - (distractionStats.averageImpact * 20)); // Convert impact to score
    const productivityScore = Math.round((taskCompletionRate + pomodoroCompletionRate + distractionImpact) / 3);

    res.json({
      success: true,
      data: {
        user: {
          level: user.level,
          xp: user.xp,
          xpForNextLevel: user.xpForNextLevel,
          levelProgress: user.levelProgress
        },
        taskStats: taskStats[0] || {},
        pomodoroStats: pomodoroStats[0] || {},
        distractionStats,
        productivityScore,
        dateRange: { start, end }
      }
    });
  } catch (err) {
    console.error('Dashboard analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}));

/**
 * @route   GET /api/analytics/tasks
 * @desc    Get detailed task analytics
 * @access  Private
 */
router.get('/tasks', [
  query('startDate').isISO8601().withMessage('Start date is required and must be valid'),
  query('endDate').isISO8601().withMessage('End date is required and must be valid'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.user._id;
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get tasks grouped by date
  const tasksByDate = await Task.aggregate([
    {
      $match: {
        userId: userId,
        taskDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'day' ? '%Y-%m-%d' : 
                   groupBy === 'week' ? '%Y-%U' : '%Y-%m',
            date: '$taskDate'
          }
        },
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: ['$completed', 1, 0] } },
        totalEstimatedTime: { $sum: '$estimatedTime' },
        totalActualTime: { $sum: '$actualTime' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get tasks by priority
  const tasksByPriority = await Task.aggregate([
    {
      $match: {
        userId: userId,
        taskDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } }
      }
    }
  ]);

  // Get tasks by category
  const tasksByCategory = await Task.aggregate([
    {
      $match: {
        userId: userId,
        taskDate: { $gte: start, $lte: end },
        category: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.json({
    success: true,
    data: {
      tasksByDate,
      tasksByPriority,
      tasksByCategory,
      dateRange: { start, end }
    }
  });
}));

/**
 * @route   GET /api/analytics/pomodoro
 * @desc    Get detailed pomodoro analytics
 * @access  Private
 */
router.get('/pomodoro', [
  query('startDate').isISO8601().withMessage('Start date is required and must be valid'),
  query('endDate').isISO8601().withMessage('End date is required and must be valid'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.user._id;
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get sessions by date
  const sessionsByDate = await PomodoroSession.aggregate([
    {
      $match: {
        userId: userId,
        sessionDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'day' ? '%Y-%m-%d' : 
                   groupBy === 'week' ? '%Y-%U' : '%Y-%m',
            date: '$sessionDate'
          }
        },
        totalSessions: { $sum: 1 },
        completedSessions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        workSessions: { $sum: { $cond: [{ $eq: ['$sessionType', 'work'] }, 1, 0] } },
        breakSessions: { $sum: { $cond: [{ $in: ['$sessionType', ['short_break', 'long_break']] }, 1, 0] } },
        totalWorkTime: { $sum: { $cond: [{ $eq: ['$sessionType', 'work'] }, '$actualDuration', 0] } },
        totalBreakTime: { $sum: { $cond: [{ $in: ['$sessionType', ['short_break', 'long_break']] }, '$actualDuration', 0] } },
        totalXP: { $sum: '$xpAwarded' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get sessions by type
  const sessionsByType = await PomodoroSession.aggregate([
    {
      $match: {
        userId: userId,
        sessionDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$sessionType',
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalTime: { $sum: '$actualDuration' },
        averageTime: { $avg: '$actualDuration' }
      }
    }
  ]);

  // Get distraction statistics
  const distractionStats = await PomodoroSession.aggregate([
    {
      $match: {
        userId: userId,
        sessionDate: { $gte: start, $lte: end },
        distractions: { $exists: true, $ne: [] }
      }
    },
    {
      $unwind: '$distractions'
    },
    {
      $group: {
        _id: '$distractions.type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      sessionsByDate,
      sessionsByType,
      distractionStats,
      dateRange: { start, end }
    }
  });
}));

/**
 * @route   GET /api/analytics/streaks
 * @desc    Get user streaks and achievements
 * @access  Private
 */
router.get('/streaks', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get task completion dates
  const taskDates = await Task.find({
    userId,
    completed: true
  }).select('completedAt').lean();

  // Get pomodoro completion dates
  const pomodoroDates = await PomodoroSession.find({
    userId,
    status: 'completed',
    sessionType: 'work'
  }).select('endTime').lean();

  // Calculate streaks
  const taskCompletionDates = taskDates.map(task => task.completedAt);
  const pomodoroCompletionDates = pomodoroDates.map(session => session.endTime);

  const taskStreak = calculateStreak(taskCompletionDates);
  const pomodoroStreak = calculateStreak(pomodoroCompletionDates);

  // Get total statistics
  const totalTasks = await Task.countDocuments({ userId });
  const totalCompletedTasks = await Task.countDocuments({ userId, completed: true });
  const totalPomodoroSessions = await PomodoroSession.countDocuments({ userId, sessionType: 'work' });
  const totalCompletedPomodoroSessions = await PomodoroSession.countDocuments({ 
    userId, 
    sessionType: 'work', 
    status: 'completed' 
  });

  res.json({
    success: true,
    data: {
      streaks: {
        taskStreak,
        pomodoroStreak
      },
      totals: {
        totalTasks,
        totalCompletedTasks,
        totalPomodoroSessions,
        totalCompletedPomodoroSessions
      }
    }
  });
}));

/**
 * @route   GET /api/analytics/distractions
 * @desc    Get detailed distraction analytics
 * @access  Private
 */
router.get('/distractions', [
  query('startDate').isISO8601().withMessage('Start date is required and must be valid'),
  query('endDate').isISO8601().withMessage('End date is required and must be valid'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.user._id;
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get distractions by date
  const distractionsByDate = await Distraction.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'day' ? '%Y-%m-%d' : 
                   groupBy === 'week' ? '%Y-%U' : '%Y-%m',
            date: '$timestamp'
          }
        },
        totalDistractions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageSeverity: { $avg: '$severity' },
        averageImpact: { $avg: '$impact' },
        resolvedCount: { $sum: { $cond: ['$resolved', 1, 0] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get distractions by type
  const distractionsByType = await Distraction.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageSeverity: { $avg: '$severity' },
        averageImpact: { $avg: '$impact' },
        resolvedCount: { $sum: { $cond: ['$resolved', 1, 0] } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get distractions by context
  const distractionsByContext = await Distraction.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$context',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageSeverity: { $avg: '$severity' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get distractions by source
  const distractionsBySource = await Distraction.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageSeverity: { $avg: '$severity' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get hourly patterns
  const hourlyPatterns = await Distraction.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $hour: '$timestamp' },
        count: { $sum: 1 },
        averageSeverity: { $avg: '$severity' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get resolution methods
  const resolutionMethods = await Distraction.aggregate([
    {
      $match: {
        userId: userId,
        timestamp: { $gte: start, $lte: end },
        resolved: true
      }
    },
    {
      $group: {
        _id: '$resolutionMethod',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      distractionsByDate,
      distractionsByType,
      distractionsByContext,
      distractionsBySource,
      hourlyPatterns,
      resolutionMethods,
      dateRange: { start, end }
    }
  });
}));

/**
 * @route   GET /api/analytics/leaderboard
 * @desc    Get user leaderboard
 * @access  Private
 */
router.get('/leaderboard', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { limit = 10 } = req.query;

  const leaderboard = await User.getLeaderboard(parseInt(limit));

  res.json({
    success: true,
    data: { leaderboard }
  });
}));

module.exports = router;
