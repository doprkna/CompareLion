# 🔍 Where to Look for Authentication Logs

## 📺 The Terminal Window

All debug logs appear in **the terminal/console where `pnpm dev` is running**.

---

## 🎯 Visual Guide

### Step 1: Open Your Terminal

You should have a terminal window that looks something like this when the dev server is running:

```
┌─────────────────────────────────────────────────────────┐
│ Windows PowerShell / Command Prompt / Terminal         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ C:\Users\doprk\parel-mvp> pnpm dev                     │
│                                                         │
│ > parel-mvp@1.0.0 dev                                  │
│ > concurrently "pnpm run dev:web" "pnpm run dev:worker"│
│                                                         │
│ [0] > @parel/web@0.5.10 dev                           │
│ [0] > next dev                                         │
│ [0]                                                    │
│ [0]   ▲ Next.js 14.0.4                                │
│ [0]   - Local:        http://localhost:3000           │
│ [0]                                                    │
│ [0]  ✓ Ready in 2.3s                                  │
│ [0]                                                    │
│ [0] >>> Prisma import sanity: function                │ ← LOOK HERE!
│ [0] >>> Prisma models available: [ 'user', ... ]      │
│                                                        │
│ [cursor blinking here]                                 │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## ⏰ When to Look

### **On Server Start**
Right after you run `pnpm dev`, you should see:
```
[0] >>> Prisma import sanity: function
[0] >>> Prisma models available: [ 'user', 'org', 'membership', ... ]
```

✅ **If you see this** → Prisma client is working!  
❌ **If you DON'T see this** → Prisma import failed, need to fix

---

### **When You Click "Sign In"**

1. Open browser to `http://localhost:3000/login`
2. Enter email and password
3. Click "Sign in" button
4. **Immediately look at the terminal** ← The logs appear here!

You'll see a burst of logs like this:

```
[0] >>> AUTH START { email: 'demo@example.com', hasPassword: true }
[0] >>> Verifying password for user: demo@example.com
[0] >>> verifyPassword called { hasPassword: true, hasHash: true, hashPrefix: '$2a$10$...' }
[0] >>> Detected bcrypt hash, using bcrypt.compare
[0] >>> bcrypt.compare result: true
[0] >>> Password valid: true
[0] >>> Authorized user: { id: 'cm2abc...', email: 'demo@example.com', name: 'Demo User' }
```

---

## 🖱️ Where Exactly in Your IDE

### **If using VS Code:**
1. Look at the bottom panel
2. Click the "TERMINAL" tab
3. The logs appear there

```
┌─────────────────────────────────────────────┐
│ Your Code Editor (VS Code)                  │
├─────────────────────────────────────────────┤
│ [Your code files]                           │
│                                             │
├─────────────────────────────────────────────┤
│ ▼ TERMINAL   PROBLEMS   OUTPUT   DEBUG      │ ← Click "TERMINAL" tab
├─────────────────────────────────────────────┤
│ C:\Users\doprk\parel-mvp> pnpm dev         │
│ [0] >>> AUTH START { ... }                  │ ← Logs appear here
│ [0] >>> Password valid: true                │
└─────────────────────────────────────────────┘
```

### **If using Cursor:**
Same location - bottom panel, TERMINAL tab.

### **If using separate terminal window:**
Check your Windows Terminal, PowerShell, or Command Prompt window where you ran `pnpm dev`.

---

## 🎬 Timeline of Events

Here's the exact sequence when you test login:

| Time | What You Do | Where to Look | What You See |
|------|-------------|---------------|--------------|
| 0s | Click "Sign in" button | Browser | Loading... |
| 0.1s | Request sent to server | Terminal | `>>> AUTH START { email: 'demo@example.com', ... }` |
| 0.2s | Password verification | Terminal | `>>> verifyPassword called { ... }` |
| 0.3s | Result returned | Terminal | `>>> Password valid: true` |
| 0.4s | Session created | Terminal | `>>> Authorized user: { ... }` |
| 0.5s | Redirect happens | Browser | Redirects to `/main` |

**All the diagnostic info (steps 2-4) appears in the TERMINAL**, not in the browser.

---

## ❓ Not Seeing Any Logs?

### Check 1: Is the dev server running?
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

If no Node processes → server isn't running, start it:
```powershell
pnpm dev
```

### Check 2: Are you looking at the right terminal?
- The logs appear in **the same window where you ran `pnpm dev`**
- NOT in the browser console (F12 developer tools)
- NOT in a different terminal window

### Check 3: Did you click "Sign in"?
- The auth logs only appear **when you attempt to login**
- They don't appear when just viewing the login page

---

## 📸 Screenshot Guide

### ✅ **This is where to look:**
```
Windows PowerShell
├── Line 1: C:\Users\doprk\parel-mvp> pnpm dev
├── Line 2: > parel-mvp@1.0.0 dev
├── Line 3: [0] ▲ Next.js 14.0.4
├── Line 4: [0] - Local: http://localhost:3000
├── Line 5: [0] ✓ Ready in 2.3s
├── Line 6: [0] >>> Prisma import sanity: function    ← START READING HERE
├── Line 7: [0] >>> AUTH START { ... }                ← LOGIN ATTEMPT
├── Line 8: [0] >>> Password valid: true              ← SUCCESS/FAILURE
└── Line 9: [cursor]
```

### ❌ **NOT here:**
```
Browser Developer Console (F12)
├── Console tab
├── Network tab     ← These won't show the detailed auth logs
└── Application tab
```

---

## 🚀 Quick Test Right Now

1. **Find the terminal window** where you see:
   ```
   [0] ▲ Next.js 14.0.4
   [0] - Local: http://localhost:3000
   ```

2. **Open browser** to `http://localhost:3000/login`

3. **Enter credentials:**
   - Email: `demo@example.com`
   - Password: `password123`

4. **Click "Sign in"**

5. **IMMEDIATELY switch back to the terminal window** and look for:
   ```
   [0] >>> AUTH START
   ```

That's it! The logs will be right there in that terminal.

---

## 💡 Pro Tip

Keep your screen split:
```
┌──────────────────┬──────────────────┐
│                  │                  │
│   Browser        │   Terminal       │
│   (Login page)   │   (Logs)         │
│                  │                  │
└──────────────────┴──────────────────┘
```

This way you can see the logs appear in real-time as you interact with the login form!

---

**TL;DR:** Look at the **terminal where `pnpm dev` is running**, not the browser console. The logs appear there when you click "Sign in".




