
import { Medication, Category } from '../../types';

export const ANTIHYPERLIPIDEMIC_MEDS: Medication[] = [
  
// 1. Justechol 10mg 14 f.c. tablet
{
id: 'justechol-10-tab',
name: 'Justechol 10mg 14 f.c. tablet',
genericName: 'Atorvastatin', 
concentration: '10mg',
price: 74, 
matchKeywords: [
'cholesterol', 'atorvastatin', 'justechol', 'statin', 'hyperlipidemia', 'LDL', 'triglycerides', 'lipid', 'cardiovascular protection',
'جوستيكول', 'أتورفاستاتين', 'كوليسترول', 'دهون ثلاثية', 'دهون الدم', 'ستاتين', 'تصلب الشرايين', 'حماية القلب'
],
usage: 'يستخدم لخفض مستويات الكوليسترول الكلي، الكوليسترول الضار (LDL)، والدهون الثلاثية، وللوقاية من أمراض القلب والأوعية الدموية والسكتات الدماغية.',
timing: 'مرة يومياً – مزمن',
category: Category.ANTIHYPERLIPIDEMICS, 
form: 'Tablet',

minAgeMonths: 120, // 10 years for HeFH
maxAgeMonths: 1200,
minWeight: 30,
maxWeight: 250,

calculationRule: (weight, ageMonths) => {
  if (ageMonths >= 216) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  if (ageMonths >= 120) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  return 'لا يُنصح للأطفال دون ١٠ سنوات إلا وراثي بجرعة معتمدة.';
  },

warnings: [
'يمنع استخدامه تماماً أثناء الحمل (فئة X) أو التخطيط للحمل لأنه يسبب تشوهات للأجنة.',
'يمنع استخدامه لمرضى الكبد النشط أو عند ارتفاع إنزيمات الكبد غير المبرر.',
'يجب إعادة التقييم فوراً في حالة حدوث آلام عضلية غير مبررة أو وهن (Myopathy).',
'تجنب شرب كميات كبيرة من عصير الجريب فروت لأنه قد يزيد من تركيز الدواء في الدم.'
]
},

// 2. Zyrovazet 5/10mg 30 tablets
// ملاحظة: التركيز 5/10 غير شائع في هذا البراند (الشائع 10/10 وأعلى)، ولكن تم إدراجه كما طلبت.
// عادة الرقم الأول يرمز للإزتيميب (10) والثاني للأتورفاستاتين.
{
  id: 'zyrovazet-5-10-tab',
  name: 'Zyrovazet 5/10mg 30 tablets',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '5mg/10mg',
  price: 32, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'zyrovazet', 'combined', 'dual action',
    'زيروفازيت', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول', 'دهون مركبة', 'مزيج'
  ],
  usage: 'علاج ثنائي المفعول لخفض الكوليسترول الكلي والضار (LDL) والدهون الثلاثية للحالات التي لا تستجيب للستاتين وحده.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 216, // 18 years typically for combos
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥ مجم/١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'المركبات المزدوجة للأطفال بجرعة معتمدة فقط.';
  },

  warnings: [
    'يمنع استخدامه لمرضى الكبد النشط أو عند ارتفاع إنزيمات الكبد.',
    'خطر الإصابة بآلام العضلات يزداد مع التركيبات الثنائية، أعد التقييم عند الشعور بألم عضلي.',
    'ممنوع تماماً أثناء الحمل والرضاعة.'
  ]
},

// 3. Justechol 10 mg 28 f.c. tabs.
{
  id: 'justechol-10-28-tab',
  name: 'Justechol 10 mg 28 f.c. tabs.',
  genericName: 'Atorvastatin', 
  concentration: '10mg',
  price: 148, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'justechol', 'statin', 'hyperlipidemia',
    'جوستيكول', 'أتورفاستاتين', 'كوليسترول', 'عبوة شهرية'
  ],
  usage: 'لخفض مستويات الكوليسترول والدهون الثلاثية والوقاية من مخاطر القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    if (ageMonths >= 120) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص لمن دون ١٠ سنوات.';
  },

  warnings: [
    'يمنع للحوامل (فئة X) والمرضى المصابين بأمراض كبدية نشطة.',
    'يجب متابعة إنزيمات الكبد بشكل دوري.',
    'أعد التقييم فوراً عند ألم عضلي غير مبرر (خطر Rhabdomyolysis نادر لكن خطير).',
    'تجنب عصير الجريب فروت لأنه يزيد تركيز الدواء.'
  ]
},

// 4. Justechol 20 mg 14 f.c. tabs.
{
  id: 'justechol-20-tab',
  name: 'Justechol 20 mg 14 f.c. tabs.',
  genericName: 'Atorvastatin', 
  concentration: '20mg',
  price: 106, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'justechol', 'statin', 'high intensity',
    'جوستيكول ٢٠', 'أتورفاستاتين', 'دهون الدم'
  ],
  usage: 'جرعة متوسطة الشدة لخفض الكوليسترول الضار وحماية الشرايين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'الجرعة القصوى للأطفال هي ٢٠ مجم، ويجب أن تكون بجرعة محددة مع متابعة الدهون دقيق.';
    }
  },

  warnings: [
    'انتبه للتفاعلات الدوائية (مثل بعض المضادات الحيوية وأدوية الفطريات).',
    'ممنوع للحامل والمرضع (فئة X).',
    'يجب متابعة إنزيمات الكبد قبل البدء ودورياً.',
    'تجنب عصير الجريب فروت.'
  ]
},

// 5. Zyrovazet 10/10mg 30 tablets
{
  id: 'zyrovazet-10-10-tab',
  name: 'Zyrovazet 10/10mg 30 tablets',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '10mg/10mg',
  price: 216, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'zyrovazet', 'combo',
    'زيروفازيت ١٠/١٠', 'ازيتيميب', 'اتورفاستاتين', 'دهون عنيدة'
  ],
  usage: 'علاج قوي للحالات التي لم تصل للمستهدف العلاجي باستخدام الستاتين بمفرده.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم/١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يجب الحذر وإعادة التقييم فوراً عند ظهور بول داكن أو يرقان (اصفرار العين).',
    'ممنوع للحامل.'
  ]
},

// 6. Zyrovazet 10/20mg 30 f.c. tablets
{
  id: 'zyrovazet-10-20-tab',
  name: 'Zyrovazet 10/20mg 30 f.c. tablets',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '10mg/20mg',
  price: 294, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'zyrovazet', 'strong statin',
    'زيروفازيت ١٠/٢٠', 'دهون مرتفعة', 'كوليسترول'
  ],
  usage: 'تركيبة مكثفة لمرضى الكوليسترول المرتفع جداً أو ذوي الخطورة القلبية العالية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم/٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يجب عمل فحص وظائف كبد قبل البدء وأثناء العلاج.',
    'ممنوع للحامل.'
  ]
},

// 7. Zyrovazet 10/40mg 30 f.c. tabs.
{
  id: 'zyrovazet-10-40-tab',
  name: 'Zyrovazet 10/40mg 30 f.c. tabs.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '10mg/40mg',
  price: 456, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'zyrovazet', 'very high intensity',
    'زيروفازيت ١٠/٤٠', 'أعلى تركيز', 'تصلب الشرايين', 'حماية القلب'
  ],
  usage: 'أقوى تركيز في المجموعة، يستخدم للمرضى ذوي الخطورة العالية جداً (مثل ما بعد الجلطات) لخفض الدهون بقوة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم/٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'خطر الآلام العضلية يكون أعلى مع هذا التركيز، أعد التقييم فوراً عن أي ألم عضلي.',
    'تجنب تماماً عصير الجريب فروت.',
    'ممنوع للحامل والمرضع (X).'
  ]
},
// 8. Ator 10mg 7 tab.
{
  id: 'ator-10-7-tab',
  name: 'Ator 10mg 7 tab.',
  genericName: 'Atorvastatin', 
  concentration: '10mg',
  price: 45, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ator', 'statin', 'lipids', 'eipico',
    'أتور ١٠', 'اتور', 'كوليسترول', 'دهون الدم', 'إيبيكو'
  ],
  usage: 'تقليل الكوليسترول الضار والدهون الثلاثية في الدم وحماية الشرايين من التصلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 120, // 10 years
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) { // 10-17 years (Familial Hypercholesterolemia)
      return '١٠ مجم مرة واحدة يومياً بجرعة محددة مع متابعة الدهون متخصص.';
    } else {
      return 'لا يستخدم للأطفال أقل من ١٠ سنوات إلا في حالات نادرة جداً وبقرار استشاري.';
    }
  },

  warnings: [
    'ممنوع منعاً باتاً للحوامل (Category X) لأنه يؤثر على تكوين الجنين.',
    'يمنع لمرضى التليف الكبدي أو الارتفاع المستمر في إنزيمات الكبد.',
    'في حالة الشعور بآلام عضلية شديدة أو تغير لون البول للون الداكن، يجب التوقف فوراً وتقييم الفائدة والخطر.',
    'تجنب عصير الجريب فروت لأنه يتداخل مع أيض الدواء.'
  ]
},

