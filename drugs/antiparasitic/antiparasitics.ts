
import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const roundTo = (n: number, step: number): number => {
	if (!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
	return Math.round(n / step) * step;
};

const doseIvermectin6mgTablets = (weightKg: number) => {
	// Standard common regimen: 200 mcg/kg (0.2 mg/kg) single dose
	const doseMg = clamp(weightKg * 0.2, 0, 24); // soft clamp to avoid weird values
	const tablets = Math.max(1, roundTo(doseMg / 6, 0.5));
	return { doseMg, tablets };
};

const dosePraziquantel600mgTablets = (weightKg: number) => {
	// Commonly used total daily dose for schistosomiasis is ~40 mg/kg in divided doses.
	// Dosing varies by indication; keep calculation general and weight-based.
	const totalDoseMg = clamp(weightKg * 40, 0, 6000);
	const totalTablets = Math.max(1, roundTo(totalDoseMg / 600, 0.5));
	return { totalDoseMg, totalTablets };
};

export const ANTIPARASITIC_GROUP: Medication[] = [
	// ملاحظة: تم كتابة إرشادات عربية مباشرة وبصياغة محايدة.
	// وبدون عبارات من نوع (طبقاً للنشرة...). عند اختلاف الجرعات حسب نوع العدوى تم ذكر ذلك بصياغة عامة.

	// 1) flagyl 500mg 20 tab.
	{
		id: 'flagyl-500-tabs',
		name: 'flagyl 500mg 20 tab.',
		genericName: 'metronidazole',
		concentration: '500mg',
		price: 34,
		matchKeywords: ['flagyl 500', 'flagyl', 'metronidazole', 'فلاجيل ٥٠٠', 'مطهر معوي', '#antiprotozoal', '#diarrhea', 'طفيليات', 'ديدان', 'أميبا', 'worms', 'parasitic'],
		usage: 'ميترونيدازول لعلاج الأميبيا/الجيارديا وبعض عدوى البكتيريا اللاهوائية.',
		timing: 'كل ٨ ساعات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — كل ٨ ساعات — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة.', 'قد يسبب طعم معدني/غثيان/تغير لون البول مؤقتاً.']
	},

	// 2) hydroquine 200mg 20 tab.
	{
		id: 'hydroquine-200-20-tabs-antiparasitic',
		name: 'hydroquine 200mg 20 tab.',
		genericName: 'hydroxychloroquine sulphate',
		concentration: '200mg',
		price: 82,
		matchKeywords: ['hydroquine', 'hydroxychloroquine', 'هيدروكوين', 'مضاد ملاريا', '#antiprotozoal', '#anti-malarial', '#antirheumatic'],
		usage: 'هيدروكسي كلوروكوين (مضاد ملاريا/مُعدّل مناعة) لاستخدامات محددة.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => '200mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['قد يسبب اضطراباً بالرؤية/حساسية ضوء لدى بعض المرضى.', 'تداخلات دوائية متعددة خصوصاً مع أدوية تطيل QT.']
	},

	// 3) nanazoxid 100mg/5ml pd. for oral susp. 60 ml
	{
		id: 'nanazoxid-100-susp',
		name: 'nanazoxid 100mg/5ml pd. for oral susp. 60 ml',
		genericName: 'nitazoxanide',
		concentration: '100mg/5ml',
		price: 39,
		matchKeywords: ['nanazoxid 100', 'nanazoxid', 'nitazoxanide', 'ننازوكسيد', 'طفيليات', 'جيارديا', '#antihelminthics'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية (مثل جيارديا/كريبتوسبوريديوم).',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Suspension',
		minAgeMonths: 12,
		maxAgeMonths: 144,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: (_w, ageMonths) => {
			if (ageMonths >= 48) return '١٠ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
			if (ageMonths >= 12) return '٥ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
			return 'غير مناسب أقل من ١٢ شهر.';
		},
		warnings: ['يفضل أخذه مع الطعام لزيادة الفاعلية.', 'قد يسبب تلون البول بالأصفر الداكن مؤقتاً.']
	},

	// 4) vermizole 200mg 6 tab
	{
		id: 'vermizole-albendazole-200-6-tabs',
		name: 'vermizole 200mg 6 tab',
		genericName: 'albendazole',
		concentration: '200mg',
		price: 30,
		matchKeywords: ['vermizole 200', 'vermizole', 'albendazole', 'فيرميزول', '#antihelmentic', '#worms', 'ديدان', 'طفيليات', 'دبوسية', 'اسكارس', 'worms', 'parasitic'],
		usage: 'ألبيندازول لعلاج الديدان المعوية.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 250,
		calculationRule: (_w, ageMonths) => (ageMonths >= 24 ? '٤٠٠ مجم جرعة واحدة (قرصين ٢٠٠ مجم).' : '٢٠٠ مجم جرعة واحدة (قرص واحد ٢٠٠ مجم).'),
		warnings: ['ممنوع في الحمل (مسخ للأجنة/teratogenic): يجب اختبار حمل سلبي قبل البدء.', 'يُؤخذ مع وجبة دهنية لزيادة الامتصاص.', 'قد يسبب ألم بطن بسيط/غثيان مؤقت.']
	},

	// 5) vermizole 200mg/5ml susp. 30 ml
	{
		id: 'vermizole-albendazole-200-5-susp-30',
		name: 'vermizole 200mg/5ml susp. 30 ml',
		genericName: 'albendazole',
		concentration: '200mg/5ml',
		price: 26,
		matchKeywords: ['vermizole susp', 'vermizole 200/5', 'albendazole suspension', 'فيرميزول شراب', '#anthelmentic'],
		usage: 'معلق ألبيندازول لعلاج الديدان المعوية.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Suspension',
		minAgeMonths: 12,
		maxAgeMonths: 180,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: (_w, ageMonths) => (ageMonths >= 24 ? '١٠ مل جرعة واحدة بعد الأكل (٤٠٠ مجم).' : '٥ مل جرعة واحدة بعد الأكل (٢٠٠ مجم).'),
		warnings: ['ممنوع في الحمل (مسخ للأجنة/teratogenic): يجب اختبار حمل سلبي قبل البدء.', 'يُؤخذ مع وجبة دهنية لزيادة الامتصاص.']
	},

	// 6) plaquenil 200mg 60 f.c.tab.
	{
		id: 'plaquenil-200-60-fc-tabs-antiparasitic',
		name: 'plaquenil 200mg 60 f.c.tab.',
		genericName: 'hydroxychloroquine sulphate',
		concentration: '200mg',
		price: 246,
		matchKeywords: ['plaquenil', 'hydroxychloroquine', 'بلاكونيل', '#antiprotozoal', '#anti-malarial', '#antirheumatic'],
		usage: 'هيدروكسي كلوروكوين (مضاد ملاريا/مُعدّل مناعة) لاستخدامات محددة.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => '200mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['قد يسبب اضطراباً بالرؤية لدى بعض المرضى.', 'تداخلات دوائية متعددة خصوصاً مع أدوية القلب.']
	},

	// 7) alzental 200mg/ml susp. 20ml
	{
		id: 'alzental-albendazole-200mgml-susp-20',
		name: 'alzental 200mg/ml susp. 20ml',
		genericName: 'albendazole',
		concentration: '200mg/ml',
		price: 21,
		matchKeywords: ['alzental', 'albendazole', 'الزينتال', 'ديدان', '#anthelmentic'],
		usage: 'معلق ألبيندازول لعلاج الديدان المعوية.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Suspension',
		minAgeMonths: 12,
		maxAgeMonths: 180,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: (_w, ageMonths) => (ageMonths >= 24 ? '٢ مل (٤٠٠ مجم) جرعة واحدة بعد الأكل.' : '١ مل (٢٠٠ مجم) جرعة واحدة بعد الأكل.'),
		warnings: ['ممنوع في الحمل (مسخ للأجنة/teratogenic): يجب اختبار حمل سلبي قبل البدء.', 'يُؤخذ مع وجبة دهنية لزيادة الامتصاص.']
	},

	// 8) amrizole 500mg 5 vaginal supp.
	{
		id: 'amrizole-500-5-vag-supp-antiparasitic',
		name: 'amrizole 500mg 5 vaginal supp.',
		genericName: 'metronidazole',
		concentration: '500mg (5 vaginal suppositories)',
		price: 10.5,
		matchKeywords: ['amrizole', 'امريزول', 'metronidazole', 'vaginal', '#antiprotozoal', '#nitroimidazoles'],
		usage: 'لبوس مهبلي ميترونيدازول لالتهاب مهبلي بكتيري/طفيلي.',
		timing: 'مرة ليلاً – ٣–٧ أيام',
		category: Category.VAGINAL_INFECTIONS,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '500mg (5 vaginal suppositories) (لبوسة) — مرة ليلاً — بدون اعتبار للأكل — ٣–٧ أيام.',
		warnings: ['قد يسبب تهيجاً موضعياً بسيطاً.', 'ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة.']
	},

	// 9) amrizole 500 mg 20 tabs.
	{
		id: 'amrizole-metronidazole-500-20-tabs',
		name: 'amrizole 500 mg 20 tabs.',
		genericName: 'metronidazole',
		concentration: '500mg',
		price: 25,
		matchKeywords: ['amrizole 500', 'amrizole tabs', 'metronidazole 500', 'امريزول ٥٠٠', '#antiprotozoal', '#nitroimidazoles'],
		usage: 'ميترونيدازول لعلاج عدوى طفيليات/لاهوائيات محددة.',
		timing: 'كل ٨ ساعات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — كل ٨ ساعات — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة.', 'قد يسبب طعم معدني/غثيان/دوخة.']
	},

	// 10) ectomethrin 2.5 % lotion 50 ml
	{
		id: 'ectomethrin-permethrin-2-5-lotion-50',
		name: 'ectomethrin 2.5 % lotion 50 ml',
		genericName: 'permethrin',
		concentration: '2.5%',
		price: 25,
		matchKeywords: ['ectomethrin 2.5', 'permethrin 2.5', 'اكتومثرين ٢.٥', 'جرب', 'قمل', '#scabicide'],
		usage: 'بيرمثرين موضعي للقمل/الجرب حسب التركيز.',
		timing: 'حسب التعليمات – حسب التعليمات',
		category: Category.LICE_SCABIES,
		form: 'Lotion',
		minAgeMonths: 2,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: () => '2.5% (جرعة) — حسب التعليمات — بدون اعتبار للأكل — حسب التعليمات.',
		warnings: ['تجنب ملامسة العينين والفم.', 'قد يحدث تهيج/حكة مؤقتة بعد الاستخدام.']
	},

	// 11) ectomethrin 5% emulsion 50 ml
	{
		id: 'ectomethrin-permethrin-5-emulsion-50',
		name: 'ectomethrin 5% emulsion 50 ml',
		genericName: 'permethrin',
		concentration: '5%',
		price: 55,
		matchKeywords: ['ectomethrin 5 emulsion', 'permethrin 5', 'اكتومثرين ٥', 'جرب', '#scabicide'],
		usage: 'بيرمثرين ٥٪ لعلاج الجرب.',
		timing: 'حسب التعليمات – حسب التعليمات',
		category: Category.LICE_SCABIES,
		form: 'Lotion',
		minAgeMonths: 2,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: () => '5% (جرعة) — حسب التعليمات — بدون اعتبار للأكل — حسب التعليمات.',
		warnings: ['تجنب العينين والفم.', 'قد يحدث حكة بعد العلاج وتتحسن تدريجياً.']
	},

	// 12) ectomethrin 5% lotion 50 ml
	{
		id: 'ectomethrin-permethrin-5-lotion-50',
		name: 'ectomethrin 5% lotion 50 ml',
		genericName: 'permethrin',
		concentration: '5%',
		price: 55,
		matchKeywords: ['ectomethrin 5 lotion', 'permethrin 5 lotion', 'اكتومثرين لوشن ٥', 'جرب', '#scabicide'],
		usage: 'بيرمثرين ٥٪ لعلاج الجرب.',
		timing: 'حسب التعليمات – حسب التعليمات',
		category: Category.LICE_SCABIES,
		form: 'Lotion',
		minAgeMonths: 2,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: () => '5% (جرعة) — حسب التعليمات — بدون اعتبار للأكل — حسب التعليمات.',
		warnings: ['تجنب العينين والفم.']
	},

	// 13) ectomethrin 5% oint. 20 gm
	{
		id: 'ectomethrin-permethrin-5-ointment-20',
		name: 'ectomethrin 5% oint. 20 gm',
		genericName: 'permethrin',
		concentration: '5%',
		price: 21,
		matchKeywords: ['ectomethrin ointment', 'permethrin ointment', 'اكتومثرين مرهم', 'جرب', '#scabicide'],
		usage: 'بيرمثرين ٥٪ مرهم لعلاج الجرب.',
		timing: 'حسب التعليمات – حسب التعليمات',
		category: Category.LICE_SCABIES,
		form: 'Ointment',
		minAgeMonths: 2,
		maxAgeMonths: 1200,
		minWeight: 4,
		maxWeight: 250,
		calculationRule: () => '5% (دهان موضعي) — حسب التعليمات — بدون اعتبار للأكل — حسب التعليمات.',
		warnings: ['تجنب العينين والفم.']
	},

	// 14) iverzine 1% lotion 60 ml
	{
		id: 'iverzine-ivermectin-1-lotion-60',
		name: 'iverzine 1% lotion 60 ml',
		genericName: 'ivermectin',
		concentration: '1%',
		price: 59,
		matchKeywords: ['iverzine lotion 60', 'ivermectin 1%', 'ايفرزين لوشن', 'جرب', '#anthelmentic'],
		usage: 'إيفرمكتين موضعي لعدوى جلدية طفيلية/التهاب مرتبط بها (حسب الاستخدام الموضح).',
		timing: 'مرة يومياً – ١–٣ أيام',
		category: Category.LICE_SCABIES,
		form: 'Lotion',
		minAgeMonths: 60,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 250,
		calculationRule: () => '1% (جرعة) — مرة يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['تجنب العينين والفم.', 'قد يحدث تهيج بسيط مؤقت.']
	},

	// 15) iverzine 1% lotion 120 ml
	{
		id: 'iverzine-ivermectin-1-lotion-120',
		name: 'iverzine 1% lotion 120 ml',
		genericName: 'ivermectin',
		concentration: '1%',
		price: 73,
		matchKeywords: ['iverzine lotion 120', 'ivermectin 1%', 'ايفرزين ١٢٠', 'جرب', '#anthelmentic'],
		usage: 'إيفرمكتين موضعي لاستخدامات جلدية محددة.',
		timing: 'مرة يومياً – ١–٣ أيام',
		category: Category.LICE_SCABIES,
		form: 'Lotion',
		minAgeMonths: 60,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 250,
		calculationRule: () => '1% (جرعة) — مرة يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['تجنب العينين والفم.']
	},

	// 16) nanazoxid 500mg 18 f.c. tabs.
	{
		id: 'nanazoxid-500-tabs',
		name: 'nanazoxid 500mg 18 f.c. tabs.',
		genericName: 'nitazoxanide',
		concentration: '500mg',
		price: 114,
		matchKeywords: ['nanazoxid 500', 'nitazoxanide 500', 'ننازوكسيد ٥٠٠', '#antihelminthics'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية (بالغين/مراهقين).',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['يفضل أخذه مع الطعام لتحسين الامتصاص.', 'قد يسبب تلون البول مؤقتاً.']
	},

	// 17) secnidazole 500mg 4 tab.
	{
		id: 'secnidazole-500-4-tabs',
		name: 'secnidazole 500mg 4 tab.',
		genericName: 'secnidazole',
		concentration: '500mg',
		price: 15,
		matchKeywords: ['secnidazole 500', 'secnidazole', 'سيكنيدازول', '#antiprotozoal'],
		usage: 'سيكنيدازول (مضاد طفيليات/لاهوائيات) لعلاج عدوى محددة مثل الأميبيا/الجيارديا.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٢ جم (قرص) — حسب التعليمات — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['تجنب الكحول أثناء اليوم العلاجي ولمدة ٤٨ ساعة بعده.', 'قد يسبب غثيان/دوخة مؤقتة.']
	},

	// 18) albendazole 400mg 6 tabs
	{
		id: 'albendazole-400-6-tabs',
		name: 'albendazole 400mg 6 tabs',
		genericName: 'albendazole',
		concentration: '400mg',
		price: 46,
		matchKeywords: ['albendazole 400', 'البيـندازول ٤٠٠', 'ديدان', '#anthelmentic'],
		usage: 'ألبيندازول لعلاج الديدان المعوية.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: () => '٤٠٠ مجم (قرص) — حسب التعليمات — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['ممنوع في الحمل (مسخ للأجنة/teratogenic): يجب اختبار حمل سلبي قبل البدء.', 'يُؤخذ مع وجبة دهنية لزيادة الامتصاص.']
	},

	// 19) amrizole 500mg vial 100 ml
	{
		id: 'amrizole-metronidazole-iv-500-100ml',
		name: 'amrizole 500mg vial 100 ml',
		genericName: 'metronidazole',
		concentration: '500mg/100ml',
		price: 47,
		matchKeywords: ['amrizole vial', 'metronidazole iv', 'امريزول فيال', '#antiprotozoal', '#nitroimidazoles'],
		usage: 'ميترونيدازول للتسريب الوريدي لعدوى لاهوائية/طفيلية محددة.',
		timing: 'كل ٨ ساعات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'I.V. Infusion Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 250,
		calculationRule: (weight) => {
			const w = clamp(Number(weight) || 3, 3, 250);
			const doseMg = Math.round(w * 7.5);
			const mg = Math.min(doseMg, 500);
			return `تسريب وريدي ٧٫٥ مجم/كجم كل ٨ ساعات (≈ ${toAr(mg)} مجم لـ ${toAr(Math.round(w))} كجم). ٢٠–٣٠ دقيقة/٥٠٠ مجم.`;
		},
		warnings: ['لا يُستخدم في المنزل.', 'ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة.']
	},

	// 20) amrizole-n 5 vag. supp
	{
		id: 'amrizole-n-metronidazole-nystatin-5-vag-supp-antiparasitic',
		name: 'amrizole-n 5 vag. supp',
		genericName: 'metronidazole & nystatin',
		concentration: '5 vaginal suppositories',
		price: 30,
		matchKeywords: ['amrizole-n', 'metronidazole nystatin', 'امريزول ان', 'vaginal', '#vaginal infections'],
		usage: 'لبوس مهبلي لعلاج التهاب مهبلي مختلط (بكتيري/فطري).',
		timing: 'مرة ليلاً – ٣–٧ أيام',
		category: Category.VAGINAL_INFECTIONS,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '5 vaginal suppositories (لبوسة) — مرة ليلاً — بدون اعتبار للأكل — ٣–٧ أيام.',
		warnings: ['قد يسبب تهيجاً موضعياً بسيطاً.', 'ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة (بسبب ميترونيدازول).']
	},

	// 21) bendax 100mg/5ml susp. 60ml
	{
		id: 'bendax-albendazole-100-5-susp-60',
		name: 'bendax 100mg/5ml susp. 60ml',
		genericName: 'albendazole',
		concentration: '100mg/5ml',
		price: 39,
		matchKeywords: ['bendax', 'albendazole', 'بنداكس', '#anthelmentic'],
		usage: 'معلق ألبيندازول لعلاج الديدان المعوية.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Suspension',
		minAgeMonths: 12,
		maxAgeMonths: 180,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: (_w, ageMonths) => (ageMonths >= 24 ? '٢٠ مل جرعة واحدة بعد الأكل (٤٠٠ مجم).' : '١٠ مل جرعة واحدة بعد الأكل (٢٠٠ مجم).'),
		warnings: ['ممنوع في الحمل (مسخ للأجنة/teratogenic): يجب اختبار حمل سلبي قبل البدء.', 'يُؤخذ مع وجبة دهنية لزيادة الامتصاص.']
	},

	// 22) fladazole 500mg 4 tab.
	{
		id: 'fladazole-secnidazole-500-4-tabs',
		name: 'fladazole 500mg 4 tab.',
		genericName: 'secnidazole',
		concentration: '500mg',
		price: 26,
		matchKeywords: ['fladazole', 'secnidazole', 'فلادازول', '#antiprotozoal'],
		usage: 'سيكنيدازول (مضاد طفيليات/لاهوائيات) لعلاج عدوى محددة مثل الأميبيا/الجيارديا.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٢ جم (قرص) — حسب التعليمات — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['تجنب الكحول أثناء اليوم العلاجي ولمدة ٤٨ ساعة بعده.']
	},

	// 23) fladazole 500mg 5 sachet
	{
		id: 'fladazole-secnidazole-500-5-sachets',
		name: 'fladazole 500mg 5 sachet',
		genericName: 'secnidazole',
		concentration: '500mg',
		price: 11.6,
		matchKeywords: ['fladazole sachet', 'secnidazole sachet', 'فلادازول اكياس', '#antiprotozoal'],
		usage: 'سيكنيدازول أكياس لاستخدامات طفيليات/لاهوائيات محددة.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Sachets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٢ جم (جرعة) — حسب التعليمات — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['تجنب الكحول أثناء اليوم العلاجي ولمدة ٤٨ ساعة بعده.']
	},

	// 24) iverzine 1% cream 30 gm
	{
		id: 'iverzine-ivermectin-1-cream-30',
		name: 'iverzine 1% cream 30 gm',
		genericName: 'ivermectin',
		concentration: '1%',
		price: 42,
		matchKeywords: ['iverzine cream', 'ivermectin cream', 'ايفرزين كريم', '#anthelmentic'],
		usage: 'إيفرمكتين كريم موضعي لاستخدامات جلدية محددة.',
		timing: 'مرة يومياً – ١–٣ أيام',
		category: Category.DERMA_CARE,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '1% (دهان موضعي) — مرة يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['قد يسبب تهيجاً بسيطاً مؤقتاً.']
	},

	// 25) iverzine 1% topical spray 60 ml
	{
		id: 'iverzine-ivermectin-1-spray-60',
		name: 'iverzine 1% topical spray 60 ml',
		genericName: 'ivermectin',
		concentration: '1%',
		price: 59,
		matchKeywords: ['iverzine spray', 'ivermectin spray', 'ايفرزين سبراي', '#anthelmentic'],
		usage: 'إيفرمكتين سبراي موضعي لاستخدامات جلدية محددة.',
		timing: 'مرة يومياً – ١–٣ أيام',
		category: Category.DERMA_CARE,
		form: 'Spray',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '1% (بخة) — مرة يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'تجنب العينين والفم.']
	},

	// 26) iverzine 6mg 24 tabs.
	{
		id: 'iverzine-ivermectin-6-24-tabs',
		name: 'iverzine 6mg 24 tabs.',
		genericName: 'ivermectin',
		concentration: '6mg',
		price: 84,
		matchKeywords: ['iverzine 6', 'ivermectin 6', 'ايفرزين ٦ مجم', 'جرب', '#anthelmentic', 'ديدان', 'طفيليات', 'worms', 'parasitic', 'scabies'],
		usage: 'إيفرمكتين أقراص لعلاج عدوى طفيلية محددة (مثل الجرب/ديدان قوية حسب التشخيص).',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 60,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: (weight) => {
			const { doseMg, tablets } = doseIvermectin6mgTablets(weight);
			return `${toAr(tablets)} قرص (٦ مجم) جرعة واحدة (≈ ${toAr(Math.round(doseMg))} مجم إجمالي) ثم تُكرر بعد ٧–١٤ يوم في الجرب.`;
		},
		warnings: ['قد يسبب دوخة/غثيان مؤقت.', 'يُتجنب للأطفال أقل من ١٥ كجم.']
	},

	// 27) iverzine 6mg 8 tab.
	{
		id: 'iverzine-ivermectin-6-8-tabs',
		name: 'iverzine 6mg 8 tab.',
		genericName: 'ivermectin',
		concentration: '6mg',
		price: 28,
		matchKeywords: ['iverzine 6 8', 'ivermectin 6', 'ايفرزين ٨ اقراص', '#anthelmentic'],
		usage: 'إيفرمكتين أقراص لعدوى طفيلية محددة.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 60,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: (weight) => {
			const { doseMg, tablets } = doseIvermectin6mgTablets(weight);
			return `${toAr(tablets)} قرص جرعة واحدة (≈ ${toAr(Math.round(doseMg))} مجم إجمالي).`;
		},
		warnings: ['قد يسبب دوخة/غثيان مؤقت.', 'يُتجنب للأطفال أقل من ١٥ كجم.']
	},

	// 28) nitazode 100mg/5ml 60ml susp.
	{
		id: 'nitazode-100-susp',
		name: 'nitazode 100mg/5ml 60ml susp.',
		genericName: 'nitazoxanide',
		concentration: '100mg/5ml',
		price: 44,
		matchKeywords: ['nitazode 100', 'nitazode', 'nitazoxanide', 'نيتازود', '#antihelminthics'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية (مثل جيارديا).',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Suspension',
		minAgeMonths: 12,
		maxAgeMonths: 144,
		minWeight: 8,
		maxWeight: 60,
		calculationRule: (_w, ageMonths) => {
			if (ageMonths >= 48) return '١٠ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
			if (ageMonths >= 12) return '٥ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
			return 'غير مناسب أقل من ١٢ شهر.';
		},
		warnings: ['يفضل أخذه مع الطعام لزيادة الفاعلية.', 'قد يسبب تلون البول مؤقتاً.']
	},

	// 29) nitazode 500mg 18 f.c. tabs.
	{
		id: 'nitazode-nitazoxanide-500-18-fc-tabs',
		name: 'nitazode 500mg 18 f.c. tabs.',
		genericName: 'nitazoxanide',
		concentration: '500mg',
		price: 99,
		matchKeywords: ['nitazode 500', 'nitazoxanide 500', 'نيتازود ٥٠٠', '#antihelminthics'],
		usage: 'نيتازوكسانيد أقراص لعلاج عدوى طفيلية معوية.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['يفضل أخذه مع الطعام لزيادة الامتصاص.', 'قد يسبب تلون البول مؤقتاً.']
	},

	// 30) biltricide 600 mg 4 f.c.tabs.
	{
		id: 'biltricide-praziquantel-600-4-fc-tabs',
		name: 'biltricide 600 mg 4 f.c.tabs.',
		genericName: 'praziquantel',
		concentration: '600mg',
		price: 33,
		matchKeywords: ['biltricide', 'praziquantel', 'بيلتريسيد', 'برازيكوانتيل', 'ديدان شريطية', 'بلهارسيا', '#anthelmentic', '#worms'],
		usage: 'برازيكوانتيل لعلاج بعض الديدان (مثل البلهارسيا/الديدان الشريطية) حسب التشخيص.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 48,
		maxAgeMonths: 1200,
		minWeight: 15,
		maxWeight: 250,
		calculationRule: (weight) => {
			const { totalDoseMg, totalTablets } = dosePraziquantel600mgTablets(weight);
			return `إجمالي جرعة اليوم ≈ ${toAr(Math.round(totalDoseMg))} مجم (≈ ${toAr(totalTablets)} قرص ٦٠٠ مجم) وتُقسم على ٢–٣ جرعات في نفس اليوم حسب نوع الدودة.`;
		},
		warnings: ['قد يسبب دوخة/غثيان/ألم بطن مؤقت.', 'يُفضل تجنب القيادة إذا حدث دوار.']
	},

	// 31) chloroquine phosphate 250 mg 20 tabs.
	{
		id: 'chloroquine-phosphate-250-20-tabs',
		name: 'chloroquine phosphate 250 mg 20 tabs.',
		genericName: 'chloroquine phosphate',
		concentration: '250mg',
		price: 20,
		matchKeywords: ['chloroquine', 'chloroquine phosphate', 'كلوروكين', 'مضاد ملاريا', '#anti-malarial', '#antiprotozoal'],
		usage: 'كلوروكين فوسفات (مضاد ملاريا) لاستخدامات محددة حسب نوع الملاريا والمنطقة.',
		timing: 'حسب التعليمات – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => '250mg (قرص) — حسب التعليمات — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['تداخلات دوائية متعددة خصوصاً مع أدوية تطيل QT.', 'قد يسبب صداع/دوخة/اضطراب معدة.']
	},

	// 32) cryptonaz 500mg 12 f.c.tab
	{
		id: 'cryptonaz-nitazoxanide-500-12-fc-tabs',
		name: 'cryptonaz 500mg 12 f.c.tab',
		genericName: 'nitazoxanide',
		concentration: '500mg',
		price: 82,
		matchKeywords: ['cryptonaz 500', 'cryptonaz', 'nitazoxanide', 'كريبتوناز', '#antihelminthics', '#antiprotozoal'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية (مثل جيارديا/كريبتوسبوريديوم) حسب الحالة.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['يفضل أخذه مع الطعام لتحسين الامتصاص.', 'قد يسبب تلون البول مؤقتاً.']
	},

	// 33) egygastreaz 500mg 20 tab.
	{
		id: 'egygastreaz-nitazoxanide-500-20-tabs',
		name: 'egygastreaz 500mg 20 tab.',
		genericName: 'nitazoxanide',
		concentration: '500mg',
		price: 122,
		matchKeywords: ['egygastreaz', 'egygastreaz 500', 'nitazoxanide', 'ايجيجاستريز', '#antihelminthics', '#antiprotozoal'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['قد يسبب اضطراب معدة بسيط.', 'قد يسبب تلون البول مؤقتاً.']
	},

	// 34) hydroxytoid 200 mg 20 f.c. tabs
	{
		id: 'hydroxytoid-200-20-fc-tabs-antiparasitic',
		name: 'hydroxytoid 200 mg 20 f.c. tabs',
		genericName: 'hydroxychloroquine sulphate',
		concentration: '200mg',
		price: 40,
		matchKeywords: ['hydroxytoid', 'hydroxychloroquine', 'هيدروكسيتويد', 'مضاد ملاريا', '#antiprotozoal', '#anti-malarial', '#antirheumatic'],
		usage: 'هيدروكسي كلوروكوين (مضاد ملاريا/مُعدّل مناعة) لاستخدامات محددة.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => '200mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — ١–٣ أيام.',
		warnings: ['قد يسبب اضطراباً بالرؤية لدى بعض المرضى.', 'تداخلات دوائية متعددة خصوصاً مع أدوية تطيل QT.']
	},

	// 35) protostop 500mg 6 f.c. tab.
	{
		id: 'protostop-nitazoxanide-500-6-fc-tabs',
		name: 'protostop 500mg 6 f.c. tab.',
		genericName: 'nitazoxanide',
		concentration: '500mg',
		price: 18.5,
		matchKeywords: ['protostop', 'protostop 500', 'nitazoxanide', 'بروتوستوب', '#antihelminthics', '#antiprotozoal'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['قد يسبب اضطراب معدة بسيط.', 'قد يسبب تلون البول مؤقتاً.']
	},

	// 36) spirex plus 20 f.c. tabs.
	{
		id: 'spirex-plus-metronidazole-spiramycin-20-fc-tabs',
		name: 'spirex plus 20 f.c. tabs.',
		genericName: 'metronidazole & spiramycin',
		concentration: 'F.C. Tablets (20)',
		price: 142,
		matchKeywords: ['spirex plus', 'spirex', 'spiramycin', 'metronidazole', 'سبيراكس بلس', 'ميترونيدازول', 'سبيرامايسين', '#antibiotics', '#macrolide', '#nitroimidazoles'],
		usage: 'مضاد حيوي مركب (سبيرامايسين + ميترونيدازول) لعدوى بكتيرية/لاهوائية محددة (غالباً بالفم واللثة/الأسنان) حسب الحالة.',
		timing: 'كل ٨ ساعات – ٣–٧ أيام',
		category: Category.MACROLIDES,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'F.C. Tablets (20) (قرص) — كل ٨ ساعات — مع/بعد الأكل — ٣–٧ أيام.',
		warnings: ['ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة (بسبب ميترونيدازول).', 'قد يسبب اضطراب معدة/طعم معدني مؤقت.']
	},

	// 37) zolifutal 500 mg 12 f.c. tablets
	{
		id: 'zolifutal-nitazoxanide-500-12-fc-tabs',
		name: 'zolifutal 500 mg 12 f.c. tablets',
		genericName: 'nitazoxanide',
		concentration: '500mg',
		price: 37,
		matchKeywords: ['zolifutal', 'zolifutal 500', 'nitazoxanide', 'زوليفيوتال', '#antihelminthics', '#antiprotozoal'],
		usage: 'نيتازوكسانيد لعلاج عدوى طفيلية معوية.',
		timing: 'مرتين يومياً – ١–٣ أيام',
		category: Category.ANTIPARASITIC,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '٥٠٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — ١–٣ أيام.',
		warnings: ['يفضل أخذه مع الطعام لزيادة الامتصاص.', 'قد يسبب تلون البول مؤقتاً.']
	},
];

