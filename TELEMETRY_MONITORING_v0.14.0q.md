# 📊 TELEMETRY & MONITORING SYSTEM
**Version:** 0.14.0q  
**Status:** Production Ready  
**Last Updated:** 2025-10-22

---

## 🎯 Overview

Comprehensive telemetry and monitoring infrastructure for PAREL v0.14.0, enabling real-time error tracking, performance monitoring, and rapid-response hotfixes during public beta.

### Key Features

✅ **Event Telemetry** - Track user behavior and engagement  
✅ **Error Tracking** - Sentry integration + custom error logs  
✅ **Health Monitoring** - Automated health checks every 5 minutes  
✅ **Admin Dashboards** - Real-time metrics and error triage  
✅ **Hotfix Pipeline** - Auto-versioning deployment scripts  
✅ **User Feedback** - Bug reporting with auto-error creation  

---

## 📐 Architecture

### Data Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ├─► Telemetry Events ──► /api/telemetry/batch ──► TelemetryEvent Table
       │
       ├─► Error Reports ────► /api/errors ──────────► ErrorLog Table
       │                                                      │
       ├─► Bug Reports ──────► /api/feedback ─────────┬─────┘
       │                                               │
       └─► Page Errors ──────► Sentry ────────────────┴─► Admin Dashboard
                                  │
                                  └─► Alerts (Production)