// 9. Ator 20mg 10 f.c. tab.
{
  id: 'ator-20-10-tab',
  name: 'Ator 20mg 10 f.c. tab.',
  genericName: 'Atorvastatin', 
  concentration: '20mg',
  price: 79, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ator', 'statin', 'moderate intensity',
    'أتور ٢٠', 'اتور', 'كوليسترول', 'دهون ثلاثية'
  ],
  usage: 'علاج ارتفاع دهون الدم المتوسطة والشديدة وللوقاية من جلطات القلب والمخ.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'الجرعة القصوى الموصى بها للأطفال هي ٢٠ مجم يومياً.';
    } else {
      return 'غير مخصص للأطفال تحت سن ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحوامل والمرضعات.',
    'يجب عمل إنزيمات كبد (ALT, AST) قبل البدء بالعلاج ومتابعتها إذا لزم الأمر.',
    'الحذر من الاستخدام المتزامن مع أدوية معينة مثل الكلاريثرومايسين (مضاد حيوي).'
  ]
},

// 10. Ator 40mg 10 f.c. tab.
{
  id: 'ator-40-10-tab',
  name: 'Ator 40mg 10 f.c. tab.',
  genericName: 'Atorvastatin', 
  concentration: '40mg',
  price: 166, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ator', 'high intensity', 'cardioprotection',
    'أتور ٤٠', 'اتور', 'تصلب الشرايين', 'جرعة عالية'
  ],
  usage: 'جرعة عالية الفعالية لخفض الكوليسترول بقوة، وتستخدم غالباً لمرضى القلب ومرضى السكر ذوي الخطورة العالية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح ببدء جرعة ٤٠ مجم للأطفال كجرعة افتتاحية.';
    }
  },

  warnings: [
    'خطر حدوث اعتلال عضلي (Myopathy) يزداد مع الجرعات العالية، أعد التقييم عن أي وهن عضلات.',
    'ممنوع تماماً في الحمل والرضاعة.',
    'يجب متابعة وظائف الكبد بدقة مع هذه الجرعة.'
  ]
},
// 11. Atoreza 10/10mg 28 f.c. tab.
{
  id: 'atoreza-10-10-28-tab',
  name: 'Atoreza 10/10mg 28 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 166, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atoreza', 'marcyrl', 'dual therapy',
    'أتوريزا', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول', 'دهون الدم', 'ماركيرل'
  ],
  usage: 'علاج مزدوج لخفض الكوليسترول الضار (LDL) والدهون الثلاثية، يعمل عن طريق تقليل تصنيع الكوليسترول في الكبد وتقليل امتصاصه من الأمعاء.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 10 years for both components in HeFH
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120 && ageMonths < 216) { // 10 to 17 years (HeFH)
      return 'قرص واحد يومياً بجرعة محددة مع متابعة الدهون دقيق لمتابعة النمو والدهون.';
    } else {
      return 'لا يوصى باستخدامه للأطفال أقل من ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع استخدامه نهائياً أثناء الحمل (Category X) أو التخطيط له.',
    'يمنع في حالات أمراض الكبد النشطة أو ارتفاع إنزيمات الكبد غير المبرر.',
    'أعد التقييم فوراً عند ألم عضلي غير مبرر أو ضعف عام.',
    'العبوة تحتوي على ٤ شرائط (٢٨ قرص).'
  ]
},

// 12. Atoreza 20/10mg 21 f.c. tab.
{
  id: 'atoreza-20-10-21-tab',
  name: 'Atoreza 20/10mg 21 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '20mg / 10mg',
  price: 141, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atoreza', 'high ldl',
    'أتوريزا ٢٠/١٠', 'اتورفاستاتين', 'ازيتيميب', 'دهون عنيدة'
  ],
  usage: 'جرعة متوسطة القوة من العلاج المزدوج، تستخدم للحالات التي تحتاج خفضاً كبيراً في مستويات الكوليسترول LDL.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'في الأطفال فوق ١٠ سنوات، الجرعة القصوى من الأتورفاستاتين هي ٢٠ مجم يومياً.';
    }
  },

  warnings: [
    'انتبه: هذه العبوة (٢١ قرص) تكفي لمدة ٣ أسابيع فقط، تأكد من تجديد الوصفة في الموعد.',
    'ممنوع للحوامل والمرضعات.',
    'تجنب تناول كميات كبيرة من عصير الجريب فروت مع العلاج.'
  ]
},
// 13. Cholerose 10mg 21 f.c.tab
{
  id: 'cholerose-10-21-tab',
  name: 'Cholerose 10mg 21 f.c.tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 102, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'cholerose', 'statin', 'potent', 'high intensity',
    'كوليروز', 'روزوفتاتين', 'كوليسترول', 'دهون الدم', 'دهون ثلاثية'
  ],
  usage: 'من أقوى الأدوية لخفض الكوليسترول الضار (LDL) والدهون الثلاثية وحماية الشرايين من التصلب والجلطات.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 8 years for HeFH
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96 && ageMonths < 216) { // 8 to 17 years (HeFH)
      return 'الجرعة تبدأ من ٥ مجم إلى ٢٠ مجم كحد أقصى مرة واحدة يومياً حسب التشخيص والتحاليل.';
    } else {
      return 'لا ينصح باستخدامه للأطفال أقل من ٨ سنوات.';
    }
  },

  warnings: [
    'يمنع استخدامه تماماً للحوامل (Category X).',
    'يمنع في حالات أمراض الكبد النشطة أو الارتفاع الكبير في الإنزيمات.',
    'في حالة حدوث آلام عضلية شديدة ومفاجئة، يجب التوقف وتقييم الفائدة والخطر لعمل تحليل (CK).',
    'الروزوفتاتين لا يتأثر بعصير الجريب فروت بقدر تأثر الأتورفاستاتين، لكن الاعتدال مطلوب.'
  ]
},

// 14. Crestolip 10 mg 30 f.c.tabs.
{
  id: 'crestolip-10-30-tab',
  name: 'Crestolip 10 mg 30 f.c.tabs.',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 108, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'crestolip', 'marcyrl', 'statin', 'lipids',
    'كريستوليب', 'روزوفتاتين', 'كوليسترول', 'دهون الدم', 'ماركيرل'
  ],
  usage: 'خفض مستويات الدهون في الدم والوقاية من السكتات الدماغية والنوبات القلبية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return 'الجرعة تُحدد حسب التشخيص والوزن للأطفال (٥-٢٠ مجم يومياً).';
    } else {
      return 'غير مخصص للأطفال دون سن الثامنة.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع.',
    'يجب متابعة وظائف الكلى مع الجرعات العالية (مثل ٤٠ مجم) خاصة عند وجود قصور كلوي.',
    'راجع تداخلات المريض (أدوية سيولة) (مثل ماريفان) لأن الروزوفتاتين قد يزيد مفعولها.'
  ]
},
// 15. Lipanthyl 300mg 30 capsules
{
  id: 'lipanthyl-300-30-cap', // Needs to be unique
  name: 'Lipanthyl 300mg 30 capsules',
  genericName: 'Fenofibrate (Micronized)', 
  concentration: '300mg',
  price: 126, 
  matchKeywords: [
    'triglycerides', 'fenofibrate', 'lipanthyl', 'fibrate', 'abbott', 'lipid lowering',
    'ليبانثيل ٣٠٠', 'فينوفايبرات', 'دهون ثلاثية', 'أبوت', 'كوليسترول'
  ],
  usage: 'علاج فعال لارتفاع الدهون الثلاثية في الدم، ويساعد في رفع مستوى الكوليسترول النافع (HDL).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Capsule',

  minAgeMonths: 216, // Generally for adults
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ كبسولة ٣٠٠ مجم مرة يومياً مع الأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح باستخدامه للأطفال إلا في حالات وراثية خاصة جداً بجرعات معتمدة.';
    }
  },

  warnings: [
    'يجب متابعة وظائف الكلى (Creatinine) بانتظام، ويمنع في حالات القصور الكلوي الشديد.',
    'خطر حدوث التهاب العضلات يزداد إذا تم استخدامه مع أدوية الـ Statins.',
    'يمنع استخدامه لمرضى المرارة أو الكبد النشط.',
    'ممنوع تماماً أثناء الحمل والرضاعة.'
  ]
},

