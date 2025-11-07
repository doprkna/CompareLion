# Integration Tests

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

## Test Structure

- `onboarding.test.ts` - Onboarding flow tests
- `auth.test.ts` - Authentication flow tests (TODO)
- `reflection.test.ts` - Reflection generation tests (TODO)
- `messaging.test.ts` - Messaging/comments tests (TODO)
- `shop.test.ts` - Shop/economy tests (TODO)

## Notes

- Tests require authentication mocking to be fully implemented
- E2E tests use Playwright for browser automation
- Integration tests use Vitest for API testing

## TODO

- [ ] Implement auth mocking helper
- [ ] Add reflection generation tests
- [ ] Add messaging flow tests
- [ ] Add shop purchase tests
- [ ] Increase test coverage to 80%+

