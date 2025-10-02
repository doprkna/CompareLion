# Test Suite

This directory contains the comprehensive test suite for the PareL MVP application.

## Test Structure

### Unit & API Tests (Vitest)
- **Location**: `tests/api/` and `tests/lib/`
- **Framework**: Vitest with jsdom environment
- **Coverage**: API endpoints, business logic, utilities

### E2E Tests (Playwright)
- **Location**: `e2e/`
- **Framework**: Playwright
- **Coverage**: Full user workflows, cross-browser testing

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test auth.test.ts
```

### E2E Tests
```bash
# Run all e2e tests
pnpm test:e2e

# Run e2e tests with UI
pnpm test:e2e:ui

# Run e2e tests in debug mode
pnpm test:e2e:debug
```

## Test Categories

### 1. Authentication Tests
- **Signup Flow**: Email validation, password requirements, duplicate accounts
- **Login Flow**: Valid/invalid credentials, rate limiting, account lockout
- **Email Verification**: Mock verification links, success/failure scenarios

### 2. Purchase Flow Tests
- **Product Validation**: Existence, active status, pricing
- **Wallet Operations**: Balance checks, insufficient funds, atomic transactions
- **Entitlement Management**: Stackable vs non-stackable products, ownership validation

### 3. Rate Limiting Tests
- **Login Rate Limits**: Per-minute and daily limits
- **Signup Rate Limits**: Hourly limits
- **Failed Login Tracking**: Account lockout after max attempts
- **Redis Integration**: LRU cache fallback when Redis unavailable

### 4. E2E User Journeys
- **Complete Signup Flow**: Signup → Email Verification → Login → Shop → Purchase → My Items
- **Authentication Edge Cases**: Invalid credentials, rate limiting, account lockout
- **Shop Experience**: Product browsing, purchase flow, wallet balance updates

## Test Data & Mocking

### Mock Data
- **Users**: Test user accounts with various states
- **Products**: Active/inactive, stackable/non-stackable items
- **Wallets**: Different balance scenarios
- **Transactions**: Purchase history, ledger entries

### Mocked Services
- **Database**: Prisma client with mocked responses
- **Email**: Resend service with mock delivery
- **Rate Limiting**: Redis with LRU cache fallback
- **Authentication**: JWT tokens and session management
- **External APIs**: Stripe, hCaptcha, newsletter providers

## CI/CD Integration

### GitHub Actions
- **Unit Tests**: Run on every PR with coverage reporting
- **E2E Tests**: Full browser testing with test database
- **Security Audit**: Dependency vulnerability scanning
- **Lint & Type Check**: Code quality validation

### Test Environment
- **Database**: PostgreSQL test instance
- **Browsers**: Chrome, Firefox, Safari (Desktop & Mobile)
- **Coverage**: Code coverage reporting with Codecov integration

## Writing New Tests

### Unit Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle success case', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/endpoint');
    
    // Act
    const response = await handler(request);
    
    // Assert
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test('user journey', async ({ page }) => {
  // Navigate to page
  await page.goto('/page');
  
  // Interact with elements
  await page.fill('input[name="field"]', 'value');
  await page.click('button[type="submit"]');
  
  // Assert results
  await expect(page.locator('text=Success')).toBeVisible();
});
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests independent and isolated
- Mock external dependencies

### Assertions
- Test both success and failure cases
- Validate response status codes
- Check error messages and data
- Verify side effects (database changes, emails)

### Performance
- Use parallel test execution
- Mock expensive operations
- Clean up test data
- Optimize test setup/teardown

## Debugging Tests

### Unit Tests
```bash
# Run with verbose output
pnpm test --reporter=verbose

# Run specific test with debug info
pnpm test --run auth.test.ts
```

### E2E Tests
```bash
# Run with headed browser
pnpm test:e2e --headed

# Run with debug mode
pnpm test:e2e:debug

# Generate trace for failed tests
pnpm test:e2e --trace on-first-retry
```

## Coverage Goals

- **Unit Tests**: >80% line coverage
- **API Endpoints**: 100% endpoint coverage
- **Critical Paths**: 100% e2e coverage
- **Business Logic**: >90% branch coverage

## Troubleshooting

### Common Issues
1. **Import Errors**: Check mock setup in `tests/setup.ts`
2. **Database Errors**: Verify test database configuration
3. **Timeout Issues**: Increase timeout for slow operations
4. **Mock Failures**: Ensure mocks are properly configured

### Getting Help
- Check test logs for detailed error messages
- Review mock configurations in setup files
- Verify environment variables are set correctly
- Ensure all dependencies are installed