```

### Database Schema

#### TelemetryEvent
```prisma
model TelemetryEvent {
  id          String   @id @default(cuid())
  type        String
  page        String?
  action      String?
  duration    Int?
  metadata    Json?
  userAgent   String?
  platform    String?
  sessionId   String?
  userId      String?
  anonymousId String?
  deviceType  String?
  region      String?
  createdAt   DateTime @default(now())
}
```

#### ErrorLog
```prisma
model ErrorLog {
  id          String   @id @default(cuid())
  errorType   String
  message     String
  stack       String?  @db.Text
  page        String?
  userAgent   String?
  userId      String?
  sessionId   String?
  buildId     String?
  environment String?
  severity    String   @default("error")
  frequency   Int      @default(1)
  firstSeen   DateTime @default(now())
  lastSeen    DateTime @default(now())
  status      String   @default("new")
  resolved    Boolean  @default(false)
  metadata    Json?
}
```

---

## 🔌 API Endpoints

### Telemetry

#### POST /api/telemetry/batch
Record batch telemetry events (max 100 per request).

**Request:**
```json
{
  "events": [
    {
      "type": "page_view",
      "page": "/flow",
      "sessionId": "abc123",
      "userId": "user_456",
      "deviceType": "desktop",
      "metadata": {
        "referrer": "/home"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "recorded": 1,
  "failed": 0,
  "total": 1
}
```

#### GET /api/telemetry
Retrieve aggregated telemetry metrics.

**Query Params:**
- `days` - Number of days to query (default: 7)
- `type` - Filter by event type

---

### Error Tracking

#### POST /api/errors
Report an application error.

**Request:**
```json
{
  "errorType": "TypeError",
  "message": "Cannot read property 'id' of undefined",
  "stack": "Error: ...",
  "page": "/profile",
  "severity": "error",
  "userId": "user_123",
  "sessionId": "session_abc",
  "metadata": {
    "componentStack": "at ProfilePage..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "errorId": "clx123abc",
  "duplicate": false
}
```

#### GET /api/errors
Retrieve error logs (admin only).

**Query Params:**
- `limit` - Max results (default: 50, max: 200)
- `severity` - Filter by severity (critical, error, warning, info)
- `resolved` - Filter by resolution status (true, false)
- `sortBy` - Sort order (frequency, lastSeen, createdAt)

---

### Health Monitoring

#### GET /api/health/extended
Comprehensive health check with detailed metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:30:00Z",
  "version": "0.14.0",
  "commit": "abc123",
  "uptime": {
    "hours": 24,
    "minutes": 1440,
    "formatted": "24h 0m 0s"
  },
  "database": {
    "status": "healthy",
    "latencyMs": 12
  },
  "sessions": {
    "active": 45,
    "windowMinutes": 5
  },
  "errorRate": {
    "errors": 3,
    "totalEvents": 1200,
    "rate": 0.25,
    "windowHours": 1
  },
  "memory": {
    "heapUsedMB": 120,
    "heapTotalMB": 256,
    "rssMB": 180
  }
}
```

---

## 📊 Metrics Taxonomy

### Event Types

| Type | Description | Usage |
|------|-------------|-------|
| `page_view` | User views a page | Navigation tracking |
| `action` | User performs action | Button clicks, form submissions |
| `error` | Client-side error | React errors, API failures |
| `api_call` | Backend API request | Performance monitoring |
| `session_start` | User session begins | Engagement tracking |
| `session_end` | User session ends | Session duration |
| `user_login` | User authentication | Login analytics |
| `feedback_submitted` | User submits feedback | Feedback tracking |
| `referral_completed` | User completes referral | Growth metrics |

### Error Severity Levels

- **critical** - System failure, requires immediate attention
- **error** - Feature broken, needs urgent fix
- **warning** - Degraded functionality, non-blocking
- **info** - Informational, no action needed

---

## 🛠️ Admin Tools

### Error Triage Dashboard
**URL:** `/admin/errors`

**Features:**
- View all errors sorted by frequency, severity, or recency
- Filter by severity, resolution status
- See error frequency and time ranges
- Quick resolution marking

### Metrics Dashboard
**URL:** `/admin/metrics`

**Features:**
- Real-time event tracking
- User activity charts (bar & pie)
- Auto-refresh every 30 seconds
- Recent events feed

### Health Dashboard
**URL:** `/admin/health`

**Features:**
- Database connectivity status
- Redis connection check
- Sentry integration status
- Server uptime

---

## 🔔 Alerting

### Sentry Integration

**Production Only:**
- Errors automatically sent to Sentry
- Session replay for error debugging
- Custom tags: buildId, environment
- Sample rate: 10% for performance, 100% for errors

**Configuration:**
Set `NEXT_PUBLIC_SENTRY_DSN` environment variable.

### Cron Health Checks

**Vercel Cron:**
- Runs every 5 minutes
- Hits `/api/health/extended`
- Auto-logs health metrics

**GitHub Actions:**
- Backup health monitoring
- Checks critical errors
- Runs every 5 minutes

---

## 🐛 Bug Reporting

### Floating Report Button

Users can report bugs from any page via the floating bug button.

**Component:** `<ReportBugButton />`

**Features:**
- Always visible (bottom-right corner)
- Hidden for admin users
- Auto-captures page URL and user agent
- Optional screenshot support
- Creates error log entry automatically

**Usage:**
```tsx
import { ReportBugButton } from '@/components/report-bug-button';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ReportBugButton hideForAdmin />
    </>
  );
}
```

---

## 🚀 Hotfix Pipeline

### Quick Deployment

**Script:** `scripts/hotfix-deploy.ts`

**Usage:**
```bash
tsx scripts/hotfix-deploy.ts "Fix critical auth bug"
```

**Process:**
1. ✅ Check git status
2. ✅ Auto-bump version (0.14.0 → 0.14.0q1)
3. ✅ Update CHANGELOG.md
4. ✅ Run linter
5. ✅ Run build
6. ✅ Run tests
7. ✅ Git commit
8. ⚠️  Ready to push

### Rollback

**Script:** `scripts/rollback-last.ts`

**Usage:**
```bash
tsx scripts/rollback-last.ts
```

**Process:**
1. Shows last commit
2. Asks for confirmation
3. Stashes uncommitted changes
4. Reverts last commit
5. Optional force push to remote

---

## 📈 Performance Monitoring

### Database Latency

Monitored via `/api/health/extended`:
- Target: < 50ms
- Warning: 50-100ms
- Critical: > 100ms

### API Response Times

Tracked via telemetry events:
- `duration` field records API call time
- Aggregated in TelemetryAggregate table
- p50, p95, p99 percentiles calculated

### Error Rate

Calculated hourly:
- Target: < 1% of total events
- Warning: 1-5%
- Critical: > 5%

---

## 🔒 Privacy & Security

### Data Anonymization

- User IDs hashed for Sentry
- URLs sanitized (IDs replaced with `[id]`)
- Sensitive metadata fields filtered
- No PII stored in telemetry

### Data Retention

- **Telemetry Events:** 30 days
- **Error Logs:** 90 days
- **Aggregated Metrics:** Indefinite

### Access Control

- Admin endpoints require authentication
- Cron endpoints require `CRON_SECRET`
- Sentry only in production

---

## 🧪 Testing

### Health Check
```bash
curl https://parel.app/api/health/extended | jq
```

### Telemetry Batch
```bash
curl -X POST https://parel.app/api/telemetry/batch \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"page_view","page":"/test"}]}'
```

### Error Report
```bash
curl -X POST https://parel.app/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "errorType": "TestError",
    "message": "Test error message",
    "severity": "info"
  }'
```

---

## 📝 Environment Variables

Required for full functionality:

```bash
# Sentry (Production Only)
NEXT_PUBLIC_SENTRY_DSN=https://...

# Analytics
ENABLE_ANALYTICS=1

# Cron Jobs
CRON_SECRET=your-secret-key

# Optional: Telemetry in Development
TELEMETRY_ENABLED=true
```

---

## 🔄 Migration Guide

### Database Changes

```bash
# Generate migration for new tables
pnpm prisma migrate dev --name add_error_log_telemetry_fields

# Apply to production
pnpm prisma migrate deploy
```

### Breaking Changes

- TelemetryEvent now includes `userId`, `anonymousId`, `deviceType`, `region`
- ErrorLog table added
- FeedbackSubmission includes `screenshot` field

---

## 📞 Support

**Critical Issues:**
- Check `/admin/errors` for error frequency
- Review Sentry dashboard for stack traces
- Use hotfix pipeline for rapid deployment

**Questions:**
See `HOTFIX_GUIDE.md` for deployment procedures.

---

🦁 **Built with safety and speed in mind.**

