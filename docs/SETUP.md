# Local Setup

## Required Files (Not in Repository)

These files are gitignored and must be created locally:

### 1. `.env` - Environment Configuration

**Location:** Project root

**Create from template:**
```bash
cp env.example .env
```

**Required variables:**

```bash
# Database
DATABASE_PASSWORD=strapi_password    # Change in production

# Strapi Secrets - Generate with:
# node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Live Transfer (optional - for data sync)
STRAPI_LIVE_URL=https://awesomeapps-strapi-2.meimberg.io/admin
STRAPI_LIVE_TOKEN=your-transfer-token-from-live
STRAPI_LOCAL_URL=http://localhost:1337/admin
STRAPI_LOCAL_TOKEN=your-local-transfer-token
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

**Get transfer token:**
- Go to Settings > API Tokens > Transfer Tokens
- Create new token or copy existing

## Next Steps

After creating `.env`:

```bash
docker-compose up -d
npm run dev
```

See [README.md](README.md) for complete development guide.

