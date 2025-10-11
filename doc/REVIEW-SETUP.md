# Review System Setup Guide

This document explains how to configure the review system for ServiceAtlas.

## Strapi Permissions Configuration

### 1. Public Role (Unauthenticated Users)

Navigate to: **Settings → Users & Permissions Plugin → Roles → Public**

Enable the following permissions for **Review**:

- ✅ **find** - List reviews (required for GraphQL queries on service detail pages)
- ✅ **findOne** - View individual review details (required for GraphQL nested queries)
- ❌ **create** - Disabled (requires authentication)
- ❌ **update** - Disabled (requires authentication)
- ❌ **delete** - Disabled (requires authentication)

**Custom Endpoints:**
- ✅ **byService** - GET /api/reviews/service/:serviceId (view reviews for a specific service)
- ✅ **getAverageRating** - GET /api/reviews/service/:serviceId/average (get average rating)
- ❌ **markHelpful** - Disabled (or enable if you want anonymous helpful votes)

### 2. Authenticated Role (Logged-in Users)

Navigate to: **Settings → Users & Permissions Plugin → Roles → Authenticated**

Enable the following permissions for **Review**:

**Standard CRUD:**
- ✅ **find** - List reviews
- ✅ **findOne** - View individual reviews
- ✅ **create** - Create new reviews (protected by authentication)
- ✅ **update** - Update own reviews (ownership verified in controller)
- ✅ **delete** - Delete own reviews (ownership verified in controller)

**Custom Endpoints:**
- ✅ **byService** - GET /api/reviews/service/:serviceId
- ✅ **getAverageRating** - GET /api/reviews/service/:serviceId/average
- ✅ **markHelpful** - POST /api/reviews/:id/helpful

## Review Schema Features

### Required Fields
- **voting** (1-5 stars) - Required
- **service** - Service being reviewed (required)
- **member** - User who wrote the review (auto-set from JWT)

### Optional Fields
- **reviewtext** - Review text (10-2000 characters if provided, but completely optional)

### Auto-populated Fields
- **isPublished** - Defaults to true
- **helpfulCount** - Defaults to 0
- **createdAt** - Auto-generated
- **updatedAt** - Auto-generated

## How It Works

### Creating a Review

1. User must be authenticated
2. User clicks on a service detail page
3. Scrolls to "Bewertungen" section at the bottom
4. Selects a star rating (1-5 stars required)
5. Optionally writes review text
6. Submits the review
7. Review is immediately published and visible

### Security

- **Authentication Required**: Only logged-in users can create/edit/delete reviews
- **Member Auto-Link**: The `member` field is automatically set from the JWT token's `memberId`
- **Ownership Verification**: Users can only edit/delete their own reviews (if implemented in controller)
- **Service Resolution**: Accepts service `documentId` and converts to numeric ID automatically

### Frontend Components

#### ReviewForm
- Location: `src/components/reviews/ReviewForm.tsx`
- Features:
  - Interactive 5-star rating selector with hover effects
  - Optional textarea for review text
  - Character counter (max 2000 chars)
  - Redirects to login if not authenticated
  - Real-time validation

#### ReviewList
- Location: `src/components/reviews/ReviewList.tsx`
- Features:
  - Displays all reviews with avatar, name, date
  - Shows star rating visually
  - "Mark as helpful" button with counter
  - Empty state when no reviews exist
  - Formatted dates in German

#### ServiceDetail Integration
- Location: `src/components/new/ServiceDetail.tsx`
- Features:
  - Real average rating calculated from reviews
  - "Bewertungen ansehen" skip link button
  - Visually separated reviews section with separator
  - Review form above the list
  - Auto-refresh after submitting

## GraphQL Query

The frontend uses GraphQL to fetch reviews:

```graphql
query GetServiceReviews($serviceId: ID!) {
  reviews(
    filters: { 
      service: { documentId: { eq: $serviceId } },
      isPublished: { eq: true }
    },
    sort: "createdAt:desc"
  ) {
    documentId
    reviewtext
    voting
    isPublished
    helpfulCount
    createdAt
    updatedAt
    member {
      documentId
      displayName
      username
      avatarUrl
      avatar {
        url
      }
    }
  }
}
```

## REST API Endpoints

### Create Review
```
POST /api/reviews
Authorization: Bearer <jwt_token>

Body:
{
  "data": {
    "service": "documentId-of-service",
    "voting": 5,
    "reviewtext": "Optional review text"
  }
}
```

### Update Review
```
PUT /api/reviews/:documentId
Authorization: Bearer <jwt_token>

Body:
{
  "data": {
    "voting": 4,
    "reviewtext": "Updated review text"
  }
}
```

### Mark as Helpful
```
PUT /api/reviews/:documentId
Body:
{
  "data": {
    "helpfulCount": <current_count + 1>
  }
}
```

## Testing Checklist

### As Unauthenticated User:
- [ ] Can view reviews on service detail pages
- [ ] Can see average rating and review count
- [ ] Can click "Bewertungen ansehen" to scroll to reviews
- [ ] Sees "Please sign in" message in review form
- [ ] Cannot create reviews

### As Authenticated User:
- [ ] Can select star rating (1-5 stars)
- [ ] Can optionally write review text
- [ ] Can submit review with just stars (no text)
- [ ] Review appears immediately after submission
- [ ] Average rating updates correctly
- [ ] Review count increments
- [ ] Can mark reviews as helpful
- [ ] Helpful count increments

### Edge Cases:
- [ ] Review with no text (stars only) works
- [ ] Review with text under 10 chars is rejected by schema
- [ ] Review with text over 2000 chars is rejected
- [ ] Multiple reviews from same user (if allowed)
- [ ] Service detail page loads without reviews (shows empty state)

## Troubleshooting

### "Forbidden access" when viewing reviews
**Solution:** Enable `Review: find` for Public role

### Can't create review (401 Unauthorized)
**Solution:** 
1. Ensure user is logged in with valid JWT
2. Enable `Review: create` for Authenticated role
3. Check that JWT includes `memberId` field

### Reviews don't appear after submission
**Solution:**
1. Check that `isPublished` is set to `true`
2. Verify GraphQL query filters
3. Check Strapi content manager to see if review was actually created

### Average rating shows "Keine"
**Solution:** This is normal when there are no reviews yet

### Member not linked to review
**Solution:** Review controller automatically extracts `memberId` from JWT `ctx.state.user.memberId`

---

## Summary

The review system is now fully implemented with:
✅ Star rating (1-5, required)
✅ Optional review text
✅ Authentication required for creation
✅ Public viewing of reviews
✅ GraphQL integration
✅ REST API for mutations
✅ Visual separation on detail page
✅ Skip link to reviews section
✅ "Mark as helpful" functionality
✅ Real-time average rating calculation

Users can now easily rate and review services, with a clean, intuitive interface that follows modern UX patterns!


