# PareL v0.5.10 — NextAuth Database Session Setup

## ✅ Changes Applied

### 1. Schema Updates (`packages/db/schema.prisma`)
Added NextAuth required models:
- ✅ `Account` - OAuth provider data
- ✅ `Session` - Database sessions
- ✅ `VerificationToken` - Email magic links
- ✅ `emailVerified` field to User model
- ✅ Relations: `accounts[]` and `sessions[]` to User

### 2. NextAuth Options (`apps/web/app/api/auth/[...nextauth]/options.ts`)
- ✅ Robust Prisma import with fallback strategy
- ✅ Diagnostic logging for import validation
- ✅ Early error detection before adapter creation
- ✅ Database session strategy configured

### 3. Version Bump
- ✅ `apps/web/package.json` → `0.5.10`
- ✅ `apps/web/CHANGELOG.md` → detailed entry added

---

## 🚀 Required Steps (Run Manually)

### Step 1: Generate Prisma Client
The Prisma query engine file was locked during generation. You need to:

1. **Stop the dev server** (if running):
   ```powershell
   # Press Ctrl+C in the terminal running `pnpm dev`
   ```

2. **Generate Prisma client**:
   ```powershell
   pnpm --filter @parel/db exec prisma generate
   ```

3. **Create and apply migration**:
   Since Prisma detected a non-interactive environment, run this in a **new PowerShell window**:
   ```powershell
   cd C:\Users\doprk\parel-mvp\packages\db
   pnpm exec prisma migrate dev --name add_nextauth_session_models
   ```
   
   This will:
   - Create migration files for Account, Session, VerificationToken tables
   - Apply the migration to your database
   - Update emailVerified field on User table

### Step 2: Verify Migration
Check that the migration was created:
```powershell
dir packages\db\migrations
```

You should see a new folder like `20251008XXXXXX_add_nextauth_session_models/`

### Step 3: Restart Dev Server
```powershell
pnpm dev
```

### Step 4: Test Login Flow

#### A. Check Diagnostic Logs
When the server starts, you should see in the console:
```
>>> Prisma import sanity: function
>>> Prisma models available: [ 'user', 'org', 'membership', ... ]
```

✅ If `prisma?.user?.findUnique` shows `function`, the import is working!

#### B. Test Credentials Login
1. Navigate to `http://localhost:3000/login`
2. Login with `demo@example.com` / `password123`
3. Check `/api/auth/session`:
   - Should return JSON with user data
   - No `500` errors
   - No "findUnique undefined" errors

#### C. Test Session Persistence
1. After login, refresh the page
2. You should stay logged in (session persists)
3. Check browser cookies for `next-auth.session-token`

---

## 🔍 Troubleshooting

### Error: "findUnique undefined"
**Cause:** Prisma client not properly imported

**Fix:**
1. Check console logs for diagnostic output
2. Verify `typeof prisma?.user?.findUnique === 'function'`
3. If not, try rebuilding:
   ```powershell
   pnpm --filter @parel/db exec prisma generate
   pnpm dev
   ```

### Error: "Table 'accounts' does not exist"
**Cause:** Migration not applied

**Fix:**
```powershell
cd packages\db
pnpm exec prisma migrate deploy
```

### Error: "Operation not permitted" during generate
**Cause:** Prisma query engine file is locked by running dev server

**Fix:**
1. Stop dev server (`Ctrl+C`)
2. Run generate again
3. Restart dev server

---

## 📊 Expected Outcome

After completing these steps:

✅ NextAuth PrismaAdapter fully functional  
✅ Database sessions persist across page refreshes  
✅ Email provider can send magic links (if configured)  
✅ OAuth providers can link accounts (Google, Facebook, Twitter)  
✅ Credentials login works with demo account  
✅ No "findUnique undefined" errors  
✅ `/api/auth/session` returns user data (200 OK)  

---

## 🎯 Next Steps (Optional)

### 1. Configure Email Provider
Add to `.env.local`:
```env
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@parel.app
```

### 2. Configure OAuth Providers
Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

### 3. Test OAuth Flow
1. Click "Continue with Google" on login page
2. Complete OAuth flow
3. Check that user and account are created in database
4. Verify session persists

---

## 📝 Files Modified

- `packages/db/schema.prisma` - Added NextAuth models
- `apps/web/app/api/auth/[...nextauth]/options.ts` - Robust Prisma import
- `apps/web/CHANGELOG.md` - Version 0.5.10 entry
- `apps/web/package.json` - Version bump

---

## 🐛 Known Issues

### Issue: Sentry Init in Edge Runtime
If you see Sentry-related errors, add this guard to Sentry config:
```ts
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
}
```

Files to update:
- `apps/web/sentry.client.config.ts`
- `apps/web/sentry.server.config.ts`
- `apps/web/sentry.edge.config.ts`

---

**Version:** 0.5.10  
**Date:** 2025-10-08  
**Status:** ✅ Code changes complete, migration pending user execution

