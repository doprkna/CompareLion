# PareL Deployment Pipeline Guide (v0.11.6)

## Overview

Automated CI/CD pipeline with testing, building, deployment, and backups.

---

## CI/CD Workflows

### 1. CI Pipeline

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main`, `develop`, `staging`
- Pull requests

**Jobs:**

```
lint → typecheck → test → e2e → build
```

**Steps:**

1. **Lint** (ESLint + Prettier)
   ```bash
   pnpm lint
   pnpm format:check
   ```

2. **Type Check**
   ```bash
   pnpm typecheck
   ```

3. **Unit Tests** (with PostgreSQL service)
   ```bash
   pnpm test:ci
   ```
   - Runs all 54 tests
   - Generates coverage report
   - Uploads to Codecov
   - Fails if coverage < 80%

4. **E2E Tests** (with Playwright)
   ```bash
   pnpm test:e2e:ci
   ```
   - Uploads test results
   - Retains for 30 days

5. **Build Check**
   ```bash
   pnpm build
   ```
   - Uploads build artifacts
   - Retains for 7 days

### 2. Staging Deployment

**File:** `.github/workflows/deploy-staging.yml`

**Trigger:** Push to `staging` branch

**Steps:**

1. Checkout code
2. Install dependencies
3. Generate Prisma client
4. Run database migrations (staging DB)
5. Build application
6. Deploy to Vercel (preview)
7. Send Discord notification

**Environment Variables:**
```bash
STAGING_DATABASE_URL
STAGING_NEXTAUTH_SECRET
STAGING_URL
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DISCORD_WEBHOOK_URL
```

**Deployment URL:** `staging.parel.app`

### 3. Production Deployment

**File:** `.github/workflows/deploy-production.yml`

**Trigger:** Push tag `v*.*.*`

**Steps:**

1. Extract version from tag
2. Run full test suite
3. Check coverage (must be ≥ 80%)
4. Run database migrations (production DB)
5. Build application
6. Deploy to Vercel (production)
7. Create GitHub release
8. Send success/failure notification

**Environment Variables:**
```bash
PRODUCTION_DATABASE_URL
PRODUCTION_NEXTAUTH_SECRET
PRODUCTION_URL
NEXT_PUBLIC_SENTRY_DSN
VERCEL_TOKEN
DISCORD_WEBHOOK_URL
```

**Deployment URL:** `parel.app`

**Blocking:** Deployment fails if:
- Tests fail
- Coverage < 80%
- Build fails
- Migration fails

### 4. Database Backup

**File:** `.github/workflows/backup.yml`

**Triggers:**
- Daily at 2 AM UTC (cron)
- Manual trigger

**Steps:**

1. Create PostgreSQL dump
2. Compress with gzip
3. Upload to S3 or Supabase
4. Clean old backups (> 30 days)
5. Send notification

**Retention:** 30 days

**Storage Options:**
- AWS S3 (STANDARD_IA)
- Supabase Storage

---

## Deployment Flow

### Staging Deployment

```
1. Commit changes
   ↓
2. Push to staging branch
   ↓
3. GitHub Actions triggered
   ↓
4. Run migrations (staging DB)
   ↓
5. Build application
   ↓
6. Deploy to Vercel preview
   ↓
7. Send notification
   ↓
8. Test on staging.parel.app
```

### Production Deployment

```
1. Update CHANGELOG.md
   ↓
2. Bump version in package.json
   ↓
3. Create git tag: git tag v0.11.6
   ↓
4. Push tag: git push origin v0.11.6
   ↓
5. GitHub Actions triggered
   ↓
6. Run ALL tests (must pass)
   ↓
7. Check coverage (must be ≥ 80%)
   ↓
8. Run migrations (production DB)
   ↓
9. Build application
   ↓
10. Deploy to Vercel production
    ↓
11. Create GitHub release
    ↓
12. Send notification
    ↓
13. Live on parel.app
```

---

## Database Backups

### Automated Backups

**Schedule:** Daily at 2 AM UTC

**Script:** `scripts/backup-database.sh`

**Process:**

```bash
1. Create SQL dump (pg_dump)
   ↓
2. Compress with gzip
   ↓
3. Upload to S3/Supabase
   ↓
4. Delete backups > 30 days
   ↓
5. Send notification
```

**Storage:**

```
S3 Bucket Structure:
s3://bucket-name/
└── backups/
    └── database/
        ├── parel_backup_20251013_020000.sql.gz
        ├── parel_backup_20251014_020000.sql.gz
        └── ...

Retention: 30 days (auto-cleanup)
```

### Manual Backup

```bash
# Set environment
export DATABASE_URL="postgresql://..."
export S3_BACKUP_BUCKET="your-bucket"

# Run backup
./scripts/backup-database.sh
```

### Restore from Backup

**Script:** `scripts/restore-database.sh`

```bash
# Download backup from S3
aws s3 cp s3://bucket/backups/database/backup.sql.gz ./

# Restore
./scripts/restore-database.sh backup.sql.gz

# Run migrations
pnpm prisma migrate deploy

# Restart application
pm2 restart parel-web
```

---

## Deployment Notifications

### Discord Webhook

**Success Notification:**

```
✅ PRODUCTION Deployment Success
PareL v0.11.6 deployment success

