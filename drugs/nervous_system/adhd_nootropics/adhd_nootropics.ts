
import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;
const fixed = (text: string) => (_w: number, _a: number) => text;

const atomoxetineRule = (opts?: { mgPerMl?: number }) => (weightKg: number, ageMonths: number): string => {
	const ageYears = ageMonths / 12;
	const isAdultLike = weightKg >= 70;

	const startMg = isAdultLike ? 40 : 0.5 * weightKg;
	const targetMg = isAdultLike ? 80 : 1.2 * weightKg;
	const maxMg = isAdultLike ? 100 : Math.min(1.4 * weightKg, 100);

	const mgPerMl = opts?.mgPerMl;
	const startMl = mgPerMl ? roundVol(startMg / mgPerMl) : null;
	const targetMl = mgPerMl ? roundVol(targetMg / mgPerMl) : null;
	const maxMl = mgPerMl ? roundVol(maxMg / mgPerMl) : null;

	const base = [
		`Atomoxetine (ADHD):`,
		`- يُستخدم عادة من عمر ٦ سنوات فأكثر؛ أقل من ذلك يحتاج تقييم متخصص. (العمر الحالي ≈ ${toAr(ageYears.toFixed(1))} سنة)`,
		isAdultLike
			? `- وزن ≥٧٠ كجم: بداية ${toAr(startMg.toFixed(0))} مجم/يوم ثم بعد ≥٣ أيام إلى ${toAr(targetMg.toFixed(0))} مجم/يوم. الحد الأقصى ${toAr(maxMg.toFixed(0))} مجم/يوم.`
			: `- وزن <٧٠ كجم: بداية ${toAr(startMg.toFixed(0))} مجم/يوم (~٠٫٥ مجم/كجم/يوم) ثم بعد ≥٧ أيام إلى ${toAr(targetMg.toFixed(0))} مجم/يوم (~١٫٢ مجم/كجم/يوم). الحد الأقصى ${toAr(maxMg.toFixed(0))} مجم/يوم (حتى ١٫٤ مجم/كجم/يوم وبحد أقصى ١٠٠ مجم).`,
		`- يمكن إعطاء الجرعة مرة يومياً صباحاً أو تقسيمها مرتين يومياً إذا سببت أعراضاً.`,
	];

	if (mgPerMl && startMl != null && targetMl != null && maxMl != null) {
		base.push(`- تركيز الشراب ${toAr(mgPerMl)} مجم/مل: بداية ≈ ${toAr(startMl)} مل/يوم، هدف ≈ ${toAr(targetMl)} مل/يوم، حد أقصى ≈ ${toAr(maxMl)} مل/يوم.`);
	}

	return base.join('\n');
};

