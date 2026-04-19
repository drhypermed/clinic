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

const cefaclorPedsTID = (weightKg: number, ageMonths: number, concMgPerMl: number) => {
	// Pediatric: 20–40 mg/kg/day divided q8h. Use 30 mg/kg/day for calculator. Max 1 g/day.
	if (ageMonths >= 144 || weightKg >= 40) {
		return '٢٥٠–٥٠٠ مجم كل ٨ ساعات بدون اعتبار للأكل لمدة ٧–١٠ أيام';
	}

	const dailyMg = clamp(weightKg * 30, 0, 1000);
	const mgPerDose = dailyMg / 3;
	const mlPerDose = mgPerDose / concMgPerMl;
	return `${toAr(roundVol(mlPerDose))} مل كل ٨ ساعات بدون اعتبار للأكل لمدة ٧–١٠ أيام`;
};

export const SECOND_GEN_CEPHALOSPORINS: Medication[] = [
	// ==========================================
	// CEFACLOR (Suspensions)
	// ==========================================

	// 1) bacticlor 250mg/5ml susp 60 ml
	{
		id: 'bacticlor-250mg-5ml-susp-60ml',
		name: 'bacticlor 250mg/5ml susp 60 ml',
		genericName: 'cefaclor',
		concentration: '250mg/5ml',
		price: 136,
		matchKeywords: [
			'bacticlor 250', 'bacticlor', 'cefaclor', 'باكتكلور ٢٥٠', 'سيفاكلور',
			'otitis media', 'otitis', 'ear infection', 'ear pain', 'sinusitis', 'bronchitis', 'pneumonia', 'tonsillitis', 'uti',
			'التهاب اذن وسطى', 'التهاب أذن', 'وجع اذن', 'التهاب جيوب', 'التهاب شعبي', 'التهاب رئوي', 'التهاب حلق', 'لوز', 'التهاب بول',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'مضاد حيوي (سيفاكلور) لالتهابات الأذن الوسطى/الجيوب/الصدر/الحلق.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G2,
		form: 'Suspension',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		// 250mg/5ml = 50mg/ml
		calculationRule: (w, a) => cefaclorPedsTID(w, a, 50),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 2) bacticlor 125mg/5ml susp. 60ml
	{
		id: 'bacticlor-125mg-5ml-susp-60ml',
		name: 'bacticlor 125mg/5ml susp. 60ml',
		genericName: 'cefaclor',
		concentration: '125mg/5ml',
		price: 73,
		matchKeywords: [
			'bacticlor 125', 'bacticlor', 'cefaclor', 'باكتكلور ١٢٥', 'سيفاكلور',
			'otitis media', 'otitis', 'ear infection', 'ear pain', 'sinusitis', 'bronchitis', 'pneumonia', 'tonsillitis', 'uti',
			'التهاب اذن وسطى', 'التهاب أذن', 'وجع اذن', 'التهاب جيوب', 'التهاب شعبي', 'التهاب رئوي', 'التهاب حلق', 'لوز', 'التهاب بول',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'مضاد حيوي (سيفاكلور) لالتهابات الأذن الوسطى/الجيوب/الصدر/الحلق.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G2,
		form: 'Suspension',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		// 125mg/5ml = 25mg/ml
		calculationRule: (w, a) => cefaclorPedsTID(w, a, 25),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 3) ceclor 125mg/5ml susp. 75ml
	{
		id: 'ceclor-125mg-5ml-susp-75ml',
		name: 'ceclor 125mg/5ml susp. 75ml',
		genericName: 'cefaclor',
		concentration: '125mg/5ml',
		price: 83,
		matchKeywords: [
			'ceclor 125', 'ceclor', 'cefaclor', 'سيكلور ١٢٥', 'سيفاكلور',
			'otitis media', 'otitis', 'ear infection', 'sinusitis', 'bronchitis', 'pneumonia', 'tonsillitis', 'uti',
			'التهاب اذن وسطى', 'التهاب أذن', 'التهاب جيوب', 'التهاب شعبي', 'التهاب رئوي', 'التهاب حلق', 'لوز', 'التهاب بول',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفاكلور معلق (Ceclor) لالتهابات الجهاز التنفسي/الأذن الوسطى/الجيوب.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G2,
		form: 'Suspension',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w, a) => cefaclorPedsTID(w, a, 25),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 4) ceclor 250mg/5ml susp. 75ml
	{
		id: 'ceclor-250mg-5ml-susp-75ml',
		name: 'ceclor 250mg/5ml susp. 75ml',
		genericName: 'cefaclor',
		concentration: '250mg/5ml',
		price: 156,
		matchKeywords: [
			'ceclor 250', 'ceclor', 'cefaclor', 'سيكلور ٢٥٠', 'سيفاكلور',
			'otitis media', 'otitis', 'ear infection', 'sinusitis', 'bronchitis', 'pneumonia', 'tonsillitis', 'uti',
			'التهاب اذن وسطى', 'التهاب أذن', 'التهاب جيوب', 'التهاب شعبي', 'التهاب رئوي', 'التهاب حلق', 'لوز', 'التهاب بول',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'سيفاكلور معلق (تركيز أعلى) لالتهابات الأذن الوسطى/الجيوب/الصدر/الحلق.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G2,
		form: 'Suspension',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		// 250mg/5ml = 50mg/ml
		calculationRule: (w, a) => cefaclorPedsTID(w, a, 50),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// 6) lanaclor 250 mg/5ml susp. 60ml
	{
		id: 'lanaclor-250mg-5ml-susp-60ml',
		name: 'lanaclor 250 mg/5ml susp. 60ml',
		genericName: 'cefaclor',
		concentration: '250mg/5ml',
		price: 136,
		matchKeywords: [
			'lanaclor 250', 'lanaclor', 'cefaclor', 'لانكلور ٢٥٠', 'سيفاكلور',
			'otitis media', 'otitis', 'ear infection', 'sinusitis', 'bronchitis', 'pneumonia', 'tonsillitis', 'uti',
			'التهاب اذن وسطى', 'التهاب أذن', 'التهاب جيوب', 'التهاب شعبي', 'التهاب رئوي', 'التهاب حلق', 'لوز', 'التهاب بول',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'بديل سيفاكلور (Lanaclor) لالتهابات الأذن الوسطى/الجيوب/الصدر/الحلق.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G2,
		form: 'Suspension',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w, a) => cefaclorPedsTID(w, a, 50),
		warnings: [
			...COMMON_CEPHALOSPORIN_WARNINGS,
			'بعد التحضير: يُحفظ في الثلاجة ويُستخدم خلال ١٤ يوم.',
		],
	},

	// ==========================================
	// CEFUROXIME (Tablets)
	// ==========================================

	// 5) zinnat 500mg 10 tab
	{
		id: 'zinnat-500mg-10-tab',
		name: 'zinnat 500mg 10 tab',
		genericName: 'cefuroxime',
		concentration: '500mg',
		price: 45,
		matchKeywords: [
			'zinnat 500', 'zinnat', 'cefuroxime', 'cefuroxime axetil', 'زينات ٥٠٠', 'زينات', 'سيفوروكسيم',
			'sinusitis', 'bronchitis', 'pneumonia', 'uti', 'skin infection', 'otitis media', 'otitis', 'tonsillitis', 'lyme disease',
			'التهاب جيوب', 'التهاب شعبي', 'التهاب رئوي', 'التهاب بول', 'التهاب جلد', 'التهاب اذن وسطى', 'التهاب أذن', 'التهاب لوز',
			'#antibiotics', '#cephalosporin',
		],
		usage: 'مضاد حيوي (سيفوروكسيم) لالتهابات الصدر/الجيوب/المسالك/الجلد.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.CEPHALOSPORINS_G2,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '١ قرص (٥٠٠ مجم) كل ١٢ ساعة بعد الأكل لمدة ٧–١٠ أيام',
		warnings: [...COMMON_CEPHALOSPORIN_WARNINGS, 'تناوله مع الطعام يزيد من امتصاصه وفعاليته.', 'لا يُكسر/لا يُمضغ (طعمه مر).'],
	},
];
