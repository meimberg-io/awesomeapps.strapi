# Data Transfer

Transfer data between local development and production Strapi instances.

## Commands

```bash
npm run pull-live    # Download FROM production TO local
npm run push-live    # Upload FROM local TO production ⚠️
```

Scripts automatically run inside Docker container when executed from host.

## Setup

Add to `.env` (git-ignored):

```bash
# Production instance
STRAPI_LIVE_URL=https://awesomeapps-strapi.meimberg.io/admin
STRAPI_LIVE_TOKEN=your-production-transfer-token

# Local instance
STRAPI_LOCAL_URL=http://localhost:1337/admin
STRAPI_LOCAL_TOKEN=your-local-transfer-token
```

**Get transfer tokens:**
- Settings → Transfer Tokens → Create Token
- Copy token immediately (shown only once)

## Usage

**Prerequisites:**
```bash
docker-compose up -d  # Start local container
```

**Pull data:**
```bash
npm run pull-live
```

**Push data (⚠️ overwrites production):**
```bash
npm run push-live
```

## Volume Mount Fix

For transfers to work, `/opt/app/public` must be mounted (not just `/opt/app/public/uploads`).

**Local:** Already configured in `docker-compose.yml`
**Production:** Configured in `docker-compose.prod.yml` (deployed via GitHub Actions)

## Troubleshooting

**Container not running:**
```bash
docker-compose up -d
```

**Missing env vars:**
- Check `.env` exists in project root
- Verify all 4 variables are set (LIVE_URL, LIVE_TOKEN, LOCAL_URL, LOCAL_TOKEN)
- Restart container: `docker-compose restart`

**Transfer errors:**
```bash
docker logs strapi-dev --tail 50
```

**Database issues:**
- Ensure database container is running: `docker ps`
- Check logs: `docker logs strapiDB`
