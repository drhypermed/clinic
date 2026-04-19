import { Medication, Category } from '../../../types';

export const SACUBITRIL_VALSARTAN_MEDS: Medication[] = [
	// 1. Co-Tareg 160/12.5mg 28 tabs pack
	{
		id: 'tareg-160-tabs-28',
		name: 'Tareg 160mg 28 f.c. tab.',
		genericName: 'Valsartan',
		concentration: '160mg',
		price: 320,
		matchKeywords: [
			'arb', 'valsartan', 'tareg', 'heart failure', 'post-mi', 'hypertension',
			'تارج', 'فالسارتان', 'عضلة القلب', 'فشل قلبي', 'بعد الجلطة', 'ضغط مرتفع'
		],
		usage: 'علاج أساسي لقصور عضلة القلب (Heart Failure) ولحماية القلب بعد الجلطات، وعلاج ضغط الدم.',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			if (ageMonths >= 216) {
				return '١ قرص ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
			} else if (ageMonths >= 72) {
				return 'للأطفال (ضغط دم فقط): يتم حساب الجرعة بدقة حسب الوزن (١.٣ مجم/كجم) حسب التشخيص.';
			} else {
				return 'ممنوع للأطفال أقل من ٦ سنوات.';
			}
		},

		warnings: [
			'ممنوع تماماً أثناء الحمل (Category D).',
			'يجب قياس وظائف الكلى والبوتاسيوم قبل بدء العلاج وبعد أي زيادة في الجرعة.',
			'قد يسبب دواراً عند الوقوف المفاجئ (Orthostatic Hypotension).',
			'لا تستخدمه مع أدوية مثبطات الإنزيم المحول (ACE Inhibitors) لتجنب الفشل الكلوي.'
		]
	},

	// 2b. Tareg 160mg 14 tabs pack
	{
		id: 'tareg-160-tabs-14',
		name: 'Tareg 160mg 14 f.c. tab.',
		genericName: 'Valsartan',
		concentration: '160mg',
		price: 160,
		matchKeywords: [
			'arb', 'valsartan', 'tareg', 'heart failure', 'post-mi', 'hypertension',
			'تارج', 'فالسارتان', 'عضلة القلب', 'فشل قلبي', 'بعد الجلطة', 'ضغط مرتفع'
		],
		usage: 'علاج أساسي لقصور عضلة القلب (Heart Failure) ولحماية القلب بعد الجلطات، وعلاج ضغط الدم.',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			if (ageMonths >= 216) {
				return '١ قرص ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
			} else if (ageMonths >= 72) {
				return 'للأطفال (ضغط دم فقط): يتم حساب الجرعة بدقة حسب الوزن (١.٣ مجم/كجم) حسب التشخيص.';
			} else {
				return 'ممنوع للأطفال أقل من ٦ سنوات.';
			}
		},

		warnings: [
			'ممنوع تماماً أثناء الحمل (Category D).',
			'يجب قياس وظائف الكلى والبوتاسيوم قبل بدء العلاج وبعد أي زيادة في الجرعة.',
			'قد يسبب دواراً عند الوقوف المفاجئ (Orthostatic Hypotension).',
			'لا تستخدمه مع أدوية مثبطات الإنزيم المحول (ACE Inhibitors) لتجنب الفشل الكلوي.'
		]
	},

	// 3. Tareg 40mg 15 f.c.tab.
	{
		id: 'tareg-40-tabs',
		name: 'Tareg 40mg 15 f.c.tab.',
		genericName: 'Valsartan',
		concentration: '40mg',
		price: 150,
		matchKeywords: [
			'arb', 'valsartan', 'tareg', 'heart failure', 'starting dose',
			'تارج ٤٠', 'بداية العلاج', 'فشل القلب', 'ضعف العضلة'
		],
		usage: 'الجرعة الافتتاحية (Starting Dose) لمرضى قصور القلب والجلطات الحديثة لتعويد الجسم على الدواء.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 18,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٤٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},

		warnings: [
			'هذه جرعة صغيرة تمهيدية، لا توقف الدواء أو ترفعه من تلقاء نفسك.',
			'راقب ضغط الدم يومياً؛ إذا انخفض بشدة (أقل من ٩٠/٦٠) أعد التقييم فوراً.',
			'ممنوع للحوامل.'
		]
	},

	// 4. Tareg 80mg 14 f.c. tab.
	{
		id: 'tareg-80-tabs',
		name: 'Tareg 80mg 14 f.c. tab.',
		genericName: 'Valsartan',
		concentration: '80mg',
		price: 148,
		matchKeywords: [
			'arb', 'valsartan', 'tareg', 'maintenance', 'heart failure',
			'تارج ٨٠', 'ضغط', 'قلب', 'جرعة متوسطة'
		],
		usage: 'الجرعة المتوسطة لعلاج قصور القلب (بعد مرحلة الـ ٤٠ مجم) والجرعة المعتادة لعلاج ضغط الدم.',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٨٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},

		warnings: [
			'ممنوع للحوامل.',
			'يجب التأكد من عدم وجود جفاف قبل البدء في الدواء.',
			'أعد التقييم فوراً عند تورم الوجه أو الشفاه (تحسس نادر).'
		]
	},

	// 5. Co-Tareg 80/12.5mg 14 f.c.tab.
	{
		id: 'entresto-100-tabs',
		name: 'Entresto 100 mg (49/51 mg) 28 f.c. tabs.',
		genericName: 'Sacubitril + Valsartan',
		concentration: '49mg/51mg',
		price: 1700,
		matchKeywords: [
			'arni', 'entresto', 'sacubitril', 'heart failure', 'ef', 'hfref', 'reduced ejection fraction',
			'انتريستو', 'ساكوبتريل', 'فالسارتان', 'ضعف عضلة القلب', 'كفاءة القلب', 'نهجان', 'فشل قلب', 'ضعف القلب'
		],
		usage: 'الدواء الأحدث والأقوى لعلاج فشل عضلة القلب (HFrEF)؛ يقلل خطر الوفاة واحتجاز المستشفى بشكل كبير.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Sacubitril-valsartan floor
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٤٩/٥١ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},

		warnings: [
			'تحذير هام جداً: إذا كنت تتناول دواء من مجموعة ACE (مثل كابوتين، تريتاس)، يجب إيقافه والانتظار ٣٦ ساعة كاملة قبل تناول أول قرص انتريستو.',
			'ممنوع للحوامل (يسبب وفاة الجنين).',
			'يسبب انخفاضاً في الضغط؛ راقب الدوخة والهبوط.',
			'ممنوع لمرضى الفشل الكلوي الشديد أو الكبدي الشديد إلا بعد تقييم الدوال.'
		]
	},

	// 7. Entresto 50 mg (24/26 mg) 28 f.c. tabs.
	{
		id: 'entresto-50-tabs',
		name: 'Entresto 50 mg (24/26 mg) 28 f.c. tabs.',
		genericName: 'Sacubitril + Valsartan',
		concentration: '24mg/26mg',
		price: 1700,
		matchKeywords: [
			'arni', 'entresto', 'starting dose', 'heart failure',
			'انتريستو ٥٠', 'جرعة البداية', 'ضعف القلب'
		],
		usage: 'الجرعة الابتدائية (Starting Dose) لمرضى قصور القلب الذين لم يتناولوا مثبطات الإنزيم المحول من قبل، أو مرضى الكلى.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Sacubitril-valsartan floor
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٢٤/٢٦ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},

		warnings: [
			'تذكر قاعدة الـ ٣٦ ساعة: لا تجمعه مع (Captopril, Enalapril, Ramipril) أبداً.',
			'أعد التقييم عند طفح جلدي أو تورم (Angioedema).',
			'ممنوع للحوامل.'
		]
	},

	// 8. Targomash Comb 160/12.5mg 30 f.c. tabs.
	{
		id: 'targomash-comb-80-12.5',
		name: 'Targomash Comb 80/12.5mg 30 f.c.tab.',
		genericName: 'Valsartan + Hydrochlorothiazide',
		concentration: '80mg/12.5mg',
		price: 84,
		matchKeywords: [
			'antihypertensive', 'diuretic', 'valsartan', 'targomash', 'mild',
			'تارجوماش ٨٠', 'ضغط متوسط', 'مدر للبول'
		],
		usage: 'لعلاج ضغط الدم الأولي أو للمرضى كبار السن الذين لا يتحملون التركيزات العالية.',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٨٠/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},
		warnings: [
			'ممنوع للحوامل.',
			'راقب مستويات البوتاسيوم في الدم بشكل دوري.'
		]
	},

	// 10. Co-Tareg 160/25mg 15 f.c. tabs.
	{
		id: 'valsatens-plus-160-12.5',
		name: 'Valsatens plus 160/12.5 mg 30 tab',
		genericName: 'Valsartan + Hydrochlorothiazide',
		concentration: '160mg/12.5mg',
		price: 117,
		matchKeywords: ['valsatens', 'falsatens', 'فالساتنس', 'فالسارتان'],
		usage: 'دواء لعلاج ضغط الدم المرتفع (بديل محلي عالي الجودة).',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',
		minAgeMonths: 12, maxAgeMonths: 1200, minWeight: 50, maxWeight: 250,
		calculationRule: (w, a) => '١ قرص ١٦٠/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)',
		warnings: ['ممنوع للحوامل.', 'قد يسبب كثرة التبول في الساعات الأولى بعد تناوله.']
	},
	{
		id: 'vasotic-40-tabs',
		name: 'Vasotec 40 mg 14 scored f.c. tabs.',
		genericName: 'Valsartan',
		concentration: '40mg',
		price: 22,
		matchKeywords: [
			'arb', 'valsartan', 'vasotic', 'vasotec', 'heart failure', 'starting dose',
			'فازوتك', 'فازوتيك', 'فالسارتان', 'هبوط القلب', 'جرعة ابتدائية'
		],
		usage: 'الجرعة الافتتاحية لعلاج قصور عضلة القلب (Heart Failure) ولحماية القلب بعد الجلطات الحديثة.',
		timing: 'مرتين يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Scored Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 18,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٤٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},

		warnings: [
			'تنبيه: هذا الدواء هو "فالسارتان" وليس "إينالابريل" (تشابه أسماء تجارية).',
			'ممنوع للحوامل (يسبب تشوهات خطيرة).',
			'يجب متابعة ضغط الدم يومياً أثناء فترة ضبط الجرعة.'
		]
	},

	// 19. Vasotec (Vasotic) 160 mg 14 scored f.c. tabs.
	{
		id: 'vasotic-160-tabs',
		name: 'Vasotec 160 mg 14 scored f.c. tabs.',
		genericName: 'Valsartan',
		concentration: '160mg',
		price: 40,
		matchKeywords: [
			'arb', 'valsartan', 'vasotic', 'vasotec', 'hypertension', 'heart failure',
			'فازوتك ١٦٠', 'فالسارتان', 'ضغط مرتفع', 'عضلة القلب'
		],
		usage: 'الجرعة العلاجية الكاملة لضغط الدم المرتفع، أو الجرعة القصوى لعلاج قصور القلب.',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Scored Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 50,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			if (ageMonths >= 216) {
				return '١ قرص ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
			} else {
				return 'غير مفضل للأطفال بهذا التركيز العالي.';
			}
		},

		warnings: [
			'ممنوع للحوامل.',
			'يجب عمل فحص وظائف كلى وبوتاسيوم بشكل دوري.',
			'إذا شعرت بدوار شديد، تناول الجرعة ليلاً وأعد التقييم.'
		]
	},

	// 20. Targomash 80mg 30 f.c. tabs.
	{
		id: 'targomash-80-tabs',
		name: 'Targomash 80mg 30 f.c. tabs.',
		genericName: 'Valsartan',
		concentration: '80mg',
		price: 75,
		matchKeywords: [
			'arb', 'valsartan', 'targomash', 'hypertension', 'maintenance',
			'تارجوماش', 'فالسارتان', 'ضغط', 'بديل تارج'
		],
		usage: 'علاج أساسي لضغط الدم المرتفع، وجرعة متوسطة لعلاج قصور عضلة القلب.',
		timing: 'مرة يومياً – مزمن',
		category: Category.HEART_FAILURE,
		form: 'Film-coated Tablet',

		minAgeMonths: 12, // Valsartan floor
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,

		calculationRule: (weight, ageMonths) => {
			return '١ قرص ٨٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
		},

		warnings: [
			'ممنوع للحوامل.',
			'تجنب مكملات البوتاسيوم إلا بعد قياس البوتاسيوم وتقييم الحاجة.',
			'راجع تداخلات المريض (مسكنات NSAID) (مثل البروفين) لأنها تقلل مفعول الدواء.'
		]
	},

];

