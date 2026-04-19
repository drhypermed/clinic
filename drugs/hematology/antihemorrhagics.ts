
import { Medication, Category } from '../../types';

export const ANTIHEMORRHAGICS_GROUP: Medication[] = [
  // 1. Kapron 500 mg 20 f.c. tabs.
  {
    id: 'kapron-500-tabs',
    name: 'Kapron 500 mg 20 f.c. tabs.',
    genericName: 'Tranexamic Acid',
    concentration: '500mg',
    price: 110,
    matchKeywords: [
      'bleeding', 'hemorrhage', 'menorrhagia', 'kapron', 'tranexamic', 'antihemorrhagic',
      'كابرون', 'نزيف', 'ترانيكساميك', 'غزارة الدورة', 'نزيف الانف', 'خلع الاسنان'
    ],
    usage: 'مضاد تحلل فيبرين للسيطرة على نزيف الأنف، غزارة الطمث، النزيف بعد خلع الأسنان والجراحات السطحية (للأعراض قصيرة المدى).',
    timing: 'كل ٨ ساعات مع الأكل – ٣–٥ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Film Coated Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '٢ قرص (١ جم) كل ٨ ساعات مع الأكل لمدة ٣–٥ أيام (بالغون).';
      }
      const doseMg = Math.min(25 * weight, 1000);
      return `${doseMg} مجم (حتى ١ جم) كل ٨ ساعات مع الأكل لمدة ٥ أيام (أطفال >١٢ سنة).`;
    },

    warnings: [
      'الحمل: فئة B؛ يُستخدم فقط إذا فاقت فائدة التحكم في النزيف المخاطر.',
      'تداخلات: يزيد خطر الجلطات مع حبوب منع الحمل المجمعة أو الإستروجينات؛ يقل الامتصاص مع الكحول المفرط؛ يُزاد خطر التجلط مع العوامل المساعدة للتجلط.',
      'قصور كلوي: خفّض الجرعة/زد الفاصل إذا تصفية الكرياتينين منخفضة.',
      'أوقف وأعد التقييم عند ألم ساق حاد أو ضيق تنفس (اشتباه جلطة).'
    ]
  },

  // 2. Cona-Adione 10 mg 30 chewable tab.
  {
    id: 'cona-adione-10-30-chew',
    name: 'Cona-Adione 10 mg 30 chewable tab.',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg',
    price: 54,
    matchKeywords: [
      'vitamin k', 'bleeding', 'anticoagulant reversal', 'cona adione', 'phytomenadione',
      'كونا اديون', 'فيتامين ك', 'سيولة', 'نزيف', 'مضاد للتجلط'
    ],
    usage: 'فيتامين K1 لعلاج أو منع النزيف الناتج عن نقص فيتامين ك أو عكس تأثير الوارفارين الزائد (غير إسعافي بمفرده).',
    timing: 'جرعة فموية واحدة – تُعاد حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Chewable Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '٥–١٠ مجم فموياً جرعة واحدة مع الأكل، تُعاد حسب INR (بالغون).';
      }
      return '٢٫٥–٥ مجم فموياً جرعة واحدة مع الأكل حسب البروتوكول (أطفال >سنتين).';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم عند الحاجة لعكس الوارفارين مع موازنة خطر تخثر الجنين/الأم.',
      'تداخلات: يعاكس تأثير الوارفارين/الأسينوكومارول؛ المضادات الحيوية واسعة الطيف قد تُخفض فيتامين ك الداخلي وتطيل زمن النزف؛ زيت الأورليستات قد يقلل الامتصاص.',
      'إعطاء فموي بطيء المفعول، لا يُعتمد عليه وحده في النزيف الحاد مهدد الحياة (يحتاج بلازما طازجة).',
      'يحفظ بعيداً عن الضوء لأن فيتامين ك حساس للضوء.'
    ]
  },

  // 3. Cona-Adione 10 mg 100 chewable tablets
  {
    id: 'cona-adione-10-100-chew',
    name: 'Cona-Adione 10 mg 100 chewable tablets',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg',
    price: 83,
    matchKeywords: [
      'vitamin k', 'bleeding', 'anticoagulant reversal', 'cona adione', 'phytomenadione',
      'كونا اديون', 'فيتامين ك', 'سيولة', 'نزيف', 'عبوة توفير'
    ],
    usage: 'فيتامين K1 لعلاج/وقاية نقص فيتامين ك أو عكس تأثير الوارفارين الزائد (جرعات فموية متغيرة).',
    timing: 'جرعة فموية – حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Chewable Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥–١٠ مجم فموياً مع الأكل جرعة واحدة تُعاد حسب INR (بالغون، حد أقصى ٢٠ مجم). أطفال: ٢٫٥–٥ مجم حسب الوزن والـ INR.';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم إذا لزم لعكس زيادة سيولة الدم.',
      'تداخلات: يعاكس الوارفارين؛ الكوليستيرامين والأورليستات يقللان الامتصاص.',
      'لا يعتمد عليه منفرداً في النزيف الشديد، وقد يسبب مقاومة مؤقتة للوارفارين لأيام.'
    ]
  },

  // 4. Dicynone 250 mg/2 ml 3 amp.
  {
    id: 'dicynone-250-amp',
    name: 'Dicynone 250 mg/2 ml 3 amp.',
    genericName: 'Etamsylate',
    concentration: '250mg/2ml',
    price: 42,
    matchKeywords: [
      'hemostatic', 'bleeding', 'surgery', 'capillary', 'dicynone', 'etamsylate',
      'دايسينون', 'ايتامسيلات', 'حقن نزيف', 'عمليات', 'شعيرات دموية'
    ],
    usage: 'عامل مقوٍ للشعيرات ومضاد نزف شعيري يُستخدم قبل/بعد الجراحات الصغرى أو نزف الأنف واللثة.',
    timing: 'كل ٦ ساعات IM/IV ببطء – ٢–٣ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Injection (IM/IV)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '٢٥٠–٥٠٠ مجم (١–٢ أمبول) IM/IV ببطء كل ٦ ساعات لمدة ٢–٣ أيام (بالغون).';
      }
      const dose = Math.min(10 * weight, 250);
      return `${dose} مجم (حتى ٢٥٠ مجم) IM/IV ببطء كل ٦–٨ ساعات لمدة ٢–٣ أيام (أطفال ≥ سنة).`;
    },

    warnings: [
      'الحمل: بيانات محدودة (يُستخدم بحذر إذا لزم)؛ لم يُثبت ضرر واضح لكن يفضّل تجنبه بغير ضرورة.',
      'تداخلات: قد يُضعف تأثير مضادات التخثر الخفيفة، لكنه لا يغني عن عوامل التجلط في نزف نقص العوامل.',
      'لا يُغني عن نقل الدم عند النزيف الشديد؛ راقب حدوث صداع أو طفح جلدي.',
      'يُستخدم بحذر في البورفيريا.'
    ]
  },

  // 5. Flazacor 30 mg 10 tabs.
  {
    id: 'flazacor-30-tabs',
    name: 'Flazacor 30 mg 10 tabs.',
    genericName: 'Deflazacort',
    concentration: '30mg',
    price: 148,
    matchKeywords: [
      'corticosteroid', 'itp', 'platelets', 'inflammation', 'flazacor', 'deflazacort',
      'فلازاكور', 'كورتيزون', 'نقص الصفائح', 'مناعة', 'التهاب'
    ],
    usage: 'كورتيكوستيرويد يستخدم في حالات النزيف المناعي (مثل نقص الصفائح الدموية ITP) والالتهابات الشديدة.',
    timing: 'مرة يومياً صباحاً بعد الإفطار – حسب التشخيص',
    category: Category.CORTICOSTEROID,
    form: 'Tablet',

    minAgeMonths: 60, // 5 years + for 30mg (high dose)
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '١ قرص ٣٠ مجم مرة صباحاً بعد الإفطار (٠٫٥–١ مجم/كجم/يوم، حد أقصى ٩٠ مجم) – بالغون ITP/التهابات.';
      }
      return '٠٫٢٥–١٫٥ مجم/كجم/يوم مرة صباحاً بعد الإفطار حسب البروتوكول (أطفال).';
    },

    warnings: [
      'الحمل: فئة C؛ لا يُستخدم إلا إذا فاقت الفائدة المخاطر.',
      'تداخلات: يزيد خطر قرحة/نزف مع NSAIDs أو الأسبرين؛ يقل تأثيره مع محرضات CYP3A4 (ريفامبين، كاربامازيبين)؛ اللقاحات الحية ممنوعة أثناء الجرعات المناعية.',
      'ارتفاع ضغط/سكر، هشاشة عظام، وكبت مناعي؛ راقب الضغط والسكر وأي عدوى.',
      'سحب تدريجي لتجنب قصور كظري حاد.'
    ]
  },

  // 6. Flazacor 6 mg 10 tabs.
  {
    id: 'flazacor-6-tabs',
    name: 'Flazacor 6 mg 10 tabs.',
    genericName: 'Deflazacort',
    concentration: '6mg',
    price: 38,
    matchKeywords: [
      'corticosteroid', 'itp', 'platelets', 'inflammation', 'flazacor', 'deflazacort',
      'فلازاكور', 'كورتيزون', 'نقص الصفائح', 'حساسية', 'التهاب'
    ],
    usage: 'كورتيكوستيرويد (تركيز منخفض) لعلاج اضطرابات المناعة ونقص الصفائح الدموية والالتهابات.',
    timing: 'مرة يومياً صباحاً بعد الأكل – حسب التشخيص',
    category: Category.CORTICOSTEROID,
    form: 'Tablet',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.min(Math.max(weight * 0.5, weight * 0.25), weight * 1.5);
      if (ageMonths >= 144) {
        return '٦–٣٠ مجم/يوم (١–٥ أقراص) مرة صباحاً بعد الأكل حسب شدة الحالة (بالغون).';
      }
      return `${dose.toFixed(1)} مجم/يوم (٠٫٢٥–١٫٥ مجم/كجم) ≈ ${Math.max(1, Math.round(dose / 6))} قرص مرة صباحاً بعد الأكل (أطفال).`;
    },

    warnings: [
      'الحمل: فئة C؛ تجنبه إلا للضرورة.',
      'تداخلات: NSAIDs تزيد خطر القرحة؛ محرضات CYP3A4 تقلل الفعالية؛ اللقاحات الحية ممنوعة.',
      'مراقبة النمو وكثافة العظام عند الأطفال؛ خطر قصور كظري عند الإيقاف المفاجئ.'
    ]
  },

  // 7. Kapron 500 mg/5 ml 6 i.v. amp.
  {
    id: 'kapron-500-amp',
    name: 'Kapron 500 mg/5 ml 6 i.v. amp.',
    genericName: 'Tranexamic Acid',
    concentration: '500mg/5ml',
    price: 90,
    matchKeywords: [
      'bleeding', 'hemorrhage', 'surgery', 'trauma', 'kapron', 'injection',
      'كابرون حقن', 'نزيف حاد', 'حقن وريد', 'حوادث', 'عمليات'
    ],
    usage: 'مضاد تحلل فيبرين بالحقن للسيطرة على النزيف الحاد أو أثناء الجراحات/الرضوض.',
    timing: 'كل ٦–٨ ساعات IV ببطء – ٢–٣ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Injection (IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const doseMg = Math.min(weight * 10, 1000);
      const doseMl = doseMg / 100;
      return `${doseMg} مجم (≈ ${doseMl.toFixed(1)} مل) IV ببطء خلال ≥١٠ دقائق كل ٦–٨ ساعات لمدة ٢–٣ أيام.`;
    },

    warnings: [
      'الحمل: فئة B؛ يُستخدم إذا فاقت الفائدة المخاطر (خطر جلطات).',
      'تداخلات: يزيد خطر التجلط مع موانع الحمل المجمعة/الإستروجين؛ يُزاد تأثيره مع عوامل مساعدة للتجلط.',
      'قصور كلوي: خفض الجرعة أو أطِل الفاصل.',
      'يُوقف فوراً عند تشنجات أو هبوط ضغط شديد.'
    ]
  },

  // 8. Haemostop 250 mg/2 ml 3 amp.
  {
    id: 'haemostop-250-amp',
    name: 'Haemostop 250 mg/2 ml 3 amp.',
    genericName: 'Etamsylate',
    concentration: '250mg/2ml',
    price: 27,
    matchKeywords: [
      'hemostatic', 'bleeding', 'surgery', 'haemostop', 'etamsylate',
      'هيموستوب', 'ايتامسيلات', 'وقف النزيف', 'رخيص', 'بديل دايسينون'
    ],
    usage: 'بديل اقتصادي لـ Etamsylate للسيطرة على نزف الشعيرات في الجراحات الصغيرة وENT/OBGYN.',
    timing: 'كل ٦ ساعات IM/IV ببطء – ٢–٣ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Injection (IM/IV)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '٢٥٠–٥٠٠ مجم IV/IM ببطء كل ٦ ساعات لمدة ٢–٣ أيام (بالغون).';
      }
      const dose = Math.min(10 * weight, 250);
      return `${dose} مجم IV/IM ببطء كل ٦–٨ ساعات لمدة ٢–٣ أيام (أطفال ≥ سنة).`;
    },

    warnings: [
      'الحمل: بيانات محدودة؛ يُستخدم فقط إذا لزم.',
      'تداخلات: لا يغني عن عوامل التجلط المفقودة؛ قد يتعارض مع مضادات التخثر.',
      'تحسس كبريتيت ممكن؛ راقب الطفح/الربو.',
      'لا يُستخدم كعلاج وحيد في النزف الحاد الكبير.'
    ]
  },

  // 9. Epikavit 10 mg/ml 3 amp.
  {
    id: 'epikavit-10-amp',
    name: 'Epikavit 10 mg/ml 3 amp.',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg/1ml',
    price: 36,
    matchKeywords: [
      'vitamin k', 'bleeding', 'newborn', 'hemorrhage', 'epikavit',
      'ايبيكافيت', 'فيتامين ك حقن', 'نزيف حديثي الولادة', 'سيولة'
    ],
    usage: 'فيتامين K1 (حقن) لعكس نقص فيتامين ك أو عكس جرعة زائدة من الوارفارين، ووقاية حديثي الولادة.',
    timing: 'جرعة واحدة IV ببطء/IM – تُعاد حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Injection (IM/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths < 1) {
        return '١ مجم IM جرعة واحدة (٠٫١ مل) بعد الولادة (حديثو الولادة).';
      }
      if (ageMonths >= 144) {
        return '٥–١٠ مجم IV ببطء (مخفف) أو IM جرعة واحدة؛ تُكرر حسب INR (بالغون، حد أقصى ٢٠ مجم).';
      }
      return '٠٫٥–٥ مجم IV ببطء أو IM جرعة واحدة حسب الحالة والوزن (أطفال).';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم إذا فاقت الفائدة الخطر.',
      'تداخلات: يعاكس الوارفارين؛ السلفوناميدات/السيفالوسبورينات قد تزيد خطر نقص بروثرومبين؛ الكوليستيرامين يقلل الامتصاص الفموي (غير مطبق هنا).',
      'الحقن الوريدي السريع قد يسبب تأقاً مهدداً للحياة؛ أوقف فوراً عند طفح/هبوط ضغط.',
      'راقب وظائف الكبد في مرضى الكبد المتقدم.'
    ]
  },

  // 10. Phyto K 10 mg 50 f.c. tab.
  {
    id: 'phyto-k-10-tabs',
    name: 'Phyto K 10 mg 50 f.c. tab.',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg',
    price: 115,
    matchKeywords: [
      'vitamin k', 'bleeding', 'anticoagulant', 'phyto k',
      'فيتو ك', 'فيتامين ك أقراص', 'سيولة الدم', 'نزيف'
    ],
    usage: 'أقراص فيتامين K1 لعلاج نقص فيتامين ك أو عكس زيادة سيولة الوارفارين (غير إسعافي).',
    timing: 'جرعة فموية – حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Film Coated Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥–١٠ مجم فموياً مع الأكل جرعة واحدة (بالغون، تُعدل حسب INR). أطفال >٥ سنوات: ٢٫٥–٥ مجم حسب التشخيص.';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم عند الضرورة.',
      'تداخلات: يعاكس الوارفارين؛ الأطعمة عالية فيتامين ك تقلل الفعالية إذا زادت فجأة.',
      'بداية المفعول بطيئة نسبياً؛ لا يُستخدم منفرداً للنزيف الحاد جداً.'
    ]
  },
  // 11. Savibleed 500 mg 20 f.c. tab.
  {
    id: 'savibleed-500-tabs',
    name: 'Savibleed 500 mg 20 f.c. tab.',
    genericName: 'Tranexamic Acid',
    concentration: '500mg',
    price: 110,
    matchKeywords: [
      'bleeding', 'hemorrhage', 'menorrhagia', 'savibleed', 'tranexamic',
      'سافيبليد', 'نزيف', 'ترانيكساميك', 'غزارة الدورة', 'نزيف الانف'
    ],
    usage: 'مضاد تحلل فيبرين للفم للسيطرة على نزيف الطمث أو الأنف أو النزيف بعد الأسنان والجراحات الصغرى.',
    timing: 'كل ٨ ساعات مع الأكل – ٣–٥ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Film Coated Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '٢ قرص (١ جم) كل ٨ ساعات مع الأكل لمدة ٣–٥ أيام (بالغون).';
      }
      const doseMg = Math.min(25 * weight, 1000);
      return `${doseMg} مجم (حتى ١ جم) كل ٨ ساعات مع الأكل لمدة ٥ أيام (أطفال >١٢ سنة).`;
    },

    warnings: [
      'الحمل: فئة B؛ يُستخدم للضرورة فقط بسبب خطر التجلط.',
      'تداخلات: يزيد خطر التجلط مع الإستروجينات/حبوب منع الحمل؛ التباعد مع العوامل المساعدة للتجلط.',
      'قصور كلوي: خفض الجرعة أو أطِل الفاصل.',
      'أوقف عند ألم ساق أو ضيق تنفس (اشتباه جلطة).'
    ]
  },

  // 12. Vitamin D3 & K2 30 tabs
  {
    id: 'd3-k2-30-tabs',
    name: 'Vitamin D3 & K2 30 tabs',
    genericName: 'Vitamin D3 + Vitamin K2 (Menaquinone)',
    concentration: 'D3 1000-5000IU + K2',
    price: 270,
    matchKeywords: [
      'bone health', 'osteoporosis', 'vitamin d', 'vitamin k2', 'calcium absorption',
      'فيتامين د', 'فيتامين ك٢', 'هشاشة العظام', 'صحة العظام', 'امتصاص الكالسيوم'
    ],
    usage: 'مكمل عظام (D3 + K2) لتحسين تثبيت الكالسيوم بالعظام وتقليل ترسبه الوعائي (ليس لعلاج النزيف).',
    timing: 'مرة يومياً مع وجبة دسمة – مزمن',
    category: Category.VITAMIN_SUPPLEMENT,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص مرة يومياً مع وجبة رئيسية تحتوي دهون (غداء أو إفطار) – مزمن.';
    },

    warnings: [
      'الحمل: غالباً آمن بجرعات الفيتامينات؛ أعيدي التقييم عند اللزوم.',
      'تداخلات: فيتامين K2 قد يقلل تأثير الوارفارين (خطر تجلط)؛ الكورتيكوستيرويدات ومدرات العروة قد تقلل فعالية فيتامين D.',
      'ليس بديلاً لفيتامين K1 في النزيف أو لمرضى على الوارفارين.',
      'راقب الكالسيوم لتجنب فرط كالسيوم، خاصة مع مكملات كالسيوم أخرى.'
    ]
  },

  // 13. Amri-K 10 mg/ml 5 amp. i.m.
  {
    id: 'amri-k-10-amp',
    name: 'Amri-K 10 mg/ml 5 amp. i.m.',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg/1ml',
    price: 40,
    matchKeywords: [
      'vitamin k', 'bleeding', 'anticoagulant reversal', 'amri k', 'warfarin',
      'امري ك', 'فيتامين ك حقن', 'سيولة', 'نزيف', 'تسمم وارفرين'
    ],
    usage: 'حقن فيتامين K1 لعلاج نقص فيتامين ك أو عكس زيادة جرعة الوارفارين (IM فقط).',
    timing: 'جرعة واحدة IM – تُعاد حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Injection (IM)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths < 12) {
        return '١ مجم IM جرعة واحدة (٠٫١ مل) – رضع.';
      }
      if (ageMonths >= 144) {
        return '١٠ مجم IM جرعة واحدة تُكرر حسب INR (بالغون).';
      }
      return '٥ مجم IM (نصف أمبول) جرعة واحدة تُضبط بالـ INR (أطفال).';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم عند الضرورة فقط.',
      'تداخلات: يعاكس الوارفارين والسينوكومارول؛ الكوليستيرامين يقلل الامتصاص الفموي (غير مطبق هنا).',
      'يجب تغطية النزيف الحاد بنقل بلازما/مركزات عوامل إذا لزم.',
      'حماية من الضوء مطلوبة.'
    ]
  },

  // 14. Dicynone 500 mg 14 tab.
  {
    id: 'dicynone-500-tabs',
    name: 'Dicynone 500 mg 14 tab.',
    genericName: 'Etamsylate',
    concentration: '500mg',
    price: 102,
    matchKeywords: [
      'hemostatic', 'menorrhagia', 'capillary', 'dicynone', 'iud bleeding',
      'دايسينون', 'ايتامسيلات', 'نزيف اللولب', 'غزارة الدورة', 'شعيرات دموية'
    ],
    usage: 'Etamsylate فموي لعلاج نزيف الشعيرات وغزارة الطمث (مثلاً مع اللولب).',
    timing: 'كل ٦ ساعات مع الأكل – ٣–٥ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥٠٠ مجم ٣–٤ مرات يومياً مع الطعام لمدة ٣–٥ أيام.';
    },

    warnings: [
      'الحمل: بيانات محدودة؛ يُستخدم فقط عند الضرورة.',
      'تداخلات: لا يغني عن العوامل المفقودة؛ قد يقلل تأثير مضادات التخثر الخفيفة.',
      'قد يسبب غثياناً أو طفحاً؛ أوقفه عند تفاعلات تحسسية.',
      'ليس علاجاً للهيموفيليا أو نزف نقص عوامل التخثر.'
    ]
  },

  // 15. Savibleed 500 mg/5 ml 5 amp.
  {
    id: 'savibleed-500-amp',
    name: 'Savibleed 500 mg/5 ml 5 amp.',
    genericName: 'Tranexamic Acid',
    concentration: '500mg/5ml',
    price: 60,
    matchKeywords: [
      'bleeding', 'surgery', 'trauma', 'savibleed', 'iv injection',
      'سافيبليد حقن', 'نزيف العمليات', 'حقن وريد', 'حوادث'
    ],
    usage: 'Tranexamic acid IV للسيطرة على النزيف الحاد أثناء/بعد الجراحة أو الرضوض.',
    timing: 'كل ٦–٨ ساعات IV ببطء – ٢–٣ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Injection (IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const doseMg = Math.min(weight * 10, 1000);
      const doseMl = doseMg / 100;
      return `${doseMg} مجم (≈ ${doseMl.toFixed(1)} مل) IV ببطء خلال ≥١٠ دقائق كل ٦–٨ ساعات لمدة ٢–٣ أيام.`;
    },

    warnings: [
      'الحمل: فئة B؛ للضرورة فقط بسبب خطر التجلط.',
      'تداخلات: الإستروجينات/حبوب منع الحمل تزيد خطر التجلط؛ العوامل المساعدة للتجلط قد تضاعف الخطر.',
      'قصور كلوي: يلزم ضبط الجرعة أو الفاصل.',
      'تجنب الحقن العضلي؛ راقب العلامات الحيوية أثناء الإعطاء.'
    ]
  },

  // 16. D3 & K2 20 film coated tabs
  {
    id: 'd3-k2-20-tabs',
    name: 'D3 & K2 20 film coated tabs',
    genericName: 'Vitamin D3 + Vitamin K2',
    concentration: 'Combination',
    price: 195,
    matchKeywords: [
      'osteoporosis', 'calcium', 'vit d', 'vit k2', 'supplement',
      'دي ٣ وكيه ٢', 'هشاشة', 'فيتامين د', 'مكمل غذائي'
    ],
    usage: 'تركيبة متطورة لضمان وصول الكالسيوم للعظام والأسنان وحماية الشرايين من التكلس.',
    timing: 'مرة يومياً مع وجبة دسمة – مزمن',
    category: Category.VITAMIN_SUPPLEMENT,
    form: 'Film Coated Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص مرة يومياً مع وجبة رئيسية تحتوي دهون – مزمن.';
    },

    warnings: [
      'الحمل: عادة آمن بجرعات فيتامينات؛ استشارة طبية مطلوبة.',
      'تداخلات: فيتامين K2 قد يعاكس الوارفارين؛ فيتامين D يتفاعل مع مدرات العروة/الثيروكسين والكورتيزون (يقلل الامتصاص).',
      'ليس علاج نزيف حاد، ولا بديل لفيتامين K1.',
      'مرضى الحصوات الكلوية: راقب الكالسيوم والسوائل.'
    ]
  },

  // 17. Methylprednisolone Mylan 500 mg 10 vials
  {
    id: 'methylpred-mylan-500-vials',
    name: 'Methylprednisolone Mylan 500 mg 10 vials',
    genericName: 'Methylprednisolone Sodium Succinate',
    concentration: '500mg',
    price: 1225,
    matchKeywords: [
      'corticosteroid', 'pulse therapy', 'autoimmune', 'shock', 'mylan',
      'ميثيل بريدنيزولون', 'سوليميدرول', 'بالس ثيرابي', 'صدمة', 'مناعة', 'مايلان'
    ],
    usage: 'علاج مكثف (Pulse Therapy) للحالات المناعية الحرجة، صدمات الحساسية الشديدة، ونوبات التصلب المتعدد.',
    timing: 'تسريب IV مرة يومياً – ١–٣ أيام',
    category: Category.CORTICOSTEROID,
    form: 'Injection (IV Infusion)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.min(weight * 30, 1000);
      return `${dose} مجم (≈ ${dose / 500} فيال ٥٠٠ مجم) IV تنقيطاً على ٣٠–٦٠ دقيقة مرة يومياً لمدة ١–٣ أيام حسب البروتوكول.`;
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم للضرورة فقط.',
      'تداخلات: اللقاحات الحية ممنوعة؛ يزيد خطر قرحة/نزف مع NSAIDs أو الأسبرين؛ قد يغيّر جرعة الوارفارين/الإنسولين.',
      'الحقن السريع (Bolus) قد يسبب اضطراب نظم/توقف قلب — التزم بالتسريب البطيء.',
      'ارتفاع ضغط/سكر، كبت مناعي، واضطرابات مزاجية؛ مراقبة لصيقة بالمستشفى.'
    ]
  },

  // 18. Tranex 500 mg 30 tab.
  {
    id: 'tranex-500-30-tabs',
    name: 'Tranex 500 mg 30 tab.',
    genericName: 'Tranexamic Acid',
    concentration: '500mg',
    price: 117,
    matchKeywords: [
      'bleeding', 'hemorrhage', 'menorrhagia', 'tranex', 'antifibrinolytic',
      'ترانكس', 'نزيف', 'قابض للاوعية', 'دورة شهرية', 'عمليات'
    ],
    usage: 'علاج وقائي وعلاجي للنزيف بأنواعه (الأنف، الأسنان، النساء، العمليات).',
    timing: 'كل ٨ ساعات مع الأكل – ٣–٥ أيام',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '١ قرص ٥٠٠ مجم كل ٨ ساعات مع الأكل لمدة ٣–٥ أيام (قد تصل ١ جم كل ٨ ساعات لنزف أشد حسب التشخيص) – بالغون.';
      }
      const doseMg = Math.min(25 * weight, 1000);
      return `${doseMg} مجم كل ٨ ساعات مع الأكل لمدة ٥ أيام (أطفال >١٢ سنة).`;
    },

    warnings: [
      'الحمل: فئة B؛ يستخدم عند الحاجة فقط بسبب خطر التجلط.',
      'تداخلات: الإستروجينات/حبوب منع الحمل تزيد خطر التجلط؛ العوامل المساعدة للتجلط تزيد الخطر.',
      'بحذر في البول الدموي (خطر انسداد حالب بجلطات).',
      'قصور كلوي: قد يتطلب خفض الجرعة أو إطالة الفاصل.'
    ]
  },

  // 19. K-Viton 10 mg 20 sugar coated tab.
  {
    id: 'k-viton-10-tabs',
    name: 'K-Viton 10 mg 20 sugar coated tab.',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg',
    price: 14,
    matchKeywords: [
      'vitamin k', 'prothrombin', 'anticoagulant', 'k viton',
      'ك فيتون', 'فيتامين ك اقراص', 'سيولة', 'نزيف'
    ],
    usage: 'لعلاج نقص البروثرومبين في الدم وتعديل جرعات أدوية السيولة.',
    timing: 'جرعة فموية – حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Sugar Coated Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥–١٠ مجم فموياً مع الأكل جرعة واحدة تُعدل حسب INR (بالغون). أطفال >٥ سنوات: ٢٫٥–٥ مجم حسب الوزن والـ INR.';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم عند الضرورة.',
      'تداخلات: يعاكس الوارفارين؛ التغير المفاجئ في تناول الخضروات الورقية قد يغير الفعالية.',
      'مفعوله أبطأ من الحقن؛ لا يُستخدم منفرداً في النزيف الحاد جداً.'
    ]
  },

  // 20. K-Dion 10 mg 30 chewable tab.
  {
    id: 'k-dion-10-30-chew',
    name: 'K-Dion 10 mg 30 chewable tab.',
    genericName: 'Phytomenadione (Vitamin K1)',
    concentration: '10mg',
    price: 33,
    matchKeywords: [
      'vitamin k', 'bleeding', 'chewable', 'k dion', 'anticoagulant',
      'ك ديون', 'فيتامين ك مضغ', 'سيولة', 'نزيف'
    ],
    usage: 'أقراص قابلة للمضغ لسرعة الامتصاص، تستخدم لمعادلة تأثير أدوية السيولة وعلاج نقص فيتامين ك.',
    timing: 'مرة يومياً – حسب INR',
    category: Category.ANTIHEMORRHAGIC,
    form: 'Chewable Tablet',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths < 144) {
        return '٥–١٠ مجم فموياً (نصف إلى قرص) جرعة واحدة مع الأكل تُعدل بالـ INR (أطفال >سنتين).';
      }
      return '٥–١٠ مجم (قرص) فموياً مع الأكل جرعة واحدة تُكرر حسب INR (بالغون، حد أقصى ٢٠ مجم دون إعادة تقييم).';
    },

    warnings: [
      'الحمل: فئة C؛ يُستخدم فقط عند الضرورة.',
      'تداخلات: يعاكس الوارفارين ويخفض مفعوله؛ الكوليستيرامين/الأورليستات يقللان الامتصاص.',
      'جرعة زائدة قد تسبب مقاومة للوارفارين لأيام؛ التزم بالمتابعة المخبرية.',
      'حساس للضوء، احفظه في العبوة.'
    ]
  },

  // 21. Methylprednisolone Mylan 1 g 10 vial for i.v.
  {
    id: 'methylpred-mylan-1g-vials',
    name: 'Methylprednisolone Mylan 1 g 10 vial for i.v.',
    genericName: 'Methylprednisolone Sodium Succinate',
    concentration: '1000mg (1g)',
    price: 2250,
    matchKeywords: [
      'corticosteroid', 'pulse therapy', 'autoimmune', 'organ transplant', 'mylan',
      'سوليميدرول ١ جرام', 'كورتيزون حقن', 'زراعة اعضاء', 'مناعة', 'رفض الاعضاء'
    ],
    usage: 'جرعات عالية جداً (High Dose) لحالات رفض زراعة الأعضاء، الذئبة الحمراء النشطة، وأمراض الدم المناعية الخطيرة.',
    timing: 'تسريب IV مرة يومياً – ١–٣ أيام',
    category: Category.CORTICOSTEROID,
    form: 'Injection (IV Infusion)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.min(weight * 30, 1000);
      return `${dose} مجم (حتى ١ جم) IV تنقيطاً على ٣٠–٦٠ دقيقة مرة يومياً لمدة ١–٣ أيام حسب البروتوكول.`;
    },

    warnings: [
      'الحمل: فئة C؛ استخدم فقط إذا فاقت الفائدة المخاطر.',
      'تداخلات: اللقاحات الحية ممنوعة؛ NSAIDs/الأسبرين يزيدان خطر القرحة؛ قد يغيّر جرعات الوارفارين/الإنسولين.',
      'الحقن السريع قد يسبب اضطراب نظم/توقف قلب؛ التزم بالتسريب البطيء.',
      'خطر ارتفاع ضغط/سكر وهياج؛ حماية المعدة بـ PPI قد تكون مطلوبة.'
    ]
  },

  // 22. Revolade 25 mg 14 f.c. tabs.
  {
    id: 'revolade-25-tabs',
    name: 'Revolade 25 mg 14 f.c. tabs.',
    genericName: 'Eltrombopag',
    concentration: '25mg',
    price: 3696,
    matchKeywords: [
      'itp', 'platelets', 'thrombocytopenia', 'hepatitis c', 'revolade',
      'ريفولاد', 'نقص الصفائح', 'محفز الصفائح', 'فيروس سي', 'نزيف المناعة'
    ],
    usage: 'علاج نقص الصفائح الدموية المزمن (ITP) للمرضى الذين لم يستجيبوا للكورتيزون، ولرفع الصفائح لمرضى فيروس سي قبل العلاج.',
    timing: 'مرة يومياً على معدة فارغة – مزمن',
    category: Category.SPECIALIZED_HEMATOLOGY,
    form: 'Film Coated Tablet',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths < 216) {
        return '٢٥ مجم مرة يومياً على معدة فارغة لـ ١–٥ سنوات، أو ٥٠ مجم مرة يومياً لـ ≥٦ سنوات (ITP مزمن، تُعدل كل ٢–٤ أسابيع).';
      }
      return '٥٠ مجم مرة يومياً على معدة فارغة (بالغون)؛ ابدأ ٢٥ مجم في مرضى الكبد أو الآسيويين – مزمن.';
    },

    warnings: [
      'الحمل: قد يضر الجنين في الدراسات الحيوانية؛ تجنب ما لم تكن الفائدة تفوق الخطر.',
      'تداخلات: مضادات الحموضة/الحديد/الكالسيوم تقلل الامتصاص (فصل ٤ ساعات)؛ قد يرفع ALT/AST — مراقبة وظائف الكبد شهرياً.',
      'خطر جلطات إذا ارتفعت الصفائح بشدة؛ أوقف أو خفّض عند ALT مرتفع أو صفائح > 400 ألف.',
      'توقف فجائي قد يؤدي لانخفاض صفائح حاد؛ خفّض تدريجياً مع متابعة الصفائح.'
    ]
  },

  // 23. Revolade 50 mg 14 tabs
  {
    id: 'revolade-50-tabs',
    name: 'Revolade 50 mg 14 tabs',
    genericName: 'Eltrombopag',
    concentration: '50mg',
    price: 8233,
    matchKeywords: [
      'itp', 'platelets', 'thrombocytopenia', 'revolade', 'aplastic anemia',
      'ريفولاد ٥٠', 'نقص الصفائح', 'انيميا لا تنسجية', 'نزيف'
    ],
    usage: 'محفز لمستقبلات الثرومبوبويتين لزيادة إنتاج الصفائح الدموية في حالات ITP المزمنة والأنيميا اللاتنسجية (Severe Aplastic Anemia).',
    timing: 'مرة يومياً على معدة فارغة – مزمن',
    category: Category.SPECIALIZED_HEMATOLOGY,
    form: 'Tablet',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥٠ مجم مرة يومياً على معدة فارغة (ابدأ ٢٥ مجم في القصور الكبدي أو الآسيويين) – مزمن. تُعدل كل ٢–٤ أسابيع (صفائح ٥٠–٢٠٠ ألف).';
    },

    warnings: [
      'الحمل: خطر محتمل على الجنين؛ استخدم وسيلة منع حمل فعالة.',
      'تداخلات: مضادات الحموضة/الكالسيوم/الحديد تقلل الامتصاص؛ راقب وظائف الكبد شهرياً.',
      'خطر جلطات إذا ارتفعت الصفائح؛ أوقف مؤقتاً عند تجاوز 400 ألف.',
      'يحتاج CBC أسبوعي بداية العلاج ثم دورياً.'
    ]
  },

];
