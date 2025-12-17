# Architecture Design Document (ADD)
## skill swap Matching Platform

**Version:** 1.0  
**Date:** January 2025

---

## 1. Introduction

### 1.1 Purpose
This document describes the software architecture of the skill swap Matching Platform, including system structure, components, data flow, and technology stack.

### 1.2 Scope
Covers frontend, backend, database, and integration architecture for the complete system.

---

## 2. Architectural Goals and Constraints

### 2.1 Goals
- **Scalability**: Support growing user base (10,000+ concurrent users)
- **Performance**: Fast response times (< 2s API, < 3s page load)
- **Maintainability**: Modular, well-documented codebase
- **Security**: Protect user data and prevent attacks
- **Reliability**: 99.5% uptime with fault tolerance

### 2.2 Constraints
- Budget limitations for infrastructure
- Third-party service dependencies
- Browser compatibility requirements
- Real-time communication requirements

---

## 3. System Architecture

### 3.1 Architecture Pattern
**Three-Tier Architecture:**
1. **Presentation Layer** (Frontend)
2. **Application Layer** (Backend API)
3. **Data Layer** (Database)

### 3.2 High-Level Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Next.js Frontend (React + TailwindCSS)             │   │
│  │   - Pages & Components                                │   │
│  │   - State Management (Redux Toolkit)                  │   │
│  │   - Client-side Routing                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Next.js API Routes & Server Actions                │   │
│  │   - Authentication (JWT)                              │   │
│  │   - Business Logic                                    │   │
│  │   - Matching Algorithm                                │   │
│  │   - WebSocket Server                                  │   │
│  │   - AI Integration                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   PostgreSQL Database                                 │   │
│  │   - User Data                                         │   │
│  │   - Matches & Connections                             │   │
│  │   - Messages & Reviews                                │   │
│  │   - Gamification Data                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 4. Component Architecture

### 4.1 Frontend Components

#### 4.1.1 Core Components
- **Layout Components**: Header, Footer, Sidebar, Navigation
- **Authentication Components**: LoginForm, RegisterForm, PasswordReset
- **Profile Components**: ProfileCard, ProfileEditor, AvailabilityScheduler
- **Matching Components**: MatchList, MatchCard, FilterPanel, CompatibilityScore
- **Chat Components**: ChatList, ChatWindow, MessageBubble, FileUpload
- **Review Components**: RatingStars, ReviewForm, ReviewList
- **Gamification Components**: BadgeDisplay, Leaderboard, ProgressBar, AchievementModal
- **AI Components**: OnboardingTour, AIChat, FeatureSuggestions

#### 4.1.2 State Management
**Redux Toolkit Slices:**
- `authSlice`: User authentication state
- `profileSlice`: User profile data
- `matchSlice`: Match results and filters
- `chatSlice`: Active conversations and messages
- `notificationSlice`: System notifications
- `gamificationSlice`: Points, badges, achievements

