import { Medication, Category } from '../../types';

const TAGS = {
  antiInflammatory: ['anti-inflammatory', '#anti-inflammatory', 'anti inflammatory', 'مضاد التهاب', 'التهاب', 'تورم', 'inflammation', 'swelling'],
  glucocorticoid: ['glucocorticoid', '#glucocorticoid', 'steroid', 'كورتيزون', 'كورتيكوستيرويد', 'مضاد التهاب كورتيزون', 'إكزيما', 'eczema', 'حساسية جلد', 'skin allergy', 'حكة', 'itching', 'dermatitis', 'التهاب جلدي'],
  bruises: ['bruises', 'hematoma', 'knot', 'كدمات', 'تجمع دموي', 'ورم دموي', 'خبطة', 'sprain', 'التواء'],
};

export const ANTI_INFLAMMATORY_MEDS: Medication[] = [
  // ==========================
  // ANTI-INFLAMMATORY (TOPICAL)
  // ==========================

  // 1. borgasone 0.1% lotion 20 ml
  {
    id: 'borgasone-mometasone-0-1-lotion-20',
    name: 'borgasone 0.1% lotion 20 ml',
    genericName: 'Mometasone Furoate',
    concentration: '0.1%',
    price: 33,
    matchKeywords: ['borgasone', 'بورجاسون', 'mometasone', 'موميتازون', 'lotion', 'scalp', 'التهاب جلد', 'حكة', 'فروة الرأس', 'صدفية', 'psoriasis', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'كورتيزون موضعي متوسط/قوي لتخفيف الالتهاب والحكة والاحمرار في الأمراض الجلدية المستجيبة للكورتيزون (خصوصاً مناطق الشعر/الفروة عند الحاجة).',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Lotion',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل/الرضاعة: يُستخدم عند الضرورة فقط على مساحات صغيرة ولأقصر مدة؛ تجنبي المساحات الكبيرة والضمادات المحكمة.',
      'تداخلات: قليلة موضعياً؛ تزداد احتمالية الامتصاص مع الجلد المتشقق/المساحات الكبيرة/الضمادات المحكمة.',
      'تحذيرات خاصة: لا يُستخدم على عدوى جلدية غير معالجة (فطرية/بكتيرية/فيروسية). خطر ترقق الجلد/خطوط/تفتيح مع الاستعمال الطويل. توقف إذا حدث تهيج شديد.'
    ]
  },

  // 2. borgasone 0.1% oint. 20 gm
  {
    id: 'borgasone-mometasone-0-1-oint-20',
    name: 'borgasone 0.1% oint. 20 gm',
    genericName: 'Mometasone Furoate',
    concentration: '0.1%',
    price: 35,
    matchKeywords: ['borgasone', 'بورجاسون', 'mometasone', 'ointment', 'مرهم', 'eczema', 'dermatitis', 'إكزيما', 'التهاب جلدي', 'حكة', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'مرهم كورتيزون موضعي لتخفيف الالتهاب والحكة في الأكزيما/التهاب الجلد المستجيب للكورتيزون.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة فقط بأقل كمية وأقصر مدة.',
      'تداخلات: قليلة موضعياً.',
      'تحذيرات: لا يُستخدم على عدوى جلدية غير معالجة. الاستعمال المطول قد يسبب ترقق الجلد وظهور شعيرات/خطوط.'
    ]
  },

  // 3. extrauma dna forte topical gel 25 gm
  {
    id: 'extrauma-dna-forte-hirudin-gel-25',
    name: 'extrauma dna forte topical gel 25 gm',
    genericName: 'Recombinant Hirudin',
    concentration: 'Standard',
    price: 41,
    matchKeywords: ['extrauma', 'اكستروما', 'hirudin', 'gel', 'forte', 'كدمات', 'خبطة', 'sports injury', 'إصابات رياضية', 'تورم', ...TAGS.antiInflammatory, ...TAGS.bruises],
    usage: 'جل موضعي لتخفيف الكدمات/التجمعات الدموية السطحية والتورم بعد الصدمات والالتواءات.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_INFLAMMATORY_EDEMA,
    form: 'Gel',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة فقط على مساحات صغيرة ولأقصر مدة.',
      'تداخلات: مع اضطرابات نزف/مميعات دم: تجنب المساحات الكبيرة؛ استخدم بأقل كمية ولأقصر مدة.',
      'تحذيرات: لا يوضع على جروح مفتوحة/عين/فم. توقف إذا ظهر طفح/حكة شديدة.'
    ]
  },

  // 4. extrauma dna forte topical gel 40 gm
  {
    id: 'extrauma-dna-forte-hirudin-gel-40',
    name: 'extrauma dna forte topical gel 40 gm',
    genericName: 'Recombinant Hirudin',
    concentration: 'Standard',
    price: 58,
    matchKeywords: ['extrauma', 'اكستروما', 'hirudin', 'gel', 'forte 40', '40 gm', ...TAGS.antiInflammatory, ...TAGS.bruises],
    usage: 'جل موضعي للكدمات والتورم بعد الصدمات (عبوة أكبر).',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_INFLAMMATORY_EDEMA,
    form: 'Gel',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.',
      'تداخلات: الحذر مع مميعات الدم/اضطرابات النزف.',
      'تحذيرات: لا يوضع على جروح مفتوحة أو الأغشية المخاطية.'
    ]
  },

  // 5. wellmetazone 0.1% cream 40 gm
  {
    id: 'wellmetazone-mometasone-0-1-cream-40',
    name: 'wellmetazone 0.1% cream 40 gm',
    genericName: 'Mometasone Furoate',
    concentration: '0.1%',
    price: 56,
    matchKeywords: ['wellmetazone', 'ويلميتازون', 'mometasone', 'cream', 'كريم', 'eczema', 'dermatitis', 'إكزيما', 'حساسية جلد', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'كريم كورتيزون موضعي لتخفيف الالتهاب والحكة في الأكزيما/التهاب الجلد (حسب التشخيص).',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة وبأقل جرعة.',
      'تداخلات: قليلة موضعياً.',
      'تحذيرات: الاستخدام المطول قد يسبب ترقق الجلد/حبوب كورتيزون. لا يُستخدم على مناطق واسعة للأطفال.'
    ]
  },

  // 6. allerzone 0.1% oint. 25 gm (n/a)
  {
    id: 'allerzone-mometasone-0-1-oint-25',
    name: 'allerzone 0.1% oint. 25 gm (n/a)',
    genericName: 'Mometasone Furoate',
    concentration: '0.1%',
    price: 19,
    matchKeywords: ['allerzone', 'اليرزون', 'mometasone', 'ointment', 'مرهم', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'مرهم كورتيزون موضعي لتخفيف الالتهاب والحكة في الأمراض الجلدية المستجيبة للكورتيزون.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.',
      'تداخلات: قليلة موضعياً.',
      'تحذيرات: لا يُستخدم مع عدوى جلدية غير معالجة. خطر ترقق الجلد مع الاستخدام الطويل.'
    ]
  },

  // 7. borgasone 0.1% cream 20 gm
  {
    id: 'borgasone-mometasone-0-1-cream-20',
    name: 'borgasone 0.1% cream 20 gm',
    genericName: 'Mometasone Furoate',
    concentration: '0.1%',
    price: 35,
    matchKeywords: ['borgasone', 'بورجاسون', 'mometasone', 'cream', 'كريم', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'كريم كورتيزون موضعي لتخفيف الالتهاب والحكة في الأكزيما/التهاب الجلد.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل/الرضاعة: أقل كمية لأقصر مدة.',
      'تداخلات: قليلة موضعياً.',
      'تحذيرات: توقف إذا ظهر تهيج شديد أو علامات عدوى.'
    ]
  },

  // 8. allerzone 0.1% cream 25 gm
  {
    id: 'allerzone-mometasone-0-1-cream-25',
    name: 'allerzone 0.1% cream 25 gm',
    genericName: 'Mometasone Furoate',
    concentration: '0.1%',
    price: 40,
    matchKeywords: ['allerzone', 'اليرزون', 'mometasone', 'cream', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'كريم كورتيزون موضعي لتخفيف الالتهاب والحكة والاحمرار في أمراض جلدية مستجيبة للكورتيزون.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.',
      'تداخلات: قليلة موضعياً.',
      'تحذيرات: الاستخدام المفرط قد يسبب ترقق الجلد.'
    ]
  },

  // 9. borgasone trio cream 15 gm
  {
    id: 'aromega-60mg-gel',
    name: 'aromega 60 mg gel',
    genericName: 'Omega 3 + Omega 6 + Menthol + Camphor + Clove + Avocado Oil + Almond Oil + Eucalyptus',
    concentration: '60 mg',
    price: 98,
    matchKeywords: ['aromega', 'اروميجا', 'menthol', 'camphor', 'clove', 'massage', 'gel', 'muscle', 'joint', ...TAGS.antiInflammatory],
    usage: 'جل موضعي للتدليك وتخفيف آلام العضلات والمفاصل البسيطة وإحساس الشد (تأثير مُبرّد/مسكن موضعي).',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_INFLAMMATORY_EDEMA,
    form: 'Gel',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: [
      'الحمل: يُستخدم بحذر على مساحات صغيرة بسبب الزيوت العطرية/المنثول.',
      'تداخلات: لا تُستخدم معه منتجات مُهيِّجة أخرى على نفس المكان.',
      'تحذيرات: قد يسبب تهيج/حساسية خاصة لذوي البشرة الحساسة. توقف إذا حدث حرقان شديد.'
    ]
  },

  // 11. borgasone plus oint. 30 gm
  {
    id: 'borgasone-plus-mometasone-salicylic-oint-30',
    name: 'borgasone plus oint. 30 gm',
    genericName: 'Mometasone Furoate + Salicylic Acid',
    concentration: 'Combination',
    price: 36,
    matchKeywords: ['borgasone plus', 'بورجاسون بلس', 'mometasone', 'salicylic', 'keratolytic', 'psoriasis', 'thick plaques', 'قشور', 'صدفية', 'إكزيما سميكة', ...TAGS.antiInflammatory, ...TAGS.glucocorticoid],
    usage: 'مرهم (كورتيزون + ساليسيليك) لتقليل القشور/السماكة في الصدفية/الأكزيما السميكة؛ مرة–مرتين يومياً لفترة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة فقط على مساحات صغيرة؛ تجنب المساحات الكبيرة (الساليسيليك).',
      'تداخلات: تجنب الجمع مع مقشرات قوية أخرى على نفس المنطقة.',
      'تحذيرات: خطر تهيج/حرقان. الاستخدام المطول قد يسبب ترقق الجلد. لا يُستخدم على عدوى جلدية غير معالجة.'
    ]
  },

  // 12. hemoclar 0.5% cream 40 gm
  {
    id: 'hemoclar-pentosan-0-5-cream-40',
    name: 'hemoclar 0.5% cream 40 gm',
    genericName: 'Pentosan Polysulfate',
    concentration: '0.5%',
    price: 46,
    matchKeywords: ['hemoclar', 'هيموكلار', 'pentosan', 'cream', 'bruises', 'hematoma', 'varicose', 'كدمات', 'دوالي', 'التهاب أوردة', 'تورم', ...TAGS.antiInflammatory, ...TAGS.bruises],
    usage: 'كريم موضعي لتخفيف الكدمات والتورمات السطحية وقد يفيد في التهاب الأوردة السطحية/الدوالي حسب الحالة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_INFLAMMATORY_EDEMA,
    form: 'Cream',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.',
      'تداخلات: الحذر مع اضطرابات النزف أو الاستخدام المتزامن لمميعات الدم عند تطبيقه على مساحات كبيرة.',
      'تحذيرات: لا يوضع على الأغشية المخاطية/العين. توقف إذا ظهر تهيج شديد.'
    ]
  },
];

