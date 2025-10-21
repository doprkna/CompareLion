# PareL Moderation & Safety Guide (v0.11.10)

## Overview

Comprehensive community moderation tools with reputation scoring, AI-assisted review, and transparency.

---

## Reputation System

### Reputation Score

**Range:** 0-200 (Base: 100)

**Trust Levels:**

```
⭐ Excellent  (150-200): Full privileges + perks
✅ Good       (120-149): All features enabled
➖ Neutral    (80-119):  Standard access
⚠️  Poor      (40-79):   Limited features
🚫 Banned     (0-39):    Restricted access
```

### Score Calculation

**Negative Factors:**

```
Reports received:     -10 per report
Negative reactions:   -0.5 per reaction
```

**Positive Factors:**

```
Reports dismissed:    +5 per dismissal
Positive reactions:   +0.2 per reaction
Challenges completed: +0.5 per challenge
Helpful votes:        +2 per vote
```

**Example:**

```
Base score: 100
- 2 reports received: -20
+ 50 positive reactions: +10
+ 100 challenges: +50
= Final score: 140 (Good ✅)
```

### Automatic Restrictions

**Based on Trust Level:**

```
Poor (40-79):
├─ Cannot send challenges
├─ Limited messages (5/day)
└─ No public posts

Banned (0-39):
├─ Cannot message
├─ Cannot challenge
├─ Cannot post
└─ Read-only access
```

---

## Report System

### Report Types

**5 Report Reasons:**

```
spam:          Unwanted/repetitive content
harassment:    Abusive behavior
inappropriate: NSFW/offensive content
cheating:      Exploits or unfair play
other:         Custom reason
```

### Report Flow

```
1. User submits report
   ↓
2. Report created (pending)
   ↓
3. Priority assigned (low/normal/high/urgent)
   ↓
4. AI review (if urgent)
   ↓
5. Moderator review
   ↓
6. Action taken (warn/mute/suspend/ban)
   ↓
7. Report resolved
   ↓
8. Reputation updated
```

### Report Priority

**Auto-assigned:**

```
Urgent:  Harassment, inappropriate content
High:    Cheating, repeated spam
Normal:  Spam, general issues
Low:     Minor issues, accidental reports
```

---

## Moderation Actions

### Action Types

**5 Action Levels:**

```
1. Warn        → Message + notification
2. Mute        → Cannot message (X hours)
3. Restrict    → Limited features (X hours)
4. Suspend     → Account frozen (X hours/days)
5. Ban         → Permanent removal
```

### Action Durations

**Escalation Path:**

```
1st offense: Warning
2nd offense: 24h mute
3rd offense: 72h restriction
4th offense: 7d suspension
5th offense: Permanent ban
```

### Moderation Flow

```
Report submitted
    ↓
Moderator reviews
    ↓
Decide action
    ↓
Apply action (warn/mute/restrict/suspend/ban)
    ↓
Update reputation
    ↓
Log action (audit trail)
    ↓
Notify user
    ↓
Publish to transparency feed (if public)
```

---

## AI Content Review

### Auto-Review Triggers

**Review on:**
- Public messages
- Challenge text
- Profile updates
- Comments

**AI Analysis:**

```json
{
  "flagged": true,
  "confidence": 0.95,
  "categories": ["harassment", "inappropriate"],
  "severity": "high"
}
```

**Auto-Actions:**

```
Confidence > 0.9 + Flagged:
├─ Hide content immediately
├─ Notify moderators
└─ Create report

Confidence 0.7-0.9 + Flagged:
├─ Queue for review
└─ Warn user

Confidence < 0.7 + Flagged:
└─ Log for monitoring
```

---

## Block System

### User Blocking

**Features:**
- Mutual blocking (both users)
- Cannot see each other's content
- Cannot message
- Cannot challenge
- No notification to blocked user

**Block Flow:**

```
User A blocks User B
    ↓
Create BlockedUser record
    ↓
Filter User B from User A's:
├─ Messages
├─ Challenges
├─ Feed
└─ Leaderboard
```

---

## Moderator Panel (Placeholder)

### Review Queue

```
┌─────────────────────────────────────┐
│   Moderation Queue                  │
├─────────────────────────────────────┤
│                                     │
│   🚨 URGENT (3)                     │
│   ├─ Report #123: Harassment        │
│   ├─ Report #124: Inappropriate     │
│   └─ Report #125: Spam              │
│                                     │
│   ⚠️  HIGH (5)                      │
│   ├─ Report #126: Cheating          │
│   └─ ...                            │
│                                     │
│   ➖ NORMAL (12)                    │
│   └─ ...                            │
│                                     │
│   [Filter: All | Pending | Urgent] │
└─────────────────────────────────────┘
```

### Report Detail

```
┌─────────────────────────────────────┐
│   Report #123                       │
├─────────────────────────────────────┤
│   Type: Harassment                  │
│   Priority: Urgent 🚨               │
│   Status: Pending                   │
│                                     │
│   Reporter: User A                  │
│   Reported: User B                  │
│   Content Type: Message             │
│                                     │
│   Description:                      │
│   "User sent threatening messages"  │
│                                     │
│   Content:                          │
│   [Redacted message text]           │
│                                     │
│   AI Analysis:                      │
│   ├─ Flagged: Yes                   │
│   ├─ Confidence: 0.95               │
│   └─ Categories: harassment         │
│                                     │
│   Actions:                          │
│   [Dismiss] [Warn] [Mute] [Suspend] [Ban]
└─────────────────────────────────────┘
```

### Action Log

