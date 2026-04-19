import { Medication, Category } from '../../types';

const fixed = (text: string) => (_w: number, _a: number) => text;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundTo = (value: number, step: number) => Math.round(value / step) * step;

const GENERAL_SUPPLEMENT_WARNINGS = [
	'لا تتجاوز الجرعة اليومية الموصى بها.',
	'يُفضّل تناوله بعد الأكل لتقليل اضطراب المعدة.',
	'إن وُجد مرض مزمن/حساسية شديدة أو أدوية ثابتة: اطلب استشارة طبية قبل الاستخدام.',
];

const FAT_SOLUBLE_VIT_WARNINGS = [
	...GENERAL_SUPPLEMENT_WARNINGS,
	'تجنب الجمع مع مكملات أخرى تحتوي على فيتامين D أو A أو E أو K بجرعات عالية.',
];

const IRON_SUPPLEMENT_WARNINGS = [
	...GENERAL_SUPPLEMENT_WARNINGS,
	'قد يسبب إمساك/غثيان ويغير لون البراز للأسود (طبيعي).',
	'افصل عن الشاي/القهوة/الألبان ومضادات الحموضة ساعتين لتحسين الامتصاص.',
	'احفظه بعيداً عن متناول الأطفال (جرعة زائدة من الحديد خطيرة).',
];

const ZINC_WARNINGS = [
	...GENERAL_SUPPLEMENT_WARNINGS,
	'افصل ساعتين عن المضادات الحيوية (تتراسيكلين/كينولون) لتجنب تقليل الامتصاص.',
];

const CALCIUM_WARNINGS = [
	...GENERAL_SUPPLEMENT_WARNINGS,
	'افصل ساعتين عن مكملات الحديد لتحسين الامتصاص.',
	'يُستخدم بحذر مع حصوات الكلى أو ارتفاع الكالسيوم.',
];

const INJECTION_WARNINGS = [
	'للاستخدام في منشأة صحية.',
	'قد يسبب تفاعل تحسسي؛ اطلب مساعدة طبية عند ضيق نفس/تورم/طفح شديد.',
];

const D3_DAILY_GENERAL_RULE = (_w: number, ageMonths: number) => {
	if (ageMonths < 12) return '٤٠٠ وحدة دولية يومياً';
	if (ageMonths < 216) return '٦٠٠ وحدة دولية يومياً';
	return '١٠٠٠ وحدة دولية يومياً';
};

const D3_100IU_PER_DROP_RULE = (_w: number, ageMonths: number) => {
	if (ageMonths < 12) return '٤ نقط يومياً (٤٠٠ وحدة)';
	if (ageMonths < 216) return '٦ نقط يومياً (٦٠٠ وحدة)';
	return '١٠ نقط يومياً (١٠٠٠ وحدة)';
};

// Iron syrup: 50mg/5ml = 10mg/ml elemental iron
const IRON_SYRUP_MG_PER_ML = 10;
const IRON_TREATMENT_MG_PER_KG_PER_DAY = 3;
const IRON_SYRUP_TREATMENT_RULE = (weightKg: number, _ageMonths: number) => {
	const safeWeight = clamp(weightKg, 6, 60);
	const dailyMg = clamp(safeWeight * IRON_TREATMENT_MG_PER_KG_PER_DAY, 18, 60);
	const dailyMlRaw = dailyMg / IRON_SYRUP_MG_PER_ML;
	const dailyMl = clamp(roundTo(dailyMlRaw, 0.5), 2.0, 6.0);
	const mgText = Math.round(dailyMl * IRON_SYRUP_MG_PER_ML);
	return `إجمالي ${mgText} مجم حديد/اليوم = ${dailyMl.toFixed(1)} مل/اليوم (يمكن تقسيمها على مرتين)`;
};

// Alfacalcidol 2mcg/ml: convert mcg dose → ml dose (ml = mcg/2)
const ALFACALCIDOL_2MCG_PER_ML_RULE = (weightKg: number, ageMonths: number) => {
	const safeWeight = clamp(weightKg, 2, 200);
	// Pediatric: 0.05 mcg/kg/day (capped) | Adults: 0.5 mcg/day
	const doseMcg = ageMonths < 144 ? clamp(safeWeight * 0.05, 0.10, 1.00) : 0.50;
	const volumeMl = doseMcg / 2;
	return `${doseMcg.toFixed(2)} مكجم يومياً = ${volumeMl.toFixed(2)} مل من محلول ٢ مكجم/مل`;
};

