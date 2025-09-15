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

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks with filters
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `POST /api/tasks/[id]/messages` - Add message to task
- `POST /api/tasks/[id]/route` - Route task (AUTO/VA)

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow

## Workflow System

Tasks are automatically routed based on keyword matching:

1. **Keyword Trigger**: Tasks with matching keywords in title/description
2. **Actions**: GOOGLE_SEARCH, WEB_SCRAPE, DOC_SUMMARY, CUSTOM
3. **Processing**: Background worker executes actions and updates task status

### Example Workflow

```json
{
  "name": "Price Research Workflow",
  "trigger": "KEYWORD",
  "action": "GOOGLE_SEARCH",
  "keywords": ["price", "cost", "pricing"],
  "isActive": true
}
```

## Testing the Flow

1. **Create a task** with "price" in the title
2. **Set assignee type** to "AUTO"
3. **Watch** as the task gets automatically processed
4. **Check** the task status and messages for results

### Sample cURL

```bash
# Create a task that will auto-route
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Find price for iPhone 15",
    "description": "Need to research the latest iPhone 15 pricing",
    "assigneeType": "AUTO"
  }'
```

## Development

### Database Commands

```bash
npm run db:push     # Push schema changes
npm run db:migrate  # Create migration
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
```

### Linting and Testing

```bash
npm run lint        # Lint all packages
npm run test        # Run tests
```

## Production Deployment

1. Set up production database and Redis
2. Configure environment variables
3. Build the application: `npm run build`
4. Start services: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details





