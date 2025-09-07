const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Task = require('../models/Task');
const User = require('../models/User');

describe('Task Management API', () => {
  let authToken;
  let userId;
  let testUser;
  let testTask;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    userId = testUser._id;

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
    await Task.deleteMany({ userId });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up tasks before each test
    await Task.deleteMany({ userId });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        taskDate: new Date().toISOString(),
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.userId).toBe(userId.toString());
      expect(response.body.data.task.completed).toBe(false);
    });

    it('should enforce daily task limit of 3', async () => {
      const taskDate = new Date().toISOString();
      
      // Create 3 tasks
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Task ${i + 1}`,
            taskDate
          })
          .expect(201);
      }

      // Try to create 4th task
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 4',
          taskDate
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Daily task limit');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should not allow tasks for past dates', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Past Task',
          taskDate: yesterday.toISOString()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('past dates');
    });

    it('should validate task title length', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'a'.repeat(101), // Too long
          taskDate: new Date().toISOString()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      testTask = new Task({
        title: 'Test Task',
        description: 'Test description',
        userId,
        taskDate: today,
        priority: 'high',
        completed: false
      });
      await testTask.save();

      const task2 = new Task({
        title: 'Completed Task',
        description: 'Completed description',
        userId,
        taskDate: today,
        priority: 'medium',
        completed: true
      });
      await task2.save();

      const task3 = new Task({
        title: 'Tomorrow Task',
        description: 'Tomorrow description',
        userId,
        taskDate: tomorrow,
        priority: 'low',
        completed: false
      });
      await task3.save();
    });

    it('should get all tasks for user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
    });

    it('should filter tasks by date', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/tasks?date=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
    });

    it('should filter tasks by completion status', async () => {
      const response = await request(app)
        .get('/api/tasks?completed=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].completed).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].priority).toBe('high');
    });

    it('should filter tasks by date range', async () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get(`/api/tasks?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
    });
  });

  describe('GET /api/tasks/:id', () => {
    beforeEach(async () => {
      testTask = new Task({
        title: 'Test Task',
        description: 'Test description',
        userId,
        taskDate: new Date(),
        priority: 'high'
      });
      await testTask.save();
    });

    it('should get a specific task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task._id).toBe(testTask._id.toString());
      expect(response.body.data.task.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    it('should return 404 for task belonging to another user', async () => {
      // Create another user and task
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const otherTask = new Task({
        title: 'Other Task',
        userId: otherUser._id,
        taskDate: new Date()
      });
      await otherTask.save();

      const response = await request(app)
        .get(`/api/tasks/${otherTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      // Clean up
      await User.deleteOne({ _id: otherUser._id });
      await Task.deleteOne({ _id: otherTask._id });
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      testTask = new Task({
        title: 'Original Task',
        description: 'Original description',
        userId,
        taskDate: new Date(),
        priority: 'medium'
      });
      await testTask.save();
    });

    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe('Updated Task');
      expect(response.body.data.task.priority).toBe('high');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    beforeEach(async () => {
      testTask = new Task({
        title: 'Task to Complete',
        userId,
        taskDate: new Date(),
        completed: false
      });
      await testTask.save();
    });

    it('should complete a task and award XP', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actualTime: 30 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.completed).toBe(true);
      expect(response.body.data.task.completedAt).toBeDefined();
      expect(response.body.data.xpResult).toBeDefined();

      // Verify task is actually completed in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.actualTime).toBe(30);
    });

    it('should not complete an already completed task', async () => {
      // First complete the task
      await request(app)
        .patch(`/api/tasks/${testTask._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actualTime: 30 })
        .expect(200);

      // Try to complete again
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actualTime: 30 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already completed');
    });
  });

  describe('PATCH /api/tasks/:id/uncomplete', () => {
    beforeEach(async () => {
      testTask = new Task({
        title: 'Completed Task',
        userId,
        taskDate: new Date(),
        completed: true,
        completedAt: new Date()
      });
      await testTask.save();
    });

    it('should uncomplete a completed task', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/uncomplete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.completed).toBe(false);
      expect(response.body.data.task.completedAt).toBeNull();

      // Verify task is actually uncompleted in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.completed).toBe(false);
    });

    it('should not uncomplete an incomplete task', async () => {
      // First uncomplete the task
      await request(app)
        .patch(`/api/tasks/${testTask._id}/uncomplete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to uncomplete again
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/uncomplete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      testTask = new Task({
        title: 'Task to Delete',
        userId,
        taskDate: new Date()
      });
      await testTask.save();
    });

    it('should delete a task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is actually deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Create test tasks
      const tasks = [
        {
          title: 'Completed Task 1',
          userId,
          taskDate: today,
          completed: true,
          actualTime: 30
        },
        {
          title: 'Completed Task 2',
          userId,
          taskDate: today,
          completed: true,
          actualTime: 45
        },
        {
          title: 'Pending Task',
          userId,
          taskDate: today,
          completed: false
        },
        {
          title: 'Yesterday Task',
          userId,
          taskDate: yesterday,
          completed: true,
          actualTime: 20
        }
      ];

      await Task.insertMany(tasks);
    });

    it('should get task statistics for date range', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .get(`/api/tasks/stats?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.totalTasks).toBe(4);
      expect(response.body.data.stats.completedTasks).toBe(3);
      expect(response.body.data.stats.completionRate).toBe(75);
    });

    it('should validate date range parameters', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PATCH /api/tasks/reorder', () => {
    beforeEach(async () => {
      const today = new Date();
      
      // Create 3 tasks
      const tasks = [
        {
          title: 'Task 1',
          userId,
          taskDate: today,
          order: 0
        },
        {
          title: 'Task 2',
          userId,
          taskDate: today,
          order: 1
        },
        {
          title: 'Task 3',
          userId,
          taskDate: today,
          order: 2
        }
      ];

      await Task.insertMany(tasks);
    });

    it('should reorder tasks successfully', async () => {
      const tasks = await Task.find({ userId, taskDate: new Date() });
      
      const reorderData = {
        taskDate: new Date().toISOString(),
        taskOrders: [
          { id: tasks[0]._id, order: 2 },
          { id: tasks[1]._id, order: 0 },
          { id: tasks[2]._id, order: 1 }
        ]
      };

      const response = await request(app)
        .patch('/api/tasks/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reorderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tasks reordered successfully');

      // Verify reordering
      const updatedTasks = await Task.find({ userId, taskDate: new Date() }).sort({ order: 1 });
      expect(updatedTasks[0].title).toBe('Task 2');
      expect(updatedTasks[1].title).toBe('Task 3');
      expect(updatedTasks[2].title).toBe('Task 1');
    });

    it('should validate reorder data', async () => {
      const response = await request(app)
        .patch('/api/tasks/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all task endpoints', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });
});

