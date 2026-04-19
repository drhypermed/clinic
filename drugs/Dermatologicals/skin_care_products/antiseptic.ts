import { Medication, Category } from '../../../types';

const TAGS = {
  antiseptics: ['antiseptics', '#antiseptics', 'antiseptic', 'مطهر', 'تعقيم'],
  urinary: ['urinary', '#urinary', 'مسالك بولية', 'حصوات', 'مغص كلوي'],
  analgesics: ['analgesics', '#analgesics', 'مسكن', 'مغص'],
  mouthWash: ['oral mouth wash', '#oral mouth wash', 'mouth wash', 'mouthwash', 'غسول فم', 'مضمضة'],
  antiInflammatory: ['anti-inflammatory', '#anti-inflammatory', 'مضاد التهاب'],
};

export const ANTISEPTIC_MEDS: Medication[] = [
  // ==================
  // ANTISEPTICS
  // ==================

  // 1. hexitol 1.25mg/ml mouth wash 100 ml
  {
    id: 'hexitol-chlorhexidine-mouthwash-100',
    name: 'hexitol 1.25mg/ml mouth wash 100 ml',
    genericName: 'Chlorhexidine',
    concentration: '1.25mg/ml',
    price: 49.9,
    matchKeywords: ['hexitol', 'هيكسيتول', 'chlorhexidine', ...TAGS.antiseptics, ...TAGS.mouthWash],
    usage: 'غسول فم مطهر (كلورهكسيدين) لالتهاب اللثة ورائحة الفم وبعد إجراءات الأسنان حسب الإرشادات.',
    timing: 'مرة–مرتين يومياً',
    category: Category.MOUTH_THROAT,
    form: 'Mouthwash',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['لا يُستخدم للأطفال غير القادرين على البصق.', 'قد يسبب تغير طعم/تصبغ الأسنان.']
  },

  // 2. rowatinex 45 capsules
  {
    id: 'rowatinex-45-caps',
    name: 'rowatinex 45 capsules',
    genericName: 'Anethol + Borneol + Camphene + Cineole + Ethaverine + Fenchone',
    concentration: '45 capsules',
    price: 93,
    matchKeywords: ['rowatinex', 'رواتينكس', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'مستحضر للمسالك البولية للمساعدة في المغص وتسهيل خروج الحصوات؛ كبسولة ٣ مرات يومياً قبل الأكل مع سوائل كثيرة (الجرعة حسب الحالة).',
    timing: '٣ مرات يومياً قبل الأكل.',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة ٣ مرات يومياً قبل الأكل. اشرب سوائل كثيرة.',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ قلّل المدة.', 'ألم شديد/حمى/دم غزير بالبول: أوقف وأعد التقييم (استبعاد انسداد، عدوى، مرجعية).']
  },

  // 3. urinex 24 caps
  {
    id: 'urinex-24-caps',
    name: 'urinex 24 caps',
    genericName: 'Alpha pinene + Borneol + Fenchone + Anethol + Cineol + Camphene',
    concentration: '24 caps',
    price: 44,
    matchKeywords: ['urinex', 'يورينكس', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'كبسولات للمسالك البولية لتخفيف المغص والمساعدة في مشاكل الحصوات حسب الحالة.',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'كبسولة واحدة ٣ مرات يومياً. اشرب سوائل كثيرة.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 4. urivin n 10 eff. sachets
  {
    id: 'urivin-n-eff-sachets-10',
    name: 'urivin n 10 eff. sachets',
    genericName: 'Piperazine citrate + Colchicine + Khellin',
    concentration: '10 sachets',
    price: 31,
    matchKeywords: ['urivin n', 'يوريفين', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'فوار للمسالك البولية للمساعدة في المغص/الأعراض؛ كيس ٢–٣ مرات يومياً بعد الأكل مع سوائل كثيرة (الجرعة حسب الحالة).',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يُذاب في نصف كوب ماء ٢–٣ مرات يومياً بعد الأكل. اشرب سوائل كثيرة.',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط.', 'ألم شديد/قيء/حمى: أوقف وأعد التقييم.']
  },

  // 5. betadine vaginal douche 10% 120 ml
  {
    id: 'betadine-vaginal-douche-10-120',
    name: 'betadine vaginal douche 10% 120 ml',
    genericName: 'Povidone iodine',
    concentration: '10%',
    price: 80,
    matchKeywords: ['betadine', 'بيتادين', 'vaginal douche', 'douche', 'povidone iodine', ...TAGS.antiseptics],
    usage: 'محلول مطهر للاستعمال المهبلي؛ محلول مخفف (٢–٣ ملاعق في حوض ماء فاتر) كغسول مهبلي خارجي ١–٢ مرات يومياً لفترة محدودة.',
    timing: 'مرة–مرتين يومياً',
    category: Category.DERMA_CARE,
    form: 'Solution',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط؛ فترة محدودة.', 'أمراض الغدة الدرقية: الحذر.']
  },

  // 6. proximol 0.4mg 40 sugar c.tabs.
  {
    id: 'proximol-proximadiol-0-4-40-tabs',
    name: 'proximol 0.4mg 40 sugar c.tabs.',
    genericName: 'Proximadiol',
    concentration: '0.4mg',
    price: 34,
    matchKeywords: ['proximol', 'بروكسيمول', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'أقراص للمسالك البولية للمساعدة في أعراض الحصوات/المغص؛ قرص ٣ مرات يومياً حسب الحالة.',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Sugar Coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'قرص واحد (٠.٤ مجم) ٣ مرات يومياً. اشرب سوائل كثيرة.',
    warnings: ['الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.']
  },

  // 7. uricol 6 eff. gr. in sachets
  {
    id: 'uricol-eff-sachets-6',
    name: 'uricol 6 eff. gr. in sachets',
    genericName: 'Hexamine + Khellin + Piperazine',
    concentration: '6 sachets',
    price: 21,
    matchKeywords: ['uricol', 'يوريكول', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'فوار للمسالك البولية للمساعدة في الأعراض؛ كيس ٢–٣ مرات يومياً مع سوائل كثيرة (الجرعة حسب الحالة).',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يُذاب في كوب ماء ٢–٣ مرات يومياً. يُفضّل مع الوجبات. اشرب سوائل كثيرة.',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط.']
  },

  // 8. azor topical liquid 100 ml
  {
    id: 'azor-topical-liquid-100',
    name: 'azor topical liquid 100 ml',
    genericName: 'Alcohol + Salicylic acid + Vitamin A + Glycerin + Tea tree oil',
    concentration: '100 ml',
    price: 65,
    matchKeywords: ['azor', 'ازور', 'tea tree', 'salicylic', 'topical liquid', ...TAGS.antiseptics],
    usage: 'محلول موضعي مطهر/منظف للجلد حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.TOPICAL_CARE,
    form: 'Solution',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['قابل للاشتعال. بعيداً عن النار.', 'قد يسبب تهيجاً للبشرة الحساسة.']
  },

  // 9. betadine antiseptic soln. 10% 120 ml
  {
    id: 'betadine-antiseptic-soln-10-120',
    name: 'betadine antiseptic soln. 10% 120 ml',
    genericName: 'Povidone iodine',
    concentration: '10%',
    price: 80,
    matchKeywords: ['betadine', 'بيتادين', 'povidone iodine', 'antiseptic solution', ...TAGS.antiseptics],
    usage: 'محلول مطهر للجلد والجروح السطحية حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.FIRST_AID,
    form: 'Solution',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['حساسية اليود/أمراض الغدة الدرقية: يُتجنب أو يُستخدم بحذر.', 'تجنب العينين.']
  },

  // 10. betadine antiseptic soln. 10% 60 ml
  {
    id: 'betadine-antiseptic-soln-10-60',
    name: 'betadine antiseptic soln. 10% 60 ml',
    genericName: 'Povidone iodine',
    concentration: '10%',
    price: 55,
    matchKeywords: ['betadine 60', 'بيتادين 60', ...TAGS.antiseptics],
    usage: 'نفس بيتادين محلول مطهر (عبوة أصغر).',
    timing: 'حسب الحاجة',
    category: Category.FIRST_AID,
    form: 'Solution',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['حساسية اليود/الغدة الدرقية: الحذر.']
  },

  // 11. albothyl 90mg 8 vag. supp
  {
    id: 'albothyl-policresulen-90mg-8-vag-supp',
    name: 'albothyl 90mg 8 vag. supp',
    genericName: 'Policresulen',
    concentration: '90mg',
    price: 64,
    matchKeywords: ['albothyl', 'البوثيل', 'policresulen', 'vaginal', ...TAGS.antiseptics],
    usage: 'لبوس مهبلي مطهر/علاجي؛ لبوسة ٩٠ مجم مهبلية مساءً لمدة ٦–٨ أيام (المدة حسب التشخيص).',
    timing: 'ليلاً',
    category: Category.DERMA_CARE,
    form: 'Suppository',
    minAgeMonths: 180,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: () => 'لبوسة مهبلية ليلاً لمدة ٣–٧ أيام حسب البروتوكول',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط.', 'قد يسبب تهيجاً موضعياً.']
  },

  // 12. betadine shampoo 7.5% 60 ml
  {
    id: 'betadine-shampoo-7-5-60',
    name: 'betadine shampoo 7.5% 60 ml',
    genericName: 'Povidone- iodine',
    concentration: '7.5%',
    price: 55,
    matchKeywords: ['betadine shampoo', 'بيتادين شامبو', ...TAGS.antiseptics],
    usage: 'منظف/مطهر جلدي (شامبو/غسول) حسب الاستعمال.',
    timing: '٢–٣ مرات أسبوعياً – ٤ أسابيع',
    category: Category.SKIN_CARE,
    form: 'Cleanser',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُدلَّك في فروة الرأس ٥ دقائق ثم يُشطف ٢–٣ مرات أسبوعياً لمدة ٤ أسابيع',
    warnings: ['حساسية اليود/الغدة الدرقية: الحذر.']
  },

  // 13. betadine shampoo 7.5% 120 ml
  {
    id: 'betadine-shampoo-7-5-120',
    name: 'betadine shampoo 7.5% 120 ml',
    genericName: 'Povidone iodine',
    concentration: '7.5%',
    price: 90,
    matchKeywords: ['betadine shampoo 120', 'بيتادين شامبو 120', ...TAGS.antiseptics],
    usage: 'نفس بيتادين شامبو (عبوة أكبر).',
    timing: '٢–٣ مرات أسبوعياً – ٤ أسابيع',
    category: Category.SKIN_CARE,
    form: 'Cleanser',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُدلَّك في فروة الرأس ٥ دقائق ثم يُشطف ٢–٣ مرات أسبوعياً لمدة ٤ أسابيع',
    warnings: ['حساسية اليود: الحذر.']
  },

  // 14. coli-urinal eff. gr. 60 gm
  {
    id: 'coli-urinal-eff-gr-60',
    name: 'coli-urinal eff. gr. 60 gm',
    genericName: 'Hexamine + Khellin + Piperazine',
    concentration: '60 gm',
    price: 40,
    matchKeywords: ['coli-urinal', 'كولي يورينال', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'حبيبات فوارة للمسالك البولية؛ ملعقة صغيرة أو مقدار مخصص ٢–٣ مرات يومياً مع سوائل كثيرة (الجرعة حسب الحالة).',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Granules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'ملعقة صغيرة (أو مقدار العبوة المخصص) تُذاب في كوب ماء ٢–٣ مرات يومياً. اشرب سوائل كثيرة.',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط.']
  },

  // 15. betadine antiseptic solution 1 litre
  {
    id: 'betadine-antiseptic-solution-10-1l',
    name: 'betadine antiseptic solution 1 litre',
    genericName: 'Povidone iodine',
    concentration: '1 litre',
    price: 475,
    matchKeywords: ['betadine 1 litre', 'بيتادين 1 لتر', ...TAGS.antiseptics],
    usage: 'بيتادين محلول مطهر (عبوة كبيرة) للاستخدام الموضعي.',
    timing: 'حسب الحاجة',
    category: Category.FIRST_AID,
    form: 'Solution',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['حساسية اليود/الغدة الدرقية: الحذر.']
  },

  // 16. betadine skin cleanser 7.5% 120 ml
  {
    id: 'betadine-skin-cleanser-7-5-120',
    name: 'betadine skin cleanser 7.5% 120 ml',
    genericName: 'Povidone- iodine',
    concentration: '7.5%',
    price: 90,
    matchKeywords: ['betadine skin cleanser', 'بيتادين منظف', ...TAGS.antiseptics],
    usage: 'منظف/مطهر للجلد قبل الإجراءات أو حسب الحاجة.',
    timing: 'مرة–مرتين يومياً',
    category: Category.SKIN_CARE,
    form: 'Cleanser',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['حساسية اليود: الحذر.']
  },

  // 17. betadine surgical scrub 7.5% 120 ml
  {
    id: 'betadine-surgical-scrub-7-5-120',
    name: 'betadine surgical scrub 7.5% 120 ml',
    genericName: 'Povidone- iodine',
    concentration: '7.5%',
    price: 90,
    matchKeywords: ['betadine surgical scrub', 'بيتادين سكرب', ...TAGS.antiseptics],
    usage: 'منظف مطهر (Scrub) للجلد قبل الإجراءات الطبية/الجراحية حسب الاستخدام.',
    timing: 'مرة–مرتين يومياً',
    category: Category.FIRST_AID,
    form: 'Cleanser',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['حساسية اليود/الغدة الدرقية: الحذر.']
  },

  // 18. cordo - c spray 60 ml
  {
    id: 'cordo-c-spray-60',
    name: 'cordo - c spray 60 ml',
    genericName: 'Alcohol + Salicylic acid + Vitamin A + Glycerin + Propylene glycol',
    concentration: '60 ml',
    price: 75,
    matchKeywords: ['cordo c', 'كوردو سي', 'spray', 'salicylic', ...TAGS.antiseptics],
    usage: 'سبراي موضعي مطهر/منظف حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.TOPICAL_CARE,
    form: 'Spray',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['قابل للاشتعال. بعيداً عن النار.', 'قد يسبب جفافاً/تهيجاً.']
  },

  // 19. renal-s 12 sachet
  {
    id: 'renal-s-12-sachet',
    name: 'renal-s 12 sachet',
    genericName: 'Hexamine + Khellin',
    concentration: '12 sachet',
    price: 21,
    matchKeywords: ['renal-s', 'رينال اس', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'أكياس للمسالك البولية؛ كيس ٢–٣ مرات يومياً مع سوائل كثيرة (الجرعة حسب الحالة).',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يُذاب في كوب ماء ٢–٣ مرات يومياً. اشرب سوائل كثيرة.',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط.']
  },

  // 20. umbilix spray 70ml
  {
    id: 'umbilix-spray-70',
    name: 'umbilix spray 70ml',
    genericName: 'Ethanol + Panthenol + Salicylic acid + Chamomile extract + Potassium alum',
    concentration: '70ml',
    price: 55,
    matchKeywords: ['umbilix', 'امبيلكس', 'spray', 'panthenol', ...TAGS.antiseptics],
    usage: 'سبراي مطهر/منظف موضعي للجلد حسب الحاجة.',
    timing: '١–٢ مرة يومياً',
    category: Category.FIRST_AID,
    form: 'Spray',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['قابل للاشتعال. بعيداً عن النار.', 'قد يسبب لسعاً إذا وُضع على جلد متشقق.']
  },

  // 21. cordo plus spray 60 ml
  {
    id: 'cordo-plus-spray-60',
    name: 'cordo plus spray 60 ml',
    genericName: 'Alcohol + Allantoin + Glycerin + Licorice ex. + Propylene glycol + Vitamin A + Vitamin E',
    concentration: '60 ml',
    price: 75,
    matchKeywords: ['cordo plus', 'كوردو بلس', 'spray', 'allantoin', ...TAGS.antiseptics],
    usage: 'سبراي موضعي مطهر/منظف مع مكونات مهدئة.',
    timing: 'حسب الحاجة',
    category: Category.TOPICAL_CARE,
    form: 'Spray',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['قابل للاشتعال.', 'قد يسبب تهيجاً لمن لديهم حساسية.']
  },

  // 22. renal s-n 12 sachet
  {
    id: 'renal-s-n-12-sachet',
    name: 'renal s-n 12 sachet',
    genericName: 'Hexamine + Khellin',
    concentration: '12 sachet',
    price: 30,
    matchKeywords: ['renal s-n', 'renal sn', 'رينال اس ان', ...TAGS.urinary, ...TAGS.analgesics, ...TAGS.antiseptics],
    usage: 'أكياس للمسالك البولية (صيغة/سعر مختلف)؛ كيس ٢–٣ مرات يومياً مع سوائل كثيرة (الجرعة حسب الحالة).',
    timing: '٣ مرات يومياً.',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'كيس واحد يُذاب في كوب ماء ٢–٣ مرات يومياً. اشرب سوائل كثيرة.',
    warnings: ['الحمل: يُستخدم عند الضرورة فقط.']
  },

  // 23. rivasine care antiseptic sol. 60 ml
  {
    id: 'rivasine-care-antiseptic-sol-60',
    name: 'rivasine care antiseptic sol. 60 ml',
    genericName: 'Chlorhexidine + Triclosan + Chamomile extract + Thymol + Menthol + Betaine',
    concentration: '60 ml',
    price: 15,
    matchKeywords: ['rivasine', 'ريفاسين', 'chlorhexidine', 'triclosan', ...TAGS.antiseptics],
    usage: 'محلول مطهر موضعي للجلد حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.TOPICAL_CARE,
    form: 'Solution',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['قد يسبب جفافاً/تهيجاً.']
  },

  // 24. solo sept foamin skin cleanser 14 sachets x 10 ...
  {
    id: 'solo-sept-foamin-cleanser-14-sachets',
    name: 'solo sept foamin skin cleanser 14 sachets x 10 ...',
    genericName: 'Chlorhexidine + Hexamine + Chlorocresol',
    concentration: '14 sachets',
    price: 84,
    matchKeywords: ['solo sept', 'سولو سيبت', 'chlorhexidine', 'cleanser sachets', ...TAGS.antiseptics],
    usage: 'منظف/مطهر جلدي (أكياس) حسب الاستخدام.',
    timing: 'مرة–مرتين يومياً',
    category: Category.SKIN_CARE,
    form: 'Sachets',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 25. prevex topical spray 120 ml
  {
    id: 'prevex-topical-spray-120',
    name: 'prevex topical spray 120 ml',
    genericName: 'Centella + Tea tree oil + Chlorhexidine + Triclosan + Chamomile',
    concentration: '120 ml',
    price: 50,
    matchKeywords: ['prevex', 'بريفكس', 'centella', 'tea tree', 'spray', ...TAGS.antiseptics],
    usage: 'سبراي مطهر/منظف للجلد حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.TOPICAL_CARE,
    form: 'Spray',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['قد يسبب تهيجاً لمن لديهم حساسية للزيوت العطرية.']
  },

  // 26. rivasine care antiseptic sol. 200 ml
  {
    id: 'rivasine-care-antiseptic-sol-200',
    name: 'rivasine care antiseptic sol. 200 ml',
    genericName: 'Chlorhexidine + Triclosan + Chamomile extract + Thymol + Menthol',
    concentration: '200 ml',
    price: 50,
    matchKeywords: ['rivasine 200', 'ريفاسين 200', 'chlorhexidine', ...TAGS.antiseptics],
    usage: 'محلول مطهر موضعي (عبوة أكبر).',
    timing: 'حسب الحاجة',
    category: Category.TOPICAL_CARE,
    form: 'Solution',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 27. solo sept foaming skin cleanser 200 ml
  {
    id: 'solo-sept-foaming-cleanser-200',
    name: 'solo sept foaming skin cleanser 200 ml',
    genericName: 'Chlorhexidine + Hexamine + Chlorocresol',
    concentration: '200 ml',
    price: 95,
    matchKeywords: ['solo sept 200', 'سولو سيبت 200', 'cleanser', ...TAGS.antiseptics],
    usage: 'منظف/مطهر جلدي (سائل) حسب الاستخدام.',
    timing: 'مرة–مرتين يومياً',
    category: Category.SKIN_CARE,
    form: 'Cleanser',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 28. miss top wash liquid strwberry
  {
    id: 'miss-top-wash-liquid-strawberry',
    name: 'miss top wash liquid strwberry',
    genericName: 'Calendula + Tea tree oil + Cammomil + Aloe vera',
    concentration: 'Liquid',
    price: 55,
    matchKeywords: ['miss top wash', 'مس توب', 'strawberry', 'calendula', 'tea tree', ...TAGS.antiseptics],
    usage: 'غسول/منظف خارجي حسب الاستخدام.',
    timing: 'مرة–مرتين يومياً',
    category: Category.SKIN_CARE,
    form: 'Cleanser',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['توقف إذا حدث تهيج.']
  },

  // 29. betadine dry powder spray 2.5% 55 gm
  {
    id: 'betadine-dry-powder-spray-2-5-55',
    name: 'betadine dry powder spray 2.5% 55 gm',
    genericName: 'Povidone- iodine',
    concentration: '2.5%',
    price: 220,
    matchKeywords: ['betadine powder spray', 'بيتادين بودر', ...TAGS.antiseptics],
    usage: 'بودر سبراي مطهر/مجفف موضعي حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.FIRST_AID,
    form: 'Spray',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['حساسية اليود: الحذر.']
  },

  // 30. fentex mouth spray 60 ml
  {
    id: 'fentex-mouth-spray-60',
    name: 'fentex mouth spray 60 ml',
    genericName: 'Clove oil + Tea tree oil + Chamomile oil + Sage ext + Thymol',
    concentration: '60 ml',
    price: 70,
    matchKeywords: ['fentex', 'فينتكس', 'mouth spray', 'thymol', ...TAGS.antiseptics, ...TAGS.mouthWash],
    usage: 'سبراي للفم/الحلق بمكونات مطهرة/مهدئة حسب الاستخدام.',
    timing: 'حسب الحاجة',
    category: Category.MOUTH_THROAT,
    form: 'Spray',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['غير مناسب للأطفال الصغار.', 'قد يسبب تهيجاً لمن لديهم حساسية من الزيوت العطرية.']
  },

  // 31. rovasept top. spray 60 ml
  {
    id: 'rovasept-topical-spray-60',
    name: 'rovasept top. spray 60 ml',
    genericName: 'PHMG + Chlorhexidine + Cetrimide + Chammile + Aloe vera',
    concentration: '60 ml',
    price: 50,
    matchKeywords: ['rovasept', 'روفاسيبت', 'chlorhexidine', 'cetrimide', ...TAGS.antiseptics],
    usage: 'سبراي مطهر موضعي للجلد حسب الحاجة.',
    timing: 'حسب الحاجة',
    category: Category.FIRST_AID,
    form: 'Spray',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 32. periocare mouth spray 50ml
  {
    id: 'periocare-mouth-spray-50',
    name: 'periocare mouth spray 50ml',
    genericName: 'Clove oil + Peppermint oil + Calendula extract + Myrrh oil + Sage oil',
    concentration: '50ml',
    price: 60,
    matchKeywords: ['periocare', 'بيريوكير', 'mouth spray', ...TAGS.antiseptics, ...TAGS.antiInflammatory, ...TAGS.mouthWash],
    usage: 'سبراي للفم بمكونات مطهرة/مهدئة قد يساعد في التهاب اللثة/رائحة الفم حسب الاستخدام.',
    timing: 'حسب الحاجة',
    category: Category.MOUTH_THROAT,
    form: 'Spray',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: () => 'يُوضع موضعياً على المنطقة المراد تطهيرها حسب الحاجة',
    warnings: ['قد يسبب تهيجاً لمن لديهم حساسية من الزيوت العطرية.']
  }
];

