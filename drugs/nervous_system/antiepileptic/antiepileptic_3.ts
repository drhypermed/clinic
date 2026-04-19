
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

const oxcarbazepineSuspRule = (concentration: string) => {
	// Typical: start 8–10 mg/kg/day; target 30 mg/kg/day; max ~46 mg/kg/day or 2400 mg/day
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const startDailyMg = Math.round(w * 10);
		const targetDailyMg = Math.round(w * 30);
		const maxDailyMg = Math.min(Math.round(w * 46), 2400);
		const startPerDose = Math.round(startDailyMg / 2);
		const targetPerDose = Math.round(targetDailyMg / 2);
		const maxPerDose = Math.round(maxDailyMg / 2);
		const startMl = mgPerMl ? startPerDose / mgPerMl : null;
		const targetMl = mgPerMl ? targetPerDose / mgPerMl : null;
		const maxMl = mgPerMl ? maxPerDose / mgPerMl : null;
		return (
			`بداية: ${toAr(startDailyMg)} مجم/يوم تُقسم على جرعتين (كل ١٢ ساعة). ` +
			`جرعة شائعة: ${toAr(targetDailyMg)} مجم/يوم. ` +
			`الحد الأقصى: ${toAr(maxDailyMg)} مجم/يوم (بحد أقصى ٢٤٠٠ مجم/يوم).` +
			(startMl !== null && targetMl !== null && maxMl !== null
				? ` (يعادل تقريباً ${formatMl(startMl)} لكل جرعة بدايةً، ثم ${formatMl(targetMl)} لكل جرعة، وبحد أقصى ${formatMl(maxMl)} لكل جرعة).`
				: '')
		);
	};
};

const phenobarbitalElixirRule = (concentration: string) => {
	// Maintenance guidance: 3–6 mg/kg/day (often once daily at night)
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const startDailyMg = Math.round(w * 3);
		const targetDailyMg = Math.round(w * 4);
		const maxDailyMg = Math.round(w * 6);
		const startMl = mgPerMl ? startDailyMg / mgPerMl : null;
		const targetMl = mgPerMl ? targetDailyMg / mgPerMl : null;
		const maxMl = mgPerMl ? maxDailyMg / mgPerMl : null;
		return (
			`جرعة إرشادية: ${toAr(startDailyMg)}–${toAr(maxDailyMg)} مجم/يوم (شائع ${toAr(targetDailyMg)} مجم/يوم) غالباً جرعة واحدة مساءً. ` +
			`يُفضل التدرج حسب الاستجابة.` +
			(startMl !== null && targetMl !== null && maxMl !== null
				? ` (يعادل تقريباً ${formatMl(startMl)}–${formatMl(maxMl)} يومياً، شائع ${formatMl(targetMl)} يومياً).`
				: '')
		);
	};
};

const midazolamAmpRule = (concentration: string) => {
	// Acute seizure (IV/IM/IN by clinician): 0.1–0.2 mg/kg (max 10 mg)
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const lowMg = Math.min(Math.round(w * 0.1 * 10) / 10, 10);
		const highMg = Math.min(Math.round(w * 0.2 * 10) / 10, 10);
		const lowMl = mgPerMl ? lowMg / mgPerMl : null;
		const highMl = mgPerMl ? highMg / mgPerMl : null;
		return (
			`طوارئ للتشنج الحاد داخل المستشفى/الإسعاف: ${toAr(lowMg)}–${toAr(highMg)} مجم (٠٫١–٠٫٢ مجم/كجم) جرعة واحدة، بحد أقصى ١٠ مجم. ` +
			`يمكن تكرار جرعة إضافية قصيرة المدى عند الحاجة مع مراقبة التنفس.` +
			(lowMl !== null && highMl !== null ? ` (يعادل تقريباً ${formatMl(lowMl)}–${formatMl(highMl)}).` : '')
		);
	};
};

const levetiracetamIvRule = (strengthMg: number) => {
	return (_w: number, _a: number) =>
		`بديل وريدي مؤقت عند تعذر الفموي: جرعة شائعة ٥٠٠ مجم كل ١٢ ساعة. ` +
		`يمكن الزيادة تدريجياً حتى ١٥٠٠ مجم كل ١٢ ساعة (الحد الأقصى ٣٠٠٠ مجم/يوم). ` +
		`يُسرب خلال ~١٥ دقيقة بعد التخفيف. (العبوة: ${toAr(strengthMg)} مجم).`;
};

