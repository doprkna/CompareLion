# 🧠 PAREL Full Repair Quick Start
**Version 0.12.10g - 2025-10-17**

## ⚡ One-Command Full Repair

```powershell
.\scripts\full-repair.ps1
```

This script will:
- ✅ Verify pnpm installation
- ✅ Clean all node_modules and build artifacts
- ✅ Verify Prisma schema location
- ✅ Install all dependencies
- ✅ Generate Prisma client
- ✅ Verify workspace structure
- ✅ Test database connectivity

## 🚀 After Repair

```powershell
# Start the dev server
pnpm dev
```

Expected output:
```
[0] > @parel/web@0.12.8 dev
[0] > next dev
[0]   ▲ Next.js 14.0.4
[0]   - Local:        http://localhost:3000
[1] > @parel/worker@1.0.0 dev
[1] > tsx src/worker.ts
[1] Worker started...
```

## 🧪 Test Prisma

```powershell
# Test database operations
Invoke-WebRequest -Uri "http://localhost:3000/api/debug-prisma" -Method POST
```

Expected response:
```json
{
  "ok": true,
  "tests": {
    "selectQuery": true,
    "userCount": 5,
    "createResponse": true,
    "cleanup": true
  }
}
```

## ✅ Validation Checklist

After running the repair script, verify:

- [ ] No errors in script output
- [ ] `pnpm dev` starts both apps
- [ ] Web app loads at http://localhost:3000
- [ ] Worker runs in parallel
- [ ] Prisma queries work
- [ ] No "MODULE_NOT_FOUND" errors
- [ ] No "concurrently" errors

## 🚨 If Problems Persist

### Issue: pnpm not found
```powershell
npm install -g pnpm
```

### Issue: Prisma generation fails
```powershell
npx prisma generate --schema="packages\db\schema.prisma"
```

### Issue: Dev server won't start
```powershell
# Clean again
Remove-Item -Recurse -Force node_modules, apps\web\node_modules, apps\web\.next -ErrorAction SilentlyContinue

# Reinstall
pnpm install --legacy-peer-deps
```

## 📝 Key Reminders

- ✅ **Always use pnpm** (never npm)
- ✅ **Prisma schema:** `packages\db\schema.prisma`
- ✅ **Import pattern:** `import { prisma } from '@/lib/db'`
- ✅ **Dev command:** `pnpm dev` (from root)

---

**One script. Full repair. Zero drama.** 🦁


