# PareL Testing & QA Guide (v0.11.5)

## Overview

Comprehensive testing strategy with automated unit tests, E2E tests, and performance benchmarks.

---

## Test Stack

### Frameworks

- **Vitest** - Unit and integration tests
- **Playwright** - End-to-end tests
- **@testing-library/react** - Component tests
- **Coverage** - V8 code coverage (80% minimum)

### Structure

```
apps/web/
├── tests/
│   ├── api/              # API endpoint tests
│   │   ├── user.test.ts
│   │   ├── shop.test.ts
│   │   └── world.test.ts
│   ├── ui/               # Component tests
│   │   └── onboarding.test.tsx
│   ├── performance/      # Performance benchmarks
│   │   └── performance.test.ts
│   ├── setup.ts          # Test configuration
│   └── README.md
├── e2e/                  # Playwright E2E tests
│   ├── auth.spec.ts
│   └── shop.spec.ts
└── coverage/             # Coverage reports
    └── coverage-summary.json
```

---

## Running Tests

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# CI mode (with JSON output)
pnpm test:ci
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Interactive mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# CI mode
pnpm test:e2e:ci
```

### All Tests

```bash
# Run everything
pnpm test:coverage && pnpm test:e2e
```

---

## Test Suites

### 1. User API Tests

**File:** `tests/api/user.test.ts`

**Coverage:**
- Authentication (5 tests)
  - Reject unauthenticated
  - Valid credentials
  - Invalid credentials
  - User registration
  - Email validation
- Profile (4 tests)
  - Fetch profile
  - Update profile
  - Validate data
  - Handle not found
- Performance (2 tests)
  - Response < 250ms
  - Concurrent requests

**Run:**
```bash
pnpm test tests/api/user.test.ts
```

### 2. Shop API Tests

**File:** `tests/api/shop.test.ts`

**Coverage:**
- Items (4 tests)
  - List items
  - Filter by type
  - Sort by price
  - Pagination
- Purchases (5 tests)
  - Successful purchase
  - Insufficient funds
  - Inventory update
  - Gold deduction
  - Duplicate prevention
- Performance (2 tests)
  - List < 250ms
  - Cache usage

**Run:**
```bash
pnpm test tests/api/shop.test.ts
```

### 3. World State Tests

**File:** `tests/api/world.test.ts`

**Coverage:**
- State Management (4 tests)
  - Fetch state
  - Update variables
  - Calculate alignment
  - Trigger events
- Contributions (3 tests)
  - Record contribution
  - Aggregate daily
  - Rate limiting
- Performance (2 tests)
  - Response < 250ms
  - Caching

**Run:**
```bash
pnpm test tests/api/world.test.ts
```

### 4. Onboarding UI Tests

**File:** `tests/ui/onboarding.test.tsx`

**Coverage:**
- Welcome Overlay (4 tests)
  - Render message
  - Show sections
  - CTA and skip buttons
  - Close interaction
- Getting Started (3 tests)
  - Show steps
  - Display rewards
  - Track completion
- Tutorial Quest (4 tests)
  - Auto-start
  - Show current step
  - Advance on completion
  - Award XP
- Accessibility (3 tests)
  - ARIA labels
  - Keyboard navigation
  - Color contrast

**Run:**
```bash
pnpm test tests/ui/onboarding.test.tsx
```

### 5. Performance Tests

**File:** `tests/performance/performance.test.ts`

**Benchmarks:**
- API Response Time
  - Average < 250ms
  - 100 concurrent requests
- Database Queries
  - Indexed queries < 100ms
  - Index usage
  - Pagination
- Caching
  - Cached results < 50ms
  - Cache invalidation
- Memory Usage
  - No memory leaks

**Run:**
```bash
pnpm test tests/performance/performance.test.ts
```

---

## Coverage Requirements

### Thresholds (Enforced)

```json
{
  "lines": 80,
  "functions": 80,
  "branches": 80,
  "statements": 80
}
```

**Coverage Report:**

```bash
# Generate HTML report
pnpm test:coverage

