# PareL Retention & Engagement Systems Guide (v0.11.9)

## Overview

Comprehensive retention systems to maintain long-term engagement through streaks, rewards, feedback, and dopamine loops.

---

## Streak System

### Streak Types

**3 Streak Categories:**

```
Login Streak:     Consecutive daily logins
Quiz Streak:      Consecutive daily quizzes
Duel Streak:      Consecutive daily duels
```

### Streak Tracking

**UserStreak Model:**

```prisma
model UserStreak {
  currentStreak:  Int      // Current consecutive days
  longestStreak:  Int      // All-time record
  loginStreak:    Int      // Login streak
  quizStreak:     Int      // Quiz streak
  duelStreak:     Int      // Duel streak
  lastLoginAt:    DateTime
  totalDaysActive: Int     // Total days (not consecutive)
}
```

### Streak Rewards

**Milestone Rewards:**

```
7 days:   +50 XP
14 days:  +100 XP + 1 Diamond
30 days:  +200 XP + 3 Diamonds + "Dedicated" badge
100 days: +500 XP + 10 Diamonds + "Legend" badge
365 days: +1000 XP + 50 Diamonds + "Immortal" badge
```

### Streak UI (Placeholder)

**Streak Flame Icon:**

```tsx
┌─────────────────┐
│   🔥 15 Days    │
│   Keep it up!   │
│   Next: +50 XP  │
└─────────────────┘
```

**Streak Widget:**

```tsx
Streaks:
├─ 🔥 Login:  15 days
├─ 📝 Quiz:   12 days
└─ ⚔️ Duel:   8 days

Longest: 23 days 🏆
```

---

## Reward Calendar

### Calendar Types

**7-Day Calendar:**

```
Day 1: +25 XP
Day 2: +50 Gold
Day 3: +50 XP
Day 4: +1 Diamond 💎
Day 5: +75 XP
Day 6: +100 Gold
Day 7: +2 Diamonds 💎
```

**30-Day Calendar:**

```
Day 1:  +25 XP
Day 3:  +50 Gold
Day 5:  +50 XP
Day 7:  +1 Diamond
Day 10: +100 XP
Day 14: +2 Diamonds
Day 21: +150 XP
Day 28: +200 Gold
Day 30: +5 Diamonds 💎
```

### Calendar UI (Placeholder)

**Visual:**

```
┌─────────────────────────────────────┐
│   7-Day Reward Calendar             │
├─────────────────────────────────────┤
│  ┌───┬───┬───┬───┬───┬───┬───┐    │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │    │
│  ├───┼───┼───┼───┼───┼───┼───┤    │
│  │✅│✅│ 🎁│ 💎│   │   │   │    │
│  │25 │50g│50 │1d │75 │100│2d │    │
│  │XP │   │XP │   │XP │g  │   │    │
│  └───┴───┴───┴───┴───┴───┴───┘    │
│                                     │
│  Day 3: Claim 50 XP! [Claim]       │
└─────────────────────────────────────┘
```

### Claiming Rewards

```typescript
import { claimDailyReward } from "@/lib/retention/reward-calendar";

await claimDailyReward(userId, "7day", 3);
// Grants 50 XP to user
```

---

## Return Bonus

### Inactivity Tiers

**Bonus Based on Absence:**

```
2 days:   +50 XP + 25 Gold
3-6 days: +100 XP + 50 Gold + 1 Diamond
7+ days:  +200 XP + 100 Gold + 2 Diamonds
```

### Return Flow

```
User inactive 48+ hours
    ↓
System creates ReturnBonus
    ↓
User logs back in
    ↓
"Welcome back!" modal
    ↓
Claim bonus
    ↓
Rewards granted
```

### Return Bonus UI (Placeholder)

**Modal:**

```
┌─────────────────────────────┐
│   Welcome Back! 🎉          │
├─────────────────────────────┤
│   We missed you!            │
│                             │
│   You've been gone for:     │
│   3 days                    │
│                             │
│   Your return bonus:        │
│   +100 XP                   │
│   +50 Gold                  │
│   +1 Diamond 💎             │
│                             │
│   [Claim Bonus]             │
└─────────────────────────────┘
```

**Validity:** 7 days (expires if not claimed)

---

## Mood Feedback

### Mood Emojis

