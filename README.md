# ServiceAtlas Strapi CMS

A Strapi headless CMS for ServiceAtlas project management.

## Quick Start

### Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:1337](http://localhost:1337)

### Docker Development
```bash
docker-compose --profile dev --profile database up --build
```
Open [http://localhost:8202](http://localhost:8202)

## Deployment

### Prerequisites
1. **Server Setup** (one-time):
   ```bash
   # Run on your server once
   curl -fsSL https://raw.githubusercontent.com/meimberg-io/io.meimberg.serversetup/main/scripts/server-setup.sh | sudo bash
   ```

2. **GitHub Configuration**:
   - **Variables**: `APP_PORT`, `HOST`, `USERNAME`
   - **Secrets**: `SSH_PRIVATE_KEY`

### Deploy
Push to `master` branch → automatic deployment via GitHub Actions

## Project Structure

```
├── config/           # Strapi configuration files
├── src/
│   ├── api/          # API routes and controllers
│   ├── components/   # Reusable components
│   └── policies/     # Custom policies
├── public/           # Static files and uploads
├── database/         # Database migrations
├── docker-compose.yml # Unified dev/prod config
├── Dockerfile        # Multi-stage build
└── .github/workflows/ # CI/CD pipeline
```

## Tech Stack

- **Framework**: Strapi 5.12.3
- **Database**: MySQL 8.0
- **Language**: TypeScript
- **Deployment**: Docker + GitHub Actions

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting (placeholder)
npm run test         # Run tests (placeholder)
npm run test:ci      # Run tests with CI (placeholder)
```

### Docker Profiles
```bash
# Development (with volume mounts + database)
docker-compose --profile dev --profile database up

# Production (no volume mounts + database)
docker-compose --profile prod --profile database up

# Database only
docker-compose --profile database up
```

## Environment Variables

### Local (.env)
```bash
NODE_ENV=development
APP_PORT=8202
DATABASE_CLIENT=mysql
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_password
```

### Production (auto-generated)
```bash
NODE_ENV=production
APP_PORT=<from GitHub variable>
PORT=1337
# ... database and app keys
```

## Database

### MySQL Configuration
- **Host**: `mysql` (Docker) or `localhost` (local)
- **Port**: `3306`
- **Database**: `strapi`
- **User**: `strapi`
- **Password**: `strapi_password`

### Required App Keys
Strapi requires these environment variables:
- `APP_KEYS` - Comma-separated keys for app encryption
- `API_TOKEN_SALT` - Salt for API token generation
- `ADMIN_JWT_SECRET` - Secret for admin JWT tokens
- `TRANSFER_TOKEN_SALT` - Salt for transfer tokens
- `JWT_SECRET` - Secret for JWT tokens

## Content Types

- **Global** - Global site settings
- **Service** - Individual services
- **Page** - Static pages
- **Tag** - Service tags
- **New Service** - Service creation requests

## API Endpoints

- **Admin Panel**: `/admin`
- **API**: `/api`
- **GraphQL**: `/graphql` (if enabled)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.