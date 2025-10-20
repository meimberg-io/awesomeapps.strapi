# Deployment

Automatic deployment on push to `main` via GitHub Actions.

## Deploy

```bash
git push origin main
```

Watch: https://github.com/meimberg-io/awesomeapps.strapi/actions

**Duration:** ~3-4 minutes

## How It Works

1. Checkout code
2. Build Docker image
3. Push to GitHub Container Registry
4. Copy `docker-compose.prod.yml` to server
5. SSH to server and run `envsubst` to substitute variables
6. Pull image and restart containers

**File:** `.github/workflows/deploy.yml`
**Template:** `docker-compose.prod.yml` (uses `${PROJECT_NAME}`, `${DOCKER_IMAGE}`, `${APP_DOMAIN}`)

## Initial Setup

**First time?** See [GITHUB-SETUP.md](GITHUB-SETUP.md) for:
- GitHub Secrets/Variables
- DNS configuration
- SSH keys
- Server setup

## Operations

**View logs:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "docker logs awesomeapps-strapi -f"
```

**Restart:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "cd /srv/projects/awesomeapps-strapi && docker compose restart"
```

**Manual deploy:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "cd /srv/projects/awesomeapps-strapi && docker compose pull && docker compose up -d"
```

## Troubleshooting

**Container logs:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "docker logs awesomeapps-strapi --tail 100"
```

**Database logs:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "docker logs awesomeapps-strapi-db --tail 50"
```

**Traefik routing:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "docker logs traefik --tail 50"
```

**Check running containers:**
```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io "docker ps"
```

**DNS:**
```bash
dig awesomeapps-strapi.meimberg.io +short
```

**Test direct access:**
```bash
curl -I https://awesomeapps-strapi.meimberg.io/admin
```

## Configuration

**Environment Variables (GitHub Secrets):**
- `SSH_PRIVATE_KEY` - SSH key for server access
- `DATABASE_PASSWORD` - MySQL password
- `APP_KEYS` - Strapi app keys
- `API_TOKEN_SALT` - API token salt
- `ADMIN_JWT_SECRET` - Admin JWT secret
- `TRANSFER_TOKEN_SALT` - Transfer token salt
- `JWT_SECRET` - JWT secret

**Environment Variables (GitHub Variables):**
- `SERVER_HOST` - Server hostname (hc-02.meimberg.io)
- `APP_DOMAIN` - Application domain (awesomeapps-strapi.meimberg.io)
- `PROJECT_NAME` - Project name (awesomeapps-strapi)

## Server Access

**SSH Key:** `~/.ssh/oli_key`

```bash
ssh -i ~/.ssh/oli_key root@hc-02.meimberg.io
```

**Project Directory:** `/srv/projects/awesomeapps-strapi/`
