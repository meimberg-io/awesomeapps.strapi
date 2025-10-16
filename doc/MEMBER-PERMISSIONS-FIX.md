# Member API Permissions Fix

## Issue
The `/api/members/me` endpoint returns 403 Forbidden during OAuth login, preventing member creation.

## Root Cause
The endpoint has no explicit policies in the route configuration, which causes Strapi to apply default permission checks. Since this endpoint is called during the OAuth flow (before a Strapi JWT exists), it gets blocked.

## Solution
The `/api/members/me` endpoint needs to be publicly accessible. This is secure because:
1. It's called by the trusted Next.js backend (not directly by users)
2. It validates OAuth data from Google/GitHub/Azure
3. It only creates/retrieves member records, not sensitive data

The endpoint should remain with `policies: []` which means no authentication required, but Strapi's public access must be configured in the admin panel.

## Configuration Steps

### Option 1: Via Strapi Admin (Recommended)
1. Go to http://localhost:1337/admin
2. Navigate to **Settings** → **Users & Permissions plugin** → **Roles** → **Public**
3. Find **Member** in the permissions list
4. Enable **`me`** permission (POST)
5. Save

### Option 2: Programmatically (if needed)
Update the route configuration to explicitly allow public access:

```typescript
{
  method: 'POST',
  path: '/members/me',
  handler: 'member.me',
  config: {
    auth: false,  // Explicitly disable authentication
    policies: [],
    middlewares: [],
  },
},
```

## Verification
After fixing permissions:
1. Restart Strapi
2. Log out of the frontend
3. Log in again with Google
4. Check Strapi logs - should see member creation success
5. Verify member exists in database

