import { Medication, Category } from '../../types';

export const COMMON_COLD_AND_FLU: Medication[] = [
  // 1. Panadol Cold & Flu Day
  {
    id: 'panadol-cold-flu-day-24-tabs',
    name: 'Panadol Cold & Flu Day 24 F.C. Tabs',
    genericName: 'Paracetamol + Phenylephrine Hydrochloride',
    concentration: '500mg + 5mg',
    price: 76, 
    matchKeywords: [
        'cold', 'flu', 'day', 'panadol', 'congestion', 'fever', 'headache', 'paracetamol',
        'بانادول', 'برد', 'إنفلونزا', 'احتقان أنف', 'خافض حرارة', 'مسكن', 'بانادول نهاري'
    ],
    usage: 'لتخفيف أعراض نزلات البرد/الإنفلونزا (ألم/صداع + حرارة) مع احتقان الأنف. تركيبة نهارية غالباً لا تسبب نعاساً.',
    timing: 'كل ٤–٦ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة';
        }
        // Adults and > 12 years
        return '١–٢ قرص كل ٤–٦ ساعات عند اللزوم (حد أقصى ٨ أقراص/٢٤ ساعة). لا تستخدمه أكثر من ٣ أيام للحرارة أو ٥ أيام للألم دون إعادة تقييم.';
    },
    
    
    warnings: [
        'الحمل: الباراسيتامول غالباً هو الخيار الأسلم للحرارة/الألم، لكن مزيلات الاحتقان (Phenylephrine) قد ترفع الضغط وتقلل تدفق الدم للرحم؛ تُجنب خصوصاً في الشهور الأولى إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'تداخلات: يُمنع مع مثبطات MAO خلال ١٤ يوم (خطر ارتفاع ضغط شديد). الحذر مع أدوية الضغط/القلب (قد تقل فاعليتها أو يرتفع الضغط).',
        'ممنوع الجمع مع أي دواء آخر يحتوي على باراسيتامول (خطر تسمم كبدي)، وتجنب الكحول/أمراض الكبد.',
        'يُتجنب/يُستخدم بحذر في: ضغط غير منضبط، أمراض شرايين القلب، فرط نشاط الغدة الدرقية، جلوكوما ضيقة الزاوية، تضخم البروستاتا/احتباس بول.'
    ]
  },

  // 2. Congestal Syrup
 {
    id: 'congestal-syrup-120ml',
    name: 'Congestal Syrup 120ml',
    genericName: 'Paracetamol + Chlorpheniramine Maleate + Pseudoephedrine HCl',
    concentration: '160mg + 1mg + 15mg / 5ml',
    price: 44, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'runny nose', 'congestal', 'syrup', 'congestion',
        'كونجستال', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'شراب برد للأطفال', 'احتقان'
    ],
    usage: 'لتخفيف أعراض البرد/الإنفلونزا: حرارة/ألم + رشح/عطس + احتقان أنف (مضاد هيستامين مُنوِّم + مزيل احتقان).',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Syrup',
    
    // SAFETY: Combination cold medicines are not preferred under 6 years.
    minAgeMonths: 72, // 6 Years
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات إلا بجرعة محددة حسب العمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب التركيبات المركبة. السودوافيدرين قد يرفع الضغط وقد يقلل تدفق الدم للرحم (تجنب خصوصاً أول ٣ شهور إلا للضرورة).',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب ومضادات الاحتقان الأخرى.',
        'يسبب نعاساً وجفاف فم؛ تجنب الكحول/المهدئات/مضادات الهيستامين الأخرى.',
        'ممنوع الجمع مع أي دواء باراسيتامول آخر (خطر كبد).',
        'يُتجنب/يُستخدم بحذر في: ضغط غير منضبط، أمراض قلب، فرط نشاط درقي، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },
  // 3. Congestal Tabs
  {
    id: 'congestal-20-tabs',
    name: 'Congestal 20 Tabs',
    genericName: 'Paracetamol + Chlorpheniramine Maleate + Pseudoephedrine HCl',
    concentration: '650mg + 4mg + 60mg',
    price: 50, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'runny nose', 'congestal', 'tabs', 'congestion', 'analgesic',
        'كونجستال', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان', 'مسكن للبرد', 'كونجستال أقراص'
    ],
    usage: 'لتخفيف أعراض البرد/الإنفلونزا: ألم/حرارة + رشح + احتقان أنف (قد يسبب نعاساً).',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم الشراب المخصص للأطفال';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة). لا تستخدمه أكثر من ٣ أيام للحرارة أو ٥ أيام للألم دون إعادة تقييم.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب التركيبات المركبة؛ مزيلات الاحتقان قد ترفع الضغط وتُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر تسمم كبدي).',
        'يسبب نعاساً؛ تجنب الكحول/المهدئات.',
        'يُتجنب/يُستخدم بحذر في: ضغط غير منضبط، أمراض قلب، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },

  // 4. Flurest N
{
    id: 'flurest-n-20-tabs',
    name: 'Flurest N 20 Tabs',
    genericName: 'Paracetamol + Chlorpheniramine + Pseudoephedrine + Caffeine',
    concentration: '500mg + 2mg + 30mg + 30mg',
    price: 32, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'headache', 'flurest', 'congestion', 'caffeine',
        'فلورست', 'فلورست ان', 'برد', 'إنفلونزا', 'رشح', 'صداع', 'سخونية', 'احتقان'
    ],
    usage: 'لتخفيف أعراض البرد/الإنفلونزا مع احتقان الأنف. وجود الكافيين قد يقلل النعاس لكنه قد يسبب أرقاً/خفقاناً.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة';
        }
        // Adults and > 12 years
        return '١ قرص كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٨ أقراص/٢٤ ساعة). تجنب الجرعات المسائية لو سبب أرق.';
    },

    warnings: [
        'الحمل: يُفضّل تجنب مزيلات الاحتقان (Pseudoephedrine) والكافيين الزائد؛ استخدم باراسيتامول فقط عند الحاجة بأقل جرعة وأقصر مدة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'ممنوع الجمع مع أي دواء باراسيتامول آخر (خطر كبد).',
        'قد يسبب خفقان/ارتفاع ضغط/أرق؛ يُتجنب في الضغط غير المنضبط واضطرابات النظم وفرط نشاط الغدة الدرقية.'
    ]
  },

  // 5. Panadol Acute Head Cold
 {
    id: 'panadol-acute-head-cold-20-tabs',
    name: 'Panadol Acute Head Cold 20 F.C. Tabs',
    genericName: 'Paracetamol + Phenylephrine Hydrochloride',
    concentration: '500mg + 5mg',
    price: 62, 
    matchKeywords: [
        'cold', 'flu', 'head cold', 'sinus pain', 'acute', 'panadol', 'congestion', 'headache',
        'بانادول', 'بانادول أكيوت', 'برد', 'إنفلونزا', 'صداع نصفي', 'جيوب أنفية', 'احتقان', 'ثقل الرأس'
    ],
    usage: 'لتخفيف ألم/صداع الجيوب الأنفية والحرارة مع احتقان الأنف (تركيبة نهارية غالباً لا تسبب نعاساً).',
    timing: 'كل ٤–٦ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة';
        }
        // Adults and > 12 years
        return '١–٢ قرص كل ٤–٦ ساعات عند اللزوم (حد أقصى ٨ أقراص/٢٤ ساعة). لا تستخدمه أكثر من ٣ أيام للحرارة أو ٥ أيام للألم دون إعادة تقييم.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل باراسيتامول فقط؛ مزيل الاحتقان قد يرفع الضغط ويُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد) وتجنب الكحول/أمراض الكبد.',
        'يُتجنب في الضغط غير المنضبط/أمراض القلب/فرط نشاط الغدة الدرقية/جلوكوما ضيقة الزاوية.'
    ]
  },

  // 6. Dolo-D Plus Suspension
  {
    id: 'dolo-d-plus-suspension',
    name: 'Dolo-d plus oral susp. 115 ml',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '100mg + 15mg / 5ml',
    price: 41, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'ibuprofen', 'decongestant', 'children', 'dolo-d', 'nasal congestion',
        'دولو دي', 'دولو دي بلس', 'برد للأطفال', 'سخونية', 'احتقان أنف', 'ايبوبروفين', 'خافض حرارة'
    ],
    usage: 'خافض حرارة ومسكن للآلام ومزيل لاحتقان الأنف، يساعد في تقليل تورم الممرات الأنفية وتسهيل التنفس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Suspension',
    
    // SAFETY: Decongestant combinations are not preferred under 6 years.
    minAgeMonths: 72,
    maxAgeMonths: 144, 
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يُنصح به للأطفال أقل من ٦ سنوات إلا حسب التشخيص والسن.';
        }
        if (ageMonths < 144) {
            return '٥ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: الإيبوبروفين يُتجنب خصوصاً في الثلث الثالث (قد يسبب غلق مبكر للقناة الشريانية/نقص السائل الأمنيوسي). مزيل الاحتقان قد يرفع الضغط؛ يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'تداخلات: لا يُجمع مع أي NSAID آخر (ديكلوفيناك/نابروكسين…) أو جرعات مسكنة من الأسبرين. الحذر مع مميعات الدم (يزيد نزيف).',
        'تداخلات: الحذر مع مدرات البول/ACEi/ARBs (قد يزيد تأثيره على الكُلى).',
        'يُتجنب في قرحة/نزيف معدة، قصور كُلى، ربو حساس للمسكنات، ضغط غير منضبط أو أمراض قلب.'
    ]
  },

  // 7. G.C. Mol Sachets
 {
    id: 'gc-mol-eff-sachets',
    name: 'G.C. Mol 6 Eff. Sachet',
    genericName: 'Paracetamol + Guaifenesin + Phenylephrine HCl',
    concentration: '325mg + 100mg + 5mg',
    price: 25, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'cough', 'expectorant', 'gc mol', 'effervescent', 'congestion',
        'جي سي مول', 'فوار برد', 'مذيب بلغم', 'سخونية', 'احتقان', 'باراسيتامول', 'فوار جي سي مول'
    ],
    usage: 'فوار سريع المفعول لعلاج أعراض البرد والإنفلونزا، وتخفيف احتقان الأنف، مع مادة مذيبة للبلغم.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Sachets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'كيس واحد كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أكياس/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل باراسيتامول فقط؛ مزيل الاحتقان (Phenylephrine) يُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'أعد التقييم إذا استمرت الكحة > ٧ أيام أو صاحبها صفير/ضيق نفس/بلغم دموي.'
    ]
  },

  // 8. Power Cold & Flu
 {
    id: 'power-cold-flu-20-tabs',
    name: 'Power cold & flu 20 tab.',
    genericName: 'Paracetamol + Caffeine + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 30mg + 2mg',
    price: 42, 
    matchKeywords: [
        'cold', 'flu', 'power', 'fever', 'congestion', 'headache', 'body aches',
        'باور', 'باور كولد اند فلو', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'تكسير الجسم'
    ],
    usage: 'تركيبة رباعية لعلاج أعراض البرد والإنفلونزا الشديدة، تكسير العظام، واحتقان الأنف.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٦ أقراص/٢٤ ساعة). تجنب جرعات المساء لو سبب أرق.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين/المنبهات في الحمل؛ استخدم باراسيتامول فقط بأقل جرعة وأقصر مدة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في الضغط غير المنضبط/أمراض القلب/فرط نشاط الغدة الدرقية/جلوكوما/تضخم بروستاتا.'
    ]
  },

  // 9. Rhinocalm Syrup
  {
    id: 'rhinocalm-syrup-120ml',
    name: 'Rhinocalm Syrup 120ml',
    genericName: 'Pseudoephedrine HCl + Triprolidine HCl',
    concentration: '30mg + 1.25mg / 5ml',
    price: 40, 
    matchKeywords: [
        'cold', 'flu', 'runny nose', 'sneezing', 'decongestant', 'rhinocalm', 'antihistamine',
        'رينوكالم', 'رينوكالم شراب', 'برد', 'رشح', 'زكام', 'احتقان أنف', 'عطس', 'تنشيف الرشح'
    ],
    usage: 'علاج فعال للرشح والزكام والعطس واحتقان الأنف، يقلل إفرازات الأنف المزعجة أثناء البرد.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Syrup',
    
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'يمنع استخدامه للأطفال أقل من ٦ سنوات إلا بأمر الطبيب المعالج';
        }
        if (ageMonths <= 144) { // 6 to 12 years
            return '٥ مل كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب مزيلات الاحتقان (Pseudoephedrine) خصوصاً في الشهور الأولى إلا للضرورة. ',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'يسبب نعاساً؛ تجنب الكحول/المهدئات/مضادات الهيستامين الأخرى.',
        'يُتجنب في الضغط غير المنضبط، أمراض شرايين القلب، جلوكوما ضيقة الزاوية، تضخم بروستاتا/احتباس بول.'
    ]
  },

  // 10. Rhinomol-S Syrup
  {
    id: 'rhinomol-s-syrup-120ml',
    name: 'Rhinomol-s syrup 120ml',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '125mg + 15mg + 1mg / 5ml',
    price: 31, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'runny nose', 'rhinomol', 'congestion', 'sneezing',
        'رينومول', 'رينومول اس', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'عطس'
    ],
    usage: 'خافض للحرارة ومسكن للألم ومزيل لاحتقان الأنف والرشح المرتبط بنزلات البرد والإنفلونزا.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Syrup',
    
    // SAFETY: Not recommended for children under 6 years without strict medical supervision.
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات إلا بجرعات معتمدة للعمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب التركيبات المركبة؛ مزيلات الاحتقان قد ترفع الضغط وتُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يسبب نعاساً؛ تجنب الكحول/المهدئات. يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول.'
    ]
  },

  // 11. Rhinopro Syrup
  {
    id: 'rhinopro-syrup-90ml',
    name: 'Rhinopro syrup 90ml',
    genericName: 'Pseudoephedrine + Carbinoxamine',
    concentration: '30mg + 2mg / 5ml',
    price: 36, 
    matchKeywords: [
        'cold', 'flu', 'runny nose', 'sneezing', 'rhinopro', 'congestion', 'allergy',
        'رينوبرو', 'رينوبرو شراب', 'برد', 'رشح', 'زكام', 'احتقان أنف', 'عطس', 'حساسية'
    ],
    usage: 'علاج قوي وفعال لحالات الرشح الشديد والزكام والعطس واحتقان الأنف.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Syrup',
    
    // SAFETY: Generally recommended for children 6 years and older.
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات إلا بجرعة محددة حسب العمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: مزيلات الاحتقان قد ترفع الضغط وتُجنب خصوصاً أول الحمل إلا للضرورة. ',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'يسبب نعاساً شديداً؛ تجنب الكحول/المهدئات.',
        'يُتجنب في الضغط غير المنضبط، أمراض شرايين القلب، جلوكوما ضيقة الزاوية، تضخم بروستاتا/احتباس بول.'
    ]
  },

  // 12. Nova-C-N
  {
    id: 'nova-c-n-20-tabs',
    name: 'Nova-C-N 20 Tabs',
    genericName: 'Paracetamol + Caffeine + Phenylephrine + Chlorpheniramine',
    concentration: '450mg + 30mg + 5mg + 2mg',
    price: 43, 
    matchKeywords: [
        'cold', 'flu', 'nova-c-n', 'fever', 'congestion', 'headache', 'mup',
        'نوفا سي ان', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف', 'مسكن'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا، تسكين الصداع، وتقليل الرشح واحتقان الأنف.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة دون تقييم الفائدة والخطر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة). تجنب أخذه قبل النوم لو سبب أرق.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب مزيل الاحتقان/الكافيين الزائد؛ استخدم باراسيتامول فقط بأقل جرعة وأقصر مدة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'قد يسبب أرق/خفقان أو نعاس؛ يُتجنب في الضغط غير المنضبط/أمراض القلب/فرط نشاط الغدة الدرقية/جلوكوما/تضخم بروستاتا.'
    ]
  },

  // 13. Trimed Flu
  {
    id: 'trimed-flu-20-tabs',
    name: 'Trimed flu 20 f.c. tabs.',
    genericName: 'Paracetamol + Loratadine + Pseudoephedrine',
    concentration: '500mg + 5mg + 60mg',
    price: 58, 
    matchKeywords: [
        'cold', 'flu', 'trimed flu', 'non-drowsy', 'congestion', 'runny nose', 'loratadine',
        'ترايمد فلو', 'برد', 'إنفلونزا', 'رشح', 'زكام', 'احتقان أنف', 'مش بينيم'
    ],
    usage: 'لتخفيف أعراض البرد/حساسية الأنف مع احتقان: باراسيتامول للألم/الحرارة + لوراتادين للحساسية + سودوافيدرين للاحتقان (غالباً غير مُنوِّم).',
    timing: 'كل ١٢ ساعة – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد مرتين يومياً (كل ١٢ ساعة) بحد أقصى قرصين في اليوم';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة. الباراسيتامول وحده غالباً يكفي للحرارة/الألم.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول أو مزيل احتقان آخر، ولا تجمعه مع مضادات حساسية أخرى.',
        'قد يسبب أرق/خفقان/ارتفاع ضغط؛ يُتجنب في الضغط غير المنضبط وأمراض القلب وفرط نشاط الغدة الدرقية.'
    ]
  },

  // 14. Cold Free
  {
    id: 'cold-free-20-tabs',
    name: 'Cold free 20 tab.',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '650mg + 60mg + 4mg',
    price: 50, 
    matchKeywords: [
        'cold', 'flu', 'cold free', 'fever', 'congestion', 'runny nose', 'analgesic',
        'كولد فري', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف', 'تكسير عظام'
    ],
    usage: 'علاج قوي وشامل لأعراض البرد والإنفلونزا، يسكن الآلام الشديدة، يخفض الحرارة، ويزيل الاحتقان والرشح.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years 
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٣ أقراص/٢٤ ساعة). لا تجمعه مع أي دواء برد/مسكن آخر يحتوي على باراسيتامول.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب مزيلات الاحتقان خصوصاً أول الحمل إلا للضرورة. ',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (جرعة عالية/خطر كبد).',
        'يُتجنب في الضغط غير المنضبط/أمراض شرايين القلب/جلوكوما/تضخم بروستاتا.'
    ]
  },

  // 15. Congestal Day
  {
    id: 'congestal-day-10-tabs',
    name: 'Congestal day 10 tabs.',
    genericName: 'Paracetamol + Pseudoephedrine Hydrochloride',
    concentration: '500mg + 60mg',
    price: 6, 
    matchKeywords: [
        'cold', 'flu', 'congestal', 'day', 'non-drowsy', 'fever', 'congestion',
        'كونجستال', 'كونجستال داي', 'كونجستال نهاري', 'برد', 'إنفلونزا', 'احتقان', 'مش بينيم'
    ],
    usage: 'مسكن للألم وخافض للحرارة ومزيل لاحتقان الأنف، مصمم بتركيبة لا تسبب النعاس لتناسب فترة النهار والعمل.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة). لا تستخدمه أكثر من ٣ أيام للحرارة أو ٥ أيام للألم دون إعادة تقييم.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل باراسيتامول فقط؛ السودوافيدرين قد يرفع الضغط ويُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في الضغط غير المنضبط/أمراض شرايين القلب/فرط نشاط الغدة الدرقية/جلوكوما/تضخم بروستاتا.'
    ]
  },

  // 16. Wellness
  {
    id: 'wellness-20-tabs',
    name: 'Wellness 20 F.C. Tabs',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 48, 
    matchKeywords: [
        'cold', 'flu', 'wellness', 'fever', 'congestion', 'runny nose', 'eva pharma',
        'ويلنس', 'ويلنس اقراص', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'علاج متكامل لأعراض البرد والإنفلونزا، بيسكن الألم ويخفض الحرارة ويعالج الرشح والزكام.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب التركيبات المركبة؛ مزيلات الاحتقان تُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'قد يسبب نعاساً؛ تجنب الكحول/المهدئات. يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول.'
    ]
  },

  // 17. Brufen Cold
 {
    id: 'brufen-cold-20-tabs',
    name: 'Brufen cold 20 f.c. tabs.',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '200mg + 30mg',
    price: 54, 
    matchKeywords: [
        'cold', 'flu', 'brufen', 'ibuprofen', 'decongestant', 'fever', 'headache', 'sinus',
        'بروفين', 'بروفين كولد', 'برد', 'إنفلونزا', 'سخونية', 'احتقان أنف', 'مسكن', 'ايبوبروفين'
    ],
    usage: 'مسكن قوي للآلام وخافض للحرارة ومزيل لاحتقان الأنف والجيوب الأنفية، فعال جداً في حالات تكسير الجسم.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٦ أقراص/٢٤ ساعة = ١٢٠٠ مجم إيبوبروفين).';
    },
    
    
    warnings: [
        'الحمل: الإيبوبروفين يُتجنب خصوصاً في الثلث الثالث (غلق مبكر للقناة الشريانية/نقص السائل الأمنيوسي). مزيل الاحتقان قد يرفع الضغط؛ استخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'تداخلات: لا يُجمع مع NSAIDs أخرى أو مميعات الدم/الأسبرين بجرعات مسكنة (يزيد نزيف/تهيج معدة).',
        'يُتجنب في قرحة/نزيف معدة، قصور كُلى، ربو حساس للمسكنات، ضغط غير منضبط/أمراض قلب.'
    ]
  },

