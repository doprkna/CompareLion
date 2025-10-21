# PareL v0.5.10b — Database Reseed Guide

## 🎯 Goal
Restore the `demo@example.com` account with full profile data so NextAuth credentials login works.

---

## ✅ What Was Changed

### 1. **Enhanced Seed Script** (`packages/db/prisma/seed.ts`)
- ✅ Full demo user profile with all fields populated
- ✅ Bcrypt hashed password for "password123"
- ✅ Sets `emailVerified` and `emailVerifiedAt` for NextAuth compatibility
- ✅ Rich profile data (XP, level, funds, diamonds, motto, etc.)
- ✅ 9 additional test users for development

### 2. **Updated Package Configuration** (`packages/db/package.json`)
- ✅ Added `tsx` for TypeScript execution
- ✅ Added `bcryptjs` and `@types/bcryptjs`
- ✅ Configured Prisma seed command
- ✅ Added convenient `seed` script

---

## 🚀 How to Run the Reseed

### **Step 1: Verify Database Connection**

Check your `.env` file at the **root** of the project:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parel_dev?schema=public"
```

Update if needed:
- Username: `postgres` (or your DB user)
- Password: `postgres` (or your DB password)
- Database: `parel_dev` (or your DB name)
- Port: `5432` (default PostgreSQL port)

### **Step 2: Install Dependencies**

If you haven't installed `tsx` and `bcryptjs` yet:
```powershell
pnpm install
```

This will install dependencies for all workspaces, including the new `tsx` and `bcryptjs` packages.

### **Step 3: Run Migration (if needed)**

If you haven't run the NextAuth migration yet:
```powershell
pnpm --filter @parel/db exec prisma migrate dev --name add_nextauth_session_models
```

This creates the `Account`, `Session`, and `VerificationToken` tables required by NextAuth.

### **Step 4: Run the Seed Script**

Execute the seed script to create/update the demo user:
```powershell
pnpm --filter @parel/db run seed
```

Or from the root:
```powershell
pnpm db:seed
```

You should see output like:
```
🌱 Seeding database...
✅ Demo user created: demo@example.com | ID: cm2abc...
✅ Seeded 9 additional users
Created Demo Category tree
Inserted 3 demo questions
🌱 Seeding badges...
✅ Seeded 3 badges
```

---

## 🔍 Verify the Demo User

### Option 1: Using Prisma Studio
```powershell
pnpm db:studio
```

1. Click on "User" table
2. Find `demo@example.com`
3. Verify fields:
   - ✅ `email`: demo@example.com
   - ✅ `passwordHash`: $2a$10$... (bcrypt hash)
   - ✅ `name`: Demo User
   - ✅ `emailVerified`: [date]
   - ✅ `emailVerifiedAt`: [date]
   - ✅ `xp`: 2500
   - ✅ `level`: 5
   - ✅ `funds`: 100
   - ✅ `diamonds`: 10

### Option 2: Using SQL Query
```sql
SELECT 
  id, 
  email, 
  name, 
  "passwordHash",
  "emailVerified",
  xp,
  level,
  funds,
  diamonds
FROM users 
WHERE email = 'demo@example.com';
```

Expected result:
```
id              | cm2abc...
email           | demo@example.com
name            | Demo User
passwordHash    | $2a$10$... (60 chars)
emailVerified   | 2025-10-08 ...
xp              | 2500
level           | 5
funds           | 100
diamonds        | 10
```

---

## 🧪 Test Login Flow

### **Step 1: Start Dev Server**
```powershell
pnpm dev
```

### **Step 2: Watch Terminal for Logs**
You should see on startup:
```
[0] >>> Prisma import sanity: function
[0] >>> Prisma models available: [ 'user', 'org', ... ]
```

### **Step 3: Attempt Login**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `demo@example.com`
   - Password: `password123`
3. Click "Sign in"

### **Step 4: Check Terminal Output**
You should see:
```
[0] >>> AUTH START { email: 'demo@example.com', hasPassword: true }
[0] >>> Verifying password for user: demo@example.com
[0] >>> verifyPassword called { hasPassword: true, hasHash: true, hashPrefix: '$2a$10$...' }
[0] >>> Detected bcrypt hash, using bcrypt.compare
[0] >>> bcrypt.compare result: true
[0] >>> Password valid: true
[0] >>> Authorized user: { id: 'cm2...', email: 'demo@example.com', name: 'Demo User' }
```

### **Step 5: Verify Session**
After successful login:
- ✅ Browser redirects to `/main`
- ✅ Page shows "Hello, Demo User 👋"
- ✅ Session persists after page refresh
- ✅ `/api/auth/session` returns user JSON

---

## 🎯 Demo User Details

The seed script creates a demo user with:

```typescript
{
  email: "demo@example.com",
  password: "password123",        // Bcrypt hashed
  name: "Demo User",
  phone: "+420777000111",
  language: "en",
  country: "CZ",
  dateOfBirth: "1990-01-01",
  avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
  motto: "Keep it simple, ship it fast.",
  theme: "dark",
  funds: 100,                     // Currency
  diamonds: 10,                   // Premium currency
  xp: 2500,                       // Experience points
  level: 5,                       // User level
  streakCount: 3,                 // Login streak
  score: 1337,                    // Leaderboard score
  questionsAnswered: 42,          // Activity metrics
  questionsCreated: 5,
  newsletterOptIn: true,
  emailVerified: [current date],  // Required for NextAuth
  emailVerifiedAt: [current date] // Required for NextAuth
}
```

---

## 🔧 Troubleshooting

### Error: "Command 'tsx' not found"
**Fix:**
```powershell
pnpm install
```

### Error: "Cannot find module 'bcryptjs'"
**Fix:**
```powershell
pnpm --filter @parel/db install
```

### Error: "Table 'users' does not exist"
**Fix:** Run migration first:
```powershell
pnpm --filter @parel/db exec prisma migrate dev
```

### Error: "Unique constraint failed on email"
The user already exists! This is fine - the `upsert` will update it:
```
✅ Demo user created: demo@example.com | ID: cm2abc...
```

### Seed runs but login still fails
1. **Check password hash format:**
   ```sql
   SELECT LEFT("passwordHash", 10) FROM users WHERE email = 'demo@example.com';
   ```
   Should return: `$2a$10$...`

2. **Check emailVerified is set:**
   ```sql
   SELECT "emailVerified" FROM users WHERE email = 'demo@example.com';
   ```
   Should return a date, not NULL.

3. **Re-run seed:**
   ```powershell
   pnpm --filter @parel/db run seed
   ```

---

## 📋 Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm --filter @parel/db run seed` | Run seed script |
| `pnpm db:seed` | Alias for seed (from root) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm dev` | Start dev server |

---

## 🎉 Success Checklist

After running the reseed:

- [ ] Seed script runs without errors
- [ ] Demo user appears in Prisma Studio
- [ ] `passwordHash` starts with `$2a$10$`
- [ ] `emailVerified` is not NULL
- [ ] Dev server shows Prisma diagnostic logs
- [ ] Login with `demo@example.com` / `password123` works
- [ ] Terminal shows ">>> Authorized user: ..."
- [ ] Browser redirects to `/main`
- [ ] Session persists after refresh
- [ ] `/api/auth/session` returns user JSON

---

**Next:** Once the seed completes successfully, test the login flow with the debug logs enabled to confirm authentication works end-to-end! 🚀



