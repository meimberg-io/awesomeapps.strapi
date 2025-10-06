#!/bin/bash
# Bash script to push data to live Strapi instance
# This reads the token from .env file automatically

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

# Check if required variables are set
if [ -z "$STRAPI_LIVE_URL" ] || [ -z "$STRAPI_LIVE_TOKEN" ]; then
    echo "Error: STRAPI_LIVE_URL and STRAPI_LIVE_TOKEN must be set in .env file"
    exit 1
fi

# Warning message
echo "⚠️  WARNING: You are about to push local data to the live server!"
echo "📤 Pushing data to: $STRAPI_LIVE_URL"
echo ""
echo "⚠️  This will OVERWRITE all data on the live server with your local data."
echo ""

# Run the transfer command
npm run push-live

