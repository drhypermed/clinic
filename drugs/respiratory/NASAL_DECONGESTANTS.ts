
import { Medication, Category } from '../../types';

const normalizeSpaces = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([.,؛:!؟])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
  let t = s;
  t = t.replace(/تحت\s*إشراف\s*طبي/g, '');
  t = t.replace(/(?:إلا\s+)?بتوجيه\s+طبي/g, '');
  t = t.replace(/(?:إلا\s+)?بوصفة\s+طبيب/g, '');
  t = t.replace(/استشر(?:ي)?\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/استشارة\s+(?:طبية|الطبيب)[^.]*\./g, '.');
  t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات|وصف)\s+الطبيب/g, '');
  t = t.replace(/اسأل\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/\(اسأل الطبيب\)/g, '');
  t = t.replace(/بإرشاد\s+طبي/g, '');
  return normalizeSpaces(t);
};

const sanitizeText = (s: string) => stripDoctorPhrases(s);

const wrapRule = (rule: Medication['calculationRule']): Medication['calculationRule'] => {
  return (weight, ageMonths) => sanitizeText(rule(weight, ageMonths));
};

const W_RED_FLAGS_NASAL: Medication['warnings'] = [
  'علامات تستلزم تقييماً عاجلاً: ضيق تنفس، زرقة، نزف أنفي متكرر، ألم شديد بالوجه/الأسنان، إفراز أنفي صديدي، أو حمى مرتفعة.',
  'استمرار الاحتقان أكثر من ٧–١٠ أيام يستلزم تقييماً (خصوصاً مع ألم الوجه أو إفراز صديدي).',
];

const W_ALPHA_AGONIST_COMMON: Medication['warnings'] = [
  'الحمل/الرضاعة: يفضّل تجنّبه ما لم تكن هناك حاجة واضحة، وبأقل جرعة لأقصر مدة.',
  'تداخلات: غير مناسب مع مثبطات MAO خلال آخر ١٤ يوم. الجمع مع مزيلات احتقان أخرى/منبهات قد يزيد الخفقان أو ضغط الدم.',
  'المدة: الاستمرار أكثر من ٣–٥ أيام يزيد خطر الاحتقان الارتدادي (Rebound).',
  'قد لا يناسب: ارتفاع ضغط غير منضبط، أمراض القلب، فرط نشاط الغدة الدرقية، السكري، الزَّرَق ضيق الزاوية، أو تضخم بروستاتا مع احتباس بول.',
  ...W_RED_FLAGS_NASAL,
  'العبوة شخصية ولا تُشارك.',
];

const W_ALPHA_AGONIST_PED_EXTRA: Medication['warnings'] = [
  'الأطفال: تكرار الجرعة مبكراً أو زيادة الجرعة قد يسبب خمولاً/دوخة/خفقاناً.',
];

const W_SALINE_COMMON: Medication['warnings'] = [
  'الحمل/الرضاعة: آمن عادةً (محلول ملحي موضعي).',
  'تداخلات: لا توجد تداخلات دوائية مهمة معروفة.',
  'نظافة الفوهة والعبوة الشخصية يقللان انتقال العدوى.',
];

const W_SALINE_RED_FLAGS: Medication['warnings'] = [
  'استمرار الأعراض أكثر من ١٠ أيام أو ألم شديد/حمى أو إفراز صديدي يستلزم تقييماً.',
];

const W_HYPERTONIC_EXTRA: Medication['warnings'] = [
  'قد يسبب لذعة/حرقان بسيط مؤقت بسبب التركيز العالي.',
];

const W_JET_STRONG_EXTRA: Medication['warnings'] = [
  'قوة الدفع (Jet) قد تكون مزعجة؛ الأعمار الأصغر غالباً يناسبها الرذاذ الناعم (Mist).',
];

