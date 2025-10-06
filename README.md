# PareL (CompareL, PareLion, Comparelion)

PareL is not a todo app. It’s a social, gamified platform where people answer questions, compare themselves with others, and see fun stats and rankings (local + global). The loop is: answer → compare → reward → progress.

It mixes polling, community data, and game mechanics (XP, gold, avatars, wildcards, challenges). It’s playful, surprising, and slightly addictive — more like Habitica + TikTok polls + RPG flavor, not Jira/Trello.

The core value is giving people perspective on themselves through comparison — from silly (“your snack vs others”) to meaningful (“your child started talking at 3 → top 10% in Prague”).

---

## Feature Progress & Versioning (2025-09)

### Authentication
- Email + password signup and login (with validation, duplicate checks, and bcrypt password hashing)
- JWT-based session management with secure HTTP-only cookies
- Logout endpoint and UI
- Global logged-in state indicator in navigation
- Password reset feature placeholder (UI button)

### Question Bank & Flow
- Versioned questions with categories, subcategories, related questions, and tags
- Full CRUD API for questions and flows (with versioning, branching, and soft delete)
- Normalized answers table for analytics and scaling
- Flow runner backend with branching, skip, and back logic

### UI
- User-facing flow runner: answer questions, skip, go back, see progress bar
- Login/logout with error handling and feedback
- Global auth state in navigation
- Placeholder for password reset
- Language table and language dropdown in top bar (English, Russian, Czech, German)
- Language selection support for future localization/monetization

### User Analytics & Profile
- Tracks user login and activity times (`lastLoginAt`, `lastActiveAt`)
- Tracks and displays time spent (per session and total), answers per session, and session history
- Profile page shows last login, last active, total sessions, total answers, time spent, last session answers, and a session history table
- Funds ($) and Diamonds (in-app currency) tracked and displayed in Profile and Shop pages
- Session history and analytics ready for admin review and future gamification

### Admin & API
- Endpoints for managing questions, flows, and steps
- Protected endpoints with JWT validation

---

> **Note:** For future updates, consider adding a versioning/diary section to track major changes and feature releases.

---

# PareL MVP - Task Routing Platform

A web app that routes small personal/work tasks to either automation or a human VA, with a clean inbox → task → outcome flow.

## Features

- **Task Management**: Create, view, and manage tasks with status tracking
- **Smart Routing**: Automatically route tasks to automation or human VAs based on keywords
- **Workflow Engine**: Configurable workflows with keyword triggers and actions
- **Background Processing**: BullMQ + Redis for async task processing
- **Authentication**: NextAuth with email magic links and Google OAuth
- **Modern UI**: Clean interface built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui
- **Infrastructure**: Docker Compose

## Project Structure

This is a **monorepo** with the following structure:

```
parel-mvp/
├── apps/
│   ├── web/          # Next.js application (main app)
│   └── worker/       # Background worker
├── packages/
│   └── db/           # Shared database package
└── scripts/          # Build and setup scripts
```

**Important:**
- **Working Directory**: All development commands should be run from the **project root** (`parel-mvp/`)
- **Environment File**: Use `/apps/web/.env` for Next.js app configuration
- **Package Manager**: This project uses **pnpm** for workspace management

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm (install with `npm install -g pnpm`)

### 1. Clone and Install

```bash
git clone <repository-url>
cd parel-mvp
pnpm install
```

### 2. Environment Setup

```bash
# Copy the environment template to the Next.js app directory
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` with your configuration. See `apps/web/.env.example` for a complete template.

#### **Required Environment Variables**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://user:pass@localhost:5432/parel` |
| `REDIS_URL` | Redis connection string | ✅ | `redis://localhost:6379` |
| `NEXTAUTH_URL` | Base URL for authentication | ✅ | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | ✅ | `your-secret-key-here` |
| `JWT_SECRET` | Secret for JWT tokens | ✅ | `your-jwt-secret-key-here` |

#### **Optional Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Email service API key | - |
| `APP_MAIL_FROM` | From email address | `noreply@example.com` |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | - |
| `SENTRY_DSN` | Sentry error tracking | - |
| `NEXT_PUBLIC_SENTRY_DSN` | Public Sentry DSN | - |
| `HCAPTCHA_SECRET` | hCaptcha secret key | - |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key | - |
| `ADMIN_EMAILS` | Comma-separated admin emails | - |

### 3. Start Infrastructure

```bash
docker-compose up -d
```

### 4. Database Setup

```bash
# Push database schema
npm run db:push

# Seed with demo data
npm run db:seed
```

### 5. Start Development

```bash
# Start both web app and worker (from project root)
pnpm run dev

# Or start individual services:
pnpm run dev:web      # Next.js app only (http://localhost:3000)
pnpm run dev:worker   # Worker only
```

## Development Commands

All commands should be run from the **project root** (`parel-mvp/`):

```bash
# Development
pnpm run dev              # Start all services
pnpm run dev:web          # Next.js app only
pnpm run dev:worker       # Worker only

# Database
pnpm run db:push          # Push schema changes
pnpm run db:seed          # Seed with demo data
pnpm run db:studio        # Open Prisma Studio

# Testing
pnpm run test             # Run tests
pnpm run test:e2e         # Run E2E tests
pnpm run typecheck        # TypeScript check

# Building
pnpm run build            # Build for production
pnpm run generate:prisma  # Generate Prisma client
```

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables from the table above
   - Use production values (e.g., production database URL, real API keys)

3. **Required Vercel Environment Variables:**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db
   REDIS_URL=redis://host:6379
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   JWT_SECRET=your-production-jwt-secret
   ```

4. **Deploy:**
   ```bash
   # Vercel will automatically deploy on git push
   git push origin main
   ```

### Environment File Priority

Next.js loads environment variables in this order:
1. `process.env` (system environment)
2. `.env.local` (highest priority, gitignored)
3. `.env.development` / `.env.production` (environment-specific)
4. `.env` (lowest priority)

**For production:** Use Vercel environment variables instead of `.env` files.

## Project Structure

```
parel-mvp/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── app/            # App Router pages and API routes
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities and configurations
│   └── worker/            # BullMQ background worker
├── packages/
│   └── db/                # Prisma database package
├── docker-compose.yml     # Infrastructure services
└── package.json          # Root package.json with workspaces
```

## Architectural Overview

- **Service Layer & DTOs**: All business logic and Prisma queries live under `apps/web/lib/services/*Service.ts`. API routes call these services and then map results to pure DTOs in `apps/web/lib/dto/*.ts` before returning JSON.
- **Validation**: Zod schemas are centralized under `apps/web/lib/validation/*.ts`. API routes import and apply these schemas for input validation.
- **Background Processing**: Implemented with BullMQ + Redis. Queue connection and job definitions reside in `apps/web/lib/queue/*`. Workers are in `apps/web/worker`, consuming jobs and interacting with services.
- **Testing**: End-to-end smoke tests using Jest + Supertest live in `/tests`. Helper `tests/utils/testServer.ts` mounts route handlers for testing.

## Updated Project Structure

```text
apps/web/
├── app/
│   ├── api/                # Thin API routes: validate → service → DTO → response
│   └── ...
├── lib/
│   ├── services/           # One service per domain (questionService, jobService, etc.)
│   ├── dto/                # Pure DTO mappers and type aliases
│   ├── validation/         # Zod schemas for input validation
│   └── queue/              # BullMQ connection and queue definitions
├── worker/                 # Queue workers consuming services
└── tests/                  # Jest + Supertest smoke tests
```

## Running Tests

```bash
# From repo root
pnpm -w run test
```

## API Endpoints

### Tasks
- `