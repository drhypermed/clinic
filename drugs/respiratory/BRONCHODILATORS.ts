
import { Medication, Category } from '../../types';

const normalizeSpaces = (input: string) =>
    (input || '')
        .replace(/\s+/g, ' ')
        .replace(/\s+([،.؛:!؟)\]])/g, '$1')
        .replace(/([(\[])\s+/g, '$1')
        .replace(/\(\s*\)/g, '')
        .trim();

const stripDoctorPhrases = (input: string) => {
    let text = input || '';
    const patterns: RegExp[] = [
        /\(\s*حسب\s+الطبيب\s*\)/g,
        /\(\s*أو\s+حسب\s+الطبيب\s*\)/g,
        /\(\s*بوصفة\s+طبيب\s*\)/g,
        /حسب\s+(تعليمات|إرشادات|توجيهات)\s+الطبيب/g,
        /بعد\s+استشارة\s+الطبيب/g,
        /استشارة\s+طبيب/g,
        /استشر\s+الطبيب/g,
        /راجع\s+الطبيب/g,
        /بوصفة\s+طبيب/g,
        /تحت\s+إشراف\s+الطبيب/g,
        /تحت\s+إشراف\s+طبي/g,
        /بتوجيه\s+طبي/g,
        /حسب\s+الطبيب/g,
    ];
    for (const p of patterns) text = text.replace(p, '');
    return normalizeSpaces(text);
};

const sanitizeText = (input: string) => {
    let raw = input || '';

    raw = raw
        .replace(/\(\s*(?:أو\s+)?حسب\s+الطبيب\s*\)/g, '(وقد تُعدل حسب التقييم)')
        .replace(/\(\s*بوصفة\s+طبيب\s*\)/g, '')
        .replace(/إلا\s+تحت\s+إشراف\s+(?:طبي|الطبيب|استشاري)[^.،؛]*/g, 'وقد يلزم تقييم متخصص')
        .replace(/تحت\s+إشراف\s+(?:طبي|الطبيب|استشاري)[^.،؛]*/g, 'قد يلزم تقييم متخصص')
        .replace(/بعد\s+استشارة\s+الطبيب/g, 'بعد التقييم')
        .replace(/استشارة\s+طبيب/g, 'تقييم')
        .replace(/استشر\s+الطبيب/g, 'قد يلزم تقييم')
        .replace(/راجع\s+الطبيب\s+فوراً/g, 'يستلزم تقييماً عاجلاً')
        .replace(/راجع\s+الطبيب/g, 'قد يلزم تقييم')
        .replace(/(?:أو\s+)?حسب\s+(تعليمات|إرشادات|توجيهات)\s+الطبيب/g, '')
        .replace(/حسب\s+الطبيب/g, '');

    let text = stripDoctorPhrases(raw);

    text = text
        .replace(/\bلا\s+تتجاوز\b/g, 'الحد الأعلى')
        .replace(/\bممنوع\b/g, 'غير مناسب')
        .replace(/\bيُمنع\b/g, 'غير مناسب')
        .replace(/\bتوقف\s+عن\s+الاستخدام\b/g, 'الإيقاف')
        .replace(/\bتوقف\b/g, 'الإيقاف')
        .replace(/\bاطلب\s+طبيباً\b/g, 'يستلزم تقييماً')
        .replace(/\bلا\s+تغيّر\s+الجرعة\s+من\s+نفسك\b/g, 'تغيير الجرعة يستلزم تقييماً')
        .replace(/\bيجب\s+تحديد\s+الجرعة\s+بدقة\s+من\s+قبل\s+الطبيب\b/g, 'الجرعة تحتاج تحديداً دقيقاً')
        .replace(/\bلو\s+بتدخن\b/g, 'التدخين قد يقلل الفاعلية')
        .replace(/\bلازم\s+تبلغ\b/g, 'قد يلزم إبلاغ مقدم الرعاية');

    return normalizeSpaces(text);
};

const wrapRule = (rule?: Medication['calculationRule']): Medication['calculationRule'] | undefined => {
    if (!rule) return rule;
    return (weight, ageMonths) => sanitizeText(rule(weight, ageMonths));
};

const buildWarnings = (...parts: Array<string | string[] | undefined | null>) => {
    const out: string[] = [];
    for (const part of parts) {
        if (!part) continue;
        if (Array.isArray(part)) out.push(...part);
        else out.push(part);
    }
    return out.map(sanitizeText).filter(Boolean);
};

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    usage: m.usage ? sanitizeText(m.usage) : m.usage,
    timing: m.timing ? sanitizeText(m.timing) : m.timing,
    warnings: m.warnings ? buildWarnings(m.warnings) : m.warnings,
    calculationRule: wrapRule(m.calculationRule),
});

