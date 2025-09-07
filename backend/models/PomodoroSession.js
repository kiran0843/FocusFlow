const mongoose = require('mongoose');

/**
 * PomodoroSession Schema for FocusFlow productivity app
 * Tracks individual Pomodoro sessions with XP rewards
 */
const pomodoroSessionSchema = new mongoose.Schema({
  // User reference (always indexed)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Session details
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [120, 'Duration cannot exceed 120 minutes'],
    default: 25
  },

  // Session status
  completed: {
    type: Boolean,
    default: false,
    index: true
  },

  // XP earned from this session
  xpEarned: {
    type: Number,
    default: 0,
    min: [0, 'XP earned cannot be negative']
  },

  // Session timing
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true
  },

  endTime: {
    type: Date,
    default: null
  },

  // Session date (for analytics and daily tracking)
  sessionDate: {
    type: Date,
    required: [true, 'Session date is required'],
    index: true
  },

  // Session type (work, break, long break)
  sessionType: {
    type: String,
    enum: ['work', 'short_break', 'long_break'],
    default: 'work',
    index: true
  },

  // Distraction tracking (legacy - now handled by separate Distraction model)
  distractions: [{
    type: {
      type: String,
      enum: ['phone', 'social_media', 'thoughts', 'other'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      maxLength: [200, 'Distraction note cannot exceed 200 characters']
    }
  }],

  // Session notes
  notes: {
    type: String,
    maxLength: [500, 'Session notes cannot exceed 500 characters']
  },

  // Session quality rating (1-5 stars)
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
pomodoroSessionSchema.index({ userId: 1, sessionDate: -1 });
pomodoroSessionSchema.index({ userId: 1, completed: 1 });
pomodoroSessionSchema.index({ userId: 1, sessionType: 1 });
pomodoroSessionSchema.index({ userId: 1, startTime: -1 });

/**
 * Virtual field to calculate session duration in minutes
 */
pomodoroSessionSchema.virtual('actualDuration').get(function() {
  if (!this.endTime) return null;
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

/**
 * Virtual field to check if session was completed on time
 */
pomodoroSessionSchema.virtual('completedOnTime').get(function() {
  if (!this.completed || !this.endTime) return false;
  const actualDuration = this.actualDuration;
  return actualDuration >= this.duration * 0.9; // Allow 10% tolerance
});

/**
 * Pre-save middleware to set session date
 */
pomodoroSessionSchema.pre('save', function(next) {
  if (this.isNew) {
    // Always set sessionDate for new sessions
    this.sessionDate = new Date(this.startTime || new Date());
    // Set to start of day for consistent daily tracking
    this.sessionDate.setHours(0, 0, 0, 0);
  }
  next();
});

/**
 * Pre-save middleware to calculate XP earned
 */
pomodoroSessionSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && this.xpEarned === 0) {
    // Award 25 XP for completed work sessions, 5 XP for breaks
    if (this.sessionType === 'work') {
      this.xpEarned = 25;
    } else if (this.sessionType === 'short_break' || this.sessionType === 'long_break') {
      this.xpEarned = 5;
    }
  }
  next();
});

/**
 * Instance method to complete a session
 * @param {Date} endTime - When the session ended
 * @param {string} notes - Optional session notes
 * @param {number} rating - Optional session rating (1-5)
 * @returns {Object} - Session completion result
 */
pomodoroSessionSchema.methods.completeSession = function(endTime, notes, rating) {
  if (this.completed) {
    throw new Error('Session is already completed');
  }

  this.completed = true;
  this.endTime = endTime || new Date();
  
  if (notes) this.notes = notes;
  if (rating) this.rating = rating;

  return {
    sessionId: this._id,
    duration: this.duration,
    actualDuration: this.actualDuration,
    xpEarned: this.xpEarned,
    completedOnTime: this.completedOnTime
  };
};

/**
 * Instance method to add distraction
 * @param {string} type - Type of distraction
 * @param {string} note - Optional note about the distraction
 */
pomodoroSessionSchema.methods.addDistraction = function(type, note) {
  this.distractions.push({
    type,
    note: note || '',
    timestamp: new Date()
  });
};

/**
 * Static method to get session statistics for a user
 * @param {ObjectId} userId - User ID
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Object>} - Session statistics
 */
