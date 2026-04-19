import { Category, Medication } from '../../types';

// Placeholder for cough group 1 medications
export const COUGH_1: Medication[] = [

// 1. Bronchicum Elixir
  {
    id: 'bronchicum-elixir',
    name: 'Bronchicum Elixir S 100ml Syrup',
        genericName: 'Thyme Extract + Primula Root Extract',
    concentration: 'Liquid Extract',
    price: 69, 
    matchKeywords: [
        'cough', 'expectorant', 'bronchitis', 'herbal', 'wet cough', 'mucolytic',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'كحة صدرية', 'اعشاب', 'نزلة شعبية'
    ],
    usage: 'مذيب وطارد للبلغم ومهدئ للسعال (مكونات عشبية طبيعية).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH, // Ensure this matches your Enum definition
    form: 'Syrup',
    
    // SAFETY: Generally safe, but contains alcohol (ethanol). 
    // Recommended age > 4 years.
    minAgeMonths: 48, 
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) { // 4 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) من ٣ لـ ٤ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) من ٣ لـ ٤ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) من ٣ لـ ٤ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على نسبة كحول (إيثانول)، يفضل عدم استخدامه للأطفال أقل من ٤ سنوات إلا باستشارة.',
        'يحتوي على سكروز وشربات الجلوكوز (يستخدم بحذر لمرضى السكري).',
        'يستخدم بحذر لمرضى التهابات المعدة والقرحة (بسبب مادة الزعتر).',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'أعد التقييم إذا استمرت الكحة أكثر من أسبوع أو صاحَبها صفير/ضيق نفس/سخونية عالية.',
        'مدة الصلاحية بعد فتح العبوة هي ٣ شهور فقط.'
    ]
  },


  // 2. Ivy Zad Syrup
  {
    id: 'ivy-zad-syrup',
    name: 'Ivy Zad Syrup 120ml',
    genericName: 'Ivy Leaf + Thyme + Licorice Extracts',
    concentration: 'Herbal Complex',
    price: 65,
    matchKeywords: [
        'cough', 'herbal', 'expectorant', 'bronchospasm', 'dry cough', 'wet cough',
        'كحة', 'سعال', 'بلغم', 'موسع للشعب', 'لبلاب', 'زعتر', 'كحة ناشفة'
    ],
    usage: 'مكمل غذائي عشبي (لبلاب + زعتر) لتحسين وظائف الشعب الهوائية وتهدئة السعال.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Thyme & Licorice. 
    // Recommended generally for > 2 years. Infants < 1 year need doctor supervision.
    minAgeMonths: 24, // 2 Years (Safe conservative limit for Thyme mixes)
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى ارتفاع ضغط الدم أو نقص البوتاسيوم (بسبب احتوائه على العرقسوس).',
        'قد يزيد خطر نقص البوتاسيوم مع مدرات البول/الكورتيزون/الديجوكسين: راقب البوتاسيوم وراجع التفاعلات.',
        'يستخدم بحذر لمرضى التهابات المعدة (بسبب الزعتر).',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ تجنبي العرقسوس في الحمل (نقص بوتاسيوم/احتباس صوديوم).',
        'قد يسبب ليونة بالبراز/اضطراب معدة عند زيادة الجرعة.'
    ]
  },

  // 3. Ivypront Syrup
  {
    id: 'ivypront-syrup',
    name: 'Ivypront 0.84gm/100ml Syrup',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.84g/100ml',
    price: 57,
    matchKeywords: [
        'cough', 'expectorant', 'herbal', 'mucolytic', 'bronchospasm', 'dry cough',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'لبلاب', 'موسع للشعب', 'صدر'
    ],
    usage: 'مذيب للبلغم ومهدئ للكحة (خلاصة أوراق اللبلاب النقية).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Ivy Leaf is generally safe for infants > 6 months.
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 7, 
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) { // 6 months to 1 year
            return '٢.٥ مل مرتين يومياً';
        }
        if (ageMonths < 72) { // 1 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ٧.٥ مل (ملعقة لـ ملعقة ونصف) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على السوربيتول (قد يسبب ليونة في البراز أو إسهال عند الجرعات الزائدة).',
        'آمن لمرضى السكر (خالي من السكر والكحول والألوان الصناعية).',
        'في حالات نادرة جداً قد يسبب ضيق تنفس إذا كان المريض لديه حساسية من نبات اللبلاب.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 4. Ivyrospan Syrup
  {
    id: 'ivyrospan-syrup',
    name: 'Ivyrospan Syrup 100ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 55, 
    matchKeywords: [
        'cough', 'expectorant', 'herbal', 'mucolytic', 'bronchospasm', 'prospan generic',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'لبلاب', 'موسع شعب', 'كحة صدرية'
    ],
    usage: 'مذيب للبلغم ومهدئ للسعال وموسع للشعب الهوائية (عشبي آمن).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Pure Ivy Leaf Extract is safe for infants > 6 months.
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 7, 
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) { // 6 months to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ٧.٥ مل (ملعقة لـ ملعقة ونصف) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'خالي من الكحول والسكر (آمن لمرضى السكري).',
        'يحتوي على مواد تحلية (قد تسبب إسهال بسيط عند تجاوز الجرعة المقررة).',
        'في حالات نادرة قد يحدث غثيان أو اضطراب بسيط في المعدة.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 5. Oplex-N Syrup
  {
    id: 'oplex-n-syrup',
    name: 'Oplex-N Syrup 125ml',
    genericName: 'Oxomemazine + Guaifenesin + Paracetamol',
    concentration: 'Complex Formula',
    price: 31, 
    matchKeywords: [
        'cough', 'dry cough', 'allergic cough', 'sedative', 'night cough', 'flu',
        'كحة', 'سعال', 'كحة ناشفة', 'حساسية صدر', 'نزلات برد', 'مهدئ للسعال', 'بينيم'
    ],
    usage: 'مهدئ قوي للسعال (خاصة الليلي)، مضاد للحساسية، طارد للبلغم وخافض للحرارة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contraindicated for < 2 years (Risk of respiratory depression).
    // Contains Oxomemazine (Sedative antihistamine).
    minAgeMonths: 48, // 2 Years ABSOLUTE MINIMUM
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 144) { // 2 to 12 years (Children)
            return '٥ مل (ملعقة صغيرة) ٢-٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٢-٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب نعاس/دوخة وجفاف فم: تجنب القيادة والكحول والمهدئات/المنومات أثناء الاستخدام.',
        'ممنوع للأطفال أقل من سنتين (خطر تثبيط التنفس/النعاس الشديد مع مضادات الهيستامين المهدئة).',
        'يحتوي على باراسيتامول: لا تجمعه مع أي دواء آخر يحتوي على باراسيتامول لتجنب تسمم الكبد.',
        'يتجنب مع مثبطات إنزيم MAO خلال 14 يوم (قد يزيد الآثار الجانبية/النعاس).',
        'يستخدم بحذر لمرضى تضخم البروستاتا/احتباس البول والجلوكوما ضيقة الزاوية (تأثير مضاد كولين).',
        'الحمل/الرضاعة: بيانات الأمان غير كافية لدواء مركب؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يستخدم بحذر في أمراض الكبد/الكلى.'
    ]
  },
  // 6. Rotahelex Syrup
  {
    id: 'rotahelex-syrup',
    name: 'Rotahelex Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 55, 
    matchKeywords: [
        'cough', 'expectorant', 'herbal', 'mucolytic', 'bronchospasm', 'wet cough',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'لبلاب', 'موسع شعب', 'كحة صدرية'
    ],
    usage: 'مذيب للبلغم، مهدئ للسعال، وموسع للشعب الهوائية (خلاصة اللبلاب الطبيعية).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Pure Ivy Leaf Extract. Safe for infants > 6 months.
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 7, 
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) { // 6 months to 1 year
            return '٢.٥ مل مرتين يومياً ';
        }
        if (ageMonths < 72) { // 1 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ٧.٥ مل (ملعقة لـ ملعقة ونصف) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على مواد تحلية (قد يسبب إسهال خفيف أو اضطراب معدي عند زيادة الجرعة).',
        'آمن لمرضى السكري (خالي من السكر).',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'يجب الحذر عند استخدامه لمرضى التهاب المعدة الشديد.'
    ]
  },

  // 7. Tusskan Syrup
  {
    id: 'tusskan-syrup',
    name: 'Tusskan Syrup 100ml',
    genericName: 'Dextromethorphan + Diphenhydramine + Ephedrine',
    concentration: 'Complex Formula',
    price: 24, 
    matchKeywords: [
        'cough', 'dry cough', 'allergic cough', 'sedative', 'decongestant', 'flu',
        'كحة', 'سعال', 'كحة ناشفة', 'رشح', 'حساسية صدر', 'احتقان', 'مهدئ'
    ],
    usage: 'مهدئ قوي للكحة الناشفة والمصحوبة باحتقان، مضاد للحساسية وموسع للشعب.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: High Risk due to Ephedrine & Dextromethorphan.
    // Contraindicated for < 6 years.
    // Contraindicated for Hypertension & Heart patients.
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) { // Under 6 years
            return 'ممنوع للأطفال أقل من ٦ سنوات';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على إيفيدرين: ممنوع لمرضى ارتفاع ضغط الدم/أمراض القلب/فرط نشاط الغدة الدرقية، ويُستخدم بحذر في السكري.',
        'قد يسبب نعاس/دوخة (ديڤينهيدرامين): تجنب القيادة والكحول والمهدئات.',
        'ممنوع للأطفال أقل من ٦ سنوات.',
        'تداخلات مهمة: يُمنع مع مثبطات إنزيم MAO خلال 14 يوم، ويُستخدم بحذر مع أدوية السيروتونين (مثل SSRIs) بسبب خطر متلازمة السيروتونين (ديكستروميثورفان).',
        'قد يسبب احتباس بولي ويزيد الجلوكوما ضيقة الزاوية (تأثير مضاد كولين): حذر مع كبار السن/تضخم البروستاتا.',
        'الحمل/الرضاعة: يفضّل تجنبه (خاصة بسبب الإيفيدرين ومضادات الهيستامين المهدئة) إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },
  // 8. Ultrasolv Syrup
  {
    id: 'ultrasolv-syrup',
    name: 'Ultrasolv Syrup 120ml',
    genericName: 'Carbocisteine + Guaifenesin + Oxomemazine',
    concentration: 'Complex Formula',
    price: 38, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'bronchitis', 'sedative', 'wet cough',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'حساسية صدر', 'نزلات برد', 'بينيم'
    ],
    usage: 'مذيب وطارد قوي للبلغم، مهدئ للسعال، ومضاد لأعراض الحساسية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contraindicated for < 2 years due to Oxomemazine.
    // Caution for peptic ulcer patients (Carbocisteine).
    minAgeMonths: 48, // 2 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 60) { // 2 to 5 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٥ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يسبب نعاس/دوخة (أوكسوميمزين): تجنب القيادة والكحول والمهدئات/المنومات.',
        'ممنوع للأطفال أقل من سنتين.',
        'يستخدم بحذر لمرضى قرحة المعدة/التهاب المعدة (كاربوكسيستين قد يسبب تهيجاً معدياً).',
        'يستخدم بحذر لمرضى تضخم البروستاتا/احتباس البول والجلوكوما ضيقة الزاوية (تأثير مضاد كولين).',
        'الحمل/الرضاعة: بيانات الأمان غير كافية لدواء مركب؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يحتوي على سكروز (حذر لمرضى السكري).'
    ]
  },
  // 9. Ventocough Syrup
  {
    id: 'ventocough-syrup',
    name: 'Ventocough Syrup 125ml',
    genericName: 'Salbutamol + Bromhexine + Guaifenesin',
    concentration: 'Complex Formula',
    price: 30, 
    matchKeywords: [
        'cough', 'bronchospasm', 'asthma', 'mucolytic', 'wheeze', 'productive cough',
        'كحة', 'سعال', 'بلغم', 'تزييق صدر', 'موسع شعب', 'ضيق تنفس', 'أزمة'
    ],
    usage: 'موسع للشعب الهوائية، مذيب وطارد للبلغم (للكحة المصحوبة بضيق تنفس).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Salbutamol. 
    // Generally used > 2 years (Caution: Palpitations/Tremors).
    // Pregnancy: avoid unless physician recommends.
    minAgeMonths: 48, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل عدم استخدامه للأطفال أقل من سنتين إلا حسب التشخيص';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب رعشة في اليدين أو زيادة في ضربات القلب (بسبب السالبوتامول).',
        'يستخدم بحذر لمرضى القلب، فرط نشاط الغدة الدرقية، ومرضى السكري.',
        'تداخلات: قد يقل تأثيره مع حاصرات بيتا غير الانتقائية، ويُستخدم بحذر مع مثبطات MAO/مضادات الاكتئاب ثلاثية الحلقات.',
        'الحمل: يفضّل تجنبه (خصوصاً في الثلث الأول) إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يجب الحذر لمرضى قرحة المعدة (بسبب البرومهكسين).',
        'قد يسبب انخفاض في نسبة البوتاسيوم في الدم عند الاستخدام الطويل بجرعات عالية.'
    ]
  },
  // 10. All-vent Syrup
  {
    id: 'all-vent-syrup',
    name: 'All-vent Syrup 125ml',
    genericName: 'Terbutaline + Bromhexine + Guaifenesin + Menthol',
    concentration: 'Complex Formula',
    price: 34, 
    matchKeywords: [
        'cough', 'bronchospasm', 'asthma', 'mucolytic', 'expectorant', 'wheeze',
        'كحة', 'سعال', 'بلغم', 'تزييق صدر', 'موسع شعب', 'ضيق تنفس', 'حساسية'
    ],
    usage: 'موسع للشعب الهوائية، طارد ومذيب للبلغم، وملطف للكحة (يحتوي على منثول).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Terbutaline (Beta-agonist).
    // Caution regarding palpitations & tremors.
    // Bromhexine caution for ulcers.
    minAgeMonths: 48, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل عدم استخدامه للأطفال أقل من سنتين إلا حسب التشخيص';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ - ١٥ مل (٢-٣ ملاعق صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب رعشة خفيفة في اليدين أو خفقان في القلب (تأثير التيربيوتالين).',
        'يستخدم بحذر لمرضى القلب، ارتفاع ضغط الدم، وفرط نشاط الغدة الدرقية.',
        'يجب الحذر لمرضى قرحة المعدة (بسبب البرومهكسين والمنثول).',
        'يستخدم بحذر لمرضى السكري (قد يرفع مستوى السكر قليلاً).',
        'تداخلات: قد يقل تأثيره مع حاصرات بيتا غير الانتقائية، ويُستخدم بحذر مع مثبطات MAO/مضادات الاكتئاب ثلاثية الحلقات.',
        'الحمل: يفضّل تجنبه (خصوصاً في الثلث الأول) إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },
  // 11. Bronchophane Syrup
  {
    id: 'bronchophane-syrup',
    name: 'Bronchophane Syrup 125ml',
    genericName: 'Ephedrine + Diphenhydramine + Guaifenesin',
    concentration: 'Complex Formula',
    price: 24, 
    matchKeywords: [
        'cough', 'dry cough', 'allergic cough', 'sedative', 'bronchospasm', 'congestion',
        'كحة', 'سعال', 'كحة ناشفة', 'حساسية صدر', 'احتقان', 'مهدئ للسعال', 'بينيم'
    ],
    usage: 'مهدئ للسعال، مضاد للحساسية، موسع للشعب، وطارد للبلغم (يسبب النعاس).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: High Risk profile due to Ephedrine.
    // Contraindicated for < 6 years.
    // Contraindicated for Hypertension, Heart patients, Glaucoma.
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) { // Under 6 years
            return 'ممنوع للأطفال أقل من ٦ سنوات';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على إيفيدرين: ممنوع لمرضى ارتفاع ضغط الدم/أمراض القلب/اضطراب النظم/فرط نشاط الغدة الدرقية.',
        'يسبب نعاس وجفاف فم (ديڤينهيدرامين): تجنب القيادة والكحول والمهدئات.',
        'ممنوع للأطفال أقل من ٦ سنوات.',
        'تداخلات مهمة: يُمنع مع مثبطات إنزيم MAO خلال 14 يوم.',
        'يستخدم بحذر لمرضى تضخم البروستاتا واحتباس البول والجلوكوما ضيقة الزاوية.',
        'الحمل/الرضاعة: يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },
  // 12. Coughsed Paracetamol Infants
  {
    id: 'coughsed-paracetamol-infants',
    name: 'Coughsed Paracetamol Infants 12 Supp.',
    genericName: 'Paracetamol + Oxomemazine + Guaifenesin',
    concentration: 'Infant Dose',
    price: 42, 
    matchKeywords: [
        'cough', 'fever', 'rectal', 'suppository', 'sedative', 'wet cough',
        'كحة', 'سعال', 'سخونية', 'لبوس', 'خافض حرارة', 'بلغم', 'مهدئ'
    ],
    usage: 'لبوس مهديء للسعال، طارد للبلغم، وخافض للحرارة.',
    timing: 'حسب التعليمات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Suppositories',
    
    // SAFETY CRITICAL: Contains Oxomemazine (sedating antihistamine).
    // Avoid use in children < 2 years due to risk of excessive sedation/respiratory depression.
    minAgeMonths: 48,
    maxAgeMonths: 72,
    minWeight: 10,
    maxWeight: 25,
    
    calculationRule: (weight, ageMonths) => 'Infant Dose (لبوسة) — حسب التعليمات — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'يحتوي على باراسيتامول: لا يُجمع مع أي دواء آخر يحتوي على باراسيتامول لتجنب تسمم الكبد.',
        'يحتوي على أوكسوميمزين: قد يسبب نعاساً شديداً؛ يُتجنب مع المهدئات/المنومات والكحول.',
        'ممنوع للأطفال أقل من سنتين.',
        'يستخدم بحذر/يُتجنب في أمراض الكبد أو الكلى الشديدة.',
        'أوقفه فوراً واطلب المساعدة إذا ظهر طفح شديد، تورم، صفير/صعوبة تنفس، أو نعاس غير طبيعي.'
    ]
  },
  // 13. Ivy-pan Syrup
  {
    id: 'ivy-pan-syrup',
    name: 'Ivy-pan Syrup 100ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 16.5, 
    matchKeywords: [
        'cough', 'expectorant', 'herbal', 'mucolytic', 'cheap', 'wet cough',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'لبلاب', 'رخيص', 'كحة صدرية'
    ],
    usage: 'مذيب للبلغم ومهدئ للسعال وموسع للشعب (خيار اقتصادي فعال).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Ivy Leaf Extract. Safe for infants > 6 months.
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 7, 
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) { // 6 months to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٥ - ٧.٥ مل (ملعقة لـ ملعقة ونصف) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على مواد تحلية (سوربيتول): قد يسبب إسهال خفيف عند الجرعات العالية.',
        'آمن لمرضى السكر (خالي من السكر).',
        'نادر جداً ما يسبب غثيان أو ألم بالمعدة.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },
  // 14. Loprecough Syrup
  {
    id: 'loprecough-syrup',
    name: 'Loprecough Syrup 100ml',
    genericName: 'Levodropropizine',
    concentration: '30mg/5ml',
    price: 45, 
    matchKeywords: [
        'cough', 'dry cough', 'non-sedative', 'peripheral antitussive', 'hacking cough',
        'كحة', 'سعال', 'كحة ناشفة', 'سعال جاف', 'غير منوم', 'شرقة'
    ],
    usage: 'مهدئ قوي للسعال الجاف (يعمل طرفياً دون التأثير على الجهاز العصبي المركزي).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Levodropropizine is contraindicated for < 24 months.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        // Standard dosing: 1mg/kg per dose, 3 times daily
        if (weight <= 20) { // 10-20 kg
            return '٣ مل (نصف ملعقة صغيرة وشوية) ٣ مرات يومياً';
        }
        if (weight <= 30) { // 20-30 kg
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and Children > 30kg
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع للأطفال أقل من سنتين.',
        'ممنوع للمرضى الذين يعانون من كحة ببلغم غزير (لأنه يوقف الكحة وقد يحبس البلغم).',
        'أقل تسبباً في النعاس من الأدوية الأخرى، لكن يفضل الحذر عند القيادة.',
        'يستخدم بحذر لمرضى القصور الكلوي الشديد.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'تجنب الجمع مع أدوية مهدئة/منومة إلا باستشارة.'
    ]
  },
  // 15. Mucophylline Syrup
  {
    id: 'mucophylline-syrup',
    name: 'Mucophylline Syrup 125ml',
    genericName: 'Bromhexine + Acefylline Piperazine',
    concentration: 'Complex Formula',
    price: 50, 
    matchKeywords: [
        'cough', 'bronchodilator', 'asthma', 'mucolytic', 'wheeze', 'dyspnea', 'bronchitis',
        'كحة', 'سعال', 'بلغم', 'موسع شعب', 'تزييق صدر', 'ضيق تنفس', 'أزمة', 'شعب هوائية'
    ],
    usage: 'موسع قوي للشعب الهوائية ومذيب للبلغم (يستخدم لحالات الكحة المصحوبة بضيق تنفس).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Acefylline (Theophylline derivative).
    // Potential for Tachycardia & Gastric upset.
    // Recommended age > 1 year.
    minAgeMonths: 24, 
    maxAgeMonths: 1200,
    minWeight: 9,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) {
            return 'يفضل عدم استخدامه للرضع أقل من سنة إلا بجرعات معتمدة للعمر';
        }
        if (ageMonths < 60) { // 1 to 5 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 5 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب زيادة في ضربات القلب أو خفقان (بسبب مادة الأسيفيللين).',
        'قد يسبب ألم بالمعدة أو غثيان إذا أخذ على معدة فارغة.',
        'يستخدم بحذر شديد لمرضى قرحة المعدة، فرط نشاط الغدة الدرقية، ومرضى القلب.',
        'قد يحدث تداخل دوائي مع الثيوفيللين والماكروليدات؛ راجع التفاعلات وعدّل الجرعة أو اختر بديلاً.',
        'الحمل: يفضّل تجنبه خاصة في الثلث الأول إلا حسب التشخيص.'
    ]
  },
  // 16. Ventocough Sugar-Free Syrup
  {
    id: 'ventocough-sugar-free',
    name: 'Ventocough Sugar-Free Syrup 125ml',
    genericName: 'Salbutamol + Bromhexine + Guaifenesin',
    concentration: 'Sugar-Free Formula',
    price: 25, 
    matchKeywords: [
        'cough', 'bronchospasm', 'asthma', 'mucolytic', 'diabetic', 'sugar free',
        'كحة', 'سعال', 'بلغم', 'تزييق صدر', 'موسع شعب', 'بدون سكر', 'لمرضى السكر'
    ],
    usage: 'موسع للشعب، مذيب وطارد للبلغم (نسخة خالية من السكر مناسبة لمرضى السكري).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Salbutamol. 
    // Generally used > 2 years.
    // Safe for Diabetics (Sugar-Free).
    minAgeMonths: 48, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل عدم استخدامه للأطفال أقل من سنتين إلا حسب التشخيص';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب رعشة في اليدين أو زيادة في ضربات القلب (بسبب السالبوتامول).',
        'يستخدم بحذر لمرضى القلب وفرط نشاط الغدة الدرقية.',
        'تداخلات: قد يقل تأثيره مع حاصرات بيتا غير الانتقائية، ويُستخدم بحذر مع مثبطات MAO/مضادات الاكتئاب ثلاثية الحلقات.',
        'الحمل: يفضّل تجنبه (خصوصاً في الثلث الأول) إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يجب الحذر لمرضى قرحة المعدة (بسبب البرومهكسين).',
        'قد يسبب انخفاض البوتاسيوم في الدم عند الجرعات العالية.'
    ]
  },
  // 17. Rotahelex Night Syrup
  {
    id: 'rotahelex-night-syrup',
    name: 'Rotahelex Night Syrup 100ml',
    genericName: 'Ivy Leaf + Chamomile + Ginger Extracts',
    concentration: 'Night Formula',
    price: 60, 
    matchKeywords: [
        'cough', 'night cough', 'sleep', 'herbal', 'insomnia', 'soothing', 'ginger',
        'كحة', 'سعال', 'كحة ليلية', 'أرق', 'بابونج', 'زنجبيل', 'نوم', 'مهدئ'
    ],
    usage: 'مهدئ للسعال الليلي، مذيب للبلغم، ويساعد على النوم الهادئ (تركيبة عشبية).',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Safe herbal formula (Ivy, Chamomile, Ginger).
    // Suitable for children (usually > 2-3 years due to Ginger/Herbal mix).
    minAgeMonths: 36, // 3 Years (Conservative safe limit for Ginger/Chamomile mix)
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) { // Under 3 years
             return 'للأطفال أقل من ٣ سنوات: ٢.٥ مل حسب العمر أو اختر بديلاً أنسب';
        }
        if (ageMonths < 144) { // 3 to 12 years
            return '٥ مل (ملعقة صغيرة) مرة واحدة قبل النوم';
        }
        // Adults and > 12 years
        return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) مرة واحدة مساءً';
    },
    
    
    warnings: [
        'يحتوي على السوربيتول (قد يسبب ليونة في البراز عند زيادة الجرعة).',
        'آمن لمرضى السكر (محلى بالسوربيتول).',
        'يستخدم بحذر لمرضى حصوات المرارة (بسبب محتواه من الزنجبيل).',
        'قد يسبب حساسية لمن لديهم حساسية من البابونج/الأقحوانيات.',
        'لا يسبب النعاس "المرضي" (تخدير) ولكنه يساعد على الاسترخاء الطبيعي.'
    ]
  },
  
