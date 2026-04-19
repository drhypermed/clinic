import { Medication, Category } from '../../types';

const TAGS = {
  massage: ['massage', '#massage', 'مساج', 'تدليك', 'massage cream', 'massage gel'],
  muscle: ['muscle', '#muscle', 'muscle pain', 'myalgia', 'عضلات', 'آلام عضلات'],
  topicalAnalgesic: ['topical analgesic', '#topical analgesic', 'مسكن موضعي', 'دهان مسكن'],
  nsaid: ['nsaid', '#nsaid', 'NSAID', 'مضاد التهاب', 'anti-inflammatory'],
  antiInflammatory: ['anti-inflammatory', '#anti-inflammatory', 'مضاد التهاب'],
  antirheumatic: ['antirheumatic', '#antirheumatic', 'روماتيزم', 'روماتيزمي'],
  salicylate: ['salicylate', '#salicylate', 'salicylates', 'ساليسيلات'],
  topicalAnaesthetic: ['topical anaesthetic', 'topical anesthetic', '#topical anaesthetic', 'local anesthetic', 'مخدر موضعي', 'بنج موضعي'],
  glucocorticoid: ['glucocorticoid', '#glucocorticoid', 'corticosteroid', 'steroid', 'كورتيزون'],
  keratolytic: ['keratolytic', '#keratolytic', 'مقشر', 'كيراتوليتيك']
} as const;

