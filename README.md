# SkillSwap Graduation Project — Setup Guide

This guide lists exactly what you need to install and the steps to run the project on a new laptop.

## Prerequisites
- Node.js 20+ and npm 10+ (recommend installing via nvm)
- Git
- A PostgreSQL database connection URL (Render Postgres recommended)

## 1) Install dependencies
Run these in both apps. Use the legacy peer deps flag as requested.

\`\`\`bash
# Backend
cd backend
npm install --legacy-peer-deps

# Frontend
cd ../frontend
npm install --legacy-peer-deps
\`\`\`

## 2) Configure environment variables
Create the following files with your own values.

### Frontend: `frontend/.env.local`
\`\`\`env
# API base URL (recommended)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: use Next.js rewrites instead of NEXT_PUBLIC_API_URL
# If you set this, requests to /api/* will be proxied to the backend
# BACKEND_URL=http://localhost:3001
\`\`\`

### Backend: `backend/.env`
\`\`\`env
# Server
PORT=3001
NODE_ENV=development

# Database (used by Prisma)
# Works with Render/Neon/AWS RDS/etc.
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
JWT_SECRET=your_jwt_secret

# App URL used to build verification/reset links
APP_URL=http://localhost:3000
\`\`\`

## 3) Prepare the database (Prisma)
\`\`\`bash
cd backend
npx prisma generate
npx prisma migrate dev
\`\`\`

If your project includes optional user mirroring into `public.user_accounts`, run the provided SQL (see `backend/db/001_user_accounts.sql` if present).

## 4) Run the apps
Open two terminals.

\`\`\`bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server runs on http://localhost:${PORT:-3001}

# Terminal 2 — Frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
\`\`\`

Health check: `GET http://localhost:3001/health`

## Troubleshooting
- Dependency errors: ensure you used `npm install --legacy-peer-deps` in both `backend` and `frontend`.
- 401 errors in frontend: ensure you have a valid JWT in `localStorage` (`auth_token`) by logging in.
- Database connection errors: verify `DATABASE_URL`/`DIRECT_URL`.
- API routing: either set `NEXT_PUBLIC_API_URL` or configure `BACKEND_URL` for Next.js rewrites.
 
 
