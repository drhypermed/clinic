import { Medication, Category } from '../../types';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// ==========================
// TEXT SANITIZERS (patient-facing)
// ==========================

const normalizeSpaces = (s: string) =>
	s
		.replace(/\s+/g, ' ')
		.replace(/\s+([،.])/g, '$1')
		.replace(/([،.])\s*/g, '$1 ')
		.replace(/\s*—\s*/g, ' — ')
		.replace(/\s*:\s*/g, ': ')
		.trim();

const stripDoctorPhrases = (s: string) => {
	let t = s;
	t = t.replace(/تحت\s*إشراف\s*طبي(?:ب)?/g, '');
	t = t.replace(/دون\s+(?:إشراف|متابعة)\s+طبية?/g, '');
	t = t.replace(/(?:بعد\s+)?استشارة\s+طبية/g, '');
	t = t.replace(/استشر\s+الطبيب(?:ك)?/g, '');
	t = t.replace(/مراجعة\s+الطبيب/g, '');
	t = t.replace(/تقييم\s+طبي(?:\s+عاجل)?/g, '');
	t = t.replace(/يرجى\s+/g, '');
	t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات)\s+الطبيب/g, '');
	t = t.replace(/بوصفة\s+(?:طبيب(?:\s*(?:مختص|متخصص))?|طبيب\s*أطفال)/g, '');
	t = t.replace(/بقرار\s+طبي(?:ب)?/g, '');
	t = t.replace(/توجيه\s+طبي/g, '');
	t = t.replace(/أمر\s+الطبيب/g, '');
	t = t.replace(/يمكن\s+للطبيب\s+زيادت(?:ها|ه)\s+إلى/g, 'قد تُزاد إلى');
	t = t.replace(/يمكن\s+للطبيب\s+رفع(?:ها|ه)?\s+إلى/g, 'قد تُرفع إلى');
	t = t.replace(/يمكن\s+للطبيب\s+خفض(?:ها|ه)?\s+إلى/g, 'قد تُخفض إلى');
	t = t.replace(/في الحالات الشديدة\s+قد\s+يقرر\s+الطبيب/g, 'في الحالات الشديدة:');
	t = t.replace(/قد\s+يقرر\s+الطبيب/g, '');
	return normalizeSpaces(t);
};

const sanitizeDoseText = (s: string) => {
	let t = stripDoctorPhrases(s);
	t = t.replace(/^(?:يؤخذ|تؤخذ|يُؤخذ|تُؤخذ)\s+/g, '');
	t = t.replace(/^خذ\s+/g, '');
	t = t.replace(/^مضغ\s+أو\s+مص\s+/g, '');
	t = t.replace(/جرعتك\s+التقريبية\s+(?:هي\s+)?/g, '');
	t = t.replace(/\s+وتُ(?:حدد|حدَّد|عطى)\s+.*$/g, '');
	return normalizeSpaces(t);
};

const sanitizeTimingText = (s: string) => {
	let t = stripDoctorPhrases(s);
	t = t.replace(/،?\s*أو\s+حسب\s+تعليمات\s+الطبيب.*$/g, '');
	return normalizeSpaces(t);
};

const sanitizeWarnings = (warnings: string[]) =>
	warnings
		.map((w) => stripDoctorPhrases(w))
		.map((w) => normalizeSpaces(w))
		.filter((w) => w.length > 0);

const ACID_RELATED_DISORDERS_2_RAW: Medication[] = [
	// 71. Futapan 40mg Vial
	{
		id: 'futapan-40-vial',
		name: 'Futapan 40mg I.V. Vial',
		genericName: 'Pantoprazole',
		concentration: '40mg/vial',
		price: 59.5,
		matchKeywords: [
			'stomach', 'acidity', 'ulcer', 'futapan', 'pantoprazole', 'heartburn', 'gastritis', 'gerd', 'vial', 'injection',
			'فوتابان', 'حقن معدة', 'حموضة', 'قرحة معدة', 'ارتجاع مريء', 'حرقان صدر', 'بانتوبرازول', 'حقنة للترجيع'
		],
        usage: 'مثبط مضخة البروتون للسيطرة السريعة على الحمض في الارتجاع الحاد، قرحة المعدة/الاثني عشر، والوقاية أو العلاج الأولي للنزيف الهضمي العلوي.',
        timing: 'حقنة واحدة في الوريد مرة يومياً؛ في النزيف قد تبدأ بجرعة تحميل حسب بروتوكول المستشفى.',
		category: Category.ACID_RELATED_DISORDERS,
		form: 'Vial',

		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,

        calculationRule: (weight, ageMonths) => {
            if (ageMonths >= 216) {
                return `فيال واحد (٤٠ مجم) بالوريد مرة يومياً (صباحاً) — المدة: ٧–١٤ يوم`;
            }
            const doseMg = Math.round(clamp(weight * 0.8, 0, 40));
            return `${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم وريدياً مرة يومياً — المدة: حسب الحالة`;
        },

        warnings: [
            'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
            'للاستخدام الوريدي فقط—ممنوع الحقن في العضل أو تحت الجلد.',
            'يُستخدم في المستشفى مع مراقبة الحساسية أثناء الحقن.',
            'يُخفض الجرعة في القصور الكبدي الشديد—راجع التحاليل والدوال.',
            'انتقل للشكل الفموي بمجرد القدرة على البلع لتقليل مدة الحقن.'
        ]
	},

	// 72. Jeparilon 10mg
	{
		id: 'jeparilon-10-tabs',
		name: 'Jeparilon 10mg 20 Chewable Tablets',
		genericName: 'Domperidone',
		concentration: '10mg/tablet',
		price: 40,
		matchKeywords: [
			'nausea', 'vomiting', 'bloating', 'indigestion', 'jeparilon', 'domperidone', 'motility', 'chewable',
			'جيباريلون', 'ترجيع', 'غممان نفس', 'عسر هضم', 'انتفاخ', 'حركة المعدة', 'منظم للمعدة', 'برشام مضغ'
		],
        usage: 'محفز لحركة المعدة لتخفيف الغثيان والقيء الوظيفي والامتلاء المبكر؛ لا يُعد علاجاً للتسممات أو الانسداد.',
        timing: 'قبل الأكل بـ ١٥-٣٠ دقيقة، بحد أقصى ٧ أيام للاستخدام الذاتي المحدود.',
		category: Category.ACID_RELATED_DISORDERS,
		form: 'Chewable Tablets',

        minAgeMonths: 144,
        maxAgeMonths: 1200,
        minWeight: 35,
        maxWeight: 200,

        calculationRule: (weight, ageMonths) => {
            if (ageMonths >= 144 && weight >= 35) {
                return 'قرص واحد (١٠ مجم) ٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة (صباح/ظهيرة/مساء) — الحد الأقصى: ٣ أقراص/يوم لمدة لا تتجاوز ٧ أيام';
            }
            const doseMg = Math.round(clamp(weight * 0.25, 0, 10));
            return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم ٣ مرات يومياً — يُفضل استخدام الشراب للأطفال`;
        },

        warnings: [
            'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
            'ممنوع في انسداد/نزيف معدي أو تاريخ إطالة QT أو فشل كبدي متوسط-شديد.',
            'أوقف الدواء فوراً عند خفقان أو دوار شديد أو اضطراب نبض—اطلب مساعدة طبية.',
            'لا يُستخدم مع الماكروليدات (كلاريثروميسين/إريثرومايسين) أو مضادات الذهان أو مضادات اكتئاب تطيل QT.',
            'الحمل: يُتجنب في الثلث الأول—أعدي التقييم عند الضرورة.',
            'لا تتجاوز ٣٠ مجم/يوم—راقب الجرعة الكلية مع القصور الكلوي.'
        ]
	},

	// 73. Mucogel Suspension
	{
		id: 'mucogel-susp-180',
		name: 'Mucogel Oral Suspension 180ml',
		genericName: 'Magnesium Hydroxide & Aluminium Hydroxide',
		concentration: 'Mixed Suspension',
		price: 37,
		matchKeywords: [
			'heartburn', 'acidity', 'reflux', 'mucogel', 'antacid', 'indigestion', 'stomach burn',
			'موكوجيل', 'حموضة', 'حرقان الصدر', 'ارتجاع المريء', 'فوار حموضة', 'شراب للمعدة', 'عسر هضم'
		],
        usage: 'مضاد حموضة سريع لمعادلة الحمض وتخفيف الحرقان والامتلاء بعد الوجبات.',
        timing: 'بعد الأكل بساعة وعند اللزوم قبل النوم.',
		category: Category.ACID_RELATED_DISORDERS,
		form: 'Oral Suspension',

		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,

        calculationRule: (weight, ageMonths) => {
            if (ageMonths >= 144) {
                return '٥–١٠ مل (ملعقة صغيرة إلى كبيرة) بعد الأكل بساعة ثم عند النوم — بحد أقصى ٤ جرعات/يوم لمدة لا تتجاوز ١٤ يوم';
            }
            if (ageMonths >= 72 && ageMonths < 144) {
                return '٥ مل بعد الأكل وعند اللزوم — بحد أقصى ٣ جرعات/يوم';
            }
            return 'لا يستخدم تحت ٦ سنوات إلا بوصفة دقيقة لتجنّب تراكم الألومنيوم/المغنيسيوم.';
        },

        warnings: [
            'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
            'يُستخدم بحذر في القصور الكلوي لتجنب تراكم الألومنيوم/المغنيسيوم ونقص الفوسفات.',
            'تجنب الاستعمال المزمن—لا تتجاوز ١٤ يوم دون إعادة تقييم.',
            'أوقف الدواء وأعد التقييم إذا استمرت الأعراض أكثر من ١٤ يوم أو صاحبها قيء دموي/فقدان وزن.',
            'الحمل: آمن قصير المدى—أعدي التقييم عند الاستخدام المتكرر.'
        ]
	},

	// 74. Rennie
	{
		id: 'rennie-96-tabs',
		name: 'Rennie 96 Chewable Tablets',
		genericName: 'Calcium Carbonate & Magnesium Carbonate',
		concentration: '680mg / 80mg',
		price: 55,
		matchKeywords: [
			'heartburn', 'acidity', 'indigestion', 'rennie', 'chewable', 'stomach burn', 'gas',
			'ريني', 'حموضة', 'حرقان', 'عسر هضم', 'برشام مضغ للحموضة', 'حرقان معدة', 'غازات'
		],
        usage: 'مضاد حموضة سريع المفعول لعلاج الحرقان وعسر الهضم العابر.',
        timing: 'عند اللزوم بعد الأكل أو قبل النوم مع فصل الجرعات ساعتين على الأقل.',
		category: Category.ACID_RELATED_DISORDERS,
		form: 'Chewable Tablets',

		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 250,

        calculationRule: (weight, ageMonths) => {
            if (ageMonths >= 144) {
                return '١–٢ قرص للمضغ عند اللزوم (بعد الأكل أو قبل النوم) — يمكن تكرارها كل ٣ ساعات، بحد أقصى ١١ قرص/يوم لمدة لا تتجاوز ٧ أيام';
            }
            return 'لا يُستخدم تحت ١٢ سنة إلا بوصفة لتجنب زيادة الكالسيوم/المغنيسيوم.';
        },

        warnings: [
            'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
            'ممنوع في فرط كالسيوم الدم أو حصوات الكلى الكلسية أو القصور الكلوي المتقدم.',
            'قد يسبب إمساكاً أو تطبلاً عند الإفراط—لا تتجاوز ١١ قرص/يوم.',
            'إذا استمرت الأعراض أكثر من ٧ أيام أو صاحبها قيء/فقدان وزن، يلزم تقييم طبي.',
            'الحمل: آمن قصير المدى—تجنبي الإفراط لتفادي فرط كالسيوم الدم.'
        ]
	},

	// 75. Zomegipral 40mg Vial
	{
		id: 'zomegipral-40-vial',
		name: 'Zomegipral 40mg Powder for I.V. Infusion',
		genericName: 'Omeprazole',
		concentration: '40mg/vial',
		price: 48,
		matchKeywords: [
			'stomach', 'ulcer', 'acidity', 'zomegipral', 'omeprazole', 'gerd', 'vial', 'infusion', 'injection',
			'زوميجيبيرال', 'أوميبرازول', 'حقنة معدة', 'حموضة', 'قرحة', 'ارتجاع', 'حقن وريد'
		],
        usage: 'مثبط مضخة البروتون للسيطرة السريعة على الحمض في الارتجاع أو القرحة الحادة أو الوقاية من النزيف الهضمي عند عدم إمكانية الفم.',
        timing: 'مرة واحدة يومياً بالوريد؛ يقتصر على المستشفى حتى يتاح الشكل الفموي.',
		category: Category.ACID_RELATED_DISORDERS,
		form: 'Powder for I.V. Infusion Vial',

		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,

        calculationRule: (weight, ageMonths) => {
            if (ageMonths >= 216) {
                return `فيال واحد (٤٠ مجم) بالوريد مرة يومياً (صباحاً) — المدة: ٧–١٤ يوم`;
            }
            const doseMg = Math.round(clamp(weight * 1, 0, 40));
            return `${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم وريدياً مرة يومياً — المدة: حسب الحالة`;
        },

        warnings: [
            'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
            'للاستخدام الوريدي فقط—ممنوع الحقن في العضل أو تحت الجلد.',
            'يُستخدم في المستشفى مع مراقبة الحساسية أثناء الحقن.',
            'يُخفض الجرعة في القصور الكبدي الشديد—راجع التحاليل والدوال.',
            'انتقل للشكل الفموي بمجرد القدرة على البلع لتقليل مدة الحقن.',
            'الحمل: فئة C—يُستخدم عند الضرورة.'
        ]
  },    

// 76. Exeedogast 40mg
  {
    id: 'exeedogast-40-caps',
    name: 'Exeedogast 40mg 20 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Advanced Proton Pump Inhibitor)
    concentration: '40mg/capsule',
    price: 168, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'exeedogast', 'esomeprazole', 'gastritis', 'reflux',
        'اكسيدوجاست', 'ايسوميبرازول', 'حموضة شديدة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'كبسولات معدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع الشديد، التهاب المريء التآكلي، والقرح، والوقاية مع NSAIDs.',
    timing: 'مرة واحدة صباحاً قبل الأكل بـ ٣٠–٦٠ دقيقة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في خطة العلاج الثلاثي لجرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير مخصص لمن هم دون ١٨ سنة بتركيز ٤٠ مجم—استخدم ١٠–٢٠ مجم.';
    },

    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/فيتامين B12 أو يزيد خطر الكسور—راجع المتابعة الدورية.',
        'أعد التقييم عند صعوبة البلع أو فقدان الوزن أو قيء دموي أو ألم صدر.',
        'الحمل: فئة B—يُستخدم عند الضرورة.',
        'افصل ساعتين على الأقل عن الحديد/ليفوثيروكسين/كيتوكونازول.'
    ]
  },

// 77. Fulprazal 40mg
  {
    id: 'fulprazal-40-caps',
    name: 'Fulprazal 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor)
    concentration: '40mg/capsule',
    price: 118, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'fulprazal', 'esomeprazole', 'gastritis', 'reflux',
        'فولبرازال', 'ايسوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع، التهاب المريء التآكلي، والوقاية من قرحة NSAIDs.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير مخصص للأعمار أقل من ١٨ سنة بهذا التركيز—استخدم ١٠–٢٠ مجم.';
    },

    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'راقب المغنيسيوم وB12 مع العلاج الطويل—راجع تداخلات المريض وأعراضه.',
        'يُخفض الجرعة في القصور الكبدي الشديد—راجع التحاليل والدوال.',
        'اطلب تقييماً طبياً عند ألم بلع أو قيء دموي أو فقدان وزن غير مبرر.',
        'الحمل: فئة B—استخدم فقط عند الضرورة.',
        'افصل ساعتين على الأقل عن الحديد/ليفوثيروكسين/كيتوكونازول.'
    ]
  },

// 78. Futapan 40mg Tabs
  {
    id: 'futapan-40-tabs',
    name: 'Futapan 40mg 14 Enteric Coated Tablets',
    genericName: 'Pantoprazole', // [GREEN] Pantoprazole (Proton Pump Inhibitor)
    concentration: '40mg/tablet',
    price: 37.5, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'futapan', 'pantoprazole', 'gastritis', 'reflux',
        'فوتابان أقراص', 'بانتوبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة/الاثني عشر وحالات فرط الإفراز (مثل زولينجر إليسون).',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة (على معدة فارغة).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرص واحد (٤٠ مجم) صباحاً قبل الإفطار بـ ٣٠–٦٠ دقيقة — المدة: ٤–٨ أسابيع. في الحالات الشديدة: ٤٠ مجم مرتين يومياً (صباح/مساء) لفترة قصيرة.';
        }
        const doseMg = Math.round(clamp(weight * 1, 0, 40));
        return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — بحد أقصى ٤٠ مجم/يوم`;
    },

    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'راقب المغنيسيوم/B12 مع الاستعمال الطويل—راجع تداخلات المريض وأعراضه.',
        'حاذر في القصور الكبدي الشديد—راجع التحاليل والدوال.',
        'أعد التقييم إذا وُجد فقدان وزن، قيء دموي، أو صعوبة بلع.',
        'الحمل: فئة B—يُستخدم عند الضرورة.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 79. Bepra 20mg
  {
    id: 'bepra-20-tabs',
    name: 'Bepra 20mg 21 Film Coated Tablets',
    genericName: 'Rabeprazole', // [GREEN] Rabeprazole Sodium (Potent PPI)
    concentration: '20mg/tablet',
    price: 154.5, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'bepra', 'rabeprazole', 'pariet', 'reflux',
        'بيبرا', 'رابيبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان الصدر', 'علاج سريع للمعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة الاثني عشر ويُستخدم ٢٠ مجم مرتين يومياً في علاج جرثومة المعدة.',
    timing: 'صباحاً قبل الإفطار بـ ٣٠–٦٠ دقيقة (يفضل على معدة فارغة).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'قرص واحد (٢٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في علاج جرثومة المعدة: ٢٠ مجم مرتين يومياً (صباح/مساء) مع مضادين حيويين لمدة ١٠–١٤ يوماً.';
        }
        return 'غير موصى به لمن هم أقل من ١٨ سنة بهذا التركيز.';
    },

    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'راقب وظائف الكبد في القصور الشديد—راجع التحاليل والدوال.',
        'قد يسبب صداع/إسهال عابر في الأيام الأولى—يقل مع الاستمرار.',
        'أعد التقييم إذا لم تتحسن الأعراض خلال أسبوعين أو ظهرت أعراض إنذار (نقص وزن، قيء دموي).',
        'الحمل: فئة B—يُستخدم عند الضرورة.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 80. Nexicure 5mg Sachets
  {
    id: 'nexicure-5-sachets',
    name: 'Nexicure 5mg 28 Sachets',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor for Pediatric use)
    concentration: '5mg/sachet',
    price: 168, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'reflux', 'infant reflux', 'nexicure', 'esomeprazole', 'sachets',
        'نيكسيكيور', 'ايسوميبرازول', 'حموضة أطفال', 'ارتجاع مريء للرضع', 'أكياس معدة', 'حرقان', 'ارتجاع صامت'
    ],
    usage: 'حبيبات إيزوميبرازول للأطفال والرضع لعلاج الارتجاع والتهاب المريء التآكلي.',
    timing: 'على معدة فارغة قبل الرضاعة/الوجبة بـ ٣٠–٦٠ دقيقة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Sachets',
    
    minAgeMonths: 1,
    maxAgeMonths: 144,
    minWeight: 3.5,
    maxWeight: 40,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 1 && ageMonths < 12) {
            if (weight < 5) return 'كيس واحد (٥ مجم) مرة يومياً قبل الرضاعة بـ ٣٠–٦٠ دقيقة — المدة: حتى ٦ أسابيع';
            if (weight >= 5 && weight < 7.5) return 'كيس واحد (٥ مجم) مرة يومياً قبل الرضاعة بـ ٣٠–٦٠ دقيقة';
            if (weight >= 7.5 && weight <= 12) return 'كيسين (١٠ مجم) مرة يومياً قبل الرضاعة بـ ٣٠–٦٠ دقيقة';
        }
        if (ageMonths >= 12 && ageMonths <= 144) {
            if (weight < 10) return `١–٢ كيس (٥–١٠ مجم) مرة يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة`;
            if (weight >= 10 && weight < 20) return 'كيسين (١٠ مجم) مرة يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة';
            if (weight >= 20) return '٢–٤ أكياس (١٠–٢٠ مجم) مرة يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة';
        }
        return 'للرضع أقل من ١ شهر، يقتصر على المستشفى.';
    },

    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'أوقف الدواء عند إسهال شديد أو طفح—استشر طبيب الأطفال فوراً.',
        'لا تُعط الحبيبات عبر سرنجة ضيقة دون إذابة جيدة—يجب إذابتها كاملة في الماء.',
        'يجب الالتزام بالمدة التي يحددها طبيب الأطفال وعدم تجاوز الجرعة اليومية القصوى.',
        'افصل ساعتين على الأقل عن مضادات الحموضة السائلة أو الحديد.'
    ]
  },