const RAW_BRONCHODILATORS: Medication[] = [
    // ==========================================
    // BRONCHODILATORS & RESPIRATORY CONTROLLERS
    // ==========================================

  // 1. Vental Compositum Spray
  {
    id: 'vental-compositum-inhaler',
    name: 'Vental Compositum 200 Doses Inhaler',
    genericName: 'Salbutamol + Beclomethasone Dipropionate',
    concentration: '100mcg + 50mcg / Dose',
    price: 80, 
    matchKeywords: [
        'asthma', 'bronchitis', 'wheezing', 'shortness of breath', 'inhaler', 'vental', 'compositum', 'blue and brown',
        'حساسية صدر', 'ربو', 'ضيق تنفس', 'بخاخة', 'فنتال', 'كومبوزيتوم', 'موسع شعب', 'كورتيزون للصدر'
    ],
    usage: 'علاج وقائي وموسع للشعب الهوائية؛ بيجمع بين مادة سريعة المفعول لتوسيع الشعب ومادة كورتيزون لتقليل الالتهاب داخل الرئة.',
    timing: 'كل ٦–٨ ساعات – علاج مستمر',
    category: Category.BRONCHODILATOR, // تأكد من وجود هذا التصنيف عندك
    form: 'Inhaler',
    
    // SAFETY: Generally prescribed by specialists for specific ages.
    minAgeMonths: 48, // غالباً لا يفضل تحت ٤ سنين؛ إن لزم فبجرعة صريحة حسب الوزن مع متابعة
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'يحتاج تقييماً متخصصاً؛ غالباً ما تستخدم الأقماع (Spacer) في هذا السن – بدون اعتبار للأكل – لمدة طويلة كعلاج وقائي';
        }
        if (ageMonths < 144) { // 4 to 12 years
            return 'بخة واحدة بالاستنشاق ٣–٤ مرات يومياً – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        // Adults and > 12 years
        return 'بختين بالاستنشاق ٣–٤ مرات يومياً (جرعة قصوى) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'يستخدم بانتظام وليس عند اللزوم فقط للحصول على أفضل نتيجة وقائية.',
        'قد يسبب رعشة بسيطة في اليد أو تسارع في ضربات القلب (مؤقت).',
        'ممنوع التوقف المفاجئ عن الدواء إذا كنت تستخدمه لفترات طويلة.',
        'يستخدم بحذر لمرضى القلب والضغط المرتفع ونشاط الغدة الدرقية.',
        'إذا زاد استخدام بخاخ الإسعاف >٢ مرات/أسبوع أو تفاقمت الأعراض: أعد التقييم وعدّل الخطة (زيادة الستيرويد المستنشق أو مراجعة التقنية).'
    ]
  },

    // 2. Flix Nasal Spray
  {
    id: 'flix-nasal-spray',
    name: 'Flix Nasal Spray 50mcg',
    genericName: 'Fluticasone Propionate',
    concentration: '50mcg/dose',
    price: 76, 
    matchKeywords: [
        'allergy', 'nasal spray', 'rhinitis', 'congestion', 'fluticasone', 'flix', 'corticosteroid',
        'حساسية الأنف', 'بخاخة أنف', 'فليكس', 'رشح', 'انسداد الأنف', 'التهاب الجيوب الأنفية', 'كورتيزون أنف'
    ],
    usage: 'بخاخة كورتيزون موضعي قوية لعلاج التهاب وحساسية الأنف المزمنة والموسمية، بتقلل التورم والرشح والهرش في الأنف.',
    timing: 'مرة يومياً صباحاً – علاج مستمر',
    category: Category.NASAL_ANTI_ALLERGY, // <--- (Change this to your specific category variable)
    form: 'Nasal Spray',
    
    // SAFETY: Not recommended for children under 4 years without specialist advice.
    minAgeMonths: 48, // 4 Years
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'للأطفال أقل من ٤ سنوات: بخة واحدة في كل فتحة أنف مرة يومياً – بدون اعتبار للأكل – علاج مستمر؛ راقب الرعاف.';
        }
        if (ageMonths < 144) {
            return 'بخة واحدة في كل فتحة أنف مرة يومياً – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        return 'بختين في كل فتحة أنف مرة يومياً (تُقلَّل لبخة عند التحسن) – بدون اعتبار للأكل – علاج مستمر';
    },
    
    
    warnings: [
        'المفعول الكامل يظهر بعد ٢-٣ أيام من الاستخدام المستمر وليس فورياً.',
        'يجب تنظيف فتحة البخاخة بانتظام بقطعة قماش جافة.',
        'لا تستخدم البخاخة إذا كان هناك جروح أو عمليات حديثة في الأنف.',
        'نزيف متكرر من الأنف (رعاف): أوقف مؤقتاً، تحقق ضغط الدم/مميعات؛ إن استمر أعد التقييم.'
    ]
  },

  // 3. Quibron T/SR 300mg (100 Tabs)
  
  {
    id: 'quibron-t-sr-300',
    name: 'Quibron T/SR 300mg 100 Tabs',
    genericName: 'Theophylline',
    concentration: '300mg',
    price: 132, 
    matchKeywords: [
        'asthma', 'COPD', 'bronchodilator', 'theophylline', 'quibron', 'breathing', 'sustained release',
        'حساسية صدر', 'سدة رئوية', 'ضيق تنفس', 'موسع شعب', 'ثيوفيللين', 'كيبرون', 'كويبرون', 'أقراص ممتدة المفعول'
    ],
    usage: 'موسع للشعب الهوائية ممتد المفعول، يستخدم للسيطرة على الأزمات الصدرية المزمنة وتحسين عملية التنفس على مدار اليوم.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Tablets',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'أقراص SR لا تناسب الأطفال أقل من ١٢ سنة؛ استخدم الأشربة أو يحتاج تقييماً متخصصاً';
        }
        return 'قرص واحد (٣٠٠ مجم) كل ١٢ ساعة – بعد الأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'الحمل (C): يُستخدم عند الضرورة فقط؛ راقب مستوى الثيوفيللين إن أمكن.',
        'الدواء له مجال علاجي ضيق (Narrow therapeutic index): لا تغيّر الجرعة من نفسك.',
        'يجب تقليل تناول الكافيين (قهوة، شاي، كولا) لأنه يزيد من الآثار الجانبية.',
        'التدخين يقلل من مفعول الدواء؛ راجع الجرعة مع التدخين.',
        'أوقف فوراً عند: ضربات قلب سريعة/غير منتظمة، غثيان/قيء مستمر، صداع شديد، أرق، تشنجات؛ أعد التقييم وقِس مستوى الثيوفيللين (المستوى العلاجي ١٠–٢٠ ميكروجرام/مل).',
        'تداخلات مهمة: ماكروليدات (إريثرومايسين/كلاريثرومايسين) وكينولونات (سيبرو/ليفوفلوكساسين) وسيميتيدين قد ترفع مستواه بشكل خطير وتسبب سمية.'
    ]
  },
  // 4. Quibron T/SR 300mg (20 Tabs)
  {
    id: 'quibron-t-sr-20-tabs',
    name: 'Quibron T/SR 300mg 20 Tabs',
    genericName: 'Theophylline',
    concentration: '300mg',
    price: 26, 
    matchKeywords: [
        'asthma', 'COPD', 'bronchodilator', 'theophylline', 'quibron', 'breathing', 'sustained release',
        'حساسية صدر', 'سدة رئوية', 'ضيق تنفس', 'موسع شعب', 'ثيوفيللين', 'كيبرون', 'كويبرون'
    ],
    usage: 'موسع شعب ممتد المفعول لعلاج حالات حساسية الصدر والسدة الرئوية المزمنة.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Tablets',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يناسب الأطفال أقل من ١٢ سنة';
        }
        return 'قرص واحد (٣٠٠ مجم) كل ١٢ ساعة – بعد الأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'الحمل (C): يُستخدم عند الضرورة فقط؛ راقب مستوى الثيوفيللين إن أمكن.',
        'الدواء له مجال علاجي ضيق (Narrow therapeutic index): لا تغيّر الجرعة من نفسك.',
        'قلل الكافيين (قهوة وشاي) لتقليل ضربات القلب والرعشة.',
        'ممنوع كسر/طحن/مضغ القرص (SR) نهائياً.',
        'لو بتدخن لازم تبلغ الطبيب لتعديل الجرعة.',
        'راجع الصيدلي قبل دمج أي مضاد حيوي/دواء جديد (قد يرفع مستوى الثيوفيللين ويسبب سمية).' 
    ]
  },

  // 5. Budelizer 400 Inhalation Capsules
  {
    id: 'budelizer-400-inh-caps',
    name: 'Budelizer 400mcg 60 Inh. Caps + Device',
    genericName: 'Budesonide',
    concentration: '400mcg',
    price: 255, 
    matchKeywords: [
        'asthma', 'budesonide', 'budelizer', 'capsules', 'inhaler', 'preventive', 'steroid', 'inflammation',
        'حساسية صدر', 'بوديليزير', 'بوديسونيد', 'كبسولات استنشاق', 'بخاخة', 'وقائي', 'التهاب الشعب'
    ],
    usage: 'بوديزونيد كورتيزون استنشاق وقائي (Controller) يقلل التهاب الشعب ويقلل تكرار نوبات النهجان؛ ليس موسع شعب إسعافي.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يناسب الأطفال أقل من ٦ سنوات؛ يحتاج مهارة في استخدام جهاز الاستنشاق';
        }
        if (ageMonths < 144) {
            return 'كبسولة واحدة بالاستنشاق كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        return '١–٢ كبسولة بالاستنشاق كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'الدواء وقائي ولا يستخدم لفك أزمة التنفس المفاجئة (مش طوارئ).',
        'المضمضة بعد الاستخدام ضرورية جدا لمنع ظهور فطريات في الفم.',
        'ممنوع بلع الكبسولات نهائيا.',
        'يجب تنظيف جهاز الاستنشاق بانتظام لضمان خروج الجرعة كاملة.',
        'الحمل/الرضاعة: عادة آمن بالجرعات الاستنشاقية؛ يُستخدم عند الضرورة فقط.'
    ]
  },

  // 6. Farcolin Respirator Solution
  {
    id: 'farcolin-respirator-soln',
    name: 'Farcolin Respirator 0.5% Soln. 20ml',
    genericName: 'Salbutamol',
    concentration: '0.5% (5mg/ml)',
    price: 37, 
    matchKeywords: [
        'asthma', 'salbutamol', 'farcolin', 'nebulizer', 'bronchodilator', 'emergency', 'wheezing',
        'فاركولين', 'سالبيوتامول', 'محلول جلسات', 'جهاز نيبوليزر', 'موسع شعب', 'ضيق تنفس', 'طوارئ'
    ],
    usage: 'موسع شعب هوائية سريع المفعول، يستخدم في جلسات الاستنشاق (النيبوليزر) لعلاج الأزمات الحادة وضيق التنفس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Ampoules',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (weight < 5) {
            return '٠.٢٥ مل (١.٢٥ مجم) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        if (weight < 10) {
            return '٠.٢٥ مل (١.٢٥ مجم) + ٢–٣ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        if (weight < 20) {
            return '٠.٥ مل (٢.٥ مجم) + ٢–٣ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        return '٠.٥–١ مل (٢.٥–٥ مجم) + ٢–٣ مل محلول ملح بالنبيولايزر كل ٤–٦ ساعات حسب الحاجة';
    },
    
    
    warnings: [
        'ممنوع الشرب أو الحقن؛ المحلول مخصص لجهاز التنفس فقط.',
        'قد يسبب رعشة مؤقتة في اليد أو تسارع في ضربات القلب.',
        'يستخدم بحذر شديد لمرضى القلب والضغط المرتفع والسكري.',
                'إذا احتاج الجلسات أكثر من مرة كل ٤ ساعات أو لم يحدث تحسن: راجع الطوارئ فوراً.'
    ]
  },

  // 7. Ticanase Nasal Spray
  {
    id: 'ticanase-nasal-spray',
    name: 'Ticanase 0.05% Nasal Spray 12gm',
    genericName: 'Fluticasone Propionate',
    concentration: '0.05% (50mcg/dose)',
    price: 70, 
    matchKeywords: [
        'allergy', 'nasal spray', 'rhinitis', 'ticanase', 'fluticasone', 'congestion',
        'تيكاناز', 'حساسية الأنف', 'بخاخة أنف', 'فلوتيكازون', 'رشح', 'انسداد الأنف', 'جيوب أنفية'
    ],
    usage: 'بخاخة لعلاج التهابات وحساسية الأنف المزمنة وتقليل التورم والرشح.',
    timing: 'مرة يومياً صباحاً – علاج مستمر',
    category: Category.NASAL_ANTI_ALLERGY,
    form: 'Nasal Spray',

    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'يحتاج تقييماً متخصصاً للأطفال أقل من ٤ سنوات';
        }
        if (ageMonths < 144) {
            return 'بخة واحدة في كل فتحة أنف مرة يومياً صباحاً – بدون اعتبار للأكل – علاج مستمر';
        }
        return 'بختين في كل فتحة أنف مرة يومياً (أو بخة مرتين يومياً) – بدون اعتبار للأكل – علاج مستمر';
    },
    
    
    warnings: [
        'المفعول يبدأ في الظهور بعد ٢-٣ أيام من الاستخدام المنتظم.',
        'ممنوع استخدامها لو فيه جروح أو عمليات حديثة في الأنف.',
        'يجب تنظيف رأس البخاخة بانتظام بالماء الدافئ.',
        'التزم بالجرعة المحددة لتجنب حدوث نزيف بسيط من الأنف.'
    ]
  },

  // 8. Ventolin Syrup
 
  {
    id: 'ventolin-syrup-125',
    name: 'Ventolin 2mg/5ml Syrup 125ml',
    genericName: 'Salbutamol',
    concentration: '2mg/5ml',
    price: 24, 
    matchKeywords: [
        'asthma', 'bronchodilator', 'salbutamol', 'ventolin', 'wheezing', 'cough', 'breathing difficulty', 'bronchospasm',
        'فنتولين', 'سالبيوتامول', 'موسع شعب', 'تزييق الصدر', 'نهجان', 'كحة', 'ربو', 'ضيق تنفس', 'أزمة صدرية'
    ],
    usage: 'موسع شعب هوائية سريع المفعول، يستخدم لعلاج نوبات السعال وتزييق الصدر وضيق التنفس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Syrup',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return '٠.١ مجم/كجم/جرعة (٠.٢٥ مل/كجم) شراب فموي كل ٦–٨ ساعات حسب الحاجة';
        }
        if (ageMonths < 72) {
            return '٢.٥ مل (١ مجم) شراب فموي ٣ مرات يومياً (يمكن رفعها لـ ٥ مل عند اللزوم) – بدون اعتبار للأكل';
        }
        if (ageMonths < 144) {
            return '٥ مل (٢ مجم) شراب فموي ٣–٤ مرات يومياً – بدون اعتبار للأكل';
        }
        return '٥–١٠ مل (٢–٤ مجم) شراب فموي ٣–٤ مرات يومياً (حد أقصى ٢٠ مل ٤ مرات/يوم) – بدون اعتبار للأكل';
    },


    warnings: [
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط.',
        'قد يسبب رعشة في اليدين أو تسارع في نبضات القلب (مؤقت).',
        'يستخدم بحذر مع مرضى القلب/الضغط واضطراب الغدة الدرقية والسكري.',
        'إذا زادت الخفقان/الرعشة أو احتجت جرعات متقاربة: أعد التقييم، قلّل الجرعة أو غيّر المستحضر.'
    ]
  },

// 9. Forbudes 400 Inhaler
  {
    id: 'forbudes-400-part2',
    name: 'Forbudes 400/12mcg 60 inhalation caps.+inhaler',
    genericName: 'Budesonide + Formoterol',
    concentration: '400/12mcg',
    price: 334, 
    // UPDATED: Added keywords for Asthma and COPD
    matchKeywords: [
        'asthma', 'COPD', 'chronic bronchitis', 'emphysema', 
        'shortness of breath', 'dyspnea', 'chest tightness', 
        'حساسية صدر', 'ربو', 'سدة رئوية', 'نهجان', 'كتمة', 'ضيق تنفس'
    ], 
    usage: 'علاج وقائي وموسع للشعب (للسدة الرئوية والربو).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'للأطفال ٤–١١ سنة: يُفضّل تركيز ٢٠٠/٦؛ بختين مرتين. ١٢+ والبالغين: كبسولة واحدة (٤٠٠/١٢) كل ١٢ ساعة';
        }
        return 'كبسولة واحدة بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },

    // TRANSLATED: Warnings in Arabic for patient clarity
    warnings: [
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.', 
        'الكبسولات للشفط فقط بواسطة الجهاز وليست للبلع.',
        'لا يُستخدم لفك الأزمة الحادة؛ هو علاج وقائي/متحكم.',
        'يستخدم بحذر مع مرضى اضطراب ضربات القلب أو زيادة نشاط الغدة الدرقية.'
    ]
  },

  // 10. Nasoflutin Spray
  {
    id: 'nasoflutin-nasal-spray',
    name: 'Nasoflutin 120 Doses Nasal Spray',
    genericName: 'Fluticasone Propionate',
    concentration: '50mcg/dose',
    price: 90, 
    matchKeywords: [
        'allergy', 'nasal spray', 'rhinitis', 'nasoflutin', 'fluticasone', 'congestion',
        'نازوفلوتين', 'حساسية الأنف', 'بخاخة أنف', 'التهاب الجيوب الأنفية', 'رشح', 'زكام'
    ],
    usage: 'بخاخة كورتيزون موضعي لعلاج أعراض حساسية الأنف المزمنة والتهابات الجيوب الأنفية.',
    timing: 'مرة يومياً صباحاً – علاج مستمر',
    category: Category.NASAL_ANTI_ALLERGY,
    form: 'Nasal Spray',

    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'يحتاج تقييماً متخصصاً للأطفال أقل من ٤ سنوات';
        }
        if (ageMonths < 144) {
            return 'بخة واحدة في كل فتحة أنف مرة يومياً – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        return 'بختين في كل فتحة أنف مرة يومياً (تُقلَّل لبخة عند التحسن) – بدون اعتبار للأكل – علاج مستمر';
    },
    
    
    warnings: [
        'لا تتوقع نتيجة فورية، المفعول الحقيقي يبدأ بعد ٢-٣ أيام.',
        'يجب تنظيف رأس البخاخة وتجفيفها بعد كل استخدام.',
        'راجع في التقييم (قرح أنف/جراحة حديثة).',
        'توقف عن الاستخدام إذا ظهر نزيف متكرر من الأنف.'
    ]
  },

