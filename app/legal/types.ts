// ─────────────────────────────────────────────────────────────────────────────
// أنواع الوثائق القانونية (Legal Types)
// ─────────────────────────────────────────────────────────────────────────────
// تعريف الأنواع المستخدمة في عرض شروط الاستخدام وسياسة الخصوصية لكل من:
//   - الأطباء (doctor): لهم شروط وسياسة مختلفة حسب المسؤوليات المهنية
//   - الجمهور (public): المستخدمين اللي بيحجزوا عند الأطباء من الفورم العام
// ─────────────────────────────────────────────────────────────────────────────

/** الجمهور المستهدف بالوثيقة — إما طبيب أو زائر عام */
export type LegalAudience = 'doctor' | 'public';

/** نوع الوثيقة — إما شروط استخدام أو سياسة خصوصية */
export type LegalDocumentKind = 'terms' | 'privacy';

/** قسم واحد داخل الوثيقة — عنوان + قائمة نقاط تحته */
interface LegalSection {
  heading: string;
  points: string[];
}

/**
 * تعريف وثيقة قانونية كاملة (شروط أو سياسة).
 * version و effectiveDate مهمين جداً عشان نعرف لو تم تحديث الوثيقة
 * ونطلب من المستخدم الموافقة من جديد على النسخة الجديدة.
 */
export interface LegalDocumentDefinition {
  kind: LegalDocumentKind;
  audience: LegalAudience;
  title: string;
  version: string;       // مثال: "2026.04b-doctor-privacy" — لتتبع الإصدارات
  effectiveDate: string; // تاريخ بدء سريان الإصدار
  intro: string;         // مقدمة الوثيقة (بتظهر قبل الأقسام)
  sections: LegalSection[];
  consentLabel: string;  // نص زر الموافقة (مثلاً: "أوافق على الشروط")
}

/**
 * حزمة الوثائق لجمهور محدد — بتجمع الشروط + سياسة الخصوصية في مكان واحد.
 * بنستخدمها في الكارد اللي بنعرضه قبل تسجيل الدخول.
 */
export interface LegalAudiencePolicies {
  audience: LegalAudience;
  audienceLabel: string;   // اسم الجمهور بالعربي للعرض (مثال: "الأطباء")
  cardTitle: string;       // عنوان الكارد في الشاشة
  cardDescription: string; // وصف مختصر تحت العنوان
  terms: LegalDocumentDefinition;
  privacy: LegalDocumentDefinition;
}
