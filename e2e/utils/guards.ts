import type { Page } from '@playwright/test';

const allowedConsoleMessages: (string | RegExp)[] = [
  /hydration/i,
  /ResizeObserver/i,
];

const allowedFailedRequestUrls: (string | RegExp)[] = [
  /analytics|google-analytics|gtag|segment|amplitude/i,
  /fonts\.googleapis|fonts\.gstatic/i,
  /localhost.*favicon/i,
];

function isAllowed(msg: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === 'string' ? msg.includes(p) : p.test(msg)
  );
}

function isSameOrigin(url: string, base: string): boolean {
  try {
    const u = new URL(url, base);
    const b = new URL(base);
    return u.origin === b.origin;
  } catch {
    return false;
  }
}

export async function withGuards(
  page: Page,
  fn: () => Promise<void>
): Promise<void> {
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3001';
  const consoleErrors: string[] = [];
  const failedRequests: { url: string; status: number }[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isAllowed(text, allowedConsoleMessages)) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    const status = res.status();
    if (status >= 400 && isSameOrigin(url, baseURL)) {
      if (!isAllowed(url, allowedFailedRequestUrls)) {
        failedRequests.push({ url, status });
      }
    }
  });

  await fn();

  if (consoleErrors.length > 0) {
    throw new Error(
      `Console errors:\n${consoleErrors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
  if (failedRequests.length > 0) {
    throw new Error(
      `Failed requests (4xx/5xx):\n${failedRequests
        .map((r) => `  - ${r.status} ${r.url}`)
        .join('\n')}`
    );
  }
}
