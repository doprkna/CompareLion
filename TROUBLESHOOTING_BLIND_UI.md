# 🔍 Troubleshooting "Blind UI" - Admin User Not Showing

## ✅ **CONFIRMED WORKING**

1. ✅ `.env` file exists with `DATABASE_URL="postgresql://parel:parel@localhost:5432/parel"`
2. ✅ Prisma client regenerated and connected to database
3. ✅ Database seeded with 20 users and 475+ records
4. ✅ **Admin user exists** with correct data:
   - Email: `admin@example.com`
   - Password: `1AmTheArchitect` (hashed correctly)
   - Level: 99
   - XP: 9999
   - Funds: 5000
   - Diamonds: 500
   - Role: ADMIN

## 🚨 **LIKELY ISSUES**

### Issue 1: Stale Session / Cache
**Symptoms:** Still seeing "Demo User" or empty data after login

**Solution:**
```bash
# 1. Clear browser cache and cookies
# 2. Close ALL browser tabs for localhost:3000
# 3. Open incognito/private window
# 4. Navigate to http://localhost:3000/login
# 5. Login with: admin@example.com / 1AmTheArchitect
```

### Issue 2: NextAuth Session Not Working
**Symptoms:** Can log in but session is not persisted

**Check:**
```bash
# 1. Verify NEXTAUTH_SECRET is set
cat .env | grep NEXTAUTH_SECRET

# 2. Check if dev server is reading .env
# Look for "Environment variables loaded from .env" in server logs
```

**Fix:**
```bash
# 1. Stop dev server (Ctrl+C)
# 2. Clear .next build cache
cd apps\web
Remove-Item -Recurse -Force .next

# 3. Restart dev server
pnpm run dev
```

### Issue 3: API Routes Not Reading Session
**Symptoms:** API returns 401 or mock data

**Debug:**
```bash
# Open browser DevTools (F12)
# Go to Network tab
# Login
# Check these API calls:

# 1. /api/auth/session - Should return user data
# Expected: { "user": { "email": "admin@example.com", "name": "Admin User" } }

# 2. /api/user/summary - Should return admin stats
# Expected: { "success": true, "user": { "level": 99, "xp": 9999, ... } }
# Should NOT have "mock": true

# 3. Check response status codes
# 401 = Not authenticated (session issue)
# 200 with mock:true = Database connection issue (unlikely now)
```

### Issue 4: App Not Restarted After .env Creation
**Symptoms:** Server logs show "DATABASE_URL is not defined"

**Fix:**
```bash
# Kill ALL node processes
Get-Process node | Stop-Process -Force

# Navigate to web app
cd apps\web

# Start fresh
pnpm run dev
```

## 🛠️ **STEP-BY-STEP RECOVERY**

### Step 1: Clear Everything
```powershell
# Stop dev server (Ctrl+C in terminal where it's running)

# Clear Next.js cache
cd apps\web
Remove-Item -Recurse -Force .next

# Go back to root
cd ..\..
```

### Step 2: Verify Database Connection
```powershell
# Test Prisma connection
pnpm exec tsx scripts\check-admin.ts

# Expected output:
# ✅ Admin user found:
# 📧 Email:    admin@example.com
# ⭐ Level:    99
# 💎 XP:       9999
```

### Step 3: Start Dev Server Fresh
```powershell
cd apps\web
pnpm run dev

# Watch for:
# ✅ "Environment variables loaded from .env"
# ✅ "ready - started server on 0.0.0.0:3000"
# ❌ Any DATABASE_URL errors
```

### Step 4: Test Login in Incognito
```
1. Open Chrome/Edge Incognito window
2. Go to: http://localhost:3000/login
3. Enter:
   Email: admin@example.com
   Password: 1AmTheArchitect
4. Click "Sign In"
```

### Step 5: Check Browser DevTools
```
1. Press F12 (open DevTools)
2. Go to "Network" tab
3. Login
4. Look for these requests:

✅ /api/auth/callback/credentials - Status 200
✅ /api/auth/session - Status 200, returns user data
✅ /api/user/summary - Status 200, returns level 99 data

❌ If any return 401: Session issue
❌ If summary returns mock:true: DB connection issue
```

### Step 6: Check Console for Errors
```
1. In DevTools, go to "Console" tab
2. Look for errors:

❌ "Failed to load XP data" - API issue
❌ "Unauthorized" - Session issue
❌ "Prisma" errors - DB connection issue
✅ No errors = Should be working!
```

## 🐛 **SPECIFIC DEBUGGING COMMANDS**

### Check if Session is Working
```powershell
# While dev server is running, in a new terminal:
curl http://localhost:3000/api/auth/session

# Expected: { "user": { ... } }
# If empty: Session not initialized
```

### Check if API Can Read Session
```powershell
# This will fail with 401, but check the error message
curl http://localhost:3000/api/user/summary

# Expected: { "error": "Unauthorized" } - Normal without cookie
# Unexpected: Any Prisma errors - DB issue
```

### Verify .env is Loaded
```powershell
# Check if Next.js process has DATABASE_URL
Get-Process -Name node | Select-Object -ExpandProperty ProcessName | Select-String "node"

# Or check server logs for:
# "Environment variables loaded from .env"
```

## 📝 **EXPECTED BEHAVIOR AFTER LOGIN**

### Main Page (`/main`)
- ✅ Welcome message: "Welcome back, Admin User"
- ✅ Level display: "Level 99"
- ✅ XP display: "9999 XP"
- ✅ Funds: "5000 💰"
- ✅ Diamonds: "500 💎"
- ✅ Achievement badges visible
- ✅ Stats displayed (Sleep, Health, etc.)

### Should NOT See
- ❌ "Welcome back, Demo User"
- ❌ "Level 1" or "0 XP"
- ❌ Mock data banner: "⚠️ Using temporary data"
- ❌ "Unable to Load Profile"
- ❌ Empty achievement list

## 🔥 **NUCLEAR OPTION (If Nothing Works)**

```powershell
# 1. Stop dev server
# Ctrl+C

# 2. Kill all node processes
Get-Process node | Stop-Process -Force

# 3. Clear all caches
cd apps\web
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache

# 4. Reset database and reseed
cd ..\..
cd packages\db
pnpm prisma db push --force-reset
cd ..\..
pnpm exec tsx packages\db\seed.ts

# 5. Regenerate Prisma client
cd packages\db
pnpm prisma generate

# 6. Start fresh
cd ..\..
cd apps\web
pnpm run dev

# 7. Test in incognito:
# http://localhost:3000/login
# admin@example.com / 1AmTheArchitect
```

## 📞 **PROVIDE THIS INFO IF STILL NOT WORKING**

```powershell
# Run these commands and share output:

# 1. Check admin user
pnpm exec tsx scripts\check-admin.ts

# 2. Check .env
Get-Content .env | Select-String -Pattern "DATABASE_URL|NEXTAUTH"

# 3. Check server logs
# Copy and paste any errors from terminal where `pnpm run dev` is running

# 4. Check browser console
# Press F12 → Console tab → Copy any red errors

# 5. Check Network tab
# Press F12 → Network tab → Filter by "api"
# Share status codes and responses for:
# - /api/auth/session
# - /api/user/summary
```

## ✨ **MOST COMMON FIX**

**99% of the time, the issue is cached session/cookies.**

**Solution:**
1. Close ALL localhost:3000 tabs
2. Clear browser cookies for localhost
3. Open **incognito window**
4. Go to http://localhost:3000/login
5. Login with admin credentials

**This should work!** 🎉









