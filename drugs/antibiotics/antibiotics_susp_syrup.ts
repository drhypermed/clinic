import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

const COMMON_ANTIBIOTIC_WARNINGS = [
	'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
	'لا يفيد في نزلات البرد والإنفلونزا (عدوى فيروسية).',
];

const LINEZOLID_WARNINGS = [
	...COMMON_ANTIBIOTIC_WARNINGS,
	'مضاد حيوي احتياطي للبكتيريا المقاومة (MRSA/VRE)—لا يُستخدم بلا داعٍ.',
	'قد يسبب انخفاض الصفائح الدموية مع الاستخدام >٢ أسبوع: يلزم مراقبة دم.',
	'الحذر من تفاعلات دوائية مع أدوية اكتئاب (مثبطات MAO) والأطعمة الغنية بالتيرامين.',
];

const AMOXICILLIN_WARNINGS = [
	...COMMON_ANTIBIOTIC_WARNINGS,
	'ممنوع تماماً لمن لديهم حساسية البنسلين.',
	'قد يسبب إسهال بسيط (طبيعي) لكن أعد التقييم إذا أصبح دموياً أو شديداً.',
	'يُحفظ في الثلاجة بعد الفتح ويُستخدم خلال ٧ أيام.',
];

const NIFUROXAZIDE_WARNINGS = [
	'لا يُستخدم أكثر من ٥ أيام.',
	'شرب سوائل كافية مع الإسهال—العصائر والماء والشاي والزبادي آمنة.',
	'يعمل موضعياً بالأمعاء—لا يُمتص بالدم، آمن جداً للأطفال.',
];

