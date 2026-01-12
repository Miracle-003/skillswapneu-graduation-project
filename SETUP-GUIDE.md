# SkillSwap NEU - Complete Setup Guide

This comprehensive guide will help you set up and run the SkillSwap project from scratch on any machine.

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Test Credentials](#test-credentials)
- [Troubleshooting](#troubleshooting)
- [Additional Scripts](#additional-scripts)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** v20.x or higher (< v23)
- **npm** v10.x or higher
- **Git**
- **PostgreSQL** database (Neon, Render, AWS RDS, or local)

### Recommended Tools
- **VS Code** or your preferred IDE
- **Postman** or similar API testing tool (optional)
- **Prisma Studio** (included with Prisma)

### Check Your Installation
```bash
node --version  # Should show v20.x or v21.x or v22.x
npm --version   # Should show v10.x or higher
git --version   # Any recent version
```

---

## 📁 Project Overview

This project consists of two main applications:

### Backend (Express.js + Prisma + PostgreSQL)
- **Location:** `backend/`
- **Port:** 3001
- **Stack:** Node.js, Express, Prisma ORM, PostgreSQL
- **Features:** REST API, Authentication (JWT), Matching Algorithm, Messaging

### Frontend (Next.js 14 + React)
- **Location:** `frontend/`
- **Port:** 3000
- **Stack:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Features:** User Dashboard, Profile Management, Match Discovery, Real-time Chat

---

## 🚀 Installation Steps

### Step 1: Clone the Repository
```bash
cd ~/Documents/projects  # or your preferred directory
git clone https://github.com/Miracle-003/skillswapneu-graduation-project.git
cd skillswapneu-graduation-project
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required due to some dependency conflicts.

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install --legacy-peer-deps
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a file: `backend/.env`

```env
# ======================
# SERVER CONFIGURATION
# ======================
PORT=3001
NODE_ENV=development

# ======================
# DATABASE CONFIGURATION
# ======================
# Primary database URL (used by Prisma for migrations and queries)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Direct connection URL (used for connection pooling with Neon/PgBouncer)
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"

# ======================
# AUTHENTICATION
# ======================
# Generate a secure random string for production
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Token expiration (default: 24 hours)
JWT_EXPIRES_IN="24h"

# ======================
# APPLICATION URLS
# ======================
# Frontend URL (used for CORS and email links)
APP_URL="http://localhost:3000"

# Backend API URL
API_URL="http://localhost:3001"

# ======================
# EMAIL CONFIGURATION (Optional)
# ======================
# Leave these empty if you don't want to set up email yet
EMAIL_HOST=""
EMAIL_PORT=""
EMAIL_USER=""
EMAIL_PASSWORD=""
EMAIL_FROM="noreply@skillswap.com"
```

### Frontend Environment Variables

Create a file: `frontend/.env.local`

```env
# ======================
# API CONFIGURATION
# ======================
# Backend API URL - Used by the frontend to make API calls
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# ======================
# OPTIONAL: PROXY CONFIGURATION
# ======================
# Alternative: Use Next.js rewrites instead of NEXT_PUBLIC_API_URL
# Uncomment this if you prefer server-side proxying
# BACKEND_URL=http://localhost:3001
```

### Environment Variable Notes

**For Production:**
- Change `JWT_SECRET` to a strong random string
- Update `APP_URL` to your production domain
- Use `https://` instead of `http://`
- Set `NODE_ENV=production`

**Database URLs:**
- **Neon (Recommended):** Get free PostgreSQL at [neon.tech](https://neon.tech)
- **Render:** Get free PostgreSQL at [render.com](https://render.com)
- **Local PostgreSQL:** `postgresql://postgres:password@localhost:5432/skillswap`

---

## 🗄️ Database Setup

### Step 1: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Step 2: Run Database Migrations
```bash
npx prisma migrate dev
```

This will:
- Create all necessary tables
- Set up relationships and constraints
- Apply any pending migrations

### Step 3: (Optional) Seed Database with Test Data
```bash
node create-dummy-data.js
```

This creates:
- 5 test users with complete profiles
- Sample connections between users
- Sample messages and conversations
- Test match data

### Step 4: (Optional) View Database with Prisma Studio
```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`

---

## 🏃 Running the Application

You need **two terminal windows** open simultaneously.

### Terminal 1: Start Backend Server
```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://0.0.0.0:3001
📧 Email service: Configured ✅
🗄️  Database: Connected ✅
🔐 JWT: Configured ✅
🌍 Environment: development
```

**Health Check:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Terminal 2: Start Frontend Server
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 3.1s
```

### Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **API Health:** http://localhost:3001/health

---

## 🔐 Test Credentials

### Main Test Account
Use these credentials to log in:

```
Email:    test@skillswap.com
Password: Test123456
```

### Additional Test Accounts
If you ran the `create-dummy-data.js` script, these accounts are also available:

```
Email:    sarah.johnson@skillswap.com
Password: Test123456

Email:    michael.chen@skillswap.com
Password: Test123456

Email:    emily.rodriguez@skillswap.com
Password: Test123456
```

**Note:** All test accounts use the same password: `Test123456`

### Creating Your Own Account
You can also create a new account:
1. Go to http://localhost:3000/auth/signup
2. Fill in your details
3. Complete your profile at `/dashboard/profile`

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Port Already in Use**
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

#### 2. **Database Connection Errors**
- Verify your `DATABASE_URL` is correct
- Check if your database is running (for local PostgreSQL)
- Ensure your IP is whitelisted (for cloud databases like Neon)
- Test connection: `npx prisma db push`

#### 3. **Prisma Client Not Generated**
```bash
cd backend
npx prisma generate
```

#### 4. **Migration Errors**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually apply migrations
npx prisma migrate deploy
```

#### 5. **401 Unauthorized Errors**
- Clear browser localStorage and cookies
- Log in again to get a fresh JWT token
- Check if `JWT_SECRET` is set in backend `.env`

#### 6. **CORS Errors**
- Ensure `APP_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `backend/src/index.js`

#### 7. **Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 8. **TypeScript Errors in Frontend**
```bash
cd frontend
npm run build  # Check for build errors
```

#### 9. **Prisma Studio Won't Start**
```bash
# Kill any existing Prisma Studio instances
pkill -f "prisma studio"

# Start fresh
npx prisma studio --port 5555
```

---

## 📜 Additional Scripts

### Backend Scripts

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Build for production (runs migrations)
npm run build

# Prisma commands
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Create new migration
npm run prisma:deploy     # Apply migrations (production)
npm run prisma:studio     # Open Prisma Studio
npm run prisma:reset      # Reset database (WARNING: Deletes all data)

# Utility scripts
node create-dummy-data.js         # Create test users and data
node create-test-user.js          # Create single test user
node check-db-schema.js           # Verify database schema
node check-matches.js             # Check matches in database
```

### Frontend Scripts

```bash
# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 🎯 Project Structure

```
skillswapneu-graduation-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── index.js              # Server entry point
│   │   ├── lib/                  # Utilities (Prisma, matching)
│   │   ├── middleware/           # Auth middleware
│   │   ├── routes/               # API routes
│   │   └── schemas/              # Validation schemas
│   ├── .env                      # Environment variables
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── auth/                 # Login/Signup pages
│   │   ├── dashboard/            # Main application
│   │   │   ├── chat/            # Chat interface
│   │   │   ├── matches/         # Match discovery
│   │   │   └── profile/         # User profile
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/               # Reusable components
│   ├── lib/                      # Utilities and API client
│   ├── .env.local               # Environment variables
│   └── package.json
├── docs/                         # Documentation
├── README.md                     # Basic setup guide
└── SETUP-GUIDE.md               # This file
```

---

## 🌟 Features Overview

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Email verification (optional)
- ✅ Password reset (optional)
- ✅ Protected routes

### User Profiles
- ✅ Complete profile management
- ✅ Major, year, courses, interests
- ✅ Learning style and preferences
- ✅ Profile completion tracking

### Matching System
- ✅ Algorithm-based match suggestions
- ✅ Compatibility scoring
- ✅ Course/interest overlap detection
- ✅ Real-time match updates

### Messaging
- ✅ One-on-one conversations
- ✅ Message history
- ✅ Connection management
- ✅ Real-time chat interface

### Dashboard
- ✅ Overview statistics
- ✅ Recent matches
- ✅ Quick actions
- ✅ Profile completion status

---

## 🚢 Deployment (Optional)

### Backend Deployment (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm run render-build`
4. Set start command: `npm start`
5. Add environment variables from `.env`

### Frontend Deployment (Vercel)
1. Push your code to GitHub
2. Import project to Vercel
3. Set framework preset: Next.js
4. Add environment variables from `.env.local`
5. Deploy!

### Database (Neon - Recommended)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection strings to `DATABASE_URL` and `DIRECT_URL`
4. Run migrations: `npx prisma migrate deploy`

---

## 📞 Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Docs](https://expressjs.com)

### Project Documentation
- `docs/API-SPECIFICATION.md` - API endpoints
- `docs/DATABASE-SCHEMA.md` - Database structure
- `docs/ARCHITECTURE.md` - System architecture
- `docs/MATCHMAKING-WORKFLOW.md` - Matching algorithm

### Issues?
If you encounter any issues not covered in this guide, check:
1. Backend console for error messages
2. Frontend console (browser DevTools)
3. Database connection with Prisma Studio
4. Environment variables are set correctly

---

## ✅ Quick Start Checklist

- [ ] Node.js v20+ installed
- [ ] PostgreSQL database created (Neon/Render/Local)
- [ ] Repository cloned
- [ ] Backend dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Frontend dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Backend `.env` file created and configured
- [ ] Frontend `.env.local` file created and configured
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Database migrations run (`npx prisma migrate dev`)
- [ ] Test data created (optional: `node create-dummy-data.js`)
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Logged in with test credentials

---

## 🎓 For Advisor Presentation

### Demo Flow
1. **Login:** Use `test@skillswap.com` / `Test123456`
2. **Dashboard:** Show overview and statistics
3. **Profile:** Display completed profile with courses/interests
4. **Matches:** Show match discovery with compatibility scores
5. **Chat:** Demonstrate messaging functionality
6. **Connect:** Show how users connect with matches

### Key Features to Highlight
- ✅ Intelligent matching algorithm based on courses and interests
- ✅ Real-time chat and messaging
- ✅ Profile completion tracking
- ✅ User-friendly interface with dummy data for demonstration
- ✅ Secure authentication with JWT
- ✅ Scalable architecture (Next.js + Express + PostgreSQL)

---

**Last Updated:** January 10, 2026

**Version:** 1.0.0

**Project:** SkillSwap NEU - Student Peer Learning Platform