// 18. Rotahelex Advance Oral Drops
  {
    id: 'rotahelex-advance-drops',
    name: 'Rotahelex Advance Oral Drops 40ml',
    genericName: 'Ivy Leaf + Thyme Extracts',
    concentration: 'Pediatric Drops',
    price: 75, 
    matchKeywords: [
        'cough', 'infant', 'drops', 'herbal', 'thyme', 'spasm', 'wet cough',
        'كحة', 'سعال', 'نقط', 'رضع', 'لبلاب', 'زعتر', 'موسع شعب', 'بلغم'
    ],
    usage: 'نقط عشبية مذيبة للبلغم وموسعة للشعب (تركيبة اللبلاب والزعتر المكثفة).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Drops',
    
    // SAFETY: Ivy + Thyme. 
    // Generally safe for infants > 6 months.
    minAgeMonths: 6, 
    maxAgeMonths: 144, // Usually up to 12 years, but mostly for infants/toddlers
    minWeight: 5, 
    maxWeight: 40,
    
    calculationRule: (weight, ageMonths) => {
        // Standard Drop conversion: 1 ml approx 20 drops
        if (ageMonths < 12) { // 6 months to 1 year
            return '١٠ - ١٥ نقطة (حوالي نصف مل) ٣ مرات يومياً';
        }
        if (ageMonths < 60) { // 1 to 5 years
            return '٢٠ نقطة (١ مل) ٣ مرات يومياً';
        }
        // > 5 years
        return '٤٠ نقطة (٢ مل) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى التهابات المعدة (بسبب الزعتر).',
        'قد يسبب اضطرابات هضمية بسيطة في حالات نادرة.',
        'آمن لمرضى السكر (خالي من السكر).',
        'مدة الصلاحية بعد فتح العبوة هي ٣ - ٦ أشهر (حسب ظروف التخزين).'
    ]
  },
  // 19. Ivy Acetyl Cysteine Syrup
  {
    id: 'ivy-acetyl-cysteine-syrup',
    name: 'Ivy Acetyl Cysteine Syrup 120ml',
    genericName: 'Ivy Leaf Extract + N-Acetylcysteine',
    concentration: 'Complex Formula',
    price: 75, 
    matchKeywords: [
        'cough', 'mucolytic', 'thick sputum', 'smoker cough', 'copd', 'heavy mucus',
        'كحة', 'سعال', 'بلغم لزج', 'مذيب قوي', 'أسيتيل سيستين', 'لبلاب', 'كحة مدخنين'
    ],
    usage: 'مذيب قوي جداً للبلغم اللزج، موسع للشعب، ومضاد للأكسدة (مثالي للمدخنين).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains N-Acetylcysteine.
    // Contraindicated for children < 2 years (risk of bronchospasm).
    // Caution for Asthmatics & Peptic Ulcer patients.
    minAgeMonths: 24, // 2 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٢-٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع للأطفال أقل من سنتين.',
        'يستخدم بحذر شديد لمرضى الربو (قد يسبب ضيق في الشعب الهوائية لدى البعض).',
        'يستخدم بحذر لمرضى قرحة المعدة (لأنه مذيب قوي للمخاط المبطن للمعدة).',
        'رائحة الدواء مميزة (تشبه البيض) وهذا لا يعني فساده.',
        'يجب شرب كميات كبيرة من الماء للمساعدة في إذابة البلغم.'
    ]
  },
  // 20. Bisolvon Syrup
  {
    id: 'bisolvon-syrup',
    name: 'Bisolvon 4mg/5ml Syrup 115ml',
    genericName: 'Bromhexine HCl',
    concentration: '4mg/5ml',
    price: 35, 
    matchKeywords: [
        'cough', 'mucolytic', 'thick mucus', 'expectorant', 'phlegm',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'برومهكسين', 'مخاط'
    ],
    usage: 'مذيب نقي للبلغم (يقلل لزوجة المخاط ويساعد على طرده).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Bromhexine is generally safe > 2 years.
    // Caution for gastric ulcers.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل عدم استخدامه للأطفال أقل من سنتين إلا حسب التشخيص';
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
        'يجب الحذر لمرضى قرحة المعدة (قد يؤثر على جدار المعدة المخاطي).',
        'يستخدم بحذر لمرضى الربو (قد يسبب زيادة مفاجئة في سيولة البلغم).',
        'يجب الحذر لمرضى قصور الكبد والكلى الشديد.',
        'لا ينصح باستخدامه في الشهور الثلاثة الأولى من الحمل إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'نادراً قد تحدث تفاعلات جلدية شديدة؛ أوقفه فوراً إذا ظهر طفح شديد أو تقرحات بالفم.'
    ]
  },
  // 21. Acetylcystdar 600
  {
    id: 'acetylcystdar-600',
    name: 'Acetylcystdar 600mg 12 Eff. Tabs',
    genericName: 'N-Acetylcysteine',
    concentration: '600mg',
    price: 70, 
    matchKeywords: [
        'mucolytic', 'thick sputum', 'smoker', 'copd', 'antioxidant', 'fertility',
        'مذيب للبلغم', 'فوار', 'استيل سيستين', 'كحة مدخنين', 'مضاد اكسدة', 'لزوجة'
    ],
    usage: 'مذيب قوي جداً للبلغم، مضاد للأكسدة، وحماية للرئة (تركيز عالي للكبار).',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Effervescent Tablets',
    
    // SAFETY: 600mg is high dose. Not for children < 12 years.
    // Caution for Asthmatics & Ulcer patients.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '600mg (قرص) — مرة يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'ممنوع للأطفال أقل من ١٢ سنة (التركيز عالي).',
        'يستخدم بحذر لمرضى الربو (قد يسبب ضيق في الشعب الهوائية).',
        'يجب الحذر لمرضى قرحة المعدة وتاريخ النزيف المعدي.',
        'له رائحة كبريتية مميزة (مثل البيض) وهذا طبيعي ولا يعني فساد الدواء.',
        'قد يزيد الصداع/الدوخة مع النيتروجليسرين (تداخل دوائي محتمل).',
        'لا يخلط مع المضادات الحيوية في نفس الكوب (ويفضل الفصل بينهم بساعتين).'
    ]
  },
  // 22. Panadol Acute Head Cold

  // 23. Guava Syrup
  {
    id: 'guava-syrup',
    name: 'Guava Syrup 120ml',
    genericName: 'Guava Leaf + Tilia Flower Extracts',
    concentration: 'Herbal Formula',
    price: 55, 
    matchKeywords: [
        'cough', 'herbal', 'dry cough', 'wet cough', 'safe', 'pregnancy', 'tilia',
        'كحة', 'سعال', 'جوافة', 'اعشاب', 'تيليو', 'آمن للحوامل', 'مهدئ'
    ],
    usage: 'مكمل غذائي عشبي مهدئ للسعال ومحسن لوظائف التنفس (آمن ولطيف).',
    timing: 'كل ٦ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Very safe profile.
    // Generally used for children > 3 years (due to herbal oils/sugar).
    // Pregnancy: limited data for commercial herbal combinations.
    minAgeMonths: 36, // 3 Years (Standard for herbal syrups)
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) {
            return 'للأطفال أقل من ٣ سنوات: ٢.٥ مل حسب العمر أو بديل أنسب (محتوى سكر)';
        }
        if (ageMonths < 72) { // 3 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣-٤ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣-٤ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٥ مل (ملعقة كبيرة) ٣-٤ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على نسبة عالية من السكر (يستخدم بحذر شديد لمرضى السكري).',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'مدة الصلاحية بعد فتح العبوة لا تزيد عن ٣ أشهر.',
        'قد يسبب إسهال بسيط عند تناول جرعات كبيرة (بسبب السكر والسوربيتول).'
    ]
  },
  // 24. Muco Syrup
  {
    id: 'muco-syrup',
    name: 'Muco 15mg/5ml Syrup 100ml',
    genericName: 'Ambroxol HCl',
    concentration: '15mg/5ml',
    price: 35, 
    matchKeywords: [
        'cough', 'mucolytic', 'ambroxol', 'sore throat', 'thick mucus', 'expectorant',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'امبروكسول', 'التهاب حلق', 'مخاط'
    ],
    usage: 'مذيب قوي للبلغم، يسهل طرده، وله تأثير مهدئ خفيف لالتهاب الحلق.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Ambroxol is generally safe > 2 years.
    // Caution for peptic ulcer patients.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل عدم استخدامه للأطفال أقل من سنتين إلا حسب التشخيص';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٢ - ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يجب الحذر لمرضى قرحة المعدة (قد يؤثر على جدار المعدة المخاطي).',
        'يفضل تجنبه في الشهور الثلاثة الأولى من الحمل إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يجب الحذر لمرضى القصور الكلوي أو الكبدي الشديد.',
        'نادراً قد يسبب طفح جلدي/حساسية؛ أوقفه فوراً وأعد التقييم إذا ظهر طفح شديد أو تقرحات بالفم.'
    ]
  },
  // 25. Notussil Suspension (UPDATED DOSAGE)
  {
    id: 'notussil-suspension',
    name: 'Notussil 4mg/ml Susp. 60ml',
    genericName: 'Cloperastine Fendizoate',
    concentration: '4mg/ml',
    price: 26.5, 
    matchKeywords: [
        'cough', 'dry cough', 'antitussive', 'hacking cough', 'cloperastine', 'allergy',
        'كحة', 'سعال', 'كحة ناشفة', 'شرقة', 'سعال جاف', 'حساسية صدر', 'مهدئ'
    ],
    usage: 'مهدئ للسعال الجاف (يعمل مركزياً وطرفياً لتخفيف حدة الكحة والتقلصات).',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Suspension',
    
    // SAFETY: Contraindicated for < 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    // UPDATED: Precise dosage logic per user request
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 48) { // 2 to 4 years
            return '٢ مل مرتين يومياً (صباحاً ومساءً)';
        }
        if (ageMonths < 84) { // 4 to 7 years
            return '٣ مل مرتين يومياً (صباحاً ومساءً)';
        }
        if (ageMonths < 180) { // 7 to 15 years
            return '٥ مل (ملعقة صغيرة) مرتين يومياً';
        }
        // Adults (> 15 years)
        return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب نعاساً بسيطاً/دوخة وجفاف فم: تجنب القيادة والكحول والمهدئات أثناء الاستخدام.',
        'لا يُستخدم للكحة المصحوبة ببلغم غزير (قد يقلل السعال ويؤخر طرد البلغم).',
        'الحمل/الرضاعة: لا توجد بيانات كافية؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يستخدم بحذر لمرضى الجلوكوما ضيقة الزاوية وتضخم البروستاتا/احتباس البول.'
    ]
  },
  // 27. Pentamix Syrup
  {
    id: 'pentamix-syrup',
    name: 'Pentamix Syrup 120ml',
    genericName: 'Guava + Ivy + Thyme + Tilia + Fennel',
    concentration: '5-Herbal Complex',
    price: 49, 
    matchKeywords: [
        'cough', 'herbal', 'expectorant', 'mucolytic', 'bronchospasm', 'natural',
        'كحة', 'سعال', 'بلغم', 'جوافة', 'لبلاب', 'زعتر', 'تيليو', 'شمر', 'اعشاب'
    ],
    usage: 'مكمل غذائي عشبي شامل لتحسين وظائف الجهاز التنفسي وتهدئة جميع أنواع السعال.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Natural herbal mix.
    // Generally safe for children > 3 years (due to Thyme/Fennel oils).
    minAgeMonths: 36, // 3 Years
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) {
            return 'للأطفال أقل من ٣ سنوات: ٢.٥ مل حسب العمر أو اختر بديلاً أنسب';
        }
        if (ageMonths < 144) { // 3 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ - ١٥ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على سكروز (يستخدم بحذر لمرضى السكري).',
        'يستخدم بحذر لمرضى التهاب المعدة والقرحة (بسبب الزعتر).',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'قد يسبب تأثير ملين خفيف عند تناول جرعات زائدة.'
    ]
  },

  // 28. Tussivan-N Syrup
  {
    id: 'tussivan-n-syrup',
    name: 'Tussivan-N Syrup 125ml',
    genericName: 'Dextromethorphan + Chlorpheniramine + Ephedrine + Guaifenesin',
    concentration: 'Complex Formula',
    price: 34, 
    matchKeywords: [
        'cough', 'dry cough', 'sedative', 'drowsy', 'antitussive', 'allergy',
        'كحة', 'سعال', 'كحة ناشفة', 'مهدئ للكحة', 'بينيم', 'حساسية', 'زكام'
    ],
    usage: 'مهدئ قوي للسعال الجاف، مضاد للحساسية، ومزيل للاحتقان (يسبب النعاس بشكل ملحوظ).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: High sedation. Contains Ephedrine.
    // Contraindicated for < 6 years and Heart/Hypertension patients.
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'ممنوع للأطفال أقل من ٦ سنوات';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يحتوي على إيفيدرين: ممنوع لمرضى ارتفاع ضغط الدم/أمراض القلب/اضطراب النظم/فرط نشاط الغدة الدرقية، ويُستخدم بحذر في السكري.',
        'يسبب نعاس/دوخة وجفاف فم وزغللة: تجنب القيادة والكحول والمهدئات/المنومات.',
        'ممنوع للأطفال أقل من ٦ سنوات.',
        'تداخلات مهمة: يُمنع مع مثبطات إنزيم MAO خلال 14 يوم.',
        'يُستخدم بحذر مع أدوية السيروتونين (مثل SSRIs/SNRIs) بسبب خطر متلازمة السيروتونين (ديكستروميثورفان).',
        'يستخدم بحذر لمرضى الجلوكوما ضيقة الزاوية وتضخم البروستاتا/احتباس البول.',
        'في الكحة ببلغم غزير: فضّل موسّع بلغم فقط؛ لا تجمع مع مهدئ سعال في نفس الجرعة.',
        'الحمل/الرضاعة: يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },
  // 29. Acetylcistein 600 Instant Sachets
  {
    id: 'acetylcistein-600-instant',
    name: 'Acetylcistein 600mg 10 Eff. Instant Sachets',
    genericName: 'N-Acetylcysteine',
    concentration: '600mg',
    price: 70, 
    matchKeywords: [
        'mucolytic', 'sachet', 'instant', 'thick sputum', 'smoker', 'sedico',
        'مذيب للبلغم', 'فوار', 'اكياس', 'سيديكو', 'استيل سيستين', 'بلغم لزج'
    ],
    usage: 'مذيب قوي للبلغم اللزج (حبيبات سريعة الذوبان) ومضاد للأكسدة لحماية الرئة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Sachets',
    
    // SAFETY: High dose 600mg. Not for children < 12 years.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '600mg (جرعة) — مرة يومياً — مع/بعد الأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'ممنوع للأطفال أقل من ١٢ سنة.',
        'يستخدم بحذر لمرضى الربو (Asthma) وقرحة المعدة.',
        'الرائحة الكبريتية (شبه البيض) طبيعية جداً للمادة الفعالة.',
        'يجب شرب كمية كبيرة من الماء لمساعدة الدواء على إذابة البلغم.',
        'لا يستخدم مع أدوية الكحة الناشفة (Antitussives) في نفس الوقت إلا حسب التشخيص.',
        'قد يزيد الصداع/الدوخة مع النيتروجليسرين (تداخل دوائي محتمل).',
        'يفضل الفصل عن المضادات الحيوية ساعتين إذا أُخذت بالفم.'
    ]
  },
  // 30. Dolo-D Plus Oral Suspension (UPDATED DOSAGE)
  {
    id: 'dolo-d-plus-suspension',
    name: 'Dolo-D Plus Oral Susp. 115ml',
    genericName: 'Ibuprofen + Pseudoephedrine + Chlorpheniramine',
    concentration: 'Complex Formula',
    price: 41, 
    matchKeywords: [
        'cold', 'flu', 'fever', 'congestion', 'runny nose', 'analgesic', 'pediatric',
        'برد', 'انفلونزا', 'سخونية', 'احتقان', 'رشح', 'زكام', 'مسكن', 'خافض حرارة'
    ],
    usage: 'خافض للحرارة، مسكن للألم، ومزيل لاحتقان الأنف والرشح (يسبب النعاس).',
    timing: 'مرة يومياً – حسب التعليمات',
    category: Category.COLD_FLU,
    form: 'Suspension',
    
    // SAFETY: Strict age limit (6 years) as per latest instructions.
    // Contraindicated for Heart, Hypertension, and Asthmatic patients.
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 144, // 12 Years
    minWeight: 20,
    maxWeight: 50,
    
    // UPDATED logic: Focus on the 6-12 years bracket as requested
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'غير مخصص للأطفال دون ٦ سنوات';
        }
        if (ageMonths <= 144) { // 6 to 12 years
            return '١٠ مل (٢ ملعقة صغيرة) كل ٦ ساعات حسب الحاجة (بحد أقصى ٤ جرعات/٢٤ ساعة)';
        }
        return 'راجع الجرعة حسب العمر والوزن للمراهقين فوق ١٢ سنة';
    },
    
    
    warnings: [
        'غير مخصص للأطفال دون ٦ سنوات.',
        'لا يستخدم للحمى لأكثر من ٣ أيام، ولا لأعراض الألم/البرد لأكثر من ٥ أيام.',
        'يسبب النعاس (Chlorpheniramine).',
        'يستخدم بحذر لمرضى الحساسية الصدرية (الربو)، خاصة من لديهم حساسية للأسبرين/NSAIDs (قد يزيد التشنج الشعبي).',
        'ممنوع في حالات أمراض القلب أو ارتفاع ضغط الدم (بسبب السودوإيفيدرين).',
        'تداخلات مهمة: يُمنع مع مثبطات إنزيم MAO خلال 14 يوم.',
        'لا يُجمع مع أي NSAID آخر (مثل إيبوبروفين/ديكلوفيناك) أو أدوية زكام أخرى تحتوي على مزيلات احتقان/مضادات هيستامين لتجنب التكرار.'
    ]
  },

