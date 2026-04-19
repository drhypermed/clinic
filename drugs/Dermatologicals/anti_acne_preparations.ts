
import { Medication, Category } from '../../types';

export const ANTI_ACNE_PREPARATIONS: Medication[] = [
  // ==========================================

  // 1. isotretinoin 20mg 10 soft gelatin caps.
  {
    id: 'isotretinoin-isotretinoin-20-10',
    name: 'isotretinoin 20mg 10 soft gelatin caps.',
    genericName: 'Isotretinoin',
    concentration: '20mg',
    price: 124,
    matchKeywords: ['isotretinoin 20', 'isotretinoin 10', 'ايزوتريتينوين', 'حب الشباب الشديد', 'روكتان', 'راكيوتان', 'حب شباب', 'acne', 'severe acne', 'nodular acne'],
    usage: 'لعلاج حب الشباب العقدي/الشديد المقاوم للعلاجات الأخرى (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) =>
      `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم. المدة والتراكم يحددهما الطبيب.`,
    warnings: [
      'الحمل: ممنوع تماماً (خطر تشوهات جنينية شديد). يلزم منع حمل فعّال قبل/أثناء/بعد العلاج حسب البروتوكول.',
      'تداخلات: ممنوع مع التتراسيكلين (مثل doxycycline/minocycline) بسبب خطر ارتفاع ضغط المخ، وتجنب فيتامين A/الريتينويدات الأخرى (زيادة السمية).',
      'تحذيرات خاصة: قد يسبب جفاف شديد بالشفاه/العين والجلد، ارتفاع دهون الدم/إنزيمات الكبد، وتقلبات مزاج نادرة—أعد التقييم عند صداع شديد/زغللة/اكتئاب/أفكار انتحارية.',
      'تجنب إزالة الشعر بالشمع/التقشير العميق والليزر أثناء العلاج ولمدة 6 أشهر بعده (خطر ندبات/تهيج).'
    ]
  },

  // 2. jackodan gel 60 gm
  {
    id: 'jackodan-mix-gel-60',
    name: 'jackodan gel 60 gm',
    genericName: 'Sulphur + Tea tree extract + Glycolic acid + Rosemary extract + Vitamin C (mix)',
    concentration: '60 gm',
    price: 89,
    matchKeywords: ['jackodan', 'جاكودان', 'حب الشباب', 'بشرة دهنية', 'sulphur', 'glycolic', 'acne', 'oily skin', 'حب شباب', 'رؤوس سوداء', 'blackheads'],
    usage: 'جل موضعي/عناية للبشرة الدهنية والمعرضة للحبوب للمساعدة في تقليل الدهون والرؤوس السوداء.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر؛ تجنبي الاستخدام على مساحات كبيرة دون استشارة.', 'تداخلات: لا تداخلات جهازية متوقعة غالباً.', 'تحذيرات: قد يسبب جفاف/تهيج—قلل عدد المرات أو أوقفه إذا حدث تهيج شديد.']
  },

  // 3. acretin 0.025% cream 30 gm
  {
    id: 'acretin-tretinoin-0-025-30',
    name: 'acretin 0.025% cream 30 gm',
    genericName: 'Tretinoin',
    concentration: '0.025%',
    price: 38,
    matchKeywords: ['acretin 0.025', 'acretin', 'tretinoin', 'اكرتين', 'تريتينوين', 'حب شباب', 'acne', 'retinoid', 'ريتينويد', 'رؤوس سوداء', 'blackheads', 'whiteheads'],
    usage: 'ريتينويد موضعي لعلاج حب الشباب (الرؤوس البيضاء/السوداء) وتحسين المسام.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: ممنوع (فئة X—ريتينويد—خطر تشوهات جنينية). يلزم منع حمل فعّال.', 'تداخلات: التهيج يزيد مع المقشرات القوية/الكحوليات/بنزويل بيروكسيد (يفصل بالتوقيت).', 'تحذيرات: يسبب احمرار وتقشر في البداية—هذا متوقع؛ أوقفه عند التهاب شديد. حساسية ضوئية—استخدم واقي شمس.']
  },

  // 4. acretin 0.05% cream 30 gm
  {
    id: 'acretin-tretinoin-0-05-30',
    name: 'acretin 0.05% cream 30 gm',
    genericName: 'Tretinoin',
    concentration: '0.05%',
    price: 43,
    matchKeywords: ['acretin 0.05', 'acretin', 'tretinoin 0.05', 'اكرتين 0.05', 'حب شباب', 'acne', 'retinoid', 'ريتينويد'],
    usage: 'تريتينوين موضعي (تركيز أعلى) لعلاج حب الشباب حسب تحمل الجلد.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: ممنوع (فئة X—ريتينويد—خطر تشوهات جنينية). يلزم منع حمل فعّال.', 'تداخلات: يزداد التهيج مع المقشرات/العطور/بنزويل بيروكسيد.', 'تحذيرات: حساسية ضوئية شديدة—تجنب الشمس المباشرة واستخدم واقي شمس يومياً.']
  },

  // 5. isotretinoin 20mg 30 soft gelatin caps.
  {
    id: 'isotretinoin-isotretinoin-20-30',
    name: 'isotretinoin 20mg 30 soft gelatin caps.',
    genericName: 'Isotretinoin',
    concentration: '20mg',
    price: 372,
    matchKeywords: ['isotretinoin 20 30', 'isotretinoin 30', 'ايزوتريتينوين 20'],
    usage: 'لعلاج حب الشباب الشديد المقاوم (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: ممنوع مع التتراسيكلين/فيتامين A.', 'تحذيرات: متابعة دهون/كبد وجفاف شديد محتمل.']
  },

  // 6. isotretinoin 10mg 10 soft gelatin caps.
  {
    id: 'isotretinoin-isotretinoin-10-10',
    name: 'isotretinoin 10mg 10 soft gelatin caps.',
    genericName: 'Isotretinoin',
    concentration: '10mg',
    price: 64,
    matchKeywords: ['isotretinoin 10', 'ايزوتريتينوين 10'],
    usage: 'إيزوتريتينوين فموي لحب الشباب الشديد (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: التتراسيكلين/فيتامين A.', 'تحذيرات: جفاف/تغيرات مزاج/متابعة دهون وكبد.']
  },

  // 7. isotretinoin 10mg 30 soft gelatin caps.
  {
    id: 'isotretinoin-isotretinoin-10-30',
    name: 'isotretinoin 10mg 30 soft gelatin caps.',
    genericName: 'Isotretinoin',
    concentration: '10mg',
    price: 192,
    matchKeywords: ['isotretinoin 10 30', 'ايزوتريتينوين 10 30'],
    usage: 'إيزوتريتينوين لحب الشباب الشديد (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم (حسب التشخيص والحالة). مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: tetracyclines/Vit A.', 'تحذيرات: جفاف شديد ومتابعة كبد/دهون.']
  },

  // 8. starville facial cleanser gel for acne 200 ml
  {
    id: 'starville-cleanser-acne-200',
    name: 'starville facial cleanser gel for acne 200 ml',
    genericName: 'Lauryl glucoside + Sulphur + Salicylic acid + Licorice extract (mix)',
    concentration: '200 ml',
    price: 125,
    matchKeywords: ['starville cleanser acne 200', 'starville', 'ستارفيل غسول', 'salicylic', 'sulphur'],
    usage: 'غسول للبشرة الدهنية والمعرضة للحبوب للمساعدة في تقليل الدهون والرؤوس السوداء.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كغسول يُشطف، لكن تجنبي الاستخدام المفرط إذا سبب تهيج.', 'تداخلات: لا تُتوقع تداخلات جهازية.', 'تحذيرات: قد يسبب جفاف/لسعة خصوصاً مع علاجات الريتينويد/بنزويل بيروكسيد.']
  },

  // 9. isoromyderm topical gel 30 gm
  {
    id: 'netlook-isotretinoin-10-20',
    name: 'netlook 10mg 20 soft gelatin caps.',
    genericName: 'Isotretinoin',
    concentration: '10mg',
    price: 150,
    matchKeywords: ['netlook 10', 'نيتلوك 10', 'isotretinoin'],
    usage: 'إيزوتريتينوين فموي لحب الشباب الشديد (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: tetracyclines/Vit A.', 'تحذيرات: متابعة كبد/دهون وجفاف شديد.']
  },

  // 11. netlook 20mg 20 soft gelatin caps.
  {
    id: 'netlook-isotretinoin-20-20',
    name: 'netlook 20mg 20 soft gelatin caps.',
    genericName: 'Isotretinoin',
    concentration: '20mg',
    price: 274,
    matchKeywords: ['netlook 20', 'نيتلوك 20', 'isotretinoin 20'],
    usage: 'إيزوتريتينوين فموي لحب الشباب الشديد (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: tetracyclines/Vit A.', 'تحذيرات: متابعات مخبرية حسب التشخيص والحالة.']
  },

  // 12. netlook 40mg 20 soft gelatin capsule
  {
    id: 'netlook-isotretinoin-40-20',
    name: 'netlook 40mg 20 soft gelatin capsule',
    genericName: 'Isotretinoin',
    concentration: '40mg',
    price: 394,
    matchKeywords: ['netlook 40', 'نيتلوك 40', 'isotretinoin 40'],
    usage: 'جرعة أعلى من الإيزوتريتينوين لحب الشباب الشديد—تُستخدم فقط حسب التشخيص.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم. لا تستخدم ٤٠ مجم ذاتياً.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: tetracyclines/Vit A.', 'تحذيرات: زيادة مخاطر الأعراض الجانبية مع الجرعات الأعلى.']
  },

  // 13. starville acne prone skin facial cleanser 200 ml
  {
    id: 'starville-cleanser-acne-prone-200',
    name: 'starville acne prone skin facial cleanser 200 ml',
    genericName: 'Lauryl glucoside + Sulphur + Salicylic acid + Licorice extract (mix)',
    concentration: '200 ml',
    price: 125,
    matchKeywords: ['starville acne prone cleanser 200', 'ستارفيل acne prone', 'starville facial cleanser 200'],
    usage: 'غسول للبشرة المعرضة لحب الشباب.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كغسول.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 14. alejon acne cream 50 gm
  {
    id: 'alejon-acne-cream-50',
    name: 'alejon acne cream 50 gm',
    genericName: 'Salicylic acid + Lactic acid + Glycolic acid + Zinc pyrithione (mix)',
    concentration: '50 gm',
    price: 140,
    matchKeywords: ['alejon', 'اليجون', 'acne cream', 'salicylic', 'glycolic'],
    usage: 'كريم/مقشر موضعي للمساعدة في تقليل انسداد المسام وحبوب الوجه الخفيفة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر وتجنب الإفراط بالمقشرات.', 'تداخلات: التهيج يزيد مع ريتينويدات/بنزويل بيروكسيد.', 'تحذيرات: قد يسبب حرقان/تقشر—أوقفه عند تهيج شديد.']
  },

  // 15. starville facial cleanser gel for acne 400 ml
  {
    id: 'starville-cleanser-acne-400',
    name: 'starville facial cleanser gel for acne 400 ml',
    genericName: 'Lauryl glucoside + Sulphur + Salicylic acid + Licorice extract (mix)',
    concentration: '400 ml',
    price: 210,
    matchKeywords: ['starville cleanser acne 400', 'ستارفيل غسول 400'],
    usage: 'غسول للبشرة الدهنية/المعرضة للحبوب.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كغسول.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 16. melaakne serum 50 ml
  {
    id: 'melaakne-serum-50',
    name: 'melaakne serum 50 ml',
    genericName: 'Sulfur + Salicylic acid + D-panthenol + Almond oil + Vitamins (mix)',
    concentration: '50 ml',
    price: 90,
    matchKeywords: ['melaakne serum', 'ميلاكْني سيرم', 'melaakne', 'salicylic', 'sulfur'],
    usage: 'مستحضر موضعي للبشرة المعرضة للحبوب للمساعدة في تقليل اللمعان والالتهاب الخفيف.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Solution',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: تهيج زائد مع مقشرات/ريتينويد.', 'تحذيرات: أوقفه عند تهيج شديد.']
  },

  // 17. clindasol 1% topical gel 20 gm
  {
    id: 'adapalene-adapalene-gel-0-1-30',
    name: 'adapalene 0.1% gel 30 gm',
    genericName: 'Adapalene',
    concentration: '0.1%',
    price: 34,
    matchKeywords: ['adapalene 0.1', 'adapalene gel', 'ادابالين', 'حب شباب', 'acne', 'retinoid', 'ريتينويد', 'رؤوس سوداء', 'blackheads'],
    usage: 'ريتينويد موضعي لحب الشباب (الرؤوس السوداء/البيضاء) وتحسين انسداد المسام.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضَّل تجنبه.', 'تداخلات: التهيج يزيد مع المقشرات/الكحوليات.', 'تحذيرات: احمرار/تقشر بالبداية متوقع.']
  },

  // 19. agera acne cream 50 gm
  {
    id: 'agera-acne-cream-50',
    name: 'agera acne cream 50 gm',
    genericName: 'Nicotinamide + Tea tree oil + Aloe vera extract + Menthol (mix)',
    concentration: '50 gm',
    price: 159,
    matchKeywords: ['agera acne', 'اجيرا', 'niacinamide', 'tea tree'],
    usage: 'كريم مساعد للبشرة المعرضة للحبوب لتقليل اللمعان والاحمرار الخفيف.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: آمن غالباً موضعياً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يسبب لسعة/تهيج بسبب المنثول/الزيوت العطرية.']
  },

  // 20. iso-acnetin 20mg 30 caps
  {
    id: 'iso-acnetin-isotretinoin-20-30',
    name: 'iso-acnetin 20mg 30 caps',
    genericName: 'Isotretinoin',
    concentration: '20mg',
    price: 300,
    matchKeywords: ['iso-acnetin 20', 'ايزو-اكنتين', 'isotretinoin'],
    usage: 'إيزوتريتينوين فموي لحب الشباب الشديد (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: tetracyclines/Vit A.', 'تحذيرات: متابعة كبد/دهون وجفاف شديد.']
  },

  // 21. marpalene 0.1% topical cream 30 gm
  {
    id: 'marpalene-adapalene-cream-0-1-30',
    name: 'marpalene 0.1% topical cream 30 gm',
    genericName: 'Adapalene',
    concentration: '0.1%',
    price: 34,
    matchKeywords: ['marpalene', 'ماربالين', 'adapalene cream', 'adapalene', 'ادابالين', 'حب شباب', 'acne', 'retinoid', 'ريتينويد'],
    usage: 'أدابالين موضعي لعلاج حب الشباب.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضَّل تجنبه.', 'تداخلات: تهيج زائد مع المقشرات.', 'تحذيرات: جفاف/احمرار محتمل بالبداية.']
  },

  // 22. ivywonder acne gel 30gm
  {
    id: 'ivywonder-acne-gel-30',
    name: 'ivywonder acne gel 30gm',
    genericName: 'Benzoyl peroxide + Salicylic acid + Glycolic acid (mix)',
    concentration: '30 gm',
    price: 95,
    matchKeywords: ['ivywonder', 'ايفي وندر', 'benzoyl', 'salicylic', 'glycolic'],
    usage: 'جل موضعي لحب الشباب الخفيف إلى المتوسط (يساعد على تقليل البكتيريا وانسداد المسام).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر موضعياً.', 'تداخلات: يزداد التهيج مع ريتينويد/مقشرات أخرى.', 'تحذيرات: قد يسبب جفاف وتقشير—قلل التكرار عند الحاجة.']
  },

  // 23. acne-stop cream 30 gm
  {
    id: 'acne-stop-cream-30',
    name: 'acne-stop cream 30 gm',
    genericName: 'Oleanolic acid + NDGA (nordihydroguaiaretic acid) + (mix)',
    concentration: '30 gm',
    price: 68,
    matchKeywords: ['acne-stop', 'اكني ستوب', 'oil control'],
    usage: 'كريم مساعد لتنظيم الدهون وتقليل الحبوب الخفيفة حسب الاستجابة.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: آمن غالباً موضعياً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: أوقفه عند تهيج شديد.']
  },

  // 24. melaakne soap 50 gm
  {
    id: 'melaakne-soap-50',
    name: 'melaakne soap 50 gm',
    genericName: 'Sulfur + Salicylic acid + D-panthenol + Almond oil + (mix)',
    concentration: '50 gm',
    price: 60,
    matchKeywords: ['melaakne soap', 'ميلاكْني صابون', 'sulfur', 'salicylic'],
    usage: 'منظف/صابونة للبشرة الدهنية والمعرضة للحبوب.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كمنظف يُشطف.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يزيد الجفاف مع علاجات حب الشباب الأخرى.']
  },

  // 25. clinvex topical lotion 60 ml
  {
    id: 'clinvex-lotion-60',
    name: 'clinvex topical lotion 60 ml',
    genericName: 'Tea tree oil + Salicylic acid + Triclosan + Aloe vera extract (mix)',
    concentration: '60 ml',
    price: 80,
    matchKeywords: ['clinvex', 'كلينفكس', 'lotion acne', 'salicylic'],
    usage: 'لوشن موضعي للبشرة المعرضة للحبوب للمساعدة في تقليل الدهون والبثور السطحية.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Lotion',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يسبب تهيجاً بسبب الأحماض/الزيوت العطرية.']
  },

  // 26. melaakne cream 30gm
  {
    id: 'melaakne-cream-30',
    name: 'melaakne cream 30gm',
    genericName: 'Sulfur + Salicylic acid + D-panthenol + Almond oil + Vitamins (mix)',
    concentration: '30 gm',
    price: 60,
    matchKeywords: ['melaakne cream', 'ميلاكْني كريم'],
    usage: 'كريم موضعي مساعد للبشرة المعرضة للحبوب.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: لا تُتوقع.', 'تحذيرات: تهيج/جفاف محتمل.']
  },

  // 27. dapsocyrl 5 % topical gel 30 gm
  {
    id: 'dapsocyrl-dapsone-gel-5-30',
    name: 'dapsocyrl 5 % topical gel 30 gm',
    genericName: 'Dapsone',
    concentration: '5%',
    price: 119,
    matchKeywords: ['dapsocyrl', 'دابسوثيرل', 'dapsone gel', 'دابسون', 'حب شباب', 'acne', 'inflammatory acne', 'حب شباب التهابي'],
    usage: 'دابسون موضعي لعلاج حب الشباب الالتهابي (يستخدم حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: [
      'الحمل: يُستخدم فقط إذا اقتضى التشخيص.',
      'تداخلات: مع بنزويل بيروكسيد قد يحدث تغير لون مؤقت للجلد/الشعر (اصفرار/برتقالي) — يُفصل أو حسب التشخيص والحالة.',
      'تحذيرات خاصة: خطر نادر لميتهيموغلوبينية/انحلال دم خصوصاً مع نقص G6PD — أعد التقييم عند زرقة/ضيق نفس/إرهاق شديد.'
    ]
  },

  // 28. iso-acnetin 10mg 30 caps
  {
    id: 'iso-acnetin-isotretinoin-10-30',
    name: 'iso-acnetin 10mg 30 caps',
    genericName: 'Isotretinoin',
    concentration: '10mg',
    price: 162,
    matchKeywords: ['iso-acnetin 10', 'ايزو-اكنتين 10', 'isotretinoin'],
    usage: 'إيزوتريتينوين فموي لحب الشباب الشديد (حسب التشخيص).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: (weight: number) => `0.5–1 مجم/كجم/يوم. مثال: ${weight} كجم ⇒ ${Math.round(weight * 0.5)}–${Math.round(weight * 1)} مجم/يوم.`,
    warnings: ['الحمل: ممنوع تماماً.', 'تداخلات: tetracyclines/Vit A.', 'تحذيرات: جفاف ومتابعة كبد/دهون.']
  },

  // 29. sacnel cream 30 gm
  {
    id: 'sacnel-cream-30',
    name: 'sacnel cream 30 gm',
    genericName: 'Salicylic acid + Triclosan + Allantoin (mix)',
    concentration: '30 gm',
    price: 60,
    matchKeywords: ['sacnel', 'ساكنيل', 'salicylic', 'triclosan'],
    usage: 'كريم موضعي للبشرة الدهنية والمساعدة في تقليل الحبوب السطحية.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 30. wealthy topical lotion 120 ml
  {
    id: 'wealthy-lotion-120',
    name: 'wealthy topical lotion 120 ml',
    genericName: 'Aqua + Sodium C14-C16 olefin sulfonate + Cocamidopropyl betaine (mix)',
    concentration: '120 ml',
    price: 150,
    matchKeywords: ['wealthy lotion', 'ويلثي', 'acne lotion'],
    usage: 'لوشن/منظف مساعد للبشرة الدهنية والمعرضة للحبوب.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Lotion',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: آمن غالباً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: تهيج جلدي محتمل.']
  },

  // 31. acnevera soap 80 gm
  {
    id: 'acnevera-cleanser-80',
    name: 'acnevera soap 80 gm',
    genericName: 'Aloe vera + Zinc oxide + Salicylic acid + Sulphur + Resorcinol',
    concentration: '80 gm',
    price: 55,
    matchKeywords: ['acnevera', 'اكنيفيرا', 'soap acne', 'salicylic', 'sulphur'],
    usage: 'صابونة/منظف للبشرة الدهنية والمعرضة لحب الشباب.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كمنظف.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يسبب جفاف/تهيج.']
  },

  // 32. acniact topical gel 15 gm
  {
    id: 'acniact-adapalene-bpo-gel-15',
    name: 'acniact topical gel 15 gm',
    genericName: 'Adapalene + Benzoyl peroxide',
    concentration: '15 gm',
    price: 39,
    matchKeywords: ['acniact', 'اكنياكت', 'adapalene bpo', 'benzoyl peroxide', 'adapalene', 'ادابالين', 'حب شباب', 'acne'],
    usage: 'علاج مركب موضعي لحب الشباب الخفيف إلى المتوسط.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضَّل تجنبه.', 'تداخلات: تجنب استخدام مقشرات قوية معه لتقليل التهيج.', 'تحذيرات: احمرار/حرقان/تقشر بالبداية متوقع.']
  },

  // 33. top touch acne cream 30 gm
  {
    id: 'top-touch-acne-cream-30',
    name: 'top touch acne cream 30 gm',
    genericName: 'Ivermectin + Lactic acid + Salicylic acid + Zinc pyrithione (mix)',
    concentration: '30 gm',
    price: 150,
    matchKeywords: ['top touch acne', 'توب تاتش', 'ivermectin', 'salicylic'],
    usage: 'كريم موضعي للبشرة المعرضة للحبوب/الالتهاب حسب البروتوكول.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُستخدم فقط بعد تقييم الفائدة والخطر.', 'تداخلات: تهيج زائد مع مقشرات أخرى.', 'تحذيرات: أوقفه عند تهيج شديد.']
  },

  // 34. dimicap cream 50 gm
  {
    id: 'dimicap-cream-50',
    name: 'dimicap cream 50 gm',
    genericName: 'Triclosan + Panthenol + Salicylic acid + Tocopherol (mix)',
    concentration: '50 gm',
    price: 102.7,
    matchKeywords: ['dimicap', 'ديمي كاب', 'salicylic'],
    usage: 'كريم مساعد للبشرة الدهنية والحبوب السطحية.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً موضعياً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 35. hunter cream 50 gm
  {
    id: 'hunter-cream-50',
    name: 'hunter cream 50 gm',
    genericName: 'Thymol + Triclosan + Chlorhexidine + Glycerin (mix)',
    concentration: '50 gm',
    price: 130,
    matchKeywords: ['hunter cream', 'هانتر كريم', 'chlorhexidine'],
    usage: 'كريم/مطهر موضعي مساعد للحبوب السطحية والجلد الدهني.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: آمن غالباً موضعياً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يسبب تهيجاً/حساسية من المطهرات.']
  },

  // 36. lamivex acne gel 50 gm
  {
    id: 'lamivex-acne-gel-50',
    name: 'lamivex acne gel 50 gm',
    genericName: 'Lactic acid + Glycolic acid + Chlorhexidine + Sulphur + Retinoids (mix)',
    concentration: '50 gm',
    price: 110,
    matchKeywords: ['lamivex', 'لاميفكس', 'acne gel', 'glycolic'],
    usage: 'جل مقشر/منظم للدهون للبشرة المعرضة للحبوب حسب التحمل.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر وقد يُفضَّل تجنبه إذا احتوى ريتينويد.', 'تداخلات: يزيد التهيج مع ريتينويد/بنزويل بيروكسيد.', 'تحذيرات: احمرار/حرقان محتمل.']
  },

  // 37. prettier exfoliating soap 100 gm
  {
    id: 'prettier-exfoliating-cleanser-100',
    name: 'prettier exfoliating soap 100 gm',
    genericName: 'Salicylic acid + Liquorice + Retinol + Vitamin C + Collagen (mix)',
    concentration: '100 gm',
    price: 75,
    matchKeywords: ['prettier exfoliating soap', 'بريتيير صابون', 'salicylic', 'retinol'],
    usage: 'صابونة/منظف مقشر للبشرة المعرضة للحبوب.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُفضَّل تجنب المنتجات المحتوية على ريتينول أثناء الحمل.', 'تداخلات: جفاف زائد مع علاجات حب الشباب الأخرى.', 'تحذيرات: تهيج محتمل.']
  },

  // 38. prettier foaming gel 200ml
  {
    id: 'prettier-foaming-gel-200',
    name: 'prettier foaming gel 200ml',
    genericName: 'Sodium sulfate + Cocamidopropyl betaine + (mix)',
    concentration: '200 ml',
    price: 115,
    matchKeywords: ['prettier foaming gel', 'بريتيير غسول', 'foaming gel'],
    usage: 'غسول رغوي للبشرة الدهنية والمعرضة للحبوب.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 39. sebanoin acne gel 15 gm
  {
    id: 'vulga-cream-30',
    name: 'vulga cream 30 gm',
    genericName: 'Glycolic acid + Tea tree oil + Vitamin A + Aloe vera + Liquorice (mix)',
    concentration: '30 gm',
    price: 75,
    matchKeywords: ['vulga', 'فولجا', 'glycolic', 'tea tree'],
    usage: 'كريم مساعد لتقليل آثار الحبوب وتنظيم الدهون/تقشير خفيف حسب التحمل.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُفضّل تجنب مشتقات فيتامين A الموضعية أثناء الحمل.', 'تداخلات: يزداد التهيج مع مقشرات/ريتينويد.', 'تحذيرات: تهيج/احمرار محتمل.']
  },

  // 41. tellajo cream 60 gm
  {
    id: 'tellajo-cream-60',
    name: 'tellajo cream 60 gm',
    genericName: 'Tea tree oil + Salicylic acid + Vitamins A + Vitamins C + (mix)',
    concentration: '60 gm',
    price: 130,
    matchKeywords: ['tellajo', 'تيلاجو', 'salicylic', 'tea tree'],
    usage: 'كريم عناية للبشرة المعرضة للحبوب.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُفضّل تجنب مشتقات فيتامين A الموضعية أثناء الحمل.', 'تداخلات: لا تُتوقع.', 'تحذيرات: تهيج محتمل بسبب الأحماض/الزيوت.']
  },

  // 42. derm clear gel 35 gm
  {
    id: 'derm-clear-gel-35',
    name: 'derm clear gel 35 gm',
    genericName: 'Panthenol + Salicylic acid + Sulpher + Thyme oil + Lavender (mix)',
    concentration: '35 gm',
    price: 95,
    matchKeywords: ['derm clear', 'ديرم كلير', 'salicylic', 'sulfur'],
    usage: 'جل موضعي مساعد للحبوب الخفيفة وتنظيم الدهون.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: لا تُتوقع.', 'تحذيرات: حساسية من الزيوت العطرية ممكنة.']
  },

  // 43. dermovera topical lotion 35ml
  {
    id: 'dermovera-lotion-35',
    name: 'dermovera topical lotion 35ml',
    genericName: 'Tea tree oil + Triclosan + Aloe vera + Zinc oxide + Salicylic acid (mix)',
    concentration: '35 ml',
    price: 60,
    matchKeywords: ['dermovera 35', 'ديرموفيرا 35', 'lotion acne'],
    usage: 'لوشن موضعي للبشرة الدهنية والمعرضة للحبوب.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Lotion',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 44. dermovera topical lotion 60ml
  {
    id: 'dermovera-lotion-60',
    name: 'dermovera topical lotion 60ml',
    genericName: 'Tea tree oil + Triclosan + Aloe vera + Zinc oxide + Salicylic acid (mix)',
    concentration: '60 ml',
    price: 75,
    matchKeywords: ['dermovera 60', 'ديرموفيرا 60', 'lotion acne'],
    usage: 'لوشن موضعي للبشرة المعرضة لحب الشباب.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Lotion',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: لا تُتوقع.', 'تحذيرات: تهيج محتمل.']
  },

  // 45. parzex 75gm soap
  {
    id: 'parzex-cleanser-75',
    name: 'parzex 75gm soap',
    genericName: 'Zinc oxide + Salicylic acid + Algae extract + Tea tree oil + (mix)',
    concentration: '75 gm',
    price: 60,
    matchKeywords: ['parzex', 'بارزيكس', 'soap acne', 'salicylic'],
    usage: 'صابونة/منظف للبشرة الدهنية والمعرضة للحبوب.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كمنظف.', 'تداخلات: لا تُتوقع.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 46. randapalene 0.1% gel 30 gm
  {
    id: 'randapalene-adapalene-gel-0-1-30',
    name: 'randapalene 0.1% gel 30 gm',
    genericName: 'Adapalene',
    concentration: '0.1%',
    price: 38,
    matchKeywords: ['randapalene', 'راندابالين', 'adapalene gel 0.1'],
    usage: 'أدابالين موضعي لعلاج حب الشباب.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضَّل تجنبه.', 'تداخلات: التهيج يزيد مع المقشرات.', 'تحذيرات: جفاف/تقشر بالبداية متوقع.']
  },

  // 47. acne free 0.05% cream 30 gm
  {
    id: 'acne-free-tretinoin-0-05-30',
    name: 'acne free 0.05% cream 30 gm',
    genericName: 'Tretinoin',
    concentration: '0.05%',
    price: 27,
    matchKeywords: ['acne free 0.05', 'acne free tretinoin', 'اكْني فري'],
    usage: 'تريتينوين موضعي لعلاج حب الشباب (تركيز 0.05%).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضَّل تجنبه.', 'تداخلات: تهيج زائد مع المقشرات/بنزويل بيروكسيد.', 'تحذيرات: حساسية للشمس/تقشر.']
  },

  // 48. adagel 0.1% topical gel. 30 gm
  {
    id: 'adagel-adapalene-gel-0-1-30',
    name: 'adagel 0.1% topical gel. 30 gm',
    genericName: 'Adapalene',
    concentration: '0.1%',
    price: 34,
    matchKeywords: ['adagel', 'اداجيل', 'adapalene 0.1'],
    usage: 'أدابالين موضعي لعلاج حب الشباب.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضَّل تجنبه.', 'تداخلات: التهيج يزيد مع المقشرات.', 'تحذيرات: جفاف/تقشر بالبداية متوقع.']
  },

  // 49. tramozal 50 gm gel
  {
    id: 'tramozal-gel-50',
    name: 'tramozal 50 gm gel',
    genericName: 'Benzoyl peroxide + Azelaic acid + Glycolic acid + Salicylic acid (mix)',
    concentration: '50 gm',
    price: 105,
    matchKeywords: ['tramozal', 'تراموزال', 'benzoyl', 'azelaic', 'salicylic'],
    usage: 'جل موضعي لحب الشباب وتصبغات ما بعد الحبوب (حسب التركيبة والتحمل).',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: تهيج زائد مع ريتينويد/مقشرات أخرى.', 'تحذيرات: جفاف/حرقان محتمل.']
  },

  // 50. econet cream 60 gm
  {
    id: 'econet-cream-60',
    name: 'econet cream 60 gm',
    genericName: 'Triethanolamine + Olive oil + Liquorice + Retinol + Biotin (mix)',
    concentration: '60 gm',
    price: 145,
    matchKeywords: ['econet', 'ايكونيت', 'retinol', 'liquorice'],
    usage: 'كريم عناية للبشرة المعرضة للحبوب/آثار الحبوب حسب التحمل.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: يُفضّل تجنب المنتجات التي تحتوي ريتينول أثناء الحمل.', 'تداخلات: تهيج زائد مع مقشرات أخرى.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 51. ilia gel 60 gm
  {
    id: 'ilia-gel-60',
    name: 'ilia gel 60 gm',
    genericName: 'Chlorhexidine + Chamomile + D-panthenol + Aloe vera + Tea tree (mix)',
    concentration: '60 gm',
    price: 120,
    matchKeywords: ['ilia gel', 'ايليا جل', 'chlorhexidine', 'tea tree'],
    usage: 'جل موضعي مساعد للحبوب السطحية والتهيج الخفيف.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Gel',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: آمن غالباً موضعياً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: حساسية من المطهرات ممكنة.']
  },

  // 52. sector acne prone skin lotion 120 gm
  {
    id: 'sector-lotion-120',
    name: 'sector acne prone skin lotion 120 gm',
    genericName: 'Salicylic acid + Tea tree oil + Vitamin A + Vitamin E + Chamomile (mix)',
    concentration: '120 gm',
    price: 175,
    matchKeywords: ['sector acne lotion', 'سيكتور', 'salicylic', 'tea tree'],
    usage: 'لوشن للبشرة المعرضة للحبوب للمساعدة في تقليل الدهون.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.ANTI_ACNE,
    form: 'Lotion',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['الحمل: يُفضّل تجنب مشتقات فيتامين A الموضعية أثناء الحمل.', 'تداخلات: تهيج زائد مع مقشرات أخرى.', 'تحذيرات: جفاف/تهيج محتمل.']
  },

  // 53. synobar-b clarifying gel 100 ml
  {
    id: 'synobar-b-clarifying-gel-100',
    name: 'synobar-b clarifying gel 100 ml',
    genericName: 'Tea tree oil + Irgasan (triclosan) + Lavandula oily extract + Wheat (mix)',
    concentration: '100 ml',
    price: 220,
    matchKeywords: ['synobar-b', 'سينوبار', 'clarifying gel', 'tea tree'],
    usage: 'جل/منظف للبشرة الدهنية والمعرضة للحبوب.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً.', 'تداخلات: لا تُتوقع.', 'تحذيرات: تهيج محتمل من الزيوت العطرية.']
  },

  // 54. clearsal acne cleanser 200 ml
  {
    id: 'clearsal-cleanser-200',
    name: 'clearsal acne cleanser 200 ml',
    genericName: 'Jojoba oil + Salicylic acid + Aloe vera + BHT + Caffeine + Panthenol (mix)',
    concentration: '200 ml',
    price: 160,
    matchKeywords: ['clearsal', 'كليرسال', 'acne cleanser', 'salicylic'],
    usage: 'غسول للبشرة المعرضة للحبوب وتنظيم الدهون.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كغسول.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يسبب جفافاً مع العلاجات الأخرى.']
  },

  // 55. melano acne soap 100 gm
  {
    id: 'melano-acne-cleanser-100',
    name: 'melano acne soap 100 gm',
    genericName: 'Salicylic acid + Tea tree extract + Kojic acid + Glycolic acid + Vitamins (mix)',
    concentration: '100 gm',
    price: 60,
    matchKeywords: ['melano acne soap', 'ميلانو صابون', 'kojic', 'salicylic'],
    usage: 'صابونة/منظف للبشرة المعرضة للحبوب مع مكونات للتفتيح الخفيف لآثار الحبوب.',
    timing: 'مرة–مرتين يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cleanser',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: آمن غالباً كمنظف يُشطف.', 'تداخلات: لا تُتوقع.', 'تحذيرات: قد يسبب جفاف/تهيج.']
  },

  // 56. baimiss cream 40 gm
  {
    id: 'baimiss-cream-40',
    name: 'baimiss cream 40 gm',
    genericName: 'Salicylic acid + Glycolic acid + Tea tree oil + Panthenol + (mix)',
    concentration: '40 gm',
    price: 125,
    matchKeywords: ['baimiss', 'بايميس', 'salicylic', 'glycolic'],
    usage: 'كريم/مقشر خفيف للبشرة المعرضة للحبوب حسب التحمل.',
    timing: '١–٢ مرة يومياً',
    category: Category.ANTI_ACNE,
    form: 'Cream',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُستخدم بحذر.', 'تداخلات: تهيج زائد مع ريتينويد/أحماض أخرى.', 'تحذيرات: جفاف/تهيج محتمل.']
  },
];

