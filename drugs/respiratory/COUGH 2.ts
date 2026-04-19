import { Category, Medication } from '../../types';

// Placeholder for cough group 2 medications
export const COUGH_2: Medication[] = [

    // 51. Pectipro Syrup
  {
    id: 'pectipro-syrup',
    name: 'Pectipro 0.3% Syrup 90ml',
    genericName: 'Ambroxol HCl',
    concentration: '15mg/5ml',
    price: 29.5, 
    matchKeywords: [
        'cough', 'mucolytic', 'ambroxol', 'expectorant', 'phlegm', 'pectipro',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'امبروكسول', 'بكتي برو', 'طارد بلغم'
    ],
    usage: 'مذيب للبلغم ومحسن لوظائف الشعب الهوائية، يساعد على تسييل المخاط اللزج وتسهيل خروجه.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally used for > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالة قرحة/التهاب المعدة أو ارتجاع شديد.',
        'قد يسبب اضطرابات معدية/غثيان أو طفح جلدي/حساسية (نادر). أوقفه وأعد التقييم عند ظهور حساسية.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة (بيانات محدودة).',
        'إذا استمرت الكحة أكثر من ٧ أيام أو صاحبها حرارة/ضيق نفس/بلغم صديدي أو دموي: أعد التقييم.',
        'يُحفظ بعيداً عن متناول الأطفال.'
    ]
  },