// 31. Muco S.R. Capsules
  {
    id: 'muco-sr-capsules',
    name: 'Muco S.R. 75mg 20 Caps.',
    genericName: 'Ambroxol HCl (Sustained Release)',
    concentration: '75mg',
    price: 64, 
    matchKeywords: [
        'mucolytic', 'ambroxol', 'sustained release', 'phlegm', 'capsules', 'long acting',
        'مذيب للبلغم', 'ميوكو', 'كبسول', 'امبروكسول', 'ممتد المفعول', 'بلغم لزج'
    ],
    usage: 'مذيب للبلغم ممتد المفعول يعمل على مدار ٢٤ ساعة (يقلل لزوجة المخاط ويسهل طرده).',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Capsules',
    
    // SAFETY: S.R. capsules are for Adults/Adolescents only.
    // Not suitable for children due to high dose and S.R. technology.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '75mg (كبسولة) — مرة يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'لا يستخدم للأطفال أقل من ١٢ سنة.',
        'يستخدم بحذر لمرضى قرحة المعدة.',
        'الحمل/الرضاعة: يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'نادراً قد تحدث تفاعلات جلدية شديدة؛ أوقفه فوراً إذا ظهر طفح شديد أو تقرحات بالفم.',
        'يجب شرب كميات كافية من الماء لزيادة كفاءة الدواء في إذابة البلغم.'
    ]
  },

  // 32. Mucobrave 600mg Sachets
  {
    id: 'mucobrave-600-sachets',
    name: 'Mucobrave 600mg 10 Sachets',
    genericName: 'N-Acetylcysteine',
    concentration: '600mg',
    price: 75, 
    matchKeywords: [
        'mucolytic', 'sachet', 'thick sputum', 'smoker', 'antioxidant', 'brave',
        'مذيب للبلغم', 'فوار', 'اكياس', 'ميوكو بريف', 'استيل سيستين', 'بلغم لزج'
    ],
    usage: 'مذيب قوي جداً للبلغم اللزج ومضاد للأكسدة (يستخدم للكبار فقط).',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Sachets',
    
    // SAFETY: High dose 600mg. Not for children < 12 years.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '600mg (جرعة) — مرة يومياً — مع/بعد الأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'ممنوع للأطفال أقل من ١٢ سنة.',
        'يستخدم بحذر لمرضى الربو وقرحة المعدة.',
        'الرائحة الكبريتية طبيعية للمادة الفعالة ولا تدل على فساد الدواء.',
        'قد يزيد الصداع/الدوخة مع النيتروجليسرين (تداخل دوائي محتمل).',
        'لا يُجمَع مع مهدئ سعال في نفس الجرعة؛ إن لزم ففاصل ٤–٦ ساعات.',
        'يُفضل الفصل بينه وبين المضادات الحيوية بساعتين على الأقل.'
    ]
  },

