import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const COMMON_CARBAPENEM_WARNINGS = [
	'للاستخدام بالمستشفى فقط؛ يُعطى تسريب وريدي وفق التشخيص وتعليمات الإعطاء.',
	'حساسية: أوقف الدواء واطلب مساعدة فورية إذا ظهر طفح شديد/تورم/ضيق نفس/صدمة.',
	'إسهال شديد/دموي أو ألم بطن مستمر: أوقف المضاد واشتبه بالتهاب قولون C. difficile؛ أجرِ فحص Toxin/زرع وعالج حسب التشخيص والتحاليل (مترونيدازول ٥٠٠ مجم × ٣ فموي أو فانكومايسين فموي في الحالات الشديدة).',
	'مرضى الكلى: قد تحتاج الجرعة لتعديل حسب وظائف الكلى (يُراقب الكرياتينين).',
	'لا يفيد في نزلات البرد والإنفلونزا (عدوى فيروسية).',
];

const imipenemDose = (weightKg: number, ageMonths: number): string => {
	if (ageMonths < 1) return 'حديثي الولادة: جرعات خاصة—يلزم بروتوكول.';
	const isAdult = ageMonths >= 144 || weightKg >= 40;
	const mgMin = isAdult ? 500 : clamp(weightKg * 15, 0, 500);
	const mgMax = isAdult ? 500 : clamp(weightKg * 25, 0, 500);
	if (mgMin === mgMax) return `${toAr(mgMin)} مجم كل ٦–٨ ساعات تسريب وريدي لمدة ٧–١٤ يوم`;
	return `${toAr(mgMin)}–${toAr(mgMax)} مجم كل ٦–٨ ساعات تسريب وريدي لمدة ٧–١٤ يوم`;
};

const meropenemDose = (weightKg: number, ageMonths: number, concentration: string): string => {
	if (ageMonths < 3) return 'أقل من ٣ أشهر: جرعات خاصة—يلزم بروتوكول.';
	const v = concentration === '1gm' || concentration === '1g' ? 1000 : concentration === '500mg' ? 500 : 0;
	if (!v) return 'جرعة غير متاحة لهذا التركيز.';
	const isAdult = ageMonths >= 144 || weightKg >= 40;
	const mgMin = isAdult ? 1000 : clamp(weightKg * 20, 0, 2000);
	return `${toAr(mgMin)} مجم كل ٨ ساعات تسريب وريدي لمدة ٧–١٤ يوم`;
};

const imipenem = () => (w: number, a: number) => imipenemDose(w, a);
const meropenem = (conc: string) => (w: number, a: number) => meropenemDose(w, a, conc);

const imipenemWarnings = [
	...COMMON_CARBAPENEM_WARNINGS,
	'قد يخفض عتبة التشنجات—يُستخدم بحذر في مرضى الصرع/إصابات الرأس.',
	'يُراقب وظائف الكلى بانتظام (الكرياتينين/البول).',
	'يُتجنب مع أدوية أخرى قد تسبب تشنجات.',
	'الحد الأقصى للبالغين ٤ جم/يوم—لا تتجاوز الجرعة القصوى.',
];

const meropenemWarnings = [
	...COMMON_CARBAPENEM_WARNINGS,
	'آمن نسبياً على الجهاز العصبي مقارنة بالإيميبينيم—خطر أقل للتشنجات.',
	'يُراقب وظائف الكلى بانتظام.',
	'الحد الأقصى للبالغين ٦ جم/يوم (٢ جم كل ٨ ساعات للعدوى الشديدة كالتهاب السحايا).',
];

export const CARBAPENEMS_GROUP: Medication[] = [
	// ==========================================
	// IMIPENEM + CILASTATIN
	// ==========================================
	{
		id: 'bacqure-500-500mg-vial',
		name: 'bacqure 500/500mg pwd. for i.v. inf. vial',
		genericName: 'imipenem & cilastatin',
		concentration: '500/500mg',
		price: 219,
		matchKeywords: ['bacqure', 'باكيور', 'imipenem', 'cilastatin', 'إيميبينيم', 'سيلاستاتين', 'hospital infection', 'sepsis', 'mrsa', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'تسمم دم', 'التهاب رئوي', 'peritonitis', '#antibiotics', '#carbapenem'],
		usage: 'إيميبينيم/سيلاستاتين لعدوى المستشفيات الشديدة/تسمم الدم/البكتيريا المقاومة.',
		timing: 'كل ٦–٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: imipenem(),
		warnings: imipenemWarnings,
	},
	{
		id: 'spectopenem-500-500mg-vial',
		name: 'spectopenem 500/500mg pwd. for i.v. inf. vial',
		genericName: 'imipenem & cilastatin',
		concentration: '500/500mg',
		price: 286,
		matchKeywords: ['spectopenem', 'سبكتوبينيم', 'imipenem', 'cilastatin', 'إيميبينيم', 'سيلاستاتين', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'تسمم دم', 'sepsis', '#antibiotics', '#carbapenem'],
		usage: 'إيميبينيم/سيلاستاتين لعدوى المستشفيات الشديدة/تسمم الدم/البكتيريا المقاومة.',
		timing: 'كل ٦–٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: imipenem(),
		warnings: imipenemWarnings,
	},
	// ==========================================
	// MEROPENEM
	// ==========================================
	{
		id: 'meronem-1gm-vial',
		name: 'meronem 1 gm i.v. vial',
		genericName: 'meropenem',
		concentration: '1gm',
		price: 553,
		matchKeywords: ['meronem', 'ميرونيم', 'meropenem', 'ميروبينيم', 'hospital infection', 'sepsis', 'meningitis', 'سحايا', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'تسمم دم', 'التهاب رئوي', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي/التهاب السحايا.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('1gm'),
		warnings: meropenemWarnings,
	},
	{
		id: 'meronem-500mg-vial',
		name: 'meronem 500mg i.v. vial',
		genericName: 'meropenem',
		concentration: '500mg',
		price: 345,
		matchKeywords: ['meronem 500', 'ميرونيم', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'sepsis', 'تسمم دم', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('500mg'),
		warnings: meropenemWarnings,
	},
	{
		id: 'winpenem-1gm-vial',
		name: 'winpenem 1 gm i.v. vial',
		genericName: 'meropenem & sodium',
		concentration: '1gm',
		price: 352,
		matchKeywords: ['winpenem', 'وينبينيم', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'sepsis', 'تسمم دم', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('1gm'),
		warnings: meropenemWarnings,
	},
	{
		id: 'meropenem-eva-500mg-vial',
		name: 'meropenem-eva pharma 500 mg i.v. vial',
		genericName: 'meropenem & sodium carbonate anhydrous',
		concentration: '500mg',
		price: 242,
		matchKeywords: ['meropenem eva', 'ميروبينيم إيفا', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'sepsis', 'تسمم دم', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('500mg'),
		warnings: meropenemWarnings,
	},
	{
		id: 'meropenem-eva-1gm-vial',
		name: 'meropenem-eva pharma 1 gm i.v. vial',
		genericName: 'meropenem',
		concentration: '1gm',
		price: 331,
		matchKeywords: ['meropenem eva 1gm', 'ميروبينيم إيفا', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'sepsis', 'تسمم دم', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('1gm'),
		warnings: meropenemWarnings,
	},
	{
		id: 'merostarkyl-1gm-vial',
		name: 'merostarkyl 1 gm i.v. vial',
		genericName: 'meropenem anhydrous & meropenem',
		concentration: '1gm',
		price: 360,
		matchKeywords: ['merostarkyl', 'ميروستاركيل', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'sepsis', 'تسمم دم', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('1gm'),
		warnings: meropenemWarnings,
	},
	{
		id: 'merostarkyl-500mg-vial',
		name: 'merostarkyl 500mg i.v. vial',
		genericName: 'meropenem',
		concentration: '500mg',
		price: 225,
		matchKeywords: ['merostarkyl 500', 'ميروستاركيل', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('500mg'),
		warnings: meropenemWarnings,
	},
	{
		id: 'mirage-1gm-vial',
		name: 'mirage 1 gm i.v. vial',
		genericName: 'meropenem',
		concentration: '1gm',
		price: 350,
		matchKeywords: ['mirage', 'ميراج', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'sepsis', 'تسمم دم', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('1gm'),
		warnings: meropenemWarnings,
	},
	{
		id: 'mirage-500mg-vial',
		name: 'mirage 500 mg i.v.vial',
		genericName: 'meropenem',
		concentration: '500mg',
		price: 164,
		matchKeywords: ['mirage 500', 'ميراج', 'meropenem', 'ميروبينيم', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', '#antibiotics', '#carbapenem'],
		usage: 'ميروبينيم لعدوى المستشفيات الشديدة/تسمم الدم/الالتهاب الرئوي.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٤ يوم',
		category: Category.CARBAPENEMS,
		form: 'Vial',
		minAgeMonths: 3,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: meropenem('500mg'),
		warnings: meropenemWarnings,
	},
];
