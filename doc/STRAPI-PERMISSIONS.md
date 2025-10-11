# Strapi Permissions Configuration Guide

This document describes the exact permissions that need to be set manually in the Strapi Admin Panel for the application to work correctly.

## Access Permissions Settings

1. Open Strapi Admin Panel: http://localhost:1337/admin
2. Navigate to: **Settings → Users & Permissions Plugin → Roles**
3. Configure each role as specified below

---

## PUBLIC Role (Unauthenticated Users)

Users who are **not logged in**. They can browse content but cannot create or modify data.

### Service Content Type
- ✅ **find** - List all services
- ✅ **findOne** - View individual service details
- ❌ **create** - Disabled
- ❌ **update** - Disabled
- ❌ **delete** - Disabled

### Tag Content Type
- ✅ **find** - List all tags
- ✅ **findOne** - View individual tag details
- ❌ **create** - Disabled
- ❌ **update** - Disabled
- ❌ **delete** - Disabled

### Page Content Type
- ✅ **find** - List all pages
- ✅ **findOne** - View individual page details
- ❌ **create** - Disabled
- ❌ **update** - Disabled
- ❌ **delete** - Disabled

### New-Service Content Type
- ✅ **find** - List all new service submissions
- ✅ **findOne** - View individual submissions
- ❌ **create** - Disabled
- ❌ **update** - Disabled
- ❌ **delete** - Disabled

### Member Content Type

**Standard CRUD:**
- ✅ **find** - List members (needed for GraphQL nested queries)
- ✅ **findOne** - View member profiles (needed for GraphQL nested queries)
- ❌ **create** - Disabled (handled by custom endpoint)
- ❌ **update** - Disabled (handled by custom endpoint)
- ❌ **delete** - Disabled

**Custom Endpoints:**
- ✅ **me** - **CRITICAL** - POST /api/members/me (OAuth login endpoint)
- ✅ **profile** - GET /api/members/:id/profile
- ✅ **getFavorites** - GET /api/members/:id/favorites
- ✅ **checkFavorite** - GET /api/members/:id/favorites/:serviceId/check
- ✅ **getReviews** - GET /api/members/:id/reviews
- ✅ **getStatistics** - GET /api/members/:id/statistics
- ❌ **addFavorite** - Disabled (requires authentication)
- ❌ **removeFavorite** - Disabled (requires authentication)
- ❌ **updateProfile** - Disabled (requires authentication)

### Review Content Type

**Standard CRUD:**
- ✅ **find** - List reviews (needed for GraphQL)
- ✅ **findOne** - View individual reviews (needed for GraphQL)
- ❌ **create** - Disabled (requires authentication)
- ❌ **update** - Disabled (requires authentication)
- ❌ **delete** - Disabled (requires authentication)

**Custom Endpoints:**
- ✅ **byService** - GET /api/reviews/service/:serviceId
- ✅ **getAverageRating** - GET /api/reviews/service/:serviceId/average
- ❌ **markHelpful** - Disabled (requires authentication)

### Upload Plugin

**IMPORTANT** - Required for media files (logos, thumbnails, avatars):
- ✅ **upload** - Upload files
- ✅ **find** - List/view uploaded files

---

## AUTHENTICATED Role (Logged-in Users)

Users who have successfully logged in via OAuth. They can perform all public actions plus write operations.

### Service Content Type
- ✅ **find** - List all services
- ✅ **findOne** - View individual service details
- ❌ **create** - Disabled (admin only)
- ❌ **update** - Disabled (admin only)
- ❌ **delete** - Disabled (admin only)

### Tag Content Type
- ✅ **find** - List all tags
- ✅ **findOne** - View individual tag details
- ❌ **create** - Disabled (admin only)
- ❌ **update** - Disabled (admin only)
- ❌ **delete** - Disabled (admin only)

### Page Content Type
- ✅ **find** - List all pages
- ✅ **findOne** - View individual page details
- ❌ **create** - Disabled (admin only)
- ❌ **update** - Disabled (admin only)
- ❌ **delete** - Disabled (admin only)

### New-Service Content Type
- ✅ **find** - List all submissions
- ✅ **findOne** - View individual submissions
- ❌ **create** - Disabled (or enable if you want users to submit services)
- ❌ **update** - Disabled (admin only)
- ❌ **delete** - Disabled (admin only)

### Member Content Type

**Standard CRUD:**
- ✅ **find** - List members
- ✅ **findOne** - View member profiles
- ✅ **create** - Create member (handled by custom endpoint)
- ✅ **update** - Update member (handled by custom endpoint)
- ❌ **delete** - Disabled (optional - enable if users can delete their accounts)

**Custom Endpoints:**
- ✅ **me** - POST /api/members/me
- ✅ **profile** - GET /api/members/:id/profile
- ✅ **updateProfile** - PUT /api/members/:id/profile (protected by policy)
- ✅ **addFavorite** - POST /api/members/:id/favorites (protected by policy)
- ✅ **removeFavorite** - DELETE /api/members/:id/favorites/:serviceId (protected by policy)
- ✅ **getFavorites** - GET /api/members/:id/favorites
- ✅ **checkFavorite** - GET /api/members/:id/favorites/:serviceId/check
- ✅ **getReviews** - GET /api/members/:id/reviews
- ✅ **getStatistics** - GET /api/members/:id/statistics

