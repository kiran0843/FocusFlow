const express = require('express');
const { body, validationResult } = require('express-validator');
const Distraction = require('../models/Distraction');
const PomodoroSession = require('../models/PomodoroSession');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/distractions
 * @desc    Log a new distraction
 * @access  Private
 */
router.post('/', [
  body('pomodoroSessionId')
    .notEmpty()
    .withMessage('Pomodoro session ID is required'),
  
  body('type')
    .isIn(['phone', 'social_media', 'thoughts', 'email', 'noise', 'people', 'other'])
    .withMessage('Invalid distraction type'),
  
  body('duration')
    .optional()
    .isInt({ min: 1, max: 3600 })
    .withMessage('Duration must be between 1 and 3600 seconds'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('severity')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Severity must be between 1 and 5'),
  
  body('impact')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Impact must be between 1 and 5'),
  
  body('context')
    .optional()
    .isIn(['home', 'office', 'cafe', 'library', 'other'])
    .withMessage('Invalid context'),
  
  body('source')
    .optional()
    .isIn(['mobile', 'desktop', 'tablet', 'external', 'internal'])
    .withMessage('Invalid source'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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
  const {
    pomodoroSessionId,
    type,
    duration = 30,
    description,
    severity = 3,
    impact = 3,
    context = 'other',
    source = 'external',
    tags = []
  } = req.body;

  // Verify the Pomodoro session exists and belongs to the user
  const session = await PomodoroSession.findOne({
    _id: pomodoroSessionId,
    userId
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Pomodoro session not found or does not belong to user'
    });
  }

  // Create distraction
  const distraction = new Distraction({
    userId,
    pomodoroSessionId,
    type,
    duration,
    description,
    severity,
    impact,
    context,
    source,
    tags
  });

  await distraction.save();

  res.status(201).json({
    success: true,
    message: 'Distraction logged successfully',
    data: { distraction }
  });
}));

/**
 * @route   GET /api/distractions
 * @desc    Get distractions for a user with filtering
 * @access  Private
 */
router.get('/', [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  body('type')
    .optional()
    .isIn(['phone', 'social_media', 'thoughts', 'email', 'noise', 'people', 'other'])
    .withMessage('Invalid distraction type'),
  
  body('resolved')
    .optional()
    .isBoolean()
    .withMessage('Resolved must be a boolean'),
  
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
  const { startDate, endDate, type, resolved, limit = 50 } = req.query;

  let query = { userId };

  // Add date filters
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Add type filter
  if (type) {
    query.type = type;
  }

  // Add resolved filter
  if (resolved !== undefined) {
    query.resolved = resolved === 'true';
  }

  const distractions = await Distraction.find(query)
    .populate('pomodoroSessionId', 'sessionType duration startTime')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    data: { distractions },
    count: distractions.length
  });
}));

/**
 * @route   GET /api/distractions/stats
 * @desc    Get distraction statistics
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

  const stats = await Distraction.getDistractionStats(userId, start, end);
  const trends = await Distraction.getDistractionTrends(userId, 30);
  const patterns = await Distraction.getDistractionPatterns(userId, start, end);
  const topDistractions = await Distraction.getTopDistractions(userId, start, end, 10);

  res.json({
    success: true,
    data: {
      stats,
      trends,
      patterns,
      topDistractions,
      dateRange: {
        start,
        end
      }
    }
  });
}));

/**
 * @route   GET /api/distractions/trends
 * @desc    Get distraction trends over time
 * @access  Private
 */
router.get('/trends', [
  body('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
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
  const { days = 30 } = req.query;

  const trends = await Distraction.getDistractionTrends(userId, parseInt(days));

  res.json({
    success: true,
    data: { trends },
    count: trends.length
  });
}));

/**
 * @route   GET /api/distractions/patterns
 * @desc    Get distraction patterns (hourly, daily, context, source)
 * @access  Private
 */
router.get('/patterns', [
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

  const patterns = await Distraction.getDistractionPatterns(userId, start, end);

  res.json({
    success: true,
    data: { patterns },
    dateRange: {
      start,
      end
    }
  });
}));

/**
 * @route   GET /api/distractions/top
 * @desc    Get top distractions by frequency
 * @access  Private
 */
router.get('/top', [
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
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
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
  const { startDate, endDate, limit = 10 } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const topDistractions = await Distraction.getTopDistractions(userId, start, end, parseInt(limit));

  res.json({
    success: true,
    data: { topDistractions },
    count: topDistractions.length,
    dateRange: {
      start,
      end
    }
  });
}));

/**
 * @route   PATCH /api/distractions/:id/resolve
 * @desc    Mark a distraction as resolved
 * @access  Private
 */
router.patch('/:id/resolve', [
  body('method')
    .isIn(['ignored', 'addressed', 'postponed', 'delegated', 'blocked'])
    .withMessage('Invalid resolution method'),
  
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
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
  const { id } = req.params;
  const { method, notes } = req.body;

  const distraction = await Distraction.findOne({
    _id: id,
    userId
  });

  if (!distraction) {
    return res.status(404).json({
      success: false,
      message: 'Distraction not found'
    });
  }

  distraction.resolve(method, notes);
  await distraction.save();

  res.json({
    success: true,
    message: 'Distraction marked as resolved',
    data: { distraction }
  });
}));

/**
 * @route   PUT /api/distractions/:id
 * @desc    Update a distraction
 * @access  Private
 */
router.put('/:id', [
  body('type')
    .optional()
    .isIn(['phone', 'social_media', 'thoughts', 'email', 'noise', 'people', 'other'])
    .withMessage('Invalid distraction type'),
  
  body('duration')
    .optional()
    .isInt({ min: 1, max: 3600 })
    .withMessage('Duration must be between 1 and 3600 seconds'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('severity')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Severity must be between 1 and 5'),
  
  body('impact')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Impact must be between 1 and 5'),
  
  body('context')
    .optional()
    .isIn(['home', 'office', 'cafe', 'library', 'other'])
    .withMessage('Invalid context'),
  
  body('source')
    .optional()
    .isIn(['mobile', 'desktop', 'tablet', 'external', 'internal'])
    .withMessage('Invalid source'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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
  const { id } = req.params;

  const distraction = await Distraction.findOne({
    _id: id,
    userId
  });

  if (!distraction) {
    return res.status(404).json({
      success: false,
      message: 'Distraction not found'
    });
  }

  // Update distraction
  Object.assign(distraction, req.body);
  await distraction.save();

  res.json({
    success: true,
    message: 'Distraction updated successfully',
    data: { distraction }
  });
}));

/**
 * @route   DELETE /api/distractions/:id
 * @desc    Delete a distraction
 * @access  Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const distraction = await Distraction.findOneAndDelete({
    _id: id,
    userId
  });

  if (!distraction) {
    return res.status(404).json({
      success: false,
      message: 'Distraction not found'
    });
  }

  res.json({
    success: true,
    message: 'Distraction deleted successfully'
  });
}));

module.exports = router;

