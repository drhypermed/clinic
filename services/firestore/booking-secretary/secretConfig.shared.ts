/**
 * أدوات مشتركة لتكوين الرموز السرية (Shared Secret Config Helpers)
 * صُنف هذا الملف كـ 'shared' لأنه يحتوي على وظائف مساعدة تُستخدم عبر
 * الملفات الفرعية المختلفة لإدارة التكوين (Settings, Secret, Ensure).
 */

/** تحويل القيمة (نص أو تاريخ) إلى طابع زمني بالملي ثانية (Milliseconds) */
export const toUpdatedAtMs = (value: unknown): number => {
  const ms = new Date(String(value || '')).getTime();
  return Number.isFinite(ms) ? ms : 0;
};
