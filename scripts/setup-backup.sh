#!/bin/bash
# Setup automated Strapi backups
# This script should be run after Strapi is deployed

set -e

CONTAINER_NAME="${1:-awesomeapps-strapi}"
BACKUP_SCRIPT="/opt/app/scripts/export-backup.sh"

echo "Setting up automated backups for Strapi container: ${CONTAINER_NAME}"

# Check if container exists
if ! docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
  echo "Error: Container '${CONTAINER_NAME}' not found"
  echo "Available containers:"
  docker ps -a --format "table {{.Names}}"
  exit 1
fi

# Copy backup script to container
echo "Copying backup script to container..."
docker cp scripts/export-backup.sh ${CONTAINER_NAME}:${BACKUP_SCRIPT}

# Make script executable
echo "Making script executable..."
docker exec ${CONTAINER_NAME} chmod +x ${BACKUP_SCRIPT}

# Install mysql-client if not present (for mysqldump)
echo "Installing mysql-client..."
docker exec ${CONTAINER_NAME} sh -c "apk add --no-cache mysql-client || apt-get update && apt-get install -y mysql-client || echo 'mysql-client installation failed'"

# Create backup directories
echo "Creating backup directories..."
docker exec ${CONTAINER_NAME} mkdir -p /opt/app/backup/database
docker exec ${CONTAINER_NAME} mkdir -p /opt/app/backup/uploads

# Test the backup script
echo "Testing backup script..."
docker exec ${CONTAINER_NAME} ${BACKUP_SCRIPT}

# Setup cron job (runs at 2:00 AM, 60 min before global backup)
echo "Setting up cron job..."
docker exec ${CONTAINER_NAME} sh -c 'echo "0 2 * * * /opt/app/scripts/export-backup.sh >> /opt/app/logs/backup.log 2>&1" | crontab -'

# Create logs directory
docker exec ${CONTAINER_NAME} mkdir -p /opt/app/logs

# Start crond if not running
docker exec ${CONTAINER_NAME} sh -c "crond || echo 'crond already running'"

echo "Backup setup completed!"
echo ""
echo "Timeline:"
echo "- 2:00 AM - Strapi exports database/uploads to /srv/backups/strapi/"
echo "- 2:30 AM - n8n exports workflows/credentials to /srv/backups/n8n/"
echo "- 3:00 AM - Ansible backs up /srv/backups/ to Storage Box"
echo ""
echo "To verify:"
echo "  docker exec ${CONTAINER_NAME} crontab -l"
echo "  docker exec ${CONTAINER_NAME} cat /opt/app/logs/backup.log"
echo "  ls -la /srv/backups/strapi/"
