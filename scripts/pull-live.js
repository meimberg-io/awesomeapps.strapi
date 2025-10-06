#!/usr/bin/env node
/**
 * Pull data from live Strapi instance
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
  
  // First, read the .env file to get the tokens
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!');
    console.error('Please create a .env file with STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN');
    process.exit(1);
  }

  // Parse .env file
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  const lines = envContent.replace(/\r/g, '').split('\n');

  lines.forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      envVars[key] = value;
    }
  });

  // Check required variables
  if (!envVars.STRAPI_LIVE_URL || !envVars.STRAPI_LIVE_TOKEN) {
    console.error('❌ Error: STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN must be set in .env file');
    process.exit(1);
  }

  try {
    // Check if strapi-dev container is running
    execSync('docker ps --filter "name=strapi-dev" --filter "status=running" --format "{{.Names}}"', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    
    // Run the command inside the container with environment variables
    const dockerCmd = `docker exec -i -e STRAPI_LIVE_URL="${envVars.STRAPI_LIVE_URL}" -e STRAPI_LIVE_TOKEN="${envVars.STRAPI_LIVE_TOKEN}" strapi-dev npm run pull-live`;
    execSync(dockerCmd, { 
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
    console.error('  npm run pull-live');
    process.exit(1);
  }
}

// Check if environment variables are already set (from docker exec)
let STRAPI_LIVE_URL = process.env.STRAPI_LIVE_URL;
let STRAPI_LIVE_TOKEN = process.env.STRAPI_LIVE_TOKEN;

// If not set, try to load from .env file
if (!STRAPI_LIVE_URL || !STRAPI_LIVE_TOKEN) {
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

  STRAPI_LIVE_URL = envVars.STRAPI_LIVE_URL;
  STRAPI_LIVE_TOKEN = envVars.STRAPI_LIVE_TOKEN;
}

// Check required variables
if (!STRAPI_LIVE_URL || !STRAPI_LIVE_TOKEN) {
  console.error('❌ Error: STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN must be set in .env file');
  process.exit(1);
}

// Build the command
const command = `strapi transfer --from="${STRAPI_LIVE_URL}" --from-token="${STRAPI_LIVE_TOKEN}"`;

console.log(`📥 Pulling data from: ${STRAPI_LIVE_URL}`);
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