// 33. Omegacough Syrup
  {
    id: 'omegacough-syrup',
    name: 'Omegacough Syrup 120ml',
    genericName: 'Levodropropizine',
    concentration: '30mg/5ml',
    price: 59, 
    matchKeywords: [
        'cough', 'dry cough', 'non-sedative', 'peripheral antitussive', 'omega',
        'كحة', 'سعال', 'كحة ناشفة', 'سعال جاف', 'غير منوم', 'أوميجا كوف'
    ],
    usage: 'مهدئ للسعال الجاف (يعمل طرفياً دون التأثير على المخ)، مناسب لمن يريد تجنب النعاس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contraindicated for < 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        // General dosing based on body weight
        if (weight <= 20) {
            return '٣ مل (نصف ملعقة صغيرة وشوية) ٣ مرات يومياً';
        }
        if (weight <= 30) {
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and over 30kg
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع للأطفال أقل من سنتين.',
        'ممنوع في حالات الكحة المصحوبة ببلغم كثيف (لأنه قد يمنع طرد البلغم).',
        'يستخدم بحذر لمرضى الفشل الكلوي الشديد.',
        'أقل تأثيراً على اليقظة من غيره، ولكن يرجى الحذر عند القيادة لأول مرة.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },

  // 34. Tussistop Syrup
  {
    id: 'tussistop-syrup',
    name: 'Tussistop Syrup 100ml',
    genericName: 'Levodropropizine',
    concentration: '30mg/5ml',
    price: 49, 
    matchKeywords: [
        'cough', 'dry cough', 'non-sedative', 'peripheral antitussive', 'tussistop',
        'كحة', 'سعال', 'كحة ناشفة', 'سعال جاف', 'توسي ستوب', 'غير منوم', 'شرقة'
    ],
    usage: 'مهدئ قوي للسعال الجاف والحساسية، يعمل طرفياً ولا يسبب الخمول المعتاد لأدوية الكحة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Not for infants < 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        // Standard weight-based dosing
        if (weight <= 20) {
            return '٣ مل (نصف ملعقة صغيرة تقريباً) ٣ مرات يومياً';
        }
        if (weight <= 30) {
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults & heavy weights
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع للأطفال أقل من سنتين.',
        'لا يستخدم إذا كانت الكحة ببلغم كثيف (لأنه قد يؤدي لاحتباس البلغم).',
        'يستخدم بحذر لمرضى الفشل الكلوي الشديد.',
        'رغم أنه غير منوم مركزياً، إلا أن بعض المرضى قد يشعرون بدوار بسيط.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },

  // 35. Bronchicum Lozenges
  {
    id: 'bronchicum-lozenges',
    name: 'Bronchicum 20 Lozenges',
    genericName: 'Thyme Fluid Extract',
    concentration: '100mg',
    price: 90, 
    matchKeywords: [
        'cough', 'throat', 'sore throat', 'lozenges', 'thyme', 'herbal',
        'كحة', 'سعال', 'استحلاب', 'زعتر', 'التهاب زور', 'شرقة', 'برونشيكوم'
    ],
    usage: 'أقراص استحلاب عشبية لتهدئة السعال، مطهرة للمجاري التنفسية، وملطفة لالتهاب الحلق.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Lozenge',
    
    // SAFETY: Generally safe > 6 years due to choking risk of lozenges.
    minAgeMonths: 72, // 6 Years
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'غير مخصص للأطفال دون سن ٦ سنوات خوفاً من خطر الاختناق';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return 'قرص استحلاب واحد ٣ مرات يومياً';
        }
        // Adults and over 12 years
        return 'قرص استحلاب واحد حتى ٥ مرات يومياً (عند الحاجة)';
    },
    
    
    warnings: [
        'ممنوع للأطفال أقل من ٦ سنوات لتجنب خطر الشرقة أو الاختناق.',
        'يستخدم بحذر لمرضى التهابات المعدة الحادة (بسبب الزعتر).',
        'يحتوي على سكر (يجب مراعاة ذلك لمرضى السكري).',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 36. Ivy Bronch Syrup
  {
    id: 'ivy-bronch-syrup',
    name: 'Ivy Bronch Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 45, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'bronchospasm', 'herbal', 'ivy leaf',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي برونش'
    ],
    usage: 'مذيب للبلغم وموسع للشعب الهوائية (عشبي طبيعي)، يهدئ الكحة ويحسن التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe > 2 years. 
    // Below 2 years needs medical supervision.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل تقييم الفائدة والخطر للأطفال أقل من سنتين';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and over 12 years
        return '٧.٥ - ١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالة التهاب المعدة أو قرحة المعدة.',
        'يحتوي على (سوربيتول) لذا قد يسبب إسهال بسيط عند تناول جرعات زائدة.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'قد يحتوي على مُحليات/سكريات حسب التركيبة؛ يُراعى ذلك لمرضى السكري.'
    ]
  },
  // 37. Notussil Suspension 120ml
  {
    id: 'notussil-suspension-120',
    name: 'Notussil 4mg/ml Susp. 120ml',
    genericName: 'Cloperastine Fendizoate',
    concentration: '4mg/ml',
    price: 71, 
    matchKeywords: [
        'cough', 'dry cough', 'antitussive', 'cloperastine', 'hacking cough',
        'كحة', 'سعال', 'كحة ناشفة', 'شرقة', 'سعال جاف', 'نوتوسيل كبير'
    ],
    usage: 'مهدئ للسعال الجاف (يعمل مركزياً وطرفياً لتخفيف حدة الكحة والتقلصات).',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Suspension',
    
    // SAFETY: Contraindicated for < 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    // Using the precise dosage logic we established earlier
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 48) { // 2 to 4 years
            return '٢ مل مرتين يومياً (صباحاً ومساءً)';
        }
        if (ageMonths < 84) { // 4 to 7 years
            return '٣ مل مرتين يومياً (صباحاً ومساءً)';
        }
        if (ageMonths < 180) { // 7 to 15 years
            return '٥ مل (ملعقة صغيرة) مرتين يومياً';
        }
        // Adults (> 15 years)
        return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'قد يسبب نعاساً بسيطاً/دوخة وجفاف فم: تجنب القيادة والكحول والمهدئات أثناء الاستخدام.',
        'لا يُستخدم للكحة المصحوبة ببلغم غزير (قد يقلل السعال ويؤخر طرد البلغم).',
        'الحمل/الرضاعة: لا توجد بيانات كافية؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يستخدم بحذر لمرضى الجلوكوما ضيقة الزاوية وتضخم البروستاتا/احتباس البول.'
    ]
  },
  // 38. Bronchopro Syrup
  {
    id: 'bronchopro-syrup',
    name: 'Bronchopro 15mg/5ml Syrup 100ml',
    genericName: 'Ambroxol HCl',
    concentration: '15mg/5ml',
    price: 35, 
    matchKeywords: [
        'cough', 'mucolytic', 'ambroxol', 'expectorant', 'phlegm', 'bronchopro',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'امبروكسول', 'برونكوبرو', 'طارد بلغم'
    ],
    usage: 'مذيب ومحرك للبلغم (يقلل لزوجة المخاط ويساعد الأهداب التنفسية على طرده).',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل عدم استخدامه للأطفال أقل من سنتين إلا حسب التشخيص';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٢ - ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى قرحة المعدة (قد يؤثر على الغشاء المخاطي للمعدة).',
        'يفضل تجنبه في أول ٣ شهور من الحمل إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يستخدم بحذر في حالات القصور الكلوي أو الكبدي الشديد.',
        'قد يسبب أحياناً اضطرابات هضمية بسيطة.',
        'نادراً قد تحدث تفاعلات جلدية شديدة؛ أوقفه فوراً إذا ظهر طفح شديد أو تقرحات بالفم.'
    ]
  },
  // 39. Mucotec 300mg Capsules
  {
    id: 'mucotec-300-capsules',
    name: 'Mucotec 300mg 20 Caps.',
    genericName: 'Erdosteine',
    concentration: '300mg',
    price: 144, 
    matchKeywords: [
        'mucolytic', 'erdosteine', 'copd', 'bronchitis', 'thick phlegm', 'mucotec',
        'مذيب للبلغم', 'ميوكوتك', 'إردوستين', 'بلغم لزج', 'التهاب شعبي', 'كبسول'
    ],
    usage: 'مذيب متطور للبلغم، يقلل لزوجة المخاط ويمنع التصاق البكتيريا بالشعب الهوائية.',
    timing: 'مرتين يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Capsules',
    
    // SAFETY: Erdosteine 300mg is for adults and adolescents > 15 years.
    // Contraindicated in severe liver/kidney impairment.
    minAgeMonths: 180, // 15 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '300mg (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'غير مخصص للأطفال أقل من ١٥ سنة.',
        'ممنوع لمرضى الفشل الكلوي أو الكبدي الشديد.',
        'يستخدم بحذر لمرضى قرحة المعدة النشطة.',
        'يجب التوقف عن استخدامه إذا لم تتحسن الأعراض بعد ٧-١٠ أيام.',
        'يمكن استخدامه مع المضادات الحيوية عند وجود عدوى حسب التشخيص.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },
  // 40. Codilar Syrup
  {
    id: 'codilar-syrup',
    name: 'Codilar Syrup 120ml',
    genericName: 'Dextromethorphan Hydrobromide',
    concentration: '15mg/5ml',
    price: 27, 
    matchKeywords: [
        'cough', 'dry cough', 'antitussive', 'hacking cough', 'codilar', 'night cough',
        'كحة', 'سعال', 'كحة ناشفة', 'كوديلار', 'مهدئ للسعال', 'سعال جاف', 'شرقة'
    ],
    usage: 'مهدئ قوي للسعال الجاف (الناشف) والشرقة، يعمل على مركز الكحة في المخ.',
    timing: 'كل ٦ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Dextromethorphan is generally safe > 6 years.
    // Use with extreme caution below 6 years (only under medical supervision).
    minAgeMonths: 72, // 6 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 72) {
            return 'للأطفال أقل من ٦ سنوات: ممنوع (استخدم بديلاً حسب العمر)';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣-٤ مرات يومياً';
        }
        // Adults and over 12 years
        return '٥ - ١٠ مل (١-٢ ملعقة صغيرة) ٣-٤ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع استخدامه في حالات الكحة المصحوبة ببلغم (لأنه يمنع طرده مما قد يسبب التهاب رئوي).',
        'قد يسبب دوار بسيط أو نعاس عند البعض، لذا يجب الحذر عند القيادة.',
        'ممنوع استخدامه لمرضى الربو (Asthma) أو الفشل التنفسي.',
        'تداخلات مهمة: يُمنع مع مثبطات إنزيم MAO خلال 14 يوم.',
        'يُستخدم بحذر مع أدوية السيروتونين (مثل SSRIs/SNRIs) بسبب خطر متلازمة السيروتونين.',
        'يجب عدم تجاوز الجرعة المقررة لتجنب أي آثار جانبية على الجهاز العصبي.',
        'الحمل/الرضاعة: يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.'
    ]
  },
  // 41. Fluimucil 600mg Eff. Tabs
  {
    id: 'fluimucil-600-eff-tabs',
    name: 'Fluimucil 600mg 10 Eff. Tabs',
    genericName: 'N-Acetylcysteine',
    concentration: '600mg',
    price: 135, 
    matchKeywords: [
        'mucolytic', 'effervescent', 'acetylcysteine', 'zambon', 'thick sputum', 'fluimucil',
        'مذيب للبلغم', 'فوار', 'فلويموسيل', 'استيل سيستين', 'بلغم لزج', 'زامبون'
    ],
    usage: 'مذيب قوي للبلغم (البراند الأصلي) ومضاد للأكسدة، يستخدم أيضاً لحماية الرئة والمدخنين.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Effervescent Tablets',
    
    // SAFETY: 600mg high dose. Adult use.
    minAgeMonths: 144, // 12 Years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '600mg (قرص) — مرة يومياً — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'ممنوع للأطفال أقل من ١٢ سنة.',
        'يستخدم بحذر لمرضى الربو وقرحة المعدة.',
        'الرائحة الكبريتية الخفيفة طبيعية للمادة الفعالة.',
        'يجب الإكثار من شرب الماء لزيادة فعالية إذابة البلغم.',
        'قد يزيد الصداع/الدوخة مع النيتروجليسرين (تداخل دوائي محتمل).',
        'لا يُجمَع مع مهدئ سعال في نفس الجرعة؛ إن لزم ففاصل ٤–٦ ساعات.',
        'يفضل الفصل بينه وبين المضادات الحيوية بساعتين.'
    ]
  },
  // 42. Rotahelex Advance Oral Drops
    {
        id: 'rotahelex-advance-drops-15',
        name: 'Rotahelex Advance Oral Drops 15ml',
    genericName: 'Ivy Leaf Extract',
    concentration: 'Concentrated Extract',
    price: 34, 
    matchKeywords: [
        'cough', 'drops', 'herbal', 'ivy leaf', 'infant cough', 'mucolytic',
        'كحة', 'سعال', 'نقط', 'لبلاب', 'روتا هيلكس', 'كحة اطفال', 'مذيب للبلغم'
    ],
    usage: 'نقط عشبية مذيبة للبلغم وموسعة للشعب الهوائية، مخصصة للأطفال والكبار.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Oral Drops',
    
    // SAFETY: Ivy leaf is generally well-tolerated, but infants need medical supervision.
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6) {
            return 'للرضع أقل من ٦ أشهر: غير موصى به؛ من ٦–١٢ شهر: ٢.٥ مل مرتين يومياً';
        }
        if (ageMonths < 24) { // Under 2 years
            return '٥–١٠ نقط ٣ مرات يومياً؛ راقب النعاس';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '١٠ نقط ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '١٥ - ٢٠ نقط ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٢٠ - ٢٥ نقطة ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يجب عدم تجاوز الجرعة المحددة لكل فئة عمرية.',
        'يستخدم بحذر في حالات التهاب المعدة.',
        'يرج جيداً قبل الاستخدام للتأكد من تجانس المستخلص العشبي.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'صلاحية العبوة بعد الفتح عادة تكون ٦ أشهر.'
    ]
  },
  // 43. Rotahelex Oral Drops 30ml
  {
    id: 'rotahelex-drops-30',
    name: 'Rotahelex Oral Drops 30ml',
    genericName: 'Ivy Leaf Extract',
    concentration: 'Concentrated Extract',
    price: 55, 
    matchKeywords: [
        'cough', 'drops', 'herbal', 'ivy leaf', 'expectorant', 'mucolytic',
        'كحة', 'سعال', 'نقط', 'لبلاب', 'روتا هيلكس', 'مذيب للبلغم', 'طارد للبلغم'
    ],
    usage: 'نقط عشبية طبيعية مذيبة للبلغم وموسعة للشعب الهوائية، مناسبة لجميع الأعمار.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Oral Drops',
    
    // SAFETY: Ivy leaf is generally well-tolerated, but drops for infants need precision.
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6) {
            return 'للرضع أقل من ٦ أشهر: غير موصى به؛ من ٦–١٢ شهر: ٢.٥ مل مرتين يومياً';
        }
        if (ageMonths < 24) { // 0 - 2 years
            return '٥ - ١٠ نقط ٣ مرات يومياً (حسب التشخيص)';
        }
        if (ageMonths < 72) { // 2 - 6 years
            return '١٠ نقط ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 - 12 years
            return '١٥ نقطة ٣ مرات يومياً';
        }
        // Adults
        return '٢٠ - ٢٥ نقطة ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يرجى عدم تجاوز الجرعة المقررة.',
        'يستخدم بحذر لمرضى قرحة المعدة.',
        'أعد التقييم إذا استمرت الكحة أكثر من أسبوع.',
        'قد يسبب إسهال بسيط عند البعض بسبب مادة السوربيتول.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