const D3_400IU_PER_DROP_RULE = (_w: number, ageMonths: number) => {
	if (ageMonths < 12) return '١ نقطة يومياً (٤٠٠ وحدة)';
	if (ageMonths < 216) return '١–٢ نقطة يومياً (٤٠٠–٨٠٠ وحدة)';
	return '٢ نقطة يومياً (٨٠٠ وحدة)';
};

const D3_5000IU_TABLET_RULE = (_w: number, _ageMonths: number) => 'قرص واحد مرتين أسبوعياً (مثلاً سبت/ثلاثاء)';
const D3_10000IU_TABLET_RULE = (_w: number, _ageMonths: number) => 'قرص واحد أسبوعياً';

export const DIETARY_SUPPLEMENTS_6: Medication[] = [
	// ==========================================
	// Dietary supplements - Part 6
	// Items: 257 → 296
	// ==========================================

	// 257
	{
		id: 'devit-3-300000iu-ml-1-amp-ds6',
		name: 'devit-3 300.000 iu/ml 1 amp',
		genericName: 'cholecalciferol',
		concentration: '300,000 IU/ml (1 amp)',
		price: 140,
		matchKeywords: ['devit-3', 'devit 3', 'ديفيت 3', 'ديفيت', 'حقنة فيتامين د', 'vitamin d injection', 'd3 injection', '300000', '#vitamin_d'],
		usage: 'فيتامين D3 أمبول جرعة تحميل عالية لتصحيح النقص لدى البالغين.',
		timing: 'جرعة واحدة.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Ampoule',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('أمبول واحد (٣٠٠٬٠٠٠ وحدة) جرعة واحدة. لا تُكرر قبل ٣ أشهر.'),
		warnings: [...INJECTION_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 258
	{
		id: 'feromoro-20-sachets-ds6',
		name: 'feromoro 20 sachets',
		genericName: 'ferrous fumarate & folic acid & lactoferrin & zinc & vitamin e',
		concentration: '20 sachets',
		price: 95,
		matchKeywords: ['feromoro', 'فيرومورو', 'fero moro', 'iron sachets', 'folic acid', 'lactoferrin', 'زنك', 'فوليك', '#iron', '#zinc'],
		usage: 'حديد + فوليك + لاكتوفرّين + زنك (مع فيتامين E) لدعم علاج الأنيميا.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('كيس واحد يومياً بعد الأكل.'),
		warnings: [...IRON_SUPPLEMENT_WARNINGS, ...ZINC_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 259
	{
		id: 'haemopower-50mg-5ml-oral-syrup-100ml-ds6',
		name: 'haemopower 50mg/5ml oral syrup 100 ml',
		genericName: 'elemental iron',
		concentration: '50mg/5ml (100ml)',
		price: 16.25,
		matchKeywords: ['haemopower', 'haemo power', 'هيموباور', 'شراب حديد', '50mg/5ml', 'iron syrup', 'anemia', 'انيميا', '#iron'],
		usage: 'شراب حديد (عنصرى) لعلاج أنيميا نقص الحديد للأطفال.',
		timing: 'مرة يومياً (أو مرتين عند تقسيم الجرعة).',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 144,
		minWeight: 6,
		maxWeight: 60,
		calculationRule: IRON_SYRUP_TREATMENT_RULE,
		warnings: IRON_SUPPLEMENT_WARNINGS,
	},

	// 260
	{
		id: 'd-pero-vitamin-d3-15ml-drops-ds6',
		name: 'd pero vitamin d3 15ml drops',
		genericName: 'vitamin d3',
		concentration: 'oral drops (15ml)',
		price: 50,
		matchKeywords: ['d pero', 'دي بيرو', 'ديبيرو', 'vitamin d3 drops', 'd3 drops', 'نقط فيتامين د', '#vitamin_d'],
		usage: 'نقط فيتامين D3 للوقاية أو علاج النقص.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: D3_DAILY_GENERAL_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 261
	{
		id: 'torminovant-10ml-oral-drops-ds6',
		name: 'torminovant 10 ml oral drops',
		genericName: 'lc reuteri & vitamin d',
		concentration: 'oral drops (10ml)',
		price: 95,
		matchKeywords: ['torminovant', 'تورمينوفانت', 'reuteri', 'l reuteri', 'probiotic drops', 'بروبيوتك نقط', 'vitamin d', '#probiotic', '#vitamin_d'],
		usage: 'بروبيوتك (L. reuteri) مع فيتامين D لدعم الجهاز الهضمي.',
		timing: 'مرة يومياً.',
		category: Category.PROBIOTICS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: fixed('٥ نقط يومياً.'),
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 262
	{
		id: 'one-alpha-2mcg-ml-10-amps-ds6',
		name: 'one alpha 2mcg/ml 10 amps.',
		genericName: 'alfacalcidol',
		concentration: '2 mcg/ml (10 amps)',
		price: 236,
		matchKeywords: ['one alpha', 'one alpha amps', 'one alpha 2mcg/ml', 'وان الفا', 'وان الفا امبول', 'alfacalcidol', 'active vitamin d', 'vitamin d active', '#vitamin_d'],
		usage: 'ألفاكالسيدول (فيتامين D نشط) محلول أمبولات للاستخدام العلاجي مع متابعة الكالسيوم.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Ampoules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 200,
		calculationRule: ALFACALCIDOL_2MCG_PER_ML_RULE,
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 263
	{
		id: 'one-alpha-2mcg-ml-oral-drops-10ml-ds6',
		name: 'one alpha 2mcg/ml oral drops 10ml',
		genericName: 'alfacalcidol',
		concentration: '2 mcg/ml (10ml)',
		price: 221,
		matchKeywords: ['one alpha', 'one alpha drops', 'one alpha 2mcg/ml', 'alfacalcidol drops', 'وان الفا', 'وان الفا نقط', 'فيتامين د نشط نقط', '#vitamin_d'],
		usage: 'ألفاكالسيدول (فيتامين D نشط) نقط للفم لعلاج حالات نقص الكالسيوم/اضطرابات العظام الخاصة.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Drops',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 200,
		calculationRule: ALFACALCIDOL_2MCG_PER_ML_RULE,
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 264
	{
		id: 'one-alpha-2mcg-ml-oral-drops-20ml-ds6',
		name: 'one alpha 2mcg/ml oral drops 20ml',
		genericName: 'alfacalcidol',
		concentration: '2 mcg/ml (20ml)',
		price: 382,
		matchKeywords: ['one alpha', 'one alpha drops 20', 'one alpha 2mcg/ml', 'alfacalcidol drops', 'وان الفا 20', 'وان الفا نقط 20', '#vitamin_d'],
		usage: 'ألفاكالسيدول (فيتامين D نشط) نقط للفم لعلاج حالات نقص الكالسيوم/اضطرابات العظام الخاصة.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Drops',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 200,
		calculationRule: ALFACALCIDOL_2MCG_PER_ML_RULE,
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 265
	{
		id: 'ostocal-syrup-100ml-ds6',
		name: 'ostocal syrup 100 ml',
		genericName: 'calcium carbonate & magnesium carbonate & vitamin d3',
		concentration: '100ml',
		price: 50,
		matchKeywords: ['ostocal syrup', 'ostocal', 'اوستوكال', 'calcium carbonate', 'magnesium carbonate', 'vitamin d3', '#calcium'],
		usage: 'شراب كالسيوم + ماغنسيوم + فيتامين D3 لدعم العظام.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Syrup',
		minAgeMonths: 12,
		maxAgeMonths: 216,
		minWeight: 8,
		maxWeight: 80,
		calculationRule: fixed('حسب إرشادات العبوة/الطبيب.'),
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 266
	{
		id: 'potassium-chloride-15pct-10ml-conc-inf-100-amp-ds6',
		name: 'potassium chloride 15% 10ml conc.inf. 100 amp.',
		genericName: 'potassium chloride anhydrous',
		concentration: '15% (10ml) x100 amp',
		price: 250,
		matchKeywords: ['potassium chloride', 'potassium chloride 15%', 'kcl 15%', 'kcl', 'بوتاسيوم', 'بوتاسيوم كلوريد', 'حقن بوتاسيوم', 'iv infusion', '#potassium'],
		usage: 'كلوريد البوتاسيوم مركز للتسريب الوريدي داخل المستشفى لعلاج نقص البوتاسيوم.',
		timing: 'بالتسريب الوريدي فقط.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Ampoule (IV)',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('غير مخصص لوصفة منزلية: يُستخدم داخل المستشفى مع مراقبة قلب/تحاليل.'),
		warnings: [...INJECTION_WARNINGS, ...GENERAL_SUPPLEMENT_WARNINGS],
	},

	// 267
	{
		id: 'potassium-chloride-15pct-50-amp-ep2005-ds6',
		name: 'potassium chloride 15% 50 amp. e.p.2005',
		genericName: 'potassium chloride anhydrous',
		concentration: '15% (50 amp)',
		price: 250,
		matchKeywords: ['potassium chloride', 'potassium chloride 15% 50', 'kcl 15% 50', 'ep2005', 'بوتاسيوم كلوريد 15', '#potassium'],
		usage: 'كلوريد البوتاسيوم مركز للتسريب الوريدي داخل المستشفى لعلاج نقص البوتاسيوم.',
		timing: 'بالتسريب الوريدي فقط.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Ampoule (IV)',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('غير مخصص لوصفة منزلية: يُستخدم داخل المستشفى مع مراقبة دقيقة.'),
		warnings: [...INJECTION_WARNINGS, ...GENERAL_SUPPLEMENT_WARNINGS],
	},

	// 268
	{
		id: 'potassium-chloride-conc-15pct-amp-iv-inf-ds6',
		name: 'potassium chloride conc. 15% amp. for i.v inf.',
		genericName: 'potassium chloride anhydrous',
		concentration: '15% amp',
		price: 3.5,
		matchKeywords: ['potassium chloride', 'potassium chloride conc 15%', 'kcl conc', 'amp for iv inf', 'بوتاسيوم مركز', '#potassium'],
		usage: 'كلوريد البوتاسيوم مركز للتسريب الوريدي داخل المستشفى.',
		timing: 'بالتسريب الوريدي فقط.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Ampoule (IV)',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('غير مخصص لوصفة منزلية: يُستخدم داخل المستشفى فقط.'),
		warnings: [...INJECTION_WARNINGS, ...GENERAL_SUPPLEMENT_WARNINGS],
	},

	// 269
	{
		id: 'profero-24-chew-tabs-ds6',
		name: 'profero 24 chew. tabs',
		genericName: 'iron & zinc & folic acid & biotin & selenium & vitamins c & vitamins',
		concentration: '24 chewable tabs',
		price: 98,
		matchKeywords: ['profero', 'بروفيرو', 'chew', 'iron', 'zinc', 'folic acid', 'biotin', 'selenium', '#iron'],
		usage: 'مكمل أنيميا (حديد + زنك + فوليك + بيوتين + سيلينيوم + فيتامينات).',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Chewable Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('قرص مضغ واحد يومياً بعد الأكل.'),
		warnings: [...IRON_SUPPLEMENT_WARNINGS, ...ZINC_WARNINGS],
	},

	// 270
	{
		id: 'protimax-protein-3g-10-sachets-ds6',
		name: 'protimax (protein) 3g*10 sachets',
		genericName: 'whey protein',
		concentration: '3g (10 sachets)',
		price: 100,
		matchKeywords: ['protimax protein 3g', 'protimax', 'protein', 'whey', 'dietary supplement'],
		usage: 'مكمل بروتين (واي بروتين) لدعم الاحتياج الغذائي.',
		timing: 'مرة يومياً أو حسب الاحتياج.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Sachets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('كيس واحد يومياً (يمكن زيادته حسب الاحتياج الغذائي/الرياضة).'),
		warnings: GENERAL_SUPPLEMENT_WARNINGS,
	},

	// 271
	{
		id: 'movacartin-30-capsules-ds6',
		name: 'movacartin 30 capsules',
		genericName: 'hyaluronic acid & chondroitin & hydrolyzed type2 collagen',
		concentration: '30 caps',
		price: 375,
		matchKeywords: ['movacartin', 'موفاكارتين', 'hyaluronic', 'chondroitin', 'collagen type 2', 'joint', '#joint'],
		usage: 'مكمل لدعم المفاصل والغضاريف (هيالورونيك + كوندرويتين + كولاجين نوع 2).',
		timing: 'مرة يومياً.',
		category: Category.MUSCULOSKELETAL,
		form: 'Capsules',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل أو حسب العبوة.'),
		warnings: GENERAL_SUPPLEMENT_WARNINGS,
	},

	// 272
	{
		id: 'taminorig-2mcg-ml-oral-drops-10ml-ds6',
		name: 'taminorig 2mcg/ml oral drops. 10 ml',
		genericName: 'alfacalcidol',
		concentration: '2 mcg/ml (10ml)',
		price: 91,
		matchKeywords: ['taminorig', 'تامينوريج', 'alfacalcidol', 'active vitamin d', 'فيتامين د نشط', 'drops', '#vitamin_d'],
		usage: 'ألفاكالسيدول (فيتامين D نشط) نقط للفم لعلاج حالات نقص الكالسيوم/اضطرابات العظام الخاصة.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Drops',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 200,
		calculationRule: ALFACALCIDOL_2MCG_PER_ML_RULE,
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 273
	{
		id: 'axired-20-tab-ds6',
		name: 'axired 20 tab.',
		genericName: 'iron & lactoferrin & folic acid & copper & potassium iodide & vit...',
		concentration: '20 tabs',
		price: 79,
		matchKeywords: ['axired', 'اكسيرد', 'iron', 'lactoferrin', 'folic acid', 'copper', 'iodide', '#iron'],
		usage: 'مكمل أنيميا (حديد + لاكتوفرّين + فوليك + عناصر/فيتامينات).',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
		warnings: IRON_SUPPLEMENT_WARNINGS,
	},

	// 274
	{
		id: 'bromed-d-100iu-drop-oral-drops-15ml-ds6',
		name: 'bromed-d 100 i.u./drop oral drops 15 ml',
		genericName: 'cholecalciferol',
		concentration: '100 IU/drop (15ml)',
		price: 35,
		matchKeywords: ['bromed-d', 'bromed d', 'بروميد د', '100 iu/drop', 'vitamin d3 drops', '#vitamin_d'],
		usage: 'نقط فيتامين D3 بتركيز ١٠٠ وحدة/نقطة.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: D3_100IU_PER_DROP_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 275
	{
		id: 'brovitacan-fero-30-caps-ds6',
		name: 'brovitacan fero 30 caps.',
		genericName: 'iron & vitamin c & vitamin b6 & vitamin b12 & folic acid',
		concentration: '30 caps',
		price: 120,
		matchKeywords: ['brovitacan fero', 'brovitacan', 'بروفيتاكان فيرو', 'iron', 'folic acid', 'b6', 'b12', 'vitamin c', '#iron'],
		usage: 'حديد + فوليك + فيتامينات B + فيتامين C لدعم علاج أنيميا نقص الحديد.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Capsules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
		warnings: IRON_SUPPLEMENT_WARNINGS,
	},

	// 276
	{
		id: 'cal-mag-forte-syrup-120ml-ds6',
		name: 'cal-mag forte syrup 120 ml',
		genericName: 'calcium & magnesium',
		concentration: '120ml syrup',
		price: 99,
		matchKeywords: ['cal-mag forte', 'cal mag forte', 'calcium', 'magnesium', 'syrup', '#calcium'],
		usage: 'شراب كالسيوم + ماغنسيوم لدعم العظام والعضلات.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Syrup',
		minAgeMonths: 12,
		maxAgeMonths: 216,
		minWeight: 8,
		maxWeight: 80,
		calculationRule: fixed('حسب إرشادات العبوة/الطبيب.'),
		warnings: CALCIUM_WARNINGS,
	},

	// 277
	{
		id: 'futi-d-400iu-drop-oral-drops-15ml-ds6',
		name: 'futi-d 400 i.u./drop oral drops 15 ml',
		genericName: 'cholecalciferol',
		concentration: '400 IU/drop (15ml)',
		price: 45,
		matchKeywords: ['futi-d', 'futi d', 'فيوتي د', '400 iu/drop', 'vitamin d3 drops', '#vitamin_d'],
		usage: 'نقط فيتامين D3 بتركيز ٤٠٠ وحدة/نقطة.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: D3_400IU_PER_DROP_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 278
	{
		id: 'immuno-mash-d-d3-1000iu-30-fc-tabs-ds6',
		name: 'immuno-mash d (d3) 1000 i.u. 30 f.c. tabs.',
		genericName: 'cholecalciferol',
		concentration: '1000 IU (30 F.C. tabs)',
		price: 60,
		matchKeywords: ['immuno-mash d 1000', 'immuno mash d', '1000 iu', 'f.c.', '#vitamin_d'],
		usage: 'فيتامين D3 بجرعة ١٠٠٠ وحدة لدعم/علاج النقص.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل أو حسب التشخيص والتحاليل.'),
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 279
	{
		id: 'immuno-mash-d-d3-10000iu-30-fc-tabs-ds6',
		name: 'immuno-mash d (d3) 10.000 i.u. 30 f.c.tabs.',
		genericName: 'cholecalciferol',
		concentration: '10000 IU (30 F.C. tabs)',
		price: 120,
		matchKeywords: ['immuno-mash d 10000', 'immuno mash 10000', 'vitamin d 10000', '#vitamin_d'],
		usage: 'فيتامين D3 عالي الجرعة لتصحيح النقص حسب التشخيص والتحاليل.',
		timing: 'حسب التشخيص والتحاليل.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: D3_10000IU_TABLET_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 280
	{
		id: 'immuno-mash-d-d3-5000iu-30-fc-tabs-ds6',
		name: 'immuno-mash d (d3) 5000 i.u. 30 f.c.tabs.',
		genericName: 'cholecalciferol',
		concentration: '5000 IU (30 F.C. tabs)',
		price: 80,
		matchKeywords: ['immuno-mash d 5000', 'immuno mash 5000', 'vitamin d 5000', '#vitamin_d'],
		usage: 'فيتامين D3 جرعة عالية نسبياً لعلاج النقص حسب التشخيص والتحاليل.',
		timing: 'حسب التشخيص والتحاليل.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: D3_5000IU_TABLET_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 281
	{
		id: 'incalcium-30-tabs-ds6',
		name: 'incalcium 30 tabs.',
		genericName: 'calcium carbonate & magnesium carbonate & vitamin d3',
		concentration: '30 tabs',
		price: 129,
		matchKeywords: ['incalcium', 'انكالسيوم', 'calcium carbonate', 'magnesium carbonate', 'vitamin d3', '#calcium'],
		usage: 'كالسيوم + ماغنسيوم + D3 لدعم العظام.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 282
	{
		id: 'incan-d-30-tabs-ds6',
		name: 'incan-d 30 tabs.',
		genericName: 'cholecalciferol',
		concentration: '30 tabs',
		price: 120,
		matchKeywords: ['incan-d', 'incan d', 'انكان د', 'vitamin d3', '#vitamin_d'],
		usage: 'فيتامين D3 لدعم/علاج نقص فيتامين د.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً حسب الجرعة المدونة على العبوة.'),
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 283
	{
		id: 'irno-10-sachets-ds6',
		name: 'irno 10 sachets',
		genericName: 'lactoferrin & folic acid & vitamin c & vitamin b complex',
		concentration: '10 sachets',
		price: 95,
		matchKeywords: ['irno', 'ايرنو', 'lactoferrin', 'folic acid', 'vitamin c', 'b complex', '#iron'],
		usage: 'لاكتوفرّين + فوليك + فيتامين C وB-complex لدعم خطة علاج نقص الحديد.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Sachets',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 250,
		calculationRule: fixed('كيس واحد يومياً بعد الأكل.'),
		warnings: GENERAL_SUPPLEMENT_WARNINGS,
	},

	// 284
	{
		id: 'lactoferroz-plus-20-caps-ds6',
		name: 'lactoferroz plus 20 caps.',
		genericName: 'bovin lactoferrin & zinc & selenium & vitamin b6',
		concentration: '20 caps',
		price: 240,
		matchKeywords: ['lactoferroz plus', 'lactoferroz', 'لاكتوفيروز', 'lactoferrin', 'zinc', 'selenium', 'b6', 'immunity', '#iron'],
		usage: 'لاكتوفرّين + زنك + سيلينيوم + B6 لدعم المناعة ودعم خطة علاج نقص الحديد.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Capsules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
		warnings: [...GENERAL_SUPPLEMENT_WARNINGS, ...ZINC_WARNINGS],
	},

	// 285
	{
		id: 'three-drops-600iu-0-5ml-30ml-ds6',
		name: 'three drops 600 i.u./0.5ml 30 ml',
		genericName: 'cholecalciferol',
		concentration: '600 IU/0.5ml (30ml)',
		price: 54,
		matchKeywords: ['three drops 600', 'ثري دروبس 600', 'vitamin d3 600', '#vitamin_d'],
		usage: 'محلول فيتامين D3 (تركيز ٦٠٠ وحدة/٠.٥ مل) مناسب للقياس بالمل.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: (_w, ageMonths) => {
			if (ageMonths < 12) return '٠.٣٣ مل يومياً (≈ ٤٠٠ وحدة)';
			if (ageMonths < 216) return '٠.٥٠ مل يومياً (٦٠٠ وحدة)';
			return '٠.٨٣ مل يومياً (≈ ١٠٠٠ وحدة)';
		},
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 286
	{
		id: 'ferrorave-plus-syrup-100ml-ds6',
		name: 'ferrorave-plus syrup 100 ml',
		genericName: 'liposomal iron & lactoferrin & zinc & vitamin b complex',
		concentration: '100ml',
		price: 65,
		matchKeywords: ['ferrorave-plus', 'ferrorave plus', 'فيروريف', 'liposomal iron', 'lactoferrin', 'zinc', 'b complex', '#iron'],
		usage: 'شراب حديد ليبوسومال + لاكتوفرّين + زنك + فيتامينات ب لدعم علاج الأنيميا.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Syrup',
		minAgeMonths: 12,
		maxAgeMonths: 144,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: fixed('حسب إرشادات العبوة/الطبيب.'),
		warnings: [...IRON_SUPPLEMENT_WARNINGS, ...ZINC_WARNINGS],
	},

	// 287
	{
		id: 'iron-liposomal-syrup-100ml-ds6',
		name: 'iron liposomal syrup 100 ml',
		genericName: 'liposomal iron & pyridoxine hydrochloride & methylcobalamin',
		concentration: '100ml',
		price: 150,
		matchKeywords: ['iron liposomal syrup', 'liposomal iron syrup', 'methylcobalamin', 'b6', '#iron'],
		usage: 'شراب حديد ليبوسومال مع فيتامينات ب لدعم علاج أنيميا نقص الحديد.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Syrup',
		minAgeMonths: 12,
		maxAgeMonths: 144,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: fixed('حسب إرشادات العبوة/الطبيب.'),
		warnings: IRON_SUPPLEMENT_WARNINGS,
	},

	// 288
	{
		id: 'incan-d-advance-30-tabs-ds6',
		name: 'incan-d advance 30 tabs.',
		genericName: 'cholecalciferol & boron',
		concentration: '30 tabs',
		price: 156,
		matchKeywords: ['incan-d advance', 'incan d advance', 'boron', 'vitamin d3', '#vitamin_d'],
		usage: 'فيتامين D3 مع بورون لدعم العظام.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل أو حسب التشخيص والتحاليل.'),
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 289
	{
		id: 'calcicolage-20-tablets-ds6',
		name: 'calcicolage 20 tablets',
		genericName: 'calcium carbonate & vitamin d3',
		concentration: '20 tablets',
		price: 85,
		matchKeywords: ['calcicolage', 'كالسيكولاج', 'calcium carbonate', 'vitamin d3', '#calcium'],
		usage: 'كالسيوم كربونات + D3 لدعم العظام.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
		warnings: [...CALCIUM_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 290
	{
		id: 'ferlage-20-caps-ds6',
		name: 'ferlage 20 caps.',
		genericName: 'iron & vitamin c & vitamin b1 & vitamin b2 & vitamin b6 & vit...',
		concentration: '20 caps',
		price: 110,
		matchKeywords: ['ferlage', 'فيرلاج', 'iron', 'vitamin c', 'b complex', '#iron'],
		usage: 'حديد + فيتامينات لدعم علاج أنيميا نقص الحديد.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Capsules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
		warnings: IRON_SUPPLEMENT_WARNINGS,
	},

	// 291
	{
		id: 'foton-20-tabs-ds6',
		name: 'foton 20 tabs.',
		genericName: 'lactoferrin & iron & folic acid & vitamin c & zinc & vitamin b1 ...',
		concentration: '20 tabs',
		price: 100,
		matchKeywords: ['foton', 'فوتون', 'lactoferrin', 'iron', 'folic acid', 'vitamin c', 'zinc', '#iron'],
		usage: 'مكمل أنيميا (لاكتوفرّين + حديد + فوليك + فيتامين C + زنك + فيتامينات).',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
		warnings: [...IRON_SUPPLEMENT_WARNINGS, ...ZINC_WARNINGS],
	},

	// 292
	{
		id: 'hacaci-plus-30-tabs-ds6',
		name: 'hacaci plus 30 tabs.',
		genericName: 'calcium & magnesium & zinc & vitamin d3',
		concentration: '30 tabs',
		price: 78,
		matchKeywords: ['hacaci plus', 'هاكاسي بلس', 'calcium', 'magnesium', 'zinc', 'vitamin d3', '#calcium'],
		usage: 'كالسيوم + ماغنسيوم + زنك + D3 لدعم العظام.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
		warnings: [...CALCIUM_WARNINGS, ...ZINC_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 293
	{
		id: 'kayan-d-400iu-drop-10ml-ds6',
		name: 'kayan d 400 iu per drop 10 ml',
		genericName: 'vitamin d3',
		concentration: '400 IU/drop (10ml)',
		price: 33,
		matchKeywords: ['kayan d', 'كيان د', '400 iu per drop', 'vitamin d3 drops', '#vitamin_d'],
		usage: 'نقط فيتامين D3 بتركيز ٤٠٠ وحدة/نقطة.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: D3_400IU_PER_DROP_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 294
	{
		id: 'sendoben-30tab-ds6',
		name: 'sendoben 30tab',
		genericName: 'calcium & vitamin d3 & manganese & zinc & copper & sel...',
		concentration: '30 tabs',
		price: 120,
		matchKeywords: ['sendoben', 'سيندوبين', 'calcium', 'vitamin d3', 'manganese', 'zinc', 'copper', 'selenium', '#calcium'],
		usage: 'كالسيوم + D3 + معادن لدعم العظام.',
		timing: 'مرة يومياً.',
		category: Category.CALCIUM_GROWTH,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
		warnings: [...CALCIUM_WARNINGS, ...ZINC_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
	},

	// 295
	{
		id: 'soly-well-oral-drops-30ml-ds6',
		name: 'soly well oral drops 30ml',
		genericName: 'vitamin d3',
		concentration: 'oral drops (30ml)',
		price: 49,
		matchKeywords: ['soly well', 'سولي ويل', 'vitamin d3 drops', '#vitamin_d'],
		usage: 'نقط فيتامين D3 للوقاية أو علاج النقص.',
		timing: 'مرة يومياً.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Oral Drops',
		minAgeMonths: 0,
		maxAgeMonths: 216,
		minWeight: 2.5,
		maxWeight: 80,
		calculationRule: D3_DAILY_GENERAL_RULE,
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},

	// 296
	{
		id: 'valudal-5000iu-60-gummies-ds6',
		name: 'valudal 5000 i.u. 60 gummies',
		genericName: 'cholecalciferol',
		concentration: '5000 IU (60 gummies)',
		price: 175,
		matchKeywords: ['valudal 5000 gummies', 'valudal', '5000 iu gummies', 'vitamin d3 5000', '#vitamin_d'],
		usage: 'فيتامين D3 (جُمّي) جرعة عالية نسبياً لعلاج النقص حسب التشخيص والتحاليل.',
		timing: 'حسب التشخيص والتحاليل.',
		category: Category.DIETARY_SUPPLEMENTS,
		form: 'Chewable Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 18,
		maxWeight: 250,
		calculationRule: fixed('٥٠٠٠ وحدة: حبة واحدة مرتين أسبوعياً.'),
		warnings: FAT_SOLUBLE_VIT_WARNINGS,
	},
];

