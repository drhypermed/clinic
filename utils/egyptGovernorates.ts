/**
 * محافظات جمهورية مصر العربية الـ 27.
 * القائمة ثابتة ومشتركة بين كل نماذج بيانات المريض.
 */
export const EGYPT_GOVERNORATES = Object.freeze([
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
] as const);

export type EgyptGovernorate = (typeof EGYPT_GOVERNORATES)[number];

export const isEgyptGovernorate = (value: unknown): value is EgyptGovernorate =>
  EGYPT_GOVERNORATES.includes(String(value || '').trim() as EgyptGovernorate);