// 18. Pentacold Syrup
  {
    id: 'pentacold-syrup-120ml',
    name: 'Pentacold syrup 120 ml',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '160mg + 15mg + 1mg / 5ml',
    price: 32, 
    matchKeywords: [
        'cold', 'flu', 'pentacold', 'fever', 'runny nose', 'congestion', 'children',
        'بينتاكولد', 'بينتا كولد', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'زكام'
    ],
    usage: 'علاج شامل لأعراض البرد والإنفلونزا للأطفال، يخفف السخونية والرشح واحتقان الأنف والعطس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Syrup',
    
    // SAFETY: Generally recommended for children 6 years and older.
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات إلا بجرعة محددة حسب العمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب التركيبات المركبة؛ مزيلات الاحتقان قد ترفع الضغط وتُجنب خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).'
    ]
  },

// 19. Rhinopro S.R. Capsules
  {
    id: 'rhinopro-sr-20-caps',
    name: 'Rhinopro s.r. 20 caps.',
    genericName: 'Pseudoephedrine + Carbinoxamine',
    concentration: '120mg + 4mg (Sustained Release)',
    price: 90, 
    matchKeywords: [
        'cold', 'flu', 'rhinopro', 'sr', 'sustained release', 'congestion', 'runny nose', 'long acting',
        'رينوبرو', 'رينوبرو كبسول', 'رينوبرو طويل المفعول', 'برد', 'رشح', 'زكام', 'احتقان أنف'
    ],
    usage: 'علاج ممتد المفعول للرشح والزكام واحتقان الأنف الشديد، مفعول الكبسولة الواحدة يستمر لمدة ١٢ ساعة.',
    timing: 'كل ١٢ ساعة – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Capsules',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'يمنع استخدامه للأطفال أقل من ١٢ سنة بسبب التركيز العالي للمواد الفعالة';
        }
        // Adults and > 12 years
        return 'كبسولة واحدة كل ١٢ ساعة (مرتين يومياً) مع كمية كافية من الماء';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً (Carbinoxamine)؛ تجنب القيادة/الكحول/المهدئات.',
        'يُتجنب في الضغط غير المنضبط/أمراض شرايين القلب/جلوكوما/تضخم بروستاتا/احتباس بول.'
    ]
  },

