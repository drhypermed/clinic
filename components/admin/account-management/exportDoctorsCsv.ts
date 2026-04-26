// ─────────────────────────────────────────────────────────────────────────────
// تصدير قائمة الأطباء لـCSV (Excel-compatible)
// ─────────────────────────────────────────────────────────────────────────────
// يولد ملف CSV من قائمة الأطباء (المفلترة أو الكاملة) ويبدأ التحميل تلقائياً.
//
// مهم: BOM في البداية (UTF-8) عشان Excel يفتح الملف بحروف عربية صحيحة بدلاً
// من ظهورها كـmojibake. بدون الـBOM، Excel يفترض الـencoding ويخرّب العربي.
// ─────────────────────────────────────────────────────────────────────────────

import type { ApprovedDoctor } from './types';
import { formatUserDate, getCairoDayKey } from '../../../utils/cairoTime';

/** تنظيف قيمة CSV — يهرب علامات التنصيص + يحيط بعلامتي تنصيص لو فيه فاصلة/سطر جديد */
const escapeCsvCell = (value: unknown): string => {
  const str = String(value ?? '').replace(/"/g, '""');
  // لو القيمة فيها فاصلة أو سطر جديد أو علامة تنصيص → نحيطها بعلامتي تنصيص
  if (/[",\n\r]/.test(str)) {
    return `"${str}"`;
  }
  return str;
};

/** ترجمة accountType للعربي للعرض في الملف */
const translateAccountType = (type?: string): string => {
  if (type === 'premium') return 'برو';
  if (type === 'pro_max') return 'برو ماكس';
  return 'مجاني';
};

/** ترجمة verificationStatus للعربي */
const translateVerificationStatus = (status?: string): string => {
  if (status === 'approved') return 'مقبول';
  if (status === 'rejected') return 'مرفوض';
  if (status === 'submitted' || status === 'pending') return 'قيد المراجعة';
  return status || 'غير محدد';
};

/** صياغة تاريخ بالعربي مختصر (مثلاً: 25 أبريل 2026) — يرجع فاضي لو التاريخ مش صالح */
const formatDateForExport = (iso?: string): string => {
  if (!iso) return '';
  try {
    return formatUserDate(iso, { year: 'numeric', month: 'short', day: 'numeric' }, 'ar-EG');
  } catch {
    return '';
  }
};

/** يحسب نوع الحساب الفعلي (لو premium منتهي = نعرضه كـمنتهي) */
const computeEffectiveAccountType = (doctor: ApprovedDoctor): string => {
  const declared = doctor.accountType || 'free';
  if (declared === 'free') return translateAccountType('free');

  // الأدمن (سنة 9999) = دائماً paid
  if (doctor.premiumExpiryDate?.startsWith('9999')) {
    return translateAccountType(declared);
  }

  // باقة منتهية = نضيف "(منتهية)" للوضوح
  const expiryMs = doctor.premiumExpiryDate ? new Date(doctor.premiumExpiryDate).getTime() : 0;
  if (expiryMs > 0 && expiryMs < Date.now()) {
    return `${translateAccountType(declared)} (منتهية)`;
  }
  return translateAccountType(declared);
};

/**
 * يصدّر قائمة الأطباء لـCSV ويبدأ التحميل تلقائياً.
 * @param doctors قائمة الأطباء (عادةً الـfilteredDoctors لتصدير المفلتر فقط)
 * @param filename اسم الملف بدون امتداد (الـ.csv بيتضاف تلقائياً)
 */
export const exportDoctorsToCsv = (doctors: ApprovedDoctor[], filename: string = 'doctors-list') => {
  // الأعمدة بالعربي (header) — Excel يعرضها كـcolumn titles
  const headers = [
    'الاسم',
    'البريد الإلكتروني',
    'الواتساب',
    'التخصص',
    'نوع الحساب',
    'حالة التحقق',
    'حالة الحساب',
    'تاريخ التسجيل',
    'تاريخ بداية الاشتراك',
    'تاريخ انتهاء الاشتراك',
    'سبب التعطيل',
  ];

  // الصفوف — كل دكتور = صف
  const rows = doctors.map((d) => [
    d.doctorName || '',
    d.doctorEmail || '',
    d.doctorWhatsApp || '',
    d.doctorSpecialty || '',
    computeEffectiveAccountType(d),
    translateVerificationStatus(d.verificationStatus),
    d.isAccountDisabled ? 'معطّل' : 'نشط',
    formatDateForExport(d.createdAt),
    formatDateForExport(d.premiumStartDate),
    formatDateForExport(d.premiumExpiryDate),
    d.disabledReason || '',
  ]);

  // بناء نص CSV: header + rows، كل خلية معالجة بـescapeCsvCell
  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  // BOM للـUTF-8 — حرج عشان Excel يقرأ العربي صح
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // إنشاء link مؤقت + click تلقائي + cleanup
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // ─ تاريخ اسم الملف بتوقيت القاهرة (Cairo timezone) — متسق مع باقي الـapp.
  // قبل كده كنا بنستخدم toISOString() اللي بـUTC، فلو الأدمن صدّر في 11pm
  // بتوقيت القاهرة كان اسم الملف يطلع تاريخ اليوم التالي. غير منطقي.
  const today = getCairoDayKey(new Date()); // YYYY-MM-DD بتوقيت القاهرة
  link.download = `${filename}_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
