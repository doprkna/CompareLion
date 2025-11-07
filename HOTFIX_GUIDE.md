# 🚨 HOTFIX DEPLOYMENT GUIDE
**Version:** 0.14.0  
**Last Updated:** 2025-10-22

---

## 🎯 Quick Reference

### Deploy Hotfix
```bash
tsx scripts/hotfix-deploy.ts "Your fix description"
```

### Rollback
```bash
tsx scripts/rollback-last.ts
```

### Check Health
```bash
curl https://parel.app/api/health/extended | jq '.status'
```

---

## 📋 When to Hotfix

### ✅ Hotfix Appropriate
- Critical bugs affecting all users
- Security vulnerabilities
- Data corruption issues
- Authentication/authorization failures
- Payment processing errors
- API downtime

### ❌ Not Hotfix Material
- Minor UI glitches
- Non-critical feature requests
- Performance optimizations (unless severe)
- Documentation updates
- Cosmetic changes

---

## 🚀 Hotfix Process

### Step 1: Identify & Fix

1. **Verify the issue**
   ```bash
   # Check error logs
   curl https://parel.app/api/errors?severity=critical | jq
   
   # Check admin dashboard
   open https://parel.app/admin/errors
   ```

2. **Create fix locally**
   ```bash
   # Create feature branch (optional but recommended)
   git checkout -b hotfix/fix-critical-auth
   
   # Make your changes
   # ... edit files ...
   
   # Test locally
   pnpm dev
   ```

3. **Verify fix works**
   - Test the specific bug scenario
   - Check related functionality
   - Review error logs for new errors

### Step 2: Run Hotfix Script

```bash
# Run automated hotfix deployment
tsx scripts/hotfix-deploy.ts "Fix critical auth token expiration bug"
```

**What it does:**
1. ✅ Checks git status
2. ✅ Bumps version (0.14.0 → 0.14.0q1)
3. ✅ Updates CHANGELOG.md
4. ✅ Runs linter
5. ✅ Builds project
6. ✅ Runs tests
7. ✅ Commits changes
8. ⏸️  **STOPS** (ready for manual push)

### Step 3: Review & Push

```bash
# Review the commit
git show

# Push to main (triggers deployment)
git push origin main
```

### Step 4: Monitor Deployment

```bash
# Watch build (Vercel)
vercel --prod

# Monitor health
watch -n 5 'curl -s https://parel.app/api/health/extended | jq ".status"'

# Check for new errors
curl https://parel.app/api/errors?limit=10 | jq '.errors[].message'
```

### Step 5: Verify & Communicate

1. **Test production**
   - Reproduce original bug scenario
   - Verify fix is live
   - Check related features

2. **Monitor for 15 minutes**
   - Watch error dashboard
   - Check Sentry alerts
   - Review health metrics

3. **Communicate**
   - Update team
   - Notify affected users (if applicable)
   - Document in team chat

---

## 🔄 Rollback Process

### When to Rollback

- New critical errors introduced
- Build failed in production
- Feature completely broken
- Database migration issues
- Performance degradation

### How to Rollback

```bash
# Run rollback script
tsx scripts/rollback-last.ts
```

**Interactive prompts:**
1. Shows last commit
2. Asks for confirmation
3. Checks if commit is pushed
4. Reverts commit
5. Optionally force pushes

**Manual Rollback:**
```bash
# Revert to previous commit
git reset --hard HEAD~1

# Force push (if already deployed)
git push origin main --force

# Or create revert commit (safer)
git revert HEAD
git push origin main
```

### Post-Rollback

1. **Verify rollback**
   ```bash
   curl https://parel.app/api/health/extended | jq
   ```

2. **Check error rate**
   ```bash
   curl 'https://parel.app/api/errors?limit=5' | jq '.errors'
   ```

3. **Communicate status**
   - Notify team of rollback
   - Document what went wrong
   - Plan proper fix

---

## 📊 Version Numbering

### Format
`MAJOR.MINOR.PATCH[SUFFIX][NUMBER]`

### Examples
- `0.14.0` - Base release
- `0.14.0q1` - First hotfix
- `0.14.0q2` - Second hotfix
- `0.14.1` - Next minor release