const W_ESSENTIAL_OILS_EXTRA: Medication['warnings'] = [
  'الزيوت الطيارة قد تزيد الإحساس بالحرقة/الدموع أو التهيج لدى بعض المرضى (خصوصاً الربو أو الحساسية الشديدة).',
];

const RAW_NASAL_DECONGESTANTS: Medication[] = [
  // ==========================================
  // NASAL DECONGESTANTS

  // 1. Otrivin Pediatric Drops
  {
    id: 'otrivin-ped-drops',
    name: 'Otrivin 0.05% pediatric nasal drops 15 ml',
    genericName: 'Xylometazoline hydrochloride',
    concentration: '0.05%',
    price: 24, // UPDATED: Price as per request
    // UPDATED: Common keywords for nasal congestion
    matchKeywords: [
        'nasal congestion', 'blocked nose', 'rhinitis', 'otrivin', 'cold', 'sinusitis',
        'زكام', 'انسداد الأنف', 'أوتريفين أطفال', 'نقط للأنف', 'برد', 'جيوب أنفية'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً في نزلات البرد والتهاب الأنف (بما فيها الحساسية) والتهاب الجيوب كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 50,

    calculationRule: (_weight, ageMonths) => {
      if (ageMonths < 72) {
        return 'نقطة واحدة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى';
      }
      return '١–٢ نقطة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى';
    },


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      ...W_ALPHA_AGONIST_PED_EXTRA,
      'أقل من سنتين: غير مناسب عادةً؛ المحلول الملحي خيار أول.',
    ]
  },

// 2. Otrivin Adult Drops
  {
    id: 'otrivin-adult-drops',
    name: 'Otrivin 0.1% adult nasal drops 15 ml',
    genericName: 'Xylometazoline hydrochloride',
    concentration: '0.1%',
    price: 24,
    matchKeywords: [
        'nasal congestion', 'blocked nose', 'rhinitis', 'otrivin adult', 'sinusitis',
        'زكام', 'انسداد الأنف', 'أوتريفين كبار', 'نقط للأنف', 'احتقان', 'جيوب أنفية'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً في نزلات البرد والتهاب الأنف (بما فيها الحساسية) والتهاب الجيوب كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '٢–٣ نقط في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى',


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      'أقل من ١٢ سنة: غير مناسب (يُستخدم تركيز ٠.٠٥٪ للأطفال).',
    ]
  },

// 3. Otrivin Adult Spray
  {
    id: 'otrivin-adult-spray',
    name: 'Otrivin 0.1% adult nasal spray 10 ml',
    genericName: 'Xylometazoline hydrochloride',
    concentration: '0.1%',
    price: 32, // UPDATED: Price as per request
    // UPDATED: Keywords specific to Spray
    matchKeywords: [
        'nasal spray', 'blocked nose', 'rhinitis', 'sinusitis', 'decongestant',
        'بخاخ للأنف', 'زكام', 'انسداد الأنف', 'أوتريفين سبراي', 'جيوب أنفية', 'احتقان'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً في نزلات البرد والتهاب الأنف (بما فيها الحساسية) والتهاب الجيوب كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Spray',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => 'بخة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى',
    
    // UPDATED: Spray technique (Head upright)
    
    // ADDED: Critical Warnings (Same as drops but emphasized)
    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      'أقل من ١٢ سنة: غير مناسب.',
    ]
  },

// 4. Oxymet Adult Drops
  {
    id: 'oxymet-adult-drops',
    name: 'Oxymet 0.05% adult nasal drops 15 ml',
    genericName: 'Oxymetazoline hydrochloride',
    concentration: '0.05%',
    price: 15, // Very affordable
    // UPDATED: Keywords for Oxymetazoline
    matchKeywords: [
        'nasal congestion', 'blocked nose', 'afrin generic', 'long acting', 'oxymet',
        'زكام', 'انسداد الأنف', 'أوكسيمت', 'نقط للأنف', 'رخيص', 'طويل المفعول'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً (ممتد المفعول حتى ~١٢ ساعة) في نزلات البرد/التهاب الأنف/التهاب الجيوب كعلاج مساعد.',
    timing: 'كل ١٠–١٢ ساعة – ٣–٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_weight, ageMonths) => {
      if (ageMonths < 144) {
        return '١–٢ نقطة في كل فتحة أنف كل ١٠–١٢ ساعة (بحد أقصى مرتين يومياً) – بدون اعتبار للأكل – لمدة ٣ أيام (وبحد أقصى ٥ أيام)';
      }
      return '٢–٣ نقط في كل فتحة أنف كل ١٠–١٢ ساعة (بحد أقصى مرتين يومياً) – بدون اعتبار للأكل – لمدة ٣ أيام (وبحد أقصى ٥ أيام)';
    },


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      'الاحتياج لأكثر من ٣ أيام أو تدهور الأعراض يستلزم تقييماً.',
    ]
  },

