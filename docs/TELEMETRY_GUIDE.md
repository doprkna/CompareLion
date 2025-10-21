# PareL Telemetry & Analytics Guide (v0.11.7)

## Overview

Privacy-safe telemetry system for anonymized usage analytics and performance monitoring.

---

## Privacy First

### What We Track

**✅ Safe to Track:**
- Page views (anonymized URLs)
- Feature usage (action counts)
- Session metrics (duration, count)
- Performance data (API latency, errors)
- Device type (web/mobile)

**❌ Never Tracked:**
- User emails
- User names
- User IDs
- IP addresses
- Personal data
- Authentication tokens
- Passwords
- Session contents

### Anonymization

**URL Anonymization:**
```
Before: /profile/abc-123-def-456?tab=settings&userId=789
After:  /profile/[id]
```

**Metadata Sanitization:**
```typescript
// Automatically removed:
- email
- password
- token
- secret
- key
```

**Session IDs:**
- Random UUID per session
- No link to user identity
- Rotates on each session

---

## Event Types

### 1. Page View

Tracks page navigation.

```typescript
import { trackPageView } from "@/lib/telemetry/telemetry-tracker";

trackPageView("/dashboard", sessionId);
```

### 2. Action

Tracks user interactions.

```typescript
import { trackAction } from "@/lib/telemetry/telemetry-tracker";

trackAction("button_click", "/dashboard", undefined, {
  button: "submit_form",
});
```

### 3. Error

Tracks application errors.

```typescript
import { trackError } from "@/lib/telemetry/telemetry-tracker";

trackError("api_error", "/api/user", {
  statusCode: 500,
  endpoint: "/api/user",
});
```

### 4. API Call

Tracks API performance.

```typescript
import { trackApiCall } from "@/lib/telemetry/telemetry-tracker";

const start = Date.now();
const response = await fetch("/api/user");
const duration = Date.now() - start;

trackApiCall("/api/user", duration, response.status);
```

### 5. Session

Tracks session metrics.

```typescript
import { trackSessionStart, trackSessionEnd } from "@/lib/telemetry/telemetry-tracker";

// On session start
trackSessionStart(sessionId);

// On session end
trackSessionEnd(sessionId, sessionDuration);
```

---

## Data Models

### TelemetryEvent

**Raw events (30-day retention):**

```prisma
model TelemetryEvent {
  id        String   @id
  type      String   // Event type
  page      String?  // Anonymized page
  action    String?  // Action name
  duration  Int?     // Duration in ms
  metadata  Json?    // Sanitized metadata
  sessionId String?  // Anonymous session ID
  platform  String?  // "web" or "mobile"
  createdAt DateTime
}
```

### TelemetryAggregate

**Daily aggregates (permanent):**

```prisma
model TelemetryAggregate {
  id          String   @id
  date        DateTime @db.Date
  type        String
  context     String?  // Page/action
  count       Int
  avgDuration Float?
  p50Duration Float?   // Median
  p95Duration Float?   // 95th percentile
  p99Duration Float?   // 99th percentile
  errorRate   Float?   // Error percentage
}
```

---

## API Endpoints

### GET /api/telemetry

Retrieve aggregated metrics.

**Query Parameters:**
- `days` (default: 7) - Number of days to retrieve
- `type` - Filter by event type

**Response:**

```json
{
  "summary": {
    "pageViews": 1543,
    "actions": 892,
    "errors": 12,
    "apiCalls": 3421,
    "sessions": 234,
    "avgApiLatency": 145.3,
    "errorRate": 1.35,
    "avgSessionLength": 423000
  },
  "aggregates": [
    {
      "date": "2025-10-13",
      "type": "page_view",
      "context": "/dashboard",
      "count": 543,
      "avgDuration": null
    },
    {
      "date": "2025-10-13",
      "type": "api_call",
      "context": "/api/user",
      "count": 1234,
      "avgDuration": 123.5,
      "p50Duration": 98.0,
      "p95Duration": 245.0,
      "p99Duration": 512.0
    }
  ],
  "period": {
    "days": 7,
    "startDate": "2025-10-07T00:00:00.000Z",
    "endDate": "2025-10-13T23:59:59.999Z"
  }
}
```

### POST /api/telemetry

Record telemetry event.

**Request Body:**

```json
{
  "type": "page_view",
  "page": "/dashboard",
  "sessionId": "abc-123-def-456"
}
```

**Response:**

```json
{
  "success": true
}
```

---

## Aggregation

