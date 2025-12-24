# Render Backend Setup

## Root Directory (important)
If your Render logs show `bash: line 1: cd: backend: No such file or directory`, your service **Root Directory is already `backend/`**.
In that case, **do not** use `cd backend` in commands.

## Build Command (recommended)
If Root Directory is `backend/`:
\`\`\`
npm install && npx prisma generate && npx prisma migrate deploy
\`\`\`

If Root Directory is the repo root:
\`\`\`
cd backend && npm install && npx prisma generate && npx prisma migrate deploy
\`\`\`

## Start Command
If Root Directory is `backend/`:
\`\`\`
npm start
\`\`\`

If Root Directory is the repo root:
\`\`\`
cd backend && npm start
\`\`\`

## Environment Variables (Required in Render Dashboard)
- `DATABASE_URL` - Render PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection string used by Prisma migrations (set this equal to `DATABASE_URL` on Render Postgres)
- `JWT_SECRET` - Secret key for JWT tokens (generate a strong random string)
- `APP_URL` - Frontend base URL (used to build email verification/reset links), e.g. https://skillswapneu.vercel.app
- `MAILERSEND_API_KEY` - Your MailerSend API key
- `MAILERSEND_FROM` - noreply@mirr-codes.dev
- `NODE_ENV` - production
- `PORT` - 10000 (Render default)

## Optional Environment Variables
- `PG_SSL_NO_VERIFY` - Set to `true` only if you see `self-signed certificate in certificate chain` errors from Prisma/pg.
  This disables TLS certificate verification and is not recommended unless you understand the security tradeoff.

## Important Notes
1. The build command uses `npm install` (not `npm ci`) for compatibility when deploying the `backend/` workspace as a subdirectory.
2. Make sure to run `npx prisma generate` after install to generate the Prisma client
3. The backend runs on port 10000 by default on Render
4. Prisma v7 uses `backend/prisma.config.ts` (repo root for the backend) for the migration datasource URL; ensure `DATABASE_URL` is set before the first deploy.
