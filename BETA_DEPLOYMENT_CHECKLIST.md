# 🚀 Beta Deployment Checklist - v0.13.2p

**Before you deploy to public beta, complete these steps:**

---

## ⚠️ PRE-DEPLOYMENT (REQUIRED)

### 1. Code Quality
```bash
# Navigate to project root
cd parel-mvp

# Install dependencies (if not already)
pnpm install

# Run linter
pnpm lint
# ✅ Expected: 0 errors, 0 warnings

# Run TypeScript check
cd apps/web
pnpm tsc --noEmit
# ✅ Expected: 0 errors
```

### 2. Build Verification
```bash
# From apps/web directory
pnpm build
# ✅ Expected: Successful build
# ✅ Expected: Build size <60 MB
# ✅ Expected: No runtime errors
```

### 3. Assets Required
Create these files manually:

- [ ] `/apps/web/public/favicon.ico` (16x16, 32x32 sizes)
- [ ] `/apps/web/public/apple-touch-icon.png` (180x180)
- [ ] `/apps/web/public/og-image.png` (1200x630 for social sharing)
- [ ] `/apps/web/public/manifest.json` (PWA manifest)

**Sample manifest.json:**
```json
{
  "name": "PareL",
  "short_name": "PareL",
  "description": "Compare, discover, and level up",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 📋 MANUAL SMOKE TESTS

### Test 1: Authentication Flow
- [ ] Visit `/signup`
- [ ] Create account with email/password
- [ ] Log out
- [ ] Log back in with same credentials
- [ ] Check session persists on page refresh

### Test 2: Core Flow
- [ ] Navigate to `/flow-demo`
- [ ] Answer at least 5 questions
- [ ] Skip a question
- [ ] Go back and change an answer
- [ ] Complete flow and see results

### Test 3: Social Features
- [ ] Visit `/leaderboard`
- [ ] Check all tabs (Global, Friends, Weekly)
- [ ] Click "Share My Rank"
- [ ] Visit `/challenges`
- [ ] View daily and weekly challenges

### Test 4: Profile & Stats
- [ ] Visit `/profile`
- [ ] Check XP and level display
- [ ] View session history
- [ ] Update profile information

### Test 5: Community
- [ ] Visit `/invite`
- [ ] Generate invite code
- [ ] Copy to clipboard (test copy function)
- [ ] Visit `/friends`
- [ ] Send a friend request

### Test 6: Feedback
- [ ] Visit `/feedback`
- [ ] Submit feedback form
- [ ] Check success message

### Test 7: Admin (if applicable)
- [ ] Login as admin
- [ ] Visit `/admin/metrics`
- [ ] Check growth metrics display
- [ ] Verify no console errors

---

## 🌐 ENVIRONMENT SETUP

### Vercel Environment Variables
Ensure these are set in Vercel dashboard:

```env
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-beta-domain.vercel.app
NEXTAUTH_SECRET=your-secret-here

# Optional but recommended
NEXT_PUBLIC_ENV=beta
ENABLE_ANALYTICS=1
NEXT_PUBLIC_APP_URL=https://your-beta-domain.vercel.app
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Commit & Push
```bash
git checkout -b beta/v0.13.2p
git add .
git commit -m "chore: v0.13.2p public beta release

- Feature freeze enforcement
- SEO and meta tags
- Analytics sanitization
- Experimental features hidden
- Documentation complete"

git push origin beta/v0.13.2p
```

### 2. Deploy on Vercel
- Visit Vercel dashboard
- Connect repository (if not already)
- Set production branch to `beta/v0.13.2p`
- Trigger deployment
- Monitor build logs

### 3. Post-Deploy Verification
Once deployed, test on live URL:

- [ ] Homepage loads (<1s)
- [ ] All static assets load (favicon, images)
- [ ] Login works
- [ ] API endpoints respond (<200ms)
- [ ] No 404s in Network tab
- [ ] No console errors

---

## 📊 PERFORMANCE CHECK

### Lighthouse Audit
```bash
# Install lighthouse (if not already)
npm install -g lighthouse

# Run audit on deployed URL
lighthouse https://your-beta-domain.vercel.app \
  --output=json \
  --output-path=./docs/lighthouse_v0.13.2p.json

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

### Manual Performance
- [ ] All pages load <1s (local network)
- [ ] API responses <200ms
- [ ] Time to Interactive <2s
- [ ] No layout shifts (CLS <0.1)

---

## 📧 BETA TESTER NOTIFICATION

### Email Template
```
Subject: 🎉 PareL Public Beta is Live!

Hey [Beta Tester Name],

We're excited to invite you to the PareL public beta!

🔗 Access: https://your-beta-domain.vercel.app
📖 Guide: https://your-beta-domain.vercel.app/PUBLIC_RELEASE_NOTES_v0.13.2p.md

What to test:
✅ Answer questions and explore flows
✅ Check out leaderboards and challenges
✅ Invite friends and track referrals
✅ Report any bugs or issues

We'd love your feedback! Use the feedback button or reply to this email.

Thank you for being part of our journey!

🦁 The PareL Team
```

---

## 📈 MONITORING (POST-LAUNCH)

### Day 1
- [ ] Check error rates (target: <1%)
- [ ] Monitor signup rate
- [ ] Review feedback submissions
- [ ] Check analytics events flowing

### Week 1
- [ ] Daily active users (target: 50+)
- [ ] Questions answered (target: 500+)
- [ ] Social shares (target: 20+)
- [ ] Invite conversions (target: 10+)

### Alerts to Set
- Error rate >5%
- API response time >1s
- Database connection failures
- Unusual traffic spikes

---

## 🛟 ROLLBACK PLAN

If critical issues arise:

### Quick Rollback
```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous stable version (v0.13.2n)
# 3. Click "Promote to Production"

# Or via CLI:
vercel rollback
```

### Criteria for Rollback
- Login failures affecting >10% users
- Database corruption or data loss
- Security vulnerability discovered
- Error rate >10%

---

## ✅ FINAL SIGN-OFF

**All items complete?**

### Code Quality
- [ ] Linter passing (0 errors)
- [ ] Build successful
- [ ] TypeScript check passing

### Assets
- [ ] Favicon uploaded
- [ ] OG image created
- [ ] Manifest added

### Testing
- [ ] All smoke tests passed
- [ ] Performance acceptable
- [ ] Mobile responsive verified

### Deployment
- [ ] Environment variables set
- [ ] Vercel deployment successful
- [ ] Live site tested

### Communication
- [ ] Beta testers notified
- [ ] Feedback channels active
- [ ] Support ready

---

**Once all checkboxes are ✅, you're ready for public beta! 🚀**

---

*For issues or questions during deployment, refer to RELEASE_v0.13.2p.md*