// 5. Oxymet Pediatric
  {
    id: 'oxymet-paed-drops',
    name: 'Oxymet 0.025% paed.nasal drops 15 ml',
    genericName: 'Oxymetazoline hydrochloride',
    concentration: '0.025%',
    price: 15, // UPDATED: Price as per request
    // UPDATED: Keywords for Pediatric Congestion
    matchKeywords: [
        'nasal congestion', 'blocked nose', 'oxymet pediatric', 'cold', 'stuffy nose',
        'زكام', 'انسداد الأنف', 'أوكسيمت أطفال', 'نقط أطفال', 'رشح', 'خنفرة'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً للأطفال (تركيز مخفف) كعلاج مساعد في نزلات البرد/التهاب الأنف.',
    timing: 'كل ١٠–١٢ ساعة – ٣ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 24,
    maxAgeMonths: 72,
    minWeight: 10,
    maxWeight: 30,

    calculationRule: (_weight, _ageMonths) => '١–٢ نقطة في كل فتحة أنف كل ١٠–١٢ ساعة (بحد أقصى مرتين يومياً) – بدون اعتبار للأكل – لمدة ٣ أيام كحد أقصى',


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      ...W_ALPHA_AGONIST_PED_EXTRA,
      'المدة: حتى ٣ أيام عادةً (وبحد أقصى ٥ أيام).',
      'خمول شديد/خفقان/دوخة تستلزم الإيقاف والتقييم.',
      'أقل من سنتين: غير مناسب عادةً؛ المحلول الملحي/شفاط الأنف خيار أول.',
    ]
  },

// 6. Rhinex Infantile (Pediatric)
  {
    id: 'rhinex-ped-drops',
    name: 'Rhinex 0.05% infantile nasal drops 10 ml',
    genericName: 'Xylometazoline hydrochloride',
    concentration: '0.05%',
    price: 18, // UPDATED: Price as per request
    // UPDATED: Keywords including the common trade name
    matchKeywords: [
        'rhinex', 'nasal congestion', 'blocked nose', 'common cold', 'stuffy nose',
        'راينكس', 'نقط أطفال', 'زكام', 'انسداد الأنف', 'برد', 'بديل أوتريفين'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً للأطفال في نزلات البرد/التهاب الأنف كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 50,

    calculationRule: (_weight, ageMonths) => {
      if (ageMonths < 72) {
        return 'نقطة واحدة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى';
      }
      return '١–٢ نقطة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى';
    },


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      ...W_ALPHA_AGONIST_PED_EXTRA,
      'أقل من سنتين: غير مناسب عادةً؛ المحلول الملحي خيار أول.',
    ]
  },

