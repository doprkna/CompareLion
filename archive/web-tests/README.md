# PareL Test Suite - v0.13.2

## Overview
This directory contains the test suite for PareL, organized by type and functionality.

## Test Structure

```
__tests__/
├── api/                    # API endpoint tests
│   ├── health.smoke.test.ts       # Health endpoint smoke tests
│   └── flow-answers.test.ts       # Flow API tests
├── integration/            # Integration tests
│   └── flow-integration.test.ts   # Full flow journey tests
├── lib/                    # Library/utility tests
│   ├── text.test.ts               # Text normalization tests
│   └── services/
│       └── flowService.test.ts    # Flow service unit tests
├── karma.test.ts          # Karma system tests
├── prestige.test.ts       # Prestige system tests
└── example.test.ts        # Example/demo tests
```

## Test Categories

### 1. Unit Tests
- **lib/text.test.ts**: Tests for `normalizeQuestionText()` function
  - Whitespace trimming
  - Space normalization
  - Punctuation removal
  - Case conversion
  - Unicode handling

- **lib/services/flowService.test.ts**: Tests for flow service functions
  - `getNextQuestionForUser()` - Sequential question fetching
  - `answerQuestion()` - Answer recording and scoring
  - `skipQuestion()` - Skip functionality
  - `getUserProgressStats()` - Progress tracking
  - `getNextQuestion()` - Category-based question fetching

### 2. Integration Tests
- **integration/flow-integration.test.ts**: Full user flow journey
  - User login simulation
  - Question fetching
  - Answering questions
  - Skipping questions
  - Completion tracking
  - Score calculation

### 3. Smoke Tests
- **api/health.smoke.test.ts**: Health endpoint verification
  - Status code validation (200 OK)
  - Response structure validation
  - Database connectivity check
  - Cache headers validation

## Running Tests

### Run All Tests
```bash
cd apps/web
pnpm test
```

### Run Specific Test File
```bash
pnpm test __tests__/lib/text.test.ts
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Run E2E Tests
```bash
pnpm test:e2e
```

## Test Configuration

Tests are configured using **Vitest** (not Jest, despite the presence of jest.config.js at root).

**Configuration file**: `apps/web/vitest.config.ts`

Key settings:
- Environment: `jsdom`
- Setup file: `./tests/setup.ts`
- Coverage provider: `v8`
- Coverage thresholds: 80% (lines, functions, branches, statements)

## Database Requirements

⚠️ **Important**: Some tests require a live database connection:
- `flowService.test.ts`
- `flow-integration.test.ts`

These tests will fail if:
1. No PostgreSQL database is running
2. Database credentials in `DATABASE_URL` are incorrect
3. Prisma schema is not synchronized

### Running DB-Dependent Tests

1. Ensure PostgreSQL is running
2. Set valid `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/parel_test"
   ```
3. Run migrations:
   ```bash
   pnpm db:push
   ```
4. Run tests:
   ```bash
   pnpm test
   ```

## Mocked Dependencies

The test setup (`tests/setup.ts`) provides mocks for:
- Next.js server components (NextRequest, NextResponse)
- Prisma client (for non-DB tests)
- Email service (Resend)
- Rate limiting
- hCaptcha
- Audit service
- JWT/session utilities
- Sentry

## Writing New Tests

### Unit Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '@/lib/your-module';

describe('your-module.ts', () => {
  it('should do something', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Template
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@parel/db/src/client';

describe('Integration: Feature Name', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  it('should complete full flow', async () => {
    // Test implementation
  });
});
```

## Coverage Reports

Coverage reports are generated in:
- **HTML**: `apps/web/coverage/index.html`
- **JSON**: `apps/web/coverage/coverage.json`
- **Text**: Console output

View HTML coverage:
```bash
cd apps/web
pnpm test:coverage
# Then open: coverage/index.html
```

## Troubleshooting

### Tests Fail with "Cannot find module"
- Run `pnpm install` to ensure all dependencies are installed

### Database Connection Errors
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` environment variable
- Run `pnpm db:push` to sync schema

### Mock-Related Errors
- Check `tests/setup.ts` for mock configurations
- Use `vi.clearAllMocks()` in `afterEach` to reset mocks

### Coverage Package Missing
```bash
pnpm add -D @vitest/coverage-v8
```

## CI/CD Integration

For continuous integration, use:
```bash
pnpm test:ci
```

This runs tests with:
- JSON reporter
- Coverage collection
- Test results output file

## Best Practices

1. **Isolated Tests**: Each test should be independent
2. **Cleanup**: Always clean up test data in `afterAll`/`afterEach`
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Mock External Services**: Don't call real APIs in tests
6. **Fast Tests**: Keep unit tests fast (< 100ms each)
7. **Coverage Goals**: Aim for 80%+ coverage on critical paths

## Test Metrics (v0.13.2)

- **Total Test Files**: 18
- **Total Tests**: 139
- **Passing Tests**: 99+ (when DB configured)
- **Test Execution Time**: ~20s
- **Coverage Target**: 80%

## Support

For questions or issues with tests:
1. Check test output for specific error messages
2. Review `tests/setup.ts` for mock configurations
3. Verify database connectivity for integration tests
4. Check Vitest documentation: https://vitest.dev


