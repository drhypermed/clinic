
import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

const fixed = (text: string) => (_w: number, _a: number) => text;

const mgPerMlFromConcentration = (concentration: string): number | null => {
	const normalized = concentration.toLowerCase().replace(/\s/g, '');
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

const ethosuximideRule = (concentration: string) => {
	// Typical pediatric dosing: start 10 mg/kg/day then 20 mg/kg/day; max 1.5 g/day
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const startDailyMg = Math.round(w * 10);
		const targetDailyMg = Math.round(w * 20);
		const maxDailyMg = Math.min(Math.round(w * 30), 1500);
		const startPerDose = Math.round(startDailyMg / 2);
		const targetPerDose = Math.round(targetDailyMg / 2);
		const startMl = mgPerMl ? startPerDose / mgPerMl : null;
		const targetMl = mgPerMl ? targetPerDose / mgPerMl : null;
		return (
			`بداية: ${toAr(startDailyMg)} مجم/يوم تُقسم على جرعتين. ` +
			`جرعة شائعة: ${toAr(targetDailyMg)} مجم/يوم. ` +
			`الحد الأقصى: ${toAr(maxDailyMg)} مجم/يوم (بحد أقصى ١٥٠٠ مجم/يوم).` +
			(startMl !== null && targetMl !== null
				? ` (يعادل تقريباً ${formatMl(startMl)} لكل جرعة بدايةً، ثم ${formatMl(targetMl)} لكل جرعة).`
				: '')
		);
	};
};

const phenytoinSuspRule = (concentration: string) => {
	// Maintenance 5 mg/kg/day (range 4–7 mg/kg/day) in 2–3 divided doses
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const dailyMg = Math.round(w * 5);
		const maxDailyMg = Math.round(w * 7);
		const perDose2 = Math.round(dailyMg / 2);
		const perDose3 = Math.round(dailyMg / 3);
		const perDose2Ml = mgPerMl ? perDose2 / mgPerMl : null;
		const perDose3Ml = mgPerMl ? perDose3 / mgPerMl : null;
		return (
			`جرعة مداومة إرشادية: ${toAr(dailyMg)} مجم/يوم (نطاق حتى ${toAr(maxDailyMg)} مجم/يوم) تُقسم على ٢–٣ جرعات. ` +
			`أمثلة تقسيم: ${toAr(perDose2)} مجم كل ١٢ ساعة أو ${toAr(perDose3)} مجم كل ٨ ساعات.` +
			(perDose2Ml !== null && perDose3Ml !== null
				? ` (يعادل تقريباً ${formatMl(perDose2Ml)} لكل جرعة/١٢ ساعة أو ${formatMl(perDose3Ml)} لكل جرعة/٨ ساعات).`
				: '')
		);
	};
};

