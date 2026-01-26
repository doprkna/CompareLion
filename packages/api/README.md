# @parel/api

Unified API package providing envelope standardization and API client consolidation.

## Features

- **Unified API Envelope**: Consistent response format across all endpoints
- **Type-Safe API Client**: Automatic envelope parsing, retry logic, timeout handling
- **Error Normalization**: Standardized error handling with typed error classes
- **DTO Support**: Full TypeScript type safety with shared DTOs

## Installation

```bash
# Already included in monorepo
# Import from @parel/api
```

## Quick Start

### Using the Default Client (Recommended)

```typescript
import { defaultClient } from '@parel/api/client';
import type { UserProfileWithStatsDTO } from '@parel/types/dto';

// GET request
const response = await defaultClient.get<UserProfileWithStatsDTO>('/profile');
const user = response.data.user;

// POST request
const response = await defaultClient.post('/feedback/submit', {
  message: 'Great app!',
  context: 'homepage',
});

// With query parameters
const response = await defaultClient.get('/notifications?limit=10');
```

### Creating a Custom Client

```typescript
import { createApiClient } from '@parel/api/client';

const customClient = createApiClient({
  baseURL: '/api/v2',
  timeout: 60000, // 60 seconds
  retry: {
    maxRetries: 5,
    initialDelay: 2000,
  },
});
```

### Server-Side Helpers

```typescript
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const data = { /* ... */ };
    return buildSuccess(req, data);
  } catch (error) {
    return buildError(req, ApiErrorCode.INTERNAL_ERROR, 'Failed to fetch data');
  }
}
```

## Migration from Legacy Clients

### From `@/lib/apiBase` or `@/lib/apiClient`

**Before (Deprecated):**
```typescript
import { apiFetch } from '@/lib/apiBase';

const data = await apiFetch('/api/endpoint');
```

**After (Recommended):**
```typescript
import { defaultClient } from '@parel/api/client';

const response = await defaultClient.get('/endpoint');
const data = response.data;
```

### From Direct `fetch()` Calls

**Before:**
```typescript
const res = await fetch('/api/endpoint');
const json = await res.json();
if (!json.success) throw new Error(json.error);
const data = json.data;
```

**After:**
```typescript
import { defaultClient } from '@parel/api/client';

const response = await defaultClient.get('/endpoint');
const data = response.data; // Automatically parsed from envelope
```

## API Reference

### `defaultClient`

Default singleton instance of `ApiClient` with sensible defaults.

**Methods:**
- `get<T>(path: string, options?: RequestOptions): Promise<ApiClientResponse<T>>`
- `post<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiClientResponse<T>>`
- `put<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiClientResponse<T>>`
- `patch<T>(path: string, body?: any, options?: RequestOptions): Promise<ApiClientResponse<T>>`
- `delete<T>(path: string, options?: RequestOptions): Promise<ApiClientResponse<T>>`

### `createApiClient(config?)`

Factory function to create a configured client instance.

### `buildSuccess(req, data, options?)`

Server-side helper to create success responses with envelope.

### `buildError(req, code, message, options?)`

Server-side helper to create error responses with envelope.

## Error Handling

```typescript
import { defaultClient, ApiClientError } from '@parel/api/client';

try {
  const response = await defaultClient.get('/endpoint');
  // Use response.data
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error('API Error:', error.code, error.message);
    console.error('Request ID:', error.requestId);
  }
}
```

## Configuration

Default configuration:
- `baseURL`: `/api`
- `timeout`: `30000` (30 seconds)
- `retry`: 3 attempts with exponential backoff
- `credentials`: `same-origin`

Override per request:
```typescript
const response = await defaultClient.get('/endpoint', {
  timeout: 60000,
  retry: { maxRetries: 1 },
  cache: 'no-store',
});
```

## Version History

- **v0.41.0**: API Envelope Standardization
- **v0.41.11**: API Client Consolidation (Foundation Layer)
- **v0.41.12-0.41.14**: API Client Adoption (Batches 1-3)
- **v0.41.15**: API Client Cleanup & Deprecation Pass

## Deprecation Notice

Legacy API clients (`@/lib/apiBase`, `@/lib/apiClient`) are deprecated and will be removed in v0.42.0+.

Migrate to `defaultClient` from `@parel/api/client` for:
- Better type safety
- Automatic envelope parsing
- Retry logic and timeout handling
- Unified error handling
- Future-proof API