// 16. Lipanthyl Supra 160mg 30 tablets
{
  id: 'lipanthyl-supra-160-30-tab', // Needs to be unique
  name: 'Lipanthyl Supra 160mg 30 tablets',
  genericName: 'Fenofibrate (Nanocrystallized)', 
  concentration: '160mg',
  price: 141, 
  matchKeywords: [
    'triglycerides', 'fenofibrate', 'lipanthyl supra', 'nanotechnology', 'abbott',
    'ليبانثيل سوبرا', 'فينوفايبرات ١٦٠', 'دهون ثلاثية', 'أبوت'
  ],
  usage: 'الجيل المتطور من الفينوفايبرات؛ امتصاصه أسرع وأقوى بجرعة أقل لتقليل الدهون الثلاثية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للاستخدام الروتيني للأطفال.';
    }
  },

  warnings: [
    'يجب الحذر عند استخدامه مع مرضى الكلى؛ الجرعة قد تحتاج تعديل.',
    'أعد التقييم فوراً إذا شعرت بألم عضلي غير مبرر أو بول بلون الشاي.',
    'ممنوع في حالات حساسية الضوء الناتجة عن أدوية الفايبرات أو الكيتوبروفين.',
    'ممنوع للحامل والمرضع.'
  ]
},
// 17. Rosuvastatin 10mg 14 f.c. tab
{
  id: 'rosuvastatin-10-14-tab', // REPLACE_WITH_UNIQUE_ID
  name: 'Rosuvastatin 10mg 14 f.c. tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 51, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'statin', 'triglycerides', 'lipid lowering',
    'روزوفتاتين', 'كوليسترول', 'دهون الدم', 'دهون ثلاثية', 'روزوفتاتين ١٠'
  ],
  usage: 'يستخدم لخفض مستويات الكوليسترول الضار (LDL) والدهون الثلاثية في الدم بفاعلية عالية جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // REPLACE_WITH_CATEGORY_ENUM
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 8 years for HeFH
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96 && ageMonths < 216) { // 8 to 17 years (HeFH)
      return '٥ مجم إلى ١٠ مجم مرة واحدة يومياً حسب التشخيص والتحاليل.';
    } else {
      return 'لا يستخدم للأطفال أقل من ٨ سنوات.';
    }
  },

  warnings: [
    'ممنوع استخدامه تماماً أثناء الحمل أو الرضاعة الطبيعية.',
    'يمنع لمرضى الكبد النشط أو عند حدوث ارتفاع غير مبرر في إنزيمات الكبد.',
    'في حالة حدوث آلام عضلية غير مفسرة، يجب تقييم الفائدة والخطر لعمل تحليل (CK).',
    'يستخدم بحذر شديد مع مرضى القصور الكلوي.'
  ]
},

// 18. Zocozet 10/20mg 14 f.c. tab.
{
  id: 'zocozet-10-20-14-tab', // REPLACE_WITH_UNIQUE_ID
  name: 'Zocozet 10/20mg 14 f.c. tab.',
  genericName: 'Simvastatin + Ezetimibe', 
  concentration: '20mg / 10mg',
  price: 90, 
  matchKeywords: [
    'cholesterol', 'simvastatin', 'ezetimibe', 'zocozet', 'combination', 'vytorin',
    'زوكوزيت', 'سيمفاستاتين', 'إزيتيميب', 'كوليسترول', 'دهون مركبة'
  ],
  usage: 'علاج مزدوج لخفض الكوليسترول عن طريق منع تصنيعه في الكبد ومنع امتصاصه من الأمعاء في آن واحد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // REPLACE_WITH_CATEGORY_ENUM
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 10 years for HeFH
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 120) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح باستخدامه للأطفال تحت سن ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع (Category X).',
    'يجب تجنب شرب عصير الجريب فروت لأنه يزيد من تركيز السيمفاستاتين ويسبب آثاراً جانبية خطيرة.',
    'يستخدم بحذر مع مرضى الضغط الذين يتناولون مادة (Amlodipine)؛ حيث يفضل ألا تتجاوز جرعة السيمفاستاتين ٢٠ مجم (وهي الموجودة في هذا الدواء).',
    'أعد التقييم فوراً عن أي ألم أو وهن في العضلات.'
  ]
},
// 19. Larosuzet 10/10 mg 30 f.c.tabs.
{
  id: 'larosuzet-10-10-30-tab', 
  name: 'Larosuzet 10/10 mg 30 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 156, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'larosuzet', 'marcyrl', 'dual therapy',
    'لاروسوزيت', 'روزوفتاتين', 'ازيتيميب', 'كوليسترول', 'دهون الدم', 'دهون مركبة'
  ],
  usage: 'علاج مزدوج فائق القوة لخفض الكوليسترول الضار (LDL) والدهون الثلاثية عن طريق تقليل التصنيع والامتصاص معاً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 10 years for HeFH combination
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'قرص واحد يومياً بجرعة محددة مع متابعة الدهون دقيق لمتابعة نسب الدهون والنمو.';
    } else {
      return 'لا ينصح باستخدامه للأطفال أقل من ١٠ سنوات لعدم كفاية الدراسات على المزيج في هذا السن.';
    }
  },

  warnings: [
    'ممنوع استخدامه تماماً أثناء الحمل (Category X) أو التخطيط له.',
    'يمنع في حالات أمراض الكبد النشطة أو ارتفاع إنزيمات الكبد المستمر.',
    'يجب إبلاغ الطبيب فوراً عند حدوث ألم عضلي "غير مبرر" أو وهن عام.',
    'يستخدم بحذر مع مرضى القصور الكلوي.'
  ]
},

// 20. Larosuzet 10/40 mg 30 f.c.tabs.
{
  id: 'larosuzet-10-40-30-tab', 
  name: 'Larosuzet 10/40 mg 30 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '40mg / 10mg',
  price: 306, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'larosuzet', 'high intensity', 'max dose',
    'لاروسوزيت ١٠/٤٠', 'روزوفتاتين ٤٠', 'أقصى جرعة كوليسترول', 'دهون عنيدة'
  ],
  usage: 'أقصى تركيز علاجي متاح؛ يستخدم للحالات شديدة الخطورة أو المرضى الذين خضعوا لعمليات قلب مفتوح/دعامة لخفض LDL لأدنى مستوياته.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, // Usually reserved for adults at this high dose
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح ببدء جرعة الـ ٤٠ مجم روزوفتاتين للأطفال أو المراهقين.';
    }
  },

  warnings: [
    'ممنوع للحوامل والمرضعات.',
    'يمنع في حالات الفشل الكلوي الشديد (GFR < 30).',
    'خطر الإصابة باعتلال العضلات (Myopathy) يزداد مع جرعة الـ ٤٠ مجم؛ أعد التقييم فوراً عند ألم عضلي.',
    'لا يُنصح بالبدء بهذه الجرعة كجرعة افتتاحية إلا في حالات خاصة جداً يُحدد حسب التشخيص.'
  ]
},
// 21. Atoreza 80/10mg 28 f.c. tab.
{
  id: 'atoreza-80-10-28-tab', // English - Changeable
  name: 'Atoreza 80/10mg 28 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', // English - Changeable
  concentration: '80mg / 10mg', // English - Changeable
  price: 210, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atoreza 80', 'high intensity', 'max dose',
    'أتوريزا ٨٠/١٠', 'أقصى جرعة دهون', 'جلطات القلب', 'كوليسترول', 'ماركيرل'
  ],
  usage: 'أقوى تركيز متاح للوقاية الثانوية القصوى؛ يستخدم لخفض الكوليسترول الضار (LDL) بنسب كبيرة جداً تصل لأكثر من ٦٠٪ خاصة بعد جلطات القلب أو تركيب الدعامات.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // English - Changeable
  form: 'Film-coated Tablet', // English - Changeable

  minAgeMonths: 216, // Adults only for this high dose
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا يستخدم هذا التركيز نهائياً للأطفال أو المراهقين.';
    }
  },

  warnings: [
    'خطر حدوث اعتلال عضلي (Myopathy) يكون في أعلى مستوياته مع جرعة الـ ٨٠ مجم؛ أعد التقييم فوراً عند الشعور بألم غير طبيعي.',
    'ممنوع تماماً أثناء الحمل والرضاعة (Category X).',
    'يمنع في حالات أمراض الكبد النشطة أو الارتفاع الحاد في الإنزيمات.',
    'تجنب تناول عصير الجريب فروت نهائياً لأنه يزيد من سمية الدواء في هذا التركيز.'
  ]
},

