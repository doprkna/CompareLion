import { test, expect } from '@playwright/test';
test('health: root loads without error', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    expect(page.url()).toContain('localhost');
});