// 7. Normifrin Spray
  {
    id: 'normifrin-spray',
    name: 'Normifrin (oxymetazoline-mup) 0.5mg/ml nasal spray 20 ml',
    genericName: 'Oxymetazoline hydrochloride',
    concentration: '0.05%',
    price: 26, // UPDATED: Price as per request
    // UPDATED: Keywords for congestion & MUP product
    matchKeywords: [
        'nasal spray', 'blocked nose', 'congestion', 'normifrin', 'long acting',
        'نورمفرين', 'بخاخ أنف', 'زكام', 'انسداد الأنف', 'مزيل احتقان', 'جيوب أنفية'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً (ممتد المفعول حتى ~١٢ ساعة) كعلاج مساعد في نزلات البرد/التهاب الأنف/الجيوب.',
    timing: 'كل ١٠–١٢ ساعة – ٣–٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Spray',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => 'بخة في كل فتحة أنف كل ١٠–١٢ ساعة (بحد أقصى مرتين يومياً) – بدون اعتبار للأكل – لمدة ٣ أيام (وبحد أقصى ٥ أيام)',
    
    // UPDATED: Spray instructions (Upright)
    
    // ADDED: Critical Rebound Warning
    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
    ]
  },


// 8. Nasostop Adult Drops
  {
    id: 'nasostop-adult-drops',
    name: 'Nasostop 0.1% adult nasal drops 15 ml',
    genericName: 'Xylometazoline hydrochloride',
    concentration: '0.1%',
    price: 20, // UPDATED: Price as per request
    // UPDATED: Keywords including Arabic variations
    matchKeywords: [
        'nasal congestion', 'blocked nose', 'rhinitis', 'nasostop', 'nazostop', 
        'زكام', 'انسداد الأنف', 'نازوستوب', 'نقط كبار', 'بديل أوتريفين'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً في نزلات البرد/التهاب الأنف/الجيوب كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '٢–٣ نقط في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى',


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      'أقل من ١٢ سنة: غير مناسب.',
    ]
  },

// 9. Nasostop Pediatric Drops
 {
    id: 'nasostop-ped-drops',
    name: 'Nasostop 0.05% paed nasal drops 15 ml',
   genericName: 'Xylometazoline hydrochloride',
    concentration: '0.05%',
    price: 18, 
    matchKeywords: [
        'nasal congestion', 'blocked nose', 'nasostop pediatric', 'cold', 
        'زكام', 'انسداد الأنف', 'نازوستوب أطفال', 'نقط أطفال', 'رشح', 'بديل أوتريفين أطفال'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً للأطفال في نزلات البرد/التهاب الأنف كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 15,
    maxWeight: 50,

    calculationRule: (_weight, ageMonths) => {
      if (ageMonths < 72) {
        return 'نقطة واحدة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى';
      }
      return '١–٢ نقطة في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى';
    },


    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      ...W_ALPHA_AGONIST_PED_EXTRA,
      'أقل من سنتين: غير مناسب.',
    ]
  },

// 10. Polymer Baby Isotonic Spray
  {
    id: 'polymer-baby-spray',
    name: 'Polymer baby isotonic 0.9% nasal spray 100ml',
    genericName: 'Sodium chloride 0.9% (isotonic saline / seawater)',
    concentration: '0.9% (Isotonic)',
    price: 300, 
    // UPDATED: Keywords focus on Safety & Hygiene
    matchKeywords: [
        'nasal wash', 'nasal hygiene', 'sea water', 'saline', 'blocked nose', 'safe',
        'ماء بحر', 'غسيل أنف', 'محلول ملح', 'تنظيف الأنف', 'آمن للرضع', 'بوليمر'
    ],
    usage: 'تنظيف وترطيب الأنف وتخفيف المخاط (علاج مساعد في الزكام/الحساسية/الجفاف).',
    timing: 'عند الحاجة – ٢–٦ مرات يومياً',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف ٢–٦ مرات يومياً – بدون اعتبار للأكل – حسب الحاجة',

    // ADDED: Reassuring Warnings (It's safe!)
    warnings: [
      ...W_SALINE_COMMON,
      ...W_SALINE_RED_FLAGS,
      'العبوة مضغوطة، تُحفظ بعيداً عن الحرارة والشمس.'
    ]
  },

