const mongoose = require('mongoose');

/**
 * Distraction Schema for FocusFlow productivity app
 * Tracks individual distractions during Pomodoro sessions
 */
const distractionSchema = new mongoose.Schema({
  // User reference (always indexed)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Pomodoro session reference
  pomodoroSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PomodoroSession',
    required: [true, 'Pomodoro session ID is required'],
    index: true
  },

  // Distraction type
  type: {
    type: String,
    required: [true, 'Distraction type is required'],
    enum: ['phone', 'social_media', 'thoughts', 'email', 'noise', 'people', 'other'],
    index: true
  },

  // Distraction duration in seconds
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 second'],
    max: [3600, 'Duration cannot exceed 1 hour'],
    default: 30 // Default 30 seconds
  },

  // When the distraction occurred
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    default: Date.now,
    index: true
  },

  // Distraction details
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },

  // Severity level (1-5)
  severity: {
    type: Number,
    min: [1, 'Severity must be at least 1'],
    max: [5, 'Severity cannot exceed 5'],
    default: 3
  },

  // Whether the distraction was resolved
  resolved: {
    type: Boolean,
    default: false
  },

  // Resolution method
  resolutionMethod: {
    type: String,
    enum: ['ignored', 'addressed', 'postponed', 'delegated', 'blocked'],
    default: 'ignored'
  },

  // Impact on session (1-5)
  impact: {
    type: Number,
    min: [1, 'Impact must be at least 1'],
    max: [5, 'Impact cannot exceed 5'],
    default: 3
  },

  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    maxLength: [20, 'Tag cannot exceed 20 characters']
  }],

  // Location/context where distraction occurred
  context: {
    type: String,
    enum: ['home', 'office', 'cafe', 'library', 'other'],
    default: 'other'
  },

  // Device/platform that caused distraction
  source: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'external', 'internal'],
    default: 'external'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
distractionSchema.index({ userId: 1, timestamp: -1 });
distractionSchema.index({ userId: 1, type: 1 });
distractionSchema.index({ pomodoroSessionId: 1, timestamp: 1 });
distractionSchema.index({ userId: 1, resolved: 1 });
distractionSchema.index({ userId: 1, severity: 1 });

/**
 * Virtual field to calculate distraction frequency
 */
distractionSchema.virtual('frequency').get(function() {
  // This would be calculated in aggregation queries
  return 0;
});

/**
 * Virtual field to get distraction category
 */
distractionSchema.virtual('category').get(function() {
  const categories = {
    phone: 'Digital',
    social_media: 'Digital',
    email: 'Digital',
    thoughts: 'Mental',
    noise: 'Environmental',
    people: 'Social',
    other: 'Other'
  };
  return categories[this.type] || 'Other';
});

/**
 * Pre-save middleware to validate session exists
 */
distractionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const PomodoroSession = mongoose.model('PomodoroSession');
      const session = await PomodoroSession.findById(this.pomodoroSessionId);
      if (!session) {
        return next(new Error('Pomodoro session not found'));
      }
      if (session.userId.toString() !== this.userId.toString()) {
        return next(new Error('Session does not belong to user'));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

/**
 * Instance method to mark distraction as resolved
 * @param {string} method - Resolution method
 * @param {string} notes - Optional resolution notes
 */
distractionSchema.methods.resolve = function(method, notes) {
  this.resolved = true;
  this.resolutionMethod = method;
  if (notes) {
    this.description = (this.description || '') + ` | Resolution: ${notes}`;
  }
};

/**
 * Static method to get distraction statistics for a user
 * @param {ObjectId} userId - User ID
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Object>} - Distraction statistics
 */
distractionSchema.statics.getDistractionStats = async function(userId, startDate, endDate) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  const pipeline = [
    {
      $match: {
        userId: objectId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDistractions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' },
        averageSeverity: { $avg: '$severity' },
        averageImpact: { $avg: '$impact' },
        resolvedCount: {
          $sum: { $cond: ['$resolved', 1, 0] }
        },
        byType: {
          $push: {
            type: '$type',
            duration: '$duration',
            severity: '$severity',
            impact: '$impact',
            resolved: '$resolved'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalDistractions: 1,
        totalDuration: 1,
        averageDuration: { $round: ['$averageDuration', 1] },
        averageSeverity: { $round: ['$averageSeverity', 1] },
        averageImpact: { $round: ['$averageImpact', 1] },
        resolutionRate: {
          $cond: [
            { $gt: ['$totalDistractions', 0] },
            { $multiply: [{ $divide: ['$resolvedCount', '$totalDistractions'] }, 100] },
            0
          ]
        },
        byType: 1
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  const stats = result[0] || {
    totalDistractions: 0,
    totalDuration: 0,
    averageDuration: 0,
    averageSeverity: 0,
    averageImpact: 0,
    resolutionRate: 0,
    byType: []
  };

  // Process byType data
  const typeStats = {};
  stats.byType.forEach(distraction => {
    if (!typeStats[distraction.type]) {
      typeStats[distraction.type] = {
        count: 0,
        totalDuration: 0,
        averageSeverity: 0,
        averageImpact: 0,
        resolvedCount: 0
      };
    }
    typeStats[distraction.type].count++;
    typeStats[distraction.type].totalDuration += distraction.duration;
    typeStats[distraction.type].averageSeverity += distraction.severity;
    typeStats[distraction.type].averageImpact += distraction.impact;
    if (distraction.resolved) {
      typeStats[distraction.type].resolvedCount++;
    }
  });

  // Calculate averages for each type
  Object.keys(typeStats).forEach(type => {
    const typeData = typeStats[type];
    typeData.averageSeverity = Math.round((typeData.averageSeverity / typeData.count) * 10) / 10;
    typeData.averageImpact = Math.round((typeData.averageImpact / typeData.count) * 10) / 10;
    typeData.resolutionRate = Math.round((typeData.resolvedCount / typeData.count) * 100);
  });

  stats.byType = typeStats;
  return stats;
};

/**
 * Static method to get distraction trends over time
 * @param {ObjectId} userId - User ID
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Array>} - Daily distraction trends
 */
distractionSchema.statics.getDistractionTrends = async function(userId, days = 30) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  const pipeline = [
    {
      $match: {
        userId: objectId,
        timestamp: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        date: { $first: '$timestamp' },
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageSeverity: { $avg: '$severity' },
        averageImpact: { $avg: '$impact' },
        resolvedCount: {
          $sum: { $cond: ['$resolved', 1, 0] }
        },
        byType: {
          $push: '$type'
        }
      }
    },
    {
      $sort: { date: -1 }
    },
    {
      $limit: days
    },
    {
      $project: {
        _id: 0,
        date: 1,
        count: 1,
        totalDuration: 1,
        averageSeverity: { $round: ['$averageSeverity', 1] },
        averageImpact: { $round: ['$averageImpact', 1] },
        resolutionRate: {
          $cond: [
            { $gt: ['$count', 0] },
            { $multiply: [{ $divide: ['$resolvedCount', '$count'] }, 100] },
            0
          ]
        },
        byType: 1
      }
    }
  ];

  return await this.aggregate(pipeline);
};

/**
 * Static method to get distraction patterns
 * @param {ObjectId} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Distraction patterns
 */
distractionSchema.statics.getDistractionPatterns = async function(userId, startDate, endDate) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  const pipeline = [
    {
      $match: {
        userId: objectId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        hourlyPattern: {
          $push: {
            hour: { $hour: '$timestamp' },
            type: '$type',
            severity: '$severity'
          }
        },
        dailyPattern: {
          $push: {
            dayOfWeek: { $dayOfWeek: '$timestamp' },
            type: '$type',
            severity: '$severity'
          }
        },
        contextPattern: {
          $push: {
            context: '$context',
            type: '$type',
            severity: '$severity'
          }
        },
        sourcePattern: {
          $push: {
            source: '$source',
            type: '$type',
            severity: '$severity'
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    hourlyPattern: [],
    dailyPattern: [],
    contextPattern: [],
    sourcePattern: []
  };
};

/**
 * Static method to get top distractions
 * @param {ObjectId} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Top distractions
 */
distractionSchema.statics.getTopDistractions = async function(userId, startDate, endDate, limit = 10) {
  // Ensure userId is a valid ObjectId
  const objectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  
  const pipeline = [
    {
      $match: {
        userId: objectId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        averageSeverity: { $avg: '$severity' },
        averageImpact: { $avg: '$impact' },
        resolvedCount: {
          $sum: { $cond: ['$resolved', 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        count: 1,
        totalDuration: 1,
        averageSeverity: { $round: ['$averageSeverity', 1] },
        averageImpact: { $round: ['$averageImpact', 1] },
        resolutionRate: {
          $cond: [
            { $gt: ['$count', 0] },
            { $multiply: [{ $divide: ['$resolvedCount', '$count'] }, 100] },
            0
          ]
        }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Distraction', distractionSchema);












