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

import type { DoctorAdBranch, DoctorAdProfile, DoctorClinicScheduleRow, DoctorClinicServiceRow } from '../../../types';

// نعيد التصدير من timeFormat.ts للحفاظ على التوافق مع الاستيرادات الموجودة (utils.ts كان فيه الدالة).
export { formatTimeWithPeriod } from '../timeFormat';

/** نص الخيار اللي لما يختاره الطبيب يظهر له حقل لكتابة اسم مدينته. */
export const CUSTOM_CITY_OPTION = 'أخرى';
/** اسم سابق لنفس الخيار (للتوافق مع بيانات متخزنة باستخدامه). */
export const LEGACY_CUSTOM_CITY_OPTION = 'إضافة مدينة';
/** الحد الأقصى لحجم صورة يقدر الطبيب يرفعها (10 ميجا). */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** الحد الأقصى لعدد فروع يقدر الطبيب يضيفها في الإعلان. */
export const MAX_BRANCHES_PER_DOCTOR = 5;
/** الحد الأقصى لعدد الصور لكل فرع. */
export const MAX_IMAGES_PER_BRANCH = 6;

export const createServiceId = () => `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const createScheduleId = () => `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const createSocialId = () => `social-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createBranchId = () => `branch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

/** فرع جديد فارغ — الطبيب بيملأه لما يضغط "إضافة فرع". */
export const createEmptyBranch = (name = ''): DoctorAdBranch => ({
  id: createBranchId(),
  name,
  governorate: '',
  city: '',
  addressDetails: '',
  contactPhone: '',
  whatsapp: '',
  clinicSchedule: [],
  clinicServices: [],
  examinationPrice: null,
  discountedExaminationPrice: null,
  consultationPrice: null,
  discountedConsultationPrice: null,
  imageUrls: [],
});

/**
 * ترحيل البيانات القديمة (قبل تعدد الفروع) لفرع واحد افتراضي.
 * بنستخدمها لما نحمّل إعلان قديم ما فيهوش `branches` — فبنبني فرع
 * من الحقول اللي كانت في أعلى المستند (top-level).
 */
export const migrateLegacyFieldsToBranch = (ad: DoctorAdProfile): DoctorAdBranch => ({
  id: createBranchId(),
  name: 'الفرع الرئيسي',
  governorate: ad.governorate || '',
  city: ad.city || '',
  addressDetails: ad.addressDetails || '',
  contactPhone: ad.contactPhone || '',
  whatsapp: ad.whatsapp || '',
  clinicSchedule: normalizeScheduleRows(ad.clinicSchedule),
  clinicServices: Array.isArray(ad.clinicServices) ? ad.clinicServices : [],
  examinationPrice: ad.examinationPrice ?? null,
  discountedExaminationPrice: ad.discountedExaminationPrice ?? null,
  consultationPrice: ad.consultationPrice ?? null,
  discountedConsultationPrice: ad.discountedConsultationPrice ?? null,
  imageUrls: Array.isArray(ad.imageUrls) ? ad.imageUrls : [],
});

/**
 * تطبيع صف فرع جاي من Firestore — بيتأكد إن كل الحقول موجودة
 * وبالنوع الصحيح. بنستدعيها على كل فرع قبل ما نحطه في الـstate.
 */
export const normalizeBranch = (branch: Partial<DoctorAdBranch> | null | undefined, fallbackName = 'فرع'): DoctorAdBranch => ({
  id: branch?.id || createBranchId(),
  name: String(branch?.name || fallbackName).trim() || fallbackName,
  governorate: String(branch?.governorate || '').trim(),
  city: String(branch?.city || '').trim(),
  addressDetails: String(branch?.addressDetails || '').trim(),
  contactPhone: String(branch?.contactPhone || '').trim(),
  whatsapp: String(branch?.whatsapp || '').trim(),
  clinicSchedule: normalizeScheduleRows(branch?.clinicSchedule as DoctorClinicScheduleRow[] | undefined),
  clinicServices: Array.isArray(branch?.clinicServices)
    ? (branch!.clinicServices as DoctorClinicServiceRow[]).map((item, idx) => ({
        id: item.id || `service-${idx + 1}`,
        name: String(item.name || '').trim(),
        price: item.price ?? null,
        discountedPrice: item.discountedPrice ?? null,
      }))
    : [],
  examinationPrice: branch?.examinationPrice ?? null,
  discountedExaminationPrice: branch?.discountedExaminationPrice ?? null,
  consultationPrice: branch?.consultationPrice ?? null,
  discountedConsultationPrice: branch?.discountedConsultationPrice ?? null,
  imageUrls: Array.isArray(branch?.imageUrls) ? (branch!.imageUrls as string[]).filter(Boolean) : [],
});

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