export const ADHD_NOOTROPICS_DRUGS: Medication[] = [
	// 1) bravamax 200mg 10 tab
	{
		id: 'bravamax-200-10-tabs-adhd',
		name: 'bravamax 200mg 10 tab',
		genericName: 'modafinil',
		concentration: '200mg',
		price: 122,
		matchKeywords: [
			'bravamax', 'bravamax 200', 'modafinil',
			'wakefulness', 'sleepiness', 'narcolepsy', 'shift work', 'focus',
			'برافاماكس', 'مودافينيل', 'تركيز', 'نعاس', 'نوم قهري',
			'#mind booster', '#focus', '#adhd'
		],
		usage: 'مودافينيل لزيادة اليقظة وتحسين الانتباه عند حالات مختارة (يُفضل بوصفة وتقييم مناسب).',
		timing: 'مرة يومياً صباحاً – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة للبالغين: ١٠٠–٢٠٠ مجم صباحاً. يمكن الزيادة حتى ٤٠٠ مجم/يوم حسب الاستجابة والتحمل. تجنب الجرعة المتأخرة لتقليل الأرق.'),
		warnings: ['قد يسبب أرق/صداع/قلق.', 'يُحذر مع اضطرابات القلب/ارتفاع ضغط غير منضبط.', 'نادر: طفح جلدي شديد—أوقفه واطلب رعاية عاجلة عند طفح واسع/تورم/ضيق تنفس.'],
	},

	// 2) atomorelax 20mg/5ml syrup 100 ml
	{
		id: 'atomorelax-20mg-5ml-100ml-syr-adhd',
		name: 'atomorelax 20mg/5ml syrup 100 ml',
		genericName: 'atomoxetine',
		concentration: '20mg/5ml',
		price: 128,
		matchKeywords: [
			'atomorelax', 'atomorelax syrup', 'atomoxetine syrup', 'atomoxetine 20/5',
			'adhd', 'attention deficit', 'hyperactivity', 'inattention',
			'اتوموريلاكس', 'أتوموكسيتين', 'فرط الحركة', 'تشتت الانتباه',
			'#attention deficit hyperactivity disorder'
		],
		usage: 'أتوموكسيتين لعلاج اضطراب فرط الحركة وتشتت الانتباه (ADHD).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Syrup',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule({ mgPerMl: 4 }),
		warnings: ['قد يسبب فقدان شهية/ألم بطن/غثيان.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية خاصة بالبداية أو عند تغيير الجرعة.'],
	},

	// 3) am ginko 30 tab
	{
		id: 'am-ginko-30-tabs-adhd',
		name: 'am ginko 30 tab',
		genericName: 'ginkgo biloba & lecithin & choline & vitamin b complex & vitamin d3 & folic acid',
		concentration: 'N/A',
		price: 300,
		matchKeywords: [
			'am ginko', 'ginkgo', 'ginkgo biloba', 'lecithin', 'choline', 'b complex', 'folic',
			'memory', 'focus', 'attention',
			'ام جينكو', 'جينكو', 'ذاكرة', 'تركيز',
			'#brain nootropic', '#memory', '#focus'
		],
		usage: 'مكملات لدعم الذاكرة والتركيز (جينكو + كولين/ليسيثين + فيتامينات).',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: قرص واحد يومياً بعد الأكل. يمكن قرصين/يوم حسب التحمل.'),
		warnings: ['قد يزيد سيولة الدم (جينكو)؛ يُحذر مع الأسبرين/وارفارين/كلوبيدوجريل أو قبل العمليات.', 'قد يسبب اضطراب معدة/صداع.'],
	},

	// 4) yonatone 200mg 30 tab.
	{
		id: 'yonatone-200-30-tabs-adhd',
		name: 'yonatone 200mg 30 tab.',
		genericName: 'sulbutiamine',
		concentration: '200mg',
		price: 18,
		matchKeywords: [
			'yonatone', 'yonatone 200', 'sulbutiamine', 'thiamine derivative',
			'fatigue', 'focus', 'brain',
			'يوناتون', 'سلبوتيامين', 'إجهاد', 'تركيز',
			'#nootropics', '#mind booster'
		],
		usage: 'سلبوتيامين لدعم النشاط الذهني وتقليل الإحساس بالإجهاد عند بعض الحالات.',
		timing: 'مرة–مرتين يومياً صباحاً/ظهراً مع الأكل – ٢–٤ أسابيع',
		category: Category.ADHD_NOOTROPICS,
		form: 'Tablet',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٢٠٠ مجم مرة إلى مرتين يومياً. تجنب أخذه متأخراً لتقليل الأرق.'),
		warnings: ['قد يسبب أرق/عصبية عند بعض الأشخاص.', 'يُحذر مع اضطرابات القلق الشديدة.'],
	},

	// 5) atomoxapex 25mg 30 caps.
	{
		id: 'atomoxapex-25-30-caps-adhd',
		name: 'atomoxapex 25mg 30 caps.',
		genericName: 'atomoxetine',
		concentration: '25mg',
		price: 252,
		matchKeywords: ['atomoxapex 25', 'atomoxetine 25', 'adhd', 'فرط الحركة', 'تشتت الانتباه', 'اتوموكسابكس', '#attention deficit hyperactivity disorder'],
		usage: 'أتوموكسيتين لعلاج ADHD (كبسولات).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule(),
		warnings: ['قد يسبب فقدان شهية/ألم بطن.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية بالبداية.'],
	},

	// 6) atomoxapex 40mg 30 caps.
	{
		id: 'atomoxapex-40-30-caps-adhd',
		name: 'atomoxapex 40mg 30 caps.',
		genericName: 'atomoxetine',
		concentration: '40mg',
		price: 333,
		matchKeywords: ['atomoxapex 40', 'atomoxetine 40', 'adhd', 'اتوموكسابكس ٤٠', '#attention deficit hyperactivity disorder'],
		usage: 'أتوموكسيتين لعلاج ADHD (كبسولات).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule(),
		warnings: ['قد يسبب فقدان شهية/ألم بطن.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية بالبداية.'],
	},

	// 7) atomoxapex 18mg 30 caps.
	{
		id: 'atomoxapex-18-30-caps-adhd',
		name: 'atomoxapex 18mg 30 caps.',
		genericName: 'atomoxetine',
		concentration: '18mg',
		price: 171,
		matchKeywords: ['atomoxapex 18', 'atomoxetine 18', 'adhd', 'اتوموكسابكس ١٨', '#attention deficit hyperactivity disorder'],
		usage: 'أتوموكسيتين لعلاج ADHD (جرعات بداية شائعة للأطفال حسب الوزن).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule(),
		warnings: ['قد يسبب فقدان شهية/ألم بطن.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية بالبداية.'],
	},

	// 8) atomoxapex 4mg/ml syrup 100 ml
	{
		id: 'atomoxapex-4mgml-100ml-syr-adhd',
		name: 'atomoxapex 4mg/ml syrup 100 ml',
		genericName: 'atomoxetine',
		concentration: '4mg/ml',
		price: 120,
		matchKeywords: ['atomoxapex syrup', 'atomoxapex 4mg/ml', 'atomoxetine 4mg/ml', 'adhd', 'اتوموكسابكس شراب', '#attention deficit hyperactivity disorder'],
		usage: 'أتوموكسيتين شراب لعلاج ADHD (مفيد لضبط جرعات الأطفال حسب الوزن).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Syrup',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule({ mgPerMl: 4 }),
		warnings: ['قد يسبب فقدان شهية/ألم بطن.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية بالبداية.'],
	},

	// 9) memontix 60 caps.
	{
		id: 'memontix-60-caps-adhd',
		name: 'memontix 60 caps.',
		genericName: 'spearmint ext.',
		concentration: 'N/A',
		price: 475,
		matchKeywords: ['memontix', 'spearmint extract', 'memory', 'focus', 'ميمونتكس', 'نعناع', 'ذاكرة', 'تركيز', '#brain nootropic', '#focus'],
		usage: 'مستخلص نعناع (Spearmint) كمكمل لدعم الانتباه/الذاكرة عند بعض الأشخاص.',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: كبسولة واحدة يومياً بعد الأكل.'),
		warnings: ['قد يسبب اضطراب معدة/حرقة عند بعض الأشخاص.', 'يُحذر عند وجود حساسية لأي مكوّن.'],
	},

	// 10) memocito 120 ml syrup
	{
		id: 'memocito-120ml-syr-adhd',
		name: 'memocito 120 ml syrup',
		genericName: 'citicoline & omega 3 & ginko biloba & l carnitine & vitamin d & selenium & zinc & vitamin e',
		concentration: '120ml',
		price: 450,
		matchKeywords: ['memocito', 'citicoline', 'omega 3', 'ginkgo', 'l-carnitine', 'memory', 'focus', 'ميموسيتو', 'سيتيكولين', 'أوميجا', 'جينكو', 'تركيز', '#brain nootropic', '#memory', '#attention', '#focus'],
		usage: 'شراب مكمل لدعم الذاكرة والتركيز (سيتيكولين + أوميجا + جينكو + كارنيتين + معادن/فيتامينات).',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Syrup',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 12,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٥ مل مرة إلى مرتين يومياً بعد الأكل.'),
		warnings: ['يُحذر مع أدوية السيولة (بسبب الجينكو).', 'قد يسبب اضطراب معدة.'],
	},

	// 11) modasomil 200 mg 30 tabs.
	{
		id: 'modasomil-200-30-tabs-adhd',
		name: 'modasomil 200 mg 30 tabs.',
		genericName: 'modafinil',
		concentration: '200mg',
		price: 240,
		matchKeywords: ['modasomil', 'modasomil 200', 'modafinil 200', 'wakefulness', 'focus', 'موداسوميل', 'مودافينيل', 'تركيز', '#mind booster'],
		usage: 'مودافينيل لزيادة اليقظة وتحسين الانتباه عند حالات مختارة.',
		timing: 'مرة يومياً صباحاً – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Tablet',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ١٠٠–٢٠٠ مجم صباحاً. يمكن الزيادة حتى ٤٠٠ مجم/يوم حسب التحمل. تجنب الجرعة المتأخرة.'),
		warnings: ['قد يسبب أرق/صداع/قلق.', 'يُحذر مع أمراض القلب/الضغط.', 'قد يتداخل مع وسائل منع الحمل الهرمونية.'],
	},

	// 12) medipha mega 100 ml syrup
	{
		id: 'medipha-mega-100ml-syr-adhd',
		name: 'medipha mega 100 ml syrup',
		genericName: 'omga3 & citicolin & ginko biloba & multi vit',
		concentration: '100ml',
		price: 280,
		matchKeywords: ['medipha mega', 'omega 3', 'citicoline', 'ginkgo', 'multi vitamin', 'memory', 'attention', 'focus', 'ميديفا ميجا', 'ذاكرة', 'تركيز', '#brain nootropic', '#memory', '#attention', '#focus'],
		usage: 'شراب مكمل لدعم الذاكرة والتركيز (أوميجا ٣ + سيتيكولين + جينكو + فيتامينات).',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Syrup',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 12,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٥ مل مرة إلى مرتين يومياً بعد الأكل.'),
		warnings: ['يُحذر مع أدوية السيولة (بسبب الجينكو).', 'قد يسبب اضطراب معدة/طعم سمكي (بسبب الأوميجا).'],
	},

	// 13) atomafutix 10 mg 30 caps.
	{
		id: 'atomafutix-10-30-caps-adhd',
		name: 'atomafutix 10 mg 30 caps.',
		genericName: 'atomoxetine',
		concentration: '10mg',
		price: 108,
		matchKeywords: ['atomafutix 10', 'atomoxetine 10', 'adhd', 'اتومافيوتيكس', 'فرط الحركة', '#attention deficit hyperactivity disorder'],
		usage: 'أتوموكسيتين لعلاج ADHD (جرعة بداية صغيرة).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule(),
		warnings: ['قد يسبب فقدان شهية/ألم بطن.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية بالبداية.'],
	},

	// 14) atomafutix 25 mg 30 caps.
	{
		id: 'atomafutix-25-30-caps-adhd',
		name: 'atomafutix 25 mg 30 caps.',
		genericName: 'atomoxetine',
		concentration: '25mg',
		price: 201,
		matchKeywords: ['atomafutix 25', 'atomoxetine 25', 'adhd', 'اتومافيوتيكس ٢٥', '#attention deficit hyperactivity disorder'],
		usage: 'أتوموكسيتين لعلاج ADHD (كبسولات).',
		timing: 'مرة صباحاً أو مرتين صباحاً ومساءً مع الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Capsule',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: atomoxetineRule(),
		warnings: ['قد يسبب فقدان شهية/ألم بطن.', 'راقب ضغط الدم والنبض.', 'راقب المزاج/أفكار انتحارية بالبداية.'],
	},

	// 15) brinomega syrup 120 ml
	{
		id: 'brinomega-120ml-syr-adhd',
		name: 'brinomega syrup 120 ml',
		genericName: 'omega 3 & omega 6 & vitamin e & thyme oil',
		concentration: '120ml',
		price: 129,
		matchKeywords: ['brinomega', 'omega 3', 'omega 6', 'vitamin e', 'thyme oil', 'antioxidant', 'brain', 'focus', 'برينوميجا', 'أوميجا', 'مضادات أكسدة', '#brain nootropic', '#antioxidants', '#focus'],
		usage: 'مكمل أوميجا ٣/٦ مع فيتامين E وزيت الزعتر لدعم الدماغ ومضادات الأكسدة.',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Syrup',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٥ مل مرة يومياً بعد الأكل. يمكن ٥ مل مرتين يومياً عند البالغين.'),
		warnings: ['قد يسبب ارتجاع/طعم سمكي.', 'يُحذر مع أدوية السيولة بجرعات أوميجا عالية.'],
	},

	// 16) carnicolin 250ml oral suspension
	{
		id: 'carnicolin-250ml-oral-susp-adhd',
		name: 'carnicolin 250ml oral suspension',
		genericName: 'citicoline & l-carnitine & co-enzyme q10',
		concentration: '250ml',
		price: 450,
		matchKeywords: ['carnicolin', 'citicoline', 'l-carnitine', 'coenzyme q10', 'nootropic', 'memory', 'focus', 'كارنيكولين', 'سيتيكولين', 'كارنيتين', 'كوإنزيم كيو10', '#brain nootropic', '#memory', '#focus'],
		usage: 'معلق فموي مكمل لدعم الطاقة الذهنية والذاكرة (سيتيكولين + كارنيتين + CoQ10).',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Oral Suspension',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 12,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٥ مل مرة إلى مرتين يومياً بعد الأكل.'),
		warnings: ['قد يسبب اضطراب معدة.', 'يُحذر عند وجود حساسية لأي مكوّن.'],
	},

	// 17) citotriple 120ml syrup
	{
		id: 'citotriple-120ml-syr-adhd',
		name: 'citotriple 120ml syrup',
		genericName: 'citocolin & omega 3 & ginkobioloba & vitamin e',
		concentration: '120ml',
		price: 375,
		matchKeywords: ['citotriple', 'citicoline', 'omega 3', 'ginkgo', 'vitamin e', 'memory', 'attention', 'focus', 'سيتوتريبل', 'سيتيكولين', 'ذاكرة', 'تركيز', '#brain nootropic', '#memory', '#attention', '#focus'],
		usage: 'شراب مكمل لدعم الذاكرة والتركيز (سيتيكولين + أوميجا ٣ + جينكو + فيتامين E).',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Syrup',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 12,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٥ مل مرة إلى مرتين يومياً بعد الأكل.'),
		warnings: ['يُحذر مع أدوية السيولة (جينكو).', 'قد يسبب اضطراب معدة/طعم سمكي.'],
	},

	// 18) carnicolin 60ml oral suspension
	{
		id: 'carnicolin-60ml-oral-susp-adhd',
		name: 'carnicolin 60ml oral suspension',
		genericName: 'citicoline & l-carnitine & coenzyme q10',
		concentration: '60ml',
		price: 150,
		matchKeywords: ['carnicolin 60', 'citicoline', 'l-carnitine', 'coenzyme q10', 'كارنيكولين ٦٠', 'سيتيكولين', 'كارنيتين', '#brain nootropic', '#focus'],
		usage: 'معلق فموي مكمل لدعم الطاقة الذهنية والتركيز (عبوة صغيرة).',
		timing: 'مرة–مرتين يومياً بعد الأكل – مزمن',
		category: Category.ADHD_NOOTROPICS,
		form: 'Oral Suspension',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 12,
		maxWeight: 250,
		calculationRule: fixed('جرعة شائعة: ٥ مل مرة إلى مرتين يومياً بعد الأكل.'),
		warnings: ['قد يسبب اضطراب معدة.', 'يُحذر عند وجود حساسية لأي مكوّن.'],
	},
];

