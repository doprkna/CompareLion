import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto('/signup');
  
  // Create test user
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="confirmPassword"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Wait for signup success
  await expect(page.locator('text=Account created successfully')).toBeVisible();
  
  // Mock email verification
  await page.goto('/verify?token=mock-verification-token');
  await expect(page.locator('text=Email verified successfully')).toBeVisible();
  
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Wait for successful login
  await expect(page).toHaveURL(/\/main|\/dashboard|\/$/);
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});
