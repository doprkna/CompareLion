import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should sign up, verify email, and login successfully', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Fill out signup form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Submit signup form
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await expect(page.locator('text=Account created successfully')).toBeVisible();

    // Check if verification email was sent
    await expect(page.locator('text=Please check your email')).toBeVisible();

    // Mock email verification - simulate clicking verification link
    await page.goto('/verify?token=mock-verification-token');

    // Should see verification success message
    await expect(page.locator('text=Email verified successfully')).toBeVisible();

    // Navigate to login page
    await page.goto('/login');

    // Fill out login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit login form
    await page.click('button[type="submit"]');

    // Should be redirected to main page or dashboard
    await expect(page).toHaveURL(/\/main|\/dashboard|\/$/);

    // Should see user-specific content
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill out login form with invalid credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit login form
    await page.click('button[type="submit"]');

    // Should see error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle signup with existing email', async ({ page }) => {
    await page.goto('/signup');

    // Fill out signup form with existing email
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Submit signup form
    await page.click('button[type="submit"]');

    // Should see error message
    await expect(page.locator('text=Account already exists')).toBeVisible();
  });

  test('should validate signup form fields', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should see validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should see email validation error
    await expect(page.locator('text=Invalid email format')).toBeVisible();

    // Fill weak password
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');

    await page.click('button[type="submit"]');

    // Should see password validation error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/login');

    // Attempt multiple failed logins to trigger rate limiting
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      
      // Small delay between attempts
      await page.waitForTimeout(100);
    }

    // Should eventually see rate limiting message
    await expect(page.locator('text=Too many login attempts')).toBeVisible();
  });
});
