const express = require('express');
const { body, validationResult } = require('express-validator');
const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/pomodoro/start
 * @desc    Start a new Pomodoro session
 * @access  Private
 */
router.post('/start', [
  body('duration')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 minutes'),
  
  body('sessionType')
    .optional()
    .isIn(['work', 'short_break', 'long_break'])
    .withMessage('Session type must be work, short_break, or long_break')
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
  const { duration = 25, sessionType = 'work' } = req.body;

  // Check if user already has an active session
  const activeSession = await PomodoroSession.getActiveSession(userId);
  if (activeSession) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active session. Please complete it before starting a new one.',
      data: { activeSession }
    });
  }

  // Create new session
  const startTime = new Date();
  const session = new PomodoroSession({
    userId,
    duration,
    sessionType,
    startTime,
    sessionDate: new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()) // Set to start of day
  });

  await session.save();

  res.status(201).json({
    success: true,
    message: 'Pomodoro session started successfully',
    data: {
      session: {
        id: session._id,
        duration: session.duration,
        sessionType: session.sessionType,
        startTime: session.startTime,
        sessionDate: session.sessionDate
      }
    }
  });
}));

/**
 * @route   POST /api/pomodoro/complete
 * @desc    Complete an active Pomodoro session
 * @access  Private
 */
router.post('/complete', [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
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
  const { sessionId, notes, rating } = req.body;

  // Find the session
  const session = await PomodoroSession.findOne({
    _id: sessionId,
    userId,
    completed: false
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Active session not found or already completed'
    });
  }

  // Complete the session
  const completionResult = session.completeSession(new Date(), notes, rating);
  await session.save();

  // Award XP to user
  const user = req.user;
  const xpResult = user.addXP(session.xpEarned);
  await user.save();

  res.json({
    success: true,
    message: 'Pomodoro session completed successfully',
    data: {
      session: {
        id: session._id,
        duration: session.duration,
        actualDuration: completionResult.actualDuration,
        sessionType: session.sessionType,
        xpEarned: session.xpEarned,
        completedOnTime: completionResult.completedOnTime,
        startTime: session.startTime,
        endTime: session.endTime,
        notes: session.notes,
        rating: session.rating
      },
      xpResult: {
        leveledUp: xpResult.leveledUp,
        oldLevel: xpResult.oldLevel,
        newLevel: xpResult.newLevel,
        xpGained: xpResult.xpGained,
        totalXP: xpResult.totalXP
      }
    }
  });
}));

/**
 * @route   GET /api/pomodoro/active
 * @desc    Get current active session
 * @access  Private
 */
router.get('/active', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const activeSession = await PomodoroSession.getActiveSession(userId);
  
  if (!activeSession) {
    return res.json({
      success: true,
      message: 'No active session found',
      data: { session: null }
    });
  }

  // Get distractions from the new Distraction model
  const Distraction = require('../models/Distraction');
  const distractions = await Distraction.find({
    pomodoroSessionId: activeSession._id,
    userId: userId
  }).sort({ timestamp: 1 }).lean();
  
  res.json({
    success: true,
    data: {
      session: {
        id: activeSession._id,
        duration: activeSession.duration,
        sessionType: activeSession.sessionType,
        startTime: activeSession.startTime,
        sessionDate: activeSession.sessionDate,
        distractions: distractions
      }
    }
  });
}));

/**
 * @route   POST /api/pomodoro/distraction
 * @desc    Add distraction to active session
 * @access  Private
 */
router.post('/distraction', [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required'),
  
  body('type')
    .isIn(['phone', 'social_media', 'thoughts', 'other'])
    .withMessage('Distraction type must be phone, social_media, thoughts, or other'),
  
  body('note')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Distraction note cannot exceed 200 characters')
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
  const { sessionId, type, note } = req.body;

  // Find the active session
  const session = await PomodoroSession.findOne({
    _id: sessionId,
    userId,
    completed: false
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Active session not found'
    });
  }

  // Add distraction
  session.addDistraction(type, note);
  await session.save();

  res.json({
    success: true,
    message: 'Distraction logged successfully',
    data: {
      distraction: {
        type,
        note,
        timestamp: new Date()
      },
      totalDistractions: session.distractions.length
    }
  });
}));

/**
 * @route   GET /api/pomodoro/history
 * @desc    Get session history for analytics
 * @access  Private
 */
router.get('/history', [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
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
  const { startDate, endDate, limit = 30 } = req.query;

  let query = { userId };
  
  // Add date filters if provided
  if (startDate && endDate) {
    query.sessionDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const sessions = await PomodoroSession.find(query)
    .sort({ startTime: -1 })
    .limit(parseInt(limit))
    .select('-__v')
    .lean();

  // Get distractions for each session
  const Distraction = require('../models/Distraction');
  const sessionsWithDistractions = await Promise.all(
    sessions.map(async (session) => {
      const distractions = await Distraction.find({
        pomodoroSessionId: session._id,
        userId: userId
      }).sort({ timestamp: 1 }).lean();
      
      return {
        ...session,
        distractions: distractions
      };
    })
  );

  res.json({
    success: true,
    data: { sessions: sessionsWithDistractions },
    count: sessionsWithDistractions.length
  });
}));

/**
 * @route   GET /api/pomodoro/stats
 * @desc    Get session statistics for analytics
 * @access  Private
 */
router.get('/stats', [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
  const { startDate, endDate } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const stats = await PomodoroSession.getSessionStats(userId, start, end);
  const dailyHistory = await PomodoroSession.getDailyHistory(userId, 30);
  
  // Get distraction statistics from the new Distraction model
  const Distraction = require('../models/Distraction');
  const distractionStats = await Distraction.getDistractionStats(userId, start, end);
  const distractionTrends = await Distraction.getDistractionTrends(userId, 30);
  
  // Add distraction data to stats
  stats.totalDistractions = distractionStats.totalDistractions;
  
  // Add distraction data to daily history
  const dailyHistoryWithDistractions = dailyHistory.map(day => {
    const dayDistractions = distractionTrends.find(trend => 
      new Date(trend.date).toDateString() === new Date(day.date).toDateString()
    );
    return {
      ...day,
      distractions: dayDistractions ? dayDistractions.count : 0
    };
  });

  res.json({
    success: true,
    data: {
      stats,
      dailyHistory: dailyHistoryWithDistractions,
      distractionStats,
      dateRange: {
        start,
        end
      }
    }
  });
}));

/**
 * @route   DELETE /api/pomodoro/cancel
 * @desc    Cancel an active session (no XP awarded)
 * @access  Private
 */
router.delete('/cancel', [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
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
  const { sessionId } = req.body;

  // Find and delete the active session
  const session = await PomodoroSession.findOneAndDelete({
    _id: sessionId,
    userId,
    completed: false
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Active session not found'
    });
  }

  res.json({
    success: true,
    message: 'Session cancelled successfully',
    data: {
      cancelledSession: {
        id: session._id,
        duration: session.duration,
        sessionType: session.sessionType,
        startTime: session.startTime
      }
    }
  });
}));

module.exports = router;