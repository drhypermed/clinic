
import { Medication, Category } from '../../types';

const fixed = (t: string) => () => t;

const COMMON_TOPICAL_WARNINGS = [
	'للاستخدام الخارجي فقط.',
	'تجنب ملامسة العين/الفم إلا إذا كان المنتج مخصصاً لذلك.',
	'إذا زاد الاحمرار/الحكة أو ظهر تهيج شديد: أوقفه.',
];

const COMMON_STEROID_TOPICAL_WARNINGS = [
	...COMMON_TOPICAL_WARNINGS,
	'يحتوي على كورتيزون: لا يُستخدم لفترات طويلة أو على الوجه/الثنيات/حول العين.',
	'لا يُستخدم على عدوى فيروسية (مثل الهربس) أو فطريات غير مُشخّصة.',
];

const makeFusidicPlain = (args: {
	id: string;
	name: string;
	genericName: string;
	concentration: string;
	price: number;
	form: 'Cream' | 'Ointment' | 'Gel';
	matchKeywords?: string[];
}): Medication => ({
	id: args.id,
	name: args.name,
	genericName: args.genericName,
	concentration: args.concentration,
	price: args.price,
	matchKeywords: [...(args.matchKeywords ?? []), 'fusidic', 'fucidin', 'fusi', 'فيوسيدين', 'فيوسيديك', '#topical antibiotic', '#antibiotics'],
	usage: 'مضاد حيوي موضعي (فيوسيدك أسيد/فيوسيدات) لعدوى جلدية بكتيرية سطحية (مثل impetigo/folliculitis/جروح ملتهبة سطحية).',
	timing: '٢–٣ مرات يومياً – ٧–١٠ أيام',
	category: Category.TOPICAL_ANTIBIOTICS,
	form: args.form,
	minAgeMonths: 1,
	maxAgeMonths: 1200,
	minWeight: 3,
	maxWeight: 250,
	calculationRule: fixed('طبقة رقيقة على المنطقة المصابة ٢–٣ مرات يومياً لمدة ٧–١٠ أيام'),
	warnings: [...COMMON_TOPICAL_WARNINGS, 'تجنب الاستخدام على مساحات كبيرة لفترات طويلة.'],
});

const makeFusidicSteroidCombo = (args: {
	id: string;
	name: string;
	genericName: string;
	concentration: string;
	price: number;
	form: 'Cream';
	matchKeywords?: string[];
}): Medication => ({
	id: args.id,
	name: args.name,
	genericName: args.genericName,
	concentration: args.concentration,
	price: args.price,
	matchKeywords: [
		...(args.matchKeywords ?? []),
		'fusidic',
		'fucicort',
		'fusi-zon',
		'betafucin',
		'hydrofusidic',
		'فيوسيكورت',
		'فيوسي زون',
		'#antibiotics',
		'#glucocorticoid',
		'#topical antibiotic',
	],
	usage: 'كريم (مضاد حيوي + كورتيزون) لالتهاب جلدي ملتهب مع عدوى بكتيرية سطحية/إكزيما ملتهبة مُعدية.',
	timing: 'مرتين يومياً – ٥–٧ أيام',
	category: Category.TOPICAL_ANTIBIOTICS,
	form: args.form,
	minAgeMonths: 24,
	maxAgeMonths: 1200,
	minWeight: 10,
	maxWeight: 250,
	calculationRule: fixed('طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٥–٧ أيام'),
	warnings: [...COMMON_STEROID_TOPICAL_WARNINGS],
});

