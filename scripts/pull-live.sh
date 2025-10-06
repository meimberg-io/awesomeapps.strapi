#!/bin/bash
# Bash script to pull data from live Strapi instance
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

# Run the transfer command
echo "Pulling data from: $STRAPI_LIVE_URL"
npm run pull-live

