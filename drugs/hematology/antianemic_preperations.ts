
import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

export const ANTIANEMIC_PREPARATIONS_GROUP: Medication[] = [
  // 1. Feroglobin 30 caps
  {
    id: 'haemojet-100-amp',
    name: 'Haemojet 100 mg/2 ml 6 amps',
    genericName: 'Iron (III) Hydroxide Polymaltose Complex',
    concentration: '100mg/2ml',
    price: 130,
    matchKeywords: [
      'severe anemia', 'iron injection', 'haemojet', 'ferritin',
      'هيموجيت', 'حقن حديد', 'انيميا حادة', 'نقص الهيموجلوبين', 'عضل'
    ],
    usage: 'حديد بوليمالتوز بالعضل لعلاج نقص الحديد عندما لا يُتحمل الفموي أو تحتاج جرعات تصحيحية.',
    timing: 'أمبول 100 مجم IM يوم بعد يوم أو مرتين أسبوعياً حتى استكمال العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IM)',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'بالغون: 100 مجم IM يوم بعد يوم أو مرتين أسبوعياً حتى تصحيح العجز.';
      }
      const maxDaily = Math.min(7 * weight, 100);
      return `أطفال >6 أشهر: حتى ${maxDaily} مجم/يوم IM (5–7 مجم/كجم)، لا تتجاوز 100 مجم/يوم.`;
    },


    warnings: [
      'الحمل: يُفضَّل تجنبه في الثلث الأول؛ يمكن استخدامه بحذر لاحقاً إذا فشل الفموي.',
      'تداخلات: لا يُعطى متزامناً مع الحديد الفموي (يُفصل 4–6 ساعات)؛ تجنب خلطه بأدوية أخرى.',
      'IM فقط؛ الحقن السطحي يسبب تصبغاً دائماً/عقد ليفية.',
      'احفظ بعيداً عن الأطفال لتفادي سمية الحديد.'
    ]
  },

  // 3. Haemojet 50 mg/5 ml syrup 100 ml
  {
    id: 'haemojet-syrup',
    name: 'Haemojet 50 mg/5 ml syrup 100 ml',
    genericName: 'Iron (III) Hydroxide Polymaltose Complex',
    concentration: '50mg/5ml',
    price: 54,
    matchKeywords: [
      'anemia', 'iron for kids', 'haemojet', 'syrup', 'palatable',
      'هيموجيت شراب', 'انيميا اطفال', 'حديد شراب', 'طعم مقبول'
    ],
    usage: 'شراب حديد بوليمالتوز للرضع/الأطفال لعلاج أو وقاية نقص الحديد بطعم مقبول.',
    timing: 'جرعة يومية علاجية مقسمة أو مرة واحدة مع الطعام.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 1,
    maxAgeMonths: 144, // Usually for kids
    minWeight: 3,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const minMl = (weight * 3 / 10).toFixed(1);
      const maxMl = (weight * 6 / 10).toFixed(1);
      return `علاج: ${minMl}-${maxMl} مل/يوم (3–6 مجم/كجم) يمكن تقسيمها. وقاية: نصف الجرعة (1–3 مجم/كجم/يوم).`;
    },


    warnings: [
      'الحمل: غير موجه للحوامل؛ للاستخدام للأطفال فقط.',
      'تداخلات: قلل إعطاء الكالسيوم/الحليب الكبير مع الجرعة لتجنب خفض الامتصاص.',
      'أكمل العلاج شهرين بعد تصحيح الهيموجلوبين لملء مخازن الحديد.',
      'احفظ بعيداً عن الأطفال (سمية الحديد إذا ابتُلعت زائدة).' 
    ]
  },

  // 4. Ferrotron 30 caps
  {
    id: 'ferrotron-30-caps',
    name: 'Ferrotron 30 caps',
    genericName: 'Amino Acid Chelated Iron + Vitamins',
    concentration: 'Combination',
    price: 159,
    matchKeywords: [
      'anemia', 'chelated iron', 'ferrotron', 'gentle iron', 'pregnancy',
      'فيروترون', 'حديد مخلبي', 'انيميا الحمل', 'خفيف ع المعدة'
    ],
    usage: 'حديد مخلّب لطيف على المعدة لرفع الحديد مع امتصاص عالٍ وتقليل الإمساك.',
    timing: 'كبسولة واحدة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة يومياً؛ أو كبسولتان مؤقتاً في الأنيميا الأشد.';
    },


    warnings: [
      'الحمل: آمن كجرعة علاجية معتدلة؛ التزمي بمتابعة الهيموجلوبين.',
      'تداخلات: الحديد يقل امتصاص ليفوثيروكسين/الفلوروكينولون؛ افصل 4 ساعات. الكالسيوم/مضادات الحموضة يقللان الامتصاص.',
      'قد يسبب إمساكاً خفيفاً أو برازاً داكناً.',
      'تجنب تجاوز الجرعات دون متابعة.'
    ]
  },

  // 5. Folic Acid (MEPACO) 500 mcg 20 tabs
  {
    id: 'folic-acid-mepaco-500',
    name: 'Folic Acid (MEPACO) 500 mcg 20 tabs',
    genericName: 'Folic Acid',
    concentration: '500mcg (0.5mg)',
    price: 20,
    matchKeywords: [
      'pregnancy', 'neural tube', 'anemia', 'folic acid', 'mepaco',
      'فوليك اسيد', 'ميباكو', 'حمل', 'تشوهات الجنين', 'تحضير للحمل'
    ],
    usage: 'حمض فوليك 0.5 مجم للوقاية من عيوب الأنبوب العصبي ولعلاج نقص الفولات الخفيف.',
    timing: 'قرص واحد يومياً (يفضّل قبل الحمل وأول 12 أسبوع).',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص 0.5 مجم يومياً. يمكن الاستمرار في الحمل والرضاعة حسب الحاجة.';
    },


    warnings: [
      'الحمل: آمن وضروري بجرعات 0.4–0.8 مجم يومياً.',
      'تداخلات: يقل مستواه مع مضادات الاختلاج (فينيتوين/كاربامازيبين/فينوباربيتال)؛ قد يتداخل مع ميثوتركسات كمضاد.',
      'لا يغني عن الحديد إذا وُجد نقص حديد مصاحب.'
    ]
  },

  // 6. Folicap 0.5 mg 24 caps
  {
    id: 'folicap-0.5-caps',
    name: 'Folicap 0.5 mg 24 caps',
    genericName: 'Folic Acid',
    concentration: '0.5mg',
    price: 20,
    matchKeywords: [
      'pregnancy', 'folicap', 'softgel', 'folate',
      'فوليكاب', 'فوليك اسيد', 'كبسولات جيلاتينية', 'حمل'
    ],
    usage: 'حمض فوليك 0.5 مجم للوقاية من نقص الفولات وعيوب الأنبوب العصبي.',
    timing: 'كبسولة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Softgel Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة 0.5 مجم يومياً (وقاية أو تعويض نقص فولات).';
    },


    warnings: [
      'الحمل: آمن وموصى به.',
      'تداخلات: أدوية الصرع قد تخفض الفولات؛ قد يلزم ضبط الجرعة.',
      'لا يغني عن الحديد إذا كان هناك نقص حديد.'
    ]
  },

  // 7. Folicap 2.5 mg 24 cap
  {
    id: 'folicap-2.5-caps',
    name: 'Folicap 2.5 mg 24 cap',
    genericName: 'Folic Acid',
    concentration: '2.5mg',
    price: 22,
    matchKeywords: [
      'high risk pregnancy', 'megaloblastic anemia', 'folicap', 'folate deficiency',
      'فوليكاب ٢.٥', 'انيميا الفولات', 'حمل خطر', 'جرعة عالية'
    ],
    usage: 'حمض فوليك 2.5 مجم علاجي لنقص الفولات/الأنيميا الضخمة أو حمل عالي الخطورة.',
    timing: 'كبسولة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Softgel Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة 2.5 مجم يومياً (علاجي)؛ حتى 5 مجم/يوم حسب التحليل.';
    },


    warnings: [
      'الحمل: يُستخدم للحوامل عالي الخطورة بجرعات أعلى من المعتاد؛ حسب التشخيص.',
      'تداخلات: مضادات الاختلاج تقل مستويات الفولات؛ قد تتطلب ضبط جرعاتها.',
      'تحقق من B12 لتجنب إخفاء الاعتلال العصبي الناتج عن نقصه.'
    ]
  },

  // 8. Hydroferrin 50 mg/ml oral drops 30 ml
  {
    id: 'hydroferrin-drops',
    name: 'Hydroferrin 50 mg/ml oral drops 30 ml',
    genericName: 'Iron (III) Hydroxide Polymaltose Complex',
    concentration: '50mg/1ml',
    price: 44,
    matchKeywords: [
      'infant anemia', 'iron drops', 'hydroferrin', 'baby iron',
      'هيدروفيرين', 'نقط حديد', 'انيميا الرضع', 'حديثي الولادة'
    ],
    usage: 'نقط حديد بوليمالتوز مركزة للرضع/الأطفال لعلاج أو وقاية نقص الحديد.',
    timing: 'جرعة يومية تُعطى مرة واحدة أو مقسمة.',
    category: Category.ANTIANEMIC,
    form: 'Oral Drops',

    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 2,
    maxWeight: 25,

    calculationRule: (weight, ageMonths) => {
      const treatDrops = Math.round((weight * 4) / 2.5);
      const prophDrops = Math.max(1, Math.round((weight * 1.5) / 2.5));
      return `علاج: نحو ${treatDrops} نقطة/يوم (4 مجم/كجم، 1 نقطة = 2.5 مجم). وقاية: ${prophDrops} نقطة/يوم (1–2 مجم/كجم).`;
    },


    warnings: [
      'الحمل: غير موجه للحوامل؛ مخصص للأطفال.',
      'تداخلات: تجنب إعطائها مع وجبة حليب كبيرة/كالسيوم لتفادي خفض الامتصاص.',
      'جرعة زائدة قد تسبب تسمم حاد؛ احفظ العبوة بعيداً عن الأطفال.',
      'براز أسود طبيعي مع الحديد.'
    ]
  },

  // 9. Hydroferrin 50 mg syrup 100 ml
  {
    id: 'hydroferrin-syrup',
    name: 'Hydroferrin 50 mg syrup 100 ml',
    genericName: 'Iron (III) Hydroxide Polymaltose Complex',
    concentration: '50mg/5ml',
    price: 32,
    matchKeywords: [
      'anemia', 'iron syrup', 'hydroferrin', 'kids',
      'هيدروفيرين شراب', 'حديد اطفال', 'انيميا', 'طعم التوفي'
    ],
    usage: 'شراب حديد بوليمالتوز بطعم مقبول لعلاج/وقاية نقص الحديد لدى الأطفال.',
    timing: 'جرعة يومية أثناء الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 5,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const minMl = (weight * 3 / 10).toFixed(1);
      const maxMl = (weight * 6 / 10).toFixed(1);
      return `علاج: ${minMl}-${maxMl} مل/يوم (3–6 مجم/كجم). وقاية: ${(+minMl / 2).toFixed(1)}-${(+maxMl / 2).toFixed(1)} مل/يوم.`;
    },


    warnings: [
      'الحمل: موجه للأطفال فقط.',
      'تداخلات: قلل تناول الكالسيوم/الألبان حول الجرعة لتجنب نقص الامتصاص.',
      'قد يسبب إمساكاً خفيفاً؛ زد السوائل والألياف.',
      'استمر 2–3 أشهر بعد تصحيح Hb لملء المخازن.'
    ]
  },

  // 10. Phara Fero 27–20 chocolate pills
  {
    id: 'phara-fero-choc',
    name: 'Phara Fero 27–20 chocolate pills',
    genericName: 'Microencapsulated Iron (Ferric Pyrophosphate) + Zinc + Vitamins',
    concentration: '18mg Iron',
    price: 160,
    matchKeywords: [
      'chocolate iron', 'kids anemia', 'phara fero', 'tasty iron', 'supplement',
      'فارا فيرو', 'شوكولاتة حديد', 'انيميا اطفال', 'فاتح شهية', 'مكمل غذائي'
    ],
    usage: 'حديد في صورة قطع شوكولاتة لذيذة، الحل الأمثل للأطفال الرافضين لتناول دواء الحديد التقليدي والحوامل.',
    timing: 'قطعة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Chocolate Pieces',

    minAgeMonths: 24, // 2 years+ (chewing ability)
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths < 144) {
        return 'قطعة واحدة يومياً للأطفال.';
      } else {
        return 'قطعة إلى قطعتين يومياً للكبار والحوامل.';
      }
    },


    warnings: [
      'رغم طعمها اللذيذ، هي دواء وليست حلوى! يجب حفظها بعيداً جداً عن متناول الأطفال لتجنب التسمم بالحديد.',
      'لا تترك طعماً معدنياً بالفم.'
    ]
  },
  // 11. Sacrofer 100 mg/5 ml 5 amp for i.v. inj.
  {
    id: 'sacrofer-100-amp',
    name: 'Sacrofer 100 mg/5 ml 5 amp for i.v. inj.',
    genericName: 'Iron Sucrose',
    concentration: '100mg/5ml',
    price: 275,
    matchKeywords: [
      'iv iron', 'dialysis', 'severe anemia', 'sacrofer', 'kidney disease',
      'ساكروفر', 'حديد وريد', 'انيميا الغسيل الكلوي', 'حديد للمحاليل'
    ],
    usage: 'حديد سكروز وريدي لعلاج أنيميا نقص الحديد عندما يفشل أو لا يُتحمل الحديد الفموي، خاصة في مرضى الفشل الكلوي (غسيل أو غير غسيل).',
    timing: '100–200 مجم IV 1–3 مرات أسبوعياً حتى استيفاء العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV ONLY)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const totalDeficit = Math.round(weight * (15 - 8) * 2.4 + 500); // مثال غنزوني لهدف Hb=15 وحديد مخزون 500mg
      return `جلسة: 100 مجم في 100 مل ملح على 15–30 دقيقة (أو 200 مجم على ≥30 دقيقة)، 1–3 مرات أسبوعياً. العجز التقديري ≈ ${totalDeficit} مجم.`;
    },


    warnings: [
      'الحمل: فئة B؛ يُفضّل تأجيله للثلث الثاني/الثالث إن أمكن، وممنوع عادة في الثلث الأول إلا لضرورة.',
      'تداخلات: افصل 4–6 ساعات عن الحديد الفموي. لا يخلط إلا مع محلول ملحي.',
      'خطر تحسس أو هبوط ضغط أثناء التسريب؛ يجب توفر طوارئ وتأمين مسار وريدي.',
      'ممنوع الحقن العضلي لتفادي التليف والتصبغ.'
    ]
  },

  // 12. Epoetin Sedico 4000 i.u./ml vial
  {
    id: 'epoetin-sedico-4000',
    name: 'Epoetin Sedico 4000 i.u./ml vial',
    genericName: 'Epoetin Alfa (Recombinant Human Erythropoietin)',
    concentration: '4000 IU',
    price: 196,
    matchKeywords: [
      'erythropoietin', 'renal failure', 'dialysis', 'sedico', 'epo',
      'ايبوتين', 'سيديكو', 'حقن كلى', 'هرمون الدم', 'انيميا الكلى'
    ],
    usage: 'إريثروبويتين ألفا لرفع الهيموجلوبين في أنيميا الفشل الكلوي المزمن أو أنيميا العلاج الكيماوي (مع تعويض الحديد).',
    timing: '3 مرات أسبوعياً (تحت الجلد أو IV).',
    category: Category.ANTIANEMIC,
    form: 'Vial (SC/IV)',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.round(weight * 50); // 50 IU/kg مبدئياً
      return `بدء: ${dose} وحدة (${(dose / 4000).toFixed(2)} فيال 4000) تحت الجلد أو IV، 3 مرات أسبوعياً. تُعدل كل 2–4 أسابيع (Hb 10–11، لا تتجاوز 12).`;
    },


    warnings: [
      'الحمل: فئة C؛ يُستخدم إذا فاقت الفائدة المخاطر وحسب التشخيص.',
      'تداخلات: قد تحتاج جرعة السيكلوسبورين للتعديل مع زيادة الهيماتوكريت؛ احرص على توفر الحديد لتفادي نقص الاستجابة.',
      'موانع: ارتفاع ضغط غير مضبوط، حساسية لـ EPO. خطر جلطات إذا تجاوز Hb 12 أو صعد سريعاً.',
      'حالات نادرة لعدم تنسج كريات الدم (PRCA)؛ أوقف الدواء عند فشل الاستجابة مع ريتيكولوسايت منخفض.'
    ]
  },

  // 13. Euronemia 100 mg/5 ml 5 amp for i.v. or inf.
  {
    id: 'euronemia-100-amp',
    name: 'Euronemia 100 mg/5 ml 5 amp for i.v. or inf.',
    genericName: 'Iron Sucrose',
    concentration: '100mg/5ml',
    price: 275,
    matchKeywords: [
      'iv iron', 'euronemia', 'sucrose', 'iron infusion',
      'يورونيميا', 'حديد وريد', 'محلول حديد', 'انيميا حادة'
    ],
    usage: 'حديد سكروز وريدي بديل للساكروفر لعلاج نقص الحديد عندما لا يُتحمل الحديد الفموي أو يلزم تصحيح سريع (مرضى كلى/حمل بعد الثلث الأول).',
    timing: '100–200 مجم IV 1–3 مرات أسبوعياً حتى استكمال العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV ONLY)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const totalDeficit = Math.round(weight * (15 - 8) * 2.4 + 500);
      return `جلسة: 100 مجم في 100 مل ملح على 15–30 دقيقة (أو 200 مجم على ≥30 دقيقة)، 1–3 مرات أسبوعياً. إجمالي ≈ ${totalDeficit} مجم أو حسب الفيريتين.`;
    },


    warnings: [
      'الحمل: فئة B؛ تجنب الثلث الأول ما أمكن.',
      'تداخلات: تجنب تزامن جرعات الحديد الفموي (يقل الامتصاص)؛ لا يُخلط إلا مع محلول ملحي.',
      'خطر تحسس/هبوط ضغط؛ يلزم تواجد تجهيزات الطوارئ.',
      'وريدي فقط، لا يُحقن عضلياً.'
    ]
  },

  // 14. Feroglobin Liquid 120 ml
  {
    id: 'ferroduonal-gyn-caps',
    name: 'Ferroduonal Gyn 30 caps',
    genericName: 'Ferrous Bisglycinate + Folic Acid + Vitamins',
    concentration: 'Combination',
    price: 39,
    matchKeywords: [
      'pregnancy iron', 'ferroduonal gyn', 'maternity', 'folic',
      'فيروديونال جين', 'حديد حوامل', 'حمل', 'فيتامينات حمل'
    ],
    usage: 'حديد بيسجليسينات + فوليك للسيدات الحوامل/المرضعات لعلاج أو وقاية نقص الحديد.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 600, // Childbearing age usually
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة يومياً طوال الحمل/الرضاعة؛ يمكن زيادتها مؤقتاً لكبسولتين عند أنيميا أشد حسب التشخيص.';
    },


    warnings: [
      'الحمل: آمن؛ التزمي بمتابعة Hb/فريتين.',
      'تداخلات: الكالسيوم/مضادات الحموضة تقلل الامتصاص؛ افصل ساعتين. افصل 4 ساعات عن ليفوثيروكسين.',
      'قد يسبب إمساكاً خفيفاً؛ أكثري السوائل والألياف.'
    ]
  },

  // 17. Ferrotron 20 caps
  {
    id: 'foliplex-lozenges',
    name: 'Foliplex 24 lozenges',
    genericName: 'Folic Acid + Vitamin B12 + B6',
    concentration: 'Combination',
    price: 80,
    matchKeywords: [
      'folic acid', 'b12', 'lozenges', 'sublingual', 'foliplex',
      'فوليبليكس', 'استحلاب', 'فوليك', 'فيتامين ب١٢', 'امتصاص سريع'
    ],
    usage: 'أقراص استحلاب فوليك + B12 + B6 لتحسين الهيموجلوبين والأعصاب مع امتصاص تحت لساني.',
    timing: 'قرص استحلاب يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Lozenges',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص استحلاب تحت اللسان يومياً؛ يمكن زيادته لمرتين يومياً في النقص الشديد (حسب التحليل).';
    },


    warnings: [
      'الحمل: آمن كجرعة فولات/B12 مساندة.',
      'تداخلات: الكلورامفينيكول قد يعاكس تأثير حمض الفوليك؛ الميثوتريكسات كمضاد فولات.',
      'تحقق من B12 في حالات فقر الدم الضخم الأرومات.'
    ]
  },

  // 19. Hydroferrin 100 mg/2 ml 3 amp
  {
    id: 'hydroferrin-100-amp',
    name: 'Hydroferrin 100 mg/2 ml 3 amp',
    genericName: 'Iron (III) Hydroxide Polymaltose Complex',
    concentration: '100mg/2ml',
    price: 33,
    matchKeywords: [
      'iron injection', 'im iron', 'hydroferrin', 'polymaltose',
      'هيدروفيرين حقن', 'حديد عضل', 'انيميا', 'حقن عضل'
    ],
    usage: 'حقن حديد بوليمالتوز للعضل فقط لعلاج نقص الحديد عند عدم تحمل الفموي.',
    timing: '100 مجم IM يوم بعد يوم أو مرتين أسبوعياً حتى تصحيح العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IM ONLY)',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'بالغون: 100 مجم IM يوم بعد يوم أو مرتين أسبوعياً حتى استكمال العجز.';
      }
      const maxDose = Math.min(5 * weight, 100);
      return `أطفال ≥ 6 أشهر: حتى ${maxDose} مجم/جرعة (5 مجم/كجم، حد 100 مجم) يوم بعد يوم أو يومياً.`;
    },


    warnings: [
      'الحمل: يُفضّل تجنبه بالثلث الأول؛ يُستخدم بحذر لاحقاً.',
      'تداخلات: لا يُجمع مع جرعات حديد فموي بنفس اليوم لتجنب زيادة الحديد.',
      'خطر تصبغ جلدي دائم إذا حُقن بسطحية؛ ألم موضعي وارد.'
    ]
  },

  // 20. Irospect 20 pieces
  {
    id: 'methyl-folate-orchidia',
    name: 'Methyl Folate (Orchidia) 30 caps',
    genericName: 'L-Methylfolate (5-MTHF)',
    concentration: 'Combination (usually 400-1000mcg)',
    price: 120,
    matchKeywords: [
      'active folate', 'mthfr', 'pregnancy', 'orchidia', 'methylfolate',
      'ميثيل فولات', 'فولات نشط', 'طفرة جينية', 'اوركيديا', 'تثبيت حمل'
    ],
    usage: 'فولات نشط (5-MTHF) للحوامل أو مرضى طفرات MTHFR الذين لا يستفيدون من الفوليك العادي.',
    timing: 'كبسولة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'الحمل: آمن ويفضَّل في حالات خطر عيوب الأنبوب العصبي أو طفرات MTHFR.',
      'تداخلات: أدوية الصرع قد تقلل مستويات الفولات؛ قد تحتاج ضبط الجرعة.',
      'لا يغني عن الحديد إذا كان هناك نقص حديد.'
    ]
  },
  // 22. Phara Fero 27 Plus - 20 chocolate pills
  {
    id: 'vitonex-30-caps',
    name: 'Vitonex 30 caps.',
    genericName: 'Lactoferrin + Zinc + Vit C + Vit D',
    concentration: 'Combination',
    price: 75,
    matchKeywords: [
      'lactoferrin', 'immunity', 'vitonex', 'zinc',
      'فيتونكس ٣٠', 'لاكتوفيرين', 'زنك', 'مناعة', 'كوفيد'
    ],
    usage: 'كبسولات لاكتوفيرين + زنك + فيتامين د/سي لرفع المناعة (دعم ثانوي للدم).',
    timing: 'كبسولة يومياً بعد الإفطار.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً بعد الإفطار.';
    },


    warnings: [
      'الحمل: غالباً آمن كمكمل؛ أعدي التقييم عند اللزوم.',
      'تداخلات: الزنك يقل امتصاصه مع الكالسيوم/الحديد بجرعات كبيرة؛ افصل ساعتين.',
      'ليس علاجاً وحيداً للأنيميا الشديدة.'
    ]
  },

  // 28. Methyl Folate (ora) 30 caps.
  {
    id: 'methyl-folate-ora-30',
    name: 'Methyl Folate (ora) 30 caps.',
    genericName: 'L-Methylfolate',
    concentration: 'Combination',
    price: 110,
    matchKeywords: [
      'active folate', 'mthfr', 'pregnancy', 'ora',
      'ميثيل فولات', 'ورا', 'اوركيديا', 'حمل', 'تثبيت'
    ],
    usage: 'فولات نشط للحوامل أو مرضى طفرات MTHFR بامتصاص عال.',
    timing: 'كبسولة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً طوال الشهور الأولى للحمل أو حسب الخطة العلاجية.';
    },


    warnings: [
      'الحمل: آمن ويفضَّل عند تاريخ عيوب أنبوب عصبي.',
      'تداخلات: مضادات الاختلاج قد تقلل مستويات الفولات.',
      'لا يعالج نقص الحديد؛ يُستخدم مع الحديد عند الحاجة.'
    ]
  },

  // 29. Vitonex 20 caps.
  {
    id: 'vitonex-20-caps',
    name: 'Vitonex 20 caps.',
    genericName: 'Iron + Folic Acid + Vit C + B12',
    concentration: 'Combination',
    price: 100,
    matchKeywords: [
      'iron', 'anemia', 'vitonex', 'hemoglobin',
      'فيتونكس ٢٠', 'حديد', 'انيميا', 'تركيز عالي'
    ],
    usage: 'مكمل حديد/فولات بتركيز أعلى لعلاج أنيميا نقص الحديد.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'الحمل: آمن عادة؛ الجرعة حسب التشخيص.',
      'تداخلات: ليفوثيروكسين/الفلوروكينولون افصل 4 ساعات؛ الكالسيوم/مضادات الحموضة تقلل الامتصاص.',
      'ليس بديلاً للنقل الدموي في الأنيميا الشديدة.'
    ]
  },

  // 30. Joy Extra 30 tabs.
  {
    id: 'joy-extra-30-tabs',
    name: 'Joy Extra 30 tabs.',
    genericName: 'Iron + Zinc + Vit C + B Complex + Folic',
    concentration: 'Combination',
    price: 135,
    matchKeywords: [
      'iron', 'hair loss', 'joy extra', 'skin', 'anemia',
      'جوي اكسترا', 'حديد', 'تساقط شعر', 'بشرة', 'انيميا'
    ],
    usage: 'حديد + زنك + فيتامينات للشعر والدم لعلاج أنيميا خفيفة مع تساقط الشعر.',
    timing: 'قرص بعد وجبة رئيسية يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد وجبة رئيسية.';
    },


    warnings: [
      'الحمل: يُستخدم عند الضرورة؛ أقل جرعة وأقصر مدة.',
      'تداخلات: افصل ساعتين عن الشاي/القهوة والكالسيوم؛ 4 ساعات عن ليفوثيروكسين.',
      'قد يسبب إمساكاً خفيفاً أو برازاً داكناً.'
    ]
  },

  // 31. Ronja capsule 30 cap.
  {
    id: 'methyl-folate-20-tabs',
    name: 'Methyl Folate 20 tabs',
    genericName: 'L-Methylfolate',
    concentration: 'Combination (usually 400-1000mcg)',
    price: 79,
    matchKeywords: [
      'active folate', 'mthfr', 'pregnancy', 'neural tube',
      'ميثيل فولات', 'فولات نشط', 'حمل', 'تشوهات'
    ],
    usage: 'فولات نشط (L-Methylfolate) بعبوة 20 قرص للحوامل وطفرات MTHFR.',
    timing: 'قرص يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً خلال الشهور الأولى من الحمل أو حسب توجيهات الطبيب.';
    },


    warnings: [
      'الحمل: آمن ويفضَّل في مخاطر عيوب الأنبوب العصبي.',
      'تداخلات: أدوية الصرع قد تستلزم ضبط الجرعة.',
      'لا يغني عن الحديد عند نقصه.'
    ]
  },

  // 34. Heamsmart 120 ml syrup
  {
    id: 'lokaglobin-drops',
    name: 'Lokaglobin 30 ml drops',
    genericName: 'Iron + Vit C + B12 + Folic',
    concentration: 'Drops Formulation',
    price: 60,
    matchKeywords: [
      'infant drops', 'anemia', 'lokaglobin', 'iron drops',
      'لوكاغلوبين', 'نقط حديد', 'انيميا الرضع', 'فيتامينات'
    ],
    usage: 'نقط حديد متكاملة للرضع، مدعمة بفيتامين C (للامتصاص) وB12 وفوليك (لكمية ونوعية الدم).',
    timing: 'مرة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Oral Drops',

    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 2,
    maxWeight: 25,

    calculationRule: (weight, ageMonths) => {
      const treatDrops = Math.round(weight * 3); // تقدير 3 نقط/كجم كعلاج خفيف
      const prophDrops = Math.max(4, Math.round(weight * 1.5));
      return `علاج: ${treatDrops} نقطة يومياً (حوالي 3 نقط/كجم). وقاية: ${prophDrops} نقطة يومياً.`;
    },


    warnings: [
      'الحمل: غير مخصص؛ للرضع والأطفال.',
      'تداخلات: تقليل إعطائها مع الحليب/الكالسيوم الكبير لتجنب خفض الامتصاص.',
      'قد يسبب برازاً داكناً أو مغصاً خفيفاً.',
      'اتبع تركيز العبوة بدقة لتجنب الجرعة الزائدة.'
    ]
  },

  // 36. Enrich oral drops 30 ml
  {
    id: 'enrich-drops',
    name: 'Enrich oral drops 30 ml',
    genericName: 'Iron Supplement',
    concentration: 'Drops',
    price: 40,
    matchKeywords: [
      'iron drops', 'enrich', 'baby anemia', 'prophylaxis',
      'انريتش', 'نقط حديد', 'وقاية', 'انيميا'
    ],
    usage: 'نقط حديد أساسية لوقاية وعلاج الرضع من الأنيميا. خيار اقتصادي وفعال.',
    timing: 'مرة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Oral Drops',

    minAgeMonths: 4, // Iron usually starts at 4-6 months for breastfed babies
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,

    calculationRule: (weight, ageMonths) => {
      return 'وقائياً من 4 شهور: 1 مجم/كجم/يوم (حسب تركيز القطارة). علاجياً: 3–6 مجم/كجم/يوم تقسم جرعة أو جرعتين؛ تُحدد حسب البروتوكول وفق تركيز المنتج.';
    },


    warnings: [
      'التزم بالجرعة لتجنب سمية الحديد.',
      'قلل الحليب/الكالسيوم وقت الجرعة لتحسين الامتصاص.',
      'احفظ بعيداً عن متناول الأطفال.'
    ]
  },
  // 37. Folic Acid (El Nile) 5 mg 30 tab.
  {
    id: 'folic-acid-elnile-5mg',
    name: 'Folic Acid (El Nile) 5 mg 30 tab.',
    genericName: 'Folic Acid',
    concentration: '5mg',
    price: 36,
    matchKeywords: [
      'folic acid', 'pregnancy', 'megaloblastic anemia', 'el nile', 'high dose',
      'فوليك اسيد', 'النيل', 'جرعة عالية', 'انيميا', 'تشوهات'
    ],
    usage: 'حبوب حمض الفوليك بتركيز علاجي عالي (5 مجم). تُستخدم لعلاج الأنيميا الضخمة الأرومات وللحوامل عالية الخطورة لتشوهات الأجنة.',
    timing: 'قرص واحد يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص 5 مجم يومياً كجرعة علاجية؛ قد تزيد مؤقتاً حسب التشخيص في حمل عالي الخطورة.';
    },


    warnings: [
      'الحمل: جرعة عالية تستخدم فقط في حمل عالي الخطورة وحسب التشخيص.',
      'تداخلات: مضادات الاختلاج قد تتطلب ضبط جرعاتها؛ الميثوتريكسات مضاد فولات.',
      'خطر إخفاء نقص B12؛ تحقق دورياً.'
    ]
  },

  // 38. Lipoferric Folic 30 caps.
  {
    id: 'lipoferric-folic-30-caps',
    name: 'Lipoferric Folic 30 caps.',
    genericName: 'Liposomal Iron + Folic Acid + Vitamins',
    concentration: 'Liposomal Tech',
    price: 145,
    matchKeywords: [
      'liposomal iron', 'gentle iron', 'pregnancy', 'lipoferric', 'anemia',
      'ليبو فيريك', 'حديد ليبوزومي', 'فوليك', 'بدون امساك', 'انيميا'
    ],
    usage: 'حديد ليبوزومي + فوليك في كبسولة يومية عالية الامتصاص ولطيفة على المعدة.',
    timing: 'كبسولة يومياً مع أو بدون طعام.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً، يمكن تناولها في أي وقت.';
    },


    warnings: [
      'الحمل: آمن عادة.',
      'تداخلات أقل مع الطعام، لكن يفضل الفصل عن الكالسيوم الكبير.',
      'التزم بجرعة واحدة يومياً ما لم يقرر الطبيب غير ذلك.'
    ]
  },

  // 39. Intrafer B 30 tablets
  {
    id: 'intrafer-b-30-tabs',
    name: 'Intrafer B 30 tablets',
    genericName: 'Iron + Folic Acid + Vit B12 + Vit C',
    concentration: 'Combination',
    price: 135,
    matchKeywords: [
      'iron', 'b complex', 'intrafer', 'anemia', 'nerves',
      'انترافر بي', 'حديد', 'فيتامين ب', 'التهاب اعصاب', 'انيميا'
    ],
    usage: 'تركيبة مزدوجة لعلاج الأنيميا والتهاب الأعصاب معاً؛ تحتوي على الحديد وفيتامينات ب المركبة (B12). مفيد جداً لمرضى السكر الذين يعانون من الأنيميا.',
    timing: 'قرص واحد يومياً بعد الغداء.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد وجبة رئيسية.';
    },


    warnings: [
      'افصل عن الشاي/القهوة/الألبان ساعتين، وعن ليفوثيروكسين/فلوروكينولونات 4 ساعات.',
      'بول أصفر داكن (B فيتامين) وبراز أسود (حديد) ظاهرة غير خطرة.'
    ]
  },

  // 40. Intrafer 30 tablets
  {
    id: 'intrafer-30-tabs',
    name: 'Intrafer 30 tablets',
    genericName: 'Iron + Folic Acid',
    concentration: 'Combination',
    price: 45,
    matchKeywords: [
      'iron', 'intrafer', 'economy', 'anemia', 'pregnancy',
      'انترافر', 'حديد اقتصادي', 'انيميا', 'حمل'
    ],
    usage: 'حديد + فوليك اقتصادي لعلاج أنيميا نقص الحديد.',
    timing: 'قرص واحد بعد الأكل يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد الأكل.';
    },


    warnings: [
      'يفصل ساعتين عن الشاي/القهوة واللبن؛ 4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً؛ زد السوائل والألياف.',
      'احفظه جافاً وبعيداً عن الأطفال.'
    ]
  },

  // 41. Ampofer 20mg/ml 5 amp. for i.v. inj./inf.
  {
    id: 'ampofer-iv-amp',
    name: 'Ampofer 20mg/ml 5 amp. for i.v. inj./inf.',
    genericName: 'Iron Sucrose',
    concentration: '100mg/5ml (20mg/ml)',
    price: 275,
    matchKeywords: [
      'iv iron', 'iron sucrose', 'dialysis', 'ampofer', 'severe anemia',
      'امبوفر', 'حديد وريد', 'انيميا حادة', 'محاليل'
    ],
    usage: 'حديد سكروز وريدي لعلاج نقص الحديد غير المستجيب للفموي أو لمرضى الكلى.',
    timing: '100–200 مجم IV 1–3 مرات أسبوعياً حتى استيفاء العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV ONLY)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const totalDeficit = Math.round(weight * (15 - 8) * 2.4 + 500);
      return `جلسة: 100 مجم (في 100 مل ملح على 15–30 دقيقة) أو 200 مجم على ≥30 دقيقة، 1–3 مرات أسبوعياً حتى بلوغ عجز يقارب ${totalDeficit} مجم.`;
    },


    warnings: [
      'الحمل: فئة B؛ تجنب الثلث الأول إن أمكن.',
      'تداخلات: افصل عن الحديد الفموي 4–6 ساعات؛ لا يخلط مع محاليل أخرى.',
      'خطر تحسس/هبوط ضغط؛ أوقف التسريب عند أي أعراض.',
      'لا عضلي.'
    ]
  },

  // 42. Xahaem 20 caps.
  {
    id: 'xahaem-20-caps',
    name: 'Xahaem 20 caps.',
    genericName: 'Iron Bisglycinate + Folic + Vit C + B12',
    concentration: 'Combination',
    price: 98,
    matchKeywords: [
      'chelated iron', 'xahaem', 'gentle iron', 'anemia',
      'زاهيم', 'حديد مخلبي', 'بيسجليسينات', 'خفيف ع المعدة'
    ],
    usage: 'حديد بيسجليسينات + فوليك/B12 عالي الامتصاص ولطيف على المعدة.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'افصل ساعتين عن الكالسيوم/الشاي، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً خفيفاً.'
    ]
  },

  // 43. Enrich syrup 100 ml
  {
    id: 'enrich-syrup-100',
    name: 'Enrich syrup 100 ml',
    genericName: 'Iron Polymaltose Complex',
    concentration: 'Syrup Formulation',
    price: 34,
    matchKeywords: [
      'iron syrup', 'enrich', 'kids anemia', 'tasty',
      'انريتش شراب', 'حديد اطفال', 'انيميا', 'طعم مقبول'
    ],
    usage: 'شراب حديد للأطفال لعلاج الأنيميا، بتركيبة لا تسبب تصبغ الأسنان مثل الحديد القديم.',
    timing: 'مرة أو مرتين يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 5,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const minMl = (weight * 3 / 10).toFixed(1);
      const maxMl = (weight * 6 / 10).toFixed(1);
      return `علاج: ${minMl}-${maxMl} مل/يوم (3–6 مجم/كجم)؛ وقاية: نصف الجرعة.`;
    },


    warnings: [
      'استمر شهرين بعد تصحيح Hb لملء المخزون.',
      'براز داكن طبيعي مع الحديد.'
    ]
  },

  // 44. Epiao 10000i.u./ml vial
  {
    id: 'epiao-10000-vial',
    name: 'Epiao 10000i.u./ml vial',
    genericName: 'Recombinant Human Erythropoietin (EPO)',
    concentration: '10000 IU',
    price: 210,
    matchKeywords: [
      'epo', 'kidney failure', 'dialysis', 'epiao', 'anemia',
      'ايبيو ١٠٠٠٠', 'ايبوتين', 'حقن كلى', 'انيميا الفشل الكلوي', 'غسيل كلوي'
    ],
    usage: 'إريثروبويتين مؤتلف (تركيز 10000) لرفع Hb في أنيميا الفشل الكلوي/الكيماوي مع تعويض الحديد.',
    timing: '3 مرات أسبوعياً أو جرعة أسبوعية مكافئة حسب Hb.',
    category: Category.ANTIANEMIC,
    form: 'Injection (SC/IV)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.round(weight * 50); // 50 IU/kg TIW
      return `جرعة البدء الشائعة: ${dose} وحدة دولية تحت الجلد أو IV ثلاث مرات أسبوعياً (50 وحدة/كجم)، تُعدل كل 2–4 أسابيع للحفاظ على Hb 10-11 وعدم تجاوز 12.`;
    },


    warnings: [
      'الحمل: فئة C؛ يستخدم إذا فاقت الفائدة المخاطر.',
      'تداخلات: قد تتغير جرعة السيكلوسبورين مع ارتفاع الهيماتوكريت؛ تأكد من توفر الحديد.',
      'موانع: ضغط غير مضبوط، حساسية سابقة لـ EPO. خطر جلطات إذا Hb >12 أو صعد سريعاً.',
      'لا ترج القارورة بقوة.'
    ]
  },

  // 45. Epiao 4000i.u./ml vial
  {
    id: 'epiao-4000-vial',
    name: 'Epiao 4000i.u./ml vial',
    genericName: 'Recombinant Human Erythropoietin (EPO)',
    concentration: '4000 IU',
    price: 155,
    matchKeywords: [
      'epo', 'kidney failure', 'dialysis', 'epiao',
      'ايبيو ٤٠٠٠', 'ايبوتين', 'حقن كلى', 'انيميا'
    ],
    usage: 'هرمون محفز لإنتاج كرات الدم الحمراء (تركيز متوسط). يستخدم بانتظام لمرضى الغسيل الكلوي.',
    timing: '3 مرات أسبوعياً (SC أو IV) حسب Hb.',
    category: Category.ANTIANEMIC,
    form: 'Injection (SC/IV)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.round(weight * 50);
      return `جرعة البدء: ${dose} وحدة دولية (50 وحدة/كجم) SC أو IV ثلاث مرات أسبوعياً؛ تُعدل للحفاظ على Hb 10-11.`;
    },


    warnings: [
      'الحمل: فئة C؛ حسب التشخيص.',
      'خطر جلطات عند Hb مرتفع؛ أوقف/خفض الجرعة إذا Hb يقترب من 12.',
      'صداع مفاجئ قد يشير لارتفاع ضغط؛ أوقف وأعد التقييم.',
      'لا ترج بقوة.'
    ]
  },

  // 46. Feramix Fe 20 tab
  {
    id: 'feramix-fe-20-tab',
    name: 'Feramix Fe 20 tab',
    genericName: 'Ferrous Fumarate + Folic + Vit C + Zinc + Copper',
    concentration: 'Combination',
    price: 110,
    matchKeywords: [
      'iron', 'zinc', 'copper', 'feramix', 'hair',
      'فيراميكس', 'حديد', 'زنك', 'نحاس', 'تساقط شعر'
    ],
    usage: 'حديد + زنك + نحاس + فوليك لعلاج أنيميا نقص الحديد ودعم الشعر.',
    timing: 'قرص بعد وجبة رئيسية يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد الوجبة الرئيسية.';
    },


    warnings: [
      'الحمل: آمن عموماً؛ أعدي التقييم عند اللزوم.',
      'تداخلات: افصل ساعتين عن الشاي/القهوة/الكالسيوم، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً خفيفاً.'
    ]
  },
  // 47. Golden Fer 100 mg 30 chew. tablets
  {
    id: 'golden-fer-100-chew',
    name: 'Golden Fer 100 mg 30 chew. tablets',
    genericName: 'Iron (Chewable Complex)',
    concentration: '100mg',
    price: 40.5,
    matchKeywords: [
      'chewable iron', 'golden fer', 'elderly', 'anemia', 'tasty',
      'جولدن فير', 'حديد مضغ', 'انيميا', 'كبار السن', 'صعوبة البلع'
    ],
    usage: 'حديد 100 مجم قابل للمضغ لمن يعاني صعوبة بلع الأقراص.',
    timing: 'قرص مضغ يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Chewable Tablet',

    minAgeMonths: 72, // 6 years+ (able to chew well)
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً، يمضغ جيداً.';
    },


    warnings: [
      'خطر تسمم الحديد مع الإفراط؛ احفظ بعيداً عن الأطفال.',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم.',
      'قد يسبب صبغ أسنان مؤقتاً إذا لم يتم المضمضة.'
    ]
  },

  // 48. Golden Fer-F 30 chew. tabs.
  {
    id: 'golden-fer-f-chew',
    name: 'Golden Fer-F 30 chew. tabs.',
    genericName: 'Iron + Folic Acid',
    concentration: '100mg Iron + Folic',
    price: 40.5,
    matchKeywords: [
      'chewable iron', 'folic acid', 'pregnancy', 'golden fer f',
      'جولدن فير اف', 'حديد وفوليك', 'حمل', 'مضغ'
    ],
    usage: 'حديد 100 مجم + فوليك في قرص مضغ لمرضى صعوبة البلع/الحوامل.',
    timing: 'قرص مضغ يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Chewable Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً.';
    },


    warnings: [
      'خطر تسمم الحديد عند الإفراط؛ احفظ بعيداً عن الأطفال.',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم.',
      'تمضمض بعد المضغ لتقليل تلون الأسنان المؤقت.'
    ]
  },

  // 49. Irolamin 30 caps.
  {
    id: 'irolamin-30-caps',
    name: 'Irolamin 30 caps.',
    genericName: 'Polysaccharide Iron Complex + Folic + B12',
    concentration: 'Combination',
    price: 138,
    matchKeywords: [
      'polysaccharide iron', 'gentle iron', 'irolamin', 'anemia',
      'ايرولامين', 'حديد سكري', 'خفيف ع المعدة', 'انيميا'
    ],
    usage: 'حديد بولي-سكاريد + فوليك/B12 لطيف على المعدة وامتصاصه عالٍ.',
    timing: 'كبسولة يومياً مع أو بدون طعام.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً، يمكن أخذها حتى مع مشاكل المعدة.';
    },


    warnings: [
      'افصل 4 ساعات عن ليفوثيروكسين/فلوروكينولونات؛ ساعتين عن الكالسيوم.',
      'تجنب الجرعة الزائدة (خطر سمية الحديد).' 
    ]
  },

  // 50. Ironoglor-max 30 tabs
  {
    id: 'ironoglor-max-30-tabs',
    name: 'Ironoglor-max 30 tabs',
    genericName: 'Ferrous Bisglycinate Chelate + Folic + B12',
    concentration: 'Combination',
    price: 195,
    matchKeywords: [
      'chelated iron', 'ironoglor', 'max absorption', 'anemia',
      'ايرونوجلور ماكس', 'حديد مخلبي', 'بيسجليسينات', 'امتصاص عالي'
    ],
    usage: 'حديد بيسجليسينات عالي الامتصاص مع فوليك/B12 لرفع Hb سريعاً.',
    timing: 'قرص يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً.';
    },


    warnings: [
      'الحمل: آمن عموماً؛ أعدي التقييم عند اللزوم.',
      'تداخلات: افصل ساعتين عن الكالسيوم/الشاي، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'سعر مرتفع مقابل امتصاص عالٍ؛ التزم بجرعة واحدة يومياً.'
    ]
  },

  // 51. Irontec 20 chew. pieces
  {
    id: 'irontec-20-chew',
    name: 'Irontec 20 chew. pieces',
    genericName: 'Iron + Zinc + Folic Acid',
    concentration: 'Combination',
    price: 85,
    matchKeywords: [
      'chewable iron', 'irontec', 'chocolate', 'kids anemia',
      'ايرونتيك', 'قطع مضغ', 'انيميا اطفال', 'طعم حلو'
    ],
    usage: 'قطع مضغ بطعم شوكولاتة/توفي تحتوي على الحديد والزنك لعلاج أنيميا الأطفال الرافضين للأدوية.',
    timing: 'قطعة واحدة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Edible Piece',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قطعة واحدة يومياً بعد وجبة. لا تتجاوز قطعة/اليوم دون إعادة تقييم.';
    },


    warnings: [
      'خطر تسمم الحديد عند تناول عدة قطع؛ احفظ في مكان مؤمن.',
      'تحتوي سكريات؛ راعِ مرضى السكري/السعرات.',
      'يفصل ساعتين عن الكالسيوم/الحليب الكبير لتحسين الامتصاص.'
    ]
  },

  // 52. Itoferrose 100mg/5ml 5 amp. for iv inj. or inf.
  {
    id: 'itoferrose-100-amp',
    name: 'Itoferrose 100mg/5ml 5 amp. for iv inj. or inf.',
    genericName: 'Iron Sucrose',
    concentration: '100mg/5ml',
    price: 255,
    matchKeywords: [
      'iv iron', 'iron sucrose', 'infusion', 'itoferrose', 'severe anemia',
      'ايتوفيروز', 'حديد وريد', 'محاليل', 'انيميا حادة', 'نقل حديد'
    ],
    usage: 'حديد سكروز للحقن الوريدي لعلاج نقص الحديد غير المستجيب للفموي أو لمرضى الكلى/النزف المزمن.',
    timing: '100–200 مجم IV 1–3 مرات أسبوعياً حتى استكمال العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV ONLY)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const totalDeficit = Math.round(weight * (15 - 8) * 2.4 + 500);
      return `جرعة الجلسة: 100 مجم في 100 مل ملح على 15–30 دقيقة (أو 200 مجم على ≥30 دقيقة)، 1–3 مرات أسبوعياً حتى بلوغ عجز يقارب ${totalDeficit} مجم.`;
    },


    warnings: [
      'الحمل: فئة B؛ تجنب الثلث الأول إن أمكن.',
      'تداخلات: افصل عن الحديد الفموي 4–6 ساعات؛ لا يخلط مع محاليل أخرى.',
      'خطر تحسس/هبوط ضغط؛ يلزم تجهيز طوارئ وإيقاف التسريب فور أي أعراض.',
      'ممنوع الحقن العضلي.'
    ]
  },

  // 53. Irospect syrup 120 ml
  {
    id: 'irospect-syrup-120',
    name: 'Irospect syrup 120 ml',
    genericName: 'Iron + Zinc + Vit D3 + Copper + Vit A',
    concentration: 'Combination',
    price: 75,
    matchKeywords: [
      'iron syrup', 'multivitamin', 'irospect', 'kids growth',
      'ايروسبكت شراب', 'حديد اطفال', 'فيتامين د', 'نحاس', 'نمو'
    ],
    usage: 'شراب حديد مع زنك ونحاس وفيتامينات A/D/C لدعم أنيميا ونمو الأطفال.',
    timing: '5 مل يومياً للوقاية؛ 5 مل مرتين يومياً للعلاج بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 5,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const treat = (weight * 5 / 10).toFixed(1);
      return `علاجياً: نحو ${treat} مل/يوم (3–6 مجم/كجم حديد مكافئ) مقسمة جرعتين؛ وقائياً: 5 مل/يوم.`;
    },


    warnings: [
      'يحتوي فيتامين د: تجنب الجمع مع فيدروب/ديفارول؛ إما واحد أو راجع الجرعة الكلية لد.',
      'سكريات بالشراب؛ راعِ الأسنان والسكري.',
      'افصل ساعتين عن الكالسيوم/الشاي لتحسين امتصاص الحديد.'
    ]
  },

  // 54. Pravotin Plus 30 caps
  {
    id: 'pravotin-plus-30-caps',
    name: 'Pravotin Plus 30 caps',
    genericName: 'Lactoferrin (High Dose) + Vitamins',
    concentration: 'Combination',
    price: 390,
    matchKeywords: [
      'lactoferrin', 'immunity', 'anemia', 'pravotin plus',
      'برافوتين بلس', 'لاكتوفيرين', 'مناعة', 'انيميا', 'كورونا'
    ],
    usage: 'لاكتوفيرين بجرعة معززة (Plus) لدعم المناعة وتحسين امتصاص الحديد في الأنيميا.',
    timing: 'كبسولة على معدة فارغة يومياً.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة صباحاً قبل الأكل؛ يمكن زيادتها إلى كبسولتين للحالات الحادة حسب التشخيص.';
    },


    warnings: [
      'مشتق من بروتين الحليب؛ تجنب في حساسية الحليب.',
      'الحمل/الرضاعة: آمن عادة كمكمل مناعي؛ أعدي التقييم عند اللزوم.',
      'ليس بديلاً عن الحديد العلاجي في الأنيميا الشديدة بدون دعم حديدي.'
    ]
  },

  // 55. Sansovit with iron syrup 120gm
  {
    id: 'ferrodep-30-caps',
    name: 'Ferrodep 30 caps.',
    genericName: 'SunActive Iron (Micronized) + Vit C',
    concentration: 'Combination',
    price: 295,
    matchKeywords: [
      'sunactive iron', 'ferrodep', 'micronized', 'no taste', 'anemia',
      'فيروديب', 'حديد ميكروني', 'بدون طعم', 'امتصاص عالي'
    ],
    usage: 'حديد SunActive ميكروني مغلف عالي الامتصاص ولطيف على المعدة لعلاج نقص الحديد.',
    timing: 'كبسولة بعد الأكل يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'الحمل: آمن عادة؛ راقبي Hb/فريتين.',
      'تداخلات: افصل 4 ساعات عن ليفوثيروكسين/فلوروكينولونات؛ ساعتين عن الشاي/القهوة.',
      'سعر مرتفع مقابل تحمل معدي أفضل.'
    ]
  },
  // 57. Ferrodep syrup 150 ml
  {
    id: 'ferrodep-syrup-150',
    name: 'Ferrodep syrup 150 ml',
    genericName: 'SunActive Iron (Micronized) + Vit C + Zinc',
    concentration: 'SunActive Technology',
    price: 250,
    matchKeywords: [
      'sunactive iron', 'ferrodep', 'kids anemia', 'no metal taste',
      'فيروديب شراب', 'حديد ميكروني', 'انيميا اطفال', 'بدون طعم'
    ],
    usage: 'شراب حديد SunActive ميكروني للأطفال بامتصاص عالٍ وطعم لطيف.',
    timing: '2.5–5 مل يومياً لعمر < سنتين؛ 5–10 مل يومياً للأكبر، يفضل بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 6,
    maxAgeMonths: 144, // Great for kids
    minWeight: 5,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const minMl = (weight * 3 / 10).toFixed(1);
      const maxMl = (weight * 6 / 10).toFixed(1);
      return `علاجياً: ${minMl}-${maxMl} مل/يوم (3–6 مجم/كجم) يمكن تقسيمها؛ وقائياً: 2.5–5 مل.`;
    },


    warnings: [
      'الحمل: غير مخصص؛ للأطفال فقط.',
      'تداخلات قليلة مع الطعام، لكن يُفضَّل الفصل عن الكالسيوم الكبير.',
      'سعر مرتفع؛ احسب الاحتياج قبل الشراء.'
    ]
  },

  // 58. Kidzona fer 120 ml syrup
  {
    id: 'lipoferric-folic-sachets',
    name: 'Lipoferric folic 30 sachets',
    genericName: 'Liposomal Iron + Folic Acid',
    concentration: 'Liposomal Tech',
    price: 175,
    matchKeywords: [
      'liposomal iron', 'sachets', 'lipoferric', 'pregnancy',
      'ليبو فيريك فوار', 'حديد ليبوزومي', 'اكياس', 'حمل'
    ],
    usage: 'أكياس حديد ليبوزومي مع فوليك لامتصاص عالٍ ولطيف على المعدة (مناسب للحمل).',
    timing: 'كيس يومياً بعد الأكل أو على معدة فارغة حسب التحمل.',
    category: Category.ANTIANEMIC,
    form: 'Sachets (Direct to mouth)',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً يوضع على اللسان أو يذاب في ماء قليل. جرعات أعلى فقط حسب التشخيص.';
    },


    warnings: [
      'الحمل: آمن عادة؛ راقبي Hb/فريتين.',
      'تداخلات مع الكالسيوم أقل، لكن يفضل فصل ساعتين عن مكملات الكالسيوم الكبيرة.',
      'التزم بكيس يومياً لتجنب زيادة الحديد.'
    ]
  },

  // 60. Acti-folic 30 tabs.
  {
    id: 'acti-folic-30-tabs',
    name: 'Acti-folic 30 tabs.',
    genericName: 'L-Methylfolate',
    concentration: 'Combination',
    price: 55,
    matchKeywords: [
      'active folate', 'mthfr', 'acti folic', 'pregnancy',
      'اكتي فوليك', 'ميثيل فولات', 'فولات نشط', 'سعر ممتاز'
    ],
    usage: 'فولات نشط (L-Methylfolate) بسعر منافس. البديل الأرخص والأكثر فاعلية للفوليك العادي للحوامل.',
    timing: 'قرص واحد يومياً (جرعة فولات نشطة).',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص يومياً؛ يبدأ قبل الحمل وأول 12 أسبوع؛ يمكن الاستمرار لاحقاً حسب التحليل والخطورة.';
    },


    warnings: [
      'الحمل: آمن ومفضل في مخاطر عيوب الأنبوب العصبي أو طفرات MTHFR.',
      'قد يخفي نقص B12 إذا استُخدم منفرداً؛ فحص B12 عند الشك.',
      'تداخلات: مضادات الاختلاج قد تتطلب ضبط جرعاتها.'
    ]
  },

  // 61. Infarais oral drops
  {
    id: 'infarais-drops',
    name: 'Infarais oral drops',
    genericName: 'Iron + Vit D + Vit A + Vit C',
    concentration: 'Combination',
    price: 65,
    matchKeywords: [
      'infant drops', 'vit d', 'iron', 'infarais', 'rickets',
      'انفاريس', 'نقط حديد', 'فيتامين د', 'كساح', 'انيميا'
    ],
    usage: 'نقط فموية للرضع تجمع الحديد مع فيتامينات A/D/C لدعم الدم والعظام والمناعة.',
    timing: '1 مل يومياً (ماصة كاملة) بعد الرضعة/الوجبة.',
    category: Category.ANTIANEMIC,
    form: 'Oral Drops',

    minAgeMonths: 6,
    maxAgeMonths: 24,
    minWeight: 5,
    maxWeight: 15,

    calculationRule: (weight, ageMonths) => {
      return '1 مل يومياً (حوالي 3–6 مجم/كجم حديد مكافئ). لا تتجاوز الجرعة المقررة.';
    },


    warnings: [
      'يحتوي فيتامين د: أوقف مكملات فيتامين د الأخرى أثناء الاستخدام لتجنب السمية.',
      'الزم الجرعة بدقة؛ احفظ القطارة بعيداً عن الأطفال.',
      'قلل إعطاء الحليب/الكالسيوم حول الجرعة لتحسين امتصاص الحديد.'
    ]
  },

  // 62. Irovast 30 f.c. tabs.
  {
    id: 'irovast-30-tabs',
    name: 'Irovast 30 f.c. tabs.',
    genericName: 'Ferrous Bisglycinate + Vit C',
    concentration: 'Combination',
    price: 145,
    matchKeywords: [
      'chelated iron', 'irovast', 'gentle iron', 'anemia',
      'ايروفاست', 'حديد مخلبي', 'بيسجليسينات', 'امتصاص عالي'
    ],
    usage: 'حديد مخلبي (محمل على أحماض أمينية) لضمان مرور سريع من المعدة وامتصاص عالي في الأمعاء.',
    timing: 'قرص واحد يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Film Coated Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص يومياً بعد وجبة رئيسية؛ يمكن زيادته مؤقتاً لكبسولتين للحالات الأشد حسب التشخيص.';
    },


    warnings: [
      'الحمل: آمن غالباً؛ راقبي Hb/فريتين.',
      'تداخلات: افصل ساعتين عن الكالسيوم/الشاي، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً خفيفاً.'
    ]
  },

  // 63. Neutra feritin 30 caps.
  {
    id: 'neutra-feritin-30-caps',
    name: 'Neutra feritin 30 caps.',
    genericName: 'Iron + Vit B6 + B12 + Folic Acid',
    concentration: 'Combination',
    price: 135,
    matchKeywords: [
      'iron', 'neutra feritin', 'b12', 'nerve health', 'anemia',
      'نيوترا فيريتين', 'حديد', 'فيتامين ب١٢', 'اعصاب', 'انيميا'
    ],
    usage: 'مكمل غذائي يستهدف بناء كريات الدم الحمراء (حديد + فوليك) وصحة الأعصاب (B12 + B6).',
    timing: 'كبسولة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة بعد الأكل يومياً؛ يمكن زيادتها إلى كبسولتين مؤقتاً للحالات الأشد.';
    },


    warnings: [
      'قد يسبب بولاً أصفر فاقع بسبب فيتامينات ب.',
      'افصل ساعتين عن الكالسيوم/الشاي و4 ساعات عن ليفوثيروكسين.'
    ]
  },

  // 64. Redferx 30 capsules
  {
    id: 'tecafo-30-tab',
    name: 'Tecafo 30 tab',
    genericName: 'Folic Acid + Vitamin B12 + Vitamin B6',
    concentration: 'Combination',
    price: 75,
    matchKeywords: [
      'homocysteine', 'nerves', 'tecafo', 'folic acid', 'b12',
      'تيكافو', 'فوليك اسيد', 'التهاب اعصاب', 'هوموسيستين'
    ],
    usage: 'تركيبة ثلاثية (فوليك، B6، B12) لضبط الهوموسيستين (حماية القلب) وعلاج التهاب الأعصاب الطرفية والأنيميا.',
    timing: 'قرص واحد يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً.';
    },


    warnings: [
      'الحمل: آمن عادة كفولات/B6/B12، لكن ليس بديلاً عن الحديد إذا كان ناقصاً.',
      'قد يخفي نقص B12 إذا استُخدم منفرداً؛ تحقق من مستوى B12 عند الشك.',
      'تداخلات قليلة؛ تابع مع طبيب القلب/السكر.'
    ]
  },

  // 66. Vitosel syrup 30 ml
  {
    id: 'vitosel-syrup-30',
    name: 'Vitosel syrup 30 ml',
    genericName: 'Lactoferrin + Iron + Colostrum (Bovine) + Vitamins',
    concentration: 'Concentrated Liquid',
    price: 110,
    matchKeywords: [
      'immunity', 'colostrum', 'vitosel', 'infant anemia', 'lactoferrin',
      'فيتوسيل', 'سرسوب اللبن', 'مناعة', 'انيميا الرضع', 'لاكتوفيرين'
    ],
    usage: 'تركيبة فريدة للرضع تجمع بين اللاكتوفيرين والحديد و"سرسوب اللبن" (Colostrum)، مما يجعله أقوى رافع للمناعة ومحفز للنمو بجانب علاج الأنيميا.',
    timing: '1–2 مل يومياً.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Syrup / Drops',

    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 2,
    maxWeight: 20,

    calculationRule: (weight, ageMonths) => {
      return 'الرضع: 1 مل يومياً؛ ≥1 سنة: 2 مل يومياً. مدة الكورس 2–4 أسابيع.';
    },


    warnings: [
      'مشتق حليب (لاكتوفيرين/كولوسترم)؛ تجنب الحساسية.',
      'يحفظ مبرداً بعد الفتح ويستهلك خلال شهر.',
      'سكريات خفيفة؛ راقب الرضع المعرضين للمغص.'
    ]
  },

  // 67. Romaglobin 120 ml syrup
  {
    id: 'rangier-line-20-tabs',
    name: 'Rangier Line 20 tabs',
    genericName: 'Iron + Zinc + Molybdenum + Copper',
    concentration: 'Combination',
    price: 105,
    matchKeywords: [
      'minerals', 'rangier line', 'iron', 'hair loss', 'skin',
      'رانجير لاين', 'معادن', 'زنك', 'تساقط شعر', 'انيميا'
    ],
    usage: 'تركيبة معادن نادرة (حديد/زنك/نحاس/موليبدنوم) تدعم امتصاص الحديد وصحة الشعر/الجلد.',
    timing: 'قرص واحد يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص يومياً بعد الغداء؛ يمكن مدّه لشهرين لدعم المخزون.';
    },


    warnings: [
      'تداخلات: الكالسيوم/الشاي يقللان الامتصاص؛ افصل ساعتين. ليفوثيروكسين/فلوروكينولونات افصل 4 ساعات.',
      'قد يسبب غثياناً خفيفاً على معدة فارغة.'
    ]
  },

  // 69. Iron direct 20 sachets
  {
    id: 'iron-direct-sachets',
    name: 'Iron direct 20 sachets',
    genericName: 'Iron (Direct Form) + Folic + B6 + Vit C',
    concentration: 'Direct Absorption Tech',
    price: 500,
    matchKeywords: [
      'iron direct', 'sachets', 'premium', 'no constipation', 'fast absorption',
      'ايرون دايركت', 'حديد مباشر', 'اكياس', 'بدون ماء', 'سعر غالي'
    ],
    usage: 'أكياس حديد سريعة الذوبان بالفم (ODT) بامتصاص عالٍ ولطيفة على المعدة.',
    timing: 'كيس واحد يومياً بعد الأكل أو على معدة فارغة حسب التحمل.',
    category: Category.ANTIANEMIC,
    form: 'Sachets (ODT)',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً يذوب على اللسان؛ لا تتجاوز الكيس اليومي؛ لا تزد بدون قياس الحديد/الفيريتين.';
    },


    warnings: [
      'الحمل: آمن غالباً؛ الجرعة حسب التشخيص.',
      'تداخلات قليلة مع الطعام، لكن يُفضَّل الفصل عن الكالسيوم الكبير.',
      'تكلفة مرتفعة؛ ناقش البدائل الأرخص عند الحاجة.'
    ]
  },

  // 70. Cosmofer 50mg/ml for inf. 5 amps
  {
    id: 'cosmofer-amp',
    name: 'Cosmofer 50mg/ml for inf. 5 amps',
    genericName: 'Iron Dextran',
    concentration: '50mg/ml',
    price: 470,
    matchKeywords: [
      'iron dextran', 'cosmofer', 'iv iron', 'infusion', 'test dose',
      'كوزموفر', 'حديد ديكستران', 'حقن وريد', 'اختبار حساسية'
    ],
    usage: 'حديد ديكستران (IV/IM) لتعويض العجز الكلي بالوريد (Total Dose Infusion) عند الضرورة.',
    timing: 'حسب معادلة Ganzoni مع جرعة اختبار، غالباً IV على جلسة أو جلسات مقسمة.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV/IM)',

    minAgeMonths: 144, // Not usually first choice for kids due to anaphylaxis risk
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const total = Math.round(weight * (15 - 8) * 2.4 + 500);
      return `يحسب العجز الكلي (Ganzoni) ≈ ${total} مجم. 25 مجم جرعة اختبار IV ببطء، ثم 100–200 مجم/جلسة (أو TDI) حسب التحمل.`;
    },


    warnings: [
      'خطر تأق أعلى من السكروز؛ لا يُستخدم إلا بوجود طوارئ جاهزة.',
      'الحمل: تجنب الثلث الأول؛ استخدم عند فشل البدائل.',
      'لا يُحقن عضلياً إلا للضرورة القصوى وبحذر (ألم/تصبغ).'
    ]
  },

  // 71. Phara fero 18 - 30 caps
  {
    id: 'phara-fero-18-caps',
    name: 'Phara fero 18 - 30 caps',
    genericName: 'Iron (18mg) + Zinc + Copper + Molybdenum',
    concentration: '18mg Iron',
    price: 114,
    matchKeywords: [
      'phara fero 18', 'maintenance', 'mild anemia', 'minerals',
      'فارا فيرو ١٨', 'انيميا بسيطة', 'وقاية', 'معادن'
    ],
    usage: 'حديد 18 مجم خفيف للوقاية أو أنيميا بسيطة أو للحمل مع حساسية معدية.',
    timing: 'كبسولة يومياً بعد الأكل (يمكن زيادتها لكبسولتين علاجياً).',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'وقاية: كبسولة يومياً. علاج خفيف: كبسولتان يومياً مؤقتاً حسب التشخيص.';
    },


    warnings: [
      'تأكد من تركيز 18 مجم (يوجد 27 مجم للحالات الأشد).',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.'
    ]
  },

  // 72. Irolivatal 30 caps
  {
    id: 'irolivatal-30-caps',
    name: 'Irolivatal 30 caps',
    genericName: 'Iron + Vit C + Folic + B12',
    concentration: 'Combination',
    price: 105,
    matchKeywords: [
      'iron', 'irolivatal', 'pregnancy', 'anemia',
      'ايروليفاتال', 'حديد', 'حمل', 'فوليك'
    ],
    usage: 'كبسولات حديد مع فيتامين C وفوليك/B12 لرفع Hb أثناء الحمل أو الأنيميا.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً بعد الأكل.';
    },


    warnings: [
      'افصل ساعتين عن الشاي/القهوة والكالسيوم؛ 4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'براز أسود طبيعي مع الحديد.'
    ]
  },

  // 73. Haemactin 30 caps
  {
    id: 'haemactin-30-caps',
    name: 'Haemactin 30 caps',
    genericName: 'Ferrous Fumarate + Folic Acid + B12',
    concentration: 'Combination',
    price: 150,
    matchKeywords: [
      'haemactin', 'ferrous fumarate', 'classic iron', 'anemia',
      'هيمكتين', 'حديد فيومارات', 'انيميا', 'تقليدي'
    ],
    usage: 'علاج كلاسيكي فعال للأنيميا: فيومارات حديد (ملح عالي التركيز) مع الفوليك وB12.',
    timing: 'كبسولة واحدة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة بعد الأكل يومياً؛ يمكن زيادتها مؤقتاً لكبسولتين في الحالات الأشد حسب التشخيص.';
    },


    warnings: [
      'قد يسبب إمساكاً؛ زِد السوائل والألياف.',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.'
    ]
  },

  // 74. Ferro-saja orange syrup 120 ml
  {
    id: 'ferro-saja-syrup',
    name: 'Ferro-saja orange syrup 120 ml',
    genericName: 'Iron + B Vitamins + Zinc',
    concentration: 'Combination',
    price: 35,
    matchKeywords: [
      'iron syrup', 'ferro saja', 'orange taste', 'kids', 'economy',
      'فيرو ساجا', 'بطعم البرتقال', 'حديد اطفال', 'رخيص'
    ],
    usage: 'شراب حديد بطعم البرتقال للأطفال كعلاج اقتصادي لأنيميا نقص الحديد.',
    timing: '5 مل مرتين يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 12,
    maxAgeMonths: 144,
    minWeight: 8,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const minMl = (weight * 3 / 10).toFixed(1);
      const maxMl = (weight * 6 / 10).toFixed(1);
      return `علاج: ${minMl}-${maxMl} مل/يوم (3–6 مجم/كجم) تقسّم جرعتين؛ وقاية: نصف الجرعة.`;
    },


    warnings: [
      'تركيزه محدود؛ مناسب للأنيميا الخفيفة/الوقائية أكثر من الشديدة.',
      'قد يسبب برازاً داكناً أو إمساكاً خفيفاً.',
      'احفظ بعيداً عن الأطفال.'
    ]
  },
  // 75. Ferreserve 120 ml syrup
  {
    id: 'aviron-24-tabs',
    name: 'Aviron 24 tabs.',
    genericName: 'Iron + Folic Acid + Vit B6 + B12',
    concentration: 'Combination',
    price: 58,
    matchKeywords: [
      'iron', 'aviron', 'pregnancy', 'anemia', 'general tonic',
      'افيرون', 'حديد', 'مقوي عام', 'انيميا', 'حمل'
    ],
    usage: 'أقراص حديد مع فوليك/B6/B12 لعلاج أنيميا خفيفة-متوسطة.',
    timing: 'قرص بعد الغداء يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد الغداء.';
    },


    warnings: [
      'افصل ساعتين عن الشاي/القهوة والكالسيوم، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً خفيفاً.'
    ]
  },

  // 78. Idomaltol 30 mg 56 caps.
  {
    id: 'idomaltol-56-caps',
    name: 'Idomaltol 30 mg 56 caps.',
    genericName: 'Iron Polymaltose Complex',
    concentration: '30mg (Elemental Iron)',
    price: 218,
    matchKeywords: [
      'iron polymaltose', 'idomaltol', 'gentle iron', 'large pack',
      'ايدومالتول', 'حديد بوليمالتوز', 'عبوة توفير', 'انيميا'
    ],
    usage: 'حديد بوليمالتوز 30 مجم لطيف على المعدة (عبوة 56 كبسولة تكفي ~8 أسابيع).',
    timing: 'كبسولة بعد الأكل يومياً؛ يمكن زيادتها لكبسولتين للحالات الأشد.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة يومياً للصيانة أو أنيميا خفيفة؛ كبسولتان علاجياً لفترة محدودة حسب التشخيص.';
    },


    warnings: [
      'تداخلات: افصل ساعتين عن الكالسيوم/الشاي و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يحتاج جرعة أعلى مؤقتاً لأن تركيزه 30 مجم فقط.'
    ]
  },

  // 79. Folicinad 5mg 50tabs
  {
    id: 'folicinad-5mg-50-tabs',
    name: 'Folicinad 5mg 50tabs',
    genericName: 'Folic Acid',
    concentration: '5mg',
    price: 50,
    matchKeywords: [
      'folic acid', 'high dose', 'pregnancy risk', 'folicinad',
      'فوليسيناب', 'فوليك ٥', 'جرعة عالية', 'تشوهات'
    ],
    usage: 'حمض الفوليك 5 مجم جرعة علاجية لحالات الميجالوبلاستيك أو حمل عالي الخطورة.',
    timing: 'قرص 5 مجم يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص 5 مجم يومياً بوصفة طبية؛ قد تُرفع الجرعة مؤقتاً في حمل عالي الخطورة بتوجيه متخصص.';
    },


    warnings: [
      'الحمل: يستخدم للخطورة العالية (تاريخ عيوب أنبوب عصبي) حسب التشخيص.',
      'تداخلات: مضادات الاختلاج قد تستلزم ضبط الجرعة؛ الميثوتريكسات مضاد فولات.',
      'خطر إخفاء نقص B12؛ تحقق دورياً.'
    ]
  },

  // 80. Egy-tron 10 sachets
  {
    id: 'egy-tron-sachets',
    name: 'Egy-tron 10 sachets',
    genericName: 'Lactoferrin',
    concentration: '100mg',
    price: 100,
    matchKeywords: [
      'lactoferrin', 'immunity', 'egy tron', 'anemia',
      'ايجي ترون', 'لاكتوفيرين', 'فوار مناعة', 'انيميا'
    ],
    usage: 'أكياس لاكتوفيرين 100 مجم لرفع المناعة ودعم امتصاص الحديد.',
    timing: 'كيس صباحاً وكيس مساءً قبل الأكل.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'وقائياً: كيس يومياً قبل الأكل. علاجياً: كيسان يومياً (صباح/مساء) 2–4 أسابيع.';
    },


    warnings: [
      'مشتق من الحليب؛ تجنب الحساسية.',
      'آمن للحمل/الرضاعة غالباً بجرعات غذائية.',
      'يُستخدم مع مصدر حديد عند وجود نقص حديدي.'
    ]
  },

  // 81. Epotin Julphar 4000 i.u/ 1ml s.c/i.v. vial
  {
    id: 'epotin-julphar-4000',
    name: 'Epotin Julphar 4000 i.u/ 1ml s.c/i.v. vial',
    genericName: 'Erythropoietin (EPO)',
    concentration: '4000 IU',
    price: 115,
    matchKeywords: [
      'epo', 'julphar', 'kidney failure', 'dialysis', 'anemia',
      'ايبوتين جلفار', 'حقن كلى', 'انيميا الفشل الكلوي', 'هرمون'
    ],
    usage: 'إريثروبويتين مؤتلف لعلاج أنيميا الفشل الكلوي/العلاج الكيماوي مع تعويض الحديد.',
    timing: '3 مرات أسبوعياً أو جرعة أسبوعية مكافئة حسب Hb.',
    category: Category.ANTIANEMIC,
    form: 'Injection (SC/IV)',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const dose = Math.round(weight * 50); // 50 IU/kg TIW
      return `جرعة البدء الشائعة: ${dose} وحدة دولية (≈50 وحدة/كجم) SC أو IV ثلاث مرات أسبوعياً؛ تُعدل كل 2–4 أسابيع لاستهداف Hb 10-11 دون تجاوز 12.`;
    },


    warnings: [
      'الحمل: فئة C؛ استخدم عند الضرورة مع متابعة لصيقة.',
      'موانع: ضغط غير مضبوط، حساسية سابقة لـ EPO. خطر جلطات إذا Hb >12 أو الارتفاع سريع.',
      'تداخلات: قد يلزم ضبط جرعة السيكلوسبورين مع ارتفاع الهيماتوكريت.',
      'لا ترج القارورة بقوة؛ أخرجها من الثلاجة قبل الحقن بـ 15 دقيقة.'
    ]
  },

  // 82. Ferosac 100mg/5ml 5 amp.
  {
    id: 'ferosac-100-amp',
    name: 'Ferosac 100mg/5ml 5 amp.',
    genericName: 'Iron Sucrose',
    concentration: '100mg/5ml',
    price: 470,
    matchKeywords: [
      'iv iron', 'ferosac', 'iron sucrose', 'hospital', 'severe anemia',
      'فيروساك', 'حديد وريد', 'انيميا حادة', 'محاليل', 'نقل حديد'
    ],
    usage: 'حديد سكروز وريدي لعلاج نقص الحديد غير المستجيب للفموي أو لمرضى الكلى/الحمل بعد الثلث الأول.',
    timing: '100–200 مجم IV 1–3 مرات أسبوعياً حتى استكمال العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV ONLY)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const totalDeficit = Math.round(weight * (15 - 8) * 2.4 + 500);
      return `جرعة الجلسة: 100 مجم في 100 مل ملح على 15–30 دقيقة (أو 200 مجم على ≥30 دقيقة) 1–3 مرات أسبوعياً حتى بلوغ عجز يقارب ${totalDeficit} مجم.`;
    },


    warnings: [
      'الحمل: فئة B؛ يُفضَّل بعد الثلث الأول.',
      'تداخلات: افصل عن الحديد الفموي 4–6 ساعات؛ لا يخلط مع محاليل أخرى.',
      'خطر تحسس/هبوط ضغط؛ أوقف التسريب عند أي أعراض.',
      'ممنوع الحقن العضلي.'
    ]
  },

  // 83. Ferronex plus iron lozenges 24 tabs.
  {
    id: 'ferronex-lozenges',
    name: 'Ferronex plus iron lozenges 24 tabs.',
    genericName: 'Iron + Vitamins',
    concentration: 'Lozenges Form',
    price: 110,
    matchKeywords: [
      'iron lozenges', 'ferronex', 'suckable', 'tasty',
      'فيرونيكس', 'استحلاب', 'حديد استحلاب', 'طعم الشوكولاتة'
    ],
    usage: 'أقراص استحلاب حديد مع فيتامينات لمن لا يستطيع بلع الأقراص.',
    timing: 'قرص استحلاب يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Lozenges',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص استحلاب واحد يومياً.';
    },


    warnings: [
      'يحتوي سكر/كاكاو؛ راعِ السكري وحساسية الكاكاو.',
      'احفظ بعيداً عن الأطفال لتجنب الجرعة الزائدة.'
    ]
  },

  // 84. Folic acid (eipico) 5 mg 20 tab.
  {
    id: 'folic-acid-eipico-5mg',
    name: 'Folic acid (eipico) 5 mg 20 tab.',
    genericName: 'Folic Acid',
    concentration: '5mg',
    price: 24,
    matchKeywords: [
      'folic acid', 'eipico', 'cheap', 'high dose',
      'فوليك اسيد ايبكو', 'رخيص', 'جرعة عالية', 'مصري'
    ],
    usage: 'حمض الفوليك 5 مجم اقتصادي لعلاج الميجالوبلاستيك أو حمل عالي الخطورة.',
    timing: 'قرص 5 مجم يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'جرعة علاجية: قرص 5 مجم يومياً؛ للوقاية الروتينية استخدم 0.4–0.8 مجم بدلاً منه إلا إذا نص الطبيب.';
    },


    warnings: [
      'خطر إخفاء نقص B12؛ تحقق دورياً.',
      'الحمل عالي الخطورة فقط بهذه الجرعة وحسب التشخيص.',
      'تداخلات: مضادات الاختلاج قد تتطلب ضبط الجرعة؛ الميثوتريكسات مضاد فولات.'
    ]
  },
  // 85. Golden fer 10 mg/ml syrup 100 ml
  {
    id: 'golden-fer-syrup-100',
    name: 'Golden fer 10 mg/ml syrup 100 ml',
    genericName: 'Iron Complex',
    concentration: '10mg/ml',
    price: 34,
    matchKeywords: [
      'iron syrup', 'golden fer', 'kids anemia', 'liquid iron',
      'جولدن فير شراب', 'حديد اطفال', 'انيميا', 'نقط'
    ],
    usage: 'شراب حديد تركيز 10 مجم/مل للأطفال لعلاج أنيميا نقص الحديد بجرعات صغيرة.',
    timing: 'يومياً مقسم: 2–3 مل مرتين (حسب الوزن) بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Syrup',

    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 5,
    maxWeight: 50,

    calculationRule: (weight, ageMonths) => {
      const minMl = (weight * 3 / 10).toFixed(1);
      const maxMl = (weight * 6 / 10).toFixed(1);
      return `علاج: ${minMl}-${maxMl} مل/يوم (3–6 مجم/كجم) تقسم جرعتين؛ وقاية: نصف الجرعة.`;
    },


    warnings: [
      'تركيز عالٍ (10 مجم/مل): احسب الجرعة بدقة لتجنب سمية الحديد.',
      'قد يسبب إمساكاً؛ زد السوائل.',
      'احفظ بعيداً عن الأطفال.'
    ]
  },

  // 86. Haemactin 20 caps.
  {
    id: 'haemactin-20-caps',
    name: 'Haemactin 20 caps.',
    genericName: 'Ferrous Fumarate + Folic Acid + Vit B12',
    concentration: 'Combination',
    price: 36,
    matchKeywords: [
      'ferrous fumarate', 'haemactin', 'classic iron', 'anemia',
      'هيمكتين ٢٠', 'حديد فيومارات', 'انيميا', 'رخيص'
    ],
    usage: 'هيمكتين 20 كبسولة (فيومارات حديد + فوليك/B12) لعلاج أنيميا نقص الحديد.',
    timing: 'كبسولة بعد الأكل يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة يومياً؛ يمكن زيادتها لكبسولتين مؤقتاً للحالات الأشد حسب التشخيص.';
    },


    warnings: [
      'قد يسبب إمساكاً أو اضطراب معدة؛ تجنب قرحة نشطة.',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.'
    ]
  },

  // 87. Innofer 10 sachets
  {
    id: 'innofer-10-sachets',
    name: 'Innofer 10 sachets',
    genericName: 'Lactoferrin + Iron + Vitamins',
    concentration: 'Combination',
    price: 110,
    matchKeywords: [
      'lactoferrin', 'innofer', 'sachets', 'immunity', 'anemia',
      'انوفر', 'لاكتوفيرين', 'اكياس حديد', 'مناعة'
    ],
    usage: 'أكياس لاكتوفيرين مع حديد لتحسين المناعة وامتصاص الحديد.',
    timing: 'كيس يومياً قبل الأكل.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً يذاب في ربع كوب ماء أو حليب.';
    },


    warnings: [
      'يحتوي بروتين حليب؛ تجنب الحساسية.',
      'يُستخدم مع متابعة الحديد؛ ليس بديلاً عن جرعات حديد علاجية عالية عند الحاجة.'
    ]
  },

  // 88. Interofer 100mg/5ml 5 amp for i.v. inj.
  {
    id: 'interofer-100-amp',
    name: 'Interofer 100mg/5ml 5 amp for i.v. inj.',
    genericName: 'Iron Sucrose',
    concentration: '100mg/5ml',
    price: 120,
    matchKeywords: [
      'iv iron', 'iron sucrose', 'interofer', 'injection', 'hospital',
      'انتروفر', 'حديد وريد', 'انيميا حادة', 'رخيص'
    ],
    usage: 'حديد سكروز وريدي اقتصادي لعلاج نقص الحديد الشديد.',
    timing: '100–200 مجم IV ببطء 1–3 مرات أسبوعياً حسب العجز.',
    category: Category.ANTIANEMIC,
    form: 'Injection (IV ONLY)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const totalDeficit = Math.round(weight * (15 - 8) * 2.4 + 500);
      return `100 مجم في 100 مل ملح على 15–30 دقيقة (أو 200 مجم على ≥30 دقيقة) 1–3 مرات أسبوعياً حتى عجز يقارب ${totalDeficit} مجم.`;
    },


    warnings: [
      'ممنوع الحقن العضلي.',
      'خطر تحسس/هبوط ضغط؛ أوقف التسريب عند أي أعراض.',
      'افصل عن الحديد الفموي 4–6 ساعات.'
    ]
  },

  // 89. Lacrim 14 sachets
  {
    id: 'lacrim-14-sachets',
    name: 'Lacrim 14 sachets',
    genericName: 'Lactoferrin + Chelated Iron + Vit C',
    concentration: 'Combination',
    price: 125,
    matchKeywords: [
      'lactoferrin', 'lacrim', 'chelated iron', 'sachets',
      'لاكريم', 'لاكتوفيرين', 'حديد مخلبي', 'اكياس'
    ],
    usage: 'أكياس لاكتوفيرين + حديد مخلبي لرفع المناعة والحديد للحامل والأطفال.',
    timing: 'كيس يومياً قبل الأكل.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً قبل الأكل.';
    },


    warnings: [
      'يحتوي بروتين حليب؛ تجنب الحساسية.',
      'العبوة 14 كيس تكفي أسبوعين؛ يفضل كورس 3 أشهر لاستكمال المخزون.',
      'استخدم مع مراقبة Hb/فريتين.'
    ]
  },

  // 90. Limitless kids multivitamins & iron 30 chocolate balls
  {
    id: 'limitless-kids-iron-balls',
    name: 'Limitless kids multivitamins & iron 30 chocolate balls',
    genericName: 'Iron + Multivitamins',
    concentration: 'Chocolate Form',
    price: 95,
    matchKeywords: [
      'chocolate balls', 'limitless kids', 'multivitamin', 'iron', 'tasty',
      'ليميتلس كيدز', 'كرات شوكولاتة', 'حديد اطفال', 'فيتامينات', 'طعم حلو'
    ],
    usage: 'كرات شوكولاتة تحتوي الحديد والفيتامينات لتسهيل إعطاء الحديد للأطفال.',
    timing: 'كرة واحدة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Chocolate Balls (Edible)',

    minAgeMonths: 24, // Chewing required
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 60,

    calculationRule: (weight, ageMonths) => {
      return 'كرة شوكولاتة واحدة يومياً (تحتوي على الاحتياج اليومي).';
    },


    warnings: [
      'خطر تسمم الحديد عند أكل عدة كرات؛ احفظ بعيداً عن الأطفال.',
      'تحتوي سكريات/حليب؛ راعِ السكري وحساسية الحليب.',
      'افصل ساعتين عن الحليب/الكالسيوم الكبير لتحسين الامتصاص.'
    ]
  },

  // 91. Nixeleco 10 sachets
  {
    id: 'nixeleco-10-sachets',
    name: 'Nixeleco 10 sachets',
    genericName: 'Lactoferrin + Colostrum + Vitamins',
    concentration: 'Combination',
    price: 69,
    matchKeywords: [
      'lactoferrin', 'colostrum', 'nixeleco', 'immunity',
      'نيكسيليكو', 'لاكتوفيرين', 'سرسوب اللبن', 'مناعة', 'رخيص'
    ],
    usage: 'أكياس لاكتوفيرين + كولوسترم اقتصادية لرفع المناعة (دعم غير كافٍ وحده للأنيميا).',
    timing: 'كيس يومياً قبل الأكل.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets',

    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً على معدة فارغة.';
    },


    warnings: [
      'مشتق حليب؛ تجنب الحساسية.',
      'ليس بديلاً عن علاج الحديد للحالات الشديدة.',
      'لا تخلط في مشروب ساخن.'
    ]
  },

  // 92. Oravar 100 mg 10 sachets
  {
    id: 'oravar-100-sachets',
    name: 'Oravar 100 mg 10 sachets',
    genericName: 'Lactoferrin',
    concentration: '100mg',
    price: 110,
    matchKeywords: [
      'lactoferrin', 'oravar', 'immunity', 'iron absorption',
      'اورافار', 'لاكتوفيرين', 'انيميا', 'مناعة'
    ],
    usage: 'لاكتوفيرين 100 مجم لدعم المناعة وزيادة امتصاص الحديد.',
    timing: 'كيس صباحاً وكيس مساءً قبل الأكل.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد صباحاً ومساءً قبل الأكل.';
    },


    warnings: [
      'مشتق حليب؛ تجنب الحساسية.',
      'استمرار شهر على الأقل لرفع الفريتين بوضوح.',
      'يُستخدم مع مصدر حديد عند نقص الحديد.'
    ]
  },

  // 93. Protimax (fe+) 10g*10 sachets
  {
    id: 'protimax-fe-sachets',
    name: 'Protimax (fe+) 10g*10 sachets',
    genericName: 'Lactoferrin + Iron + Protein',
    concentration: '10g Sachet',
    price: 160,
    matchKeywords: [
      'protein', 'iron', 'lactoferrin', 'protimax', 'malnutrition',
      'بروتيماكس', 'بروتين', 'حديد', 'تغذية', 'ضعف عام'
    ],
    usage: 'بودرة بروتين + حديد + لاكتوفيرين لدعم سوء التغذية مع أنيميا.',
    timing: 'كيس يومياً يخلط مع حليب/عصير.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets (Powder)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً يضاف لكوب حليب أو عصير.';
    },


    warnings: [
      'مشتق حليب محتمل؛ راقب الحساسية.',
      'جرعة بروتين كبيرة؛ راقب مرضى الكلى.',
      'التزم بكيس/يوم لتجنب حمل بروتيني زائد.'
    ]
  },

  // 94. Provan 100mg 14 sachets
  {
    id: 'provan-100-14-sachets',
    name: 'Provan 100mg 14 sachets',
    genericName: 'Lactoferrin',
    concentration: '100mg',
    price: 140,
    matchKeywords: [
      'lactoferrin', 'provan', 'immunity', 'anemia',
      'بروفان', 'لاكتوفيرين', 'مناعة', 'فيروسات'
    ],
    usage: 'لاكتوفيرين 100 مجم (14 كيس) لرفع المناعة ودعم الحديد.',
    timing: 'كيس يومياً للوقاية؛ كيسان صباحاً/مساءً للعلاج.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً للوقاية، وكيسين للعلاج (صباحاً ومساءً).';
    },


    warnings: [
      'لا يضاف لماء ساخن.',
      'مشتق حليب؛ تجنب الحساسية.',
      'يُستكمل بمصدر حديد عند نقص الحديد.'
    ]
  },
  // 95. Omex 100 mg 20 caps.
  {
    id: 'omex-100-caps',
    name: 'Omex 100 mg 20 caps.',
    genericName: 'Lactoferrin + Vitamin C',
    concentration: '100mg Lactoferrin',
    price: 160,
    matchKeywords: [
      'lactoferrin', 'immunity', 'omex', 'vitamin c', 'anemia',
      'اومكس', 'لاكتوفيرين', 'مناعة', 'انيميا', 'فيروسات'
    ],
    usage: 'كبسولات لاكتوفيرين 100 مجم مع فيتامين C لرفع المناعة وتحسين امتصاص الحديد.',
    timing: 'كبسولة يومياً للوقاية؛ كبسولتان يومياً (صباح/مساء) علاجياً.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة صباحاً وكبسولة مساءً في الحالات الحادة، أو كبسولة واحدة للوقاية.';
    },


    warnings: [
      'مشتق حليب؛ تجنب الحساسية.',
      'الحمل/رضاعة: غالباً آمن كمكمل؛ أعدي التقييم عند اللزوم.',
      'ليس بديلاً عن حديد علاجي في نقص حديدي واضح.'
    ]
  },

  // 96. Rofitin 24 chew. pieces
  {
    id: 'rofitin-24-chew',
    name: 'Rofitin 24 chew. pieces',
    genericName: 'Ferrous Fumarate + Vit C + B12 + Folic + Whey Protein',
    concentration: 'Combination',
    price: 84,
    matchKeywords: [
      'chewable iron', 'rofitin', 'whey protein', 'kids anemia', 'chocolate',
      'روفيتين', 'حديد مضغ', 'واي بروتين', 'انيميا اطفال', 'قطع'
    ],
    usage: 'قطع شوكولاتة مضغ حديد + فيتامينات + واي بروتين لرفع الحديد والوزن.',
    timing: 'قطعة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Edible Piece',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قطعة واحدة يومياً.';
    },


    warnings: [
      'خطر تسمم الحديد مع الإفراط؛ احفظ بعيداً عن الأطفال.',
      'يحتوي بروتين حليب/سكر؛ راقب حساسية الحليب والسكري.',
      'خزنها في مكان بارد لتجنب الذوبان.'
    ]
  },

  // 97. Rotone complex 20 tabs
  {
    id: 'rotone-complex-20',
    name: 'Rotone complex 20 tabs',
    genericName: 'Iron + Zinc + Copper + B Complex',
    concentration: 'Combination',
    price: 110,
    matchKeywords: [
      'iron', 'rotone', 'zinc', 'copper', 'hair loss',
      'روتون', 'حديد', 'زنك', 'نحاس', 'تساقط شعر'
    ],
    usage: 'قرص حديد + زنك + نحاس + فيتامينات ب لدعم الدم والشعر.',
    timing: 'قرص بعد الأكل يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد وجبة الغداء.';
    },


    warnings: [
      'تداخلات: افصل ساعتين عن الكالسيوم/الشاي و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب غثياناً بسيطاً على معدة فارغة.'
    ]
  },

  // 98. Sanoplex 24 chewable tabs.
  {
    id: 'sanoplex-24-chew',
    name: 'Sanoplex 24 chewable tabs.',
    genericName: 'Ferrous Fumarate + Vit B12 + Folic + B6',
    concentration: 'Combination',
    price: 139,
    matchKeywords: [
      'chewable iron', 'sanoplex', 'kids anemia', 'tasty',
      'سانوبلكس', 'حديد مضغ', 'انيميا اطفال', 'فيتامين ب'
    ],
    usage: 'أقراص مضغ حديد + فوليك/B12/B6 للأطفال أو من يرفض البلع.',
    timing: 'قرص مضغ يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Chewable Tablet',

    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً.';
    },


    warnings: [
      'سكر مضاف؛ راقب السكري وتسوس الأسنان.',
      'خطر تسمم الحديد مع الإفراط؛ احفظ بعيداً عن الأطفال.'
    ]
  },

  // 99. Sansovit with iron syrup 600gm
  {
    id: 'phara-fero-18-plus-caps',
    name: 'Phara fero 18 plus - 20 caps.',
    genericName: 'Iron (18mg) + Zinc + Copper + Vitamins + Lactoferrin?',
    concentration: '18mg Iron + Enhanced Formula',
    price: 275,
    matchKeywords: [
      'phara fero 18 plus', 'immunity', 'premium iron', 'minerals',
      'فارا فيرو ١٨ بلس', 'سعر غالي', 'مناعة', 'حديد'
    ],
    usage: 'فارا فيرو 18 بلس (حديد خفيف مع دعم مناعي/امتصاص محسن) للحالات الخفيفة أو الحساسة معدياً.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'السعر مرتفع مقارنة بنسخة 18 العادية؛ ناقش البدائل.',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.'
    ]
  },

  // 101. Ferrosky 30 caps.
  {
    id: 'ferrosky-30-caps',
    name: 'Ferrosky 30 caps.',
    genericName: 'Ferrous Bisglycinate + Folic + B12 + Vit C',
    concentration: 'Chelated Iron',
    price: 120,
    matchKeywords: [
      'chelated iron', 'ferrosky', 'gentle iron', 'anemia',
      'فيروسكي', 'حديد مخلبي', 'بيسجليسينات', 'انيميا'
    ],
    usage: 'حديد بيسجليسينات مع فوليك/B12/فيتامين C بامتصاص عالٍ ولطيف على المعدة.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'الحمل/رضاعة: آمن عادة؛ راقبي Hb/فريتين.',
      'افصل ساعتين عن الكالسيوم/الشاي و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً خفيفاً.'
    ]
  },

  // 102. Fortiferrum 14 sachets
  {
    id: 'fortiferrum-14-sachets',
    name: 'Fortiferrum 14 sachets',
    genericName: 'Liposomal Iron + Vit C',
    concentration: 'Liposomal Tech',
    price: 255,
    matchKeywords: [
      'liposomal iron', 'sachets', 'fortiferrum', 'premium',
      'فورتيفيرم', 'حديد ليبوزومي', 'اكياس', 'سعر غالي'
    ],
    usage: 'أكياس حديد ليبوزومي (14 كيس) بطعم محايد وامتصاص عالٍ للحالات غير المتحملة للحديد العادي.',
    timing: 'كيس يومياً بعد الأكل أو على معدة فارغة حسب التحمل.',
    category: Category.ANTIANEMIC,
    form: 'Sachets (Direct/Dissolvable)',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً (العبوة تكفي أسبوعين فقط).';
    },


    warnings: [
      'التزم بكيس/يوم لتجنب زيادة الحديد.',
      'السعر مرتفع؛ ناقش البدائل عند الحاجة.',
      'افصل ساعتين عن مكملات الكالسيوم الكبيرة رغم قلة التداخل.'
    ]
  },

  // 103. Galtin sachets 10 sachets *10gm
  {
    id: 'galtin-sachets',
    name: 'Galtin sachets 10 sachets *10gm',
    genericName: 'Lactoferrin + Iron + Vit C + Zinc + B Complex',
    concentration: '10gm Sachet (Protein base likely)',
    price: 95,
    matchKeywords: [
      'lactoferrin', 'galtin', 'protein', 'malnutrition', 'anemia',
      'جالتين', 'لاكتوفيرين', 'اكياس كبيرة', 'حديد', 'نحافة'
    ],
    usage: 'أكياس 10 جم (لاكتوفيرين + حديد + فيتامينات وقد يكون أساس بروتيني) لدعم النمو والأنيميا.',
    timing: 'كيس يومياً يذاب في حليب/عصير.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Sachets (Powder)',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كيس واحد يومياً يذاب في كوب حليب أو عصير.';
    },


    warnings: [
      'مشتق حليب محتمل؛ راقب الحساسية.',
      'قد يحتوي بروتين/سعرات عالية؛ راقب مرضى الكلى/السكري.',
      'التزم بكيس واحد لتجنب حمل بروتيني زائد.'
    ]
  },

  // 104. Iroferin 30 caps.
  {
    id: 'iroferin-30-caps',
    name: 'Iroferin 30 caps.',
    genericName: 'Iron + B6 + B12 + Folic + Zinc + Copper',
    concentration: 'Combination',
    price: 99,
    matchKeywords: [
      'iron', 'iroferin', 'zinc', 'copper', 'anemia',
      'ايروفيرين', 'حديد', 'زنك', 'نحاس', 'شامل'
    ],
    usage: 'كبسولات حديد + زنك + نحاس + فوليك/B12 بسعر اقتصادي.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'افصل ساعتين عن الشاي/القهوة والكالسيوم و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب إمساكاً خفيفاً.'
    ]
  },
  // 105. Rotone complex 30 tabs
  {
    id: 'rotone-complex-30',
    name: 'Rotone complex 30 tabs',
    genericName: 'Iron + Zinc + Copper + Vit B1, B2, B6',
    concentration: 'Combination',
    price: 99,
    matchKeywords: [
      'rotone', 'zinc', 'copper', 'hair', 'nails', 'anemia',
      'روتون كومبلكس', 'حديد', 'زنك', 'نحاس', 'تساقط شعر'
    ],
    usage: 'روتون كومبلكس 30 قرص (حديد + زنك + نحاس + فيتامينات ب) للشعر/الدم.',
    timing: 'قرص بعد الأكل يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً بعد الغداء.';
    },


    warnings: [
      'تداخلات: افصل ساعتين عن الكالسيوم/الشاي و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.',
      'قد يسبب غثياناً بسيطاً على معدة فارغة.'
    ]
  },

  // 106. Stravita iron 120 ml syrup
  {
    id: 'phara-fero-18-20-caps',
    name: 'Phara fero 18 - 20 caps.',
    genericName: 'Iron (18mg) + Zinc + Copper + Molybdenum',
    concentration: '18mg Iron',
    price: 64,
    matchKeywords: [
      'phara fero 18', 'maintenance', 'economy pack', 'mild anemia',
      'فارا فيرو ١٨', 'عبوة صغيرة', 'انيميا بسيطة', 'وقاية'
    ],
    usage: 'فارا فيرو 18 عبوة 20 كبسولة للوقاية/الصيانة أو أنيميا خفيفة.',
    timing: 'كبسولة يومياً بعد الأكل.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'عبوة 20 يوم فقط؛ خطط لإعادة الشراء.',
      'افصل ساعتين عن الشاي/القهوة والكالسيوم، و4 ساعات عن ليفوثيروكسين/الفلوروكينولونات.'
    ]
  },

  // 108. Cobafolic 30 tab
  {
    id: 'cobafolic-30-tab',
    name: 'Cobafolic 30 tab',
    genericName: 'Quadrafolic (Active Folate) + Methylcobalamin (Active B12)',
    concentration: 'Combination',
    price: 165,
    matchKeywords: [
      'active folate', 'methylcobalamin', 'mthfr', 'pregnancy', 'nerves',
      'كوبافوليك', 'ميثيل فولات', 'فولات نشط', 'فيتامين ب١٢', 'حمل', 'سكر'
    ],
    usage: 'فولات نشط (Quadrafolic) + ميثيل كوبالامين للأعصاب والحوامل مع طفرات MTHFR.',
    timing: 'قرص يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'قرص واحد يومياً.';
    },


    warnings: [
      'الحمل: آمن ويفضَّل لطفرات MTHFR/تاريخ عيوب أنبوب عصبي.',
      'قد يخفي نقص B12 إذا استُخدم منفرداً؛ افحص B12 عند الشك.',
      'التكلفة أعلى من الفوليك العادي؛ ناقش البدائل عند عدم الحاجة للفولات النشط.'
    ]
  },

  // 109. Trioglobinal 30 tabs.
  {
    id: 'lactoferrin-saja-30-caps',
    name: 'Lactoferrin saja 100 mg 30 caps',
    genericName: 'Bovine Lactoferrin',
    concentration: '100mg',
    price: 285,
    matchKeywords: [
      'lactoferrin', 'immunity', 'saja', 'anemia adjuvant',
      'لاكتوفيرين ساجا', 'مناعة', 'انيميا', 'فيروسات'
    ],
    usage: 'كبسولات لاكتوفيرين 100 مجم (عبوة شهرية) لدعم المناعة وتنظيم الحديد.',
    timing: 'كبسولة يومياً قبل الأكل.',
    category: Category.IMMUNITY_AND_ANEMIA,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة صباحاً قبل الأكل؛ يمكن زيادتها لكبسولتين مؤقتاً حسب التشخيص.';
    },


    warnings: [
      'مشتق حليب؛ تجنب الحساسية.',
      'الحمل/رضاعة: غالباً آمن كمكمل؛ أعدي التقييم عند اللزوم.',
      'ليس بديلاً عن حديد علاجي عند نقص حديدي واضح.'
    ]
  },

  // 111. Folaska 20 caps
  {
    id: 'folaska-20-caps',
    name: 'Folaska 20 caps',
    genericName: '5-Methyltetrahydrofolic Acid + Methylcobalamin',
    concentration: 'Active Forms',
    price: 85,
    matchKeywords: [
      'active folate', 'methylcobalamin', 'folaska', 'pregnancy',
      'فولاسكا', 'ميثيل فولات', 'فولات نشط', 'ب١٢ نشط'
    ],
    usage: 'فولات نشط + ميثيل كوبالامين اقتصادي لدعم الحمل والأعصاب.',
    timing: 'كبسولة يومياً.',
    category: Category.ANTIANEMIC,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'كبسولة واحدة يومياً.';
    },


    warnings: [
      'العبوة 20 كبسولة (نحو 3 أسابيع).',
      'قد يخفي نقص B12 إذا استُخدم منفرداً؛ افحص B12 عند الشك.',
      'أعدي التقييم بالحمل/الرضاعة عند اللزوم.'
    ]
  },

  // 112. Irocept syrup 120 ml
  

];

