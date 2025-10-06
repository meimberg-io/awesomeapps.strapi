# Data Transfer Scripts

This document explains how to transfer data between your local development environment and your live Strapi instance.

## Available Commands

- **`npm run pull-live`** - Download data FROM live server TO local
- **`npm run push-live`** - Upload data FROM local TO live server ⚠️

### Smart Docker Detection

Both scripts automatically detect your environment:
- **Running locally?** → Commands are forwarded to the Docker container automatically
- **Running in Docker?** → Commands execute directly

This means you can simply run `npm run pull-live` or `npm run push-live` from your host machine, and the scripts will handle the Docker execution for you! 🎉

## Setup

1. Add the following variables to your `.env` file (not tracked by git):

```bash
# Live Transfer (for pull-live script)
STRAPI_LIVE_URL=https://serviceatlas.meimberg.io/strapi/admin
STRAPI_LIVE_TOKEN=your-actual-transfer-token-here
```

2. Get your transfer token from the live Strapi admin panel:
   - Go to Settings → Transfer Tokens
   - Create a new transfer token (or use existing)
   - Copy the token value

## Usage

### Prerequisites

Make sure your development Docker container is running:
```bash
docker-compose up -d
```

### Pull Live Data (Download from live to local)

Simply run from your host machine:
```bash
npm run pull-live
```

The script will automatically:
1. Detect that you're running locally
2. Forward the command to the `strapi-dev` Docker container
3. Execute the transfer inside the container where database access is available

### Push Live Data (Upload from local to live) ⚠️ DANGER

**⚠️ WARNING:** This will OVERWRITE all data on the live server with your local data!

Simply run from your host machine:
```bash
npm run push-live
```

The script will automatically:
1. Detect that you're running locally
2. Forward the command to the `strapi-dev` Docker container
3. Show warning prompts
4. Execute the transfer inside the container

## Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Never commit transfer tokens** - they provide admin access to your live site
- The token in `package.json` is now replaced with environment variables
- The actual token values are stored only in `.env` (git-ignored)

## Troubleshooting

### Container not running
If you get an error about the container not running:
```bash
docker-compose up -d
```

### Missing environment variables
If you get an error about missing variables:
1. Make sure your `.env` file exists in the project root
2. Verify that `STRAPI_LIVE_URL` and `STRAPI_LIVE_TOKEN` are set
3. Check that there are no extra spaces or quotes around the values
4. Restart the Docker container after updating `.env`:
   ```bash
   docker-compose restart strapi-dev
   ```

### Database connection errors
The scripts automatically run inside Docker where database access is configured. If you still get database errors:
1. Check that your database container is running: `docker ps`
2. Verify database credentials in `.env`
3. Check Docker container logs: `docker-compose logs strapi-dev`