#### 4.1.3 Routing Structure
\`\`\`
/                          → Landing page
/auth/login                → Login page
/auth/register             → Registration page
/auth/reset-password       → Password reset
/dashboard                 → User dashboard
/profile                   → User profile view/edit
/profile/:userId           → Other user's profile
/matches                   → Browse matches
/chat                      → Chat interface
/chat/:conversationId      → Specific conversation
/reviews                   → Review management
/leaderboard               → Gamification leaderboard
/settings                  → User settings
/admin                     → Admin dashboard (protected)
\`\`\`

### 4.2 Backend Components

#### 4.2.1 API Routes (Next.js)
\`\`\`
/api/auth/register         → POST: User registration
/api/auth/login            → POST: User login
/api/auth/logout           → POST: User logout
/api/auth/verify-email     → GET: Email verification
/api/auth/reset-password   → POST: Password reset request

/api/users/profile         → GET/PUT: User profile
/api/users/:userId         → GET: Public profile
/api/users/availability    → PUT: Update availability

/api/matches               → GET: Get matches (with filters)
/api/matches/request       → POST: Send connection request
/api/matches/accept        → POST: Accept connection
/api/matches/reject        → POST: Reject connection

/api/chat/conversations    → GET: List conversations
/api/chat/messages         → GET/POST: Messages
/api/chat/upload           → POST: File upload

/api/reviews               → GET/POST: Reviews
/api/reviews/:reviewId     → PUT/DELETE: Manage review

/api/gamification/points   → GET: User points
/api/gamification/badges   → GET: User badges
/api/gamification/leaderboard → GET: Leaderboard data

/api/ai/onboarding         → POST: AI chat interaction
\`\`\`

#### 4.2.2 Server Actions
- `authenticateUser()`: JWT validation
- `calculateMatchScore()`: Compatibility algorithm
- `sendNotification()`: Push notifications
- `moderateContent()`: Review moderation
- `updateReputation()`: Reputation calculation

#### 4.2.3 WebSocket Events
\`\`\`
// Client → Server
'message:send'             → Send chat message
'typing:start'             → User typing indicator
'typing:stop'              → Stop typing indicator
'presence:online'          → User online status

// Server → Client
'message:receive'          → New message received
'notification:new'         → New notification
'match:new'                → New match found
'typing:indicator'         → Typing status update
\`\`\`

### 4.3 Database Architecture

#### 4.3.1 Database Schema Overview
See `DATABASE-SCHEMA.md` for detailed schema.

**Core Tables:**
- `users`: User accounts and authentication
- `profiles`: Extended user information
- `subjects`: Academic subjects
- `user_subjects`: User expertise mapping
- `matches`: Match relationships
- `messages`: Chat messages
- `conversations`: Chat threads
- `reviews`: Peer reviews
- `achievements`: Gamification badges
- `user_achievements`: User badge tracking
- `points_history`: Points transactions

#### 4.3.2 Data Access Layer
**Prisma ORM:**
- Type-safe database queries
- Migration management
- Relationship handling
- Query optimization

---

## 5. Technology Stack

### 5.1 Frontend Technologies
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: TailwindCSS v4
- **State Management**: Redux Toolkit
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Native fetch API
- **WebSocket**: Socket.io-client
- **Onboarding**: React Joyride

### 5.2 Backend Technologies
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Real-time**: Socket.io
- **File Upload**: Vercel Blob
- **Email**: Nodemailer

### 5.3 AI Integration
- **Service**: OpenAI API (GPT-4)
- **Use Cases**: Onboarding chat, recommendations
- **Fallback**: Rule-based responses

### 5.4 DevOps & Deployment
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Vercel
- **Database Hosting**: Neon / Supabase
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (optional)

### 5.5 Testing Tools
- **Unit Testing**: Jest
- **Integration Testing**: Jest + React Testing Library
- **E2E Testing**: Cypress
- **API Testing**: Postman / Insomnia

---

## 6. Data Flow

### 6.1 Authentication Flow
\`\`\`
1. User submits login credentials
2. Frontend sends POST to /api/auth/login
3. Backend validates credentials against database
4. Backend generates JWT token
5. Token sent to client and stored in httpOnly cookie
6. Subsequent requests include token in Authorization header
7. Backend middleware validates token on protected routes
\`\`\`

### 6.2 Matching Flow
\`\`\`
1. User navigates to /matches page
2. Frontend fetches user profile and preferences
3. Frontend sends GET to /api/matches with filters
4. Backend runs matching algorithm:
   a. Query database for potential matches
   b. Calculate compatibility scores
   c. Sort by score and apply filters
5. Backend returns top matches
6. Frontend displays match cards
7. User sends connection request
8. Backend creates match record
9. Recipient receives notification
\`\`\`

### 6.3 Real-time Chat Flow
\`\`\`
1. User opens chat interface
2. Frontend establishes WebSocket connection
3. User types message and clicks send
4. Frontend emits 'message:send' event
5. Backend receives event via WebSocket
6. Backend saves message to database
7. Backend emits 'message:receive' to recipient
8. Recipient's frontend updates chat UI
9. Both users see message in real-time
\`\`\`

### 6.4 Review Submission Flow
\`\`\`
1. User completes study session
2. System prompts for review
3. User submits rating and text
4. Frontend sends POST to /api/reviews
5. Backend validates review data
6. Backend saves review to database
7. Backend recalculates recipient's reputation score
8. Backend updates user's reputation
9. Frontend displays success message
\`\`\`

---

## 7. Security Architecture

### 7.1 Security Architecture Overview (Backend-Owned)
This system is designed so that **the backend is the single source of truth for identity and authorization**. No third-party authentication provider (e.g., Supabase Auth) participates in login, session, or access control decisions.

**Ownership and trust boundaries**
- **Backend owns authentication**: credentials are validated only by the backend against application-owned tables.
- **Backend owns authorization**: all access-control decisions are enforced in Express middleware/route handlers.
- **Database trusts only the backend**: the client never connects directly to the database; RLS/Supabase Auth are not used as security authorities.

**Identity model**
- **Authoritative user id**: `app_users.id` (UUID).
- **JWT subject**: the backend issues JWTs where `sub = app_users.id`.
- **Request context**: protected routes derive identity exclusively from `req.user.id` (decoded JWT).

**Authentication**
- **Password hashing**: bcrypt/argon2 hashes stored in `app_users.password_hash` (plaintext passwords are never stored).
- **Email verification & reset**: single-use token records in `email_verification_tokens` (hashed secrets, TTL).
- **JWT issuance**: on successful login; signed with `JWT_SECRET`; rejected if missing/expired/malformed.

**Authorization rules (enforced server-side)**
- **Never trust client-supplied user ids**: any `userId`, `senderId`, `userId1` in body/query/params is ignored or rejected if it does not match `req.user.id`.
- **Profiles**: create/update always targets `req.user.id`.
- **Messaging**: sender is always `req.user.id`; a user can only read conversations they participate in.
- **Matches/Connections**: users can only read/update relationships that include `req.user.id`.

**Portability**
- **Single DB env var**: the backend uses `DATABASE_URL` and works with any PostgreSQL provider (Supabase/Neon/Render/RDS).
  If Supabase is used, it acts only as **PostgreSQL hosting**, not as an authentication/authorization system.

### 7.2 Data Protection
- **Encryption**: HTTPS for all communications
- **SQL Injection**: Parameterized queries via Prisma
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: CSRF tokens on state-changing operations
- **Rate Limiting**: API throttling (100 requests/minute per user)

### 7.3 Privacy Measures
- **Data Minimization**: Collect only necessary information
- **User Consent**: Explicit opt-in for data usage
- **Data Deletion**: User-initiated account deletion
- **Access Logs**: Audit trail for sensitive operations

---

## 8. Performance Optimization

### 8.1 Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Caching**: Browser caching for static assets
- **Minification**: Production build optimization
- **CDN**: Static asset delivery via Vercel Edge Network

### 8.2 Backend Optimization
- **Database Indexing**: Indexes on frequently queried columns
- **Query Optimization**: Efficient SQL queries, avoid N+1 problems
- **Connection Pooling**: Reuse database connections
- **Caching**: Redis for session and frequently accessed data
- **Pagination**: Limit query results (default: 20 items per page)

### 8.3 Real-time Optimization
- **WebSocket Pooling**: Efficient connection management
- **Message Batching**: Group multiple messages
- **Compression**: gzip compression for messages

---

## 9. Scalability Strategy

### 9.1 Horizontal Scaling
- **Stateless Backend**: Enable multiple server instances
- **Load Balancing**: Distribute traffic across servers
- **Database Replication**: Read replicas for query distribution

### 9.2 Vertical Scaling
- **Resource Allocation**: Increase server CPU/RAM as needed
- **Database Optimization**: Tune PostgreSQL configuration

### 9.3 Microservices (Future)
- **Chat Service**: Separate real-time messaging service
- **Matching Service**: Dedicated matching algorithm service
- **Notification Service**: Centralized notification handling

---

## 10. Deployment Architecture

### 10.1 Production Environment
\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │   Next.js Application (Frontend + API Routes)     │  │
│  │   - Serverless Functions                          │  │
│  │   - Edge Functions                                │  │
│  │   - Static Assets (CDN)                           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ PostgreSQL Connection
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Neon / Supabase PostgreSQL                  │
│  - Primary Database                                      │
│  - Automated Backups                                     │
│  - Connection Pooling                                    │
└─────────────────────────────────────────────────────────┘
\`\`\`

### 10.2 CI/CD Pipeline
\`\`\`
1. Developer pushes code to GitHub
2. GitHub Actions triggered
3. Run automated tests (Jest, Cypress)
4. Build Next.js application
5. Deploy to Vercel (preview for branches, production for main)
6. Run database migrations (Prisma)
7. Notify team of deployment status
\`\`\`

---

## 11. Monitoring & Maintenance

### 11.1 Monitoring
- **Application Monitoring**: Vercel Analytics
- **Error Tracking**: Console logging, optional Sentry
- **Performance Metrics**: Core Web Vitals tracking
- **Database Monitoring**: Query performance analysis

### 11.2 Logging
- **Application Logs**: Structured logging with timestamps
- **Error Logs**: Stack traces and context
- **Access Logs**: API request logging
- **Audit Logs**: Security-sensitive operations

### 11.3 Backup Strategy
- **Database Backups**: Daily automated backups (retained 30 days)
- **File Backups**: Cloud storage redundancy
- **Disaster Recovery**: Documented recovery procedures

---

## 12. Future Enhancements

### 12.1 Planned Features
- Mobile native applications (React Native)
- Video call integration
- Advanced analytics dashboard
- Machine learning-enhanced matching
- Multi-university support
- Study group formation (3+ users)

### 12.2 Technical Improvements
- GraphQL API implementation
- Microservices architecture
- Kubernetes orchestration
- Advanced caching (Redis)
- Real-time collaboration tools

---

## Appendix: Technology Justification

### Why Next.js?
- Full-stack framework (frontend + backend)
- Excellent performance (SSR, SSG, ISR)
- Built-in API routes
- Vercel deployment optimization
- Strong TypeScript support

### Why PostgreSQL?
- Robust relational database
- ACID compliance
- Complex query support
- Excellent performance
- Strong community support

### Why Prisma?
- Type-safe database access
- Intuitive schema definition
- Automated migrations
- Excellent developer experience

### Why Socket.io?
- Reliable WebSocket implementation
- Automatic reconnection
- Room-based messaging
- Fallback mechanisms
