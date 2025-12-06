# SkillSwap Project Structure

## Overview
This is a monorepo containing both frontend (Next.js 14) and backend (Node.js + Express + Prisma).

## Root Structure
\`\`\`
skillswap/
├── frontend/              # Next.js frontend application
├── backend/               # Node.js + Express backend
├── docs/                  # Project documentation
└── README.md
\`\`\`

## Frontend Structure (Next.js 14)
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
│   │   ├── matches/      # Bumble-style matching
│   │   ├── chat/         # Real-time messaging
│   │   ├── reviews/      # Peer reviews
│   │   ├── achievements/ # Gamification
│   │   ├── notifications/# Notifications
│   │   ├── study-locations/ # Map with Leaflet
│   │   └── onboarding/   # New user onboarding
│   ├── admin/           # Admin dashboard
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles (Tailwind v3)
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── map-component.tsx # Leaflet map
├── lib/                  # Utilities and helpers
│   ├── api/             # Axios API layer
│   │   ├── axios-client.ts
│   │   ├── services/    # API services (auth, profile, match, message)
│   │   └── hooks/       # React hooks for API
│   ├── matching-algorithm.ts
│   └── utils.ts         # Utility functions
├── public/              # Static assets
├── package.json
├── tailwind.config.js   # Tailwind CSS v3 config
├── postcss.config.js
└── tsconfig.json
\`\`\`

## Backend Structure (Node.js + Express + Prisma)
\`\`\`
backend/
├── src/
│   ├── index.js          # Entry point (Express server)
│   ├── config/
│   │   └── env.ts        # Environment config
│   ├── lib/
│   │   ├── prisma.js     # Prisma client singleton
│   │   ├── jwt.js        # JWT utilities
│   │   ├── email.js      # Email sending (SendGrid/MailerSend)
│   │   └── emailValidation.js
│   ├── middleware/
│   │   ├── requireAuth.js   # JWT auth middleware
│   │   └── requireAdmin.js  # Admin role check
│   └── routes/
│       ├── auth.js       # Custom JWT authentication
│       ├── profiles.js   # User profiles
│       ├── matches.js    # Matching system
│       ├── messages.js   # Messaging
│       ├── connections.js# User connections
│       └── admin.js      # Admin routes
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/
│   └── seed-admin.js     # Admin seeder
├── .env.example
├── package.json
└── README.md
\`\`\`

## Key Files

### Frontend
- `frontend/lib/api/axios-client.ts` - Axios with JWT interceptors
- `frontend/lib/api/services/auth.service.ts` - Auth API calls
- `frontend/app/layout.tsx` - Root layout with Inter font

### Backend
- `backend/src/index.js` - Express server setup
- `backend/src/lib/prisma.js` - Prisma client
- `backend/src/routes/auth.js` - Custom JWT auth (register, login, verify, reset)
- `backend/prisma/schema.prisma` - All database models

## Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=https://skillswapneu.vercel.app
\`\`\`

### Backend (.env)
\`\`\`env
# Database (Supabase PostgreSQL)
SUPABASE_POSTGRES_PRISMA_URL=your_pooled_url
SUPABASE_POSTGRES_URL_NON_POOLING=your_direct_url

# Auth
JWT_SECRET=your_jwt_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com

# App
PORT=3001
APP_URL=http://localhost:3000
\`\`\`

## Running the Project

### Development
\`\`\`bash
# Backend (start first)
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
\`\`\`

### Production
- Frontend: Deploy to Vercel
- Backend: Deploy to Vercel/Railway/Render

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS v3
- shadcn/ui
- Axios (API calls)
- Leaflet.js (Maps)
- Framer Motion (Animations)

### Backend
- Node.js 18+
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication (jsonwebtoken)
- bcrypt/argon2 (Password hashing)
- SendGrid (Email)
- JavaScript (ES Modules)
