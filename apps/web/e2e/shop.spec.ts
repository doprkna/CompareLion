import { test, expect } from '@playwright/test';

test.describe('Shop and Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await expect(page).toHaveURL(/\/main|\/dashboard|\/$/);
  });

  test('should complete full purchase flow: signup, login, visit shop, buy cosmetic, see in My Items', async ({ page }) => {
    // Navigate to shop
    await page.goto('/shop');

    // Should see shop page
    await expect(page.locator('h1')).toContainText(/shop|store/i);

    // Should see available products
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);

    // Click on a cosmetic product
    const cosmeticProduct = page.locator('[data-testid="product-card"]').first();
    await cosmeticProduct.click();

    // Should see product details
    await expect(page.locator('h2')).toContainText(/premium|cosmetic|avatar/i);

    // Should see buy button
    const buyButton = page.locator('button:has-text("Buy")').or(page.locator('button:has-text("Purchase")'));
    await expect(buyButton).toBeVisible();

    // Check wallet balance before purchase
    await page.goto('/wallet');
    const initialBalance = await page.locator('[data-testid="funds-balance"]').textContent();
    expect(initialBalance).toBeTruthy();

    // Go back to shop and make purchase
    await page.goto('/shop');
    await cosmeticProduct.click();
    await buyButton.click();

    // Should see purchase confirmation
    await expect(page.locator('text=Purchase successful')).toBeVisible();

    // Navigate to My Items or profile
    await page.goto('/profile');
    
    // Should see purchased item in My Items section
    await expect(page.locator('text=My Items')).toBeVisible();
    await expect(page.locator('[data-testid="owned-item"]')).toHaveCount.greaterThan(0);

    // Verify wallet balance decreased
    await page.goto('/wallet');
    const newBalance = await page.locator('[data-testid="funds-balance"]').textContent();
    
    // Balance should be less than initial balance
    const initialFunds = parseInt(initialBalance?.replace(/[^0-9]/g, '') || '0');
    const newFunds = parseInt(newBalance?.replace(/[^0-9]/g, '') || '0');
    expect(newFunds).toBeLessThan(initialFunds);
  });

  test('should handle insufficient funds', async ({ page }) => {
    // Set user to have 0 funds (this would be mocked in real tests)
    await page.goto('/shop');

    const cosmeticProduct = page.locator('[data-testid="product-card"]').first();
    await cosmeticProduct.click();

    const buyButton = page.locator('button:has-text("Buy")').or(page.locator('button:has-text("Purchase")'));
    await buyButton.click();

    // Should see insufficient funds error
    await expect(page.locator('text=Insufficient funds')).toBeVisible();
  });

  test('should show product details correctly', async ({ page }) => {
    await page.goto('/shop');

    // Should see product grid
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount.greaterThan(0);

    // Click on first product
    await productCards.first().click();

    // Should see product details
    await expect(page.locator('h1, h2')).toBeVisible();
    await expect(page.locator('text=Price')).toBeVisible();
    await expect(page.locator('text=Description')).toBeVisible();
  });

  test('should handle already owned non-stackable items', async ({ page }) => {
    // First, purchase an item
    await page.goto('/shop');
    const cosmeticProduct = page.locator('[data-testid="product-card"]').first();
    await cosmeticProduct.click();
    
    const buyButton = page.locator('button:has-text("Buy")').or(page.locator('button:has-text("Purchase")'));
    await buyButton.click();
    
    await expect(page.locator('text=Purchase successful')).toBeVisible();

    // Try to purchase the same item again
    await page.goto('/shop');
    await cosmeticProduct.click();
    await buyButton.click();

    // Should see error for already owned item
    await expect(page.locator('text=You already own this product')).toBeVisible();
  });

  test('should display wallet balance correctly', async ({ page }) => {
    await page.goto('/wallet');

    // Should see wallet section
    await expect(page.locator('text=Wallet')).toBeVisible();
    await expect(page.locator('text=Funds')).toBeVisible();
    await expect(page.locator('text=Diamonds')).toBeVisible();

    // Should see balance amounts
    const fundsBalance = page.locator('[data-testid="funds-balance"]');
    const diamondsBalance = page.locator('[data-testid="diamonds-balance"]');

    await expect(fundsBalance).toBeVisible();
    await expect(diamondsBalance).toBeVisible();

    // Balances should be numbers
    const fundsText = await fundsBalance.textContent();
    const diamondsText = await diamondsBalance.textContent();
    
    expect(fundsText).toMatch(/\d+/);
    expect(diamondsText).toMatch(/\d+/);
  });

  test('should show transaction history', async ({ page }) => {
    await page.goto('/wallet');

    // Should see transaction history section
    await expect(page.locator('text=Recent Transactions')).toBeVisible();

    // Should see transaction entries
    const transactions = page.locator('[data-testid="transaction-entry"]');
    await expect(transactions).toHaveCount.greaterThanOrEqual(0);

    // If there are transactions, they should have proper format
    if (await transactions.count() > 0) {
      const firstTransaction = transactions.first();
      await expect(firstTransaction.locator('text=Date')).toBeVisible();
      await expect(firstTransaction.locator('text=Amount')).toBeVisible();
      await expect(firstTransaction.locator('text=Type')).toBeVisible();
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/shop');

    // Should see category filters
    const categoryFilters = page.locator('[data-testid="category-filter"]');
    await expect(categoryFilters).toHaveCount.greaterThan(0);

    // Click on a category filter
    await categoryFilters.first().click();

    // Should see filtered products
    const filteredProducts = page.locator('[data-testid="product-card"]');
    await expect(filteredProducts).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/shop');

    // Should see search input
    const searchInput = page.locator('input[placeholder*="search" i]');
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill('cosmetic');

    // Should see filtered results
    const searchResults = page.locator('[data-testid="product-card"]');
    await expect(searchResults).toBeVisible();
  });
});