// 11. Polymer Kids Hypertonic
  {
    id: 'polymer-kids-hyper',
    name: 'Polymer kids hypertonic 2.3% nasal spray 100ml',
    genericName: 'Sodium chloride ~2.3% (hypertonic saline / seawater)',
    concentration: '2.3% (Hypertonic)',
    price: 305, // UPDATED: Price as per request
    // UPDATED: Keywords focus on TREATMENT not just hygiene
    matchKeywords: [
        'sinusitis', 'severe congestion', 'blocked nose', 'thick mucus', 'hypertonic',
        'ماء بحر مركز', 'جيوب أنفية', 'انسداد شديد', 'مخاط لزج', 'بديل أوتريفين طبيعي', 'بوليمر'
    ],
    usage: 'علاج مساعد لتخفيف الاحتقان وإذابة المخاط السميك (Hypertonic) في الزكام/التهاب الجيوب.',
    timing: '٢–٣ مرات يومياً – أثناء الاحتقان فقط',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 60,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف ٢–٣ مرات يومياً – بدون اعتبار للأكل – أثناء الاحتقان',
    
    // UPDATED: Instructions imply cleaning AFTER spraying
    
    // ADDED: Comparison Warnings
    warnings: [
      ...W_SALINE_COMMON,
      ...W_HYPERTONIC_EXTRA,
      'يُستخدم أثناء الاحتقان وليس كغسول يومي روتيني لفترات طويلة.',
      ...W_SALINE_RED_FLAGS,
    ]
  },


// 12. Influprop Nasal Spray
  {
    id: 'influprop-spray',
    name: 'Influprop nasal spray 60 ml',
    genericName: 'Isotonic Seawater + Echinacea + Calendula + Copper',
    concentration: 'Isotonic + Herbal Extracts',
    price: 300, 
    // UPDATED: Keywords for Immunity & Natural decongestant
    matchKeywords: [
        'immunity', 'natural antiseptic', 'echinacea', 'calendula', 'copper', 'cold defense',
        'انفلوبروب', 'مناعة', 'ايشيناسيا', 'نحاس', 'مطهر للأنف', 'وقاية من البرد'
    ],
    usage: 'ترطيب وتنظيف الأنف كعلاج مساعد أثناء الزكام/الحساسية؛ وقد يساعد على تقليل تهيّج الأنف لدى بعض المرضى.',
    timing: 'كل ٨ ساعات – أثناء الأعراض',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف كل ٨ ساعات (٣ مرات يومياً) – بدون اعتبار للأكل – أثناء الأعراض',
    
    // UPDATED: Explicit timing instruction as requested
    
    // ADDED: Warnings regarding herbal allergies
    warnings: [
      ...W_SALINE_COMMON,
      'الحمل/الرضاعة: البيانات غير كافية عن المستخلصات العشبية؛ يفضّل تجنّبه.',
      'أمراض مناعية أو أدوية مثبِّطة للمناعة: قد لا يكون مناسباً لبعض الحالات.',
      'قد يسبب تهيجاً موضعياً أو حساسية (خصوصاً حساسية نباتات العائلة النجمية).'
    ]
  },