export const TOPICAL_ANALGESICS_MEDS: Medication[] = [
  // 1
  {
    id: 'rheumatizen-camphor-menthol-methyl-salicylate-cream-30',
    name: 'rheumatizen topical cream 30 gm',
    genericName: 'Camphor + Menthol + Methyl salicylate',
    concentration: '30 gm',
    price: 35,
    matchKeywords: ['rheumatizen', 'rheumatizen cream', 'ريوماتيزن', 'مسكن موضعي', 'مرهم مسكن', 'آلام العضلات', 'شد عضلي', 'التواء', 'camphor', 'menthol', 'methyl salicylate'],
    usage: 'مسكن موضعي (counter-irritant) لآلام العضلات والمفاصل والشدّ العضلي البسيط.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُفضّل تجنبه على مساحات كبيرة؛ استعمل أقل كمية ولأقصر مدة بعد تقييم الفائدة والخطر.',
      'تداخلات: الساليسيلات موضعياً قد تزيد التهيج مع مقشرات/NSAIDs موضعية أخرى.',
      'تحذيرات خاصة: قد يسبب تهيجاً/حساسية. أوقفه إذا ظهر طفح شديد.'
    ]
  },

  // 2
  {
    id: 'rheumatizen-camphor-menthol-methyl-salicylate-cream-60',
    name: 'rheumatizen topical cream 60 gm',
    genericName: 'Camphor + Menthol + Methyl salicylate',
    concentration: '60 gm',
    price: 51,
    matchKeywords: ['rheumatizen 60', 'ريوماتيزن 60', 'camphor', 'menthol', 'methyl salicylate', 'آلام العضلات', 'آلام المفاصل'],
    usage: 'مسكن موضعي لآلام العضلات والمفاصل البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر وعلى مساحات صغيرة.', 'تداخلات: تجنب الجمع مع مسكنات موضعية متعددة.', 'تحذيرات: تهيج/حساسية محتمل.']
  },

  // 3
  {
    id: 'adwiflam-diclofenac-diethylamine-methyl-salicylate-menthol-emulgel-50',
    name: 'adwiflam emulgel 50 gm',
    genericName: 'Methyl salicylate + Diclofenac diethylamine + Menthol',
    concentration: '50 gm',
    price: 55,
    matchKeywords: ['adwiflam', 'ادويفلام', 'diclofenac gel', 'ديكلوفيناك', 'مضاد التهاب موضعي', 'آلام العضلات', 'آلام الظهر', 'التواء', 'sports injury', 'menthol', 'methyl salicylate', ...TAGS.nsaid, ...TAGS.salicylate, ...TAGS.massage, ...TAGS.muscle, ...TAGS.antirheumatic],
    usage: 'مسكن/مضاد التهاب موضعي لآلام العضلات والمفاصل (التواءات/شدّ) عند الحاجة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: تجنب مضادات الالتهاب (NSAIDs) خصوصاً في الثلث الثالث؛ استخدم بعد تقييم الفائدة والخطر.',
      'تداخلات: لا تجمعه مع NSAIDs موضعية/فموية بكثرة على مساحات كبيرة.',
      'تحذيرات خاصة: قد يسبب تحسس ضوئي/تهيّج جلدي. أوقفه عند طفح.'
    ]
  },

  // 4
  {
    id: 'repaion-n-camphor-menthol-eucalyptus-salicylic-acid-gel-100',
    name: 'repaion-n gel 100 gm',
    genericName: 'Camphor oil + Menthol crystals + Eucalyptus oil + Salicylic acid',
    concentration: '100 gm',
    price: 110,
    matchKeywords: ['repaion', 'repaion-n', 'ريبايون', 'salicylic acid', 'camphor', 'menthol', 'eucalyptus', 'مساج', 'آلام عضلات', 'روماتيزم', 'شد عضلي', ...TAGS.massage, ...TAGS.muscle, ...TAGS.nsaid, ...TAGS.antirheumatic, ...TAGS.salicylate, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/مسكن موضعي لآلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر وعلى مساحات صغيرة.', 'تداخلات: تجنب الجمع مع مقشرات/ساليسيلات أخرى موضعياً.', 'تحذيرات: قد يسبب تهيجاً خاصة لذوي البشرة الحساسة.']
  },

  // 5
  {
    id: 'lidocaine-10-topical-spray-15g',
    name: 'lidocaine 10% topical spray 15 gm',
    genericName: 'Lidocaine',
    concentration: '10%',
    price: 38,
    matchKeywords: ['lidocaine 10 spray', 'ليدوكايين سبراي', 'بخاخ ليدوكايين', 'مخدر موضعي', 'topical anesthetic', 'pain relief spray', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي لتخفيف الألم الموضعي/قبل إجراءات سطحية بسيطة حسب الحاجة.',
    timing: 'عند اللزوم (جرعات متباعدة).',
    category: Category.ANALGESICS,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'رش كمية قليلة على المنطقة المطلوبة، وتجنب تكرار الرش على مساحة كبيرة.',
    warnings: [
      'الحمل: عادة آمن عند الاستعمال الموضعي بكمية قليلة؛ تقييم الفائدة والخطر أفضل.',
      'تداخلات: تجنب الجمع مع مخدرات موضعية أخرى أو أدوية اضطراب النظم دون إعادة تقييم.',
      'تحذيرات خاصة: الإفراط قد يسبب أعراض تسمم (دوخة/تنميل شديد/اضطراب نظم). توقف واطلب مساعدة إذا ظهرت أعراض عامة.'
    ]
  },

  // 6
  {
    id: 'moov-camphor-menthol-methyl-salicylate-capsicum-cream-40',
    name: 'moov massage cream 40 gm',
    genericName: 'Camphor + Menthol + Methyl salicylate + Capsicum oleoresin',
    concentration: '40 gm',
    price: 35,
    matchKeywords: ['moov', 'مووف', 'capsicum', 'كابسيسين', 'camphor', 'menthol', 'methyl salicylate', 'مساج', 'آلام عضلات', 'شد عضلي', ...TAGS.massage, ...TAGS.muscle, ...TAGS.antirheumatic, ...TAGS.salicylate, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج/مسكن موضعي لآلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر وعلى مساحات صغيرة.', 'تداخلات: تجنب الجمع مع مسكنات موضعية متعددة.', 'تحذيرات: تجنب ملامسة الأغشية المخاطية.']
  },

  // 7
  {
    id: 'rubalgine-methyl-salicylate-15-cream-20',
    name: 'rubalgine 15% topical cream 20 gm',
    genericName: 'Methyl salicylate',
    concentration: '15%',
    price: 35,
    matchKeywords: ['rubalgine', 'روبالجين', 'methyl salicylate 15%', 'مسكن موضعي', 'آلام عضلات'],
    usage: 'مسكن موضعي (ساليسيلات) لآلام العضلات والمفاصل البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر خصوصاً قرب نهاية الحمل.', 'تداخلات: تجنب الجمع مع ساليسيلات أخرى على مساحات كبيرة.', 'تحذيرات: قد يسبب تهيجاً/حساسية.']
  },

  // 8
  {
    id: 'ultracaine-lidocaine-5-gel-30',
    name: 'ultracaine 5% gel 30 gm',
    genericName: 'Lidocaine',
    concentration: '5%',
    price: 31,
    matchKeywords: ['ultracaine gel', 'التركاين', 'lidocaine gel 5', 'مخدر موضعي', 'topical anesthetic', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي لتخفيف الألم/الحكة/قبل إجراءات سطحية حسب الحاجة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: تجنب مخدرات موضعية متعددة.', 'تحذيرات: الإفراط قد يسبب أعراض عامة/تنميل شديد.']
  },

  // 9
  {
    id: 'voltaren-diclofenac-sodium-1-emulgel-100',
    name: 'voltaren 1% emulgel 100 gm',
    genericName: 'Diclofenac sodium',
    concentration: '1%',
    price: 101,
    matchKeywords: ['voltaren 100', 'voltaren emulgel 100', 'فولتارين 100', 'diclofenac gel', 'ديكلوفيناك موضعي', 'آلام عضلات', 'التواء', 'tennis elbow', 'knee pain', ...TAGS.massage, ...TAGS.muscle, ...TAGS.nsaid, ...TAGS.topicalAnalgesic],
    usage: 'ديكلوفيناك موضعي (NSAID) لآلام العضلات والمفاصل/التهاب الأوتار البسيط.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب NSAIDs خصوصاً الثلث الثالث.', 'تداخلات: لا تجمعه مع NSAIDs أخرى بكثرة.', 'تحذيرات: قد يسبب تهيج/طفح.']
  },

  // 10
  {
    id: 'voltaren-diclofenac-sodium-1-emulgel-25',
    name: 'voltaren 1% emulgel 25 gm',
    genericName: 'Diclofenac sodium',
    concentration: '1%',
    price: 39,
    matchKeywords: ['voltaren 25', 'فولتارين 25', 'diclofenac 1 gel', ...TAGS.massage, ...TAGS.muscle, ...TAGS.nsaid, ...TAGS.topicalAnalgesic],
    usage: 'ديكلوفيناك موضعي لآلام العضلات والمفاصل.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب بالثلث الثالث.', 'تداخلات: NSAIDs أخرى.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 11
  {
    id: 'voltaren-diclofenac-sodium-1-emulgel-50',
    name: 'voltaren 1% emulgel 50 gm',
    genericName: 'Diclofenac sodium',
    concentration: '1%',
    price: 68,
    matchKeywords: ['voltaren 50', 'فولتارين 50', 'diclofenac gel 50', ...TAGS.massage, ...TAGS.muscle, ...TAGS.nsaid, ...TAGS.topicalAnalgesic],
    usage: 'ديكلوفيناك موضعي لآلام العضلات والمفاصل.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب بالثلث الثالث.', 'تداخلات: NSAIDs أخرى.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 12
  {
    id: 'adwiflam-diclofenac-diethylamine-methyl-salicylate-menthol-emulgel-30',
    name: 'adwiflam emulgel 30 gm',
    genericName: 'Methyl salicylate + Diclofenac diethylamine + Menthol',
    concentration: '30 gm',
    price: 38,
    matchKeywords: ['adwiflam 30', 'ادويفلام 30', 'diclofenac', 'menthol', 'methyl salicylate', ...TAGS.nsaid, ...TAGS.salicylate, ...TAGS.massage, ...TAGS.muscle, ...TAGS.antirheumatic, ...TAGS.topicalAnalgesic],
    usage: 'مسكن/مضاد التهاب موضعي لآلام العضلات والمفاصل.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب NSAIDs خصوصاً الثلث الثالث.', 'تداخلات: NSAIDs أخرى.', 'تحذيرات: تهيج/حساسية محتمل.']
  },

  // 13
  {
    id: 'repaion-n-camphor-menthol-eucalyptus-salicylic-acid-gel-50',
    name: 'repaion-n gel 50 gm',
    genericName: 'Camphor oil + Menthol crystals + Eucalyptus oil + Salicylic acid',
    concentration: '50 gm',
    price: 65,
    matchKeywords: ['repaion-n 50', 'ريبايون 50', 'salicylic acid', 'مساج', ...TAGS.massage, ...TAGS.muscle, ...TAGS.nsaid, ...TAGS.antirheumatic, ...TAGS.salicylate, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/مسكن موضعي لآلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: تجنب ساليسيلات أخرى.', 'تحذيرات: تهيج محتمل.']
  },

  // 14
  {
    id: 'lidocaine-10-topical-spray-55g',
    name: 'lidocaine 10% topical spray 55 gm',
    genericName: 'Lidocaine',
    concentration: '10%',
    price: 26.4,
    matchKeywords: ['lidocaine 10 55', 'ليدوكايين 55', 'spray lidocaine 10%', 'مخدر موضعي', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي بخاخ لتخفيف الألم الموضعي حسب الحاجة.',
    timing: 'عند اللزوم (بدون إفراط).',
    category: Category.ANALGESICS,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'رش كمية قليلة على المنطقة المطلوبة.',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: تسمم ليدوكايين مع الإفراط.']
  },

  // 15
  {
    id: 'manovipercaine-lidocaine-10-spray-15ml',
    name: 'manovipercaine 10% spray 15 ml',
    genericName: 'Lidocaine',
    concentration: '10% (15 ml)',
    price: 12,
    matchKeywords: ['manovipercaine', 'مانوفيبيركاين', 'lidocaine spray', 'مخدر موضعي', '10%', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي بخاخ لتسكين موضعي قصير المدى حسب الحاجة.',
    timing: 'عند اللزوم.',
    category: Category.ANALGESICS,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'رش كمية قليلة فقط، وتجنب تكرار الرش على مساحة كبيرة.',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: لا يستخدم على جلد متشقق/حروق واسعة.']
  },

  // 16
  {
    id: 'algesal-diethylamine-salicylate-myrtecaine-cream-40',
    name: 'algesal suractive cream 40 gm',
    genericName: 'Diethylamine salicylate + Myrtecaine',
    concentration: '40 gm',
    price: 46,
    matchKeywords: ['algesal', 'الجيزال', 'diethylamine salicylate', 'myrtecaine', 'muscle pain', 'آلام عضلات', 'مساج', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic, ...TAGS.salicylate],
    usage: 'مسكن موضعي لآلام العضلات/المفاصل البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر (ساليسيلات).', 'تداخلات: تجنب ساليسيلات أخرى على نفس المنطقة.', 'تحذيرات: تهيج/حساسية محتمل.']
  },

  // 17
  {
    id: 'reparil-gel-n-aescin-diethylamine-salicylate-gel-40',
    name: 'reparil-gel n 40 gm',
    genericName: 'Aescin + Diethylamine salicylate',
    concentration: '40 gm',
    price: 58,
    matchKeywords: ['reparil gel n', 'ريباريل جل', 'aescin', 'diethylamine salicylate', 'كدمات', 'تورم', 'sprain', 'التواء', ...TAGS.massage, ...TAGS.nsaid, ...TAGS.antirheumatic, ...TAGS.salicylate, ...TAGS.topicalAnalgesic],
    usage: 'جل لآلام الكدمات/الالتواءات وتورمات سطحية (حسب الحالة).',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر (ساليسيلات).', 'تداخلات: تجنب ساليسيلات أخرى موضعياً.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 18
  {
    id: 'urgent-plus-glucosamine-chondroitin-msm-hyaluronate-capsicum-camphor-menthol-cream-50',
    name: 'urgent plus cream 50gm',
    genericName: 'Glucosamine + Chondroitin + Methyl sulfonyl methane (MSM) + Sodium hyaluronate + Capsicum + Camphor + Menthol',
    concentration: '50 gm',
    price: 80,
    matchKeywords: ['urgent plus', 'ارجنت بلس', 'glucosamine', 'chondroitin', 'msm', 'capsicum', 'camphor', 'menthol', 'مساج', 'آلام مفاصل', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج/دعم لآلام العضلات/المفاصل البسيطة (غير بديل لعلاج سبب الألم).',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة موضعياً غالباً.', 'تحذيرات: أوقفه عند تهيج شديد.']
  },

  // 19
  {
    id: 'diclopro-diclofenac-epolamine-1-gel-50',
    name: 'diclopro 1% gel 50 gm',
    genericName: 'Diclofenac epolamine',
    concentration: '1%',
    price: 52,
    matchKeywords: ['diclopro', 'ديكلوبرو', 'diclofenac epolamine', 'diclofenac gel', 'مضاد التهاب موضعي', 'آلام مفاصل', ...TAGS.nsaid, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'ديكلوفيناك موضعي (NSAID) لآلام العضلات والمفاصل/التهاب أوتار بسيط.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب NSAIDs خصوصاً الثلث الثالث.', 'تداخلات: NSAIDs أخرى.', 'تحذيرات: تهيج/تحسس ضوئي محتمل.']
  },

  // 20
  {
    id: 'ascizadex-n-diethylamine-salicylate-aescin-gel-40',
    name: 'ascizadex-n top. gel 40 gm',
    genericName: 'Diethylamine salicylate + Aescin',
    concentration: '40 gm',
    price: 46,
    matchKeywords: ['ascizadex', 'اسكيزادكس', 'aescin', 'diethylamine salicylate', 'كدمات', 'تورم', 'sprain', ...TAGS.nsaid, ...TAGS.antirheumatic, ...TAGS.salicylate, ...TAGS.topicalAnalgesic],
    usage: 'جل للكدمات/التورمات السطحية وآلام الالتواءات البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر (ساليسيلات).', 'تداخلات: ساليسيلات أخرى.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 21
  {
    id: 'linex-massage-cream-50',
    name: 'linex massage cream 50 gm',
    genericName: 'Massage cream',
    concentration: '50 gm',
    price: 70,
    matchKeywords: ['linex', 'لينكس', 'massage cream', 'مساج', 'muscle', 'شد عضلي', 'آلام عضلات', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج لتخفيف آلام العضلات البسيطة/الإجهاد.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: أوقفه عند تهيج.']
  },

  // 22
  {
    id: 'relax-gel-chondroitin-msm-camphor-glucosamine-gel-50',
    name: 'relax gel 50 gm',
    genericName: 'Chondroitin + MSM + Camphor + Glucosamine',
    concentration: '50 gm',
    price: 80,
    matchKeywords: ['relax gel', 'ريلاكس جل', 'glucosamine', 'chondroitin', 'msm', 'camphor', 'مساج', 'آلام مفاصل', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/دعم لتخفيف آلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة غالباً.', 'تحذيرات: تهيج محتمل.']
  },

  // 23
  {
    id: 'universal-cream-glucosamine-chondroitin-msm-emu-oil-menthol-camphor-100',
    name: 'universal cream 100 gm',
    genericName: 'Glucosamine + Chondroitin sulphate + MSM + Emu oil + Menthol + Camphor',
    concentration: '100 gm',
    price: 95,
    matchKeywords: ['universal cream', 'يونيفرسال كريم', 'emu oil', 'glucosamine', 'chondroitin', 'menthol', 'camphor', 'مساج', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج/دعم لآلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج محتمل.']
  },

  // 24
  {
    id: 'adwimove-mucopolysaccharide-polysulphuric-ester-salicylic-acid-gel-20',
    name: 'adwimove topical gel 20 gm',
    genericName: 'Mucopolysaccharides polysulphuric acid ester + Salicylic acid',
    concentration: '20 gm',
    price: 9,
    matchKeywords: ['adwimove', 'ادوي موف', 'mucopolysaccharide', 'salicylic acid', 'كدمات', 'التهاب', 'تورم'],
    usage: 'جل موضعي للكدمات/التورمات السطحية أو الآلام الموضعية البسيطة حسب الحاجة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر.', 'تداخلات: ساليسيلات أخرى موضعياً.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 25
  {
    id: 'lignocaine-lidocaine-hcl-5-cream-20',
    name: 'lignocaine 5% cream 20 gm',
    genericName: 'Lidocaine hydrochloride',
    concentration: '5%',
    price: 24,
    matchKeywords: ['lignocaine 5 cream', 'ليجنكايين 5 كريم', 'lidocaine hcl', 'مخدر موضعي', 'cream anesthetic', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي لتسكين موضعي مؤقت.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: أعراض عامة مع الإفراط.']
  },

  // 26
  {
    id: 'lignocaine-lidocaine-5-emulgel-20',
    name: 'lignocaine 5% emulgel 20 gm',
    genericName: 'Lidocaine',
    concentration: '5%',
    price: 24,
    matchKeywords: ['lignocaine 5 emulgel', 'ليجنكايين 5 جل', 'lidocaine gel', 'مخدر موضعي', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي (جل) لتسكين موضعي مؤقت.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: خطر تسمم مع الإفراط.']
  },

  // 27
  {
    id: 'adwimove-mucopolysaccharide-polysulphuric-ester-salicylic-acid-gel-50',
    name: 'adwimove topical gel 50 gm',
    genericName: 'Mucopolysaccharides polysulphuric acid ester + Salicylic acid',
    concentration: '50 gm',
    price: 44,
    matchKeywords: ['adwimove 50', 'ادوي موف 50', 'salicylic acid', 'كدمات', 'تورم'],
    usage: 'جل موضعي للكدمات/التورمات السطحية أو الآلام الموضعية البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر.', 'تداخلات: ساليسيلات أخرى.', 'تحذيرات: تهيج محتمل.']
  },

  // 28
  {
    id: 'restage-menthol-clove-peppermint-camphor-vit-e-gel-100',
    name: 'restage gel 100 gm',
    genericName: 'Menthol crystal + Clove oil + Peppermint oil + Camphor oil + Vitamin E',
    concentration: '100 gm',
    price: 120,
    matchKeywords: ['restage', 'ريستاج', 'menthol', 'clove oil', 'peppermint', 'camphor', 'anti-inflammatory', 'مسكن موضعي', ...TAGS.antiInflammatory, ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/تبريد لتخفيف آلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة غالباً.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 29
  {
    id: 'deep-freeze-pain-relief-cold-gel-100',
    name: 'deep freeze pain relief cold gel 100 gm',
    genericName: 'n-Pentane + Iso-butane + Propane + n-Butane + Denatured ethanol',
    concentration: '100 gm',
    price: 280,
    matchKeywords: ['deep freeze', 'ديب فريز', 'cold gel', 'تبريد', 'آلام عضلات', 'sports', 'شد عضلي'],
    usage: 'جل تبريد لتخفيف آلام العضلات/الإصابات الرياضية البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: قابل للاشتعال وقد يسبب تهيج.']
  },

  // 30
  {
    id: 'frost-gel-menthol-chamomile-lavender-100',
    name: 'frost gel 100 gm',
    genericName: 'Menthol + Chamomile + Lavender + Propylene glycol + Glycerol',
    concentration: '100 gm',
    price: 110,
    matchKeywords: ['frost gel', 'فروست جل', 'menthol', 'lavender', 'chamomile', 'مساج', 'muscle pain', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/تبريد لتخفيف آلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج محتمل.']
  },

  // 31
  {
    id: 'himax-menthol-eucalyptus-camphor-methyl-salicylate-gel-30',
    name: 'himax massage gel 30 gm',
    genericName: 'Menthol + Eucalyptus + Camphor + Methyl salicylate',
    concentration: '30 gm',
    price: 55,
    matchKeywords: ['himax', 'هايماكس', 'massage gel', 'menthol', 'eucalyptus', 'camphor', 'methyl salicylate', 'آلام عضلات', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic, ...TAGS.salicylate],
    usage: 'جل مساج/مسكن موضعي لآلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: ساليسيلات أخرى.', 'تحذيرات: تهيج محتمل.']
  },

  // 32
  {
    id: 'lidocaine-2-gel-20',
    name: 'lidocaine 2% gel. 20 gm',
    genericName: 'Lidocaine',
    concentration: '2%',
    price: 6.75,
    matchKeywords: ['lidocaine 2 gel', 'ليدوكايين 2 جل', 'مخدر موضعي', 'gel anesthetic', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي لتسكين موضعي مؤقت.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: تسمم مع الإفراط.']
  },

  // 33
  {
    id: 'lignocaine-lidocaine-hcl-2-cream-20',
    name: 'lignocaine 2% top. cream 20 gm',
    genericName: 'Lidocaine hydrochloride',
    concentration: '2%',
    price: 6.75,
    matchKeywords: ['lignocaine 2 cream', 'ليجنكايين 2 كريم', 'lidocaine hcl 2', 'مخدر موضعي', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي لتسكين موضعي مؤقت.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: الإفراط قد يسبب أعراض عامة.']
  },

  // 34
  {
    id: 'salgy-camphor-menthol-clove-eucalyptus-panthenol-peppermint-cream-50',
    name: 'salgy massage cream 50 gm',
    genericName: 'Camphor crystal + Menthol crystal + Clove extract + Eucalyptus oil + Panthenol + Peppermint',
    concentration: '50 gm',
    price: 70,
    matchKeywords: ['salgy', 'سالجى', 'massage cream', 'camphor', 'menthol', 'clove', 'eucalyptus', 'peppermint', 'آلام عضلات', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج/مسكن موضعي لآلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج/حساسية محتمل.']
  },

  // 35
  {
    id: 'salicortiderm-flumethasone-salicylic-acid-oint-15',
    name: 'salicortiderm oint. 15 gm',
    genericName: 'Flumethasone pivalate + Salicylic acid',
    concentration: '15 gm',
    price: 15,
    matchKeywords: ['salicortiderm', 'ساليكورتيدرم', 'flumethasone', 'salicylic acid', 'keratolytic', 'steroid ointment', 'جلدية', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'كورتيزون + ساليسيليك أسيد لحالات جلدية متقشرة/سميكة (حسب التشخيص) وليس مسكن عضلات.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Ointment',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر (كورتيزون).', 'تداخلات: تجنب مقشرات قوية أخرى على نفس المكان.', 'تحذيرات: ترقق الجلد/تهيج مع الإفراط.']
  },

  // 36
  {
    id: 'salicortiderm-flumethasone-salicylic-acid-oint-30',
    name: 'salicortiderm oint. 30 gm',
    genericName: 'Flumethasone pivalate + Salicylic acid',
    concentration: '30 gm',
    price: 37,
    matchKeywords: ['salicortiderm 30', 'ساليكورتيدرم 30', 'flumethasone', 'salicylic acid', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'كورتيزون + ساليسيليك أسيد لحالات جلدية متقشرة/سميكة (حسب التشخيص والمنطقة).',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Ointment',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر.', 'تداخلات: مقشرات أخرى.', 'تحذيرات: ترقق جلد/تهيج.']
  },

  // 37
  {
    id: 'srilane-idrocilamide-5-cream-20',
    name: 'srilane 5% cream 20 gm',
    genericName: 'Idrocilamide',
    concentration: '5%',
    price: 32.5,
    matchKeywords: ['srilane', 'سريلين', 'idrocilamide', 'muscle relaxant cream', 'مسكن موضعي', 'آلام عضلات', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'كريم موضعي لآلام/تشنجات العضلات البسيطة حسب الحاجة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة غالباً.', 'تحذيرات: تهيج محتمل.']
  },

  // 38
  {
    id: 'srilane-idrocilamide-5-cream-60',
    name: 'srilane 5% cream 60 gm',
    genericName: 'Idrocilamide',
    concentration: '5%',
    price: 73,
    matchKeywords: ['srilane 60', 'سريلين 60', 'idrocilamide 5', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'كريم موضعي لآلام/تشنجات العضلات البسيطة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج محتمل.']
  },

  // 39
  {
    id: 'algason-camphor-menthol-diethylamine-salicylate-cream-40',
    name: 'algason massage cream 40 gm',
    genericName: 'Camphor + Menthol + Diethylamine salicylate',
    concentration: '40 gm',
    price: 46,
    matchKeywords: ['algason', 'الجاسون', 'massage cream', 'camphor', 'menthol', 'diethylamine salicylate', 'مساج', 'آلام عضلات', ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic, ...TAGS.salicylate],
    usage: 'كريم مساج/مسكن موضعي لآلام العضلات والمفاصل البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر (ساليسيلات).', 'تداخلات: ساليسيلات أخرى.', 'تحذيرات: تهيج/حساسية ممكنة.']
  },

  // 40
  {
    id: 'dromage-peppermint-menthol-clove-camphor-cream-75',
    name: 'dromage massage cream 75 gm',
    genericName: 'Peppermint oil + Menthol crystals + Clove extract + Camphor',
    concentration: '75 gm',
    price: 55,
    matchKeywords: ['dromage', 'دروميج', 'massage cream', 'peppermint', 'menthol', 'clove', 'camphor', 'آلام عضلات'],
    usage: 'كريم مساج/مسكن موضعي لآلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج محتمل.']
  },

  // 41
  {
    id: 'lignocaine-lidocaine-10-spray-15ml',
    name: 'lignocaine 10% spray 15 ml',
    genericName: 'Lidocaine',
    concentration: '10% (15 ml)',
    price: 38,
    matchKeywords: ['lignocaine 10 spray', 'ليجنكايين 10 سبراي', 'lidocaine spray 10', 'مخدر موضعي', ...TAGS.topicalAnaesthetic, ...TAGS.topicalAnalgesic],
    usage: 'مخدر موضعي بخاخ لتسكين موضعي قصير المدى.',
    timing: 'عند اللزوم.',
    category: Category.ANALGESICS,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'رش كمية قليلة فقط على المنطقة المطلوبة.',
    warnings: ['الحمل: غالباً آمن بكمية قليلة.', 'تداخلات: مخدرات موضعية أخرى.', 'تحذيرات: أعراض عامة مع الإفراط.']
  },

  // 42
  {
    id: 'tiger-plaster-counter-irritant-plaster',
    name: 'tiger plaster',
    genericName: 'Counter irritant plaster',
    concentration: 'Plaster',
    price: 17,
    matchKeywords: ['tiger plaster', 'لاصقة تايجر', 'plaster', 'patch', 'مسكن موضعي', 'آلام عضلات', 'neck pain', 'back pain'],
    usage: 'لاصقة مسكنة/مهيجة سطحياً لتخفيف آلام العضلات البسيطة.',
    timing: 'غالباً ٨–١٢ ساعة.',
    category: Category.ANALGESICS,
    form: 'Film',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'توضع لاصقة واحدة على منطقة الألم وتُترك ٨–١٢ ساعة.',
    warnings: ['الحمل: بحذر.', 'تداخلات: تجنب الجمع مع مسكنات موضعية أخرى على نفس المكان.', 'تحذيرات: قد تسبب تهيجاً/حروقاً جلدية لدى البعض.']
  },

  // 43
  {
    id: 'voltaren-diclofenac-sodium-1-emulgel-15',
    name: 'voltaren 1% emulgel 15 gm',
    genericName: 'Diclofenac sodium',
    concentration: '1%',
    price: 11.25,
    matchKeywords: ['voltaren 15', 'فولتارين 15', 'diclofenac 1 gel 15', ...TAGS.massage, ...TAGS.muscle, ...TAGS.nsaid, ...TAGS.topicalAnalgesic],
    usage: 'ديكلوفيناك موضعي لآلام العضلات والمفاصل.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب بالثلث الثالث.', 'تداخلات: NSAIDs أخرى.', 'تحذيرات: تهيج محتمل.']
  },

  // 44
  {
    id: 'fenoril-horse-chestnut-eugenol-menthol-gel-30',
    name: 'fenoril gel 30 gm',
    genericName: 'Horse chestnut extract + Eugenol + Menthol',
    concentration: '30 gm',
    price: 35,
    matchKeywords: ['fenoril', 'فينوريل', 'horse chestnut', 'eugenol', 'menthol', 'مسكن موضعي', 'massage gel'],
    usage: 'جل مساج/تبريد لتخفيف آلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج/حساسية محتمل.']
  },

  // 45
  {
    id: 'indomethacin-1-topical-spray-50',
    name: 'indomethacin 1% topical spray 50 ml',
    genericName: 'Indomethacin',
    concentration: '1%',
    price: 14.4,
    matchKeywords: ['indomethacin spray', 'اندوميثاسين سبراي', 'NSAID spray', 'مضاد التهاب موضعي', 'آلام عضلات', 'روماتيزم', ...TAGS.nsaid, ...TAGS.antirheumatic, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'مضاد التهاب موضعي (NSAID) لتخفيف الألم/الالتهاب الموضعي حسب الحاجة.',
    timing: '2–4 مرات يومياً.',
    category: Category.ANALGESICS,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'رش كمية مناسبة على المكان 2–4 مرات يومياً.',
    warnings: ['الحمل: تجنب NSAIDs خصوصاً الثلث الثالث.', 'تداخلات: NSAIDs أخرى.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 46
  {
    id: 'new-tiger-porous-plaster-arnica',
    name: 'new tiger porous plaster',
    genericName: 'Arnica tincture',
    concentration: 'Plaster',
    price: 20,
    matchKeywords: ['new tiger porous plaster', 'tiger porous', 'ارنكا', 'arnica', 'لاصقة مسكنة', 'patch', ...TAGS.antirheumatic, ...TAGS.topicalAnalgesic],
    usage: 'لاصقة مسكنة/دعم للكدمات وآلام العضلات البسيطة حسب الحاجة.',
    timing: 'غالباً ٨–١٢ ساعة.',
    category: Category.ANALGESICS,
    form: 'Film',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'توضع لاصقة على مكان الألم وتُترك ٨–١٢ ساعة.',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: حساسية تلامسية ممكنة (Arnica).']
  },

  // 47
  {
    id: 'restage-menthol-clove-peppermint-camphor-vit-e-gel-50',
    name: 'restage gel 50 gm',
    genericName: 'Menthol crystal + Clove oil + Peppermint oil + Camphor oil + Vitamin E',
    concentration: '50 gm',
    price: 67,
    matchKeywords: ['restage 50', 'ريستاج 50', 'menthol', 'clove', 'peppermint', 'camphor', ...TAGS.antiInflammatory, ...TAGS.massage, ...TAGS.muscle, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/تبريد لتخفيف آلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج محتمل.']
  },

  // 48
  {
    id: 'fenoril-horse-chestnut-eugenol-menthol-gel-50',
    name: 'fenoril gel 50 gm',
    genericName: 'Horse chestnut extract + Eugenol + Menthol',
    concentration: '50 gm',
    price: 48.5,
    matchKeywords: ['fenoril 50', 'فينوريل 50', 'horse chestnut', 'menthol'],
    usage: 'جل مساج/تبريد لآلام العضلات البسيطة.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: تهيج/حساسية محتمل.']
  },

  // 49
  {
    id: 'tiger-porous-plaster-arnica-50-patches',
    name: 'tiger porous plaster 50 patches',
    genericName: 'Arnica tincture',
    concentration: '50 patches',
    price: 850,
    matchKeywords: ['tiger porous plaster 50', 'tiger plaster 50', 'ارنكا 50', 'arnica patches', 'لاصقات'],
    usage: 'لاصقات مسكنة/دعم لآلام العضلات البسيطة حسب الحاجة.',
    timing: 'غالباً ٨–١٢ ساعة.',
    category: Category.ANALGESICS,
    form: 'Film',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'توضع لاصقة واحدة على مكان الألم وتُبدل كل ٨–١٢ ساعة.',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: حساسية تلامسية ممكنة.']
  },

  // 50
  {
    id: 'active-massage-cream-herbal-formula-50',
    name: 'active massage cream 50 gm',
    genericName: 'Herbal formula',
    concentration: '50 gm',
    price: 19.95,
    matchKeywords: ['active massage cream', 'اكتيف مساج', 'herbal', 'كريم مساج', 'آلام عضلات'],
    usage: 'كريم مساج لتخفيف آلام العضلات البسيطة/الإجهاد.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANALGESICS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: بحذر.', 'تداخلات: غير متوقعة.', 'تحذيرات: حساسية/تهيج محتمل حسب المكونات العشبية.']
  }
];

