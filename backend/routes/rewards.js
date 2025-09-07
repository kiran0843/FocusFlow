const express = require('express');
const DailyRewardsService = require('../services/dailyRewardsService');
const CronService = require('../services/cronService');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/rewards/process-daily
 * @desc    Process daily rewards for the authenticated user
 * @access  Private
 */
router.post('/process-daily', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await DailyRewardsService.processDailyRewards(userId);
  
  res.json({
    success: true,
    message: 'Daily rewards processed successfully',
    data: result
  });
}));

/**
 * @route   GET /api/rewards/progress
 * @desc    Get user's current progress towards goals and streaks
 * @access  Private
 */
router.get('/progress', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const progress = await DailyRewardsService.getUserProgress(userId);
  
  res.json({
    success: true,
    data: progress
  });
}));

/**
 * @route   POST /api/rewards/check-streak
 * @desc    Check and award streak rewards
 * @access  Private
 */
router.post('/check-streak', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await DailyRewardsService.checkStreakRewards(userId);
  
  res.json({
    success: true,
    message: 'Streak rewards checked successfully',
    data: result
  });
}));

/**
 * @route   POST /api/rewards/check-weekly
 * @desc    Check and award weekly goal rewards
 * @access  Private
 */
router.post('/check-weekly', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await DailyRewardsService.checkWeeklyGoalRewards(userId);
  
  res.json({
    success: true,
    message: 'Weekly goal rewards checked successfully',
    data: result
  });
}));

/**
 * @route   POST /api/rewards/trigger-daily
 * @desc    Manually trigger daily rewards processing for all users (admin/testing)
 * @access  Private
 */
router.post('/trigger-daily', asyncHandler(async (req, res) => {
  const result = await CronService.triggerDailyRewards();
  
  res.json({
    success: true,
    message: 'Daily rewards processing triggered successfully',
    data: result
  });
}));

/**
 * @route   GET /api/rewards/status
 * @desc    Get cron job status
 * @access  Private
 */
router.get('/status', asyncHandler(async (req, res) => {
  const status = CronService.getStatus();
  
  res.json({
    success: true,
    data: status
  });
}));

module.exports = router;