### Daily Aggregation Job

**Function:** `aggregateTelemetryDaily()`

**Schedule:** Daily (runs after midnight)

**Process:**

```
1. Get events from yesterday
   ↓
2. Group by type and context
   ↓
3. Calculate metrics:
   - Count
   - Avg/P50/P95/P99 duration
   - Error rate
   ↓
4. Upsert aggregates
   ↓
5. Delete raw events > 30 days
```

**Metrics Calculated:**

```typescript
count:       Total events
avgDuration: Average duration (ms)
p50Duration: Median duration (ms)
p95Duration: 95th percentile (ms)
p99Duration: 99th percentile (ms)
errorRate:   Error percentage (errors/actions)
```

### Data Retention

**Raw Events:** 30 days (rolling)

**Aggregates:** Permanent

**Cleanup:**

```typescript
import { cleanupOldTelemetry } from "@/lib/telemetry/telemetry-tracker";

// Delete events older than 30 days
await cleanupOldTelemetry(30);
```

---

## Client-Side Tracking

### React Hook (Placeholder)

```typescript
// hooks/useTelemetry.ts
'use client';

import { useEffect } from 'react';
import { trackPageView, getAnonymousSessionId } from '@/lib/telemetry/telemetry-tracker';

export function useTelemetry(page: string) {
  useEffect(() => {
    const sessionId = getAnonymousSessionId();
    
    // Track page view
    trackPageView(page, sessionId);
    
    // Track session duration on unmount
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      // Track action or session metric
    };
  }, [page]);
}
```

**Usage:**

```tsx
'use client';

import { useTelemetry } from '@/hooks/useTelemetry';

export default function DashboardPage() {
  useTelemetry('/dashboard');
  
  return <div>Dashboard</div>;
}
```

---

## Admin Dashboard (Placeholder)

### Telemetry Dashboard

**Location:** `/admin/telemetry` (placeholder)

**Sections:**

```
📊 Telemetry Dashboard

┌─────────────────────────────────────┐
│ Summary (Last 7 Days)               │
├─────────────────────────────────────┤
│ Page Views:     1,543               │
│ Actions:        892                 │
│ Errors:         12                  │
│ API Calls:      3,421               │
│ Sessions:       234                 │
│ Avg Session:    7m 3s               │
│ Avg API:        145ms               │
│ Error Rate:     1.35%               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Top Pages (Last 7 Days)             │
├─────────────────────────────────────┤
│ /dashboard       543 views          │
│ /profile         423 views          │
│ /flow/[id]       321 views          │
│ /friends         234 views          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ API Performance (Last 7 Days)       │
├─────────────────────────────────────┤
│ /api/user        98ms (p50)         │
│ /api/feed        145ms (p50)        │
│ /api/messages    203ms (p50)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Error Distribution                  │
├─────────────────────────────────────┤
│ API errors:      8                  │
│ Client errors:   4                  │
│ Network errors:  0                  │
└─────────────────────────────────────┘
```

---

## Privacy Compliance

### GDPR/CCPA Compliance

**✅ No Personal Data:**
- No user emails
- No names
- No user IDs
- No IP addresses

**✅ Anonymization:**
- URLs anonymized (IDs replaced with [id])
- Session IDs are random UUIDs
- No link to user identity

**✅ Data Retention:**
- Raw events: 30 days
- Aggregates: Summarized only
- Automatic cleanup

**✅ Opt-Out:**
```typescript
// Disable in development by default
NODE_ENV=development TELEMETRY_ENABLED=false

// Users can opt out via settings (future)
```

### What Gets Stored

**Example Event:**

```json
{
  "type": "page_view",
  "page": "/profile/[id]",
  "sessionId": "abc-123-def-456",
  "platform": "web",
  "createdAt": "2025-10-13T16:00:00.000Z"
}
```

**No Personal Data:**
- ❌ User ID
- ❌ Email
- ❌ Name
- ❌ IP address
- ❌ Actual page ID

---

## Use Cases

### 1. Feature Usage Tracking

Track which features are most used.

```typescript
trackAction("challenge_sent", "/friends");
trackAction("item_purchased", "/shop");
trackAction("profile_updated", "/profile");
```

**Dashboard Shows:**
- Most used features
- Feature adoption rates
- User journey patterns

### 2. Performance Monitoring

Track API and page performance.

```typescript
const start = Date.now();
const response = await fetch("/api/user");
const duration = Date.now() - start;

trackApiCall("/api/user", duration, response.status);
```

