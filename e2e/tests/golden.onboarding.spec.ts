import { test, expect } from '@playwright/test';
import { loginAsDemo } from '../utils/login';
import { withGuards } from '../utils/guards';

test.describe('Golden path: first session win', () => {
  test('login → main → reach flow milestone or XP', async ({ page }) => {
    await loginAsDemo(page);

    await withGuards(page, async () => {
      await page.goto('/main');
      await expect(page.getByTestId('primary-cta')).toBeVisible();

      await page.getByTestId('primary-cta').click();
      await expect(page).toHaveURL(/\/flow-demo/);

      await page.waitForSelector('[data-testid="flow-category-start"]');
      await page.getByTestId('flow-category').first().click();
      await page.getByTestId('flow-category-start').click();

      await expect(page.getByTestId('question-text')).toBeVisible({ timeout: 10_000 });
      const answerOption = page.getByTestId('answer-option').first();
      await answerOption.click();
      await page.getByTestId('next-button').click();

      await expect(page.getByTestId('flow-result')).toBeVisible({ timeout: 15_000 });

      await page.screenshot({ path: 'e2e/screenshots/golden-onboarding-win.png' });
    });
  });
});
