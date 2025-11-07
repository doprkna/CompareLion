# 🚀 Community Features - Quick Access Guide
**Version:** v0.13.2n

## 🎮 User-Facing Features

### Main Navigation → "Community" Dropdown
1. **Leaderboard** (`/leaderboard`)
   - Global rankings by XP
   - Friends-only rankings
   - Weekly rankings
   - Share your rank button

2. **Challenges** (`/challenges`)
   - 3 daily challenges (rotate daily)
   - 2 weekly challenges (rotate Monday)
   - Progress tracking with rewards
   - Confetti on completion!

3. **Invite Friends** (`/invite`)
   - Your unique invite code
   - One-click share to social media
   - Track referrals (localStorage)
   - Earn 150 XP + 100 💎 per referral

---

## 👨‍💼 Admin Features

### Admin Dropdown → New Items
1. **Growth Metrics** (`/admin/metrics`)
   - 📢 Share clicks count
   - 👥 Invites generated count
   - 🎯 Challenges completed count
   - Real-time event tracking

2. **Leaderboard** (review mode)
3. **Challenges** (review mode)
4. **Invite System** (review mode)

---

## 🔗 API Endpoints

```
GET  /api/leaderboard?type=global|friends|weekly
GET  /api/challenges
GET  /api/invite
POST /api/invite
GET  /api/share?xp=X&level=Y&streak=Z&name=Name
```

---

## 📊 Tracking Events

New metrics being tracked:
- `share_clicked` - Social shares
- `invite_generated` - Invite codes used
- `challenge_completed` - Challenges finished

View in `/admin/metrics`

---

## 🧪 Quick Test

1. Login as user
2. Click "Community" → "Challenges"
3. (Dev mode) Click "Test Progress +1" buttons
4. Watch confetti when complete! 🎉
5. Click "Community" → "Leaderboard"
6. Click "Share My Rank"
7. Check `/admin/metrics` for event counts

---

**All features live and ready for testing!** ✅

