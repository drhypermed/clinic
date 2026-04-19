import { Medication, Category } from '../../types';

const fixed = (t: string) => () => t;

export const LINCOSAMIDES_GROUP: Medication[] = [
	// ==========================================
	// CLINDAMYCIN - ORAL CAPSULES
	// ==========================================
	{
		id: 'dalacin-c-300mg-10-caps',
		name: 'dalacin c 300mg 10 caps.',
		genericName: 'clindamycin',
		concentration: '300mg',
		price: 114,
		matchKeywords: ['dalacin', 'دالاسين', 'clindamycin', 'كليندامايسين', 'bone infection', 'dental', 'anaerobic', 'لاهوائي', 'abscess', 'خراج', 'osteomyelitis', 'التهاب العظام', 'pelvic', 'التهاب الحوض', '#antibiotics', '#lincomycins'],
		usage: 'كليندامايسين لالتهابات العظام/الأسنان/الجلد/التهابات الحوض.',
		timing: 'كل ٦–٨ ساعات مع كوب ماء – ٧–١٤ يوم',
		category: Category.LINCOSAMIDES,
		form: 'Capsules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('كبسولة (٣٠٠ مجم) كل ٦–٨ ساعات مع كوب ماء لمدة ٧–١٤ يوم'),
		warnings: ['قد يسبب إسهال شديد (Pseudomembranous colitis). توقف واستشر فوراً عند الإسهال الحاد.', 'ممنوع مع التهاب القولون.']
	},
	{
		id: 'clindam-150mg-16-caps',
		name: 'clindam 150 mg 16 caps.',
		genericName: 'clindamycin',
		concentration: '150mg',
		price: 28.5,
		matchKeywords: ['clindam', 'كلينداام', 'clindamycin', 'كليندامايسين', 'anaerobic', 'لاهوائي', 'abscess', 'خراج', 'dental', 'الأسنان', 'skin infection', 'التهاب الجلد', '#antibiotics', '#lincomycins'],
		usage: 'كليندامايسين لالتهابات الجلد/الأسنان/الجهاز التنفسي/العدوى اللاهوائية.',
		timing: 'كل ٦ ساعات مع كوب ماء – ٧–١٠ أيام',
		category: Category.LINCOSAMIDES,
		form: 'Capsules',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: (w) => {
			if (w < 40) {
				const doseMg = Math.round(w * 5);
				return `${doseMg} مجم (${Math.ceil(doseMg / 150)} كبسولة) كل ٦ ساعات مع كوب ماء لمدة ٧–١٠ أيام`;
			}
			return `١–٢ كبسولة (١٥٠–٣٠٠ مجم) كل ٦ ساعات مع كوب ماء لمدة ٧–١٠ أيام`;
		},
		warnings: ['قد يسبب إسهال شديد (Pseudomembranous colitis). توقف واستشر فوراً عند الإسهال الحاد.', 'ممنوع مع التهاب القولون.']
	},
	{
		id: 'clindam-300mg-16-caps',
		name: 'clindam 300 mg 16 caps.',
		genericName: 'clindamycin',
		concentration: '300mg',
		price: 75,
		matchKeywords: ['clindam 300', 'كلينداام', 'clindamycin', 'كليندامايسين', 'anaerobic', 'لاهوائي', 'abscess', 'خراج', 'bone infection', 'dental', 'osteomyelitis', 'التهاب العظام', '#antibiotics', '#lincomycins'],
		usage: 'كليندامايسين لالتهابات العظام/الأسنان/الجلد/التهابات الحوض.',
		timing: 'كل ٦–٨ ساعات مع كوب ماء – ٧–١٤ يوم',
		category: Category.LINCOSAMIDES,
		form: 'Capsules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('كبسولة (٣٠٠ مجم) كل ٦–٨ ساعات مع كوب ماء لمدة ٧–١٤ يوم'),
		warnings: ['قد يسبب إسهال شديد (Pseudomembranous colitis). توقف واستشر فوراً عند الإسهال الحاد.', 'ممنوع مع التهاب القولون.']
	},
	{
		id: 'clindacine-art-300mg-12-caps',
		name: 'clindacine art 300 mg 12 caps.',
		genericName: 'clindamycin',
		concentration: '300mg',
		price: 76,
		matchKeywords: ['clindacine', 'clindacine art', 'كلينداسين', 'clindamycin', 'كليندامايسين', 'anaerobic', 'لاهوائي', 'abscess', 'خراج', 'bone infection', 'dental', '#antibiotics', '#lincomycins'],
		usage: 'كليندامايسين لالتهابات العظام/الأسنان/الجلد/العدوى اللاهوائية.',
		timing: 'كل ٦–٨ ساعات مع كوب ماء – ٧–١٤ يوم',
		category: Category.LINCOSAMIDES,
		form: 'Capsules',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: fixed('كبسولة (٣٠٠ مجم) كل ٦–٨ ساعات مع كوب ماء لمدة ٧–١٤ يوم'),
		warnings: ['قد يسبب إسهال شديد (Pseudomembranous colitis). توقف واستشر فوراً عند الإسهال الحاد.', 'ممنوع مع التهاب القولون.']
	},
	// ==========================================
	// CLINDAMYCIN - INJECTION
	// ==========================================
	{
		id: 'alfaclindamycin-600mg-4ml-5-amp',
		name: 'alfaclindamycin 600mg/4ml 5 amp. i.v./i.m. inj.',
		genericName: 'clindamycin',
		concentration: '600mg/4ml',
		price: 295,
		matchKeywords: ['alfaclindamycin', 'ألفاكليندامايسين', 'clindamycin iv', 'clindamycin injection', 'كليندامايسين حقن', 'anaerobic', 'لاهوائي', 'abscess', 'خراج', 'osteomyelitis', 'التهاب العظام', 'sepsis', 'pelvic', 'التهاب الحوض', '#antibiotics', '#lincomycins'],
		usage: 'كليندامايسين حقن للعدوى الشديدة/العظام/الحوض/العدوى اللاهوائية.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٠ أيام',
		category: Category.LINCOSAMIDES,
		form: 'Ampoule',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: fixed('١٠ مجم/كجم/جرعة كل ٨ ساعات (أو ٦٠٠ مجم للبالغين) تسريب وريدي ٢٠–٣٠ دقيقة لمدة ٧–١٠ أيام'),
		warnings: ['لا يُحقن وريدي مباشر—يُخفف ويُعطى تسريب.', 'قد يسبب إسهال شديد (Pseudomembranous colitis). توقف واستشر فوراً.', 'ممنوع مع التهاب القولون.']
	},
	{
		id: 'dalacin-c-600mg-4ml-amp',
		name: 'dalacin c 600mg i.m./i.v. 4 ml amp.',
		genericName: 'clindamycin',
		concentration: '600mg/4ml',
		price: 148,
		matchKeywords: ['dalacin c injection', 'dalacin c iv', 'دالاسين حقن', 'clindamycin injection', 'كليندامايسين حقن', 'anaerobic', 'لاهوائي', 'abscess', 'خراج', 'osteomyelitis', 'التهاب العظام', 'pelvic', 'التهاب الحوض', '#antibiotics', '#lincomycins'],
		usage: 'كليندامايسين حقن للعدوى الشديدة/العظام/الحوض/العدوى اللاهوائية.',
		timing: 'كل ٨ ساعات تسريب وريدي – ٧–١٠ أيام',
		category: Category.LINCOSAMIDES,
		form: 'Ampoule',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: fixed('١٠ مجم/كجم/جرعة كل ٨ ساعات (أو ٦٠٠ مجم للبالغين) تسريب وريدي ٢٠–٣٠ دقيقة لمدة ٧–١٠ أيام'),
		warnings: ['لا يُحقن وريدي مباشر—يُخفف ويُعطى تسريب.', 'قد يسبب إسهال شديد (Pseudomembranous colitis). توقف واستشر فوراً.', 'ممنوع مع التهاب القولون.']
	},
	// ==========================================
	// CLINDAMYCIN - TOPICAL
	// ==========================================
	{
		id: 'xyclindo-1-topical-foam',
		name: 'xyclindo 1% topical foam',
		genericName: 'clindamycin',
		concentration: '1%',
		price: 79,
		matchKeywords: ['xyclindo', 'زايكليندو', 'acne', 'حب شباب', 'foam', 'clindamycin topical', 'كليندامايسين موضعي', '#antibiotics', '#lincomycins', '#anti acne'],
		usage: 'رغوة كليندامايسين الموضعية لعلاج حب الشباب.',
		timing: 'مرتين يومياً – ٦–٨ أسابيع',
		category: Category.LINCOSAMIDES,
		form: 'Foam',
		minAgeMonths: 144,
		maxAgeMonths: 600,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: fixed('كمية مناسبة على المناطق المصابة مرتين يومياً لمدة ٦–٨ أسابيع'),
		warnings: ['للاستخدام الخارجي فقط.', 'قد تسبب جفاف أو تهيج بسيط.']
	},
	{
		id: 'clindasol-1-topical-gel-20gm',
		name: 'clindasol 1% topical gel 20 gm',
		genericName: 'clindamycin',
		concentration: '1%',
		price: 26,
		matchKeywords: ['clindasol', 'كلينداسول', 'acne gel', 'جل حب شباب', '#antibiotics', '#lincomycins', '#anti acne'],
		usage: 'جل كليندامايسين الموضعي لعلاج حب الشباب.',
		timing: 'مرتين يومياً – ٦–٨ أسابيع',
		category: Category.LINCOSAMIDES,
		form: 'Gel',
		minAgeMonths: 144,
		maxAgeMonths: 600,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: fixed('طبقة رقيقة على المناطق المصابة مرتين يومياً لمدة ٦–٨ أسابيع'),
		warnings: ['للاستخدام الخارجي فقط.', 'تُجنب العينين والفم.']
	},
	{
		id: 'clindasol-0.3gm-30ml-topical-solution',
		name: 'clindasol 0.3gm/30ml topical solution 30 ml',
		genericName: 'clindamycin',
		concentration: '1%',
		price: 34,
		matchKeywords: ['clindasol solution', 'محلول كلينداسول', 'acne lotion', 'clindamycin topical', 'كليندامايسين موضعي', 'حب شباب', '#antibiotics', '#lincomycins', '#anti acne'],
		usage: 'محلول كليندامايسين الموضعي لعلاج حب الشباب.',
		timing: 'مرتين يومياً – ٦–٨ أسابيع',
		category: Category.LINCOSAMIDES,
		form: 'Solution',
		minAgeMonths: 144,
		maxAgeMonths: 600,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: fixed('يُدهن على المناطق المصابة مرتين يومياً لمدة ٦–٨ أسابيع'),
		warnings: ['للاستخدام الخارجي فقط.', 'قابل للاشتعال—يُبعد عن اللهب.']
	},
	// ==========================================
	// CLINDAMYCIN - VAGINAL CREAM
	// ==========================================
	{
		id: 'vagiclind-2-vaginal-cream-20gm',
		name: 'vagiclind 2% vaginal cream 20 gm',
		genericName: 'clindamycin',
		concentration: '2%',
		price: 52,
		matchKeywords: ['vagiclind', 'فاجيكليند', 'bacterial vaginosis', 'التهاب مهبلي', 'vaginosis', 'clindamycin vaginal', 'كليندامايسين مهبلي', 'إفرازات مهبلية', '#antibiotics', '#lincomycins'],
		usage: 'كريم مهبلي كليندامايسين لالتهاب المهبل البكتيري.',
		timing: 'مرة يومياً قبل النوم – ٣–٧ أيام',
		category: Category.LINCOSAMIDES,
		form: 'Cream',
		minAgeMonths: 216,
		maxAgeMonths: 720,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: fixed('أداة واحدة (٥ جم) داخل المهبل مرة يومياً قبل النوم لمدة ٣–٧ أيام'),
		warnings: ['يُضعف الواقي الذكري المطاطي.', 'تُجنب العلاقة أثناء العلاج.']
	},
	{
		id: 'vagiclind-2-vaginal-cream-40gm',
		name: 'vagiclind 2% vaginal cream 40 gm',
		genericName: 'clindamycin',
		concentration: '2%',
		price: 86,
		matchKeywords: ['vagiclind 40', 'فاجيكليند', 'bacterial vaginosis', 'التهاب مهبلي', 'vaginosis', 'clindamycin vaginal', 'كليندامايسين مهبلي', 'إفرازات مهبلية', '#antibiotics', '#lincomycins'],
		usage: 'كريم مهبلي كليندامايسين لالتهاب المهبل البكتيري.',
		timing: 'مرة يومياً قبل النوم – ٧ أيام',
		category: Category.LINCOSAMIDES,
		form: 'Cream',
		minAgeMonths: 216,
		maxAgeMonths: 720,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: fixed('أداة واحدة (٥ جم) داخل المهبل مرة يومياً قبل النوم لمدة ٧ أيام'),
		warnings: ['يُضعف الواقي الذكري المطاطي.', 'تُجنب العلاقة أثناء العلاج.']
	},
];
