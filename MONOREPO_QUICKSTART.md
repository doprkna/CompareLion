# 🧠 Monorepo Quick Start
**Version 0.12.10f**

## ⚡ Quick Repair

```powershell
# Run automated repair
.\scripts\repair-monorepo.ps1

# Start dev server
pnpm dev
```

## 🔧 Manual Fix (If Script Fails)

```powershell
# 1. Clean everything
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\worker\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\db\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue

# 2. Install with pnpm
pnpm install --legacy-peer-deps

# 3. Start
pnpm dev
```

## ✅ Expected Output

```
[0] > @parel/web@0.12.8 dev
[0] > next dev
[0]   ▲ Next.js 14.0.4
[0]   - Local:        http://localhost:3000
[1] > @parel/worker@1.0.0 dev
[1] > tsx src/worker.ts
[1] Worker started...
```

## ⚠️ Common Errors

### ❌ "concurrently: command not found"
```powershell
pnpm add -D concurrently
```

### ❌ "next: command not found"
```powershell
cd apps/web
pnpm add next react react-dom
```

### ❌ "Cannot find module '@parel/db'"
```powershell
pnpm install --legacy-peer-deps
```

## 📝 Remember

- ✅ **Always use `pnpm`** (never `npm`)
- ✅ **Use `--legacy-peer-deps`** flag
- ❌ **Never use `npm install`** in this repo

---

**See `MONOREPO_REPAIR_GUIDE.md` for detailed troubleshooting.** 🦁


