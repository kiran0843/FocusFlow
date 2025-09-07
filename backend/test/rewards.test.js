const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');
const PomodoroSession = require('../models/PomodoroSession');
const DailyRewardsService = require('../services/dailyRewardsService');

describe('Rewards System', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      xp: 0,
      level: 1
    });
    await testUser.save();

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'test@example.com' });
    await Task.deleteMany({ userId: testUser._id });
    await PomodoroSession.deleteMany({ userId: testUser._id });
  });

  describe('Level Up Bonus', () => {
    test('should award level up bonus when user levels up', async () => {
      // Set user to 99 XP (1 XP away from level 2)
      testUser.xp = 99;
      await testUser.save();

      // Add 1 XP to trigger level up
      const xpResult = testUser.addXP(1);
      await testUser.save();

      expect(xpResult.leveledUp).toBe(true);
      expect(xpResult.levelUpBonus).toBe(100);
      expect(xpResult.xpGained).toBe(101); // 1 XP + 100 bonus
      expect(testUser.xp).toBe(200); // 99 + 1 + 100
      expect(testUser.level).toBe(2);
    });
  });

  describe('Streak Rewards', () => {
    test('should award streak milestone rewards', async () => {
      // Create completed tasks for 3 consecutive days
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const tasks = [
        new Task({
          userId: testUser._id,
          title: 'Task 1',
          completed: true,
          completedAt: twoDaysAgo
        }),
        new Task({
          userId: testUser._id,
          title: 'Task 2',
          completed: true,
          completedAt: yesterday
        }),
        new Task({
          userId: testUser._id,
          title: 'Task 3',
          completed: true,
          completedAt: today
        })
      ];

      await Task.insertMany(tasks);

      // Check streak rewards
      const result = await DailyRewardsService.checkStreakRewards(testUser._id);
      
      expect(result.success).toBe(true);
      expect(result.streakReward).toBe(50);
      expect(result.milestoneAchieved).toBe(3);
      expect(result.currentStreak).toBe(3);

      // Verify user received XP
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastStreakReward).toBe(3);
    });
  });

  describe('Weekly Goal Rewards', () => {
    test('should award weekly goal rewards', async () => {
      // Reset user's weekly reward tracking
      testUser.lastWeeklyReward = 0;
      await testUser.save();

      // Create completed tasks and sessions for this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const tasks = Array(5).fill().map((_, i) => new Task({
        userId: testUser._id,
        title: `Weekly Task ${i + 1}`,
        completed: true,
        completedAt: new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000)
      }));

      const sessions = Array(3).fill().map((_, i) => new PomodoroSession({
        userId: testUser._id,
        duration: 25,
        sessionType: 'work',
        completed: true,
        startTime: new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000),
        endTime: new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000 + 25 * 60 * 1000)
      }));

      await Task.insertMany(tasks);
      await PomodoroSession.insertMany(sessions);

      // Check weekly goal rewards
      const result = await DailyRewardsService.checkWeeklyGoalRewards(testUser._id);
      
      expect(result.success).toBe(true);
      expect(result.weeklyReward).toBe(50);
      expect(result.goalAchieved).toBe('Basic Weekly Goal');
      expect(result.completedTasks).toBe(5);
      expect(result.completedSessions).toBe(3);

      // Verify user received XP
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastWeeklyReward).toBe(50);
    });
  });

  describe('API Endpoints', () => {
    test('should get user progress', async () => {
      const response = await request(app)
        .get('/api/rewards/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentStreak');
      expect(response.body.data).toHaveProperty('completedTasks');
      expect(response.body.data).toHaveProperty('completedSessions');
    });

    test('should process daily rewards', async () => {
      const response = await request(app)
        .post('/api/rewards/process-daily')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReward');
      expect(response.body.data).toHaveProperty('streak');
      expect(response.body.data).toHaveProperty('weekly');
    });
  });
});

