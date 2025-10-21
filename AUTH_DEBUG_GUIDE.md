# Authentication Debug Guide

## ✅ Debug Logging Added

### Files Modified
1. **`apps/web/app/api/auth/[...nextauth]/options.ts`**
   - Added logging to `CredentialsProvider.authorize()`
   - Tracks every step of authentication flow

2. **`apps/web/lib/auth/password.ts`**
   - Added logging to `verifyPassword()`
   - Shows hash type detection and verification results

---

## 🔍 What to Look For

### When you login with `demo@example.com` / `password123`:

You should see these console logs in the terminal (in order):

```
>>> AUTH START { email: 'demo@example.com', hasPassword: true }
>>> Verifying password for user: demo@example.com
>>> verifyPassword called { hasPassword: true, hasHash: true, hashPrefix: '$2a$10$...' }
>>> Detected bcrypt hash, using bcrypt.compare
>>> bcrypt.compare result: true
>>> Password valid: true
>>> Authorized user: { id: 'xxx', email: 'demo@example.com', name: 'Demo User' }
```

---

## 🐛 Common Failure Points

### 1. Missing Credentials
```
>>> AUTH START { email: 'demo@example.com', hasPassword: false }
>>> Missing credentials
```
**Cause:** Password not sent from frontend  
**Fix:** Check login form is sending both email and password

### 2. User Not Found
```
>>> AUTH START { email: 'demo@example.com', hasPassword: true }
>>> No user found for demo@example.com
```
**Cause:** User doesn't exist in database  
**Fix:** Run seed script or check email spelling

### 3. No Password Hash
```
>>> AUTH START { email: 'demo@example.com', hasPassword: true }
>>> User has no passwordHash
```
**Cause:** User exists but passwordHash is NULL  
**Fix:** Check database schema, run migration, or update user record

### 4. Password Verification Failed
```
>>> verifyPassword called { hasPassword: true, hasHash: true, hashPrefix: '$2a$10$...' }
>>> Detected bcrypt hash, using bcrypt.compare
>>> bcrypt.compare result: false
>>> Password valid: false
>>> Password verification failed
```
**Cause:** Wrong password entered  
**Fix:** Verify the correct password, check seed data

### 5. Unknown Hash Format
```
>>> verifyPassword called { hasPassword: true, hasHash: true, hashPrefix: 'plaintext_' }
[auth] Unknown password hash format: plaintext_
>>> Password valid: false
```
**Cause:** Password stored as plaintext or unknown format  
**Fix:** Re-hash password with argon2 or bcrypt

---

## 🧪 Testing Steps

### 1. Run Migration (if not done yet)
```powershell
cd C:\Users\doprk\parel-mvp\packages\db
pnpm exec prisma migrate dev --name add_nextauth_session_models
```

### 2. Restart Dev Server
```powershell
cd C:\Users\doprk\parel-mvp
pnpm dev
```

### 3. Watch Terminal Output
Keep terminal visible to see debug logs

### 4. Attempt Login
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `demo@example.com`
   - Password: `password123`
3. Click "Sign in"

### 5. Analyze Logs
- If you see ">>> Authorized user: ..." → Auth is working!
- If logs stop before ">>> Authorized user" → That's where it's failing
- Copy the full log output if you need help debugging

---

## 🎯 Expected Success Flow

```
>>> PRISMA import type: object
>>> PRISMA keys: [ 'user', 'org', 'membership', 'task', ... ]
>>> Prisma import sanity: function
>>> Prisma models available: [ 'user', 'org', 'membership', ... ]

[User clicks login]

>>> AUTH START { email: 'demo@example.com', hasPassword: true }
>>> Verifying password for user: demo@example.com
>>> verifyPassword called { hasPassword: true, hasHash: true, hashPrefix: '$2a$10$abc' }
>>> Detected bcrypt hash, using bcrypt.compare
>>> bcrypt.compare result: true
>>> Password valid: true
>>> Authorized user: { id: 'cm2abc...', email: 'demo@example.com', name: 'Demo User' }

[Session created, redirect to /main]
```

---

## 🔧 Quick Fixes

### If user doesn't exist
```sql
-- Check if demo user exists
SELECT id, email, "passwordHash" FROM users WHERE email = 'demo@example.com';
```

### If passwordHash is NULL
```sql
-- Update with bcrypt hash for "password123"
UPDATE users 
SET "passwordHash" = '$2a$10$abcdefghijklmnopqrstuv...' 
WHERE email = 'demo@example.com';
```

### If you need to create demo user
Run seed script:
```powershell
pnpm --filter @parel/db run prisma:seed
```

---

## 📊 After Successful Login

Check these:
1. ✅ Console shows ">>> Authorized user: ..."
2. ✅ Browser redirects to `/main`
3. ✅ Session persists after page refresh
4. ✅ `/api/auth/session` returns user JSON
5. ✅ User name displays correctly in UI

---

**Next:** Once you see where auth is failing in the logs, we can fix that specific issue!

