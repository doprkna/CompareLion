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

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd parel-mvp
npm install
```

### 2. Environment Setup

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://parel:parel@localhost:5432/parel"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (for magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@parel.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

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
# Start both web app and worker
npm run dev

# Or start individually:
npm run dev:web    # Next.js app on http://localhost:3000
npm run dev:worker # BullMQ worker
```

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