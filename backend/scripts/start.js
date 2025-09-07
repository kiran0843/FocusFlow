#!/usr/bin/env node

/**
 * FocusFlow Backend Startup Script
 * Handles environment setup and server initialization
 */

const path = require('path');
const fs = require('fs');

// Check if config.env exists
const configPath = path.join(__dirname, '..', 'config.env');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath) && fs.existsSync(configPath)) {
  console.log('📋 Creating .env file from config.env...');
  fs.copyFileSync(configPath, envPath);
  console.log('✅ .env file created successfully');
}

// Check for required environment variables
require('dotenv').config({ path: envPath });

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate JWT secret
if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_here_change_in_production') {
  console.warn('⚠️  WARNING: Using default JWT secret. Please change it in production!');
}

// Validate MongoDB URI
if (process.env.MONGODB_URI === 'mongodb://localhost:27017/focusflow') {
  console.log('📊 Using local MongoDB instance');
} else {
  console.log('📊 Using custom MongoDB URI');
}

console.log('🚀 Starting FocusFlow Backend Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${process.env.PORT || 5000}`);

// Start the server
require('../server');
