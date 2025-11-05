# Docker Setup

## Quick Start

```bash
# Development (hot reload, volume mounts)
docker-compose up

# Production (optimized build)
docker-compose --profile prod up

# Database only
docker-compose --profile db up
```

## Profiles

| Profile | Container | Port | Use Case |
|---------|-----------|------|----------|
| (default) | strapi-dev | 1337 | Development with hot reload |
| prod | strapi-prod | 8202 | Production testing |
| db | strapiDB | 3306 | Database only |

## Volume Mounts

### Development
```yaml
./config → /opt/app/config
./src → /opt/app/src
./public → /opt/app/public  # Full public folder for transfers
```

### Production
```yaml
strapi-uploads:/opt/app/public  # Persistent media storage
```

**Important:** `/opt/app/public` must be mounted (not just `/uploads`) for data transfers to work.

## Environment Variables

Copy `env.example` to `.env`:

```bash
# Server
NODE_ENV=development
APP_PORT=1337
PORT=1337

# Database
DATABASE_CLIENT=mysql
DATABASE_HOST=strapiDB
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-password

# Secrets (generate: openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
TRANSFER_TOKEN_SALT=your-salt
JWT_SECRET=your-secret

# Data Transfer
STRAPI_LIVE_URL=https://awesomeapps-strapi.meimberg.io/admin
STRAPI_LIVE_TOKEN=your-token
STRAPI_LOCAL_URL=http://localhost:1337/admin
STRAPI_LOCAL_TOKEN=your-token
```

## Commands

**Start:**
```bash
docker-compose up -d
```

**Logs:**
```bash
docker-compose logs -f strapi-dev
```

**Stop:**
```bash
docker-compose down
```

**Rebuild:**
```bash
docker-compose build --no-cache
docker-compose up --build
```

**Fresh start (⚠️ deletes data):**
```bash
docker-compose down -v
docker-compose up --build
```

## Access

- Admin: http://localhost:1337/admin
- API: http://localhost:1337/api
- GraphQL: http://localhost:1337/graphql

## Troubleshooting

**Port conflict:**
```bash
# Find process
netstat -ano | findstr :1337
# Kill it
taskkill /PID <PID> /F
```

**Database issues:**
```bash
docker-compose logs strapiDB
docker-compose ps  # Check health
```

**Transfer errors:**
- Check volume mount includes `/opt/app/public` (not just `/public/uploads`)
- Restart container: `docker-compose restart`

**Module errors (sharp, @swc/core):**
```bash
docker-compose build --no-cache
```