// 22. Atoreza 40/10mg 28 f.c. tab.
{
  id: 'atoreza-40-10-28-tab', // English - Changeable
  name: 'Atoreza 40/10mg 28 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', // English - Changeable
  concentration: '40mg / 10mg', // English - Changeable
  price: 210, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atoreza 40', 'intensive therapy',
    'أتوريزا ٤٠/١٠', 'اتورفاستاتين ٤٠', 'كوليسترول مرتفع', 'دهون مركبة'
  ],
  usage: 'علاج مكثف لخفض الدهون في الحالات التي لا تستجيب للجرعات المتوسطة، أو المرضى ذوي الخطورة القلبية العالية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // English - Changeable
  form: 'Film-coated Tablet', // English - Changeable

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح ببدء جرعات عالية من الأتورفاستاتين للأطفال (الحد الأقصى للأطفال ٢٠ مجم).';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل أو اللاتي يخططن للحمل.',
    'يجب عمل فحص دوري لإنزيمات الكبد كل ٣-٦ أشهر.',
    'انتبه للتداخلات الدوائية مع بعض المضادات الحيوية (مثل الكلاريثرومايسين).'
  ]
},
// 23. Larosuzet 10/20 mg 30 f.c.tabs.
{
  id: 'larosuzet-10-20-30-tab',
  name: 'Larosuzet 10/20 mg 30 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '20mg / 10mg', // Rosuvastatin is 20, Ezetimibe is 10
  price: 198, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'larosuzet 20', 'combination',
    'لاروسوزيت ١٠/٢٠', 'روزوفتاتين ٢٠', 'ازيتيميب', 'كوليسترول', 'ماركيرل'
  ],
  usage: 'تركيبة مزدوجة متوسطة القوة؛ تستخدم عندما لا يكفي الروزوفتاتين 20 مجم بمفرده للوصول لمستوى الدهون المستهدف.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح باستخدامه للأطفال أو المراهقين إلا بجرعة محددة مع متابعة الدهون مختص.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع (Category X).',
    'يجب الانتباه لأي ألم عضلي، خاصة إذا كان المريض يعاني من قصور في الغدة الدرقية أو مشاكل كلوية.',
    'يمنع في حالات أمراض الكبد النشطة.'
  ]
},

// 24. Cholerose 20mg 21 f.c. tabs
{
  id: 'cholerose-20-21-tab',
  name: 'Cholerose 20mg 21 f.c. tabs',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 132, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'cholerose 20', 'statin', 'high intensity',
    'كوليروز ٢٠', 'روزوفتاتين', 'دهون الدم', 'كوليسترول'
  ],
  usage: 'جرعة قوية من الروزوفتاتين لخفض الكوليسترول الضار (LDL) والدهون الثلاثية وعلاج تصلب الشرايين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return '٢٠ مجم هي الجرعة القصوى المسموح بها للأطفال والمراهقين (HeFH).';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  warnings: [
    'يمنع للحامل.',
    'في الجرعات العالية (مثل ٢٠ و ٤٠ مجم)، يفضل عمل تحليل بول لمتابعة البروتين (Proteinuria) كإجراء احترازي.',
    'يزيد من احتمالية الإصابة بالسكري (بنسبة طفيفة) ولكن فوائده للقلب تفوق هذا الخطر بمراحل.'
  ]
},

// 25. Cholerose Plus 10/40mg 28 f.c.tabs.
{
  id: 'cholerose-plus-10-40-28-tab',
  name: 'Cholerose Plus 10/40mg 28 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '40mg / 10mg', // Rosuvastatin 40, Ezetimibe 10
  price: 400, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'cholerose plus', 'max dose',
    'كوليروز بلس ١٠/٤٠', 'أقصى جرعة', 'دهون عنيدة', 'جلطات', 'ماش بريمير'
  ],
  usage: 'أقصى قوة علاجية متاحة في المجموعة؛ تستخدم للحالات شديدة الخطورة لخفض الدهون لأقصى درجة ممكنة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع تماماً للأطفال (جرعة الـ ٤٠ مجم غير آمنة كبداية أو للأعمار الصغيرة).';
    }
  },

  warnings: [
    'خطر الاعتلال العضلي (Myopathy) وانحلال العضلات (Rhabdomyolysis) يكون أعلى مع جرعة الـ ٤٠ مجم.',
    'يجب متابعة وظائف الكلى والكبد بانتظام.',
    'ممنوع لمرضى القصور الكلوي الشديد.',
    'ممنوع للحامل والمرضع.'
  ]
},

// 26. Cholerose Plus 10/10 mg 14 f.c.tablets
{
  id: 'cholerose-plus-10-10-14-tab',
  name: 'Cholerose Plus 10/10 mg 14 f.c.tablets',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 86, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'cholerose plus', 'starter combo',
    'كوليروز بلس ١٠/١٠', 'روزوفتاتين', 'ازيتيميب', 'كوليسترول'
  ],
  usage: 'بداية ممتازة للعلاج المزدوج؛ يوفر فعالية أعلى من الستاتين وحده بجرعة آمنة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'يمكن استخدامه للأطفال فوق ١٠ سنوات بجرعة محددة مع متابعة الدهون.';
    } else {
      return 'غير مخصص للأطفال أقل من ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'الأعراض الجانبية الهضمية (انتفاخ، ألم بطن) قد تزيد قليلاً بسبب مادة الإزتيميب.'
  ]
},

// 27. Cholerose Plus 10/20mg 14 f.c. tablets
{
  id: 'cholerose-plus-10-20-14-tab',
  name: 'Cholerose Plus 10/20mg 14 f.c. tablets',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '20mg / 10mg', // Rosuvastatin 20, Ezetimibe 10
  price: 103, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'cholerose plus 20',
    'كوليروز بلس ١٠/٢٠', 'كوليسترول', 'دهون مركبة'
  ],
  usage: 'الخيار الأوسط والأكثر شيوعاً في الحالات المتوسطة إلى الشديدة لضبط الدهون.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للأطفال والمراهقين: يجب الحذر والمتابعة الطبية عند استخدام الـ combination.';
    }
  },

  warnings: [
    'يجب تقييم الفائدة والخطر قبل البدء إذا كان المريض يتناول أدوية مضادة للفيروسات أو مثبطات المناعة.',
    'ممنوع للحامل والمرضع.'
  ]
},
// 28. Downsterolin 10/20mg 28 f.c. tabs.
{
  id: 'downsterolin-10-20-28-tab',
  name: 'Downsterolin 10/20mg 28 f.c. tabs.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '20mg / 10mg', // Atorvastatin 20, Ezetimibe 10
  price: 122, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'downsterolin', 'apex', 'lipid lowering',
    'داونستيرولين', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول', 'دهون الدم', 'ابيكس'
  ],
  usage: 'يستخدم لخفض الكوليسترول الضار والدهون الثلاثية بفاعلية مزدوجة (تقليل التصنيع والامتصاص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح باستخدامه للأطفال تحت ١٨ سنة إلا بقرار من استشاري متخصص.';
    }
  },

  warnings: [
    'ممنوع تماماً في حالات الحمل والرضاعة (Category X).',
    'يمنع لمرضى الكبد النشط أو عند ارتفاع إنزيمات الكبد غير المبرر.',
    'يجب إبلاغ الطبيب فوراً عن أي ألم عضلي غير مفسر أو ضعف عام.',
    'تجنب شرب عصير الجريب فروت بكميات كبيرة لتجنب الآثار الجانبية.'
  ]
},