**5 Mood Options:**

```
🤩 Excited  (5/5) - Sentiment: +1.0
😊 Happy    (4/5) - Sentiment: +0.5
😐 Neutral  (3/5) - Sentiment: 0.0
😞 Sad      (2/5) - Sentiment: -0.5
😡 Angry    (1/5) - Sentiment: -1.0
```

### Feedback Contexts

```
quiz:      After completing quiz
challenge: After challenge
flow:      After flow completion
session:   End of session
```

### Mood Tracker UI (Placeholder)

**Quick Feedback:**

```
┌─────────────────────────────┐
│   How was your session?     │
├─────────────────────────────┤
│   🤩  😊  😐  😞  😡        │
│                             │
│   Optional comment:         │
│   [Text area]               │
│                             │
│   [Skip]  [Submit]          │
└─────────────────────────────┘
```

**Mood Trends:**

```
Your Mood This Week:
┌─────────────────────────────┐
│   🤩 ████░░░░░░  40%        │
│   😊 ████████░░  80%        │
│   😐 ██░░░░░░░░  20%        │
│   😞 ░░░░░░░░░░   0%        │
│   😡 ░░░░░░░░░░   0%        │
└─────────────────────────────┘

Average: 4.2/5 😊
```

### AI Mentor Integration

**Mood Insights:**

```
"I notice you've been feeling neutral after quizzes.
Try shorter sessions or different topics!"

"Your mood peaks during challenges! 
Consider sending more duels."

"You seem happiest on weekends.
Want to adjust your quest difficulty?"
```

---

## Daily Summary

### Summary Contents

**Generated daily (previous day):**

```
Activity:
├─ Questions answered: 12
├─ Challenges sent: 3
├─ Challenges received: 5
└─ XP earned: 145

Engagement:
├─ Sessions: 2
├─ Total time: 45 minutes
└─ Average mood: 4.2/5 😊

Achievements:
└─ "Quiz Master" unlocked! 🏆
```

### Summary Modal (Placeholder)

**Visual:**

```
┌─────────────────────────────────────┐
│   Yesterday's Adventure 🌟          │
├─────────────────────────────────────┤
│                                     │
│   📊 Activity                        │
│   ├─ 12 Questions answered          │
│   ├─ 3 Challenges sent              │
│   └─ 145 XP earned                  │
│                                     │
│   ⏱️ Engagement                     │
│   ├─ 2 Sessions                     │
│   ├─ 45 minutes                     │
│   └─ Average mood: 4.2/5 😊         │
│                                     │
│   🏆 Achievements                    │
│   └─ "Quiz Master" unlocked!        │
│                                     │
│   [Continue Adventure]              │
└─────────────────────────────────────┘
```

**Trigger:** First login of the day (if unviewed summary exists)

---

## Notification System

### Re-engagement Triggers

**Unfinished Challenges:**

```
Notification after 24h:
"You have 2 pending challenges!
Don't let them expire 🔥"
```

**Broken Streak:**

```
Notification after missed day:
"Your 15-day streak is at risk! 🔥
Login today to keep it alive!"
```

**Unclaimed Rewards:**

```
Notification:
"You have unclaimed rewards!
Don't miss out on 2 Diamonds 💎"
```

**Return Bonus:**

```
Notification after 48h inactive:
"We miss you! 🎉
Claim your +100 XP return bonus"
```

---

## APIs (Placeholder)

### Streaks API

**GET** `/api/streaks`

```json
{
  "currentStreak": 15,
  "longestStreak": 23,
  "streaks": {
    "login": 15,
    "quiz": 12,
    "duel": 8
  },
  "nextMilestone": {
    "days": 30,
    "reward": "+200 XP + 3 Diamonds"
  }
}
```

**POST** `/api/streaks`

```json
{
  "action": "update",
  "type": "login"
}

Response:
{
  "success": true,
  "newStreak": 16,
  "reward": null
}
```

### Mood Feedback API

**POST** `/api/feedback/mood`

```json
{
  "emoji": "😊",
  "context": "quiz",
  "comment": "Great questions today!"
}

Response:
{
  "success": true,
  "trends": {
    "avgSentiment": 0.6,
    "totalFeedback": 25
  }
}
```

**GET** `/api/feedback/mood?days=7`

