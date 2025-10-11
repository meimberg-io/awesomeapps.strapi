# Members & Reviews API Documentation

## Overview

This API provides endpoints for managing members (logged-in users) and their reviews of services. Members can authenticate via OAuth (Google, GitHub, Microsoft 365), favorite services, write reviews, and manage their profiles.

## Content Types

### Member

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Unique email address (required) |
| `username` | string | Unique username for display |
| `displayName` | string | Display name |
| `avatarUrl` | string | URL to avatar image |
| `oauthProvider` | enum | OAuth provider: `google`, `github`, `azure-ad`, `local` |
| `oauthId` | string | OAuth provider's user ID |
| `favorites` | relation | Many-to-many relation to services |
| `reviews` | relation | One-to-many relation to reviews |
| `lastlogin` | datetime | Last login timestamp |
| `bio` | text | User bio (max 500 characters) |
| `avatar` | media | Uploaded avatar image |
| `isActive` | boolean | Account active status |

### Review

| Field | Type | Description |
|-------|------|-------------|
| `reviewtext` | text | Review content (10-2000 characters, required) |
| `voting` | integer | Rating 1-5 stars (required) |
| `member` | relation | Many-to-one relation to member |
| `service` | relation | Many-to-one relation to service |
| `isPublished` | boolean | Published status |
| `helpfulCount` | integer | Number of "helpful" votes |

---

## Member API Endpoints

### Authentication & Profile

#### POST `/api/members/me`
Find or create member from OAuth data.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "provider": "google",
  "sub": "oauth-user-id"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "oauthProvider": "google",
    "lastlogin": "2025-10-11T12:00:00.000Z"
  }
}
```

#### GET `/api/members/:id/profile`
Get member profile with statistics.

**Response:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Software developer",
    "favorites": [...],
    "reviews": [...],
    "statistics": {
      "reviewCount": 5,
      "favoriteCount": 10,
      "memberSince": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-10-11T12:00:00.000Z"
    }
  }
}
```

#### PUT `/api/members/:id/profile`
Update member profile.

**Request Body:**
```json
{
  "username": "newusername",
  "displayName": "New Display Name",
  "bio": "Updated bio"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "username": "newusername",
    "displayName": "New Display Name",
    "bio": "Updated bio"
  }
}
```

#### GET `/api/members/:id/statistics`
Get member statistics.

**Response:**
```json
{
  "data": {
    "reviewCount": 5,
    "favoriteCount": 10,
    "memberSince": "2025-01-01T00:00:00.000Z",
    "lastLogin": "2025-10-11T12:00:00.000Z"
  }
}
```

---

### Favorites Management

#### GET `/api/members/:id/favorites`
Get member's favorite services.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Service Name",
      "slug": "service-name",
      "logo": {...},
      "thumbnail": {...},
      "tags": [...]
    }
  ]
}
```

#### POST `/api/members/:id/favorites`
Add service to favorites.

**Request Body:**
```json
{
  "serviceId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to favorites"
}
```

#### DELETE `/api/members/:id/favorites/:serviceId`
Remove service from favorites.

**Response:**
```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

#### GET `/api/members/:id/favorites/:serviceId/check`
Check if service is favorited.

**Response:**
```json
{
  "isFavorite": true
}
```

---

### Member Reviews

#### GET `/api/members/:id/reviews`
Get all reviews by a member.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "reviewtext": "Great service!",
      "voting": 5,
      "createdAt": "2025-10-11T12:00:00.000Z",
      "service": {
        "name": "Service Name",
        "slug": "service-name"
      }
    }
  ]
}
```

---

## Review API Endpoints

### CRUD Operations

#### POST `/api/reviews`
Create a new review.

**Request Body:**
```json
{
  "reviewtext": "This is a great service!",
  "voting": 5,
  "memberId": 1,
  "serviceId": 123
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "reviewtext": "This is a great service!",
    "voting": 5,
    "member": {
      "username": "johndoe",
      "displayName": "John Doe",
      "avatarUrl": "..."
    },
    "service": {
      "name": "Service Name",
      "slug": "service-name"
    }
  }
}
```

**Errors:**
- `400` - Validation error (text too short/long, rating out of range)
- `400` - "You have already reviewed this service"
- `404` - Member or service not found

#### PUT `/api/reviews/:id`
Update an existing review.

**Request Body:**
```json
{
  "memberId": 1,
  "reviewtext": "Updated review text",
  "voting": 4
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "reviewtext": "Updated review text",
    "voting": 4
  }
}
```

**Errors:**
- `403` - "You can only update your own reviews"
- `404` - Review not found

#### DELETE `/api/reviews/:id`
Delete a review.

**Request Body:**
```json
{
  "memberId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Errors:**
- `403` - "You can only delete your own reviews"
- `404` - Review not found

---

### Service Reviews

#### GET `/api/reviews/service/:serviceId`
Get all reviews for a service with pagination.

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 10)
- `sortBy` - Options: `createdAt`, `voting`, `helpfulCount` (default: `createdAt`)
- `sortOrder` - Options: `asc`, `desc` (default: `desc`)

**Example:**
```
GET /api/reviews/service/123?page=1&pageSize=10&sortBy=voting&sortOrder=desc
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "reviewtext": "Great service!",
      "voting": 5,
      "helpfulCount": 10,
      "createdAt": "2025-10-11T12:00:00.000Z",
      "member": {
        "username": "johndoe",
        "displayName": "John Doe",
        "avatarUrl": "..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "pageCount": 5,
    "total": 50
  }
}
```

#### GET `/api/reviews/service/:serviceId/average`
Get average rating for a service.

**Response:**
```json
{
  "data": {
    "average": 4.5,
    "count": 50
  }
}
```

---

### Helpful Votes

#### POST `/api/reviews/:id/helpful`
Mark a review as helpful.

**Response:**
```json
{
  "data": {
    "id": 1,
    "helpfulCount": 11
  }
}
```

---

## GraphQL API

All content types are automatically available via GraphQL (shadowCRUD enabled).

### Example Queries

**Get member with favorites and reviews:**
```graphql
query {
  member(id: 1) {
    data {
      id
      attributes {
        email
        username
        displayName
        favorites {
          data {
            id
            attributes {
              name
              slug
            }
          }
        }
        reviews {
          data {
            id
            attributes {
              reviewtext
              voting
              createdAt
            }
          }
        }
      }
    }
  }
}
```

**Get reviews for a service:**
```graphql
query {
  reviews(filters: { service: { id: { eq: 123 } } }) {
    data {
      id
      attributes {
        reviewtext
        voting
        member {
          data {
            attributes {
              username
              displayName
            }
          }
        }
      }
    }
  }
}
```

---

## Validation Rules

### Member
- `email`: Required, unique
- `username`: Unique, auto-generated if not provided
- `bio`: Max 500 characters

### Review
- `reviewtext`: Required, 10-2000 characters
- `voting`: Required, integer 1-5
- One review per member per service

---

## Error Responses

All endpoints follow standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation error)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Internal Server Error

**Error Format:**
```json
{
  "error": {
    "status": 400,
    "name": "BadRequestError",
    "message": "Validation error message"
  }
}
```

---

## Future Enhancements

Planned features for later implementation:
- Email/password authentication
- Review moderation
- Member reputation system
- Review voting (helpful/not helpful)
- Member badges and achievements
- Review attachments (screenshots)