# View report
open coverage/index.html
```

**CI Mode:**

```bash
# Fails if coverage < 80%
pnpm test:ci
```

---

## Performance Assertions

### API Response Time

**Requirement:** Average < 250ms

```typescript
it('should respond within 250ms average', async () => {
  const times: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await fetch('/api/endpoint');
    times.push(Date.now() - start);
  }
  
  const average = times.reduce((a, b) => a + b) / times.length;
  expect(average).toBeLessThan(250);
});
```

### Database Query Time

**Requirement:** Indexed queries < 100ms

```typescript
it('should execute within 100ms', async () => {
  const start = Date.now();
  await prisma.user.findMany({ where: { id: userId } });
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(100);
});
```

### Memory Leaks

**Requirement:** No significant growth

```typescript
it('should not leak memory', async () => {
  const initial = process.memoryUsage().heapUsed;
  
  for (let i = 0; i < 100; i++) {
    await doWork();
  }
  
  if (global.gc) global.gc();
  const final = process.memoryUsage().heapUsed;
  
  expect(final - initial).toBeLessThan(10 * 1024 * 1024); // < 10MB
});
```

---

## QA Metrics Dashboard

### Endpoint

**GET** `/api/reports/qa`

**Response:**

```json
{
  "timestamp": "2025-10-13T16:00:00.000Z",
  "status": "excellent",
  "healthScore": 92,
  "coverage": {
    "total": {
      "lines": { "pct": 85.4 },
      "functions": { "pct": 82.1 },
      "branches": { "pct": 78.9 },
      "statements": { "pct": 86.2 }
    },
    "timestamp": "2025-10-13T15:30:00.000Z"
  },
  "testResults": {
    "total": 47,
    "passed": 45,
    "failed": 2,
    "skipped": 0,
    "duration": 2456
  },
  "performanceMetrics": {
    "api": {
      "averageResponseTime": 145,
      "p95ResponseTime": 230,
      "p99ResponseTime": 340
    },
    "database": {
      "averageQueryTime": 45,
      "slowQueries": 2
    }
  },
  "thresholds": {
    "coverage": { "min": 80, "current": 85.4 },
    "testPass": { "min": 95, "current": 95.7 },
    "apiResponseTime": { "max": 250, "current": 145 },
    "dbQueryTime": { "max": 100, "current": 45 }
  }
}
```

**Health Score:**

```
95-100: excellent ✅
85-94:  good      ✅
70-84:  fair      ⚠️
0-69:   poor      ❌
```

---

## CI Integration

### GitHub Actions Example

```yaml
name: Test & QA

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Check coverage thresholds
        run: |
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```

### Test Output

**JSON Summary:**

```json
{
  "numTotalTests": 47,
  "numPassedTests": 45,
  "numFailedTests": 2,
  "numPendingTests": 0,
  "testResults": [
    {
      "name": "tests/api/user.test.ts",
      "status": "passed",
      "duration": 245
    }
  ]
}
```

---

## Writing Tests

### API Test Pattern

```typescript
import { describe, it, expect } from 'vitest';

describe('API Endpoint', () => {
  it('should return expected data', async () => {
    // Arrange
    const userId = "test-user";
    
    // Act
    const response = await fetch(`/api/user/${userId}`);
    const data = await response.json();
    
    // Assert
    expect(response.ok).toBe(true);
    expect(data.user.id).toBe(userId);
  });
  
  it('should handle errors gracefully', async () => {
    const response = await fetch('/api/user/invalid');
    
    expect(response.status).toBe(404);
  });
});
```

### Component Test Pattern

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('should handle click', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Performance Test Pattern

```typescript
it('should meet performance requirements', async () => {
  const start = Date.now();
  
  await performOperation();
  
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(250);
});
```

---

## Best Practices

### Test Organization

```typescript
describe('Feature', () => {
  describe('Subfeature', () => {
    it('should do specific thing', () => {
      // Test implementation
    });
  });
});
```

### Test Naming

```typescript
// ✅ Good: Descriptive and specific
it('should return 404 when user does not exist', () => {});

// ❌ Bad: Vague
it('should work', () => {});
```

### Assertions

```typescript
// ✅ Good: Specific assertions
expect(response.status).toBe(200);
expect(data.user.email).toBe('test@example.com');

