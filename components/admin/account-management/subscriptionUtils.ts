/**
 * الملف: subscriptionUtils.ts
 * الوصف: "محاسب الاشتراكات". 
 * يتولى هذا الملف الجانب الحسابي والجمالي لمدد الاشتراك: 
 * - يحسب الفارق الزمني الدقيق بين تاريخ البداية والنهاية. 
 * - يحول الفارق الزمني من "ميلي ثانية" إلى وحدات مفهومة (سنة، شهر، يوم، ساعة، دقيقة). 
 * - يقوم بصياغة الجمل العربية الصحيحة لوصف المدة (مثلاً: "سنة و 3 شهور و 5 أيام"). 
 * - يضمن دقة العرض في جدول الإدارة لسهولة متابعة حالة اشتراك كل طبيب.
 */

const calculateSubscriptionDuration = (
  startDate: string | undefined,
  endDate: string | undefined
) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) return null;

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  // تقسيم الفرق الزمني إلى وحدات (سنوات، شهور، أيام، إلخ)
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { years, months, days, hours, minutes, totalDays, totalHours, totalMinutes };
};

/** تحويل كائن المدة إلى جملة عربية منسقة (مثال: سنة و 3 شهر) */
export const formatDuration = (startDate: string | undefined, endDate: string | undefined) => {
  const dur = calculateSubscriptionDuration(startDate, endDate);
  if (!dur) return '-';

  const parts: string[] = [];
  if (dur.years > 0) parts.push(`${dur.years} سنة${dur.years > 1 ? 'ت' : ''}`);
  if (dur.months > 0) parts.push(`${dur.months} شهر`);
  if (dur.days > 0) parts.push(`${dur.days} يوم`);
  if (dur.hours > 0) parts.push(`${dur.hours} ساعة`);
  if (dur.minutes > 0 && parts.length < 3) parts.push(`${dur.minutes} دقيقة`);

  return parts.length > 0 ? parts.join(' و ') : '-';
};
