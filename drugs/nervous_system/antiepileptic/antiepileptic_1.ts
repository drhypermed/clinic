
import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

const fixed = (text: string) => (_w: number, _a: number) => text;

const mgPerMlFromConcentration = (concentration: string): number | null => {
	const normalized = concentration.toLowerCase().replace(/\s/g, '');

	// Examples: 100mg/ml, 500mg/5ml, 10mg/100ml
	const match = normalized.match(/(\d+(?:\.\d+)?)mg\/(\d+(?:\.\d+)?)ml/);
	if (!match) return null;
	const mg = Number(match[1]);
	const ml = Number(match[2]);
	if (!Number.isFinite(mg) || !Number.isFinite(ml) || ml <= 0) return null;
	return mg / ml;
};

const formatMl = (vol: number) => {
	const rounded = roundVol(vol);
	const s = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
	return `${toAr(s)} مل`;
};

const levetiracetamSolutionRule = (concentration: string) => {
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const startPerDoseMg = Math.round(w * 10);
		const maxPerDoseMg = Math.round(w * 30);
		const startMl = mgPerMl ? startPerDoseMg / mgPerMl : null;
		const maxMl = mgPerMl ? maxPerDoseMg / mgPerMl : null;
		return (
			`بداية للأطفال/الكبار: ${toAr(startPerDoseMg)} مجم كل ١٢ ساعة. ` +
			`يمكن الزيادة تدريجياً حتى ${toAr(maxPerDoseMg)} مجم كل ١٢ ساعة. ` +
			`الحد الأقصى المعتاد: ${toAr(Math.round(w * 60))} مجم/يوم.` +
			(startMl !== null && maxMl !== null
				? ` (يعادل تقريباً ${formatMl(startMl)} لكل جرعة إلى ${formatMl(maxMl)} لكل جرعة).`
				: '')
		);
	};
};

const valproateSolutionRule = (concentration: string) => {
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const startDailyMg = Math.round(w * 10);
		const targetDailyMg = Math.round(w * 20);
		const maxDailyMg = Math.round(w * 60);
		const startPerDoseMg = Math.round(startDailyMg / 2);
		const targetPerDoseMg = Math.round(targetDailyMg / 2);
		const startMl = mgPerMl ? startPerDoseMg / mgPerMl : null;
		const targetMl = mgPerMl ? targetPerDoseMg / mgPerMl : null;
		return (
			`بداية: ${toAr(startDailyMg)} مجم/يوم تُقسم على جرعتين (كل ١٢ ساعة). ` +
			`جرعة شائعة: ${toAr(targetDailyMg)} مجم/يوم. ` +
			`الحد الأقصى: ${toAr(maxDailyMg)} مجم/يوم.` +
			(startMl !== null && targetMl !== null
				? ` (يعادل تقريباً ${formatMl(startMl)} لكل جرعة بدايةً، ثم ${formatMl(targetMl)} لكل جرعة).`
				: '')
		);
	};
};

const ANTIEPILEPTIC_CORE_WARNINGS = [
	'لا يوقف فجأة أبداً (خطر نوبات صرع ارتدادية). يتم السحب التدريجي فقط.',
	'راقب تغيرات المزاج/السلوك خصوصاً ببداية العلاج.',
];

const VALPROATE_WARNINGS = [
	...ANTIEPILEPTIC_CORE_WARNINGS,
	'ممنوع في الحمل إلا للضرورة القصوى وبأقل جرعة مع متابعة (خطر تشوهات جنينية خطيرة وتأخر نمائي).',
	'يلزم متابعة وظائف الكبد/الصفائح عند الاستخدام طويل المدى.',
	'يُحذر من التهاب البنكرياس (ألم بطن شديد مفاجئ).',
];

const GABAPENTINOID_WARNINGS = [
	...ANTIEPILEPTIC_CORE_WARNINGS,
	'قد يسبب نعاس/دوخة؛ تجنب القيادة إذا حدث ذلك.',
	'يجب السحب التدريجي (لا يوقف فجأة).',
	'قد يحتاج ضبط جرعة في قصور الكلى.',
];

