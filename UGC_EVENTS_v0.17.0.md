# 🎨 UGC & Events System v0.17.0

**Status:** ✅ Implemented  
**Date:** October 22, 2025  
**Platform:** PAREL – Next.js 14 / Prisma 5  

---

## 📋 Overview

Version 0.17.0 introduces a complete **User-Generated Content (UGC)** and **Community Events** system, enabling users to create, submit, and interact with custom content while participating in themed events and challenges.

### Key Features

1. **UGC Creation & Submission** – Users can submit questions, packs, and event ideas
2. **Moderation System** – Admin dashboard for reviewing and approving content
3. **Community Voting** – Upvote/downvote submissions with duplicate prevention
4. **Events Management** – Create and manage community events with countdown timers
5. **Reward Integration** – XP and badges for content creation and participation
6. **Content Filtering** – Automated profanity detection and validation

---

## 🗄️ Database Schema

### New Models

#### UserSubmission
Stores user-generated content submissions.

```prisma
model UserSubmission {
  id             String               @id @default(cuid())
  userId         String
  type           SubmissionType       @default(QUESTION)
  status         SubmissionStatus     @default(PENDING)
  title          String
  content        String
  description    String?
  categoryId     String?
  languageId     String?
  tags           String[]
  imageUrl       String?
  metadata       Json?
  upvotes        Int                  @default(0)
  downvotes      Int                  @default(0)
  score          Int                  @default(0)
  moderatorId    String?
  moderatorNote  String?
  reviewedAt     DateTime?
  approvedAt     DateTime?
  rejectedAt     DateTime?
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  
  user           User                 @relation("UserSubmissions")
  moderator      User?                @relation("ModeratedSubmissions")
  category       Category?
  language       Language?
  votes          Vote[]
}
```

#### Event
Community events and challenges.

```prisma
model Event {
  id             String         @id @default(cuid())
  title          String
  description    String
  type           EventType      @default(CHALLENGE)
  status         EventStatus    @default(DRAFT)
  startDate      DateTime
  endDate        DateTime
  rewardXP       Int            @default(0)
  rewardDiamonds Int            @default(0)
  imageUrl       String?
  metadata       Json?
  participants   Int            @default(0)
  creatorId      String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  
  creator        User?          @relation("CreatedEvents")
}
```

#### Vote
Tracks user votes on submissions.

```prisma
model Vote {
  id               String         @id @default(cuid())
  userId           String?
  sessionId        String?
  submissionId     String
  voteType         VoteType
  createdAt        DateTime       @default(now())
  
  user             User?          @relation("UserVotes")
  submission       UserSubmission
  
  @@unique([userId, submissionId])
  @@unique([sessionId, submissionId])
}
```

### Enums

```prisma
enum SubmissionType {
  QUESTION
  PACK
  EVENT
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

enum EventType {
  CHALLENGE
  THEMED_WEEK
  SPOTLIGHT
  COMMUNITY
}

enum EventStatus {
  DRAFT
  ACTIVE
  UPCOMING
  ENDED
  CANCELLED
}

enum VoteType {
  UPVOTE
  DOWNVOTE
}
```

---

## 🔌 API Endpoints

### UGC Endpoints

#### POST `/api/ugc/question`
Submit new user-generated content.

**Request Body:**
```json
{
  "title": "string (10-300 chars)",
  "content": "string (10-300 chars)",
  "description": "string (optional, max 500 chars)",
  "categoryId": "string (optional)",
  "languageId": "string (optional)",
  "tags": ["string"] (optional, max 10),
  "imageUrl": "url (optional)",
  "type": "QUESTION | PACK | EVENT"
}
```

**Response:**
```json
{
  "message": "Submission created! You earned 15 XP for your first submission.",
  "submission": {
    "id": "cuid",
    "title": "string",
    "status": "PENDING",
    "createdAt": "datetime"
  },
  "xpAwarded": 15
}
```

**Validation:**
- ✅ Title: 10-300 characters
- ✅ Content: 10-300 characters
- ✅ Profanity filter applied
- ✅ Authentication required

---

#### GET `/api/ugc/question`
Retrieve submissions.

**Query Parameters:**
- `status` – Filter by status (PENDING, APPROVED, REJECTED)
- `limit` – Results per page (default: 20)
- `offset` – Pagination offset (default: 0)

**Response:**
```json
{
  "submissions": [
    {
      "id": "cuid",
      "title": "string",
      "content": "string",
      "status": "APPROVED",
      "score": 42,
      "upvotes": 50,
      "downvotes": 8,
      "user": {
        "id": "cuid",
        "name": "string",
        "avatarUrl": "url"
      },
      "category": {
        "id": "cuid",
        "name": "string"
      },
      "createdAt": "datetime"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

#### POST `/api/ugc/moderate`
Moderate a submission (Admin/Mod only).

**Request Body:**
```json
{
  "submissionId": "cuid",
  "action": "APPROVE | REJECT | FLAG",
  "note": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "message": "Submission approved successfully",
  "submission": { /* updated submission */ }
}
```

**Actions:**
- `APPROVE` – Make visible, award karma, trigger badges
- `REJECT` – Hide, send notification with reason
- `FLAG` – Mark for further review

---

### Voting Endpoints

#### POST `/api/vote`
Cast or toggle a vote.

**Request Body:**
```json
{
  "submissionId": "cuid",
  "voteType": "UPVOTE | DOWNVOTE"
}
```

**Response:**
```json
{
  "message": "Vote created successfully",
  "action": "created | updated | removed",
  "submission": {
    "id": "cuid",
    "score": 43,
    "upvotes": 51,
    "downvotes": 8
  }
}
```

**Logic:**
- Same vote type → Remove vote
- Different vote type → Update vote (2-point swing)
- New vote → Create vote (+1 or -1 to score)
- Upvotes award +5 XP to author

**Duplicate Prevention:**
- Authenticated users: `userId + submissionId` unique constraint
- Anonymous users: `sessionId + submissionId` unique constraint

---

#### GET `/api/vote`
Get user's votes.

**Query Parameters:**
- `submissionId` (optional) – Get specific vote

**Response:**
```json
{
  "votes": [
    {
      "id": "cuid",
      "voteType": "UPVOTE",
      "createdAt": "datetime",
      "submission": {
        "id": "cuid",
        "title": "string",
        "score": 42
      }
    }
  ]
}
```

---

### Events Endpoints

#### GET `/api/events`
Retrieve events.

**Query Parameters:**
- `status` – Filter by status (ACTIVE, UPCOMING, ENDED)
- `type` – Filter by type (CHALLENGE, THEMED_WEEK, etc.)
- `limit` – Results limit (default: 20)

**Response:**
```json
{
  "events": [
    {
      "id": "cuid",
      "title": "Weekly Challenge #1",
      "description": "Complete 50 questions this week",
      "type": "CHALLENGE",
      "status": "ACTIVE",
      "startDate": "datetime",
      "endDate": "datetime",
      "rewardXP": 100,
      "rewardDiamonds": 10,
      "participants": 42,
      "timeRemaining": 86400000,
      "creator": {
        "id": "cuid",
        "name": "Admin"
      }
    }
  ]
}
```

---

#### POST `/api/events`
Create event (Admin only).

**Request Body:**
```json
{
  "title": "string (3-200 chars)",
  "description": "string (10-1000 chars)",
  "type": "CHALLENGE | THEMED_WEEK | SPOTLIGHT | COMMUNITY",
  "startDate": "datetime",
  "endDate": "datetime",
  "rewardXP": "number",
  "rewardDiamonds": "number",
  "imageUrl": "url (optional)"
}
```

**Validation:**
- ✅ End date must be after start date
- ✅ Checks for overlapping events of same type
- ✅ Auto-sets status based on dates (ACTIVE, UPCOMING, DRAFT)

---

#### PATCH `/api/events`
Update event (Admin only).

**Request Body:**
```json
{
  "id": "cuid",
  "title": "string (optional)",
  "status": "ACTIVE | CANCELLED | etc (optional)",
  /* other fields to update */
}
```

---

#### DELETE `/api/events?id=cuid`
Cancel event (Admin only).

**Response:**
```json
{
  "message": "Event cancelled successfully"
}
```

---

## 🎨 User Pages

### `/app/create`
Content submission form.

**Features:**
- Type selection (Question, Pack, Event)
- Title input (10-300 chars with counter)
- Content textarea (10-300 chars with counter)
- Optional description (500 chars max)
- Tags input (comma-separated)
- Optional image URL
- Real-time character counting
- Form validation
- Success/error messages
- Auto-redirect to community feed

**Authentication:**
- Requires login
- Shows "Sign In" prompt if unauthenticated

---

### `/app/community`
Community feed with voting.

**Tabs:**
- 🔥 **Top** – Sorted by score (highest first)
- 🆕 **New** – Sorted by creation date (newest first)
- 📝 **Your Submissions** – User's own submissions with status badges

**Features:**
- Upvote/downvote buttons
- Score display with vote counts
- Submission metadata (author, timestamp, category, tags)
- Status badges (for "Your Submissions" tab)
- Empty state messages
- Responsive card layout

**Voting UI:**
- ▲ Upvote (green when active)
- Score (bold, centered)
- ▼ Downvote (red when active)
- Disabled when not authenticated

---

### `/app/events`
Events page with countdown timers.

**Features:**
- Live countdown timer (updates every second)
- Event cards with status badges
- Reward display (XP + Diamonds)
- Participant count
- Event type icons (🏆 Challenge, 🎨 Themed Week, ⭐ Spotlight)
- Start/end date display
- "Join Event" button for active events
- Responsive grid layout

**Countdown Format:**
- Days/hours/minutes for long durations
- Hours/minutes/seconds for < 24 hours
- Seconds only for < 1 minute

---

## 🛡️ Admin Pages

### `/app/admin/ugc`
Moderation dashboard.

**Filter Tabs:**
- ⏳ **Pending** – Awaiting review
- ✅ **Approved** – Published
- ❌ **Rejected** – Declined with reason
- 🚩 **Flagged** – Needs attention

**Features:**
- Submission cards with full details
- Score and vote statistics
- User information
- Category and tags display
- Moderation note input (optional)
- Quick action buttons:
  - ✅ Approve
  - ❌ Reject
  - 🚩 Flag for Review
- Review history display

**Permissions:**
- Admin or Mod role required
- Auto-redirect non-admins to home

---

### `/app/admin/events`
Events management dashboard.

**Features:**
- Create/Edit event form
- Event list with status badges
- Date/time pickers (datetime-local input)
- Reward configuration (XP + Diamonds)
- Overlap validation
- Delete/cancel events
- Participant count display

**Form Fields:**
- Title (required, 3-200 chars)
- Description (required, 10-1000 chars)
- Type (dropdown: Challenge, Themed Week, Spotlight, Community)
- Start/end date & time
- Reward XP
- Reward Diamonds
- Optional image URL

---

## 🎁 Rewards & Badges

### XP Rewards

| Action | XP Awarded |
|--------|------------|
| First submission | +15 XP |
| Submission approved | Karma +10 |
| Upvote received | +5 XP (per upvote) |
| Upvote removed | -5 XP |

### Badges

Created via `scripts/seed-ugc-badges.sql`:

| Badge Slug | Title | Requirement |
|------------|-------|-------------|
| `ugc_first_submission` | First Contribution 📝 | Submit first content |
| `ugc_first_approved` | Approved Creator ✅ | First approved submission |
| `ugc_top_contributor` | Top Contributor ⭐ | 10 approved submissions |
| `ugc_upvote_champion` | Upvote Champion 🏆 | 100+ total upvotes |
| `ugc_community_favorite` | Community Favorite 💎 | Submission with 50+ score |
| `event_participant` | Event Participant 🎉 | Join first event |
| `event_champion` | Event Champion 🌟 | Participate in 10 events |

**Badge Service:**
- Located in `apps/web/lib/badge-service.ts`
- Auto-checks and awards badges on approval
- Creates notification for each badge earned
- Prevents duplicate badge awards

---

## 🛡️ Content Moderation

### Profanity Filter

Located in `apps/web/lib/filter.ts`:

```typescript
import { validateUGCContent } from '@/lib/filter';

// Returns { valid: boolean, errors: string[] }
const result = validateUGCContent(title, content, description);
```

**Features:**
- Pattern-based word detection
- Checks title, content, and description
- Returns list of flagged words
- Expandable word list

**Integration:**
- Applied on submission (`POST /api/ugc/question`)
- Returns 400 error if content fails validation

---

## 📊 Flow Diagrams

### Submission Flow

```
┌─────────────────┐
│  User creates   │
│   submission    │
│  /app/create    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /api/ugc  │
│   /question     │
│  • Validate     │
│  • Filter       │
│  • Store        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Status: PENDING │
│  in database    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin reviews  │
│  /admin/ugc     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│APPROVE │ │REJECT  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Visible │ │Hidden  │
│+XP     │ │Notify  │
│+Badge  │ └────────┘
│+Notify │
└────────┘
```

### Voting Flow

```
┌─────────────────┐
│  User clicks    │
│   upvote/       │
│   downvote      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /api/vote │
│  Check existing │
│     vote        │
└────────┬────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌────────┐      ┌──────────┐
│No vote │      │Has vote  │
└───┬────┘      └─────┬────┘
    │                 │
    ▼            ┌────┴────┐
┌────────┐       │         │
│Create  │   ┌───▼───┐ ┌───▼───┐
│+1/-1   │   │ Same  │ │ Diff  │
└───┬────┘   │ type  │ │ type  │
    │        └───┬───┘ └───┬───┘
    │            │         │
    │            ▼         ▼
    │        ┌────────┐ ┌────────┐
    │        │Remove  │ │Update  │
    │        │vote    │ │±2 swing│
    │        └───┬────┘ └───┬────┘
    │            │         │
    └────────────┴─────────┘
                 │
                 ▼
┌────────────────────────┐
│  Update submission     │
│  score/upvotes/        │
│  downvotes             │
└────────────────────────┘
```

### Event Lifecycle

```
┌─────────────────┐
│  Admin creates  │
│  event          │
│  /admin/events  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│POST /api/events │
│  • Validate     │
│  • Check overlap│
│  • Auto-status  │
└────────┬────────┘
         │
    ┌────┴────────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│UPCOMING│   │ACTIVE  │
│(future)│   │(now)   │
└───┬────┘   └───┬────┘
    │            │
    │            ▼
    │     ┌────────────┐
    │     │  Countdown │
    │     │   timer    │
    │     │  /events   │
    │     └─────┬──────┘
    │           │
    └───────┬───┘
            │
            ▼
    ┌────────────┐
    │   ENDED    │
    │(past date) │
    └────────────┘
```

---

## 🧪 Testing

### Smoke Tests

Located in `tests/ugc.smoke.test.ts`

**Test Coverage:**

✅ **UGC Submission**
- Valid submission creation
- Invalid data rejection
- Submission retrieval

✅ **Voting System**
- Vote casting
- Duplicate prevention
- Vote toggling

✅ **Events System**
- Event retrieval
- Status filtering
- Admin-only creation

✅ **Moderation**
- Permission checks
- Approve/reject flow

✅ **Content Filtering**
- Profanity detection
- Validation rules

✅ **Rewards**
- XP for submissions
- XP for upvotes
- Badge awards

**Run Tests:**
```bash
# Default (localhost:3000)
npm test tests/ugc.smoke.test.ts

# Custom API URL
API_URL=https://your-domain.com npm test tests/ugc.smoke.test.ts
```

---

## 📁 File Structure

```
packages/db/
  └── schema.prisma                 # Database schema with new models

apps/web/
  ├── app/
  │   ├── create/
  │   │   └── page.tsx              # UGC submission form
  │   ├── community/
  │   │   └── page.tsx              # Community feed with voting
  │   ├── events/
  │   │   └── page.tsx              # Events page with countdown
  │   ├── admin/
  │   │   ├── ugc/
  │   │   │   └── page.tsx          # UGC moderation dashboard
  │   │   └── events/
  │   │       └── page.tsx          # Events management dashboard
  │   └── api/
  │       ├── ugc/
  │       │   ├── question/
  │       │   │   └── route.ts      # UGC submission & retrieval
  │       │   └── moderate/
  │       │       └── route.ts      # Moderation endpoint
  │       ├── vote/
  │       │   └── route.ts          # Voting endpoint
  │       └── events/
  │           └── route.ts          # Events CRUD
  └── lib/
      ├── filter.ts                 # Profanity filter
      └── badge-service.ts          # Badge awarding logic

scripts/
  └── seed-ugc-badges.sql           # Badge data seeder

tests/
  └── ugc.smoke.test.ts             # Smoke tests
```

---

## 🚀 Deployment Checklist

### Database Setup

1. **Run Migration:**
   ```bash
   cd packages/db
   npx prisma migrate deploy
   ```

2. **Seed Badges:**
   ```bash
   psql $DATABASE_URL -f scripts/seed-ugc-badges.sql
   ```

3. **Verify Tables:**
   ```sql
   SELECT COUNT(*) FROM user_submissions;
   SELECT COUNT(*) FROM events;
   SELECT COUNT(*) FROM votes;
   SELECT COUNT(*) FROM badges WHERE slug LIKE 'ugc_%' OR slug LIKE 'event_%';
   ```

### Application Setup

1. **Build App:**
   ```bash
   npm run build
   ```

2. **Check Lints:**
   ```bash
   npm run lint
   ```

3. **Run Tests:**
   ```bash
   npm test tests/ugc.smoke.test.ts
   ```

### Post-Deployment

1. **Test Flows:**
   - Create submission → approve → visible in feed
   - Vote on submission → XP awarded
   - Create event → visible on events page
   - Admin moderation → status changes

2. **Monitor Logs:**
   ```bash
   tail -f logs/server-start.log
   grep -i "ugc\|vote\|event" logs/server-start.log
   ```

3. **Check Badges:**
   - Verify badges appear in user profiles
   - Test badge notification creation

---

## 📝 API Examples

### Create Submission (cURL)

```bash
curl -X POST http://localhost:3000/api/ugc/question \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What is your favorite programming language?",
    "content": "I am curious to know what programming languages the community prefers and why.",
    "type": "QUESTION",
    "tags": ["programming", "poll"]
  }'
```

### Vote on Submission (cURL)

```bash
curl -X POST http://localhost:3000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "cm1abc123def",
    "voteType": "UPVOTE"
  }'
```

### Create Event (cURL)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend Challenge",
    "description": "Answer 50 questions this weekend!",
    "type": "CHALLENGE",
    "startDate": "2025-10-25T00:00:00Z",
    "endDate": "2025-10-27T23:59:59Z",
    "rewardXP": 100,
    "rewardDiamonds": 10
  }'
```

---

## 🔒 Security Considerations

1. **Authentication**
   - All write endpoints require authentication
   - Admin endpoints check role (ADMIN or MOD)
   - Session-based vote tracking for anonymous users

2. **Input Validation**
   - Zod schema validation on all endpoints
   - Character limits enforced (10-300 for title/content)
   - URL validation for image links
   - Tag count limits (max 10)

3. **Content Moderation**
   - Profanity filter on submission
   - Manual admin review before publishing
   - Flag system for suspicious content

4. **Rate Limiting**
   - Consider implementing rate limits for submission/voting
   - Prevent spam with IP-based throttling

5. **SQL Injection Prevention**
   - Prisma ORM parameterizes all queries
   - No raw SQL in endpoints

---

## 🐛 Known Limitations

1. **Event Participation Tracking**
   - Event "Join" functionality is placeholder
   - Participation count is manual field
   - Need to add EventParticipation junction table

2. **Profanity Filter**
   - Basic word list (expandable)
   - No context-aware filtering
   - Consider integrating external moderation API

3. **Rich Text Support**
   - Content fields are plain text
   - No markdown or HTML rendering
   - Could add editor in future

4. **Notification System**
   - Notifications created but delivery not implemented
   - Need push notification or email integration

5. **Leaderboard**
   - Contributor tab mentioned but not yet implemented in `/leaderboard`
   - Need to aggregate top contributors by score

---

## 🔜 Future Enhancements

### Phase 2 Ideas

- [ ] Event participation tracking with EventParticipation table
- [ ] Rich text editor for submissions (Markdown or WYSIWYG)
- [ ] Image upload (currently URL only)
- [ ] Search and filter submissions by tags/category
- [ ] Comment system on submissions
- [ ] User reputation score based on contributions
- [ ] Weekly leaderboard for top contributors
- [ ] Email notifications for moderation results
- [ ] Bulk moderation actions
- [ ] Admin analytics dashboard (submissions over time, vote trends)

---

## 🎉 Summary

✅ **Implemented:**
- 3 new database models (UserSubmission, Event, Vote)
- 7 API endpoints (UGC, voting, events, moderation)
- 5 user-facing pages (create, community, events)
- 2 admin dashboards (UGC moderation, events management)
- XP rewards (+15 first submission, +5 per upvote)
- 7 UGC/Events badges
- Profanity filter with validation
- Smoke tests for all features
- Countdown timers for events
- Duplicate vote prevention

✅ **Code Quality:**
- All endpoints wrapped in `safeAsync()`
- Zod validation schemas
- TypeScript throughout
- Consistent error handling
- Indexed database fields for performance

✅ **Documentation:**
- Complete API reference
- Flow diagrams
- Deployment checklist
- Testing guide

---

**Ready for deployment!** 🚀

Run migration, seed badges, test endpoints, and go live with v0.17.0.

