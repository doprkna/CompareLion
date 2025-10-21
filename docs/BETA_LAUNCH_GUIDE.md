# PareL Beta Launch & Referral System Guide (v0.11.8)

## Overview

Invite-only beta system with viral referral mechanics and rewards.

---

## Beta System

### Invite Codes

**Format:** `PAREL-XXXX-XXXX`

**Example:** `PAREL-A3F2-B7E1`

**Features:**
- Unique code per invite
- Configurable max uses (default: 1)
- Optional expiration date
- UTM tracking support
- Source tracking (admin, referral, partner)

### Beta Waves

**Wave System:**

```
Wave 1: Alpha testers (50 users)
Wave 2: Early adopters (200 users)
Wave 3: Beta testers (500 users)
Wave 4: General beta (unlimited)
```

**Tracking:**
- Each user assigned to wave
- Wave-based features (future)
- Wave analytics

---

## Referral Mechanics

### Rewards

**Referrer Rewards (per accepted invite):**
- +50 XP
- +1 Diamond 💎

**Referred User Rewards (on signup):**
- +10 XP (welcome bonus)
- Starter pack (3 basic items)

### Referral Flow

```
1. User A generates invite code
   ↓
2. User A shares link
   https://parel.app/signup?invite=PAREL-XXX&utm_source=referral
   ↓
3. User B clicks link
   ↓
4. User B signs up with code
   ↓
5. Referral created (pending)
   ↓
6. User B completes onboarding
   ↓
7. Referral marked active
   ↓
8. User A receives rewards
   (+50 XP, +1 Diamond)
```

### Invite Generation

**User Invites:**

```typescript
POST /api/invite
{
  "action": "generate",
  "utmSource": "twitter",
  "utmMedium": "social",
  "utmCampaign": "beta_launch"
}

Response:
{
  "invite": {
    "code": "PAREL-A3F2-B7E1",
    "maxUses": 1,
    "expiresAt": null
  },
  "shareLink": "https://parel.app/signup?invite=PAREL-A3F2-B7E1&utm_source=twitter..."
}
```

**Admin Batch Invites:**

```typescript
// Generate 100 invite codes
for (let i = 0; i < 100; i++) {
  await createBetaInvite(adminUserId, {
    maxUses: 1,
    source: "admin",
    utmCampaign: "wave_2_launch",
  });
}
```

### Invite Redemption

**Signup Flow:**

```typescript
POST /api/invite
{
  "action": "redeem",
  "code": "PAREL-A3F2-B7E1"
}

Response:
{
  "success": true,
  "result": {
    "betaUser": { ... },
    "referral": { ... }
  }
}
```

**Validation:**
- Code exists
- Code is active
- Not expired
- Not exceeded max uses
- User not already in beta

---

## Referral Statistics

### User Stats

**GET** `/api/referrals`

```json
{
  "stats": {
    "totalReferrals": 12,
    "activeReferrals": 10,
    "pendingReferrals": 2,
    "totalXpEarned": 500,
    "totalDiamondsEarned": 10
  }
}
```

### Leaderboard

**GET** `/api/referrals?action=leaderboard&limit=10`

```json
{
  "leaderboard": [
    {
      "id": "user1",
      "name": "Top Referrer",
      "referralsAccepted": 25
    },
    {
      "id": "user2",
      "name": "Second Place",
      "referralsAccepted": 18
    }
  ]
}
```

---

## Landing Page Features (Placeholder)

### Beta Counter

**Component:** (placeholder)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getBetaUserCount } from '@/lib/beta/invite-system';

export default function BetaCounter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    getBetaUserCount().then(setCount);
  }, []);
  
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold">{count.toLocaleString()}</h2>
      <p className="text-text-muted">Beta Testers</p>
    </div>
  );
}
```

**Visual:**

```
┌─────────────────────────────┐
│   🎮 Join the Beta          │
│                             │
│   [    1,234    ]           │
│   Beta Testers              │
│                             │
│   [Enter Invite Code]       │
│   [Join Beta]               │
└─────────────────────────────┘
```

### Share Link Generator

**Component:** (placeholder)

```tsx
import { generateShareLink } from '@/lib/beta/invite-system';

export default function ShareLinkGenerator({ code }: { code: string }) {
  const links = {
    twitter: generateShareLink(code, "twitter", "social"),
    facebook: generateShareLink(code, "facebook", "social"),
    reddit: generateShareLink(code, "reddit", "social"),
    direct: generateShareLink(code, "direct", "link"),
  };
  
  return (
    <div>
      <h3>Share Your Invite</h3>
      
      <button onClick={() => share(links.twitter)}>
        🐦 Share on Twitter
      </button>
      
      <button onClick={() => copy(links.direct)}>
        🔗 Copy Link
      </button>
      
      <input value={links.direct} readOnly />
    </div>
  );
}
```

### Invite Leaderboard

**Component:** (placeholder)

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function InviteLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  
  useEffect(() => {
    fetch('/api/referrals?action=leaderboard&limit=10')
      .then(r => r.json())
      .then(data => setLeaders(data.leaderboard));
  }, []);
  
  return (
    <div>
      <h2>Top Referrers 🏆</h2>
      
      <ol>
        {leaders.map((user, i) => (
          <li key={user.id}>
            {i + 1}. {user.name} - {user.referralsAccepted} referrals
          </li>
        ))}
      </ol>
    </div>
  );
}
```

