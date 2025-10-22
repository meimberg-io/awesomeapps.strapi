# Strapi Backup Setup

Automated backup of Strapi database and uploads using the same architecture as n8n.

## Architecture

**Backup Directory Structure**:
```
/srv/backups/strapi/          ← Mounted to Strapi container at /opt/app/backup
├── database/                 ← Database dumps
│   └── strapi_db_YYYYMMDD_HHMMSS.sql
├── uploads/                  ← Uploaded files
│   ├── uploads/
│   └── ...
└── last_export.txt          ← Export metadata
```

**How It Works**:
1. Strapi container has `/srv/backups/strapi` mounted as `/opt/app/backup`
2. Strapi exports its database and uploads to this directory (via cron)
3. Ansible backup script includes `/srv/backups/` in nightly archive
4. Clean separation: Strapi manages exports, Ansible manages archival

## Automatic Backups

### What Gets Backed Up

Every night at 2:00 AM, Strapi exports:

1. **Database** (MySQL dump)
   - Complete database export using mysqldump
   - Includes all content, users, and configurations
   
2. **Uploads** (file system backup)
   - All uploaded files from `/opt/app/public/uploads`
   - Media files, documents, etc.

3. **File System** (complete Docker volume backup)
   - Full `/srv/projects/awesomeapps-strapi/` directory
   - Docker configuration files

### Backup Structure

```
backup_YYYYMMDD_HHMMSS.tar.gz
└── files_YYYYMMDD_HHMMSS.tar.gz
    ├── backups/
    │   ├── strapi/
    │   │   ├── database/strapi_db_*.sql
    │   │   ├── uploads/
    │   │   └── last_export.txt
    │   ├── n8n/
    │   └── matomo/
    ├── projects/awesomeapps-strapi/
    └── traefik/
```

### Storage

- **Location**: Hetzner Storage Box
- **Retention**: 14 days
- **Schedule**: Daily at 2:00 AM (Strapi) → 2:30 AM (n8n) → 3:00 AM (Ansible)
- **Path**: `/backups/backup_YYYYMMDD_HHMMSS.tar.gz`

## Setup Strapi Backup Export

### Option 1: Automated Setup (Recommended)

After Strapi is deployed, run the setup script:

```bash
# SSH to server
ssh deploy@hc-02.meimberg.io

# Navigate to Strapi project
cd /srv/projects/awesomeapps-strapi

# Run setup script
./scripts/setup-backup.sh awesomeapps-strapi
```

This will:
- Copy the backup script to the container
- Install mysql-client for database dumps
- Create backup directories
- Setup cron job for 2:30 AM exports
- Test the backup script

### Option 2: Manual Setup

```bash
# SSH to server
ssh deploy@hc-02.meimberg.io

# Copy script to container
docker cp scripts/export-backup.sh awesomeapps-strapi:/opt/app/scripts/export-backup.sh

# Make executable
docker exec awesomeapps-strapi chmod +x /opt/app/scripts/export-backup.sh

# Install mysql-client
docker exec awesomeapps-strapi apk add --no-cache mysql-client

# Create directories
docker exec awesomeapps-strapi mkdir -p /opt/app/backup/{database,uploads,logs}

# Add cron job (runs at 2:00 AM)
docker exec awesomeapps-strapi sh -c 'echo "0 2 * * * /opt/app/scripts/export-backup.sh >> /opt/app/logs/backup.log 2>&1" | crontab -'

# Start crond
docker exec awesomeapps-strapi crond
```

### Option 3: Use Deployment Script

Add to `.github/workflows/deploy.yml` after container is started:

```yaml
- name: Setup Strapi backup export
  run: |
    docker cp scripts/export-backup.sh awesomeapps-strapi:/opt/app/scripts/export-backup.sh
    docker exec awesomeapps-strapi chmod +x /opt/app/scripts/export-backup.sh
    docker exec awesomeapps-strapi apk add --no-cache mysql-client
    docker exec awesomeapps-strapi mkdir -p /opt/app/backup/{database,uploads,logs}
    docker exec awesomeapps-strapi sh -c 'echo "0 2 * * * /opt/app/scripts/export-backup.sh >> /opt/app/logs/backup.log 2>&1" | crontab -'
    docker exec awesomeapps-strapi crond
```

## Verify Automated Backup

Check after first automated run:

```bash
# Check export log
ssh deploy@hc-02.meimberg.io
docker exec awesomeapps-strapi cat /opt/app/logs/backup.log

# Check exports
ls -lh /srv/backups/strapi/database/
ls -lh /srv/backups/strapi/uploads/
cat /srv/backups/strapi/last_export.txt

# Check Ansible backup includes Strapi
ssh root@hc-02.meimberg.io
cat /var/log/backup.log
```

## Manual Backup

If you don't want automated exports, you can export manually:

```bash
# SSH to server
ssh deploy@hc-02.meimberg.io

# Export database
docker exec awesomeapps-strapi /opt/app/scripts/export-backup.sh

# Exports are now in /srv/backups/strapi/ and will be included in next Ansible backup
```

## Restore from Backup

### 1. List Available Backups

```bash
ssh root@hc-02.meimberg.io
rclone ls storage-box:backups/
```

### 2. Restore Specific Backup

```bash
# Download backup
rclone copy storage-box:backups/backup-2024-01-15.tar.gz /tmp/

# Extract
cd /srv
tar -xzf /tmp/backup-2024-01-15.tar.gz

# Restart Strapi
cd /srv/projects/awesomeapps-strapi
docker compose restart
```

### 3. Restore Database

```bash
# Extract database dump
tar -xzf /tmp/backup-2024-01-15.tar.gz -C /tmp/ --wildcards "*/backups/strapi/database/*.sql"

# Import to database
docker exec awesomeapps-strapi-db mysql -u strapi -p${DATABASE_PASSWORD} strapi < /tmp/strapi_db_*.sql
```

### 4. Restore Uploads

```bash
# Extract uploads
tar -xzf /tmp/backup-2024-01-15.tar.gz -C /tmp/ --wildcards "*/backups/strapi/uploads/*"

# Copy to container
docker cp /tmp/uploads/ awesomeapps-strapi:/opt/app/public/
```

## Timeline Summary

1. **2:00 AM**: Strapi exports database/uploads to `/srv/backups/strapi/`
2. **2:30 AM**: n8n exports workflows/credentials to `/srv/backups/n8n/`
3. **3:00 AM**: Ansible backs up everything (including Strapi and n8n exports) to Hetzner Storage Box

This creates a clean separation where Strapi manages its own data exports, and Ansible handles the archival to external storage.