```
┌─────────────────────────────────────┐
│   Moderation Actions                │
├─────────────────────────────────────┤
│   2025-10-13 16:00                  │
│   Moderator: Admin                  │
│   User: User B                      │
│   Action: 24h mute                  │
│   Reason: Harassment (Report #123)  │
│                                     │
│   2025-10-12 14:30                  │
│   Moderator: Mod1                   │
│   User: User C                      │
│   Action: Warning                   │
│   Reason: Spam                      │
└─────────────────────────────────────┘
```

---

## Transparency Feed (Placeholder)

### Weekly Summary

**Published weekly to public feed:**

```
┌─────────────────────────────────────┐
│   Moderation Summary (Week 42)      │
├─────────────────────────────────────┤
│   Reports Received:     47          │
│   Reports Resolved:     43          │
│   Reports Dismissed:    25          │
│                                     │
│   Actions Taken:                    │
│   ├─ Warnings:     12               │
│   ├─ Mutes:        5                │
│   ├─ Restrictions: 2                │
│   ├─ Suspensions:  1                │
│   └─ Bans:         0                │
│                                     │
│   Average Response Time: 2.3 hours  │
│   Community Health: Excellent ⭐    │
└─────────────────────────────────────┘
```

**Privacy:**
- No user names
- No specific details
- Aggregate statistics only

---

## APIs (Placeholder)

### Moderation API

**POST** `/api/moderation`

**Submit Report:**

```json
{
  "action": "report",
  "reportedUserId": "user123",
  "reason": "harassment",
  "description": "Threatening messages"
}

Response:
{
  "success": true,
  "reportId": "report123"
}
```

**Resolve Report:**

```json
{
  "action": "resolve",
  "reportId": "report123",
  "resolution": "warn",
  "notes": "User warned"
}

Response:
{
  "success": true
}
```

**Take Action:**

```json
{
  "action": "moderate",
  "userId": "user123",
  "actionType": "mute",
  "duration": 24,
  "reason": "Harassment"
}

Response:
{
  "success": true,
  "actionId": "action123"
}
```

### Reputation API

**GET** `/api/reputation?userId=user123`

```json
{
  "score": 140,
  "trustLevel": "good",
  "restrictions": {
    "isRestricted": false,
    "canMessage": true,
    "canChallenge": true
  },
  "factors": {
    "reportsReceived": 2,
    "positiveReactions": 150
  }
}
```

**POST** `/api/reputation`

```json
{
  "action": "adjust",
  "userId": "user123",
  "amount": -10,
  "reason": "Manual adjustment"
}
```

---

## Auto-Moderation

### Auto-Suspension

**Trigger:** 3+ resolved reports in 30 days

**Action:**
- 24-hour suspension
- Notification sent
- Appeal option

### Auto-Restrictions

**Based on Reputation:**

```
Score < 80 (Poor):
├─ Cannot send challenges
├─ Message rate limit (5/day)
└─ No public posts

Score < 40 (Banned):
├─ Cannot message
├─ Cannot challenge
├─ Cannot post
└─ Read-only
```

---

## Best Practices

### Report Handling

```typescript
// ✅ Good: Fair and transparent
- Review all reports
- Document decisions
- Give warnings first
- Escalate gradually

// ❌ Bad: Harsh or inconsistent
- Instant bans
- No appeals
- Inconsistent enforcement
```

### AI Review

```typescript
// ✅ Good: Human oversight
AI flags → Human reviews → Action

// ❌ Bad: Fully automated
AI flags → Auto-ban (no human review)
```

### Transparency

```typescript
// ✅ Good: Public accountability
- Weekly summaries
- Aggregate stats
- Clear policies

// ❌ Bad: Secret moderation
- No visibility
- No explanations
```

---

## Database Models

### Report

```prisma
- reporterId: String
- reportedUserId: String?
- contentType: "message" | "challenge" | etc.
- reason: "spam" | "harassment" | etc.
- status: "pending" | "resolved" | "dismissed"
- priority: "low" | "normal" | "high" | "urgent"
- resolvedBy: String?
- resolution: String?
```

### ReputationScore

```prisma
- userId: String (unique)
- score: Float (0-200, base: 100)
- trustLevel: "excellent" | "good" | "neutral" | "poor" | "banned"
- reportsReceived: Int
- positiveReactions: Int
- isRestricted: Boolean
- canMessage: Boolean
- canChallenge: Boolean
```

### ModerationAction

```prisma
- userId: String
- moderatorId: String
- actionType: "warn" | "mute" | "restrict" | "suspend" | "ban"
- reason: String
- duration: Int? (hours)
- isActive: Boolean
- expiresAt: DateTime?
- isPublic: Boolean
```

### BlockedUser

```prisma
- userId: String (blocker)
- blockedUserId: String (blocked)
- reason: String?
- Unique constraint: [userId, blockedUserId]
```

### ContentReview

```prisma
- contentType: String
- contentId: String
- content: String
- flagged: Boolean
- confidence: Float (0.0-1.0)
- categories: String[]
- reviewed: Boolean
- approved: Boolean?
```

---

## Scheduled Jobs

### Daily Reputation Update

```bash
# Cron (midnight)
0 0 * * * node -e "require('./lib/moderation/reputation-system').updateAllReputations()"
```

### Weekly Transparency Report

```bash
# Cron (Sunday 10 AM)
0 10 * * 0 node -e "require('./lib/moderation/transparency').publishWeeklyReport()"
```

### Auto-Suspension Check

```bash
# Cron (every 6 hours)
0 */6 * * * node -e "require('./lib/moderation/moderation-engine').checkAutoSuspensions()"
```

---

**Last Updated:** v0.11.10 (2025-10-13)