**Visual:**

```
┌─────────────────────────────┐
│   Top Referrers 🏆          │
├─────────────────────────────┤
│   1. Alice    25 referrals  │
│   2. Bob      18 referrals  │
│   3. Carol    15 referrals  │
│   4. Dave     12 referrals  │
│   5. Eve      10 referrals  │
└─────────────────────────────┘
```

---

## Welcome Email Worker (Placeholder)

### Email Template

**Subject:** Welcome to PareL Beta! 🎮

**Body:**

```
Hi [Name],

Welcome to PareL - Your Gamified Learning Adventure! 🎉

You've joined [X] other beta testers in shaping the future of learning.

🎯 Your Beta Benefits:
✓ Early access to all features
✓ +50 XP welcome bonus
✓ 3 free starter items
✓ Exclusive beta badge

🚀 Get Started:
1. Complete your profile
2. Answer your first question (+10 XP)
3. Send a challenge to a friend (+30 XP)

💎 Invite Friends:
Share your invite code and earn rewards!
Code: [INVITE_CODE]
Share: [SHARE_LINK]

Rewards: +50 XP + 1 Diamond per accepted invite

Questions? Reply to this email or visit /help

Happy learning!
The PareL Team
```

### Worker Implementation (Placeholder)

```typescript
// lib/workers/welcome-mail.ts
import { sendEmail } from '@/lib/email';

export async function sendWelcomeEmail(userId: string, inviteCode: string) {
  console.log('[WelcomeMail] PLACEHOLDER: Would send welcome email', {
    userId,
    inviteCode,
  });
  
  // PLACEHOLDER: Would execute
  // const user = await prisma.user.findUnique({ where: { id: userId } });
  // 
  // await sendEmail({
  //   to: user.email,
  //   subject: "Welcome to PareL Beta! 🎮",
  //   template: "welcome",
  //   data: {
  //     name: user.name,
  //     inviteCode,
  //     shareLink: generateShareLink(inviteCode),
  //   },
  // });
}
```

---

## UTM Tracking

### Parameters

```
utm_source:   Where link was shared (twitter, facebook, email)
utm_medium:   Type of link (social, email, partner)
utm_campaign: Campaign name (beta_launch, wave_2, etc.)
```

### Share Links

```typescript
// Twitter
https://parel.app/signup?invite=PAREL-XXX&utm_source=twitter&utm_medium=social&utm_campaign=beta_launch

// Email
https://parel.app/signup?invite=PAREL-XXX&utm_source=email&utm_medium=email&utm_campaign=beta_launch

// Direct
https://parel.app/signup?invite=PAREL-XXX&utm_source=direct&utm_medium=link
```

### Analytics

Track conversion by source:

```typescript
// Query by UTM
const invites = await prisma.betaInvite.findMany({
  where: {
    utmSource: "twitter",
    usedCount: { gt: 0 },
  },
});

// Conversion rate by source
const twitterConversion = (invites.length / totalTwitterInvites) * 100;
```

---

## Database Models

### BetaInvite

```prisma
model BetaInvite {
  id          String
  code        String   @unique  // PAREL-XXXX-XXXX
  creatorId   String?
  maxUses     Int      @default(1)
  usedCount   Int      @default(0)
  rewardsGranted Boolean
  isActive    Boolean  @default(true)
  expiresAt   DateTime?
  source      String?  // "admin", "referral", "partner"
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  createdAt   DateTime
}
```

### Referral

```prisma
model Referral {
  id          String
  referrerId  String  // Who sent invite
  referredId  String  // Who accepted (unique)
  inviteId    String
  xpRewarded  Int     @default(50)
  diamondsRewarded Int @default(1)
  rewardsGranted Boolean
  status      String  @default("pending")
  createdAt   DateTime
  rewardedAt  DateTime?
}
```

### BetaUser

```prisma
model BetaUser {
  id          String
  userId      String   @unique
  inviteCode  String?
  wave        Int?
  firstLoginAt    DateTime?
  onboardingComplete Boolean
  referralsSent     Int @default(0)
  referralsAccepted Int @default(0)
  joinedAt    DateTime
}
```

---

## API Reference

### POST /api/invite

**Generate Invite:**