export const ANTIEPILEPTIC_1: Medication[] = [
	// 1) depakine chrono 500mg 30 scored prolonged release tablets
	{
		id: 'depakine-chrono-500-pr-30-tabs',
		name: 'depakine chrono 500mg 30 scored prolonged release tablets',
		genericName: 'sodium valproate',
		concentration: '500mg',
		price: 144,
		matchKeywords: ['depakine chrono 500', 'depakine chrono', 'sodium valproate', 'valproate', 'صرع', 'epilepsy', 'تشنجات', 'صداع نصفي', 'ثنائي القطب', 'فالبروات', 'ديباكين', '#anti-epileptic', '#fatty acid'],
		usage: 'مضاد للصرع/مثبت للمزاج (فالبروات) ممتد المفعول.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'جرعة إرشادية للكبار: قرص واحد (٥٠٠ مجم) مرة يومياً مع الطعام. يمكن الزيادة إلى قرص واحد كل ١٢ ساعة. الحد الأقصى: ٦٠ مجم/كجم/يوم.'
		),
		warnings: VALPROATE_WARNINGS,
	},

	// 2) gralipentin xr 300mg 30 f.c. tabs.
	{
		id: 'gralipentin-xr-300-30-tabs',
		name: 'gralipentin xr 300mg 30 f.c. tabs.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 135,
		matchKeywords: ['gralipentin xr 300', 'gabapentin xr 300', 'gabapentin', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين ممتد المفعول (صرع/آلام أعصاب حسب الحالة).',
		timing: 'مرة يومياً مع الأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٣٠٠ مجم) مرة يومياً مع وجبة. لا يُكسر/يُمضغ. لا يوقف فجأة.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'لا يوقف فجأة.'],
	},

	// 3) gralipentin xr 600 mg 30 f.c. tabs.
	{
		id: 'gralipentin-xr-600-30-tabs',
		name: 'gralipentin xr 600 mg 30 f.c. tabs.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 198,
		matchKeywords: ['gralipentin xr 600', 'gabapentin xr 600', 'gabapentin', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين ممتد المفعول (صرع/آلام أعصاب حسب الحالة).',
		timing: 'مرة يومياً مع الأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٦٠٠ مجم) مرة يومياً مع وجبة. لا يُكسر/يُمضغ. لا يوقف فجأة.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'لا يوقف فجأة.'],
	},

	// 4) kativarox 10mg/100 ml solution
	{
		id: 'kativarox-brivaracetam-10mg-100ml-solution',
		name: 'kativarox 10mg/100 ml solution',
		genericName: 'brivaracetam',
		concentration: '10mg/100ml',
		price: 122,
		matchKeywords: ['kativarox solution', 'brivaracetam oral solution', 'brivaracetam', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام محلول فموي لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة للكبار: ٥٠ مجم كل ١٢ ساعة. نطاق الجرعة: ٢٥–١٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٢٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'راقب تغيرات المزاج.'],
	},

	// 5) conventin 100mg 30 cap.
	{
		id: 'conventin-100-30-caps',
		name: 'conventin 100mg 30 cap.',
		genericName: 'gabapentin',
		concentration: '100mg',
		price: 54,
		matchKeywords: ['conventin 100', 'gabapentin 100', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'تدرج الجرعة للكبار: يوم ١: ٣٠٠ مجم مساءً، يوم ٢: ٣٠٠ مجم مرتين يومياً، يوم ٣: ٣٠٠ مجم كل ٨ ساعات. الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'
		),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 6) conventin 300mg 30 caps.
	{
		id: 'conventin-300-30-caps',
		name: 'conventin 300mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 114,
		matchKeywords: ['conventin 300', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'تدرج الجرعة للكبار: يوم ١: ٣٠٠ مجم مساءً، يوم ٢: ٣٠٠ مجم مرتين يومياً، يوم ٣: كبسولة ٣٠٠ مجم كل ٨ ساعات. الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'
		),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 7) conventin xr 300mg 30 tabs.
	{
		id: 'conventin-xr-300-30-tabs',
		name: 'conventin xr 300mg 30 tabs.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 135,
		matchKeywords: ['conventin xr 300', 'gabapentin xr 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين ممتد المفعول.',
		timing: 'مرة يومياً مع الأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٣٠٠ مجم) مرة يومياً مع وجبة. لا يُكسر/يُمضغ. لا يوقف فجأة.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'لا يوقف فجأة.'],
	},

	// 8) depakine 200mg 40 gastro-resistant tabs.
	{
		id: 'depakine-200-gr-40-tabs',
		name: 'depakine 200mg 40 gastro-resistant tabs.',
		genericName: 'sodium valproate',
		concentration: '200mg',
		price: 80,
		matchKeywords: ['depakine 200', 'sodium valproate 200', '#anti-epileptic', '#fatty acid'],
		usage: 'فالبروات لعلاج الصرع العام/الجزئي.',
		timing: 'كل ٨–١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Gastro-resistant Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة للكبار: ٢٠٠–٤٠٠ مجم ٢–٣ مرات يومياً مع الطعام. الحد الأقصى: ٦٠ مجم/كجم/يوم.'),
		warnings: ['ممنوع في الحمل إلا للضرورة القصوى وبأقل جرعة مع متابعة (خطر تشوهات).', 'يلزم متابعة وظائف الكبد/الصفائح.'],
	},

	// 9) gabimash 800 mg 30 tabs.
	{
		id: 'gabimash-800-30-tabs',
		name: 'gabimash 800 mg 30 tabs.',
		genericName: 'gabapentin',
		concentration: '800mg',
		price: 216,
		matchKeywords: ['gabimash 800', 'gabapentin 800', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٨٠٠ مجم: قرص واحد كل ٨ ساعات = ٢٤٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 10) gaptin 100 mg 30 caps.
	{
		id: 'gaptin-100-30-caps',
		name: 'gaptin 100 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '100mg',
		price: 81,
		matchKeywords: ['gaptin 100', 'gabapentin 100', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'تدرج الجرعة للكبار: يوم ١: ٣٠٠ مجم مساءً، يوم ٢: ٣٠٠ مجم مرتين يومياً، يوم ٣: ٣٠٠ مجم كل ٨ ساعات. الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'
		),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 11) gaptin 300 mg 30 caps
	{
		id: 'gaptin-300-30-caps',
		name: 'gaptin 300 mg 30 caps',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 126,
		matchKeywords: ['gaptin 300', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('كبسولة ٣٠٠ مجم كل ٨ ساعات. يمكن الزيادة إلى ٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 12) gaptin 400 mg 30 caps.
	{
		id: 'gaptin-400-30-caps',
		name: 'gaptin 400 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 156,
		matchKeywords: ['gaptin 400', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٤٠٠ مجم: كبسولة ٤٠٠ مجم كل ٨ ساعات = ١٢٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 13) tiratam 500mg 30 f.c. tablets
	{
		id: 'tiratam-500-30-tabs',
		name: 'tiratam 500mg 30 f.c. tablets',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 222,
		matchKeywords: ['tiratam 500 30', 'tiratam 500', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) كل ١٢ ساعة. يمكن زيادة ٥٠٠ مجم/جرعة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 14) neuroglopentin 100 mg 30 caps.
	{
		id: 'neuroglopentin-100-30-caps',
		name: 'neuroglopentin 100 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '100mg',
		price: 54,
		matchKeywords: ['neuroglopentin 100', 'gabapentin 100', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'تدرج الجرعة للكبار: يوم ١: ٣٠٠ مجم مساءً، يوم ٢: ٣٠٠ مجم مرتين يومياً، يوم ٣: ٣٠٠ مجم كل ٨ ساعات. الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'
		),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 15) neuroglopentin 400mg 30 caps.
	{
		id: 'neuroglopentin-400-30-caps',
		name: 'neuroglopentin 400mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 147,
		matchKeywords: ['neuroglopentin 400', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٤٠٠ مجم: كبسولة ٤٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 16) oxaleptal 600mg 30 f.c. tabs.
	{
		id: 'oxaleptal-600-30-tabs',
		name: 'oxaleptal 600mg 30 f.c. tabs.',
		genericName: 'oxcarbazepine',
		concentration: '600mg',
		price: 303,
		matchKeywords: ['oxaleptal 600', 'oxcarbazepine 600', '#anti-epileptic', '#carboxamides'],
		usage: 'أوكسكاربازيبين لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ابدأ ٣٠٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ٦٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٢٠٠ مجم كل ١٢ ساعة (٢٤٠٠ مجم/يوم).'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم الدم خصوصاً كبار السن/مع مدرات.'],
	},

	// 17) kativarox 100 mg 30 f.c.tabs.
	{
		id: 'kativarox-100-30-tabs',
		name: 'kativarox 100 mg 30 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '100mg',
		price: 258,
		matchKeywords: ['kativarox 100', 'brivaracetam 100', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠ مجم) كل ١٢ ساعة. نطاق الجرعة: ٢٥–١٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٢٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'راقب تغيرات المزاج.'],
	},

	// 18) tegretol 200mg 30 tab.
	{
		id: 'tegretol-200-30-tabs',
		name: 'tegretol 200mg 30 tab.',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 89,
		matchKeywords: ['tegretol 200', 'carbamazepine 200', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين لعلاج الصرع وآلام العصب الخامس.',
		timing: 'كل ٨–١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ابدأ ٢٠٠ مجم مرتين يومياً. يمكن زيادة ٢٠٠ مجم/يوم أسبوعياً حتى ٤٠٠ مجم مرتين يومياً. الجرعة المعتادة: ٨٠٠–١٢٠٠ مجم/يوم مقسمة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'نادرًا: اضطرابات دم/طفح جلدي شديد (اطلب رعاية إذا ظهر طفح شديد).'],
	},

	// 19) tegretol cr 400mg 20 f.c. divitabs
	{
		id: 'tegretol-cr-400-20-divitabs',
		name: 'tegretol cr 400mg 20 f.c. divitabs',
		genericName: 'carbamazepine',
		concentration: '400mg',
		price: 106,
		matchKeywords: ['tegretol cr 400', 'carbamazepine cr 400', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين ممتد المفعول.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار (CR): ابدأ ٢٠٠ مجم كل ١٢ ساعة، ويمكن الزيادة تدريجياً حتى ٤٠٠–٦٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.'],
	},

	// 20) tegretol cr 200mg 20 f.c. divitab.
	{
		id: 'tegretol-cr-200-20-divitabs',
		name: 'tegretol cr 200mg 20 f.c. divitab.',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 61,
		matchKeywords: ['tegretol cr 200', 'carbamazepine cr 200', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين ممتد المفعول.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار (CR): قرص ٢٠٠ مجم كل ١٢ ساعة كبداية. يمكن الزيادة تدريجياً حتى ٤٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.'],
	},

	// 21) tiratam 100mg/ml oral solution 120 ml
	{
		id: 'tiratam-100mg-ml-oral-solution-120ml',
		name: 'tiratam 100mg/ml oral solution 120 ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 120,
		matchKeywords: ['tiratam oral solution', 'levetiracetam oral solution', 'levetiracetam 100mg/ml', '#anti-epileptic'],
		usage: 'ليفِتيراسيتام محلول فموي لنوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: levetiracetamSolutionRule('100mg/ml'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 22) tiratam xr 500mg 20 f.c.tabs.
	{
		id: 'tiratam-xr-500-20-tabs',
		name: 'tiratam xr 500mg 20 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 148,
		matchKeywords: ['tiratam xr 500 20', 'levetiracetam xr 500', '#anti-epileptic'],
		usage: 'ليفِتيراسيتام ممتد المفعول.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) مرة يومياً (XR). يمكن زيادة الجرعة تدريجياً حتى ١٥٠٠ مجم مرة يومياً. الحد الأقصى: ٣٠٠٠ مجم/يوم. لا يُكسر/يُسحق.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 23) conventin 400mg 30 caps.
	{
		id: 'conventin-400-30-caps',
		name: 'conventin 400mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 150,
		matchKeywords: ['conventin 400', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٤٠٠ مجم: كبسولة ٤٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 24) dekadel chrono 500mg 30 e.c.tab
	{
		id: 'dekadel-chrono-500-30-ec-tabs',
		name: 'dekadel chrono 500mg 30 e.c.tab',
		genericName: 'sodium valproate & valproic acid',
		concentration: '500mg',
		price: 131,
		matchKeywords: ['dekadel chrono 500', 'valproate chrono', '#anti-epileptic', '#fatty acid'],
		usage: 'فالبروات ممتد المفعول لعلاج الصرع.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Enteric Coated Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'جرعة إرشادية للكبار: قرص واحد (٥٠٠ مجم) مرة يومياً مع الطعام. يمكن الزيادة إلى قرص واحد كل ١٢ ساعة. الحد الأقصى: ٦٠ مجم/كجم/يوم.'
		),
		warnings: ['ممنوع في الحمل إلا للضرورة القصوى وبأقل جرعة مع متابعة (خطر تشوهات).', 'يلزم متابعة وظائف الكبد/الصفائح.'],
	},

	// 25) depakine 200mg/ml oral solution 40 ml
	{
		id: 'depakine-200mg-ml-oral-solution-40ml',
		name: 'depakine 200mg/ml oral solution 40 ml',
		genericName: 'sodium valproate',
		concentration: '200mg/ml',
		price: 47,
		matchKeywords: ['depakine oral solution 200mg/ml', 'sodium valproate syrup', '#anti-epileptic', '#fatty acid'],
		usage: 'فالبروات محلول فموي لعلاج الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: valproateSolutionRule('200mg/ml'),
		warnings: ['ممنوع في الحمل إلا للضرورة القصوى وبأقل جرعة مع متابعة (خطر تشوهات).', 'يلزم متابعة وظائف الكبد/الصفائح.'],
	},

	// 26) gabimash 300mg 30 tab
	{
		id: 'gabimash-300-30-tabs',
		name: 'gabimash 300mg 30 tab',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 114,
		matchKeywords: ['gabimash 300', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٣٠٠ مجم: قرص واحد كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 27) gabimash 800mg 20 tab
	{
		id: 'gabimash-800-20-tabs',
		name: 'gabimash 800mg 20 tab',
		genericName: 'gabapentin',
		concentration: '800mg',
		price: 144,
		matchKeywords: ['gabimash 800 20', 'gabapentin 800', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٨٠٠ مجم: قرص واحد كل ٨ ساعات = ٢٤٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 28) neuroglopentin 300 mg 30 caps.
	{
		id: 'neuroglopentin-300-30-caps',
		name: 'neuroglopentin 300 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 111,
		matchKeywords: ['neuroglopentin 300', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('كبسولة ٣٠٠ مجم كل ٨ ساعات. يمكن الزيادة إلى ٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 29) neurontin 300mg 20 caps
	{
		id: 'neurontin-300-20-caps',
		name: 'neurontin 300mg 20 caps',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 108,
		matchKeywords: ['neurontin 300 20', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'الدواء الأصلي من جابابنتين.',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('كبسولة ٣٠٠ مجم كل ٨ ساعات. يمكن الزيادة إلى ٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 30) kativarox 50 mg 30 f.c.tabs.
	{
		id: 'kativarox-50-30-tabs',
		name: 'kativarox 50 mg 30 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '50mg',
		price: 258,
		matchKeywords: ['kativarox 50', 'brivaracetam 50', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠ مجم) كل ١٢ ساعة. نطاق الجرعة: ٢٥–١٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٢٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'راقب تغيرات المزاج.'],
	},

	// 31) tiratam 1000 mg 20 f.c.tabs.
	{
		id: 'tiratam-1000-20-tabs',
		name: 'tiratam 1000 mg 20 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 104,
		matchKeywords: ['tiratam 1000 20', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع (جرعة أعلى).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 32) tiratam 500mg 20 f.c. tablets
	{
		id: 'tiratam-500-20-tabs',
		name: 'tiratam 500mg 20 f.c. tablets',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 100,
		matchKeywords: ['tiratam 500 20', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) كل ١٢ ساعة. يمكن زيادة ٥٠٠ مجم/جرعة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 33) tiratam 750mg 20 f.c. tablets
	{
		id: 'tiratam-750-20-tabs',
		name: 'tiratam 750mg 20 f.c. tablets',
		genericName: 'levetiracetam',
		concentration: '750mg',
		price: 148,
		matchKeywords: ['tiratam 750 20', 'levetiracetam 750', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٧٥٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 34) kativarox 50 mg vial
	{
		id: 'kativarox-50mg-vial',
		name: 'kativarox 50 mg vial',
		genericName: 'brivaracetam',
		concentration: '50mg',
		price: 112,
		matchKeywords: ['kativarox vial 50', 'brivaracetam iv', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام حقن (عند تعذر البلع/داخل المستشفى).',
		timing: 'كل ١٢ ساعة حقن (بديل مؤقت للفموي)',
		category: Category.ANTIEPILEPTICS,
		form: 'Vial',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم وريدياً كل ١٢ ساعة (بديل للفموي). نطاق الجرعة: ٢٥–١٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٢٠٠ مجم/يوم.'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'راقب النعاس/الدوخة وتغيرات المزاج.'],
	},

	// 35) tiratam 1000mg 30 f.c.tabs.
	{
		id: 'tiratam-1000-30-tabs',
		name: 'tiratam 1000mg 30 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 288,
		matchKeywords: ['tiratam 1000 30', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع (عبوة ٣٠ قرص).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 36) tiratam xr 750mg 20 f.c.tabs.
	{
		id: 'tiratam-xr-750-20-tabs',
		name: 'tiratam xr 750mg 20 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '750mg',
		price: 148,
		matchKeywords: ['tiratam xr 750 20', 'levetiracetam xr 750', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام ممتد المفعول.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٧٥٠ مجم) مرة يومياً (XR). يمكن زيادة الجرعة تدريجياً حتى ١٥٠٠ مجم مرة يومياً. الحد الأقصى: ٣٠٠٠ مجم/يوم. لا يُكسر/يُسحق.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 37) amotril 2mg 30 tab.
	{
		id: 'amotril-2-30-tabs',
		name: 'amotril 2mg 30 tab.',
		genericName: 'clonazepam',
		concentration: '2mg',
		price: 24,
		matchKeywords: ['amotril 2', 'clonazepam 2', '#anti-epileptic', '#benzodiazepines'],
		usage: 'كلونازيبام (بنزوديازيبين) لعلاج بعض أنواع الصرع/القلق حسب الحالة.',
		timing: 'كل ٨–١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ابدأ ٠٫٥ مجم مرتين يومياً (يعادل ¼ قرص ٢ مجم). يمكن الزيادة ٠٫٥–١ مجم كل ٣ أيام حتى السيطرة. الحد الأقصى: ٢٠ مجم/يوم.'),
		warnings: ['يسبب نعاس/دوخة.', 'قد يسبب اعتماد/أعراض انسحاب إذا أوقف فجأة.'],
	},

	// 38) andovimpamide 100 mg 30 tabs.
	{
		id: 'andovimpamide-100-30-tabs',
		name: 'andovimpamide 100 mg 30 tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 273,
		matchKeywords: ['andovimpamide 100 30', 'lacosamide 100', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 39) conventin xr 600mg 30 tabs.
	{
		id: 'conventin-xr-600-30-tabs',
		name: 'conventin xr 600mg 30 tabs.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 198,
		matchKeywords: ['conventin xr 600', 'gabapentin xr 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين ممتد المفعول.',
		timing: 'مرة يومياً مع الأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٦٠٠ مجم) مرة يومياً مع وجبة. لا يُكسر/يُمضغ. لا يوقف فجأة.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'لا يوقف فجأة.'],
	},

	// 40) conviban 25mg 30 f.c. tabs
	{
		id: 'conviban-25-30-tabs',
		name: 'conviban 25mg 30 f.c. tabs',
		genericName: 'topiramate',
		concentration: '25mg',
		price: 39,
		matchKeywords: ['conviban 25', 'topiramate 25', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع/الصداع النصفي حسب الحالة.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٢٥ مجم ليلاً لمدة أسبوع، ثم ٢٥ مجم مرتين يومياً. زِد ٢٥–٥٠ مجم/الأسبوع حتى ٥٠–١٠٠ مجم مرتين يومياً. الحد الأقصى المعتاد للصرع: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب بطء تركيز/تنميل.', 'قد يزيد خطر حصوات الكلى (اشرب ماء كفاية).'],
	},

	// 41) gabalepsy 300mg 30 caps.
	{
		id: 'gabalepsy-300-30-caps',
		name: 'gabalepsy 300mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 135,
		matchKeywords: ['gabalepsy 300 30', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('كبسولة ٣٠٠ مجم كل ٨ ساعات. يمكن الزيادة إلى ٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 42) kepradil 1000mg 30 f.c. tabs.
	{
		id: 'kepradil-1000-30-tabs',
		name: 'kepradil 1000mg 30 f.c. tabs.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 240,
		matchKeywords: ['kepradil 1000 30', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 43) kepradil 500mg 30 f.c. tabs.
	{
		id: 'kepradil-500-30-tabs',
		name: 'kepradil 500mg 30 f.c. tabs.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 162,
		matchKeywords: ['kepradil 500 30', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) كل ١٢ ساعة. يمكن زيادة ٥٠٠ مجم/جرعة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 44) lamotrine 100mg 30 tab
	{
		id: 'lamotrine-100-30-tabs',
		name: 'lamotrine 100mg 30 tab',
		genericName: 'lamotrigine',
		concentration: '100mg',
		price: 120,
		matchKeywords: ['lamotrine 100', 'lamotrigine 100', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين لعلاج الصرع/ثنائي القطب حسب الحالة.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed(
			'بعد إتمام التدرج: جرعة شائعة ١٠٠–٢٠٠ مجم/يوم (مرة أو مرتين يومياً). التدرج (بدون فالبروات): ٢٥ مجم يومياً لأسبوعين ثم ٥٠ مجم يومياً لأسبوعين ثم ١٠٠ مجم/يوم. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ.'
		),
		warnings: ['خطر طفح جلدي شديد (SJS/TEN) خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 45) lamotrine 25mg 30 tab
	{
		id: 'lamotrine-25-30-tabs',
		name: 'lamotrine 25mg 30 tab',
		genericName: 'lamotrigine',
		concentration: '25mg',
		price: 42,
		matchKeywords: ['lamotrine 25', 'lamotrigine 25', '#anti-epileptic'],
		usage: 'لاموتريجين (بداية/تدرج الجرعة).',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('تدرج (بدون فالبروات): ٢٥ مجم يومياً لمدة أسبوعين، ثم ٥٠ مجم يومياً لمدة أسبوعين، ثم ١٠٠ مجم/يوم. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ. أوقف فوراً عند ظهور طفح جلدي.'),
		warnings: ['خطر طفح جلدي شديد خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 46) lamotrine 50mg 30 tab
	{
		id: 'lamotrine-50-30-tabs',
		name: 'lamotrine 50mg 30 tab',
		genericName: 'lamotrigine',
		concentration: '50mg',
		price: 60,
		matchKeywords: ['lamotrine 50', 'lamotrigine 50', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين لعلاج الصرع/ثنائي القطب حسب الحالة.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('بعد إتمام التدرج: ٥٠ مجم مرة إلى مرتين يومياً وفق الجرعة اليومية المستهدفة. راقب الطفح الجلدي. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ.'),
		warnings: ['خطر طفح جلدي شديد خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 47) sycocetam 100mg/ml oral soln. 120 ml
	{
		id: 'sycocetam-100mg-ml-oral-solution-120ml',
		name: 'sycocetam 100mg/ml oral soln. 120 ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 91,
		matchKeywords: ['sycocetam oral solution', 'levetiracetam 100mg/ml', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام محلول فموي لنوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: levetiracetamSolutionRule('100mg/ml'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 48) sycocetam 1000 mg 20 f.c. tabs
	{
		id: 'sycocetam-1000-20-tabs',
		name: 'sycocetam 1000 mg 20 f.c. tabs',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 174,
		matchKeywords: ['sycocetam 1000 20', 'levetiracetam 1000', '#anti-epileptic'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 49) tiralepsy 1000mg 20 f.c. tab
	{
		id: 'tiralepsy-1000-20-tabs',
		name: 'tiralepsy 1000mg 20 f.c. tab',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 154,
		matchKeywords: ['tiralepsy 1000 20', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 50) trileptal 300mg 50 f.c.tab.
	{
		id: 'trileptal-300-50-tabs',
		name: 'trileptal 300mg 50 f.c.tab.',
		genericName: 'oxcarbazepine',
		concentration: '300mg',
		price: 356,
		matchKeywords: ['trileptal 300 50', 'oxcarbazepine 300', '#anti-epileptic', '#carboxamides'],
		usage: 'أوكسكاربازيبين لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٣٠٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ٦٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٢٠٠ مجم كل ١٢ ساعة (٢٤٠٠ مجم/يوم).'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم الدم.'],
	},

	// 51) trileptal 600mg 50 f.c. tab.
	{
		id: 'trileptal-600-50-tabs',
		name: 'trileptal 600mg 50 f.c. tab.',
		genericName: 'oxcarbazepine',
		concentration: '600mg',
		price: 599,
		matchKeywords: ['trileptal 600 50', 'oxcarbazepine 600', '#anti-epileptic', '#carboxamides'],
		usage: 'أوكسكاربازيبين لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٣٠٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ٦٠٠ مجم كل ١٢ ساعة. (قد يلزم تقسيم القرص إذا أمكن). الحد الأقصى: ١٢٠٠ مجم كل ١٢ ساعة (٢٤٠٠ مجم/يوم).'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم الدم.'],
	},

	// 52) kepradil xr 500mg 30 extended f.c. tabs.
	{
		id: 'kepradil-xr-500-30-tabs',
		name: 'kepradil xr 500mg 30 extended f.c. tabs.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 201,
		matchKeywords: ['kepradil xr 500 30', 'levetiracetam xr 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام ممتد المفعول.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) مرة يومياً (XR). يمكن زيادة الجرعة تدريجياً حتى ١٥٠٠ مجم مرة يومياً. الحد الأقصى: ٣٠٠٠ مجم/يوم. لا يُكسر/يُسحق.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 53) andovimpamide 100 mg 20 tabs.
	{
		id: 'andovimpamide-100-20-tabs',
		name: 'andovimpamide 100 mg 20 tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 120,
		matchKeywords: ['andovimpamide 100 20', 'lacosamide 100', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 54) andovimpamide 50 mg 20 tabs.
	{
		id: 'andovimpamide-50-20-tabs',
		name: 'andovimpamide 50 mg 20 tabs.',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 66,
		matchKeywords: ['andovimpamide 50 20', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد (جرعة تدرج/جرعة أقل).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠ مجم) كل ١٢ ساعة لمدة أسبوع كبداية، ثم يمكن الزيادة إلى ١٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٢٠٠ مجم كل ١٢ ساعة (٤٠٠ مجم/يوم).'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 55) lacosamet 100 mg 30 f.c. tabs.
	{
		id: 'lacosamet-100-30-tabs',
		name: 'lacosamet 100 mg 30 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 252,
		matchKeywords: ['lacosamet 100 30', 'lacosamide 100', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 56) conventin 800mg 30 tabs.
	{
		id: 'conventin-800-30-tabs',
		name: 'conventin 800mg 30 tabs.',
		genericName: 'gabapentin',
		concentration: '800mg',
		price: 171,
		matchKeywords: ['conventin 800 30', 'gabapentin 800', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٨٠٠ مجم: قرص واحد كل ٨ ساعات = ٢٤٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 57) gabalepsy 300mg 20 caps
	{
		id: 'gabalepsy-300-20-caps',
		name: 'gabalepsy 300mg 20 caps',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 90,
		matchKeywords: ['gabalepsy 300 20', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('كبسولة ٣٠٠ مجم كل ٨ ساعات. يمكن الزيادة إلى ٦٠٠ مجم كل ٨ ساعات. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 58) lacosamet 100 mg 10 f.c. tabs.
	{
		id: 'lacosamet-100-10-tabs',
		name: 'lacosamet 100 mg 10 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 84,
		matchKeywords: ['lacosamet 100 10', 'lacosamide 100', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية (عبوة أصغر).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 59) lacovimp 100 mg 30 f.c.tabs.
	{
		id: 'lacovimp-100-30-tabs',
		name: 'lacovimp 100 mg 30 f.c.tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 387,
		matchKeywords: ['lacovimp 100 30', 'lacosamide 100', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 60) lacovimp 50mg 30 f.c.tablets
	{
		id: 'lacovimp-50-30-tabs',
		name: 'lacovimp 50mg 30 f.c.tablets',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 231,
		matchKeywords: ['lacovimp 50 30', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد (جرعة تدرج/جرعة أقل).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠ مجم) كل ١٢ ساعة لمدة أسبوع كبداية، ثم يمكن الزيادة إلى ١٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٢٠٠ مجم كل ١٢ ساعة (٤٠٠ مجم/يوم).'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 61) levectam 100mg/ml syrup 120 ml
	{
		id: 'levectam-100mg-ml-syrup-120ml',
		name: 'levectam 100mg/ml syrup 120 ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 83,
		matchKeywords: ['levectam syrup 100mg/ml', 'levetiracetam syrup', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام شراب/محلول فموي لنوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: levetiracetamSolutionRule('100mg/ml'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 62) sycocetam 500mg 20 f.c. tabs
	{
		id: 'sycocetam-500-20-tabs',
		name: 'sycocetam 500mg 20 f.c. tabs',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 124,
		matchKeywords: ['sycocetam 500 20', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) كل ١٢ ساعة. يمكن زيادة ٥٠٠ مجم/جرعة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 63) tiralepsy 1000mg 30 f.c. tab.
	{
		id: 'tiralepsy-1000-30-tabs',
		name: 'tiralepsy 1000mg 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 261,
		matchKeywords: ['tiralepsy 1000 30', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع (عبوة ٣٠ قرص).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 64) tiralepsy 100mg/ml oral sol. 120 ml
	{
		id: 'tiralepsy-100mg-ml-oral-solution-120ml',
		name: 'tiralepsy 100mg/ml oral sol. 120 ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 103,
		matchKeywords: ['tiralepsy oral solution 100mg/ml', 'levetiracetam oral solution', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام محلول فموي لنوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: levetiracetamSolutionRule('100mg/ml'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 65) tiralepsy 500 mg 30 f.c. tab.
	{
		id: 'tiralepsy-500-30-tabs',
		name: 'tiralepsy 500 mg 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 177,
		matchKeywords: ['tiralepsy 500 30', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) كل ١٢ ساعة. يمكن زيادة ٥٠٠ مجم/جرعة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 66) tiralepsy xr 500mg 20 f.c.tab.
	{
		id: 'tiralepsy-xr-500-20-tabs',
		name: 'tiralepsy xr 500mg 20 f.c.tab.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 129,
		matchKeywords: ['tiralepsy xr 500 20', 'levetiracetam xr 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام ممتد المفعول.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٥٠٠ مجم) مرة يومياً (XR). يمكن زيادة الجرعة تدريجياً حتى ١٥٠٠ مجم مرة يومياً. الحد الأقصى: ٣٠٠٠ مجم/يوم. لا يُكسر/يُسحق.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 67) tiralepsy xr 750 mg 20 f.c. tab.
	{
		id: 'tiralepsy-xr-750-20-tabs',
		name: 'tiralepsy xr 750 mg 20 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '750mg',
		price: 164,
		matchKeywords: ['tiralepsy xr 750 20', 'levetiracetam xr 750', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام ممتد المفعول.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٧٥٠ مجم) مرة يومياً (XR). يمكن زيادة الجرعة تدريجياً حتى ١٥٠٠ مجم مرة يومياً. الحد الأقصى: ٣٠٠٠ مجم/يوم. لا يُكسر/يُسحق.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 68) tiratam 500mg/5ml iv vial
	{
		id: 'tiratam-500mg-5ml-iv-vial',
		name: 'tiratam 500mg/5ml iv vial',
		genericName: 'levetiracetam',
		concentration: '500mg/5ml',
		price: 31,
		matchKeywords: ['tiratam iv vial 500', 'levetiracetam iv', '#anti-epileptic'],
		usage: 'ليفِتيراسيتام حقن وريدي (عند تعذر البلع/داخل المستشفى).',
		timing: 'كل ١٢ ساعة حقن (بديل مؤقت للفموي)',
		category: Category.ANTIEPILEPTICS,
		form: 'Vial',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠–١٥٠٠ مجم وريدياً كل ١٢ ساعة (نفس إجمالي الجرعة اليومية للفموي). الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'راقب النعاس/الدوخة وتغيرات المزاج.'],
	},
];

