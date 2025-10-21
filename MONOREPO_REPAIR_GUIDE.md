# 🧠 PAREL Monorepo Repair Guide
**Version 0.12.10f - 2025-10-17**

## 🎯 Problem

The monorepo was in a broken state because:
- User tried to use `npm install` instead of `pnpm`
- `workspace:*` dependencies don't work with npm
- node_modules became fragmented
- Dev scripts couldn't find dependencies

## ✅ Solution

Use the automated repair script:

```powershell
.\scripts\repair-monorepo.ps1
```

## 🔧 Manual Repair Steps

If the script fails, follow these steps:

### 1. Clean up broken node_modules

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\worker\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\db\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue
```

### 2. Install dependencies with pnpm

```powershell
pnpm install --legacy-peer-deps
```

### 3. Verify installation

```powershell
# Check that concurrently is installed
Test-Path node_modules\concurrently

# Check that next is installed in web app
Test-Path apps\web\node_modules\next
```

### 4. Start the dev server

```powershell
pnpm dev
```

## 🚀 Expected Behavior

When you run `pnpm dev`, you should see:

```
[0] 
[0] > @parel/web@0.12.8 dev
[0] > next dev
[0] 
[1] 
[1] > @parel/worker@1.0.0 dev
[1] > tsx src/worker.ts
[1] 
[0]   ▲ Next.js 14.0.4
[0]   - Local:        http://localhost:3000
[1] Worker started...
```

## ⚠️ Common Mistakes

### ❌ WRONG: Using npm

```powershell
# DON'T DO THIS!
npm install
```

**Error:**
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

### ✅ RIGHT: Using pnpm

```powershell
# DO THIS!
pnpm install --legacy-peer-deps
```

## 📊 Workspace Structure

```
parel-mvp/
├── package.json                 ← Root (contains concurrently)
├── pnpm-workspace.yaml          ← Workspace config
├── apps/
│   ├── web/
│   │   ├── package.json         ← Web app (next, react, react-dom)
│   │   └── node_modules/        ← Workspace dependencies
│   └── worker/
│       ├── package.json         ← Worker app (tsx, bullmq)
│       └── node_modules/        ← Workspace dependencies
├── packages/
│   └── db/
│       ├── package.json         ← Database package
│       └── node_modules/        ← Workspace dependencies
└── node_modules/                ← Shared dependencies
```

## 🎯 Dev Scripts

### Root level (uses concurrently)

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm run dev:web\" \"pnpm run dev:worker\"",
    "dev:web": "cd apps/web && pnpm run dev",
    "dev:worker": "cd apps/worker && pnpm run dev"
  }
}
```

### Web app (uses Next.js)

```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

### Worker app (uses tsx)

```json
{
  "scripts": {
    "dev": "tsx src/worker.ts"
  }
}
```

## 🚨 Troubleshooting

### Issue: "concurrently: command not found"

**Solution:**
```powershell
pnpm add -D concurrently
```

### Issue: "next: command not found"

**Solution:**
```powershell
cd apps/web
pnpm add next react react-dom
cd ../..
```

### Issue: "Cannot find module '@parel/db'"

**Solution:**
```powershell
# Reinstall from root
pnpm install --legacy-peer-deps
```

### Issue: "pnpm: command not found"

**Solution:**
```powershell
npm install -g pnpm
```

## ✅ Success Checklist

After repair, verify:

- [ ] `pnpm dev` starts both apps
- [ ] No "command not found" errors
- [ ] Web app opens at http://localhost:3000
- [ ] Worker process runs in parallel
- [ ] Console shows `[0]` and `[1]` prefixes for both apps
- [ ] No dependency resolution errors

## 📝 Key Takeaways

1. **Always use `pnpm`** in this monorepo (never `npm`)
2. **Use `--legacy-peer-deps`** flag when installing
3. **Run from root** to start both apps: `pnpm dev`
4. **Clean node_modules** if you see weird errors
5. **Don't modify** `pnpm-workspace.yaml`

---

**One command. Two apps. Zero npm drama.** 🦁