// 29. Downsterolin 10/40mg 28 f.c. tabs.
{
  id: 'downsterolin-10-40-28-tab',
  name: 'Downsterolin 10/40mg 28 f.c. tabs.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '40mg / 10mg', // Atorvastatin 40, Ezetimibe 10
  price: 160, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'downsterolin 40', 'intensive therapy',
    'داونستيرولين ٤٠', 'اتورفاستاتين ٤٠', 'دهون عنيدة', 'حماية القلب'
  ],
  usage: 'جرعة مكثفة للحالات التي تحتاج خفضاً كبيراً في مستويات LDL أو المرضى ذوي الخطورة القلبية العالية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا يوصى باستخدامه للأطفال والمراهقين في هذه الجرعة المرتفعة.';
    }
  },

  warnings: [
    'يمنع في حالات القصور الكبدي الشديد.',
    'خطر حدوث آلام العضلات (Myopathy) يزداد مع جرعة الـ ٤٠ مجم؛ راقب أي أعراض بدقة.',
    'يجب فحص وظائف الكبد بشكل دوري.',
    'ممنوع للحوامل.'
  ]
},
// 30. Rositor 10mg 14 f.c. tab
{
  id: 'rositor-10-14-tab',
  name: 'Rositor 10mg 14 f.c. tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 58, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'rositor', 'statin', 'lipids',
    'روزيتور', 'روزوفتاتين', 'كوليسترول', 'دهون الدم', 'الرازي'
  ],
  usage: 'يستخدم لخفض الكوليسترول الضار (LDL) والدهون الثلاثية بفعالية عالية جداً وحماية الشرايين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 8 years for HeFH
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96 && ageMonths < 216) { // 8 to 17 years
      return 'الجرعة تبدأ من ٥ مجم إلى ١٠ مجم مرة واحدة يومياً حسب الحالة.';
    } else {
      return 'لا يستخدم للأطفال أقل من ٨ سنوات.';
    }
  },

  warnings: [
    'ممنوع تماماً أثناء الحمل والرضاعة (Category X).',
    'يمنع في حالات أمراض الكبد النشطة.',
    'في حالة حدوث ألم عضلي شديد، يجب التوقف وتقييم الفائدة والخطر لعمل تحليل CK.',
    'يستخدم بحذر شديد مع مرضى القصور الكلوي.'
  ]
},

// 31. Rositor 20mg 14 f.c.tab
{
  id: 'rositor-20-14-tab',
  name: 'Rositor 20mg 14 f.c.tab',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 80, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'rositor 20', 'high intensity',
    'روزيتور ٢٠', 'روزوفتاتين ٢٠', 'دهون مرتفعة', 'الرازي'
  ],
  usage: 'جرعة قوية وفعالة للحالات التي تحتاج خفضاً كبيراً في مستويات الدهون أو الوقاية بعد الأزمات القلبية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return '٢٠ مجم هي الجرعة القصوى المسموح بها للأطفال والمراهقين.';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع.',
    'يجب متابعة إنزيمات الكبد (ALT/AST) قبل البدء وأثناء العلاج.',
    'احذر من التفاعلات الدوائية مع بعض أدوية سيولة الدم.'
  ]
},

// 32. Rosuvast 20 mg 14 f.c.tab.
{
  id: 'rosuvast-20-14-tab',
  name: 'Rosuvast 20 mg 14 f.c.tab.',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 118, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'rosuvast', 'global napi', 'potent statin',
    'روزو فاست', 'روزوفتاتين ٢٠', 'كوليسترول', 'جلوبال نابي'
  ],
  usage: 'من أجود أصناف الروزوفتاتين في السوق المصري لخفض الدهون الثلاثية والكوليسترول وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'في الأطفال فوق ٨ سنوات، الجرعة القصوى هي ٢٠ مجم يومياً حسب التشخيص.';
    }
  },

  warnings: [
    'يمنع في حالات الفشل الكلوي الشديد.',
    'يجب إبلاغ الطبيب فوراً عند حدوث أي وهن عضلات غير مفسر.',
    'ممنوع تماماً في الحمل والرضاعة.'
  ]
},
// 33. Zocozet 10/10mg 14 f.c. tab.
{
  id: 'zocozet-10-10-14-tab',
  name: 'Zocozet 10/10mg 14 f.c. tab.',
  genericName: 'Simvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 86, 
  matchKeywords: [
    'cholesterol', 'simvastatin', 'ezetimibe', 'zocozet', 'combination',
    'زوكوزيت ١٠/١٠', 'سيمفاستاتين', 'ازيتيميب', 'كوليسترول', 'دهون الدم'
  ],
  usage: 'علاج مزدوج لخفض الكوليسترول والدهون الثلاثية بجرعة مخففة، مناسب للبدء في العلاج أو الحالات المتوسطة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 10 years (HeFH)
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 120) {
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح باستخدامه للأطفال أقل من ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع (Category X).',
    'تجنب عصير الجريب فروت.',
    'يراعى الحذر عند استخدامه مع أدوية الضغط (مثل الأميلوديبين) أو أدوية القلب (مثل الأميودارون).'
  ]
},

// 34. Cholerose Plus 10/10 mg 28 f.c.tabs.
{
  id: 'cholerose-plus-10-10-28-tab',
  name: 'Cholerose Plus 10/10 mg 28 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 172, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'cholerose plus', 'monthly pack',
    'كوليروز بلس', 'روزوفتاتين', 'ازيتيميب', 'كوليسترول', 'عبوة شهرية'
  ],
  usage: 'تركيبة مزدوجة فعالة جداً لخفض الدهون، وتتميز هذه العبوة بأنها تكفي شهراً كاملاً (٢٨ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'يمكن استخدامه للأطفال فوق ١٠ سنوات (HeFH) بجرعة محددة مع متابعة الدهون.';
    } else {
      return 'غير مخصص للأطفال أقل من ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع.',
    'يجب متابعة إنزيمات الكبد ووظائف الكلى بشكل دوري.',
    'أعد التقييم عن أي ألم عضلي.'
  ]
},

// 35. Cholerose Plus 10/20mg 28 f.c.tabs.
{
  id: 'cholerose-plus-10-20-28-tab',
  name: 'Cholerose Plus 10/20mg 28 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '20mg / 10mg', // Interpreted as Rosuvastatin 20mg / Ezetimibe 10mg based on potency/price context
  price: 276, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'cholerose plus 20',
    'كوليروز بلس ١٠/٢٠', 'كوليسترول', 'دهون مركبة', 'عبوة شهرية'
  ],
  usage: 'جرعة قوية (٢٠ مجم روزوفتاتين مع إزتيميب) للحالات التي تحتاج تخفيضاً قوياً للـ LDL.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يفضل عدم استخدام الجرعات المركبة العالية للأطفال إلا بواسطة استشاري.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع.',
    'يجب الحذر مع مرضى الغدة الدرقية غير المنضبطة (Hypothyroidism) لتجنب آلام العضلات.'
  ]
},

// 36. Zetacolest Plus 180/10 mg 30 f.c. tabs.
{
  id: 'zetacolest-plus-180-10-30-tab',
  name: 'Zetacolest Plus 180/10 mg 30 f.c. tabs.',
  genericName: 'Bempedoic Acid + Ezetimibe', 
  concentration: '180mg / 10mg',
  price: 474, 
  matchKeywords: [
    'cholesterol', 'bempedoic acid', 'ezetimibe', 'zetacolest plus', 'non-statin', 'statin intolerance',
    'زيتاكوليست بلس', 'بيمبيدويك اسيد', 'ازيتيميب', 'بديل الستاتين', 'حساسية الستاتين'
  ],
  usage: 'دواء حديث يستخدم لخفض الكوليسترول في المرضى الذين لا يتحملون أدوية الستاتين (بسبب آلام العضلات) أو كعلاج إضافي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, // Primarily for Adults (18+)
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٨٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لم يتم إثبات أمانه وفعاليته بشكل كافٍ للأطفال أقل من ١٨ سنة.';
    }
  },

  warnings: [
    'قد يسبب ارتفاعاً في حمض اليوريك (Uric Acid)؛ لذا يستخدم بحذر مع مرضى النقرس.',
    'هناك احتمال نادر لحدوث تمزق في الأوتار (Tendon Rupture)، خاصة في المرضى الكبار أو الرياضيين.',
    'ممنوع للحامل والمرضع.',
    'يفضل عمل تحليل حمض يوريك (Uric acid) ووظائف كبد قبل البدء.'
  ]
},
// 37. Atorstat 10mg 14 f.c.tab.
{
  id: 'atorstat-10-14-tab',
  name: 'Atorstat 10mg 14 f.c.tab.',
  genericName: 'Atorvastatin', 
  concentration: '10mg',
  price: 56, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'atorstat', 'pharco', 'statin', 'lipids',
    'اتورستات', 'اتورفاستاتين', 'كوليسترول', 'دهون الدم', 'فاركو'
  ],
  usage: 'يستخدم لخفض الكوليسترول الضار (LDL) والدهون الثلاثية والوقاية من أمراض الشرايين التاجية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 10 years
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // 18 years+
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) { // 10-17 years (HeFH)
      return '١٠ مجم مرة واحدة يومياً بجرعة محددة مع متابعة الدهون. (يمكن استخدام هذا التركيز للأطفال).';
    } else {
      return 'لا ينصح باستخدامه للأطفال أقل من ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل والمرضع (Category X).',
    'يمنع في حالات أمراض الكبد النشطة.',
    'أعد التقييم فوراً في حالة حدوث آلام عضلية أو تغير لون البول.',
    'تجنب الإفراط في تناول عصير الجريب فروت.'
  ]
},

