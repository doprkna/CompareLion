# PareL Monitoring & Self-Healing Guide (v0.11.3)

## Overview

Comprehensive monitoring, error tracking, and automated recovery systems for production stability.

---

## Error Tracking

### Sentry Integration

**Configuration:**

```bash
# Environment variables
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**Usage:**

```typescript
import { captureError, captureMessage, ErrorSeverity } from "@/lib/monitoring/error-tracker";

// Capture error
try {
  await riskyOperation();
} catch (error) {
  captureError(error as Error, {
    userId: "123",
    endpoint: "/api/user",
    action: "update_profile",
  });
  throw error;
}

// Capture message
captureMessage("User exported data", {
  userId: "123",
}, ErrorSeverity.INFO);
```

**Features:**
- Automatic error capturing
- User context tracking
- Breadcrumb trails
- Performance monitoring
- Correlation ID tagging

---

## Correlation IDs

### Request Tracking

**Header:** `x-correlation-id`

**Automatic Generation:**

All API requests receive a unique correlation ID for distributed tracing.

**Usage:**

```typescript
import { createLogger } from "@/lib/monitoring/correlation-id";

const logger = createLogger("UserService");

logger.info("Processing user update");
logger.error("Update failed", error);

// Output: [UserService] [abc12345] Processing user update
```

**Benefits:**
- Track requests across services
- Link errors to specific requests
- Debug complex flows
- Aggregate related logs

---

## Health Checks

### Three Health Endpoints

#### 1. Application Health

**Endpoint:** `GET /api/health/app`

**Checks:**
- Uptime
- Memory usage
- Node.js version
- Process stats

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T16:00:00.000Z",
  "uptime": {
    "ms": 3600000,
    "seconds": 3600,
    "minutes": 60,
    "hours": 1
  },
  "memory": {
    "process": {
      "rss": "150.23 MB",
      "heapUsed": "45.67 MB"
    },
    "system": {
      "total": "16.00 GB",
      "free": "8.50 GB",
      "usagePercent": "46.88"
    }
  }
}
```

**Status Codes:**
- `200` - Healthy
- `503` - Unhealthy (memory > 90%)

#### 2. Database Health

**Endpoint:** `GET /api/health/db`

**Checks:**
- Database connectivity
- Query response time
- Connection pool status

**Response:**

```json
{
  "status": "healthy",
  "query": {
    "responseTime": "25ms",
    "threshold": "1000ms",
    "healthy": true
  },
  "pool": {
    "total": 10,
    "active": 3,
    "idle": 7
  }
}
```

**Status:**
- `healthy` - Query < 1000ms, Pool < 90%
- `degraded` - Query > 1000ms OR Pool > 90%
- `unhealthy` - Cannot connect

#### 3. Queue Health

**Endpoint:** `GET /api/health/queue`

**Checks:**
- Job queue lag
- Failure rates
- High-priority queue status

**Response:**

```json
{
  "status": "healthy",
  "queues": [
    {
      "name": "high-priority",
      "waiting": 12,
      "active": 3,
      "completed": 1543,
      "failed": 2
    }
  ],
  "summary": {
    "totalJobs": 2168,
    "failureRate": "0.18%"
  },
  "thresholds": {
    "highPriorityLag": {
      "warning": 50,
      "critical": 100,
      "current": 12
    }
  }
}
```

**Status:**
- `healthy` - Lag < 50, Failure < 5%
- `degraded` - Lag < 100, Failure < 10%
- `unhealthy` - Lag ≥ 100 OR Failure ≥ 10%

---

## Self-Healing Routines

### Automated Recovery

**File:** `lib/monitoring/self-healing.ts`

**Four Healing Functions:**

#### 1. Heal Stale Sessions

Removes expired NextAuth sessions.

```typescript
import { healStaleSessions } from "@/lib/monitoring/self-healing";

const deleted = await healStaleSessions();
// Returns: number of sessions cleaned
```

#### 2. Heal Stuck Jobs

Resets BullMQ jobs stuck in "active" state > 5 minutes.

