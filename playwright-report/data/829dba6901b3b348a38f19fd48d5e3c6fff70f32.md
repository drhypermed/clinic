# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login entry >> shows secretary login option
- Location: tests\e2e\login.spec.ts:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /سكرتارية/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /سكرتارية/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]: ثبت التطبيق على الموبايل
    - generic [ref=e5]: التطبيق هيسهّل الوصول من الشاشة الرئيسية ويشتغل كتطبيق مستقل.
    - generic [ref=e6]: لو زر التثبيت مش ظاهر، افتح قائمة المتصفح واختر إضافة إلى الشاشة الرئيسية (Add to Home Screen).
    - generic [ref=e7]:
      - button "إخفاء مطلقًا" [ref=e8] [cursor=pointer]
      - button "إخفاء الآن" [ref=e9] [cursor=pointer]
  - status:
    - generic:
      - img
      - generic: جاري مزامنة التغييرات مع السيرفر
  - status [ref=e10]
```

# Test source

```ts
  1  | ﻿import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Login entry', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |   });
  7  | 
  8  |   // العنوان بيتغيّر حسب الدومين (clinic vs patient). الـregex بيغطّي الاتنين.
  9  |   test('shows the current app title', async ({ page }) => {
  10 |     await expect(page).toHaveTitle(/دكتور هايبر|Dr Hyper/i);
  11 |   });
  12 | 
  13 |   test('shows doctor login button with Google', async ({ page }) => {
  14 |     const googleButton = page.getByRole('button', { name: /google/i });
  15 |     await expect(googleButton).toBeVisible();
  16 |   });
  17 | 
  18 |   test('shows secretary login option', async ({ page }) => {
  19 |     const secretaryOption = page.getByRole('button', { name: /سكرتارية/i });
> 20 |     await expect(secretaryOption).toBeVisible();
     |                                   ^ Error: expect(locator).toBeVisible() failed
  21 |   });
  22 | 
  23 |   // الزائر اللي يحاول يفتح /home (مسار داخلي محمي) لازم يتحوّل لـ/login.
  24 |   // ملاحظه: '/' دلوقتي بقت landing page عامّه (مش redirect)، فالاختبار اتغيّر
  25 |   // لـ/home عشان يتحقّق من حماية المسارات الداخليّه فعلاً.
  26 |   test('does not allow unauthenticated access to home route', async ({ page }) => {
  27 |     await page.goto('/home');
  28 |     await expect(page).not.toHaveURL(/\/home(?:\/|$)/);
  29 |     await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  30 |   });
  31 | 
  32 |   // حالة الدور غير المحدد: لما الحارس يفصل الجلسه بعد timeout، بيحفظ رسالة
  33 |   // في localStorage. الاختبار ده يضمن إن الرساله بتظهر للمستخدم في صفحه الدخول
  34 |   // وإن المستخدم ميتعلّقش على شاشه تحميل بيضاء كاملة.
  35 |   test('shows role resolution error after forced signout', async ({ page }) => {
  36 |     // أولاً: نزور الـorigin عشان localStorage يبقى متاح
  37 |     await page.goto('/login');
  38 | 
  39 |     // نحاكي الحالة: الحارس فصل الجلسه وحفظ الرساله
  40 |     const expectedMessage = 'تعذَّر تحديد نوع حسابك. تأكَّد من اتصالك بالإنترنت ثم سجَّل دخول مرة أخرى.';
  41 |     await page.evaluate((msg) => {
  42 |       localStorage.setItem('dh_role_resolution_error', msg);
  43 |     }, expectedMessage);
  44 | 
  45 |     // إعادة تحميل الصفحه — الـbanner المفروض يظهر مع الرساله
  46 |     await page.reload();
  47 | 
  48 |     const banner = page.getByTestId('role-resolution-error');
  49 |     await expect(banner).toBeVisible();
  50 |     await expect(banner).toContainText('تعذَّر تحديد نوع حسابك');
  51 | 
  52 |     // وزر Google لازم يكون موجود برضه (المستخدم قادر يحاول تاني)
  53 |     await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  54 |   });
  55 | 
  56 |   // حماية من اللفّة اللانهائيه على دومين المرضى:
  57 |   // قبل التصليح، الكود كان بيوجّه دائماً لـ/login، وعلى دومين المرضى AppCoreContent
  58 |   // بيحوّل /login → /login/public، فيرجع useAppRedirectEffect يوجّه لـ/login تاني = loop.
  59 |   // الاختبار ده بيضمن إن المستخدم يوصل لـ/login/public مع الـbanner، بدون لفّه.
  60 |   test('avoids redirect loop on patient host when role error is set', async ({ page }) => {
  61 |     // نزور الـorigin عشان نقدر نكتب في localStorage (نفس الـorigin سياسة الـbrowser)
  62 |     await page.goto('/');
  63 | 
  64 |     // نـoverride الدومين لـpatient + نحط الرساله
  65 |     await page.evaluate(() => {
  66 |       localStorage.setItem('__hostMode_override', 'patient');
  67 |       localStorage.setItem('dh_role_resolution_error', 'تعذَّر تحديد نوع حسابك...');
  68 |     });
  69 | 
  70 |     // المستخدم يحاول يفتح مسار داخلي على دومين المرضى — لازم يوصل لـ/login/public
  71 |     await page.goto('/home');
  72 | 
  73 |     // الـURL النهائي صحيح ومش بيـoscillate
  74 |     await page.waitForURL(/\/login\/public/, { timeout: 5000 });
  75 |     await expect(page).toHaveURL(/\/login\/public(?:\?|$)/);
  76 | 
  77 |     // الـbanner ظاهر في PublicLoginPage
  78 |     const banner = page.getByTestId('role-resolution-error');
  79 |     await expect(banner).toBeVisible();
  80 | 
  81 |     // تنظيف الـoverride عشان مايأثرش على اختبارات تانيه
  82 |     await page.evaluate(() => localStorage.removeItem('__hostMode_override'));
  83 |   });
  84 | });
  85 | 
```