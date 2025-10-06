# Production Server Permissions Fix

## Issue

When running `npm run push-live`, you may encounter this error:

```
Error: The backup folder for the assets could not be created inside the public folder. 
Please ensure Strapi has write permissions on the public directory
```

This happens because the production Strapi container doesn't have write permissions to the `public` folder, particularly when the `uploads` volume is mounted.

## Solution

SSH into your production server and run these commands:

### Option 1: Fix permissions on existing deployment

```bash
# SSH into your server
ssh deploy@your-server.com

# Navigate to the Strapi deployment directory
cd /opt/serviceatlas-strapi

# Stop the container
docker-compose --profile prod down

# Fix permissions on the uploads volume
# Get the volume path
docker volume inspect serviceatlasstrapi_strapi-uploads

# Fix permissions (replace with actual volume path from above command)
docker run --rm -v serviceatlasstrapi_strapi-uploads:/data alpine chown -R 1000:1000 /data

# Or if that doesn't work, remove and recreate the volume (⚠️ THIS WILL DELETE UPLOADS!)
docker volume rm serviceatlasstrapi_strapi-uploads

# Rebuild and restart
docker-compose --profile prod up -d --build
```

### Option 2: Redeploy from scratch (Recommended)

The Dockerfile.prod has been updated to ensure correct permissions. Simply trigger a new deployment:

```bash
# Push to master to trigger GitHub Actions deployment
git push origin master
```

The updated Dockerfile ensures:
- The `public/uploads` directory exists
- Correct ownership is set before switching to the `node` user
- The container runs with proper permissions

## Verify Fix

After applying the fix, test the transfer:

```bash
npm run push-live
```

You should now be able to transfer data without permission errors.

## Prevention

The updated Dockerfile.prod (committed with this fix) prevents this issue on future deployments by:

1. Creating the `public/uploads` directory if it doesn't exist
2. Setting correct ownership (`node:node`) on the entire public directory
3. Ensuring the node user has write access before the container starts

## Technical Details

- The Strapi container runs as user `node` (UID 1000)
- Docker volumes by default may be created with root ownership
- The transfer process needs to create temporary backup folders in `public/`
- Without write permissions, the transfer fails

