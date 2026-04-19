// ─────────────────────────────────────────────────────────────────────────────
// أدوات مساعدة لصفحة إعلان الطبيب (Doctor Advertisement Utils)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - ثوابت (CUSTOM_CITY_OPTION, MAX_IMAGE_SIZE_BYTES)
//   - توليد معرفات فريدة للصفوف (createServiceId, createScheduleId, createSocialId)
//   - تطبيع بيانات الجدول (normalizeScheduleRows)
//   - معالجة الصور (fileToDataUrl, getImageAspect)
//   - تحويل الأرقام الآمن (toNumber)
//
// ملاحظة: formatTimeWithPeriod اتنقل لـ ../timeFormat.ts عشان مشترك مع public-directory.
// ─────────────────────────────────────────────────────────────────────────────

import type { DoctorClinicScheduleRow } from '../../../types';

// نعيد التصدير من timeFormat.ts للحفاظ على التوافق مع الاستيرادات الموجودة (utils.ts كان فيه الدالة).
export { formatTimeWithPeriod } from '../timeFormat';

/** نص الخيار اللي لما يختاره الطبيب يظهر له حقل لإضافة مدينة جديدة. */
export const CUSTOM_CITY_OPTION = 'إضافة مدينة';
/** اسم قديم لنفس الخيار (للتوافق مع بيانات متخزنة قبل ما نغير الاسم). */
export const LEGACY_CUSTOM_CITY_OPTION = 'أخرى';
/** الحد الأقصى لحجم صورة يقدر الطبيب يرفعها (10 ميجا). */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const createServiceId = () => `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const createScheduleId = () => `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const createSocialId = () => `social-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createDefaultSchedule = (): DoctorClinicScheduleRow[] => [];

export const isCustomCityValue = (value: string) =>
  value === CUSTOM_CITY_OPTION || value === LEGACY_CUSTOM_CITY_OPTION;

export const normalizeScheduleRows = (rows: DoctorClinicScheduleRow[] | undefined | null): DoctorClinicScheduleRow[] => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({
      id: row.id || createScheduleId(),
      day: String(row.day || '').trim(),
      from: String(row.from || '').trim(),
      to: String(row.to || '').trim(),
      notes: String(row.notes || '').trim(),
    }))
    .filter((row) => row.day && row.from && row.to);
};

/**
 * تحويل نص الرقم لـ number — ترجع null لو فاضي أو غير صالح أو سالب.
 * بنستخدمها في حقول السعر والخبرة عشان نقبل قيم فارغة ونميزها عن صفر.
 */
export const toNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر تحميل الصورة'));
    reader.readAsDataURL(file);
  });

export const getImageAspect = (src: string): Promise<number | undefined> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        resolve(width / height);
      } else {
        resolve(undefined);
      }
    };
    image.onerror = () => resolve(undefined);
    image.src = src;
  });