### Rules
- Hotfixes increment suffix number
- New releases drop suffix
- Major/minor changes require full release process

---

## ✅ Pre-Deployment Checklist

```
[ ] Bug verified and reproducible
[ ] Fix tested locally
[ ] No failing tests
[ ] No linter errors
[ ] CHANGELOG.md updated (auto)
[ ] Version bumped (auto)
[ ] Team notified of incoming hotfix
[ ] Monitoring tools ready
```

---

## 📊 Post-Deployment Checklist

```
[ ] Deployment successful
[ ] Health check passing
[ ] Original bug fixed
[ ] No new errors in /admin/errors
[ ] Sentry clean (no new alerts)
[ ] Error rate < 1%
[ ] Database latency normal
[ ] Team notified of completion
```

---

## 🔍 Monitoring Dashboard URLs

### Health & Status
- **Extended Health:** https://parel.app/api/health/extended
- **Basic Health:** https://parel.app/api/health
- **Admin Health:** https://parel.app/admin/health

### Error Tracking
- **Error Dashboard:** https://parel.app/admin/errors
- **Error API:** https://parel.app/api/errors?severity=critical
- **Sentry:** [Configure SENTRY_DSN]

### Metrics
- **Metrics Dashboard:** https://parel.app/admin/metrics
- **Telemetry API:** https://parel.app/api/telemetry

---

## 🚨 Emergency Procedures

### Critical Outage

1. **Immediate rollback**
   ```bash
   tsx scripts/rollback-last.ts
   ```

2. **Check health**
   ```bash
   curl https://parel.app/api/health/extended
   ```

3. **Notify team**
   - Post in team chat
   - Update status page (if available)
   - Communicate ETA for fix

### Database Issues

1. **Check connection**
   ```bash
   curl https://parel.app/api/health/db
   ```

2. **Check Prisma logs**
   ```bash
   vercel logs --prod | grep -i prisma
   ```

3. **If needed, restart**
   - Redeploy via Vercel dashboard
   - Or force redeploy: `vercel --prod --force`

### Build Failures

1. **Check build logs**
   ```bash
   vercel logs --prod | tail -100
   ```

2. **Common issues:**
   - TypeScript errors
   - Missing dependencies
   - Environment variables
   - Prisma schema sync

3. **Quick fix**
   ```bash
   # Regenerate Prisma client
   pnpm prisma generate
   
   # Rebuild
   pnpm build
   ```

---

## 📞 Escalation

### Who to Contact

**Level 1:** Self-service
- Use automated scripts
- Check dashboards
- Review documentation

**Level 2:** Team Lead
- Can't resolve in 15 minutes
- Multiple systems affected
- Data integrity concerns

**Level 3:** Infrastructure
- Database failures
- Vercel/hosting issues
- DNS/network problems

---

## 🧪 Testing Hotfixes

### Local Testing

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Test specific scenario
# ... manual testing ...
```

### Staging Testing (if available)

```bash
# Deploy to staging
vercel --env staging

# Test on staging URL
# ... verification ...
```

### Production Verification

```bash
# Smoke test critical paths
curl https://parel.app/api/auth/status
curl https://parel.app/api/health
curl https://parel.app/api/flow-answers

# Check for errors
curl https://parel.app/api/errors?limit=5
```

---

## 📝 Incident Report Template

After resolving a critical issue:

```markdown
# Incident Report: [Issue Title]

**Date:** YYYY-MM-DD
**Severity:** Critical/High/Medium
**Duration:** X hours Y minutes
**Affected Users:** ~X users

## Summary
Brief description of what happened.

## Timeline
- HH:MM - Issue detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Verified resolved

## Root Cause
Technical explanation of what caused the issue.

## Resolution
How the issue was fixed.

## Prevention
Steps to prevent similar issues.

## Action Items
- [ ] Update monitoring
- [ ] Add tests
- [ ] Improve documentation
```

---

## 🦁 Remember

**Speed matters, but safety first:**
- Always run the hotfix script (automated checks)
- Monitor after deployment
- Have rollback plan ready
- Communicate with team

**When in doubt:**
- Check `/admin/errors` first
- Use health endpoints
- Review recent deployments
- Ask for help early

---

🚀 **Built for rapid response without breaking things.**

