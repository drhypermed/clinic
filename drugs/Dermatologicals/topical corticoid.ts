import { Medication, Category } from '../../types';

const TAGS = {
  glucocorticoid: ['glucocorticoid', '#glucocorticoid', 'steroid', 'كورتيزون', 'كورتيكوستيرويد', 'إكزيما', 'eczema', 'dermatitis', 'التهاب جلدي', 'حكة', 'itching', 'حساسية جلد', 'skin allergy'],
  adrenocorticoid: ['adenocorticoid', '#adenocorticoid', 'adrenocorticoid', '#adrenocorticoid', 'كورتيزون', 'clobetasol', 'كلوبيتازول', 'super potent', 'قوي جداً'],
  keratolytic: ['keratolytic', '#keratolytic', 'salicylic', 'salicylic acid', 'مقشر', 'ساليسيليك', 'قشور', 'صدفية', 'psoriasis'],
};

export const TOPICAL_CORTICOID_MEDS: Medication[] = [
  // =====================
  // TOPICAL CORTICOIDS
  // =====================

  // 1. dermovate 0.05% top. cream 25 gm
  {
    id: 'dermovate-clobetasol-0-05-cream-25',
    name: 'dermovate 0.05% top. cream 25 gm',
    genericName: 'Clobetasol',
    concentration: '0.05%',
    price: 44,
    matchKeywords: ['dermovate', 'ديرموفيت', 'clobetasol', 'cream', 'اكزيما شديدة', 'psoriasis', 'صدفية', 'إكزيما', ...TAGS.adrenocorticoid, ...TAGS.glucocorticoid],
    usage: 'كورتيزون موضعي قوي جداً للصدفية الموضعية/الأكزيما الشديدة؛ مرة يومياً (أو مرتين كحد أقصى) ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل/الرضاعة: يُستخدم عند الضرورة فقط على مساحات صغيرة ولأقصر مدة.',
      'تداخلات: امتصاصه يزيد مع الجلد المتشقق/المساحات الكبيرة/الضمادات المحكمة (يزيد آثار الكورتيزون).',
      'تحذيرات: خطر ترقق الجلد/خطوط/حبوب كورتيزون مع الاستعمال الطويل. لا يُستخدم مع عدوى جلدية غير معالجة.'
    ]
  },

  // 2. dermovate 0.05 % ointment 25 gm
  {
    id: 'dermovate-clobetasol-0-05-oint-25',
    name: 'dermovate 0.05 % ointment 25 gm',
    genericName: 'Clobetasol',
    concentration: '0.05%',
    price: 44,
    matchKeywords: ['dermovate oint', 'ديرموفيت مرهم', 'clobetasol', 'ointment', 'صدفية', 'psoriasis', ...TAGS.adrenocorticoid, ...TAGS.glucocorticoid],
    usage: 'مرهم كورتيزون قوي جداً للجفاف الشديد/اللويحات السميكة؛ مرة–مرتين يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: [
      'الحمل: يُستخدم فقط عند الضرورة وبأقل جرعة.',
      'تداخلات: قليلة موضعياً لكن يزداد الامتصاص مع الضمادات.',
      'تحذيرات: لا يُستخدم لفترات طويلة. إذا لم تتحسن خلال أسبوعين: أعد التقييم.'
    ]
  },

  // 3. texacort 0.1% top. lipocream 20 gm
  {
    id: 'texacort-hydrocortisone-17-butyrate-0-1-lipocream-20',
    name: 'texacort 0.1% top. lipocream 20 gm',
    genericName: 'Hydrocortisone 17-butyrate',
    concentration: '0.1%',
    price: 22,
    matchKeywords: ['texacort', 'تكساكورت', 'hydrocortisone butyrate', 'lipocream', ...TAGS.glucocorticoid],
    usage: 'كورتيزون موضعي متوسط القوة للأكزيما/التهاب الجلد؛ مرة يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: أقل كمية لأقصر مدة.', 'تداخلات: قليلة موضعياً.', 'تحذيرات: الاستخدام المطول قد يسبب ترقق الجلد.']
  },

  // 4. betaderm 0.1% cream 15 gm
  {
    id: 'betaderm-betamethasone-0-1-cream-15',
    name: 'betaderm 0.1% cream 15 gm',
    genericName: 'Betamethasone',
    concentration: '0.1%',
    price: 18,
    matchKeywords: ['betaderm', 'بيتاديرم', 'betamethasone', 'cream', ...TAGS.glucocorticoid],
    usage: 'كريم كورتيزون للأكزيما/التهاب الجلد؛ مرة يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة موضعياً.', 'تحذيرات: لا يُستخدم على عدوى غير معالجة.']
  },

  // 5. betaderm 0.1% cream 30 gm
  {
    id: 'betaderm-betamethasone-0-1-cream-30',
    name: 'betaderm 0.1% cream 30 gm',
    genericName: 'Betamethasone',
    concentration: '0.1%',
    price: 23,
    matchKeywords: ['betaderm 30', 'بيتاديرم 30', 'betamethasone', ...TAGS.glucocorticoid],
    usage: 'نفس كريم بيتاديرم بعبوة أكبر.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة موضعياً.', 'تحذيرات: خطر ترقق الجلد مع الاستخدام الطويل.']
  },

  // 6. betaderm 0.1% oint. 15 gm
  {
    id: 'betaderm-betamethasone-0-1-oint-15',
    name: 'betaderm 0.1% oint. 15 gm',
    genericName: 'Betamethasone',
    concentration: '0.1%',
    price: 18,
    matchKeywords: ['betaderm oint', 'بيتاديرم مرهم', 'betamethasone', 'ointment', ...TAGS.glucocorticoid],
    usage: 'مرهم كورتيزون للحالات الجافة/اللويحات؛ مرة–مرتين يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة موضعياً.', 'تحذيرات: لا يوضع على جروح مفتوحة.']
  },

  // 7. clobutra 0.05% cream 25 gm
  {
    id: 'clobutra-clobetasol-0-05-cream-25',
    name: 'clobutra 0.05% cream 25 gm',
    genericName: 'Clobetasol',
    concentration: '0.05%',
    price: 26,
    matchKeywords: ['clobutra', 'كلوبيوترا', 'clobetasol', 'cream', ...TAGS.adrenocorticoid, ...TAGS.glucocorticoid],
    usage: 'كورتيزون موضعي قوي جداً للحالات الشديدة؛ مرة–مرتين يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: أقل كمية لأقصر مدة.', 'تداخلات: يزيد الامتصاص مع الضمادات.', 'تحذيرات: خطر ترقق الجلد مع الاستعمال الطويل.']
  },

  // 8. diprosone 0.05% cream 30 gm
  {
    id: 'diprosone-betamethasone-0-05-cream-30',
    name: 'diprosone 0.05% cream 30 gm',
    genericName: 'Betamethasone',
    concentration: '0.05%',
    price: 45,
    matchKeywords: ['diprosone', 'ديبروزون', 'betamethasone', 'cream', ...TAGS.glucocorticoid],
    usage: 'كريم كورتيزون موضعي لتخفيف الالتهاب والحكة في أمراض جلدية مستجيبة للكورتيزون.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة موضعياً.', 'تحذيرات: ترقق جلد/حبوب كورتيزون مع الاستعمال الطويل.']
  },

  // 9. elicasal topical oint. 30 gm
  {
    id: 'elicasal-mometasone-salicylic-oint-30',
    name: 'elicasal topical oint. 30 gm',
    genericName: 'Mometasone furoate + Salicylic acid',
    concentration: 'Combination',
    price: 50,
    matchKeywords: ['elicasal', 'اليكاسال', 'mometasone', 'salicylic', 'psoriasis', 'plaque', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'مرهم (كورتيزون + ساليسيليك) للصدفية/الأكزيما السميكة؛ مرة–مرتين يومياً ولمدة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب المساحات الكبيرة.', 'تداخلات: تجنب مقشرات قوية أخرى.', 'تحذيرات: لا يُستخدم على عدوى جلدية غير معالجة.']
  },

  // 10. hydrocortisone 1% oint. 20 gm
  {
    id: 'hydrocortisone-1-oint-20',
    name: 'hydrocortisone 1% oint. 20 gm',
    genericName: 'Hydrocortisone',
    concentration: '1%',
    price: 21,
    matchKeywords: ['hydrocortisone 1', 'هيدروكورتيزون 1', 'ointment', 'لدغ حشرات', 'insect bite', 'حكة', ...TAGS.glucocorticoid],
    usage: 'كورتيزون خفيف للدغ الحشرات/التهاب جلد بسيط؛ ١–٢ مرة يومياً لأيام قليلة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: آمن نسبياً موضعياً بجرعات صغيرة.', 'تداخلات: قليلة.', 'تحذيرات: الاستعمال الزائد قد يسبب ترقق الجلد.']
  },

  // 11. kerella oint. 15 gm
  {
    id: 'kerella-betamethasone-dipropionate-salicylic-oint-15',
    name: 'kerella oint. 15 gm',
    genericName: 'Betamethasone dipropionate + Salicylic acid',
    concentration: 'Combination',
    price: 23,
    matchKeywords: ['kerella', 'كيرلا', 'betamethasone', 'salicylic', 'psoriasis', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'مرهم (كورتيزون + ساليسيليك) للبقع السميكة/القشور؛ مرة–مرتين يومياً ولمدة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب المساحات الكبيرة.', 'تداخلات: تجنب مقشرات أخرى.', 'تحذيرات: تهيج/حرقان محتمل بسبب الساليسيليك.']
  },

  // 12. salibet oint. 30 gm
  {
    id: 'salibet-salicylic-betamethasone-oint-30',
    name: 'salibet oint. 30 gm',
    genericName: 'Salicylic acid + Betamethasone',
    concentration: 'Combination',
    price: 29,
    matchKeywords: ['salibet', 'ساليبيت', 'salicylic', 'betamethasone', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'مرهم (كورتيزون + ساليسيليك) للويحات السميكة؛ مرة–مرتين يومياً ولمدة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: تجنب مقشرات قوية.', 'تحذيرات: قد يسبب حرقان/تهيج.']
  },

  // 13. diprosone 0.05% cream 10 gm
  {
    id: 'diprosone-betamethasone-0-05-cream-10',
    name: 'diprosone 0.05% cream 10 gm',
    genericName: 'Betamethasone',
    concentration: '0.05%',
    price: 26,
    matchKeywords: ['diprosone 10', 'ديبروزون 10', 'betamethasone', ...TAGS.glucocorticoid],
    usage: 'نفس ديبروزون كريم بعبوة أصغر.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة.', 'تحذيرات: ترقق الجلد مع الاستعمال الطويل.']
  },

  // 14. alfacort cream 15 mg
  {
    id: 'alfacort-hydrocortisone-cream-15mg',
    name: 'alfacort cream 15 mg',
    genericName: 'Hydrocortisone',
    concentration: '15 mg',
    price: 13.2,
    matchKeywords: ['alfacort', 'الفاكورت', 'hydrocortisone', 'cream', 'لدغ حشرات', 'insect bite', 'حكة', ...TAGS.glucocorticoid],
    usage: 'هيدروكورتيزون خفيف للالتهاب/الحكة البسيطة؛ ١–٢ مرة يومياً لأيام قليلة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن موضعياً بجرعات صغيرة.', 'تداخلات: قليلة.', 'تحذيرات: الاستخدام المطول قد يسبب ترقق الجلد.']
  },

  // 15. diprosone 0.05% oint. 10 gm
  {
    id: 'diprosone-betamethasone-0-05-oint-10',
    name: 'diprosone 0.05% oint. 10 gm',
    genericName: 'Betamethasone',
    concentration: '0.05%',
    price: 26,
    matchKeywords: ['diprosone oint', 'ديبروزون مرهم', 'betamethasone', 'ointment', ...TAGS.glucocorticoid],
    usage: 'مرهم كورتيزون للحالات الجافة/اللويحات؛ مرة–مرتين يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة.', 'تحذيرات: ترقق الجلد مع الاستخدام الطويل.']
  },

  // 16. glenosalic top. oint. 15 gm
  {
    id: 'glenosalic-mometasone-salicylic-oint-15',
    name: 'glenosalic top. oint. 15 gm',
    genericName: 'Mometasone furoate + Salicylic acid',
    concentration: 'Combination',
    price: 14.4,
    matchKeywords: ['glenosalic', 'جلينوساليك', 'mometasone', 'salicylic', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'مرهم (موميتازون + ساليسيليك) للويحات السميكة؛ مرة يومياً ولمدة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب المساحات الكبيرة.', 'تداخلات: تجنب مقشرات أخرى.', 'تحذيرات: تهيج محتمل بسبب الساليسيليك.']
  },

  // 17. betnovate 0.1 % scalp application 30 ml
  {
    id: 'betnovate-betamethasone-0-1-scalp-30',
    name: 'betnovate 0.1 % scalp application 30 ml',
    genericName: 'Betamethasone',
    concentration: '0.1%',
    price: 24,
    matchKeywords: ['betnovate', 'بيتنوفيت', 'scalp', 'hair', 'dandruff', 'seborrheic dermatitis', 'فروة الرأس', 'قشرة', 'التهاب جلد دهني', 'صدفية فروة', ...TAGS.glucocorticoid],
    usage: 'كورتيزون لفروة الرأس (التهاب جلد دهني/صدفية)؛ مرة يومياً ولمدة محدودة.',
    timing: '٢–٣ مرات أسبوعياً – ٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Lotion',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُدلَّك في فروة الرأس ٥ دقائق ثم يُشطف ٢–٣ مرات أسبوعياً لمدة ٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة.', 'تحذيرات: خطر ترقق الجلد إذا طال الاستخدام.']
  },

  // 18. elicasal topical oint. 15gm
  {
    id: 'elicasal-mometasone-salicylic-oint-15',
    name: 'elicasal topical oint. 15gm',
    genericName: 'Mometasone furoate + Salicylic acid',
    concentration: 'Combination',
    price: 14.4,
    matchKeywords: ['elicasal 15', 'اليكاسال 15', 'mometasone', 'salicylic', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'نفس إليكاسال (عبوة أصغر) للبقع السميكة/القشور؛ مرة يومياً ولمدة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب المساحات الكبيرة.', 'تداخلات: تجنب مقشرات أخرى.', 'تحذيرات: تهيج محتمل.']
  },

  // 19. tretoflamin 0.025% cream 20 gm
  {
    id: 'tretoflamin-fluocinolone-0-025-cream-20',
    name: 'tretoflamin 0.025% cream 20 gm',
    genericName: 'Fluocinolone',
    concentration: '0.025%',
    price: 21,
    matchKeywords: ['tretoflamin', 'تريتوفلامين', 'fluocinolone', 'cream', ...TAGS.glucocorticoid],
    usage: 'كورتيزون موضعي لالتهاب الجلد؛ ١–٢ مرة يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ أقل كمية وأقصر مدة.', 'تداخلات: قليلة.', 'تحذيرات: قد يسبب ترقق الجلد مع الاستعمال الطويل.']
  },

  // 20. despruderm 0.05% topical cream 30 gm
  {
    id: 'despruderm-desonide-0-05-cream-30',
    name: 'despruderm 0.05% topical cream 30 gm',
    genericName: 'Desonide',
    concentration: '0.05%',
    price: 33,
    matchKeywords: ['despruderm', 'ديسبروديرم', 'desonide', 'cream', 'face eczema', ...TAGS.glucocorticoid],
    usage: 'كورتيزون خفيف/متوسط للمناطق الحساسة؛ ١–٢ مرة يومياً ولمدة قصيرة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن موضعياً بجرعات صغيرة.', 'تداخلات: قليلة.', 'تحذيرات: الاستعمال الطويل قد يسبب ترقق الجلد.']
  },

  // 21. micort 1% cream 20 gm
  {
    id: 'micort-hydrocortisone-1-cream-20',
    name: 'micort 1% cream 20 gm',
    genericName: 'Hydrocortisone',
    concentration: '1%',
    price: 12.5,
    matchKeywords: ['micort', 'ميكورت', 'hydrocortisone', 'cream', ...TAGS.glucocorticoid],
    usage: 'هيدروكورتيزون ١٪ للالتهاب/الحكة البسيطة؛ ١–٢ مرة يومياً لأيام قليلة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Cream',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: غالباً آمن موضعياً.', 'تداخلات: قليلة.', 'تحذيرات: لا يوضع على جروح مفتوحة.']
  },

  // 22. glenosalic top. oint. 30 gm
  {
    id: 'glenosalic-mometasone-salicylic-oint-30',
    name: 'glenosalic top. oint. 30 gm',
    genericName: 'Mometasone furoate + Salicylic acid',
    concentration: 'Combination',
    price: 50,
    matchKeywords: ['glenosalic 30', 'جلينوساليك 30', 'mometasone', 'salicylic', ...TAGS.glucocorticoid, ...TAGS.keratolytic],
    usage: 'نفس جلينوساليك (عبوة أكبر) للبقع السميكة/القشور؛ مرة يومياً ولمدة محدودة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.STEROIDS,
    form: 'Ointment',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: تجنب المساحات الكبيرة.', 'تداخلات: تجنب مقشرات قوية.', 'تحذيرات: تهيج محتمل.']
  }
];

