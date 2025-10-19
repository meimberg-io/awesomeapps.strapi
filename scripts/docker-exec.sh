#!/bin/bash
# Helper script to run scripts inside Docker container

CONTAINER_NAME="strapi-dev"
SCRIPT_FILE=$1

if [ -z "$SCRIPT_FILE" ]; then
  echo "❌ Error: No script file provided"
  echo "Usage: ./scripts/docker-exec.sh <script-file>"
  exit 1
fi

# Check if container is running
if ! docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
  echo "❌ Error: $CONTAINER_NAME container is not running!"
  echo ""
  echo "Please start the container first:"
  echo "  docker-compose up -d"
  exit 1
fi

echo "🐳 Running inside Docker container..."
echo ""

# Execute the script directly inside container
docker exec -i $CONTAINER_NAME node "scripts/$SCRIPT_FILE"

