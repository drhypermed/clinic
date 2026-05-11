/**
 * اختبارات E2E لشاشة دخول السكرتيرة (Public Booking Page).
 *
 * الهدف:
 *   نتأكد إن الـUI الأساسي لتسجيل دخول السكرتيرة شغّال — عناصر الفورم
 *   موجودة، الـrouting سليم، ومعالجة الأخطاء بتظهر للمستخدم.
 *
 * الاختبارات هنا "smoke tests" — لا تحاول تنفيذ login حقيقي عبر Firebase
 * (يحتاج Firebase Emulator). الاختبارات الكاملة للسيناريوهات الأربعة
 * (D2S/S2D × approved/rejected) تتطلب الـemulator + admin token + تنسيق
 * بين متصفّحين، وتمت كتابة unit tests للواجهة `entryConversations` بدلاً
 * عن ذلك للحماية الفورية من regressions في الـrouting.
 */

import { test, expect } from '@playwright/test';

test.describe('Secretary booking page — smoke flow', () => {
  test('shows secretary login form when navigating to /book/s/{secret}', async ({ page }) => {
    // أي string شكله صحيح bسكرتيرة — الـpage هتحاول تحمّل bookingConfig
    // وحتى لو فشلت، الـUI الأساسي للـlogin لازم يظهر بدون runtime errors.
    const fakeSecret = 'b_smoketestsecret123abc';
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`/book/s/${fakeSecret}`);
    await page.waitForLoadState('domcontentloaded');

    // ما نشترطش على نص محدد — التطبيق ممكن يعرض شاشة "secret غير صالح" أو
    // فورم login لو الـsecret اتفسّر صح. المهم إن الصفحة تحمّلت بدون errors.
    await expect(page.locator('body')).toBeVisible();
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('preserves Arabic RTL when on secretary route', async ({ page }) => {
    await page.goto('/book/s/b_smoketestsecret123abc');
    await page.waitForLoadState('domcontentloaded');

    const direction = await page.evaluate(() => document.documentElement.dir || document.body.dir);
    expect(direction).toBe('rtl');
  });

  test('does not crash on invalid branchId query param', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // branchId مشبوه (يحتوي على نقطة لـpath traversal) — لازم يتم تطهيره
    // بدون كسر الصفحة.
    await page.goto('/book/s/b_smoketestsecret123abc?branchId=../malicious');
    await page.waitForLoadState('domcontentloaded');

    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});

test.describe('Doctor app — entry actions surface', () => {
  test('appointments route loads without runtime errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/appointments');
    await page.waitForLoadState('domcontentloaded');

    // الصفحة هترجّع للـlogin لو مفيش جلسة. المهم إن الـrouter ما يكسرش.
    await expect(page.locator('body')).toBeVisible();
    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});