// 13. Otrivin Menthol Drops (Old/Classic)
  {
    id: 'otrivin-menthol-drops',
    name: 'Otrivin menthol 0.1% nasal drops. 10 ml',
    genericName: 'Xylometazoline hydrochloride + Menthol',
    concentration: '0.1%',
    price: 6.5, // Note: This is likely an old price/form
    // UPDATED: Keywords specific to Menthol/Cooling
    matchKeywords: [
        'menthol', 'cooling', 'refreshing', 'blocked nose', 'eucalyptus',
        'بالنعناع', 'منثول', 'منعش', 'زكام', 'برودة', 'كافور'
    ],
    usage: 'تخفيف احتقان/انسداد الأنف مؤقتاً (مع إحساس منعش بالمنثول) كعلاج مساعد.',
    timing: 'كل ٨–١٠ ساعات – ٥ أيام كحد أقصى',
    category: Category.NASAL_DECONGESTANTS,
    form: 'Nasal Drops',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '٢–٣ نقط في كل فتحة أنف كل ٨–١٠ ساعات (بحد أقصى ٣ مرات يومياً) – بدون اعتبار للأكل – لمدة ٣–٥ أيام كحد أقصى',
    
    
    // ADDED: Warnings specific to Menthol
    warnings: [
      ...W_ALPHA_AGONIST_COMMON,
      'المنثول قد يزيد الإحساس بالحرقة/التهيج عند بعض المرضى.',
      'أقل من ١٢ سنة: غير مناسب.',
    ]
  },

  // 14. Physiomer Baby Mist
  {
    id: 'physiomer-baby-mist',
    name: 'Physiomer baby mist nasal spray 115ml',
    genericName: 'Isotonic seawater (sterile saline)',
    concentration: 'Isotonic (Natural pH)',
    price: 400, // UPDATED: Price as per request
    // UPDATED: Keywords focus on Pro & Gentle Mist
    matchKeywords: [
        'physiomer', 'baby mist', 'gentle spray', 'nasal hygiene', 'sea water', 'premium',
        'فيزيومير', 'بيبي ميست', 'رذاذ ناعم', 'ماء بحر', 'غسيل أنف', 'تنظيف يومي', 'رضع'
    ],
    usage: 'تنظيف وترطيب الأنف للرضع والأطفال الصغار (رذاذ ناعم) كعلاج مساعد للزكام/الحساسية والجفاف.',
    timing: 'عند الحاجة – يومياً',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 0,
    maxAgeMonths: 36,
    minWeight: 2,
    maxWeight: 20,

    calculationRule: (_weight, _ageMonths) => 'بخة طويلة (١–٢ ثانية) في كل فتحة أنف عدة مرات يومياً – بدون اعتبار للأكل – حسب الحاجة',
    
    // UPDATED: Instructions for "Mist" application
    
    // ADDED: Pro Features Warnings
    warnings: [
      ...W_SALINE_COMMON,
      'تنظيف الفوهة بعد كل استخدام مهم.',
      'علامات طارئة عند الرضع: صعوبة تنفس شديدة، زرقة، أو حمى عالية تستلزم تقييماً عاجلاً.'
    ]
  },



