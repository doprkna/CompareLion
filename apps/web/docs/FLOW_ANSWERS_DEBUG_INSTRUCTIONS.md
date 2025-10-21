# Flow Answers API - Focused Debug Instructions
**Version 0.12.10b - 2025-10-17**

## 🎯 Purpose

This version adds **deep debug logging** to reveal the exact Prisma error causing answer saving failures. No architectural changes - just comprehensive logging.

## 🔍 What Was Added

### Console Logging Before Prisma Call
```typescript
console.log('======================================');
console.log('[DEBUG] FULL BODY:', body);
console.log('[DEBUG] SANITIZED VALUES:');
console.log('  - questionId:', questionId, '(type:', typeof questionId, ')');
console.log('  - optionId:', optionId, '(type:', typeof optionId, ')');
console.log('  - valueText:', valueText, '(type:', typeof valueText, ')');
console.log('  - skipped:', skipped, '(type:', typeof skipped, ')');
console.log('  - timeMs:', timeMs, '(type:', typeof timeMs, ')');
console.log('[DEBUG] PRISMA OPERATION:', existingResponse ? 'UPDATE' : 'CREATE');
console.log('======================================');
```

### Full Prisma Error Logging
```typescript
catch (dbError) {
  console.error('======================================');
  console.error('[UPSERT ERROR RAW]', dbError);
  console.error('[ERROR] Full error object:', JSON.stringify(dbError, null, 2));
  console.error('[ERROR] Error message:', dbError.message);
  console.error('[ERROR] Error name:', dbError.name);
  console.error('[ERROR] Error code:', dbError.code);
  console.error('[ERROR] Error meta:', dbError.meta);
  console.error('[ERROR] Stack trace:', dbError.stack);
  console.error('======================================');
}
```

## 🧪 How to Test

### 1. Start the server and monitor console:
```bash
pnpm dev
```

### 2. Navigate to flow demo:
```
http://localhost:3000/flow-demo
```

### 3. Try to answer a question (not skip)

### 4. Check server console output

You should see output like this:

**If successful:**
```
======================================
[DEBUG] FULL BODY: { questionId: 'cmguq...', optionId: 'cmguq...', skipped: false }
[DEBUG] SANITIZED VALUES:
  - questionId: cmguq4q5d0000inzr3krujckr-1 (type: string )
  - optionId: cmguq4q5d0000inzr3krujckr-opt-1 (type: string )
  - valueText: null (type: object )
  - skipped: false (type: boolean )
  - timeMs: null (type: object )
[DEBUG] PRISMA OPERATION: CREATE
======================================
[DEBUG] Creating new response for user: user-id question: cmguq4q5d0000inzr3krujckr-1
[DEBUG] Prisma operation SUCCESS. Response ID: response-id
```

**If it fails:**
```
======================================
[DEBUG] FULL BODY: { questionId: 'cmguq...', optionId: 'cmguq...', skipped: false }
[DEBUG] SANITIZED VALUES:
  - questionId: cmguq4q5d0000inzr3krujckr-1 (type: string )
  - optionId: cmguq4q5d0000inzr3krujckr-opt-1 (type: string )
  - valueText: null (type: object )
  - skipped: false (type: boolean )
  - timeMs: null (type: object )
[DEBUG] PRISMA OPERATION: CREATE
======================================
[DEBUG] Creating new response for user: user-id question: cmguq4q5d0000inzr3krujckr-1
======================================
[UPSERT ERROR RAW] <full error object>
[ERROR] Full error object: { ... detailed JSON ... }
[ERROR] Error message: <specific error message>
[ERROR] Error name: <error type>
[ERROR] Error code: <Prisma error code>
[ERROR] Error meta: <additional metadata>
[ERROR] Stack trace: <full stack trace>
======================================
```

## 📊 What to Look For

### Field Types
- **questionId** should be `string`
- **optionId** should be `string` or `null`
- **valueText** should be `string` or `null` (might show as `object` if null)
- **skipped** should be `boolean`
- **timeMs** should be `number` or `null` (might show as `object` if null)

### Common Prisma Errors
- **P2002**: Unique constraint violation
- **P2003**: Foreign key constraint violation
- **P2025**: Record not found
- **P2011**: Null constraint violation

### Type Mismatches
If you see types like:
- `undefined` → Field is missing
- `number` for optionId → Should be string
- `string` for timeMs → Should be number

## 🔧 Troubleshooting Steps

### Step 1: Copy the full console output
Copy everything between the `======================================` separators

### Step 2: Check field types
Look at the `[DEBUG] SANITIZED VALUES:` section and verify:
- All IDs are strings
- timeMs is number or null
- No undefined values

### Step 3: Check Prisma error details
If there's an error, look at:
- **Error code**: Identifies the specific Prisma issue
- **Error meta**: Contains details about which field/constraint failed
- **Error message**: Human-readable description

### Step 4: Report findings
When reporting the issue, include:
- The `[DEBUG] SANITIZED VALUES:` section
- The `[ERROR]` section (if present)
- What action triggered it (answer question vs skip)

## 🎯 Expected Output Format

When you test and get an error, provide this information:

### Debug Output Summary
```
- Prisma error: <error message>
- Field types:
  - questionId: <type>
  - optionId: <type>
  - valueText: <type>
  - skipped: <type>
  - timeMs: <type>
```

### Likely Cause
```
<analysis based on error code and types>
```

### Fix Recommendation
```
<specific code change or schema adjustment>
```

## 🚨 No Changes Made To:
- ✅ Database schema
- ✅ Model definitions
- ✅ NextAuth logic
- ✅ File structure
- ✅ Database data

## ✅ Only Added:
- 📝 Console logging
- 🐛 Error detail capture
- 📊 Type information output