// 20. Sine-up Syrup
  {
    id: 'sine-up-syrup-120ml', // English
    name: 'Sine up syrup 120 ml',
    genericName: 'Paracetamol + Phenylephrine + Chlorpheniramine',
    concentration: '120mg + 5mg + 2mg / 5ml',
    price: 29, 
    matchKeywords: [
        'cold', 'flu', 'sine up', 'fever', 'congestion', 'runny nose', 'sneezing',
        'ساين اب', 'ساين أب', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'زكام'
    ],
    usage: 'علاج فعال لأعراض نزلات البرد والإنفلونزا، يعمل كخافض للحرارة، مزيل لاحتقان الأنف، ومضاد للرشح والعطس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // English
    form: 'Syrup',
    
    // SAFETY: Combination cold medicines are not preferred under 6 years.
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات إلا بجرعات معتمدة للعمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب مزيلات الاحتقان (Phenylephrine) خصوصاً في أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يسبب نعاساً (Chlorpheniramine)؛ تجنب الكحول/المهدئات. يُتجنب في جلوكوما/تضخم بروستاتا.'
    ]
  },

  // 21. Brufen Cold 10 Tablets
  {
    id: 'brufen-cold-10-tabs',
    name: 'Brufen cold 10 f.c. tabs.',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '200mg + 30mg',
    price: 27, 
    matchKeywords: [
        'cold', 'flu', 'brufen', 'ibuprofen', 'decongestant', 'fever', 'headache', 'sinus',
        'بروفين', 'بروفين كولد', 'برد', 'إنفلونزا', 'سخونية', 'احتقان أنف', 'مسكن', 'ايبوبروفين'
    ],
    usage: 'مسكن قوي للآلام ومضاد للالتهاب ومزيل لاحتقان الأنف، مثالي لآلام الجيوب الأنفية وتكسير الجسم.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٦ أقراص/٢٤ ساعة = ١٢٠٠ مجم إيبوبروفين).';
    },
    
    
    warnings: [
        'الحمل: الإيبوبروفين يُتجنب خصوصاً في الثلث الثالث (قد يسبب غلق مبكر للقناة الشريانية/نقص السائل الأمنيوسي). مزيلات الاحتقان قد ترفع الضغط؛ يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'تداخلات: لا يُجمع مع NSAIDs أخرى أو مميعات الدم (يزيد النزيف/تهيج المعدة). الحذر مع ACEi/ARBs ومدرات البول (قد يزيد الضغط على الكُلى).',
        'يُتجنب في: قرحة/نزيف معدة، قصور كُلى، ربو حساس للمسكنات، ضغط غير منضبط أو أمراض قلب.',
        'أعد التقييم إذا وُجد ألم شديد بالصدر/ضيق نفس/قيء دموي/براز أسود.'
    ]
  },


