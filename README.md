# AwesomeApps Strapi CMS

Headless CMS for the AwesomeApps service directory.

**First time?** See [doc/SETUP.md](doc/SETUP.md) to create required local files (`.env`)

## Quick Start

```bash
# Install dependencies
npm install

# Start with Docker (recommended)
docker-compose up

# Or without Docker
npm run dev
```

Open [http://localhost:1337/admin](http://localhost:1337/admin)

## Documentation

- **[Setup](doc/SETUP.md)** - First-time local setup
- **[Data Transfer](doc/DATA-TRANSFER.md)** - Sync data between local and production
- **[Deployment](doc/DEPLOYMENT.md)** - Deploy to production
- **[GitHub Setup](doc/GITHUB-SETUP.md)** - Initial configuration
- **[Docker](doc/DOCKER.md)** - Docker setup details

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run pull-live    # Pull data from production
npm run push-live    # Push data to production ⚠️
```

## Tech Stack

- Strapi 5.28.0
- MySQL 8.0
- TypeScript
- Docker + GitHub Actions

## Environment Setup

Create `.env`:

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

# Secrets (generate with: openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
TRANSFER_TOKEN_SALT=your-salt
JWT_SECRET=your-secret

# Data Transfer
STRAPI_LIVE_URL=https://awesomeapps-strapi.meimberg.io/admin
STRAPI_LIVE_TOKEN=your-production-token
STRAPI_LOCAL_URL=http://localhost:1337/admin
STRAPI_LOCAL_TOKEN=your-local-token
```

## Docker Profiles

```bash
docker-compose up                    # Development (hot reload)
docker-compose --profile prod up     # Production
docker-compose --profile db up       # Database only
```

## Content Types

- **Service** - Service listings with details, tags, reviews
- **Member** - Service authors/owners
- **Tag** - Service categorization
- **Review** - User reviews with ratings

## Deployment

Push to `main` triggers automatic deployment:

```bash
git push origin main
```

See [doc/DEPLOYMENT.md](doc/DEPLOYMENT.md) for details.

## Production

**URL:** https://awesomeapps-strapi.meimberg.io
**Server:** hc-02.meimberg.io
**SSH:** `ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io`
