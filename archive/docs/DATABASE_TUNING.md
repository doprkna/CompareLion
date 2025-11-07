# PareL Database & Background Jobs Tuning Guide (v0.11.2)

## Overview

This guide documents database optimizations and background job configurations for production stability and performance.

---

## Database Optimizations

### Performance Indexes

**Migration:** `20251013160000_add_performance_indexes`

**30+ Composite Indexes Added:**

```sql
-- User indexes
users_email_idx                   -- Unique email lookup
users_createdAt_idx              -- Sort by registration date
users_xp_level_idx               -- Leaderboard queries
users_lastActiveAt_idx           -- Active users (partial index)

-- Activity/EventLog (userId, createdAt composite)
activities_userId_createdAt_idx
event_logs_userId_createdAt_idx
event_logs_type_createdAt_idx

-- Notifications
notifications_userId_createdAt_idx
notifications_userId_isRead_idx
notifications_unread_idx          -- Partial index for unread only

-- Messages
messages_senderId_createdAt_idx
messages_receiverId_createdAt_idx
messages_isRead_idx               -- Partial index for unread

-- Challenges
challenges_initiatorId_createdAt_idx
challenges_receiverId_createdAt_idx
challenges_status_createdAt_idx

-- Feed
global_feed_items_userId_createdAt_idx
global_feed_items_type_createdAt_idx
global_feed_items_reactionsCount_idx  -- Trending feed

-- And 15+ more...
```

### Partial Indexes

**Optimized for Common Filters:**

```sql
-- Active users (last 7 days)
CREATE INDEX users_active_idx ON users(lastActiveAt DESC) 
WHERE lastActiveAt > NOW() - INTERVAL '7 days';

-- Unread notifications
CREATE INDEX notifications_unread_idx ON notifications(userId, createdAt DESC) 
WHERE isRead = false;

-- Unread messages
CREATE INDEX messages_isRead_idx ON messages(isRead) 
WHERE isRead = false;
```

### Query Optimization Tips

**Use Composite Indexes:**

```typescript
// ✅ Good: Uses composite index
const activities = await prisma.activity.findMany({
  where: { userId: "123" },
  orderBy: { createdAt: "desc" },
});

// ❌ Bad: Separate filtering
const activities = await prisma.activity.findMany({
  where: { userId: "123" },
});
const sorted = activities.sort((a, b) => b.createdAt - a.createdAt);
```

**Select Only Needed Fields:**

```typescript
// ✅ Good: Minimal data transfer
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, name: true, xp: true },
});

// ❌ Bad: All fields
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

---

## Connection Pooling

**File:** `lib/db/connection-pool.ts`

### Configuration

**Connection Pool Parameters:**

```
connection_limit: 10 (production) / 5 (development)
pool_timeout: 10s
pgbouncer: true (if using pgBouncer)
```

**Database URL Format:**

```
postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=10&pgbouncer=true
```

### pgBouncer Setup (Optional)

**Install pgBouncer:**

```bash
# Ubuntu/Debian
sudo apt-get install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
parel = host=localhost port=5432 dbname=parel

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

**Update DATABASE_URL:**

```
DATABASE_URL="postgresql://user:password@localhost:6432/parel?pgbouncer=true"
```

### Pool Statistics

**Get Connection Pool Stats:**

```typescript
import { getPoolStats } from "@/lib/db/connection-pool";

const stats = await getPoolStats();
// { total: 10, active: 3, idle: 7 }
```

### Data Archival

**Archive Old Logs:**

```typescript
import { archiveOldLogs } from "@/lib/db/connection-pool";

// Delete entries older than 30 days
const deleted = await archiveOldLogs(30);
console.log(`Archived ${deleted} entries`);
```

**Scheduled Archival (Cron):**

```bash
# Daily at 2 AM
0 2 * * * node -e "require('./lib/db/connection-pool').archiveOldLogs(30)"
```

---

## Background Job Queues

**File:** `lib/queue/queue-config.ts`

### Queue Priorities

**3-Tier Priority System:**