export const TOPICAL_ANTIBIOTICS_GROUP: Medication[] = [
	// 1) fucicort cream 15 gram
	makeFusidicSteroidCombo({
		id: 'fucicort-cream-15gm',
		name: 'Fucicort cream 15 gram',
		genericName: 'fusidic acid & betamethasone',
		concentration: 'cream 15 gm',
		price: 60,
		form: 'Cream',
		matchKeywords: ['fucicort 15'],
	}),
	// 2) fucicort cream 30 gm
	makeFusidicSteroidCombo({
		id: 'fucicort-cream-30gm',
		name: 'Fucicort cream 30 gm',
		genericName: 'fusidic acid & betamethasone',
		concentration: 'cream 30 gm',
		price: 100,
		form: 'Cream',
		matchKeywords: ['fucicort 30'],
	}),
	// 9) fucicort cream 20 gm
	makeFusidicSteroidCombo({
		id: 'fucicort-cream-20gm',
		name: 'Fucicort cream 20 gm',
		genericName: 'fusidic acid & betamethasone',
		concentration: 'cream 20 gm',
		price: 70,
		form: 'Cream',
		matchKeywords: ['fucicort 20'],
	}),

	// 14) betafucin cream 15 gm
	makeFusidicSteroidCombo({
		id: 'betafucin-cream-15gm',
		name: 'Betafucin cream 15 gm',
		genericName: 'fusidic acid & betamethasone',
		concentration: 'cream 15 gm',
		price: 37,
		form: 'Cream',
		matchKeywords: ['betafucin'],
	}),

	// 24) futasone cream 15 gm
	makeFusidicSteroidCombo({
		id: 'futasone-cream-15gm',
		name: 'Futasone cream 15 gm',
		genericName: 'fusidic acid & betamethasone',
		concentration: 'cream 15 gm',
		price: 10,
		form: 'Cream',
		matchKeywords: ['futasone'],
	}),

	// 7) fusi-zon cream 30 gm
	makeFusidicSteroidCombo({
		id: 'fusi-zon-cream-30gm',
		name: 'Fusi-zon cream 30 gm',
		genericName: 'hydrocortisone acetate & fusidic acid',
		concentration: 'cream 30 gm',
		price: 83,
		form: 'Cream',
		matchKeywords: ['fusi-zon 30'],
	}),
	// 8) fusi-zon cream 15 gm
	makeFusidicSteroidCombo({
		id: 'fusi-zon-cream-15gm',
		name: 'Fusi-zon cream 15 gm',
		genericName: 'hydrocortisone acetate & fusidic acid',
		concentration: 'cream 15 gm',
		price: 48,
		form: 'Cream',
		matchKeywords: ['fusi-zon 15'],
	}),
	// 13) hydrofusidic cream 20 gm
	makeFusidicSteroidCombo({
		id: 'hydrofusidic-cream-20gm',
		name: 'Hydrofusidic cream 20 gm',
		genericName: 'fusidic acid & hydrocortisone acetate',
		concentration: 'cream 20 gm',
		price: 58,
		form: 'Cream',
		matchKeywords: ['hydrofusidic'],
	}),
	// 16) fostinocort topical cream 20 gm
	makeFusidicSteroidCombo({
		id: 'fostinocort-cream-20gm',
		name: 'Fostinocort topical cream 20 gm',
		genericName: 'betamethasone valerate (micronized) & fusidic acid (micronized)',
		concentration: 'cream 20 gm',
		price: 43,
		form: 'Cream',
		matchKeywords: ['fostinocort'],
	}),

	// 3) fucidin 2% cream 15 gm
	makeFusidicPlain({
		id: 'fucidin-2pct-cream-15gm',
		name: 'Fucidin 2% cream 15 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 15 gm',
		price: 56,
		form: 'Cream',
		matchKeywords: ['fucidin 15', 'فيوسيدين كريم'],
	}),
	// 4) fucidin 2% cream 20 gm
	makeFusidicPlain({
		id: 'fucidin-2pct-cream-20gm',
		name: 'Fucidin 2% cream 20 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 20 gm',
		price: 69,
		form: 'Cream',
		matchKeywords: ['fucidin 20'],
	}),
	// 10) fucidin 2% cream 30 gm
	makeFusidicPlain({
		id: 'fucidin-2pct-cream-30gm',
		name: 'Fucidin 2% cream 30 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 30 gm',
		price: 96,
		form: 'Cream',
		matchKeywords: ['fucidin 30'],
	}),
	// 5) fucidin 2% ointment 15 gm
	makeFusidicPlain({
		id: 'fucidin-2pct-oint-15gm',
		name: 'Fucidin 2% ointment 15 gm',
		genericName: 'sodium fusidate',
		concentration: '2% ointment 15 gm',
		price: 56,
		form: 'Ointment',
		matchKeywords: ['fucidin oint', 'فيوسيدين مرهم'],
	}),
	// 17) fucidin 2% ointment 20 gm
	makeFusidicPlain({
		id: 'fucidin-2pct-oint-20gm',
		name: 'Fucidin 2% ointment 20 gm',
		genericName: 'sodium fusidate',
		concentration: '2% ointment 20 gm',
		price: 69,
		form: 'Ointment',
		matchKeywords: ['fucidin oint 20'],
	}),
	// 11) fucidin 2% ointment 30 gm
	makeFusidicPlain({
		id: 'fucidin-2pct-oint-30gm',
		name: 'Fucidin 2% ointment 30 gm',
		genericName: 'sodium fusidate',
		concentration: '2% ointment 30 gm',
		price: 96,
		form: 'Ointment',
		matchKeywords: ['fucidin oint 30'],
	}),

	// 6) fusi 2% cream 15 gm
	makeFusidicPlain({
		id: 'fusi-2pct-cream-15gm',
		name: 'Fusi 2% cream 15 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 15 gm',
		price: 44,
		form: 'Cream',
		matchKeywords: ['fusi 15', 'فيوسي كريم'],
	}),
	// 18) fusi 2% cream 30 gm
	makeFusidicPlain({
		id: 'fusi-2pct-cream-30gm',
		name: 'Fusi 2% cream 30 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 30 gm',
		price: 79,
		form: 'Cream',
		matchKeywords: ['fusi 30'],
	}),
	// 12) fusi 2% oint. 15 gm
	makeFusidicPlain({
		id: 'fusi-2pct-oint-15gm',
		name: 'Fusi 2% oint. 15 gm',
		genericName: 'sodium fusidate',
		concentration: '2% ointment 15 gm',
		price: 38,
		form: 'Ointment',
		matchKeywords: ['fusi oint 15', 'فيوسي مرهم'],
	}),
	// 19) fusi 2% oint. 30 gm
	makeFusidicPlain({
		id: 'fusi-2pct-oint-30gm',
		name: 'Fusi 2% oint. 30 gm',
		genericName: 'sodium fusidate',
		concentration: '2% ointment 30 gm',
		price: 68,
		form: 'Ointment',
		matchKeywords: ['fusi oint 30'],
	}),

	// 15) fusiderm 2% gel 15 gm
	makeFusidicPlain({
		id: 'fusiderm-2pct-gel-15gm',
		name: 'Fusiderm 2% gel 15 gm',
		genericName: 'fusidic acid',
		concentration: '2% gel 15 gm',
		price: 12.75,
		form: 'Gel',
		matchKeywords: ['fusiderm gel'],
	}),
	// 20) fusiderm 2% cream 15 gm
	makeFusidicPlain({
		id: 'fusiderm-2pct-cream-15gm',
		name: 'Fusiderm 2% cream 15 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 15 gm',
		price: 44,
		form: 'Cream',
		matchKeywords: ['fusiderm cream'],
	}),
	// 21) fusiderm 2% oint. 15 gm
	makeFusidicPlain({
		id: 'fusiderm-2pct-oint-15gm',
		name: 'Fusiderm 2% oint. 15 gm',
		genericName: 'sodium fusidate',
		concentration: '2% ointment 15 gm',
		price: 30,
		form: 'Ointment',
		matchKeywords: ['fusiderm oint'],
	}),
	// 22) fucidel 2% cream 15 gm
	makeFusidicPlain({
		id: 'fucidel-2pct-cream-15gm',
		name: 'Fucidel 2% cream 15 gm',
		genericName: 'fusidic acid',
		concentration: '2% cream 15 gm',
		price: 44,
		form: 'Cream',
		matchKeywords: ['fucidel'],
	}),
	// 23) fusibact oint 30 gm
	makeFusidicPlain({
		id: 'fusibact-oint-30gm',
		name: 'Fusibact oint 30 gm',
		genericName: 'fusidic acid',
		concentration: 'ointment 30 gm',
		price: 30,
		form: 'Ointment',
		matchKeywords: ['fusibact'],
	}),
];

