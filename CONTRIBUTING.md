# Contributing to SkillSwap

Thank you for your interest in contributing to SkillSwap! This guide will help you get started with development.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Getting Started

### Prerequisites
- **Node.js** 20+ and npm 10+ (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- **Git** for version control
- **PostgreSQL** database (we use Supabase)
- A code editor (VS Code recommended with GitHub Copilot extension)

### Recommended VS Code Extensions
- **GitHub Copilot** - AI-powered code completion
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma** - Database schema intellisense
- **TypeScript** - Enhanced TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind class name completion

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Miracle-003/skillswapneu-graduation-project.git
cd skillswapneu-graduation-project
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
```

### 3. Set Up Environment Variables

#### Backend `.env` file
Create `backend/.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
SUPABASE_POSTGRES_PRISMA_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres
SUPABASE_POSTGRES_URL_NON_POOLING=postgresql://postgres:[YOUR-PASSWORD]@[HOST]/postgres

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration (Optional - for email verification)
SENDGRID_API_KEY=your_sendgrid_api_key
MAILERSEND_API_KEY=your_mailersend_api_key_as_fallback
EMAIL_FROM=noreply@skillswap.com
```

#### Frontend `.env.local` file
Create `frontend/.env.local`:
```env
# Supabase Configuration (Public Keys)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Set Up Database
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed with admin user
npm run seed:admin
```

### 5. Run the Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server will run on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App will run on http://localhost:3000
```

## Project Structure

```
skillswapneu-graduation-project/
├── frontend/              # Next.js frontend application
│   ├── app/              # App Router pages
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Protected dashboard pages
│   │   └── admin/       # Admin pages
│   ├── components/      # React components
│   └── lib/             # Utilities and helpers
├── backend/              # Node.js backend application
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   └── lib/         # Utilities
│   ├── prisma/          # Database schema
│   └── scripts/         # Utility scripts
└── docs/                 # Documentation
```

## Development Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/update-name` - Documentation updates

### Creating a New Feature
1. Create a new branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test thoroughly

3. Commit your changes with meaningful messages:
   ```bash
   git add .
   git commit -m "feat: add user profile editing functionality"
   ```

4. Push your branch and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Guidelines
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add peer review submission feature
fix: resolve authentication token expiration issue
docs: update API documentation for matches endpoint
test: add unit tests for profile controller
```

## Coding Standards

### TypeScript/JavaScript
- Use **TypeScript** for frontend code when possible
- Use **ESM modules** (`import`/`export`) instead of CommonJS
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

**Example:**
```typescript
/**
 * Calculates compatibility score between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<number>} Compatibility score (0-100)
 */
async function calculateCompatibilityScore(userId1, userId2) {
  // Implementation
}
```

### React/Next.js
- Use **functional components** with hooks
- Keep components small and focused (single responsibility)
- Use **TypeScript** for type safety
- Follow the [Next.js App Router](https://nextjs.org/docs/app) conventions
- Use **Server Components** by default, Client Components when needed

**Example:**
```typescript
'use client' // Only when needed for interactivity

import { useState } from 'react'

export function ProfileCard({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  
  // Component logic
  
  return (
    <div className="rounded-lg border bg-card">
      {/* Component UI */}
    </div>
  )
}
```

### CSS/Styling
- Use **Tailwind CSS** for styling
- Follow the utility-first approach
- Use the `cn()` utility for conditional classes
- Keep custom CSS minimal

**Example:**
```typescript
import { cn } from '@/lib/utils'

<button className={cn(
  "px-4 py-2 rounded-md font-medium",
  variant === "primary" && "bg-blue-600 text-white",
  variant === "secondary" && "bg-gray-200 text-gray-800"
)}>
  Click me
</button>
```

### Database/Prisma
- Always use **Prisma Client** for database queries
- Use transactions for multi-step operations
- Add indexes for frequently queried fields
- Include proper foreign key relationships

**Example:**
```typescript
import { prisma } from '@/lib/prisma'

// Good: Using Prisma Client
const user = await prisma.userProfile.findUnique({
  where: { userId: id },
  include: { achievements: true }
})

// Bad: Raw SQL (avoid unless necessary)
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
```

## Testing

### Backend Testing
We use **Jest** for backend testing:

```bash
cd backend
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage
```

**Example Test:**
```javascript
import { describe, expect, test } from '@jest/globals'
import { calculateCompatibilityScore } from '../src/controllers/matches.controller'

describe('Matching Algorithm', () => {
  test('should return score between 0 and 100', async () => {
    const score = await calculateCompatibilityScore('user1', 'user2')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})
```

### Frontend Testing
We use **React Testing Library** for component testing:

```bash
cd frontend
npm test                  # Run all tests
npm test -- --watch      # Watch mode
```

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react'
import { ProfileCard } from '@/components/ProfileCard'

test('renders user profile information', () => {
  render(<ProfileCard userId="123" />)
  expect(screen.getByText(/profile/i)).toBeInTheDocument()
})
```

## Submitting Changes

### Before Submitting a Pull Request
1. ✅ Ensure all tests pass
2. ✅ Run linting: `npm run lint`
3. ✅ Update documentation if needed
4. ✅ Test your changes locally
5. ✅ Write clear commit messages

### Pull Request Guidelines
- Provide a clear title and description
- Reference any related issues: `Fixes #123`
- Include screenshots for UI changes
- Request review from maintainers
- Respond to feedback promptly

### PR Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console errors
```

## Getting Help

- 📖 Check the [documentation](./docs/)
- 💬 Open a [GitHub Discussion](https://github.com/Miracle-003/skillswapneu-graduation-project/discussions)
- 🐛 Report bugs via [GitHub Issues](https://github.com/Miracle-003/skillswapneu-graduation-project/issues)
- 📧 Contact the team at [email]

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the project

## Using GitHub Copilot

This project is enhanced with GitHub Copilot. Here are some tips:

### Copilot Tips for This Project
1. **Code Generation**: Use comments to describe what you want
   ```typescript
   // Create a function to validate email format and check if it's from a university domain
   ```

2. **Test Generation**: Copilot can help write tests
   ```typescript
   // Write a test that checks if the user profile is updated correctly
   ```

3. **Documentation**: Generate JSDoc comments
   ```typescript
   // Add JSDoc comment for this function
   export function processMatchingAlgorithm(user1, user2) {
   ```

4. **Refactoring**: Ask Copilot to refactor code
   ```typescript
   // Refactor this function to use async/await instead of promises
   ```

Thank you for contributing to SkillSwap! 🎓✨