const phenytoinAmpRule = (concentration: string) => {
	// Loading 15–20 mg/kg IV (max 1500 mg), then maintenance 4–6 mg/kg/day
	const mgPerMl = mgPerMlFromConcentration(concentration);
	return (w: number, _a: number) => {
		const loadMg = Math.min(Math.round(w * 15), 1500);
		const maintDailyMg = Math.round(w * 5);
		const loadMl = mgPerMl ? loadMg / mgPerMl : null;
		return (
			`للصـرع الحاد/حالة الصرع داخل المستشفى: جرعة تحميل إرشادية ${toAr(loadMg)} مجم وريدياً ببطء (≈١٥ مجم/كجم، حد أقصى ١٥٠٠ مجم). ` +
			`بعدها مداومة إرشادية ${toAr(maintDailyMg)} مجم/يوم (≈٥ مجم/كجم/يوم) تُقسم على ٢–٣ جرعات أو حسب التحويل للفموي. ` +
			`ملاحظة: التسريب الوريدي يجب أن يكون ببطء مع متابعة الضغط/القلب.` +
			(loadMl !== null ? ` (التحميل يعادل تقريباً ${formatMl(loadMl)}).` : '')
		);
	};
};

export const ANTIEPILEPTIC_3: Medication[] = [
	// 115) phenytin 250mg/5ml 10 amps.
	{
		id: 'phenytin-250mg-5ml-10-amps-ae3',
		name: 'phenytin 250mg/5ml 10 amps.',
		genericName: 'phenytoin',
		concentration: '250mg/5ml',
		price: 110,
		matchKeywords: ['phenytin 250 5ml 10', 'phenytoin 250/5', '#anti-epileptic', '#hydantoin'],
		usage: 'فينيتوين حقن لعلاج التشنجات الحادة داخل المستشفى.',
		timing: 'حسب التعليمات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Ampoules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: phenytoinAmpRule('250mg/5ml'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'خطر هبوط ضغط/اضطراب نظم مع التسريب السريع.', 'قد يسبب نخر موضعي عند التسرب خارج الوريد.'],
	},

	// 116) sunseiz 1000 mg 30 f.c.tabs.
	{
		id: 'sunseiz-1000-30-tabs-ae3',
		name: 'sunseiz 1000 mg 30 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 210,
		matchKeywords: ['sunseiz 1000 30', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 117) seizurless 500mg 30 f.c. tab.
	{
		id: 'seizurless-500-30-tabs-ae3',
		name: 'seizurless 500mg 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 222,
		matchKeywords: ['seizurless 500 30', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 118) seizurless 500mg xr 30 f.c. tab.
	{
		id: 'seizurless-xr-500-30-tabs-ae3',
		name: 'seizurless 500mg xr 30 f.c. tab.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 222,
		matchKeywords: ['seizurless xr 500 30', 'levetiracetam xr 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام ممتد المفعول لعلاج نوبات الصرع.',
		timing: 'مرة يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('١٠٠٠ مجم (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 119) shalgaten 400mg 20 capsules
	{
		id: 'shalgaten-400-20-caps-ae3',
		name: 'shalgaten 400mg 20 capsules',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 62,
		matchKeywords: ['shalgaten 400 20', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٤٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 120) topamax 25mg 60 f.c. tabs.
	{
		id: 'topamax-25-60-tabs-ae3',
		name: 'topamax 25mg 60 f.c. tabs.',
		genericName: 'topiramate',
		concentration: '25mg',
		price: 246,
		matchKeywords: ['topamax 25 60', 'topiramate 25', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع (ويُستخدم أيضاً للصداع النصفي حسب الحالة).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٢٥ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب تنميل/دوخة/نقص شهية.', 'قد يسبب حصوات كلى.', 'قد يقلل التعرق/يرفع الحرارة خاصة الأطفال.'],
	},

	// 121) trileptal 60mg/ml oral susp. 100 ml
	{
		id: 'trileptal-60mg-ml-oral-susp-100ml-ae3',
		name: 'trileptal 60mg/ml oral susp. 100 ml',
		genericName: 'oxcarbazepine',
		concentration: '60mg/ml',
		price: 160,
		matchKeywords: ['trileptal 60mg/ml 100', 'oxcarbazepine suspension 60', '#anti-epileptic', '#carboxamides'],
		usage: 'أوكسكاربازيبين معلق فموي لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Oral Suspension',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: oxcarbazepineSuspRule('60mg/ml'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم بالدم (Hyponatremia).', 'قد يتداخل مع موانع الحمل الهرمونية.'],
	},

	// 122) delpiramate 25 mg 10 f.c.tabs.
	{
		id: 'delpiramate-25-10-tabs-ae3',
		name: 'delpiramate 25 mg 10 f.c.tabs.',
		genericName: 'topiramate',
		concentration: '25mg',
		price: 18.5,
		matchKeywords: ['delpiramate 25 10', 'topiramate 25', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع (ويُستخدم أيضاً للصداع النصفي حسب الحالة).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٢٥ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب تنميل/دوخة/نقص شهية.', 'قد يسبب حصوات كلى.', 'قد يقلل التعرق/يرفع الحرارة خاصة الأطفال.'],
	},

	// 123) enhantin 400mg 30 caps.
	{
		id: 'enhantin-400-30-caps-ae3',
		name: 'enhantin 400mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 102,
		matchKeywords: ['enhantin 400 30', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٤٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 124) lepsiramp 4 mg 14 f.c.tabs.
	{
		id: 'lepsiramp-4-14-tabs-ae3',
		name: 'lepsiramp 4 mg 14 f.c.tabs.',
		genericName: 'perampanel',
		concentration: '4mg',
		price: 439.5,
		matchKeywords: ['lepsiramp 4 14', 'perampanel 4', '#anti-epileptic'],
		usage: 'بيرامبانيل لعلاج نوبات الصرع (عادةً كعلاج مساعد).',
		timing: 'مرة ليلاً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('٢ مجم (قرص) — مرة ليلاً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب تهيج/عدوانية أو تغيرات مزاج.'],
	},

	// 125) midazolam 15mg/3ml 1 amp.
	{
		id: 'midazolam-15mg-3ml-1-amp-ae3',
		name: 'midazolam 15mg/3ml 1 amp.',
		genericName: 'midazolam',
		concentration: '15mg/3ml',
		price: 10.75,
		matchKeywords: ['midazolam 15/3', 'midazolam amp', '#anti-epileptic', '#benzodiazepines'],
		usage: 'ميدازولام لوقف التشنج الحاد (طوارئ/داخل المستشفى).',
		timing: 'عند الحاجة – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Ampoule',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: midazolamAmpRule('15mg/3ml'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'خطر تثبيط التنفس/هبوط ضغط خصوصاً مع جرعات زائدة أو مع أفيونات.', 'قد يسبب نعاس شديد.'],
	},

	// 126) midazolam 5mg/ml 1 amp.
	{
		id: 'midazolam-5mg-ml-1-amp-ae3',
		name: 'midazolam 5mg/ml 1 amp.',
		genericName: 'midazolam',
		concentration: '5mg/ml',
		price: 6,
		matchKeywords: ['midazolam 5mg/ml', 'midazolam ampoule', '#anti-epileptic', '#benzodiazepines'],
		usage: 'ميدازولام لوقف التشنج الحاد (طوارئ/داخل المستشفى).',
		timing: 'عند الحاجة – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Ampoule',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: midazolamAmpRule('5mg/ml'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'خطر تثبيط التنفس/هبوط ضغط.', 'قد يسبب نعاس شديد.'],
	},

	// 127) convarsiotam 100 mg 20 f.c.tabs.
	{
		id: 'convarsiotam-100-20-tabs-ae3',
		name: 'convarsiotam 100 mg 20 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '100mg',
		price: 200,
		matchKeywords: ['convarsiotam 100 20', 'brivaracetam 100', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'راقب تغيرات المزاج.'],
	},

	// 128) epicopentin 100 mg 30 caps.
	{
		id: 'epicopentin-100-30-caps-ae3',
		name: 'epicopentin 100 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '100mg',
		price: 51,
		matchKeywords: ['epicopentin 100 30', 'gabapentin 100', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٣٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 129) epicopentin 400 mg 30 caps.
	{
		id: 'epicopentin-400-30-caps-ae3',
		name: 'epicopentin 400 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 126,
		matchKeywords: ['epicopentin 400 30', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٤٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 130) levectam 1000 mg 20 f.c.tabs.
	{
		id: 'levectam-1000-20-tabs-ae3',
		name: 'levectam 1000 mg 20 f.c.tabs.',
		genericName: 'levetiracetam',
		concentration: '1000mg',
		price: 129,
		matchKeywords: ['levectam 1000 20', 'levetiracetam 1000', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 131) arbateg 200mg 30 tab
	{
		id: 'arbateg-200-30-tabs-ae3',
		name: 'arbateg 200mg 30 tab',
		genericName: 'carbamazepine',
		concentration: '200mg',
		price: 75,
		matchKeywords: ['arbateg 200 30', 'carbamazepine 200', '#anti-epileptic'],
		usage: 'كاربامازيبين لعلاج نوبات الصرع وبعض آلام الأعصاب.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٢٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم أو اضطرابات دم (نادر).', 'يتداخل مع أدوية كثيرة (محفز إنزيمات).'],
	},

	// 132) controlepsy 50 mg 30 tab
	{
		id: 'controlepsy-50-30-tabs-ae3',
		name: 'controlepsy 50 mg 30 tab',
		genericName: 'lamotrigine',
		concentration: '50mg',
		price: 78,
		matchKeywords: ['controlepsy 50 30', 'lamotrigine 50', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين لعلاج الصرع (ويُستخدم أيضاً كمثبت للمزاج).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٢٥ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['خطر طفح جلدي شديد خصوصاً مع الزيادة السريعة.', 'يلزم الالتزام بالتدرج.'],
	},

	// 133) andovimpamide 150mg 10 tabs.
	{
		id: 'andovimpamide-150-10-tabs-ae3',
		name: 'andovimpamide 150mg 10 tabs.',
		genericName: 'lacosamide',
		concentration: '150mg',
		price: 75.25,
		matchKeywords: ['andovimpamide 150 10', 'lacosamide 150', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'قد يطيل PR ويزيد خطر اضطراب نظم عند بعض المرضى.'],
	},

	// 134) balinozar 150mg 20 cap.
	{
		id: 'balinozar-150-20-caps-ae3',
		name: 'balinozar 150mg 20 cap.',
		genericName: 'pregabalin',
		concentration: '150mg',
		price: 56,
		matchKeywords: ['balinozar 150 20', 'pregabalin 150', '#anti-epileptic', '#gaba analogs'],
		usage: 'بريجابالين (مضاد للتشنجات ويُستخدم أكثر لآلام الأعصاب/القلق).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: fixed('٧٥ مجم (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يسبب وذمة/زيادة وزن.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 135) lacosamet 50 mg 20 f.c. tabs.
	{
		id: 'lacosamet-50-20-tabs-ae3',
		name: 'lacosamet 50 mg 20 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 114,
		matchKeywords: ['lacosamet 50 20', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'قد يطيل PR ويزيد خطر اضطراب نظم عند بعض المرضى.'],
	},

	// 136) convagran 100 mg 30 caps.
	{
		id: 'convagran-100-30-caps-ae3',
		name: 'convagran 100 mg 30 caps.',
		genericName: 'zonisamide',
		concentration: '100mg',
		price: 153,
		matchKeywords: ['convagran 100 30', 'zonisamide 100', '#anti-epileptic', '#sulfonamides'],
		usage: 'زونيساميد لعلاج نوبات الصرع (عادةً كعلاج مساعد).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('١٠٠ مجم (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يسبب حصوات كلى.', 'يُستخدم بحذر في حساسية السلفا.'],
	},

	// 137) epicopentin 600mg 30 f.c. tab.
	{
		id: 'epicopentin-600-30-tabs-ae3',
		name: 'epicopentin 600mg 30 f.c. tab.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 138,
		matchKeywords: ['epicopentin 600 30', 'gabapentin 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٦٠٠ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 138) futatreat 100mg/ml oral soln. 100 ml
	{
		id: 'futatreat-100mg-ml-oral-soln-100ml-ae3',
		name: 'futatreat 100mg/ml oral soln. 100 ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 88,
		matchKeywords: ['futatreat 100mg/ml 100', 'levetiracetam oral solution', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام محلول فموي لنوبات الصرع.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: levetiracetamSolutionRule('100mg/ml'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 139) gabapentin 300 mg 30 f.c.tabs.
	{
		id: 'gabapentin-300-30-tabs-ae3',
		name: 'gabapentin 300 mg 30 f.c.tabs.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 96,
		matchKeywords: ['gabapentin 300 30', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٣٠٠ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 140) kepilepsy 500mg 10 f.c.tab.
	{
		id: 'kepilepsy-500-10-tabs-ae3',
		name: 'kepilepsy 500mg 10 f.c.tab.',
		genericName: 'levetiracetam',
		concentration: '500mg',
		price: 34,
		matchKeywords: ['kepilepsy 500 10', 'levetiracetam 500', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام لعلاج نوبات الصرع.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 141) kepilepsy 500mg/5ml conc. sol. for i.v. 5 amp.
	{
		id: 'kepilepsy-500mg-5ml-iv-5-amps-ae3',
		name: 'kepilepsy 500mg/5ml conc. sol. for i.v. 5 amp.',
		genericName: 'levetiracetam',
		concentration: '500mg/5ml',
		price: 130,
		matchKeywords: ['kepilepsy iv 500/5', 'levetiracetam iv 500mg/5ml', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام وريدي (بديل مؤقت للفموي داخل المستشفى).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Ampoules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: levetiracetamIvRule(500),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'قد يسبب دوخة/نعاس أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 142) lacosamet 50 mg 10 f.c. tabs.
	{
		id: 'lacosamet-50-10-tabs-ae3',
		name: 'lacosamet 50 mg 10 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 57,
		matchKeywords: ['lacosamet 50 10', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'قد يطيل PR ويزيد خطر اضطراب نظم عند بعض المرضى.'],
	},

	// 143) lepticure 400 mg 10 caps.
	{
		id: 'lepticure-400-10-caps-ae3',
		name: 'lepticure 400 mg 10 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 52,
		matchKeywords: ['lepticure 400 10', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٤٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 144) leptrogine 200 mg 30 tabs.
	{
		id: 'leptrogine-200-30-tabs-ae3',
		name: 'leptrogine 200 mg 30 tabs.',
		genericName: 'lamotrigine',
		concentration: '200mg',
		price: 123,
		matchKeywords: ['leptrogine 200 30', 'lamotrigine 200', '#anti-epileptic', '#triazine'],
		usage: 'لاموتريجين لعلاج الصرع (ويُستخدم أيضاً كمثبت للمزاج).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٢٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['خطر طفح جلدي شديد خصوصاً مع الزيادة السريعة.', 'يلزم الالتزام بالتدرج.'],
	},

	// 145) oxaleptal 300 mg 30 f.c.tabs.
	{
		id: 'oxaleptal-300-30-tabs-ae3',
		name: 'oxaleptal 300 mg 30 f.c.tabs.',
		genericName: 'oxcarbazepine',
		concentration: '300mg',
		price: 180,
		matchKeywords: ['oxaleptal 300 30', 'oxcarbazepine 300', '#anti-epileptic', '#carboxamides'],
		usage: 'أوكسكاربازيبين لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٣٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/نعاس.', 'قد يسبب نقص صوديوم بالدم (Hyponatremia).', 'قد يتداخل مع موانع الحمل الهرمونية.'],
	},

	// 146) phenytin 100mg/2ml 10 amps.
	{
		id: 'phenytin-100mg-2ml-10-amps-ae3',
		name: 'phenytin 100mg/2ml 10 amps.',
		genericName: 'phenytoin',
		concentration: '100mg/2ml',
		price: 110,
		matchKeywords: ['phenytin 100 2ml 10', 'phenytoin 100/2', '#anti-epileptic', '#hydantoin'],
		usage: 'فينيتوين حقن لعلاج التشنجات الحادة داخل المستشفى.',
		timing: 'حسب التعليمات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Ampoules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: phenytoinAmpRule('100mg/2ml'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'خطر هبوط ضغط/اضطراب نظم مع التسريب السريع.', 'قد يسبب نخر موضعي عند التسرب خارج الوريد.'],
	},

	// 147) ramsoom 600 mg 10 f.c. tab.
	{
		id: 'ramsoom-600-10-tabs-ae3',
		name: 'ramsoom 600 mg 10 f.c. tab.',
		genericName: 'gabapentin',
		concentration: '600mg',
		price: 35.5,
		matchKeywords: ['ramsoom 600 10', 'gabapentin 600', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٦٠٠ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 148) seizurless 100mg/ml oral solution 120 ml
	{
		id: 'seizurless-100mg-ml-oral-solution-120ml-ae3',
		name: 'seizurless 100mg/ml oral solution 120 ml',
		genericName: 'levetiracetam',
		concentration: '100mg/ml',
		price: 105,
		matchKeywords: ['seizurless oral solution', 'levetiracetam 100mg/ml', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام محلول فموي لنوبات الصرع.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Solution',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: levetiracetamSolutionRule('100mg/ml'),
		warnings: ['قد يسبب نعاس/دوخة أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 149) shalgaten 300mg 20 capsules
	{
		id: 'shalgaten-300-20-caps-ae3',
		name: 'shalgaten 300mg 20 capsules',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 61,
		matchKeywords: ['shalgaten 300 20', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٣٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 150) sominaletta 15mg/5ml elixir 120 ml
	{
		id: 'sominaletta-15mg-5ml-elixir-120ml-ae3',
		name: 'sominaletta 15mg/5ml elixir 120 ml',
		genericName: 'phenobarbitone',
		concentration: '15mg/5ml',
		price: 31,
		matchKeywords: ['sominaletta 15/5 120', 'phenobarbitone elixir', '#anti-epileptic', '#barbiturates'],
		usage: 'فينوباربيتون (باربيتورات) لعلاج بعض أنواع الصرع.',
		timing: 'مرة ليلاً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Syrup',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: phenobarbitalElixirRule('15mg/5ml'),
		warnings: ['قد يسبب نعاس/تثبيط تنفس بجرعات عالية.', 'خطر الاعتماد/الانسحاب عند الإيقاف المفاجئ.'],
	},

	// 151) topilept 100mg 30 f.c.tab.
	{
		id: 'topilept-100-30-tabs-ae3',
		name: 'topilept 100mg 30 f.c.tab.',
		genericName: 'topiramate',
		concentration: '100mg',
		price: 105,
		matchKeywords: ['topilept 100 30', 'topiramate 100', '#anti-epileptic', '#fructose derivative'],
		usage: 'توبيراميت لعلاج الصرع (ويُستخدم أيضاً للصداع النصفي حسب الحالة).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٢٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب تنميل/دوخة/نقص شهية.', 'قد يسبب حصوات كلى.', 'قد يقلل التعرق/يرفع الحرارة خاصة الأطفال.'],
	},

	// 152) zonivan 100 mg 20 caps
	{
		id: 'zonivan-100-20-caps-ae3',
		name: 'zonivan 100 mg 20 caps',
		genericName: 'zonisamide',
		concentration: '100mg',
		price: 76,
		matchKeywords: ['zonivan 100 20', 'zonisamide 100', '#anti-epileptic', '#sulfonamides'],
		usage: 'زونيساميد لعلاج نوبات الصرع (عادةً كعلاج مساعد).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('١٠٠ مجم (كبسولة) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يسبب حصوات كلى.', 'يُستخدم بحذر في حساسية السلفا.'],
	},

	// 153) lacosavil 100 mg 30 f.c. tabs.
	{
		id: 'lacosavil-100-30-tabs-ae3',
		name: 'lacosavil 100 mg 30 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '100mg',
		price: 240,
		matchKeywords: ['lacosavil 100 30', 'lacosamide 100', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'قد يطيل PR ويزيد خطر اضطراب نظم عند بعض المرضى.'],
	},

	// 154) lacosavil 50 mg 30 f.c. tabs.
	{
		id: 'lacosavil-50-30-tabs-ae3',
		name: 'lacosavil 50 mg 30 f.c. tabs.',
		genericName: 'lacosamide',
		concentration: '50mg',
		price: 135,
		matchKeywords: ['lacosavil 50 30', 'lacosamide 50', '#anti-epileptic'],
		usage: 'لاكوساميد لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب دوخة/عدم اتزان.', 'قد يطيل PR ويزيد خطر اضطراب نظم عند بعض المرضى.'],
	},

	// 155) shalgaten 300mg 30 caps.
	{
		id: 'shalgaten-300-30-caps-ae3',
		name: 'shalgaten 300mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '300mg',
		price: 126,
		matchKeywords: ['shalgaten 300 30', 'gabapentin 300', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٣٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 156) convarsiotam 50 mg 20 f.c.tabs.
	{
		id: 'convarsiotam-50-20-tabs-ae3',
		name: 'convarsiotam 50 mg 20 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '50mg',
		price: 200,
		matchKeywords: ['convarsiotam 50 20', 'brivaracetam 50', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'راقب تغيرات المزاج.'],
	},

	// 157) convarsiotam 75 mg 20 f.c.tabs.
	{
		id: 'convarsiotam-75-20-tabs-ae3',
		name: 'convarsiotam 75 mg 20 f.c.tabs.',
		genericName: 'brivaracetam',
		concentration: '75mg',
		price: 200,
		matchKeywords: ['convarsiotam 75 20', 'brivaracetam 75', '#anti-epileptic', '#sv2a ligands'],
		usage: 'بريفيراسيتام لعلاج نوبات الصرع الجزئية.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Film-coated Tablet',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'راقب تغيرات المزاج.'],
	},

	// 158) inadilvox 500mg/5ml iv vial
	{
		id: 'inadilvox-500mg-5ml-iv-vial-ae3',
		name: 'inadilvox 500mg/5ml iv vial',
		genericName: 'levetiracetam',
		concentration: '500mg/5ml',
		price: 29,
		matchKeywords: ['inadilvox iv 500/5', 'levetiracetam iv vial 500mg/5ml', '#anti-epileptic', '#pyrrolidine'],
		usage: 'ليفِتيراسيتام وريدي (بديل مؤقت للفموي داخل المستشفى).',
		timing: 'مرتين يومياً – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'I.V. Infusion Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: levetiracetamIvRule(500),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'قد يسبب دوخة/نعاس أو عصبية.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 159) lepticure 400 mg 30 caps.
	{
		id: 'lepticure-400-30-caps-ae3',
		name: 'lepticure 400 mg 30 caps.',
		genericName: 'gabapentin',
		concentration: '400mg',
		price: 156,
		matchKeywords: ['lepticure 400 30', 'gabapentin 400', '#anti-epileptic', '#gaba analogs'],
		usage: 'جابابنتين (مضاد للصرع/آلام الأعصاب).',
		timing: 'كل ٨ ساعات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: fixed('٤٠٠ مجم (كبسولة) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
		warnings: ['قد يسبب نعاس/دوخة.', 'قد يحتاج ضبط جرعة في قصور الكلى.'],
	},

	// 160) phenytin 100mg/2ml 1 amp.
	{
		id: 'phenytin-100mg-2ml-1-amp-ae3',
		name: 'phenytin 100mg/2ml 1 amp.',
		genericName: 'phenytoin',
		concentration: '100mg/2ml',
		price: 11,
		matchKeywords: ['phenytin 100 2ml 1', 'phenytoin 100/2', '#anti-epileptic', '#hydantoin'],
		usage: 'فينيتوين حقن لعلاج التشنجات الحادة داخل المستشفى.',
		timing: 'حسب التعليمات – مزمن',
		category: Category.ANTIEPILEPTICS,
		form: 'Ampoule',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: phenytoinAmpRule('100mg/2ml'),
		warnings: ['للاستخدام بواسطة مختص فقط.', 'خطر هبوط ضغط/اضطراب نظم مع التسريب السريع.', 'قد يسبب نخر موضعي عند التسرب خارج الوريد.'],
	},
];