```json
{
  "trends": {
    "avgSentiment": 0.6,
    "distribution": {
      "excited": 10,
      "happy": 12,
      "neutral": 3,
      "sad": 0,
      "angry": 0
    }
  }
}
```

---

## Retention Mechanics

### Daily Login Rewards

```
Login → Check streak → Update streak → Milestone reward?
```

### Reward Calendar

```
Login → Check calendar → Day X available? → Claim → Grant reward
```

### Return Bonus

```
Inactive 48h+ → Create bonus → User returns → Show modal → Claim → Grant
```

### Mood Feedback

```
Session end → Mood prompt → Record feedback → Update summary → AI analysis
```

### Daily Summary

```
End of day → Aggregate activity → Generate summary → Show on next login
```

---

## Scheduled Jobs

### Daily Streak Reset

**Schedule:** Daily at midnight

```bash
# Cron
0 0 * * * node -e "require('./lib/retention/streak-system').checkStreaks()"
```

**Process:**
- Check all users' last activity
- Reset broken streaks
- Send streak warning notifications

### Daily Summary Generation

**Schedule:** Daily at 1 AM

```bash
# Cron
0 1 * * * node -e "require('./lib/retention/daily-summary').generateAllSummaries()"
```

### Return Bonus Check

**Schedule:** Every 6 hours

```bash
# Cron
0 */6 * * * node -e "require('./lib/retention/return-bonus').checkAndGrantReturnBonuses()"
```

---

## Engagement Metrics

### Retention KPIs

**Track:**

```
D1 Retention:  Day 1 return rate
D7 Retention:  Day 7 return rate
D30 Retention: Day 30 return rate

Avg Session Length
Sessions per user per day
Streak completion rate
Calendar completion rate
Mood score trend
```

### Cohort Analysis

**Example:**

```
Wave 1 Users (50):
├─ D1:  90% (45/50)
├─ D7:  70% (35/50)
└─ D30: 50% (25/50)

Wave 2 Users (200):
├─ D1:  85% (170/200)
├─ D7:  65% (130/200)
└─ D30: 45% (90/200)
```

---

## Best Practices

### Streak Design

```typescript
// ✅ Good: Forgiving grace period
If user misses by < 6 hours → keep streak

// ✅ Good: Multiple streak types
Login, quiz, duel → cater to different play styles

// ❌ Bad: Punitive
Lost 100-day streak → demotivating
```

### Reward Balance

```typescript
// ✅ Good: Escalating rewards
Day 1:  +25 XP
Day 7:  +2 Diamonds
Day 30: +5 Diamonds

// ❌ Bad: Front-loaded
Day 1:  +100 XP + 10 Diamonds
Day 30: +25 XP
```

### Feedback Frequency

```typescript
// ✅ Good: Key moments only
- End of session
- After quiz
- Major milestone

// ❌ Bad: Every action
- After each question
- After each click
```

---

## UI Components (Placeholder)

### Streak Flame Widget

```tsx
'use client';

export default function StreakFlame() {
  const streak = 15; // PLACEHOLDER
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="font-bold">{streak} Days</div>
        <div className="text-xs text-text-muted">Keep it up!</div>
      </div>
    </div>
  );
}
```

### Daily Summary Modal

```tsx
'use client';

export default function DailySummaryModal() {
  // PLACEHOLDER
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-bg-elevated p-lg rounded-lg max-w-md">
        <h2 className="text-2xl font-bold mb-md">Yesterday's Adventure 🌟</h2>
        
        <div className="space-y-sm">
          <div>
            <h3 className="font-semibold">📊 Activity</h3>
            <ul className="text-text-secondary">
              <li>12 Questions answered</li>
              <li>3 Challenges sent</li>
              <li>145 XP earned</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">😊 Mood</h3>
            <p>Average: 4.2/5</p>
          </div>
        </div>
        
        <button className="mt-md w-full bg-primary text-primary-foreground py-sm rounded-base">
          Continue Adventure
        </button>
      </div>
    </div>
  );
}
```

### Mood Feedback Widget

