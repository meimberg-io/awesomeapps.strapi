# GitHub Secrets and Variables Setup

This document lists all the GitHub secrets and variables you need to configure for the Strapi deployment pipeline.

## GitHub Secrets (Settings → Secrets and variables → Actions → Secrets)

These are sensitive values that should never be committed to the repository:

### Server Access
- **`SSH_PRIVATE_KEY`**: Your SSH private key for the deploy user
  - Generate with: `ssh-keygen -t ed25519 -C "github-deploy"`
  - Copy the **private key** content (the file WITHOUT .pub extension)

### Database Password
- **`DATABASE_PASSWORD`**: MySQL user password
  - Generate a strong password

### Strapi Secrets
These should be long random strings. Generate them with: `openssl rand -base64 32`

- **`APP_KEYS`**: Comma-separated list of 4 keys
  - Example: `key1,key2,key3,key4`
  - Generate 4 keys and join with commas

- **`API_TOKEN_SALT`**: Salt for API tokens
  - Generate: `openssl rand -base64 32`

- **`ADMIN_JWT_SECRET`**: Secret for admin JWT tokens
  - Generate: `openssl rand -base64 32`

- **`TRANSFER_TOKEN_SALT`**: Salt for transfer tokens
  - Generate: `openssl rand -base64 32`

- **`JWT_SECRET`**: General JWT secret
  - Generate: `openssl rand -base64 32`

## GitHub Variables (Settings → Secrets and variables → Actions → Variables)

These are non-sensitive configuration values:

### Server Configuration
- **`HOST`**: Your server's hostname or IP address
  - Example: `meimberg.io` or `123.45.67.89`

- **`DEPLOY_USER`**: SSH username for deployment
  - Value: `deploy`

- **`APP_PORT`**: Port for production deployment
  - Value: `8202`

- **`SERVER_URL`**: Full server URL
  - Example: `https://serviceatlas.meimberg.io`

- **`PUBLIC_URL`**: Public URL for the application
  - Example: `https://serviceatlas.meimberg.io`

- **`ADMIN_URL`**: Admin panel URL path
  - Example: `/strapi/admin` or `/admin`

### Database Configuration
- **`DATABASE_CLIENT`**: Database client type
  - Value: `mysql`

- **`DATABASE_HOST`**: Database hostname in Docker network
  - Value: `strapiDB`

- **`DATABASE_PORT`**: Database port
  - Value: `3306`

- **`DATABASE_NAME`**: MySQL database name
  - Example: `strapi`

- **`DATABASE_USERNAME`**: MySQL username
  - Example: `strapi`

## Summary

**Secrets Required: 7**
1. SSH_PRIVATE_KEY
2. DATABASE_PASSWORD
3. APP_KEYS
4. API_TOKEN_SALT
5. ADMIN_JWT_SECRET
6. TRANSFER_TOKEN_SALT
7. JWT_SECRET

**Variables Required: 11**
1. HOST
2. DEPLOY_USER
3. APP_PORT
4. SERVER_URL
5. PUBLIC_URL
6. ADMIN_URL
7. DATABASE_CLIENT
8. DATABASE_HOST
9. DATABASE_PORT
10. DATABASE_NAME
11. DATABASE_USERNAME

## Server Requirements

Make sure your server has:
- Docker and Docker Compose installed
- A `deploy` user with:
  - SSH key authentication configured
  - Access to `/opt/` directory (configured via server-setup.sh)
  - Permission to run Docker commands
  - Member of `docker` and `opt-deploy` groups

## Quick Setup on Server

If you haven't set up the deploy user yet, run the server setup script from `io.meimberg.serversetup` repository:

```bash
sudo ./scripts/server-setup.sh
```

This will:
- Create the `deploy` user
- Configure SSH access
- Set up Docker permissions
- Set up `/opt/` directory permissions

## Deployment

Once configured, the pipeline will:
1. Run linting on every push
2. Deploy to server on push to `master` branch
3. Can also be triggered manually via "Actions" tab → "Deploy Strapi" → "Run workflow"

The application will be available at: `http://YOUR_HOST:8202/admin` (depends on configored APP_PORT)
