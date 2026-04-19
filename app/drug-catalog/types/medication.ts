// ─────────────────────────────────────────────────────────────────────────────
// أنواع الأدوية والوصفات (Medication & Prescription Items)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - Medication: السجل الأساسي لأي دواء في الكتالوج (الاسم، السعر، الجرعة ...)
//   - AlternativeMed: دواء بديل يقترحه النظام أو الـ AI
//   - PrescriptionItem: بند واحد داخل روشتة (دواء أو ملاحظة)
//   - MedicationCustomization: تعديلات الطبيب الشخصية على الدواء الأصلي
// ─────────────────────────────────────────────────────────────────────────────

import { Category } from './category';

/**
 * السجل الأساسي للدواء في كتالوج العيادة.
 * ملاحظة: calculationRule هي دالة تحسب الجرعة بناء على وزن وعمر المريض،
 * وده اللي بيخلي الدواء "ذكي" في حساب الجرعة تلقائياً للأطفال.
 */
export interface Medication {
  id: string;
  name: string;
  genericName: string;
  concentration: string;
  price: number;
  usage: string;
  timing: string;
  category: Category | string;

  // الشكل الصيدلي للدواء — قائمة مغلقة عشان نمنع كتابة أي نص عشوائي.
  // ممكن تبقى طويلة لكن لازم نكون دقيقين: "Drops" غير "Oral Drops"، و"Tablet" غير "Tablets".
  form:
  | 'Drops'
  | 'Syrup'
  | 'Liquid / Syrup'
  | 'Syrup / Drops'
  | 'Syrup (Malt base)'
  | 'Suppositories'
  | 'Suspension'
  | 'Sachets'
  | 'Sachets (Direct to mouth)'
  | 'Sachets (ODT)'
  | 'Sachets (Powder)'
  | 'Sachets (Direct/Dissolvable)'
  | 'Gel'
  | 'Spray'
  | 'Cream'
  | 'Ointment'
  | 'Solution'
  | 'Vial'
  | 'Vial (SC/IV)'
  | 'Pen'
  | 'Ampoule'
  | 'Ampoules'
  | 'Ampoule (IV/IM)'
  | 'Ampoule (IV)'
  | 'Injection (IM)'
  | 'Injection (IM ONLY)'
  | 'Injection (IM/IV)'
  | 'Injection (IV ONLY)'
  | 'Injection (IV)'
  | 'Injection (IV Infusion)'
  | 'Injection (IV/IM)'
  | 'Injection (SC/IV)'
  | 'Lotion'
  | 'Granules'
  | 'Tablet'
  | 'Tablets'
  | 'Sugar Coated Tablet'
  | 'Sugar Coated Tablets'
  | 'Film-coated Tablet'
  | 'Film Coated Tablet'
  | 'Film-coated Tablets'
  | 'Scored Tablet'
  | 'Prolonged Release Tablet'
  | 'Sustained-release Capsule'
  | 'Sustained-release Film-coated Tablet'
  | 'Soft Gelatin Capsule'
  | 'Softgel Capsule'
  | 'Suppository'
  | 'Capsule'
  | 'Capsules'
  | 'S.R. Capsule'
  | 'Inhalation Capsules'
  | 'Inhalation Powder (Diskus)'
  | 'Film'
  | 'Orodispersible Film'
  | 'Film-coated Tablets'
  | 'F.C. Tablets'
  | 'E.C. Tablets'
  | 'Orodispersible Tablet'
  | 'Oral Dispersible Tablet'
  | 'Delayed Release Tablet'
  | 'Enteric Coated Tablets'
  | 'Gastro-resistant Tablets'
  | 'Gastro-Resistant Tablets'
  | 'Chewable Tablet'
  | 'Chewable Tablets'
  | 'Effervescent Tablets'
  | 'Modified-release Capsules'
  | 'Delayed-release Capsules'
  | 'Delayed-Release Capsules'
  | 'Oral Suspension'
  | 'Oral Suspension Sachets'
  | 'Powder for Oral Suspension Sachets'
  | 'Powder for I.V. Infusion Vial'
  | 'I.V. Infusion Vial'
  | 'Inhaler'
  | 'Diskus'
  | 'Turbuhaler'
  | 'Foam'
  | 'Powder'
  | 'Cleanser'
  | 'Mouthwash'
  | 'Caplet'
  | 'Tablet/Capsule Pack'
  | 'Nasal Drops'
  | 'Nasal Spray'
  | 'Eye Drops'
  | 'Lozenge'
  | 'Lozenges'
  | 'Chocolate Pieces'
  | 'Chocolate Balls (Edible)'
  | 'Edible Piece'
  | 'Oral Drops';

