// ─────────────────────────────────────────────────────────────────────────────
// مساعدات مزامنة الـ realtime (realtimeSync.helpers)
// ─────────────────────────────────────────────────────────────────────────────
// دوال خالصة تستخدمها usePublicBookingRealtimeSync لتنظيم:
//   - توحيد مفاتيح البحث (اسم/تليفون)
//   - اختيار أحدث تاريخ بين قيمتين
//   - دمج عنصرَي مريض (incoming يأخذ الأولوية عندما تكون حقوله أحدث)
//   - دمج قائمتي مرضى مع الحفاظ على 300 عنصر كحد أقصى
//
// فصلناها من usePublicBookingRealtimeSync.ts عشان الـ hook كان 528 سطر
// والـ helpers دول كانوا ~80 سطر منها.
// ─────────────────────────────────────────────────────────────────────────────

import type { PatientSuggestionOption } from '../add-appointment-form/types';

/** توحيد نص البحث (حذف مسافات + lowercase) لمقارنة أسماء المرضى. */
const normalizePatientLookupText = (value?: string): string =>
  String(value || '').trim().toLocaleLowerCase();

/** توحيد رقم التليفون (أرقام فقط) لمقارنة المطابقة. */
const normalizePatientLookupPhone = (value?: string): string =>
  String(value || '').replace(/\D/g, '');

/** تحويل أي قيمة لرقم ملف موجب صحيح، أو undefined. */
const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

/** تحويل ISO date لـ ms — مع fallback صفر لو القيمة مش صالحة. */
const toDateMsOrZero = (value?: string): number => {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** اختيار التاريخ الأحدث بين قيمتين — ترجع undefined لو الاثنين فاضيين. */
const pickLatestDate = (left?: string, right?: string): string | undefined => {
  const leftText = String(left || '').trim();
  const rightText = String(right || '').trim();
  if (!leftText) return rightText || undefined;
  if (!rightText) return leftText || undefined;
  return toDateMsOrZero(rightText) >= toDateMsOrZero(leftText) ? rightText : leftText;
};

/**
 * بناء مفتاح هوية لمريض في الدليل:
 *   - لو فيه id: "id:X"
 *   - لو فيه اسم أو تليفون: "np:name|phone"
 *   - كـ fallback: "idx:N" حسب ترتيبه في القائمة
 */
const buildPatientDirectoryIdentity = (
  item: PatientSuggestionOption,
  fallbackIndex: number
): string => {
  const idText = String(item.id || '').trim();
  if (idText) return `id:${idText}`;

  const nameKey = normalizePatientLookupText(item.patientName);
  const phoneKey = normalizePatientLookupPhone(item.phone);
  if (nameKey || phoneKey) return `np:${nameKey}|${phoneKey}`;

  return `idx:${fallbackIndex}`;
};

/**
 * دمج عنصرَي مريض — الـ incoming يأخذ الأولوية عندما يكون له قيمة،
 * مع الاحتفاظ بأحدث التواريخ من الاثنين (للـ lastExamDate/lastConsultationDate).
 */
const mergePatientDirectoryItem = (
  current: PatientSuggestionOption,
  incoming: PatientSuggestionOption,
): PatientSuggestionOption => {
  const incomingFileNumber = toPositiveFileNumber(incoming.patientFileNumber);
  const currentFileNumber = toPositiveFileNumber(current.patientFileNumber);

  const incomingName = String(incoming.patientName || '').trim();
  const currentName = String(current.patientName || '').trim();
  const incomingAge = String(incoming.age || '').trim();
  const currentAge = String(current.age || '').trim();
  const incomingPhone = String(incoming.phone || '').trim();
  const currentPhone = String(current.phone || '').trim();

  return {
    id: String(incoming.id || current.id || '').trim(),
    patientName: incomingName || currentName || 'بدون اسم',
    age: incomingAge || currentAge || undefined,
    phone: incomingPhone || currentPhone || undefined,
    lastExamDate: pickLatestDate(current.lastExamDate, incoming.lastExamDate),
    lastConsultationDate: pickLatestDate(current.lastConsultationDate, incoming.lastConsultationDate),
    patientFileNumber: incomingFileNumber ?? currentFileNumber,
  };
};

/**
 * دمج قائمتي مرضى مع التعامل مع التكرار حسب الهوية (id أو name+phone).
 * النتيجة: قائمة موحدة محدودة بـ 300 عنصر كحد أقصى (لحماية الذاكرة).
 */
export const mergePatientDirectoryLists = (
  current: PatientSuggestionOption[],
  incoming: PatientSuggestionOption[],
): PatientSuggestionOption[] => {
  if (incoming.length === 0) return current;

  const mergedByIdentity = new Map<string, PatientSuggestionOption>();

  current.forEach((item, index) => {
    mergedByIdentity.set(buildPatientDirectoryIdentity(item, index), item);
  });

  incoming.forEach((item, index) => {
    const key = buildPatientDirectoryIdentity(item, index);
    const existing = mergedByIdentity.get(key);
    mergedByIdentity.set(key, existing ? mergePatientDirectoryItem(existing, item) : item);
  });

  return Array.from(mergedByIdentity.values()).slice(0, 300);
};
