import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const cefepimeDose = (weightKg: number, ageMonths: number, concentration: string, route: 'IV' | 'IM'): string => {
  if (ageMonths < 2) return 'أقل من شهرين: جرعات خاصة—يلزم بروتوكول.';
  const v = concentration === '2gm' || concentration === '2g' ? 2000 : concentration === '1gm' || concentration === '1g' ? 1000 : 0;
  if (!v) return 'جرعة غير متاحة لهذا التركيز.';
  const isAdult = ageMonths >= 144 || weightKg >= 40;
  const mgPerMl = route === 'IV' ? 100 : 280;
  const doseMin = isAdult ? 1000 : clamp(weightKg * 50, 0, 2000);
  const doseMax = isAdult ? 1000 : clamp(weightKg * 75, 0, 2000);
  const mlMin = Math.round((doseMin / mgPerMl) * 10) / 10;
  const mlMax = Math.round((doseMax / mgPerMl) * 10) / 10;
  if (Math.abs(mlMin - mlMax) < 0.1) return `${toAr(mlMin)} مل كل ١٢ ساعة لمدة ٧–١٤ يوم`;
  return `${toAr(mlMin)}–${toAr(mlMax)} مل كل ١٢ ساعة لمدة ٧–١٤ يوم`;
};

const cefepime = (conc: string, route: 'IV' | 'IM') => (w: number, a: number) => cefepimeDose(w, a, conc, route);

const COMMON_CEPHALOSPORIN_WARNINGS = [
  'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
  'تاريخ حساسية بنسلين: نسبة التفاعل المتبادل مع السيفالوسبورينات ≈١–٢٪؛ اسأل المريض وتجنّب عند حساسية شديدة سابقة (anaphylaxis).',
  'إسهال شديد/دموي أو ألم بطن مستمر: أوقف المضاد واشتبه بالتهاب قولون C. difficile؛ أجرِ فحص Toxin/زرع وعالج حسب التشخيص والتحاليل (مترونيدازول ٥٠٠ مجم × ٣ فموي أو فانكومايسين فموي في الحالات الشديدة).',
  'مرضى الكلى/كبار السن: قد تحتاج الجرعة لتعديل حسب وظائف الكلى.',
  'لا يفيد في نزلات البرد والإنفلونزا (عدوى فيروسية).',
];