  // الفئة العمرية والوزنية المسموحة للدواء — تُستخدم في فلترة الأدوية المناسبة للمريض
  minAgeMonths: number;
  maxAgeMonths: number;
  minWeight: number;
  maxWeight: number;

  // الدالة اللي بتحسب الجرعة النهائية — المعادلة الطبية الخاصة بالدواء
  calculationRule: (weight: number, ageMonths: number) => string;

  instructions?: string;
  warnings: string[];
  matchKeywords?: string[]; // كلمات إضافية تساعد في البحث
  isNew?: boolean; // علامة للأدوية المضافة حديثاً
}

/**
 * دواء بديل يُقترح على الطبيب — يظهر مثلاً في نتائج البحث بالذكاء الاصطناعي
 * أو في حالة عدم توفر الدواء الأصلي.
 */
export interface AlternativeMed {
  name: string;
  scientificName: string; // الاسم العلمي للدواء (المادة الفعالة)
  concentration: string;
  price: number;
  form: string;
  dosage: string;
  instructions: string;
}

/**
 * بند واحد داخل الروشتة — ممكن يكون دواء كامل أو مجرد ملاحظة نصية.
 * التقسيم بـ type يخلينا نفرق في الـ UI بين صف دواء وصف ملاحظة.
 */
export interface PrescriptionItem {
  id?: string;
  type: 'medication' | 'note';
  medication?: Medication;
  dosage?: string;
  instructions: string;
  reasonForUse?: string;
  source?: 'Local Database' | 'Online Search (AI)'; // هل الدواء جه من قاعدتنا ولا من البحث الذكي
  alternatives?: AlternativeMed[];
  customFontSize?: string; // حجم خط مخصص لهذا البند في الطباعة
}

/**
 * تخصيصات الطبيب الشخصية للدواء — بيانات المستخدم الخاصة به
 * (بنحفظها في Firestore تحت حساب كل طبيب عشان كل واحد يشوف تعديلاته بس).
 */
export interface MedicationCustomization {
  medicationId: string;
  name?: string;
  genericName?: string;
  concentration?: string;
  price?: number;
  usage?: string;
  timing?: string;
  instructions?: string;
  warnings?: string[];
  minAgeMonths?: number;
  maxAgeMonths?: number;
  minWeight?: number;
  maxWeight?: number;
  matchKeywords?: string[];

  // الجرعة — عدة طرق لتعريفها حسب الحالة:
  dosageText?: string;      // نص الجرعة المخصص (يُستخدم مباشرة)
  dosageFormula?: string;   // صيغة حساب الجرعة (مثال: "weight * 10" أو "10 مجم لكل كجم")
  dosageFullText?: string;  // نص الجرعة الكامل بجميع الأوزان والأعمار (للأدوية غير الحقن والشراب)

  // الحالات المستخرجة من calculationRule مع نطاق الوزن والعمر
  // مفيدة لعرض الجرعة بناءً على حالة المريض بدون تشغيل دالة JavaScript
  dosageConditions?: Array<{
    condition: string;
    text: string;
    minWeight?: number;
    maxWeight?: number;
    minAgeMonths?: number;
    maxAgeMonths?: number;
    ageUnit?: 'days' | 'months' | 'years';
  }>;

  category?: string;
  form?: string;
  isNew?: boolean; // للدلالة على أن الدواء أضيف حديثاً
  dateModified?: number; // Timestamp للترتيب زمنياً
}
