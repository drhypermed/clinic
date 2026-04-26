/**
 * الملف: subscriptionUtils.ts
 * الوصف: "محاسب الاشتراكات الدقيق".
 * يتولى الجانب الحسابي والجمالي لمدد الاشتراك:
 *   - يحسب الفرق الزمني بدقة (سنة/شهر بنفس التواريخ الميلادية الحقيقية، مش تقريب 365/30).
 *   - يحول الفرق إلى وحدات مفهومة (سنة، شهر، يوم، ساعة، دقيقة).
 *   - يصيغ جملة عربية صحيحة (مثلاً: "سنة و 3 شهور و 5 أيام").
 *
 * ⚠️ كان فيه bug قديم: القسمة على 365 للسنة و 30 للشهر يعطي تقريب خاطئ.
 * مثال: من 1 يناير لـ 31 ديسمبر = 364 يوم، الكود القديم كان يعرضها "12 شهر و 4 يوم"
 * (لأن 364/30 = 12). الإصلاح: نستخدم Date math الحقيقية بناءً على getFullYear/getMonth.
 */

interface DurationParts {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
}

const calculateSubscriptionDuration = (
  startDate: string | undefined,
  endDate: string | undefined,
): DurationParts | null => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end <= start) return null;

  // الإجماليات (بنحسبها من الـmilliseconds — دقيقة دائماً)
  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  // ─ Date math دقيقة: نحسب السنوات والشهور بناءً على التواريخ الفعلية ─
  // منطق الحساب: نطرح الفرق الميلادي ثم نعدّل لو الـdays/hours/minutes طلعوا سالب.
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();

  // تعديل لو الدقائق سالبة
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  // تعديل لو الساعات سالبة
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  // تعديل لو الأيام سالبة — نستلف من الشهر اللي قبل (بعدد أيامه الفعلي)
  if (days < 0) {
    // عدد أيام الشهر السابق لـend (مثلاً: لو end في مارس، ناخد عدد أيام فبراير)
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate(); // 28/29/30/31 حسب الشهر فعلياً
    months -= 1;
  }
  // تعديل لو الشهور سالبة — نستلف من السنة اللي قبل
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days, hours, minutes, totalDays, totalHours, totalMinutes };
};

/** تحويل كائن المدة إلى جملة عربية منسقة (مثال: "سنة و 3 شهور و 5 أيام") */
export const formatDuration = (startDate: string | undefined, endDate: string | undefined): string => {
  const dur = calculateSubscriptionDuration(startDate, endDate);
  if (!dur) return '-';

  const parts: string[] = [];
  if (dur.years > 0) parts.push(`${dur.years} سنة${dur.years > 1 ? 'ت' : ''}`);
  if (dur.months > 0) parts.push(`${dur.months} شهر`);
  if (dur.days > 0) parts.push(`${dur.days} يوم`);
  if (dur.hours > 0) parts.push(`${dur.hours} ساعة`);
  // الدقائق نعرضها بس لو القائمة لسه قصيرة (تجنب جملة طويلة جداً)
  if (dur.minutes > 0 && parts.length < 3) parts.push(`${dur.minutes} دقيقة`);

  return parts.length > 0 ? parts.join(' و ') : '-';
};
