import { test, expect } from '@playwright/test';

test.describe('Public booking pages', () => {
  test('loads the root page without runtime errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('serves a valid PWA manifest', async ({ page }) => {
    const response = await page.request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.lang).toBe('ar');
  });

  test('registers a service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForFunction(
      () => navigator.serviceWorker.getRegistrations().then((registrations) => registrations.length > 0),
      undefined,
      { timeout: 15000 }
    );

    const isRegistered = await page.evaluate(
      () => navigator.serviceWorker.getRegistrations().then((registrations) => registrations.length > 0)
    );
    expect(isRegistered).toBe(true);
  });

  test('renders Arabic RTL direction', async ({ page }) => {
    await page.goto('/');
    const direction = await page.evaluate(() => document.documentElement.dir || document.body.dir);
    expect(direction).toBe('rtl');
  });
});

test.describe('Public booking with invalid doctor link', () => {
  test('shows fallback content for an invalid secret', async ({ page }) => {
    await page.goto('/book/invalid-secret-that-does-not-exist');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.textContent('body');
    expect((bodyText || '').length).toBeGreaterThan(10);
  });
});
