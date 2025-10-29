# SkillSwap Project Structure

## Overview
This is a monorepo containing both frontend (Next.js) and backend (Node.js + Express + Prisma).

## Root Structure
\`\`\`
skillswap/
├── frontend/              # Next.js frontend application
├── backend/               # Node.js + Express backend
├── docs/                  # Project documentation
├── package.json           # Root package.json (monorepo)
└── README.md
\`\`\`

## Frontend Structure (Next.js)
\`\`\`
frontend/
├── app/                   # Next.js App Router
│   ├── auth/             # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── profile/      # User profile
│   │   ├── matches/      # Study partner matches
│   │   ├── chat/         # Real-time messaging
│   │   ├── reviews/      # Peer reviews
│   │   ├── achievements/ # Gamification
│   │   └── onboarding/   # New user onboarding
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── theme-provider.tsx
├── lib/                  # Utilities and helpers
│   ├── api/             # Axios API layer
│   │   ├── axios-client.ts
│   │   ├── services/    # API services
│   │   └── hooks/       # React hooks for API
│   ├── supabase/        # Supabase clients
│   └── utils.ts         # Utility functions
├── public/              # Static assets
├── package.json
└── tsconfig.json
\`\`\`

## Backend Structure (Node.js + Express)
\`\`\`
backend/
├── src/
│   ├── index.js          # Entry point
│   ├── lib/
│   │   └── prisma.js     # Prisma client singleton
│   └── routes/           # API routes
│       ├── auth.js       # Authentication
│       ├── profiles.js   # User profiles
│       ├── matches.js    # Matching system
│       └── messages.js   # Messaging
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── package.json
└── README.md
\`\`\`

## Key Files

### Frontend
- `frontend/lib/api/axios-client.ts` - Axios configuration with interceptors
- `frontend/lib/api/services/` - API service modules (auth, profiles, etc.)
- `frontend/lib/api/hooks/` - React hooks for API calls
- `frontend/app/layout.tsx` - Root layout with providers

### Backend
- `backend/src/index.js` - Express server setup
- `backend/src/lib/prisma.js` - Prisma client (connects to Supabase PostgreSQL)
- `backend/prisma/schema.prisma` - Database models
- `backend/src/routes/` - API endpoints

## Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=https://skillswapneu.vercel.app
SUPABASE_NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3001
NODE_ENV=development
\`\`\`

## Running the Project

### Development
\`\`\`bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
\`\`\`

### Production
- Frontend: Deploy to Vercel
- Backend: Deploy to Vercel/Railway/Render

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios (API calls)
- Supabase (Auth)

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- JavaScript (ES Modules)