// 22. Antiflu Capsules
  {
    id: 'antiflu-20-caps',
    name: 'Antiflu 20 cap',
    genericName: 'Paracetamol + Phenylephrine HCl + Chlorpheniramine Maleate',
    concentration: '500mg + 5mg + 2mg',
    price: 38, 
    matchKeywords: [
        'cold', 'flu', 'antiflu', 'fever', 'runny nose', 'congestion', 'sneezing',
        'أنتي فلو', 'انتيفلو', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف', 'عطس'
    ],
    usage: 'تخفيف أعراض نزلات البرد والإنفلونزا، الرشح، العطس، واحتقان الأنف، مع خفض درجة الحرارة.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Capsules',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'كبسولة واحدة كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٣ كبسولات/٢٤ ساعة). لا تستخدمه أكثر من ٣ أيام للحرارة أو ٥ أيام للألم دون إعادة تقييم.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب التركيبات المركبة. مزيل الاحتقان (Phenylephrine) قد يرفع الضغط ويُجنب خصوصاً في أول الحمل إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم (خطر ارتفاع ضغط شديد). الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً (Chlorpheniramine)؛ تجنب الكحول/المهدئات والقيادة.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر تسمم كبدي).',
        'يُتجنب/يُستخدم بحذر في: ضغط غير منضبط، أمراض قلب، جلوكوما ضيقة الزاوية، تضخم بروستاتا/احتباس بول.'
    ]
  },


