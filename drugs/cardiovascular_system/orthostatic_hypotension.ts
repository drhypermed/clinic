
import { Medication, Category } from '../../types';

export const ORTHOSTATIC_HYPOTENSION_MEDS: Medication[] = [
  

  // 1. Midodrine 2.5mg 20 Tablets
{
id: 'midodrine-2-5-tab',
name: 'Midodrine 2.5mg 20 Tablets',
genericName: 'Midodrine Hydrochloride', 
concentration: '2.5mg',
price: 50, 
matchKeywords: [
'orthostatic hypotension', 'midodrine', 'gutron', 'vasopressor', 'low blood pressure', 'dizziness',
'ميدودرين', 'ضغط واطي', 'هبوط الضغط الوقوفي', 'دوخة عند الوقوف', 'رفع الضغط'
],
usage: 'علاج هبوط الضغط الانتصابي (الوقوفي) الشديد الذي يسبب دوخة أو إغماء، حيث يعمل على تضييق الأوعية الدموية لزيادة ضغط الدم.',
timing: '٣ مرات يومياً – مزمن',
category: Category.VASOPRESSORS,
form: 'Tablet',

minAgeMonths: 216,
maxAgeMonths: 1200,
minWeight: 45,
maxWeight: 250,

calculationRule: (weight, ageMonths) => {
  if (ageMonths >= 216) return '١ قرص ٢.٥ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  return 'لا يُنصح للأطفال دون ١٨ سنة.';
},

warnings: [
'أخطر عرض جانبي هو "ارتفاع ضغط الدم أثناء الاستلقاء" (Supine Hypertension)، لذا ممنوع تماماً أخذ جرعة قبل النوم.',
'يجب قياس ضغط الدم بانتظام في وضعيتي الوقوف والاستلقاء أثناء فترة العلاج.',
'يستخدم بحذر شديد مع مرضى الكلى، البروستاتا (قد يسبب احتباس بول)، ومرضى السكري.',
'أوقف فوراً عند صداع مستمر، خفقان، أو رؤية مشوشة؛ أعد قياس الضغط (وقوف/استلقاء) وقلّل الجرعة أو أوقف.'
]
},

// 2. Corasore 150mg 20 tab
{
id: 'corasore-150-tab',
name: 'Corasore 150mg 20 tab',
genericName: 'Heptaminol Hydrochloride', 
concentration: '150mg',
price: 46, 
matchKeywords: [
'corasore', 'heptaminol', 'low blood pressure', 'hypotension', 'tonic', 'fainting',
'كوراثور', 'هيبتامينول', 'ضغط واطي', 'هبوط الضغط', 'مقوي للقلب', 'منشط للدورة الدموية'
],
usage: 'منشط لعضلة القلب والدورة الدموية؛ يستخدم لعلاج هبوط الضغط الحاد أو المزمن، وحالات الإغماء البسيط والنهجان.',
timing: '٢–٣ مرات يومياً – مزمن',
category: Category.VASOPRESSORS,
form: 'Tablet',

minAgeMonths: 144,
maxAgeMonths: 1200,
minWeight: 35,
maxWeight: 250,

calculationRule: (weight, ageMonths) => {
  if (ageMonths >= 180) return '١ قرص ١٥٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  if (ageMonths >= 144) return '١ قرص ١٥٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  return 'أطفال دون ١٢ سنة: يُفضّل كوراثور نقط.';
},

warnings: [
'تحذير هام للرياضيين: المادة الفعالة تندرج ضمن قائمة المنشطات المحظورة في المنافسات الرياضية.',
'يستخدم بحذر شديد مع مرضى الضغط المرتفع أو زيادة نشاط الغدة الدرقية.',
'قد يسبب الدواء خفقان بسيط في القلب أو أرق إذا تم تناوله في وقت متأخر.',
'الحمل/الرضاعة: لا توجد دراسات كافية؛ يُستخدم عند الضرورة فقط بأقل جرعة وأقصر مدة.'
]
},

// 3. Corasore 150mg/ml oral drops 15 ml
{
id: 'corasore-150-drops',
name: 'Corasore 150mg/ml oral drops 15 ml',
genericName: 'Heptaminol Hydrochloride', 
concentration: '150mg/ml',
price: 40, 
matchKeywords: [
'corasore drops', 'heptaminol drops', 'low blood pressure infants', 'hypotension', 'fainting',
'كوراثور نقط', 'هيبتامينول نقط', 'ضغط واطي للأطفال', 'هبوط الضغط', 'دوخة'
],
usage: 'منشط للدورة الدموية وعضلة القلب؛ يستخدم لرفع ضغط الدم في حالات الهبوط الحاد والمزمن، والإغماء، ولتحسين التركيز الناتج عن ضعف التروية الدموية.',
timing: '٢–٣ مرات يومياً – مزمن',
category: Category.VASOPRESSORS,
form: 'Oral Drops',

minAgeMonths: 0,
maxAgeMonths: 1200,
minWeight: 3,
maxWeight: 250,

calculationRule: (weight, ageMonths) => {
  if (ageMonths >= 180) return '٥٠ نقطة ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  if (ageMonths >= 12) return '١٥ نقطة ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  if (ageMonths < 12) return '٥–٨ نقط مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  return 'حسب التشخيص ووزن الرضيع.';
},

warnings: [
'ممنوع استخدامه في حالات فرط نشاط الغدة الدرقية أو الجلوكوما (المياه الزرقاء).',
'تحذير للرياضيين: المادة الفعالة تظهر في اختبارات المنشطات (Doping test).',
'قد يسبب زيادة في ضربات القلب أو عصبية بسيطة في بعض الأطفال.',
'يجب عدم تجاوز الجرعة المقررة لتجنب حدوث صداع أو ارتفاع مفاجئ في الضغط.'
]
},

// 4. Vascon 5mg 20 tab.
{
id: 'vascon-5-tab',
name: 'Vascon 5mg 20 tab.',
genericName: 'Midodrine Hydrochloride', 
concentration: '5mg',
price: 47, 
matchKeywords: [
'vascon', 'midodrine', 'orthostatic hypotension', 'low blood pressure', 'fainting',
'فاسكون', 'واسوكون', 'ميدودرين ٥', 'ضغط واطي', 'هبوط الضغط عند الوقوف'
],
usage: 'علاج فعال لهبوط الضغط الانتصابي الشديد؛ يعمل على تضييق الأوعية الدموية الطرفية لرفع الضغط ومنع الدوار عند الوقوف.',
timing: '٣ مرات يومياً – مزمن',
category: Category.VASOPRESSORS,
form: 'Tablet',

minAgeMonths: 216,
maxAgeMonths: 1200,
minWeight: 45,
maxWeight: 250,

calculationRule: (weight, ageMonths) => {
if (ageMonths >= 216) {
return '١ قرص ٥ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
} else {
return 'لا يُوصى به تحت ١٨ سنة (عدم ثبوت الأمان). استخدم بديلاً (كوراثور نقط، سوائل، ضمادات ضاغطة) أو احوّل لطبيب أطفال.';
}
},

warnings: [
'خطر حدوث ارتفاع شديد في الضغط عند الاستلقاء (Supine Hypertension)، لذا ممنوع تماماً الجرعة قبل النوم.',
'يستخدم بحذر في حالات احتباس البول أو تضخم البروستاتا لأنه قد يزيد من صعوبة التبول.',
'يجب مراقبة وظائف الكلى وضغط الدم بانتظام أثناء فترة العلاج.',
'توقف عن استخدامه فوراً إذا ظهرت أعراض مثل حكة شديدة في فروة الرأس، قشعريرة، أو اضطراب في ضربات القلب.'
]
},

// 5. Corasore-n 305mg/ml oral drops 15 ml
{
id: 'corasore-n-305-drops',
name: 'Corasore-n 305mg/ml oral drops 15 ml',
genericName: 'Heptaminol Hydrochloride', 
concentration: '305mg/ml',
price: 46, 
matchKeywords: [
'corasore n', 'heptaminol 305', 'low blood pressure', 'hypotension', 'cardiac tonic',
'كوراثور ان', 'كوراثور ن', 'هيبتامينول ٣٠٥', 'ضغط واطي جدا', 'منشط للقلب'
],
usage: 'منشط قوي للدورة الدموية وعضلة القلب بتركيز مضاعف؛ يستخدم لعلاج هبوط الضغط الحاد والمزمن وحالات الإجهاد البدني الذي يؤثر على الضغط.',
timing: '٢–٣ مرات يومياً – مزمن',
category: Category.VASOPRESSORS,
form: 'Oral Drops',

minAgeMonths: 144,
maxAgeMonths: 1200,
minWeight: 35,
maxWeight: 250,

calculationRule: (weight, ageMonths) => {
  if (ageMonths >= 180) return '٢٥ نقطة ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  if (ageMonths >= 144) return '١٥ نقطة مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  return 'أطفال/رضع: يُفضّل كوراثور ١٥٠ ملجم.';
},

warnings: [
'تركيز هذا الدواء (305mg) هو ضعف تركيز الكوراثور العادي، لذا يجب الحذر الشديد عند تحديد عدد النقط.',
'ممنوع تماماً في حالات فرط نشاط الغدة الدرقية أو زيادة ضغط العين (الجلوكوما).',
'قد يسبب سرعة في ضربات القلب أو شعور بالقلق إذا تم تجاوز الجرعة.',
'ممنوع استخدامه للرياضيين المشاركين في بطولات رسمية لأنه يظهر في تحليل المنشطات.'
]
}


];

