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

  // حالة الدور غير المحدد: لما الحارس يفصل الجلسه بعد timeout، بيحفظ رسالة
  // في localStorage. الاختبار ده يضمن إن الرساله بتظهر للمستخدم في صفحه الدخول
  // وإن المستخدم ميتعلّقش على شاشه تحميل بيضاء كاملة.
  test('shows role resolution error after forced signout', async ({ page }) => {
    // أولاً: نزور الـorigin عشان localStorage يبقى متاح
    await page.goto('/login');

    // نحاكي الحالة: الحارس فصل الجلسه وحفظ الرساله
    const expectedMessage = 'تعذَّر تحديد نوع حسابك. تأكَّد من اتصالك بالإنترنت ثم سجَّل دخول مرة أخرى.';
    await page.evaluate((msg) => {
      localStorage.setItem('dh_role_resolution_error', msg);
    }, expectedMessage);

    // إعادة تحميل الصفحه — الـbanner المفروض يظهر مع الرساله
    await page.reload();

    const banner = page.getByTestId('role-resolution-error');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('تعذَّر تحديد نوع حسابك');

    // وزر Google لازم يكون موجود برضه (المستخدم قادر يحاول تاني)
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  // حماية من اللفّة اللانهائيه على دومين المرضى:
  // قبل التصليح، الكود كان بيوجّه دائماً لـ/login، وعلى دومين المرضى AppCoreContent
  // بيحوّل /login → /login/public، فيرجع useAppRedirectEffect يوجّه لـ/login تاني = loop.
  // الاختبار ده بيضمن إن المستخدم يوصل لـ/login/public مع الـbanner، بدون لفّه.
  test('avoids redirect loop on patient host when role error is set', async ({ page }) => {
    // نزور الـorigin عشان نقدر نكتب في localStorage (نفس الـorigin سياسة الـbrowser)
    await page.goto('/');

    // نـoverride الدومين لـpatient + نحط الرساله
    await page.evaluate(() => {
      localStorage.setItem('__hostMode_override', 'patient');
      localStorage.setItem('dh_role_resolution_error', 'تعذَّر تحديد نوع حسابك...');
    });

    // المستخدم يحاول يفتح مسار داخلي على دومين المرضى — لازم يوصل لـ/login/public
    await page.goto('/home');

    // الـURL النهائي صحيح ومش بيـoscillate
    await page.waitForURL(/\/login\/public/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login\/public(?:\?|$)/);

    // الـbanner ظاهر في PublicLoginPage
    const banner = page.getByTestId('role-resolution-error');
    await expect(banner).toBeVisible();

    // تنظيف الـoverride عشان مايأثرش على اختبارات تانيه
    await page.evaluate(() => localStorage.removeItem('__hostMode_override'));
  });
});