export const ANTIEPILEPTIC_2: Medication[] = [
	// 69) topiramate 25mg 30 f.c. tab
	{
		id: 'topiramate-25-30-tabs-ae2',
		name: 'topiramate 25mg 30 f.c. tab',
		genericName: 'topiramate',
		concentration: '25mg',
		price: 90,
		matchKeywords: ['topiramate 25', 'topiramate 25mg', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع (ويُستخدم أيضاً للصداع النصفي حسب الحالة).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٢٥ مجم ليلاً لمدة أسبوع، ثم ٢٥ مجم مرتين يومياً. زِد ٢٥–٥٠ مجم/الأسبوع حتى ٥٠–١٠٠ مجم مرتين يومياً. الحد الأقصى المعتاد للصرع: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب بطء تركيز/تنميل.', 'قد يزيد خطر حصوات الكلى (اشرب ماء كفاية).', 'قد يسبب نقص شهية/نقص وزن.'],
	},

	// 70) trileptal 150mg 50 f.c.tab.
	{
		id: 'trileptal-150-50-tabs-ae2',
		name: 'trileptal 150mg 50 f.c.tab.',
		genericName: 'oxcarbazepine',
		concentration: '150mg',
		price: 65,
		matchKeywords: ['trileptal 150', 'oxcarbazepine 150', '#anti-epileptic', '#carboxamides'],
		usage: 'أوكسكاربازيبين لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٣٠٠ مجم/يوم مقسمة على جرعتين (١٥٠ مجم كل ١٢ ساعة) لمدة أسبوع، ثم ٦٠٠ مجم/يوم (٣٠٠ مجم كل ١٢ ساعة). الحد الأقصى: ١٢٠٠ مجم كل ١٢ ساعة (٢٤٠٠ مجم/يوم).'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم الدم خصوصاً كبار السن/مع مدرات.'],
	},

	// 71) andopentene xr 300 mg 20 f.c. tabs.
	{
		id: 'andopentene-xr-300-20-tabs-ae2',
		name: 'andopentene xr 300 mg 20 f.c. tabs.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 90,
		matchKeywords: ['andopentene xr 300', 'gabapentin xr 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين ممتد المفعول (صرع/آلام أعصاب حسب الحالة).',
		timing: 'مرة يومياً مع الأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٣٠٠ مجم) مرة يومياً مع وجبة. لا يُكسر/يُمضغ. لا يوقف فجأة.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.', 'لا يوقف فجأة.'],
	},

	// 72) andopentene xr 600 mg 20 f.c. tabs.
	{
		id: 'andopentene-xr-600-20-tabs-ae2',
		name: 'andopentene xr 600 mg 20 f.c. tabs.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 198,
		matchKeywords: ['andopentene xr 600', 'gabapentin xr 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين ممتد المفعول (صرع/آلام أعصاب حسب الحالة).',
		timing: 'مرة يومياً مع الأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٦٠٠ مجم) مرة يومياً مع وجبة. لا يُكسر/يُمضغ. لا يوقف فجأة.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.', 'لا يوقف فجأة.'],
	},

	// 73) lacosamet 100 mg 20 f.c. tabs.
	{
		id: 'lacosamet-100-20-tabs-ae2',
		name: 'lacosamet 100 mg 20 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 168,
		matchKeywords: ['lacosamet 100 20', 'lacosamide 100', '#anti-epileptic'],
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

	// 74) lacosamet 50 mg 30 f.c. tabs.
	{
		id: 'lacosamet-50-30-tabs-ae2',
		name: 'lacosamet 50 mg 30 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 171,
		matchKeywords: ['lacosamet 50 30', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد (جرعة بداية/تدرج).',
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

	// 75) conventin 600 mg 30 tabs.
	{
		id: 'conventin-600-30-tabs-ae2',
		name: 'conventin 600 mg 30 tabs.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 171,
		matchKeywords: ['conventin 600 30', 'gabapentin 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٦٠٠ مجم: قرص واحد كل ٨ ساعات = ١٨٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 76) brivafutal 50 mg 30 f.c.tabs.
	{
		id: 'brivafutal-50-30-tabs-ae2',
		name: 'brivafutal 50 mg 30 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '50mg',
		price: 327,
		matchKeywords: ['brivafutal 50', 'brivaracetam 50', '#anti-epileptic', '#sv2a ligands'],
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

	// 77) brivafutal 100 mg 30 f.c.tabs.
	{
		id: 'brivafutal-100-30-tabs-ae2',
		name: 'brivafutal 100 mg 30 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '100mg',
		price: 327,
		matchKeywords: ['brivafutal 100', 'brivaracetam 100', '#anti-epileptic', '#sv2a ligands'],
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

	// 78) andovimpamide 50 mg 30 tabs.
	{
		id: 'andovimpamide-50-30-tabs-ae2',
		name: 'andovimpamide 50 mg 30 tabs.',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 151.5,
		matchKeywords: ['andovimpamide 50 30', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد (جرعة بداية/تدرج).',
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

	// 79) epicopentin 300 mg 30 caps.
	{
		id: 'epicopentin-300-30-caps-ae2',
		name: 'epicopentin 300 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 96,
		matchKeywords: ['epicopentin 300', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
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

	// 80) shalgaten 400mg 30 caps.
	{
		id: 'shalgaten-400-30-caps-ae2',
		name: 'shalgaten 400mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 126,
		matchKeywords: ['shalgaten 400', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
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

	// 81) carbapex 200 mg 30 tabs.
	{
		id: 'carbapex-200-30-tabs-ae2',
		name: 'carbapex 200 mg 30 tabs.',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 24,
		matchKeywords: ['carbapex 200', 'carbamazepine 200', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين لعلاج الصرع وآلام العصب الخامس.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ابدأ ٢٠٠ مجم مرتين يومياً. يمكن زيادة ٢٠٠ مجم/يوم أسبوعياً حتى ٤٠٠ مجم مرتين يومياً. الجرعة المعتادة: ٨٠٠–١٢٠٠ مجم/يوم مقسمة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.', 'نادرًا: اضطرابات دم/طفح جلدي شديد (اطلب رعاية إذا ظهر طفح شديد).'],
	},

	// 82) carbapex 400 mg cr 30 tabs.
	{
		id: 'carbapex-cr-400-30-tabs-ae2',
		name: 'carbapex 400 mg cr 30 tabs.',
		genericName: 'carbamazepine',
		concentration: '400mg',
		price: 111,
		matchKeywords: ['carbapex cr 400', 'carbamazepine cr 400', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين ممتد/متحكم الإطلاق.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار (CR): ابدأ ٢٠٠ مجم كل ١٢ ساعة، ويمكن الزيادة تدريجياً حتى ٤٠٠–٦٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.'],
	},

	// 83) carbapex 200 mg cr 30 tabs.
	{
		id: 'carbapex-cr-200-30-tabs-ae2',
		name: 'carbapex 200 mg cr 30 tabs.',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 81,
		matchKeywords: ['carbapex cr 200', 'carbamazepine cr 200', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين ممتد/متحكم الإطلاق.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار (CR): قرص ٢٠٠ مجم كل ١٢ ساعة كبداية. يمكن الزيادة تدريجياً حتى ٤٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.'],
	},

	// 84) controlepsy 100mg 30 tab.
	{
		id: 'controlepsy-100-30-tabs-ae2',
		name: 'controlepsy 100mg 30 tab.',
		genericName: 'lamotrigine',
		concentration: '100mg',
		price: 120,
		matchKeywords: ['controlepsy 100', 'lamotrigine 100', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين لعلاج الصرع/ثنائي القطب حسب الحالة.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('بعد إتمام التدرج: جرعة شائعة ١٠٠–٢٠٠ مجم/يوم (مرة أو مرتين يومياً). التدرج (بدون فالبروات): ٢٥ مجم يومياً لأسبوعين ثم ٥٠ مجم يومياً لأسبوعين ثم ١٠٠ مجم/يوم. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ.'),
		warnings: ['خطر طفح جلدي شديد (SJS/TEN) خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 85) controlepsy 25mg 30 tab.
	{
		id: 'controlepsy-25-30-tabs-ae2',
		name: 'controlepsy 25mg 30 tab.',
		genericName: 'lamotrigine',
		concentration: '25mg',
		price: 48,
		matchKeywords: ['controlepsy 25', 'lamotrigine 25', '#anti-epileptic', '#triazine'],
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

	// 86) ethoxa 250mg/5ml syrup 120ml
	{
		id: 'ethoxa-250mg-5ml-syrup-120ml-ae2',
		name: 'ethoxa 250mg/5ml syrup 120ml',
		genericName: 'ethosuximide',
		concentration: '250mg/5ml',
		price: 99,
		matchKeywords: ['ethoxa syrup', 'ethosuximide syrup', 'ethosuximide 250/5', '#anti-epileptic', '#succinimide'],
		usage: 'إيثوسكسيميد لعلاج نوبات الغياب.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Syrup',
		minAgeMonths: 36,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: ethosuximideRule('250mg/5ml'),
		warnings: ['قد يسبب غثيان/ألم معدة.', 'قد يسبب نعاس/دوخة.', 'اطلب رعاية عند طفح جلدي شديد أو كدمات/نزيف غير معتاد.'],
	},

	// 87) gabapentin 600 mg 20 f.c.tabs
	{
		id: 'gabapentin-600-20-tabs-generic-ae2',
		name: 'gabapentin 600 mg 20 f.c.tabs',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 96,
		matchKeywords: ['gabapentin 600 20', 'gabapentin 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٦٠٠ مجم: قرص واحد كل ٨ ساعات = ١٨٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 88) gabapentin 800 mg 20 f.c.tabs.
	{
		id: 'gabapentin-800-20-tabs-generic-ae2',
		name: 'gabapentin 800 mg 20 f.c.tabs.',
		genericName: 'gabapentin',
		concentration: '800mg',
		price: 96,
		matchKeywords: ['gabapentin 800 20', 'gabapentin 800', '#anti-epileptic', '#gaba analogs'],
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

	// 89) keppra 1000mg 30 f.c. tab.
	{
		id: 'keppra-1000-30-tabs-ae2',
		name: 'keppra 1000mg 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 770,
		matchKeywords: ['keppra 1000 30', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع (الدواء الأصلي).',
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

	// 90) keppra 500mg 30 f.c. tab.
	{
		id: 'keppra-500-30-tabs-ae2',
		name: 'keppra 500mg 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 465,
		matchKeywords: ['keppra 500 30', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع (الدواء الأصلي).',
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

	// 91) lamictal 25mg 30 tab.
	{
		id: 'lamictal-25-30-tabs-ae2',
		name: 'lamictal 25mg 30 tab.',
		genericName: 'lamotrigine',
		concentration: '25mg',
		price: 87,
		matchKeywords: ['lamictal 25', 'lamotrigine 25', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين (الدواء الأصلي) – بداية/تدرج الجرعة.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('تدرج (بدون فالبروات): ٢٥ مجم يومياً لمدة أسبوعين، ثم ٥٠ مجم يومياً لمدة أسبوعين، ثم ١٠٠ مجم/يوم. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ. أوقف فوراً عند ظهور طفح جلدي.'),
		warnings: ['خطر طفح جلدي شديد (SJS/TEN) خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 92) lamictal 50mg 30 tab.
	{
		id: 'lamictal-50-30-tabs-ae2',
		name: 'lamictal 50mg 30 tab.',
		genericName: 'lamotrigine',
		concentration: '50mg',
		price: 143,
		matchKeywords: ['lamictal 50', 'lamotrigine 50', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين (الدواء الأصلي) – ضمن التدرج/المداومة.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('بعد إتمام التدرج: ٥٠ مجم مرة إلى مرتين يومياً وفق الجرعة اليومية المستهدفة. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ.'),
		warnings: ['خطر طفح جلدي شديد خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 93) levepex 1000 mg 30 f.c. tab.
	{
		id: 'levepex-1000-30-tabs-ae2',
		name: 'levepex 1000 mg 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 216,
		matchKeywords: ['levepex 1000 30', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
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

	// 94) levepex 100mg/ml syrup 100ml
	{
		id: 'levepex-100mg-ml-syrup-100ml-ae2',
		name: 'levepex 100mg/ml syrup 100ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 50,
		matchKeywords: ['levepex syrup', 'levetiracetam 100mg/ml', '#anti-epileptic', '#pyrrolidine'],
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

	// 95) mazemal 200 mg 20 tabs.
	{
		id: 'mazemal-200-20-tabs-ae2',
		name: 'mazemal 200 mg 20 tabs.',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 37,
		matchKeywords: ['mazemal 200 20', 'carbamazepine 200', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين لعلاج الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ابدأ ٢٠٠ مجم مرتين يومياً. يمكن زيادة ٢٠٠ مجم/يوم أسبوعياً حتى ٤٠٠ مجم مرتين يومياً. الجرعة المعتادة: ٨٠٠–١٢٠٠ مجم/يوم. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.'],
	},

	// 96) sunseiz 500 mg 30 f.c.tabs.
	{
		id: 'sunseiz-500-30-tabs-ae2',
		name: 'sunseiz 500 mg 30 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 171,
		matchKeywords: ['sunseiz 500', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
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

	// 97) vegapantin 600mg 30 dividable f.c. tabs.
	{
		id: 'vegapantin-600-30-tabs-ae2',
		name: 'vegapantin 600mg 30 dividable f.c. tabs.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 144,
		matchKeywords: ['vegapantin 600', 'gabapentin 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة المعتادة: ٣٠٠–٦٠٠ مجم كل ٨ ساعات. مع تركيز ٦٠٠ مجم: قرص واحد كل ٨ ساعات = ١٨٠٠ مجم/يوم. الحد الأقصى: ٣٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 98) lacosamet 50mg/5ml syrup 200 ml
	{
		id: 'lacosamet-50mg-5ml-syrup-200ml-ae2',
		name: 'lacosamet 50mg/5ml syrup 200 ml',
		genericName: 'lacosamide',
		concentration: '50mg/5ml',
		price: 149,
		matchKeywords: ['lacosamet syrup', 'lacosamide syrup', 'lacosamide 50/5', '#anti-epileptic'],
		usage: 'لاكوساميد شراب/محلول فموي لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Syrup',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('جرعة الكبار: ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم. (تركيز ٥٠ مجم/٥ مل = ١٠ مجم/مل).'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 99) andovimpamide 10mg/ml syrup 100 ml
	{
		id: 'andovimpamide-10mg-ml-syrup-100ml-ae2',
		name: 'andovimpamide 10mg/ml syrup 100 ml',
		genericName: 'lacosamide',
		concentration: '10mg/ml',
		price: 71,
		matchKeywords: ['andovimpamide syrup 10mg/ml', 'lacosamide 10mg/ml', '#anti-epileptic'],
		usage: 'لاكوساميد شراب/محلول فموي لعلاج نوبات الصرع الجزئية.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Syrup',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('جرعة الكبار: ابدأ ٥٠ مجم كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم. (تركيز ١٠ مجم/مل).'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 100) andovimpamide 200 mg i.v. inf. vial
	{
		id: 'andovimpamide-200mg-iv-vial-ae2',
		name: 'andovimpamide 200 mg i.v. inf. vial',
		genericName: 'lacosamide',
		concentration: '200mg',
		price: 17.64,
		matchKeywords: ['andovimpamide 200 iv vial', 'lacosamide iv 200', '#anti-epileptic'],
		usage: 'لاكوساميد تسريب وريدي (عند تعذر البلع/بديل مؤقت للفموي).',
		timing: 'كل ١٢ ساعة حقن (بديل مؤقت للفموي)',
		category: Category.ANTIEPILEPTICS,
		form: 'Vial',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم وريدياً كل ١٢ ساعة لمدة أسبوع ثم ١٠٠ مجم كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ٢٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 101) andovimpamide 200mg 10 tabs.
	{
		id: 'andovimpamide-200-10-tabs-ae2',
		name: 'andovimpamide 200mg 10 tabs.',
		genericName: 'lacosamide',
		concentration: '200mg',
		price: 92.5,
		matchKeywords: ['andovimpamide 200 10', 'lacosamide 200', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية (جرعة أعلى).',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٢٠٠ مجم) كل ١٢ ساعة. الحد الأقصى: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'يُستخدم بحذر مع اضطرابات التوصيل القلبي.'],
	},

	// 102) convagran 50 mg 30 caps.
	{
		id: 'convagran-50-30-caps-ae2',
		name: 'convagran 50 mg 30 caps.',
		genericName: 'zonisamide',
		concentration: '50mg',
		price: 123,
		matchKeywords: ['convagran 50', 'zonisamide 50', '#anti-epileptic', '#sulfonamides'],
		usage: 'زونيساميد لعلاج بعض أنواع نوبات الصرع.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ابدأ ٥٠ مجم مرة يومياً لمدة أسبوعين، ثم ١٠٠ مجم/يوم. يمكن زيادة ١٠٠ مجم كل أسبوعين حتى ٢٠٠–٤٠٠ مجم/يوم. الحد الأقصى: ٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يقلل التعرق ويرفع حرارة الجسم خصوصاً الأطفال.', 'قد يزيد خطر حصوات الكلى.'],
	},

	// 103) conviban 50mg 30 f.c. tabs
	{
		id: 'conviban-50-30-tabs-ae2',
		name: 'conviban 50mg 30 f.c. tabs',
		genericName: 'topiramate',
		concentration: '50mg',
		price: 51,
		matchKeywords: ['conviban 50', 'topiramate 50', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع/الصداع النصفي حسب الحالة.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('ابدأ ٢٥ مجم ليلاً لمدة أسبوع، ثم ٢٥ مجم مرتين يومياً. زِد ٢٥–٥٠ مجم/الأسبوع حتى ٥٠–١٠٠ مجم مرتين يومياً. الحد الأقصى المعتاد للصرع: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب بطء تركيز/تنميل.', 'قد يزيد خطر حصوات الكلى.'],
	},

	// 104) dekadel 200mg/5ml oral solution 125 ml
	{
		id: 'dekadel-200mg-5ml-oral-solution-125ml-ae2',
		name: 'dekadel 200mg/5ml oral solution 125 ml',
		genericName: 'sodium valproate',
		concentration: '200mg/5ml',
		price: 38,
		matchKeywords: ['dekadel solution 200/5', 'valproate 200/5', '#anti-epileptic', '#fatty acid'],
		usage: 'فالبروات محلول فموي لعلاج الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: valproateSolutionRule('200mg/5ml'),
		warnings: ['يُتجنب في الحمل إلا للضرورة القصوى وبأقل جرعة مع متابعة (خطر تشوهات).', 'يلزم متابعة وظائف الكبد/الصفائح.'],
	},

	// 105) delpiramate 100mg 30 f.c. tab.
	{
		id: 'delpiramate-100-30-tabs-ae2',
		name: 'delpiramate 100mg 30 f.c. tab.',
		genericName: 'topiramate',
		concentration: '100mg',
		price: 138,
		matchKeywords: ['delpiramate 100', 'topiramate 100', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع/الصداع النصفي حسب الحالة.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('الجرعة الشائعة بعد التدرج: ٥٠–١٠٠ مجم مرتين يومياً. ابدأ ٢٥ مجم ليلاً ثم زِد تدريجياً ٢٥–٥٠ مجم/الأسبوع. الحد الأقصى المعتاد: ٤٠٠ مجم/يوم.'),
		warnings: ['قد يسبب بطء تركيز/تنميل.', 'قد يزيد خطر حصوات الكلى.'],
	},

	// 106) eslizepine 400 mg 20 tabs.
	{
		id: 'eslizepine-400-20-tabs-ae2',
		name: 'eslizepine 400 mg 20 tabs.',
		genericName: 'eslicarbazepine acetate',
		concentration: '400mg',
		price: 342,
		matchKeywords: ['eslizepine 400', 'eslicarbazepine 400', '#anti-epileptic'],
		usage: 'إسليكاربازيبين أسيتات لعلاج نوبات الصرع الجزئية.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار: ٤٠٠ مجم مرة يومياً لمدة ١–٢ أسبوع، ثم ٨٠٠ مجم مرة يومياً. يمكن الزيادة حتى ١٢٠٠–١٦٠٠ مجم مرة يومياً حسب التحمل. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم الدم.', 'قد يتداخل مع أدوية أخرى.'],
	},

	// 107) eslizepine 800mg 20 scored tabs.
	{
		id: 'eslizepine-800-20-tabs-ae2',
		name: 'eslizepine 800mg 20 scored tabs.',
		genericName: 'eslicarbazepine acetate',
		concentration: '800mg',
		price: 588,
		matchKeywords: ['eslizepine 800', 'eslicarbazepine 800', '#anti-epileptic'],
		usage: 'إسليكاربازيبين أسيتات لعلاج نوبات الصرع الجزئية.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Scored Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة للكبار: ٨٠٠ مجم مرة يومياً. يمكن الزيادة حتى ١٢٠٠–١٦٠٠ مجم مرة يومياً حسب التحمل. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم الدم.', 'قد يتداخل مع أدوية أخرى.'],
	},

	// 108) ethoxa 250 mg 50 caps.
	{
		id: 'ethoxa-250-50-caps-ae2',
		name: 'ethoxa 250 mg 50 caps.',
		genericName: 'ethosuximide',
		concentration: '250mg',
		price: 56,
		matchKeywords: ['ethoxa 250 caps', 'ethosuximide 250', '#anti-epileptic', '#succinimide'],
		usage: 'إيثوسكسيميد لعلاج نوبات الغياب.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 36,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للأطفال: ابدأ ١٠ مجم/كجم/يوم تُقسم على جرعتين، ثم ٢٠ مجم/كجم/يوم. الحد الأقصى: ٣٠ مجم/كجم/يوم وبحد أقصى ١٥٠٠ مجم/يوم. للكبار: ٢٥٠ مجم مرتين يومياً ثم الزيادة تدريجياً.'),
		warnings: ['قد يسبب غثيان/ألم معدة.', 'قد يسبب نعاس/دوخة.', 'اطلب رعاية عند طفح جلدي شديد أو كدمات/نزيف غير معتاد.'],
	},

	// 109) ipanten 30mg/5ml susp. 125ml
	{
		id: 'ipanten-30mg-5ml-susp-125ml-ae2',
		name: 'ipanten 30mg/5ml susp. 125ml',
		genericName: 'phenytoin',
		concentration: '30mg/5ml',
		price: 13.5,
		matchKeywords: ['ipanten susp', 'phenytoin 30/5', '#anti-epileptic', '#hydantoin'],
		usage: 'فينيتوين معلق فموي لعلاج الصرع.',
		timing: 'كل ٨–١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Oral Suspension',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: phenytoinSuspRule('30mg/5ml'),
		warnings: ['دواء ذو تداخلات كثيرة ويحتاج متابعة مستوى/أعراض.', 'قد يسبب دوخة/عدم اتزان.', 'قد يسبب تضخم لثة (اهتم بنظافة الفم).'],
	},

	// 110) kepradil 500mg/5ml vial
	{
		id: 'kepradil-500mg-5ml-vial-ae2',
		name: 'kepradil 500mg/5ml vial',
		genericName: 'levetiracetam',
		concentration: '500mg/5ml',
		price: 15,
		matchKeywords: ['kepradil vial 500', 'levetiracetam iv 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام حقن وريدي (بديل مؤقت للفموي).',
		timing: 'كل ١٢ ساعة حقن (بديل مؤقت للفموي)',
		category: Category.ANTIEPILEPTICS,
		form: 'Vial',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠–١٥٠٠ مجم وريدياً كل ١٢ ساعة (نفس إجمالي الجرعة اليومية للفموي). الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 111) kepradil xr 750mg 30 extended f.c. tabs.
	{
		id: 'kepradil-xr-750-30-tabs-ae2',
		name: 'kepradil xr 750mg 30 extended f.c. tabs.',
		genericName: 'levetiracetam',
		concentration: '750mg',
		price: 231,
		matchKeywords: ['kepradil xr 750 30', 'levetiracetam xr 750', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام ممتد المفعول.',
		timing: 'مرة يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (٧٥٠ مجم) مرة يومياً (XR). يمكن زيادة الجرعة تدريجياً حتى ١٥٠٠ مجم مرة يومياً. الحد الأقصى: ٣٠٠٠ مجم/يوم. لا يُكسر/يُسحق.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 112) lamictal 100mg 30 tab.
	{
		id: 'lamictal-100-30-tabs-ae2',
		name: 'lamictal 100mg 30 tab.',
		genericName: 'lamotrigine',
		concentration: '100mg',
		price: 226,
		matchKeywords: ['lamictal 100', 'lamotrigine 100', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين (الدواء الأصلي) لعلاج الصرع/ثنائي القطب حسب الحالة.',
		timing: 'مرة–مرتين يومياً بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('بعد إتمام التدرج: جرعة شائعة ١٠٠–٢٠٠ مجم/يوم (مرة أو مرتين يومياً). التدرج (بدون فالبروات): ٢٥ مجم يومياً لأسبوعين ثم ٥٠ مجم يومياً لأسبوعين ثم ١٠٠ مجم/يوم. مع فالبروات: يلزم جرعات أقل وتدرج أبطأ.'),
		warnings: ['خطر طفح جلدي شديد (SJS/TEN) خصوصاً مع الزيادة السريعة.', 'يجب الالتزام بالتدرج.'],
	},

	// 113) levectam 1000 mg 20 f.c. tabs.
	{
		id: 'levectam-1000-20-tabs-ae2',
		name: 'levectam 1000 mg 20 f.c. tabs.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 144,
		matchKeywords: ['levectam 1000 20', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد (١٠٠٠ مجم) كل ١٢ ساعة. يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ٣٠٠٠ مجم/يوم.'),
		warnings: ['قد يسبب عصبية/تغير مزاج أو نعاس.'],
	},

	// 114) mazemal 200mg c.r. 20 f.c. tabs.
	{
		id: 'mazemal-cr-200-20-tabs-ae2',
		name: 'mazemal 200mg c.r. 20 f.c. tabs.',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 12,
		matchKeywords: ['mazemal cr 200', 'carbamazepine cr 200', '#anti-epileptic', '#carboxamides'],
		usage: 'كاربامازيبين ممتد/متحكم الإطلاق.',
		timing: 'كل ١٢ ساعة بدون اعتبار للأكل – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('جرعة إرشادية للكبار (CR): قرص ٢٠٠ مجم كل ١٢ ساعة كبداية. يمكن الزيادة تدريجياً حتى ٤٠٠ مجم كل ١٢ ساعة. الحد الأقصى: ١٦٠٠ مجم/يوم.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يتداخل مع أدوية كثيرة.'],
	},
];

