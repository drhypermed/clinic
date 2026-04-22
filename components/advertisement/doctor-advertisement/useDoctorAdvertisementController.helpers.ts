import type {
  DoctorAdBranch,
  DoctorAdProfile,
} from '../../../types';
import type { DoctorSocialLink } from './types';
import { sanitizeMultilineInput, sanitizeSocialLinks, sanitizeSocialUrl, sanitizeTextInput } from './securityUtils';
import { normalizeBranch } from './utils';

export const isDoctorAdImageOwnedByDoctor = (imageUrl: string, doctorId: string) => {
  const normalizedUrl = String(imageUrl || '').trim();
  const normalizedDoctorId = String(doctorId || '').trim();
  if (!normalizedUrl || !normalizedDoctorId) return false;
  const rawToken = `${normalizedDoctorId}_doctor_ad_`;
  const encodedToken = encodeURIComponent(rawToken);
  return normalizedUrl.includes(rawToken) || normalizedUrl.includes(encodedToken);
};

// ─────────────────────────────────────────────────────────────────────────────
// بناء بيانات المعاينة
// ─────────────────────────────────────────────────────────────────────────────
// بناء الـobject اللي بنعرضه في الـLive Preview قبل الحفظ. بياخد الحقول
// العالمية للطبيب والفروع كما هي في الـstate، وبيرجعها بنفس شكل DoctorAdProfile
// اللي بتستهلكه صفحة التفاصيل العامة (DoctorDetailsModal).

interface BuildDoctorAdPreviewDataParams {
  safeDoctorId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  profileImage?: string;
  adDoctorName: string;
  academicDegree: string;
  subSpecialties: string;
  featuredServicesSummary: string;
  workplace: string;
  extraInfo: string;
  branches: DoctorAdBranch[];
  socialLinks: DoctorSocialLink[];
  yearsExperience: string;
  isPublished: boolean;
}