// 23. Cold Control Tablets
  {
    id: 'cold-control-20-tabs',
    name: 'Cold control 20 f.c.tab',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 32, 
    matchKeywords: [
        'cold', 'flu', 'cold control', 'fever', 'congestion', 'runny nose', 'analgesic',
        'كولد كنترول', 'كولد كنترول اقراص', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'لتخفيف أعراض البرد/الإنفلونزا (ألم/حرارة + رشح/عطس + احتقان). قد يسبب نعاساً.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً في الشهور الأولى إلا للضرورة. ',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في: ضغط غير منضبط، أمراض شرايين القلب، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },

// 24. Dolo-d Oral Suspension
  {
    id: 'dolo-d-suspension',
    name: 'Dolo-d oral susp. 115 ml',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '100mg + 15mg / 5ml',
    price: 37, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'ibuprofen', 'decongestant', 'children', 'dolo-d', 'nasal congestion',
        'دولو دي', 'دولو دي شراب', 'برد للأطفال', 'سخونية', 'احتقان أنف', 'ايبوبروفين', 'خافض حرارة'
    ],
    usage: 'خافض حرارة ومسكن للآلام ومزيل لاحتقان الأنف، يساعد في تقليل تورم الممرات الأنفية وتسهيل التنفس للأطفال.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Suspension',
    
    // SAFETY: Decongestant combinations are not preferred under 6 years.
    minAgeMonths: 72,
    maxAgeMonths: 144,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يُنصح به للأطفال أقل من ٦ سنوات إلا حسب التشخيص والسن.';
        }
        if (ageMonths < 144) {
            return '٥ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return 'للبالغين يُفضل الأقراص. إذا استُخدم: ١٠ مل كل ٦–٨ ساعات بعد الأكل (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: الإيبوبروفين يُتجنب خصوصاً في الثلث الثالث (غلق مبكر للقناة الشريانية/نقص السائل الأمنيوسي). مزيل الاحتقان قد يرفع الضغط؛ يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'تداخلات: لا يُجمع مع NSAIDs أخرى أو مميعات الدم. الحذر مع ACEi/ARBs ومدرات البول (قد يزيد تأثيره على الكُلى).',
        'يُتجنب في: قرحة/نزيف معدة، قصور كُلى، ربو حساس للمسكنات، ضغط غير منضبط أو أمراض قلب.',
        'ممنوع الجمع مع أي مزيل احتقان/برد آخر لتجنب خفقان/ارتفاع ضغط.'
    ]
  },


  // 25. Cevamol Effervescent Tablets
  {
    id: 'cevamol-12-eff-tabs',
    name: 'Cevamol 12 eff. tab.',
    genericName: 'Paracetamol + Vitamin C (Ascorbic Acid)',
    concentration: '1000mg + 333mg',
    price: 59, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'vitamin c', 'cevamol', 'effervescent', 'analgesic',
        'سيفامول', 'فوار سيفامول', 'سخونية', 'برد', 'فيتامين سي', 'مسكن', 'باراسيتامول فوار'
    ],
    usage: 'خافض سريع للحرارة ومسكن للألم، مع فيتامين سي لدعم المناعة أثناء نزلات البرد والإنفلونزا.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Effervescent Tablets',
    
    minAgeMonths: 144, // 12 Years (Due to high dose)
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة بسبب تركيز الباراسيتامول العالي (١٠٠٠ مجم)';
        }
        // Adults and > 12 years
        return 'قرص فوار واحد في نصف كوب ماء كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل/الرضاعة: الباراسيتامول غالباً الخيار الأسلم للحرارة/الألم عند الحاجة، لكن استخدم أقل جرعة لأقصر مدة .',
        'يحتوي القرص على ١٠٠٠ مجم باراسيتامول، لذا يمنع أخذ أي دواء آخر يحتوي على باراسيتامول معه.',
        'يستخدم بحذر شديد مع مرضى الكلى بسبب وجود أملاح الصوديوم وفيتامين سي بتركيز عالي.',
        'ممنوع لمرضى الفشل الكلوي أو حصوات الكلى المتكررة.',
        'راجع دوال الكبد.'
    ]
  },


