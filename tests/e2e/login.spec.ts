import { test, expect } from '@playwright/test';

test.describe('Login entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows the current app title', async ({ page }) => {
    await expect(page).toHaveTitle(/إدارة العيادة الذكية/i);
  });

  test('shows doctor login button with Google', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test('shows secretary login option', async ({ page }) => {
    const secretaryOption = page.getByRole('button', { name: /سكرتارية/i });
    await expect(secretaryOption).toBeVisible();
  });

  test('does not allow unauthenticated access to home route', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/\/home(?:\/|$)/);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });
});