// 16. Calmare Plus Spray
  {
    id: 'calmare-plus-130',
    name: 'Calmare plus 130 ml nasal spray',
    genericName: 'Hypertonic saline / seawater',
    concentration: 'Hypertonic',
    price: 150, // UPDATED: Price as per request
    // UPDATED: Keywords for Hypertonic/Congestion
    matchKeywords: [
        'hypertonic', 'sea water', 'congestion', 'blocked nose', 'calmare',
        'كالمير بلس', 'ماء بحر مركز', 'انسداد الأنف', 'مذيب للمخاط', 'احتقان'
    ],
    usage: 'بخاخ ماء بحر "مركز" (Hypertonic) لعلاج انسداد الأنف والجيوب الأنفية.',
    timing: '٢–٣ مرات يومياً – أثناء الاحتقان فقط',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف ٢–٣ مرات يومياً – بدون اعتبار للأكل – أثناء الاحتقان',
    
    // UPDATED: Instructions for Hypertonic cleansing
    
    // ADDED: Standard Hypertonic Warnings
    warnings: [
      ...W_SALINE_COMMON,
      ...W_HYPERTONIC_EXTRA,
      'يُستخدم أثناء الاحتقان وليس للنظافة اليومية الروتينية لفترات طويلة.',
      ...W_SALINE_RED_FLAGS,
    ]
  },

  // 17. Physiomer Hypertonic
  {
    id: 'physiomer-hypertonic-135',
    name: 'Physiomer hypertonic nasal spray 135ml',
    genericName: 'Hypertonic saline / seawater',
    concentration: 'Hypertonic (2.2%)',
    price: 350, // UPDATED: Price as per request
    // UPDATED: Keywords for Strong Congestion
    matchKeywords: [
        'sinusitis', 'blocked nose', 'physiomer hypertonic', 'severe congestion', 
        'فيزيومير', 'ماء بحر مركز', 'جيوب أنفية', 'انسداد شديد', 'زكام'
    ],
    usage: 'غسول ماء بحر "مركز" (Hypertonic) لعلاج انسداد الأنف والجيوب الأنفية.',
    timing: '٢–٣ مرات يومياً – أثناء دور البرد فقط',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف ٢–٣ مرات يومياً – بدون اعتبار للأكل – أثناء الاحتقان',
    
    // UPDATED: Instructions imply waiting for effect
    
    // ADDED: Clinical Warnings
    warnings: [
      'الحمل/الرضاعة (خطورة منخفضة جداً): آمن عادةً (محلول ملحي موضعي).',
      'تداخلات: لا توجد تداخلات دوائية مهمة معروفة.',
      'تحذيرات خاصة: قد يسبب لذعة/حرقان بسيط مؤقت. يُستخدم أثناء الاحتقان وليس للنظافة اليومية الروتينية.'
    ]
  },

// 18. Physiomer Normal Jet
  {
    id: 'physiomer-normal-jet-135',
    name: 'Physiomer normal jet nasal spray 135ml',
    genericName: 'Sodium chloride 0.9% (isotonic saline / seawater)',
    concentration: 'Isotonic (Standard Flow)',
    price: 300, // UPDATED: Price as per request
    // UPDATED: Keywords focus on Daily Wash & Jet Flow
    matchKeywords: [
        'nasal wash', 'daily hygiene', 'physiomer normal', 'isotonic', 
        'فيزيومير', 'غسول أنف', 'ماء بحر', 'نظافة يومية', 'تدفق قوي', 'وقاية'
    ],
    usage: 'غسول ماء بحر (تدفق قوي - Jet) للنظافة اليومية والوقاية للكبار والأطفال.',
    timing: '١–٢ مرة يومياً – نظافة روتينية',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => 'بخة طويلة (١–٢ ثانية) في كل فتحة أنف ١–٢ مرة يومياً – بدون اعتبار للأكل – حسب الحاجة',
    
    // UPDATED: Standard washing instructions
    
    // ADDED: Difference from Mist warnings
    warnings: [
      ...W_SALINE_COMMON,
      ...W_JET_STRONG_EXTRA,
      'أقل من سنتين: غير مناسب لهذا النوع (Jet).'
    ]
  },


// 19. Physiomer Strong Jet 210ml
  {
    id: 'physiomer-strong-jet-210',
    name: 'Physiomer strong jet nasal spray 210ml',
    genericName: 'Isotonic saline / seawater (high pressure jet)',
    concentration: 'Isotonic (High Pressure)',
    price: 350, // UPDATED: Price as per request
    // UPDATED: Keywords for Post-op & Heavy duty
    matchKeywords: [
        'strong jet', 'post operative', 'crusts', 'nasal hygiene', 'physiomer',
        'فيزيومير', 'تدفق قوي', 'غسيل أنف', 'قشور', 'بعد العمليات', 'تنظيف عميق'
    ],
    usage: 'غسول ماء بحر (تدفق قوي جداً - Strong Jet) لإزالة القشور والإفرازات الكثيفة.',
    timing: '١–٢ مرة يومياً – ضمن خطة المتابعة',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => 'غسلة/دفعة قوية لكل فتحة أنف ١–٢ مرة يومياً – بدون اعتبار للأكل – ضمن خطة المتابعة',
    
    // UPDATED: Instructions strictly for older kids/adults
    
    // ADDED: Post-operative warnings
    warnings: [
      ...W_SALINE_COMMON,
      ...W_JET_STRONG_EXTRA,
      'قوة الدفع عالية جداً (Strong Jet)؛ أقل من ١٠ سنوات غير مناسب. بعد الجراحات يُستخدم فقط ضمن خطة المتابعة.'
    ]
  },

