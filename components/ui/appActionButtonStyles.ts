type AppActionButtonTone = 'blue' | 'green' | 'danger' | 'neutral';

// ─────────────────────────────────────────────────────────────────────────────
// ستايل أزرار الأكشن المركزي — مستخدم في كل الـButton بالتطبيق.
// ملاحظة: brand-/success-/danger- المش معرفين في Tailwind بقوا real Tailwind colors:
//   blue   → blue-600 (إجراء عام/معلومات)
//   green  → emerald-600 (إجراء إيجابي/CTA)
//   danger → rose-600 (إجراء تدميري/إلغاء)
//   neutral → slate-200 (محايد)
// ─────────────────────────────────────────────────────────────────────────────
const APP_ACTION_BUTTON_TONE_CLASSES: Record<AppActionButtonTone, string> = {
  blue: 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-500 hover:from-blue-700 hover:via-blue-600 hover:to-blue-600 text-white border border-blue-700 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_18px_-2px_rgba(37,99,235,0.5)]',
  green: 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border border-emerald-700 shadow-[0_4px_12px_-2px_rgba(5,150,105,0.4)] hover:shadow-[0_6px_18px_-2px_rgba(5,150,105,0.5)]',
  danger: 'bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border border-rose-700 shadow-[0_4px_12px_-2px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_18px_-2px_rgba(225,29,72,0.5)]',
  neutral: 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300',
};

export const getAppActionButtonToneClass = (tone: AppActionButtonTone): string => APP_ACTION_BUTTON_TONE_CLASSES[tone];
