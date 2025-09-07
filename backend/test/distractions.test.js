const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const PomodoroSession = require('../models/PomodoroSession');
const Distraction = require('../models/Distraction');
const { generateToken } = require('../middleware/auth');

describe('Distraction Tracking System', () => {
  let testUser;
  let authToken;
  let testSession;
  let testDistraction;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'distraction@test.com',
      password: 'TestPass123',
      xp: 0,
      level: 1
    });
    await testUser.save();
    authToken = generateToken(testUser._id);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'distraction@test.com' });
    await PomodoroSession.deleteMany({ userId: testUser._id });
    await Distraction.deleteMany({ userId: testUser._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up distractions before each test
    await Distraction.deleteMany({ userId: testUser._id });
    
    // Create a test Pomodoro session
    testSession = new PomodoroSession({
      userId: testUser._id,
      duration: 25,
      sessionType: 'work',
      startTime: new Date(),
      completed: false
    });
    await testSession.save();
  });

  describe('POST /api/distractions', () => {
    it('should log a new distraction', async () => {
      const response = await request(app)
        .post('/api/distractions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 60,
          description: 'Got distracted by notification',
          severity: 4,
          impact: 3,
          context: 'home',
          source: 'mobile',
          tags: ['urgent', 'work']
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.distraction).toBeDefined();
      expect(response.body.data.distraction.type).toBe('phone');
      expect(response.body.data.distraction.duration).toBe(60);
      expect(response.body.data.distraction.severity).toBe(4);

      testDistraction = response.body.data.distraction;
    });

    it('should log distraction with minimal data', async () => {
      const response = await request(app)
        .post('/api/distractions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pomodoroSessionId: testSession._id,
          type: 'thoughts'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.distraction.type).toBe('thoughts');
      expect(response.body.data.distraction.duration).toBe(30); // Default duration
      expect(response.body.data.distraction.severity).toBe(3); // Default severity
    });

    it('should validate distraction type', async () => {
      const response = await request(app)
        .post('/api/distractions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pomodoroSessionId: testSession._id,
          type: 'invalid_type'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate session ownership', async () => {
      // Create another user's session
      const otherUser = new User({
        name: 'Other User',
        email: 'other@test.com',
        password: 'TestPass123'
      });
      await otherUser.save();

      const otherSession = new PomodoroSession({
        userId: otherUser._id,
        duration: 25,
        sessionType: 'work',
        startTime: new Date()
      });
      await otherSession.save();

      const response = await request(app)
        .post('/api/distractions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pomodoroSessionId: otherSession._id,
          type: 'phone'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      // Clean up
      await User.findByIdAndDelete(otherUser._id);
      await PomodoroSession.findByIdAndDelete(otherSession._id);
    });

    it('should validate duration range', async () => {
      const response = await request(app)
        .post('/api/distractions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 4000 // Invalid duration
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/distractions', () => {
    beforeEach(async () => {
      // Create test distractions
      const distractions = [
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 60,
          severity: 4,
          impact: 3,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'social_media',
          duration: 120,
          severity: 3,
          impact: 4,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'thoughts',
          duration: 30,
          severity: 2,
          impact: 2,
          resolved: true,
          resolutionMethod: 'ignored'
        }
      ];

      await Distraction.insertMany(distractions);
    });

    it('should get all distractions for user', async () => {
      const response = await request(app)
        .get('/api/distractions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.distractions).toBeDefined();
      expect(response.body.data.distractions.length).toBeGreaterThan(0);
    });

    it('should filter distractions by type', async () => {
      const response = await request(app)
        .get('/api/distractions?type=phone')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.distractions.every(d => d.type === 'phone')).toBe(true);
    });

    it('should filter distractions by resolved status', async () => {
      const response = await request(app)
        .get('/api/distractions?resolved=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.distractions.every(d => d.resolved === true)).toBe(true);
    });

    it('should filter distractions by date range', async () => {
      const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(`/api/distractions?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.distractions.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/distractions/stats', () => {
    beforeEach(async () => {
      // Create test distractions for stats
      const distractions = [
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 60,
          severity: 4,
          impact: 3,
          resolved: true,
          resolutionMethod: 'addressed'
        },
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'social_media',
          duration: 120,
          severity: 3,
          impact: 4,
          resolved: false
        },
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 30,
          severity: 2,
          impact: 2,
          resolved: true,
          resolutionMethod: 'ignored'
        }
      ];

      await Distraction.insertMany(distractions);
    });

    it('should get distraction statistics', async () => {
      const response = await request(app)
        .get('/api/distractions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalDistractions).toBeGreaterThan(0);
      expect(response.body.data.stats.byType).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.patterns).toBeDefined();
      expect(response.body.data.topDistractions).toBeDefined();
    });

    it('should get statistics for date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/distractions/stats?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.stats).toBeDefined();
    });
  });

  describe('GET /api/distractions/trends', () => {
    beforeEach(async () => {
      // Create distractions over multiple days
      const distractions = [];
      for (let i = 0; i < 5; i++) {
        distractions.push({
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 60,
          severity: 3,
          impact: 3,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        });
      }
      await Distraction.insertMany(distractions);
    });

    it('should get distraction trends', async () => {
      const response = await request(app)
        .get('/api/distractions/trends?days=7')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.trends.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/distractions/patterns', () => {
    beforeEach(async () => {
      // Create distractions with different patterns
      const distractions = [
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'phone',
          duration: 60,
          severity: 4,
          impact: 3,
          context: 'home',
          source: 'mobile',
          timestamp: new Date('2024-01-15T10:00:00Z')
        },
        {
          userId: testUser._id,
          pomodoroSessionId: testSession._id,
          type: 'social_media',
          duration: 120,
          severity: 3,
          impact: 4,
          context: 'office',
          source: 'desktop',
          timestamp: new Date('2024-01-15T14:00:00Z')
        }
      ];

      await Distraction.insertMany(distractions);
    });

    it('should get distraction patterns', async () => {
      const response = await request(app)
        .get('/api/distractions/patterns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.patterns).toBeDefined();
      expect(response.body.data.patterns.hourlyPattern).toBeDefined();
      expect(response.body.data.patterns.dailyPattern).toBeDefined();
      expect(response.body.data.patterns.contextPattern).toBeDefined();
      expect(response.body.data.patterns.sourcePattern).toBeDefined();
    });
  });

  describe('GET /api/distractions/top', () => {
    beforeEach(async () => {
      // Create distractions with different types
      const distractions = [
        { userId: testUser._id, pomodoroSessionId: testSession._id, type: 'phone', duration: 60, severity: 3, impact: 3 },
        { userId: testUser._id, pomodoroSessionId: testSession._id, type: 'phone', duration: 30, severity: 2, impact: 2 },
        { userId: testUser._id, pomodoroSessionId: testSession._id, type: 'social_media', duration: 120, severity: 4, impact: 4 },
        { userId: testUser._id, pomodoroSessionId: testSession._id, type: 'thoughts', duration: 15, severity: 1, impact: 1 }
      ];

      await Distraction.insertMany(distractions);
    });

    it('should get top distractions by frequency', async () => {
      const response = await request(app)
        .get('/api/distractions/top?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.topDistractions).toBeDefined();
      expect(response.body.data.topDistractions.length).toBeGreaterThan(0);
      expect(response.body.data.topDistractions[0].type).toBe('phone'); // Most frequent
    });
  });

  describe('PATCH /api/distractions/:id/resolve', () => {
    beforeEach(async () => {
      testDistraction = new Distraction({
        userId: testUser._id,
        pomodoroSessionId: testSession._id,
        type: 'phone',
        duration: 60,
        severity: 4,
        impact: 3
      });
      await testDistraction.save();
    });

    it('should mark distraction as resolved', async () => {
      const response = await request(app)
        .patch(`/api/distractions/${testDistraction._id}/resolve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          method: 'addressed',
          notes: 'Turned off notifications'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.distraction.resolved).toBe(true);
      expect(response.body.data.distraction.resolutionMethod).toBe('addressed');
    });

    it('should validate resolution method', async () => {
      const response = await request(app)
        .patch(`/api/distractions/${testDistraction._id}/resolve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          method: 'invalid_method'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not resolve non-existent distraction', async () => {
      const response = await request(app)
        .patch(`/api/distractions/${new mongoose.Types.ObjectId()}/resolve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          method: 'ignored'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/distractions/:id', () => {
    beforeEach(async () => {
      testDistraction = new Distraction({
        userId: testUser._id,
        pomodoroSessionId: testSession._id,
        type: 'phone',
        duration: 60,
        severity: 4,
        impact: 3
      });
      await testDistraction.save();
    });

    it('should update distraction', async () => {
      const response = await request(app)
        .put(`/api/distractions/${testDistraction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'social_media',
          duration: 120,
          severity: 3,
          description: 'Updated distraction'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.distraction.type).toBe('social_media');
      expect(response.body.data.distraction.duration).toBe(120);
      expect(response.body.data.distraction.description).toBe('Updated distraction');
    });

    it('should not update non-existent distraction', async () => {
      const response = await request(app)
        .put(`/api/distractions/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'thoughts'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/distractions/:id', () => {
    beforeEach(async () => {
      testDistraction = new Distraction({
        userId: testUser._id,
        pomodoroSessionId: testSession._id,
        type: 'phone',
        duration: 60,
        severity: 4,
        impact: 3
      });
      await testDistraction.save();
    });

    it('should delete distraction', async () => {
      const response = await request(app)
        .delete(`/api/distractions/${testDistraction._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify distraction is deleted
      const deletedDistraction = await Distraction.findById(testDistraction._id);
      expect(deletedDistraction).toBeNull();
    });

    it('should not delete non-existent distraction', async () => {
      const response = await request(app)
        .delete(`/api/distractions/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Distraction Model Methods', () => {
    beforeEach(async () => {
      testDistraction = new Distraction({
        userId: testUser._id,
        pomodoroSessionId: testSession._id,
        type: 'phone',
        duration: 60,
        severity: 4,
        impact: 3
      });
      await testDistraction.save();
    });

    it('should resolve distraction using instance method', async () => {
      testDistraction.resolve('blocked', 'Installed app blocker');
      await testDistraction.save();

      expect(testDistraction.resolved).toBe(true);
      expect(testDistraction.resolutionMethod).toBe('blocked');
      expect(testDistraction.description).toContain('Resolution: Installed app blocker');
    });

    it('should get distraction statistics', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const stats = await Distraction.getDistractionStats(testUser._id, startDate, endDate);

      expect(stats).toBeDefined();
      expect(stats.totalDistractions).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
    });

    it('should get distraction trends', async () => {
      const trends = await Distraction.getDistractionTrends(testUser._id, 30);

      expect(Array.isArray(trends)).toBe(true);
    });

    it('should get distraction patterns', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const patterns = await Distraction.getDistractionPatterns(testUser._id, startDate, endDate);

      expect(patterns).toBeDefined();
      expect(patterns.hourlyPattern).toBeDefined();
      expect(patterns.dailyPattern).toBeDefined();
      expect(patterns.contextPattern).toBeDefined();
      expect(patterns.sourcePattern).toBeDefined();
    });

    it('should get top distractions', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const topDistractions = await Distraction.getTopDistractions(testUser._id, startDate, endDate, 10);

      expect(Array.isArray(topDistractions)).toBe(true);
    });
  });
});