// 20. Sinomarin Children
  {
    id: 'sinomarin-children-100',
    name: 'Sinomarin children nasal spray 100ml',
    genericName: 'Sodium chloride ~2.3% (hypertonic saline / seawater)',
    concentration: '2.3% (Hypertonic)',
    price: 300, // UPDATED: Price as per request
    // UPDATED: Keywords for Sinomarin Brand
    matchKeywords: [
        'sinomarin', 'hypertonic', 'blocked nose', 'congestion', 'sea water', 'mucus',
        'سينومارين', 'ماء بحر مركز', 'احتقان', 'انسداد', 'أطفال', 'طبيعي', 'مذيب مخاط'
    ],
    usage: 'بخاخ ماء بحر "مركز" (Hypertonic) لفك انسداد الأنف وإذابة المخاط للأطفال.',
    timing: '٢–٣ مرات يومياً – أثناء دور البرد',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 7,
    maxWeight: 50,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف ٢–٣ مرات يومياً – بدون اعتبار للأكل – أثناء الاحتقان',
    
    // UPDATED: Usage instructions for children
    
    // ADDED: Hypertonic specific warnings
    warnings: [
      ...W_SALINE_COMMON,
      ...W_HYPERTONIC_EXTRA,
      'الرضع أقل من سنة أو وجود مشاكل بالأذن/الأنف: يُفضّل تقييم السبب قبل الاستخدام.'
    ]
  },

// 64. Sinomarin Cold & Flu
  {
    id: 'sinomarin-cold-flu-30',
    name: 'Sinomarin cold & flu nasal spray 30ml',
    genericName: 'Hypertonic Seawater + Eucalyptus + Thyme',
    concentration: 'Hypertonic + Essential Oils',
    price: 115, // UPDATED: Price as per request
    // UPDATED: Keywords for Flu Relief
    matchKeywords: [
        'cold and flu', 'sinomarin', 'eucalyptus', 'thyme', 'congestion', 'runny nose',
        'سينومارين', 'برد وانفلونزا', 'زيت كافور', 'زعتر', 'احتقان', 'جيوب أنفية', 'زكام'
    ],
    usage: 'بخاخ ماء بحر مركز مدعم بزيوت طبيعية (لعلاج أعراض البرد والانفلونزا والزكام).',
    timing: '٢–٣ مرات يومياً – للحالات الحادة',
    category: Category.SALINE,
    form: 'Nasal Spray',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_weight, _ageMonths) => '١–٢ بخة في كل فتحة أنف ٢–٣ مرات يومياً – بدون اعتبار للأكل – أثناء الأعراض',
    
    // UPDATED: Instructions for acute cases
    
    // ADDED: Essential Oils Warnings
    warnings: [
      ...W_SALINE_COMMON,
      ...W_ESSENTIAL_OILS_EXTRA,
      'الحمل/الرضاعة: يفضّل تجنّبه لعدم كفاية البيانات واحتوائه على زيوت طيارة.',
      'أقل من ٦ سنوات: غير مناسب.'
    ]
  },




];

export const NASAL_DECONGESTANTS: Medication[] = RAW_NASAL_DECONGESTANTS.map((m) => ({
  ...m,
  usage: sanitizeText(m.usage),
  timing: sanitizeText(m.timing),
  warnings: m.warnings?.map(sanitizeText),
  calculationRule: wrapRule(m.calculationRule),
}));