```json
{
  "action": "generate",
  "utmSource": "twitter",
  "utmMedium": "social"
}

Response:
{
  "invite": { "code": "PAREL-XXX" },
  "shareLink": "https://parel.app/signup?invite=PAREL-XXX&..."
}
```

**Redeem Invite:**

```json
{
  "action": "redeem",
  "code": "PAREL-XXX"
}

Response:
{
  "success": true,
  "result": { ... }
}
```

### GET /api/referrals

**User Stats:**

```json
GET /api/referrals

Response:
{
  "stats": {
    "totalReferrals": 12,
    "activeReferrals": 10,
    "totalXpEarned": 500,
    "totalDiamondsEarned": 10
  }
}
```

**Leaderboard:**

```json
GET /api/referrals?action=leaderboard&limit=10

Response:
{
  "leaderboard": [
    { "name": "Alice", "referralsAccepted": 25 },
    { "name": "Bob", "referralsAccepted": 18 }
  ]
}
```

---

## Planned Features

### Landing Page

- Beta user counter (live)
- Invite code input
- Share link generator
- Top referrers leaderboard
- Beta wave progress

### User Dashboard

- My invite codes
- Referral stats
- Share links (Twitter, Facebook, Email)
- Rewards earned
- Leaderboard rank

### Admin Panel

- Generate batch invites
- View all invites
- Referral analytics
- UTM conversion tracking
- Wave management

### Email System

- Welcome email (auto-sent)
- Invite accepted notification
- Reward granted notification
- Milestone emails (10, 25, 50 referrals)

---

## Best Practices

### Invite Distribution

```typescript
// ✅ Good: Controlled rollout
// Wave 1: Hand-pick 50 users
// Wave 2: Give Wave 1 users 5 invites each
// Wave 3: Open to referrals

// ❌ Bad: Unlimited invites from day 1
```

### Reward Balance

```typescript
// ✅ Good: Meaningful but not excessive
+50 XP (half a level)
+1 Diamond (premium currency)

// ❌ Bad: Too generous
+1000 XP (instant level 10)
+100 Diamonds (game-breaking)
```

### Spam Prevention

```typescript
// ✅ Good: Validation
- Max uses per code
- Cooldown between generates
- Verification required

// ❌ Bad: No limits
- Unlimited invites
- Instant rewards
- No verification
```

---

## Integration Points

### Signup Flow

```typescript
// app/signup/page.tsx
const searchParams = useSearchParams();
const inviteCode = searchParams.get('invite');

if (inviteCode) {
  // Pre-fill invite code
  // Show referrer name (optional)
  // Highlight benefits
}
```

### Onboarding

```typescript
// After onboarding complete
if (user.betaUser?.inviteCode) {
  // Activate referral
  // Grant rewards to referrer
  // Send notification
}
```

### Profile

```typescript
// Display referral stats
<div>
  <h3>Referrals</h3>
  <p>Total: {stats.totalReferrals}</p>
  <p>Rewards: {stats.totalXpEarned} XP, {stats.totalDiamondsEarned} 💎</p>
  
  <button>Generate Invite Code</button>
  <button>Share on Twitter</button>
</div>
```

---

## Analytics

### Metrics to Track

**Conversion:**
- Invite generation rate
- Invite redemption rate
- Conversion by UTM source
- Time to first referral

**Engagement:**
- Referrals per user (average)
- Active vs inactive referrals
- Onboarding completion rate
- First-week retention

**Viral Coefficient:**

```
k = (invites sent) × (conversion rate)

k > 1: Viral growth ✅
k = 1: Sustained growth
k < 1: Needs improvement
```

**Example:**

```
Average invites per user: 3
Conversion rate: 40%

k = 3 × 0.4 = 1.2 ✅ (Viral!)
```

---

## Privacy & Compliance

### Data Stored

```json
{
  "inviteCode": "PAREL-XXX",
  "creatorId": "user123",
  "referredId": "user456",
  "utmSource": "twitter",
  "status": "active"
}
```

**No Personal Data in Invite:**
- ❌ Email addresses
- ❌ Real names
- ❌ IP addresses
- ✅ Anonymous user IDs only

### GDPR Compliance

- User can export referral data
- User can delete unused invites
- Anonymized analytics only
- Clear terms of service

---

## Troubleshooting

### Invalid Invite Code

**Check:**
- Code format (PAREL-XXXX-XXXX)
- Code is active
- Not expired
- Not max uses

**Fix:**
```typescript
const invite = await prisma.betaInvite.findUnique({
  where: { code },
});

if (!invite || !invite.isActive) {
  return { error: "Invalid invite code" };
}
```

### Rewards Not Granted

**Check:**
- Referral status (should be "active")
- rewardsGranted flag
- User XP/diamonds updated

**Fix:**
```typescript
await grantReferralRewards(referralId);
```

---

**Last Updated:** v0.11.8 (2025-10-13)