pomodoroSessionSchema.statics.getSessionStats = async function(userId, startDate, endDate) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  const pipeline = [
    {
      $match: {
        userId: objectId,
        sessionDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        totalXP: { $sum: '$xpEarned' },
        totalWorkSessions: {
          $sum: { $cond: [{ $eq: ['$sessionType', 'work'] }, 1, 0] }
        },
        completedWorkSessions: {
          $sum: { $cond: [{ $and: ['$completed', { $eq: ['$sessionType', 'work'] }] }, 1, 0] }
        },
        // Note: totalDistractions will be calculated separately from Distraction model
        averageRating: { $avg: '$rating' },
        totalDuration: { $sum: '$duration' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSessions: 1,
        completedSessions: 1,
        completionRate: {
          $cond: [
            { $gt: ['$totalSessions', 0] },
            { $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] },
            0
          ]
        },
        totalXP: 1,
        totalWorkSessions: 1,
        completedWorkSessions: 1,
        workCompletionRate: {
          $cond: [
            { $gt: ['$totalWorkSessions', 0] },
            { $multiply: [{ $divide: ['$completedWorkSessions', '$totalWorkSessions'] }, 100] },
            0
          ]
        },
        // totalDistractions will be added separately from Distraction model
        averageRating: { $round: ['$averageRating', 1] },
        totalDuration: 1,
        averageSessionDuration: {
          $cond: [
            { $gt: ['$totalSessions', 0] },
            { $round: [{ $divide: ['$totalDuration', '$totalSessions'] }, 1] },
            0
          ]
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    totalXP: 0,
    totalWorkSessions: 0,
    completedWorkSessions: 0,
    workCompletionRate: 0,
    // totalDistractions will be calculated from Distraction model
    averageRating: 0,
    totalDuration: 0,
    averageSessionDuration: 0
  };
};

/**
 * Static method to get daily session history
 * @param {ObjectId} userId - User ID
 * @param {number} limit - Number of days to return
 * @returns {Promise<Array>} - Daily session history
 */
pomodoroSessionSchema.statics.getDailyHistory = async function(userId, limit = 30) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  const pipeline = [
    {
      $match: {
        userId: objectId
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$sessionDate' },
          month: { $month: '$sessionDate' },
          day: { $dayOfMonth: '$sessionDate' }
        },
        date: { $first: '$sessionDate' },
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        totalXP: { $sum: '$xpEarned' },
        totalDuration: { $sum: '$duration' },
        // distractions will be calculated separately from Distraction model
      }
    },
    {
      $sort: { date: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 0,
        date: 1,
        totalSessions: 1,
        completedSessions: 1,
        completionRate: {
          $cond: [
            { $gt: ['$totalSessions', 0] },
            { $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] },
            0
          ]
        },
        totalXP: 1,
        totalDuration: 1,
        // distractions will be added separately from Distraction model
      }
    }
  ];

  return await this.aggregate(pipeline);
};

/**
 * Static method to get current active session for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} - Active session or null
 */
pomodoroSessionSchema.statics.getActiveSession = async function(userId) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  return await this.findOne({
    userId: objectId,
    completed: false
  }).sort({ startTime: -1 });
};

/**
 * Instance method to get distraction count for this session
 * @returns {Promise<number>} - Number of distractions
 */
pomodoroSessionSchema.methods.getDistractionCount = async function() {
  const Distraction = mongoose.model('Distraction');
  return await Distraction.countDocuments({
    pomodoroSessionId: this._id
  });
};

/**
 * Instance method to get distractions for this session
 * @returns {Promise<Array>} - Array of distractions
 */
pomodoroSessionSchema.methods.getDistractions = async function() {
  const Distraction = mongoose.model('Distraction');
  return await Distraction.find({
    pomodoroSessionId: this._id
  }).sort({ timestamp: 1 });
};

/**
 * Instance method to get distraction count for this session
 * @returns {Promise<number>} - Number of distractions
 */
pomodoroSessionSchema.methods.getDistractionCount = async function() {
  const Distraction = mongoose.model('Distraction');
  return await Distraction.countDocuments({
    pomodoroSessionId: this._id
  });
};

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);