// 11. Pulmicort 0.25
  {
    id: 'pulmicort-0.25-neb-part2',
    name: 'Pulmicort 0.25mg/ml 20 nebulizer vial susp.',
    genericName: 'Budesonide',
    concentration: '0.25mg/ml',
    price: 564, 
    matchKeywords: [
        'croup', 'laryngitis', 'barking cough', 'stridor', 'asthma prophylaxis',
        'كحة نباحية', 'التهاب الحنجرة', 'اختناق', 'حساسية صدر', 'صوت مبحوح'
    ],
    usage: 'جلسات استنشاق كورتيزون (للحساسية والتهاب الحنجرة "الخناق").',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Vial',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 200,

    calculationRule: (_w: number, a: number) => {
        if (a < 12) return '١ مل (نصف أمبول = ٠.٢٥ مجم) + ٢ مل محلول ملح بالنبيولايزر كل ١٢ ساعة';
        if (a < 72) return '٢ مل (أمبول كامل = ٠.٥ مجم) + ٢ مل محلول ملح بالنبيولايزر كل ١٢ ساعة';
        return '٢ مل (أمبول كامل = ٠.٥ مجم) + ١–٢ مل محلول ملح بالنبيولايزر كل ١٢ ساعة';
    },

    warnings: [
        'الحمل/الرضاعة: عادة آمن بالجرعات الاستنشاقية؛ يُستخدم عند الضرورة فقط.',
        'يجب غسل وجه الطفل جيداً بالماء والمضمضة بعد الجلسة لتجنب التهيجات والفطريات.',
        'يخلط مع محلول الملح لزيادة كمية البخار ولضمان وصول الجرعة كاملة.'
    ]
  },

 // 12. Pulmicort 0.5
  {
    id: 'pulmicort-0.5-neb-part2',
    name: 'Pulmicort 0.5mg/ml 20 nebulizer vial susp.',
    genericName: 'Budesonide',
    concentration: '0.5mg/ml',
    price: 752, 
    // UPDATED: Keywords for severe cases/Croup
    matchKeywords: [
        'severe croup', 'acute asthma exacerbation', 'stridor', 'laryngitis',
        'خناق', 'كحة نباحية', 'حساسية صدر شديدة', 'ضيق تنفس حاد'
    ],
    usage: 'جلسات استنشاق كورتيزون (تركيز عالي للحالات الشديدة).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Ampoules',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 200,

    calculationRule: (_w: number, a: number) => {
        if (a < 12) return '١ مل (نصف أمبول = ٠.٥ مجم) + ٢ مل محلول ملح بالنبيولايزر كل ١٢ ساعة (يُفضّل تركيز ٠.٢٥ للرضع)';
        if (a < 72) return '١–٢ مل (٠.٥–١ مجم) + ٢ مل محلول ملح بالنبيولايزر كل ١٢ ساعة';
        return '٢ مل (أمبول كامل = ١ مجم) + ١–٢ مل محلول ملح بالنبيولايزر كل ١٢ ساعة';
    },
    
    // TRANSLATED & UPDATED: Consistent safety warnings
    warnings: [
        'الحمل/الرضاعة: عادة آمن بالجرعات الاستنشاقية؛ يُستخدم عند الضرورة فقط.',
        'يجب غسل وجه الطفل جيداً بالماء والمضمضة بعد الجلسة لتجنب التهيجات والفطريات.',
        'يخلط مع محلول الملح لزيادة كمية البخار ولضمان وصول الجرعة كاملة.'
    ]
  },

  // 13. Salbovent Syrup
  {
    id: 'salbovent-syrup-120',
    name: 'Salbovent 2mg/5ml Syrup 120ml',
    genericName: 'Salbutamol',
    concentration: '2mg/5ml',
    price: 24, 
    matchKeywords: [
        'asthma', 'bronchodilator', 'salbutamol', 'salbovent', 'wheezing', 'cough', 'breathing', 'bronchospasm',
        'سالبوفينت', 'سالبيوتامول', 'موسع شعب', 'تزييق الصدر', 'نهجان', 'كحة', 'ربو', 'ضيق تنفس', 'أزمة صدرية'
    ],
    usage: 'موسع شعب هوائية سريع المفعول، يستخدم لعلاج حالات الكحة المصحوبة بتزييق في الصدر وضيق التنفس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Syrup',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return '٠.١ مجم/كجم/جرعة (٠.٢٥ مل/كجم) شراب فموي كل ٦–٨ ساعات حسب الحاجة';
        }
        if (ageMonths < 72) {
            return '٢.٥ مل (١ مجم) شراب فموي ٣ مرات يومياً (يمكن رفعها لـ ٥ مل عند اللزوم) – بدون اعتبار للأكل';
        }
        if (ageMonths < 144) {
            return '٥ مل (٢ مجم) شراب فموي ٣–٤ مرات يومياً – بدون اعتبار للأكل';
        }
        return '٥–١٠ مل (٢–٤ مجم) شراب فموي ٣–٤ مرات يومياً (حد أقصى ٢٠ مل ٤ مرات/يوم) – بدون اعتبار للأكل';
    },


    warnings: [
        'لكبار السن: يجب البدء بأقل جرعة ممكنة.',
        'قد يسبب رعشة بسيطة أو تسارع في ضربات القلب لفترة مؤقتة.',
        'يستخدم بحذر مع مرضى الضغط والقلب والسكر واضطراب الغدة الدرقية.',
        'لا يستخدم للوقاية الطويلة، هو فقط لعلاج الأزمات الحادة والكحة الشديدة.',
        'قد يسبب نقص بوتاسيوم مع الجرعات العالية أو الاستخدام الطويل.'
    ]
  },
  // 14. Vental Inhaler
  {
    id: 'vental-inhaler-200',
    name: 'Vental Inhaler 100mcg 200 Doses',
    genericName: 'Salbutamol', // [GREEN] Pure Salbutamol
    concentration: '100mcg/dose',
    price: 72, 
    matchKeywords: [
        'asthma', 'salbutamol', 'vental', 'blue inhaler', 'reliever', 'shortness of breath', 'wheezing',
        'فنتال', 'بخاخة زرقاء', 'سالبيوتامول', 'موسع شعب', 'ضيق تنفس', 'طوارئ', 'تزييق الصدر'
    ],
    usage: 'موسع شعب هوائية سريع المفعول يستخدم عند اللزوم لفك أزمات ضيق التنفس الحادة وتزييق الصدر.',
    timing: 'كل ٤–٦ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Inhaler',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'بخة واحدة بالاستنشاق عبر القمع (Spacer) كل ٤–٦ ساعات حسب الحاجة';
        }
        if (ageMonths < 144) {
            return 'بخة واحدة (يمكن زيادتها لبختين) بالاستنشاق عبر القمع (Spacer) كل ٤–٦ ساعات حسب الحاجة';
        }
        return 'بخّتين بالاستنشاق كل ٤–٦ ساعات عند الحاجة (حد أقصى ٨ بخات/يوم)';
    },
    
    
    warnings: [
        'الدواء للطوارئ فقط (Reliever) ولا يغني عن البخاخات الوقائية التي تحتوي على كورتيزون.',
        'قد يسبب تسارع في ضربات القلب أو رعشة بسيطة في اليدين تختفي بعد فترة.',
        'إذا لم تتحسّن الحالة بعد بختين أو زاد الاحتياج عن ٤ مرات يومياً: أعد التقييم وعدّل الخطة (إضافة/زيادة الستيرويد المستنشق).',
        'يجب غسل غطاء البخاخة البلاستيكي بالماء الدافئ وتجفيفه أسبوعيا لمنع الانسداد.'
    ]
  },

  // 15. Swabivent Nebulizer
  {
    id: 'swabivent-nebulizer-amp',
    name: 'Swabivent Nebulizer Soln. 20 Amp. 2.5ml',
    genericName: 'Ipratropium Bromide + Salbutamol',
    concentration: '0.5mg + 2.5mg / 2.5ml',
    price: 176, 
    matchKeywords: [
        'asthma', 'COPD', 'nebulizer', 'swabivent', 'combivent', 'bronchodilator', 'ipratropium', 'salbutamol',
        'سوابيفينت', 'كومبيفينت', 'محلول جلسات', 'موسع شعب ثنائي', 'ضيق تنفس حاد', 'سدة رئوية'
    ],
    usage: 'موسع شعب هوائية ثنائي المفعول لجلسات الاستنشاق، بيجمع بين مادتين لفتح الشعب الهوائية بسرعة وقوة أكبر.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Solution',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'نصف–أمبول كامل (١.٢٥–٢.٥ مل) بالنبيولايزر كل ٦–٨ ساعات حسب الوزن والحاجة';
        }
        return 'أمبول واحد (٢.٥ مل) بالنبيولايزر كل ٦–٨ ساعات (٣–٤ مرات يومياً) حسب الحاجة';
    },
    
    
    warnings: [
        'مخصص للاستنشاق فقط وممنوع الشرب أو الحقن تماماً.',
        'قد يسبب جفاف في الفم، زغللة بسيطة، أو تسارع في ضربات القلب.',
        'يستخدم بحذر شديد لمرضى القلب، المياه الزرقاء على العين (الجلوكوما)، وبروستاتا المسنين.',
        'يجب غسل الوجه جيداً بعد الجلسة لتجنب ملامسة الرذاذ للعين.',
        'للأطفال أقل من ١٢ سنة: نصف أمبول (١.٢٥ مل) إلى أمبول كامل في الجلسة حسب الوزن؛ ٢–٣ مرات يومياً.'
    ]
  },

  // 16. Salbovent Tabs
  {
    id: 'salbovent-2mg-30-tabs',
    name: 'Salbovent 2mg 30 Tabs',
    genericName: 'Salbutamol',
    concentration: '2mg',
    price: 24, 
    matchKeywords: [
        'asthma', 'bronchodilator', 'salbutamol', 'salbovent', 'wheezing', 'cough', 'breathing',
        'سالبوفينت', 'سالبوفنت أقراص', 'سالبيوتامول', 'موسع شعب', 'تزييق الصدر', 'نهجان', 'كحة'
    ],
    usage: 'موسع شعب هوائية سريع المفعول لعلاج حالات ضيق التنفس والكحة المصحوبة بتزييق الصدر.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Tablets',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'لا تناسب الأقراص أقل من سنتين؛ استخدم الشراب';
        }
        if (ageMonths < 72) {
            return 'نصف قرص (١ مجم) ٣ مرات يومياً – بدون اعتبار للأكل – حسب الحاجة';
        }
        if (ageMonths < 144) {
            return 'قرص واحد (٢ مجم) ٣–٤ مرات يومياً – بدون اعتبار للأكل – حسب الحاجة';
        }
        return 'قرص–قرصين (٢–٤ مجم) ٣–٤ مرات يومياً – بدون اعتبار للأكل – حسب الحاجة';
    },
    
    
    warnings: [
        'كبار السن يجب أن يبدأوا بأقل جرعة (نصف قرص) لتجنب الآثار الجانبية.',
        'قد يسبب رعشة مؤقتة في اليدين أو تسارع في ضربات القلب.',
        'يستخدم بحذر مع مرضى الضغط المرتفع والقلب والسكر.',
        'لا يستخدم كعلاج وقائي وحيد في حالات الحساسية المزمنة.'
    ]
  },

  // 17. Seretide Diskus 500
  {
    id: 'seretide-diskus-500-part2',
    name: 'Seretide diskus 500/50mcg 60 doses',
    genericName: 'Salmeterol + Fluticasone',
    concentration: '500mcg / 50mcg',
    price: 411, 
    matchKeywords: [
        'severe asthma', 'COPD', 'chronic bronchitis', 'maintenance therapy',
        'حساسية صدر شديدة', 'سدة رئوية', 'ربو مزمن', 'وقاية', 'كتمة'
    ],
    usage: 'علاج وقائي قوي للربو والسدة الرئوية (بودرة شفط).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Powder (Diskus)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,

    calculationRule: (_) => 'استنشاق واحد كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Clarified the action "شفط بقوة"
    
    warnings: [
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'هذا الدواء وقائي فقط ولا يستخدم في نوبات الربو الحادة.',
        'الجهاز يحتوي على بودرة، يجب الشفط بقوة لضمان وصول الجرعة.',
        'في السدة الرئوية قد يزيد خطر الالتهاب الرئوي؛ حمى/بلغم متغير اللون: أعد التقييم (استبعاد ذات رئة، مضاد حيوي إن لزم).'
    ]
  },
 // 18. Symbicort 160 (120 doses)
  {
    id: 'symbicort-160-120-part2',
    name: 'Symbicort 160/4.5mcg/dose turbuhaler 120 doses',
    genericName: 'Budesonide + Formoterol',
    concentration: '160mcg / 4.5mcg',
    price: 432, 
    // UPDATED: Keywords including SMART therapy concept
    matchKeywords: [
        'asthma maintenance', 'COPD', 'SMART therapy', 'breathlessness',
        'حساسية صدر', 'سدة رئوية', 'ضيق تنفس', 'كتمة', 'وقاية وعلاج'
    ],
    usage: 'علاج وقائي وعلاجي للربو والسدة الرئوية (عبوة كبيرة).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Turbuhaler',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (_) => 'استنشاق واحد صباحاً ومساءً (في الحالات الشديدة استنشاقان × مرتين = ٤٠٠ ميكروجرام/يوم) – بدون اعتبار للأكل – علاج مستمر',
    
    // UPDATED: Turbuhaler specific technique instructions
    
    // TRANSLATED: Critical usage warnings
    warnings: [
        'يجب مضمضة الفم بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'يجب عدم الزفير (إخراج النفس) داخل الجهاز حتى لا تفسد الرطوبة البودرة.',
        'يجب سماع صوت "تكة" قبل كل جرعة للتأكد من تعبئة الجهاز.'
    ]
  },
  // 19. Foradil
  {
    id: 'foradil-12-part2',
    name: 'Foradil 12 mcg 60 caps.+inhaler',
    genericName: 'Formoterol',
    concentration: '12mcg',
    price: 560, 
    // UPDATED: Keywords for specific indications
    matchKeywords: [
        'long acting bronchodilator', 'COPD', 'exercise induced asthma', 
        'maintenance therapy', 'موسع شعب ممتد المفعول', 'وقاية', 'ضيق تنفس'
    ],
    usage: 'موسع للشعب ممتد المفعول (للوقاية والتحكم في الأعراض).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules', // Aerolizer device
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (١٢ ميكروجرام) بالاستنشاق كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Clarified device usage
    
    // TRANSLATED: Critical safety warnings
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط عن طريق الجهاز وليست للبلع.',
        'في الربو: لا يُستخدم منفرداً بدون كورتيزون مستنشق (خطر تفاقم الربو).',
        'قد يسبب رعشة بسيطة أو زيادة ضربات القلب في بداية الاستخدام.',
        'لا يستخدم لفك الأزمة الحادة (ليس إسعافي).' 
    ]
  },

  // 20. Inhalex
  {
    id: 'inhalex-18-part2',
    name: 'Inhalex 18mcg 30 inh. caps.+ inh. device',
    genericName: 'Tiotropium',
    concentration: '18mcg',
    price: 415, 
    // UPDATED: Keywords specific to COPD and maintenance
    matchKeywords: [
        'COPD', 'emphysema', 'chronic bronchitis', 'maintenance therapy',
        'سدة رئوية', 'انتفاخ الرئة', 'التهاب شعبي مزمن', 'نهجان مستمر'
    ],
    usage: 'موسع للشعب طويل المفعول (مرة واحدة يومياً لعلاج السدة الرئوية).',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (١٨ ميكروجرام) بالاستنشاق مرة يومياً في نفس الموعد – بدون اعتبار للأكل – علاج مستمر',
    
    // UPDATED: Emphasized timing consistency
    
    // TRANSLATED: Specific Anticholinergic warnings
    warnings: [
        'الدواء مخصص لعلاج السدة الرئوية (COPD) وليس لأزمات الربو الحادة.',
        'الكبسولات للاستنشاق فقط وليست للبلع.',
        'قد يسبب جفافاً في الفم (ينصح بشرب الماء)، ويستخدم بحذر مع مرضى المياه الزرقاء (Glaucoma) وتضخم البروستاتا.',
        'احتباس بول/ألم بالعين/زغللة شديدة: أوقف فوراً؛ أعد قياس ضغط العين واستبعاد زرق مغلق الزاوية.'
    ]
  },

 // 21. Seretide Diskus 250
  {
    id: 'seretide-diskus-250-part2',
    name: 'Seretide diskus 250/50mcg 60 doses',
    genericName: 'Salmeterol + Fluticasone',
    concentration: '250mcg / 50mcg',
    price: 335, 
    // UPDATED: Keywords for moderate-to-severe asthma
    matchKeywords: [
        'asthma control', 'moderate asthma', 'COPD', 'wheezing', 
        'حساسية صدر متوسطة', 'ربو', 'وقاية', 'كحة مزمنة', 'تزييق الصدر'
    ],
    usage: 'علاج وقائي للربو (تركيز متوسط).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Powder (Diskus)',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,

    calculationRule: (_) => 'استنشاق واحد صباحاً ومساءً (كل ١٢ ساعة) – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Emphasized forceful inhalation
    
    // ADDED: Standard warnings in Arabic
    warnings: [
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'هذا الدواء وقائي للاستخدام اليومي ولا يستخدم وقت الأزمة المفاجئة.',
        'يجب الشفط بقوة وعمق لأن الجهاز يحتوي على بودرة.'
    ]
  },

  /// 22. Symbicort 160 (60 doses)
  {
    id: 'symbicort-160-60-part2',
    name: 'Symbicort 160/4.5mcg/dose turbuhaler 60 doses',
    genericName: 'Budesonide + Formoterol',
    concentration: '160mcg / 4.5mcg',
    price: 335, 
    // UPDATED: Keywords match the 120-dose version
    matchKeywords: [
        'asthma maintenance', 'COPD', 'SMART therapy', 'breathlessness',
        'حساسية صدر', 'سدة رئوية', 'ضيق تنفس', 'كتمة', 'وقاية وعلاج'
    ],
    usage: 'علاج وقائي وعلاجي للربو والسدة الرئوية (عبوة صغيرة ٦٠ جرعة).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Turbuhaler',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (_) => 'استنشاق واحد صباحاً ومساءً (في الحالات الشديدة استنشاقان × مرتين = ٤٠٠ ميكروجرام/يوم) – بدون اعتبار للأكل – علاج مستمر',
    
    // UPDATED: Instructions for Turbuhaler mechanism
    
    // TRANSLATED: Consistent safety warnings
    warnings: [
        'يجب مضمضة الفم بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'يجب عدم الزفير (إخراج النفس) داخل الجهاز حتى لا تفسد الرطوبة البودرة.',
        'يجب سماع صوت "تكة" قبل كل جرعة للتأكد من تعبئة الجهاز.'
    ]
  },


  // 23. Foradil (30 caps)
  {
    id: 'foradil-12-30-part2', // UPDATED: Unique ID for the 30-cap pack
    name: 'Foradil 12 mcg 30 caps.+inhaler',
    genericName: 'Formoterol',
    concentration: '12mcg',
    price: 280, // Estimate (Approximate price for the smaller pack)
    matchKeywords: [
        'long acting bronchodilator', 'COPD', 'exercise induced asthma', 
        'maintenance therapy', 'موسع شعب ممتد المفعول', 'وقاية', 'ضيق تنفس'
    ],
    usage: 'موسع للشعب ممتد المفعول (عبوة صغيرة ٣٠ كبسولة).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (١٢ ميكروجرام) بالاستنشاق كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Terminology changed to "استنشاق" as requested
    
    warnings: [
        // UPDATED: Terminology changed to "للاستنشاق"
        'الكبسولات مخصصة للاستنشاق فقط عن طريق الجهاز وليست للبلع.',
        'في حالات الربو (Asthma)، لا يُستخدم منفرداً بدون كورتيزون مستنشق.',
        'لا يستخدم لفك الأزمة الحادة (ليس إسعافي).',
        'قد يسبب رعشة بسيطة في اليد أو زيادة في ضربات القلب في بداية الاستخدام.'
    ]
  },

  // 24. Metrohaler
  {
    id: 'metrohaler-12',
    name: 'Metrohaler 12mcg 30 inhalation caps.+inhaler',
    genericName: 'Formoterol',
    concentration: '12mcg',
    price: 172, 
    // UPDATED: Same keywords as Foradil (LABA class)
    matchKeywords: [
        'long acting bronchodilator', 'COPD', 'exercise induced asthma', 
        'maintenance therapy', 'موسع شعب ممتد المفعول', 'وقاية', 'ضيق تنفس'
    ],
    usage: 'موسع للشعب ممتد المفعول (بديل الفوراديل).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (١٢ ميكروجرام) بالاستنشاق كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Used "استنشاق" terminology
    
    // ADDED: Critical safety warnings (Same as Foradil)
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط عن طريق الجهاز وليست للبلع.',
        'في حالات الربو (Asthma)، لا يُستخدم منفرداً بدون كورتيزون مستنشق.',
        'لا يستخدم لفك الأزمة الحادة (ليس إسعافي).',
        'قد يسبب رعشة بسيطة أو خفقان في بداية الاستخدام.'
    ]
  },
