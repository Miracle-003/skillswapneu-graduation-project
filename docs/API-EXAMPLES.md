# SkillSwap API Examples

This document provides practical examples for interacting with the SkillSwap API. All examples use `curl` and JavaScript's `fetch` API.

## Table of Contents
- [Authentication](#authentication)
- [User Profiles](#user-profiles)
- [Matching System](#matching-system)
- [Messaging](#messaging)
- [Peer Reviews](#peer-reviews)
- [Gamification](#gamification)
- [Error Handling](#error-handling)

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-production-domain.com/api
```

## Authentication

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "major": "Computer Science",
    "year": "3"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@university.edu',
    password: 'SecurePass123!',
    fullName: 'John Doe',
    major: 'Computer Science',
    year: '3'
  })
});

const data = await response.json();
console.log('Registration successful:', data);
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "fullName": "John Doe"
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "SecurePass123!"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'student@university.edu',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token); // Store token
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "fullName": "John Doe",
    "major": "Computer Science"
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
await fetch('http://localhost:3001/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
localStorage.removeItem('token');
```

## User Profiles

### Get Current User Profile

**Endpoint:** `GET /api/users/me`

**Request:**
```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await response.json();
```

**Response (200 OK):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "John Doe",
  "email": "student@university.edu",
  "major": "Computer Science",
  "year": "3",
  "bio": "Passionate about algorithms and data structures",
  "learningStyle": "visual",
  "studyPreference": "group",
  "interests": ["Algorithms", "Web Development", "Machine Learning"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Update User Profile

**Endpoint:** `PUT /api/users/me`

**Request:**
```bash
curl -X PUT http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Computer Science student interested in AI and ML",
    "learningStyle": "hands-on",
    "studyPreference": "small-group",
    "interests": ["AI", "Machine Learning", "Python"]
  }'
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/users/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bio: 'Computer Science student interested in AI and ML',
    learningStyle: 'hands-on',
    studyPreference: 'small-group',
    interests: ['AI', 'Machine Learning', 'Python']
  })
});

const updatedProfile = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "bio": "Computer Science student interested in AI and ML",
    "learningStyle": "hands-on",
    "studyPreference": "small-group",
    "interests": ["AI", "Machine Learning", "Python"],
    "updatedAt": "2025-01-15T14:20:00Z"
  }
}
```

### Get Public User Profile

**Endpoint:** `GET /api/users/:userId`

**Request:**
```bash
curl -X GET http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const userId = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const publicProfile = await response.json();
```

## Matching System

### Get Matches

**Endpoint:** `GET /api/matches`

**Query Parameters:**
- `subject` - Filter by subject (optional)
- `learningStyle` - Filter by learning style (optional)
- `limit` - Number of matches to return (default: 10)

**Request:**
```bash
curl -X GET "http://localhost:3001/api/matches?subject=Computer%20Science&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const params = new URLSearchParams({
  subject: 'Computer Science',
  limit: '5'
});

const response = await fetch(`http://localhost:3001/api/matches?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const matches = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "matches": [
    {
      "userId": "660e8400-e29b-41d4-a716-446655440001",
      "fullName": "Jane Smith",
      "major": "Computer Science",
      "year": "3",
      "bio": "Love coding and algorithms",
      "compatibilityScore": 85,
      "sharedInterests": ["Algorithms", "Web Development"],
      "learningStyle": "visual",
      "studyPreference": "group"
    },
    {
      "userId": "770e8400-e29b-41d4-a716-446655440002",
      "fullName": "Bob Johnson",
      "major": "Software Engineering",
      "year": "4",
      "bio": "Senior developer interested in teaching",
      "compatibilityScore": 78,
      "sharedInterests": ["Web Development"],
      "learningStyle": "hands-on",
      "studyPreference": "one-on-one"
    }
  ],
  "total": 2
}
```

### Send Connection Request

**Endpoint:** `POST /api/connections/request`

**Request:**
```bash
curl -X POST http://localhost:3001/api/connections/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/connections/request', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    receiverId: '660e8400-e29b-41d4-a716-446655440001'
  })
});

const result = await response.json();
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "connection": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "userId1": "550e8400-e29b-41d4-a716-446655440000",
    "userId2": "660e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "createdAt": "2025-01-15T15:00:00Z"
  }
}
```

### Accept Connection Request

**Endpoint:** `PUT /api/connections/:connectionId/accept`

**Request:**
```bash
curl -X PUT http://localhost:3001/api/connections/880e8400-e29b-41d4-a716-446655440003/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const connectionId = '880e8400-e29b-41d4-a716-446655440003';

const response = await fetch(`http://localhost:3001/api/connections/${connectionId}/accept`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Connection accepted",
  "connection": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "status": "accepted",
    "updatedAt": "2025-01-15T15:10:00Z"
  }
}
```

## Messaging

### Send Message

**Endpoint:** `POST /api/messages`

**Request:**
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "660e8400-e29b-41d4-a716-446655440001",
    "content": "Hey! Want to study algorithms together?"
  }'
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    receiverId: '660e8400-e29b-41d4-a716-446655440001',
    content: 'Hey! Want to study algorithms together?'
  })
});

const message = await response.json();
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "receiverId": "660e8400-e29b-41d4-a716-446655440001",
    "content": "Hey! Want to study algorithms together?",
    "createdAt": "2025-01-15T16:00:00Z"
  }
}
```

### Get Conversation

**Endpoint:** `GET /api/messages/:userId`