```typescript
import { healStuckJobs } from "@/lib/monitoring/self-healing";

const healed = await healStuckJobs();
// Returns: number of jobs reset
```

#### 3. Clean Orphaned Records

Removes database records referencing deleted entities.

```typescript
import { cleanOrphanedRecords } from "@/lib/monitoring/self-healing";

const cleaned = await cleanOrphanedRecords();
// Returns: number of records deleted
```

#### 4. Run All Routines

Execute all healing functions.

```typescript
import { runAllHealingRoutines } from "@/lib/monitoring/self-healing";

const results = await runAllHealingRoutines();
/*
{
  staleSessions: 15,
  stuckJobs: 2,
  orphanedRecords: 8,
  duration: 245
}
*/
```

### Scheduling

**Automatic Execution:**

Healing routines run every **6 hours** automatically.

**Manual Trigger:**

```bash
# Admin endpoint
POST /api/admin/heal
```

**Cron Job:**

```bash
# Alternative: External cron
0 */6 * * * curl -X POST https://your-app.com/api/admin/heal
```

---

## Alerting System

### Slack Integration

**Setup:**

```bash
# Create Slack webhook
# https://api.slack.com/messaging/webhooks

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

**Usage:**

```typescript
import { alertCritical, alertWarning } from "@/lib/monitoring/alerts";

// Critical alert
await alertCritical(
  "Database Connection Lost",
  "PostgreSQL connection failed after 3 retries",
  { retries: 3, lastError: "ECONNREFUSED" }
);

// Warning alert
await alertWarning(
  "High Queue Lag",
  "High-priority queue has 87 waiting jobs",
  { queue: "high-priority", waiting: 87 }
);
```

**Alert Appearance:**

```
🚨 Database Connection Lost
PostgreSQL connection failed after 3 retries

Severity: CRITICAL
Timestamp: 2025-10-13T16:00:00.000Z
Metadata:
{
  "retries": 3,
  "lastError": "ECONNREFUSED"
}
```

### Discord Integration

**Setup:**

```bash
# Create Discord webhook
# Server Settings → Integrations → Webhooks

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
```

**Same API:**

```typescript
import { alertInfo } from "@/lib/monitoring/alerts";

await alertInfo(
  "Daily Backup Complete",
  "Database backup completed successfully",
  { size: "2.3 GB", duration: "45s" }
);
```

**Severity Levels:**

- `INFO` - ℹ️ Green (dev only)
- `WARNING` - ⚠️ Orange
- `CRITICAL` - 🚨 Red

---

## Process Management

### PM2 (Recommended)

**Install:**

```bash
npm install -g pm2
```

**Start:**

```bash
# Use ecosystem config
pm2 start ecosystem.config.js

# Or manually
pm2 start "pnpm start" --name parel-web
```

**Configuration:** `ecosystem.config.js`

```javascript
{
  name: "parel-web",
  instances: 2,              // Cluster mode
  exec_mode: "cluster",
  autorestart: true,         // Auto-restart on crash
  max_memory_restart: "1G",  // Restart if > 1GB
  min_uptime: "10s",         // Minimum uptime before considered stable
  max_restarts: 10,          // Max restart attempts
  restart_delay: 4000,       // Delay between restarts
}
```

**Commands:**

```bash
pm2 start ecosystem.config.js     # Start
pm2 restart parel-web              # Restart
pm2 stop parel-web                 # Stop
pm2 logs parel-web                 # View logs
pm2 monit                          # Monitor
pm2 status                         # Status
```

**Startup Script:**

```bash
# Generate startup script
pm2 startup

# Save current processes
pm2 save
```

### systemd (Alternative)

**Service File:** `parel.service`

**Install:**

```bash
# Copy service file
sudo cp parel.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start
sudo systemctl enable parel

# Start service
sudo systemctl start parel
```

**Commands:**

```bash
sudo systemctl start parel         # Start
sudo systemctl stop parel          # Stop
sudo systemctl restart parel       # Restart
sudo systemctl status parel        # Status
journalctl -u parel -f             # Logs
```

---

## Monitoring Dashboard

### Health Check Aggregator

Create a simple monitoring page:

```typescript
// app/admin/monitor/page.tsx
const [health, setHealth] = useState({
  app: null,
  db: null,
  queue: null,
});

