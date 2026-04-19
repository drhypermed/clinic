import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const COMMON_CEPHALOSPORIN_WARNINGS = [
	'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
	'تاريخ حساسية بنسلين: نسبة التفاعل المتبادل مع السيفالوسبورينات ≈١–٢٪؛ اسأل المريض وتجنّب عند حساسية شديدة سابقة (anaphylaxis).',
	'إسهال شديد/دموي أو ألم بطن مستمر: أوقف المضاد واشتبه بالتهاب قولون C. difficile؛ أجرِ فحص Toxin/زرع وعالج حسب التشخيص والتحاليل (مترونيدازول ٥٠٠ مجم × ٣ فموي أو فانكومايسين فموي في الحالات الشديدة).',
	'مرضى الكلى/كبار السن: قد تحتاج الجرعة لتعديل حسب وظائف الكلى.',
	'لا يفيد في نزلات البرد والإنفلونزا (عدوى فيروسية).',
];

const cefadroxilPedsBID = (weightKg: number, ageMonths: number, concMgPerMl: number) => {
	// Common pediatric dose: 30 mg/kg/day divided q12h. Max 2 g/day.
	if (ageMonths >= 144 || weightKg >= 40) {
		return '٥٠٠ مجم كل ١٢ ساعة بعد الأكل لمدة ٧–١٠ أيام';
	}

	const dailyMg = clamp(weightKg * 30, 0, 2000);
	const mgPerDose = dailyMg / 2;
	const mlPerDose = mgPerDose / concMgPerMl;
	return `${toAr(roundVol(mlPerDose))} مل كل ١٢ ساعة بعد الأكل لمدة ٧–١٠ أيام`;
};

type CefazolinRoute = 'IV' | 'IM';
const vialMg = (c: string) => (c === '1gm' || c === '1g' ? 1000 : c === '500mg' ? 500 : 0);
const mgPerMl = (route: CefazolinRoute) => (route === 'IV' ? 125 : 250);

const cefazolinDose = (weightKg: number, ageMonths: number, concentration: string, route: CefazolinRoute): string => {
	if (ageMonths < 1) return 'حديثي الولادة: جرعات خاصة—يلزم بروتوكول.';
	const v = vialMg(concentration);
	if (!v) return 'جرعة غير متاحة لهذا التركيز.';
	const isAdult = ageMonths >= 144 || weightKg >= 40;
	const dailyMin = isAdult ? 3000 : clamp(weightKg * 50, 0, 6000);
	const dailyMax = isAdult ? 6000 : clamp(weightKg * 100, 0, 6000);
	const mgMin = dailyMin / 3;
	const mgMax = dailyMax / 3;
	const mlMin = Math.round((mgMin / mgPerMl(route)) * 10) / 10;
	const mlMax = Math.round((mgMax / mgPerMl(route)) * 10) / 10;
	if (Math.abs(mlMin - mlMax) < 0.1) return `${toAr(mlMin)} مل كل ٨ ساعات لمدة ٥–١٠ أيام`;
	return `${toAr(mlMin)}–${toAr(mlMax)} مل كل ٨ ساعات لمدة ٥–١٠ أيام`;
};

const cefazolin = (concentration: string, route: CefazolinRoute) => (w: number, a: number) => cefazolinDose(w, a, concentration, route);