// 25. Mucosol Ped Syrup
  {
    id: 'mucosol-ped-syrup',
    name: 'Mucosol ped. 125mg/5ml syrup 120ml',
    genericName: 'Carbocisteine',
    concentration: '125mg / 5ml',
    price: 23, 
    // UPDATED: Keywords including Otitis Media (Glue Ear)
    matchKeywords: [
        'mucolytic', 'phlegm', 'productive cough', 'otitis media with effusion',
        'glue ear', 'thick sputum',
        'مذيب بلغم', 'كحة ببلغم', 'التهاب الأذن الوسطى', 'ارتشاح الأذن', 'بلغم لزج'
    ],
    usage: 'مذيب للبلغم ومقلل للزوجة (فعال جداً في حالات ارتشاح الأذن الوسطى).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.PRODUCTIVE_COUGH,
    form: 'Syrup',
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 45,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'لا يناسب الأطفال أقل من سنتين';
        }
        let dose = weight * 0.33;
        dose = Math.round(dose * 2) / 2;
        if (dose > 10) dose = 10;
        return `${dose} مل شراب فموي ٣ مرات يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام`;
    },
    
    
    // ADDED: Specific warnings for Carbocisteine
    warnings: [
        'يمنع استخدامه لمرضى قرحة المعدة النشطة (Active Peptic Ulcer).',
        'لا يفضل استخدامه للأطفال أقل من سنتين.',
        'قد يسبب زيادة مبدئية في كمية البلغم قبل إذابته.',
        'إذا كان الطفل لا يستطيع إخراج البلغم جيداً: يُستخدم بحذر وتحت متابعة.'
    ]
  },

  // 26. Westabreath 500
  {
    id: 'westabreath-500-tabs',
    name: 'Westabreath 500 mcg 20 f.c. tabs.',
    genericName: 'Roflumilast',
    concentration: '500mcg',
    price: 212, 
    // UPDATED: Keywords specific to Severe COPD & Bronchitis
    matchKeywords: [
        'severe COPD', 'chronic bronchitis', 'exacerbation prevention', 
        'sputum', 'PDE4 inhibitor',
        'سدة رئوية', 'التهاب شعبي مزمن', 'وقاية من الانتكاسات', 'بلغم مزمن'
    ],
    usage: 'علاج وقائي لحالات السدة الرئوية الشديدة (لتقليل تكرار الأزمات).',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.COPD,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (_) => 'قرص واحد (٥٠٠ ميكروجرام) فموياً مرة يومياً – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    
    // ADDED: Critical side effects warnings for Roflumilast
    warnings: [
        'الدواء مخصص للوقاية طويلة الأمد ولا يستخدم لعلاج ضيق التنفس المفاجيء.',
        'يجب متابعة وزن المريض (قد يسبب فقدان في الوزن).',
        'عند تغيرات مزاجية أو أرق أو اكتئاب: أعد التقييم؛ قلّل الجرعة أو أوقف ولوّح ببديل.',
        'ممنوع لمرضى قصور الكبد المتوسط أو الشديد.'
    ]
  },