```
HIGH:   XP updates, messages, notifications
        - Concurrency: 10
        - Rate limit: 100 jobs/sec
        
MEDIUM: AI generation, challenges, achievements
        - Concurrency: 5
        - Rate limit: 50 jobs/sec
        
LOW:    Analytics, reports, cleanup
        - Concurrency: 2
        - Rate limit: 20 jobs/sec
```

### Queue Configuration

**High Priority:**

```typescript
{
  concurrency: 10,
  limiter: { max: 100, duration: 1000 },
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 86400 }
}
```

**Medium Priority:**

```typescript
{
  concurrency: 5,
  limiter: { max: 50, duration: 1000 },
  attempts: 5,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { age: 7200, count: 500 },
  removeOnFail: { age: 86400 }
}
```

**Low Priority:**

```typescript
{
  concurrency: 2,
  limiter: { max: 20, duration: 1000 },
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: { age: 3600, count: 100 },
  removeOnFail: { age: 86400 }
}
```

### Adding Jobs

**Automatic Priority Assignment:**

```typescript
import { addJob, JOB_TYPES } from "@/lib/queue/queue-config";

// High priority (XP update)
await addJob(JOB_TYPES.XP_UPDATE, {
  userId: "123",
  amount: 50,
});

// Medium priority (AI generation)
await addJob(JOB_TYPES.AI_GENERATE, {
  prompt: "Generate questions...",
});

// Low priority (analytics)
await addJob(JOB_TYPES.ANALYTICS_UPDATE, {
  type: "daily",
});
```

### Job Types

**Predefined Job Types:**

```typescript
// High Priority
XP_UPDATE: "xp:update"
MESSAGE_SEND: "message:send"
NOTIFICATION_SEND: "notification:send"

// Medium Priority
AI_GENERATE: "ai:generate"
CHALLENGE_PROCESS: "challenge:process"
ACHIEVEMENT_CHECK: "achievement:check"

// Low Priority
ANALYTICS_UPDATE: "analytics:update"
REPORT_GENERATE: "report:generate"
CLEANUP_OLD_DATA: "cleanup:old-data"
```

---

## Worker Concurrency Control

### CPU-Based Throttling

**Automatic Concurrency Adjustment:**

```typescript
import { calculateOptimalConcurrency } from "@/lib/queue/queue-config";

// Get optimal concurrency based on CPU usage
const maxConcurrency = 10;
const targetCpuUsage = 0.75; // 75% target

const concurrency = calculateOptimalConcurrency(
  maxConcurrency,
  targetCpuUsage
);

// Concurrency adjusts dynamically:
// CPU < 75%: concurrency = 10
// CPU > 75%: concurrency = 5 (50% reduction)
```

### System Monitoring

**CPU Usage:**

```typescript
import { getCpuUsage } from "@/lib/queue/queue-config";

const cpu = getCpuUsage();
/*
{
  cpuCount: 8,
  loadAverage1min: 2.5,
  loadAverage5min: 2.1,
  loadAverage15min: 1.8,
  usagePercent1min: 31.25,
  usagePercent5min: 26.25,
  usagePercent15min: 22.5
}
*/
```

**Memory Usage:**

```typescript
import { getMemoryUsage } from "@/lib/queue/queue-config";

const memory = getMemoryUsage();
/*
{
  total: 17179869184,
  free: 8589934592,
  used: 8589934592,
  usagePercent: 50,
  totalGB: "16.00",
  usedGB: "8.00"
}
*/
```

---

## Queue Monitoring

### Admin Dashboard

**Endpoint:** `GET /api/admin/queue-stats`

**Response:**

