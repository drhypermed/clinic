
import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;
const roundSmallVol = (vol: number): number => Math.round(vol * 10) / 10;
const tag = (...tags: string[]) => tags;

const commonParacetamolWarnings = [
	'لا تجمع أكثر من منتج يحتوي على باراسيتامول.',
	'مرضى الكبد أو من يتناولون كحول بكثرة: استخدم أقل جرعة ولأقصر مدة؛ تجنب الكحول.',
];

const commonNsaidWarnings = [
	'يفضل بعد الأكل لتقليل تهيج المعدة.',
	'لا تجمع أكثر من مسكن من مضادات الالتهاب غير الستيرويدية في نفس الوقت.',
	'يُتجنب مع قرحة أو نزيف بالمعدة، فشل كلوي شديد، وأواخر الحمل.',
];

const commonDecongestantWarnings = [
	'مزيلات الاحتقان قد تسبب أرق أو خفقان أو ترفع الضغط؛ تُستخدم بحذر لمرضى الضغط والقلب.',
	'يُمنع مع أدوية مثبطات إنزيم أحادي الأمين خلال ١٤ يوم.',
];

const lidocaineMaxDoseText = (weight: number, mgPerMl: number, withEpinephrine: boolean) => {
	const maxMg = withEpinephrine ? Math.min(weight * 7, 500) : Math.min(weight * 4.5, 300);
	const maxMl = roundSmallVol(maxMg / mgPerMl);
	return `الحد الأقصى الإجمالي = ${toAr(Math.round(maxMg))} مجم ≈ ${toAr(maxMl)} مل (لا يتكرر إلا بتوجيه مختص).`;
};

const bupivacaineMaxDoseText = (weight: number, mgPerMl: number, withEpinephrine: boolean) => {
	// بدون أدرينالين: ٢٫٥ مجم/كجم (حد أقصى ١٧٥ مجم). مع أدرينالين: ٣ مجم/كجم (حد أقصى ٢٢٥ مجم).
	const maxMg = withEpinephrine ? Math.min(weight * 3, 225) : Math.min(weight * 2.5, 175);
	const maxMl = roundSmallVol(maxMg / mgPerMl);
	return `الحد الأقصى الإجمالي = ${toAr(Math.round(maxMg))} مجم ≈ ${toAr(maxMl)} مل (لا يتكرر إلا بتوجيه مختص).`;
};

const ibuprofen100mg5mlDoseText = (weight: number) => {
	// 10 مجم/كجم لكل جرعة. التركيز 100 مجم/5 مل = 20 مجم/مل
	const ml = roundVol(weight / 2);
	return `${toAr(ml)} مل لكل جرعة كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).`;
};

const paracetamol120mg5mlDoseText = (weight: number) => {
	// 15 مجم/كجم لكل جرعة. التركيز 120 مجم/5 مل = 24 مجم/مل
	const ml = roundVol((weight * 15) / 24);
	return `${toAr(ml)} مل لكل جرعة كل ٦ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).`;
};

const paracetamolIv1000mg100mlDoseText = (weight: number, ageMonths: number) => {
	// ١٠ مجم/مل. الأطفال: ١٥ مجم/كجم = ١٫٥ مل/كجم. البالغون (≥ ٥٠ كجم): ١٠٠ مل.
	if (ageMonths >= 144 && weight >= 50) {
		return '١٠٠ مل (١ جم) بالتسريب الوريدي كل ٦ ساعات عند اللزوم (حد أقصى ٤ مرات/٢٤ ساعة).';
	}
	const ml = roundVol(weight * 1.5);
	return `${toAr(ml)} مل (تقريباً) بالتسريب الوريدي كل ٦ ساعات عند اللزوم (حد أقصى ٤ مرات/٢٤ ساعة).`;
};

const ibuprofen40mgMlDropsDoseText = (weight: number) => {
	// 10 مجم/كجم لكل جرعة. التركيز 40 مجم/مل => 0.25 مل/كجم لكل جرعة
	const ml = roundSmallVol(weight * 0.25);
	return `${toAr(ml)} مل لكل جرعة كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).`;
};