```tsx
'use client';

export default function MoodFeedback({ context }: { context: string }) {
  const moods = ['🤩', '😊', '😐', '😞', '😡'];
  
  return (
    <div className="text-center">
      <p className="mb-sm">How was your {context}?</p>
      
      <div className="flex justify-center gap-md">
        {moods.map(emoji => (
          <button
            key={emoji}
            className="text-3xl hover:scale-125 transition-transform"
            onClick={() => submitMood(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      <button className="mt-sm text-text-muted text-sm">
        Skip
      </button>
    </div>
  );
}
```

### Reward Calendar Widget

```tsx
'use client';

export default function RewardCalendar({ type }: { type: "7day" | "30day" }) {
  const days = type === "7day" ? 7 : 30;
  const currentDay = 3; // PLACEHOLDER
  
  return (
    <div>
      <h3>{type === "7day" ? "7" : "30"}-Day Reward Calendar</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: days }, (_, i) => (
          <div
            key={i}
            className={`
              p-2 rounded text-center
              ${i + 1 < currentDay ? "bg-success/20" : ""}
              ${i + 1 === currentDay ? "bg-primary" : ""}
            `}
          >
            <div className="font-bold">{i + 1}</div>
            <div className="text-xs">
              {i + 1 < currentDay && "✅"}
              {i + 1 === currentDay && "🎁"}
            </div>
          </div>
        ))}
      </div>
      
      {currentDay <= days && (
        <button className="mt-md w-full bg-primary">
          Claim Day {currentDay} Reward
        </button>
      )}
    </div>
  );
}
```

---

## Retention Strategies

### Daily Habits

**Encourage:**
- Daily login (streak flame)
- Daily quiz (calendar reward)
- Daily challenge (streak + XP)

**Rewards:**
- Immediate (XP, gold)
- Short-term (7-day calendar)
- Long-term (30-day calendar, streaks)

### Re-engagement

**Triggers:**
- 24h: Unfinished challenges notification
- 48h: Return bonus created
- 72h: "We miss you" email
- 7d: Special comeback offer

### Dopamine Loops

**Micro (seconds to minutes):**
- XP popup on answer
- Level up animation
- Achievement unlock

**Daily (hours to day):**
- Streak flame update
- Calendar reward claim
- Daily summary modal

**Weekly (days to week):**
- 7-day calendar complete
- Streak milestone (7, 14 days)
- Leaderboard rank update

**Monthly (weeks to month):**
- 30-day calendar complete
- Archetype evolution
- Season rewards

---

## Database Models

### UserStreak

```prisma
- currentStreak: Int
- longestStreak: Int
- loginStreak: Int
- quizStreak: Int
- duelStreak: Int
- lastLoginAt: DateTime
- totalDaysActive: Int
```

### RewardCalendar

```prisma
- userId: String
- calendarType: "7day" | "30day"
- day: Int (1-30)
- rewardType: "xp" | "gold" | "diamond"
- rewardAmount: Int
- claimed: Boolean
- cycleStart: DateTime
```

### ReturnBonus

```prisma
- userId: String
- inactiveDays: Int
- xpBonus: Int
- goldBonus: Int
- diamondBonus: Int
- granted: Boolean
- expiresAt: DateTime
```

### FeedbackMood

```prisma
- userId: String
- emoji: String
- rating: Int (1-5)
- sentiment: Float (-1.0 to 1.0)
- context: "quiz" | "challenge" | "flow"
- comment: String?
- analyzed: Boolean
```

### DailySummary

```prisma
- userId: String
- date: Date
- questionsAnswered: Int
- challengesSent: Int
- xpEarned: Int
- sessionCount: Int
- totalSessionTime: Int
- averageMood: Float?
- viewed: Boolean
```

---

## Engagement Loops

### Daily Loop

```
Morning:
├─ Login (+streak)
├─ Daily summary modal
├─ Claim calendar reward
└─ Start quest

Midday:
├─ Answer questions (+XP)
├─ Send challenge
└─ Mood feedback

Evening:
├─ Check streak
├─ Claim rewards
└─ Session summary
```

### Weekly Loop

```
Monday:
├─ New 7-day calendar starts
└─ Weekly quest reset

Daily:
├─ Maintain streaks
├─ Claim calendar rewards
└─ Track mood

Sunday:
├─ Complete 7-day calendar
├─ Claim final reward (2 Diamonds)
└─ New cycle begins
```

---

**Last Updated:** v0.11.9 (2025-10-13)










