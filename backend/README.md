# Backend service

A minimal Node.js + TypeScript API using Express and Supabase.

## Setup

1. Copy .env.example to .env and fill values (reuse your existing SUPABASE_URL and ANON key).
2. Install deps and run:

```bash
npm install
npm run dev
```

The server runs on http://localhost:4000 by default.

## Endpoints

- GET /health
- GET /api/auth/me (auth required) – auth user details
- GET /api/me (auth required) – current user profile row
- PUT /api/me (auth required) – body: partial profile fields
- GET /api/profiles
- GET /api/profiles/:id
- GET /api/users – list registered users from public.user_accounts
- GET /api/users/:id – one registered user

## Database setup for registered users list

Run this SQL in Supabase SQL Editor to create a mirror of auth.users:

- backend/db/001_user_accounts.sql

This creates public.user_accounts and a trigger to copy new auth.users rows for safe public reads.
