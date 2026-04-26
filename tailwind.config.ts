import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

// ─────────────────────────────────────────────────────────────────────────────
// نظام الألوان الموحد للتطبيق — يعرّف الـaliases المستخدمة في الكود
// (brand/success/danger/warning/info). كانت غير معرّفة قبل كده، فالكلاسات
// زي bg-brand-600 و text-success-700 ما كانتش بتشتغل (الأزرار/البادجات بدون
// لون). نعرّفها كاملة هنا عشان كل ملفات التطبيق تشتغل صح من غير ما نعدّلها
// واحد واحد.
//
// الخريطة (وضع النهار فقط — مفيش وضع ليلي حالياً):
//   brand   = blue    (الأزرق هو الهوية الأساسية للتطبيق)
//   success = emerald (الإيجابي/CTA الموجب)
//   danger  = rose    (التدميري/إلغاء/خطأ)
//   warning = amber   (التحذير)
//   info    = sky     (للمعلومات الثانوية)
// ─────────────────────────────────────────────────────────────────────────────

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  // Prevent Tailwind from treating this regex character class as an arbitrary utility.
  blocklist: ['[-:|،]'],
  theme: {
    extend: {
      colors: {
        // alias كامل (50→950) لكل لون عشان أي درجة مستخدمة في الكود تشتغل
        brand: colors.blue,
        success: colors.emerald,
        danger: colors.rose,
        warning: colors.amber,
        info: colors.sky,
      },
      fontFamily: {
        'arabic': ['Droid Arabic Kufi', 'Cairo', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        // ظل lift خفيف بيستخدم في الأزرار (كان مفقود وبيتسبب في كلاس مش معرف)
        'lift': '0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
