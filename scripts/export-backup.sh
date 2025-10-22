#!/bin/bash
# Strapi Backup Export Script
# Exports database and uploads to mounted backup directory
# Designed to run inside the Strapi container via cron

set -e

BACKUP_ROOT="/opt/app/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Ensure backup directories exist
mkdir -p "${BACKUP_ROOT}/database"
mkdir -p "${BACKUP_ROOT}/uploads"

echo "[$(date)] Starting Strapi backup export..."

# Clean old exports (keep current only)
rm -rf "${BACKUP_ROOT}/database"/* 2>/dev/null || true
rm -rf "${BACKUP_ROOT}/uploads"/* 2>/dev/null || true

# Export database (MySQL dump)
echo "[$(date)] Exporting database..."
mysqldump -h ${DATABASE_HOST} -u ${DATABASE_USERNAME} -p${DATABASE_PASSWORD} \
  --single-transaction --quick --lock-tables=false ${DATABASE_NAME} \
  > "${BACKUP_ROOT}/database/strapi_db_${DATE}.sql" 2>/dev/null || {
  echo "[$(date)] Database export failed - container may not have mysqldump"
  echo "Database export failed" > "${BACKUP_ROOT}/database/export_failed.txt"
}

# Copy uploads directory
echo "[$(date)] Exporting uploads..."
if [ -d "/opt/app/public/uploads" ]; then
  cp -r /opt/app/public/uploads/* "${BACKUP_ROOT}/uploads/" 2>/dev/null || {
    echo "[$(date)] Uploads export failed"
    echo "Uploads export failed" > "${BACKUP_ROOT}/uploads/export_failed.txt"
  }
else
  echo "[$(date)] No uploads directory found"
  echo "No uploads directory" > "${BACKUP_ROOT}/uploads/no_uploads.txt"
fi

# Verify exports
DB_EXISTS=$([ -f "${BACKUP_ROOT}/database/strapi_db_${DATE}.sql" ] && echo "yes" || echo "no")
UPLOADS_COUNT=$(find "${BACKUP_ROOT}/uploads" -type f 2>/dev/null | wc -l)

echo "[$(date)] Export completed:"
echo "  - Database: ${DB_EXISTS}"
echo "  - Uploads: ${UPLOADS_COUNT} files"

# Create metadata file
cat > "${BACKUP_ROOT}/last_export.txt" <<EOF
Last Export: $(date)
Database: ${DB_EXISTS}
Uploads: ${UPLOADS_COUNT} files
EOF

echo "[$(date)] Backup export successful"