export const FOURTH_GEN_CEPHALOSPORINS: Medication[] = [
  // ==========================================
  // CEFEPIME (Injectables) - 4th Gen
  // ==========================================

  // 1. Wincef 1g (IV)
  {
    id: 'wincef-1gm-vial',
    name: 'Wincef 1 gm i.v. vial',
    genericName: 'Cefepime',
    concentration: '1gm',
    price: 94,
    matchKeywords: ['wincef 1g iv', 'wincef iv', 'wincef 1g', 'wincef', 'cefepime', 'iv', 'حقن وريد', 'febrile neutropenia', 'pseudomonas', 'hospital acquired pneumonia', 'sepsis', 'severe uti', 'ميكروب دم', 'عدوى مستشفيات', 'حمى نقص المناعة'],
    usage: 'سيفيبيم وريد فقط (يغطي سودوموناس) للحالات الحرجة وحمى نقص العدلات. الجرعة: ١–٢ جم كل ٨–١٢ ساعة؛ حمى نقص العدلات: ٢ جم كل ٨ ساعات. المدة: ٧–١٠ أيام حسب الاستجابة.',
    timing: 'كل ١٢ ساعة – ٧–١٤ يوم',
    category: Category.CEPHALOSPORINS_G4,
    form: 'Vial',
    minAgeMonths: 2, // Safe from 2 months
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 200,
    calculationRule: cefepime('1gm', 'IV'),
    warnings: [...COMMON_CEPHALOSPORIN_WARNINGS, 'يغطي بكتيريا السودوموناس (Pseudomonas).', 'يتم تعديل الجرعة لمرضى القصور الكلوي.']
  },

  // Wincef 1g (IM)
  {
    id: 'wincef-1gm-im-vial',
    name: 'Wincef 1 gm i.m. vial',
    genericName: 'Cefepime',
    concentration: '1gm',
    price: 94,
    matchKeywords: ['wincef 1g im', 'wincef im', 'wincef 1g', 'wincef', 'cefepime', 'im', 'حقن عضل', 'febrile neutropenia', 'pseudomonas', 'hospital acquired pneumonia', 'sepsis', 'severe uti', 'ميكروب دم', 'عدوى مستشفيات', 'حمى نقص المناعة'],
    usage: 'سيفيبيم عضل فقط (يغطي سودوموناس) للحالات الحرجة. الجرعة: ١–٢ جم كل ٨–١٢ ساعة. المدة: ٧–١٠ أيام.',
    timing: 'كل ١٢ ساعة – ٧–١٤ يوم',
    category: Category.CEPHALOSPORINS_G4,
    form: 'Vial',
    minAgeMonths: 2,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 200,
    calculationRule: cefepime('1gm', 'IM'),
    warnings: [...COMMON_CEPHALOSPORIN_WARNINGS, 'يغطي بكتيريا السودوموناس (Pseudomonas).', 'يتم تعديل الجرعة لمرضى القصور الكلوي.']
  },

  // 2. Pimfast 1g (IV)
  {
    id: 'pimfast-1gm-vial',
    name: 'Pimfast 1 gm vial i.v. inj.',
    genericName: 'Cefepime',
    concentration: '1gm',
    price: 73,
    matchKeywords: ['pimfast 1g iv', 'pimfast iv', 'pimfast 1g', 'pimfast', 'cefepime', 'iv', 'حقن وريد', 'meningitis', 'severe pneumonia', 'intra-abdominal infection', 'pyelonephritis', 'التهاب سحائي', 'التهاب رئوي شديد', 'صديد كلى'],
    usage: 'سيفيبيم وريد فقط للعدوى المستعصية والتهاب السحايا. الجرعة: ٢ جم كل ٨ ساعات (سحايا، ذات رئة مستشفوية، صفاق)؛ ١–٢ جم كل ١٢ ساعة في عدوى بول/جلد. المدة: ٧–١٤ يوم.',
    timing: 'كل ١٢ ساعة – ٧–١٤ يوم',
    category: Category.CEPHALOSPORINS_G4,
    form: 'Vial',
    minAgeMonths: 2,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 200,
    calculationRule: cefepime('1gm', 'IV'),
    warnings: [...COMMON_CEPHALOSPORIN_WARNINGS, 'فعال جداً ضد البكتيريا المقاومة.', 'يتم تعديل الجرعة لمرضى القصور الكلوي.']
  },

  // Pimfast 1g (IM)
  {
    id: 'pimfast-1gm-im-vial',
    name: 'Pimfast 1 gm vial i.m. inj.',
    genericName: 'Cefepime',
    concentration: '1gm',
    price: 73,
    matchKeywords: ['pimfast 1g im', 'pimfast im', 'pimfast 1g', 'pimfast', 'cefepime', 'im', 'حقن عضل', 'meningitis', 'severe pneumonia', 'intra-abdominal infection', 'pyelonephritis', 'التهاب سحائي', 'التهاب رئوي شديد', 'صديد كلى'],
    usage: 'سيفيبيم عضل فقط للعدوى المستعصية. الجرعة: ١–٢ جم كل ١٢ ساعة. المدة: ٧–١٠ أيام. يُفضّل الوريد في السحايا والذات الرئة الشديدة.',
    timing: 'كل ١٢ ساعة – ٧–١٤ يوم',
    category: Category.CEPHALOSPORINS_G4,
    form: 'Vial',
    minAgeMonths: 2,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 200,
    calculationRule: cefepime('1gm', 'IM'),
    warnings: [...COMMON_CEPHALOSPORIN_WARNINGS, 'فعال جداً ضد البكتيريا المقاومة.', 'يتم تعديل الجرعة لمرضى القصور الكلوي.']
  }
];
