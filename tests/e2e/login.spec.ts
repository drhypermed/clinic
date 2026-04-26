import { test, expect } from '@playwright/test';

test.describe('Login entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // العنوان بيتغيّر حسب الدومين (clinic vs patient). الـregex بيغطّي الاتنين.
  test('shows the current app title', async ({ page }) => {
    await expect(page).toHaveTitle(/دكتور هايبر|Dr Hyper/i);
  });

  test('shows doctor login button with Google', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();
  });

  test('shows secretary login option', async ({ page }) => {
    const secretaryOption = page.getByRole('button', { name: /سكرتارية/i });
    await expect(secretaryOption).toBeVisible();
  });

  // الزائر اللي يحاول يفتح /home (مسار داخلي محمي) لازم يتحوّل لـ/login.
  // ملاحظه: '/' دلوقتي بقت landing page عامّه (مش redirect)، فالاختبار اتغيّر
  // لـ/home عشان يتحقّق من حماية المسارات الداخليّه فعلاً.
  test('does not allow unauthenticated access to home route', async ({ page }) => {
    await page.goto('/home');
    await expect(page).not.toHaveURL(/\/home(?:\/|$)/);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });
});
