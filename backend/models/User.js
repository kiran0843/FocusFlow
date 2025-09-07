const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for FocusFlow productivity app
 * Includes gamification fields (XP, level) and user authentication
 */
const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters'],
    minLength: [2, 'Name must be at least 2 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Gamification fields
  xp: {
    type: Number,
    default: 0,
    min: [0, 'XP cannot be negative']
  },
  
  level: {
    type: Number,
    default: 1,
    min: [1, 'Level must be at least 1']
  },
  
  // User preferences and settings
  preferences: {
    pomodoroDuration: {
      type: Number,
      default: 25,
      min: [5, 'Pomodoro duration must be at least 5 minutes'],
      max: [60, 'Pomodoro duration cannot exceed 60 minutes']
    },
    breakDuration: {
      type: Number,
      default: 5,
      min: [1, 'Break duration must be at least 1 minute'],
      max: [30, 'Break duration cannot exceed 30 minutes']
    },
    dailyTaskLimit: {
      type: Number,
      default: 3,
      min: [1, 'Daily task limit must be at least 1'],
      max: [10, 'Daily task limit cannot exceed 10']
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Reward tracking
  lastStreakReward: {
    type: Number,
    default: 0,
    min: [0, 'Last streak reward cannot be negative']
  },
  
  lastWeeklyReward: {
    type: Number,
    default: 0,
    min: [0, 'Last weekly reward cannot be negative']
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ xp: -1 });
userSchema.index({ level: -1 });
userSchema.index({ createdAt: -1 });

/**
 * Virtual field to calculate XP needed for next level
 */
userSchema.virtual('xpForNextLevel').get(function() {
  const currentLevel = this.level;
  const nextLevelXP = currentLevel * 100;
  return nextLevelXP - this.xp;
});

/**
 * Virtual field to calculate progress percentage to next level
 */
userSchema.virtual('levelProgress').get(function() {
  const currentLevel = this.level;
  const currentLevelXP = (currentLevel - 1) * 100;
  const nextLevelXP = currentLevel * 100;
  const progressXP = this.xp - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;
  
  return Math.min(100, Math.max(0, (progressXP / totalXPNeeded) * 100));
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to update level based on XP
 */
userSchema.pre('save', function(next) {
  if (this.isModified('xp')) {
    const newLevel = Math.floor(this.xp / 100) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
    }
  }
  next();
});

/**
 * Instance method to compare password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to add XP and handle level up
 * @param {number} xpToAdd - Amount of XP to add
 * @returns {Object} - Result with level up information
 */
userSchema.methods.addXP = function(xpToAdd) {
  const oldLevel = this.level;
  this.xp += xpToAdd;
  
  // Level will be updated by pre-save middleware
  const newLevel = Math.floor(this.xp / 100) + 1;
  const leveledUp = newLevel > oldLevel;
  
  // Award level up bonus if user leveled up
  let levelUpBonus = 0;
  if (leveledUp) {
    levelUpBonus = 100; // LEVEL_UP_BONUS
    this.xp += levelUpBonus;
  }
  
  return {
    leveledUp,
    oldLevel,
    newLevel,
    xpGained: xpToAdd + levelUpBonus,
    levelUpBonus,
    totalXP: this.xp
  };
};

/**
 * Static method to find user by email (including password)
 * @param {string} email - User email
 * @returns {Promise<Object>} - User document with password
 */
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

/**
 * Static method to get leaderboard
 * @param {number} limit - Number of users to return
 * @returns {Promise<Array>} - Array of top users
 */
userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true })
    .select('name email xp level')
    .sort({ xp: -1, level: -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);
