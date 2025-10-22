# API Specification Document
## Study Buddy Matching Platform

**Version:** 1.0  
**Date:** January 2025  
**Base URL:** `https://study-buddy-platform.vercel.app/api`

---

## 1. Authentication

All protected endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### 1.1 Register User
**Endpoint:** `POST /auth/register`  
**Description:** Create a new user account  
**Authentication:** None

**Request Body:**
\`\`\`json
{
  "email": "student@university.edu",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "university": "Near East University",
  "major": "Computer Science",
  "year": 2
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu"
  }
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

### 1.2 Login
**Endpoint:** `POST /auth/login`  
**Description:** Authenticate user and receive JWT token  
**Authentication:** None

**Request Body:**
\`\`\`json
{
  "email": "student@university.edu",
  "password": "SecurePass123!"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@university.edu",
      "role": "student",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "https://..."
      }
    }
  }
}
\`\`\`

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Email not verified

---

### 1.3 Verify Email
**Endpoint:** `GET /auth/verify-email?token=<verification_token>`  
**Description:** Verify user email address  
**Authentication:** None

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Email verified successfully"
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: Invalid or expired token

---

### 1.4 Request Password Reset
**Endpoint:** `POST /auth/reset-password`  
**Description:** Request password reset email  
**Authentication:** None

**Request Body:**
\`\`\`json
{
  "email": "student@university.edu"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Password reset email sent"
}
\`\`\`

---

### 1.5 Reset Password
**Endpoint:** `POST /auth/reset-password/confirm`  
**Description:** Reset password with token  
**Authentication:** None

**Request Body:**
\`\`\`json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Password reset successful"
}
\`\`\`

---

## 2. User Profile

### 2.1 Get Current User Profile
**Endpoint:** `GET /users/profile`  
**Description:** Retrieve authenticated user's profile  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://...",
      "bio": "Computer Science student passionate about AI",
      "university": "Near East University",
      "major": "Computer Science",
      "year": 2,
      "gpa": 3.75,
      "studyPreference": "hybrid",
      "location": "Nicosia, Cyprus",
      "timezone": "Europe/Nicosia",
      "availability": {
        "monday": ["09:00-12:00", "14:00-17:00"],
        "tuesday": ["10:00-13:00"]
      },
      "learningGoals": "Master machine learning algorithms",
      "reputationScore": 4.5,
      "totalReviews": 12,
      "subjects": [
        {
          "id": "subject-uuid",
          "name": "Data Structures",
          "skillLevel": "intermediate",
          "isTeaching": true,
          "isLearning": false
        }
      ]
    },
    "stats": {
      "totalMatches": 15,
      "totalPoints": 350,
      "totalAchievements": 8
    }
  }
}
\`\`\`

---

### 2.2 Update Profile
**Endpoint:** `PUT /users/profile`  
**Description:** Update user profile information  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "studyPreference": "online",
  "location": "Nicosia, Cyprus",
  "availability": {
    "monday": ["09:00-12:00"],
    "wednesday": ["14:00-17:00"]
  },
  "learningGoals": "Updated goals"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated profile */ }
}
\`\`\`

---

### 2.3 Get Public Profile
**Endpoint:** `GET /users/:userId`  
**Description:** View another user's public profile  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "profilePicture": "https://...",
    "bio": "Engineering student",
    "university": "Near East University",
    "major": "Mechanical Engineering",
    "year": 3,
    "reputationScore": 4.8,
    "totalReviews": 25,
    "subjects": [
      {
        "name": "Thermodynamics",
        "skillLevel": "advanced",
        "isTeaching": true
      }
    ],
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent study partner!",
        "reviewerName": "John D.",
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
\`\`\`

---

### 2.4 Update Subjects
**Endpoint:** `PUT /users/subjects`  
**Description:** Update user's subject expertise  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "subjects": [
    {
      "subjectId": "subject-uuid-1",
      "skillLevel": "intermediate",
      "isTeaching": true,
      "isLearning": false
    },
    {
      "subjectId": "subject-uuid-2",
      "skillLevel": "beginner",
      "isTeaching": false,
      "isLearning": true
    }
  ]
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Subjects updated successfully"
}
\`\`\`

---

## 3. Matching System

### 3.1 Get Matches
**Endpoint:** `GET /matches`  
**Description:** Get recommended study partners  
**Authentication:** Required

**Query Parameters:**
- `subject` (optional): Filter by subject ID
- `skillLevel` (optional): Filter by skill level
- `studyPreference` (optional): online, in-person, hybrid
- `minReputation` (optional): Minimum reputation score
- `limit` (optional, default: 10): Number of results
- `offset` (optional, default: 0): Pagination offset

**Example:** `GET /matches?subject=uuid&skillLevel=intermediate&limit=20`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "matches": [
      {
        "userId": "user-uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "profilePicture": "https://...",
        "university": "Near East University",
        "major": "Computer Science",
        "year": 3,
        "reputationScore": 4.7,
        "compatibilityScore": 85.5,
        "commonSubjects": [
          {
            "name": "Data Structures",
            "yourLevel": "intermediate",
            "theirLevel": "advanced"
          }
        ],
        "availabilityOverlap": ["monday 09:00-12:00", "wednesday 14:00-17:00"]
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
\`\`\`

---

### 3.2 Send Connection Request
**Endpoint:** `POST /matches/request`  
**Description:** Send study buddy connection request  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "recipientId": "user-uuid",
  "message": "Hi! I'd love to study Data Structures together."
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "message": "Connection request sent",
  "data": {
    "matchId": "match-uuid",
    "status": "pending",
    "compatibilityScore": 85.5
  }
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: Already connected or request pending
- `404 Not Found`: Recipient not found

---

### 3.3 Respond to Connection Request
**Endpoint:** `POST /matches/:matchId/respond`  
**Description:** Accept or reject connection request  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "action": "accept"  // or "reject"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Connection accepted",
  "data": {
    "matchId": "match-uuid",
    "status": "accepted",
    "conversationId": "conversation-uuid"
  }
}
\`\`\`

---

### 3.4 Get My Connections
**Endpoint:** `GET /matches/connections`  
**Description:** Get list of accepted connections  
**Authentication:** Required

**Query Parameters:**
- `status` (optional): pending, accepted, rejected
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "connections": [
      {
        "matchId": "match-uuid",
        "user": {
          "id": "user-uuid",
          "firstName": "Jane",
          "lastName": "Smith",
          "profilePicture": "https://...",
          "reputationScore": 4.7
        },
        "compatibilityScore": 85.5,
        "status": "accepted",
        "acceptedAt": "2025-01-10T14:30:00Z",
        "conversationId": "conversation-uuid"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0
    }
  }
}
\`\`\`

---

## 4. Chat System

### 4.1 Get Conversations
**Endpoint:** `GET /chat/conversations`  
**Description:** Get list of user's conversations  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation-uuid",
        "matchId": "match-uuid",
        "isGroup": false,
        "name": null,
        "participants": [
          {
            "id": "user-uuid",
            "firstName": "Jane",
            "lastName": "Smith",
            "profilePicture": "https://..."
          }
        ],
        "lastMessage": {
          "content": "See you tomorrow!",
          "senderId": "user-uuid",
          "createdAt": "2025-01-20T16:45:00Z",
          "isRead": true
        },
        "unreadCount": 0,
        "lastMessageAt": "2025-01-20T16:45:00Z"
      }
    ]
  }
}
\`\`\`

---

### 4.2 Get Messages
**Endpoint:** `GET /chat/conversations/:conversationId/messages`  
**Description:** Get messages from a conversation  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional, default: 50)
- `before` (optional): Timestamp for pagination

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-uuid",
        "conversationId": "conversation-uuid",
        "senderId": "user-uuid",
        "senderName": "Jane Smith",
        "senderPicture": "https://...",
        "content": "Hey! Ready to study?",
        "messageType": "text",
        "fileUrl": null,
        "fileName": null,
        "isRead": true,
        "createdAt": "2025-01-20T15:30:00Z",
        "editedAt": null
      }
    ],
    "pagination": {
      "hasMore": true,
      "oldestTimestamp": "2025-01-20T15:30:00Z"
    }
  }
}
\`\`\`

---

### 4.3 Send Message
**Endpoint:** `POST /chat/conversations/:conversationId/messages`  
**Description:** Send a message in a conversation  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "content": "Hello! Let's meet at the library.",
  "messageType": "text"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "message-uuid",
    "conversationId": "conversation-uuid",
    "senderId": "user-uuid",
    "content": "Hello! Let's meet at the library.",
    "messageType": "text",
    "createdAt": "2025-01-20T17:00:00Z"
  }
}
\`\`\`

---

### 4.4 Upload File
**Endpoint:** `POST /chat/upload`  
**Description:** Upload file for chat  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: File to upload (max 10MB)
- `conversationId`: Target conversation ID

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "fileUrl": "https://blob.vercel-storage.com/...",
    "fileName": "document.pdf",
    "fileSize": 1024000
  }
}
\`\`\`

---

### 4.5 Mark Messages as Read
**Endpoint:** `POST /chat/conversations/:conversationId/read`  
**Description:** Mark all messages in conversation as read  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Messages marked as read"
}
\`\`\`

---

## 5. Reviews

### 5.1 Submit Review
**Endpoint:** `POST /reviews`  
**Description:** Submit peer review after study session  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "revieweeId": "user-uuid",
  "matchId": "match-uuid",
  "rating": 5,
  "comment": "Excellent study partner! Very knowledgeable and patient."
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "reviewId": "review-uuid",
    "rating": 5,
    "createdAt": "2025-01-20T18:00:00Z"
  }
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: Already reviewed this match
- `403 Forbidden`: Cannot review yourself

---

### 5.2 Get User Reviews
**Endpoint:** `GET /reviews/user/:userId`  
**Description:** Get reviews for a specific user  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional, default: 10)
- `offset` (optional, default: 0)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "averageRating": 4.7,
    "totalReviews": 25,
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Great study partner!",
        "reviewer": {
          "firstName": "John",
          "lastName": "D.",
          "profilePicture": "https://..."
        },
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0
    }
  }
}
\`\`\`

---

### 5.3 Update Review
**Endpoint:** `PUT /reviews/:reviewId`  
**Description:** Update existing review  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "rating": 4,
  "comment": "Updated review text"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Review updated successfully"
}
\`\`\`

---

### 5.4 Flag Review
**Endpoint:** `POST /reviews/:reviewId/flag`  
**Description:** Report inappropriate review  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "reason": "Inappropriate content"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Review flagged for moderation"
}
\`\`\`

---

## 6. Gamification

### 6.1 Get User Points
**Endpoint:** `GET /gamification/points`  
**Description:** Get user's total points and history  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "totalPoints": 350,
    "history": [
      {
        "id": "transaction-uuid",
        "points": 10,
        "reason": "First match completed",
        "referenceType": "match",
        "referenceId": "match-uuid",
        "createdAt": "2025-01-10T12:00:00Z"
      }
    ]
  }
}
\`\`\`

---

### 6.2 Get Achievements
**Endpoint:** `GET /gamification/achievements`  
**Description:** Get all achievements and user progress  
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "unlocked": [
      {
        "id": "achievement-uuid",
        "name": "First Match",
        "description": "Connected with your first study buddy",
        "icon": "🤝",
        "category": "social",
        "points": 10,
        "unlockedAt": "2025-01-10T12:00:00Z"
      }
    ],
    "locked": [
      {
        "id": "achievement-uuid",
        "name": "Week Warrior",
        "description": "Maintained a 7-day study streak",
        "icon": "🔥",
        "category": "streak",
        "points": 50,
        "progress": {
          "current": 3,
          "required": 7
        }
      }
    ]
  }
}
\`\`\`

---

### 6.3 Get Leaderboard
**Endpoint:** `GET /gamification/leaderboard`  
**Description:** Get top users by points  
**Authentication:** Required

**Query Parameters:**
- `period` (optional): week, month, all-time (default: all-time)
- `limit` (optional, default: 50)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user-uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "profilePicture": "https://...",
        "totalPoints": 1250,
        "totalAchievements": 15
      }
    ],
    "currentUser": {
      "rank": 42,
      "totalPoints": 350,
      "totalAchievements": 8
    }
  }
}
\`\`\`

---

## 7. AI Onboarding

### 7.1 Chat with AI Assistant
**Endpoint:** `POST /ai/onboarding`  
**Description:** Interact with AI onboarding assistant  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "message": "How do I find study partners?",
  "context": {
    "currentPage": "/matches",
    "userProgress": {
      "hasCompletedProfile": true,
      "hasFirstMatch": false
    }
  }
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "response": "To find study partners, go to the Matches page and use filters to find students with similar interests. You can filter by subject, skill level, and availability. Once you find someone compatible, send them a connection request!",
    "suggestions": [
      {
        "text": "Show me how to filter matches",
        "action": "tutorial:filter-matches"
      },
      {
        "text": "What makes a good match?",
        "action": "explain:compatibility"
      }
    ]
  }
}
\`\`\`

---

## 8. Subjects

### 8.1 Get All Subjects
**Endpoint:** `GET /subjects`  
**Description:** Get list of available subjects  
**Authentication:** Required

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by name

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": "subject-uuid",
        "name": "Data Structures",
        "category": "STEM",
        "description": "Computer science fundamentals"
      }
    ]
  }
}
\`\`\`

---

## 9. WebSocket Events

### Connection
\`\`\`javascript
// Client connects with JWT token
const socket = io('wss://study-buddy-platform.vercel.app', {
  auth: {
    token: 'jwt-token-here'
  }
});
\`\`\`

### Events

#### Client → Server

**`message:send`**
\`\`\`javascript
socket.emit('message:send', {
  conversationId: 'conversation-uuid',
  content: 'Hello!',
  messageType: 'text'
});
\`\`\`

**`typing:start`**
\`\`\`javascript
socket.emit('typing:start', {
  conversationId: 'conversation-uuid'
});
\`\`\`

**`typing:stop`**
\`\`\`javascript
socket.emit('typing:stop', {
  conversationId: 'conversation-uuid'
});
\`\`\`

#### Server → Client

**`message:receive`**
\`\`\`javascript
socket.on('message:receive', (data) => {
  // data: { message object }
});
\`\`\`

**`notification:new`**
\`\`\`javascript
socket.on('notification:new', (data) => {
  // data: { type, title, message, link }
});
\`\`\`

**`match:new`**
\`\`\`javascript
socket.on('match:new', (data) => {
  // data: { matchId, user object }
});
\`\`\`

**`typing:indicator`**
\`\`\`javascript
socket.on('typing:indicator', (data) => {
  // data: { conversationId, userId, isTyping }
});
\`\`\`

---

## 10. Error Responses

All error responses follow this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional information
  }
}
\`\`\`

### Common Error Codes
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 11. Rate Limiting

- **General API**: 100 requests per minute per user
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per hour per user
- **AI Chat**: 20 requests per hour per user

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
\`\`\`

---

## Appendix: Postman Collection

A complete Postman collection is available for testing all endpoints. Import the collection file `study-buddy-api.postman_collection.json` to get started.
