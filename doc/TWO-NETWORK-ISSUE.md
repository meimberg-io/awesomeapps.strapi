# Strapi Two-Network Issue - THE REAL ROOT CAUSE

## Problem
Strapi becomes unreachable (504 Gateway Timeout) after frontend deployments, but Strapi itself is running fine.

## Root Cause

**Strapi is on TWO Docker networks:**
1. `awesomeapps-strapi` (172.19.0.3) - private network with the database
2. `traefik` (172.18.0.4) - public network for HTTP routing

**Traefik doesn't know which network IP to use** when multiple networks are present!

When frontend restarts on the traefik network, it can trigger Traefik to re-evaluate all services. Without being explicitly told which network to use, Traefik may pick the WRONG IP (the private one) or get confused and fail to route.

## Evidence

```bash
$ docker inspect awesomeapps-strapi
"Networks": {
    "awesomeapps-strapi_awesomeapps-strapi": {
        "IPAddress": "172.19.0.3"  # Private, with database
    },
    "traefik": {
        "IPAddress": "172.18.0.4"  # Public, for routing
    }
}

$ curl http://172.18.0.4:1337/admin  # ✅ Works
$ curl https://awesomeapps-strapi.meimberg.io/admin  # ❌ 504
```

Traefik CAN reach Strapi directly, but routing through the domain fails.

## Why MonsterMemory Doesn't Break

MonsterMemory is only on ONE network (`traefik`), so there's no ambiguity. Traefik knows exactly which IP to use.

## The Fix

Tell Traefik explicitly which network to use:

```yaml
labels:
  - "traefik.docker.network=traefik"  # ← THIS LINE!
```

Full fix in `docker-compose.prod.yml`:

```yaml
services:
  ${PROJECT_NAME}:
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik"  # Explicitly use traefik network
      - "traefik.http.routers.${PROJECT_NAME}.rule=Host(`${APP_DOMAIN}`)"
      - "traefik.http.routers.${PROJECT_NAME}.entrypoints=websecure"
      - "traefik.http.routers.${PROJECT_NAME}.tls.certresolver=le"
      - "traefik.http.services.${PROJECT_NAME}.loadbalancer.server.port=1337"
    networks:
      - ${PROJECT_NAME}  # Private network with database
      - traefik          # Public network for HTTP
```

## Deployment

```bash
# Commit and push
git add docker-compose.prod.yml
git commit -m "Fix: Tell Traefik to use traefik network for Strapi"
git push origin main

# GitHub Actions will deploy automatically
```

After deployment:
```bash
# Verify
curl https://awesomeapps-strapi.meimberg.io/admin
# Should return 200, not 504
```

## Why Frontend Deployments Triggered It

When frontend restarts:
1. It disconnects/reconnects to the traefik network
2. This triggers Traefik to re-evaluate services on that network
3. Traefik re-discovers Strapi but gets confused about which IP to use
4. Without explicit network label, routing fails
5. Manual restart of Strapi sometimes "fixes" it temporarily by forcing re-discovery

With the fix, Traefik will ALWAYS use the traefik network IP, regardless of restarts.

## Testing

After deploying the fix, test by deploying frontend multiple times:

```bash
# Deploy frontend
cd /home/oli/workspace/awesomeapps.frontend
git commit --allow-empty -m "Test deployment"
git push origin main

# Monitor Strapi during deployment
watch -n 2 'curl -s -o /dev/null -w "Strapi: %{http_code}\n" https://awesomeapps-strapi.meimberg.io/admin'
```

Strapi should stay at 200 throughout.