// 26. Dolo-d Oral Suspension (Small Size)
 {
    id: 'dolo-d-suspension-60ml',
    name: 'Dolo-d oral susp. 60 ml',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '100mg + 15mg / 5ml',
    price: 25, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'ibuprofen', 'decongestant', 'children', 'dolo-d',
        'دولو دي', 'دولو دي شراب', 'برد للأطفال', 'سخونية', 'احتقان أنف', 'ايبوبروفين'
    ],
    usage: 'خافض حرارة ومسكن للألم ومزيل للاحتقان، يساعد في تحسين التنفس وتخفيف آلام الجسم الناتجة عن البرد.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, 
    form: 'Suspension',
    
    // Updated based on user instruction: Children under 6 years: Do not use
    minAgeMonths: 72, 
    maxAgeMonths: 144, 
    minWeight: 20,
    maxWeight: 43.0,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'ممنوع استخدامه للأطفال دون سن ٦ سنوات';
        }
        if (ageMonths >= 72 && ageMonths <= 144) {
            // Children 6 to 12 years (21.4-43.0 kg)
            return '١٠ مل كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return '١٠ مل كل ٦ ساعات (للبالغين يفضل استخدام الأقراص)';
    },
    
    
    warnings: [
        'ممنوع تماماً للأطفال أقل من ٦ سنوات.',
        'يمنع استخدامه للأطفال المصابين بحساسية الصدر (الربو).',
        'لا يستخدم في حالة وجود قرحة بالمعدة أو مشاكل في الكلى.',
        'يجب عدم تخطي الجرعة الموصى بها لتجنب خفقان/ارتفاع ضغط أو اضطرابات بالمعدة.'
    ]
  },

  // 27. Noflu Tablets
 {
    id: 'noflu-20-caps', // Highlight: Green/English
    name: 'Noflu 20 Capsules',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 36, 
    matchKeywords: [
        'cold', 'flu', 'noflu', 'fever', 'runny nose', 'congestion', 'analgesic',
        'نوفلو', 'نوفلو كبسول', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'لتخفيف أعراض البرد/الإنفلونزا (ألم/حرارة + رشح/احتقان). قد يسبب نعاساً.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Capsules',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        if (ageMonths < 192) {
            return 'لأعمار ١٢–١٥ سنة: كبسولة واحدة كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ كبسولات/٢٤ ساعة).';
        }
        return 'للبالغين: ١–٢ كبسولة كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٨ كبسولات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة. لا تتجاوزي الجرعات وأعدي التقييم عند اللزوم.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في: ضغط غير منضبط، أمراض شرايين القلب، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },



  // 28. Awadist Plus Tablets
  {
    id: 'awadist-plus-20-tabs', // Highlight: Green/English
    name: 'Awadist plus 20 f.c. tabs.',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 56, 
    matchKeywords: [
        'cold', 'flu', 'awadist', 'plus', 'fever', 'congestion', 'runny nose', 'adwia',
        'أوادست بلس', 'أوادست', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا، يعمل كخافض للحرارة، مسكن للآلام، ومضاد للرشح واحتقان الأنف.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في: ضغط غير منضبط، أمراض شرايين القلب، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },

// 29. Cetal Cold & Flu Caplets
  {
    id: 'cetal-cold-flu-20-caplets', // Highlight: Green/English
    name: 'Cetal cold & flu 20 caplets',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 36, 
    matchKeywords: [
        'cold', 'flu', 'cetal', 'eipico', 'fever', 'congestion', 'runny nose',
        'سيتال', 'سيتال كولد اند فلو', 'سيتال برد', 'برد', 'إنفلونزا', 'رشح', 'سخونية'
    ],
    usage: 'علاج فعال وشامل لأعراض نزلات البرد، الإنفلونزا، الصداع، الرشح، واحتقان الأنف.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Caplet',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول وضغط غير منضبط.'
    ]
  },

// 30. Coldatrexy Tablets
  {
    id: 'coldatrexy-30-tabs', // Highlight: Green/English
    name: 'Coldatrexy 30 f.c. tabs',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 63, 
    matchKeywords: [
        'cold', 'flu', 'coldatrexy', 'multi apex', 'fever', 'congestion', 'runny nose',
        'كولداتريكسي', 'كولداتريكسي اقراص', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'علاج أعراض نزلات البرد والإنفلونزا الشامل، يخفف الصداع، الحرارة، الرشح، واحتقان الأنف.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في: ضغط غير منضبط، أمراض قلب، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },



// 31. Dolo-D Tablets
  {
    id: 'dolo-d-20-tabs', // Highlight: Green/English
    name: 'Dolo-d 20 tab.',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '200mg + 30mg',
    price: 38, 
    matchKeywords: [
        'cold', 'flu', 'dolo-d', 'ibuprofen', 'decongestant', 'fever', 'headache',
        'دولو دي', 'دولو دي اقراص', 'برد', 'إنفلونزا', 'سخونية', 'احتقان أنف', 'ايبوبروفين'
    ],
    usage: 'مسكن قوي للآلام ومضاد للالتهاب ومزيل لاحتقان الأنف، مثالي لعلاج الصداع وآلام الجسم المصاحبة للبرد.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'أقل من ١٢ سنة: غير موصى به؛ استخدم بديل شراب بجرعة حسب العمر.';
        }
        return 'قرص واحد كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٦ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: الإيبوبروفين يُتجنب خصوصاً في الثلث الثالث. مزيل الاحتقان قد يرفع الضغط؛ يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'تداخلات: لا يُجمع مع NSAIDs أخرى أو مميعات الدم. الحذر مع ACEi/ARBs ومدرات البول.',
        'يُتجنب في قرحة/نزيف معدة، قصور كُلى، ربو حساس للمسكنات، ضغط غير منضبط/أمراض قلب.',
        'لا تجمعه مع أي مزيل احتقان/برد آخر.'
    ]
  },


// 32. Rhinocalm Tablets
  {
    id: 'rhinocalm-20-tabs', // Highlight: Green/English
    name: 'Rhinocalm 20 tabs.',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 56, 
    matchKeywords: [
        'cold', 'flu', 'rhinocalm', 'fever', 'congestion', 'runny nose', 'sneezing',
        'رينوكالم', 'رينو كالم', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف', 'عطس'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا، يسكن الألم ويخفض الحرارة ويعالج الرشح والزكام بفعالية.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول وضغط غير منضبط.'
    ]
  },

// 33. Stopadol Cold & Flu Capsules
  {
    id: 'stopadol-cold-flu-20-caps', // Highlight: Green/English
    name: 'Stopadol cold & flu 20 caps.',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 50, 
    matchKeywords: [
        'cold', 'flu', 'stopadol', 'hikma', 'fever', 'congestion', 'runny nose',
        'ستوبادول', 'ستوبادول كولد اند فلو', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'علاج شامل وفعال لأعراض البرد والإنفلونزا، يعمل على تسكين الآلام وخفض الحرارة وتقليل الرشح والزكام.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Capsules',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'كبسولة واحدة كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٣ كبسولات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في: ضغط غير منضبط، أمراض قلب، جلوكوما، تضخم بروستاتا/احتباس بول.'
    ]
  },

// 34. 1 2 3 (One Two Three) Syrup
  {
    id: 'one-two-three-syrup-120ml', // Highlight: Green/English
    name: '1 2 3 (one two three) syrup 120 ml',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '160mg + 15mg + 1mg / 5ml',
    price: 32, 
    matchKeywords: [
        'cold', 'flu', '1 2 3', 'one two three', 'fever', 'runny nose', 'congestion',
        'وان تو ثري', '١٢٣ شراب', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'زكام'
    ],
    usage: 'علاج شامل لأعراض البرد والإنفلونزا للأطفال؛ يخفض الحرارة، يزيل الاحتقان، ويوقف الرشح والعطس.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Syrup',
    
    // SAFETY: Following the modern guideline (Not for children under 6 years)
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات ؛ استخدم بديلاً حسب العمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return 'للبالغين: ١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب المهدئات/الكحول. راقب الطفل لتفادي السقوط/الدوخة.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).'
    ]
  },

// 35. Comtrex Acute Head Cold
  {
    id: 'comtrex-acute-head-cold-20-tabs', // Highlight: Green/English
    name: 'Comtrex acute head cold 20 f.c.tab.',
    genericName: 'Paracetamol + Pseudoephedrine Hydrochloride',
    concentration: '500mg + 30mg',
    price: 62, 
    matchKeywords: [
        'cold', 'flu', 'comtrex', 'acute', 'head cold', 'non-drowsy', 'congestion', 'headache',
        'كومتركس', 'كومتركس الاحمر', 'صداع البرد', 'برد', 'إنفلونزا', 'احتقان', 'مش بينيم'
    ],
    usage: 'علاج فعال وسريع لصداع البرد والإنفلونزا واحتقان الأنف، يتميز بتركيبة لا تسبب النعاس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة). تجنب أخذه قبل النوم لو سبب أرق.';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'قد يسبب خفقان/أرق وارتفاع ضغط؛ يُتجنب في الضغط غير المنضبط وأمراض القلب وفرط نشاط الغدة الدرقية.'
    ]
  },

