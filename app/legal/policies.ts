// ─────────────────────────────────────────────────────────────────────────────
// جامع الوثائق القانونية (Legal Policies Registry)
// ─────────────────────────────────────────────────────────────────────────────
// الملف ده نقطة الدخول الموحدة للوثائق القانونية.
// كل ما تحتاج عرض شروط أو سياسة لنوع مستخدم معين، استدعِ getLegalPoliciesForAudience
// بدل استيراد الوثائق المستقلة مباشرة — ده بيخلي الاستخدام بسيط وموحد.
// ─────────────────────────────────────────────────────────────────────────────

import { doctorPrivacyDocument } from './doctor/privacy';
import { doctorTermsDocument } from './doctor/terms';
import { publicPrivacyDocument } from './public/privacy';
import { publicTermsDocument } from './public/terms';
import type { LegalAudience, LegalAudiencePolicies } from './types';

/**
 * خريطة تربط كل جمهور (طبيب/جمهور عام) بحزمة وثائقه الكاملة.
 * النصوص هنا ظاهرة في الواجهة مباشرة.
 */
const legalPoliciesMap: Record<LegalAudience, LegalAudiencePolicies> = {
  doctor: {
    audience: 'doctor',
    audienceLabel: 'الأطباء',
    cardTitle: 'الموافقة القانونية للطبيب',
    cardDescription:
      'قبل تسجيل الدخول أو إنشاء الحساب، يرجى مراجعة شروط استخدام الأطباء وسياسة الخصوصية والموافقة عليهما.',
    terms: doctorTermsDocument,
    privacy: doctorPrivacyDocument,
  },
  public: {
    audience: 'public',
    audienceLabel: 'الجمهور',
    cardTitle: 'الموافقة القانونية للجمهور',
    cardDescription:
      'قبل تسجيل الدخول كجمهور، يرجى مراجعة شروط الاستخدام وسياسة الخصوصية والموافقة عليهما.',
    terms: publicTermsDocument,
    privacy: publicPrivacyDocument,
  },
};

/**
 * دالة مساعدة لجلب حزمة الوثائق لجمهور محدد.
 * تُستخدم من الشاشات اللي بتعرض الشروط قبل تسجيل الدخول أو إنشاء الحساب.
 */
export const getLegalPoliciesForAudience = (audience: LegalAudience): LegalAudiencePolicies =>
  legalPoliciesMap[audience];