// 27. Asmatropim 500 Nebulizer
  {
    id: 'asmatropim-500-neb',
    name: 'Asmatropim 500mcg/2ml 20 nebulizer vial soln.',
    genericName: 'Ipratropium Bromide',
    concentration: '500mcg / 2ml', // Equivalent to 250mcg/ml
    price: 164, 
    // UPDATED: Keywords including "Atrovent" as it's the reference drug
    matchKeywords: [
        'atrovent', 'anticholinergic', 'COPD', 'bronchospasm', 'asthma',
        'أتروفنت', 'موسع شعب', 'ضيق تنفس', 'جلسات استنشاق', 'سدة رئوية'
    ],
    usage: 'موسع للشعب الهوائية (جلسات استنشاق - بديل الأتروفنت).',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Vial',
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 200,

    calculationRule: (w) => {
        if (w < 30) {
            return '١ مل (نصف أمبول = ٢٥٠ ميكروجرام) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        return '٢ مل (أمبول كامل = ٥٠٠ ميكروجرام) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
    },
    
    // ADDED: Critical eye safety warning (Anticholinergics cause pupil dilation/glaucoma risk)
    warnings: [
        'يجب الحرص على عدم دخول البخار في العين (خصوصاً لمرضى المياه الزرقاء).',
        'يمكن خلط بوديسونيد مع سالبوتامول (فاركولين) في نفس الجلسة لزيادة الفاعلية؛ الجرعة القصوى للجلسة حسب العمر.',
        'قد يسبب جفافاً بسيطاً في الفم.'
    ]
  },

  // 28. Formohale
  {
    id: 'formohale-12',
    name: 'Formohale 12 mcg 30 caps. for inh.+inhaler',
    genericName: 'Formoterol',
    concentration: '12mcg',
    price: 198, // UPDATED: Price as per request
    // UPDATED: Standard keywords for Formoterol
    matchKeywords: [
        'long acting bronchodilator', 'COPD', 'exercise induced asthma', 
        'maintenance therapy', 'موسع شعب ممتد المفعول', 'وقاية', 'ضيق تنفس', 'بديل فوراديل'
    ],
    usage: 'موسع للشعب ممتد المفعول (للوقاية والتحكم في الأعراض).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (١٢ ميكروجرام) بالاستنشاق كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Used "استنشاق" terminology
    
    // ADDED: Critical safety warnings (Consistent with other LABAs)
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط عن طريق الجهاز وليست للبلع.',
        'في حالات الربو (Asthma)، لا يُستخدم منفرداً بدون كورتيزون مستنشق.',
        'لا يستخدم لفك الأزمة الحادة (ليس إسعافي).',
        'قد يسبب رعشة بسيطة أو خفقان في بداية الاستخدام.'
    ]
  },

 // 29. Prednisolone Forte (Corticosteroid)
  {
    id: 'prednisolone-forte-syrup', // <span style="color:green">// REPLACED: 'unipridol-forte-syrup' (generic id preferred)</span>
    name: 'Unipricort Forte 15mg/5ml syp.', // <span style="color:green">// REPLACED: 'Unipridol...' -> Likely Unipricort or Xilone if 15mg/5ml</span>
    genericName: 'Prednisolone Sodium Phosphate', // <span style="color:green">// REPLACED: 'Ambroxol HCl'</span>
    concentration: '15mg / 5ml',
    price: 69, // <span style="color:green">// NOTE: Verify price, Xilone Forte is around 24 EGP, imported might be higher.</span>
    
    // UPDATED: Keywords for Steroids/Allergy
    matchKeywords: [
        'corticosteroid', 'asthma', 'severe allergy', 'croup', 'laryngeal edema',
        'كورتيزون', 'حساسية صدر', 'التهاب رئوي', 'كحة نباحية', 'ضيق تنفس', 'اختناق'
    ],
    usage: 'مضاد للالتهاب والحساسية (أزمات الربو، الخانوق، الحساسية الشديدة).',
    timing: 'مرة يومياً صباحاً – ٣–٥ أيام',
    category: Category.ORAL_CORTICOSTEROIDS,
    form: 'Syrup',
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 50,

    calculationRule: (w) => {
        let dose = w / 3;
        dose = Math.round(dose * 2) / 2;
        if (dose > 20) dose = 20;
        return `${dose} مل شراب فموي مرة يومياً صباحاً – بعد الأكل – لمدة ٣–٥ أيام`;
    },
    
    // ADDED: Specific Steroid warnings
      warnings: [
          'كورتيزون: تجنب في قرحة هضمية نشطة؛ جرعات عالية أو ممتدة: راقب سكر، ضغط، عين.',
          'الجرعة عادة لمدة قصيرة (٣–٥ أيام) في نوبات الحساسية الحادة.',
        'يجب الحذر مع مرضى السكر (قد يرفع السكر) ومرضى الضغط.'
    ]
  },

// 30. Salmetocort 250
  {
    id: 'salmetocort-250',
    name: 'Salmetocort 250/50mcg 60 pd. inh. caps.+ inh. device',
    genericName: 'Salmeterol + Fluticasone',
    concentration: '250mcg / 50mcg',
    price: 273, // UPDATED: Price as per request
    // UPDATED: Keywords linked to Seretide alternative
    matchKeywords: [
        'asthma control', 'moderate asthma', 'COPD', 'wheezing', 'seretide generic',
        'حساسية صدر متوسطة', 'ربو', 'وقاية', 'كحة مزمنة', 'بديل سيريتيد'
    ],
    usage: 'علاج وقائي للربو والسدة الرئوية (تركيز متوسط).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Used "استنشاق" terminology + added rinse instruction
    
    // ADDED: Critical warnings regarding capsule usage
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط بواسطة الجهاز وليست للبلع.',
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'هذا الدواء وقائي للاستخدام اليومي ولا يستخدم وقت الأزمة المفاجئة.'
    ]
  },
// 31. Ventolin Evohaler
  {
    id: 'ventolin-evohaler',
    name: 'Ventolin evohaler 100mcg/actuation inhaler',
    genericName: 'Salbutamol',
    concentration: '100mcg / dose',
    price: 86, // UPDATED: Price as per request
    // UPDATED: Keywords for Rescue/Emergency use
    matchKeywords: [
        'rescue inhaler', 'asthma attack', 'bronchospasm', 'shortness of breath', 
        'blue inhaler', 'wheezing',
        'بخاخ الطوارئ', 'أزمة ربو', 'ضيق تنفس', 'تزييق', 'الفنتولين الازرق', 'كتمة مفاجئة'
    ],
    usage: 'موسع شعب سريع المفعول (بخاخ الطوارئ للأزمات).',
    timing: 'كل ٤–٦ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Inhaler',
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,

    calculationRule: (_) => 'بخّتين بالاستنشاق كل ٤–٦ ساعات عند الحاجة (الأطفال: عبر القمع/Spacer)',
    
    // UPDATED: Instruction emphasized on Spacer usage for kids
    
    // ADDED: Safety warnings specific to SABA
    warnings: [
        'هذا البخاخ للعلاج السريع وقت الأزمة وليس للوقاية المستمرة.',
        'إذا زاد الاحتياج للبخاخ عن مرتين أسبوعياً: الربو غير مسيطر؛ أعد التقييم وزد الستيرويد المستنشق أو عدّل الخطة.',
        'قد يسبب رعشة بسيطة في اليدين أو زيادة مؤقتة في ضربات القلب.',
        'إذا احتجت جرعات متكررة خلال ساعات قليلة أو لم تتحسن بعد ٢ بخة: راجع الطوارئ.'
    ]
  },

