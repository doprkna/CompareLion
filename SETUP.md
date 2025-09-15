# PareL MVP Setup Guide

## Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Infrastructure
```bash
docker-compose up -d
```

### 3. Setup Database
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

## Detailed Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Step-by-Step Setup

1. **Clone and Navigate**
   ```bash
   cd parel-mvp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your settings:
   ```env
   DATABASE_URL="postgresql://parel:parel@localhost:5432/parel"
   REDIS_URL="redis://localhost:6379"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Start Services**
   ```bash
   docker-compose up -d
   ```

5. **Database Setup**
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Start Development**
   ```bash
   npm run dev
   ```

## Access Points

- **Web App**: http://localhost:3000
- **Database Studio**: `npm run db:studio`
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Demo Data

The seed script creates:
- Demo user: `demo@parel.com`
- Sample tasks with different statuses
- Price research workflow with keyword triggers

## Testing the Auto-Routing

1. Create a task with "price" in the title
2. Set assignee type to "AUTO"
3. Watch it get automatically processed
4. Check task status and messages

## Sample cURL Commands

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Find price for iPhone 15",
    "description": "Need to research the latest iPhone 15 pricing",
    "assigneeType": "AUTO"
  }'
```

### List Tasks
```bash
curl http://localhost:3000/api/tasks
```

## Troubleshooting

### Services Not Starting
```bash
docker-compose logs
```

### Database Connection Issues
```bash
docker-compose exec postgres psql -U parel -d parel
```

### Redis Connection Issues
```bash
docker-compose exec redis redis-cli ping
```

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

## Development Commands

```bash
npm run dev          # Start both web and worker
npm run dev:web      # Start only web app
npm run dev:worker   # Start only worker
npm run build        # Build for production
npm run lint         # Lint all packages
npm run test         # Run tests
```

## Production Deployment

1. Set up production database and Redis
2. Configure environment variables
3. Build: `npm run build`
4. Start: `npm start`

## Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma
- **Queue**: BullMQ with Redis
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui





