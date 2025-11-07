# 🧠 AI Personalization & Reflections v0.19.0

**Status:** ✅ Implemented  
**Date:** October 22, 2025  
**Platform:** PAREL – Next.js 14 / Prisma 5  

---

## 📋 Overview

Version 0.19.0 introduces **AI-driven personalization** to make PareL feel like it's talking *with* users, not *at* them. Through reflection generation, weekly comparisons, and daily quotes, users get a sticky, emotionally engaging experience that drives retention.

### Key Features

1. **AI Reflection Generator** – Personalized summaries with witty, friendly tone
2. **Weekly & Daily Reflections** – Automated insights about progress
3. **Compare to Last Week** – Percentage-based stat comparisons
4. **Quote-of-the-Day** – 30 curated quotes, cached for 24h
5. **Data Persistence** – UserReflection and UserWeeklyStats models

---

## 🗄️ Database Schema

### New Models

#### UserReflection
Stores generated reflections for users.

```prisma
model UserReflection {
  id          String            @id @default(cuid())
  userId      String
  date        DateTime          @default(now())
  type        ReflectionType    @default(DAILY)
  content     String
  summary     String?
  sentiment   String?           @default("neutral")
  stats       Json?
  metadata    Json?
  createdAt   DateTime          @default(now())
  user        User              @relation(...)

  @@index([userId])
  @@index([date])
  @@index([type])
}
```

#### UserWeeklyStats
Tracks weekly progress for comparison.

```prisma
model UserWeeklyStats {
  id              String   @id @default(cuid())
  userId          String
  weekStart       DateTime
  weekEnd         DateTime
  xpGain          Int      @default(0)
  coinsGain       Int      @default(0)
  karmaGain       Int      @default(0)
  questionsCount  Int      @default(0)
  streakDays      Int      @default(0)
  rankChange      Int?
  metadata        Json?
  createdAt       DateTime @default(now())
  user            User     @relation(...)

  @@unique([userId, weekStart])
  @@index([userId])
  @@index([weekStart])
}
```

### Enums

```prisma
enum ReflectionType {
  DAILY
  WEEKLY
  MONTHLY
  MILESTONE
}
```

---

## 🔌 API Endpoints

### Reflection Endpoints

#### POST `/api/ai/reflection`
Generate a new reflection for the authenticated user.

**Request Body:**
```json
{
  "type": "DAILY | WEEKLY | MONTHLY | MILESTONE",
  "dateRange": {
    "start": "2025-10-15T00:00:00Z",
    "end": "2025-10-22T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "type": "WEEKLY",
  "content": "**Week in Review, Alex:**\n\n🚀 XP is up 24%! You're leveling up like a boss. Your Karma is glowing (up 15%). \n\n🔥 That 14-day streak is legendary. Don't let up now!\n\n🎯 Season progress: 1,250 XP. The leaderboard awaits.",
  "generatedAt": "2025-10-22T10:30:00Z"
}
```

**Reflection Styles by Type:**

**DAILY (Short & Sweet):**
- 1-2 sentences
- Focuses on today's activity
- Encouragement or gentle nudge
- Examples:
  - "Nice work today, Alex! You gained 45 XP. Keep that momentum going! 🚀"
  - "Hey Alex, taking it easy today? Sometimes rest is progress too. 😌"

**WEEKLY (Detailed):**
- 3-5 sentences
- Compares to previous week (% changes)
- Streak recognition
- Seasonal context
- Example format:
  ```
  **Week in Review, [Name]:**
  
  🚀 XP is up [X]%! [commentary]
  [Karma status]
  
  🔥 [Streak commentary]
  🎯 Season progress: [XP] XP
  ```

**MONTHLY (Comprehensive):**
- Full breakdown with bullet points
- Growth metrics
- Current standing
- Inspirational quote
- Example structure:
  ```
  **Monthly Reflection: [Name]**
  
  This month, you've grown in ways that matter:
  • XP Growth: +[X] ([Y]% increase)
  • Coins: +[X]
  • Karma: +[X]
  
  **Current Standing:**
  • Level [X] • [Y] XP • [Z]-day streak
  • [N] questions answered this journey
  
  *[Quote]*
  ```

**MILESTONE (Achievement-Based):**
- Triggered on level milestones (10, 20, 30...)
- Streak achievements (30, 100, 365 days)
- Question count milestones (100, 500, 1000)
- Examples:
  - "🎉 **Level 10 Milestone!** You've reached a major tier, Alex."
  - "🔥 **30-Day Streak!** You're officially unstoppable, Alex."

---

#### GET `/api/ai/reflection`
Get user's reflection history.

**Query Parameters:**
- `type` (optional) – Filter by reflection type
- `limit` (default: 10) – Number of reflections to return

**Response:**
```json
{
  "reflections": [
    {
      "id": "cuid",
      "type": "WEEKLY",
      "content": "Full reflection text...",
      "summary": "XP up 24%, Karma up 15%...",
      "sentiment": "positive",
      "date": "2025-10-22T00:00:00Z",
      "createdAt": "2025-10-22T10:30:00Z"
    }
  ],
  "count": 10
}
```

---

#### GET `/api/reflection/latest`
Get the most recent reflection.

**Query Parameters:**
- `type` (optional) – Filter by type (DAILY, WEEKLY, etc.)

**Response:**
```json
{
  "reflection": {
    "id": "cuid",
    "type": "DAILY",
    "content": "Nice work today, Alex!...",
    "summary": "45 XP gained today",
    "sentiment": "positive",
    "date": "2025-10-22T00:00:00Z",
    "createdAt": "2025-10-22T18:45:00Z",
    "stats": {
      "xpGained": 45,
      "coinsGained": 4
    }
  }
}
```

---

### Quote Endpoint

#### GET `/api/ai/quote`
Get the quote of the day (cached for 24 hours).

**Response:**
```json
{
  "quote": {
    "id": 3,
    "text": "The leaderboard is watching, but your progress is personal.",
    "author": "PareL Philosophy",
    "category": "perspective"
  },
  "cached": true,
  "expiresAt": "2025-10-22T23:59:59Z"
}
```

**Quote Selection:**
- Deterministic based on day of year
- Same quote for all users on a given day
- Rotates through 30 curated quotes
- Categories: motivation, growth, perspective, consistency, karma, learning, wisdom

**Quote Examples:**
1. "Comparison is the thief of joy — unless it gives you XP."
2. "Level up your mind before you level up your character."
3. "Streaks are built one day at a time, but lost in a single moment of 'I'll do it tomorrow.'"
4. "The leaderboard shows who's fastest. Your journey shows who you're becoming."
5. "Small wins daily > big wins occasionally."

---

## 🧮 Comparison Stats Logic

### Weekly Comparison

Located in `lib/ai-reflection.ts`:

```typescript
async function getComparisonStats(
  userId: string,
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE'
): Promise<ComparisonStats> {
  // Calculates:
  // - Absolute change (xpChange, coinsChange, karmaChange)
  // - Percent change (xpPercentChange, etc.)
  
  // Returns comparison to previous period
}
```

**Comparison Indicators:**
- **Positive Change:**
  - Green ↑ arrow
  - "+24%" style display
  - Celebratory language ("up", "growing", "fire")

- **Negative Change:**
  - Red ↓ arrow
  - "-12%" style display
  - Supportive language ("bounce back", "fresh start")

- **No Change:**
  - Neutral ≈ indicator
  - "holding steady"
  - Encouragement for consistency

**Formula:**
```typescript
percentChange = ((newValue - oldValue) / oldValue) * 100
```

**Example Output:**
```
XP: +150 (+24%) ↑
Coins: -10 (-5%) ↓
Karma: +25 (+15%) ↑
```

---

## 📊 Reflection Generation Flow

```
User Request
     │
     ▼
/api/ai/reflection
     │
     ▼
generateReflection()
     │
     ├──► Fetch user stats (XP, coins, karma, streak, level)
     │
     ├──► Get comparison data (previous week/day/month)
     │
     ├──► Select reflection template based on:
     │    • Type (DAILY/WEEKLY/MONTHLY)
     │    • Performance (positive/neutral/negative)
     │    • Streak status
     │    • Milestones
     │
     ├──► Generate personalized content
     │    • Use user's name
     │    • Insert actual numbers
     │    • Apply witty/friendly tone
     │
     ▼
storeReflection()
     │
     ├──► Save to user_reflections table
     │
     ├──► Determine sentiment (positive/neutral/negative)
     │
     ├──► Store summary (first 200 chars)
     │
     ▼
Return to user
```

---

## 📝 Tone & Voice Guidelines

**PareL Voice Characteristics:**

✅ **DO:**
- Be friendly and conversational
- Use light humor and wit
- Reference gaming/leveling metaphors
- Be honest about performance (good or bad)
- Encourage without being preachy
- Use emojis sparingly but effectively
- Personalize with user's name

❌ **DON'T:**
- Be overly corporate or formal
- Ignore negative trends
- Use generic motivational clichés
- Patronize or talk down
- Overuse emojis (max 2-3 per reflection)
- Sound robotic or template-y

**Example Comparisons:**

❌ **Bad (Generic):**
> "Congratulations on your progress this week. You have improved in multiple areas. Keep up the good work and continue striving for excellence."

✅ **Good (PareL Voice):**
> "Week in Review, Alex: 🚀 XP is up 24%! You're leveling up like a boss. That 14-day streak is legendary. Don't let up now!"

---

## 🎨 UI Integration Touchpoints

### 1. Dashboard "My Reflection" Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>My Reflection</CardTitle>
    <CardDescription>Your personalized insight</CardDescription>
  </CardHeader>
  <CardContent>
    <p>{reflection.content}</p>
    <span className="text-xs text-muted-foreground">
      {formatDate(reflection.date)}
    </span>
  </CardContent>
</Card>
```

### 2. "Compare to Last Week" Widget
```tsx
<div className="stats-comparison">
  <StatItem 
    label="XP" 
    value={currentXP} 
    change={xpPercentChange}
    trend={xpPercentChange > 0 ? 'up' : 'down'}
  />
  <StatItem 
    label="Coins" 
    value={currentCoins} 
    change={coinsPercentChange}
    trend={coinsPercentChange > 0 ? 'up' : 'down'}
  />
  <StatItem 
    label="Karma" 
    value={currentKarma} 
    change={karmaPercentChange}
    trend={karmaPercentChange > 0 ? 'up' : 'down'}
  />
</div>
```

### 3. Quote-of-the-Day Banner
```tsx
<div className="quote-banner">
  <p className="quote-text">"{quote.text}"</p>
  <span className="quote-author">— {quote.author}</span>
</div>
```

---

## 🤖 AI/LLM Integration (Future)

**Current Implementation:**
- Template-based generation (v0.19.0)
- Deterministic quote selection
- No external API calls

**Future Enhancements (v0.20+):**
- OpenAI GPT-4 integration for richer reflections
- Personalized quote generation
- Sentiment analysis via AI
- Context-aware recommendations
- User tone preferences (serious, playful, motivational)

**Fallback Strategy:**
- If AI API fails → use template-based generation
- If offline → serve cached/static reflections
- Always store reflections locally for reliability

---

## 📅 Weekly Stats Tracking

### Automated Script

File: `scripts/track-weekly-stats.ts`

**Purpose:**
- Run weekly (cron job or scheduled task)
- Calculate and store UserWeeklyStats for all active users
- Enable week-over-week comparisons

**Logic:**
```typescript
For each active user:
  1. Get stats from 7 days ago
  2. Calculate deltas (XP, coins, karma, questions)
  3. Store in user_weekly_stats table
  4. Enable comparison queries
