import type { PatientSuggestionOption, RecentExamPatientOption } from './types';
import { buildCairoDateTime, formatUserDate, getCairoDayKey } from '../../../utils/cairoTime';
import { normalizePatientNameForFile } from '../../../services/patient-files/normalizers';
import { rankPatientSuggestions } from '../../../services/patientSuggestionSearch';
import { formatPatientAddress } from '../../../utils/patientAddress';

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
// مصدر واحد للتطبيع في ملفات المرضى، وفهرس السكرتارية، وفلتر الواجهة.
const normalizeArabicName = normalizePatientNameForFile;

/** استخراج الأرقام فقط من رقم الهاتف */
export const normalizePhoneDigits = (value?: string) => (value || '').replace(/\D/g, '');

/** توحيد صيغ الموبايل المصري للبحث (+20 / 0020 / 01). */
const normalizePhoneSearchKey = (value?: string) => {
  let digits = normalizePhoneDigits(value);
  if (!digits) return '';
  if (digits.startsWith('0020') && digits.length >= 14) digits = digits.slice(2);
  if (digits.startsWith('20') && digits.length >= 12) return `0${digits.slice(-10)}`;
  if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
  if (digits.length > 11) return digits.slice(-11);
  return digits;
};

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
  key: 'fileNumber' | 'phone' | 'address' | 'age' | 'lastExam' | 'lastConsultation';
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
      ...(formatPatientAddress(candidate.address, 'summary') ? [{
        key: 'address' as const,
        label: 'العنوان',
        value: formatPatientAddress(candidate.address, 'summary'),
      }] : []),
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
  const nameQuery = isPhoneField ? '' : patientName;
  const phoneQuery = isPhoneField ? phone : '';
  const query = isPhoneField ? normalizePhoneSearchKey(phoneQuery) : normalizeArabicName(nameQuery);
  if (!query) return [] as PatientSuggestionOption[];

  return rankPatientSuggestions(patientSuggestions, nameQuery, phoneQuery)
    // The server already caps the compact query at 20 documents. Keeping the
    // same cap here makes every returned match reachable in the scrollable
    // dropdown instead of silently hiding matches 6..20.
    .slice(0, 20);
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
