#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse .env file
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.error('Please create a .env file with STRAPI_LIVE_URL, STRAPI_LIVE_TOKEN, STRAPI_LOCAL_URL, and STRAPI_LOCAL_TOKEN');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.replace(/\r/g, '').split('\n').forEach(line => {
  if (line.trim().startsWith('#') || !line.trim()) return;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    envVars[key] = value;
  }
});

const STRAPI_LIVE_URL = envVars.STRAPI_LIVE_URL;
const STRAPI_LIVE_TOKEN = envVars.STRAPI_LIVE_TOKEN;
const STRAPI_LOCAL_URL = envVars.STRAPI_LOCAL_URL;
const STRAPI_LOCAL_TOKEN = envVars.STRAPI_LOCAL_TOKEN;

if (!STRAPI_LIVE_URL || !STRAPI_LIVE_TOKEN) {
  console.error('❌ Error: STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN must be set in .env file');
  process.exit(1);
}

if (!STRAPI_LOCAL_URL || !STRAPI_LOCAL_TOKEN) {
  console.error('❌ Error: STRAPI_LOCAL_URL and STRAPI_LOCAL_TOKEN must be set in .env file');
  process.exit(1);
}

const command = `strapi transfer --to="${STRAPI_LIVE_URL}" --to-token="${STRAPI_LIVE_TOKEN}"`;

console.log('⚠️  WARNING: You are about to push local data to the live server!');
console.log(`📤 Pushing data to: ${STRAPI_LIVE_URL}`);
console.log(`📍 Pushing data from: ${STRAPI_LOCAL_URL}`);
console.log('');
console.log('⚠️  This will OVERWRITE all data on the live server with your local data.');
console.log('');

try {
  execSync(command, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      STRAPI_TRANSFER_URL: STRAPI_LIVE_URL,
      STRAPI_TRANSFER_TOKEN: STRAPI_LIVE_TOKEN
    }
  });
  console.log('');
  console.log('✅ Transfer completed successfully!');
} catch (error) {
  console.error('');
  console.error('❌ Transfer failed!');
  process.exit(1);
}
