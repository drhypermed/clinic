// ─────────────────────────────────────────────────────────────────────────────
// تنسيق الوقت في إعلانات الأطباء (Advertisement Time Format)
// ─────────────────────────────────────────────────────────────────────────────
// دالة مشتركة بين doctor-advertisement و public-directory لعرض مواعيد العيادة
// بصيغة 12 ساعة بالعربي (صباحاً/مساءً).
//
// ليه في ملف مستقل؟
//   - كانت مكررة حرفياً في doctor-advertisement/utils.ts و public-directory/helpers.ts
//   - فصلناها هنا لمركز واحد، لو اتغيرت صياغة العرض (مثلاً AM/PM بدل ص/م)
//     نعدل مكان واحد.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * تحويل الوقت من صيغة 24 ساعة (مثل "14:30") لصيغة 12 ساعة بالعربي ("2:30 م").
 * لو القيمة فارغة أو مش صحيحة، ترجع "--:--" أو القيمة الأصلية.
 *
 * أمثلة:
 *   "09:00" → "9:00 ص"
 *   "14:30" → "2:30 م"
 *   "00:15" → "12:15 ص"
 *   "23:45" → "11:45 م"
 *   ""      → "--:--"
 */
export const formatTimeWithPeriod = (value?: string): string => {
  const normalized = (value || '').trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return normalized || '--:--';

  const hours24 = Number(match[1]);
  const minutes = match[2];
  // تحقق من صحة الساعة (0-23)
  if (!Number.isFinite(hours24) || hours24 < 0 || hours24 > 23) return normalized;

  const period = hours24 >= 12 ? 'م' : 'ص';
  // تحويل لـ 12 ساعة: الساعة 0 تبقى 12 ص، و 12 تبقى 12 م
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
};