// 52. Ivy Leaf Syrup
  {
    id: 'ivy-leaf-syrup',
    name: 'Ivy Leaf Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 38, 
    matchKeywords: [
        'cough', 'herbal', 'mucolytic', 'expectorant', 'ivy leaf', 'bronchodilator',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي ليف'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد على تهدئة السعال وتحسين عملية التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً خاصة مع الجرعات الكبيرة (بسبب السوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة (بيانات العشبية محدودة).',
        'إذا استمرت الكحة أكثر من أسبوع أو ظهرت حمى/ضيق نفس/صفير: أعد التقييم.'
    ]
  },

  // 53. Vicksolytic Syrup (UPDATED DOSAGE)
  {
    id: 'vicksolytic-syrup',
    name: 'Vicksolytic Syrup 120ml',
    genericName: 'Ambroxol HCl',
    concentration: '15mg/5ml',
    price: 29, 
    matchKeywords: [
        'cough', 'mucolytic', 'ambroxol', 'expectorant', 'phlegm', 'vicksolytic',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'امبروكسول', 'فيكسوليتيك', 'طارد بلغم'
    ],
    usage: 'مذيب قوي للبلغم يعمل على تكسير الروابط المخاطية وتسهيل خروج البلغم مع الكحة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Strict age limit (6 years) as per latest instructions.
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال دون ٦ سنوات';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع استخدامه للأطفال دون سن ٦ سنوات لهذا المستحضر.',
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'الحمل: يفضل تجنبه خاصة في الثلث الأول إلا إذا التقييم يقتضي ذلك.',
        'قد يسبب اضطراباً معدياً أو تهيجاً بالحلق/الفم (أحياناً).',
        'راجِع الطبيب إذا استمرت الأعراض أو صاحبها ضيق نفس/حرارة/بلغم صديدي.'
    ]
  },
  // 54. Alveolin-P Syrup
  {
    id: 'alveolin-p-syrup',
    name: 'Alveolin-P Syrup 100ml',
    genericName: 'Guava + Tilia + Fennel Oil',
    concentration: 'Herbal Complex',
    price: 50, 
    matchKeywords: [
        'cough', 'herbal', 'guava', 'tilia', 'fennel', 'natural', 'alveolin',
        'كحة', 'سعال', 'اعشاب', 'جوافة', 'تيليو', 'شمر', 'الفولين', 'مكمل غذائي'
    ],
    usage: 'مكمل غذائي عشبي ملطف للجهاز التنفسي، يساعد على تهدئة الكحة وطرد البلغم بشكل طبيعي.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 3 years (due to Fennel oil).
    minAgeMonths: 36, // 3 Years
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) {
            return 'للأطفال أقل من ٣ سنوات: إن وُجد شكل مناسب استخدم ٢.٥–٥ مل ٢–٣×/يوم؛ وإلا احوّل.';
        }
        if (ageMonths < 144) { // 3 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى السكري (قد يحتوي على سكريات حسب المستحضر).',
        'لا يستخدم للأطفال أقل من ٣ سنوات إلا بإرشاد طبي.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة (بيانات العشبية محدودة).',
        'أوقفه وأعد التقييم عند ظهور حساسية/ضيق نفس أو استمرار الأعراض.'
    ]
  },

  // 55. Balsam Syrup
  {
    id: 'balsam-syrup',
    name: 'Balsam Syrup 120ml',
    genericName: 'Guava + Thyme + Tilia + Fennel Oil',
    concentration: 'Natural Formula',
    price: 75, 
    matchKeywords: [
        'cough', 'herbal', 'natural', 'expectorant', 'guava', 'thyme', 'balsam',
        'كحة', 'سعال', 'اعشاب', 'بلسم', 'جوافة', 'زعتر', 'طارد بلغم', 'ملطف'
    ],
    usage: 'مكمل غذائي عشبي شامل لتهدئة السعال، إذابة البلغم، وتحسين وظائف التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe > 3 years.
    minAgeMonths: 36, // 3 Years
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) {
            return 'للأطفال أقل من ٣ سنوات: إن وُجد شكل مناسب استخدم ٢.٥–٥ مل ٢–٣×/يوم؛ وإلا احوّل.';
        }
        if (ageMonths < 144) { // 3 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يحتوي على سكر/محليات (يُستخدم بحذر لمرضى السكري).',
        'لا يستخدم للأطفال أقل من ٣ سنوات إلا بإرشاد طبي.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة (بيانات العشبية محدودة).',
        'إذا استمرت الكحة/البلغم أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },

  // 56. Bisolvon 8mg Tablets
  {
    id: 'bisolvon-8mg-tablets',
    name: 'Bisolvon 8mg 20 Tab.',
    genericName: 'Bromhexine Hydrochloride',
    concentration: '8mg',
    price: 25, 
    matchKeywords: [
        'mucolytic', 'bromhexine', 'phlegm', 'bisolvon', 'expectorant',
        'مذيب للبلغم', 'بايسولفون', 'برومهيكسين', 'بلغم لزج', 'اقراص', 'طارد بلغم'
    ],
    usage: 'مذيب قوي للبلغم (البراند الأصلي)، يعمل على تسييل الإفرازات المخاطية اللزجة لتسهيل طردها.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Tablets',
    
    // SAFETY: Not recommended for young children in tablet form.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 144) { // Under 12
            return 'يفضل استخدام النسخة الشراب للأطفال';
        }
        // Adults and children over 12
        return 'قرص واحد ٨ مجم ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يُستخدم بحذر في حالات قرحة/التهاب المعدة (خصوصاً القرحة النشطة).',
        'يُستخدم بحذر لمرضى الربو/فرط التفاعل الشعبي.',
        'الحمل والرضاعة: يفضل تجنبه إلا إذا التقييم يقتضي ذلك.',
        'اشرب سوائل كافية لزيادة فعالية تسييل البلغم.'
    ]
  },

  // 57. Ivy Hirt Syrup
  {
    id: 'ivy-hirt-syrup',
    name: 'Ivy Hirt Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 38, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy hirt',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي هيرت'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تحسين التنفس وتهدئة نوبات السعال.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally used for > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا ظهر ضيق تنفس أو حمى أو بلغم صديدي/دموي: أعد التقييم فوراً.'
    ]
  },

  // 58. Dolo-D Oral Suspension (UPDATED DOSAGE & SAFETY)
  {
    id: 'dolo-d-suspension',
    name: 'Dolo-D Oral Susp. 115ml',
    genericName: 'Ibuprofen + Pseudoephedrine HCl',
    concentration: '100mg + 15mg / 5ml',
    price: 37, 
    matchKeywords: [
        'cold', 'flu', 'decongestant', 'analgesic', 'fever', 'runny nose', 'dolo-d',
        'برد', 'انفلونزا', 'احتقان', 'رشح', 'سخونية', 'مسكن', 'دولو دي', 'جيوب انفية'
    ],
    usage: 'خافض للحرارة ومسكن للألم ومضاد لاحتقان الأنف (للأطفال من سن ٦ سنوات).',
    timing: 'مرة يومياً – حسب التعليمات',
    category: Category.COLD_FLU,
    form: 'Oral Suspension',
    
    // SAFETY: Strictly NOT for children under 6 years as per instructions.
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 144, 
    minWeight: 20,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'غير مخصص للأطفال دون سن ٦ سنوات';
        }
        // Using weight primarily as requested, falling back to age logic
        if (weight >= 20 && weight < 40) {
            return '٥ - ٧.٥ مل كل ٦ ساعات عند الحاجة (لا تتجاوز ٤ جرعات يومياً)';
        }
        // Children 6-12 years 
        return '١٠ مل (ملعقتان صغيرتان) كل ٦ ساعات عند الحاجة (لا تتجاوز ٤ جرعات يومياً)';
    },
    
    
    warnings: [
        'ممنوع للأطفال تحت سن ٦ سنوات.',
        'لا تتجاوز ٤ جرعات خلال ٢٤ ساعة ولا تجمعه مع أي مسكنات/خافضات حرارة تحتوي على إيبوبروفين أو مزيلات احتقان أخرى.',
        'يُتجنب مع قرحة/نزيف معدي أو جفاف شديد أو مرض كلوي.',
        'السودوافدرين قد يرفع النبض/الضغط: يُستخدم بحذر في أمراض القلب/ارتفاع الضغط/فرط نشاط الغدة/الجلوكوما/احتباس بول أو تضخم بروستاتا (في المراهقين).',
        'تداخلات مهمة: يمنع استخدامه مع مثبطات MAOI خلال آخر ١٤ يوم، ويُحذر مع أدوية الضغط/المنشطات.',
        'الربو: يُتجنب إذا كانت هناك حساسية معروفة من مضادات الالتهاب غير الستيرويدية أو تدهور ربو مع NSAIDs.'
    ]
  },


  // 59. Monohexal Syrup
  {
    id: 'monohexal-syrup',
    name: 'Monohexal Syrup 120ml',
    genericName: 'Bromhexine Hydrochloride',
    concentration: '4mg/5ml',
    price: 75, 
    matchKeywords: [
        'mucolytic', 'bromhexine', 'phlegm', 'monohexal', 'expectorant', 'sandoz',
        'مذيب للبلغم', 'مونو هيكسال', 'برومهيكسين', 'بلغم لزج', 'طارد بلغم', 'سانتوز'
    ],
    usage: 'مذيب للبلغم عالي الجودة، يقلل لزوجة الإفرازات الشعبية ويسهل خروجها مع الكحة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: بجرعة صريحة حسب الوزن من الشراب إن وُجد؛ راقب التنفس/الوعي؛ وإلا احوّل.';
        }
        if (ageMonths < 60) { // 2 to 5 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 5 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'قد يزيد البلغم مؤقتاً في بداية العلاج (نتيجة تسييله)؛ اشرب سوائل كافية.',
        'يُستخدم بحذر لمرضى الربو/فرط التفاعل الشعبي.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 60. Nexibronch Syrup
  {
    id: 'nexibronch-syrup',
    name: 'Nexibronch Syrup 200ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 65, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'nexibronch',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'نيكسي برونش', 'حجم كبير'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية (عبوة اقتصادية)، يسهل التنفس ويهدئ نوبات السعال.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally used for > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب تأثيراً مليناً بسيطاً (سوربيتول) خاصة مع الجرعات الكبيرة.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الأعراض بعد ٧ أيام أو ظهر ضيق نفس/حرارة: أعد التقييم.'
    ]
  },
  // 61. Nexibronch with Honey Syrup
  {
    id: 'nexibronch-honey-syrup',
    name: 'Nexibronch with Honey Syrup 200ml',
    genericName: 'Dried Ivy Leaf Extract + Honey',
    concentration: '0.7g/100ml',
    price: 65, 
    matchKeywords: [
        'cough', 'mucolytic', 'ivy leaf', 'honey', 'herbal', 'nexibronch', 'soothing',
        'كحة', 'سعال', 'لبلاب', 'عسل', 'نيكسي برونش', 'مذيب للبلغم', 'ملطف للحلق'
    ],
    usage: 'مذيب للبلغم وموسع شعب طبيعي مضاف إليه العسل لتهدئة تهيج الحلق وتحسين الطعم.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Honey is generally not given to infants < 1 year.
    // Ivy leaf logic starts from 2 years for safety.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على عسل/سكر: يُستخدم بحذر لمرضى السكري.',
        'غير مناسب للأطفال أقل من سنتين (حسب هذا المستحضر). كما لا يُعطى العسل للرضع أقل من سنة.',
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'إذا لاحظت ظهور طفح جلدي أو ضيق تنفس، توقف عن استخدامه فوراً واطلب رعاية طبية.'
    ]
  },
  // 62. Helixbrom Syrup
  {
    id: 'helixbrom-syrup',
    name: 'Helixbrom Syrup 120ml',
    genericName: 'Ivy Leaf Extract + Bromhexine HCl',
    concentration: 'Herbal/Chemical Complex',
    price: 35, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'bromhexine', 'helixbrom',
        'كحة', 'سعال', 'لبلاب', 'برومهيكسين', 'مذيب للبلغم', 'طارد بلغم', 'هيليكس بروم'
    ],
    usage: 'تركيبة مزدوجة لإذابة البلغم اللزج وتوسيع الشعب الهوائية وتهدئة نوبات السعال.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Bromhexine. Generally > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 60) { // 2 to 5 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 5 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'قد يزداد البلغم مؤقتاً في البداية؛ اشرب سوائل كافية.',
        'الحمل والرضاعة: يفضل تجنبه إلا إذا التقييم يقتضي ذلك.',
        'أوقفه وأعد التقييم عند ظهور حساسية/ضيق نفس.'
    ]
  },
  // 63. Tussistop 60mg Tablets
  {
    id: 'tussistop-60mg-tablets',
    name: 'Tussistop 60mg 20 Tabs.',
    genericName: 'Levodropropizine',
    concentration: '60mg',
    price: 60, 
    matchKeywords: [
        'cough', 'dry cough', 'antitussive', 'hacking cough', 'levodropropizine', 'tussistop',
        'كحة', 'سعال', 'كحة ناشفة', 'توسيتوب', 'مهدئ للسعال', 'سعال جاف', 'شرقة'
    ],
    usage: 'مهدئ قوي للسعال الجاف (الناشف)، يعمل عن طريق تقليل حساسية مستقبلات الكحة في الجهاز التنفسي.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Tablets',
    
    // SAFETY: Not for children below 12 years in tablet form.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (_weight, _ageMonths) => '٦٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'غير مخصص للأطفال أقل من ١٢ سنة (أقراص).',
        'لا يُستخدم للكحة المصحوبة ببلغم كثيف/صديدي إلا بعد تقييم طبي (قد يحتاج العلاج لتصريف البلغم لا إيقاف السعال).',
        'يستخدم بحذر في القصور الكلوي الشديد.',
        'الحمل والرضاعة: يفضل تجنبه إلا إذا التقييم يقتضي ذلك.',
        'قد يسبب نعاساً/دوخة لدى بعض الأشخاص؛ تجنب القيادة والكحول ومهدئات أخرى إذا حدث نعاس.'
    ]
  },
  // 64. Inflamxir Oral Drops
  {
    id: 'inflamxir-drops',
    name: 'Inflamxir 30ml Drops',
    genericName: 'Alpha-chymotrypsin',
    concentration: '5mg / 1ml',
    price: 59, 
    matchKeywords: [
        'inflammation', 'swelling', 'edema', 'anti-inflammatory', 'enzyme', 'inflamxir',
        'التهاب', 'تورم', 'مضاد للالتهاب', 'إنفلامكسير', 'لوز', 'احتقان زور', 'نقط'
    ],
    usage: 'مضاد للالتهاب والتورم، يساعد في علاج حالات التهاب الحلق واللوزتين والتجمعات الدموية بعد الإصابات.',
    timing: 'كل ٨ ساعات – حسب التعليمات',
    category: Category.COLD_FLU, // OR Category.OTHER
    form: 'Oral Drops',
    
    // SAFETY: Safe for children under medical supervision.
    minAgeMonths: 6, 
    maxAgeMonths: 144, 
    minWeight: 7,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        // General dose: 10-15 drops 3 times daily
        if (ageMonths < 12) {
            return '٥ - ٨ نقط ٣ مرات يومياً (قبل الأكل)';
        }
        if (ageMonths < 60) { // 1 to 5 years
            return '١٠ نقط ٣ مرات يومياً (قبل الأكل)';
        }
        return '١٥ - ٢٠ نقط ٣ مرات يومياً (قبل الأكل)';
    },
    
    
    warnings: [
        'يمنع استخدامه في حالة وجود حساسية لمكونات الدواء.',
        'يُتجنب مع اضطرابات النزيف أو مع مميعات الدم/مضادات الصفائح؛ إن لزم الجمع فبأقل جرعة ومدة وتقييم مخاطر نزيف.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم يقل التورم/الألم خلال أيام أو ظهرت أعراض شديدة: أعد التقييم.'
    ]
  },

  // 65. Ivymond Syrup
  {
    id: 'ivymond-syrup',
    name: 'Ivymond Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 59, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivymond',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفيموند'
    ],
    usage: 'مذيب للبلغم وموسع للشعب الهوائية (بجودة عالمية)، يساعد على تهدئة السعال وتسهيل التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 66. Mini Guava N Oral Drops
  {
    id: 'mini-guava-n-drops',
    name: 'Mini Guava N Oral Drops 15ml',
    genericName: 'Guava Leaf + Tilia Extract',
    concentration: 'Natural Drops',
    price: 45, 
    matchKeywords: [
        'cough', 'herbal', 'pediatric', 'infant', 'guava', 'tilia', 'mini guava',
        'كحة', 'سعال', 'اعشاب', 'جوافة', 'تيليو', 'نقط اطفال', 'رضع', 'ميني جوافة'
    ],
    usage: 'مكمل غذائي عشبي في شكل نقط، يساعد على تهدئة الكحة وتحسين وظائف التنفس عند الرضع والأطفال.',
    timing: 'كل ٦ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Oral Drops',
    
    // SAFETY: Generally safe for infants > 6 months. 
    // Below 6 months should be under strict medical advice.
    minAgeMonths: 6, 
    maxAgeMonths: 72, // Up to 6 years
    minWeight: 7,
    maxWeight: 25,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6) {
            return 'للرضع أقل من ٦ أشهر: جرعة حسب الوزن من الشراب إن وُجد؛ وإلا احوّل.';
        }
        if (ageMonths < 12) { // 6 to 12 months
            return '٥ - ٧ نقط ٤ مرات يومياً';
        }
        if (ageMonths < 36) { // 1 to 3 years
            return '١٠ نقط ٤ مرات يومياً';
        }
        // Over 3 years
        return '١٥ نقط ٤ مرات يومياً';
    },
    
    
    warnings: [
        'للأطفال (خصوصاً أقل من سنتين): يُفضّل تقييم سبب الكحة قبل البدء (استبعاد ربو/عدوى/جسم غريب).',
        'أوقفه وأعد التقييم عند ظهور حساسية/صفير/ضيق نفس.',
        'إذا استمرت الكحة أكثر من ٣ أيام أو ظهرت سخونية/رفض رضاعة/خمول: أعد التقييم.',
        'لا تتجاوز الجرعة المقررة.'
    ]
  },

  // 67. Erdolytic 300mg Capsules
  {
    id: 'erdolytic-300mg-capsules',
    name: 'Erdolytic 300mg 20 Caps.',
    genericName: 'Erdosteine',
    concentration: '300mg',
    price: 124, 
    matchKeywords: [
        'mucolytic', 'erdosteine', 'expectorant', 'bronchitis', 'phlegm', 'erdolytic',
        'مذيب للبلغم', 'إردوليتيك', 'إردوستين', 'بلغم لزج', 'التهاب شعبي', 'كبسول'
    ],
    usage: 'مذيب متطور للبلغم، يعمل كمضاد للالتهاب ومضاد للأكسدة في الجهاز التنفسي، ويقلل من لزوجة المخاط.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Capsules',
    
    // SAFETY: For adults and adolescents > 15-18 years.
    minAgeMonths: 216, // 18 Years (Preferred for 300mg dose)
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    
    calculationRule: (_) => '٣٠٠ مجم (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'غير مخصص للأطفال (هذه الجرعة/الشكل).',
        'يُتجنب في القصور الكبدي الشديد ويُستخدم بحذر في القصور الكلوي الشديد (حسب التشخيص والتحاليل).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'قد يسبب اضطرابات معدية؛ يُستخدم بحذر مع قرحة/التهاب المعدة.'
    ]
  },
  // 68. Erdosolvine 300mg Capsules
  {
    id: 'erdosolvine-300mg-capsules',
    name: 'Erdosolvine 300mg 10 Caps.',
    genericName: 'Erdosteine',
    concentration: '300mg',
    price: 69, 
    matchKeywords: [
        'mucolytic', 'erdosteine', 'phlegm', 'expectorant', 'erdosolvine',
        'مذيب للبلغم', 'إردوسولفين', 'إردوستين', 'بلغم لزج', 'كبسول', 'طارد بلغم'
    ],
    usage: 'مذيب للبلغم ومضاد للالتهاب الشعبي، يعمل على تسييل المخاط اللزج وتسهيل خروجه مع حماية الرئة.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Capsules',
    
    // SAFETY: For adults and adolescents.
    minAgeMonths: 216, // 18 Years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    
    calculationRule: (_) => '٣٠٠ مجم (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'غير مخصص للأطفال تحت ١٨ سنة في شكل كبسولات.',
        'يُتجنب في القصور الكبدي الشديد ويُستخدم بحذر في القصور الكلوي الشديد.',
        'يستخدم بحذر مع قرحة/التهاب المعدة.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 69. Erdotinol 300mg Capsules
  {
    id: 'erdotinol-300mg-capsules',
    name: 'Erdotinol 300mg 10 Caps.',
    genericName: 'Erdosteine',
    concentration: '300mg',
    price: 13.5, 
    matchKeywords: [
        'mucolytic', 'erdosteine', 'phlegm', 'expectorant', 'erdotinol', 'cheap',
        'مذيب للبلغم', 'إردوتينول', 'إردوستين', 'بلغم لزج', 'كبسول', 'اقتصادي'
    ],
    usage: 'مذيب للبلغم (اقتصادي) يساعد على تكسير الروابط المخاطية وتسهيل خروج البلغم، مع تأثير مضاد للالتهاب الشعبي.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Capsules',
    
    // SAFETY: For adults.
    minAgeMonths: 216, // 18 Years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    
    calculationRule: (_) => '٣٠٠ مجم (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'غير مخصص للأطفال.',
        'يُتجنب في القصور الكبدي الشديد ويُستخدم بحذر في القصور الكلوي الشديد.',
        'يستخدم بحذر مع قرحة/التهاب المعدة.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 70. Farcolin Syrup
  {
    id: 'farcolin-syrup',
    name: 'Farcolin Syrup 120ml',
    genericName: 'Salbutamol (as Sulphate)',
    concentration: '2mg/5ml',
    price: 22, 
    matchKeywords: [
        'asthma', 'bronchodilator', 'salbutamol', 'shortness of breath', 'farcolin', 'wheezing',
        'موسع شعب', 'سالبوتامول', 'فاركولين', 'ضيق تنفس', 'نهجان', 'تزييق الصدر', 'حساسية'
    ],
    usage: 'موسع للشعب الهوائية لتخفيف الصفير/ضيق النفس المرتبط بتشنج الشعب (مثل الربو/التهاب الشعب مع صفير)، وليس مجرد كحة فقط.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH, // Or Category.ASTHMA if exists
    form: 'Syrup',
    
    // SAFETY: Not recommended for infants < 2 years without doctor's follow-up.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للرضع: جرعة حسب الوزن من الشراب إن وُجد (مثلاً ٠.٢٥–٠.٥ مل/كجم/جرعة ٢–٣×/يوم)؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ - ٤ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب رعشة/عصبية أو زيادة في ضربات القلب.',
        'يستخدم بحذر شديد لمرضى القلب/اضطراب النظم/ارتفاع الضغط أو فرط نشاط الغدة الدرقية.',
        'تداخلات مهمة: حاصرات بيتا (قد تقلل المفعول وتزيد التشنج)، أدوية منبهة، وMAOI/TCAs قد تزيد الأعراض القلبية.',
        'قد يسبب نقص بوتاسيوم خاصة مع مدرات البول/الكورتيزون بجرعات عالية (نادر)؛ إذا حدث ضعف/تقلصات شديدة: أعد التقييم واقرأ البوتاسيوم.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 71. Ivyton Syrup
  {
    id: 'ivyton-syrup',
    name: 'Ivyton Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 60, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivyton',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفيتون', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، مخصص لتهدئة السعال وتحسين وظائف الجهاز التنفسي.',
    timing: '٣ مرات يومياً.',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الأعراض لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 72. Caventol Syrup
  {
    id: 'caventol-syrup',
    name: 'Caventol Syrup 120ml',
    genericName: 'Ambroxol + Guaifenesin + Terbutaline',
    concentration: '15mg + 50mg + 1.25mg / 5ml',
    price: 49, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'bronchodilator', 'ambroxol', 'caventol',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'طارد بلغم', 'موسع شعب', 'كافينتول'
    ],
    usage: 'تركيبة ثلاثية لإذابة وطرد البلغم وتوسيع الشعب الهوائية، مما يسهل التنفس ويهدئ الكحة.',
    timing: '٣ مرات يومياً.',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Terbutaline (Bronchodilator). Generally > 6 years for safe OTC.
    // Below 6 years must be under doctor's supervision.
    minAgeMonths: 72, // 6 Years
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال دون ٦ سنوات إلا بعد تقييم وتحديد الجرعة';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب رعشة/خفقان أو عصبية (بسبب التربوتالين).',
        'يستخدم بحذر في أمراض القلب/اضطراب النظم/ارتفاع الضغط أو فرط نشاط الغدة الدرقية والسكري.',
        'تداخلات مهمة: حاصرات بيتا تقلل المفعول وقد تزيد التشنج، وMAOI/TCAs قد تزيد الأعراض القلبية.',
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'الحمل والرضاعة: يفضل تجنبه إلا إذا التقييم يقتضي ذلك.'
    ]
  },
  // 73. Ivy Herb Syrup
  {
    id: 'ivy-herb-syrup',
    name: 'Ivy Herb Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 60, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy herb',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي هيرب', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يعمل على تسييل المخاط وتسهيل التنفس وتهدئة الكحة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الكحة خلال أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 74. Ivycan Syrup
  {
    id: 'ivycan-syrup',
    name: 'Ivycan Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 55, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivycan',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفيكان', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف السعال وتسهيل طرد البلغم.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الأعراض لفترة طويلة أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 75. Ivyntol Syrup
  {
    id: 'ivyntol-syrup',
    name: 'Ivyntol Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 42, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivyntol',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفينتول', 'اقتصادي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تهدئة السعال وتسهيل التنفس بفعالية واقتصادية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالة وجود حساسية لمكونات اللبلاب.',
        'قد يسبب اضطرابات معدية أو تأثيراً مليناً بسيطاً.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا ظهرت أعراض حساسية (طفح/صفير/ضيق نفس) أوقفه واطلب رعاية طبية.'
    ]
  },
  // 76. Ziawet Syrup
  {
    id: 'ziawet-syrup',
    name: 'Ziawet Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 55, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ziawet',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'زياويت', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تحسين التنفس وتهدئة الكحة الناتجة عن التهابات الجهاز التنفسي.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهابات المعدة والقرحة.',
        'قد يسبب تأثيراً مليناً بسيطاً لبعض الحالات.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة: أعد التقييم.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة (بيانات العشبية محدودة).'
    ]
  },
  // 77. Cough Rest N Syrup
  {
    id: 'cough-rest-n-syrup',
    name: 'Cough Rest N Syrup 120ml',
    genericName: 'Guava Leaf + Tilia + Fennel Oil',
    concentration: 'Natural Formula',
    price: 31, 
    matchKeywords: [
        'cough', 'herbal', 'natural', 'expectorant', 'guava', 'tilia', 'cough rest',
        'كحة', 'سعال', 'اعشاب', 'كاف رست', 'جوافة', 'تيليو', 'طارد بلغم', 'ملطف'
    ],
    usage: 'مكمل غذائي عشبي مهدئ للسعال وطارد للبلغم، يساعد على تلطيف التهاب الحلق وتحسين التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 3 years.
    minAgeMonths: 36, // 3 Years
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) {
            return 'للأطفال أقل من ٣ سنوات: إن وُجد شكل مناسب استخدم ٢.٥–٥ مل ٢–٣×/يوم؛ وإلا احوّل.';
        }
        if (ageMonths < 144) { // 3 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يحتوي على سكر/محليات (يستخدم بحذر لمرضى السكري).',
        'لا يستخدم للأطفال أقل من ٣ سنوات إلا بإرشاد طبي.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة (بيانات العشبية محدودة).',
        'راجِع الطبيب إذا استمرت الأعراض أو ظهر ضيق نفس/صفير/حرارة.'
    ]
  },
  // 78. Guaiadesca Syrup
  {
    id: 'guaiadesca-syrup',
    name: 'Guaiadesca Syrup 120ml',
    genericName: 'Guaifenesin',
    concentration: '100mg/5ml',
    price: 33, 
    matchKeywords: [
        'expectorant', 'guaifenesin', 'phlegm', 'guaiadesca', 'productive cough',
        'طارد للبلغم', 'جوايديسكا', 'جوايفينيزين', 'كحة ببلغم', 'مذيب'
    ],
    usage: 'طارد للبلغم، يعمل على زيادة سيولة الإفرازات المخاطية في الرئة وتسهيل خروجها مع السعال.',
    timing: 'كل ٦ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe > 2 years, but some guidelines prefer > 6 years for OTC.
    minAgeMonths: 72, // 6 Years for safe self-medication
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'لا يستخدم للأطفال دون ٦ سنوات إلا بعد تقييم وتحديد الجرعة';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) كل ٤ ساعات عند الحاجة';
        }
        // Adults and > 12 years
        return '١٠ - ٢٠ مل (٢-٤ ملعقة صغيرة) كل ٤ ساعات عند الحاجة';
    },
    
    
    warnings: [
        'لا يستخدم للسعال المزمن (ربو/التدخين/ارتجاع) إلا بعد تقييم طبي.',
        'يُستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'تجنب جمعه مع أدوية برد/كحة أخرى تحتوي على نفس المكونات دون استشارة.',
        'راجِع الطبيب إذا استمرت الكحة > ٧ أيام أو صاحبها حرارة/ضيق نفس/بلغم صديدي أو دموي.'
    ]
  },
  // 79. Ivycare Syrup
  {
    id: 'ivycare-syrup',
    name: 'Ivycare Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 39, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivycare',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفيكير', 'فاركو'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف الكحة وتسهيل التنفس بفعالية واقتصادية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 80. Respovan Syrup
  {
    id: 'respovan-syrup',
    name: 'Respovan Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 60, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'respovan',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'ريسبوفان', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تحسين كفاءة التنفس وتهدئة نوبات السعال.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'في حالة ظهور ضيق نفس/صفير شديد أو تدهور سريع، توجه للطوارئ.'
    ]
  },
  // 81. Ivy Prandy Syrup
  {
    id: 'ivy-prandy-syrup',
    name: 'Ivy Prandy Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 60, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy prandy',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي براندي', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف السعال وتسهيل التنفس في حالات التهاب الشعب الهوائية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يلاحظ وجود رواسب بسيطة وهذا شائع في بعض المستحضرات العشبية (يُرج جيداً).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الحالة بعد أسبوع أو ظهر ضيق نفس/حرارة: أعد التقييم.'
    ]
  },
  // 82. Jo-cystein Syrup
  {
    id: 'jo-cystein-syrup',
    name: 'Jo-cystein Syrup 120ml',
    genericName: 'Acetylcysteine',
    concentration: '200mg/5ml',
    price: 58, 
    matchKeywords: [
        'mucolytic', 'acetylcysteine', 'phlegm', 'jo-cystein', 'expectorant',
        'مذيب للبلغم', 'جو سيستين', 'أسيتيل سيستين', 'بلغم لزج', 'طارد بلغم', 'كحة ببلغم'
    ],
    usage: 'مذيب قوي جداً للبلغم، يعمل على تكسير الروابط الكيميائية للمخاط اللزج لتسهيل طرده وتنظيف الجهاز التنفسي.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally for children > 2 years.
    minAgeMonths: 24, 
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'لا يوصى به للأطفال أقل من سنتين إلا حسب التشخيص والسن';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults
        return '٥ مل (ملعقة صغيرة) ٢ - ٣ مرات يومياً';
    },
    
    
    warnings: [
        'الربو/فرط التحسس الشعبي: يُستخدم بحذر وقد يسبب تشنجاً/صفيراً لدى بعض المرضى؛ أوقفه واطلب مساعدة طبية إذا حدث ضيق نفس.',
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'لا تجمع موسّع بلغم مع مهدئ سعال؛ إن لزم الجمع فاجعل الفاصل ٤–٦ ساعات وأقل مدة ممكنة.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 83. Ivy Leplap Syrup
  {
    id: 'ivy-leplap-syrup',
    name: 'Ivy Leplap Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 40, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy leplap',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي لبلاب', 'اقتصادي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، مخصص لتحسين التنفس وتهدئة السعال الناتج عن التهاب الشعب.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
 // 84. Justcil 300mg Tablets
  {
    id: 'justcil-tablets',
    name: 'Justcil 300mg 20 Tabs.',
    genericName: 'Acetylcysteine',
    concentration: '300mg',
    price: 90, 
    matchKeywords: [
        'mucolytic', 'acetylcysteine', 'phlegm', 'justcil', 'expectorant',
        'مذيب للبلغم', 'جستسيل', 'أسيتيل سيستين', 'بلغم لزج', 'طارد بلغم', 'أقراص'
    ],
    usage: 'مذيب قوي للبلغم (في شكل أقراص)، يعمل على تكسير لزوجة المخاط وتسهيل خروجه وتنظيف الصدر.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Tablets',
    
    // SAFETY: Adults and children > 12 years.
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (_weight, _ageMonths) => '٣٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'الربو/فرط التحسس الشعبي: يُستخدم بحذر وقد يسبب صفيراً لدى بعض المرضى.',
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'لا تجمع موسّع بلغم مع مهدئ سعال؛ إن لزم الجمع فاجعل الفاصل ٤–٦ ساعات وأقل مدة ممكنة.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 85. Ivy Honta Syrup
  {
    id: 'ivy-honta-syrup',
    name: 'Ivy Honta Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 48, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy honta',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي هونتا', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف السعال الجاف والمصحوب ببلغم وتحسين التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
// 87. Helixopan Syrup
  {
    id: 'helixopan-syrup',
    name: 'Helixopan Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 28, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'helixopan',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'هيليكسوبان', 'اقتصادي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية (خيار اقتصادي)، يساعد في تهدئة الكحة وتسهيل التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الكحة خلال أسبوع أو ظهر ضيق نفس/حرارة: أعد التقييم.'
    ]
  },

  // 88. Ivy-ral Syrup
  {
    id: 'ivy-ral-syrup',
    name: 'Ivy-ral Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 48, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy-ral',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي رال', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تهدئة الكحة وتحسين وظائف التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 89. Ivylife Syrup
  {
    id: 'ivylife-syrup',
    name: 'Ivylife Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 40, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivylife',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي لايف', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد على تلطيف السعال وتسهيل التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الكحة خلال أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 89. Ivylife Syrup
  {
    id: 'ivy-nistem-syrup',
    name: 'Ivy Nistem Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 48, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy nistem',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي نيستم', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف السعال الناتج عن التهاب الشعب الهوائية وتسهيل التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من ٧ أيام أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 92. Ivy Cyst Syrup
  {
    id: 'ivy-cyst-syrup',
    name: 'Ivy Cyst Syrup 100ml',
    genericName: 'Ivy Leaf + Acetylcysteine',
    concentration: 'Herbal & Chemical Mix',
    price: 65, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'acetylcysteine', 'ivy leaf', 'ivy cyst',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'لبلاب', 'إيفي سيست', 'بلغم لزج'
    ],
    usage: 'مذيب قوي للبلغم وموسع للشعب الهوائية، يجمع بين قوة الأعشاب والمواد الكيميائية لتنظيف الصدر وتسهيل التنفس.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Acetylcysteine.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال دون سنتين: إن وُجد شراب/قطرات بنفس المادة استخدم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) مرتين يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) مرتين لـ ٣ مرات يومياً';
    },
    
    
    warnings: [
        'الربو/فرط التحسس الشعبي: يُستخدم بحذر؛ إذا حدث ضيق نفس/صفير: أوقفه وأعد التقييم.',
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'لا تجمع موسّع بلغم مع مهدئ سعال؛ إن لزم الجمع فاجعل الفاصل ٤–٦ ساعات وأقل مدة ممكنة.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 93. Herbal Bronch N Syrup
  {
    id: 'herbal-bronch-n-syrup',
    name: 'Herbal Bronch N Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 75, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'herbal bronch',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'هيربال برونك', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع فعال للشعب الهوائية، يساعد في تحسين عملية التنفس وتهدئة نوبات السعال الجاف والمصحوب ببلغم.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الأعراض بعد ٧ أيام أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 94. Selgon Infant Suppositories
  {
    id: 'selgon-infant-supp',
    name: 'Selgon 10mg 6 Infant Supp.',
    genericName: 'Pipazethate',
    concentration: '10mg',
    price: 15, 
    matchKeywords: [
        'cough', 'dry cough', 'antitussive', 'selgon', 'suppository', 'infant',
        'كحة ناشفة', 'سيلجون', 'لبوس أطفال', 'مهدئ للسعال', 'شرقة', 'كحة تهيجية'
    ],
    usage: 'مهدئ قوي للسعال الجاف (الناشف) والتهيجي، يعمل على مركز الكحة لتوفير راحة سريعة خاصة قبل النوم.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Suppositories',
    
    // SAFETY: Generally for children > 2 years.
    minAgeMonths: 24, 
    maxAgeMonths: 144, // Up to 12 years (then use adult form)
    minWeight: 10,
    maxWeight: 40,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'لا يستخدم للأطفال أقل من سنتين إلا بعد تقييم وتحديد الجرعة';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return 'لبوسة واحدة ٢-٣ مرات يومياً';
        }
        // 6 to 12 years
        return 'لبوسة واحدة ٣ مرات يومياً';
    },
    
    
    warnings: [
        'لا يستخدم للكحة المصحوبة ببلغم كثيف/صديدي إلا بعد تقييم طبي.',
        'قد يسبب نعاساً/دوخة أو جفاف فم (قدرات مضادة للكولين)؛ تجنب أدوية مهدئة أخرى إلا بإرشاد طبي.',
        'يستخدم بحذر في الزرق (الجلوكوما) أو احتباس بول.',
        'إذا استمرت الكحة أكثر من ٧ أيام: أعد التقييم.'
    ]
  },

// 95. Ivy Paxal Syrup
  {
    id: 'ivy-paxal-syrup',
    name: 'Ivy Paxal Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 58, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy paxal',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي باكسال', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف السعال الجاف والمصحوب ببلغم وتحسين التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو صاحبها حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 96. Sputal Syrup
  {
    id: 'sputal-syrup',
    name: 'Sputal Syrup 100ml',
    genericName: 'Ambroxol + Guaifenesin',
    concentration: '15mg + 100mg / 5ml',
    price: 55, 
    matchKeywords: [
        'mucolytic', 'expectorant', 'ambroxol', 'guaifenesin', 'sputal', 'productive cough',
        'مذيب للبلغم', 'طارد للبلغم', 'سبيوتال', 'كحة ببلغم', 'امبروكسول', 'جوايفينيزين'
    ],
    usage: 'مذيب وطارد للبلغم مزدوج المفعول، يعمل على تسييل البلغم وتحفيز طرده من الشعب الهوائية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally for children > 2 years.
    minAgeMonths: 48, 
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'لا يستخدم للأطفال دون سنتين إلا بعد تقييم وتحديد الجرعة';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'لا تجمع موسّع بلغم مع مهدئ سعال؛ إن لزم الجمع فاجعل الفاصل ٤–٦ ساعات وأقل مدة ممكنة.',
        'قد يسبب اضطرابات معدية (غثيان/قيء)؛ اشرب سوائل كافية.',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 97. Inhalivy Syrup
  {
    id: 'inhalivy-syrup',
    name: 'Inhalivy Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 45, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'inhalivy',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إنهاليفي', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تحسين عملية التنفس وتهدئة السعال الناتج عن نزلات البرد.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا لم تتحسن الأعراض خلال ٧ أيام أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 98. Cortopect Syrup
  {
    id: 'cortopect-syrup',
    name: 'Cortopect Syrup 120ml',
    genericName: 'Acetylcysteine',
    concentration: '100mg/5ml',
    price: 65.9, 
    matchKeywords: [
        'mucolytic', 'acetylcysteine', 'phlegm', 'cortopect', 'expectorant',
        'مذيب للبلغم', 'كورتوبيكت', 'أسيتيل سيستين', 'بلغم لزج', 'طارد بلغم', 'كحة ببلغم'
    ],
    usage: 'مذيب للبلغم يعمل على تكسير الروابط الكيميائية للمخاط اللزج لتسهيل طرده وتنظيف الجهاز التنفسي.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Not for children under 2 years.
    minAgeMonths: 24, 
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) من ٢ لـ ٤ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults
        return '١٠ مل (ملعقة كبيرة) من ٢ لـ ٣ مرات يومياً';
    },
    
    
    warnings: [
        'الربو/فرط التحسس الشعبي: يُستخدم بحذر وقد يسبب صفيراً لدى بعض المرضى.',
        'يستخدم بحذر في حالات قرحة/التهاب المعدة.',
        'لا تجمع موسّع بلغم مع مهدئ سعال؛ إن لزم الجمع فاجعل الفاصل ٤–٦ ساعات وأقل مدة ممكنة.',
        'رائحة الدواء قد تكون نفاذة (شبه الكبريت) وهذا معروف مع الأسيتيل سيستئين.'
    ]
  },
  // 99. Ivy-grant Syrup
  {
    id: 'ivy-grant-syrup',
    name: 'Ivy-grant Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 28, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivy-grant',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي جرانت', 'توفير'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية (خيار اقتصادي جداً)، يساعد في تهدئة نوبات الكحة وتحسين التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  // 100. Ivywell Syrup
  {
    id: 'ivywell-syrup',
    name: 'Ivywell Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 35, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator', 'ivywell',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي ويل', 'طبيعي'
    ],
    usage: 'مذيب طبيعي للبلغم وموسع للشعب الهوائية، يساعد في تخفيف نوبات السعال وتسهيل عملية التنفس بفعالية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'للأطفال أقل من سنتين: إن وُجد شراب بنفس المادة استخدم ١.٥–٢.٥ مل ٢–٣×/يوم حسب الوزن؛ وإلا احوّل.';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالات التهاب/قرحة المعدة.',
        'قد يسبب اضطراباً معدياً أو تأثيراً مليناً بسيطاً (سوربيتول).',
        'الحمل والرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'إذا استمرت الكحة لأكثر من أسبوع أو ظهرت حرارة/ضيق نفس: أعد التقييم.'
    ]
  },
  



];