```json
{
  "timestamp": "2025-10-13T16:00:00.000Z",
  "health": {
    "overall": "healthy",
    "components": {
      "cpu": "healthy",
      "memory": "healthy",
      "dbPool": "healthy"
    }
  },
  "queues": [
    {
      "name": "high-priority",
      "waiting": 12,
      "active": 3,
      "completed": 1543,
      "failed": 2,
      "delayed": 0,
      "total": 1560
    },
    {
      "name": "medium-priority",
      "waiting": 5,
      "active": 2,
      "completed": 432,
      "failed": 1,
      "delayed": 1,
      "total": 441
    },
    {
      "name": "low-priority",
      "waiting": 8,
      "active": 1,
      "completed": 156,
      "failed": 0,
      "delayed": 2,
      "total": 167
    }
  ],
  "system": {
    "cpu": {
      "cpuCount": 8,
      "loadAverage1min": 2.5,
      "usagePercent1min": 31.25
    },
    "memory": {
      "total": 17179869184,
      "used": 8589934592,
      "usagePercent": 50,
      "usedGB": "8.00"
    },
    "database": {
      "pool": {
        "total": 10,
        "active": 3,
        "idle": 7
      }
    }
  },
  "summary": {
    "totalJobs": 2168,
    "activeJobs": 6,
    "waitingJobs": 25,
    "failedJobs": 3
  }
}
```

### Health Status

**Status Levels:**

```
healthy:  CPU < 75%, Memory < 80%
warning:  CPU < 90%, Memory < 90%
critical: CPU >= 90%, Memory >= 90%
```

---

## Best Practices

### Database

1. **Use Composite Indexes**
   - Always index (userId, createdAt) for user-specific queries
   - Use partial indexes for common filters (unread, active, etc.)

2. **Optimize Queries**
   - Select only needed fields
   - Use pagination
   - Avoid N+1 queries

3. **Connection Pooling**
   - Use connection limits
   - Monitor pool usage
   - Close connections properly

4. **Data Archival**
   - Archive logs older than 30 days
   - Run cleanup jobs during off-peak hours
   - Monitor database size

### Background Jobs

1. **Priority Assignment**
   - High: User-facing, time-sensitive
   - Medium: AI/async processing
   - Low: Analytics, cleanup

2. **Concurrency Control**
   - Monitor CPU usage
   - Adjust concurrency dynamically
   - Set appropriate rate limits

3. **Error Handling**
   - Use exponential backoff
   - Set retry limits
   - Log failed jobs

4. **Job Cleanup**
   - Remove completed jobs after 1-2 hours
   - Keep failed jobs for 24 hours
   - Monitor queue sizes

---

## Performance Targets

### Before v0.11.2:
- Query time: ~300ms
- DB connections: Uncontrolled
- Job processing: No prioritization
- Worker load: Spikes to 100% CPU

### After v0.11.2:
- ✅ Query time: < 100ms (indexed queries)
- ✅ DB connections: Pooled (max 10)
- ✅ Job processing: 3-tier priority
- ✅ Worker load: < 75% CPU (controlled)

---

## Troubleshooting

### High CPU Usage

```typescript
// Check CPU usage
const cpu = getCpuUsage();
if (cpu.usagePercent1min > 75) {
  // Reduce concurrency
  const newConcurrency = calculateOptimalConcurrency(10, 0.75);
  // Apply to workers
}
```

### Connection Pool Exhaustion

```typescript
// Check pool stats
const pool = await getPoolStats();
if (pool.active / pool.total > 0.9) {
  // Warning: Pool nearly exhausted
  // Consider increasing connection limit
}
```

### Queue Backlog

```typescript
// Check queue stats
const stats = await getAllQueueStats();
const highPriority = stats.find((q) => q.name === "high-priority");

if (highPriority.waiting > 100) {
  // Warning: High priority queue backlog
  // Consider increasing concurrency
}
```

---

## Scheduled Jobs

**Recommended Cron Jobs:**

```bash
# Archive old logs (daily at 2 AM)
0 2 * * * node -e "require('./lib/db/connection-pool').archiveOldLogs(30)"

# Cleanup completed jobs (hourly)
0 * * * * node -e "require('./lib/queue/cleanup-jobs').run()"

# Health check (every 5 minutes)
*/5 * * * * curl http://localhost:3000/api/admin/queue-stats
```

---

**Last Updated:** v0.11.2 (2025-10-13)