// 36. Dolo-D Plus Tablets
  {
    id: 'dolo-d-plus-20-tabs', // Highlight: Green/English
    name: 'Dolo-d plus 20 tabs.',
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride',
    concentration: '400mg + 60mg',
    price: 42, 
    matchKeywords: [
        'cold', 'flu', 'dolo-d plus', 'ibuprofen 400', 'decongestant', 'strong pain killer',
        'دولو دي بلس', 'دولو دي بلس اقراص', 'برد شديد', 'تكسير عظام', 'احتقان شديد', 'ايبوبروفين ٤٠٠'
    ],
    usage: 'لتخفيف ألم/التهاب مع احتقان أنف/جيوب (تركيز عالي: Ibuprofen 400mg + Pseudoephedrine 60mg).',
    timing: 'كل ٨–١٢ ساعة – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years (Due to high concentration)
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'ممنوع استخدامه للأطفال أقل من ١٢ سنة؛ يفضل استخدام النسخة الشراب أو الدولو دي العادي بجرعات محسوبة';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ أو ١٢ ساعة (الحد الأقصى ٣ أقراص في اليوم لسلامة المعدة والضغط)';
    },
    
    
    warnings: [
        'الحمل: الإيبوبروفين يُتجنب خصوصاً في الثلث الثالث. السودوافيدرين قد يرفع الضغط؛ يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'تداخلات: لا يُجمع مع NSAIDs أخرى أو مميعات الدم. الحذر مع ACEi/ARBs ومدرات البول (تأثير على الكُلى/الضغط).',
        'يُتجنب في قرحة/نزيف معدة، قصور كُلى، ربو حساس للمسكنات، ضغط غير منضبط/أمراض قلب.',
        'لا تجمعه مع أي مزيل احتقان آخر لتجنب خفقان/ارتفاع ضغط.'
    ]
  },

// . Pentaflu Syrup
  {
    id: 'pentaflu-syrup-100ml', // Highlight: Green/English
    name: 'Pentaflu syrup 100 ml',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '160mg + 15mg + 1mg / 5ml',
    price: 34, 
    matchKeywords: [
        'cold', 'flu', 'pentaflu', 'fever', 'runny nose', 'congestion', 'sneezing',
        'بينتافلو', 'بينتا فلو', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'زكام'
    ],
    usage: 'علاج فعال وشامل لأعراض البرد والإنفلونزا للأطفال؛ يعمل كخافض للحرارة، ومضاد للرشح والعطس ومزيل للاحتقان.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Syrup',
    
    // SAFETY: Not recommended for children under 6 years to ensure safety.
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات؛ استخدم بديلاً حسب العمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return 'للبالغين: ١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب المهدئات/الكحول. راقب الطفل لتفادي السقوط.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).'
    ]
  },

// 38. Awadist Cold & Flu Tablets
  {
    id: 'awadist-cold-flu-20-tabs', // Highlight: Green/English
    name: 'Awadist cold & flu 20 f.c. tabs.',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 48, 
    matchKeywords: [
        'cold', 'flu', 'awadist', 'adwia', 'fever', 'congestion', 'runny nose',
        'أوادست كولد اند فلو', 'أوادست', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'تخفيف أعراض نزلات البرد والإنفلونزا، يسكن الألم، يخفض الحرارة، ويعالج الرشح واحتقان الأنف.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يفضل استخدامه للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول وضغط غير منضبط.'
    ]
  },

// 39. 1 2 3 (One Two Three) Tablets
  {
    id: 'one-two-three-20-tabs', // Highlight: Green/English
    name: '1 2 3 (one two three) 20 f.c.tabs.',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '500mg + 30mg + 2mg',
    price: 40, 
    matchKeywords: [
        'cold', 'flu', '1 2 3', 'one two three', 'fever', 'congestion', 'runny nose', 'hikma',
        'وان تو ثري', '١٢٣ اقراص', '١٢٣', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف'
    ],
    usage: 'لتخفيف أعراض البرد/الإنفلونزا (ألم/حرارة + رشح/عطس + احتقان). قد يسبب نعاساً.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'أقل من ١٢ سنة: غير موصى به؛ استخدم بديل شراب بجرعة حسب العمر.';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب القيادة/الكحول/المهدئات.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).',
        'يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول وضغط غير منضبط.'
    ]
  },

  // 40. Night & Day N Tablets
  {
    id: 'night-and-day-n-10-tabs', // Highlight: Green/English
    name: 'Night & day n 10 f.c. tabs.',
    genericName: 'Day: (Paracetamol + Pseudoephedrine) | Night: (Paracetamol + Diphenhydramine)',
    concentration: 'Day: 500mg/60mg | Night: 500mg/25mg',
    price: 19, 
    matchKeywords: [
        'cold', 'flu', 'night and day', 'night & day', 'gsk', 'fever', 'congestion',
        'نايت اند داي', 'نايت آند داي', 'برد', 'إنفلونزا', 'رشح', 'سخونية', 'احتقان أنف', 'منوم'
    ],
    usage: 'نظام علاجي متكامل؛ أقراص النهار تخفف الاحتقان والصداع بدون نعاس، وأقراص الليل تخفف الأعراض وتساعد على النوم الهادئ.',
    timing: 'نهار عند الحاجة + ليل قبل النوم',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'نهاراً: قرص أبيض كل ٦–٨ ساعات عند اللزوم (حد أقصى ٣ أقراص نهار/٢٤ ساعة). ليلاً: قرص أزرق واحد قبل النوم فقط.';
    },
    
    
    warnings: [
        'قرص الليل يسبب النعاس الشديد؛ لذا يمنع تماماً استخدامه قبل القيادة.',
        'الحمل: يُفضّل تجنب مزيلات الاحتقان خصوصاً أول الحمل إلا للضرورة. مضاد الهيستامين الليلي قد يسبب نعاساً شديداً.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. تجنب الكحول/المهدئات خصوصاً مع قرص الليل.',
        'ممنوع استخدامه مع أي أدوية أخرى تحتوي على باراسيتامول لتجنب زيادة الجرعة.',
        'يُتجنب في جلوكوما/تضخم بروستاتا/احتباس بول، ويُستخدم بحذر في الضغط غير المنضبط وأمراض القلب.'
    ]
  },


