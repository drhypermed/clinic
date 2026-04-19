import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

const TAGS = {
  antiInflammatory: ['anti-inflammatory', '#anti-inflammatory', 'anti inflammatory', 'مضاد التهاب'],
  analgesics: ['analgesics', '#analgesics', 'pain', 'مسكن'],
  nsaid: ['nsaid', '#nsaid', 'NSAID', 'مضاد التهاب غير ستيرويدي'],
  antirheumatic: ['antirheumatic', '#antirheumatic', 'anti-rheumatic', 'روماتيزم', 'مضاد روماتيزم'],
  osteoarthritis: ['osteoarthritis', '#osteoarthritis', 'خشونة', 'تآكل الغضاريف'],
  anabolic: ['anabolic', '#anabolic', 'مقويات/بناء'],
  antimalarial: ['anti-malarial', '#anti-malarial', 'antimalarial', 'مضاد ملاريا'],
  antiprotozoal: ['antiprotozoal', '#antiprotozoal', 'antiprotozoal', 'مضاد طفيليات'],
};

const ANTI_INFLAMMATORY_AND_ANTI_RHEUMATIC_PRODUCTS_RAW: Medication[] = [
  // =====================
  // Anti-inflammatory & Anti-rheumatic products
  // =====================

  // 1. hydroquine 200mg 20 tab.
  {
    id: 'hydroquine-hydroxychloroquine-sulfate-200mg-tabs-20',
    name: 'hydroquine 200mg 20 tab.',
    genericName: 'Hydroxychloroquine sulfate',
    concentration: '200mg',
    price: 82,
    matchKeywords: ['hydroquine', 'هيدروكوين', 'hydroxychloroquine', 'هيدروكسي كلوروكوين', ...TAGS.antirheumatic, ...TAGS.antimalarial, ...TAGS.antiprotozoal],
    usage: 'دواء معدل للمناعة يُستخدم في الروماتويد والذئبة (ويُستخدم أيضاً كمضاد ملاريا) حسب التشخيص.',
    timing: 'مرة يومياً أو مرتين يومياً بعد الأكل حسب البروتوكول.',
    category: Category.RHEUMATOLOGY,
    form: 'Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: (weight) => {
      const maxDailyMg = 400;
      const dailyMg = Math.min(maxDailyMg, Math.round(weight * 5));
      const tablets = dailyMg <= 200 ? 1 : 2;
      const dailyText = tablets === 1 ? 'قرص واحد (200 مجم)' : 'قرص صباحاً + قرص مساءً (400 مجم/يوم)';
      return `${dailyText} بعد الأكل (الحد الأقصى ${toAr(400)} مجم/يوم؛ والجرعة تُضبط حسب الوزن والحالة حسب التشخيص)`;
    },
    warnings: [
      'الحمل/الرضاعة: يُستخدم فقط حسب التشخيص؛ لا تبدأ/توقف الدواء أثناء الحمل دون إعادة تقييم.',
      'تداخلات: راجع تداخلات المريض أدوية القلب/اضطراب النظم (خطر تداخلات على كهرباء القلب).',
      'تحذيرات خاصة: أعد التقييم فوراً عند تشوش رؤية/ألم عين/خفقان شديد أو دوخة شديدة. يحفظ بعيداً عن الأطفال.',
    ],
  },

  // 2. indomethacin 100 mg 10 supp. b.p.2014
  {
    id: 'indomethacin-100mg-supp-10-bp2014',
    name: 'indomethacin 100 mg 10 supp. b.p.2014',
    genericName: 'Indomethacin',
    concentration: '100mg',
    price: 38,
    matchKeywords: ['indomethacin 100', 'اندوميثاسين', 'indomethacin', 'supp', 'لبوس', ...TAGS.nsaid, ...TAGS.analgesics, ...TAGS.antirheumatic],
    usage: 'مسكن ومضاد التهاب غير ستيرويدي لآلام والتهابات المفاصل/العضلات حسب التشخيص والحالة.',
    timing: 'عادةً مرة يومياً مساءً أو حسب التشخيص والبروتوكول.',
    category: Category.MUSCULOSKELETAL,
    form: 'Suppositories',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'لبوسة واحدة (100 مجم) مساءً بعد الأكل/قبل النوم. لا تتجاوز لبوسة–لبوستين يومياً إلا بعد إعادة تقييم.',
    warnings: [
      'الحمل (خطورة عالية خصوصاً بالثلث الأخير): قد يسبب غلق مبكر للقناة الشريانية للجنين ونقص السائل الأمنيوسي—يُمنع في أواخر الحمل.',
      'تداخلات: ممنوع الجمع مع NSAIDs أخرى (إيبوبروفين/ديكلوفيناك) أو جرعات عالية من الأسبرين؛ يزيد خطر قرحة/نزيف.',
      'تحذيرات خاصة: يُتجنب في قرحة/نزيف معدي، وأمراض كلى/قلب شديدة. أوقفه وأعد التقييم عند براز أسود/قيء دموي/ألم معدة شديد.',
    ],
  },

  // 3. plaquenil 200mg 60 f.c.tab.
  {
    id: 'plaquenil-hydroxychloroquine-sulfate-200mg-fc-tabs-60',
    name: 'plaquenil 200mg 60 f.c.tab.',
    genericName: 'Hydroxychloroquine sulfate',
    concentration: '200mg',
    price: 246,
    matchKeywords: ['plaquenil', 'بلاكونيل', 'hydroxychloroquine', ...TAGS.antirheumatic, ...TAGS.antimalarial, ...TAGS.antiprotozoal],
    usage: 'دواء معدل للمناعة للروماتويد/الذئبة حسب التشخيص.',
    timing: 'بعد الأكل مرة أو مرتين يومياً حسب التشخيص والحالة.',
    category: Category.RHEUMATOLOGY,
    form: 'F.C. Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: (weight) => {
      const maxDailyMg = 400;
      const dailyMg = Math.min(maxDailyMg, Math.round(weight * 5));
      const tablets = dailyMg <= 200 ? 1 : 2;
      return tablets === 1
        ? 'قرص واحد (200 مجم) مرة يومياً بعد الأكل'
        : 'قرص بعد الإفطار + قرص بعد العشاء (400 مجم/يوم)';
    },
    warnings: [
      'الحمل/الرضاعة: قرار طبي حسب الحالة.',
      'تداخلات: أعد التقييم قبل أدوية اضطراب النظم/القلب.',
      'تحذيرات: راجع فوراً عند تشوش رؤية/أعراض قلبية.',
    ],
  },

  // 4. genuphil original 50 f.c. tabs
  {
    id: 'genuphil-original-50-fc-tabs',
    name: 'genuphil original 50 f.c. tabs',
    genericName: 'Chondroitin + Glucosamine + Methyl sulphonyl methane',
    concentration: 'Tablets',
    price: 280,
    matchKeywords: ['genuphil original', 'genuphil', 'جينوفيل', 'glucosamine', 'chondroitin', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم الغضاريف وتخفيف أعراض خشونة المفاصل (كمساعد).',
    timing: 'بعد الأكل يومياً حسب التشخيص والحالة.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل (قد تختلف الجرعة حسب التشخيص والحالة).',
    warnings: [
      'الحمل/الرضاعة: يُفضل أقل جرعة وأقصر مدة قبل الاستخدام.',
      'تداخلات: إذا كنت تستخدم أدوية سيولة الدم (مثل وارفارين) راجع التفاعلات قبل مكملات الجلوكوزامين/الجنكو.',
      'تحذيرات: يُستخدم بحذر لمرضى حساسية المحار إن وُجد مصدر بحري للجلوكوزامين.',
    ],
  },

  // 5. genuphil advance 10 sachets
  {
    id: 'genuphil-advance-10-sachets',
    name: 'genuphil advance 10 sachets',
    genericName: 'Chondroitin + Glucosamine + Methyl sulphonyl methane',
    concentration: 'Sachets',
    price: 295,
    matchKeywords: ['genuphil advance', 'جينوفيل ادفانس', 'sachets', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل والغضاريف (كمساعد).',
    timing: 'مرة يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: [
      'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
      'تداخلات: راجع التفاعلات إذا تستخدم سيولة.',
      'تحذيرات: قد يسبب اضطراب معدة بسيط؛ يؤخذ بعد الأكل.',
    ],
  },

  // 6. indomethacin 100mg 5 supp. (misr)
  {
    id: 'indomethacin-100mg-supp-5-misr',
    name: 'indomethacin 100mg 5 supp. (misr)',
    genericName: 'Indomethacin',
    concentration: '100mg',
    price: 8.5,
    matchKeywords: ['indomethacin 100 misr', 'supp', 'لبوس', ...TAGS.nsaid, ...TAGS.analgesics, ...TAGS.antirheumatic],
    usage: 'مسكن ومضاد التهاب غير ستيرويدي (لبوس).',
    timing: 'مرة يومياً مساءً أو حسب التشخيص والحالة.',
    category: Category.MUSCULOSKELETAL,
    form: 'Suppositories',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'لبوسة واحدة (100 مجم) مساءً. لا تجمعه مع NSAIDs أخرى.',
    warnings: [
      'الحمل (خطورة عالية خصوصاً بالثلث الأخير): يُمنع في أواخر الحمل.',
      'تداخلات: NSAIDs الأخرى/الكورتيزون/مضادات التجلط تزيد خطر النزيف.',
      'تحذيرات: أوقفه عند نزيف/ألم معدة شديد أو ضيق نفس.',
    ],
  },

  // 7. moov massage cream 40 gm
  {
    id: 'moov-massage-cream-40',
    name: 'moov massage cream 40 gm',
    genericName: 'Camphor + Menthol + Methyl salicylate + Camphor oil + Capsicum oleoresin',
    concentration: 'Cream',
    price: 35,
    matchKeywords: ['moov', 'مووف', 'massage', 'cream', 'muscle pain', 'joint pain', ...TAGS.analgesics, ...TAGS.antirheumatic],
    usage: 'مسكن موضعي لآلام العضلات والمفاصل (تأثير حراري/مهدئ).',
    timing: '٢–٣ مرات يومياً عند اللزوم.',
    category: Category.MUSCULOSKELETAL,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'تدليك كمية مناسبة على المكان ٢–٣ مرات يومياً.',
    warnings: [
      'الحمل: تجنب الاستخدام على مساحات كبيرة خاصة في أواخر الحمل (لوجود ساليسيلات/كابسيسين) إلا باستشارة.',
      'تداخلات: لا تستخدمه مع مصادر حرارة/ضمادات محكمة (يزيد التهيج/الحروق).',
      'تحذيرات: لا يُستخدم على جروح/جلد ملتهب بشدة. أوقفه عند حرقان شديد/طفح.',
    ],
  },

  // 8. genuphil woman 10 sachets
  {
    id: 'genuphil-woman-10-sachets',
    name: 'genuphil woman 10 sachets',
    genericName: 'Chondroitin + Glucosamine + Methyl sulphonyl methane',
    concentration: 'Sachets',
    price: 295,
    matchKeywords: ['genuphil woman 10', 'جينوفيل وومان', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: قد يسبب اضطراب معدة بسيط.']
  },

  // 9. genuphil woman 30 sachets
  {
    id: 'genuphil-woman-30-sachets',
    name: 'genuphil woman 30 sachets',
    genericName: 'Chondroitin + Glucosamine + Methyl sulphonyl methane',
    concentration: 'Sachets',
    price: 745,
    matchKeywords: ['genuphil woman 30', 'جينوفيل وومان 30', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: قد يسبب اضطراب معدة بسيط.']
  },

  // 10. genuphil advance 30 sachets
  {
    id: 'genuphil-advance-30-sachets',
    name: 'genuphil advance 30 sachets',
    genericName: 'Chondroitin + Glucosamine + Methyl sulphonyl methane',
    concentration: 'Sachets',
    price: 785,
    matchKeywords: ['genuphil advance 30', 'جينوفيل ادفانس 30', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: اضطراب معدة بسيط ممكن.']
  },

  // 11. cal-mag-joint 30 tabs.
  {
    id: 'cal-mag-joint-30-tabs',
    name: 'cal-mag-joint 30 tabs.',
    genericName: 'Calcium + Magnesium + Glucosamine + Chondroitin + Vitamin C',
    concentration: 'Tablets',
    price: 240,
    matchKeywords: ['cal-mag-joint', 'كال ماج جوينت', 'calcium', 'magnesium', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم العظام والمفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: [
      'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
      'تداخلات: الكالسيوم قد يقلل امتصاص بعض المضادات الحيوية/ليفوثيروكسين؛ اترك فاصل زمني.',
      'تحذيرات: يُستخدم بحذر مع حصوات الكلى/ارتفاع الكالسيوم.',
    ],
  },

  // 12. jointinal 30 caps.
  {
    id: 'jointinal-30-caps',
    name: 'jointinal 30 caps.',
    genericName: 'Glucosamine + Chondroitin + Hydrolyzed collagen + Sodium hyaluronate',
    concentration: 'Capsules',
    price: 550,
    matchKeywords: ['jointinal', 'جوينتينال', 'collagen', 'hyaluronate', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم الغضاريف والمفاصل (كمساعد).',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: قد يسبب اضطراب معدة بسيط.']
  },

  // 13. ch alpha 10 sachets
  {
    id: 'ch-alpha-10-sachets',
    name: 'ch alpha 10 sachets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C',
    concentration: 'Sachets',
    price: 350,
    matchKeywords: ['ch alpha', 'سي اتش الفا', 'collagen', 'vitamin c', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل كولاجين + فيتامين C لدعم الغضاريف/الأوتار (كمساعد).',
    timing: 'كيس واحد يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: قد يسبب انتفاخ بسيط.']
  },

  // 14. dorofen 30 caps.
  {
    id: 'dorofen-30-caps',
    name: 'dorofen 30 caps.',
    genericName: 'Glucosamine + Ginkgo biloba leaf extract',
    concentration: 'Capsules',
    price: 153,
    matchKeywords: ['dorofen', 'دوروفين', 'ginkgo', 'glucosamine', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لخشونة المفاصل + دعم الدورة الدموية (كمساعد).',
    timing: 'كبسولة يومياً بعد الأكل (حسب التشخيص والحالة).',
    category: Category.MUSCULOSKELETAL,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة يومياً بعد الأكل.',
    warnings: [
      'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
      'تداخلات: الجنكو قد يزيد خطر النزف مع مميعات الدم/مضادات الصفائح—راجع التفاعلات.',
      'تحذيرات: أوقفه قبل العمليات الجراحية بعد أقل جرعة وأقصر مدة.',
    ],
  },

  // 15. gincostazen 30 cap
  {
    id: 'gincostazen-30-caps',
    name: 'gincostazen 30 cap',
    genericName: 'Ginkgo biloba leaf extract + Glucosamine',
    concentration: 'Capsules',
    price: 150,
    matchKeywords: ['gincostazen', 'جينكوستازين', 'ginkgo', 'glucosamine', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل + الجنكو (كمساعد).',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تداخلات: مميعات الدم (خطر نزف).', 'تحذيرات: أوقفه عند نزيف غير معتاد.']
  },

  // 16. tigint plus 10 sachets
  {
    id: 'tigint-plus-10-sachets',
    name: 'tigint plus 10 sachets',
    genericName: 'Gelatin + Lactoferrin',
    concentration: 'Sachets',
    price: 290,
    matchKeywords: ['tigint plus', 'تيجنت بلس', 'gelatin', 'lactoferrin', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل/الأنسجة (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية بروتينات اللبن محتملة (لاكتوفرين).']
  },

  // 17. ascizadex-n top. gel 40 gm
  {
    id: 'ascizadex-n-diethylamine-salicylate-aescin-gel-40',
    name: 'ascizadex-n top. gel 40 gm',
    genericName: 'Diethylamine salicylate + Aescin',
    concentration: 'Gel',
    price: 46,
    matchKeywords: ['ascizadex', 'اسكيزادكس', 'aescin', 'salicylate', 'gel', ...TAGS.nsaid, ...TAGS.antirheumatic],
    usage: 'جل مسكن ومضاد التهاب موضعي للكدمات/الالتواءات/آلام العضلات.',
    timing: '٢–٣ مرات يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'دهان طبقة رقيقة مع تدليك خفيف ٢–٣ مرات يومياً.',
    warnings: [
      'الحمل (خطورة خاصة بالثلث الأخير): تجنب استخدام الساليسيلات موضعياً على مساحات كبيرة إلا باستشارة.',
      'تداخلات: لا تجمعه على نفس المنطقة مع مسكنات موضعية أخرى قوية/مصادر حرارة.',
      'تحذيرات: أوقفه عند طفح/تهيج شديد.',
    ],
  },

  // 18. ch alpha plus 10 sachets
  {
    id: 'ch-alpha-plus-10-sachets',
    name: 'ch alpha plus 10 sachets',
    genericName: 'Gelatin + Vitamin C + Rosehip extract + Selenium',
    concentration: 'Sachets',
    price: 370,
    matchKeywords: ['ch alpha plus', 'سي اتش الفا بلس', 'rosehip', 'selenium', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل كولاجين + فيتامين C لدعم الأوتار/الغضاريف (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: لا تتجاوز الجرعة خاصة مع السيلينيوم.']
  },

  // 19. sharkilage 30 caps.
  {
    id: 'sharkilage-30-caps',
    name: 'sharkilage 30 caps.',
    genericName: 'Glucosamine sulfate-potassium chloride + Chondroitin sulfate',
    concentration: 'Capsules',
    price: 135,
    matchKeywords: ['sharkilage', 'شاركليج', 'glucosamine sulfate', 'chondroitin sulfate', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم الغضاريف (كمساعد).',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 20. sharkilage plus 30 caps.
  {
    id: 'sharkilage-plus-30-caps',
    name: 'sharkilage plus 30 caps.',
    genericName: 'Chondroitin + Glucosamine + Methyl sulphonyl methane',
    concentration: 'Capsules',
    price: 150,
    matchKeywords: ['sharkilage plus', 'شاركليج بلس', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 21. moventor 30 tabs.
  {
    id: 'moventor-30-tabs',
    name: 'moventor 30 tabs.',
    genericName: 'Undenatured collagen type II + Hyaluronic acid + Boron',
    concentration: 'Tablets',
    price: 585,
    matchKeywords: ['moventor 30', 'موفينتور', 'uc-ii', 'hyaluronic', 'boron', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل والغضاريف (كمساعد).',
    timing: 'قرص يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 22. cartizad 30 tab
  {
    id: 'cartizad-30-tabs',
    name: 'cartizad 30 tab',
    genericName: 'Glucosamine hydrochloride + Chondroitin sulfate + Hyaluronic acid + MSM + Calcium',
    concentration: 'Tablets',
    price: 300,
    matchKeywords: ['cartizad', 'كارتزاد', 'glucosamine hcl', 'chondroitin', 'hyaluronic', 'msm', 'calcium', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل/الغضاريف (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: يُستخدم بحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },

  // 23. moventor 20 tabs.
  {
    id: 'moventor-20-tabs',
    name: 'moventor 20 tabs.',
    genericName: 'Undenatured collagen type II + Hyaluronic acid + Boron',
    concentration: 'Tablets',
    price: 390,
    matchKeywords: ['moventor 20', 'موفينتور 20', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 24. joint plus 60 tabs.
  {
    id: 'joint-plus-60-tabs',
    name: 'joint plus 60 tabs.',
    genericName: 'Glucosamine + Chondroitin + Hydrolyzed collagen + MSM + Vitamin C',
    concentration: 'Tablets',
    price: 500,
    matchKeywords: ['joint plus', 'جوينت بلس', 'collagen', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل والغضاريف (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 25. jelace 20 tablets
  {
    id: 'jelace-20-tabs',
    name: 'jelace 20 tablets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C',
    concentration: 'Tablets',
    price: 180,
    matchKeywords: ['jelace', 'جيليس', 'collagen', 'vitamin c', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل كولاجين لدعم الأوتار والمفاصل (كمساعد).',
    timing: 'قرص يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 26. chondrogen 20 f.c. tab
  {
    id: 'chondrogen-20-fc-tabs',
    name: 'chondrogen 20 f.c. tab',
    genericName: 'Chondroitin + Glucosamine',
    concentration: 'F.C. Tablets',
    price: 80,
    matchKeywords: ['chondrogen', 'كوندروجين', 'chondroitin', 'glucosamine', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم الغضاريف (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 27. jenasol line 10 oral sachets
  {
    id: 'jenasol-line-10-oral-sachets',
    name: 'jenasol line 10 oral sachets',
    genericName: 'Hydrolyzed collagen + MSM + Glucosamine + Vitamin C + Hyaluronic acid',
    concentration: 'Sachets',
    price: 190,
    matchKeywords: ['jenasol line', 'جيناسول لاين', 'collagen', 'msm', 'hyaluronic', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل/الغضاريف (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 28. ossopan 800mg 20 f.c.tab
  {
    id: 'ossopan-ossein-hydroxyapatite-800mg-fc-tabs-20',
    name: 'ossopan 800mg 20 f.c.tab',
    genericName: 'Ossein hydroxyapatite compound',
    concentration: '800mg',
    price: 192,
    matchKeywords: ['ossopan 800', 'اوسوبان', 'ossein hydroxyapatite', 'bone', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم العظام (قد يستخدم كمساعد حسب التشخيص والحالة).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل (حسب التشخيص والحالة).',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: يُستخدم بحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },

  // 29. h joint 30 tabs
  {
    id: 'h-joint-30-tabs',
    name: 'h joint 30 tabs',
    genericName: 'Glucosamine + Chondroitin + Methyl sulfonyl methane',
    concentration: 'Tablets',
    price: 210,
    matchKeywords: ['h joint', 'اتش جوينت', 'glucosamine', 'chondroitin', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 30. collagen oral powder 10 sachets
  {
    id: 'collagen-oral-powder-10-sachets',
    name: 'collagen oral powder 10 sachets',
    genericName: 'Gelatin',
    concentration: 'Sachets',
    price: 199,
    matchKeywords: ['collagen oral powder', 'كولاجين', 'gelatin', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل كولاجين لدعم الأنسجة (كمساعد).',
    timing: 'كيس يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 31. diazocerine 50mg 20 cap
  {
    id: 'diazocerine-diacerein-50mg-caps-20',
    name: 'diazocerine 50mg 20 cap',
    genericName: 'Diacerein',
    concentration: '50mg',
    price: 46,
    matchKeywords: ['diazocerine', 'diacerein', 'دياكيريين', ...TAGS.antirheumatic, ...TAGS.osteoarthritis],
    usage: 'دواء لخشونة المفاصل (يُستخدم حسب التشخيص).',
    timing: 'مرة أو مرتين يومياً بعد الأكل حسب التشخيص والحالة.',
    category: Category.MUSCULOSKELETAL,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'الجرعة تُحدد حسب البروتوكول (غالباً بعد الأكل لتقليل الإسهال/اضطراب المعدة).',
    warnings: [
      'الحمل/الرضاعة: لا يُستخدم إلا حسب التشخيص.',
      'تداخلات: راجع تداخلات المريض أدوية الكبد/الإسهال.',
      'تحذيرات: قد يسبب إسهال؛ أوقفه وأعد التقييم عند إسهال شديد أو علامات كبد (اصفرار).',
    ],
  },

  // 32. dulagen 10 sachets
  {
    id: 'dulagen-10-sachets',
    name: 'dulagen 10 sachets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C',
    concentration: 'Sachets',
    price: 245,
    matchKeywords: ['dulagen', 'دولاجين', 'collagen', 'vitamin c', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل كولاجين لدعم المفاصل/الأوتار (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 33. ginipin 10 sachets 10 gm
  {
    id: 'ginipin-10-sachets-10g',
    name: 'ginipin 10 sachets 10 gm',
    genericName: 'Collagen + Vitamin E + Vitamin C + Calcium + Magnesium',
    concentration: '10g sachets',
    price: 250,
    matchKeywords: ['ginipin 10', 'جينيبين', 'collagen', 'vitamin e', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل كولاجين + فيتامينات/معادن لدعم المفاصل/العظام (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: يُستخدم بحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },

  // 34. jenasol 10 oral sachets
  {
    id: 'jenasol-10-oral-sachets',
    name: 'jenasol 10 oral sachets',
    genericName: 'Gelatin + Vitamin C + Vitamin E',
    concentration: 'Sachets',
    price: 190,
    matchKeywords: ['jenasol', 'جيناسول', 'gelatin', 'vitamin c', 'vitamin e', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل لدعم الأنسجة (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 35. rosnum 10 sachets
  {
    id: 'rosnum-10-sachets',
    name: 'rosnum 10 sachets',
    genericName: 'Gelatin + Vitamin C + Calcium + Vitamin D3',
    concentration: 'Sachets',
    price: 165,
    matchKeywords: ['rosnum', 'روزنوم', 'vitamin d3', 'calcium', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل لدعم العظام/الأنسجة (كمساعد).',
    timing: 'كيس يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: الحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },

  // 36. tigint 10 sachets
  {
    id: 'tigint-10-sachets',
    name: 'tigint 10 sachets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C',
    concentration: 'Sachets',
    price: 190,
    matchKeywords: ['tigint', 'تيجنت', 'collagen', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل كولاجين لدعم الأوتار/المفاصل (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 37. wingen collagen 10 sachet
  {
    id: 'wingen-collagen-10-sachets',
    name: 'wingen collagen 10 sachet',
    genericName: 'Collagen hydrolysate',
    concentration: 'Sachets',
    price: 265,
    matchKeywords: ['wingen collagen', 'وينجن', 'collagen', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل كولاجين (كمساعد).',
    timing: 'كيس يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 38. acti-colla advance 10 sachets
  {
    id: 'acti-colla-advance-10-sachets',
    name: 'acti-colla advance 10 sachets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C + Turmeric + Black pepper',
    concentration: 'Sachets',
    price: 330,
    matchKeywords: ['acti-colla advance', 'اكتي كولا ادفانس', 'turmeric', 'black pepper', 'collagen', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل كولاجين + مكونات داعمة (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: الكركم قد يزيد سيولة الدم عند بعض المرضى—راجع التفاعلات إن كنت تستخدم مميعات.']
  },

  // 39. zadojoint 30 tabs.
  {
    id: 'zadojoint-30-tabs',
    name: 'zadojoint 30 tabs.',
    genericName: 'Glucosamine hydrochloride + Chondroitin sulfate + Hyaluronic acid + MSM',
    concentration: 'Tablets',
    price: 335,
    matchKeywords: ['zadojoint', 'زادوجوينت', 'glucosamine hcl', 'chondroitin', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 40. fitmotus 30 f.c. tabs.
  {
    id: 'fitmotus-30-fc-tabs',
    name: 'fitmotus 30 f.c. tabs.',
    genericName: 'Collagen + Boron + Hyaluronic acid',
    concentration: 'F.C. Tablets',
    price: 570,
    matchKeywords: ['fitmotus', 'فيتموتس', 'collagen', 'boron', 'hyaluronic', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 41. ginipin 30 sachets 10 gm
  {
    id: 'ginipin-30-sachets-10g',
    name: 'ginipin 30 sachets 10 gm',
    genericName: 'Collagen + Vitamin E + Vitamin C + Calcium + Magnesium',
    concentration: '10g sachets',
    price: 565,
    matchKeywords: ['ginipin 30', 'جينيبين 30', 'collagen', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل كولاجين + معادن (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: الحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },

  // 42. lajan 10 sachets
  {
    id: 'lajan-10-sachets',
    name: 'lajan 10 sachets',
    genericName: 'Collagen + Glucosamine + Calcium + Magnesium + Vitamin C',
    concentration: 'Sachets',
    price: 185,
    matchKeywords: ['lajan', 'لاجان', 'collagen', 'glucosamine', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل لدعم المفاصل والعظام (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: الحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },

  // 43. leva 10 sachets
  {
    id: 'leva-10-sachets',
    name: 'leva 10 sachets',
    genericName: 'Gelatin + Vitamin C',
    concentration: 'Sachets',
    price: 110,
    matchKeywords: ['leva', 'ليفا', 'gelatin', 'vitamin c', ...TAGS.anabolic],
    usage: 'مكمل لدعم الأنسجة (كمساعد).',
    timing: 'كيس يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 44. osteolage 20 tablet
  {
    id: 'osteolage-20-tabs',
    name: 'osteolage 20 tablet',
    genericName: 'Glucosamine sulphate + Chondroitin sulphate + Methyl sulphonyl methane',
    concentration: 'Tablets',
    price: 190,
    matchKeywords: ['osteolage', 'اوستيولاج', 'glucosamine sulphate', 'chondroitin sulphate', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 45. snowliva 30 tabs
  {
    id: 'snowliva-30-tabs',
    name: 'snowliva 30 tabs',
    genericName: 'Glucosamine sulphate + Chondroitin + Collagen II + Ginger',
    concentration: 'Tablets',
    price: 249,
    matchKeywords: ['snowliva', 'سنوليفا', 'ginger', 'collagen ii', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تداخلات: الزنجبيل قد يزيد سيولة الدم—راجع التفاعلات إذا تستخدم مميعات.']
  },

  // 46. collag flex 30 tabs
  {
    id: 'collag-flex-30-tabs',
    name: 'collag flex 30 tabs',
    genericName: 'Glucosamin sulfate + MSM + Chondroitin sulfate + Collagen hydrolysate',
    concentration: 'Tablets',
    price: 330,
    matchKeywords: ['collag flex', 'كولاج فليكس', 'collagen hydrolysate', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل والغضاريف (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 47. acti-colla-c 10 sachets
  {
    id: 'acti-colla-c-10-sachets',
    name: 'acti-colla-c 10 sachets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C + Rosehip extract',
    concentration: 'Sachets',
    price: 288,
    matchKeywords: ['acti-colla-c', 'اكتي كولا سي', 'rosehip', 'collagen', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل كولاجين (كمساعد).',
    timing: 'كيس يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 48. cogex 10 sachets
  {
    id: 'cogex-10-sachets',
    name: 'cogex 10 sachets',
    genericName: 'Marine collagen hydrolysate + Vitamin C + Vitamin E',
    concentration: 'Sachets',
    price: 180,
    matchKeywords: ['cogex', 'كوجكس', 'marine collagen', 'vitamin e', ...TAGS.anabolic],
    usage: 'مكمل كولاجين بحري (كمساعد).',
    timing: 'كيس يومياً.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية الأسماك/المأكولات البحرية محتملة.']
  },

  // 49. genuphil original syrup 250ml
  {
    id: 'genuphil-original-syrup-250ml',
    name: 'genuphil original syrup 250ml',
    genericName: 'Glucosamine + Chondroitin + Methyl sulphonyl methane',
    concentration: 'Syrup 250ml',
    price: 120,
    matchKeywords: ['genuphil syrup', 'جينوفيل شراب', 'glucosamine', 'chondroitin', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'مرة يومياً بعد الأكل (غالباً مرة يومياً).',
    category: Category.MUSCULOSKELETAL,
    form: 'Syrup',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'الجرعة حسب التشخيص والحالة (عادة جرعة يومية بعد الأكل).',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 50. hydroxytoid 200 mg 20 f.c. tabs
  {
    id: 'hydroxytoid-hydroxychloroquine-sulfate-200mg-fc-tabs-20',
    name: 'hydroxytoid 200 mg 20 f.c. tabs',
    genericName: 'Hydroxychloroquine sulfate',
    concentration: '200mg',
    price: 40,
    matchKeywords: ['hydroxytoid', 'هيدروكسيتويد', 'hydroxychloroquine', ...TAGS.antirheumatic, ...TAGS.antimalarial, ...TAGS.antiprotozoal],
    usage: 'دواء معدل للمناعة للروماتويد/الذئبة حسب التشخيص.',
    timing: 'بعد الأكل مرة أو مرتين يومياً حسب التشخيص والحالة.',
    category: Category.RHEUMATOLOGY,
    form: 'F.C. Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: (weight) => {
      const maxDailyMg = 400;
      const dailyMg = Math.min(maxDailyMg, Math.round(weight * 5));
      return dailyMg <= 200 ? 'قرص واحد (200 مجم) مرة يومياً بعد الأكل' : 'قرص بعد الإفطار + قرص بعد العشاء (400 مجم/يوم)';
    },
    warnings: ['الحمل/الرضاعة: قرار طبي.', 'تداخلات: أدوية القلب/اضطراب النظم.', 'تحذيرات: أعد التقييم عند تشوش رؤية.']
  },

  // 51. indomethacin 1% topical spray 50 ml
  {
    id: 'indomethacin-1pct-topical-spray-50ml',
    name: 'indomethacin 1% topical spray 50 ml',
    genericName: 'Indomethacin',
    concentration: '1%',
    price: 14.4,
    matchKeywords: ['indomethacin spray', 'اندوميثاسين سبراي', '1%', 'topical', ...TAGS.nsaid, ...TAGS.analgesics, ...TAGS.antirheumatic],
    usage: 'مسكن ومضاد التهاب موضعي لآلام العضلات والمفاصل.',
    timing: '٢–٤ مرات يومياً حسب الحاجة.',
    category: Category.MUSCULOSKELETAL,
    form: 'Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يرش على المنطقة المصابة ٢–٤ مرات يومياً حسب الحاجة (تجنب الاستخدام على مساحات كبيرة).',
    warnings: [
      'الحمل (خصوصاً الثلث الأخير): تجنب الاستخدام على مساحات كبيرة إلا باستشارة.',
      'تداخلات: لا تجمعه مع مسكنات موضعية قوية أو مصادر حرارة على نفس المكان.',
      'تحذيرات: توقف عند طفح/حرقان شديد.',
    ],
  },

  // 52. jointatic 30 f.c. tablets
  {
    id: 'jointatic-30-fc-tabs',
    name: 'jointatic 30 f.c. tablets',
    genericName: 'Glucosamine + Chondroitin + Methyl sulphonyl methane',
    concentration: 'F.C. Tablets',
    price: 58.5,
    matchKeywords: ['jointatic', 'جوينتاتيك', 'glucosamine', 'chondroitin', 'msm', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 53. new tiger porous plaster
  {
    id: 'new-tiger-porous-plaster-arnica',
    name: 'new tiger porous plaster',
    genericName: 'Arnica tincture',
    concentration: 'Plaster',
    price: 20,
    matchKeywords: ['new tiger', 'tiger plaster', 'ارنكا', 'arnica', 'plaster', 'لاصقة', ...TAGS.analgesics, ...TAGS.antirheumatic],
    usage: 'لاصقة مسكنة موضعياً لآلام العضلات/المفاصل (عشبي).',
    timing: 'حسب الحاجة.',
    category: Category.MUSCULOSKELETAL,
    form: 'Film',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'توضع لاصقة على المكان المؤلم لمدة ٨–١٢ ساعة ثم تُزال. يمكن تكرارها حسب الحاجة.',
    warnings: ['الحمل: أقل جرعة وأقصر مدة.', 'تداخلات: لا تضعها مع مصادر حرارة.', 'تحذيرات: لا تُستخدم على جروح/حساسية جلدية.']
  },

  // 54. medipha joint 30 f.c tabs
  {
    id: 'medipha-joint-30-fc-tabs',
    name: 'medipha joint 30 f.c tabs',
    genericName: 'Glucosamine + Collagen + Chondroitin + Ginger + Vitamins & minerals',
    concentration: 'F.C. Tablets',
    price: 280,
    matchKeywords: ['medipha joint', 'ميديفا جوينت', 'ginger', 'collagen', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم المفاصل (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تداخلات: الزنجبيل قد يزيد سيولة الدم مع مميعات.']
  },

  // 55. xeljanz 5 mg 60 tab
  {
    id: 'xeljanz-tofacitinib-5mg-tabs-60',
    name: 'xeljanz 5 mg 60 tab',
    genericName: 'Tofacitinib',
    concentration: '5mg',
    price: 23074,
    matchKeywords: ['xeljanz', 'زليانز', 'tofacitinib', 'توفاسيتينيب', ...TAGS.antirheumatic],
    usage: 'مثبط مناعة (JAK inhibitor) يُستخدم في أمراض روماتيزمية مختارة حسب بروتوكول أمراض الروماتيزم.',
    timing: 'مرتين يومياً كل ١٢ ساعة.',
    category: Category.RHEUMATOLOGY,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد (5mg) كل ١٢ ساعة (مرتين يومياً) حسب التشخيص والحالة.',
    warnings: [
      'الحمل/الرضاعة: يُستخدم فقط حسب التشخيص؛ غالباً يُتجنب—يلزم منع حمل حسب التشخيص.',
      'تداخلات: تجنب مشاركته مع مثبطات مناعة قوية أخرى إلا حسب التشخيص؛ وراجع تداخلات المريض مع مضادات حيوية/فطريات (قد تغير مستواه).',
      'تحذيرات خاصة: يزيد خطر العدوى الشديدة (وقد يلزم فحص الدرن/التهاب كبدي قبل بدء العلاج). أعد التقييم فوراً عند حرارة/كحة مستمرة/ضيق نفس.',
    ],
  },

  // 56. acti-colla advance 30 sachets
  {
    id: 'acti-colla-advance-30-sachets',
    name: 'acti-colla advance 30 sachets',
    genericName: 'Gelatin (collagen) hydrolysate + Vitamin C + Turmeric + Black pepper',
    concentration: 'Sachets',
    price: 860,
    matchKeywords: ['acti-colla advance 30', 'اكتي كولا ادفانس 30', 'turmeric', ...TAGS.anabolic, ...TAGS.osteoarthritis],
    usage: 'مكمل كولاجين (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تداخلات: مميعات الدم (الكركم).']
  },

  // 57. jocosa 30 f.c. tabs.
  {
    id: 'jocosa-30-fc-tabs',
    name: 'jocosa 30 f.c. tabs.',
    genericName: 'Glucosamine + Vitamin C',
    concentration: 'F.C. Tablets',
    price: 153,
    matchKeywords: ['jocosa', 'جوكوسا', 'glucosamine', 'vitamin c', ...TAGS.antirheumatic, ...TAGS.osteoarthritis, ...TAGS.anabolic],
    usage: 'مكمل لدعم الغضاريف (كمساعد).',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: حساسية المحار المحتملة.']
  },

  // 58. kalogena 10 sachets
  {
    id: 'kalogena-10-sachets',
    name: 'kalogena 10 sachets',
    genericName: 'Gelatin + Vitamin C + Calcium + Magnesium',
    concentration: 'Sachets',
    price: 150,
    matchKeywords: ['kalogena', 'كالوجينا', 'gelatin', 'calcium', 'magnesium', ...TAGS.anabolic],
    usage: 'مكمل لدعم العظام/الأنسجة (كمساعد).',
    timing: 'كيس يومياً بعد الأكل.',
    category: Category.MUSCULOSKELETAL,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يومياً بعد الأكل.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.', 'تحذيرات: الحذر مع حصوات الكلى/ارتفاع الكالسيوم.']
  },
];

export const ANTI_INFLAMMATORY_AND_ANTI_RHEUMATIC_PRODUCTS: Medication[] =
  ANTI_INFLAMMATORY_AND_ANTI_RHEUMATIC_PRODUCTS_RAW.map((medication) => ({
    ...medication,
    category: Category.ANTI_RHEUMATIC_OSTEOARTHRITIS,
  }));