**Dashboard Shows:**
- API latency distribution
- Slow endpoints
- Performance trends

### 3. Error Tracking

Track application errors.

```typescript
try {
  await riskyOperation();
} catch (error) {
  trackError("operation_failed", "/dashboard", {
    errorType: "api_error",
  });
}
```

**Dashboard Shows:**
- Error rates
- Error distribution
- Problem areas

### 4. Session Analytics

Track session metrics.

```typescript
// Session start
const sessionId = getAnonymousSessionId();
trackSessionStart(sessionId);

// Session end
window.addEventListener('beforeunload', () => {
  const duration = Date.now() - sessionStart;
  trackSessionEnd(sessionId, duration);
});
```

**Dashboard Shows:**
- Average session length
- Session count trends
- Engagement metrics

---

## Integration Options

### Axiom (Optional)

**External analytics platform for advanced visualization.**

```bash
# Environment
AXIOM_DATASET=parel-telemetry
AXIOM_TOKEN=xaat-xxx
```

**Usage:**

```typescript
import { Axiom } from '@axiomhq/js';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  dataset: process.env.AXIOM_DATASET!,
});

await axiom.ingest([{
  timestamp: new Date().toISOString(),
  type: 'page_view',
  page: '/dashboard',
  sessionId: 'xxx',
}]);
```

### Plausible (Optional)

**Privacy-friendly web analytics.**

```html
<!-- Add to layout.tsx -->
<script defer data-domain="parel.app" 
  src="https://plausible.io/js/script.js">
</script>
```

---

## Best Practices

### What to Track

```typescript
// ✅ Good: Anonymous, aggregatable
trackAction("flow_completed");
trackPageView("/dashboard");
trackApiCall("/api/user", duration, 200);

// ❌ Bad: Personal data
trackAction("user_email_changed", undefined, undefined, {
  email: "user@example.com", // DON'T DO THIS
});
```

### When to Track

```typescript
// ✅ Good: Important events
trackAction("purchase_completed");
trackAction("level_up");
trackAction("challenge_sent");

// ❌ Bad: Every mouse move
trackAction("mouse_moved"); // Too noisy
```

### Performance

```typescript
// ✅ Good: Async, fire-and-forget
trackEvent({ ... }); // Non-blocking

// ✅ Good: Batch tracking (future)
const events = [...];
await batchTrackEvents(events);
```

---

## Metrics Reference

### Page Views

**Tracks:** Page navigation

**Metrics:**
- Total page views
- Unique pages visited
- Most popular pages

### Actions

**Tracks:** User interactions

**Metrics:**
- Total actions
- Action types
- Feature usage

### Errors

**Tracks:** Application errors

**Metrics:**
- Error count
- Error rate (errors/actions)
- Error types

### API Calls

**Tracks:** API performance

**Metrics:**
- Total API calls
- Average latency
- P50/P95/P99 latency
- Status code distribution

### Sessions

**Tracks:** Session metrics

**Metrics:**
- Session count
- Average session length
- Session start/end times

---

## Troubleshooting

### Telemetry Not Recording

**Check:**
1. `TELEMETRY_ENABLED=true` in production
2. Database connection
3. No errors in console

**Fix:**
```bash
# Enable telemetry
export TELEMETRY_ENABLED=true

# Check database
pnpm prisma studio
```

### High Storage Usage

**Check:**
```sql
SELECT COUNT(*) FROM telemetry_events;
```

**Fix:**
```typescript
// Run cleanup
import { cleanupOldTelemetry } from "@/lib/telemetry/telemetry-tracker";

await cleanupOldTelemetry(30); // Keep 30 days
```

### Aggregation Not Running

**Check:**
```bash
# Verify cron job
crontab -l

# Check logs
tail -f /var/log/cron.log
```

**Fix:**
```bash
# Add to cron
0 1 * * * node -e "require('./lib/telemetry/telemetry-aggregator').aggregateTelemetryDaily()"
```

---

## Scheduled Jobs

### Daily Aggregation

**Schedule:** Daily at 1 AM

```bash
# Cron
0 1 * * * node -e "require('./lib/telemetry/telemetry-aggregator').aggregateTelemetryDaily()"
```

### Data Cleanup

**Schedule:** Daily at 3 AM

```bash
# Cron
0 3 * * * node -e "require('./lib/telemetry/telemetry-tracker').cleanupOldTelemetry(30)"
```

---

**Last Updated:** v0.11.7 (2025-10-13)