export const buildDoctorAdPreviewData = ({
  safeDoctorId,
  doctorId,
  doctorName,
  doctorSpecialty,
  profileImage,
  adDoctorName,
  academicDegree,
  subSpecialties,
  featuredServicesSummary,
  workplace,
  extraInfo,
  branches,
  socialLinks,
  yearsExperience,
  isPublished,
}: BuildDoctorAdPreviewDataParams): DoctorAdProfile => {
  // بنطبع كل فرع + بنستخلص أول فرع للحقول القديمة (Legacy) عشان أي كود
  // ما بيقراش branches[] لسه يلاقي قيم صالحة يعرضها.
  const normalizedBranches = branches.map((b, idx) => normalizeBranch(b, `فرع ${idx + 1}`));
  const primary = normalizedBranches[0];
  const yearsNum = Number(yearsExperience);

  return {
    doctorId: safeDoctorId || doctorId,
    doctorName: sanitizeTextInput(adDoctorName, 160) || doctorName || '',
    doctorSpecialty: sanitizeTextInput(doctorSpecialty, 160) || '',
    academicDegree: sanitizeTextInput(academicDegree, 400),
    subSpecialties: sanitizeMultilineInput(subSpecialties, 1200),
    featuredServicesSummary: sanitizeMultilineInput(featuredServicesSummary, 1200),
    workplace: sanitizeMultilineInput(workplace, 800),
    extraInfo: sanitizeMultilineInput(extraInfo, 1500),
    profileImage: profileImage || '',
    clinicName: '',
    bio: sanitizeMultilineInput(extraInfo, 1500),

    // الفروع (المصدر الحقيقي)
    branches: normalizedBranches,

    // Legacy: نسخ أول فرع للحقول القديمة (عشان التوافق في عرض قديم)
    governorate: primary?.governorate || '',
    city: primary?.city || '',
    addressDetails: primary?.addressDetails || '',
    clinicSchedule: primary?.clinicSchedule || [],
    examinationPrice: primary?.examinationPrice ?? null,
    discountedExaminationPrice: primary?.discountedExaminationPrice ?? null,
    consultationPrice: primary?.consultationPrice ?? null,
    discountedConsultationPrice: primary?.discountedConsultationPrice ?? null,
    clinicServices: primary?.clinicServices || [],
    services: (primary?.clinicServices || []).map((s) => s.name),
    imageUrls: primary?.imageUrls || [],
    contactPhone: primary?.contactPhone || '',
    whatsapp: primary?.whatsapp || '',

    socialLinks: sanitizeSocialLinks(socialLinks),
    socialMediaPlatform: sanitizeTextInput(socialLinks[0]?.platform, 80),
    socialMediaUrl: sanitizeSocialUrl(socialLinks[0]?.url),
    yearsExperience: Number.isFinite(yearsNum) && yearsNum >= 0 ? yearsNum : null,
    isPublished,
    createdAt: String(Date.now()),
    updatedAt: String(Date.now()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// التحقق قبل الحفظ
// ─────────────────────────────────────────────────────────────────────────────

interface ValidateDoctorAdBeforeSaveParams {
  adDoctorName: string;
  doctorSpecialty: string;
  branches: DoctorAdBranch[];
  socialLinks: DoctorSocialLink[];
}

export const validateDoctorAdBeforeSave = ({
  adDoctorName,
  doctorSpecialty,
  branches,
  socialLinks,
}: ValidateDoctorAdBeforeSaveParams): string => {
  if (!adDoctorName.trim()) return 'يرجى إدخال اسم الطبيب.';
  if (!doctorSpecialty.trim()) return 'يرجى إدخال التخصص الطبي في الحساب.';
  if (!Array.isArray(branches) || branches.length === 0) {
    return 'يرجى إضافة فرع واحد على الأقل للإعلان.';
  }

  // نتحقق من كل فرع بشكل منفصل — كل فرع لازم يكون فيه بيانات العنوان والأسعار صحيحة
  for (let i = 0; i < branches.length; i++) {
    const b = branches[i];
    const prefix = branches.length > 1 ? `فرع "${b.name || `رقم ${i + 1}`}": ` : '';
    if (!b.name.trim()) return `${prefix}يرجى إدخال اسم الفرع.`;
    if (!b.governorate) return `${prefix}يرجى اختيار المحافظة.`;
    if (!b.city.trim()) return `${prefix}يرجى اختيار المدينة أو كتابة مدينة أخرى.`;
    if (!b.addressDetails.trim()) return `${prefix}يرجى إدخال العنوان بالتفصيل.`;

    // أسعار الكشف
    if (b.discountedExaminationPrice != null && b.examinationPrice == null) {
      return `${prefix}يرجى إدخال سعر الكشف قبل إضافة سعر الخصم.`;
    }
    if (
      b.discountedExaminationPrice != null &&
      b.examinationPrice != null &&
      b.discountedExaminationPrice >= b.examinationPrice
    ) {
      return `${prefix}سعر الكشف بعد الخصم يجب أن يكون أقل من السعر الأساسي.`;
    }

    // أسعار الاستشارة
    if (b.discountedConsultationPrice != null && b.consultationPrice == null) {
      return `${prefix}يرجى إدخال سعر الاستشارة قبل إضافة سعر الخصم.`;
    }
    if (
      b.discountedConsultationPrice != null &&
      b.consultationPrice != null &&
      b.discountedConsultationPrice >= b.consultationPrice
    ) {
      return `${prefix}سعر الاستشارة بعد الخصم يجب أن يكون أقل من السعر الأساسي.`;
    }

    // خصم الخدمات
    const invalidServiceDiscount = b.clinicServices.some((service) => {
      const p = service.price;
      const d = service.discountedPrice;
      return d != null && (p == null || d >= p);
    });
    if (invalidServiceDiscount) {
      return `${prefix}خصم الخدمة يجب أن يكون أقل من سعر الخدمة الأساسي.`;
    }
  }

  const invalidSocial = socialLinks.some((item) => item.url.trim() && !sanitizeSocialUrl(item.url));
  if (invalidSocial) return 'رابط السوشيال غير صحيح. يجب أن يبدأ بـ http أو https.';
  return '';
};