// ❌ Bad: Truthy checks only
expect(response.ok).toBeTruthy();
```

### Async Tests

```typescript
// ✅ Good: Async/await
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// ❌ Bad: No await
it('should fetch data', () => {
  fetchData(); // Promise not awaited
});
```

---

## Coverage Goals

### Target: 80% Minimum

**Priority Coverage:**
- API routes: 90%+
- Business logic: 85%+
- UI components: 75%+
- Utilities: 95%+

**Exclude:**
- Placeholder files
- Configuration files
- Type definitions
- Generated code

---

## QA Dashboard Integration

### Metrics Display

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function QADashboard() {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    fetch('/api/reports/qa')
      .then(r => r.json())
      .then(setMetrics);
  }, []);
  
  if (!metrics) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>QA Metrics</h1>
      
      <div>
        <h2>Health Score: {metrics.healthScore}%</h2>
        <p>Status: {metrics.status}</p>
      </div>
      
      <div>
        <h3>Coverage</h3>
        <p>Lines: {metrics.coverage.total.lines.pct}%</p>
        <p>Functions: {metrics.coverage.total.functions.pct}%</p>
      </div>
      
      <div>
        <h3>Tests</h3>
        <p>Passed: {metrics.testResults.passed}/{metrics.testResults.total}</p>
        <p>Failed: {metrics.testResults.failed}</p>
      </div>
      
      <div>
        <h3>Performance</h3>
        <p>API: {metrics.performanceMetrics.api.averageResponseTime}ms</p>
        <p>DB: {metrics.performanceMetrics.database.averageQueryTime}ms</p>
      </div>
    </div>
  );
}
```

---

## Troubleshooting

### Tests Timing Out

```typescript
// Increase timeout
it('slow test', async () => {
  // ...
}, { timeout: 20000 }); // 20 seconds
```

### Database Tests Failing

```bash
# Ensure test database is clean
pnpm prisma db push --force-reset

# Run migrations
pnpm prisma migrate deploy
```

### Coverage Below Threshold

```bash
# Check which files have low coverage
pnpm test:coverage

# View HTML report
open coverage/index.html
```

---

## Performance Benchmarks

### Target Metrics

```
API Response Time:    < 250ms average
Database Query Time:  < 100ms average
Frontend Load Time:   < 2s
Time to Interactive:  < 3s
Bundle Size:          < 500KB
```

### Monitoring

```typescript
// tests/performance/performance.test.ts
describe('Performance Benchmarks', () => {
  it('should meet API response time', async () => {
    const times = await measureApiResponseTimes(10);
    const avg = times.reduce((a, b) => a + b) / times.length;
    
    expect(avg).toBeLessThan(250);
  });
  
  it('should meet DB query time', async () => {
    const start = Date.now();
    await prisma.user.findMany();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
});
```

---

## Best Practices

### Test Independence

```typescript
// ✅ Good: Each test is independent
describe('User', () => {
  it('test 1', () => {
    const user = createTestUser();
    // Test with user
  });
  
  it('test 2', () => {
    const user = createTestUser();
    // Test with user
  });
});

// ❌ Bad: Tests depend on each other
let sharedUser;
it('create user', () => { sharedUser = create(); });
it('update user', () => { update(sharedUser); });
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock external dependencies
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

it('should send email', async () => {
  await registerUser();
  
  expect(sendEmail).toHaveBeenCalledWith(
    expect.objectContaining({ to: 'user@example.com' })
  );
});
```

### Cleanup

```typescript
import { afterEach } from 'vitest';

afterEach(async () => {
  // Clean up test data
  await prisma.testUser.deleteMany();
});
```

---

## Checklist

### Setup
- [x] Vitest configured
- [x] Playwright configured
- [x] Coverage thresholds (80%)
- [x] CI test script
- [x] QA metrics endpoint

### Test Suites
- [x] User API (11 tests)
- [x] Shop API (11 tests)
- [x] World API (9 tests)
- [x] Onboarding UI (14 tests)
- [x] Performance (9 tests)

### Performance
- [x] API < 250ms assertions
- [x] DB < 100ms assertions
- [x] Memory leak tests
- [x] Concurrent load tests

### CI/CD
- [x] Test command (test:ci)
- [x] JSON output
- [x] Coverage reporting
- [x] Fail on low coverage

---

**Last Updated:** v0.11.5 (2025-10-13)