export const FIRST_GEN_CEPHALOSPORINS: Medication[] = [
	// ==========================================
	// CEFADROXIL (Suspensions)
	// ==========================================

	// 1) duricef 250 mg/5ml susp. 60ml
	{
		id: 'duricef-250mg-5ml-susp-60ml',
		name: 'duricef 250 mg/5ml susp. 60ml',
		genericName: 'cefadroxil',
		concentration: '250mg/5ml',
		price: 49,
		matchKeywords: [
			'duricef 250', 'duricef', 'cefadroxil', 'cephadroxil', 'ديوريسيف', 'ديوريسيف ٢٥٠',
			'tonsillitis', 'pharyngitis', 'sore throat', 'sinusitis', 'skin infection', 'impetigo', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب لوزتين', 'التهاب جيوب', 'التهاب بول', 'التهاب جلد', 'حصف',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'مضاد حيوي (سيفادروكسيل) لالتهابات الحلق/اللوز/الجلد والمسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Suspension',
		minAgeMonths: 0,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		// 250mg/5ml = 50mg/ml
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 50),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 2) duricef 500mg/5ml susp. 60ml
	{
		id: 'duricef-500mg-5ml-susp-60ml',
		name: 'duricef 500mg/5ml susp. 60ml',
		genericName: 'cefadroxil',
		concentration: '500mg/5ml',
		price: 78,
		matchKeywords: [
			'duricef 500 susp', 'duricef 500', 'duricef', 'cefadroxil 500', 'ديوريسيف ٥٠٠', 'ديوريسيف',
			'tonsillitis', 'pharyngitis', 'sore throat', 'skin infection', 'impetigo', 'cellulitis', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب جلد', 'التهاب بول', 'حصف', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'مضاد حيوي (سيفادروكسيل) تركيز أعلى—يُستخدم عندما تحتاج جرعة أكبر/حجم أقل.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Suspension',
		minAgeMonths: 24,
		maxAgeMonths: 144,
		minWeight: 10,
		maxWeight: 60,
		// 500mg/5ml = 100mg/ml
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 100),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 4) duricef 125 mg/5ml susp. 60ml
	{
		id: 'duricef-125mg-5ml-susp-60ml',
		name: 'duricef 125 mg/5ml susp. 60ml',
		genericName: 'cefadroxil',
		concentration: '125mg/5ml',
		price: 20,
		matchKeywords: [
			'duricef 125', 'duricef', 'cefadroxil', 'ديوريسيف ١٢٥', 'ديوريسيف',
			'tonsillitis', 'pharyngitis', 'sore throat', 'skin infection', 'impetigo', 'cellulitis', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'حصف', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'مضاد حيوي (سيفادروكسيل) للأطفال لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Suspension',
		minAgeMonths: 0,
		maxAgeMonths: 144,
		minWeight: 4,
		maxWeight: 40,
		// 125mg/5ml = 25mg/ml
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 25),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 8) curisafe 125mg/5ml susp. 60ml
	{
		id: 'curisafe-125mg-5ml-susp-60ml',
		name: 'curisafe 125mg/5ml susp. 60ml',
		genericName: 'cefadroxil',
		concentration: '125mg/5ml',
		price: 24.5,
		matchKeywords: [
			'curisafe 125', 'curisafe', 'cefadroxil', 'كوريساف ١٢٥', 'كوريسيف', 'سيفادروكسيل',
			'tonsillitis', 'pharyngitis', 'sore throat', 'skin infection', 'impetigo', 'cellulitis', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'حصف', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'بديل سيفادروكسيل للأطفال (معلق) لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Suspension',
		minAgeMonths: 0,
		maxAgeMonths: 144,
		minWeight: 4,
		maxWeight: 40,
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 25),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 9) curisafe 250mg/5ml susp. 60ml
	{
		id: 'curisafe-250mg-5ml-susp-60ml',
		name: 'curisafe 250mg/5ml susp. 60ml',
		genericName: 'cefadroxil',
		concentration: '250mg/5ml',
		price: 26,
		matchKeywords: [
			'curisafe 250', 'curisafe', 'cefadroxil', 'كوريساف ٢٥٠', 'سيفادروكسيل',
			'tonsillitis', 'pharyngitis', 'sore throat', 'sinusitis', 'skin infection', 'impetigo', 'cellulitis', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب جيوب', 'التهاب بول', 'التهاب جلد', 'حصف', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'بديل سيفادروكسيل للأطفال (معلق) لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Suspension',
		minAgeMonths: 0,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 45,
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 50),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 11) curisafe 500mg/5ml susp. 60ml
	{
		id: 'curisafe-500mg-5ml-susp-60ml',
		name: 'curisafe 500mg/5ml susp. 60ml',
		genericName: 'cefadroxil',
		concentration: '500mg/5ml',
		price: 35.5,
		matchKeywords: [
			'curisafe 500 susp', 'curisafe 500', 'curisafe', 'cefadroxil 500', 'كوريساف ٥٠٠', 'سيفادروكسيل',
			'tonsillitis', 'pharyngitis', 'sore throat', 'skin infection', 'impetigo', 'cellulitis', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب جلد', 'التهاب بول', 'حصف', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'بديل سيفادروكسيل تركيز أعلى لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Suspension',
		minAgeMonths: 24,
		maxAgeMonths: 144,
		minWeight: 10,
		maxWeight: 60,
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 100),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 14) ibidroxil 500mg powder 60 ml suspension
	{
		id: 'ibidroxil-500mg-powder-60ml-susp',
		name: 'ibidroxil 500mg powder 60 ml suspension',
		genericName: 'cefadroxil',
		concentration: '500mg/5ml',
		price: 20,
		matchKeywords: [
			'ibidroxil 500', 'ibidroxil', 'cefadroxil', 'ايبيدروكسيل', 'سيفادروكسيل',
			'powder', 'powder for suspension', 'معلق',
			'tonsillitis', 'pharyngitis', 'sore throat', 'skin infection', 'impetigo', 'cellulitis', 'uti',
			'التهاب حلق', 'التهاب لوز', 'التهاب جلد', 'التهاب بول', 'حصف', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفادروكسيل بودرة تُحضّر لمعلق—لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Powder',
		minAgeMonths: 24,
		maxAgeMonths: 144,
		minWeight: 10,
		maxWeight: 60,
		calculationRule: (w, a) => cefadroxilPedsBID(w, a, 100),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// ==========================================
	// CEFADROXIL (Capsules/Tablets)
	// ==========================================

	// 5) duricef 500mg 12 caps.
	{
		id: 'duricef-500mg-12-caps',
		name: 'duricef 500mg 12 caps.',
		genericName: 'cefadroxil',
		concentration: '500mg',
		price: 72,
		matchKeywords: [
			'duricef 500 caps', 'duricef 500', 'duricef', 'cefadroxil 500', 'ديوريسيف ٥٠٠ كبسول', 'ديوريسيف', 'سيفادروكسيل',
			'tonsillitis', 'pharyngitis', 'uti', 'skin infection', 'cellulitis', 'impetigo',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفادروكسيل كبسولات لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Capsules',
		minAgeMonths: 96,
		maxAgeMonths: 1200,
		minWeight: 25,
		maxWeight: 250,
		calculationRule: (_w, a) => (a < 96 ? 'للأطفال الأصغر: استخدم المعلق وحساب الجرعة بالوزن.' : '١ كبسولة (٥٠٠ مجم) كل ١٢ ساعة بعد الأكل لمدة ٧–١٠ أيام'),
		warnings: [...COMMON_CEPHALOSPORIN_WARNINGS],
	},

	// 10) curisafe 500mg 8 caps
	{
		id: 'curisafe-500mg-8-caps',
		name: 'curisafe 500mg 8 caps',
		genericName: 'cefadroxil',
		concentration: '500mg',
		price: 45,
		matchKeywords: [
			'curisafe 500 caps', 'curisafe 500', 'curisafe', 'cefadroxil 500', 'كوريساف ٥٠٠ كبسول', 'سيفادروكسيل',
			'tonsillitis', 'pharyngitis', 'uti', 'skin infection', 'cellulitis', 'impetigo',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'بديل سيفادروكسيل كبسولات لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Capsules',
		minAgeMonths: 96,
		maxAgeMonths: 1200,
		minWeight: 25,
		maxWeight: 250,
		calculationRule: (_w, a) => (a < 96 ? 'للأطفال الأصغر: استخدم المعلق وحساب الجرعة بالوزن.' : '١ كبسولة (٥٠٠ مجم) كل ١٢ ساعة بعد الأكل لمدة ٧–١٠ أيام'),
		warnings: [...COMMON_CEPHALOSPORIN_WARNINGS],
	},

	// 6) cefex 1 gm 8 f.c. tabs.
	{
		id: 'cefex-1gm-8-fc-tabs',
		name: 'cefex 1 gm 8 f.c. tabs.',
		genericName: 'cefadroxil',
		concentration: '1gm',
		price: 22.5,
		matchKeywords: [
			'cefex 1gm', 'cefex', 'cefadroxil 1g', 'سيفكس', 'سيفادروكسيل',
			'tonsillitis', 'pharyngitis', 'uti', 'skin infection', 'cellulitis',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفادروكسيل ١ جم أقراص مغلفة لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'مرة–مرتين يومياً – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '١ قرص (١ جم) مرة يومياً بعد الأكل لمدة ٧–١٠ أيام',
		warnings: [...COMMON_CEPHALOSPORIN_WARNINGS],
	},

	// 7) duricef 1 gm 8 f.c. tabs.
	{
		id: 'duricef-1gm-8-fc-tabs',
		name: 'duricef 1 gm 8 f.c. tabs.',
		genericName: 'cefadroxil',
		concentration: '1gm',
		price: 78,
		matchKeywords: [
			'duricef 1gm', 'duricef 1 g', 'duricef', 'cefadroxil 1g', 'ديوريسيف ١ جم',
			'tonsillitis', 'pharyngitis', 'uti', 'skin infection', 'cellulitis',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفادروكسيل ١ جم أقراص مغلفة لالتهابات الحلق/اللوز/الجلد/المسالك البولية.',
		timing: 'مرة–مرتين يومياً – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '١ قرص (١ جم) مرة يومياً بعد الأكل لمدة ٧–١٠ أيام',
		warnings: [...COMMON_CEPHALOSPORIN_WARNINGS],
	},

	// 12) duricef 1 gm 6 dispersable tab
	{
		id: 'duricef-1gm-6-dispersable-tab',
		name: 'duricef 1 gm 6 dispersable tab',
		genericName: 'cefadroxil',
		concentration: '1gm',
		price: 58,
		matchKeywords: [
			'duricef dispersable', 'duricef 1gm dispersable', 'duricef 1gm', 'cefadroxil dispersable', 'ديوريسيف قابل للذوبان', 'سيفادروكسيل',
			'dysphagia', 'difficulty swallowing', 'صعوبة بلع',
			'tonsillitis', 'pharyngitis', 'uti', 'skin infection', 'cellulitis',
			'التهاب حلق', 'التهاب لوز', 'التهاب بول', 'التهاب جلد', 'التهاب خلوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفادروكسيل قرص قابل للذوبان لمرضى صعوبة البلع.',
		timing: 'مرة–مرتين يومياً – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Oral Dispersible Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '١ قرص (١ جم) يُذاب ويؤخذ مرة يومياً بعد الأكل لمدة ٧–١٠ أيام',
		warnings: [...COMMON_CEPHALOSPORIN_WARNINGS],
	},

	// ==========================================
	// CEFAZOLIN (Injectables)
	// ==========================================

	// 3) zinol 1gm i.v. vial
	{
		id: 'zinol-1gm-iv-vial',
		name: 'zinol 1gm i.v. vial',
		genericName: 'cefazolin',
		concentration: '1gm',
		price: 48,
		matchKeywords: [
			'zinol 1gm iv', 'zinol iv', 'zinol 1gm', 'zinol', 'cefazolin', 'سيفازولين', 'زينول ١ جم', 'زينول', 'iv', 'حقن وريد',
			'surgical prophylaxis', 'pre-op', 'cellulitis', 'skin infection', 'uti', 'sepsis',
			'وقاية عمليات', 'قبل العمليات', 'التهاب نسيج خلوي', 'التهاب جلدي', 'التهاب بول', 'حقن مضاد حيوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفازولين حقن وريد فقط (جيل أول) حسب التشخيص.',
		timing: 'كل ٨ ساعات – ٥–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: cefazolin('1gm', 'IV'),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'يُمنع عند وجود حساسية شديدة سابقة للبنسلين/السيفالوسبورين.',
			'لا يُخلط في نفس السرنجة مع أدوية أخرى إلا بتوافق مُثبت.',
		],
	},
	// 3b) zinol 1gm i.m. vial
	{
		id: 'zinol-1gm-im-vial',
		name: 'zinol 1gm i.m. vial',
		genericName: 'cefazolin',
		concentration: '1gm',
		price: 48,
		matchKeywords: [
			'zinol 1gm im', 'zinol im', 'zinol 1gm', 'zinol', 'cefazolin', 'سيفازولين', 'زينول ١ جم', 'زينول', 'im', 'حقن عضل',
			'surgical prophylaxis', 'pre-op', 'cellulitis', 'skin infection', 'uti', 'sepsis',
			'وقاية عمليات', 'قبل العمليات', 'التهاب نسيج خلوي', 'التهاب جلدي', 'التهاب بول', 'حقن مضاد حيوي',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفازولين حقن عضل فقط (جيل أول) حسب التشخيص.',
		timing: 'كل ٨ ساعات – ٥–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: cefazolin('1gm', 'IM'),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'يُمنع عند وجود حساسية شديدة سابقة للبنسلين/السيفالوسبورين.',
			'لا يُخلط في نفس السرنجة مع أدوية أخرى إلا بتوافق مُثبت.',
		],
	},

	// 13) zinol 500 mg i.v. vial
	{
		id: 'zinol-500mg-iv-vial',
		name: 'zinol 500 mg i.v. vial',
		genericName: 'cefazolin',
		concentration: '500mg',
		price: 31,
		matchKeywords: [
			'zinol 500 iv', 'zinol iv', 'zinol 500', 'zinol', 'cefazolin 500', 'زينول ٥٠٠', 'سيفازولين', 'iv', 'حقن وريد',
			'surgical prophylaxis', 'pre-op', 'cellulitis', 'skin infection', 'uti', 'endocarditis prophylaxis',
			'وقاية عمليات', 'قبل العمليات', 'التهاب جلدي', 'التهاب بول', 'حقن مضاد حيوي', 'وقاية التهاب شغاف',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفازولين ٥٠٠ مجم حقن وريد فقط (جيل أول) حسب التشخيص.',
		timing: 'كل ٨ ساعات – ٥–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: cefazolin('500mg', 'IV'),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'يُمنع عند وجود حساسية شديدة سابقة للبنسلين/السيفالوسبورين.',
		],
	},
	// 13b) zinol 500 mg i.m. vial
	{
		id: 'zinol-500mg-im-vial',
		name: 'zinol 500 mg i.m. vial',
		genericName: 'cefazolin',
		concentration: '500mg',
		price: 31,
		matchKeywords: [
			'zinol 500 im', 'zinol im', 'zinol 500', 'zinol', 'cefazolin 500', 'زينول ٥٠٠', 'سيفازولين', 'im', 'حقن عضل',
			'surgical prophylaxis', 'pre-op', 'cellulitis', 'skin infection', 'uti', 'endocarditis prophylaxis',
			'وقاية عمليات', 'قبل العمليات', 'التهاب جلدي', 'التهاب بول', 'حقن مضاد حيوي', 'وقاية التهاب شغاف',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفازولين ٥٠٠ مجم حقن عضل فقط (جيل أول) حسب التشخيص.',
		timing: 'كل ٨ ساعات – ٥–١٠ أيام',
		category: Category.CEPHALOSPORINS_G1,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: cefazolin('500mg', 'IM'),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'يُمنع عند وجود حساسية شديدة سابقة للبنسلين/السيفالوسبورين.',
		],
	},
];
