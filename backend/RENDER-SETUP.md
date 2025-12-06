# Render Backend Setup

## Build Command
Change your Render build command from:
\`\`\`
npm ci --legacy-peer-deps -w backend && npm run prisma:generate -w backend
\`\`\`

To:
\`\`\`
cd backend && npm install && npx prisma generate
\`\`\`

## Start Command
\`\`\`
cd backend && npm start
\`\`\`

## Environment Variables (Required in Render Dashboard)
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong random string)
- `FRONTEND_URL` - https://skillswapneu.vercel.app
- `MAILERSEND_API_KEY` - Your MailerSend API key
- `MAILERSEND_FROM` - noreply@mirr-codes.dev
- `NODE_ENV` - production
- `PORT` - 10000 (Render default)

## Important Notes
1. The build command uses `npm install` instead of `npm ci` because there's no package-lock.json
2. Make sure to run `npx prisma generate` after install to generate the Prisma client
3. The backend runs on port 10000 by default on Render
