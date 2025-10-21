# 🧠 Prisma Cleanup Quick Start
**Version 0.12.10e**

## ⚡ **1-Minute Cleanup**

```powershell
# Run automated cleanup script
.\scripts\prisma-cleanup.ps1
```

## 🧪 **Test Database Writes**

```powershell
# Start server
pnpm dev

# In another terminal, test Prisma
Invoke-WebRequest -Uri "http://localhost:3000/api/debug-prisma" -Method POST
```

## ✅ **Expected Result**

```json
{
  "ok": true,
  "tests": {
    "selectQuery": true,
    "userCount": 5,
    "createResponse": true,
    "cleanup": true
  },
  "message": "All Prisma tests passed!"
}
```

## 🔍 **Manual Cleanup (If Script Fails)**

```powershell
# 1. Remove fragmented clients
Remove-Item -Recurse -Force apps\web\node_modules\.prisma -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\db\node_modules\.prisma -ErrorAction SilentlyContinue

# 2. Install dependencies
pnpm install --legacy-peer-deps

# 3. Generate from canonical schema
npx prisma generate --schema="packages\db\schema.prisma"

# 4. Start server
pnpm dev

# 5. Test
Invoke-WebRequest -Uri "http://localhost:3000/api/debug-prisma" -Method POST
```

## 📋 **Verification**

- [ ] `debug-prisma` returns `{ ok: true }`
- [ ] Server logs show `[DEBUG-PRISMA] ✅` messages
- [ ] Flow demo at `/flow-demo` saves answers
- [ ] No Prisma errors in console

## 🚨 **If Problems Persist**

Check server console for:
```
[🧨 PRISMA TEST ERROR] <specific error>
[ERROR] Error code: P2003
```

See `apps/web/docs/PRISMA_CLEANUP_GUIDE.md` for detailed troubleshooting.

---

**One schema. One client. Zero fragmentation.** 🦁


