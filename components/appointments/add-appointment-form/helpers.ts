import type { PatientSuggestionOption, RecentExamPatientOption } from './types';
import { buildCairoDateTime, formatUserDate, getCairoDayKey } from '../../../utils/cairoTime';

/**
 * وظائف مساعدة لنموذج إضافة المواعيد (Add Appointment Form Helpers)
 */

/**
 * تنظيف وتوحيد الأسماء العربية (Arabic Name Normalization)
 * تقوم هذه الدالة بـ:
 * 1. إزالة التشكيل (الفتحة، الضمة، الكسرة، إلخ).
 * 2. توحيد حروف الألف (أ، إ، آ) إلى (ا).
 * 3. توحيد (ى) إلى (ي) و (ة) إلى (ه).
 * 4. إزالة المسافات الزائدة.
 * هذا يساعد في دقة البحث عن أسماء المرضى مهما اختلفت طريقة الكتابة.
 */
const normalizeArabicName = (value?: string) =>
  (value || '')
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/\u0640/g, '')               // إزالة التطويل
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

/** استخراج الأرقام فقط من رقم الهاتف */
export const normalizePhoneDigits = (value?: string) => (value || '').replace(/\D/g, '');

export const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

/** تنسيق التاريخ للعرض في الاقتراحات (مثلاً: 25/12/2023) */
const formatSuggestionDate = (value?: string) => {
  if (!value) return 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'غير متوفر';
  return formatUserDate(date, undefined, 'ar-EG-u-nu-latn');
};

interface PatientSuggestionDetailLine {
  key: 'fileNumber' | 'phone' | 'age' | 'lastExam' | 'lastConsultation';
  label: string;
  value: string;
}

interface PatientSuggestionDisplayModel {
  patientName: string;
  fileNumber?: number;
  lines: PatientSuggestionDetailLine[];
}

export const buildPatientSuggestionDisplayModel = (
  candidate: PatientSuggestionOption
): PatientSuggestionDisplayModel => {
  const patientName = String(candidate.patientName || '').trim() || 'بدون اسم';
  const fileNumber = toPositiveFileNumber(candidate.patientFileNumber);
  const phoneText = String(candidate.phone || '').trim() || 'غير متوفر';
  const ageText = String(candidate.age || '').trim() || 'غير متوفر';

  return {
    patientName,
    fileNumber,
    lines: [
      {
        key: 'fileNumber',
        label: 'رقم الملف',
        value: fileNumber ? `#${fileNumber}` : 'غير متوفر',
      },
      {
        key: 'phone',
        label: 'رقم التليفون',
        value: phoneText,
      },
      {
        key: 'age',
        label: 'السن',
        value: ageText,
      },
      {
        key: 'lastExam',
        label: 'آخر كشف',
        value: formatSuggestionDate(candidate.lastExamDate),
      },
      {
        key: 'lastConsultation',
        label: 'آخر استشارة',
        value: formatSuggestionDate(candidate.lastConsultationDate),
      },
    ],
  };
};

/**
 * تصفية اقتراحات المرضى (Filter Suggestions)
 * تظهر قائمة مختصرة (أول 5 نتائج) بناءً على ما يكتبه المستخدم في حقل الاسم أو الهاتف.
 */
export const getVisiblePatientSuggestions = (
  patientSuggestions: PatientSuggestionOption[],
  activeSuggestionField: 'name' | 'phone' | null,
  patientName: string,
  phone: string
) => {
  const isPhoneField = activeSuggestionField === 'phone';
  const query = isPhoneField ? normalizePhoneDigits(phone) : normalizeArabicName(patientName);
  if (!query) return [] as PatientSuggestionOption[];

  return patientSuggestions
    .filter((item) => {
      const name = normalizeArabicName(item.patientName);
      const phoneText = normalizePhoneDigits(item.phone);
      if (isPhoneField) return phoneText.includes(query);
      return name.includes(query);
    })
    .slice(0, 5);
};

/**
 * تجميع مرشحي الاستشارة حسب تاريخ الكشف (Group by Date)
 * يسهل على الطبيب معرفة المرضى الذين كشفوا في أيام محددة لاختيارهم للاستشارة.
 */
export const groupConsultationCandidatesByDate = (candidates: RecentExamPatientOption[]) => {
  const grouped = candidates.reduce((groups, candidate) => {
    const dateKey = getCairoDayKey(candidate.examCompletedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(candidate);
    return groups;
  }, {} as Record<string, RecentExamPatientOption[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  return { grouped, sortedDates };
};

/** تحويل تاريخ (YYYY-MM-DD) إلى اسم اليوم باللغة العربية */
export const getArabicDayName = (dateStr: string) => {
  return formatUserDate(buildCairoDateTime(dateStr, '12:00'), { weekday: 'long' }, 'ar-EG');
};