// 32. Ciprofloxiraz 750
  {
    id: 'ciprofloxiraz-750',
    name: 'Ciprofloxiraz 750mg 10 f.c. tab.',
    genericName: 'Ciprofloxacin',
    concentration: '750mg',
    price: 59.5, // UPDATED: Price as per request
    // UPDATED: Keywords for specific Cipro indications
    matchKeywords: [
        'UTI', 'prostatitis', 'typhoid', 'diabetic foot', 'pseudomonas',
        'صديد البول', 'التهاب البروستاتا', 'تيفود', 'عدوى معوية', 'حرقان بول'
    ],
    usage: 'مضاد حيوي قوي المجال (للبروستاتا، المسالك البولية، والتيفود).',
    timing: 'مرتين يومياً.',
    category: Category.FLUOROQUINOLONES,
    form: 'F.C. Tablets',
    // CRITICAL: Contraindicated for children < 18 years due to cartilage damage risk
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    
    // UPDATED: Fixed dosage for adults (High strength)
    calculationRule: (_) => 'قرص واحد كل ١٢ ساعة',
    
    // UPDATED: Critical absorption instruction
    
    // ADDED: Major Safety Warnings for Fluoroquinolones
    warnings: [
        'ممنوع تماماً للأطفال والمراهقين أقل من ١٨ سنة (يؤثر على نمو الغضاريف).',
        'يجب الفصل بينه وبين منتجات الألبان، الكالسيوم، ومضادات الحموضة بمدة لا تقل عن ساعتين.',
        'قد يسبب حساسية من ضوء الشمس، يفضل تجنب التعرض المباشر للشمس.',
        'يجب الحذر لمرضى الصرع أو من لديهم تاريخ مع تشنجات.'
    ]
  },

  // 33. Erdotinol 300
  {
    id: 'erdotinol-300',
    name: 'Erdotinol 300mg 10 caps.',
    genericName: 'Erdosteine',
    concentration: '300mg',
    price: 13.5, // Very affordable option
    // UPDATED: Keywords specific to Erdosteine (Smokers / COPD)
    matchKeywords: [
        'mucolytic', 'chronic bronchitis', 'COPD', 'smokers cough', 'viscous sputum',
        'مذيب بلغم', 'كحة ببلغم', 'التهاب شعبي مزمن', 'كحة مدخنين', 'بلغم لزج'
    ],
    usage: 'مذيب للبلغم (يتميز بقدرته على تحسين نفاذية المضاد الحيوي في الرئة).',
    timing: 'كل ١٢ ساعة – ٥–٧ أيام',
    category: Category.PRODUCTIVE_COUGH,
    form: 'Capsules',
    minAgeMonths: 180,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (٣٠٠ مجم) فموياً كل ١٢ ساعة – بدون اعتبار للأكل – لمدة ٥–٧ أيام',
    
    
    // ADDED: Specific warnings including Antibiotic Synergy
    warnings: [
        'ممنوع لمرضى قرحة المعدة النشطة أو الفشل الكلوي الحاد.',
        'الحمل/الرضاعة: يُستخدم فقط عند الضرورة (لا تتوفر بيانات كافية).',
        'يساعد على زيادة تركيز المضاد الحيوي في البصاق (Sputum) لذلك يفضل وصفهما معاً.'
    ]
  },

  // 34. Bronchopyonair 50
  {
    id: 'bronchopyonair-50',
    name: 'Bronchopyonair 50 mcg 30 caps. for inh.+inhaler',
    genericName: 'Glycopyrronium',
    concentration: '50mcg',
    price: 281, // UPDATED: Price as per request
    // UPDATED: Keywords specific to COPD Maintenance (LAMA)
    matchKeywords: [
        'COPD', 'emphysema', 'chronic bronchitis', 'LAMA', 'maintenance therapy',
        'سدة رئوية', 'انتفاخ الرئة', 'التهاب شعبي مزمن', 'موسع شعب طويل المفعول'
    ],
    usage: 'موسع للشعب طويل المفعول (مرة واحدة يومياً لعلاج السدة الرئوية).',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (٥٠ ميكروجرام) بالاستنشاق مرة يومياً في نفس الموعد – بدون اعتبار للأكل – علاج مستمر',
    
    // UPDATED: Used "استنشاق" terminology + emphasized 24h effect
    
    // ADDED: Specific Anticholinergic warnings
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط بواسطة الجهاز وليست للبلع.',
        'الدواء مخصص لعلاج السدة الرئوية (COPD) كعلاج وقائي وليس لأزمات الربو الحادة.',
        'يستخدم بحذر مع مرضى المياه الزرقاء (Glaucoma) واحتباس البول.'
    ]
  },

  // 35. Salmetocort 100
  {
    id: 'salmetocort-100',
    name: 'Salmetocort 100/50mcg 60 pd. inh. caps.+ inh. device',
    genericName: 'Salmeterol + Fluticasone',
    concentration: '100mcg / 50mcg', // Fluticasone 100 + Salmeterol 50
    price: 213, // UPDATED: Price as per request
    // UPDATED: Keywords for Pediatric Asthma / Mild Control
    matchKeywords: [
        'asthma control', 'mild asthma', 'pediatric asthma', 'wheezing', 'seretide generic',
        'حساسية صدر أطفال', 'ربو', 'وقاية', 'كحة مزمنة', 'بديل سيريتيد 100'
    ],
    usage: 'علاج وقائي للربو (تركيز منخفض - مناسب للأطفال والكبار).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Used "استنشاق" terminology + rinse instruction
    
    // ADDED: Critical warnings (Capsule safety & Thrush prevention)
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط بواسطة الجهاز وليست للبلع.',
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'هذا الدواء وقائي فقط ولا يستخدم في نوبات الربو الحادة.'
    ]
    },

    // 36. Atrovent 250 Nebulizer
  {
    id: 'atrovent-250-neb',
    name: 'Atrovent 250mcg/2ml 20 unit dose vial',
    genericName: 'Ipratropium Bromide',
    concentration: '250mcg / 2ml',
    price: 286, // Estimate (Approximate market price)
    // UPDATED: Keywords for the Brand Name
    matchKeywords: [
        'COPD', 'bronchospasm', 'asthma', 'nebulizer', 'shortness of breath',
        'أتروفنت', 'موسع شعب', 'ضيق تنفس', 'جلسات استنشاق', 'سدة رئوية', 'حساسية صدر'
    ],
    usage: 'موسع للشعب الهوائية (الأتروفنت الأصلي - جلسات استنشاق).',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Vial',
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 200,

    calculationRule: (w) => {
        if (w < 40) {
            return '٢ مل (أمبول كامل = ٢٥٠ ميكروجرام) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        return '٤ مل (٢ أمبول = ٥٠٠ ميكروجرام) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
    },
    
    
    // ADDED: Standard Anticholinergic warnings
    warnings: [
        'يجب الحرص على عدم دخول البخار في العين (خصوصاً لمرضى المياه الزرقاء).',
        'يمكن خلطه مع محلول الفاركولين في نفس الجلسة لزيادة الفاعلية.',
        'قد يسبب جفافاً بسيطاً في الفم.',
        'احتباس بول/ألم بالعين/زغللة شديدة: أوقف فوراً؛ أعد قياس ضغط العين واستبعاد زرق مغلق الزاوية.'
    ]
  },

// 37. Flixotide 125
  {
    id: 'flixotide-125',
    name: 'Flixotide evohaler 125mcg/actuation inhaler',
    genericName: 'Fluticasone',
    concentration: '125mcg',
    price: 141, // UPDATED: Price as per request
    // UPDATED: Keywords for ICS (Inhaled Corticosteroids)
    matchKeywords: [
        'prophylactic', 'asthma controller', 'cortisone inhaler', 'orange inhaler',
        'بخاخ وقائي', 'كورتيزون', 'حساسية صدر', 'البخاخ البرتقالي', 'وقاية مستمرة'
    ],
    usage: 'بخاخ كورتيزون وقائي للربو (يقلل التهاب الشعب الهوائية).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhaler',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,

    calculationRule: (_) => '١–٢ بخة بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Instructions emphasizing rinse & spacer for kids
    
    // ADDED: Critical ICS warnings (Thrush & Voice hoarseness)
    warnings: [
        'هذا الدواء وقائي للاستخدام اليومي ولا يفيد في نوبات الربو الحادة المفاجئة.',
        'ضرورة المضمضة بالماء والغرغرة (دون بلع) بعد كل جرعة لتجنب الفطريات وبحة الصوت.',
        'يجب الانتظام عليه حتى لو شعر المريض بتحسن لضمان عدم عودة الأعراض.'
    ]
  },

  // 38. Seretide Diskus 250 (28 doses)
  {
    id: 'seretide-diskus-250-28',
    name: 'Seretide diskus 250/50mcg 28 doses',
    genericName: 'Salmeterol + Fluticasone',
    concentration: '250mcg / 50mcg',
    price: 257, // UPDATED: Price for the 28-dose pack
    // UPDATED: Standard keywords for moderate asthma control
    matchKeywords: [
        'asthma control', 'moderate asthma', 'COPD', 'wheezing', 
        'حساسية صدر متوسطة', 'ربو', 'وقاية', 'كحة مزمنة', 'تزييق الصدر'
    ],
    usage: 'علاج وقائي للربو (تركيز متوسط - عبوة صغيرة ٢٨ جرعة).',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Powder (Diskus)',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,

    calculationRule: (_) => 'استنشاق واحد صباحاً ومساءً (كل ١٢ ساعة) – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Terminology "استنشاق" with emphasis on force (DPI)
    
    // ADDED: Standard warnings for ICS/LABA powder
    warnings: [
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'هذا الدواء وقائي للاستخدام اليومي ولا يستخدم وقت الأزمة المفاجئة.',
        'يجب الاستنشاق بقوة وعمق لضمان وصول البودرة للرئة.'
    ]
  },
// 39. Spiriva
  {
    id: 'spiriva-18',
    name: 'Spiriva 18mcg 30 inh. caps. + HandiHaler',
    genericName: 'Tiotropium',
    concentration: '18mcg',
    price: 416, // UPDATED: Exact price as per request
    // UPDATED: Keywords including Brand Name
    matchKeywords: [
        'COPD', 'emphysema', 'chronic bronchitis', 'maintenance therapy', 'spiriva',
        'سدة رئوية', 'انتفاخ الرئة', 'التهاب شعبي مزمن', 'سبيريفا', 'نهجان'
    ],
    usage: 'موسع للشعب طويل المفعول (الأصلي - لعلاج السدة الرئوية).',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة (١٨ ميكروجرام) بالاستنشاق عبر HandiHaler مرة يومياً في نفس الموعد – بدون اعتبار للأكل – علاج مستمر',
    
    // UPDATED: HandiHaler specific instructions + "استنشاق" terminology
    
    // ADDED: Standard Anticholinergic warnings
    warnings: [
        'الكبسولات مخصصة للاستنشاق فقط بواسطة جهاز الهاندي هيلر وليست للبلع.',
        'الدواء مخصص لعلاج السدة الرئوية (COPD) كعلاج وقائي وليس لأزمات الربو الحادة.',
        'يستخدم بحذر مع مرضى المياه الزرقاء (Glaucoma) وتضخم البروستاتا.',
        'احتباس بول/ألم بالعين/زغللة شديدة: أوقف فوراً؛ أعد قياس ضغط العين واستبعاد زرق مغلق الزاوية.'
    ]
  },

  // 40. Ipratropium Viatris
  {
    id: 'ipratropium-viatris-500',
    name: 'Ipratropium viatris 0.5mg/2ml (adults) 10 unit dose vial',
    genericName: 'Ipratropium Bromide',
    concentration: '0.5mg / 2ml', // Equivalent to 500mcg
    price: 55, // Good price for 10 vials
    // UPDATED: Keywords to match Atrovent alternatives
    matchKeywords: [
        'atrovent generic', 'anticholinergic', 'COPD', 'bronchospasm', 'nebulizer',
        'موسع شعب', 'ضيق تنفس', 'جلسات استنشاق', 'سدة رئوية', 'بديل أتروفنت'
    ],
    usage: 'موسع للشعب الهوائية (جلسات استنشاق - تركيز الكبار).',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Vial',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (_) => '٢ مل (أمبول كامل = ٥٠٠ ميكروجرام) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة',
    
    
    // ADDED: Standard Anticholinergic warnings
    warnings: [
        'يجب الحرص على عدم دخول البخار في العين (خصوصاً لمرضى المياه الزرقاء).',
        'يمكن خلطه مع محلول الفاركولين في نفس الجلسة لزيادة الفاعلية.',
        'قد يسبب جفافاً بسيطاً في الفم.'
    ]
  },
  // 41. Vilatriplo (Triple Therapy)
  {
    id: 'vilatriplo-200',
    name: 'Vilatriplo 200/62.5/25mcg 6 strips', // Usually comes as strips/blisters in device
    genericName: 'Fluticasone + Umeclidinium + Vilanterol',
    concentration: '200 / 62.5 / 25mcg',
    price: 549, // UPDATED: Price as per request
    // UPDATED: Keywords for "Triple Therapy"
    matchKeywords: [
        'trelegy generic', 'triple therapy', 'severe COPD', 'severe asthma', 
        'maintenance',
        'علاج ثلاثي', 'سدة رئوية شديدة', 'ربو غير مستجيب', 'تريليجي', 'موسع شعب قوي'
    ],
    usage: 'علاج ثلاثي قوي المفعول (كورتيزون + نوعين موسع شعب) للحالات الشديدة.',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhaler',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,

    calculationRule: (_) => 'استنشاق واحد مرة يومياً في نفس الموعد – بدون اعتبار للأكل – علاج مستمر للسيطرة',
    
    // UPDATED: Terminology "استنشاق" + Rinse instruction
    
    // ADDED: Warnings specific to Triple Therapy
    warnings: [
        'هذا الدواء يحتوي على ٣ مواد فعالة، ويستخدم للحالات التي لم تستجب للعلاجات الأخرى.',
        'يجب مضمضة الفم جيداً بالماء (بدون بلع) بعد الاستخدام لتجنب الفطريات.',
        'يستخدم بحذر مع مرضى القلب، المياه الزرقاء (Glaucoma)، واحتباس البول.',
        'لا يستخدم أبداً لعلاج الأزمات الحادة المفاجئة.'
    ]
  },
  // 42. Breathovance Nebulizer
  {
    id: 'breathovance-neb',
    name: 'Breathovance nebulizer soln. 20 amp. 2.5ml',
    genericName: 'Ipratropium + Salbutamol',
    concentration: '0.5mg + 2.5mg / 2.5ml',
    price: 90, // UPDATED: Price as per request
    // UPDATED: Keywords for Combination Therapy
    matchKeywords: [
        'combivent', 'duolin', 'copd', 'asthma attack', 'nebulizer', 'mixed bronchodilator',
        'كومبيفنت', 'موسع شعب مركب', 'فاركولين وأتروفنت', 'ضيق تنفس شديد', 'أزمة'
    ],
    usage: 'موسع للشعب مزدوج المفعول (خليط جاهز من فاركولين وأتروفنت).',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Vial',
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,

    calculationRule: (w) => {
        if (w < 30) {
            return '١.٢٥ مل (نصف أمبول) + ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        return '٢.٥ مل (أمبول كامل) ± ٢ مل محلول ملح بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
    },
    
    
    // ADDED: Combined Warnings (Eyes + Heart)
    warnings: [
        'يجمع هذا الدواء بين الفاركولين والأتروفنت، لذا يجب عدم إضافة فاركولين خارجي إلا بأمر الطبيب.',
        'يجب الحرص على عدم دخول البخار في العين (بسبب مادة الأتروفنت).',
        'يستخدم بحذر مع مرضى القلب وتسارع النبض (بسبب مادة السالبيوتامول).',
        'إذا لم يتحسن ضيق التنفس بعد الجلسة أو احتجت جلسات متقاربة جداً: راجع الطوارئ.'
    ]
  },


  // 43. Salbovent Forte 4mg Tablets
  {
    id: 'salbovent-forte-4mg-20-tabs',
    name: 'Salbovent Forte 4mg 20 Tabs',
    genericName: 'Salbutamol',
    concentration: '4mg',
    price: 18, 
    matchKeywords: [
        'asthma', 'bronchodilator', 'salbutamol', 'salbovent', 'forte', 'wheezing', 'breathing',
        'سالبوفينت فورت', 'سالبوفنت ٤', 'سالبيوتامول', 'موسع شعب قوي', 'تزييق الصدر', 'نهجان'
    ],
    usage: 'موسع شعب هوائية قوي وسريع المفعول، يستخدم لعلاج ضيق التنفس الشديد والأزمات الصدرية.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Tablets',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'تركيز الفورت لا يناسب الأطفال أقل من ٦ سنوات؛ استخدم الشراب أو تركيز ٢ مجم';
        }
        if (ageMonths < 144) {
            return 'نصف قرص (٢ مجم) فموياً ٣–٤ مرات يومياً – بدون اعتبار للأكل – حسب الحاجة';
        }
        return 'قرص واحد (٤ مجم) فموياً ٣–٤ مرات يومياً (حد أقصى ٢ قرص) – بدون اعتبار للأكل – حسب الحاجة';
    },
    
    
    warnings: [
        'أعراض الرعشة وضربات القلب قد تكون أوضح في هذا التركيز العالي.',
        'لكبار السن: يمنع البدء بهذا التركيز، يجب البدء بجرعة ٢ ملجم أولاً.',
        'يستخدم بحذر شديد مع مرضى القلب والضغط المرتفع والسكر.',
        'إذا لم تتحسّن الحالة بعد الجرعة: أعد التقييم؛ لا تكرر الجرعة بكثرة (خطر سمية).'
    ]
  },