// 44. Rotahelex Cysteine Syrup
  {
    id: 'rotahelex-cysteine-syrup',
    name: 'Rotahelex Cysteine Syrup 100ml',
    genericName: 'Ivy Leaf Extract + N-Acetylcysteine',
    concentration: 'Complex Formula',
    price: 60, 
    matchKeywords: [
        'cough', 'mucolytic', 'ivy leaf', 'acetylcysteine', 'thick phlegm', 'bronchodilator',
        'كحة', 'سعال', 'بلغم لزج', 'مذيب للبلغم', 'لبلاب', 'سيستين', 'روتا هيلكس'
    ],
    usage: 'تركيبة مزدوجة (عشبية + كيميائية) لإذابة البلغم اللزج وتوسيع الشعب الهوائية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Contains Acetylcysteine.
    // Contraindicated for children < 2 years.
    minAgeMonths: 24, // 2 Years Minimum
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'ممنوع للأطفال أقل من سنتين';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) مرتين يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'ممنوع للأطفال أقل من سنتين.',
        'يستخدم بحذر لمرضى الربو وقرحة المعدة.',
        'قد يكون له رائحة كبريتية مميزة بسبب مادة السيستين وهذا طبيعي.',
        'لا يُجمَع مع مهدئ سعال في نفس الجرعة؛ إن لزم ففاصل ٤–٦ ساعات.',
        'قد يزيد الصداع/الدوخة مع النيتروجليسرين (تداخل دوائي محتمل).',
        'يفضل الفصل عن المضادات الحيوية ساعتين إذا أُخذت بالفم.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية لدواء مركب؛ يفضّل تجنبه إلا للضرورة وبأقل جرعة وأقصر مدة.',
        'يرج جيداً قبل الاستعمال.'
    ]
  },

  // 45. Ivy Max Syrup
  {
    id: 'ivy-max-syrup',
    name: 'Ivy Max Syrup 120ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 44, 
    matchKeywords: [
        'cough', 'mucolytic', 'expectorant', 'ivy leaf', 'herbal', 'bronchodilator',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'موسع شعب', 'اعشاب', 'إيفي ماكس'
    ],
    usage: 'مذيب للبلغم وموسع للشعب الهوائية (عشبي طبيعي)، يساعد على تهدئة السعال وتحسين التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Ivy leaf extract is safe but generally used for > 2 years.
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل تقييم الفائدة والخطر للأطفال أقل من سنتين';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ - ١٠ مل (١.٥ - ٢ ملعقة صغيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى التهاب أو قرحة المعدة.',
        'قد يسبب تأثير ملين بسيط عند تناول جرعات كبيرة بسبب مادة السوربيتول.',
        'أعد التقييم إذا استمرت الكحة أكثر من أسبوع أو ظهرت حرارة.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 46. Mucosol 375mg Capsules
  {
    id: 'mucosol-375-capsules',
    name: 'Mucosol 375mg 20 Caps.',
    genericName: 'Carbocisteine',
    concentration: '375mg',
    price: 26, 
    matchKeywords: [
        'mucolytic', 'carbocisteine', 'phlegm', 'mucosol', 'smoker cough',
        'مذيب للبلغم', 'ميوكوسول', 'كاربوسيستين', 'بلغم لزج', 'كبسول', 'كحة مدخنين'
    ],
    usage: 'مذيب للبلغم اللزج، يعمل على تقليل لزوجة المخاط لتسهيل طرده وتهدئة الكحة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Capsules',
    
    // SAFETY: Not for children. Carbocisteine 375mg is for adults and > 15 years.
    minAgeMonths: 180, // 15 Years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => '375mg (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — ٥–٧ أيام.',
    
    
    warnings: [
        'غير مخصص للأطفال أقل من ١٥ سنة (توجد منه نسخة شراب للأطفال).',
        'ممنوع لمرضى قرحة المعدة أو الاثني عشر النشطة.',
        'يستخدم بحذر لمرضى التهابات المعدة/تاريخ قرحة المعدة.',
        'يجب شرب كميات كبيرة من الماء يومياً لمساعدة الدواء في إذابة البلغم.'
    ]
  },

  // 47. Babetone Syrup
  {
    id: 'babetone-syrup',
    name: 'Babetone Syrup 120ml',
    genericName: 'Thyme + Ivy Leaf Extract',
    concentration: 'Herbal Formula',
    price: 35, 
    matchKeywords: [
        'cough', 'herbal', 'pediatric', 'thyme', 'ivy', 'expectorant', 'babetone',
        'كحة', 'سعال', 'بابيتون', 'اعشاب', 'زعتر', 'لبلاب', 'مذيب للبلغم', 'كحة اطفال'
    ],
    usage: 'مكمل غذائي عشبي لتحسين وظائف الجهاز التنفسي وتهدئة الكحة وإذابة البلغم بشكل طبيعي.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 3 years. 
    // Below 3 years needs medical supervision.
    minAgeMonths: 36, // 3 Years
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 36) {
            return 'للأطفال أقل من ٣ سنوات: ٢.٥ مل حسب العمر أو اختر بديلاً أنسب';
        }
        if (ageMonths < 72) { // 3 to 6 years
            return '٥ مل (ملعقة صغيرة) ٢ - ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى التهابات المعدة (بسبب الزعتر).',
        'يحتوي على سكر (يجب الحذر لمرضى السكري).',
        'أعد التقييم إذا استمرت الكحة أكثر من أسبوع مع حرارة.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 48. Babetone Sugar-Free Syrup
  {
    id: 'babetone-sugar-free-syrup',
    name: 'Babetone Syrup Sugar Free 120ml',
    genericName: 'Thyme + Ivy Leaf Extract (Sugar-Free)',
    concentration: 'Herbal Formula',
    price: 35, 
    matchKeywords: [
        'cough', 'herbal', 'sugar free', 'diabetes', 'thyme', 'ivy', 'babetone',
        'كحة', 'سعال', 'بابيتون', 'بدون سكر', 'سكر', 'اعشاب', 'زعتر', 'لبلاب'
    ],
    usage: 'مكمل غذائي عشبي (خالي من السكر) لتهدئة الكحة وإذابة البلغم، مثالي لمرضى السكري.',
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
            return 'للأطفال أقل من ٣ سنوات: ٢.٥ مل حسب العمر أو اختر بديلاً أنسب';
        }
        if (ageMonths < 72) { // 3 to 6 years
            return '٥ مل (ملعقة صغيرة) ٢ - ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ - ١٠ مل ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '١٠ مل (ملعقة كبيرة) ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر لمرضى التهابات المعدة (بسبب الزعتر).',
        'رغم خلوه من السكر، إلا أنه قد يسبب تأثيراً مليناً بسيطاً عند الإفراط في الجرعة.',
        'أعد التقييم إذا لم تتحسن الكحة خلال أسبوع.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 49. Bronchicum Ivy Syrup
  {
    id: 'bronchicum-ivy-syrup',
    name: 'Bronchicum Ivy Syrup 100ml',
    genericName: 'Dried Ivy Leaf Extract',
    concentration: '0.7g/100ml',
    price: 98, 
    matchKeywords: [
        'cough', 'ivy', 'herbal', 'mucolytic', 'bronchodilator', 'bronchicum',
        'كحة', 'سعال', 'لبلاب', 'مذيب للبلغم', 'برونشيكوم إيفي', 'موسع شعب', 'سانوفي'
    ],
    usage: 'مذيب للبلغم وموسع للشعب الهوائية (عشبي عالي الجودة)، يهدئ الكحة ويسهل التنفس.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Safe for children > 2 years. 
    minAgeMonths: 24, // 2 Years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 200,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'يفضل تقييم الفائدة والخطر للأطفال أقل من سنتين';
        }
        if (ageMonths < 72) { // 2 to 6 years
            return '٢.٥ مل (نصف ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths < 144) { // 6 to 12 years
            return '٥ مل (ملعقة صغيرة) ٣ مرات يومياً';
        }
        // Adults and > 12 years
        return '٧.٥ مل ٣ مرات يومياً';
    },
    
    
    warnings: [
        'يستخدم بحذر في حالة التهاب المعدة.',
        'يُحفظ في درجة حرارة الغرفة (بعيداً عن الحرارة العالية).',
        'إذا استمرت الكحة لأكثر من ٧ أيام يجب إعادة التقييم.',
        'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.'
    ]
  },

  // 50. Mucosol Pediatric Syrup
  {
    id: 'mucosol-pediatric-syrup',
    name: 'Mucosol Ped. 125mg/5ml Syrup 120ml',
    genericName: 'Carbocisteine',
    concentration: '125mg/5ml',
    price: 23, 
    matchKeywords: [
        'cough', 'mucolytic', 'carbocisteine', 'pediatric', 'phlegm', 'mucosol',
        'كحة', 'سعال', 'بلغم', 'مذيب للبلغم', 'ميوكوسول اطفال', 'كاربوسيستين'
    ],
    usage: 'مذيب للبلغم مخصص للأطفال، يقلل لزوجة البلغم ليسهل طرده ويهدئ الكحة.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.COUGH,
    form: 'Syrup',
    
    // SAFETY: Generally safe for children > 2 years.
    // Use under 2 years only under strict medical supervision.
    minAgeMonths: 24, // 2 Years Minimum
    maxAgeMonths: 144, // Up to 12 years
    minWeight: 10,
    maxWeight: 50,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return 'لا يستخدم للأطفال أقل من سنتين إلا بعد تقييم وتحديد الجرعة';
        }
        if (ageMonths <= 60) { // 2 to 5 years
            return '٢.٥ - ٥ مل (نصف لـ ملعقة صغيرة) ٣ مرات يومياً';
        }
        if (ageMonths <= 144) { // 5 to 12 years
            return '١٠ مل (٢ ملعقة صغيرة) ٣ مرات يومياً';
        }
        return 'راجع جرعة الكبار (كبسول أو شراب بتركيز أعلى)';
    },
    
    
    warnings: [
        'يستخدم بحذر ويُتجنب عند قرحة المعدة/نزيف هضمي نشط.',
        'يستخدم بحذر لمرضى الحساسية الصدرية (الربو).',
        'يحتوي على سكر (يجب مراعاة ذلك لمرضى السكري من الأطفال).',
        'أعد التقييم إذا استمرت الكحة أكثر من ٥ أيام دون تحسن.'
    ]
  },




];