// 38. Atorstat 20mg 14 scored tabs.
{
  id: 'atorstat-20-14-scored-tab',
  name: 'Atorstat 20mg 14 scored tabs.',
  genericName: 'Atorvastatin', 
  concentration: '20mg',
  price: 64, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'atorstat 20', 'scored', 'splittable',
    'اتورستات ٢٠', 'قرص مشقوق', 'قابل للكسر', 'كوليسترول', 'دهون'
  ],
  usage: 'جرعة متوسطة لخفض الدهون، ويتميز القرص بأنه "Scored" (محزز) مما يسمح بكسره لنصفين بدقة للحصول على جرعة ١٠ مجم عند الحاجة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'الجرعة القصوى للأطفال هي ٢٠ مجم. وجود الحز (Score) يسهل إعطاء جرعة ١٠ مجم بدقة.';
    } else {
      return 'غير مخصص للأطفال أقل من ١٠ سنوات.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب حفظ الأقراص المكسورة في مكان جاف واستخدامها سريعاً.',
    'يجب متابعة وظائف الكبد بشكل دوري.'
  ]
},

// 39. Atorstat 40mg 14 biscored tabs.
{
  id: 'atorstat-40-14-biscored-tab',
  name: 'Atorstat 40mg 14 biscored tabs.',
  genericName: 'Atorvastatin', 
  concentration: '40mg',
  price: 76, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'atorstat 40', 'biscored', 'high dose',
    'اتورستات ٤٠', 'قرص مقسم', 'أربعة أجزاء', 'كوليسترول عالي', 'حماية القلب'
  ],
  usage: 'جرعة عالية الفعالية (High-Intensity). ميزة الـ "Bi-scored" تعني إمكانية تقسيم القرص إلى أجزاء (مثلاً للحصول على ١٠ أو ٢٠ مجم) بسهولة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا يوصى ببدء جرعة ٤٠ مجم للأطفال.';
    }
  },

  warnings: [
    'الجرعات العالية (٤٠ مجم) تزيد من خطر الآلام العضلية، يجب الانتباه.',
    'ممنوع للحامل والمرضع.',
    'يمنع في حالات القصور الكبدي الشديد.'
  ]
},
// 40. Cholerose 5mg 14 tablets
{
  id: 'cholerose-5-14-tab',
  name: 'Cholerose 5mg 14 tablets',
  genericName: 'Rosuvastatin', 
  concentration: '5mg',
  price: 58, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'cholerose 5', 'starter dose', 'low dose',
    'كوليروز ٥', 'روزوفتاتين', 'جرعة بسيطة', 'كوليسترول', 'دهون'
  ],
  usage: 'جرعة أولية لخفض الكوليسترول والدهون، مناسبة للبدء في العلاج أو للمرضى الذين يعانون من آلام عضلية مع الجرعات الأعلى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 120, // 8 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return '٥ مجم هي الجرعة المناسبة للبدء في علاج الأطفال (HeFH) من سن ٨ سنوات.';
    } else {
      return 'لا يستخدم للأطفال أقل من ٨ سنوات.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'إذا شعرت بألم في العضلات غير مرتبط بمجهود، أعد التقييم.',
    'تجنب تناول الكحوليات أثناء فترة العلاج لعدم إرهاق الكبد.'
  ]
},

// 41. Crestolip 20 mg 30 f.c.tabs.
{
  id: 'crestolip-20-30-tab',
  name: 'Crestolip 20 mg 30 f.c.tabs.',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 141, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'crestolip 20', 'strong statin',
    'كريستوليب ٢٠', 'روزوفتاتين', 'دهون عالية', 'ماركيرل'
  ],
  usage: 'جرعة قوية لعلاج ارتفاع الدهون الشديد وحماية القلب، تعمل بكفاءة عالية على خفض الـ LDL.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return '٢٠ مجم هي الحد الأقصى المسموح به للأطفال، ويجب الوصول إليها بالتدرج.';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل.',
    'يجب عمل تحاليل دورية للاطمئنان على الكبد والكلى.',
    'راجع تداخلات المريض (خاصة مضادات التجلط) لتجنب التفاعلات.'
  ]
},
// 42. Crestor 10mg 28 f.c. tab.
{
  id: 'crestor-10-28-tab', // REPLACE_WITH_UNIQUE_ID
  name: 'Crestor 10mg 28 f.c. tab.',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 368, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'crestor', 'astrazeneca', 'originator',
    'كريستور', 'روزوفتاتين', 'أسترازينيكا', 'الأصلي', 'كوليسترول', 'دهون'
  ],
  usage: 'الدواء الأصلي لعلاج ارتفاع الدهون والكوليسترول؛ يوفر أعلى حماية للشرايين والقلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // REPLACE_WITH_CATEGORY_ENUM
  form: 'Film-coated Tablet',

  minAgeMonths: 120, // 8 years for HeFH
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return 'للأطفال من سن ٨ سنوات: يمكن استخدام جرعة ١٠ مجم بمتابعة التحاليل.';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع نهائياً للحامل (يسبب تشوه الأجنة) والمرضع.',
    'إذا لاحظت لون البول أصبح غامقاً جداً (مثل الشاي) أو شعرت بألم شديد في العضلات، أوقف الدواء وأعد التقييم.',
    'لا تأخذ مضادات حموضة تحتوي على ألومنيوم أو ماغنسيوم في نفس وقت الجرعة (افصل بينهم بساعتين).'
  ]
},

// 43. Crestor 10mg 14 f.c. tab
{
  id: 'crestor-10-14-tab', // REPLACE_WITH_UNIQUE_ID
  name: 'Crestor 10mg 14 f.c. tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 184, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'crestor 14', 'astrazeneca',
    'كريستور ١٤', 'روزوفتاتين', 'كوليسترول', 'نص شهر'
  ],
  usage: 'نفس كفاءة العبوة الكبيرة؛ يستخدم لخفض الدهون الضارة والوقاية من الجلطات.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // REPLACE_WITH_CATEGORY_ENUM
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يحدد الطبيب الجرعة للأطفال (فوق ٨ سنوات) بدقة.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل.',
    'يجب عمل تحليل وظائف كبد ودهون بشكل دوري لمتابعة التحسن.'
  ]
},

// 44. Estero-map 10mg 20 f.c. tab
{
  id: 'estero-map-10-20-tab', // REPLACE_WITH_UNIQUE_ID
  name: 'Estero-map 10mg 20 f.c. tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 88, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'estero-map', 'multi-apex', 'statin',
    'استيروماب', 'روزوفتاتين', 'مالتي ايبكس', 'كوليسترول', 'دهون'
  ],
  usage: 'بديل اقتصادي وفعال لخفض الكوليسترول والدهون الثلاثية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, // REPLACE_WITH_CATEGORY_ENUM
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للأطفال والمراهقين (٨-١٧ سنة): الجرعة المعتادة ٥-١٠ مجم يومياً.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'تجنب الأطعمة الدسمة والمقلية قدر الإمكان لمساعدة الدواء على العمل بكفاءة.'
  ]
},
// 45. Ezastatin 40/10mg 30 tab.
{
  id: 'ezastatin-40-10-30-tab',
  name: 'Ezastatin 40/10mg 30 tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '40mg / 10mg',
  price: 135, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'ezastatin 40', 'adwia',
    'إزاستاتين ٤٠', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول', 'دهون', 'أدويا'
  ],
  usage: 'تركيبة مزدوجة اقتصادية وفعالة جداً لخفض الدهون الثلاثية والكوليسترول، خاصة للحالات التي تحتاج جرعة عالية من الستاتين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح باستخدامه للأطفال أقل من ١٨ سنة في هذه الجرعة.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'تجنب عصير الجريب فروت.',
    'أعد التقييم فوراً عن أي ألم عضلي.'
  ]
},

