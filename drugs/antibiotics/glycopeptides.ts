import { Medication, Category } from '../../types';

const TEICOPLANIN_INJ_SHORT = '١٠ مجم/كجم تحميل كل ١٢ ساعة × ٣ ثم ٦–١٠ مجم/كجم يومياً لمدة ٧–١٤ يوم';
const VANCOMYCIN_INJ_SHORT = '١٥–٢٠ مجم/كجم كل ٨–١٢ ساعة تسريب وريدي ≥٦٠ دقيقة لمدة ٧–١٤ يوم (حد أقصى ٢ جم/جرعة)';

export const GLYCOPEPTIDES_GROUP: Medication[] = [
	// ==========================================
	// TEICOPLANIN
	// ==========================================
	{
		id: 'targocid-400mg-vial',
		name: 'targocid 400mg vial for i.v/i.m inj.',
		genericName: 'teicoplanin',
		concentration: '400mg',
		price: 528,
		matchKeywords: ['targocid', 'تارجوسيد', 'teicoplanin', 'تيكوبلانين', 'mrsa', 'bone infection', 'osteomyelitis', 'endocarditis', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'التهاب عظام', 'غسيل كلوي', 'peritonitis', '#antibiotics', '#glycopeptide antibiotic'],
		usage: 'مضاد حيوي للعدوى الشديدة المقاومة (MRSA)/التهاب العظام/التهاب صمامات القلب (للاستخدام الاستشفائي فقط).',
		timing: 'تحميل كل ١٢ ساعة × ٣ ثم مرة يومياً – ٧–١٤ يوم',
		category: Category.GLYCOPEPTIDES,
		form: 'Vial',
		minAgeMonths: 2,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => TEICOPLANIN_INJ_SHORT,
		warnings: [
			'مضاد حيوي قوي احتياطي—لا يُستخدم إلا للعدوى المقاومة الشديدة.',
			'لا يسبب متلازمة الرجل الأحمر (عكس الفانكومايسين).',
			'يُراقب وظائف الكلى والسمع بانتظام أثناء العلاج.',
			'قد يسبب حساسية جلدية موضعية عند الحقن العضلي—أعد التقييم.'
		]
	},
	// ==========================================
	// VANCOMYCIN
	// ==========================================
	{
		id: 'edicin-500mg-vial',
		name: 'edicin 500 mg pd for i.v. inf. vial',
		genericName: 'vancomycin',
		concentration: '500mg',
		price: 118,
		matchKeywords: ['edicin', 'اديسين', 'vancomycin', 'فانكومايسين', 'mrsa', 'sepsis', 'endocarditis', 'c diff', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'تسمم دم', 'التهاب سحايا', '#antibiotics', '#glycopeptide antibiotic'],
		usage: 'مضاد حيوي للعدوى البكتيرية المقاومة الشديدة (MRSA)/تسمم الدم/التهاب صمامات القلب (للاستخدام الاستشفائي فقط).',
		timing: 'كل ٨–١٢ ساعة تسريب وريدي – ٧–١٤ يوم',
		category: Category.GLYCOPEPTIDES,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: () => VANCOMYCIN_INJ_SHORT,
		warnings: [
			'تحذير حرج: التسريع يسبب متلازمة الرجل الأحمر (احمرار وحكة وحرارة بالوجه والجسم) وهبوط حاد بالضغط—اطلب مساعدة الطبيب فوراً.',
			'لا يمكن الحقن في العضل أو تحت الجلد—الوريد فقط.',
			'يُراقب الطبيب وظائف الكلى والسمع بانتظام طوال العلاج.',
			'قد يسبب سمية سمعية وكلوية—أوقف الدواء وأعد التقييم عند أي طنين بالأذن أو تغيير في كمية البول.',
			'يجب قياس مستوى الدواء بالدم (trough) قبل الجرعة الرابعة أو الخامسة—المستهدف ١٥–٢٠ ميكروجرام/مل للعدوى الشديدة.'
		]
	},
	{
		id: 'vancobact-500mg-vial',
		name: 'vancobact 500 mg vial for i.v. inf.',
		genericName: 'vancomycin',
		concentration: '500mg',
		price: 118,
		matchKeywords: ['vancobact', 'فانكوباكت', 'vancomycin', 'فانكومايسين', 'mrsa', 'hospital infection', 'عدوى المستشفيات', 'بكتيريا مقاومة', 'nosocomial', 'ICU', 'عناية مركزة', 'تسمم دم', 'sepsis', 'endocarditis', '#antibiotics', '#glycopeptide'],
		usage: 'مضاد حيوي للعدوى البكتيرية المقاومة الشديدة (MRSA)/تسمم الدم/التهاب صمامات القلب (للاستخدام الاستشفائي فقط).',
		timing: 'كل ٨–١٢ ساعة تسريب وريدي – ٧–١٤ يوم',
		category: Category.GLYCOPEPTIDES,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: () => VANCOMYCIN_INJ_SHORT,
		warnings: [
			'تحذير حرج: الحقن السريع يسبب متلازمة الرجل الأحمر (احمرار الوجه والجسم والحكة والحرارة) وانخفاض ضغط الدم الخطير—اطلب المساعدة فوراً إذا حدث.',
			'للاستخدام الوريدي فقط—ممنوع الحقن في العضل أو تحت الجلد.',
			'الطبيب يُراقب وظائف الكلى والسمع طوال العلاج—لا تتخطى الجرعات.',
			'قد يسبب سمية سمعية وكلوية—أوقف الدواء وأعد التقييم عند أي طنين بالأذن أو تغيير في كمية البول.',
			'يجب قياس مستوى الدواء بالدم (trough) قبل الجرعة الرابعة أو الخامسة—المستهدف ١٥–٢٠ ميكروجرام/مل للعدوى الشديدة.'
		]
	},
];