// 44. Etaphylline Ampoules
  {
    id: 'etaphylline-500mg-amp',
    name: 'Etaphylline 500mg/5ml 6 Amp.',
    genericName: 'Acefylline Piperazine',
    concentration: '500mg/5ml',
    price: 90, 
    matchKeywords: [
        'asthma', 'COPD', 'bronchodilator', 'etaphylline', 'acefylline', 'injection', 'breathing',
        'ايتافيللين', 'إيتافيلين حقن', 'موسع شعب', 'ضيق تنفس', 'حقن للصدر'
    ],
    usage: 'موسع شعب هوائية سريع المفعول يستخدم في حالات ضيق التنفس الحادة وأزمات الربو الصدرية.',
    timing: 'كل ١٢ ساعة – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Ampoules',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'يحتاج تقييماً متخصصاً؛ الجرعة حسب الوزن';
        }
        return 'حقنة واحدة (٥٠٠ مجم) بالعضل أو بالوريد ببطء شديد كل ١٢–٢٤ ساعة حسب الحاجة';
    },
    
    
    warnings: [
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط.',
        'الحقن الوريدي السريع قد يسبب هبوطاً في ضغط الدم؛ أَعطِ ببطء.',
        'للاستخدام في المنشأة الصحية فقط.',
        'تداخلات مهمة: تجنب تكرار أدوية الثيوفيللين/مشتقاته معها لتفادي السمية.',
        'يفضل عدم خلطها مع أدوية أخرى في نفس السرنجة.'
    ]
  },

// 45. Disprelone-OD 5mg
  {
    id: 'disprelone-od-5',
    name: 'Disprelone-od 5mg 30 orodispersable tabs.',
    genericName: 'Prednisolone',
    concentration: '5mg',
    price: 84, 
    matchKeywords: [
        'cortisone', 'steroid', 'asthma attack', 'croup', 'allergy', 'inflammation',
        'كورتيزون', 'أزمة ربو', 'حساسية صدر', 'التهاب', 'أقراص تذوب', 'ديسبرلون'
    ],
    // UPDATED: Usage now reflects the variable nature of the dose
    usage: 'كورتيزون (تعتمد الجرعة على وزن المريض وشدة الحالة والاستجابة).',
    timing: 'مرة يومياً صباحاً – ٣–٥ أيام',
    category: Category.ORAL_CORTICOSTEROIDS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 150,

    calculationRule: (w) => {
        let tabs = Math.round(w / 5);
        if (tabs < 1) tabs = 1;
        if (tabs > 12) tabs = 12;
        return `${tabs} قرص فموياً مرة يومياً صباحاً (متوسط جرعة تحميل ١ مجم/كجم) – بعد الأكل – لمدة ٣–٥ أيام`;
    },
    
    // UPDATED: Detailed clinical guidelines as requested
    
    // UPDATED: Warnings emphasizing Tapering & Growth
    warnings: [
        'يجب سحب الدواء تدريجياً عند الإقلاع عنه (Tapering) لتجنب قصور الغدة الكظرية.',
        'في الأطفال: يفضل استخدام العلاج يوماً بعد يوم (Alternate Day) في حالات الصيانة لتقليل تأخير النمو.',
        'جرعة التحميل للبالغين: ٠.٣٥ - ١.٢ مجم/كجم، وجرعة الصيانة ٥ - ١٥ مجم يومياً.',
        'يجب تناوله مع أو بعد الأكل.',
        'يُستخدم بحذر مع مرضى السكر/الضغط/قرحة المعدة والعدوى النشطة.'
    ]
  },

  // 46. Bronchopyonair Plus (LAMA + LABA)
  {
    id: 'bronchopyonair-plus',
    name: 'Bronchopyonair plus 110/50 mcg 30 inh. caps. + inhaler',
    genericName: 'Indacaterol + Glycopyrronium',
    concentration: '110mcg / 50mcg',
    price: 406, // UPDATED: Price as per request
    // UPDATED: Keywords for Dual Bronchodilation / Ultibro
    matchKeywords: [
        'ultibro generic', 'dual bronchodilator', 'COPD', 'emphysema', 'LAMA LABA', 
        'maintenance',
        'سدة رئوية', 'التيبرو', 'موسع شعب مزدوج', 'انتفاخ الرئة', 'نهجان مستمر'
    ],
    usage: 'موسع للشعب مزدوج المفعول (LAMA + LABA) لعلاج السدة الرئوية.',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.COPD,
    form: 'Inhalation Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,

    calculationRule: (_) => 'كبسولة واحدة بالاستنشاق مرة يومياً في نفس الموعد – بدون اعتبار للأكل – علاج مستمر',
    
    // UPDATED: Instructions emphasizing daily routine & technique
    
    // ADDED: Warnings specific to Dual Therapy
    warnings: [
        'الدواء مخصص لعلاج السدة الرئوية (COPD) فقط وليس لعلاج الربو (Asthma).',
        'الكبسولات للاستنشاق بالجهاز فقط وليست للبلع.',
        'يستخدم بحذر مع مرضى القلب، احتباس البول، والمياه الزرقاء (Glaucoma).',
        'لا يستخدم كعلاج اسعافي في الأزمات المفاجئة.'
    ]
  },

  // 47. Flixotide 50mcg Evohaler
  {
    id: 'flixotide-50-evohaler', // Highlight: Green/English
    name: 'Flixotide evohaler 50mcg/actuation inhaler',
    genericName: 'Fluticasone Propionate',
    concentration: '50mcg per actuation',
    price: 111, 
    matchKeywords: [
        'asthma', 'respiratory', 'flixotide', 'inhaler', 'corticosteroid', 'fluticasone', 'gsk',
        'فليكسوتايد', 'بخاخة فليكسوتايد', 'حساسية صدر', 'ربو', 'كورتيزون بخاخ', 'ضيق تنفس'
    ],
    usage: 'علاج وقائي طويل الأمد لحالات الربو وحساسية الصدر؛ يعمل على تقليل التورم والتهيج في جدران الشعب الهوائية.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhaler',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) {
            return 'لا يناسب أقل من ١٢ شهراً (يحتاج تقييماً متخصصاً)';
        }
        if (ageMonths <= 144) {
            return 'بخة واحدة (٥٠ ميكروجرام) بالاستنشاق كل ١٢ ساعة (قد تصل لبختين في الحالات الشديدة) – بدون اعتبار للأكل – علاج مستمر';
        }
        return 'بخة–بختين بالاستنشاق كل ١٢ ساعة (حد أقصى ٥٠٠ ميكروجرام/يوم) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'هذه البخاخة وقائية ولا تستخدم لعلاج أزمات الربو الحادة (Rescue)؛ في حالة الأزمة يستخدم موسع شعب سريع (مثل الفنتولين).',
        'يجب الالتزام بالجرعة اليومية بانتظام حتى لو لم يشعر المريض بأعراض.',
        'يستخدم بحذر مع مرضى الدرن (السل) أو العدوى الفطرية/الفيروسية غير المعالجة.',
        'عند الاستخدام المديد في الأطفال: متابعة النمو كل ٦–١٢ شهراً.'
    ]
  },

  // 48. Lungocort 0.5mg/2ml Respules
  {
    id: 'lungocort-0-5mg-20-amps', // Highlight: Green/English
    name: 'Lungocort 0.5mg/2ml 20 ampoule',
    genericName: 'Budesonide',
    concentration: '0.5mg / 2ml',
    price: 264, 
    matchKeywords: [
        'asthma', 'nebulizer', 'lungocort', 'budesonide', 'corticosteroid', 'respules',
        'لونجوكورت', 'جلسات بخار', 'بوديسونيد', 'حساسية صدر', 'كورتيزون جلسات', 'نفس'
    ],
    usage: 'علاج وقائي لحالات الربو الشعبي والتهاب الشعب الهوائية المزمن، ويستخدم في جلسات البخار (Nebulizer) لتقليل الالتهاب.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Ampoules',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6) {
            return 'لا يناسب أقل من ٦ أشهر (يحتاج تقييماً متخصصاً)';
        }
        if (ageMonths <= 144) {
            return '٠.٢٥–٠.٥ مجم (نصف–أمبول كامل) بالنبيولايزر كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        return '٠.٥–١ مجم (١–٢ أمبول) بالنبيولايزر كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'يستخدم فقط عبر جهاز النيبولايزر (البخار) ولا يحقن أبداً.',
        'هذا الدواء وقائي وليس لعلاج أزمات ضيق التنفس المفاجئة (Rescue)؛ في حالات الطوارئ يستخدم موسع شعب.',
        'يجب رج الأمبول جيداً قبل فتحه لضمان تجانس المحلول.',
        'بمجرد فتح الأمبول، يجب استخدامه خلال ١٢ ساعة كحد أقصى.'
    ]
  },

  // 49. Breztri Aerosphere Inhaler
  {
    id: 'breztri-aerosphere-120-doses', // Highlight: Green/English
    name: 'Breztri aerosphere 160/9/4.8 mcg 120 doses',
    genericName: 'Budesonide + Glycopyrronium + Formoterol Fumarate',
    concentration: '160mcg + 9mcg + 4.8mcg per actuation',
    price: 1060, 
    matchKeywords: [
        'copd', 'breztri', 'aerosphere', 'triple therapy', 'inhaler', 'astrazeneca', 'respiratory',
        'بريزتري', 'بخاخة بريزتري', 'سدة رئوية', 'ضيق تنفس مزمن', 'علاج ثلاثي', 'أسترازينيكا'
    ],
    usage: 'علاج صيانة طويل الأمد لمرضى الانسداد الرئوي المزمن (COPD) لتقليل نوبات ضيق التنفس وتحسين وظائف الرئة.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.COPD,
    form: 'Inhaler',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 216) {
            return 'مخصص للبالغين (١٨ سنة+) لعلاج السدة الرئوية فقط';
        }
        return 'بختين بالاستنشاق صباحاً + بختين مساءً (كل ١٢ ساعة) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'لا يستخدم لعلاج أزمات ضيق التنفس الحادة (ليس بخاخ طوارئ).',
        'مخصص لمرضى السدة الرئوية المزمنة (COPD) وليس معتمداً لعلاج الربو (Asthma) بشكل أساسي.',
        'لا تُوقف الستيرويد المستنشق فجأة بعد استخدام ممتد؛ قلّل تدريجياً على أسابيع.',
        'يستخدم بحذر مع مرضى القلب، ضغط الدم المرتفع، وزيادة نشاط الغدة الدرقية.'
    ]
  },

  // 50. Halnide 400 mcg Inhalation Capsules
  {
    id: 'halnide-400-60-caps', // Highlight: Green/English
    name: 'Halnide 400 mcg 60 inhalation caps. + inhaler',
    genericName: 'Budesonide',
    concentration: '400 mcg',
    price: 86, 
    matchKeywords: [
        'asthma', 'respiratory', 'halnide', 'budesonide', 'inhalation capsules', 'marcyrl',
        'هالنيد', 'هالنيد ٤٠٠', 'حساسية صدر', 'كبسولات استنشاق', 'بوديسونيد', 'ضيق تنفس'
    ],
    usage: 'علاج وقائي طويل الأمد لحالات الربو الشعبي والانسداد الرئوي المزمن؛ يعمل على تقليل الالتهاب في الشعب الهوائية.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Capsules',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يناسب الأطفال أقل من ٦ سنوات (يحتاج مهارة استخدام الجهاز)';
        }
        return 'كبسولة واحدة (٤٠٠ ميكروجرام) بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'هذا الدواء وقائي ولا يستخدم في حالات ضيق التنفس الحادة أو الطوارئ.',
        'يجب غسل الفم والمضمضة جيداً لتجنب حدوث فطريات الفم (Oral Thrush).',
        'يجب عدم التوقف عن استخدام الدواء فجأة حتى لو شعرت بتحسن.',
        'تستخدم الكبسولات فقط عن طريق جهاز الاستنشاق المرفق بالعلبة.'
    ]
  },

