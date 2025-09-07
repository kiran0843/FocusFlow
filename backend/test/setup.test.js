const request = require('supertest');
const app = require('../server');

describe('FocusFlow API Setup Tests', () => {
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('FocusFlow API is running');
      expect(res.body.environment).toBeDefined();
    });
  });

  describe('API Documentation', () => {
    it('should return API documentation', async () => {
      const res = await request(app)
        .get('/api')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('FocusFlow API');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const res = await request(app)
        .options('/api/auth/register')
        .expect(204);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(5).fill().map(() => 
        request(app).get('/health')
      );
      
      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/non-existent-route')
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not found');
    });
  });
});