// 81. Epicogel Suspension
  {
    id: 'epicogel-susp-180',
    name: 'Epicogel Oral Suspension 180ml',
    genericName: 'Aluminum Hydroxide, Magnesium Hydroxide & Simethicone', // [GREEN] Antacid and Antiflatulent Combination
    concentration: 'Mixed Suspension',
    price: 48, 
    matchKeywords: [
        'heartburn', 'acidity', 'bloating', 'gas', 'epicogel', 'antacid', 'indigestion', 'stomach pain',
        'ايبيكوجيل', 'حموضة', 'حرقان الصدر', 'انتفاخ', 'غازات', 'كركبة بطن', 'عسر هضم', 'شراب للمعدة'
    ],
    usage: 'مضاد حموضة مع طارد للغازات لتخفيف الحرقان والانتفاخ بعد الوجبات.',
    timing: 'يؤخذ بعد الأكل بساعة وعند اللزوم قبل النوم.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Suspension',
    
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '١٠ مل بعد الأكل بساعة ثم قبل النوم — حتى ٤ مرات يومياً عند اللزوم لمدة لا تتجاوز ١٤ يوم';
        } else if (ageMonths >= 72 && ageMonths < 144) {
            return '٥ مل بعد الأكل وعند اللزوم — بحد أقصى ٣ جرعات/يوم';
        }
        return 'لا يستخدم للأطفال دون ٦ سنوات إلا بوصفة دقيقة لتجنب تراكم الألومنيوم/المغنيسيوم.';
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'حذر في القصور الكلوي لتجنب تراكم الألومنيوم/المغنيسيوم ونقص الفوسفات—راجع التحاليل والدوال.',
        'لا يتجاوز ١٤ يوماً دون تقييم طبي—أعد التقييم عند الاستخدام المتكرر.',
        'أوقف الدواء واطلب تقييماً طبياً إذا ظهرت أعراض إنذار مثل قيء دموي أو فقدان وزن.',
        'الحمل: آمن قصير المدى—يُقيّم الحمل والفائدة/الخطر مع الاستخدام المتكرر.'
    ]
  },

// 82. Esmorap 40mg
  {
    id: 'esmorap-40-caps',
    name: 'Esmorap 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor)
    concentration: '40mg/capsule',
    price: 138, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'esmorap', 'esomeprazole', 'reflux', 'gastritis',
        'إسموراب', 'ايسوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'كبسولات معدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع التآكلي وقرحة المعدة/الاثني عشر وللوقاية مع المسكنات.',
    timing: 'يُتناول صباحاً قبل الأكل بـ ٣٠–٦٠ دقيقة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير مخصص لمن هم دون ١٨ سنة بهذا التركيز—استخدم ١٠–٢٠ مجم.';
    },

    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'راقب المغنيسيوم وB12 مع العلاج الطويل—راجع تداخلات المريض وأعراضه.',
        'يُخفض الجرعة في القصور الكبدي الشديد—راجع التحاليل والدوال.',
        'اطلب تقييماً طبياً عند أعراض إنذار (ألم بلع، نزيف هضمي، فقدان وزن).',
        'الحمل: فئة B—يُستخدم عند الضرورة فقط.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 83. Estohalt 40mg
  {
    id: 'estohalt-40-caps',
    name: 'Estohalt 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor)
    concentration: '40mg/capsule',
    price: 81, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'estohalt', 'esomeprazole', 'gastritis', 'reflux',
        'استوهالت', 'ايسوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة، ويُستخدم ضمن بروتوكول جرثومة المعدة مع المضادات الحيوية.',
    timing: 'على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في العلاج الثلاثي لجرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير مخصص للأطفال بهذا التركيز—استخدم ١٠–٢٠ مجم.';
    },

    warnings: [
        'الحمل: فئة B؛ يُستخدم عند الضرورة.',
        'تداخلات: قد يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/أتازانافير؛ يقل امتصاص الأدوية المعتمدة على الحموضة.',
        'تحذيرات خاصة: قد يسبب صداعاً أو دواراً بسيطاً أول الأيام؛ راقب المغنيسيوم/B12 مع الاستعمال الطويل.',
        'يجب تقييم طبي عاجل عند فقدان وزن غير مفسَّر أو قيء دموي أو ألم بلع.'
    ]
  },

// 84. Omepak 20mg
  {
    id: 'omepak-20-caps',
    name: 'Omepak 20mg 14 Capsules',
    genericName: 'Omeprazole', // [GREEN] Omeprazole (First-generation PPI)
    concentration: '20mg/capsule',
    price: 50, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'omepak', 'omeprazole', 'gastritis', 'stomach ache',
        'أوميباك', 'أوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة', 'كبسولات خضراء'
    ],
    usage: 'مثبط لمضخة البروتون لعلاج ارتجاع المريء وقرحة المعدة والاثني عشر، ويُستخدم ضمن بروتوكول جرثومة المعدة مع المضادات الحيوية.',
    timing: 'على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years (كبسولات يمكن بلعها)
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return 'كبسولة واحدة (٢٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٢٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        const doseMg = Math.round(clamp(weight * 1, 0, 20));
        return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — بحد أقصى ٢٠ مجم/يوم`;
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'الاستخدام الطويل قد يخفض المغنيسيوم وفيتامين B12—راقب مع الطبيب.',
        'أعد التقييم عند فقدان وزن غير مفسر أو صعوبة بلع أو قيء دموي.',
        'الحمل: يفضل استخدامه عند الضرورة.',
        'افصل ساعتين على الأقل بينه وبين مضادات الحموضة السائلة أو مكملات الحديد.'
    ]
  },

// 85. Gaviscon Double Action
  {
    id: 'gaviscon-double-action-150',
    name: 'Gaviscon Double Action Oral Suspension 150ml',
    genericName: 'Sodium Alginate, Calcium Carbonate & Sodium Bicarbonate', // [GREEN] Reflux Suppressant & Antacid
    concentration: 'Mixed Suspension',
    price: 144, 
    matchKeywords: [
        'heartburn', 'acidity', 'reflux', 'gaviscon', 'double action', 'indigestion', 'stomach burn',
        'جافيسكون', 'دبل اكشن', 'ارتجاع مريء', 'حموضة', 'حرقان الصدر', 'شراب للمعدة', 'عسر هضم'
    ],
    usage: 'معلق مزدوج المفعول: يعادل الحمض ويكوّن طبقة عائمة تحجز الحمض بعيداً عن المريء لتقليل الحرقان والارتجاع.',
    timing: 'بعد الوجبات الرئيسية وقبل النوم عند اللزوم.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Suspension',
    
    minAgeMonths: 72, // 6 years
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '١٠–٢٠ مل بعد الأكل مباشرة ثم قبل النوم — بحد أقصى ٤ جرعات يومياً لمدة لا تتجاوز ٧ أيام';
        }
        if (ageMonths >= 72) {
            return '٥–١٠ مل بعد الأكل مباشرة ثم قبل النوم — بحد أقصى ٤ جرعات يومياً';
        }
        return 'لا يستخدم تحت ٦ سنوات إلا حسب التشخيص والسن.';
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'يحتوي على صوديوم وكالسيوم—الحذر مع مرضى الضغط، القلب، الكلى، أو الحصوات الكلوية.',
        'إذا استمرت الأعراض أكثر من ٧ أيام أو صاحبها ألم صدر/قيء دموي، يلزم فحص طبي.',
        'افصل ساعتين على الأقل عن الأدوية الأخرى (مضادات حيوية، حديد، ليفوثيروكسين).',
        'الحمل: آمن غالباً عند الحاجة وبأقصر مدة—أعدي التقييم عند اللزوم.'
    ]
  },
  // 86. AIG Esomeprazole 40mg
  {
    id: 'aig-esomeprazole-40-caps',
    name: 'AIG Esomeprazole 40mg 28 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor)
    concentration: '40mg/capsule',
    price: 296, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'aig', 'esomeprazole', 'gastritis', 'reflux',
        'اي اي جي', 'ايسوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة شهر'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة والوقاية من قرحة المسكنات، بعبوة ٢٨ كبسولة تكفي شهر علاج.',
    timing: 'على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في العلاج الثلاثي لجرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير مخصص للأطفال بهذا التركيز—استخدم تركيزات ١٠–٢٠ مجم.';
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'راقب المغنيسيوم وB12 عند الاستخدام الطويل—راجع تداخلات المريض وأعراضه.',
        'قد يزيد خطر الكسور مع استعمال مزمن—راجع المتابعة الدورية.',
        'أعراض إنذار (فقدان وزن، قيء دموي، صعوبة بلع) تستدعي تقييماً طبياً سريعاً.',
        'الحمل: فئة B—يستخدم عند الضرورة.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 87. Bepra 20mg (14 Tabs)
  {
    id: 'bepra-20-14-tabs',
    name: 'Bepra 20mg 14 Film Coated Tablets',
    genericName: 'Rabeprazole', // [GREEN] Rabeprazole Sodium (Potent PPI)
    concentration: '20mg/tablet',
    price: 103, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'bepra', 'rabeprazole', 'pariet', 'reflux',
        'بيبرا', 'رابيبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان سريع', 'بيبرا ١٤'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة والاثني عشر، ويمكن استخدامه مع العلاج الثلاثي لجرثومة المعدة.',
    timing: 'يفضل صباحاً قبل الإفطار بـ ٣٠ دقيقة؛ يمكن تناوله قبل أي وجبة إذا لزم.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return 'قرص واحد (٢٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٢٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير موصى به دون ١٢ سنة.';
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'الحذر في القصور الكبدي—راجع التحاليل والدوال.',
        'راقب المغنيسيوم وفيتامين B12 مع الاستعمال الطويل—راجع تداخلات المريض وأعراضه.',
        'أعراض إنذار مثل فقدان وزن أو نزيف تستوجب تقييم طبي.',
        'الحمل: يفضل تجنبه إلا للضرورة.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 88. Esmorap 40mg (28 Caps)
  {
    id: 'esmorap-40-28-caps',
    name: 'Esmorap 40mg 28 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor)
    concentration: '40mg/capsule',
    price: 276, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'esmorap', 'esomeprazole', 'reflux', 'gastritis',
        'إسموراب ٢٨', 'ايسوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة شهر'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة والوقاية من قرحة المسكنات، بعبوة تكفي شهراً.',
    timing: 'على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً مفضل).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'غير مخصص للأطفال بتركيز ٤٠ مجم—استخدم تركيزات أقل.';
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'راقب المغنيسيوم/B12 مع الاستخدام الطويل—راجع تداخلات المريض وأعراضه.',
        'خطر كسور مع استعمال مزمن—راجع المتابعة الدورية.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تتطلب مراجعة عاجلة.',
        'الحمل: فئة B—يستخدم عند الحاجة.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 89. Megaprazole 40mg Vial
  {
    id: 'megaprazole-40-vial',
    name: 'Megaprazole 40mg Powder for I.V. Infusion',
    genericName: 'Omeprazole', // [GREEN] Omeprazole (Proton Pump Inhibitor)
    concentration: '40mg/vial',
    price: 53, 
    matchKeywords: [
        'stomach', 'ulcer', 'acidity', 'megaprazole', 'omeprazole', 'gerd', 'vial', 'infusion', 'injection',
        'ميجا برازول', 'أوميبرازول', 'حقنة معدة', 'حقنة حموضة', 'قرحة', 'ارتجاع', 'حقن وريد'
    ],
    usage: 'مثبط مضخة البروتون للحقن الوريدي في حالات الحموضة/القرحة الشديدة أو عدم القدرة على البلع.',
    timing: 'جرعة وريدية يومية داخل منشأة صحية.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 216, // جرعات الأطفال تُحسب بالمستشفى فقط
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return `فيال واحد (٤٠ مجم) بالوريد مرة يومياً (صباحاً) — المدة: ٧–١٤ يوم`;
        }
        const doseMg = Math.round(clamp(weight * 1, 0, 40));
        return `${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم وريدياً مرة يومياً — بحد أقصى ٤٠ مجم/يوم`;
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'للاستخدام الوريدي فقط—ممنوع الحقن في العضل أو تحت الجلد.',
        'لا يخلط مع أدوية أخرى في نفس المحلول.',
        'الحذر في القصور الكبدي—راجع التحاليل والدوال.',
        'راقب تفاعلات الحساسية أثناء الحقن.',
        'يُوقف عند تحسن المريض ويُحوّل سريعاً لجرعات فموية.'
    ]
  },

// 90. Nexicure 20mg Tabs
  {
    id: 'nexicure-20-tabs',
    name: 'Nexicure 20mg 14 Film Coated Tablets',
    genericName: 'Esomeprazole', // [GREEN] Esomeprazole (Proton Pump Inhibitor)
    concentration: '20mg/tablet',
    price: 64, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'nexicure', 'esomeprazole', 'gastritis', 'reflux',
        'نيكسيكيور ٢٠', 'ايسوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'علاج المعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع البسيط والمتوسط، وللوقاية من قرحة المسكنات.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً مفضل).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return 'قرص واحد (٢٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٢٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'للأطفال تحت ١٢ سنة يفضل أكياس تركيز أقل.';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم وB12 إذا استُخدم طويلاً؛ أعد التقييم عند فقدان وزن أو نزيف.',
        'إذا لم تتحسن الأعراض خلال ٢–٤ أسابيع يلزم فحص طبي.'
    ]
  },

// 91. Omepak 20mg (7 Caps)
  {
    id: 'omepak-20-7-caps',
    name: 'Omepak 20mg 7 Capsules',
    genericName: 'Omeprazole', // [GREEN] Omeprazole (First-generation PPI)
    concentration: '20mg/capsule',
    price: 19.8, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'omepak', 'omeprazole', 'gastritis', 'reflux',
        'أوميباك ٧', 'أوميبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'شريط معدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة في كورس قصير لمدة أسبوع.',
    timing: 'على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return 'كبسولة واحدة (٢٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٧ أيام';
        }
        const doseMg = Math.round(clamp(weight * 1, 0, 20));
        return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — بحد أقصى ٢٠ مجم/يوم`;
    },
    
    warnings: [
        'حساسية: أوقف الدواء واطلب مساعدة إذا ظهر طفح شديد/تورم/ضيق نفس.',
        'لا يُستمر عليه دون تقييم إذا استمرت الأعراض—أعد التقييم.',
        'راقب نقص المغنيسيوم/B12 مع الاستعمال المتكرر—راجع تداخلات المريض وأعراضه.',
        'أعراض إنذار مثل نزيف أو فقدان وزن تستوجب مراجعة طبية.',
        'الحمل: يفضل عند الضرورة.',
        'افصل ساعتين على الأقل عن الحديد/كيتوكونازول.'
    ]
  },

