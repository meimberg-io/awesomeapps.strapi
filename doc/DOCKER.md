# Docker Setup

This document explains how to run Strapi with Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose available

## Docker Compose Profiles

The project uses Docker Compose profiles to manage different environments:

### Development (Default)
Runs the development container with hot-reload and volume mounts:

```bash
docker-compose up
```

This starts:
- **strapi-dev** on port 1337
- **strapiDB** (MySQL 8.0) on port 3306

### Production
Runs the production container with optimized build:

```bash
docker-compose --profile prod up
```

This starts:
- **strapi-prod** on port 8202 (configurable via `APP_PORT`)
- **strapiDB** (MySQL 8.0) on port 3306

## Volume Mounts

### Development
- `./config` → `/opt/app/config` (read-only)
- `./src` → `/opt/app/src` (read-only)
- `./public/uploads` → `/opt/app/public/uploads` (read-write)
- `package.json` and `package-lock.json` (read-only)

### Production
- `strapi-uploads` → `/opt/app/public/uploads` (Docker volume for persistent media)

## Environment Variables

Create a `.env` file in the project root (see `env.example`):

```bash
# Server
NODE_ENV=development
APP_PORT=1337  # External port (host machine)
PORT=1337      # Internal port (inside container)

# Database
DATABASE_CLIENT=mysql
DATABASE_HOST=strapiDB
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_password

# Server URLs (for production)
SERVER_URL=https://your-domain.com
PUBLIC_URL=https://your-domain.com
ADMIN_URL=/admin

# Secrets
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
TRANSFER_TOKEN_SALT=your-salt
JWT_SECRET=your-secret
```

## Common Commands

### Start Development
```bash
docker-compose up -d
docker-compose logs -f strapi-dev
```

### Start Production
```bash
docker-compose --profile prod up -d
docker-compose logs -f strapi-prod
```

### Stop Containers
```bash
docker-compose down
```

### Rebuild Images
```bash
docker-compose build --no-cache
docker-compose --profile prod up --build
```

### View Logs
```bash
docker-compose logs -f
```

### Clean Up
```bash
# Stop and remove containers, networks
docker-compose down

# Stop and remove containers, networks, volumes
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If you get a port conflict error:

```bash
# Find process using the port
netstat -ano | findstr :1337

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Database Connection Issues
If Strapi can't connect to MySQL:

1. Check if MySQL container is healthy:
   ```bash
   docker-compose ps
   ```

2. Check MySQL logs:
   ```bash
   docker-compose logs strapiDB
   ```

3. Verify `DATABASE_HOST` in `.env` is set to `strapiDB`

### Native Module Issues
If you see errors about `sharp` or `@swc/core`:

```bash
# Rebuild with no cache
docker-compose build --no-cache
```

### Fresh Start
To completely reset the Docker setup:

```bash
docker-compose down -v
docker volume rm serviceatlas-strapi_strapi-data serviceatlas-strapi_strapi-uploads
docker-compose up --build
```

## Running Multiple Strapi Instances

If you need to run multiple Strapi instances on the same server, configure different ports:

**Instance 1 (ServiceAtlas):**
```bash
APP_PORT=8202  # External port
PORT=1337      # Internal port
```

**Instance 2 (Another App):**
```bash
APP_PORT=8203  # Different external port
PORT=1338      # Different internal port (avoid conflicts)
```

The mapping works as: `APP_PORT:PORT` → `8202:1337` means external port 8202 maps to container port 1337.

## Access

- **Development Admin**: http://localhost:1337/admin
- **Production Admin**: http://localhost:8202/admin (or configured port)
- **API**: http://localhost:1337/api (or 8202 for prod)

**Note:** MySQL is only accessible within the Docker network (not exposed to host) for security.

## Database Volumes

Data persistence is handled via Docker volumes:

- **strapi-data**: MySQL database files
- **strapi-uploads**: Uploaded media files (production only)

These volumes persist even when containers are stopped or removed.