### Review Content Type

**Standard CRUD:**
- ✅ **find** - List reviews
- ✅ **findOne** - View individual reviews
- ✅ **create** - Create reviews (protected by policy)
- ✅ **update** - Update reviews (protected by policy + ownership check)
- ✅ **delete** - Delete reviews (protected by policy + ownership check)

**Custom Endpoints:**
- ✅ **byService** - GET /api/reviews/service/:serviceId
- ✅ **getAverageRating** - GET /api/reviews/service/:serviceId/average
- ✅ **markHelpful** - POST /api/reviews/:id/helpful

### Upload Plugin
- ✅ **upload** - Upload files (for profile avatars, etc.)
- ✅ **find** - List/view uploaded files

---

## Important Notes

### Security Layers

The application uses **three layers of security**:

1. **Role-based Permissions** (configured in this document)
   - Checked FIRST by Strapi
   - Must be enabled in admin panel for endpoints to be accessible

2. **Custom Policies** (`authenticate-member`)
   - Checked SECOND
   - Validates JWT token from Authorization header
   - Applied to write operations (favorites, reviews, profile updates)

3. **Controller Logic**
   - Checked LAST
   - Validates ownership (users can only modify their own data)
   - Example: User can only update/delete their own reviews

### Why Public Users Need `find` and `findOne` for Member and Review

Even though these seem like sensitive operations, they are required for:

- **GraphQL nested queries**: When fetching services, reviews are included with member data
- **Public profiles**: Displaying who wrote a review
- The actual sensitive data (email, OAuth IDs) is marked as `private` in the schema and never exposed

### Critical Permissions

If these are not enabled, the app will break:

- ✅ **Public → Member → me** - Without this, OAuth login will fail
- ✅ **Public → Member → find** - Without this, services with reviews won't load (GraphQL nested query)
- ✅ **Public → Review → find** - Without this, reviews won't appear on service pages
- ✅ **Public/Authenticated → Upload → find** - Without this, images won't display

### Testing Permissions

After configuration, test:

```bash
# Should work (public)
curl http://localhost:1337/api/services

# Should work (public, OAuth login)
curl -X POST http://localhost:1337/api/members/me \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","provider":"google"}'

# Should fail 401/403 (no JWT)
curl -X POST http://localhost:1337/api/members/1/favorites \
  -H "Content-Type: application/json" \
  -d '{"serviceDocumentId":"abc123"}'

# Should work (with valid JWT)
curl -X POST http://localhost:1337/api/members/1/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_HERE" \
  -d '{"serviceDocumentId":"abc123"}'
```

---

## Quick Reference Checklist

### Public Role - Enable These:
```
Service:        ✓ find, findOne
Tag:            ✓ find, findOne
Page:           ✓ find, findOne
New-Service:    ✓ find, findOne
Member:         ✓ find, findOne, me, profile, getFavorites, checkFavorite, getReviews, getStatistics
Review:         ✓ find, findOne, byService, getAverageRating
Upload:         ✓ upload, find
```

### Authenticated Role - Enable These:
```
Service:        ✓ find, findOne
Tag:            ✓ find, findOne
Page:           ✓ find, findOne
New-Service:    ✓ find, findOne
Member:         ✓ ALL endpoints
Review:         ✓ ALL endpoints
Upload:         ✓ upload, find
```

---

## Troubleshooting

### "Forbidden access" Error in GraphQL

**Problem:** Services load but reviews don't appear  
**Solution:** Enable `Review: find` and `Member: find` for Public role

### OAuth Login Fails

**Problem:** Can't login with Google/GitHub/Azure AD  
**Solution:** Enable `Member: me` endpoint for Public role

### Images Don't Display

**Problem:** Logos, thumbnails, avatars show broken images  
**Solution:** Enable `Upload: find` for Public role

### Can't Add/Remove Favorites

**Problem:** Favorite button doesn't work even when logged in  
**Solution:** Enable `Member: addFavorite` and `Member: removeFavorite` for Authenticated role

### Policy Error: "authenticate-member not found"

**Problem:** Strapi won't start  
**Solution:** Ensure policy file exists at `src/api/member/policies/authenticate-member.ts`

---

## Additional Configuration

### Email Confirmation

Go to **Settings → Users & Permissions Plugin → Advanced Settings**:
- ❌ **Disable** "Enable email confirmation" (we're using OAuth only)

### Default Role

Should be set to: **Authenticated**

### JWT Expiration

Default: 30 days (can be adjusted in Advanced Settings)

---

## Document Version

- **Created:** 2025-10-11
- **Last Updated:** 2025-10-11
- **Strapi Version:** 5.12.3
- **Application:** ServiceAtlas + AwesomeApps Frontend

