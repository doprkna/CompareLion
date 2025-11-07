# 🎉 PareL Public Beta Release Notes
**Version:** v0.13.2p  
**Release Date:** October 22, 2025  
**Status:** PUBLIC BETA

---

## 🌟 Welcome to PareL!

PareL is a **social, gamified platform** where you answer questions, compare yourself with others, and discover insights about yourself through fun polling and community engagement. Think Habitica meets TikTok polls with RPG flavor!

This public beta release marks our first step toward building a vibrant community of self-discoverers and question enthusiasts.

---

## ✨ What's Included

### 🎮 Core Features

#### **Flow System** - Question Answering
- Curated question flows across multiple categories
- Skip, go back, and save progress
- Visual progress tracking
- Smart branching based on your answers
- Personalized insights

#### **Profile & Progress**
- Customizable user profiles
- XP and leveling system
- Streak tracking (maintain daily activity)
- Session history and statistics
- Achievement badges

#### **Social Features**
- Friends system - connect with others
- Messaging between friends
- Compare answers and insights
- See how you stack up globally

#### **Community Growth** (NEW in v0.13.2n)
- **Leaderboards** 🏆
  - Global rankings by XP
  - Friends-only leaderboard
  - Weekly performance tracking
  - Share your rank on social media

- **Daily & Weekly Challenges** 🎯
  - Rotating challenges with XP rewards
  - Progress tracking with visual bars
  - Confetti celebrations on completion
  - Diamond bonuses

- **Invite System** 👥
  - Unique referral codes
  - Share via social media (Twitter, Facebook, WhatsApp)
  - Earn rewards for successful referrals
  - Track your invite count

#### **Groups & Totems**
- Create or join themed groups ("totems")
- Group leaderboards and stats
- Collective progress tracking
- Group emblems and identity

---

## 🎨 User Experience

### Beautiful, Responsive Design
- Clean, modern interface
- Mobile-friendly layouts
- Dark/light theme support
- Smooth animations and transitions
- Accessibility-first approach

### Gamification Elements
- XP and leveling (visible in navigation bar)
- Streak flames 🔥
- Progress bars everywhere
- Confetti rewards
- Rank medals 🥇🥈🥉

---

## 🔐 Authentication

Multiple sign-in options:
- **Email + Password** (secure argon2id hashing)
- **Magic Links** (passwordless email login)
- **Google OAuth**
- Social logins (Facebook, Twitter) ready for activation

Session persistence across devices and page refreshes.

---

## 📊 For Beta Testers

### What We Need From You

#### 1. **Explore & Play**
- Answer at least 10 questions
- Try different categories
- Complete a daily challenge
- Join or create a totem

#### 2. **Test Social Features**
- Add a friend
- Check the leaderboard
- Share your rank
- Use an invite code

#### 3. **Provide Feedback**
- Use the feedback button (bottom right)
- Report bugs via `/feedback` page
- Suggest features or improvements
- Rate your experience (1-5 stars)

#### 4. **Monitor Performance**
- Note any slow pages (<1s expected)
- Report any errors (500, 404)
- Check mobile responsiveness
- Test across browsers (Chrome, Firefox, Safari)

### Known Limitations (Beta)

⚠️ **Experimental Features Disabled**
- Shop/Economy (coming soon)
- Guild system (level 10+ unlock planned)
- Advanced crafting/duels (future release)
- Creator mode (Q1 2026)

⚠️ **Data Considerations**
- Challenge progress stored locally (may reset on browser clear)
- Referral tracking is mock (not linked to actual signups yet)
- Some analytics still in development

⚠️ **Scale Limitations**
- Leaderboards capped at top 100
- Groups limited to 50 members
- Message history last 100 messages

---

## 🐛 Reporting Issues

### Bug Reports
Please include:
1. **What happened** (describe the issue)
2. **What you expected** (intended behavior)
3. **Steps to reproduce** (how to trigger it)
4. **Browser/device** (Chrome 118, iPhone 14, etc.)
5. **Screenshots** (if visual issue)

Submit via:
- `/feedback` page (in-app)
- Email: beta@parel.app
- Admin if you have access

### Feature Requests
Use the feedback form and select "Feature Request" category.

---

## 📱 Supported Platforms

### Browsers
✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
⚠️ Mobile browsers (optimized but testing ongoing)

### Devices
✅ Desktop (Windows, Mac, Linux)  
✅ Tablet (iPad, Android tablets)  
✅ Mobile (iOS 14+, Android 10+)

---

## 🚀 Getting Started

### First Time User Journey

1. **Sign Up** (`/signup`)
   - Choose your authentication method
   - Set your display name
   - Upload avatar (optional)

2. **Explore** (`/main`)
   - Check your dashboard
   - View available flows
   - See community highlights

3. **Answer Questions** (`/flow-demo`)
   - Pick a category or random flow
   - Answer honestly (no wrong answers!)
   - See comparisons with others

4. **Join Community** (`/leaderboard`)
   - Check global rankings
   - Find friends to connect with
   - Join a totem that resonates

5. **Track Progress** (`/profile`)
   - View your stats
   - Check achievements
   - Monitor streak

6. **Invite Friends** (`/invite`)
   - Get your referral code
   - Share on social media
   - Earn bonus XP

---

## 🎯 Success Metrics

We're tracking (anonymously):
- Questions answered per user
- Daily active users
- Streak maintenance rate
- Social shares
- Invite conversion
- Feature engagement

Your participation helps us improve!

---

## 🔮 What's Next

### Upcoming Features (Roadmap)
- **v0.14** - Advanced insights and AI-powered comparisons
- **v0.15** - Economy system (shop, marketplace)
- **v0.16** - Guild wars and collaborative quests
- **Q1 2026** - Creator tools (make your own flows)
- **Q2 2026** - Mobile apps (iOS/Android)

---

## 💬 Community

### Stay Connected
- **Twitter:** [@PareL_App](https://twitter.com/PareL_App)
- **Discord:** Coming soon
- **Newsletter:** Opt-in via profile settings

### Beta Tester Perks
- Early access to new features
- Exclusive beta tester badge
- Direct line to product team
- Influence roadmap priorities
- Founder-tier benefits on launch

---

## ⚙️ Technical Details

### Performance Targets
- Page load: <1s
- API response: <200ms
- Time to interactive: <2s

### Privacy & Security
- HTTPS everywhere
- Secure password hashing (argon2id)
- Session tokens in HTTP-only cookies
- No PII in logs or analytics
- GDPR-compliant data handling

### Data Backup
- Daily database backups
- 30-day retention
- Point-in-time recovery available

---

## 📞 Support

### Need Help?
- **FAQ:** `/info/faq`
- **Contact:** `/info/contact`
- **Email:** support@parel.app
- **Response time:** <24 hours (beta)

### Admin Access
If you're a beta tester with admin privileges:
- **Admin Panel:** `/admin`
- **Metrics:** `/admin/metrics`
- **User Management:** `/admin/users`
- **Logs:** `/admin/logs`

---

## 🙏 Thank You!

Thank you for being part of our public beta! Your feedback and engagement are invaluable as we build PareL into the best social self-discovery platform.

Let's compare, discover, and level up together! 🚀

---

**Version:** v0.13.2p  
**Build:** Production Beta  
**Last Updated:** October 22, 2025

_For detailed technical changelog, see `CHANGELOG.md`_