export const ANALGESICS_8: Medication[] = [
	// 378
	{
		id: 'lidocaine-hcl-2-otsuka-amp-5ml-a8',
		name: 'lidocaine 2% (otsuka) amp. 5 ml',
		genericName: 'lidocaine hydrochloride',
		concentration: '2% (20mg/ml) - 5ml',
		price: 5,
		matchKeywords: ['lidocaine 2 otsuka 5', 'ليدوكايين ٢ امبول ٥', ...tag('#analgesics', '#topical anaesthetic')],
		usage: 'مخدر موضعي للحقن الموضعي (يُستخدم بواسطة مختص).',
		timing: 'حقن – حسب الإجراء',
		category: Category.ANALGESICS,
		form: 'Ampoule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: (weight, _ageMonths) => lidocaineMaxDoseText(weight, 20, false),
		warnings: [
			'الجرعة الزائدة قد تسبب دوخة شديدة أو تشنجات أو اضطراب ضربات القلب.',
			'يُتجنب في الحساسية تجاه مخدرات موضعية مشابهة.',
			'يلزم التأكد من عدم الحقن داخل وعاء دموي بالخطأ بواسطة المختص.',
		],
	},

	// 382
	{
		id: 'lignocaine-lidocaine-10-spray-80ml-a8',
		name: 'lignocaine 10% spray 80ml',
		genericName: 'lidocaine',
		concentration: '10% (80 ml)',
		price: 33.6,
		matchKeywords: ['lignocaine 10 spray 80', 'ليجنكايين سبراي ٨٠', ...tag('#analgesics', '#topical anaesthetic')],
		usage: 'مخدر موضعي بخاخ لتسكين موضعي قصير المدى.',
		timing: 'عند الألم – لفترة قصيرة',
		category: Category.ANALGESICS,
		form: 'Spray',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: () => 'رش كمية قليلة فقط على المنطقة المطلوبة حسب الحاجة.',
		warnings: [
			'قد تسبب حساسية أو تنميل زائد أو دوخة عند الإفراط.',
			'تجنب استخدامها مع مخدرات موضعية أخرى على نفس المكان.',
			'الحمل والرضاعة: تُستخدم بكميات قليلة وعند الضرورة فقط.',
		],
	},

	// 383
	{
		id: 'gescamoli-extra-paracetamol-caffeine-30-fct-a8',
		name: 'gescamoli extra 30 fct',
		genericName: 'paracetamol & caffeine',
		concentration: 'Paracetamol + Caffeine',
		price: 33,
		matchKeywords: ['gescamoli extra 30', 'جيسكامولي اكسترا', ...tag('#analgesics', '#antipyretics')],
		usage: 'مسكن وخافض حرارة، يفيد في الصداع وآلام الجسم.',
		timing: 'كل ٦–٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.PARACETAMOL,
		form: 'Film-coated Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٦–٨ ساعات عند اللزوم (حد أقصى ٨ أقراص/٢٤ ساعة من تركيز ٥٠٠ مجم باراسيتامول).',
		warnings: [...commonParacetamolWarnings, 'قد يزيد الخفقان أو الأرق لدى بعض الأشخاص بسبب الكافيين.'],
	},

	// 384
	{
		id: 'rolly-spray-120ml-a8',
		name: 'rolly spray 120 ml',
		genericName: 'menthol crystals & chamomile extract & rosemary & lavender',
		concentration: '120 ml',
		price: 100,
		matchKeywords: ['rolly spray 120', 'رولي سبراي', 'رش مساج', ...tag('#analgesics')],
		usage: 'بخاخ تبريد/مساج لتخفيف آلام العضلات البسيطة.',
		timing: 'مرة–٣ مرات يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Spray',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: () => 'يرش على المكان مع تدليك خفيف ١–٣ مرات يومياً حسب الحاجة.',
		warnings: ['قد يسبب تهيجاً موضعياً أو حساسية.'],
	},

	// 386
	{
		id: 'sunnypivacaine-bupivacaine-100mg-4ml-vial-20ml-a8',
		name: 'sunnypivacaine 100mg/4ml vial 20 ml',
		genericName: 'bupivacaine',
		concentration: '25mg/ml (100mg/4ml)',
		price: 47.5,
		matchKeywords: ['sunnypivacaine 20', 'سانيبيفاكين', ...tag('#analgesics', '#topical anaesthetic')],
		usage: 'مخدر موضعي طويل المفعول للحقن الموضعي (يُستخدم بواسطة مختص).',
		timing: 'حقن – حسب الإجراء',
		category: Category.ANALGESICS,
		form: 'Vial',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: (weight, _ageMonths) => bupivacaineMaxDoseText(weight, 25, false),
		warnings: [
			'الجرعة الزائدة قد تسبب اضطراب ضربات القلب أو تشنجات.',
			'يُتجنب في الحساسية تجاه مخدرات موضعية مشابهة.',
		],
	},

	// 388
	{
		id: 'ultracaine-lidocaine-hcl-20mg-ml-vial-50ml-a8',
		name: 'ultracaine 20mg/ml vial 50 ml',
		genericName: 'lidocaine hydrochloride',
		concentration: '20mg/ml (2%) - 50ml',
		price: 13,
		matchKeywords: ['ultracaine vial 50', 'التراكاين', ...tag('#analgesics', '#topical anaesthetic')],
		usage: 'مخدر موضعي للحقن الموضعي (يُستخدم بواسطة مختص).',
		timing: 'حقن – حسب الإجراء',
		category: Category.ANALGESICS,
		form: 'Vial',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: (weight, _ageMonths) => lidocaineMaxDoseText(weight, 20, false),
		warnings: [
			'الجرعة الزائدة قد تسبب دوخة شديدة أو تشنجات أو اضطراب ضربات القلب.',
			'يُتجنب في الحساسية تجاه مخدرات موضعية مشابهة.',
		],
	},

	// 390
	{
		id: 'voltaren-sr-diclofenac-sodium-75mg-fc-tab-20-a8',
		name: 'voltaren sr 75mg 20 f.c.tab.',
		genericName: 'diclofenac sodium',
		concentration: '75mg',
		price: 45,
		matchKeywords: ['voltaren sr 75 20', 'فولتارين اس ار ٧٥', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب ممتد المفعول.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'Prolonged Release Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٧٥ مجم) مرة يومياً بعد الأكل (حد أقصى قرصين/٢٤ ساعة عند الضرورة ولمدة قصيرة).',
		warnings: [...commonNsaidWarnings],
	},

	// 391
	{
		id: 'expaintech-pm-paracetamol-diphenhydramine-20-tabs-a8',
		name: 'expaintech-pm 20 tabs.',
		genericName: 'diphenhydramine & paracetamol',
		concentration: 'Paracetamol + Diphenhydramine',
		price: 46,
		matchKeywords: ['expaintech pm', 'اكسباينتك', ...tag('#analgesics')],
		usage: 'مسكن ليلي يساعد على النوم عند وجود ألم.',
		timing: 'مرة يومياً قبل النوم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد قبل النوم (ولا تتجاوز قرصين/٢٤ ساعة).',
		warnings: [
			'يسبب النعاس؛ تجنب القيادة أو العمل على آلات بعد تناوله.',
			'تجنب الكحول أو المهدئات الأخرى.',
			...commonParacetamolWarnings,
		],
	},

	// 392
	{
		id: 'stopadol-forte-paracetamol-1000-eff-sachets-10-a8',
		name: 'stopadol forte 1000 mg 10 eff. sachets',
		genericName: 'paracetamol',
		concentration: '1000mg',
		price: 60,
		matchKeywords: ['stopadol forte 1000 sachets', 'ستوبادول فورت', ...tag('#analgesics', '#antipyretics')],
		usage: 'مسكن وخافض حرارة (فوار أكياس).',
		timing: 'كل ٦–٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.PARACETAMOL,
		form: 'Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'كيس واحد (١ جم) كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أكياس/٢٤ ساعة).',
		warnings: [...commonParacetamolWarnings],
	},

	// 393
	{
		id: 'stopadol-night-paracetamol-diphenhydramine-30-fc-tabs-a8',
		name: 'stopadol night 30 f.c.tabs.',
		genericName: 'paracetamol & diphenhydramine hydrochloride',
		concentration: 'Paracetamol + Diphenhydramine',
		price: 78,
		matchKeywords: ['stopadol night 30', 'ستوبادول نايت ٣٠', ...tag('#analgesics')],
		usage: 'مسكن ليلي يساعد على النوم عند وجود ألم.',
		timing: 'مرة يومياً قبل النوم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد قبل النوم، ويمكن قرصين عند شدة الألم (حد أقصى قرصين/٢٤ ساعة).',
		warnings: [
			'يسبب النعاس؛ تجنب القيادة أو العمل على آلات بعد تناوله.',
			'تجنب الكحول أو المهدئات الأخرى.',
			...commonParacetamolWarnings,
		],
	},

	// 394
	{
		id: 'adwiflam-diclofenac-potassium-25mg-children-supp-5-a8',
		name: 'adwiflam 25mg children 5 supp.',
		genericName: 'diclofenac potassium',
		concentration: '25mg',
		price: 15,
		matchKeywords: ['adwiflam 25 children supp', 'ادويفلام ٢٥ لبوس', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'لبوس مسكن ومضاد التهاب للأطفال.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'Suppositories',
		minAgeMonths: 72,
		maxAgeMonths: 144,
		minWeight: 12,
		maxWeight: 50,
		calculationRule: (weight, _ageMonths) => {
			if (weight < 15) {
				return 'لبوسة واحدة (٢٥ مجم) كل ١٢ ساعة عند اللزوم (حد أقصى ٢ لبوسة/٢٤ ساعة).';
			}
			if (weight < 30) {
				return 'لبوسة واحدة (٢٥ مجم) كل ٨–١٢ ساعة عند اللزوم (حد أقصى ٣ لبوسات/٢٤ ساعة).';
			}
			return 'لبوسة واحدة (٢٥ مجم) كل ٨ ساعات عند اللزوم (حد أقصى ٣ لبوسات/٢٤ ساعة).';
		},
		warnings: [...commonNsaidWarnings, 'الأطفال: يستخدم بحذر بجرعة محددة إذا كان الطفل يعاني من ربو أو قرحة.'],
	},

	// 395
	{
		id: 'cetal-sinus-paracetamol-pseudoephedrine-20-caplets-a8',
		name: 'cetal sinus 20 caplets',
		genericName: 'paracetamol & pseudoephedrine',
		concentration: 'Paracetamol + Pseudoephedrine',
		price: 36,
		matchKeywords: ['cetal sinus 20', 'سيتال ساينس', ...tag('#common cold')],
		usage: 'لتخفيف ألم/حرارة مع احتقان الأنف والجيوب.',
		timing: 'كل ٦–٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'Caplet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).',
		warnings: [...commonParacetamolWarnings, ...commonDecongestantWarnings],
	},

	// 396
	{
		id: 'declophen-fast-diclofenac-potassium-50mg-powder-sachets-30-a8',
		name: 'declophen fast 50mg gr. for oral susp. 30 sachets',
		genericName: 'diclofenac potassium',
		concentration: '50mg',
		price: 102,
		matchKeywords: ['declophen fast 50 30', 'ديكلوفين فاست ٣٠', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب سريع المفعول (أكياس).',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٧ أيام',
		category: Category.DICLOFENAC,
		form: 'Powder for Oral Suspension Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'كيس واحد (٥٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أكياس/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 397
	{
		id: 'declophen-fast-diclofenac-potassium-50mg-powder-sachets-10-a8',
		name: 'declophen fast 50mg gr. for oral susp. 10 sachets',
		genericName: 'diclofenac potassium',
		concentration: '50mg',
		price: 34,
		matchKeywords: ['declophen fast 50 10', 'ديكلوفين فاست ١٠', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب سريع المفعول (أكياس).',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٧ أيام',
		category: Category.DICLOFENAC,
		form: 'Powder for Oral Suspension Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'كيس واحد (٥٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أكياس/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 398
	{
		id: 'rontigrone-dexibuprofen-400mg-30-scored-fc-tabs-a8',
		name: 'rontigrone 400 mg 30 scored f.c. tabs.',
		genericName: 'dexibuprofen',
		concentration: '400mg',
		price: 159,
		matchKeywords: ['rontigrone 400 30', 'رونتيجرون ٤٠٠', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.IBUPROFEN,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٤٠٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 399
	{
		id: 'dolo-d-plus-20-tabs',
		name: 'dolo-d plus 20 tabs.',
		genericName: 'ibuprofen & pseudoephedrine',
		concentration: '400mg + 60mg',
		price: 42,
		matchKeywords: ['dolo d plus 20', 'دولو دي بلس ٢٠', ...tag('#common cold')],
		usage: 'لتخفيف ألم/التهاب مع احتقان الأنف والجيوب.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٨ أو ١٢ ساعة بعد الأكل (حد أقصى ٣ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings, ...commonDecongestantWarnings, 'لا تجمعه مع أي مزيل احتقان آخر.'],
	},

	// 400
	{
		id: 'epifenac-diclofenac-sodium-25mg-ec-tabs-20-a8',
		name: 'epifenac 25 mg 20 e.c. tab.',
		genericName: 'diclofenac sodium',
		concentration: '25mg',
		price: 12,
		matchKeywords: ['epifenac 25 ec 20', 'ايبيفيناك ٢٥', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨ ساعات بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'E.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٢٥ مجم) كل ٨ ساعات بعد الأكل عند اللزوم، ويمكن قرصين كل ٨ ساعات عند شدة الألم (حد أقصى ٦ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 401
	{
		id: 'eurocox-celecoxib-100mg-10-tabs-a8',
		name: 'eurocox 100mg 10 tab.',
		genericName: 'celecoxib',
		concentration: '100mg',
		price: 19.2,
		matchKeywords: ['eurocox 100 10', 'يوروكوكس ١٠٠', ...tag('#nsaid', '#cox-2 inhibitors')],
		usage: 'مسكن ومضاد التهاب انتقائي.',
		timing: 'مرة–مرتين يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (١٠٠ مجم) مرة إلى مرتين يومياً بعد الأكل (حد أقصى قرصين/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings, 'قد يزيد الضغط وخطر الجلطات عند بعض المرضى.'],
	},

	// 402
	{
		id: 'feldoral-piroxicam-20mg-10-caps-a8',
		name: 'feldoral 20mg 10 caps.',
		genericName: 'piroxicam',
		concentration: '20mg',
		price: 8,
		matchKeywords: ['feldoral 20 caps 10', 'فيلدورال ٢٠ كبسول', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Capsules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'كبسولة واحدة (٢٠ مجم) مرة يومياً بعد الأكل.',
		warnings: [...commonNsaidWarnings],
	},

	// 403
	{
		id: 'feldoral-piroxicam-20mg-6-supp-a8',
		name: 'feldoral 20mg 6 supp.',
		genericName: 'piroxicam',
		concentration: '20mg',
		price: 18,
		matchKeywords: ['feldoral 20 supp 6', 'فيلدورال ٢٠ لبوس', ...tag('#nsaid', '#oxicam')],
		usage: 'لبوس مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Suppositories',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'لبوسة واحدة (٢٠ مجم) مرة يومياً بعد الأكل أو قبل النوم.',
		warnings: [...commonNsaidWarnings],
	},

	// 404
	{
		id: 'feldoral-piroxicam-20mg-ml-amp-3-a8',
		name: 'feldoral 20mg/ml 3 amp.',
		genericName: 'piroxicam',
		concentration: '20mg/ml',
		price: 16.5,
		matchKeywords: ['feldoral 20 amp', 'فيلدورال امبول', ...tag('#nsaid', '#oxicam')],
		usage: 'حقن مسكنة ومضادة للالتهاب (تُعطى بواسطة مختص).',
		timing: 'عند الألم – لفترة قصيرة',
		category: Category.ANALGESICS,
		form: 'Ampoules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'أمبول واحد بالعضل مرة يومياً ولمدة قصيرة فقط (٣–٥ أيام كحد أقصى).',
		warnings: [...commonNsaidWarnings],
	},

	// 405
	{
		id: 'flabu-ibuprofen-40mg-ml-oral-drops-15ml-a8',
		name: 'flabu 40mg/ml oral drops. 15 ml',
		genericName: 'ibuprofen',
		concentration: '40mg/ml',
		price: 6,
		matchKeywords: ['flabu drops 40', 'فلابو نقط', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن وخافض حرارة للأطفال (نقط فموية).',
		timing: 'كل ٦–٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.IBUPROFEN,
		form: 'Oral Drops',
		minAgeMonths: 6,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 50,
		calculationRule: (weight, ageMonths) => {
			if (ageMonths < 6) {
				return 'أقل من ٦ أشهر: غير موصى به؛ من ٦ أشهر: جرعة محددة حسب الوزن.';
			}
			return ibuprofen40mgMlDropsDoseText(weight);
		},
		warnings: [...commonNsaidWarnings],
	},

	// 406
	{
		id: 'paracpimol-paracetamol-1g-100ml-iv-inf-vial-a8',
		name: 'paracpimol 1 gm/100ml vial for i.v. inf.',
		genericName: 'paracetamol',
		concentration: '1g/100ml',
		price: 67,
		matchKeywords: ['paracpimol 1g 100ml', 'باراسبيمول', ...tag('#antipyretics')],
		usage: 'خافض حرارة ومسكن بالتسريب الوريدي (يُعطى بواسطة مختص).',
		timing: 'كل ٦ ساعات عند الألم – ٣–٥ أيام',
		category: Category.PARACETAMOL,
		form: 'I.V. Infusion Vial',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight, ageMonths) => paracetamolIv1000mg100mlDoseText(weight, ageMonths),
		warnings: [...commonParacetamolWarnings, 'مرضى الكبد: استخدم بأقل جرعة ولأقصر مدة.'],
	},

	// 407
	{
		id: 'recoxitro-etoricoxib-120mg-10-fc-tabs-a8',
		name: 'recoxitro 120 mg 10 f.c. tabs.',
		genericName: 'etoricoxib',
		concentration: '120mg',
		price: 65.75,
		matchKeywords: ['recoxitro 120', 'ريكوكسترو ١٢٠', ...tag('#nsaid', '#cox-2 inhibitors')],
		usage: 'مسكن ومضاد التهاب انتقائي.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (١٢٠ مجم) مرة يومياً بعد الأكل ولمدة قصيرة (حد أقصى قرص واحد/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings, 'قد يزيد الضغط وخطر الجلطات عند بعض المرضى.'],
	},

	// 408
	{
		id: 'inflacam-piroxicam-20mg-10-caps-a8',
		name: 'inflacam 20mg 10 caps.',
		genericName: 'piroxicam',
		concentration: '20mg',
		price: 15,
		matchKeywords: ['inflacam 20 10', 'انفلاكام ٢٠', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Capsules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'كبسولة واحدة (٢٠ مجم) مرة يومياً بعد الأكل.',
		warnings: [...commonNsaidWarnings],
	},

	// 409
	{
		id: 'ketofan-ketoprofen-75mg-30-caps-a8',
		name: 'ketofan 75mg 30 caps.',
		genericName: 'ketoprofen',
		concentration: '75mg',
		price: 57,
		matchKeywords: ['ketofan 75 30', 'كيتوفان ٧٥', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة–مرتين يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Capsules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'كبسولة واحدة (٧٥ مجم) مرة إلى مرتين يومياً بعد الأكل (حد أقصى كبسولتين/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 410
	{
		id: 'ketolgin-ketoprofen-100mg-5-supp-a8',
		name: 'ketolgin 100mg 5 supp.',
		genericName: 'ketoprofen',
		concentration: '100mg',
		price: 4.5,
		matchKeywords: ['ketolgin 100 supp 5', 'كيتولجين ١٠٠ لبوس', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'لبوس مسكن ومضاد التهاب.',
		timing: 'مرة–مرتين يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Suppositories',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'لبوسة واحدة (١٠٠ مجم) مرة يومياً بعد الأكل أو قبل النوم (حد أقصى لبوسة واحدة/٢٤ ساعة؛ لا تزيد بدون إعادة تقييم).',
		warnings: [...commonNsaidWarnings],
	},

	// 411
	{
		id: 'ketolgin-ketoprofen-100mg-3-amp-a8',
		name: 'ketolgin 100mg 3 amp.',
		genericName: 'ketoprofen',
		concentration: '100mg',
		price: 10.5,
		matchKeywords: ['ketolgin 100 amp', 'كيتولجين امبول', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'حقن مسكنة ومضادة للالتهاب (تُعطى بواسطة مختص).',
		timing: 'عند الألم – لفترة قصيرة',
		category: Category.ANALGESICS,
		form: 'Ampoules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'أمبول واحد بالعضل مرة يومياً ولمدة قصيرة فقط (٣–٥ أيام كحد أقصى).',
		warnings: [...commonNsaidWarnings],
	},

	// 412
	{
		id: 'lornicam-lornoxicam-8mg-rapid-odt-10-a8',
		name: 'lornicam 8mg rapid 10 disintegrating tab.',
		genericName: 'lornoxicam',
		concentration: '8mg',
		price: 45,
		matchKeywords: ['lornicam 8 rapid', 'لورنيكام رابيد', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب سريع الذوبان.',
		timing: 'مرة–مرتين يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Oral Dispersible Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٨ مجم) مرة إلى مرتين يومياً بعد الأكل (حد أقصى قرصين/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 413
	{
		id: 'lornoxicam-lornoxicam-4mg-20-fc-tabs-a8',
		name: 'lornoxicam 4mg 20 f.c.tab',
		genericName: 'lornoxicam',
		concentration: '4mg',
		price: 54,
		matchKeywords: ['lornoxicam 4 20', 'لورنوكسيكام ٤', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٧ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٤ مجم) كل ٨–١٢ ساعة بعد الأكل (حد أقصى ٤ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 414
	{
		id: 'medexaflam-meloxicam-15mg-1-5ml-amp-3-a8',
		name: 'medexaflam 15mg/1.5ml 3 amp.',
		genericName: 'meloxicam',
		concentration: '15mg/1.5ml',
		price: 21,
		matchKeywords: ['medexaflam 15 amp', 'ميدكسافلام', ...tag('#nsaid', '#oxicam')],
		usage: 'حقن مسكنة ومضادة للالتهاب (تُعطى بواسطة مختص).',
		timing: 'عند الألم – لفترة قصيرة',
		category: Category.ANALGESICS,
		form: 'Ampoules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'أمبول واحد (١٥ مجم) بالعضل مرة يومياً ولمدة قصيرة فقط (ولا تتجاوز ١٥ مجم/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 415
	{
		id: 'meloflam-meloxicam-15mg-30-fc-tabs-a8',
		name: 'meloflam 15mg 30 f.c. tabs',
		genericName: 'meloxicam',
		concentration: '15mg',
		price: 33,
		matchKeywords: ['meloflam 15 30', 'ميلوفلام ١٥', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (١٥ مجم) مرة يومياً بعد الأكل (ولا تتجاوز ١٥ مجم/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 416
	{
		id: 'mexicam-meloxicam-15mg-20-fc-tabs-a8',
		name: 'mexicam 15mg 20 f.c.tab.',
		genericName: 'meloxicam',
		concentration: '15mg',
		price: 36,
		matchKeywords: ['mexicam 15 20', 'مكسيكام ١٥', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (١٥ مجم) مرة يومياً بعد الأكل (ولا تتجاوز ١٥ مجم/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 417
	{
		id: 'realcoxstar-etoricoxib-60mg-14-fc-tabs-a8',
		name: 'realcoxstar 60 mg 14 f.c.tabs.',
		genericName: 'etoricoxib',
		concentration: '60mg',
		price: 98,
		matchKeywords: ['realcoxstar 60 14', 'ريالكوكس ستار ٦٠', ...tag('#nsaid', '#cox-2 inhibitors')],
		usage: 'مسكن ومضاد التهاب انتقائي.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٦٠ مجم) مرة يومياً بعد الأكل.',
		warnings: [...commonNsaidWarnings, 'قد يزيد الضغط وخطر الجلطات عند بعض المرضى.'],
	},

	// 418
	{
		id: 'olfen-diclofenac-sodium-50mg-20-lactab-a8',
		name: 'olfen 50mg 20 lactab',
		genericName: 'diclofenac sodium',
		concentration: '50mg',
		price: 24,
		matchKeywords: ['olfen 50 20', 'اولفين ٥٠', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٥٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 419
	{
		id: 'panadol-baby-infant-paracetamol-susp-100ml-a8',
		name: 'panadol baby infant 100ml',
		genericName: 'paracetamol',
		concentration: '120mg/5ml',
		price: 40,
		matchKeywords: ['panadol baby infant 100', 'بانادول اطفال ١٠٠', ...tag('#antipyretics')],
		usage: 'خافض حرارة ومسكن للأطفال.',
		timing: 'كل ٦ ساعات عند الألم – ٣–٥ أيام',
		category: Category.PARACETAMOL,
		form: 'Syrup',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 3,
		maxWeight: 50,
		calculationRule: (weight, _ageMonths) => paracetamol120mg5mlDoseText(weight),
		warnings: [...commonParacetamolWarnings],
	},

	// 420
	{
		id: 'paracetamol-adwic-paracetamol-500mg-20-tabs-a8',
		name: 'paracetamol-adwic 500 mg 20 tabs.',
		genericName: 'paracetamol',
		concentration: '500mg',
		price: 34,
		matchKeywords: ['paracetamol adwic 500 20', 'باراسيتامول ادويك ٥٠٠', ...tag('#antipyretics')],
		usage: 'مسكن وخافض حرارة.',
		timing: 'كل ٦ ساعات عند الألم – ٣–٥ أيام',
		category: Category.PARACETAMOL,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص إلى قرصين كل ٦ ساعات عند اللزوم (حد أقصى ٨ أقراص/٢٤ ساعة).',
		warnings: [...commonParacetamolWarnings],
	},

	// 421
	{
		id: 'rivo-asa-75mg-30-chewable-tabs-a8',
		name: 'rivo 75mg 30 chewable tab',
		genericName: 'acetylsalicylic acid',
		concentration: '75mg',
		price: 21,
		matchKeywords: ['rivo 75 chewable', 'ريڤو ٧٥', ...tag('#nsaid', '#salicylate')],
		usage: 'مضاد لتجمع الصفائح بجرعة منخفضة حسب التشخيص والحالة.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Chewable Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٧٥ مجم) مرة يومياً بعد الأكل.',
		warnings: ['قد يزيد خطر النزيف؛ راجع تداخلات المريض والتاريخ (قرحة/نزيف/مميعات).'],
	},

	// 422
	{
		id: 'rivo-micro-asa-320mg-30-tabs-a8',
		name: 'rivo micro 320mg 30 tab.',
		genericName: 'acetylsalicylic acid',
		concentration: '320mg',
		price: 13.5,
		matchKeywords: ['rivo micro 320', 'ريڤو مايكرو ٣٢٠', ...tag('#nsaid', '#salicylate')],
		usage: 'أسبرين بجرعة أعلى (مسكن/مضاد التهاب) حسب التشخيص والحالة.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٨–١٢ ساعة بعد الأكل عند اللزوم.',
		warnings: ['قد يسبب تهيجاً أو نزيفاً بالمعدة؛ يُتجنب مع قرحة أو نزيف أو حساسية للأسبرين.'],
	},

	// 423
	{
		id: 'one-two-three-extra-20-fc-tabs-a8',
		name: '1 2 3 extra 20 f.c. tab.',
		genericName: 'chlorpheniramine & paracetamol & pseudoephedrine',
		concentration: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
		price: 50,
		matchKeywords: ['1 2 3 extra 20', '١٢٣ اكسترا', ...tag('#common cold')],
		usage: 'لتخفيف أعراض البرد: ألم/حرارة + رشح/عطس + احتقان.',
		timing: 'كل ٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).',
		warnings: [
			...commonParacetamolWarnings,
			...commonDecongestantWarnings,
			'قد يسبب نعاساً؛ تجنب القيادة أو المهدئات.',
		],
	},

	// 424
	{
		id: 'acpophar-asa-81mg-30-ec-tabs-a8',
		name: 'acpophar 81 mg 30 e.c. tabs.',
		genericName: 'acetylsalicylic acid',
		concentration: '81mg',
		price: 28.5,
		matchKeywords: ['acpophar 81 ec', 'اكبوفر ٨١', ...tag('#nsaid', '#salicylate')],
		usage: 'مضاد لتجمع الصفائح بجرعة منخفضة حسب التشخيص والحالة.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'E.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٨١ مجم) مرة يومياً بعد الأكل.',
		warnings: ['قد يزيد خطر النزيف؛ يُتجنب قبل العمليات إلا حسب التشخيص.'],
	},

	// 425
	{
		id: 'actifast-diclofenac-potassium-50mg-6-sachets-a8',
		name: 'actifast 50mg 6 sachets',
		genericName: 'diclofenac potassium',
		concentration: '50mg',
		price: 21,
		matchKeywords: ['actifast 50 6', 'اكتيفاست ٥٠', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب سريع المفعول (أكياس).',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٧ أيام',
		category: Category.DICLOFENAC,
		form: 'Powder for Oral Suspension Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'كيس واحد (٥٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أكياس/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 426
	{
		id: 'ascozental-paracetamol-vitamin-c-granules-sachets-10-a8',
		name: 'ascozental 10 granules for oral susp. sachets',
		genericName: 'paracetamol & ascorbic acid (vitamin c)',
		concentration: 'Paracetamol + Vitamin C',
		price: 60,
		matchKeywords: ['ascozental 10', 'اسكوزنتال', ...tag('#common cold')],
		usage: 'لتخفيف أعراض البرد مع خافض حرارة.',
		timing: 'كل ٦–٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'Granules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'كيس واحد يُذاب في ماء كل ٦–٨ ساعات عند اللزوم (حد أقصى ٤ أكياس/٢٤ ساعة).',
		warnings: [...commonParacetamolWarnings],
	},

	// 427
	{
		id: 'dextrafast-dexketoprofen-25mg-20-fc-tabs-a8',
		name: 'dextrafast 25mg 20 f.c. tabs.',
		genericName: 'dexketoprofen',
		concentration: '25mg',
		price: 34,
		matchKeywords: ['dextrafast 25 20', 'ديكسترافاست ٢٥', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨ ساعات بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٢٥ مجم) كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٣ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 428
	{
		id: 'coxorizet-etoricoxib-60mg-20-tabs-a8',
		name: 'coxorizet 60 mg 20 tabs',
		genericName: 'etoricoxib',
		concentration: '60mg',
		price: 158,
		matchKeywords: ['coxorizet 60 20', 'كوكسوريزيت ٦٠', ...tag('#nsaid', '#cox-2 inhibitors')],
		usage: 'مسكن ومضاد التهاب انتقائي.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٦٠ مجم) مرة يومياً بعد الأكل.',
		warnings: [...commonNsaidWarnings, 'قد يزيد الضغط وخطر الجلطات عند بعض المرضى.'],
	},

	// 429
	{
		id: 'diclowad-diclofenac-potassium-50mg-12-sachets-a8',
		name: 'diclowad 50mg 12 sachets.',
		genericName: 'diclofenac potassium',
		concentration: '50mg',
		price: 21.6,
		matchKeywords: ['diclowad 50 12', 'ديكلوواد ٥٠', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب سريع المفعول (أكياس).',
		timing: 'كل ٨–١٢ ساعة بعد الأكل – ٣–٧ أيام',
		category: Category.DICLOFENAC,
		form: 'Powder for Oral Suspension Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'كيس واحد (٥٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أكياس/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 430
	{
		id: 'dolo-d-20-tabs',
		name: 'dolo-d 20 tab.',
		genericName: 'ibuprofen & pseudoephedrine hydrochloride',
		concentration: '200mg + 30mg',
		price: 38,
		matchKeywords: ['dolo d 20', 'دولو دي ٢٠', ...tag('#common cold')],
		usage: 'لتخفيف ألم/حرارة مع احتقان الأنف.',
		timing: 'كل ٦–٨ ساعات بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٦–٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٦ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings, ...commonDecongestantWarnings],
	},

	// 431
	{
		id: 'eduropan-lornoxicam-20mg-20-fc-tabs-a8',
		name: 'eduropan 20 mg 20 f.c. tabs.',
		genericName: 'lornoxicam',
		concentration: '20mg',
		price: 62,
		matchKeywords: ['eduropan 20', 'ادوروبان ٢٠', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد مرة يومياً بعد الأكل (ولا تتجاوز قرصاً واحداً/٢٤ ساعة؛ لا تزيد بدون إعادة تقييم).',
		warnings: [...commonNsaidWarnings],
	},

	// 432
	{
		id: 'epifenac-diclofenac-sodium-25mg-5-supp-a8',
		name: 'epifenac 25mg 5 supp.',
		genericName: 'diclofenac sodium',
		concentration: '25mg',
		price: 15,
		matchKeywords: ['epifenac 25 supp', 'ايبيفيناك لبوس', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'لبوس مسكن ومضاد التهاب.',
		timing: 'كل ٨–١٢ ساعة عند الألم – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'Suppositories',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 12,
		maxWeight: 250,
		calculationRule: (weight, ageMonths) => {
			if (ageMonths < 144 && weight < 30) {
				return 'لبوسة واحدة (٢٥ مجم) كل ١٢ ساعة عند اللزوم (حد أقصى ٢ لبوسة/٢٤ ساعة).';
			}
			return 'لبوسة واحدة (٢٥ مجم) كل ٨–١٢ ساعة عند اللزوم (حد أقصى ٣ لبوسات/٢٤ ساعة).';
		},
		warnings: [...commonNsaidWarnings],
	},

	// 433
	{
		id: 'ibucalmin-ibuprofen-100mg-5ml-syrup-120ml-a8',
		name: 'ibucalmin 100mg/5ml syrup 120 ml',
		genericName: 'ibuprofen',
		concentration: '100mg/5ml',
		price: 28,
		matchKeywords: ['ibucalmin 100 120', 'ايبيوكالمن', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن وخافض حرارة للأطفال.',
		timing: 'كل ٦–٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.IBUPROFEN,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 50,
		calculationRule: (weight, ageMonths) => {
			if (ageMonths < 6) {
				return 'أقل من ٦ أشهر: غير موصى به؛ من ٦ أشهر: جرعة محددة حسب الوزن.';
			}
			return ibuprofen100mg5mlDoseText(weight);
		},
		warnings: [...commonNsaidWarnings],
	},

	// 434
	{
		id: 'inflacam-piroxicam-10mg-20-caps-a8',
		name: 'inflacam 10 mg 20 caps',
		genericName: 'piroxicam',
		concentration: '10mg',
		price: 20,
		matchKeywords: ['inflacam 10 20', 'انفلاكام ١٠', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Capsules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'كبسولة واحدة (١٠ مجم) مرة يومياً بعد الأكل.',
		warnings: [...commonNsaidWarnings],
	},

	// 435
	{
		id: 'inflacam-piroxicam-20mg-5-supp-a8',
		name: 'inflacam 20 mg 5 supp.',
		genericName: 'piroxicam',
		concentration: '20mg',
		price: 5.5,
		matchKeywords: ['inflacam 20 supp 5', 'انفلاكام لبوس', ...tag('#nsaid', '#oxicam')],
		usage: 'لبوس مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Suppositories',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'لبوسة واحدة (٢٠ مجم) مرة يومياً بعد الأكل أو قبل النوم.',
		warnings: [...commonNsaidWarnings],
	},

	// 436
	{
		id: 'innovifen-dexibuprofen-400mg-20-fc-tabs-a8',
		name: 'innovifen 400 mg 20 f.c. tabs.',
		genericName: 'dexibuprofen',
		concentration: '400mg',
		price: 20,
		matchKeywords: ['innovifen 400 20', 'اينوفيڤين ٤٠٠', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.IBUPROFEN,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٤٠٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 437
	{
		id: 'ketofan-ketoprofen-100mg-5-supp-a8',
		name: 'ketofan 100mg 5 supp.',
		genericName: 'ketoprofen',
		concentration: '100mg',
		price: 5.3,
		matchKeywords: ['ketofan 100 supp 5', 'كيتوفان ١٠٠ لبوس', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'لبوس مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Suppositories',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'لبوسة واحدة (١٠٠ مجم) مرة يومياً (حد أقصى لبوسة واحدة/٢٤ ساعة إلا حسب التشخيص).',
		warnings: [...commonNsaidWarnings],
	},

	// 438
	{
		id: 'mefac-cold-flu-combo-20-fc-tabs-a8',
		name: 'mefac 20 f.c. tabs',
		genericName: 'chlorpheniramine & dextromethorphan & paracetamol & pseudoephedrine',
		concentration: 'Cold & Flu Combo',
		price: 23,
		matchKeywords: ['mefac 20', 'ميفاك', ...tag('#common cold')],
		usage: 'لتخفيف أعراض البرد مع كحة: ألم/حرارة + احتقان + سعال.',
		timing: 'كل ٨ ساعات عند الألم – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ أقراص/٢٤ ساعة).',
		warnings: [
			...commonParacetamolWarnings,
			...commonDecongestantWarnings,
			'قد يسبب نعاساً؛ تجنب القيادة أو المهدئات.',
			'مرضى الربو أو الكحة المزمنة: تجنب مهدئات السعال المركزية أو استخدم بأقل جرعة ولمدة قصيرة.',
		],
	},

	// 439
	{
		id: 'meloxicam-meloxicam-15mg-10-tab-a8',
		name: 'meloxicam 15mg 10 tab.',
		genericName: 'meloxicam',
		concentration: '15mg',
		price: 18,
		matchKeywords: ['meloxicam 15 10', 'ميلوكسيكام ١٥', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (١٥ مجم) مرة يومياً بعد الأكل (ولا تتجاوز ١٥ مجم/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 440
	{
		id: 'rontigrone-dexibuprofen-400mg-20-scored-fc-tabs-a8',
		name: 'rontigrone 400 mg 20 scored f.c. tabs.',
		genericName: 'dexibuprofen',
		concentration: '400mg',
		price: 74,
		matchKeywords: ['rontigrone 400 20', 'رونتيجرون ٤٠٠ ٢٠', ...tag('#nsaid', '#propionic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨–١٢ ساعة بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.IBUPROFEN,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٤٠٠ مجم) كل ٨–١٢ ساعة بعد الأكل عند اللزوم (حد أقصى ٣ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 441
	{
		id: 'vastaflam-diclofenac-potassium-25mg-20-sugar-coated-tabs-a8',
		name: 'vastaflam 25mg 20 sugar c.tabs. (n/a)',
		genericName: 'diclofenac potassium',
		concentration: '25mg',
		price: 6,
		matchKeywords: ['vastaflam 25 20', 'ڤاستافلام ٢٥', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨ ساعات بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'Sugar Coated Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٢٥ مجم) كل ٨ ساعات بعد الأكل عند اللزوم، ويمكن قرصين كل ٨ ساعات عند شدة الألم (حد أقصى ٦ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 442
	{
		id: 'voltinac-diclofenac-sodium-lidocaine-75-20mg-2ml-amp-3-a8',
		name: 'voltinac 75/20 mg/2ml 3 i.m. amp.',
		genericName: 'diclofenac sodium & lidocaine hydrochloride',
		concentration: '75mg diclofenac + 20mg lidocaine / 2ml',
		price: 22.5,
		matchKeywords: ['voltinac 75 20 2ml', 'ڤولتيناك ٧٥', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'حقن مسكنة ومضادة للالتهاب بالعضل (تُعطى بواسطة مختص).',
		timing: 'عند الألم – لفترة قصيرة',
		category: Category.DICLOFENAC,
		form: 'Ampoules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'أمبول واحد بالعضل مرة يومياً ولمدة قصيرة فقط (٣–٥ أيام كحد أقصى).',
		warnings: [...commonNsaidWarnings, 'يُتجنب في الحساسية تجاه مخدرات موضعية مشابهة.'],
	},

	// 443
	{
		id: 'voltinac-k-diclofenac-potassium-3-amp-a8',
		name: 'voltinac-k 3 amp.',
		genericName: 'diclofenac potassium',
		concentration: 'Injection',
		price: 12.75,
		matchKeywords: ['voltinac k amp', 'ڤولتيناك ك', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'حقن مسكنة ومضادة للالتهاب (تُعطى بواسطة مختص).',
		timing: 'عند الألم – لفترة قصيرة',
		category: Category.DICLOFENAC,
		form: 'Ampoules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'أمبول واحد بالعضل مرة يومياً ولمدة قصيرة فقط (٣–٥ أيام كحد أقصى).',
		warnings: [...commonNsaidWarnings],
	},

	// 444
	{
		id: 'westoflow-syrup-120ml',
		name: 'westoflow oral susp. 120 ml',
		genericName: 'paracetamol & pseudoephedrine & chlorpheniramine',
		concentration: '160mg + 15mg + 1mg / 5ml',
		price: 17,
		matchKeywords: ['westoflow 120', 'ويستوفلو ١٢٠', ...tag('#common cold')],
		usage: 'علاج أعراض البرد والإنفلونزا للأطفال؛ خافض حرارة ومضاد للرشح والعطس ومزيل للاحتقان.',
		timing: 'كل ٨ ساعات بعد الأكل – ٣–٥ أيام',
		category: Category.COLD_FLU,
		form: 'Suspension',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 50,
		calculationRule: (_weight, ageMonths) => {
			if (ageMonths < 72) {
				return 'أقل من ٦ سنوات: غير موصى به؛ استخدم بديلاً حسب العمر.';
			}
			if (ageMonths < 144) {
				return '٥ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
			}
			return '١٠ مل كل ٨ ساعات بعد الأكل عند اللزوم (حد أقصى ٤ جرعات/٢٤ ساعة).';
		},
		warnings: [
			...commonParacetamolWarnings,
			...commonDecongestantWarnings,
			'قد يسبب نعاساً؛ تجنب المهدئات وراقب الطفل لتفادي السقوط.',
		],
	},

	// 445
	{
		id: 'xefo-lornoxicam-8mg-10-fc-tab-a8',
		name: 'xefo 8mg 10 f.c. tab.',
		genericName: 'lornoxicam',
		concentration: '8mg',
		price: 28,
		matchKeywords: ['xefo 8 10', 'زيفو ٨', ...tag('#nsaid', '#oxicam')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'مرة–مرتين يومياً بعد الأكل – ٣–٥ أيام',
		category: Category.ANALGESICS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٨ مجم) مرة إلى مرتين يومياً بعد الأكل (حد أقصى قرصين/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},

	// 446
	{
		id: 'adwiflam-diclofenac-potassium-25mg-20-fc-tabs-a8',
		name: 'adwiflam 25 mg 20 f.c.tab',
		genericName: 'diclofenac potassium',
		concentration: '25mg',
		price: 24,
		matchKeywords: ['adwiflam 25 20 tab', 'ادويفلام ٢٥ اقراص', ...tag('#nsaid', '#acetic acid derivatives')],
		usage: 'مسكن ومضاد التهاب.',
		timing: 'كل ٨ ساعات بعد الأكل عند الألم – ٣–٥ أيام',
		category: Category.DICLOFENAC,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'قرص واحد (٢٥ مجم) كل ٨ ساعات بعد الأكل عند اللزوم، ويمكن قرصين كل ٨ ساعات عند شدة الألم (حد أقصى ٦ أقراص/٢٤ ساعة).',
		warnings: [...commonNsaidWarnings],
	},
];

