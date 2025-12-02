#!/usr/bin/env node
/**
 * Environment Variables Validation Script
 * 
 * Validates that all required environment variables are set
 * and provides helpful error messages if any are missing.
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate:env
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Environment variable requirements
 */
const REQUIRED_VARS = {
  development: [
    'PORT',
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_POSTGRES_PRISMA_URL',
    'SUPABASE_POSTGRES_URL_NON_POOLING',
    'JWT_SECRET'
  ],
  production: [
    'PORT',
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_POSTGRES_PRISMA_URL',
    'SUPABASE_POSTGRES_URL_NON_POOLING',
    'JWT_SECRET'
  ]
};

const OPTIONAL_VARS = [
  'SENDGRID_API_KEY',
  'MAILERSEND_API_KEY',
  'EMAIL_FROM',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

/**
 * Variable descriptions for helpful error messages
 */
const VAR_DESCRIPTIONS = {
  'PORT': 'Server port number (e.g., 3001)',
  'NODE_ENV': 'Environment mode (development, production, test)',
  'SUPABASE_URL': 'Your Supabase project URL',
  'SUPABASE_ANON_KEY': 'Supabase anonymous/public key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key (production only)',
  'SUPABASE_POSTGRES_PRISMA_URL': 'PostgreSQL connection URL for Prisma',
  'SUPABASE_POSTGRES_URL_NON_POOLING': 'Non-pooling PostgreSQL connection URL',
  'JWT_SECRET': 'Secret key for JWT token signing (use a strong random string)',
  'SENDGRID_API_KEY': 'SendGrid API key for sending emails',
  'MAILERSEND_API_KEY': 'MailerSend API key (fallback)',
  'EMAIL_FROM': 'From email address for outgoing emails',
  'ADMIN_EMAIL': 'Admin user email for seeding',
  'ADMIN_PASSWORD': 'Admin user password for seeding'
};

/**
 * Check if .env file exists
 */
function checkEnvFile() {
  const envPath = join(__dirname, '..', '.env');
  
  if (!existsSync(envPath)) {
    console.error('❌ Error: .env file not found!\n');
    console.log('📝 Create a .env file in the backend directory with the following variables:\n');
    
    REQUIRED_VARS.development.forEach(varName => {
      console.log(`${varName}=${VAR_DESCRIPTIONS[varName] || ''}`);
    });
    
    console.log('\n💡 See README.md for detailed setup instructions.\n');
    return false;
  }
  
  return true;
}

/**
 * Validate environment variables
 */
function validateEnv() {
  console.log('🔍 Validating environment variables...\n');
  
  const env = process.env.NODE_ENV || 'development';
  const required = REQUIRED_VARS[env] || REQUIRED_VARS.development;
  
  const missing = [];
  const warnings = [];
  
  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`  ✅ ${varName}`);
    }
  });
  
  // Check optional variables
  console.log('\n📋 Optional variables:');
  OPTIONAL_VARS.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`  ⚠️  ${varName} (not set)`);
      warnings.push(varName);
    } else {
      console.log(`  ✅ ${varName}`);
    }
  });
  
  // Report results
  console.log('\n' + '='.repeat(50));
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set!\n');
    
    if (warnings.length > 0) {
      console.log('⚠️  Optional variables not set:');
      warnings.forEach(varName => {
        console.log(`   - ${varName}: ${VAR_DESCRIPTIONS[varName] || 'Optional'}`);
      });
      console.log('\n💡 These are optional but may be needed for certain features.\n');
    }
    
    return true;
  } else {
    console.log('❌ Missing required environment variables:\n');
    
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
      console.log(`     ${VAR_DESCRIPTIONS[varName] || 'Required'}\n`);
    });
    
    console.log('📝 Add these to your .env file before starting the server.\n');
    return false;
  }
}

/**
 * Validate specific values
 */
function validateValues() {
  const errors = [];
  
  // Validate PORT
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('PORT must be a number between 1 and 65535');
    }
  }
  
  // Validate NODE_ENV
  if (process.env.NODE_ENV) {
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(process.env.NODE_ENV)) {
      errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    }
  }
  
  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters for security');
  }
  
  // Warn about weak JWT_SECRET
  if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
    errors.push('⚠️  WARNING: Using default JWT_SECRET! Change this in production!');
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️  Validation warnings:');
    errors.forEach(error => console.log(`   - ${error}`));
    console.log('');
  }
  
  return errors.length === 0;
}

/**
 * Main function
 */
function main() {
  console.log('🔐 SkillSwap Environment Validation\n');
  
  // Check if .env file exists
  if (!checkEnvFile()) {
    process.exit(1);
  }
  
  // Validate environment variables
  const hasAllRequired = validateEnv();
  
  // Validate specific values
  const valuesOk = validateValues();
  
  if (!hasAllRequired) {
    console.log('❌ Environment validation failed!\n');
    process.exit(1);
  }
  
  console.log('✅ Environment validation successful!\n');
  console.log('🚀 You can now run the server with: npm run dev\n');
  process.exit(0);
}

// Run validation
main();
