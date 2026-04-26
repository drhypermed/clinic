# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login entry >> does not allow unauthenticated access to home route
- Location: tests\e2e\login.spec.ts:22:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /google/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /google/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]: ثبت التطبيق على الموبايل
      - generic [ref=e5]: التطبيق هيسهّل الوصول من الشاشة الرئيسية ويشتغل كتطبيق مستقل.
      - generic [ref=e6]: لو زر التثبيت مش ظاهر، افتح قائمة المتصفح واختر إضافة إلى الشاشة الرئيسية (Add to Home Screen).
      - generic [ref=e7]:
        - button "إخفاء مطلقًا" [ref=e8] [cursor=pointer]
        - button "إخفاء الآن" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - generic [ref=e12]:
        - generic [ref=e14]:
          - img "Dr Hyper" [ref=e15]
          - generic [ref=e16]:
            - generic [ref=e17]:
              - paragraph [ref=e18]: نظام متكامل لإدارة العيادات
              - img [ref=e19]
            - paragraph [ref=e21]: دكتور هايبر — الشريك الطبي والإداري الذكي اللي بيخلّي كل تفصيلة في عيادتك أحسن وأسرع.
            - generic [ref=e22]:
              - generic [ref=e23]:
                - generic [ref=e25]: ٥٬٥٠٠+
                - generic [ref=e26]: دواء
              - generic [ref=e28]:
                - generic [ref=e30]: ٢٠٠+
                - generic [ref=e31]: ميزة
        - generic [ref=e33]:
          - heading "كل اللي عيادتك محتاجاه في مكان واحد" [level=2] [ref=e34]
          - img [ref=e35]
        - generic [ref=e37]:
          - generic [ref=e41]:
            - img [ref=e43]
            - heading "كتابة وطباعة الروشتات" [level=3] [ref=e45]
            - paragraph [ref=e46]: روشتة احترافية بشعار عيادتك وبياناتك من تصميمك الشخصي — مع مقاسات ورق مخصصة، طباعة فورية، أو مشاركة مباشرة على واتساب.
          - generic [ref=e50]:
            - img [ref=e52]
            - heading "المساعدة في التشخيص" [level=3] [ref=e54]
            - paragraph [ref=e55]: اكتب الشكوى والتاريخ المرضي والفحوصات — والنظام يقترح عليك التشخيص المحتمل وتقدر تعدل عليه بكل سهولة، ويتضاف ويُكتب في الروشتة هو وكل تفاصيل المريض بشكل احترافي.
          - generic [ref=e59]:
            - img [ref=e61]
            - heading "اختيار الأدوية المناسبة" [level=3] [ref=e63]
            - paragraph [ref=e64]: جرعات آمنة تلقائياً بالوزن والعمر — مع تنبيهات للجرعة القصوى والاستخدامات والتحذيرات والتداخلات، وإمكانية التعديل عليها بعد الإضافة للروشتة.
          - generic [ref=e68]:
            - img [ref=e70]
            - heading "أدوات الأدوية المتقدمة" [level=3] [ref=e72]
            - paragraph [ref=e73]: فحص تفاعلات الأدوية، تعديل جرعات مرضى الكلى، وتصنيف أمان الأدوية في الحمل والرضاعة.
          - generic [ref=e77]:
            - img [ref=e79]
            - heading "الروشتات الذكية" [level=3] [ref=e81]
            - paragraph [ref=e82]: اعمل روشتة جاهزة بالأدوية والفحوصات والتعليمات وضيفها بضغطة زر — مع التعديل عليها قبل الطباعة لو عايز.
          - generic [ref=e86]:
            - img [ref=e88]
            - heading "حجز المواعيد إلكترونياً" [level=3] [ref=e90]
            - paragraph [ref=e91]: رابط حجز مخصّص لعيادتك — المرضى يحجزوا أونلاين وانت بتشوف كل حجز فوراً على شاشتك.
          - generic [ref=e95]:
            - img [ref=e97]
            - heading "تنسيق مع السكرتارية" [level=3] [ref=e99]
            - paragraph [ref=e100]: "السكرتارية تدخل بيانات المريض قبل الكشف وبتوصلك البيانات — وبتتواصل معاك بكل سهولة: تطلب دخول الحالة، وانت بترد بالموافقة أو الانتظار بشكل لحظي."
          - generic [ref=e104]:
            - img [ref=e106]
            - heading "ملفات وسجلات المرضى" [level=3] [ref=e108]
            - paragraph [ref=e109]: أرشيف كامل لكل زيارات المريض مع بحث متقدم بالاسم، التشخيص، الدواء، أو التاريخ.
          - generic [ref=e113]:
            - img [ref=e115]
            - heading "الحسابات والتأمينات" [level=3] [ref=e117]
            - paragraph [ref=e118]: إيرادات ومصروفات يومياً وشهرياً وسنوياً — مع دعم شركات التأمين، الخصومات، والفواتير.
          - generic [ref=e122]:
            - img [ref=e124]
            - heading "إدارة فروع متعددة" [level=3] [ref=e126]
            - paragraph [ref=e127]: أدر أكتر من فرع لعيادتك — كل فرع بإعداداته ومواعيده وحساباته وتسعيره المستقل.
          - generic [ref=e131]:
            - img [ref=e133]
            - heading "دليل الأطباء والتسويق" [level=3] [ref=e135]
            - paragraph [ref=e136]: صفحة عامة لعيادتك في الدليل العام — بخدماتك وتقييمات المرضى ورابط الحجز المباشر.
          - generic [ref=e140]:
            - img [ref=e142]
            - heading "إشعارات فورية" [level=3] [ref=e144]
            - paragraph [ref=e145]: تنبيهات لحظية على المتصفح والموبايل لكل حجز جديد، تحديث بيانات، أو طلب من السكرتارية.
          - generic [ref=e149]:
            - img [ref=e151]
            - heading "حماية وتشفير كامل" [level=3] [ref=e153]
            - paragraph [ref=e154]: بيانات المرضى مشفّرة بالكامل مع نسخ احتياطي تلقائي وصلاحيات مخصّصة لكل مستخدم.
      - generic [ref=e156]:
        - generic [ref=e158]:
          - heading "ابدأ رحلتك مع Dr Hyper Med" [level=2] [ref=e159]
          - paragraph [ref=e160]: افتح حسابك مجاناً في أقل من دقيقة، واختار الواجهة المناسبة لدورك — طبيب، سكرتارية، أو مريض.
        - button "دليل المستخدم جديد شوف كل ميزات التطبيق خطوه بخطوه قبل ما تسجّل — 10 مواضيع مرتّبه بالترتيب اللي هتستخدمه." [ref=e162] [cursor=pointer]:
          - generic [ref=e163]:
            - img [ref=e165]
            - generic [ref=e167]:
              - generic [ref=e168]:
                - heading "دليل المستخدم" [level=3] [ref=e169]
                - generic [ref=e170]: جديد
              - paragraph [ref=e171]: شوف كل ميزات التطبيق خطوه بخطوه قبل ما تسجّل — 10 مواضيع مرتّبه بالترتيب اللي هتستخدمه.
        - generic [ref=e172]:
          - generic [ref=e174]:
            - generic [ref=e175]:
              - img [ref=e177]
              - heading "للأطباء" [level=3] [ref=e179]
            - paragraph [ref=e180]: أنشئ حسابك وابدأ تدير عيادتك — الروشتات، المواعيد، الحسابات، والسجلات.
            - generic [ref=e181]:
              - button "إنشاء حساب" [ref=e182] [cursor=pointer]:
                - img [ref=e183]
                - text: إنشاء حساب
              - button "تسجيل الدخول" [ref=e185] [cursor=pointer]:
                - img [ref=e186]
                - text: تسجيل الدخول
          - generic [ref=e189]:
            - generic [ref=e190]:
              - img [ref=e192]
              - heading "للسكرتارية" [level=3] [ref=e194]
            - paragraph [ref=e195]: ادخل بيانات المرضى وأدر قائمة الانتظار — بإيميل الطبيب والرقم السري.
            - button "دخول السكرتارية" [ref=e196] [cursor=pointer]:
              - img [ref=e197]
              - text: دخول السكرتارية
      - contentinfo [ref=e199]:
        - generic [ref=e200]:
          - generic [ref=e201]:
            - generic [ref=e202]: Dr Hyper Med
            - generic [ref=e203]: — نظام إدارة العيادات
          - generic [ref=e204]:
            - img [ref=e205]
            - text: جميع البيانات مشفّرة ومحمية
  - iframe [ref=e207]:
    
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
  8  |   test('shows the current app title', async ({ page }) => {
  9  |     await expect(page).toHaveTitle(/إدارة العيادة الذكية/i);
  10 |   });
  11 | 
  12 |   test('shows doctor login button with Google', async ({ page }) => {
  13 |     const googleButton = page.getByRole('button', { name: /google/i });
  14 |     await expect(googleButton).toBeVisible();
  15 |   });
  16 | 
  17 |   test('shows secretary login option', async ({ page }) => {
  18 |     const secretaryOption = page.getByRole('button', { name: /سكرتارية/i });
  19 |     await expect(secretaryOption).toBeVisible();
  20 |   });
  21 | 
  22 |   test('does not allow unauthenticated access to home route', async ({ page }) => {
  23 |     await page.goto('/');
  24 |     await expect(page).not.toHaveURL(/\/home(?:\/|$)/);
> 25 |     await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  26 |   });
  27 | });
  28 | 
```