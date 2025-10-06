# Pull Live Data

This document explains how to pull data from your live Strapi instance to your local development environment.

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

### Option 1: Using npm script (recommended)

```bash
npm run pull-live
```

### Option 2: Using helper scripts

**Windows (PowerShell):**
```powershell
.\scripts\pull-live.ps1
```

**Unix/Linux/Mac:**
```bash
chmod +x scripts/pull-live.sh
./scripts/pull-live.sh
```

The helper scripts automatically load the `.env` file and validate that the required variables are set.

## Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Never commit transfer tokens** - they provide admin access to your live site
- The token in `package.json` is now replaced with environment variables
- The actual token values are stored only in `.env` (git-ignored)

## Troubleshooting

If you get an error about missing variables:
1. Make sure your `.env` file exists in the project root
2. Verify that `STRAPI_LIVE_URL` and `STRAPI_LIVE_TOKEN` are set
3. Check that there are no extra spaces or quotes around the values