Environment: production
Version: v0.11.6
Commit: abc1234
Author: username
URL: https://parel.app
Duration: 3m 45s
Tests: 54/54 passed
Coverage: 85.4%

Timestamp: 2025-10-13T16:00:00.000Z
```

**Failure Notification:**

```
❌ PRODUCTION Deployment Failed
PareL v0.11.6 deployment failed

Environment: production
Version: v0.11.6
Commit: abc1234
Workflow: https://github.com/org/repo/actions/runs/123

Timestamp: 2025-10-13T16:00:00.000Z
```

### Configuration

**Discord:**
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
```

**Slack:**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

---

## Environment Setup

### Required Secrets

**GitHub Secrets:**

```
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Staging
STAGING_DATABASE_URL
STAGING_NEXTAUTH_SECRET
STAGING_URL

# Production
PRODUCTION_DATABASE_URL
PRODUCTION_NEXTAUTH_SECRET
PRODUCTION_URL
SENTRY_DSN

# Backups
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
S3_BACKUP_BUCKET
# OR
SUPABASE_URL
SUPABASE_SERVICE_KEY

# Notifications
DISCORD_WEBHOOK_URL
SLACK_WEBHOOK_URL
```

### Branch Strategy

```
main       → Production (via tags)
staging    → Staging auto-deploy
develop    → Development (CI only)
feature/*  → Feature branches (CI only)
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update CHANGELOG.md
- [ ] Bump version in package.json
- [ ] Run tests locally: `pnpm test:ci`
- [ ] Check coverage: `pnpm test:coverage`
- [ ] Run type check: `pnpm typecheck`
- [ ] Run linter: `pnpm lint`
- [ ] Test build: `pnpm build`

### Staging Deploy

- [ ] Merge to staging branch
- [ ] Monitor GitHub Actions
- [ ] Verify deployment: `https://staging.parel.app`
- [ ] Run smoke tests
- [ ] Check logs
- [ ] Test critical paths

### Production Deploy

- [ ] Staging verified ✅
- [ ] Create git tag: `git tag v0.11.6`
- [ ] Push tag: `git push origin v0.11.6`
- [ ] Monitor GitHub Actions
- [ ] Verify deployment: `https://parel.app`
- [ ] Check health endpoints
- [ ] Monitor error rates
- [ ] Verify database migrations

### Post-Deployment

- [ ] Monitor for 1 hour
- [ ] Check error tracking (Sentry)
- [ ] Verify background jobs
- [ ] Test critical features
- [ ] Check performance metrics
- [ ] Review QA dashboard

---

## Rollback Procedure

### Quick Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Revert migration
pnpm prisma migrate resolve --rolled-back <migration-name>

# Restore from backup
./scripts/restore-database.sh backup.sql.gz
```

### Full Rollback

```bash
# 1. Rollback deployment
vercel rollback <previous-deployment>

# 2. Revert database
./scripts/restore-database.sh <previous-backup>

# 3. Revert code
git revert <commit-sha>
git push origin main

# 4. Monitor recovery
curl https://parel.app/api/health/app
```

---

## Monitoring Deployment

### GitHub Actions

```bash
# Watch workflow
gh run watch

# View logs
gh run view <run-id> --log

# List runs
gh run list --workflow=deploy-production.yml
```

### Vercel Dashboard

```bash
# View deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Check analytics
vercel analytics
```

### Health Checks

```bash
# After deployment
curl https://parel.app/api/health/app
curl https://parel.app/api/health/db
curl https://parel.app/api/health/queue
```

---

## Manual Deployment

### Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Docker (Alternative)

**Dockerfile:** (root level)

```bash
# Build image
docker build -t parel:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
  parel:latest
```

---

## Troubleshooting

### CI Build Fails

**Check:**
- GitHub Actions logs
- Test output
- Type errors
- Linting errors

**Fix:**
```bash
# Run locally
pnpm lint:fix
pnpm typecheck
pnpm test:ci
pnpm build
```

### Deployment Fails

**Check:**
- Vercel logs
- Environment variables
- Database migrations
- Build errors

**Fix:**
```bash
# Rollback deployment
vercel rollback

# Fix issues
# Redeploy
```

### Database Migration Fails

**Check:**
- Migration SQL syntax
- Database connection
- Existing schema conflicts

**Fix:**
```bash
# Reset migration (development only!)
pnpm prisma migrate reset

# Mark as applied (if already run)
pnpm prisma migrate resolve --applied <migration>
```

---

## Best Practices

### Version Tags

```bash
# Semantic versioning
v0.11.6    # Patch
v0.12.0    # Minor
v1.0.0     # Major

# Create annotated tag
git tag -a v0.11.6 -m "Release v0.11.6"

# Push tag
git push origin v0.11.6
```

### Deployment Timing

- **Staging:** Anytime
- **Production:** Off-peak hours
- **Migrations:** Low-traffic periods
- **Backups:** Daily 2 AM UTC

### Testing Before Deploy

```bash
# Full test suite
pnpm test:ci

# E2E tests
pnpm test:e2e

# Build check
pnpm build

# Type check
pnpm typecheck

# Lint check
pnpm lint
```

---

**Last Updated:** v0.11.6 (2025-10-13)










