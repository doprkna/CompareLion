import type { Page } from '@playwright/test';

const getBaseURL = () => process.env.BASE_URL ?? 'http://localhost:3001';

export async function loginAsDemo(page: Page): Promise<void> {
  const baseURL = getBaseURL();
  await page.goto(`${baseURL}/api/test-login?user=demo`);
  await page.goto(`${baseURL}/`);
}
