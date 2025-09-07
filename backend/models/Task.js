const mongoose = require('mongoose');

/**
 * Task Schema for FocusFlow productivity app
 * Users can have maximum 3 tasks per day
 */
const taskSchema = new mongoose.Schema({
  // Basic task information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxLength: [100, 'Task title cannot exceed 100 characters'],
    minLength: [1, 'Task title must be at least 1 character']
  },
  
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Task description cannot exceed 500 characters']
  },
  
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Task date (for daily task limit enforcement)
  taskDate: {
    type: Date,
    required: true,
    index: true
  },
  
  // Task status
  completed: {
    type: Boolean,
    default: false
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  // Task priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Task category
  category: {
    type: String,
    trim: true,
    maxLength: [50, 'Category name cannot exceed 50 characters']
  },
  
  // Estimated time in minutes
  estimatedTime: {
    type: Number,
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [480, 'Estimated time cannot exceed 8 hours']
  },
  
  // Actual time spent in minutes
  actualTime: {
    type: Number,
    default: 0,
    min: [0, 'Actual time cannot be negative']
  },
  
  // Task tags
  tags: [{
    type: String,
    trim: true,
    maxLength: [20, 'Tag cannot exceed 20 characters']
  }],
  
  // Task order for the day
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
taskSchema.index({ userId: 1, taskDate: 1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, taskDate: 1, order: 1 });
taskSchema.index({ userId: 1, priority: 1 });

/**
 * Virtual field to check if task is overdue
 */
taskSchema.virtual('isOverdue').get(function() {
  if (this.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(this.taskDate);
  taskDate.setHours(0, 0, 0, 0);
  return taskDate < today;
});

/**
 * Pre-save middleware to set completedAt when task is completed
 */
taskSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('completed') && !this.completed) {
    this.completedAt = null;
  }
  next();
});

/**
 * Static method to get daily task count for a user
 * @param {string} userId - User ID
 * @param {Date} date - Date to check
 * @returns {Promise<number>} - Number of tasks for the day
 */
taskSchema.statics.getDailyTaskCount = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.countDocuments({
    userId,
    taskDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

/**
 * Static method to get tasks for a specific date
 * @param {string} userId - User ID
 * @param {Date} date - Date to get tasks for
 * @returns {Promise<Array>} - Array of tasks
 */
taskSchema.statics.getTasksForDate = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    taskDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ order: 1, createdAt: 1 });
};

/**
 * Static method to get task statistics for a user
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Object>} - Task statistics
 */
taskSchema.statics.getTaskStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        taskDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        totalEstimatedTime: { $sum: '$estimatedTime' },
        totalActualTime: { $sum: '$actualTime' },
        averageCompletionTime: {
          $avg: {
            $cond: [
              { $and: ['$completed', { $gt: ['$actualTime', 0] }] },
              '$actualTime',
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalTasks: 1,
        completedTasks: 1,
        completionRate: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
            0
          ]
        },
        totalEstimatedTime: 1,
        totalActualTime: 1,
        averageCompletionTime: 1
      }
    }
  ]);
};

/**
 * Instance method to complete a task and award XP
 * @param {number} actualTime - Actual time spent on task
 * @returns {Object} - Completion result with XP information
 */
taskSchema.methods.completeTask = function(actualTime = null) {
  if (this.completed) {
    throw new Error('Task is already completed');
  }
  
  this.completed = true;
  this.completedAt = new Date();
  
  if (actualTime !== null) {
    this.actualTime = actualTime;
  }
  
  return {
    taskId: this._id,
    completed: true,
    completedAt: this.completedAt,
    xpAwarded: 10 // XP for completing a task
  };
};

module.exports = mongoose.model('Task', taskSchema);