export const ANTIBIOTIC_SUSPENSIONS_GROUP: Medication[] = [
	// ==========================================
	// LINEZOLID (Oxazolidinone)
	// Pediatric: 10 mg/kg every 8 hours. Max 600mg/dose.
	// Adult: 600mg every 12 hours.
	// ==========================================
	{
		id: 'averozolid-100mg-5ml-susp-150ml',
		name: 'averozolid 100mg/5ml susp. 150ml',
		genericName: 'linezolid',
		concentration: '100mg/5ml',
		price: 106,
		matchKeywords: ['averozolid', 'أفيروزوليد', 'linezolid', 'لينزوليد', 'mrsa', 'vre', '#antibiotics', '#oxazolidinone'],
		usage: 'مضاد حيوي احتياطي للعدوى المقاومة (تجرثم دم/ذات رئة/جلد شديد)—بجرعة محددة حسب الوزن والتحسس والمزرعة.',
		timing: 'كل ٨ ساعات – ١٠–١٤ يوم',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 0,
		maxAgeMonths: 144,
		minWeight: 3,
		maxWeight: 50,
		calculationRule: (w) => {
			// 10 mg/kg/dose every 8 hours. Max 600mg/dose.
			const doseMg = Math.min(600, Math.round(w * 10));
			const volMl = roundVol(doseMg / 20); // 100mg/5ml = 20mg/ml
			return `${toAr(volMl)} مل كل ٨ ساعات مع أو بدون الأكل لمدة ١٠–١٤ يوم (رُج قبل الجرعة)`;
		},
		warnings: LINEZOLID_WARNINGS
	},
	// ==========================================
	// AMOXICILLIN + CLAVULANIC ACID (Co-Amoxiclav)
	// Dose based on AMOXICILLIN component:
	// Standard: 25-45 mg/kg/day ÷ 2-3 doses
	// High dose (resistant): 80-90 mg/kg/day ÷ 2 doses
	// ==========================================
	// --- Infant Drops ---
	{
		id: 'augmentin-62.5mg-ml-infant-drops-20ml',
		name: 'augmentin 62.5mg/ml infant drops 20 ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '62.5mg/ml',
		price: 86,
		matchKeywords: ['augmentin drops', 'أوجمنتين نقط', 'infant', 'رضع', '#penicillin', '#beta lactamase inhibitor', '#antibiotics'],
		usage: 'مضاد حيوي (أموكسيسيللين + كلافيولانيك) لالتهاب الأذن/الحلق/الأنف/المسالك البولية.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Drops',
		minAgeMonths: 0,
		maxAgeMonths: 24,
		minWeight: 2,
		maxWeight: 12,
		calculationRule: (w) => {
			// 50mg/ml amoxicillin + 12.5mg/ml clavulanate = 62.5mg/ml total
			// Dose: 25 mg/kg/dose = 0.5 ml/kg
			const doseMl = roundVol(w * 0.5);
			const doseMg = Math.round(doseMl * 50);
			return `${toAr(doseMl)} مل كل ٨ ساعات بعد الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: [...AMOXICILLIN_WARNINGS, 'احفظها في الثلاجة بعد الفتح وتخلص منها بعد ٧ أيام.']
	},
	// --- 156mg/5ml (Amox 125mg + Clav 31.25mg) ---
	{
		id: 'augmentin-156mg-5ml-susp-80ml',
		name: 'augmentin 156 mg/5 ml susp. 80 ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '156mg/5ml',
		price: 99,
		matchKeywords: ['augmentin 156', 'أوجمنتين', '#penicillin', '#beta lactamase inhibitor', '#antibiotics'],
		usage: 'مضاد حيوي لالتهاب الأذن الوسطى/الحلق/الجيوب الأنفية/المسالك البولية.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 3,
		maxAgeMonths: 72,
		minWeight: 5,
		maxWeight: 20,
		calculationRule: (w) => {
			// 125mg amox/5ml = 25mg/ml. Dose: 25 mg/kg/dose = 1 ml/kg
			const doseMl = roundVol(w * 1);
			const doseMgAmox = Math.round(doseMl * 25);
			return `${toAr(doseMl)} مل كل ٨ ساعات مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	{
		id: 'e-moxclav-156mg-5ml-susp-60ml',
		name: 'e-moxclav 156mg/5ml susp. 60ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '156mg/5ml',
		price: 36,
		matchKeywords: ['e-moxclav', 'إي موكسكلاف', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي لالتهاب الأذن الوسطى/الحلق/الجيوب الأنفية/المسالك البولية.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 3,
		maxAgeMonths: 72,
		minWeight: 5,
		maxWeight: 20,
		calculationRule: (w) => {
			const doseMl = roundVol(w * 1);
			const doseMgAmox = Math.round(doseMl * 25);
			return `${toAr(doseMl)} مل كل ٨ ساعات مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	// --- 228mg/5ml (Amox 200mg + Clav 28.5mg) ---
	{
		id: 'augmentin-duo-228mg-5ml-susp-70ml',
		name: 'augmentin duo 228mg/5ml susp. 70 ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '228mg/5ml',
		price: 107,
		matchKeywords: ['augmentin duo', 'أوجمنتين ديو', '#penicillin', '#beta lactamase inhibitor', '#antibiotics'],
		usage: 'مضاد حيوي (جرعة مرتين يومياً) لالتهاب الأذن/الحلق/الجيوب.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 3,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w) => {
			// 200mg amox/5ml = 40mg/ml. Dose: 25-45 mg/kg/dose (twice daily) = 0.625-1.125 ml/kg
			const doseMl = roundVol(w * 0.75);
			const doseMgAmox = Math.round(doseMl * 40);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	{
		id: 'megamox-228mg-susp-70ml',
		name: 'megamox 228mg susp. 70ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '228mg/5ml',
		price: 70,
		matchKeywords: ['megamox', 'ميجاموكس', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي (جرعة مرتين يومياً) لالتهاب الأذن/الحلق/الجيوب.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 3,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w) => {
			const doseMl = roundVol(w * 0.75);
			const doseMgAmox = Math.round(doseMl * 40);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	{
		id: 'klavox-228mg-5ml-susp-70ml',
		name: 'klavox 228mg/5ml susp. 70ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '228mg/5ml',
		price: 39.75,
		matchKeywords: ['klavox', 'كلافوكس', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي (جرعة مرتين يومياً) لالتهاب الأذن/الحلق/الجيوب.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 3,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w) => {
			const doseMl = roundVol(w * 0.75);
			const doseMgAmox = Math.round(doseMl * 40);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	{
		id: 'augram-228.5mg-5ml-susp-60ml',
		name: 'augram 228.5mg/5ml pd. for oral suspension 60 ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '228.5mg/5ml',
		price: 67,
		matchKeywords: ['augram', 'أوجرام', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي (جرعة مرتين يومياً) لالتهاب الأذن/الحلق/الجيوب.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 3,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w) => {
			const doseMl = roundVol(w * 0.75);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	// --- 312.5mg/5ml (Amox 250mg + Clav 62.5mg) ---
	{
		id: 'curam-312.5mg-5ml-susp-75ml',
		name: 'curam 312.5 mg/5ml pd. for oral susp. 75ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '312.5mg/5ml',
		price: 82,
		matchKeywords: ['curam 312', 'كيورام', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي (جرعة ثلاث مرات يومياً) لالتهاب الأذن/الحلق/الجيوب/المسالك.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 24,
		maxAgeMonths: 144,
		minWeight: 10,
		maxWeight: 40,
		calculationRule: (w) => {
			// 250mg amox/5ml. Dose: 25-30 mg/kg/dose = 0.5-0.6 ml/kg
			const doseMl = roundVol(w * 0.5);
			return `${toAr(doseMl)} مل كل ٨ ساعات مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	// --- 457mg/5ml (Amox 400mg + Clav 57mg) - High Dose ---
	{
		id: 'curam-457mg-5ml-susp-70ml',
		name: 'curam 457mg/5ml pd. for oral susp. 70ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '457mg/5ml',
		price: 97,
		matchKeywords: ['curam 457', 'كيورام', 'high dose', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي جرعة عالية (جرعة مرتين يومياً) لالتهاب الأذن/الحلق المتكرر/المقاوم.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 24,
		maxAgeMonths: 144,
		minWeight: 10,
		maxWeight: 40,
		calculationRule: (w) => {
			// 400mg amox/5ml. Dose: 45 mg/kg/dose (twice daily) = 0.5625 ml/kg
			const doseMl = roundVol(w * 0.56);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: ['جرعة عالية—للحالات المقاومة أو الالتهابات الشديدة.', ...AMOXICILLIN_WARNINGS]
	},
	// --- 642.9mg/5ml (Amox 600mg + Clav 42.9mg) - ES Formula ---
	{
		id: 'curam-642.9mg-5ml-susp-75ml',
		name: 'curam 642.9mg/5ml pd. for oral susp. 75ml',
		genericName: 'amoxicillin & clavulanic acid',
		concentration: '642.9mg/5ml',
		price: 113,
		matchKeywords: ['curam es', 'كيورام اي اس', 'high dose', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي عالي التركيز ES (جرعة مرتين يومياً) لالتهاب الأذن/الحلق الشديد/المقاوم.',
		timing: 'كل ١٢ ساعة – ١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 24,
		maxAgeMonths: 144,
		minWeight: 10,
		maxWeight: 45,
		calculationRule: (w) => {
			// 600mg amox/5ml. Dose: 45 mg/kg/dose (twice daily) = 0.375 ml/kg
			const doseMl = roundVol(w * 0.375);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: ['تركيبة ES عالية جداً—للحالات الشديدة أو الالتهابات المقاومة فقط.', ...AMOXICILLIN_WARNINGS]
	},
	// ==========================================
	// SULTAMICILLIN (Ampicillin + Sulbactam prodrug)
	// Pediatric: 25-50 mg/kg/day ÷ 2 doses
	// ==========================================
	{
		id: 'unictam-250mg-5ml-susp-60ml',
		name: 'unictam 250mg/5ml susp. 60ml',
		genericName: 'sultamicillin',
		concentration: '250mg/5ml',
		price: 71,
		matchKeywords: ['unictam', 'يونيكتام', 'sultamicillin', 'سلتاميسيللين', '#penicillin', '#beta lactamase inhibitor'],
		usage: 'مضاد حيوي (جرعة مرتين يومياً) لالتهاب الأذن/الحلق/الجهاز التنفسي.',
		timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 6,
		maxAgeMonths: 144,
		minWeight: 5,
		maxWeight: 40,
		calculationRule: (w) => {
			// Dose: 25 mg/kg/dose twice daily = 0.5 ml/kg
			const doseMl = roundVol(w * 0.5);
			return `${toAr(doseMl)} مل كل ١٢ ساعة مع الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	// ==========================================
	// AMOXICILLIN (Plain)
	// Pediatric: 25-50 mg/kg/day ÷ 2-3 doses
	// ==========================================
	{
		id: 'e-mox-125mg-5ml-susp-60ml',
		name: 'e-mox 125mg/5ml susp. 60ml',
		genericName: 'amoxicillin',
		concentration: '125mg/5ml',
		price: 30,
		matchKeywords: ['e-mox 125', 'إي موكس', 'amoxicillin', 'أموكسيسيللين', '#penicillin'],
		usage: 'أموكسيسيللين (جرعة ثلاث مرات يومياً) لالتهاب الأذن/الحلق/الجهاز التنفسي.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 1,
		maxAgeMonths: 72,
		minWeight: 3,
		maxWeight: 20,
		calculationRule: (w) => {
			// 125mg/5ml = 25mg/ml. Dose: 25 mg/kg/dose = 1 ml/kg
			const doseMl = roundVol(w * 1);
			return `${toAr(doseMl)} مل كل ٨ ساعات مع أو بدون الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	{
		id: 'ibiamox-200mg-5ml-susp-80ml',
		name: 'ibiamox 200mg/5ml susp. 80ml',
		genericName: 'amoxicillin',
		concentration: '200mg/5ml',
		price: 16,
		matchKeywords: ['ibiamox', 'إيبياموكس', 'amoxicillin', '#penicillin'],
		usage: 'أموكسيسيللين (جرعة ثلاث مرات يومياً) لالتهاب الأذن/الحلق/الجهاز التنفسي.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 1,
		maxAgeMonths: 96,
		minWeight: 3,
		maxWeight: 25,
		calculationRule: (w) => {
			// 200mg/5ml = 40mg/ml. Dose: 25-30 mg/kg/dose = 0.625-0.75 ml/kg
			const doseMl = roundVol(w * 0.7);
			return `${toAr(doseMl)} مل كل ٨ ساعات مع أو بدون الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	{
		id: 'e-mox-250mg-5ml-susp-80ml',
		name: 'e-mox 250mg/5ml susp. 80ml',
		genericName: 'amoxicillin',
		concentration: '250mg/5ml',
		price: 38,
		matchKeywords: ['e-mox 250', 'إي موكس', '#penicillin'],
		usage: 'أموكسيسيللين (جرعة ثلاث مرات يومياً) لالتهاب الأذن/الحلق/الجهاز التنفسي.',
		timing: 'كل ٨ ساعات – ٧–١٠ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 12,
		maxAgeMonths: 144,
		minWeight: 8,
		maxWeight: 40,
		calculationRule: (w) => {
			// 250mg/5ml = 50mg/ml. Dose: 25-30 mg/kg/dose = 0.5-0.6 ml/kg
			const doseMl = roundVol(w * 0.55);
			return `${toAr(doseMl)} مل كل ٨ ساعات مع أو بدون الأكل لمدة ٧–١٠ أيام (رُج قبل الجرعة)`;
		},
		warnings: AMOXICILLIN_WARNINGS
	},
	// ==========================================
	// NIFUROXAZIDE (Intestinal Antiseptic)
	// Pediatric: 10-15 mg/kg/day ÷ 2-3 doses. Max 5 days.
	// ==========================================
	{
		id: 'diax-220mg-5ml-susp-60ml',
		name: 'diax 220mg/5ml 60ml susp.',
		genericName: 'nifuroxazide',
		concentration: '220mg/5ml',
		price: 32,
		matchKeywords: ['diax', 'دياكس', 'nifuroxazide', 'نيفوروكسازيد', 'diarrhea', 'إسهال', '#diarrhea'],
		usage: 'مطهر معوي نيفوروكسازيد للإسهال البكتيري (يعمل موضعياً بالأمعاء—آمن جداً للأطفال).',
		timing: 'كل ٨ ساعات – ٣–٥ أيام',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 2,
		maxAgeMonths: 144,
		minWeight: 4,
		maxWeight: 40,
		calculationRule: (w) => {
			// 220mg/5ml = 44mg/ml. Age-based dosing is more common:
			// 2-6 months: 2.5ml x 2-3/day
			// 6m-6y: 5ml x 3/day
			// >6y: 5-10ml x 3/day
			if (w < 8) {
				return `٢٫٥ مل كل ٨–١٢ ساعة مع أو بدون الأكل لمدة ٣–٥ أيام (رُج قبل الجرعة)`;
			} else if (w < 20) {
				return `٥ مل كل ٨ ساعات مع أو بدون الأكل لمدة ٣–٥ أيام (رُج قبل الجرعة)`;
			}
			return `٥–١٠ مل كل ٨ ساعات مع أو بدون الأكل لمدة ٣–٥ أيام (رُج قبل الجرعة)`;
		},
		warnings: NIFUROXAZIDE_WARNINGS
	},
	// ==========================================
	// PROBIOTIC (Bacillus clausii)
	// ==========================================
	{
		id: 'enterogermina-4billion-5ml-susp-10mini',
		name: 'enterogermina 4 billion/5ml oral susp. 10 mini bottles',
		genericName: 'spores of poly-antibiotic resistant b. clausii',
		concentration: '4 billion/5ml',
		price: 200,
		matchKeywords: ['enterogermina', 'إنتروجيرمينا', 'probiotic', 'بروبيوتيك', 'diarrhea', 'إسهال', '#diarrhea'],
		usage: 'بروبيوتيك لحماية الأمعاء من إسهال المضادات الحيوية واستعادة البكتيريا النافعة.',
		timing: '١–٣ مرات يومياً – ٧–١٤ يوم',
		category: Category.ANTIBIOTIC_SUSPENSIONS,
		form: 'Suspension',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: (w) => {
			if (w < 15) {
				return `زجاجة ٥ مل مرة أو مرتين يومياً مع أو بدون الأكل لمدة ٧–١٤ يوم (بفاصل ٢ ساعة عن المضاد الحيوي)`;
			}
			return `زجاجة ٥ مل ٢–٣ مرات يومياً مع أو بدون الأكل لمدة ٧–١٤ يوم (بفاصل ٢ ساعة عن المضاد الحيوي)`;
		},
		warnings: ['يُستخدم مع المضادات الحيوية—لا بدل عنها.', 'فاصل ٢ ساعة قبل/بعد المضاد الحيوي ضروري.', 'آمن تماماً للأطفال والرضع والحوامل.', 'احفظه في درجة حرارة الغرفة (٢٥°م).']
	},
];
