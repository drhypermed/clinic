// ─────────────────────────────────────────────────────────────────────────────
// أدوات مساعدة لدليل الأطباء العام (Public Directory Helpers)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - تنسيق السعر والعنوان للعرض
//   - استخراج الأفاتار وأول حرفين من الاسم
//   - تطبيع أرقام التليفون والواتساب (دعم الأرقام العربية والإنجليزية)
//   - تنسيق تاريخ الحجز بالعربي الكامل
//   - استخراج إحصائيات التقييم والجدول المملوء والخدمات
//   - تنظيف نص البيو
//   - توليد/فك slug صديق لمحركات البحث (بديل آمن عن UID)
//
// ملاحظة: formatTimeWithPeriod اتنقل لـ ../timeFormat.ts عشان مشترك مع doctor-advertisement.
// ─────────────────────────────────────────────────────────────────────────────

import type { DoctorAdProfile } from '../../../types';
import { formatUserDate, formatUserTime } from '../../../utils/cairoTime';

// نعيد التصدير للحفاظ على التوافق مع الاستيرادات الموجودة (helpers.ts كان فيه الدالة).
export { formatTimeWithPeriod } from '../timeFormat';


export const formatPrice = (value: number | null) => {
  if (value == null) return 'غير محدد';
  return `${value} جنيه`;
};

export const formatLocation = (ad: DoctorAdProfile) => {
  const parts = [ad.governorate, ad.city, ad.addressDetails].filter(Boolean);
  return parts.join(' - ');
};

export const getAvatarImage = (ad: DoctorAdProfile) => ad.profileImage || ad.imageUrls[0] || '';

export const getInitials = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return 'طب';
  return trimmed.slice(0, 2);
};

const normalizeDigits = (value: string) =>
  value.replace(/[٠-٩]/g, (digit) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(digit)]);

export const normalizePhoneForTel = (value?: string) => {
  if (!value) return '';
  const normalized = normalizeDigits(value).trim();
  return normalized.replace(/[^\d+]/g, '');
};

export const normalizePhoneForWhatsApp = (value?: string) => {
  const tel = normalizePhoneForTel(value);
  if (!tel) return '';
  return tel.replace(/\D/g, '');
};

/**
 * تنسيق تاريخ ووقت الحجز بصيغة عربية كاملة (اليوم، الشهر، السنة، الساعة).
 * مثال: "الأحد، 5 مايو 2026 - 02:30 م"
 */
export const formatBookingDateTime = (dateTime: string) => {
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return dateTime;
  return `${formatUserDate(parsed, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }, 'ar-EG')} - ${formatUserTime(parsed, {
    hour: '2-digit',
    minute: '2-digit',
  }, 'ar-EG')}`;
};

const normalizeRating = (value: number | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(5, value));
};

export const getDoctorRatingStats = (ad: DoctorAdProfile) => {
  const count = typeof ad.ratingCount === 'number' && Number.isFinite(ad.ratingCount)
    ? Math.max(0, Math.floor(ad.ratingCount))
    : 0;
  const average = count > 0 ? normalizeRating(ad.ratingAverage) : 0;
  return { count, average };
};

export const getFilledClinicSchedule = (ad: DoctorAdProfile) =>
  ad.clinicSchedule.filter((row) => {
    const from = row.from?.trim() || '';
    const to = row.to?.trim() || '';
    const notes = row.notes?.trim() || '';
    return Boolean(from || to || notes);
  });

export const getClinicServices = (ad: DoctorAdProfile) => {
  if (Array.isArray(ad.clinicServices) && ad.clinicServices.length > 0) {
    return ad.clinicServices;
  }
  return ad.services.map((name, index) => ({
    id: `legacy-${index + 1}`,
    name,
    price: null as number | null,
    discountedPrice: null as number | null,
  }));
};

export const sanitizeBioForDisplay = (bio?: string) => {
  const normalized = (bio || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';
  return normalized
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .trim();
};

/**
 * توليد slug آمن وصديق لمحركات البحث من بيانات الطبيب
 * يخفي UID الحقيقي ويستخدم hash قصير للتفريق
 */
export const generateDoctorSlug = (doctor: DoctorAdProfile): string => {
  const name = (doctor.doctorName || 'doctor').toLowerCase().trim();
  const specialty = (doctor.doctorSpecialty || '').toLowerCase().trim();
  const city = (doctor.city || '').toLowerCase().trim();
  
  // تنظيف النص: الإبقاء على العربية والإنجليزية والأرقام والشرطات فقط
  const cleanPart = (text: string) => 
    text
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9-]/gi, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  
  const parts = [cleanPart(name), cleanPart(specialty), cleanPart(city)]
    .filter(Boolean);
  
  const slug = parts.join('-').substring(0, 80);
  
  // إضافة hash قصير من UID للحفاظ على التفرد
  const hash = doctor.doctorId.substring(0, 8).toLowerCase();
  
  return `${slug}-${hash}`;
};

/**
 * البحث عن الطبيب باستخدام slug بدلاً من UID
 */
export const findDoctorBySlug = (ads: DoctorAdProfile[], slug: string): string | null => {
  if (!slug) return null;
  
  // البحث أولاً في حقل publicSlug إذا كان موجوداً
  const bySlugField = ads.find(ad => ad.publicSlug === slug);
  if (bySlugField) return bySlugField.doctorId;
  
  // البحث بواسطة توليد slug من البيانات الحالية (للأطباء القدامى)
  const found = ads.find(ad => generateDoctorSlug(ad) === slug);
  return found ? found.doctorId : null;
};

