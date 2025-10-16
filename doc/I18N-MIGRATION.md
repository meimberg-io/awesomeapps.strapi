# i18n Migration Guide for Production

## Issue
After enabling i18n for Service and Page content types, the production deployment fails with 500 errors on login.

## Root Cause
The schema changes require the i18n plugin to be properly configured and initialized in the database before Strapi can start. The production database needs to have:
1. i18n plugin tables created
2. Default locale ('en') and German locale ('de') configured
3. Schema migrations applied

## Solution

### 1. Plugin Configuration (Already Done)
Added i18n configuration to `config/plugins.ts`:

```typescript
i18n: {
    enabled: true,
    config: {
        defaultLocale: 'en',
        locales: ['en', 'de'],
    },
}
```

### 2. Deploy to Production
Push the changes to GitHub. The deployment pipeline will:
- Build the Docker image with updated schemas
- Run `npm run build` which compiles TypeScript and builds admin panel
- Start the container

### 3. Database Migration (Automatic)
When Strapi starts with the new schemas:
- It will automatically create i18n-related database tables
- It will add `locale` and `localizations` fields to `services` and `pages` tables
- It will initialize the default locale ('en')

### 4. Post-Deployment Steps

After the deployment completes, you may need to:

#### Option A: If Strapi Starts Successfully
1. Access the admin panel
2. Go to Settings → Internationalization
3. Verify that 'en' (English) is set as default
4. Add 'de' (German) locale if not present
5. Existing content will be assigned to the default locale ('en')

#### Option B: If Strapi Fails to Start
If you get persistent 500 errors, you may need to temporarily revert i18n:

1. SSH into the production server
2. Stop the container: `docker-compose down`
3. Backup the database:
   ```bash
   docker exec strapiDB mysqldump -u strapi -p strapi > backup_before_i18n.sql
   ```
4. Restart: `docker-compose --profile prod up -d`

If issues persist, check logs:
```bash
docker-compose logs -f strapi-prod
```

### 5. Content Migration
After i18n is enabled:
- All existing Services and Pages will be in 'en' locale
- To create German versions:
  1. Go to Content Manager → Services (or Pages)
  2. Select an entry
  3. Click "Locales" dropdown in top right
  4. Click "Create new locale" → Select "de"
  5. Fill in German translations

## Schema Changes Made

### Service Content Type
- Enabled i18n: `pluginOptions.i18n.localized: true`
- Localized fields: `abstract`, `longdescription`, `articlecontent`, `pricing`, `description`, `functionality`, `shortfacts`
- Non-localized: `name`, `url`, `logo`, `thumbnail`, `tags`, `screenshots`, `slug`, `youtube_video`, `youtube_title`, `publishdate`, `top`, `reviewCount`, `averageRating`

### Page Content Type
- Enabled i18n: `pluginOptions.i18n.localized: true`
- Localized fields: `title`, `subtitle`, `content`
- Non-localized: `slug`, `keyvisual`

### Custom GraphQL Resolver
Updated `servicesbytags` resolver to accept `locale` parameter:
```typescript
servicesbytags(tags: [ID]!, sort: String, locale: I18NLocaleCode): [Service]
```

## Rollback Plan
If you need to rollback to pre-i18n state:

1. Revert these files:
   - `src/api/service/content-types/service/schema.json`
   - `src/api/page/content-types/page/schema.json`
   - `config/plugins.ts` (remove i18n section)
   - `src/index.ts` (remove locale parameter from servicesbytags)

2. Redeploy

3. Database will keep i18n tables but they won't be used

## Verification
After successful deployment:

1. Check admin login works: `https://your-domain.com/admin`
2. Verify GraphQL endpoint: `https://your-domain.com/graphql`
3. Test locale-aware queries:
   ```graphql
   query {
     services(locale: "en") {
       data {
         id
         attributes { name abstract }
       }
     }
   }
   ```

## Support
- Check Strapi logs: `docker-compose logs -f strapi-prod`
- Check database: `docker exec -it strapiDB mysql -u strapi -p`
- Strapi i18n docs: https://docs.strapi.io/dev-docs/i18n