// 51. Budexan 0.5mg/2ml Respules
  {
    id: 'budexan-0-5mg-20-amps', // Highlight: Green/English
    name: 'Budexan 0.5 mg/2ml 20 susp. amp. for inh',
    genericName: 'Budesonide',
    concentration: '0.5mg / 2ml',
    price: 398, 
    matchKeywords: [
        'asthma', 'nebulizer', 'budexan', 'budesonide', 'corticosteroid', 'respules', 'devart lab',
        'بوديكسان', 'جلسات بخار', 'بوديسونيد', 'حساسية صدر', 'كورتيزون جلسات', 'نفس', 'ديفارت'
    ],
    usage: 'علاج وقائي قوي لحالات الربو وحساسية الصدر المزمنة، ويستخدم في جلسات النيبولايزر لتقليل التهاب الشعب الهوائية.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Ampoules',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6) {
            return 'لا يناسب أقل من ٦ أشهر (يحتاج تقييماً متخصصاً)';
        }
        if (ageMonths <= 144) {
            return '٠.٢٥–٠.٥ مجم (نصف–أمبول كامل) بالنبيولايزر كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        return '٠.٥–١ مجم (١–٢ أمبول) بالنبيولايزر كل ١٢ ساعة – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'يستخدم فقط مع جهاز النيبولايزر؛ ممنوع الحقن أو الشرب نهائياً.',
        'الدواء وقائي وليس لعلاج نوبات ضيق التنفس المفاجئة (Rescue)؛ في الطوارئ نستخدم فنتولين.',
        'يجب رج الأمبول جيداً قبل الاستخدام لضمان خلط المادة الفعالة.',
        'الأمبول المفتوح يجب استخدامه خلال ١٢ ساعة فقط.'
    ]
  },

// 52. Lungotropium 250mcg/1ml Nebulizer Solution
  {
    id: 'lungotropium-250mcg-20-vials', // Highlight: Green/English
    name: 'Lungotropium 250mcg/1ml 20 unit dose vial nebulizer soln',
    genericName: 'Ipratropium Bromide',
    concentration: '250mcg / 1ml',
    price: 152, 
    matchKeywords: [
        'asthma', 'copd', 'lungotropium', 'ipratropium', 'atrovent', 'nebulizer', 'bronchodilator',
        'لونجوتروبيوم', 'أتروفينت', 'جلسات بخار', 'موسع شعب', 'ضيق تنفس', 'حساسية صدر'
    ],
    usage: 'موسع للشعب الهوائية يستخدم في حالات الربو الشعبي والسدة الرئوية المزمنة؛ يعمل على توسيع الممرات الهوائية وتقليل الإفرازات.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.BRONCHODILATOR,
    form: 'Vial',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3.5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) {
            return '٤–١٠ نقاط (١٠٠–٢٥٠ ميكروجرام) + ٢–٤ مل محلول ملح بالنبيولايزر كل ٨ ساعات حسب الوزن والحاجة';
        }
        if (ageMonths <= 144) {
            return 'نصف–أمبول كامل (١٢٥–٢٥٠ ميكروجرام) بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
        }
        return '١–٢ أمبول (٢٥٠–٥٠٠ ميكروجرام) بالنبيولايزر كل ٦–٨ ساعات حسب الحاجة';
    },
    
    
    warnings: [
        'يستخدم فقط للاستنشاق بجهاز البخار؛ ممنوع الحقن أو الشرب تماماً.',
        'يستخدم بحذر شديد مع مرضى "الجلوكوما" (المياه الزرقاء) أو تضخم البروستاتا.',
        'قد يسبب جفافاً في الفم أو تهيجاً بسيطاً في الحلق بعد الجلسة.',
        'تجنب وصول رذاذ الدواء للعين أثناء الجلسة (يفضل استخدام قطعة فم Mouthpiece بدل الماسك لو أمكن في مرضى الجلوكوما).'
    ]
  },

  // 53. Flixotide Diskus 250 mcg
  {
    id: 'flixotide-250-diskus-60-doses', // Highlight: Green/English
    name: 'Flixotide diskus 250 mcg/dose 60 doses',
    genericName: 'Fluticasone Propionate',
    concentration: '250 mcg per dose',
    price: 150, 
    matchKeywords: [
        'asthma', 'respiratory', 'flixotide', 'diskus', 'fluticasone', 'gsk', 'preventative',
        'فليكسوتايد', 'فليكسوتايد ديسكس', 'بخاخة بودرة', 'حساسية صدر', 'كورتيزون وقائي', 'ضيق تنفس'
    ],
    usage: 'علاج وقائي طويل الأمد لحالات الربو الشعبي المزمن وحساسية الصدر؛ يقلل الالتهاب والتورم في الشعب الهوائية.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Powder (Diskus)',

    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'لا يناسب الأطفال أقل من ٤ سنوات؛ يُفضّل البخاخة مع Spacer';
        }
        return 'بخة واحدة (٢٥٠ ميكروجرام) بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'هذا الدواء وقائي ولا يستخدم في حالات أزمات الربو الحادة (Rescue)؛ في الطوارئ نستخدم بخاخة موسعة للشعب.',
        'يجب غسل الفم جيداً بعد الاستخدام لتجنب فطريات الفم (Candidiasis).',
        'لا تغسل جهاز الديسكس بالماء أبداً؛ يمسح بقطعة قماش جافة فقط.',
        'يجب الالتزام بالجرعات بانتظام للحصول على أقصى استفادة علاجية.'
    ]
  },

// 54. Spiriva 18mcg Inhalation Capsules
  {
    id: 'spiriva-18mcg-30-caps', // Highlight: Green/English
    name: 'Spiriva 18mcg 30 inh. caps.',
    genericName: 'Tiotropium Bromide',
    concentration: '18 mcg',
    price: 403.25, 
    matchKeywords: [
        'copd', 'spiriva', 'tiotropium', 'handihaler', 'boehringer', 'bronchodilator', 'lama',
        'سبيريفا', 'تيوتروبيوم', 'سدة رئوية', 'موسع شعب طويل المفعول', 'ضيق تنفس مزمن'
    ],
    usage: 'علاج صيانة طويل الأمد لمرضى الانسداد الرئوي المزمن (COPD)، يساعد في فتح الشعب الهوائية وتقليل نوبات ضيق التنفس.',
    timing: 'مرة يومياً – علاج مستمر',
    category: Category.COPD,
    form: 'Inhalation Capsules',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 216) {
            return 'مخصص للبالغين (١٨+) بالسدة الرئوية؛ للأطفال يحتاج بروتوكولاً متخصصاً';
        }
        return 'كبسولة واحدة (١٨ ميكروجرام) بالاستنشاق عبر HandiHaler مرة يومياً في نفس الموعد – بدون اعتبار للأكل – علاج مستمر';
    },
    
    
    warnings: [
        'لا يستخدم لعلاج نوبات ضيق التنفس الحادة (ليس دواء طوارئ).',
        'يستخدم بحذر شديد مع مرضى الجلوكوما (المياه الزرقاء) أو تضخم البروستاتا.',
        'تشوش الرؤية أو ألم في العين: أوقف؛ أعد قياس ضغط العين (زرق، إعتام عدسة مع الاستخدام المديد).',
        'يجب الحفاظ على الكبسولات داخل الشريط ولا تخرج إلا عند الاستخدام مباشرة.'
    ]
  },

  // 55. Flixotide Diskus 50 mcg
  {
    id: 'flixotide-50-diskus-60-doses', // Highlight: Green/English
    name: 'Flixotide diskus 50mcg/dose accuhaler',
    genericName: 'Fluticasone Propionate',
    concentration: '50 mcg per dose',
    price: 36, 
    matchKeywords: [
        'asthma', 'respiratory', 'flixotide', 'diskus', 'accuhaler', 'fluticasone', 'gsk',
        'فليكسوتايد ٥٠', 'فليكسوتايد ديسكس', 'بخاخة بودرة للأطفال', 'حساسية صدر', 'كورتيزون وقائي'
    ],
    usage: 'علاج وقائي طويل الأمد لحالات حساسية الصدر والربو عند الأطفال والبالغين؛ يقلل الالتهاب ويمنع حدوث النوبات.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhalation Powder (Diskus)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'الديسكس لا يناسب الأطفال أقل من ٤ سنوات؛ يُفضّل البخاخة مع Spacer';
        }
        return 'بخة واحدة (٥٠ ميكروجرام) بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'دواء وقائي؛ لا يستخدم في نوبات ضيق التنفس المفاجئة.',
        'يجب المضمضة جيداً لتجنب الفطريات البيضاء في الفم.',
        'يجب الحفاظ على الجهاز جافاً تماماً ولا يمسح بقطعة قماش مبللة.',
        'الالتزام بالجرعة اليومية ضروري حتى في حالة عدم وجود أعراض.'
    ]
  },

  // 56. Rhinocort Aqua Nasal Spray
  {
    id: 'rhinocort-aqua-32mcg-120-doses', // Highlight: Green/English
    name: 'Rhinocort aqua 32mcg/dose nasal spray 120 doses',
    genericName: 'Budesonide',
    concentration: '32 mcg / dose',
    price: 83, 
    matchKeywords: [
        'allergy', 'nasal', 'rhinocort', 'budesonide', 'sinusitis', 'rhinitis', 'astrazeneca',
        'رينوكورت', 'رينوكورت اكوا', 'بخاخة انف', 'حساسية جيوب انفية', 'بوديسونيد', 'رشح مزمن'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي (الموسمي والدائم) وعلاج الزوائد الأنفية (Nasal Polyps).',
    timing: 'مرة يومياً صباحاً – علاج مستمر',
    category: Category.NASAL_ANTI_ALLERGY,
    form: 'Nasal Spray',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'للأطفال ٤–٥ سنوات: بختين مرتين يومياً؛ أقل من ٤ سنوات: يحتاج تقييماً متخصصاً';
        }
        if (ageMonths <= 144) {
            return 'بخة واحدة في كل فتحة أنف مرة يومياً (٦٤ ميكروجرام إجمالاً) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
        }
        return 'بختين في كل فتحة أنف مرة يومياً صباحاً (تُقلَّل لبخة عند التحسن) – بدون اعتبار للأكل – علاج مستمر';
    },
    
    
    warnings: [
        'يحتاج الدواء من ٢٤ إلى ٤٨ ساعة ليبدأ مفعوله الكامل، فلا تتوقع نتيجة فورية.',
        'يجب عدم تجاوز الجرعة المقررة لتجنب حدوث جفاف أو نزيف بالأنف.',
        'تجنب رش الدواء مباشرة على الحاجز الأنفي لتفادي حدوث تقرحات.',
        'يستخدم بحذر في حالات وجود عدوى فطرية أو فيروسية بالأنف غير معالجة.'
    ]
  },

  // 57. Seretide Evohaler 50/25
  {
    id: 'seretide-evohaler-50-25-120-doses', // Highlight: Green/English
    name: 'Seretide evohaler 50/25mcg 120 metered actuations',
    genericName: 'Salmeterol + Fluticasone Propionate',
    concentration: '25mcg + 50mcg per actuation',
    price: 198, 
    matchKeywords: [
        'asthma', 'respiratory', 'seretide', 'evohaler', 'gsk', 'salmeterol', 'fluticasone',
        'سيريتايد', 'سيريتايد بخاخة', 'سيريتايد ٥٠', 'حساسية صدر', 'موسع شعب وقائي', 'ضيق تنفس'
    ],
    usage: 'علاج وقائي ومنتظم لحالات الربو الشعبي وضيق التنفس؛ يجمع بين موسع شعب طويل المفعول وكورتيزون لتقليل الالتهاب.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.BRONCHODILATOR,
    form: 'Inhaler',

    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 48) {
            return 'للأطفال أقل من ٤ سنوات: بختين مرتين يومياً عبر Spacer؛ راقب الرعاف';
        }
        return 'بختين بالاستنشاق كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: [
        'هذه بخاخة وقائية (Preventer) ولا تستخدم في نوبات ضيق التنفس الحادة (Rescue).',
        'يجب عدم التوقف عن استخدامها فجأة حتى لو تحسنت الأعراض.',
        'للحصول على أقصى فائدة للأطفال، يفضل استخدامها مع جهاز (Spacer).',
        'المضمضة بعد الاستخدام ضرورية جداً للوقاية من بحة الصوت وفطريات الفم.'
    ]
  },

  
];

export const BRONCHODILATORS: Medication[] = RAW_BRONCHODILATORS.map(sanitizeMedication);
