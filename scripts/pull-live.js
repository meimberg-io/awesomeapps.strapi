#!/usr/bin/env node
/**
 * Pull data from live Strapi instance
 * This script loads environment variables from .env and runs the transfer command
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.error('Please create a .env file with STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN');
  process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

// Remove any carriage returns and split by newline
const lines = envContent.replace(/\r/g, '').split('\n');

lines.forEach(line => {
  // Skip comments and empty lines
  if (line.trim().startsWith('#') || !line.trim()) {
    return;
  }
  
  // Parse key=value
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    // Remove any quotes if present
    envVars[key] = value.replace(/^["'](.*)["']$/, '$1');
  }
});

// Check required variables
if (!envVars.STRAPI_LIVE_URL || !envVars.STRAPI_LIVE_TOKEN) {
  console.error('❌ Error: STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN must be set in .env file');
  process.exit(1);
}

// Build the command
const command = `strapi transfer --from="${envVars.STRAPI_LIVE_URL}" --from-token="${envVars.STRAPI_LIVE_TOKEN}"`;

console.log(`📥 Pulling data from: ${envVars.STRAPI_LIVE_URL}`);
console.log('');

try {
  // Run the command
  execSync(command, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('');
  console.log('✅ Transfer completed successfully!');
} catch (error) {
  console.error('');
  console.error('❌ Transfer failed!');
  process.exit(1);
}

