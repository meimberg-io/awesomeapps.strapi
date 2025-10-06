# ServiceAtlas Strapi CMS

A Strapi headless CMS for ServiceAtlas project management.

## Quick Start

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:1337/admin](http://localhost:1337/admin)

### Docker Development (Recommended)
```bash
docker-compose up
```
Open [http://localhost:1337/admin](http://localhost:1337/admin)

See [Docker Guide](doc/DOCKER.md) for more details.

## Documentation

- **[Docker Setup](doc/DOCKER.md)** - How to run with Docker Compose
- **[GitHub Actions Setup](doc/GITHUB-SETUP.md)** - Configure deployment pipeline
- **[Pull Live Data](doc/PULL-LIVE.md)** - Sync data from production

## Deployment

Push to `master` branch triggers automatic deployment via GitHub Actions.

See [GitHub Setup Guide](doc/GITHUB-SETUP.md) for configuration details.

## Tech Stack

- **Framework**: Strapi 5.12.3
- **Database**: MySQL 8.0
- **Language**: TypeScript
- **Deployment**: Docker + GitHub Actions

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run pull-live    # Pull data from live site
```

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Server
NODE_ENV=development
APP_PORT=1337

# Database
DATABASE_CLIENT=mysql
DATABASE_HOST=strapiDB
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_password

# Secrets (generate with: openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
TRANSFER_TOKEN_SALT=your-salt
JWT_SECRET=your-secret
```

## Docker Profiles

```bash
# Development (default - hot reload, volume mounts)
docker-compose up

# Production (optimized build, persistent volumes)
docker-compose --profile prod up
```

## API Endpoints

- **Admin Panel**: `/admin`
- **REST API**: `/api`
- **GraphQL**: `/graphql`

## Content Types

- **Global** - Global site settings
- **Service** - Individual services
- **Page** - Static pages
- **Tag** - Service tags
- **New Service** - Service creation requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `docker-compose up`
5. Submit a pull request

## License

MIT License
