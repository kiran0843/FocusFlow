const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const PomodoroSession = require('../models/PomodoroSession');
const { generateToken } = require('../middleware/auth');

describe('Pomodoro System API', () => {
  let testUser;
  let authToken;
  let testSession;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'pomodoro@test.com',
      password: 'TestPass123',
      xp: 0,
      level: 1
    });
    await testUser.save();
    authToken = generateToken(testUser._id);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'pomodoro@test.com' });
    await PomodoroSession.deleteMany({ userId: testUser._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await PomodoroSession.deleteMany({ userId: testUser._id });
  });

  describe('POST /api/pomodoro/start', () => {
    it('should start a new Pomodoro session', async () => {
      const response = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          duration: 25,
          sessionType: 'work'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toBeDefined();
      expect(response.body.data.session.duration).toBe(25);
      expect(response.body.data.session.sessionType).toBe('work');
      expect(response.body.data.session.startTime).toBeDefined();

      testSession = response.body.data.session;
    });

    it('should start session with default values', async () => {
      const response = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.data.session.duration).toBe(25);
      expect(response.body.data.session.sessionType).toBe('work');
    });

    it('should prevent starting multiple active sessions', async () => {
      // Start first session
      await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Try to start second session
      const response = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already have an active session');
    });

    it('should validate session duration', async () => {
      const response = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          duration: 150 // Invalid duration
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate session type', async () => {
      const response = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionType: 'invalid_type'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/pomodoro/complete', () => {
    beforeEach(async () => {
      // Start a session for completion tests
      const startResponse = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      testSession = startResponse.body.data.session;
    });

    it('should complete an active session and award XP', async () => {
      const response = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSession.id,
          notes: 'Great focus session!',
          rating: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session.completed).toBe(true);
      expect(response.body.data.session.xpEarned).toBe(25);
      expect(response.body.data.session.notes).toBe('Great focus session!');
      expect(response.body.data.session.rating).toBe(5);
      expect(response.body.data.xpResult.xpGained).toBe(25);
    });

    it('should complete session without optional fields', async () => {
      const response = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSession.id
        });

      expect(response.status).toBe(200);
      expect(response.body.data.session.xpEarned).toBe(25);
    });

    it('should not complete non-existent session', async () => {
      const response = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: new mongoose.Types.ObjectId()
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate session ID', async () => {
      const response = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate rating range', async () => {
      const response = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSession.id,
          rating: 6 // Invalid rating
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pomodoro/active', () => {
    it('should return active session', async () => {
      // Start a session
      await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      const response = await request(app)
        .get('/api/pomodoro/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toBeDefined();
    });

    it('should return null when no active session', async () => {
      const response = await request(app)
        .get('/api/pomodoro/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.session).toBeNull();
    });
  });

  describe('POST /api/pomodoro/distraction', () => {
    beforeEach(async () => {
      // Start a session for distraction tests
      const startResponse = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      testSession = startResponse.body.data.session;
    });

    it('should add distraction to active session', async () => {
      const response = await request(app)
        .post('/api/pomodoro/distraction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSession.id,
          type: 'phone',
          note: 'Got distracted by notification'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.distraction.type).toBe('phone');
      expect(response.body.data.totalDistractions).toBe(1);
    });

    it('should validate distraction type', async () => {
      const response = await request(app)
        .post('/api/pomodoro/distraction')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSession.id,
          type: 'invalid_type'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/pomodoro/history', () => {
    beforeEach(async () => {
      // Create some test sessions
      const sessions = [
        {
          userId: testUser._id,
          duration: 25,
          sessionType: 'work',
          completed: true,
          xpEarned: 25,
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000)
        },
        {
          userId: testUser._id,
          duration: 5,
          sessionType: 'short_break',
          completed: true,
          xpEarned: 5,
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
        }
      ];

      await PomodoroSession.insertMany(sessions);
    });

    it('should return session history', async () => {
      const response = await request(app)
        .get('/api/pomodoro/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toBeDefined();
      expect(response.body.data.sessions.length).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/pomodoro/history?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.sessions).toBeDefined();
    });
  });

  describe('GET /api/pomodoro/stats', () => {
    beforeEach(async () => {
      // Create test sessions for stats
      const sessions = [
        {
          userId: testUser._id,
          duration: 25,
          sessionType: 'work',
          completed: true,
          xpEarned: 25,
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
          rating: 4
        },
        {
          userId: testUser._id,
          duration: 25,
          sessionType: 'work',
          completed: false,
          xpEarned: 0,
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ];

      await PomodoroSession.insertMany(sessions);
    });

    it('should return session statistics', async () => {
      const response = await request(app)
        .get('/api/pomodoro/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalSessions).toBeGreaterThan(0);
      expect(response.body.data.dailyHistory).toBeDefined();
    });
  });

  describe('DELETE /api/pomodoro/cancel', () => {
    beforeEach(async () => {
      // Start a session for cancellation tests
      const startResponse = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      testSession = startResponse.body.data.session;
    });

    it('should cancel active session', async () => {
      const response = await request(app)
        .delete('/api/pomodoro/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: testSession.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cancelledSession).toBeDefined();
    });

    it('should not cancel non-existent session', async () => {
      const response = await request(app)
        .delete('/api/pomodoro/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: new mongoose.Types.ObjectId()
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('XP and Level System', () => {
    it('should award XP and update user level', async () => {
      // Start and complete a session
      const startResponse = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      const sessionId = startResponse.body.data.session.id;

      const completeResponse = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sessionId });

      expect(completeResponse.body.data.xpResult.xpGained).toBe(25);
      expect(completeResponse.body.data.xpResult.totalXP).toBe(25);

      // Check user XP was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.xp).toBe(25);
    });

    it('should handle level up correctly', async () => {
      // Set user XP to 95 (close to level up)
      testUser.xp = 95;
      await testUser.save();

      // Complete a session to trigger level up
      const startResponse = await request(app)
        .post('/api/pomodoro/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      const sessionId = startResponse.body.data.session.id;

      const completeResponse = await request(app)
        .post('/api/pomodoro/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sessionId });

      expect(completeResponse.body.data.xpResult.leveledUp).toBe(true);
      expect(completeResponse.body.data.xpResult.newLevel).toBe(2);
    });
  });
});

