# SkillSwap Graduation Project — Setup Guide

This guide lists exactly what you need to install and the steps to run the project on a new laptop.

## Prerequisites
- Node.js 20+ and npm 10+ (recommend installing via nvm)
- Git
- A Supabase project (or a PostgreSQL database connection URL)

## 1) Install dependencies
Run these in both apps. Use the legacy peer deps flag as requested.

```bash
# Backend
cd backend
npm install --legacy-peer-deps

# Frontend
cd ../frontend
npm install --legacy-peer-deps
```

## 2) Configure environment variables
Create the following files with your own values.

### Frontend: `frontend/.env.local`
```env
# Supabase (Browser)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API base URL (recommended)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: use Next.js rewrites instead of NEXT_PUBLIC_API_URL
# If you set this, requests to /api/* will be proxied to the backend
# BACKEND_URL=http://localhost:3001
```

### Backend: `backend/.env`
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase project (used for auth and SDK)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (used by Prisma)
# From Supabase: Project Settings → Database → Connection Strings (Prisma + Non-pooling)
SUPABASE_POSTGRES_PRISMA_URL=postgresql://...  
SUPABASE_POSTGRES_URL_NON_POOLING=postgresql://...
```

## 3) Prepare the database (Prisma)
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

If your project mirrors `auth.users` into `public.user_accounts`, run the provided SQL in Supabase SQL Editor (see `backend/db/001_user_accounts.sql` if present).

## 4) Run the apps
Open two terminals.

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server runs on http://localhost:${PORT:-3001}

# Terminal 2 — Frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
```

Health check: `GET http://localhost:3001/health`

## Troubleshooting
- Dependency errors: ensure you used `npm install --legacy-peer-deps` in both `backend` and `frontend`.
- 401 errors in frontend: make sure Supabase keys are set and you’re authenticated.
- Database connection errors: verify the Prisma URLs (`SUPABASE_POSTGRES_PRISMA_URL` and `SUPABASE_POSTGRES_URL_NON_POOLING`).
- API routing: either set `NEXT_PUBLIC_API_URL` or configure `BACKEND_URL` for Next.js rewrites.