// 46. Ezastatin 10/10mg 30 tab.
{
  id: 'ezastatin-10-10-30-tab',
  name: 'Ezastatin 10/10mg 30 tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 96, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'ezastatin 10',
    'إزاستاتين ١٠', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول'
  ],
  usage: 'نفس التركيبة المزدوجة ولكن بجرعة مخففة تناسب البدايات أو الحالات المستقرة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'يمكن استخدامه للأطفال فوق ١٠ سنوات بجرعة محددة مع متابعة الدهون.';
    } else {
      return 'غير مخصص للأطفال أقل من ١٠ سنوات.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل.',
    'قد يسبب بعض الاضطرابات الهضمية البسيطة في بداية العلاج.'
  ]
},

// 47. Zetacolest 180 mg 30 f.c. tabs.
{
  id: 'zetacolest-180-30-tab',
  name: 'Zetacolest 180 mg 30 f.c. tabs.',
  genericName: 'Bempedoic Acid', 
  concentration: '180mg',
  price: 432, 
  matchKeywords: [
    'cholesterol', 'bempedoic acid', 'zetacolest', 'non-statin', 'statin intolerance',
    'زيتاكوليست', 'بيمبيدويك أسيد', 'بديل الستاتين', 'حساسية العضلات', 'كوليسترول'
  ],
  usage: 'دواء حديث لخفض الكوليسترول، مثالي للمرضى الذين يعانون من آلام العضلات بسبب أدوية الستاتين التقليدية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٨٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لم يتم اعتماده للأطفال حتى الآن.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'قد يرفع نسبة حمض اليوريك (النقرس) قليلاً، لذا يفضل شرب الماء بكثرة.',
    'ممنوع للحامل والمرضع.',
    'أعد التقييم إذا كان لديك تاريخ مرضي لتمزق الأوتار.'
  ]
},

// 48. Rosuvast 10mg 14 f.c.tab
{
  id: 'rosuvast-10-14-tab',
  name: 'Rosuvast 10mg 14 f.c.tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 98, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'rosuvast', 'global napi',
    'روسوفاست', 'روزوفتاتين', 'جلوبال نابي', 'كوليسترول'
  ],
  usage: 'يستخدم لخفض الكوليسترول الضار والوقاية من الجلطات، يتميز بفاعلية عالية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'الجرعة للأطفال (فوق ٨ سنوات) تُحدد حسب التشخيص والتحاليل (عادة ٥-١٠ مجم).';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'ممنوع للحامل.',
    'يستخدم بحذر لمرضى الكلى.',
    'أعد التقييم عن أي ألم عضلي مفاجئ.'
  ]
},

// 49. Atorstat 80mg 10 biscored tabs.
{
  id: 'atorstat-80-10-biscored-tab',
  name: 'Atorstat 80mg 10 biscored tabs.',
  genericName: 'Atorvastatin', 
  concentration: '80mg',
  price: 64, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'atorstat 80', 'high dose', 'biscored',
    'اتورستات ٨٠', 'جرعة عالية', 'جلطة', 'قرص مقسم', 'فاركو'
  ],
  usage: 'أعلى جرعة من الأتورفاستاتين، تستخدم عادةً بعد الجلطات القلبية مباشرة أو للحالات الشديدة جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال بجرعة ٨٠ مجم.';
    }
  },

  // تعليمات موجهة للمريض
  warnings: [
    'خطر آلام العضلات يزداد مع هذه الجرعة العالية، انتبه لأي أعراض.',
    'ممنوع للحامل.',
    'تجنب الجريب فروت تماماً.'
  ]
},
// 50. Atrozemb 40/10mg 30 f.c. tab.
{
  id: 'atrozemb-40-10-30-tab',
  name: 'Atrozemb 40/10mg 30 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '40mg / 10mg',
  price: 243, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atrozemb 40', 'chemipharm',
    'اتروزيمب ٤٠', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول', 'دهون مركبة', 'كيميفارم'
  ],
  usage: 'تركيبة قوية لخفض الدهون وحماية الشرايين، تجمع بين مادتين لتعطي فاعلية مضاعفة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح بهذه الجرعة العالية للأطفال.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'تجنب تناول كميات كبيرة من عصير الجريب فروت.',
    'أعد التقييم فوراً إذا شعرت بآلام في الجسم أو العضلات.'
  ]
},

// 51. Atrozemb 10/10mg 30 f.c. tab.
{
  id: 'atrozemb-10-10-30-tab',
  name: 'Atrozemb 10/10mg 30 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '10mg / 10mg',
  price: 228, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atrozemb 10',
    'اتروزيمب ١٠', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول'
  ],
  usage: 'علاج مزدوج بجرعة مبدئية لضبط مستويات الدهون في الدم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return 'مناسب للأطفال فوق ١٠ سنوات بجرعة قرص واحد يومياً بمتابعة التحاليل.';
    } else {
      return 'غير مخصص للأطفال أقل من ١٠ سنوات.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'قد يسبب غازات أو اضطراب بسيط في المعدة في بداية الاستخدام.'
  ]
},

// 52. Atrozemb 80/10mg 30 f.c. tab.
{
  id: 'atrozemb-80-10-30-tab',
  name: 'Atrozemb 80/10mg 30 f.c. tab.',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '80mg / 10mg',
  price: 282, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atrozemb 80', 'max dose',
    'اتروزيمب ٨٠', 'أقصى جرعة', 'جلطة', 'كوليسترول عالي جداً'
  ],
  usage: 'أقصى جرعة علاجية متاحة، تستخدم للحالات شديدة الخطورة أو بعد الأزمات القلبية لخفض الدهون لأقصى درجة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع استخدامه للأطفال والمراهقين.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'خطر آلام العضلات وارد جداً مع هذه الجرعة؛ أي ألم غير طبيعي يستدعي تقييم الفائدة والخطر فوراً.',
    'ممنوع للحامل والمرضع.',
    'يجب عمل تحليل وظائف كبد بانتظام.'
  ]
},

// 53. Atrozemb 20/10mg 30 f.c. tab
{
  id: 'atrozemb-20-10-30-tab',
  name: 'Atrozemb 20/10mg 30 f.c. tab',
  genericName: 'Atorvastatin + Ezetimibe', 
  concentration: '20mg / 10mg',
  price: 228, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'ezetimibe', 'atrozemb 20',
    'اتروزيمب ٢٠', 'اتورفاستاتين', 'ازيتيميب', 'كوليسترول'
  ],
  usage: 'الجرعة الأكثر شيوعاً للحالات المتوسطة، توفر توازناً ممتازاً بين الفاعلية والأمان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا ينصح ببدء العلاج بهذه الجرعة للأطفال.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'تجنب الأطعمة الغنية بالدهون المشبعة لتعزيز مفعول الدواء.'
  ]
},

// 54. Cemicresto 10 mg 14 f.c. tabs.
{
  id: 'cemicresto-10-14-tab',
  name: 'Cemicresto 10 mg 14 f.c. tabs.',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 50, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'cemicresto', 'economy', 'budget',
    'سيميكريستو', 'روزوفتاتين', 'رخيص', 'كوليسترول', 'سيميك'
  ],
  usage: 'بديل اقتصادي ممتاز لعلاج ارتفاع الدهون، يحتوي على مادة الروزوفتاتين القوية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return 'يمكن استخدامه للأطفال من ٨ سنوات فما فوق بجرعة ١٠ مجم.';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'يستخدم بحذر لمرضى الكلى.',
    'قد يسبب صداعاً خفيفاً في بداية العلاج ويزول مع الوقت.'
  ]
},
// 55. Cholerose Plus 5/10mg 28 f.c.tabs.
{
  id: 'cholerose-plus-5-10-28-tab',
  name: 'Cholerose Plus 5/10mg 28 f.c.tabs.',
  genericName: 'Rosuvastatin + Ezetimibe', 
  concentration: '5mg / 10mg', // Rosuvastatin 5, Ezetimibe 10
  price: 120, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'ezetimibe', 'cholerose plus 5',
    'كوليروز بلس ٥', 'روزوفتاتين', 'ازيتيميب', 'كوليسترول', 'بداية علاج'
  ],
  usage: 'تركيبة ذكية تبدأ بجرعة خفيفة من الستاتين مع مانع امتصاص الدهون، لتعطي فعالية عالية بأمان تام.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمكن استخدامه للمراهقين فوق ١٢ سنة بجرعة محددة مع متابعة الدهون دقيق.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'نادراً ما يسبب آلام عضلية مقارنة بالجرعات الأعلى، لكن انتبه لأي أعراض.'
  ]
},

