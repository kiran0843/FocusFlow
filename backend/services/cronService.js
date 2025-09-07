const cron = require('node-cron');
const User = require('../models/User');
const DailyRewardsService = require('./dailyRewardsService');

/**
 * Cron service for automated daily tasks
 */
class CronService {
  
  /**
   * Initialize all cron jobs
   */
  static initialize() {
    // Process daily rewards at 12:00 AM every day
    this.scheduleDailyRewards();
    
    console.log('Cron jobs initialized successfully');
  }

  /**
   * Schedule daily rewards processing
   */
  static scheduleDailyRewards() {
    // Run at midnight every day (0 0 * * *)
    cron.schedule('0 0 * * *', async () => {
      console.log('Starting daily rewards processing...');
      
      try {
        // Get all active users
        const users = await User.find({ isActive: true }).select('_id name email');
        
        console.log(`Processing rewards for ${users.length} users`);
        
        // Process rewards for each user
        const results = await Promise.allSettled(
          users.map(async (user) => {
            try {
              const result = await DailyRewardsService.processDailyRewards(user._id);
              console.log(`Processed rewards for user ${user.name}:`, result);
              return { userId: user._id, success: true, result };
            } catch (error) {
              console.error(`Error processing rewards for user ${user.name}:`, error);
              return { userId: user._id, success: false, error: error.message };
            }
          })
        );

        // Log summary
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;
        
        console.log(`Daily rewards processing completed. Success: ${successful}, Failed: ${failed}`);
        
      } catch (error) {
        console.error('Error in daily rewards cron job:', error);
      }
    }, {
      timezone: 'UTC'
    });
  }

  /**
   * Manually trigger daily rewards processing (for testing)
   */
  static async triggerDailyRewards() {
    console.log('Manually triggering daily rewards processing...');
    
    try {
      const users = await User.find({ isActive: true }).select('_id name email');
      
      const results = await Promise.allSettled(
        users.map(async (user) => {
          try {
            const result = await DailyRewardsService.processDailyRewards(user._id);
            return { userId: user._id, success: true, result };
          } catch (error) {
            return { userId: user._id, success: false, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      console.log(`Manual daily rewards processing completed. Success: ${successful}, Failed: ${failed}`);
      
      return {
        success: true,
        processed: results.length,
        successful,
        failed
      };
      
    } catch (error) {
      console.error('Error in manual daily rewards processing:', error);
      throw error;
    }
  }

  /**
   * Get cron job status
   */
  static getStatus() {
    return {
      initialized: true,
      jobs: [
        {
          name: 'daily-rewards',
          schedule: '0 0 * * *',
          description: 'Process daily rewards at midnight UTC',
          timezone: 'UTC'
        }
      ]
    };
  }
}

module.exports = CronService;

