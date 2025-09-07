const User = require('../models/User');
const Task = require('../models/Task');
const PomodoroSession = require('../models/PomodoroSession');
const { calculateStreak } = require('../utils/helpers');

/**
 * Service for handling daily rewards, streaks, and weekly goals
 */
class DailyRewardsService {
  
  /**
   * Check and award daily streak rewards
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Streak reward result
   */
  static async checkStreakRewards(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's task completion dates
      const taskDates = await Task.aggregate([
        { $match: { userId: user._id, completed: true } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } } } },
        { $sort: { _id: -1 } }
      ]);

      const dates = taskDates.map(item => item._id);
      const currentStreak = calculateStreak(dates);
      
      // Check if user has a streak milestone (every 3 days)
      const streakMilestones = [3, 7, 14, 30, 60, 100];
      const lastStreakReward = user.lastStreakReward || 0;
      
      let streakReward = 0;
      let milestoneAchieved = null;
      
      for (const milestone of streakMilestones) {
        if (currentStreak >= milestone && lastStreakReward < milestone) {
          streakReward = 50; // DAILY_STREAK reward
          milestoneAchieved = milestone;
          user.lastStreakReward = milestone;
          break;
        }
      }

      if (streakReward > 0) {
        const xpResult = user.addXP(streakReward);
        await user.save();
        
        return {
          success: true,
          streakReward,
          milestoneAchieved,
          currentStreak,
          xpResult
        };
      }

      return {
        success: true,
        streakReward: 0,
        currentStreak,
        message: 'No streak milestone achieved'
      };

    } catch (error) {
      console.error('Error checking streak rewards:', error);
      throw error;
    }
  }

  /**
   * Check and award weekly goal rewards
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Weekly goal reward result
   */
  static async checkWeeklyGoalRewards(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get start of current week
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      // Get end of current week
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Count completed tasks this week
      const completedTasks = await Task.countDocuments({
        userId: user._id,
        completed: true,
        completedAt: { $gte: startOfWeek, $lte: endOfWeek }
      });

      // Count completed pomodoro sessions this week
      const completedSessions = await PomodoroSession.countDocuments({
        userId: user._id,
        completed: true,
        endTime: { $gte: startOfWeek, $lte: endOfWeek }
      });

      // Define weekly goals
      const weeklyGoals = [
        { tasks: 5, sessions: 3, reward: 50, name: 'Basic Weekly Goal' },
        { tasks: 10, sessions: 7, reward: 100, name: 'Advanced Weekly Goal' },
        { tasks: 15, sessions: 12, reward: 150, name: 'Expert Weekly Goal' }
      ];

      // Check if user has achieved any weekly goal
      const lastWeeklyReward = user.lastWeeklyReward || 0;
      let weeklyReward = 0;
      let goalAchieved = null;

      for (const goal of weeklyGoals) {
        if (completedTasks >= goal.tasks && 
            completedSessions >= goal.sessions && 
            lastWeeklyReward < goal.reward) {
          weeklyReward = goal.reward;
          goalAchieved = goal.name;
          user.lastWeeklyReward = goal.reward;
          break;
        }
      }

      if (weeklyReward > 0) {
        const xpResult = user.addXP(weeklyReward);
        await user.save();
        
        return {
          success: true,
          weeklyReward,
          goalAchieved,
          completedTasks,
          completedSessions,
          xpResult
        };
      }

      return {
        success: true,
        weeklyReward: 0,
        completedTasks,
        completedSessions,
        message: 'No weekly goal achieved'
      };

    } catch (error) {
      console.error('Error checking weekly goal rewards:', error);
      throw error;
    }
  }

  /**
   * Process all daily rewards for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Combined rewards result
   */
  static async processDailyRewards(userId) {
    try {
      const [streakResult, weeklyResult] = await Promise.all([
        this.checkStreakRewards(userId),
        this.checkWeeklyGoalRewards(userId)
      ]);

      const totalReward = streakResult.streakReward + weeklyResult.weeklyReward;

      return {
        success: true,
        totalReward,
        streak: streakResult,
        weekly: weeklyResult,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing daily rewards:', error);
      throw error;
    }
  }

  /**
   * Get user's current progress towards goals
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Progress information
   */
  static async getUserProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get current week boundaries
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Get task completion dates for streak calculation
      const taskDates = await Task.aggregate([
        { $match: { userId: user._id, completed: true } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } } } },
        { $sort: { _id: -1 } }
      ]);

      const dates = taskDates.map(item => item._id);
      const currentStreak = calculateStreak(dates);

      // Get this week's progress
      const [completedTasks, completedSessions] = await Promise.all([
        Task.countDocuments({
          userId: user._id,
          completed: true,
          completedAt: { $gte: startOfWeek, $lte: endOfWeek }
        }),
        PomodoroSession.countDocuments({
          userId: user._id,
          completed: true,
          endTime: { $gte: startOfWeek, $lte: endOfWeek }
        })
      ]);

      // Calculate next streak milestone
      const streakMilestones = [3, 7, 14, 30, 60, 100];
      const nextStreakMilestone = streakMilestones.find(milestone => currentStreak < milestone) || 100;
      const streakProgress = Math.min(100, (currentStreak / nextStreakMilestone) * 100);

      // Calculate weekly goal progress
      const weeklyGoals = [
        { tasks: 5, sessions: 3, name: 'Basic' },
        { tasks: 10, sessions: 7, name: 'Advanced' },
        { tasks: 15, sessions: 12, name: 'Expert' }
      ];

      const currentGoal = weeklyGoals.find(goal => 
        completedTasks < goal.tasks || completedSessions < goal.sessions
      ) || weeklyGoals[weeklyGoals.length - 1];

      const taskProgress = Math.min(100, (completedTasks / currentGoal.tasks) * 100);
      const sessionProgress = Math.min(100, (completedSessions / currentGoal.sessions) * 100);
      const weeklyProgress = (taskProgress + sessionProgress) / 2;

      return {
        success: true,
        currentStreak,
        nextStreakMilestone,
        streakProgress,
        completedTasks,
        completedSessions,
        currentGoal: currentGoal.name,
        weeklyProgress,
        lastStreakReward: user.lastStreakReward || 0,
        lastWeeklyReward: user.lastWeeklyReward || 0
      };

    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }
}

module.exports = DailyRewardsService;

