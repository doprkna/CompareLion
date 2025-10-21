# Error Handling System Migration Guide

## Overview

This guide helps you migrate existing code to use the new unified error handling system.

## Core Components

### 1. Error Utilities (`lib/errors.ts`)

- `AppError` - Custom error class with code and context
- `logError(err, context)` - Centralized error logging
- `safe(fn)` - Execute functions safely without throwing
- `safeAsync(fn)` - Async version of safe()

### 2. API Client (`lib/apiClient.ts`)

- `apiFetch<T>(path, options)` - Fetch wrapper returning null on error
- `apiFetchStrict<T>(path, options)` - Fetch wrapper that throws
- `apiPost<T, D>(path, data, options)` - POST helper
- `apiPatch<T, D>(path, data, options)` - PATCH helper
- `apiDelete<T>(path, options)` - DELETE helper

### 3. UI Components

- `ErrorPlaceholder` - User-friendly error display with retry
- `ErrorMessage` - Simple error message
- `LoadingPlaceholder` - Loading state display

### 4. Error Boundaries

- `error.tsx` - Page-level error boundary
- `global-error.tsx` - Global error boundary (last resort)

## Migration Steps

### Step 1: Replace Direct fetch() Calls

**Before:**
```tsx
const [data, setData] = useState(null);
const [error, setError] = useState('');

useEffect(() => {
  fetch('/api/changelog')
    .then(r => r.json())
    .then(d => setData(d))
    .catch(e => setError(e.message));
}, []);
```

**After:**
```tsx
import { apiFetch } from '@/lib/apiClient';

const [data, setData] = useState(null);

useEffect(() => {
  apiFetch('/api/changelog').then(d => {
    if (d) setData(d);
  });
}, []);
```

### Step 2: Replace console.error Calls

**Before:**
```tsx
try {
  const result = parseData(input);
} catch (err) {
  console.error('Parse error:', err);
}
```

**After:**
```tsx
import { logError } from '@/lib/errors';

try {
  const result = parseData(input);
} catch (err) {
  logError(err, 'parseData');
}
```

### Step 3: Use Error Components

**Before:**
```tsx
{error && <div className="text-red-600">Error: {error}</div>}
```

**After:**
```tsx
import { ErrorPlaceholder } from '@/components/ErrorPlaceholder';

{error && <ErrorPlaceholder title="Failed to load data" retry={fetchData} />}
```

### Step 4: Wrap Risky Operations

**Before:**
```tsx
const parsed = JSON.parse(userInput);
```

**After:**
```tsx
import { safe } from '@/lib/errors';

const parsed = safe(() => JSON.parse(userInput));
if (!parsed) {
  // Handle error
}
```

## Real Examples

### Example 1: Changelog Page

**Before:**
```tsx
useEffect(() => {
  fetch('/api/changelog')
    .then(r => r.json())
    .then(data => setEntries(data.entries || []))
    .catch(() => setError('Failed to load'));
}, []);
```

**After:**
```tsx
import { apiFetch } from '@/lib/apiClient';

useEffect(() => {
  apiFetch<{ entries: any[] }>('/api/changelog').then(data => {
    if (data) setEntries(data.entries || []);
  });
}, []);
```

### Example 2: Form Submission

**Before:**
```tsx
const handleSubmit = async () => {
  try {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile)
    });
    const data = await res.json();
    if (data.success) setMessage('Saved!');
  } catch (err) {
    console.error('Save failed:', err);
    setError('Save failed');
  }
};
```

**After:**
```tsx
import { apiPatch } from '@/lib/apiClient';

const handleSubmit = async () => {
  const data = await apiPatch('/api/profile', profile);
  if (data?.success) {
    setMessage('Saved!');
  }
  // Errors are automatically logged
};
```

### Example 3: API Route

**Before:**
```tsx
export async function GET(req: NextRequest) {
  try {
    const data = await fetchSomeData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

**After:**
```tsx
import { logError, AppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const data = await fetchSomeData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logError(error, 'GET /api/endpoint');
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === 'NOT_FOUND' ? 404 : 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Environment Variables

Add to your `.env.local` for development:

```bash
# Show verbose error logging in console
NEXT_PUBLIC_VERBOSE_ERRORS=true
```

## Best Practices

1. **Use apiFetch for client-side API calls**
   - Automatically handles errors
   - Returns null instead of throwing
   - Logs errors centrally

2. **Use logError instead of console.error**
   - Consistent formatting
   - Environment-aware logging
   - Ready for Sentry integration

3. **Wrap risky operations with safe()**
   - JSON.parse()
   - localStorage access
   - Third-party library calls

4. **Display errors with ErrorPlaceholder**
   - User-friendly messages
   - Optional retry functionality
   - Shows debug info in development

5. **Throw AppError for structured errors**
   - Include error codes
   - Add context for debugging
   - Better error tracking

## Gradual Migration

You don't need to migrate everything at once:

1. **Phase 1**: New code uses new utilities
2. **Phase 2**: Update critical paths (auth, payments)
3. **Phase 3**: Update frequently-used components
4. **Phase 4**: Update remaining code as you touch it

## Testing

Test error scenarios:

```tsx
// Simulate API error
const data = await apiFetch('/api/nonexistent');
// Should log error and return null

// Simulate parse error
const result = safe(() => JSON.parse('invalid'));
// Should log error and return null

// Test error boundary
throw new Error('Test error boundary');
// Should show error page with retry button
```

## Sentry Integration (Future)

When ready to add Sentry:

1. Install Sentry SDK
2. Update `logError()` in `lib/errors.ts`:

```tsx
if (isProd) {
  Sentry.captureException(err, {
    tags: { context },
    extra: payload
  });
}
```

3. Add Sentry init to `instrumentation.ts`

## Questions?

Check these files for examples:
- `apps/web/app/changelog/page.tsx` - Using apiFetch
- `apps/web/app/error.tsx` - Error boundary
- `apps/web/lib/errors.ts` - Core utilities