// 56. Crestor 20mg 28 f.c.tab.
{
  id: 'crestor-20-28-tab',
  name: 'Crestor 20mg 28 f.c.tab.',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 600, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'crestor 20', 'astrazeneca', 'originator', 'high intensity',
    'كريستور ٢٠', 'روزوفتاتين', 'الاصلي', 'كوليسترول عالي', 'أسترازينيكا'
  ],
  usage: 'الدواء الأصلي والأقوى في فئته؛ يوفر أقصى درجات الحماية للقلب والشرايين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return '٢٠ مجم هي الحد الأقصى للأطفال، ويجب التدرج قبل الوصول لها.';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع نهائياً للحامل (يسبب تشوهات خطيرة).',
    'يجب عمل تحاليل دورية (دهون وظائف كبد) للتأكد من استجابة الجسم.',
    'تجنب مضادات الحموضة في نفس التوقيت.'
  ]
},

// 57. Epirovastin 10 mg 14 scored f.c. tab
{
  id: 'epirovastin-10-14-scored-tab',
  name: 'Epirovastin 10 mg 14 scored f.c. tab',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 56, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'epirovastin', 'eipico', 'scored',
    'ايبيروفاستين ١٠', 'ايبكو', 'روزوفتاتين', 'قرص مشقوق'
  ],
  usage: 'بديل مصري ممتاز لخفض الدهون. القرص "مشقوق" مما يسمح بكسره للحصول على جرعة ٥ مجم بسهولة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 96) {
      return 'مناسب جداً للأطفال لسهولة تقسيم الجرعة (٥ مجم).';
    } else {
      return 'غير مخصص للأطفال أقل من ٨ سنوات.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'يستخدم بحذر لمرضى قصور الكلى.'
  ]
},

// 58. Epirovastin 20 mg 14 f.c. tab
{
  id: 'epirovastin-20-14-tab',
  name: 'Epirovastin 20 mg 14 f.c. tab',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 76, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'epirovastin 20', 'high dose',
    'ايبيروفاستين ٢٠', 'روزوفتاتين', 'دهون ثلاثية'
  ],
  usage: 'جرعة عالية لخفض الدهون بفاعلية وسعر اقتصادي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'الجرعة القصوى للأطفال والمراهقين هي ٢٠ مجم، تستخدم بحذر.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'أعد التقييم فوراً عن أي ألم عضلي غير مبرر.'
  ]
},

// 59. Lipitor 20 mg 28 tab
{
  id: 'lipitor-20-28-tab',
  name: 'Lipitor 20 mg 28 tab',
  genericName: 'Atorvastatin', 
  concentration: '20mg',
  price: 348, 
  matchKeywords: [
    'cholesterol', 'atorvastatin', 'lipitor', 'pfizer', 'originator',
    'ليبيتور', 'أتورفاستاتين', 'فايزر', 'الاصلي', 'كوليسترول'
  ],
  usage: 'الدواء الأصلي للأتورفاستاتين، والأكثر مبيعاً في العالم تاريخياً لعلاج الدهون والوقاية من أمراض القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 120) {
      return '٢٠ مجم هي الحد الأقصى الموصى به للأطفال.';
    } else {
      return 'غير مخصص للأطفال أقل من ١٠ سنوات.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'تجنب عصير الجريب فروت.',
    'تابع وظائف الكبد بانتظام.'
  ]
},
// 60. Rosuvastatin 20mg 14 f.c. tab.
{
  id: 'rosuvastatin-20-14-tab',
  name: 'Rosuvastatin 20mg 14 f.c. tab.',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 118, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'statin', 'generic', 'high intensity',
    'روزوفتاتين ٢٠', 'كوليسترول', 'دهون', 'بديل الكريستور'
  ],
  usage: 'مستحضر يحمل الاسم العلمي (Generic)، يستخدم لخفض الدهون الثلاثية والكوليسترول وحماية القلب بجرعة قوية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return '٢٠ مجم هي الحد الأقصى للأطفال، ويجب البدء بجرعات أقل.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'قد يسبب ألماً بسيطاً في العضلات، لكن لو الألم شديد أعد التقييم.',
    'تجنب تناول مضادات الحموضة في نفس توقيت الدواء.'
  ]
},

// 61. Lipanthyl 145 mg 20 f.c.tabs.
{
  id: 'lipanthyl-145-20-tab',
  name: 'Lipanthyl 145 mg 20 f.c.tabs.',
  genericName: 'Fenofibrate (Nanocrystallized)', 
  concentration: '145mg',
  price: 174, 
  matchKeywords: [
    'triglycerides', 'fenofibrate', 'lipanthyl 145', 'penta', 'abbott',
    'ليبانثيل ١٤٥', 'فينوفايبرات', 'دهون ثلاثية', 'أبوت', 'نانو'
  ],
  usage: 'الجيل الأحدث من الفينوفايبرات بتقنية النانو؛ لامتصاص فائق وفعالية قصوى في خفض الدهون الثلاثية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٤٥ مجم مرة يومياً مع الأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل والمرضع.',
    'قد يسبب حساسية للضوء عند البعض، يفضل استخدام واقي شمس.',
    'يستخدم بحذر لمرضى حصوات المرارة.'
  ]
},

// 62. Nexirozova 10mg 14 f.c. tabs
{
  id: 'nexirozova-10-14-tab',
  name: 'Nexirozova 10mg 14 f.c. tabs',
  genericName: 'Rosuvastatin', 
  concentration: '10mg',
  price: 58, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'nexirozova', 'economy',
    'نيكسيروزوفا', 'روزوفتاتين', 'كوليسترول', 'اقتصادي'
  ],
  usage: 'بديل اقتصادي لخفض الكوليسترول والوقاية من مشاكل الشرايين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 25,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للأطفال فوق ٨ سنوات: الجرعة تحدد طبياً (٥-١٠ مجم).';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'تابع وظائف الكبد إذا شعرت بإرهاق دائم.'
  ]
},

// 63. Nexirozova 20 mg 14 f.c tabs
{
  id: 'nexirozova-20-14-tab',
  name: 'Nexirozova 20 mg 14 f.c tabs',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 53, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'nexirozova 20', 'high dose',
    'نيكسيروزوفا ٢٠', 'روزوفتاتين', 'دهون عالية'
  ],
  usage: 'جرعة عالية الفعالية لخفض الدهون بسعر منافس جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'الجرعة القصوى للأطفال ٢٠ مجم (بجرعة محددة مع متابعة الدهون).';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'أعد التقييم عن أي ألم بالعضلات.'
  ]
},

// 64. Gypravastin 20 mg 7 f.c. tabs.
{
  id: 'gypravastin-20-7-tab',
  name: 'Gypravastin 20 mg 7 f.c. tabs.',
  genericName: 'Rosuvastatin', 
  concentration: '20mg',
  price: 32, 
  matchKeywords: [
    'cholesterol', 'rosuvastatin', 'gypravastin', 'trial pack',
    'جيبرافاستن', 'روزوفتاتين', 'شريط واحد', 'كوليسترول'
  ],
  usage: 'عبوة صغيرة (شريط واحد) تحتوي على جرعة قوية من الروزوفتاتين، مناسبة كبداية علاج أو للتجربة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERLIPIDEMICS, 
  form: 'Film-coated Tablet',

  minAgeMonths: 120, 
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يستخدم للأطفال فوق ٨ سنوات بحذر في الجرعات العالية.';
    }
  },

  // تعليمات للمريض
  warnings: [
    'ممنوع للحامل.',
    'يجب حفظ الدواء بعيداً عن الرطوبة.'
  ]
}

];