// 41. Awadist Cold & Flu Day Tablets
  {
    id: 'awadist-day-20-tabs', // Highlight: Green/English
    name: 'Awadist cold & flu day 20 f.c. tabs.',
    genericName: 'Paracetamol + Pseudoephedrine Hydrochloride',
    concentration: '500mg + 30mg',
    price: 38, 
    matchKeywords: [
        'cold', 'flu', 'awadist day', 'non-drowsy', 'fever', 'congestion', 'headache',
        'أوادست نهار', 'أوادست داي', 'برد نهارا', 'إنفلونزا', 'احتقان', 'مش بينيم', 'صداع'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا النهارية؛ يسكن الألم ويخفض الحرارة ويزيل احتقان الأنف والجيوب الأنفية بدون نعاس.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return 'قرص واحد كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).';
    },
    
    
    warnings: [
        'قد يسبب أرق/خفقان لدى بعض الأشخاص (مزيل احتقان).',
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب والمنبهات.',
        'ممنوع استخدامه مع أي أدوية أخرى تحتوي على باراسيتامول لتجنب زيادة الجرعة على الكبد.'
    ]
  },

// 42. Rhinotus Syrup
  {
    id: 'rhinotus-syrup-90ml', // Highlight: Green/English
    name: 'Rhinotus syrup 90ml',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '160mg + 15mg + 1mg / 5ml',
    price: 45, 
    matchKeywords: [
        'cold', 'flu', 'rhinotus', 'amoun', 'fever', 'runny nose', 'congestion',
        'رينوتس', 'رينوتس شراب', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'زكام'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا للأطفال؛ يعمل كخافض للحرارة، ومسكن للألم، ومضاد للرشح والعطس ومزيل للاحتقان.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Syrup',
    
    // SAFETY: Not for children under 6 years as per current guidelines for pseudoephedrine.
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات ؛ استخدم بديلاً حسب العمر المختص';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return 'للبالغين: ١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب المهدئات/الكحول. راقب الطفل لتفادي السقوط.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).'
    ]
  },
// 43. Panadol Night Tablets
  {
    id: 'panadol-night-20-tabs', // Highlight: Green/English
    name: 'Panadol night 20 f.c. tabs.',
    genericName: 'Paracetamol + Diphenhydramine Hydrochloride',
    concentration: '500mg + 25mg',
    price: 48, 
    matchKeywords: [
        'pain', 'sleep', 'panadol', 'night', 'insomnia', 'analgesic', 'fever',
        'بانادول نايت', 'بانادول الازرق', 'نوم', 'مسكن ليلي', 'صداع', 'الم'
    ],
    usage: 'مسكن للألم مع مضاد هيستامين مُنوِّم يساعد على النوم عندما يمنع الألم المريض من النوم.',
    timing: 'قرصين قبل النوم – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) {
            return 'لا يستخدم للأطفال أقل من ١٢ سنة؛ استخدم بديلاً حسب العمر';
        }
        // Adults and > 12 years
        return '٢ قرص معاً قبل النوم بـ ٢٠ دقيقة (الحد الأقصى قرصين فقط في الـ ٢٤ ساعة من هذا النوع)';
    },
    
    
    warnings: [
        'الحمل: يُستخدم عند الضرورة فقط وبأقل جرعة وأقصر مدة. مضادات الهيستامين المُنوِّمة قد تسبب نعاساً شديداً.',
        'يسبب النعاس الشديد؛ لذا يمنع تماماً القيادة أو العمل على ماكينات بعد تناوله.',
        'لا تتجاوز الجرعة المحددة (قرصين)، ولا تتناول معه أي دواء آخر يحتوي على باراسيتامول.',
        'يستخدم بحذر مع: تضخم البروستاتا/احتباس بول، جلوكوما ضيقة الزاوية، كبار السن، أو مشاكل صدرية مزمنة.',
        'تجنب تناوله مع المشروبات الكحولية أو المهدئات الأخرى.'
    ]
  },

// 44. Westoflow Oral Suspension
  {
    id: 'westoflow-syrup-120ml', // Highlight: Green/English
    name: 'Westoflow oral susp. 120 ml',
    genericName: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    concentration: '160mg + 15mg + 1mg / 5ml',
    price: 17, 
    matchKeywords: [
        'cold', 'flu', 'westoflow', 'western', 'fever', 'runny nose', 'congestion',
        'ويستوفلو', 'ويستو فلو', 'برد للأطفال', 'رشح', 'سخونية', 'احتقان أنف', 'دواء برد رخيص'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا للأطفال؛ يعمل كخافض للحرارة ومضاد للرشح والعطس ومزيل للاحتقان بسعر اقتصادي.',
    timing: 'كل ٨ ساعات – عند الحاجة',
    category: Category.COLD_FLU, // Highlight: Green/English
    form: 'Suspension',
    
    // SAFETY: Following the standard safety rule (Not for children under 6 years)
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال أقل من ٦ سنوات؛ استخدم بديلاً حسب العمر';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
        }
        return 'للبالغين: ١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
    },
    
    
    warnings: [
        'الحمل: يُفضّل تجنب السودوافيدرين خصوصاً أول الحمل إلا للضرورة.',
        'تداخلات: ممنوع مع مثبطات MAO خلال ١٤ يوم. الحذر مع أدوية الضغط/القلب.',
        'يسبب نعاساً؛ تجنب المهدئات/الكحول. راقب الطفل لتفادي السقوط.',
        'ممنوع الجمع مع أي منتج باراسيتامول آخر (خطر كبد).'
    ]
  },

  

];