```

**Cron Schedule:**
```bash
# Run every Monday at 00:00
0 0 * * 1 node scripts/track-weekly-stats.ts
```

---

## 🧪 Testing

### Manual Test Scenarios

1. **Generate Daily Reflection:**
   ```bash
   curl -X POST http://localhost:3000/api/ai/reflection \
     -H "Content-Type: application/json" \
     -d '{"type": "DAILY"}'
   ```

2. **Get Latest Reflection:**
   ```bash
   curl http://localhost:3000/api/reflection/latest
   ```

3. **Get Quote of the Day:**
   ```bash
   curl http://localhost:3000/api/ai/quote
   ```

4. **Verify Quote Caching:**
   - Call `/api/ai/quote` twice
   - Second call should return `"cached": true`

### Expected Behaviors

✅ **Reflections:**
- Daily: 1-2 sentences, encouraging
- Weekly: 3-5 sentences, comparative stats
- Content includes user's name
- Sentiment detected correctly

✅ **Quotes:**
- Different quote each day
- Same quote for all users on a given day
- Cache persists until midnight

✅ **Comparisons:**
- Accurate percentage calculations
- Positive/negative trends identified
- Zero-division handled gracefully

---

## 📂 File Structure

```
apps/web/
  ├── lib/
  │   └── ai-reflection.ts          # Reflection generation logic
  ├── data/
  │   └── quotes.json                # 30 curated quotes
  ├── app/api/
  │   ├── ai/
  │   │   ├── reflection/route.ts    # Generate reflections
  │   │   └── quote/route.ts         # Get daily quote
  │   └── reflection/
  │       └── latest/route.ts        # Get latest reflection

packages/db/
  └── schema.prisma                  # UserReflection, UserWeeklyStats models

scripts/
  └── track-weekly-stats.ts          # Weekly stats tracking (future)
```

---

## 🚀 Deployment Checklist

### Database

1. **Run Migration:**
   ```bash
   cd packages/db
   npx prisma migrate deploy
   ```

2. **Verify Models:**
   ```sql
   SELECT COUNT(*) FROM user_reflections;
   SELECT COUNT(*) FROM user_weekly_stats;
   ```

### Application

1. **Build:**
   ```bash
   npm run build
   ```

2. **Test Endpoints:**
   ```bash
   # Generate reflection
   curl -X POST http://localhost:3000/api/ai/reflection \
     -H "Content-Type: application/json" \
     -d '{"type": "DAILY"}'
   
   # Get quote
   curl http://localhost:3000/api/ai/quote
   ```

3. **Verify Quote File:**
   ```bash
   cat apps/web/data/quotes.json | jq '.quotes | length'
   # Should output: 30
   ```

### Post-Deployment

1. **Monitor Reflection Generation:**
   - Check logs for successful generations
   - Verify reflections stored in DB

2. **Test Quote Caching:**
   - Call quote endpoint multiple times
   - Verify cache hit on subsequent calls

3. **User Feedback:**
   - Monitor tone reception
   - Adjust templates based on sentiment

---

## 🎯 Success Metrics

**Engagement:**
- Reflection views per user per week
- Quote banner click-through rate
- Return visits after reflection notification

**Retention:**
- 7-day retention increase
- 30-day retention increase
- Streak continuation rate

**Sentiment:**
- User feedback on reflection tone
- Emoji reactions to reflections
- Social shares of quotes

---

## 🔮 Future Enhancements (v0.20+)

1. **Social Sharing:**
   - Share reflections with friends
   - Public reflection feed
   - React to others' milestones

2. **Advanced AI:**
   - GPT-4 integration for richer content
   - Multi-language support
   - Voice tone preferences

3. **Reflection Types:**
   - Goal-based reflections
   - Comparative reflections (vs. friends)
   - Achievement unlocked reflections

4. **Interactive Elements:**
   - Users can "talk back" to reflections
   - Ask follow-up questions
   - Set goals based on reflections

5. **Notification System:**
   - Daily reflection push notifications
   - Weekly summary emails
   - Milestone celebration alerts

---

## 🎉 Summary

✅ **Implemented:**
- UserReflection & UserWeeklyStats models
- AI reflection generation with 4 types
- 30 curated quotes with daily rotation
- 3 API endpoints (reflection, latest, quote)
- Comparison stats calculation
- Friendly, witty tone system

✅ **Code Quality:**
- Template-based generation (no external API dependency)
- Sentiment detection
- Caching for performance
- Error handling throughout

✅ **User Experience:**
- Personalized with user names
- Contextual based on performance
- Encouraging but honest
- Emotionally engaging tone

---

**Status:** Backend complete. UI integration ready for implementation.

The foundation is solid for making PareL feel like a companion, not just a tool. Users will feel *seen* and *understood* through personalized reflections. 🦁✨

