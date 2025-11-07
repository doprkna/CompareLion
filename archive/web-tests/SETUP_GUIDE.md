# Test Setup Guide - PareL v0.13.2

## Quick Start

### 1. Install Dependencies
```bash
cd apps/web
pnpm install
pnpm add -D @vitest/coverage-v8
```

### 2. Configure Environment
Create `.env.test` or ensure `.env` has:
```bash
NODE_ENV=test
DATABASE_URL="postgresql://user:password@localhost:5432/parel_test"
JWT_SECRET="test-secret-key-for-testing-only"
RESEND_API_KEY="test-resend-key"
APP_MAIL_FROM="test@example.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Test Database (Optional for full suite)
```bash
# Create test database
createdb parel_test

# Run migrations
cd ../../
pnpm db:push

# Or use existing dev database
# DATABASE_URL="postgresql://user:password@localhost:5432/parel_dev"
```

### 4. Run Tests

#### All Tests
```bash
cd apps/web
pnpm test
```

#### Unit Tests Only (No DB required)
```bash
pnpm test __tests__/lib/text.test.ts
pnpm test __tests__/api/health.smoke.test.ts
```

#### With Coverage
```bash
pnpm test:coverage
```

#### Watch Mode
```bash
pnpm test:watch
```

## Test Categories

### ✅ No Database Required
These tests use mocks and don't need a live database:
- `__tests__/lib/text.test.ts` - Text normalization unit tests
- `__tests__/api/health.smoke.test.ts` - Health endpoint smoke tests
- `__tests__/karma.test.ts` - Karma calculation tests
- `__tests__/example.test.ts` - Example tests
- `tests/simple.test.ts` - Simple validation tests
- `tests/ui/onboarding.test.tsx` - UI component tests

### 🗄️ Database Required
These tests need a live PostgreSQL connection:
- `__tests__/lib/services/flowService.test.ts` - Flow service unit tests
- `__tests__/integration/flow-integration.test.ts` - Flow integration tests
- `tests/api/auth/*.test.ts` - Auth API tests (partial)
- `tests/api/user.test.ts` - User API tests
- `tests/api/shop.test.ts` - Shop API tests

## Commands Reference

### From Root (`parel-mvp/`)
```bash
# Run all web tests
pnpm test:web

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### From Web App (`apps/web/`)
```bash
# Run all tests
pnpm test

# Run specific file
pnpm test __tests__/lib/text.test.ts

# Run with pattern
pnpm test -- text

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui
```

## Expected Results (Without DB)

```
✓ __tests__/lib/text.test.ts (8 tests) - PASS
✓ __tests__/api/health.smoke.test.ts (4 tests) - PASS
✓ __tests__/karma.test.ts (13 tests) - PASS
✓ __tests__/example.test.ts (1 test) - PASS
✓ tests/simple.test.ts (3 tests) - PASS
✓ tests/ui/onboarding.test.tsx (14 tests) - PASS

Total: 43+ passing tests
```

## Expected Results (With DB)

```
✓ All of the above
✓ __tests__/lib/services/flowService.test.ts (17 tests) - PASS
✓ __tests__/integration/flow-integration.test.ts (1 test with 20+ assertions) - PASS
✓ tests/api/user.test.ts (11 tests) - PASS
✓ tests/api/shop.test.ts (11 tests) - PASS

Total: 99+ passing tests
```

## Troubleshooting

### Error: "Cannot find dependency '@vitest/coverage-v8'"
```bash
cd apps/web
pnpm add -D @vitest/coverage-v8
```

### Error: "Authentication failed against database"
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Create test database: `createdb parel_test`
- Run migrations: `pnpm db:push`

### Error: "Cannot find module '@/lib/...'"
- Path aliases are configured in `vitest.config.ts`
- Ensure you're running from `apps/web` directory
- Check that imports match actual file structure

### Tests Hang or Timeout
- Default timeout: 10 seconds (configurable in `vitest.config.ts`)
- Check for unclosed database connections
- Ensure `afterAll` hooks call `prisma.$disconnect()`

### Mock Not Working
- Check `tests/setup.ts` for mock definitions
- Use `vi.clearAllMocks()` in `afterEach`
- Import from actual module, not mock

## CI/CD Setup

For GitHub Actions or similar:

```yaml
- name: Setup Test Database
  run: |
    createdb parel_test
    pnpm db:push

- name: Run Tests
  run: pnpm test:ci
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/parel_test
    NODE_ENV: test
```

## Coverage Thresholds

Current thresholds (configured in `vitest.config.ts`):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

View detailed coverage:
```bash
pnpm test:coverage
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

## Performance

- Unit tests: < 100ms each
- Integration tests: < 500ms each
- Full suite: ~20 seconds (with DB)
- Smoke tests: < 1 second each

## Next Steps

1. ✅ Tests are configured and ready
2. ✅ Run unit tests without DB setup
3. 🔄 Setup test database for full coverage
4. 📊 Review coverage reports
5. 🚀 Integrate into CI/CD pipeline

For detailed test documentation, see `README.md` in this directory.


