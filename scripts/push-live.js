#!/usr/bin/env node
/**
 * Push data to live Strapi instance
 * This script detects if running in Docker and executes accordingly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if running inside Docker container
const isInDocker = fs.existsSync('/.dockerenv') || fs.existsSync('/run/.containerenv');

// If not in Docker, try to run inside the Docker container
if (!isInDocker) {
  console.log('🐳 Detected local environment, running command inside Docker container...');
  console.log('');
  
  try {
    // Check if strapi-dev container is running
    execSync('docker ps --filter "name=strapi-dev" --filter "status=running" --format "{{.Names}}"', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    
    // Run the command inside the container
    execSync('docker exec -it strapi-dev npm run push-live', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error: strapi-dev container is not running!');
    console.error('');
    console.error('Please start the container first:');
    console.error('  docker-compose up -d');
    console.error('');
    console.error('Then try again:');
    console.error('  npm run push-live');
    process.exit(1);
  }
}

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
const command = `strapi transfer --to="${envVars.STRAPI_LIVE_URL}" --to-token="${envVars.STRAPI_LIVE_TOKEN}"`;

console.log('⚠️  WARNING: You are about to push local data to the live server!');
console.log(`📤 Pushing data to: ${envVars.STRAPI_LIVE_URL}`);
console.log('');
console.log('⚠️  This will OVERWRITE all data on the live server with your local data.');
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