useEffect(() => {
  const check = async () => {
    const [app, db, queue] = await Promise.all([
      fetch("/api/health/app").then(r => r.json()),
      fetch("/api/health/db").then(r => r.json()),
      fetch("/api/health/queue").then(r => r.json()),
    ]);
    
    setHealth({ app, db, queue });
  };
  
  check();
  const interval = setInterval(check, 30000); // Every 30s
  
  return () => clearInterval(interval);
}, []);
```

### External Monitoring

**Options:**

1. **UptimeRobot** - Free, simple uptime monitoring
2. **Pingdom** - Advanced monitoring with alerts
3. **Datadog** - Full-featured APM
4. **New Relic** - Application performance monitoring

**Setup:**

```bash
# Monitor health endpoints
https://your-app.com/api/health/app
https://your-app.com/api/health/db
https://your-app.com/api/health/queue

# Alert on:
- HTTP 503 (unhealthy)
- Response time > 5s
- Downtime > 1 minute
```

---

## Best Practices

### Logging

```typescript
// Use structured logging
logger.info("User login", { userId, email, method: "email" });

// Include correlation IDs automatically
const logger = createLogger("AuthService");
logger.error("Login failed", error, { userId, attempts: 3 });
```

### Error Tracking

```typescript
// Capture errors with context
captureError(error, {
  userId,
  endpoint: req.url,
  action: "create_post",
  metadata: { postId, categoryId },
});

// Set user context
setUserContext(userId, email, username);

// Add breadcrumbs
addBreadcrumb("User clicked submit", "ui", ErrorSeverity.INFO);
```

### Alerts

```typescript
// Alert on critical issues only
if (failureRate > 10) {
  await alertCritical(
    "High Failure Rate",
    `Queue failure rate at ${failureRate}%`,
    { queue: "high-priority", failureRate }
  );
}

// Use warnings for degraded performance
if (queryTime > 1000) {
  await alertWarning(
    "Slow Database Queries",
    `Average query time: ${queryTime}ms`,
    { queryTime, threshold: 1000 }
  );
}
```

### Health Checks

```typescript
// Check health before deployment
const health = await fetch("/api/health/db").then(r => r.json());

if (health.status !== "healthy") {
  console.error("Pre-deployment health check failed!");
  process.exit(1);
}
```

---

## Troubleshooting

### High Memory Usage

**Check:**

```bash
GET /api/health/app
```

**If > 90%:**

```bash
# Restart application
pm2 restart parel-web

# Or increase max memory
# ecosystem.config.js: max_memory_restart: "2G"
```

### Database Connection Issues

**Check:**

```bash
GET /api/health/db
```

**If unhealthy:**

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check connection pool
# In code: await getPoolStats()

# Restart database
sudo systemctl restart postgresql
```

### Queue Lag

**Check:**

```bash
GET /api/health/queue
```

**If lag > 100:**

```bash
# Increase worker concurrency
# lib/queue/queue-config.ts: concurrency: 20

# Or scale workers horizontally
pm2 scale parel-worker +2
```

---

## Monitoring Checklist

### Setup

- [ ] Configure Sentry DSN
- [ ] Setup Slack/Discord webhooks
- [ ] Install PM2 or systemd service
- [ ] Configure auto-restart
- [ ] Setup external uptime monitoring
- [ ] Test health endpoints
- [ ] Verify self-healing runs every 6h

### Production

- [ ] Monitor error rates (< 1%)
- [ ] Check queue lag (< 50 high-priority)
- [ ] Database query time (< 100ms avg)
- [ ] Memory usage (< 80%)
- [ ] CPU usage (< 75%)
- [ ] Uptime (> 99.9%)

### Alerting

- [ ] Alerts reach team (test webhook)
- [ ] Critical errors trigger alerts
- [ ] Degraded health triggers warnings
- [ ] False positives minimized

---

**Last Updated:** v0.11.3 (2025-10-13)