// 92. Omez 10mg
  {
    id: 'omez-10-caps',
    name: 'Omez 10mg 14 Capsules',
    genericName: 'Omeprazole', // [GREEN] Omeprazole (Low dose PPI)
    concentration: '10mg/capsule',
    price: 40, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'omez', 'omeprazole', 'gastritis', 'maintenance',
        'أوميز ١٠', 'أوميبرازول', 'حموضة خفيفة', 'ارتجاع مريء', 'قرحة معدة', 'حرقان', 'جرعة وقائية'
    ],
    usage: 'جرعة منخفضة من الأوميبرازول للارتجاع الخفيف أو كجرعة وقائية بعد الشفاء.',
    timing: 'على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً مفضل).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Omeprazole 10mg
        if (ageMonths >= 144) { 
            return 'قرص واحد (١٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. يمكن زيادتها إلى ٢٠ مجم يومياً إذا لم تكف الجرعة المنخفضة.';
        }
        const doseMg = Math.round(clamp(weight * 1, 0, 20));
        return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — بحد أقصى ٢٠ مجم/يوم`;
    },
    
    warnings: [
        'يفضل تقييم دوري عند الاستخدام الطويل حتى مع الجرعات الصغيرة (مغنيسيوم، B12).',
        'يفصل ساعتان عن الحديد أو الكيتوكونازول أو ليفوثيروكسين لتحسين امتصاصها.',
        'الحذر في القصور الكبدي؛ قد يلزم ضبط الجرعة.',
        'إذا استمرت الأعراض لأكثر من أسبوعين أعد التقييم.'
    ]
  },
  // 93. Peptic Care Triple Therapy (REVISED)
  {
    id: 'peptic-care-triple-therapy',
    name: 'Peptic Care 28 Enteric Coated Tablets (Triple Therapy)',
    genericName: 'Pantoprazole, Clarithromycin & Tinidazole', // [GREEN] Triple Therapy for H. Pylori (Germ Eradication)
    concentration: '40mg / 500mg / 500mg',
    price: 170, 
    matchKeywords: [
        'h. pylori', 'stomach germ', 'triple therapy', 'peptic care', 'ulcer', 'gastritis',
        'ببتيك كير', 'علاج ثلاثي', 'جرثومة المعدة', 'ميكروب حلزوني', 'بانتوبرازول', 'كلاريثرومايسين', 'تينيدازول'
    ],
    usage: 'كورس ثلاثي للقضاء على جرثومة المعدة (بانتوبرازول ٤٠ + كلاريثرومايسين ٥٠٠ + تينيدازول ٥٠٠) وعلاج القرحة المرتبطة بها.',
    timing: 'مرتان يومياً قبل الأكل بساعة (صباحاً ومساءً) لمدة ١٤ يوماً.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Standard Triple Therapy Dose
        if (ageMonths >= 216) { 
            return '٣ أقراص معاً (قرص من كل نوع/لون) مرتين يومياً قبل الأكل بساعة لمدة ١٤ يوماً (يحتاج المريض علبتين للكورس الكامل).';
        }
        return 'غير مخصص للأطفال أو المراهقين.';
    },
    
    warnings: [
        'يُمنع الكحول أثناء العلاج وبعده بـ ٣ أيام بسبب التينيدازول.',
        'كلاريثرومايسين قد يطيل QT؛ الحذر مع أدوية نظم القلب أو المرضى بقصور كبدي/قلبي.',
        'قد يتفاعل مع الوارفارين، الستاتينات، وبعض أدوية المناعة؛ راجع تداخلات المريض.',
        'الحمل/الرضاعة: غير موصى به؛ يجب استشارة طبيب مختص.',
        'أوقف العلاج واطلب المساعدة الطبية عند ظهور طفح جلدي شديد أو ضيق تنفس.'
    ]
  },

// 94. Rennie Chewable Tablets
  {
    id: 'rennie-24-tabs',
    name: 'Rennie 24 Chewable Tablets',
    genericName: 'Calcium Carbonate & Magnesium Carbonate', // [GREEN] Antacid (Local Acting)
    concentration: '680mg / 80mg',
    price: 56, 
    matchKeywords: [
        'heartburn', 'acidity', 'indigestion', 'rennie', 'stomach burn', 'chewable',
        'ريني', 'أقراص مضغ', 'حموضة', 'حرقان الصدر', 'حرقان المعدة', 'عسر هضم', 'سريع المفعول'
    ],
    usage: 'مضاد حموضة سريع يحتوي على كربونات الكالسيوم والماغنسيوم لتخفيف الحرقان وعسر الهضم.',
    timing: 'يمضغ عند اللزوم بعد الأكل أو قبل النوم.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Rennie Chewable Tablets
        if (ageMonths >= 144) { 
            return '١–٢ قرص عند اللزوم بعد الأكل أو قبل النوم، بحد أقصى ١١ قرص/يوم.';
        }
        return 'لا يستخدم للأطفال دون ١٢ سنة إلا بوصفة طبية.';
    },
    
    warnings: [
        'تجنب استخدامه المتكرر لأكثر من ١٤ يوماً دون تقييم طبي.',
        'الحذر في القصور الكلوي أو تاريخ الحصوات الكلوية أو فرط كالسيوم الدم.',
        'افصل ساعتين على الأقل عن المضادات الحيوية، الحديد، ليفوثيروكسين.',
        'يُستخدم في الحمل والرضاعة عند الحاجة وبأقصر مدة.'
    ]
  },

// 95. Antopral 20mg
  {
    id: 'antopral-20-tabs',
    name: 'Antopral 20mg 14 Tablets',
    genericName: 'Pantoprazole', // [GREEN] Pantoprazole (Proton Pump Inhibitor)
    concentration: '20mg/tablet',
    price: 88, 
    matchKeywords: [
        'heartburn', 'acidity', 'gerd', 'ulcer', 'antopral', 'pantoprazole', 'gastritis', 'stomach protection',
        'أنتوبرال ٢٠', 'بانتوبرازول', 'حموضة', 'ارتجاع مريء', 'قرحة معدة', 'حماية معدة', 'حرقان'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع البسيط والوقاية من قرحة المسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Pantoprazole 20mg
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار؛ يمكن زيادتها إلى ٤٠ مجم حسب استجابة الحالة والتشخيص.';
        }
        return 'للأطفال الأصغر تُحسب الجرعة حسب التشخيص والوزن باستخدام تركيزات مناسبة.';
    },
    
    warnings: [
        'البانتوبرازول أقل تداخلاً مع كلوبيدوجريل لكنه يلزم مراجعة التداخلات.',
        'الاستخدام الطويل قد يؤدي لانخفاض المغنيسيوم أو B12؛ راقب عند العلاج المزمن.',
        'الحذر في القصور الكبدي الشديد؛ قد يلزم خفض الجرعة.',
        'أعد التقييم إذا لم تتحسن الأعراض خلال أسبوعين.'
    ]
  },
  // 96. Ekiroz 40 mg
  {
    id: 'ekiroz-40-mg',
    name: 'Ekiroz 40mg 14 Gastro-Resistant Tablets',
    genericName: 'Pantoprazole', // [GREEN] Pure Pantoprazole (Proton Pump Inhibitor)
    concentration: '40mg',
    price: 82, 
    matchKeywords: [
        'heartburn', 'gerd', 'stomach ulcer', 'pantoprazole', 'ekiroz', 'acid reflux', 'peptic ulcer',
        'إيكيروز', 'بانتوبرازول', 'حموضة', 'حرقان معدة', 'ارتجاع مريء', 'قرحة معدة', 'التهاب جدار المعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة والاثني عشر ومتلازمة زولينجر-إليسون.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Gastro-Resistant Tablets',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Pantoprazole 40mg
        if (ageMonths >= 216) {
            return 'قرص واحد (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. قد تُرفع الجرعة إلى ٤٠ مجم مرتين يومياً (صباح/مساء) لفترة قصيرة.';
        }
        return 'تركيز ٤٠ مجم غير مخصص للأطفال إلا بجرعات معتمدة وتعديل حسب التحاليل.';
    },
    
    warnings: [
        'تداخلات دوائية قليلة نسبياً مع كلوبيدوجريل؛ راجع تداخلات المريض.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 وربما يزيد خطر الكسور؛ المتابعة مطلوبة.',
        'الحذر في القصور الكبدي الشديد.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تتطلب تقييماً سريعاً.'
    ]
  },

// 97. Fastcure 40mg
  {
    id: 'fastcure-40-mg',
    name: 'Fastcure 40mg 14 Capsules',
    genericName: 'Omeprazole', // [GREEN] Pure Omeprazole
    concentration: '40mg',
    price: 84, 
    matchKeywords: [
        'heartburn', 'gerd', 'stomach ulcer', 'omeprazole', 'fastcure', 'acid reflux', 'peptic ulcer',
        'فاست كيور', 'أوميبرازول', 'حموضة', 'حرقان معدة', 'ارتجاع مريء', 'قرحة معدة', 'كبسولات حموضة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة والتهاب المريء التآكلي.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Omeprazole 40mg
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في الحالات الشديدة: ٤٠ مجم مرتين يومياً (صباح/مساء) لفترة قصيرة.';
        }
        return 'لا يُستخدم للأطفال بهذا التركيز إلا داخل خطة طبية خاصة.';
    },
    
    warnings: [
        'يفصل ساعتان عن الحديد، كيتوكونازول، ليفوثيروكسين لتحسين الامتصاص.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12؛ راقب إذا كان العلاج ممتداً.',
        'الحذر في أمراض الكبد؛ قد يلزم ضبط الجرعة.',
        'إذا استمرت الأعراض أكثر من أسبوعين يجب تقييم طبي.'
    ]
  },

// 98. Gastroloc 40mg
  {
    id: 'gastroloc-40-mg',
    name: 'Gastroloc 40mg 20 Capsules',
    genericName: 'Omeprazole', // [GREEN] Pure Omeprazole
    concentration: '40mg',
    price: 79, 
    matchKeywords: [
        'heartburn', 'gerd', 'stomach ulcer', 'omeprazole', 'gastroloc', 'acid reflux', 'peptic ulcer',
        'جاسترولوك', 'أوميبرازول', 'حموضة', 'حرقان معدة', 'ارتجاع مريء', 'قرحة معدة', 'كبسولات المعدة'
    ],
    usage: 'مثبط مضخة البروتون لعلاج الارتجاع وقرحة المعدة والوقاية من قرحة المسكنات.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً مفضل).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Omeprazole 40mg
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في الحالات الشديدة: ٤٠ مجم مرتين يومياً (صباح/مساء).';
        }
        return 'تركيز ٤٠ مجم غير مناسب للأطفال—استخدم تركيزات أقل.';
    },
    
    warnings: [
        'قد يقلل فاعلية كلوبيدوجريل؛ استشر طبيب القلب عند الاستخدام المتزامن.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 ويزيد خطر الكسور؛ المتابعة مطلوبة.',
        'الحذر في القصور الكلوي أو الكبدي الشديد.',
        'يلزم فحص طبي إذا استمرت الأعراض أكثر من أسبوعين أو ظهرت أعراض إنذار.'
    ]
  },

// 99. Ardoximag 40mg
  {
    id: 'ardoximag-40-mg',
    name: 'Ardoximag 40mg 14 Gastro-Resistant Tablets',
    genericName: 'Esomeprazole', // [GREEN] Pure Esomeprazole (S-isomer of Omeprazole)
    concentration: '40mg',
    price: 106, 
    matchKeywords: [
        'heartburn', 'gerd', 'stomach ulcer', 'esomeprazole', 'ardoximag', 'acid reflux', 'gastritis',
        'أردوكزيماج', 'إيسوميبرازول', 'حموضة', 'حرقان معدة', 'ارتجاع مريء', 'قرحة معدة', 'جرثومة المعدة'
    ],
    usage: 'مثبط مضخة البروتون (إيسوميبرازول) لعلاج الارتجاع الشديد، والوقاية من قرحة المسكنات، واستخدامه ضمن علاج جرثومة المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً مفضل).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Gastro-Resistant Tablets',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 40mg
        if (ageMonths >= 144) {
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في علاج جرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'تركيز ٤٠ مجم غير مفضل دون ١٢ سنة؛ استخدم تركيزات أقل بجرعات معتمدة للعمر.';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الحاجة.',
        'تداخلات: قد يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم/B12 مع الاستخدام الطويل؛ الحذر في القصور الكلوي/القلبي عند استعمال ديجوكسين.',
        'يلزم تقييم طبي عند استمرار الأعراض أو ظهور نزيف/فقدان وزن.'
    ]
  },


  // 100. Protolans 60 mg
  {
    id: 'protolans-60-cap',
    name: 'Protolans 60mg 14 Capsules',
    genericName: 'Dexlansoprazole', // [GREEN] Dual Delayed Release PPI
    concentration: '60mg',
    price: 137, 
    matchKeywords: [
        'acid reflux', 'heartburn', 'gerd', 'stomach ulcer', 'protolans', 'dexlansoprazole', 'acidity',
        'بروتولانز', 'ارتجاع المريء', 'حموضة', 'حرقان الصدر', 'قرحة المعدة', 'ديكسلانزوبرازول', 'علاج المعدة'
    ],
    usage: 'مثبط مضخة بروتون بتقنية إطلاق مزدوج لعلاج الارتجاع الشديد والتهاب المريء التآكلي والحموضة المزمنة بمدة تغطية ٢٤ ساعة.',
    timing: 'يمكن تناوله مع الطعام أو بدونه؛ يفضل تثبيت موعد يومي (غالباً قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        // [GREEN] Dose for Dexlansoprazole 60mg
        if (ageMonths >= 144) {
            return '٦٠ مجم مرة يومياً لمدة ٤–٨ أسابيع لالتهاب المريء التآكلي أو الارتجاع الشديد.';
        }
        return 'هذا التركيز غير مخصص لمن هم دون ١٢ سنة؛ يمكن اللجوء لـ ٣٠ مجم بوصفة متخصصة.';
    },
    
    warnings: [
        'بيانات الحمل محدودة؛ يُستخدم عند الضرورة.',
        'قد يقلل امتصاص أدوية تعتمد على الحموضة؛ افصل ساعتين عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'الحذر مع الميثوتركسات عالي الجرعة وبعض مضادات الفطريات/مضادات الفيروسات؛ يلزم مراجعة التداخلات.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو يزيد خطر الكسور؛ المتابعة مطلوبة.',
        'إذا استمرت الأعراض رغم العلاج المنتظم، راجع أخصائي جهاز هضمي.'
    ]
  },

    // 101. Nexium 20 mg
  {
    id: 'nexium-20-tab',
    name: 'Nexium 20mg 28 Film-Coated Tablets',
    genericName: 'Esomeprazole', // [GREEN] S-isomer of Omeprazole
    concentration: '20mg',
    price: 332, 
    matchKeywords: [
        'nexium', 'esomeprazole', 'gastritis', 'gerd', 'stomach ache', 'heartburn', 'h.pylori',
        'نيكسيام', 'نكسيوم', 'ايسوميبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'جرثومة المعدة'
    ],
    usage: 'يستخدم لعلاج أعراض ارتجاع المريء، الوقاية من قرحة المعدة الناتجة عن المسكنات، وكجزء من بروتوكول علاج جرثومة المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل قبل الإفطار) للحصول على أفضل امتصاص وفاعلية.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years (أقراص)
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight: number, ageMonths: number) => {
        // [GREEN] Dose for Esomeprazole 20mg
        if (ageMonths >= 144) { // 12 years and above
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في بروتوكول جرثومة المعدة يمكن ٢٠ مجم مرتين يومياً مع المضادات الحيوية .';
        }
        return 'للأطفال تحت ١٢ سنة استخدم الأكياس/الجرعات الأصغر .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يُستخدم عند الحاجة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم وB12 عند الاستخدام الطويل؛ اطلب تقييماً عاجلاً عند نزيف أو فقدان وزن أو عسر بلع.',
        'التزم بالفصل ساعتين عن مضادات الحموضة السائلة أو الكالسيوم/الحديد لتحسين الامتصاص.'
    ]
  },

  // 102. Serioprazole 40 mg
  {
    id: 'serioprazole-40-cap',
    name: 'Serioprazole 40mg 20 Capsules',
    genericName: 'Pantoprazole', // [GREEN] Most stable PPI for drug interactions
    concentration: '40mg',
    price: 154, 
    matchKeywords: [
        'serioprazole', 'pantoprazole', 'stomach protection', 'ulcer', 'gastritis', 'gerd', 'heartburn',
        'سيريوبرازول', 'بانتوبرازول', 'حماية المعدة', 'قرحة الاثنى عشر', 'التهاب المعدة', 'حموضة', 'حرقان'
    ],
    usage: 'يستخدم لعلاج قرحة المعدة والاثنى عشر، ارتجاع المريء، وحماية المعدة عند استخدام المسكنات لفترات طويلة (NSAID-induced ulcer prevention).',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years (Standard for 40mg dose)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        // [GREEN] Dose for Pantoprazole 40mg
        if (ageMonths >= 144) { 
            return 'كبسولة واحدة (٤٠ مجم) مرة يومياً قبل الإفطار بـ ٣٠–٦٠ دقيقة (صباحاً) — المدة: ٤–٨ أسابيع. في بروتوكول جرثومة المعدة: ٤٠ مجم مرتين يومياً (صباح/مساء) مع المضادات الحيوية.';
        }
        return 'تركيز ٤٠ مجم غير موصى به دون ١٢ سنة—استخدم ٢٠ مجم أو بدائل سائلة.';
    },
    
    warnings: [
        'تداخلات قليلة مع كلوبيدوجريل، لكنه يلزم مراجعة التداخلات.',
        'راقب المغنيسيوم وB12 عند الاستخدام الطويل؛ قد يلزم مكملات.',
        'الحذر في القصور الكبدي الشديد وقد تحتاج الجرعة لتقليل.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تتطلب تقييماً عاجلاً.'
    ]
  },

  // 103. Pantoloc 20 mg
  {
    id: 'pantoloc-20-tab',
    name: 'Pantoloc 20mg 14 Enteric-Coated Tablets',
    genericName: 'Pantoprazole', // [GREEN] The Innovator Brand - Original Molecule
    concentration: '20mg',
    price: 56, 
    matchKeywords: [
        'pantoloc', 'pantoprazole', 'gastric protection', 'heartburn', 'mild gerd', 'stomach', 'acidity',
        'بانتولوك', 'بانتوبرازول', 'حموضة خفيفة', 'حماية المعدة', 'ارتجاع المريء', 'قرحة', 'الماني'
    ],
    usage: 'الخيار المثالي للسيطرة على الحموضة البسيطة، وعلاج طويل الأمد لمنع ارتداد المريء، وحماية جدار المعدة من أثار المسكنات والأسبرين.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة؛ للحماية مع المسكنات يمكن تناوله قبل جرعة المسكن.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 60, // 5 years (Standard for pediatric GERD in some guidelines)
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        // [GREEN] Dose for Pantoprazole 20mg (Maintenance dose)
        if (ageMonths >= 144) { // 12 years and above
            return '٢٠ مجم مرة يومياً؛ قد ترفع إلى ٤٠ مجم حسب استجابة الحالة والتشخيص.';
        } else if (ageMonths >= 60 && ageMonths < 144) { // 5 to 11 years
            return '٢٠ مجم مرة يومياً لمدة حتى ٨ أسابيع حسب التشخيص والمتابعة.';
        }
        return 'دون ٥ سنوات: استخدم بدائل/أكياس بجرعات مخصصة بجرعات معتمدة للعمر.';
    },
    
    warnings: [
        'البانتوبرازول أقل تداخلاً مع كلوبيدوجريل لكنه يلزم مراجعة التداخلات.',
        'متابعة مستويات المغنيسيوم/B12 عند الاستخدام الطويل.',
        'الحذر في القصور الكبدي الشديد.',
        'افصل ساعتين عن مضادات الحموضة السائلة أو الحديد/ليفوثيروكسين لتحسين الامتصاص.'
    ]
  },

  // 104. Pantopi 40 mg
  {
    id: 'pantopi-40-tab',
    name: 'Pantopi 40mg 14 Tablets',
    genericName: 'Pantoprazole', // [GREEN] Efficient PPI for acute symptoms
    concentration: '40mg',
    price: 96, 
    matchKeywords: [
        'pantopi', 'pantoprazole', 'acidity', 'gerd', 'stomach ulcer', 'heartburn', 'gastritis',
        'بانتوبي', 'بانتوبرازول', 'حموضة شديدة', 'قرحة المعدة', 'ارتجاع المريء', 'حرقان المعدة', 'التهاب جدار المعدة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء المتوسطة والشديدة، وقرحة المعدة والاثنى عشر، ويستخدم كعلاج مكثف للحالات التي تتطلب تثبيطاً قوياً لإفراز الحمض.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years (Standard for 40mg concentration)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        // [GREEN] Dose for Pantoprazole 40mg (High strength)
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً لمدة ٤–٨ أسابيع؛ قد تستخدم ٤٠ مجم مرتين يومياً لفترة قصيرة  خاصة في جرثومة المعدة.';
        }
        return 'تركيز ٤٠ مجم غير مخصص لمن هم دون ١٢ سنة إلا ضمن خطة استشاري وبجرعات معدلة.';
    },
    
    warnings: [
        'تداخلات قليلة مع كلوبيدوجريل مقارنة بـ PPIs أخرى، لكن مراجعة التداخلات ضرورية.',
        'راقب المغنيسيوم/B12 عند الاستخدام الطويل؛ خطر كسور مع الاستعمال المزمن.',
        'الحذر في القصور الكبدي الشديد أو الكلوي.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تتطلب مراجعة عاجلة.'
    ]
  },

  // 105. Treato-ulc 20/1100mg
  {
    id: 'treato-ulc-20-cap',
    name: 'Treato-ulc 20/1100mg 14 Capsules',
    genericName: 'Omeprazole + Sodium Bicarbonate', // [GREEN] Immediate Release PPI
    concentration: '20mg / 1100mg',
    price: 75, 
    matchKeywords: [
        'treato-ulc', 'treato ulc', 'omeprazole', 'sodium bicarbonate', 'fast acid relief', 'heartburn', 'gerd',
        'تريتو ألك', 'أوميبرازول', 'بيكربونات الصوديوم', 'حموضة سريعة', 'حرقان المعدة', 'ارتجاع المريء'
    ],
    usage: 'تركيبة ثنائية المفعول؛ بيكربونات الصوديوم تعادل الحموضة فوراً، والأوميبرازول يوقف إفراز الحمض لفترة طويلة. مثالي لمن يبحث عن راحة سريعة من الحرقان.',
    timing: 'على معدة فارغة قبل الأكل بساعة على الأقل؛ الطعام يقلل سرعة مفعوله الفوري.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة (٢٠ مجم) يومياً قبل الأكل بساعة. قد تُكرر مرتين يومياً لفترة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        return 'غير مناسب للأطفال بسبب محتوى الصوديوم العالي؛ استخدم بدائل بجرعات محددة.';
    },
    
    warnings: [
        'صوديوم عالي (١١٠٠ مجم بيكربونات): الحذر في الضغط المرتفع، القلب، الكلى، أو حمية قليلة الملح.',
        'يفصل ساعتان عن الكالسيوم/الحديد/ليفوثيروكسين لضمان الامتصاص.',
        'تجنب الحليب/الكالسيوم الكبير لتفادي متلازمة الحليب-القلوي.',
        'يستخدم لفترة قصيرة؛ يوقف ويُقيّم طبياً إذا استمرت الأعراض.'
    ]
  },

  // 106. Esmatac 40 mg
  {
    id: 'esmatac-40-cap',
    name: 'Esmatac 40mg 28 Delayed-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] Powerful S-isomer PPI
    concentration: '40mg',
    price: 144, 
    matchKeywords: [
        'esmatac', 'esomeprazole', 'gerd', 'erosive esophagitis', 'stomach ulcer', 'severe acidity', 'heartburn',
        'ايسماتاك', 'إيسماتاك', 'ايسوميبرازول', 'حموضة شديدة', 'ارتجاع المريء', 'قرحة المعدة', 'حرقان شديد'
    ],
    usage: 'يستخدم لعلاج حالات التهاب المريء التآكلي الشديد، وارتجاع المريء المزمن، وحالات زيادة إفراز حمض المعدة المفرط (متلازمة زولينجر-إليسون).',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        if (ageMonths >= 216) { 
            return '٤٠ مجم مرة يومياً لمدة ٤–٨ أسابيع؛ قد تُستخدم مرتين يومياً لفترة قصيرة في بروتوكول جرثومة المعدة .';
        }
        return 'غير مخصص للأطفال بهذا التركيز؛ استخدم ١٠–٢٠ مجم .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم/B12 على المدى الطويل؛ خطر كسور مع استعمال مزمن.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تستلزم تقييماً سريعاً.'
    ]
  },

  // 107. Esmopump 40 mg
  {
    id: 'esmopump-40-tab',
    name: 'Esmopump 40mg 14 Film-Coated Tablets',
    genericName: 'Esomeprazole', // [GREEN] Potent PPI
    concentration: '40mg',
    price: 172, 
    matchKeywords: [
        'esmopump', 'esomeprazole', 'gerd', 'stomach ulcer', 'heartburn', 'acid reflux', 'h. pylori',
        'إيسموبمب', 'ايسموبمب', 'ايسوميبرازول', 'حموضة', 'قرحة المعدة', 'ارتجاع المريء', 'حرقان الصدر'
    ],
    usage: 'يستخدم للسيطرة القوية على إفراز الحمض في حالات ارتجاع المريء الشديد، علاج قرحة المعدة والاثنى عشر، وعلاج جرثومة المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (على معدة فارغة).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        if (ageMonths >= 216) { 
            return '٤٠ مجم مرة يومياً لمدة ٤–٨ أسابيع؛ في علاج جرثومة المعدة قد تصل إلى مرتين يومياً لفترة قصيرة .';
        }
        return 'تركيز ٤٠ مجم غير مخصص للأطفال؛ استخدم تركيزات أقل حسب التشخيص والمتابعة.';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم/B12 مع العلاج الطويل؛ الحذر في القصور الكبدي.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تستدعي فحصاً سريعاً.'
    ]
  },

  // 108. Esmorap 40 mg vial
  {
    id: 'esmorap-40-vial',
    name: 'Esmorap 40mg Powder for I.V. Infusion Vial',
    genericName: 'Esomeprazole', // [GREEN] Intravenous PPI for acute cases
    concentration: '40mg',
    price: 86, 
    matchKeywords: [
        'esmorap', 'esomeprazole', 'injection', 'vial', 'i.v.', 'gastric bleeding', 'severe gerd',
        'ايسموراب', 'إيسموراب', 'ايسوميبرازول', 'حقن معدة', 'فيال وريد', 'قرحة نازفة'
    ],
    usage: 'يستخدم للسيطرة السريعة على الحموضة في الحالات الحادة، والوقاية من نزيف القرحة، وللمرضى غير القادرين على البلع.',
    timing: 'جرعة وريدية يومية داخل منشأة طبية.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 3.5,
    maxWeight: 250,
    
    calculationRule: (weight: number, ageMonths: number) => {
        if (ageMonths >= 216) { 
            return '٤٠ مجم وريدياً مرة يومياً؛ في النزيف قد تُستخدم جرعة تحميل ثم تسريب مستمر حسب التشخيص وشدة النزيف.';
        }
        if (ageMonths >= 12) {
            if (weight < 55) {
                return '٠.٥–١ مجم/كجم مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى.';
            }
            return '٤٠ مجم مرة يومياً بالوريد حسب التشخيص والمتابعة.';
        }
        return 'للرضع <١٢ شهر تُحسب الجرعة بدقة (٠.٥–١ مجم/كجم) ويُعطى داخل المستشفى فقط.';
    },
    
    warnings: [
        'وريدي فقط؛ يمنع الحقن العضلي.',
        'استخدام المستحضر فور التحضير؛ لا يخلط مع أدوية أخرى في نفس الخط.',
        'انتقل للعلاج الفموي بمجرد القدرة على البلع.',
        'الحذر مع كلوبيدوجريل/مضادات الفيروسات (ريلبيفيرين/نلفينافير/أتازانافير).'
    ]
  },

  // 109. Esomium 40 mg (14 Caps)
  {
    id: 'esomium-40-cap',
    name: 'Esomium 40mg 14 Sustained-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] Sustained Release
    concentration: '40mg',
    price: 202, 
    matchKeywords: [
        'esomium', 'esomeprazole', 'acidity', 'heartburn', 'gerd', 'stomach ulcer',
        'ايسوميوم', 'إيسوميوم', 'ايسوميبرازول', 'حموضة شديدة', 'ارتجاع المريء'
    ],
    usage: 'يعمل على التثبيط القوي والمستمر لإفراز حمض المعدة لمساعدة التئام التهابات المريء التآكلية.',
    timing: 'كبسولة يومية قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        if (ageMonths >= 216) { 
            return '٤٠ مجم مرة يومياً لمدة ٤–٨ أسابيع؛ يمكن مرتين يومياً لفترة قصيرة .';
        }
        return 'تركيز ٤٠ مجم غير مناسب للأطفال دون ١٨ سنة؛ استخدم تركيزات أقل .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يُستخدم عند الحاجة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم/B12 مع العلاج الطويل؛ خطر كسور مع الاستخدام المزمن.',
        'أعراض إنذار (نزيف، فقدان وزن، صعوبة بلع) تستلزم تقييماً طبياً.'
    ]
  },

  // 110. Esomium 40 mg (7 Caps)
  {
    id: 'esomium-40-cap-7',
    name: 'Esomium 40mg 7 Sustained-Release Capsules',
    genericName: 'Esomeprazole', 
    concentration: '40mg',
    price: 101, 
    matchKeywords: [
        'esomium', 'esomeprazole', 'acidity', 'heartburn', 'gerd', 'short course',
        'ايسوميوم', 'إيسوميوم', 'ايسوميبرازول', 'حموضة', 'شريط واحد'
    ],
    usage: 'مناسبة جداً للكورسات العلاجية القصيرة أو كبداية لعلاج القرحة والارتجاع الحاد.',
    timing: 'كبسولة واحدة يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة (على الريق).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight: any, ageMonths: number) => {
        if (ageMonths >= 216) { 
            return '٤٠ مجم مرة يومياً لكورس ٧ أيام؛ يمكن التمديد حسب التشخيص والمتابعة.';
        }
        return 'تركيز ٤٠ مجم غير مخصص للأطفال؛ استخدم بدائل أقل تركيزاً.';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة فقط.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم/B12 إذا تكرر الكورس؛ أوقف وأعد التقييم عند أعراض إنذار.',
        'أكمل الكورس المتفق عليه حتى مع تحسن الأعراض ما لم يوجّه الطبيب بغير ذلك.'
    ]
  },
// 111. Lantopep 60 mg
  {
    id: 'lantopep-60-cap',
    name: 'Lantopep 60mg 14 Capsules',
    genericName: 'Dexlansoprazole', // [GREEN] Dual Delayed Release (DDR) Technology
    concentration: '60mg',
    price: 140, 
    matchKeywords: [
        'lantopep', 'dexlansoprazole', 'gerd', 'erosive esophagitis', 'heartburn', 'acid reflux', 'stomach',
        'لانتوبيب', 'ديكسلانزوبرازول', 'ارتجاع المريء', 'التهاب المريء التآكلي', 'حموضة مزمنة', 'حرقان الصدر'
    ],
    usage: 'جيل متطور من مثبطات مضخة البروتون يعالج التهاب المريء التآكلي وارتجاع المريء الشديد بفاعلية تدوم طويلاً بفضل تقنية تحرر الدواء على مرحلتين.',
    timing: 'يمكن تناوله مع الطعام أو بدونه؛ يفضل موعد ثابت (غالباً قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Dexlansoprazole 60mg
        if (ageMonths >= 144) { 
            return '٦٠ مجم مرة يومياً لمدة ٤–٨ أسابيع لالتهاب المريء التآكلي أو الارتجاع الشديد.';
        }
        return 'هذا التركيز غير مخصص لمن هم دون ١٢ سنة؛ يمكن استخدام ٣٠ مجم بوصفة متخصصة.';
    },
    
    warnings: [
        'بيانات الحمل محدودة؛ يستخدم عند الضرورة فقط.',
        'قد يقلل امتصاص الأدوية المعتمدة على الحموضة؛ افصل ساعتين عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'الحذر مع الميثوتركسات عالي الجرعة؛ أعد التقييم.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو يزيد خطر الكسور؛ المتابعة مطلوبة.'
    ]
  },

  // 112. Lantopep 60 mg (20 Caps)
  {
    id: 'lantopep-60-cap-20',
    name: 'Lantopep 60mg 20 Capsules',
    genericName: 'Dexlansoprazole', // [GREEN] Dual Delayed Release (DDR) Technology
    concentration: '60mg',
    price: 104, 
    matchKeywords: [
        'lantopep', 'dexlansoprazole', 'gerd', 'erosive esophagitis', 'heartburn', 'acid reflux', 'stomach protection',
        'لانتوبيب', 'ديكسلانزوبرازول', 'ارتجاع المريء', 'التهاب المريء التآكلي', 'حموضة مزمنة', 'حرقان الصدر', 'عبوة ٢٠ كبسولة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء الشديدة والتهابات المريء التي تحتاج لفترة علاج ممتدة. تقنية DDR تضمن استمرار مفعول الدواء طوال اليوم.',
    timing: 'يمكن تناوله مع الطعام أو بدونه؛ يفضل موعد ثابت (غالباً قبل الإفطار).',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Dexlansoprazole 60mg
        if (ageMonths >= 144) { 
            return '٦٠ مجم مرة يومياً لمدة ٤–٨ أسابيع؛ العبوة ٢٠ كبسولة تكفي نحو ٣ أسابيع.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ يمكن استخدام ٣٠ مجم بوصفة متخصصة.';
    },
    
    warnings: [
        'بيانات الحمل محدودة؛ يستخدم عند الضرورة.',
        'افصل ساعتين عن الحديد/ليفوثيروكسين/كيتوكونازول لتحسين الامتصاص.',
        'الحذر مع الميثوتركسات عالي الجرعة وبعض مضادات الفطريات/الفيروسات؛ أعد التقييم.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو يزيد خطر الكسور؛ يلزم متابعة.'
    ]
  },

  // 113. Nexium 20 mg (14 Tabs)
  {
    id: 'nexium-20-tab-14',
    name: 'Nexium 20mg 14 Film-Coated Tablets',
    genericName: 'Esomeprazole', // [GREEN] The Reference Innovator - MUPS Technology
    concentration: '20mg',
    price: 98, 
    matchKeywords: [
        'nexium', 'esomeprazole', 'acidity', 'gerd', 'heartburn', 'gastric protection', 'stomach',
        'نيكسيام', 'نكسيوم', 'ايسوميبرازول', 'حموضة', 'ارتجاع المريء', 'حماية المعدة', 'حرقان'
    ],
    usage: 'يعد المعيار الذهبي لعلاج الحموضة وارتجاع المريء. يستخدم بتركيز ٢٠ مجم كجرعة وقائية لمنع عودة الأعراض أو لحماية المعدة من تأثير المسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة؛ يمكن تناوله مع أو بدون طعام لكن الامتصاص أفضل على معدة فارغة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years (أقراص)
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 20mg
        if (ageMonths >= 144) { // 12 years and above
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في بروتوكول جرثومة المعدة يمكن ٢٠ مجم مرتين يومياً مع المضادات الحيوية .';
        }
        return 'للأطفال تحت ١٢ سنة استخدم الأكياس/الجرعات الأصغر .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول.',
        'حالات خاصة: راقب المغنيسيوم/B12 عند الاستخدام الطويل؛ اطلب تقييماً عاجلاً عند نزيف أو فقدان وزن أو عسر بلع.',
        'التزم بالفصل ساعتين عن مضادات الحموضة السائلة أو الكالسيوم/الحديد لتحسين الامتصاص.'
    ]
  },

  // 114. Protoloc 20 mg
  {
    id: 'protoloc-20-tab',
    name: 'Protoloc 20mg 14 Enteric-Coated Tablets',
    genericName: 'Omeprazole', // [GREEN] Essential PPI
    concentration: '20mg',
    price: 66, 
    matchKeywords: [
        'protoloc', 'omeprazole', 'gastritis', 'gerd', 'stomach ulcer', 'acidity', 'heartburn',
        'بروتولوك', 'أوميبرازول', 'حموضة', 'قرحة المعدة', 'ارتجاع المريء', 'حرقان', 'التهاب المعدة'
    ],
    usage: 'يستخدم لتقليل إفراز حمض المعدة، علاج قرحة المعدة والاثنى عشر، والسيطرة على أعراض ارتجاع المريء والحموضة المتكررة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً على الريق) لتحسين الامتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 60, // 5 years؛ الأقراص للقدرة على البلع
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Omeprazole 20mg
        if (ageMonths >= 144) { // ≥12 سنة
            return '٢٠ مجم مرة يومياً قبل الإفطار. يمكن زيادتها إلى مرتين يومياً لمدة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        if (ageMonths >= 60 && weight >= 20) { // 5–11 سنة
            return '٢٠ مجم مرة يومياً لعلاج الارتجاع لمدة ٤–٨ أسابيع. أعد التقييم إذا لم يتحسن المريض.';
        }
        return 'للأطفال الأصغر أو أقل من ٢٠ كجم يفضل الأشكال السائلة/الجرعات الأصغر ١ مجم/كجم .';
    },
    
    warnings: [
        'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
        'يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول ومضادات الحموضة السائلة لتحسين الامتصاص.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو هشاشة؛ راقب عند الاستعمال المزمن.',
        'أعد التقييم عند صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب.'
    ]
  },

  // 115. Treato-ulc 40/1100mg
  {
    id: 'treato-ulc-40-cap',
    name: 'Treato-ulc 40/1100mg 14 Capsules',
    genericName: 'Omeprazole + Sodium Bicarbonate', // [GREEN] Immediate Release PPI - High Strength
    concentration: '40mg / 1100mg',
    price: 80, 
    matchKeywords: [
        'treato-ulc', 'treato ulc', 'omeprazole', 'sodium bicarbonate', 'fast relief', 'gerd', 'severe heartburn',
        'تريتو ألك', 'تريتو الك ٤٠', 'أوميبرازول', 'بيكربونات الصوديوم', 'حموضة شديدة', 'حرقان المعدة', 'ارتجاع المريء'
    ],
    usage: 'تركيبة فورية بجرعة عالية؛ بيكربونات الصوديوم تعادل الحمض سريعاً والأوميبرازول يبدأ العمل خلال ٣٠ دقيقة.',
    timing: 'على معدة فارغة تماماً قبل الطعام بساعة مع كوب ماء؛ الامتصاص يتأثر بشدة بالطعام.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 55,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Treato-ulc 40mg
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة (٤٠ مجم) يومياً قبل الإفطار. في الحالات الشديدة يمكن مؤقتاً كبسولة مرتين يومياً حسب التشخيص وبمدة قصيرة.';
        }
        return 'تركيز عالٍ غير مخصص لمن هم دون ١٨ عاماً؛ استخدم تركيزات أقل أو أشكال أخرى.';
    },
    
    warnings: [
        'يحتوي على ١١٠٠ مجم صوديوم؛ تجنب استخدامه في فشل القلب أو الضغط غير المنضبط أو الحميات منخفضة الصوديوم إلا بتوجيه متخصص.',
        'استخدام قصير لا يتجاوز ٤–٨ أسابيع لتجنب اختلال الأملاح أو القلاء الاستقلابي.',
        'راقب التداخل مع كلوبيدوجريل؛ يُفضل بدائل بانتوبرازول لمرضى القلب.',
        'أعد التقييم فوراً عند إسهال شديد، نزيف هضمي، أو فقدان وزن غير مبرر.'
    ]
},

// 116. Biorazo 40 mg
  {
    id: 'biorazo-40-cap',
    name: 'Biorazo 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Powerful Proton Pump Inhibitor
    concentration: '40mg',
    price: 72, 
    matchKeywords: [
        'biorazo', 'esomeprazole', 'gerd', 'erosive esophagitis', 'heartburn', 'stomach ulcer', 'acidity',
        'بيورازو', 'بايورازو', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة شديدة', 'حرقان المعدة', 'قرحة'
    ],
    usage: 'لعلاج ارتجاع المريء الشديد، التهاب المريء التآكلي، وقرحة المعدة؛ يدخل في بروتوكولات جرثومة المعدة بجرعات مكثفة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان أفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 40mg (Biorazo)
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في بروتوكول جرثومة المعدة قد تُعطى مرتين يومياً لمدة قصيرة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب التداخل مع الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 مع الاستعمال الطويل؛ راقب العظام في كبار السن.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يستوجب تقييماً طبياً عاجلاً.'
    ]
  },

  // 117. Esomeprazole-eva 40 mg
  {
    id: 'esomeprazole-eva-40-tab',
    name: 'Esomeprazole-eva 40mg 20 Enteric-Coated Tablets',
    genericName: 'Esomeprazole', // [GREEN] High-quality PPI from Eva Pharma
    concentration: '40mg',
    price: 116, 
    matchKeywords: [
        'esomeprazole-eva', 'esomeprazole eva', 'esomeprazole', 'gerd', 'heartburn', 'stomach ulcer', 'acidity',
        'ايسوميبرازول ايفا', 'إيسوميبرازول إيفا', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة', 'حرقان المعدة', 'قرحة'
    ],
    usage: 'سيطرة قوية على إفراز الحمض لعلاج الارتجاع الشديد وقرحة المعدة، والوقاية من القرحة المرتبطة بالمسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل تثبيط لمضخة البروتون.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 40mg
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة أو الحالات الشديدة قد تُكرر مرتين يومياً لفترة محدودة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس عند الحاجة.';
    },
    
    warnings: [
        'الحمل: فئة B؛ استخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 واحتمال تأثير على العظام عند الاستعمال الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: عسر بلع، نزيف، قيء دموي، أو فقدان وزن غير مبرر يستدعي تقييم فوري.'
    ]
  },

  // 118. Pangestazol 40 mg
  {
    id: 'pangestazol-40-tab',
    name: 'Pangestazol 40mg 14 Tablets',
    genericName: 'Pantoprazole', // [GREEN] Stable and safe PPI
    concentration: '40mg',
    price: 102, 
    matchKeywords: [
        'pangestazol', 'pantoprazole', 'acidity', 'gerd', 'stomach ulcer', 'heartburn', 'gastric protection',
        'بانجيستازول', 'بانتوبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'حماية المعدة', 'حرقان الصدر'
    ],
    usage: 'يقلل الحمض لعلاج التهاب المريء الارتجاعي وقرحة المعدة/الاثنى عشر، مع تداخلات دوائية أقل مقارنة ببعض الـPPIs.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان أفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Pantoprazole 40mg
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في بروتوكول جرثومة المعدة قد تُعطى مرتين يومياً لمدة ١٠–١٤ يوماً .';
        }
        return 'غير مخصص لمن هم دون ١٢ عاماً؛ استخدم تركيز ٢٠ مجم عند الحاجة.';
    },
    
    warnings: [
        'أقل تداخلاً مع كلوبيدوجريل مقارنة بأوميبرازول/إيسوميبرازول، ما يجعله خياراً آمناً لمرضى القلب.',
        'الحذر في القصور الكبدي الشديد؛ قد تحتاج ضبط جرعة.',
        'مراقبة المغنيسيوم/B12 عند الاستعمال المزمن؛ فكر في دعم الكالسيوم/فيتامين D عند عوامل خطورة هشاشة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يتطلب تقييماً طبياً.'
    ]
  },

  // 119. Pangestazol 40 mg (28 Tabs)
  {
    id: 'pangestazol-40-tab-28',
    name: 'Pangestazol 40mg 28 Tablets',
    genericName: 'Pantoprazole', // [GREEN] High safety profile
    concentration: '40mg',
    price: 204, 
    matchKeywords: [
        'pangestazol', 'pantoprazole', 'acidity', 'gerd', 'stomach protection', 'heartburn', 'ulcer',
        'بانجيستازول', 'بانتوبرازول', 'حموضة', 'حماية المعدة', 'ارتجاع المريء', 'قرحة'
    ],
    usage: 'يستخدم لعلاج حالات قرحة المعدة وارتجاع المريء، وهو مثالي لمرضى الحالات المزمنة الذين يتناولون أدوية متعددة لقلة تداخلاته الدوائية.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان أفضل سيطرة على الحموضة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار؛ العبوة (٢٨ قرص) تكفي ٤ أسابيع من العلاج المستمر.';
        }
        return 'غير مخصص لمن هم دون ١٢ عاماً؛ استخدم تركيز ٢٠ مجم عند الحاجة.';
    },
    
    warnings: [
        'تداخلات قليلة مع كلوبيدوجريل؛ مناسب لمرضى القلب مقارنة ببعض الـPPIs الأخرى.',
        'الحذر في القصور الكبدي الشديد؛ راقب إنزيمات الكبد إذا طال الاستخدام.',
        'مراقبة مغنيسيوم/B12 والعظام مع الاستخدام المزمن خاصة في كبار السن.',
        'أعلام حمراء: نزيف، فقدان وزن، قيء دموي، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 120. Nexicure 2.5 mg sachets
  {
    id: 'nexicure-2-5-sachet',
    name: 'Nexicure 2.5mg 28 Sachets',
    genericName: 'Esomeprazole', // [GREEN] Pediatric-friendly PPI
    concentration: '2.5mg',
    price: 168, 
    matchKeywords: [
        'nexicure', 'nexicure sachets', 'esomeprazole infants', 'pediatric reflux', 'heartburn kids', 'vomiting infants',
        'نكسيكيور', 'نكسيكيور أكياس', 'ايسوميبرازول أطفال', 'ارتجاع الرضع', 'حموضة الأطفال', 'ترجيع الرضع'
    ],
    usage: 'لعلاج ارتجاع المريء والتهاب المريء لدى الرضع والأطفال؛ تركيبة سريعة الذوبان لسهولة الإعطاء.',
    timing: 'على معدة فارغة قبل الرضاعة/الوجبة بـ ٣٠–٦٠ دقيقة لضمان الامتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Sachets',
    
    minAgeMonths: 1, // 1 month
    maxAgeMonths: 120, // 10 years
    minWeight: 3.5,
    maxWeight: 35,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 1 && ageMonths < 12) { // Infants 1–11 mo
            return 'كيس واحد (٢.٥ مجم) مرة يومياً قبل الرضعة. للرضع منخفضي الوزن (<٣.٥ كجم) يُستشار متخصص لتعديل الجرعة.';
        }
        if (ageMonths >= 12 && weight < 10) { // 1–2 سنوات
            return '١–٢ كيس (٢.٥–٥ مجم) مرة يومياً حسب شدة الارتجاع والتشخيص.';
        }
        if (weight >= 10 && weight < 20) { // غالباً ٢–٥ سنوات
            return '٥ مجم مرة يومياً (٢ أكياس). في الحالات الشديدة يمكن ١٠ مجم يومياً (٤ أكياس) حسب التشخيص والمتابعة.';
        }
        if (weight >= 20 && ageMonths <= 120) {
            return '٥–١٠ مجم يومياً حسب الحالة. أعد التقييم قبل زيادة الجرعة.';
        }
        return 'للرضع أقل من شهر أو أطفال أكبر من ١٠ سنوات يُفضل أشكال أخرى وتركيزات أعلى؛ استشر متخصصاً.';
    },
    
    warnings: [
        'تجنب الاستخدام في المواليد الخدج بعد تقييم الخطر؛ يُقيّم خطر توقف التنفس/العدوى.',
        'تخلص من أي كمية متبقية بعد ٣٠ دقيقة؛ لا تُخزن المزيج.',
        'أعد التقييم عند إسهال شديد، طفح، قيء مستمر، أو قلة زيادة الوزن.',
        'للارتجاع الوظيفي البسيط (القشط الطبيعي) لا ينصح بالاستمرار دون تشخيص.'
    ]
  },

  // 121. Esmatac 40 mg (14 Caps)
  {
    id: 'esmatac-40-cap-14',
    name: 'Esmatac 40mg 14 Delayed-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] Potent S-isomer PPI
    concentration: '40mg',
    price: 72, 
    matchKeywords: [
        'esmatac', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer', 'acidity',
        'ايسماتاك', 'إيسماتاك', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة شديدة', 'حرقان المعدة', 'قرحة'
    ],
    usage: 'لعلاج الارتجاع الشديد والتهاب المريء التآكلي وقرحة المعدة؛ جرعة عالية للسيطرة السريعة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 40mg
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة قد تُعطى مرتين يومياً لفترة قصيرة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس عند الحاجة.';
    },
    
    warnings: [
        'الحمل: فئة B؛ استخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 واحتمال تأثير على العظام عند الاستعمال الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: عسر بلع، نزيف، قيء دموي، أو فقدان وزن غير مبرر يستدعي تقييم فوري.'
    ]
  },

  // 122. Fastcure 20 mg
  {
    id: 'fastcure-20-cap',
    name: 'Fastcure 20mg 14 Capsules',
    genericName: 'Omeprazole', // [GREEN] The classic Proton Pump Inhibitor
    concentration: '20mg',
    price: 56, 
    matchKeywords: [
        'fastcure', 'fast cure', 'omeprazole', 'gastritis', 'gerd', 'heartburn', 'stomach ulcer', 'acidity',
        'فاست كيور', 'فاسكيور', 'أوميبرازول', 'حموضة', 'ارتجاع المريء', 'حرقان المعدة', 'التهاب المعدة', 'قرحة'
    ],
    usage: 'يستخدم لتقليل إفراز حمض المعدة، مما يساعد في علاج قرحة المعدة والاثنى عشر، والتهابات جدار المعدة، وأعراض ارتجاع المريء.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً على الريق) لتحسين الامتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 60, // 5 years للأقراص القابلة للبلع
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Omeprazole 20mg
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار. يمكن زيادتها إلى مرتين يومياً لمدة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        if (ageMonths >= 60 && weight >= 20) { 
            return '٢٠ مجم مرة يومياً لعلاج الارتجاع لمدة ٤–٨ أسابيع. أعد التقييم إذا لم يتحسن المريض.';
        }
        return 'للأطفال الأصغر أو أقل من ٢٠ كجم يفضل الأشكال السائلة/الجرعات الأصغر ١ مجم/كجم .';
    },
    
    warnings: [
        'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
        'يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول ومضادات الحموضة السائلة لتحسين الامتصاص.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو هشاشة؛ راقب عند الاستعمال المزمن.',
        'أعد التقييم عند صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب.'
    ]
  },

  // 123. Peptic Care (Corrected Pack)
  {
    id: 'peptic-care-triple-pack',
    name: 'Peptic-Care 14 Triple Therapy Pack',
    genericName: 'Omeprazole + Clarithromycin + Tinidazole', // [GREEN] Standard Triple Therapy for H. Pylori
    concentration: '20mg / 250mg / 500mg',
    price: 230, 
    matchKeywords: [
        'peptic care', 'peptic-care', 'h. pylori treatment', 'triple therapy', 'stomach bacteria', 'clarithromycin',
        'بيبتيك كير', 'بيبتك كير', 'علاج جرثومة المعدة', 'البروتوكول الثلاثي', 'خطة العلاج الثلاثي', 'كلاريثروميسين', 'تينيدازول'
    ],
    usage: 'خطة العلاج الثلاثي المتكاملة للقضاء على جرثومة المعدة (H. Pylori) وعلاج قرحة المعدة المرتبطة بها.',
    timing: 'جرعة كاملة (٣ أقراص/كبسولات) مرتين يومياً بعد الإفطار وبعد العشاء لمدة ١٤ يوماً دون انقطاع.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet/Capsule Pack',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'شريط كامل يومياً مقسّم على جرعتين (بعد الإفطار وبعد العشاء) لمدة ١٤ يوماً. لا تتوقف مبكراً حتى لو اختفت الأعراض.';
        }
        return 'مخصص للبالغين؛ الأطفال يُحسب لكل دواء جرعة مستقلة حسب الوزن و.';
    },
    
    warnings: [
        'الحساسية للمضادات الماكروليدية/نيتروإيميدازول تمنع الاستخدام.',
        'تجنب الكحول مع التينيدازول (تفاعل شبيه بالديسلفيرام).',
        'قد يطيل الكلاريثروميسين QT؛ راقب مرضى القلب واضبط التداخلات (ستاتين، وارفارين).',
        'إسهال شديد أو دموي يستدعي إيقاف الدواء وتقييم عدوى الكلوستريديوم.',
        'استخدم بروبيوتيك أو زبادي للمساعدة على منع الاضطراب المعوي إذا لم يوجد تعارض.'
    ]
  },

  // 124. Zurcal 40 mg vial
  {
    id: 'zurcal-40-vial',
    name: 'Zurcal 40mg Powder for I.V. Infusion Vial',
    genericName: 'Pantoprazole', // [GREEN] The Original Innovator Brand (I.V.)
    concentration: '40mg',
    price: 84, 
    matchKeywords: [
        'zurcal', 'zurcal vial', 'pantoprazole', 'i.v.', 'gastric bleeding', 'severe acidity', 'ulcer prophylaxis',
        'زوركال', 'زوركال حقن', 'بانتوبرازول', 'حقن معدة', 'قرحة نازفة', 'حموضة حادة', 'وقاية المعدة'
    ],
    usage: 'يستخدم للسيطرة السريعة على حموضة المعدة في الحالات الحادة، والوقاية من نزيف القرحة الإجهادي، وللمرضى غير القادرين على تناول الأدوية بالفم.',
    timing: 'حقن وريدي مرة واحدة يومياً؛ في النزيف الشديد قد تُكرر مرتين يومياً .',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // يسمح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد تُستخدم جرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة حسب التشخيص وشدة النزيف.';
        }
        if (ageMonths >= 1) {
            return '٠.٨–١ مجم/كجم بالوريد مرة يومياً (بحد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل المستشفى.';
    },
    
    warnings: [
        'مخصص للوريد فقط؛ يمنع الحقن العضلي.',
        'تداخلات قليلة مع كلوبيدوجريل مقارنة بأوميبرازول؛ خيار آمن لمرضى القلب.',
        'يُراقب المغنيسيوم/B12 مع الاستخدام الطويل، ووظائف الكبد في المرضى المعرضين.',
        'توقف وقيّم عند أي تفاعل تحسسي، ألم صدر، أو عدم تحسن/نزيف مستمر.'
    ]
  },

  // 125. Biorazo 40 mg (7 Caps)
  {
    id: 'biorazo-40-cap-7',
    name: 'Biorazo 40mg 7 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Cost-effective Potent PPI
    concentration: '40mg',
    price: 24, 
    matchKeywords: [
        'biorazo', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer', 'short course',
        'بيورازو', 'بايورازو', 'ايسوميبرازول', 'حموضة', 'حرقان المعدة', 'ارتجاع المريء', 'شريط واحد'
    ],
    usage: 'يوفر سيطرة قوية وسريعة على إفراز الحمض. العبوة (٧ كبسولات) مثالية لعلاج نوبات الحموضة الحادة المفاجئة أو ككورس علاجي قصير المدى.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان أقصى استفادة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٧ أيام. إذا استمرت الأعراض بعد انتهاء الشريط، أعد التقييم.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات أقل أو أشكال سائلة .';
    },
    
    warnings: [
        'الحمل: فئة B؛ استخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 مع الاستعمال الطويل حتى لو كان الكورس قصيراً متكررًا؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يستوجب تقييماً طبياً عاجلاً.'
    ]
  },

  // 126. Nixprazole 40 mg
  {
    id: 'nixprazole-40-cap',
    name: 'Nixprazole 40mg 14 Delayed-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] High-quality Esomeprazole formulation
    concentration: '40mg',
    price: 152, 
    matchKeywords: [
        'nixprazole', 'nixprazole 40', 'esomeprazole', 'gerd', 'erosive esophagitis', 'heartburn', 'stomach ulcer',
        'نيكسبرزول', 'نيكس برازول', 'نيكسوبرازول', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة شديدة', 'قرحة المعدة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء الشديدة والتهاب المريء التآكلي، كما يعمل كحماية قوية للمعدة في حالات الاستخدام المزمن للمسكنات، ويدخل في بروتوكول علاج جرثومة المعدة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة للحصول على أفضل تثبيط لمضخات البروتون.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 40mg (Nixprazole)
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة قد تُعطى مرتين يومياً لفترة قصيرة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس عند الحاجة.';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 والعظام مع الاستخدام الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: عسر بلع، نزيف، قيء دموي، أو فقدان وزن غير مبرر يستدعي تقييم فوري.'
    ]
  },

  // 127. Orgixium 40 mg (21 Caps)
  {
    id: 'orgixium-40-cap-21',
    name: 'Orgixium 40mg 21 Delayed-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] Efficient and Cost-effective PPI
    concentration: '40mg',
    price: 86, 
    matchKeywords: [
        'orgixium', 'orgixium 40', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer', 'gastritis',
        'أورجيكسيوم', 'اورجكسيوم', 'اورجيكسيم', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة', 'حرقان الصدر', 'قرحة'
    ],
    usage: 'يستخدم لتثبيت إنتاج حمض المعدة بقوة، مما يساعد في علاج التهاب المريء التآكلي وارتجاع المريء المزمن، ويوفر حماية للمعدة عند تناول الأدوية المسببة للقرحة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان غلق مضخات البروتون بكفاءة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Esomeprazole 40mg (Orgixium)
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار؛ العبوة (٢١ كبسولة) تكفي ٣ أسابيع علاجية. في جرثومة المعدة قد تُعطى مرتين يومياً لفترة قصيرة.';
        }
        return 'غير مخصص لمن هم دون ١٢ عاماً؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس عند الحاجة.';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 والعظام مع الاستخدام الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يتطلب تقييماً طبياً عاجلاً.'
    ]
  },

  // 128. Protolans 60 mg (20 Caps)
  {
    id: 'protolans-60-cap-20',
    name: 'Protolans 60mg 20 Capsules',
    genericName: 'Dexlansoprazole', // [GREEN] Dual Delayed Release (DDR) Technology
    concentration: '60mg',
    price: 104, 
    matchKeywords: [
        'protolans', 'protolans 60', 'dexlansoprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer', 'acidity',
        'بروتولانز', 'بروتولانز ٦٠', 'ديكسلانزوبرازول', 'ارتجاع المريء', 'حموضة', 'حرقان الصدر', 'قرحة المعدة'
    ],
    usage: 'لعلاج الارتجاع الشديد والتهاب المريء التآكلي؛ تقنية إطلاق مزدوج تمنح تغطية ممتدة.',
    timing: 'يمكن تناوله مع الطعام أو بدونه؛ يُفضل قبل الإفطار بـ ٣٠ دقيقة لتحسين السيطرة على الأعراض.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // [GREEN] Dose for Dexlansoprazole 60mg
        if (ageMonths >= 144) { 
            return '٦٠ مجم مرة يومياً؛ في الحالات الشديدة يمكن مرتين يومياً لفترة قصيرة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ يمكن التفكير في ٣٠ مجم بجرعات مضبوطة بوصفة متخصصة.';
    },
    
    warnings: [
        'بيانات الحمل محدودة؛ يستخدم عند الضرورة.',
        'افصل ساعتين عن الحديد/ليفوثيروكسين/كيتوكونازول لتحسين الامتصاص.',
        'الحذر مع الميثوتركسات عالي الجرعة وبعض مضادات الفطريات/الفيروسات؛ أعد التقييم.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو يزيد خطر الكسور؛ يلزم متابعة.'
    ]
  },

  // 129. Protoloc 40 mg
  {
    id: 'protoloc-40-tab',
    name: 'Protoloc 40mg 14 Enteric-Coated Tablets',
    genericName: 'Omeprazole', // [GREEN] Essential high-strength PPI
    concentration: '40mg',
    price: 82, 
    matchKeywords: [
        'protoloc', 'protoloc 40', 'omeprazole', 'gastritis', 'gerd', 'stomach ulcer', 'severe acidity', 'heartburn',
        'بروتولوك', 'بروتولوك ٤٠', 'أوميبرازول', 'حموضة شديدة', 'قرحة المعدة', 'ارتجاع المريء', 'حرقان', 'التهاب المعدة'
    ],
    usage: 'يستخدم لعلاج حالات قرحة المعدة والاثنى عشر النشطة، والتهاب المريء الارتجاعي الشديد، كما يستخدم كجزء من العلاج المكثف للقضاء على جرثومة المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً على الريق) لضمان غلق مضخات الحمض قبل تفعيلها.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار. في بروتوكول جرثومة المعدة أو الحالات الشديدة قد تُكرر مرتين يومياً لفترة قصيرة.';
        }
        return 'غير مخصص لمن هم دون ١٢ عاماً؛ استخدم تركيزات أقل أو أشكال سائلة بجرعة ١ مجم/كجم .';
    },
    
    warnings: [
        'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
        'يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول ومضادات الحموضة السائلة لتحسين الامتصاص.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو هشاشة؛ راقب عند الاستعمال المزمن.',
        'الحذر في القصور الكبدي الشديد؛ أعد التقييم لتعديل الجرعة.'
    ]
  },

  // 130. Zarroprazole 20/1100mg
  {
    id: 'zarroprazole-20-cap-28',
    name: 'Zarroprazole 20/1100mg 28 Capsules',
    genericName: 'Omeprazole + Sodium Bicarbonate', // [GREEN] Immediate Release PPI Technology
    concentration: '20mg / 1100mg',
    price: 138, 
    matchKeywords: [
        'zarroprazole', 'zarroprazole 20', 'omeprazole', 'sodium bicarbonate', 'fast relief', 'heartburn', 'gerd',
        'زاروبرازول', 'زارو برازول', 'أوميبرازول', 'بيكربونات الصوديوم', 'حموضة سريعة', 'حرقان المعدة', 'ارتجاع المريء'
    ],
    usage: 'تركيبة فورية؛ بيكربونات الصوديوم تعادل الحمض سريعاً والأوميبرازول يوفر تغطية ممتدة لعلاج الارتجاع والقرحة.',
    timing: 'على معدة فارغة تماماً قبل الطعام بـ ٦٠ دقيقة مع كوب ماء؛ لا يؤخذ مع الطعام.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 55,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة يومياً قبل الإفطار. في الحالات الشديدة يمكن مؤقتاً كبسولة مرتين يومياً حسب التشخيص وبمدة قصيرة.';
        }
        return 'محتوى الصوديوم عالٍ؛ غير مخصص لمن هم دون ١٨ عاماً. استخدم بدائل أقل صوديوم للأطفال.';
    },
    
    warnings: [
        'يحتوي على ١١٠٠ مجم صوديوم؛ تجنب استخدامه في فشل القلب أو الضغط غير المنضبط أو الحميات منخفضة الصوديوم إلا بتوجيه متخصص.',
        'استخدام قصير لا يتجاوز ٤–٨ أسابيع لتجنب اختلال الأملاح أو القلاء الاستقلابي.',
        'راقب التداخل مع كلوبيدوجريل؛ يُفضل بدائل بانتوبرازول لمرضى القلب.',
        'أعد التقييم فوراً عند إسهال شديد، نزيف هضمي، أو فقدان وزن غير مبرر.'
    ]
  },

    // 131. Gesomezol 40 mg (Duplicate entry kept for reference)
  {
    id: 'gesomezol-40-cap',
    name: 'Gesomezol 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Powerful PPI for Acid Control
    concentration: '40mg',
    price: 126, 
    matchKeywords: [
        'gesomezol', 'gesomezol 40', 'esomeprazole', 'gerd', 'heartburn', 'gastric ulcer', 'acid reflux',
        'جيسوميزول', 'جيزوميزول', 'ايسوميبرازول', 'حموضة شديدة', 'حرقان المعدة', 'ارتجاع المريء', 'قرحة'
    ],
    usage: 'لعلاج الارتجاع الشديد والتهاب المريء التآكلي ولحماية المعدة مع المسكنات؛ تغطية قوية للحمض.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة قد تُعطى مرتين يومياً لفترة قصيرة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 والعظام مع الاستخدام الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يتطلب تقييماً طبياً عاجلاً.'
    ]
 },

  // 131. Gesomezol 40 mg
  {
    id: 'gesomezol-40-cap',
    name: 'Gesomezol 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Powerful PPI for Acid Control
    concentration: '40mg',
    price: 126, 
    matchKeywords: [
        'gesomezol', 'gesomezol 40', 'esomeprazole', 'gerd', 'heartburn', 'gastric ulcer', 'acid reflux',
        'جيسوميزول', 'جيزوميزول', 'ايسوميبرازول', 'حموضة شديدة', 'حرقان المعدة', 'ارتجاع المريء', 'قرحة'
    ],
    usage: 'لعلاج الارتجاع الشديد والتهاب المريء التآكلي ولحماية المعدة مع المسكنات؛ تغطية قوية للحمض.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة قد تُعطى مرتين يومياً لفترة قصيرة .';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات ١٠–٢٠ مجم أو الأكياس .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 والعظام مع الاستخدام الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يتطلب تقييماً طبياً عاجلاً.'
    ]
  },

  // 132. Antodine 20mg/2ml (3 Amps)
  {
    id: 'antodine-20-amp',
    name: 'Antodine 20mg/2ml 3 I.M./I.V. Ampoules',
    genericName: 'Famotidine', // [GREEN] Potent H2-Receptor Antagonist
    concentration: '20mg / 2ml',
    price: 39, 
    matchKeywords: [
        'antodine', 'antodine amp', 'famotidine', 'injection', 'acidity', 'heartburn', 'gastric ulcer', 'emergency acidity',
        'انتودين', 'أنتودين', 'انتودين حقن', 'فاموتيدين', 'حموضة شديدة', 'حرقان المعدة', 'حقن معدة', 'قرحة'
    ],
    usage: 'يستخدم للسيطرة السريعة على إفراز الحمض في حالات الحموضة الحادة، التهاب المعدة، وقرحة المعدة، وهو بديل ممتاز للمرضى غير القادرين على تناول الأقراص.',
    timing: 'حقن عضلي أو وريدي ببطء كل ١٢ ساعة حسب الحاجة السريرية.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Ampoule',
    
    minAgeMonths: 1, // يسمح بالحساب الوزني
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم بالحقن كل ١٢ ساعة. في القصور الكلوي الشديد قد تمدد الفاصل لمرتين يومياً فقط أو ضبط الجرعة.';
        }
        if (ageMonths >= 1) {
            return '٠.٢٥–٠.٥ مجم/كجم بالحقن كل ١٢ ساعة (حد أقصى ٢٠ مجم) داخل المستشفى.';
        }
        return 'للرضع أقل من شهر يقررها طبيب متخصص وبجرعة مخفضة جداً.';
    },
    
    warnings: [
        'تعديل الجرعة في القصور الكلوي (CrCl <50 مل/دقيقة).',
        'يُفضل استخدامه لفترات قصيرة؛ حكة أو دوار بعد الحقن عادة خفيفة.',
        'بيانات الحمل محدودة؛ يُستخدم للضرورة مع المتابعة.',
        'أعد التقييم عند استمرار الألم، نزيف هضمي، أو عدم تحسن خلال ٣–٥ أيام.'
    ]
  },

  // 133. Esmatac 20 mg (7 Caps)
  {
    id: 'esmatac-20-cap-7',
    name: 'Esmatac 20mg 7 Delayed-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] S-isomer PPI for maintenance
    concentration: '20mg',
    price: 27.5, 
    matchKeywords: [
        'esmatac', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach protection', 'mild acidity',
        'ايسماتاك', 'إيسماتاك', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة خفيفة', 'حماية المعدة', 'حرقان'
    ],
    usage: 'لعلاج الارتجاع البسيط وكجرعة وقائية ولحماية المعدة مع المسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة ٧ أيام؛ يمكن تكراره حسب الحاجة مع تقييم طبي.';
        }
        return 'للأطفال تحت ١٢ سنة استخدم تركيزات أصغر أو الأكياس .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 والعظام مع الاستخدام الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 134. Esomeprazole-eva 40 mg vials
  {
    id: 'esomeprazole-eva-40-vial',
    name: 'Esomeprazole-eva 40mg 3 Powder for I.V. Infusion Vials',
    genericName: 'Esomeprazole', // [GREEN] Potent S-isomer PPI (I.V. Form)
    concentration: '40mg',
    price: 204, 
    matchKeywords: [
        'esomeprazole-eva', 'esomeprazole eva', 'esomeprazole vial', 'i.v.', 'gastric bleeding', 'reflux injection',
        'ايسوميبرازول ايفا', 'إيسوميبرازول إيفا حقن', 'حقنة معدة', 'نزيف المعدة', 'حموضة حادة', 'حقن وريد'
    ],
    usage: 'يستخدم للسيطرة الفورية على إفراز الحمض في حالات نزيف القرحة الهضمية، الارتجاع الشديد، والوقاية من قرحة الإجهاد للمرضى في الرعاية المركزة.',
    timing: 'حقن وريدي مرة واحدة يومياً؛ يمكن تكرارها في النزيف النشط حسب بروتوكول الطبيب.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // للسماح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { // 18+ years
            return '٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد يبدأ الطبيب بجرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة لفترة قصيرة.';
        }
        if (ageMonths >= 1) {
            return '٠.٥–١ مجم/كجم بالوريد مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل المستشفى.';
    },
    
    warnings: [
        'مخصص للوريد فقط؛ يمنع الحقن العضلي.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'راقب المغنيسيوم/B12 عند الاستخدام الطويل ووظائف الكبد في المرضى المعرضين.',
        'توقف وقيّم عند أي تفاعل تحسسي أو عدم تحسن/نزيف مستمر.'
    ]
  },

  // 135. Antodine 20mg (6 Amps)
  {
    id: 'antodine-20-amp-6',
    name: 'Antodine 20mg 6 I.M./I.V. Ampoules',
    genericName: 'Famotidine', // [GREEN] Efficient H2-Receptor Antagonist
    concentration: '20mg',
    price: 78, 
    matchKeywords: [
        'antodine', 'antodine amp', 'famotidine', 'injection', 'acidity', 'emergency gerd', 'stomach pain',
        'انتودين', 'أنتودين', 'انتودين حقن', 'فاموتيدين', 'حقنة حموضة', 'حرقان المعدة', 'حقن وريد وعضل'
    ],
    usage: 'يوفر راحة سريعة من أعراض زيادة حموضة المعدة، ويستخدم في حالات الطوارئ لعلاج قرحة المعدة والارتجاع، خاصة لمن يعانون من صعوبة في البلع.',
    timing: 'حقن عضلي أو وريدي ببطء كل ١٢ ساعة حسب الحالة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Ampoule',
    
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم بالحقن كل ١٢ ساعة. في القصور الكلوي الشديد قد تمدد الفاصل أو تخفض الجرعة.';
        }
        if (ageMonths >= 1) {
            return '٠.٢٥–٠.٥ مجم/كجم بالحقن كل ١٢ ساعة (حد أقصى ٢٠ مجم) حسب التشخيص والمتابعة.';
        }
        return 'للخدج أو أقل من شهر تُحدد الجرعة ببروتوكول متخصص.';
    },
    
    warnings: [
        'تعديل الجرعة في القصور الكلوي (CrCl <50 مل/دقيقة).',
        'يُفضل الاستخدام القصير؛ دوار أو صداع عابر محتمل بعد الحقن.',
        'بيانات الحمل محدودة؛ يُستخدم للضرورة مع المتابعة.',
        'أعد التقييم عند استمرار الألم أو نزيف هضمي أو عدم تحسن خلال أيام.'
    ]
 }, 
// 136. Azgovanc 40/1100mg (7 Caps) - [CORRECTED]
  {
    id: 'azgovanc-40-cap-7',
    name: 'Azgovanc 40/1100mg 7 Capsules',
    genericName: 'Omeprazole + Sodium Bicarbonate', // [GREEN] Immediate Release PPI Technology
    concentration: '40mg / 1100mg',
    price: 47.5, 
    matchKeywords: [
        'azgovanc', 'azgovanc 40', 'omeprazole', 'sodium bicarbonate', 'fast relief', 'immediate release', 'gerd',
        'أزجوفانك', 'ازجوفانك', 'أوميبرازول', 'بيكربونات الصوديوم', 'حموضة سريعة', 'حرقان فوري', 'ارتجاع المريء'
    ],
    usage: 'تركيبة فورية؛ بيكربونات الصوديوم تعادل الحمض سريعاً والأوميبرازول يوفر تغطية ممتدة.',
    timing: 'على معدة فارغة قبل الطعام بـ ٦٠ دقيقة مع كوب ماء؛ لا يؤخذ مع الطعام.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 55,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'كبسولة واحدة يومياً قبل الإفطار. يمكن مؤقتاً كبسولة مرتين يومياً حسب التشخيص وبمدة قصيرة.';
        }
        return 'غير مخصص لمن هم دون ١٨ عاماً بسبب الصوديوم العالي؛ استخدم بدائل أقل صوديوم للأطفال.';
    },
    
    warnings: [
        'يحتوي على ١١٠٠ مجم صوديوم؛ تجنب استخدامه في فشل القلب أو الضغط غير المنضبط أو الحميات منخفضة الصوديوم إلا بتوجيه متخصص.',
        'استخدام قصير لا يتجاوز ٤–٨ أسابيع لتجنب اختلال الأملاح أو القلاء الاستقلابي.',
        'راقب التداخل مع كلوبيدوجريل؛ يُفضل بدائل بانتوبرازول لمرضى القلب.',
        'أعد التقييم فوراً عند إسهال شديد، نزيف هضمي، أو فقدان وزن غير مبرر.'
    ]
  },

  // 137. Delpanto 40 mg
  {
    id: 'delpanto-40-tab',
    name: 'Delpanto 40mg 14 Enteric-Coated Tablets',
    genericName: 'Pantoprazole', // [GREEN] Stable and well-tolerated PPI
    concentration: '40mg',
    price: 84, 
    matchKeywords: [
        'delpanto', 'delpanto 40', 'pantoprazole', 'acidity', 'gerd', 'stomach protection', 'ulcer', 'heartburn',
        'ديلبانتو', 'ديل بانتو', 'بانتوبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'حماية المعدة', 'حرقان'
    ],
    usage: 'يستخدم بفاعلية في علاج حالات ارتجاع المريء، قرحة المعدة والاثنى عشر، كما يُعد من أفضل الخيارات لحماية المعدة عند استخدام المسكنات لفترات طويلة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان أفضل تثبيط للحمض.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة قد تُعطى مرتين يومياً لمدة ١٠–١٤ يوماً .';
        }
        return 'غير مخصص لمن هم دون ١٢ عاماً؛ استخدم تركيز ٢٠ مجم عند الحاجة.';
    },
    
    warnings: [
        'تداخلات قليلة مع كلوبيدوجريل؛ مناسب لمرضى القلب مقارنة ببعض الـPPIs الأخرى.',
        'الحذر في القصور الكبدي الشديد؛ راقب إنزيمات الكبد إذا طال الاستخدام.',
        'مراقبة مغنيسيوم/B12 والعظام مع الاستخدام المزمن خاصة في كبار السن.',
        'أعلام حمراء: نزيف، فقدان وزن، قيء دموي، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 138. Esmatac 20 mg (14 Caps)
  {
    id: 'esmatac-20-cap-14',
    name: 'Esmatac 20mg 14 Delayed-Release Capsules',
    genericName: 'Esomeprazole', // [GREEN] Efficient PPI for maintenance therapy
    concentration: '20mg',
    price: 76, 
    matchKeywords: [
        'esmatac', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach protection', 'maintenance dose',
        'ايسماتاك', 'إيسماتاك', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة', 'حماية المعدة', 'حرقان الصدر'
    ],
    usage: 'لعلاج الارتجاع المتوسط وكجرعة وقائية طويلة الأمد وحماية المعدة مع المسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة ١٤ يوماً؛ يمكن تمديدها أو تكرارها حسب التشخيص وإعادة التقييم.';
        }
        return 'للأطفال تحت ١٢ سنة استخدم تركيزات أصغر أو الأكياس .';
    },
    
    warnings: [
        'الحمل: فئة B؛ يستخدم عند الضرورة.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'مراقبة: نقص مغنيسيوم/B12 والعظام مع الاستخدام الطويل؛ فكر في مكملات حسب التشخيص والمتابعة.',
        'أعلام حمراء: نزيف، قيء دموي، فقدان وزن، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 139. Pantonap 40 mg (20 Tabs)
  {
    id: 'pantonap-40-tab-20',
    name: 'Pantonap 40mg 20 Tablets',
    genericName: 'Pantoprazole', // [GREEN] High safety profile PPI
    concentration: '40mg',
    price: 149, 
    matchKeywords: [
        'pantonap', 'pantonap 40', 'pantoprazole', 'gerd', 'stomach ulcer', 'heartburn', 'gastric protection',
        'بانتوناب', 'بانتو ناب', 'بانتوبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'حماية المعدة', 'حرقان الصدر'
    ],
    usage: 'يعمل على تقليل إنتاج حمض المعدة بفاعلية، مما يساعد في علاج التهاب المريء الارتجاعي وقرحة المعدة، ويقلل من خطر حدوث قرحة ناتجة عن المسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان ثبات المفعول.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع. في جرثومة المعدة قد تُعطى مرتين يومياً لمدة ١٠–١٤ يوماً .';
        }
        return 'غير مخصص لمن هم دون ١٢ عاماً؛ استخدم تركيز ٢٠ مجم عند الحاجة.';
    },
    
    warnings: [
        'تداخلات قليلة مع كلوبيدوجريل؛ مناسب لمرضى القلب مقارنة ببعض الـPPIs الأخرى.',
        'الحذر في القصور الكبدي الشديد؛ راقب إنزيمات الكبد إذا طال الاستخدام.',
        'مراقبة مغنيسيوم/B12 والعظام مع الاستخدام المزمن خاصة في كبار السن.',
        'أعلام حمراء: نزيف، فقدان وزن، قيء دموي، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 140. Gasec 20 mg
  {
    id: 'gasec-20-cap',
    name: 'Gasec 20mg 14 Capsules',
    genericName: 'Omeprazole', // [GREEN] Proven classic PPI
    concentration: '20mg',
    price: 37.7, 
    matchKeywords: [
        'gasec', 'gasec 20', 'omeprazole', 'gastritis', 'gerd', 'heartburn', 'stomach ulcer', 'acidity',
        'جاسيك', 'جاسيك ٢٠', 'أوميبرازول', 'حموضة', 'ارتجاع المريء', 'حرقان المعدة', 'التهاب المعدة', 'قرحة'
    ],
    usage: 'يستخدم لتقليل إنتاج حمض المعدة، مما يساعد في علاج قرحة المعدة والاثنى عشر، والتهابات جدار المعدة، وحالات ارتجاع المريء البسيطة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً على الريق) لتحسين الامتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 60, // 5 years للأقراص القابلة للبلع
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { // 12 years+
            return '٢٠ مجم مرة يومياً قبل الإفطار. يمكن زيادتها إلى مرتين يومياً لمدة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        if (ageMonths >= 60 && weight >= 20) { // 5-11 years
            return '٢٠ مجم مرة يومياً لمدة ٤–٨ أسابيع لعلاج الارتجاع؛ أعد التقييم إذا لم يتحسن المريض.';
        }
        return 'للأطفال الأصغر أو أقل من ٢٠ كجم يفضل الأشكال السائلة/الجرعات الأصغر ١ مجم/كجم .';
    },
    
    warnings: [
        'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
        'يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول ومضادات الحموضة السائلة لتحسين الامتصاص.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو هشاشة؛ راقب عند الاستعمال المزمن.',
        'أعد التقييم عند صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب.'
    ]
  },

  // 141. Futapan 20 mg
  {
    id: 'futapan-20-tab',
    name: 'Futapan 20mg 14 Enteric-Coated Tablets',
    genericName: 'Pantoprazole', // [GREEN] High safety profile PPI for maintenance
    concentration: '20mg',
    price: 72, 
    matchKeywords: [
        'futapan', 'futapan 20', 'pantoprazole', 'gerd', 'heartburn', 'stomach protection', 'mild acidity',
        'فيوتابان', 'فيوتا بان', 'بانتوبرازول', 'حموضة خفيفة', 'ارتجاع المريء', 'حماية المعدة', 'حرقان'
    ],
    usage: 'لعلاج الارتجاع البسيط والمتوسط كجرعة صيانة ولحماية المعدة مع المسكنات.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لضمان أفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة ١٤ يوماً؛ يمكن تكرارها حسب التشخيص وإعادة التقييم.';
        }
        if (ageMonths >= 60 && weight >= 20) { 
            return '٢٠ مجم مرة يومياً لمدة ٤–٨ أسابيع لعلاج الارتجاع حسب التشخيص والمتابعة.';
        }
        return 'للأطفال الأصغر يفضل الأشكال السائلة أو تركيزات أقل بجرعة ١ مجم/كجم .';
    },
    
    warnings: [
        'تداخلات قليلة مع كلوبيدوجريل؛ خيار مناسب لمرضى القلب.',
        'الحذر في القصور الكبدي الشديد؛ راقب إنزيمات الكبد إذا طال الاستخدام.',
        'مراقبة مغنيسيوم/B12 والعظام عند الاستعمال المزمن خاصة في كبار السن.',
        'أعلام حمراء: نزيف، فقدان وزن، قيء دموي، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 142. Pantroglob 40 mg Vial
  {
    id: 'pantroglob-40-vial',
    name: 'Pantroglob 40mg Powder for I.V. Infusion Vial',
    genericName: 'Pantoprazole', // [GREEN] Highly stable PPI for I.V. use
    concentration: '40mg',
    price: 66, 
    matchKeywords: [
        'pantroglob', 'pantroglob vial', 'pantoprazole', 'i.v. injection', 'gastric bleeding', 'ulcer prophylaxis',
        'بانتوجلوب', 'بانتوجلوب حقن', 'بانتوبرازول', 'حقنة معدة', 'نزيف المعدة', 'حموضة حادة', 'وقاية المعدة'
    ],
    usage: 'يستخدم للسيطرة السريعة على حموضة المعدة في الحالات الحادة، والوقاية من نزيف القرحة الناتج عن الإجهاد، وللمرضى غير القادرين على تناول الأدوية بالفم.',
    timing: 'حقن وريدي مرة واحدة يومياً؛ قد تُكرر كل ١٢ ساعة في النزيف الشديد حسب التشخيص والحالة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // يسمح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد يبدأ بجرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة لفترة قصيرة.';
        }
        if (ageMonths >= 1) {
            return '٠.٨–١ مجم/كجم بالوريد مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل المستشفى.';
    },
    
    warnings: [
        'مخصص للوريد فقط؛ يمنع الحقن العضلي.',
        'تداخلات قليلة مع كلوبيدوجريل؛ خيار آمن لمرضى القلب.',
        'راقب المغنيسيوم/B12 عند الاستخدام الطويل ووظائف الكبد في المرضى المعرضين.',
        'توقف وقيّم عند أي تفاعل تحسسي أو عدم تحسن/نزيف مستمر.'
    ]
  },

  // 143. Burnaway 10 mg (30 Tabs)
  {
    id: 'burnaway-10-tab-30',
    name: 'Burnaway 10mg 30 Enteric-Coated Tablets',
    genericName: 'Rabeprazole', // [GREEN] Fastest acting PPI in the family
    concentration: '10mg',
    price: 66, 
    matchKeywords: [
        'burnaway', 'burn away', 'burnaway 10', 'rabeprazole', 'gerd', 'maintenance', 'heartburn', 'gastritis',
        'بيرن اواي', 'بيرن أواى', 'رابيبرازول', 'حموضة', 'حرقان المعدة', 'ارتجاع المريء', 'صيانة المعدة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء البسيطة، وكجرعة وقائية طويلة الأمد لمنع عودة الأعراض، ويتميز بسرعة مفعوله في السيطرة على الحموضة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لأفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '١٠ مجم مرة يومياً قبل الإفطار كجرعة صيانة لشهر. يمكن زيادة الجرعة أو التكرار حسب التشخيص وإعادة التقييم.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم بدائل مناسبة للأطفال.';
    },
    
    warnings: [
        'بيانات الحمل محدودة؛ يستخدم عند الضرورة.',
        'تداخلات قليلة مع كلوبيدوجريل مقارنة بوميبرازول/إيسوميبرازول، لكن يفضل المتابعة في مرضى القلب.',
        'مراقبة مغنيسيوم/B12 عند الاستخدام الطويل؛ فكر في دعم الكالسيوم/فيتامين D عند عوامل خطورة هشاشة.',
        'أعلام حمراء: نزيف، فقدان وزن، قيء دموي، أو عسر بلع يتطلب تقييماً عاجلاً.'
    ]
  },

  // 144. Esomepex 40 mg Vial
  {
    id: 'esomepex-40-vial',
    name: 'Esomepex 40mg Powder for I.V. Infusion Vial',
    genericName: 'Esomeprazole', // [GREEN] Potent S-isomer PPI (I.V. Form)
    concentration: '40mg',
    price: 41.5, 
    matchKeywords: [
        'esomepex', 'esomepex vial', 'esomeprazole', 'i.v. injection', 'gastric bleeding', 'reflux injection',
        'إيسوميبكس', 'ايسوميبكس حقن', 'ايسوميبرازول', 'حقنة معدة', 'نزيف المعدة', 'حموضة حادة', 'حقن وريد'
    ],
    usage: 'يستخدم للسيطرة السريعة والقوية على حموضة المعدة، وعلاج حالات الارتجاع المريئي الشديدة، والوقاية من نزيف القرحة الناتج عن الإجهاد في حالات العمليات.',
    timing: 'حقن وريدي مرة واحدة يومياً؛ قد تُكرر في النزيف النشط حسب بروتوكول الطبيب.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // يسمح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { // 18+ years
            return '٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد يبدأ الطبيب بجرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة لفترة قصيرة.';
        }
        if (ageMonths >= 1) {
            return '٠.٥–١ مجم/كجم بالوريد مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل المستشفى.';
    },
    
    warnings: [
        'مخصص للوريد فقط؛ يمنع الحقن العضلي.',
        'تداخلات: يقلل فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير؛ راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'راقب المغنيسيوم/B12 عند الاستخدام الطويل ووظائف الكبد في المرضى المعرضين.',
        'توقف وقيّم عند أي تفاعل تحسسي أو عدم تحسن/نزيف مستمر.'
    ]
  },

  // 145. Gasec 20 mg (7 Caps)
  {
    id: 'gasec-20-cap-7',
    name: 'Gasec 20mg 7 Capsules',
    genericName: 'Omeprazole', // [GREEN] Trusted Swiss-quality Pellets
    concentration: '20mg',
    price: 26.4, 
    matchKeywords: [
        'gasec', 'gasec 20', 'omeprazole', 'heartburn', 'gastritis', 'gerd', 'acid reflux', 'short course',
        'جاسيك', 'جاسيك ٢٠', 'أوميبرازول', 'حموضة', 'حرقان المعدة', 'ارتجاع المريء', 'شريط واحد', 'التهاب المعدة'
    ],
    usage: 'يستخدم لتقليل إفراز حمض المعدة بفاعلية، مما يساعد في علاج حالات الحموضة العارضة، والتهابات المعدة، وكحماية للمعدة عند تناول أدوية قوية لمدة قصيرة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً على الريق) لتحسين الامتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 60, // 5 years للأقراص القابلة للبلع
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة ٧ أيام؛ يمكن زيادتها إلى مرتين يومياً لمدة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        if (ageMonths >= 60 && weight >= 20) {
            return '٢٠ مجم مرة يومياً لمدة ٤–٨ أسابيع لعلاج الارتجاع؛ أعد التقييم إذا لم يتحسن المريض.';
        }
        return 'للأطفال الأصغر أو أقل من ٢٠ كجم يفضل الأشكال السائلة/الجرعات الأصغر ١ مجم/كجم .';
    },
    
    warnings: [
        'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
        'يفصل ساعتان عن الحديد/ليفوثيروكسين/كيتوكونازول ومضادات الحموضة السائلة لتحسين الامتصاص.',
        'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 أو هشاشة؛ راقب عند الاستعمال المزمن.',
        'أعد التقييم عند صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب.'
    ]
  },

  // 146. Esmoproton 40 mg (20 Caps)
  {
    id: 'esmoproton-40-cap-20',
    name: 'Esmoproton 40mg 20 Capsules',
    genericName: 'Esomeprazole', // [GREEN] High-quality Esomeprazole by Marcyrl
    concentration: '40mg',
    price: 162, 
    matchKeywords: [
        'esmoproton', 'esmoproton 40', 'esomeprazole', 'gerd', 'erosive esophagitis', 'heartburn', 'stomach ulcer',
        'ايسموبروتون', 'إيسموبروتون', 'ايسوميبرازول', 'ارتجاع المريء', 'حموضة شديدة', 'قرحة المعدة', 'حرقان الصدر'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء الحادة، والتهاب المريء التآكلي، كما يُعد خياراً قوياً ضمن بروتوكول علاج جرثومة المعدة وللوقاية من قرحة المعدة الناتجة عن المسكنات.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (يفضل صباحاً على الريق) لضمان أفضل امتصاص وكبح للحمض.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٤–٨ أسابيع؛ في بروتوكول جرثومة المعدة قد تُستخدم مرتين يومياً مع المضاد الحيوي حسب التشخيص وخطة العلاج.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة؛ استخدم تركيزات أقل أو استشر متخصص أطفال.';
    },
    
    warnings: [
                'قد يقلل من فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير. راقب الوارفارين/الميثوتركسات عالي الجرعة.',
                'استخدام طويل الأمد قد يسبب نقص مغنيسيوم/B12 وهشاشة؛ فكر في مكملات الكالسيوم/فيتامين D عند عوامل الخطورة.',
                'أعلام حمراء: صعوبة بلع، قيء دموي، فقدان وزن غير مبرر، أو ألم صدر مصاحب تتطلب تقييماً عاجلاً.',
                'أعد التقييم إذا لزم تكرار الاستخدام أكثر من ٨ أسابيع دون مراجعة.'
    ]
  },

    // 147. Megaprazole 20 mg Vial
  {
    id: 'megaprazole-20-vial',
    name: 'Megaprazole 20mg Powder for I.V. Infusion Vial',
    genericName: 'Omeprazole', // [GREEN] Proven PPI for IV administration
    concentration: '20mg',
    price: 21, 
    matchKeywords: [
        'megaprazole', 'megaprazole vial', 'omeprazole', 'i.v. injection', 'stomach ulcer', 'acidity', 'gerd',
        'ميجابرازول', 'ميجابرازول حقن', 'أوميبرازول', 'حقنة معدة', 'حقنة حموضة', 'حقن وريد'
    ],
    usage: 'يستخدم لتقليل إفراز حمض المعدة بشكل سريع في حالات قرحة المعدة والارتجاع، وللوقاية من قرحة الإجهاد في العمليات الجراحية.',
    timing: 'حقن وريدي مرة واحدة يومياً؛ قد تُكرر كل ١٢ ساعة لفترة قصيرة في النزيف الحاد حسب التشخيص والمتابعة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // يسمح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠–٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد يبدأ بجرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة لفترة قصيرة.';
        }
        if (ageMonths >= 1) {
            return '٠.٨–١ مجم/كجم بالوريد مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل الرعاية.';
    },
    
    warnings: [
                'مخصص للوريد فقط؛ لا يحقن عضلياً. لا تخلطه مع أدوية أخرى في نفس المحلول.',
                'يقلل من فاعلية كلوبيدوجريل؛ فضل بانتوبرازول للمرضى على مضادات الصفيحات.',
                'راقب المغنيسيوم/B12 عند الاستخدام الطويل ووظائف الكبد في المرضى المعرضين.',
                'توقف وقيّم عند أي تفاعل تحسسي أو نزيف مستمر.'
    ]
  },

  // 148. Neximerican 40 mg (21 Caps)
  {
    id: 'neximerican-40-cap-21',
    name: 'Neximerican 40mg 21 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Potent S-isomer PPI
    concentration: '40mg',
    price: 79, 
    matchKeywords: [
        'neximerican', 'nexi american', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer',
        'نكسيميريكان', 'نكسي ميريكان', 'نيكسيميريكان', 'ايسوميبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء الحادة، والتهاب المريء التآكلي، كما يعمل كحماية قوية للمعدة من آثار المسكنات ويدخل في بروتوكولات علاج جرثومة المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً على الريق) لضمان أفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٣ أسابيع؛ في الحالات الشديدة يمكن مرتين يومياً لفترة قصيرة حسب التشخيص والمتابعة.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة أو أقل من ٣٥ كجم؛ استخدم تركيزات أقل.';
    },
    
    warnings: [
                'قد يقلل من فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير. راقب الوارفارين/الميثوتركسات عالي الجرعة.',
                'استخدام طويل الأمد قد يسبب نقص مغنيسيوم/B12 وهشاشة؛ فكر في مكملات الكالسيوم/فيتامين D عند عوامل الخطورة.',
                'أعلام حمراء: صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب تتطلب تقييماً عاجلاً.',
                'أعد التقييم إذا لزم التكرار أكثر من ٨ أسابيع أو لم تتحسن الأعراض خلال أسبوعين.'
    ]
  },

  // 149. Ocuseellerge 0.05% Eye Drops
  {
    id: 'ocuseellerge-05-eye-drop',
    name: 'Ocuseellerge 0.05% Eye Drops 5ml',
    genericName: 'Azelastine', // [GREEN] Potent Antihistamine for ocular use
    concentration: '0.05%',
    price: 30, 
    matchKeywords: [
        'ocuseellerge', 'ocusalerg', 'azelastine', 'eye drops', 'eye allergy', 'itchy eyes', 'redness',
        'أوكيوسيلليرج', 'اوكيوسيلرج', 'أزيلستين', 'قطرة عين', 'حساسية العين', 'هرش العين', 'احمرار العين'
    ],
    usage: 'تستخدم لتخفيف أعراض حساسية العين الموسمية والدائمة، مثل الحكة الشديدة، الاحمرار، والدموع المستمرة الناتجة عن التعرض للأتربة.',
    timing: 'قطرة واحدة بكل عين مرتين يومياً (صباحاً ومساءً)؛ في الشدة يمكن حتى ٤ مرات حسب التشخيص والمتابعة.',
    category: Category.OPHTHALMIC, 
    form: 'Eye Drops',
    
    minAgeMonths: 48, // 4 years
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 48) { 
            return 'قطرة واحدة في كل عين مرتين يومياً؛ في الحالات الشديدة يمكن زيادتها إلى ٤ مرات حسب توصية طبيب الرمد.';
        } else {
            return 'لا ينصح باستخدامها للأطفال دون سن ٤ سنوات إلا بجرعات معتمدة لطب العيون.';
        }
    },
    
    warnings: [
                'قد تسبب وخزاً أو طعماً مُراً عابراً بعد التقطير؛ يقل سريعاً.',
                'تُطرح بعد ٢٨ يوماً من الفتح حتى لو تبقى محلول.',
                'تشوش الرؤية مؤقتاً؛ تجنب القيادة أو تشغيل آلات حتى تزول الضبابية.',
                'نادرة: نعاس خفيف أو حساسية موضعية؛ توقف واستشر طبيب الرمد عند احمرار شديد أو تورم.'
    ]
  },

  // 150. Omecarbex 20/1100mg (20 Caps)
  {
    id: 'omecarbex-20-cap-20',
    name: 'Omecarbex 20/1100mg 20 Capsules',
    genericName: 'Omeprazole + Sodium Bicarbonate', // [GREEN] Immediate Release PPI Technology
    concentration: '20mg / 1100mg',
    price: 86, 
    matchKeywords: [
        'omecarbex', 'omecarbex 20', 'omeprazole', 'sodium bicarbonate', 'heartburn', 'gerd', 'fast relief',
        'أوميكاربكس', 'اوميكاربكس', 'أوميبرازول', 'بيكربونات الصوديوم', 'حموضة سريعة', 'حرقان المعدة', 'ارتجاع'
    ],
    usage: 'يتميز بتركيبة ثنائية المفعول؛ بيكربونات الصوديوم تعادل الحموضة فوراً وتحمي الأوميبرازول من التكسر، مما يسمح بامتصاصه السريع جداً.',
    timing: 'كبسولة واحدة على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً) لضمان الامتصاص السريع.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return '٢٠ مجم مرة يومياً على معدة فارغة. يمكن مضاعفة الجرعة لفترة قصيرة في الحالات الشديدة . يفضل ألا يتجاوز الاستخدام الذاتي ١٤ يوماً بسبب محتوى الصوديوم.';
        }
        return 'لا يفضل استخدامه للأطفال أو المراهقين دون ١٨ عاماً بسبب الحمل الصوديومي العالي؛ استخدم بدائل أخرى.';
    },
    
    warnings: [
                'يحتوي على صوديوم عالٍ (١١٠٠ مجم بيكربونات ≈ 300 مجم صوديوم/كبسولة)؛ تجنب الاستخدام في الضغط غير المنضبط، قصور القلب، أو القصور الكلوي الشديد.',
                'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
                'استخدام طويل قد يسبب قلاء استقلابي أو ارتفاع صوديوم؛ قصر الاستخدام الذاتي على ١٤ يوماً ما لم يقرر الطبيب خلاف ذلك.',
                'راقب مغنيسيوم/B12 والعظام عند الاستعمال المزمن مثل أي PPI.'
    ]
  },

  // 151. Omecarbex 40/1100mg (20 Caps)
  {
    id: 'omecarbex-40-cap-20',
    name: 'Omecarbex 40/1100mg 20 Capsules',
    genericName: 'Omeprazole + Sodium Bicarbonate', // [GREEN] High-strength Immediate Release PPI
    concentration: '40mg / 1100mg',
    price: 98, 
    matchKeywords: [
        'omecarbex', 'omecarbex 40', 'omeprazole', 'sodium bicarbonate', 'heartburn', 'gerd', 'fast relief',
        'أوميكاربكس', 'اوميكاربكس ٤٠', 'أوميبرازول', 'بيكربونات الصوديوم', 'حموضة شديدة', 'حرقان المعدة'
    ],
    usage: 'توفر تعادلاً فورياً للحموضة مع أعلى تركيز من الأوميبرازول للسيطرة الفائقة على حالات الارتجاع والتهاب المعدة الشديد.',
    timing: 'كبسولة واحدة على معدة فارغة قبل الأكل بـ ٣٠–٦٠ دقيقة؛ لا تؤخذ مع الطعام لضمان الامتصاص السريع.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return '٤٠ مجم مرة يومياً على معدة فارغة. في الحالات الشديدة يمكن تقسيمها مرتين يومياً لفترة قصيرة. يفضل ألا يتجاوز الاستخدام الذاتي ١٤ يوماً بسبب الحمل الصوديومي العالي.';
        }
        return 'غير مخصص للأطفال أو من هم دون ١٨ عاماً بسبب محتوى الصوديوم العالي؛ استخدم بدائل مناسبة.';
    },
    
    warnings: [
                'حمل صوديومي مرتفع؛ تجنب الاستخدام في الضغط غير المنضبط، قصور القلب أو القصور الكلوي الشديد، أو الحميات قليلة الملح.',
                'قد يقلل من فاعلية كلوبيدوجريل؛ استشر طبيب القلب قبل الدمج.',
                'قصر الاستخدام الذاتي على ١٤ يوماً لتجنب قلاء استقلابي أو ارتفاع صوديوم؛ راقب المغنيسيوم/B12 عند الاستخدام المطول.',
                'قد يسبب امتلاء أو تجشؤ عابر نتيجة البيكربونات.'
    ]
  },

  // 152. Pantoloc 40mg Vial
  {
    id: 'pantoloc-40-vial',
    name: 'Pantoloc 40mg Powder for I.V. Infusion Vial',
    genericName: 'Pantoprazole', // [GREEN] Original Innovator Brand (Takeda)
    concentration: '40mg',
    price: 62, 
    matchKeywords: [
        'pantoloc', 'pantoloc vial', 'pantoprazole', 'i.v. injection', 'gastric bleeding', 'original pantoprazole',
        'بانتولوك', 'بانتولوك حقن', 'بانتوبرازول', 'حقنة معدة', 'نزيف المعدة', 'الحقنة الأصلية'
    ],
    usage: 'الدواء الأصلي (البراند) لمادة البانتوبرازول؛ يستخدم في المستشفيات للسيطرة الفورية على نزيف القرحة، الارتجاع الحاد، وحماية المعدة.',
    timing: 'يُعطى بالحقن الوريدي مرة واحدة يومياً، ويمكن زيادتها حسب التشخيص وشدة النزيف في حالات النزيف النشط.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // يسمح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد تُستخدم جرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة لفترة قصيرة حسب التشخيص وشدة النزيف.';
        }
        if (ageMonths >= 1) {
            return '٠.٨–١ مجم/كجم بالوريد مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل الرعاية.';
    },
    
    warnings: [
                'مخصص للوريد فقط؛ لا يحقن في العضل أو مع محاليل أخرى في نفس الخط دون غسل جيد.',
                'تداخلات قليلة مع كلوبيدوجريل؛ خيار آمن لمرضى القلب مقارنة بوميبرازول.',
                'راقب المغنيسيوم/B12 ووظائف الكبد في الاستخدام الطويل. توقف وقيّم عند تحسس أو نزيف مستمر.',
                'يستخدم المحلول خلال ٣ ساعات (٢٤ ساعة مبرداً) للحفاظ على الفاعلية.'
    ]
  },

  // 153. Stomopral 40 mg (14 Caps)
  {
    id: 'stomopral-40-cap-14',
    name: 'Stomopral 40mg 14 Capsules',
    genericName: 'Pantoprazole', // [GREEN] Reliable and safe PPI
    concentration: '40mg',
    price: 72, 
    matchKeywords: [
        'stomopral', 'stomopral 40', 'pantoprazole', 'gerd', 'stomach protection', 'ulcer', 'heartburn',
        'ستوموبرال', 'ستومو برال', 'بانتوبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'حماية المعدة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء، قرحة المعدة والاثنى عشر، ويعد خياراً ممتازاً لحماية المعدة عند استخدام الأدوية المسكنة.',
    timing: 'قبل الإفطار بـ ٣٠–٦٠ دقيقة على معدة فارغة لتحسين الامتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة أسبوعين؛ يمكن مدها إلى ٤–٨ أسابيع حسب الحاجة الطبية.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة أو أقل من ٣٥ كجم؛ استخدم تركيزات أقل.';
    },
    
    warnings: [
                'آمن نسبياً مع كلوبيدوجريل؛ خيار مناسب لمرضى القلب.',
                'راقب مغنيسيوم/B12 والعظام عند الاستخدام الطويل؛ احذر في القصور الكبدي الشديد.',
                'أعلام حمراء: نزيف، صعوبة بلع، فقدان وزن غير مبرر، ألم صدر مصاحب تتطلب تقييماً عاجلاً.',
                'أعد التقييم إذا لم تتحسن الأعراض بعد ٢–٤ أسابيع.'
    ]
  },

  // 154. Neximerican 40 mg (7 Caps)
  {
    id: 'neximerican-40-cap-7',
    name: 'Neximerican 40mg 7 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Powerful S-isomer PPI
    concentration: '40mg',
    price: 26.33, 
    matchKeywords: [
        'neximerican', 'nexi american', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer',
        'نكسيميريكان', 'نكسي ميريكان', 'ايسوميبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'شريط واحد'
    ],
    usage: 'يستخدم للسيطرة القوية على إفراز حمض المعدة، وعلاج حالات ارتجاع المريء الحادة، والتهاب المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً على الريق) لضمان أفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ٧ أيام؛ يمكن زيادة إلى مرتين يومياً لفترة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة أو أقل من ٣٥ كجم؛ استخدم تركيزات أقل.';
    },
    
    warnings: [
                'قد يقلل من فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير. راقب الوارفارين/الميثوتركسات عالي الجرعة.',
                'استخدام طويل الأمد قد يسبب نقص مغنيسيوم/B12 وهشاشة؛ فكر في مكملات الكالسيوم/فيتامين D عند عوامل الخطورة.',
                'أعلام حمراء: صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب تتطلب تقييماً عاجلاً.',
                'أعد التقييم إذا لم تتحسن الأعراض بعد انتهاء الشريط أو إذا احتجت تكرار الكورس.'
    ]
  },

  // 155. Patrimac 20 mg (28 Tabs)
  {
    id: 'patrimac-20-tab-28',
    name: 'Patrimac 20mg 28 Enteric-Coated Tablets',
    genericName: 'Rabeprazole Sodium', // [GREEN] Fast-acting PPI (Rabeprazole)
    concentration: '20mg',
    price: 66, 
    matchKeywords: [
        'patrimac', 'patrimac 20', 'rabeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer',
        'باتريماك', 'باتريماك ٢٠', 'رابيبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة', 'علبة كبيرة'
    ],
    usage: 'يتميز باحتوائه على مادة الرابيبرازول سريعة المفعول في السيطرة على أعراض ارتجاع المريء وحرقان المعدة.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً) لتحسين الامتصاص وسرعة المفعول.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٢٠ مجم مرة يومياً قبل الإفطار لمدة تصل إلى ٨ أسابيع؛ أقل تداخل مع كلوبيدوجريل مقارنة بوميبرازول/إيسوميبرازول.';
        }
        return 'غير مخصص للأطفال تحت ١٢ عاماً؛ استخدم بدائل مناسبة أو استشر متخصص أطفال.';
    },
    
    warnings: [
                'أقل تأثيراً على كلوبيدوجريل مقارنة بوميبرازول/إيسوميبرازول لكنه ما زال يتطلب المتابعة.',
                'الاستخدام الطويل قد يسبب نقص مغنيسيوم/B12 وهشاشة؛ راقب العظام عند عوامل خطورة.',
                'أعلام حمراء: نزيف، صعوبة بلع، فقدان وزن غير مبرر، أو ألم صدر مصاحب تتطلب تقييماً عاجلاً.',
                'أعد التقييم إذا لم تتحسن الأعراض خلال ٢–٤ أسابيع.'
    ]
  },

  // 156. Pantoloc 40mg Vial (Duplicate check)
  {
    id: 'pantoloc-40-vial-alt',
    name: 'Pantoloc 40mg Powder for I.V. Infusion Vial',
    genericName: 'Pantoprazole', // [GREEN] Original Innovator Brand
    concentration: '40mg',
    price: 62, 
    matchKeywords: [
        'pantoloc', 'pantoloc vial', 'pantoprazole', 'i.v. injection', 'gastric bleeding',
        'بانتولوك', 'بانتولوك حقن', 'بانتوبرازول', 'حقنة معدة', 'نزيف المعدة'
    ],
    usage: 'يستخدم في المستشفيات للسيطرة الفورية على نزيف القرحة والارتجاع الحاد وحماية المعدة.',
    timing: 'يُعطى بالحقن الوريدي مرة واحدة يومياً داخل المستشفى أو العيادة.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Vial',
    
    minAgeMonths: 0, // يسمح بالحساب الوزني في المستشفى
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '٤٠ مجم بالوريد مرة يومياً. في النزيف الحاد قد تُستخدم جرعة تحميل ثم ٤٠ مجم كل ١٢ ساعة لفترة قصيرة حسب التشخيص وشدة النزيف.';
        }
        if (ageMonths >= 1) {
            return '٠.٨–١ مجم/كجم بالوريد مرة يومياً (حد أقصى ٤٠ مجم) داخل المستشفى و.';
        }
        return 'للخدج أو أقل من شهر يُستخدم فقط بخطة متخصصة داخل الرعاية.';
    },
    
    warnings: [
                'مخصص للوريد فقط؛ لا يحقن في العضل أو مع محاليل أخرى في نفس الخط دون غسل جيد.',
                'تداخلات قليلة مع كلوبيدوجريل؛ خيار آمن لمرضى القلب مقارنة بوميبرازول.',
                'راقب المغنيسيوم/B12 ووظائف الكبد في الاستخدام الطويل. توقف وقيّم عند تحسس أو نزيف مستمر.',
                'يستخدم المحلول خلال ٣ ساعات (٢٤ ساعة مبرداً) للحفاظ على الفاعلية.'
    ]
  },

  // 157. Neximerican 40 mg (14 Caps)
  {
    id: 'neximerican-40-cap-14',
    name: 'Neximerican 40mg 14 Capsules',
    genericName: 'Esomeprazole', // [GREEN] Potent S-isomer PPI
    concentration: '40mg',
    price: 138, 
    matchKeywords: [
        'neximerican', 'nexi american', 'esomeprazole', 'gerd', 'heartburn', 'acid reflux', 'stomach ulcer',
        'نكسيميريكان', 'نكسي ميريكان', 'ايسوميبرازول', 'حموضة', 'ارتجاع المريء', 'قرحة المعدة'
    ],
    usage: 'يستخدم لعلاج حالات ارتجاع المريء الحادة والتهاب المريء التآكلي، وحماية المعدة من قرحة المسكنات.',
    timing: 'قبل الأكل بـ ٣٠–٦٠ دقيقة (صباحاً على الريق) لضمان أفضل امتصاص.',
    category: Category.ACID_RELATED_DISORDERS, 
    form: 'Capsule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { 
            return '٤٠ مجم مرة يومياً قبل الإفطار لمدة ١٤ يوماً؛ يمكن التمديد أو الزيادة مرتين يومياً لفترة قصيرة في الحالات الشديدة حسب التشخيص والمتابعة.';
        }
        return 'غير مخصص لمن هم دون ١٢ سنة أو أقل من ٣٥ كجم؛ استخدم تركيزات أقل.';
    },
    
    warnings: [
        'قد يقلل من فاعلية كلوبيدوجريل؛ يُمنع مع ريلبيفيرين/نلفينافير/أتازانافير. راقب الوارفارين/الميثوتركسات عالي الجرعة.',
        'استخدام طويل الأمد قد يسبب نقص مغنيسيوم/B12 وهشاشة؛ فكر في مكملات الكالسيوم/فيتامين D عند عوامل الخطورة.',
        'أعلام حمراء: صعوبة بلع، نزيف هضمي، فقدان وزن غير مبرر، أو ألم صدر مصاحب تتطلب تقييماً عاجلاً.',
        'أعد التقييم إذا لم تتحسن الأعراض بعد ١٤ يوماً أو احتجت تكرار الكورس.'
    ]
 },

  
];

const sanitizeMedication = (m: Medication): Medication => ({
	...m,
	timing: sanitizeTimingText(m.timing),
	warnings: sanitizeWarnings(m.warnings),
	calculationRule: (w, a) => sanitizeDoseText(m.calculationRule(w, a)),
});

export const ACID_RELATED_DISORDERS_2: Medication[] = ACID_RELATED_DISORDERS_2_RAW.map(sanitizeMedication);