**Request:**
```bash
curl -X GET http://localhost:3001/api/messages/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const userId = '660e8400-e29b-41d4-a716-446655440001';

const response = await fetch(`http://localhost:3001/api/messages/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const messages = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "senderId": "550e8400-e29b-41d4-a716-446655440000",
      "receiverId": "660e8400-e29b-41d4-a716-446655440001",
      "content": "Hey! Want to study algorithms together?",
      "createdAt": "2025-01-15T16:00:00Z",
      "sender": {
        "fullName": "John Doe"
      }
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "senderId": "660e8400-e29b-41d4-a716-446655440001",
      "receiverId": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Sure! I'm free tomorrow afternoon.",
      "createdAt": "2025-01-15T16:05:00Z",
      "sender": {
        "fullName": "Jane Smith"
      }
    }
  ],
  "total": 2
}
```

## Peer Reviews

### Submit Review

**Endpoint:** `POST /api/reviews`

**Request:**
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "bb0e8400-e29b-41d4-a716-446655440006",
    "rating": 5,
    "feedback": "Great study session! Very helpful and knowledgeable."
  }'
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    submissionId: 'bb0e8400-e29b-41d4-a716-446655440006',
    rating: 5,
    feedback: 'Great study session! Very helpful and knowledgeable.'
  })
});

const review = await response.json();
```

**Response (201 Created):**
```json
{
  "success": true,
  "review": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "submissionId": "bb0e8400-e29b-41d4-a716-446655440006",
    "reviewerId": "550e8400-e29b-41d4-a716-446655440000",
    "rating": 5,
    "feedback": "Great study session! Very helpful and knowledgeable.",
    "createdAt": "2025-01-15T17:00:00Z"
  }
}
```

### Get Reviews for User

**Endpoint:** `GET /api/reviews/user/:userId`

**Request:**
```bash
curl -X GET http://localhost:3001/api/reviews/user/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const userId = '660e8400-e29b-41d4-a716-446655440001';

const response = await fetch(`http://localhost:3001/api/reviews/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const reviews = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "reviews": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "rating": 5,
      "feedback": "Great study session! Very helpful and knowledgeable.",
      "createdAt": "2025-01-15T17:00:00Z",
      "reviewer": {
        "fullName": "John Doe",
        "userId": "550e8400-e29b-41d4-a716-446655440000"
      }
    }
  ],
  "averageRating": 5.0,
  "totalReviews": 1
}
```

## Gamification

### Get User Points

**Endpoint:** `GET /api/gamification/points`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gamification/points \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/gamification/points', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const points = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "totalPoints": 250,
  "history": [
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "points": 50,
      "action": "complete_profile",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440009",
      "points": 100,
      "action": "study_session_completed",
      "createdAt": "2025-01-15T17:00:00Z"
    },
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440010",
      "points": 100,
      "action": "peer_review_submitted",
      "createdAt": "2025-01-15T17:05:00Z"
    }
  ]
}
```

### Get User Achievements

**Endpoint:** `GET /api/gamification/achievements`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gamification/achievements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/api/gamification/achievements', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const achievements = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "achievements": [
    {
      "id": "100e8400-e29b-41d4-a716-446655440011",
      "name": "First Connection",
      "description": "Made your first study buddy connection",
      "icon": "🤝",
      "earnedAt": "2025-01-15T15:10:00Z"
    },
    {
      "id": "110e8400-e29b-41d4-a716-446655440012",
      "name": "Study Streak",
      "description": "Completed 7 consecutive days of studying",
      "icon": "🔥",
      "earnedAt": "2025-01-22T10:00:00Z"
    }
  ],
  "total": 2
}
```

### Get Leaderboard

**Endpoint:** `GET /api/gamification/leaderboard`

**Query Parameters:**
- `limit` - Number of top users to return (default: 10)
- `period` - Time period: `week`, `month`, `all` (default: `all`)

**Request:**
```bash
curl -X GET "http://localhost:3001/api/gamification/leaderboard?limit=5&period=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript:**
```javascript
const token = localStorage.getItem('token');
const params = new URLSearchParams({
  limit: '5',
  period: 'week'
});

const response = await fetch(`http://localhost:3001/api/gamification/leaderboard?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const leaderboard = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "120e8400-e29b-41d4-a716-446655440013",
      "fullName": "Alice Wonder",
      "totalPoints": 1250,
      "achievementCount": 8
    },
    {
      "rank": 2,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "totalPoints": 250,
      "achievementCount": 2
    },
    {
      "rank": 3,
      "userId": "660e8400-e29b-41d4-a716-446655440001",
      "fullName": "Jane Smith",
      "totalPoints": 180,
      "achievementCount": 3
    }
  ],
  "period": "week",
  "total": 3
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate email) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

### Example Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please login."
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

### Error Handling in JavaScript

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

// Usage
try {
  const profile = await apiRequest('http://localhost:3001/api/users/me');
  console.log('Profile:', profile);
} catch (error) {
  alert(`Error: ${error.message}`);
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Read operations**: 60 requests per minute
- **Write operations**: 30 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642345678
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example:**
```bash
curl -X GET "http://localhost:3001/api/matches?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

## Need Help?

- 📖 See [API-SPECIFICATION.md](./API-SPECIFICATION.md) for detailed API documentation
- 🐛 Report API issues on [GitHub](https://github.com/Miracle-003/skillswapneu-graduation-project/issues)
- 💬 Ask questions in [GitHub Discussions](https://github.com/Miracle-003/skillswapneu-graduation-project/discussions)

---

**Last Updated:** January 2025  
**API Version:** 1.0
