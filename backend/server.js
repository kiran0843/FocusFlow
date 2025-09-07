const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

// Import configurations and middleware
const { connectDB } = require('./config/database');
const { globalErrorHandler, notFound, rateLimitHandler } = require('./middleware/errorHandler');
const CronService = require('./services/cronService');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const pomodoroRoutes = require('./routes/pomodoro');
const analyticsRoutes = require('./routes/analytics');
const distractionRoutes = require('./routes/distractions');
const rewardsRoutes = require('./routes/rewards');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize cron jobs
CronService.initialize();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - Completely disabled for development
console.log('🚫 Rate limiting completely disabled for development');
// TODO: Re-enable rate limiting in production

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FocusFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/distractions', distractionRoutes);
app.use('/api/rewards', rewardsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FocusFlow API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/change-password': 'Change user password'
      },
      tasks: {
        'GET /api/tasks': 'Get tasks with filtering (date, completion, priority)',
        'POST /api/tasks': 'Create a new task (max 3 per day)',
        'GET /api/tasks/:id': 'Get a specific task by ID',
        'PUT /api/tasks/:id': 'Update a task',
        'PATCH /api/tasks/:id/complete': 'Mark a task as completed (awards XP)',
        'PATCH /api/tasks/:id/uncomplete': 'Mark a task as incomplete',
        'DELETE /api/tasks/:id': 'Delete a task',
        'PATCH /api/tasks/reorder': 'Reorder tasks for a specific date',
        'GET /api/tasks/stats': 'Get task statistics for date range'
      },
      pomodoro: {
        'GET /api/pomodoro/sessions': 'Get pomodoro sessions',
        'POST /api/pomodoro/sessions': 'Create a new session',
        'GET /api/pomodoro/active': 'Get active session',
        'PATCH /api/pomodoro/sessions/:id/start': 'Start a session',
        'PATCH /api/pomodoro/sessions/:id/pause': 'Pause a session',
        'PATCH /api/pomodoro/sessions/:id/resume': 'Resume a session',
        'PATCH /api/pomodoro/sessions/:id/complete': 'Complete a session',
        'GET /api/pomodoro/sessions/stats': 'Get session statistics'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Get dashboard analytics',
        'GET /api/analytics/tasks': 'Get task analytics',
        'GET /api/analytics/pomodoro': 'Get pomodoro analytics',
        'GET /api/analytics/streaks': 'Get user streaks',
        'GET /api/analytics/leaderboard': 'Get user leaderboard'
      },
      distractions: {
        'POST /api/distractions': 'Log a new distraction',
        'GET /api/distractions': 'Get distractions with filtering',
        'GET /api/distractions/stats': 'Get distraction statistics',
        'GET /api/distractions/trends': 'Get distraction trends over time',
        'GET /api/distractions/patterns': 'Get distraction patterns',
        'GET /api/distractions/top': 'Get top distractions by frequency',
        'PATCH /api/distractions/:id/resolve': 'Mark distraction as resolved',
        'PUT /api/distractions/:id': 'Update a distraction',
        'DELETE /api/distractions/:id': 'Delete a distraction'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    },
    documentation: 'https://github.com/your-repo/focusflow-api'
  });
});

// Handle 404 for undefined routes
app.use(notFound);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 FocusFlow API Server Started!
📍 Environment: ${process.env.NODE_ENV}
🌐 Server: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📚 API Docs: http://localhost:${PORT}/api
⏰ Started at: ${new Date().toISOString()}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception:', err.message);
  console.log('Shutting down the server...');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;
