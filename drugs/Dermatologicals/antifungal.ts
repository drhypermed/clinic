import { Medication, Category } from '../../types';

export const DERM_ANTIFUNGALS: Medication[] = [
  // ==========================================
  // SYSTEMIC ANTIFUNGALS (Azoles / Allylamines)
  // ==========================================

  // 1. Itranox 100mg 15 caps.
  {
    id: 'miconaz-miconazole-spray-liquid-2-60',
    name: 'Miconaz 2% liquid spray 60 mi',
    genericName: 'Miconazole',
    concentration: '2%',
    price: 43,
    matchKeywords: ['miconaz spray', 'miconazole spray', 'ميكوناز سبراي', 'فطريات قدم', 'فطريات', 'fungal', 'tinea', 'سعفة', 'تينيا', 'antifungal', 'مضاد فطريات'],
    usage: 'بخاخ/محلول مضاد فطريات للجلد والقدم.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTIFUNGAL,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['للاستعمال الخارجي فقط.', 'تجنب استنشاق الرذاذ.']
  },

  // 48. Miconaz 2% powder spray 60 ml
  {
    id: 'candistan-clotrimazole-powder-1-40',
    name: 'Candistan 1% topical powder. 40 gm',
    genericName: 'Clotrimazole',
    concentration: '1%',
    price: 10,
    matchKeywords: ['candistan powder', 'clotrimazole powder', 'كانديستان بودرة', 'تسلخات', 'فطريات', 'fungal', 'tinea', 'candida', 'كانديدا', 'مضاد فطريات'],
    usage: 'بودرة كلوتريمازول للتسلخات والفطريات بثنايا الجلد والقدم.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTIFUNGAL,
    form: 'Powder',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 200,
    calculationRule: () => 'يُرش على المنطقة المصابة بعد التنظيف والتجفيف مرتين يومياً لمدة ٢–٤ أسابيع',
    warnings: ['تجنب استنشاق المسحوق.']
  },

  // 44. Candistan 1% topical cream 40 gm
  {
    id: 'gynotrazonagen-isoconazole-ovules-600-3',
    name: 'Gynotrazonagen 600mg 3 vaginal ovules+applicator',
    genericName: 'Isoconazole Nitrate',
    concentration: '600mg',
    price: 33,
    matchKeywords: ['gynotrazonagen', 'isoconazole', 'vaginal ovules', 'التهاب مهبلي', 'جينو', 'فطريات مهبل', 'كانديدا', 'candida', 'vaginal candidiasis'],
    usage: 'لبوس/أوفولات مهبلية لعلاج كانديدا/التهاب مهبلي فطري.',
    timing: 'ليلاً',
    category: Category.ANTIFUNGAL,
    form: 'Suppositories',
    minAgeMonths: 192,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: () => 'لبوسة مهبلية ليلاً لمدة ٣–٧ أيام حسب البروتوكول',
    warnings: ['قد يضعف الواقي/الحاجز المطاطي أثناء العلاج.', 'يُفضل تجنب الغسولات الداخلية.']
  },

  // 54. Candicure 1 - 600mg 3 vag. ovules
  {
    id: 'fangrare-cleanser-200',
    name: 'Fangrare shower gel 200 ml',
    genericName: 'Dimethicone + Climbazole + Tea Tree Oil + Hibiscus Extract + Others',
    concentration: '200ml',
    price: 150,
    matchKeywords: ['fangrare', 'climbazole', 'tea tree', 'شاور جل فطريات', 'فانجراير'],
    usage: 'شاور جل/منظف داعم في حالات الفطريات السطحية/الروائح/الالتهاب الدهني حسب الاستعمال التجميلي.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTIFUNGAL,
    form: 'Cleanser',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['منتج داعم/عناية: لا يغني عن العلاج الدوائي في العدوى الشديدة.', 'تجنب العين.']
  },

  // ==========================================
  // COMBINATION (Antifungal + Steroid)
  // ==========================================

  // 12. Elica-M cream 30 gram
  {
    id: 'elica-m-mometasone-miconazole-cream-30',
    name: 'Elica-M cream 30 gram',
    genericName: 'Mometasone Furoate + Miconazole Nitrate',
    concentration: 'Cream',
    price: 52,
    matchKeywords: ['elica-m', 'mometasone miconazole', 'اليكا ام', 'فطريات ملتهبة', 'فطريات', 'fungal', 'كورتيزون', 'steroid', 'تينيا', 'tinea', 'حكة'],
    usage: 'مزيج (مضاد فطريات + كورتيزون متوسط القوة) للحالات الملتهبة المصحوبة بحكة شديدة لفترة قصيرة فقط.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTIFUNGAL,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'يحتوي على كورتيزون: لا يستخدم على الوجه/حول العينين/المناطق الحساسة لفترات طويلة.',
      'قد يُخفي أعراض الفطريات ويزيدها إذا أُسيء الاستخدام (Tinea incognito).',
      'يحتوي على كورتيزون: خطر ترقق الجلد مع الاستخدام الطويل.'
    ]
  },

  // 38. Daktacort cream 15 gm
  
];

