
import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

const formatNumber = (n: number): string => {
	const isInt = Math.abs(n - Math.round(n)) < 1e-9;
	return toAr((isInt ? Math.round(n).toString() : n.toFixed(1)).toString());
};

const TAGS = {
	glucocorticoid: ['glucocorticoid', '#glucocorticoid', 'steroid', 'corticosteroid', 'كورتيزون', 'ستيرويد'],
	immunosuppressive: ['immunosuppressive', '#immunosuppressive', 'مثبط مناعة', 'مناعة'],
	antineoplastic: ['antineoplastic', '#antineoplastic', 'oncology', 'سرطان', 'أورام'],
	antirheumatic: ['antirheumatic', '#antirheumatic', 'rheumatology', 'روماتيزم'],
	psoriasis: ['psoriasis', '#psoriasis', 'صدفية'],
	corticosteroids: ['corticosteroids', '#corticosteroids', 'كورتيكوستيرويد'],
};

export const ANTI_NEOPLASTIC_1: Medication[] = [

	// =============================
	// Glucocorticoids (Systemic/Topical)
	// =============================

	// 1. xilone 5mg/5ml syrup 100ml
	{
		id: 'xilone-prednisolone-5mg-5ml-syrup-100',
		name: 'xilone 5mg/5ml syrup 100ml',
		genericName: 'Prednisolone',
		concentration: '5mg/5ml',
		price: 34,
		matchKeywords: ['xilone', 'زيلون', 'prednisolone', 'بريدنيزولون', 'syrup', 'شراب', 'ربو', 'حساسية', 'التهاب', 'ذئبة', 'مفاصل', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي مضاد للالتهاب والحساسية في نوبات الربو، الحساسية الشديدة، التهاب المفاصل، الذئبة، وأمراض مناعية أخرى.',
		timing: 'صباحاً بعد الأكل؛ لفترة قصيرة في النوبات الحادة.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight) => {
			const maxDailyMg = 60;
			const dailyMg = Math.min(maxDailyMg, weight * 1);
			const ml = roundVol(dailyMg);
			return `${formatNumber(ml)} مل صباحاً بعد الأكل ٣–٥ أيام`;
		},
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط وبأقل جرعة لأقصر مدة.',
			'تداخلات: NSAIDs تزيد خطر قرحة/نزيف المعدة. يرفع السكر مع أدوية السكري ويقلل استجابة اللقاحات الحية.',
			'تحذيرات: يرفع سكر/ضغط الدم ويزيد القابلية للعدوى. تجنب مخالطة مرضى الجدري المائي/الحصبة. أعد التقييم عند حرارة أو عدوى.',
		],
	},

	// 2. xilone forte 15mg/5ml syrup 100 ml
	{
		id: 'xilone-forte-prednisolone-15mg-5ml-syrup-100',
		name: 'xilone forte 15mg/5ml syrup 100 ml',
		genericName: 'Prednisolone',
		concentration: '15mg/5ml',
		price: 69,
		matchKeywords: ['xilone forte', 'زيلون فورت', 'prednisolone', 'بريدنيزولون', '15mg/5ml', 'ربو', 'حساسية', 'التهاب مفاصل', 'ذئبة', 'نوبة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي بتركيز أعلى للالتهاب/الحساسية الشديدة، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight) => {
			const maxDailyMg = 60;
			const dailyMg = Math.min(maxDailyMg, weight * 1);
			const ml = roundVol(dailyMg / 3);
			return `${formatNumber(ml)} مل صباحاً بعد الأكل ٣–٥ أيام`;
		},
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط، بأقل جرعة لأقصر مدة.',
			'تداخلات: NSAIDs تزيد خطر النزيف الهضمي. احتباس سوائل مع مدرات/أدوية ضغط. يضعف المناعة مع مثبطات مناعة أخرى.',
			'تحذيرات: متابعة ضغط/سكر/عدوى عند الاستخدام الطويل.',
		],
	},

	// 4. solupred oro 20mg 20 orodispersible tabs.
	{
		id: 'solupred-oro-prednisolone-20mg-odt-20',
		name: 'solupred oro 20mg 20 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '20mg',
		price: 142,
		matchKeywords: ['solupred', 'سولوبريد', 'prednisolone', '20mg', 'orodispersible', 'odt', 'ربو', 'حساسية', 'التهاب', 'نوبة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: (_weight) => '٢٠–٤٠ مجم/يوم صباحاً حسب التشخيص.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط، بأقل جرعة.',
			'تداخلات: NSAIDs تزيد خطر قرحة/نزيف. أدوية السكري قد تحتاج ضبط.',
			'تحذيرات: لا تُوقفه فجأة بعد ٧–١٠ أيام؛ سحب تدريجي. راجع عند عدوى أو حرارة.',
		],
	},

	// 5. xilopred 16 mg 20 tabs.
	{
		id: 'xilopred-methylprednisolone-16mg-tabs-20',
		name: 'xilopred 16 mg 20 tabs.',
		genericName: 'Methylprednisolone',
		concentration: '16mg',
		price: 74,
		matchKeywords: ['xilopred 16', 'زيلوبريد 16', 'methylprednisolone', 'ميثيل بريدنيزولون', 'ربو', 'حساسية', 'التهاب', 'روماتيزم', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل الروماتويدي.',
		timing: 'صباحاً بعد الأكل؛ سحب تدريجي عند الإيقاف بعد الاستخدام المطول.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: () => '١٦–٣٢ مجم/يوم حسب التشخيص. سحب تدريجي.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط، بأقل جرعة.',
			'تداخلات: NSAIDs تزيد خطر النزيف الهضمي. مضادات التجلط قد تزيد النزف.',
			'تحذيرات: يرفع السكر/الضغط ويزيد القابلية للعدوى.',
		],
	},

	// 10. epicopred 20 mg 20 orodispersible tabs.
	{
		id: 'epicopred-prednisolone-20mg-odt-20',
		name: 'epicopred 20 mg 20 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '20mg',
		price: 104,
		matchKeywords: ['epicopred 20', 'ايبيكوبريد 20', 'prednisolone', 'odt', 'ربو', 'حساسية', 'التهاب', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: () => '٢٠–٤٠ مجم/يوم حسب التشخيص.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: يرفع السكر/الضغط ويزيد العدوى.',
		],
	},

	// 11. epicopred 5 mg 30 orodispersible tabs.
	{
		id: 'epicopred-prednisolone-5mg-odt-30',
		name: 'epicopred 5 mg 30 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '5mg',
		price: 69,
		matchKeywords: ['epicopred 5', 'ايبيكوبريد 5', 'prednisolone', 'odt', 'سحب', 'تدرج', 'ربو', 'حساسية', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) بتركيز منخفض؛ لتدرج الجرعة أو السحب التدريجي.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: () => 'حسب الخطة (تجميع/سحب).',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: لا تُوقفه فجأة بعد استعمال مطول.',
		],
	},

	// 12. flazacor 30 mg 10 tabs.
	{
		id: 'hydrocortisone-sodium-succinate-100mg-vial',
		name: 'hydrocortisone sodium succinate 100mg i.v./i.m. vial',
		genericName: 'Hydrocortisone (as sodium succinate)',
		concentration: '100mg/vial',
		price: 26,
		matchKeywords: ['hydrocortisone', 'هيدروكورتيزون', 'sodium succinate', 'حقنة', 'vial', 'iv', 'im', 'صدمة', 'حساسية شديدة', 'قصور كظر', 'ربو حاد', 'طوارئ', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد للحقن (IV/IM) في الحساسية الشديدة، الصدمة، قصور الكظر الحاد، الربو الحاد.',
		timing: 'حسب البروتوكول والجرعة المطلوبة.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'في منشأة طبية فقط. صدمة/حساسية: ١٠٠–٢٠٠ مجم IV؛ قصور كظر: ٥٠–١٠٠ مجم.',
		warnings: [
			'الحمل/الرضاعة: في الطوارئ عند الضرورة القصوى.',
			'تداخلات: يزيد اضطراب السكر/الضغط مع أدوية مزمنة.',
			'تحذيرات: قد يخفي علامات العدوى. متابعة لازمة.',
		],
	},

	// 7. betaderm 0.1% cream 15 gm
	{
		id: 'epizolone-depot-methylprednisolone-acetate-40mg-ml-vial-1ml',
		name: 'epizolone-depot 40mg/ml 1 ml i.m. vial',
		genericName: 'Methylprednisolone acetate',
		concentration: '40mg/ml (1ml)',
		price: 39,
		matchKeywords: ['epizolone', 'ايبيزولون', 'methylprednisolone acetate', 'depot', 'im', 'روماتيزم', 'مفاصل', 'ظهر', 'عصب', 'حقنة عضل', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد depot للحقن العضلي: التهاب مفاصل، انزلاق غضروفي، التهاب أعصاب، حساسية شديدة.',
		timing: 'حقنة واحدة؛ التكرار حسب التشخيص والاستجابة (أسبوع–شهر).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: () => '٤٠–٨٠ مجم IM؛ تكرار ١–٤ أسابيع حسب التشخيص.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: يرفع السكر/الضغط ويزيد العدوى. متابعة لازمة.',
		],
	},

	// 20. xilopred 4mg 20 tablets
	{
		id: 'xilopred-methylprednisolone-4mg-tabs-20',
		name: 'xilopred 4mg 20 tablets',
		genericName: 'Methylprednisolone',
		concentration: '4mg',
		price: 40,
		matchKeywords: ['xilopred 4', 'زيلوبريد 4', 'methylprednisolone', 'سحب', 'تدرج', 'ربو', 'حساسية', 'روماتيزم', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي بجرعة صغيرة؛ لتدرج الجرعة أو السحب أو الصيانة.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => 'حسب الخطة (تجميع/سحب).',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: لا تُوقفه فجأة بعد الاستخدام المطول.',
		],
	},

	// 21. xilone 20 mg 20 orodispersible tabs.
	{
		id: 'xilone-prednisolone-20mg-odt-20',
		name: 'xilone 20 mg 20 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '20mg',
		price: 142,
		matchKeywords: ['xilone 20', 'زيلون 20', 'prednisolone', 'odt', 'ربو', 'حساسية', 'التهاب', 'ذئبة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: () => '٢٠–٤٠ مجم/يوم حسب التشخيص.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: سحب تدريجي عند الإيقاف بعد استعمال مطول.',
		],
	},

	// 28. disprelone-od 20mg 30 orodispersible tabs.
	{
		id: 'disprelone-od-prednisolone-20mg-odt-30',
		name: 'disprelone-od 20mg 30 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '20mg',
		price: 202.5,
		matchKeywords: ['disprelone-od 20', 'ديسبرالون', 'prednisolone', 'odt', 'ربو', 'حساسية', 'التهاب', 'ذئبة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: () => '٢٠–٤٠ مجم/يوم حسب التشخيص. سحب تدريجي.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: سحب تدريجي عند الإيقاف بعد استخدام طويل.',
		],
	},

	// 34. disprelone-d 20mg 20 dispersable tabs.
	{
		id: 'disprelone-d-prednisolone-20mg-dispersable-20',
		name: 'disprelone-d 20mg 20 dispersable tabs.',
		genericName: 'Prednisolone',
		concentration: '20mg',
		price: 116,
		matchKeywords: ['disprelone-d', 'ديسبرالون دي', 'prednisolone', 'dispersible', 'ربو', 'حساسية', 'أطفال', 'ذوبان', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (قابل للذوبان) للالتهاب والحساسية، الربو؛ مناسب لمن يفضل الذوبان في الماء.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Oral Dispersible Tablet',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: () => '٢٠–٤٠ مجم/يوم حسب التشخيص. سحب تدريجي.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: لا تُوقفه فجأة بعد استعمال مطول.',
		],
	},

	// 43. disprelone-od 5mg 30 orodispersible tabs.
	{
		id: 'disprelone-od-prednisolone-5mg-odt-30',
		name: 'disprelone-od 5mg 30 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '5mg',
		price: 84,
		matchKeywords: ['disprelone-od 5', 'ديسبرالون 5', 'prednisolone', 'odt', 'سحب', 'تدرج', 'أطفال', 'ربو', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) بتركيز منخفض؛ لتدرج الجرعة أو السحب أو الصيانة.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: () => 'حسب الخطة (تجميع/سحب).',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: سحب تدريجي عند الإيقاف بعد استخدام طويل.',
		],
	},

	// 26. flacort 30mg 20 tab
	{
		id: 'flacort-deflazacort-30mg-tabs-20',
		name: 'flacort 30mg 20 tab',
		genericName: 'Deflazacort',
		concentration: '30mg',
		price: 164,
		matchKeywords: ['flacort 30', 'فلاكورت 30', 'deflazacort', 'ربو', 'ذئبة', 'ضمور عضلي', 'روماتيزم', ...TAGS.corticosteroids, ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي للالتهاب والحساسية، الربو، الذئبة، الضمور العضلي، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل؛ سحب تدريجي عند الإيقاف.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 250,
		calculationRule: () => '٦–٩٠ مجم/يوم حسب التشخيص. سحب تدريجي.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: متابعة السكر والضغط عند الاستعمال الطويل.',
		],
	},

	// 27. flacort 6mg 20 tabs.
	{
		id: 'flacort-deflazacort-6mg-tabs-20',
		name: 'flacort 6mg 20 tabs.',
		genericName: 'Deflazacort',
		concentration: '6mg',
		price: 54,
		matchKeywords: ['flacort 6', 'فلاكورت 6', 'deflazacort', 'سحب', 'تدرج', 'ربو', 'ضمور عضلي', ...TAGS.corticosteroids, ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي بتركيز منخفض؛ لتدرج الجرعة أو السحب أو الصيانة.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => 'حسب الخطة (تجميع/سحب).',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: لا تُوقفه فجأة بعد استعمال مطول.',
		],
	},

	// 40. pedicort 5mg/5ml syp. 100 ml
	{
		id: 'pedicort-prednisolone-5mg-5ml-syrup-100',
		name: 'pedicort 5mg/5ml syp. 100 ml',
		genericName: 'Prednisolone',
		concentration: '5mg/5ml',
		price: 43,
		matchKeywords: ['pedicort', 'بيديكورت', 'prednisolone', '5mg/5ml', 'شراب', 'أطفال', 'ربو', 'حساسية', 'نوبة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد شراب للالتهاب والحساسية، الربو، الذئبة؛ مناسب للأطفال.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight) => {
			const maxDailyMg = 60;
			const dailyMg = Math.min(maxDailyMg, weight * 1);
			const ml = roundVol(dailyMg);
			return `${formatNumber(ml)} مل صباحاً بعد الأكل ٣–٥ أيام`;
		},
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: يزيد العدوى ويرفع السكر/الضغط.',
		],
	},

	// 45. pedicort forte 15mg/5ml syp. 100 ml
	{
		id: 'pedicort-forte-prednisolone-15mg-5ml-syrup-100',
		name: 'pedicort forte 15mg/5ml syp. 100 ml',
		genericName: 'Prednisolone',
		concentration: '15mg/5ml',
		price: 72,
		matchKeywords: ['pedicort forte', 'بيديكورت فورت', 'prednisolone', '15mg/5ml', 'شراب', 'أطفال', 'ربو', 'حساسية شديدة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد شراب بتركيز أعلى للالتهاب/الحساسية الشديدة، الربو؛ لأطفال يحتاجون جرعة أكبر.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight) => {
			const maxDailyMg = 60;
			const dailyMg = Math.min(maxDailyMg, weight * 1);
			const ml = roundVol(dailyMg / 3);
			return `${formatNumber(ml)} مل صباحاً بعد الأكل ٣–٥ أيام`;
		},
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: يرفع السكر/الضغط.',
		],
	},

	// 16. unipridol 5mg/5ml syp. 100 ml
	{
		id: 'unipridol-prednisolone-5mg-5ml-syrup-100',
		name: 'unipridol 5mg/5ml syp. 100 ml',
		genericName: 'Prednisolone',
		concentration: '5mg/5ml',
		price: 34,
		matchKeywords: ['unipridol', 'يونيبريدول', 'prednisolone', '5mg/5ml', 'شراب', 'ربو', 'حساسية', 'التهاب', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد شراب للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight) => {
			const maxDailyMg = 60;
			const dailyMg = Math.min(maxDailyMg, weight * 1);
			const ml = roundVol(dailyMg);
			return `${formatNumber(ml)} مل صباحاً بعد الأكل ٣–٥ أيام`;
		},
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: سحب تدريجي عند الإيقاف بعد استخدام طويل.',
		],
	},

	// 17. unipridol forte 15mg/5ml syp. 100 ml
	{
		id: 'unipridol-forte-prednisolone-15mg-5ml-syrup-100',
		name: 'unipridol forte 15mg/5ml syp. 100 ml',
		genericName: 'Prednisolone',
		concentration: '15mg/5ml',
		price: 69,
		matchKeywords: ['unipridol forte', 'يونيبريدول فورت', 'prednisolone', 'شراب', 'ربو', 'حساسية شديدة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد شراب بتركيز أعلى للالتهاب/الحساسية الشديدة، الربو.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Syrup',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 250,
		calculationRule: (weight) => {
			const maxDailyMg = 60;
			const dailyMg = Math.min(maxDailyMg, weight * 1);
			const ml = roundVol(dailyMg / 3);
			return `${formatNumber(ml)} مل صباحاً بعد الأكل ٣–٥ أيام`;
		},
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: يزيد العدوى ويرفع السكر/الضغط.',
		],
	},

	// 41. prednisolone 20mg 20 orodispersible tabs.
	{
		id: 'prednisolone-20mg-odt-20',
		name: 'prednisolone 20mg 20 orodispersible tabs.',
		genericName: 'Prednisolone',
		concentration: '20mg',
		price: 115,
		matchKeywords: ['prednisolone 20', 'بريدنيزولون 20', 'odt', 'ربو', 'حساسية', 'التهاب', 'ذئبة', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي (ODT) للالتهاب والحساسية، الربو، الذئبة، التهاب المفاصل.',
		timing: 'صباحاً بعد الأكل.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Orodispersible Tablet',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 250,
		calculationRule: () => 'الجرعة حسب التشخيص: عادة 20–40 مجم/يوم. سحب تدريجي عند الإيقاف.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: سحب تدريجي عند الإيقاف بعد استخدام طويل.',
		],
	},

	// 46. prednisolone 5mg 20 tab.
	{
		id: 'prednisolone-5mg-tabs-20',
		name: 'prednisolone 5mg 20 tab.',
		genericName: 'Prednisolone',
		concentration: '5mg',
		price: 24,
		matchKeywords: ['prednisolone 5', 'بريدنيزولون 5', 'anti-inflammatory', '#anti-inflammatory', 'سحب', 'تدرج', 'ربو', 'حساسية', ...TAGS.glucocorticoid],
		usage: 'كورتيكوستيرويد فموي بتركيز منخفض؛ لتدرج الجرعة أو السحب أو الصيانة.',
		timing: 'صباحاً بعد الإفطار.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 72,
		maxAgeMonths: 1200,
		minWeight: 20,
		maxWeight: 250,
		calculationRule: () => 'حسب الخطة (تجميع/سحب).',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة.',
			'تحذيرات: يرفع السكر/الضغط ويزيد العدوى.',
		],
	},

	// =============================
	// Immunosuppressants / Antirheumatics
	// =============================

	// 15. treczimus 0.03% topical oint. 20 gm
	{
		id: 'imutrexate-methotrexate-5mg-tabs-10',
		name: 'imutrexate 5 mg 10 tabs.',
		genericName: 'Methotrexate',
		concentration: '5mg',
		price: 60,
		matchKeywords: ['imutrexate 5', 'ايموتريكسات', 'methotrexate', 'ميثوتريكسات', 'روماتيزم', 'صدفية', 'أورام', 'مفاصل', 'DMARD', 'كيمو', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات: جرعات أسبوعية في التهاب المفاصل الروماتويدي، الصدفية، أمراض مناعية؛ أو بروتوكولات أورام.',
		timing: 'مرة واحدة أسبوعياً فقط (ليس يومياً).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'مرة أسبوعياً فقط. روماتيزم/صدفية: ٧٫٥–٢٥ مجم/أسبوع. أورام: حسب البروتوكول.',
		warnings: [
			'الحمل: ممنوع؛ تشوهات/إجهاض. منع حمل صارم للرجال والنساء.',
			'تداخلات: NSAIDs، كوتريموكسازول، بنسلينات، PPIs تزيد السمية. لا تُضف أدوية جديدة دون مراجعة.',
			'تحذيرات: تثبيط نخاع، التهاب كبد، التهاب رئة دوائي. راجع فوراً عند كحة، ضيق نفس، كدمات، نزيف، حرارة.',
		],
	},

	// 22. imutrexate 15 mg 10 tabs.
	{
		id: 'imutrexate-methotrexate-15mg-tabs-10',
		name: 'imutrexate 15 mg 10 tabs.',
		genericName: 'Methotrexate',
		concentration: '15mg',
		price: 105,
		matchKeywords: ['imutrexate 15', 'methotrexate 15', 'روماتيزم', 'صدفية', 'أورام', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات أسبوعي: روماتيزم، صدفية، أورام (حسب البروتوكول).',
		timing: 'مرة أسبوعياً فقط.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'مرة أسبوعياً. ٧٫٥–٢٥ مجم/أسبوع (روماتيزم) حسب التحاليل.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: كوتريموكسازول، بنسلينات، PPIs، NSAIDs تزيد السمية.',
			'تحذيرات: متابعة صورة دم، كبد، كلية. راجع عند كحة، ضيق نفس، نزيف، حرارة.',
		],
	},

	// 30. imutrexate 2.5 mg 10 tabs.
	{
		id: 'imutrexate-methotrexate-2-5mg-tabs-10',
		name: 'imutrexate 2.5 mg 10 tabs.',
		genericName: 'Methotrexate',
		concentration: '2.5mg',
		price: 51,
		matchKeywords: ['imutrexate 2.5', 'methotrexate 2.5', 'روماتيزم', 'صدفية', 'تدرج جرعة', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات 2.5 مجم؛ لتجميع الجرعة الأسبوعية بدقة (روماتيزم، صدفية، أورام).',
		timing: 'مرة أسبوعياً فقط.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'مرة أسبوعياً. ٢٫٥ مجم×عدد الأقراص (مثلاً ٣=٧٫٥، ٦=١٥ مجم).',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: كوتريموكسازول، NSAIDs تزيد السمية.',
			'تحذيرات: راجع عند تقرحات فم، نزيف، حرارة.',
		],
	},

	// 36. imutrexate 7.5 mg 10 tabs.
	{
		id: 'imutrexate-methotrexate-7-5mg-tabs-10',
		name: 'imutrexate 7.5 mg 10 tabs.',
		genericName: 'Methotrexate',
		concentration: '7.5mg',
		price: 69,
		matchKeywords: ['imutrexate 7.5', 'methotrexate 7.5', 'روماتيزم', 'صدفية', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات أسبوعي: روماتيزم، صدفية، أورام.',
		timing: 'مرة أسبوعياً فقط.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'مرة أسبوعياً. ٧٫٥–٢٥ مجم/أسبوع (روماتيزم) حسب التشخيص.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: كوتريموكسازول، NSAIDs، بنسلين، PPIs تزيد السمية.',
			'تحذيرات: متابعة صورة دم، كبد، كلى.',
		],
	},

	// 37. imutrexate 10 mg 10 tabs.
	{
		id: 'imutrexate-methotrexate-10mg-tabs-10',
		name: 'imutrexate 10 mg 10 tabs.',
		genericName: 'Methotrexate',
		concentration: '10mg',
		price: 77,
		matchKeywords: ['imutrexate 10', 'methotrexate 10', 'روماتيزم', 'صدفية', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات أسبوعي: روماتيزم، صدفية، أورام.',
		timing: 'مرة أسبوعياً فقط.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'مرة أسبوعياً. حسب التشخيص والتحاليل.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: كوتريموكسازول، NSAIDs تزيد السمية.',
			'تحذيرات: راجع فوراً عند أعراض صدر، نزيف، حرارة.',
		],
	},

	// 18. unitrexate 50 mg 5 i.m. i.v. vials
	{
		id: 'unitrexate-methotrexate-50mg-vials-5',
		name: 'unitrexate 50 mg 5 i.m. i.v. vials',
		genericName: 'Methotrexate',
		concentration: '50mg/vial',
		price: 385,
		matchKeywords: ['unitrexate 50', 'يونيتريكسات', 'methotrexate injection', 'iv', 'im', 'حقن', 'أورام', 'روماتيزم', 'كيمو', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات حقن (IM/IV): أورام، روماتيزم، صدفية شديدة؛ حسب البروتوكول.',
		timing: 'حسب البروتوكول (عادة أسبوعي).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'في منشأة طبية. حسب التشخيص ومساحة الجسم والتحاليل.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: كوتريموكسازول، NSAIDs، PPIs، بنسلين تزيد السمية.',
			'تحذيرات: سمية كبد، نخاع، رئة. متابعة صارمة.',
		],
	},

	// 58. methotrexate 25mg/ml (2ml=50mg) vial
	{
		id: 'methotrexate-25mg-ml-vial-2ml',
		name: 'methotrexate 25mg/ml (2ml=50mg) vial',
		genericName: 'Methotrexate',
		concentration: '25mg/ml (2ml=50mg)',
		price: 26.4,
		matchKeywords: ['methotrexate 25mg/ml', 'ميثوتريكسات حقن', '25mg/ml', 'حقن', 'أورام', 'روماتيزم', ...TAGS.antineoplastic, ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميثوتريكسات حقن (2 مل=50 مجم): أورام، روماتيزم؛ حسب البروتوكول.',
		timing: 'حسب البروتوكول (عادة أسبوعي).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'أسبوعي أو بروتوكول أورام. حسب التشخيص ومساحة الجسم.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: كوتريموكسازول، NSAIDs، PPIs تزيد السمية.',
			'تحذيرات: راجع فوراً عند كحة، ضيق نفس، نزيف، حرارة.',
		],
	},

	// 59. methotrexate 500mg pd. for inj. vial
	{
		id: 'methotrexate-500mg-powder-vial',
		name: 'methotrexate 500mg pd. for inj. vial',
		genericName: 'Methotrexate',
		concentration: '500mg/vial',
		price: 119,
		matchKeywords: ['methotrexate 500mg', 'powder', 'vial', 'أورام', 'كيمو', 'جرعات عالية', ...TAGS.antineoplastic],
		usage: 'ميثوتريكسات جرعات عالية (أورام): استخدام في المستشفى فقط وبروتوكول إنقاذ (حمض فولينيك).',
		timing: 'حسب بروتوكول الأورام.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'مستشفى فقط. حسب بروتوكول الأورام. إنقاذ فولينيك إلزامي.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: مراجعة دوائية كاملة قبل الاستخدام.',
			'تحذيرات: بروتوكول إنقاذ وترطيب ومتابعة صارمة إلزامية.',
		],
	},

	// 62. unitrexate 5gm sol. for i.m. i.v. inj. i.v. inf.
	{
		id: 'unitrexate-methotrexate-5g-solution',
		name: 'unitrexate 5gm sol. for i.m. i.v. inj. i.v. inf.',
		genericName: 'Methotrexate',
		concentration: '5g',
		price: 780,
		matchKeywords: ['unitrexate 5g', 'methotrexate 5g', 'infusion', 'أورام', 'كيمو', 'جرعات عالية', ...TAGS.antineoplastic],
		usage: 'ميثوتريكسات 5 جم/محلول: أورام بجرعات عالية؛ مستشفى فقط مع إنقاذ بحمض الفولينيك.',
		timing: 'حسب بروتوكول الأورام.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Solution',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'مستشفى فقط. الجرعة والإنقاذ حسب البروتوكول.',
		warnings: [
			'الحمل: ممنوع.',
			'تحذيرات: إنقاذ وترطيب ومتابعة صارمة إلزامية.',
			'تداخلات: مراجعة أدوية شاملة قبل الاستخدام.',
		],
	},

	// 23. azathioprine rpg 50 mg 30 tabs.
	{
		id: 'azathioprine-rpg-50mg-tabs-30',
		name: 'azathioprine rpg 50 mg 30 tabs.',
		genericName: 'Azathioprine',
		concentration: '50mg',
		price: 68,
		matchKeywords: ['azathioprine rpg', 'azathioprine', 'ازاثيوبرين', 'زراعة', 'كبد', 'كلية', 'أمعاء', 'كرون', 'ذئبة', 'تصلب جلدي', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة: زراعة أعضاء، داء كرون، التهاب قولون تقرحي، ذئبة، تصلب جلدي، ومرض مناعة أخرى.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: (weight) => `شائع: ١–٢٫٥ مجم/كجم/يوم مقسمة ١–٢ جرعة (≈ ${formatNumber(Math.round(weight * 1.5))}–${formatNumber(Math.round(weight * 2.5))} مجم لـ ${formatNumber(weight)} كجم). متابعة تحاليل.`,
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط؛ لا بدء أو إيقاف فجأة.',
			'تداخلات: ألوبورينول/فيبوكسوستات يرفعان السمية بشكل شديد—تعديل جرعة أزاثيوبرين (تقليل ~75%) إلزامي.',
			'تحذيرات: تثبيط نخاع، عدوى. راجع فوراً عند حرارة، التهاب حلق، كدمات، نزيف.',
		],
	},

	// 24. azathioprine 50mg 100 tab.
	{
		id: 'azathioprine-50mg-tabs-100',
		name: 'azathioprine 50mg 100 tab.',
		genericName: 'Azathioprine',
		concentration: '50mg',
		price: 75,
		matchKeywords: ['azathioprine 100', 'azathioprine', 'ازاثيوبرين', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة: زراعة، كرون، التهاب قولون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: (weight) => `١–٢٫٥ مجم/كجم/يوم (≈ ${formatNumber(Math.round(weight * 1.5))}–${formatNumber(Math.round(weight * 2.5))} مجم لـ ${formatNumber(weight)} كجم).`,
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—خطر سمية شديد؛ تقليل جرعة أزاثيوبرين إلزامي.',
			'تحذيرات: راجع عند حرارة، نزيف، اصفرار.',
		],
	},

	// 31. azathioprine pch 50mg 10 tab.
	{
		id: 'azathioprine-pch-50mg-tabs-10',
		name: 'azathioprine pch 50mg 10 tab.',
		genericName: 'Azathioprine',
		concentration: '50mg',
		price: 8,
		matchKeywords: ['azathioprine pch', 'azathioprine', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة: زراعة، كرون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '١–٢٫٥ مجم/كجم/يوم. متابعة دم/كبد.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—تقليل جرعة أزاثيوبرين إلزامي.',
			'تحذيرات: تثبيط نخاع، عدوى. راجع عند حرارة، نزيف.',
		],
	},

	// 32. azathioprine rpg 50mg 100 tab
	{
		id: 'azathioprine-rpg-50mg-tabs-100',
		name: 'azathioprine rpg 50mg 100 tab',
		genericName: 'Azathioprine',
		concentration: '50mg',
		price: 156,
		matchKeywords: ['azathioprine rpg 100', 'azathioprine', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة: زراعة، كرون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'عادة ١–٢٫٥ مجم/كجم/يوم. متابعة تحاليل دورية.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—تعديل جرعة إلزامي.',
			'تحذيرات: راجع عند حرارة، نزيف، كدمات.',
		],
	},

	// 47. azathioprine-evapharma 50 mg 30 f.c.tabs.
	{
		id: 'azathioprine-evapharma-50mg-fc-tabs-30',
		name: 'azathioprine-evapharma 50 mg 30 f.c.tabs.',
		genericName: 'Azathioprine',
		concentration: '50mg',
		price: 96,
		matchKeywords: ['azathioprine evapharma 50', 'evapharma', 'azathioprine', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة: زراعة، كرون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => '١–٢٫٥ مجم/كجم/يوم. متابعة تحاليل.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—تعديل جرعة إلزامي.',
			'تحذيرات: عدوى، تثبيط نخاع. راجع عند حرارة، نزيف.',
		],
	},

	// 57. azathioprine-evapharma 100 mg 30 f.c.tabs.
	{
		id: 'azathioprine-evapharma-100mg-fc-tabs-30',
		name: 'azathioprine-evapharma 100 mg 30 f.c.tabs.',
		genericName: 'Azathioprine',
		concentration: '100mg',
		price: 153,
		matchKeywords: ['azathioprine evapharma 100', 'azathioprine 100', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة (100 مجم): زراعة، كرون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'حسب الوزن والاستجابة. متابعة دم/كبد.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—تعديل جرعة إلزامي.',
			'تحذيرات: متابعة صورة دم، كبد.',
		],
	},

	// 63. azathioprine-evapharma 75 mg 30 f.c.tabs.
	{
		id: 'azathioprine-evapharma-75mg-fc-tabs-30',
		name: 'azathioprine-evapharma 75 mg 30 f.c.tabs.',
		genericName: 'Azathioprine',
		concentration: '75mg',
		price: 123,
		matchKeywords: ['azathioprine evapharma 75', 'azathioprine 75', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة (75 مجم): زراعة، كرون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'الجرعة حسب الوزن. متابعة صورة دم، كبد.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—تعديل جرعة إلزامي.',
			'تحذيرات: عدوى، تثبيط نخاع.',
		],
	},

	// 49. imuran 50mg 100 f.c. tab.
	{
		id: 'imuran-azathioprine-50mg-fc-tabs-100',
		name: 'imuran 50mg 100 f.c. tab.',
		genericName: 'Azathioprine',
		concentration: '50mg',
		price: 508,
		matchKeywords: ['imuran', 'ايموران', 'azathioprine', 'زراعة', 'كرون', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'أزاثيوبرين: زراعة، كرون، ذئبة، أمراض مناعة.',
		timing: 'مرة أو مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'عادة ١–٢٫٥ مجم/كجم/يوم. متابعة تحاليل.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة فقط.',
			'تداخلات: ألوبورينول/فيبوكسوستات—تعديل جرعة إلزامي.',
			'تحذيرات: راجع عند حرارة، نزيف، كدمات.',
		],
	},

	// 50. myfortic 180mg 120 f.c. tab.
	{
		id: 'myfortic-mycophenolic-acid-180mg-fc-tabs-120',
		name: 'myfortic 180mg 120 f.c. tab.',
		genericName: 'Mycophenolic acid (as mycophenolate sodium)',
		concentration: '180mg',
		price: 3263,
		matchKeywords: ['myfortic 180', 'مايفورتيك', 'mycophenolic acid', 'mycophenolate sodium', 'زراعة', 'كلى', 'كبد', 'قلب', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة: زراعة كلى/كبد/قلب؛ أمراض مناعة (ذئبة، etc).',
		timing: 'مرتين يومياً (كل 12 ساعة).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'عادة 720 مجم مرتين يومياً (زراعة). الجرعة تُعدَّل حسب البروتوكول والتحاليل.',
		warnings: [
			'الحمل: ممنوع؛ تشوهات/إجهاض. منع حمل صارم واختبار حمل دوري.',
			'تداخلات: مضادات الحموضة/كوليستيرامين تقلل الامتصاص—مباعد 2 ساعة.',
			'تحذيرات: عدوى، تثبيط نخاع. راجع عند حرارة، التهاب، كدمات.',
		],
	},

	// 51. myfortic 360mg 120 f.c. tab.
	{
		id: 'myfortic-mycophenolic-acid-360mg-fc-tabs-120',
		name: 'myfortic 360mg 120 f.c. tab.',
		genericName: 'Mycophenolic acid (as mycophenolate sodium)',
		concentration: '360mg',
		price: 6091,
		matchKeywords: ['myfortic 360', 'mycophenolic acid', 'mycophenolate sodium', 'زراعة', 'كلى', 'كبد', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'مثبط مناعة (360 مجم): زراعة، ذئبة، أمراض مناعة.',
		timing: 'مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'F.C. Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'عادة 720 مجم مرتين يومياً (قرصان 360). الجرعة حسب البروتوكول.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: مضادات الحموضة/كوليستيرامين تقلل الامتصاص.',
			'تحذيرات: عدوى، تثبيط نخاع. متابعة لازمة.',
		],
	},

	// 56. cellcept 500 mg 50 tab.
	{
		id: 'cellcept-mycophenolate-mofetil-500mg-tabs-50',
		name: 'cellcept 500 mg 50 tab.',
		genericName: 'Mycophenolate mofetil',
		concentration: '500mg',
		price: 1460,
		matchKeywords: ['cellcept', 'سيلسيبت', 'mycophenolate mofetil', 'ميكوفينولات', 'زراعة', 'كلى', 'كبد', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميكوفينولات موفتيل: زراعة كلى/كبد/قلب؛ ذئبة، أمراض مناعة.',
		timing: 'مرتين يومياً (كل 12 ساعة).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'زراعة: عادة 1–1.5 جم مرتين يومياً. الجرعة حسب البروتوكول.',
		warnings: [
			'الحمل: ممنوع؛ تشوهات/إجهاض.',
			'تداخلات: مضادات الحموضة تقلل الامتصاص—مباعد 2 ساعة.',
			'تحذيرات: عدوى، تثبيط نخاع. راجع عند حرارة، نزيف.',
		],
	},

	// 61. mycophenolate mofetil-sandoz 500 mg
	{
		id: 'mycophenolate-mofetil-sandoz-500mg',
		name: 'mycophenolate mofetil-sandoz 500 mg',
		genericName: 'Mycophenolate mofetil',
		concentration: '500mg',
		price: 1020,
		matchKeywords: ['sandoz', 'mycophenolate mofetil', 'ميكوفينولات', '500', 'زراعة', 'ذئبة', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'ميكوفينولات موفتيل: زراعة، ذئبة، أمراض مناعة.',
		timing: 'مرتين يومياً.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'عادة 1–1.5 جم مرتين يومياً. الجرعة حسب البروتوكول.',
		warnings: [
			'الحمل: ممنوع.',
			'تداخلات: مضادات الحموضة تقلل الامتصاص.',
			'تحذيرات: عدوى، تثبيط نخاع.',
		],
	},

	// 52. prograf 0.5mg 100 caps.
	{
		id: 'prograf-tacrolimus-0-5mg-caps-100',
		name: 'prograf 0.5mg 100 caps.',
		genericName: 'Tacrolimus',
		concentration: '0.5mg',
		price: 1905,
		matchKeywords: ['prograf 0.5', 'بروغراف', 'tacrolimus', 'تاكروليمس', 'زراعة', 'كلى', 'كبد', 'مستوى دم', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'تاكروليمس: زراعة كلى/كبد/قلب؛ جرعة ومستوى دم حسب البروتوكول.',
		timing: 'مرتين يومياً كل 12 ساعة؛ مواعيد ثابتة.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Capsules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'الجرعة mg/kg وتُعدَّل حسب مستوى تاكروليمس بالدم (Trough).',
		warnings: [
			'الحمل: عند الضرورة فقط؛ متابعة متخصصة.',
			'تداخلات: فلوكونازول، كلاريثروميسين، حاصرات قنوات كالسيوم ترفع المستوى—خطر سمية. جريب فروت ممنوع.',
			'تحذيرات: سمية كلوية، ارتفاع ضغط، سكر. متابعة كلى، ضغط، مستوى دواء.',
		],
	},

	// 53. prograf 1mg 100 caps.
	{
		id: 'prograf-tacrolimus-1mg-caps-100',
		name: 'prograf 1mg 100 caps.',
		genericName: 'Tacrolimus',
		concentration: '1mg',
		price: 3552,
		matchKeywords: ['prograf 1', 'tacrolimus 1mg', 'زراعة', 'كلى', 'كبد', 'تاكروليمس', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'تاكروليمس: زراعة، أمراض مناعة؛ الجرعة حسب مستوى الدم.',
		timing: 'مرتين يومياً كل 12 ساعة.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Capsules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'الجرعة تُعدَّل حسب مستوى تاكروليمس (Trough) بالدم.',
		warnings: [
			'الحمل: عند الضرورة فقط.',
			'تداخلات: أزولات، ماكروليدات، حاصرات قنوات كالسيوم ترفع المستوى.',
			'تحذيرات: متابعة كلى، ضغط، سكر.',
		],
	},

	// 54. adport 1mg 100 caps
	{
		id: 'adport-tacrolimus-1mg-caps-100',
		name: 'adport 1mg 100 caps',
		genericName: 'Tacrolimus',
		concentration: '1mg',
		price: 2145,
		matchKeywords: ['adport 1', 'ادبورت', 'tacrolimus', 'زراعة', 'كلى', 'كبد', 'تاكروليمس', ...TAGS.immunosuppressive, 'مناعة', 'immunosuppressant'],
		usage: 'تاكروليمس: زراعة، أمراض مناعة؛ متابعة مستوى الدم.',
		timing: 'مرتين يومياً كل 12 ساعة.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Capsules',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'الجرعة تُعدَّل حسب مستوى تاكروليمس بالدم.',
		warnings: [
			'الحمل: عند الضرورة فقط.',
			'تداخلات: أزولات، ماكروليدات، ريفامبين، حاصرات قنوات كالسيوم تغيّر المستوى.',
			'تحذيرات: سمية كلوية، ضغط، سكر. متابعة لازمة.',
		],
	},

	// 55. casodex 50mg 28 tab
	{
		id: 'casodex-bicalutamide-50mg-tabs-28',
		name: 'casodex 50mg 28 tab',
		genericName: 'Bicalutamide',
		concentration: '50mg',
		price: 940,
		matchKeywords: ['casodex', 'كاسودكس', 'bicalutamide', 'بيكالوتاميد', 'بروستاتا', 'سرطان بروستاتا', 'أندروجين', 'هرمون', ...TAGS.antineoplastic],
		usage: 'مضاد أندروجين: سرطان بروستاتا (مترافق مع GnRH أو بعد خصي، أو وحده في حالات مختارة).',
		timing: '50 مجم مرة يومياً؛ نفس التوقيت.',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Tablets',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 250,
		calculationRule: () => 'عادة 50 مجم مرة يومياً. قد يُرفع لـ 150 مجم في بروتوكولات محددة.',
		warnings: [
			'الحمل: لا يُستخدم للنساء. تعرض الحامل يضر الجنين.',
			'تداخلات: وارفارين—متابعة INR. أدوية كبد.',
			'تحذيرات: متابعة كبد. راجع عند اصفرار، بول داكن، إجهاد شديد.',
		],
	},

	// 44. methylprednisolone mylan 500mg 10 vials.
	{
		id: 'methylprednisolone-mylan-sodium-succinate-500mg-vials-10',
		name: 'methylprednisolone mylan 500mg 10 vials.',
		genericName: 'Methylprednisolone (as sodium succinate)',
		concentration: '500mg/vial',
		price: 1225,
		matchKeywords: ['methylprednisolone mylan 500', 'mylan', 'solumedrol', 'ميثيل بريدنيزولون', 'حقن', 'iv', 'pulse', 'ذئبة', 'تصلب متعدد', 'رفض زراعة', ...TAGS.glucocorticoid],
		usage: 'ميثيل بريدنيزولون حقن وريدي بجرعات عالية (Pulse): ذئبة، تصلب متعدد، رفض زراعة، التهاب وعائي، رئة.',
		timing: 'حسب البروتوكول (غالباً 500–1000 مجم/يوم 3–5 أيام).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'مستشفى فقط. عادة 500–1000 مجم/يوم IV 3–5 أيام. الجرعة حسب البروتوكول.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة القصوى فقط.',
			'تداخلات: NSAIDs تزيد خطر نزيف المعدة. أدوية سكري قد تحتاج ضبط.',
			'تحذيرات: جرعات عالية: اضطراب سكر/ضغط/مزاج، أرق، عدوى. مراقبة لازمة.',
		],
	},

	// 60. methylprednisolone mylan 1g 10 vial for i.v. inj./inf.
	{
		id: 'methylprednisolone-mylan-sodium-succinate-1g-vials-10',
		name: 'methylprednisolone mylan 1g 10 vial for i.v. inj./inf.',
		genericName: 'Methylprednisolone (as sodium succinate)',
		concentration: '1g/vial',
		price: 2250,
		matchKeywords: ['methylprednisolone mylan 1g', 'pulse steroid', 'iv infusion', 'ميثيل بريدنيزولون 1 جم', 'ذئبة', 'تصلب متعدد', 'رفض زراعة', ...TAGS.glucocorticoid],
		usage: 'ميثيل بريدنيزولون 1 جم/vial: Pulse في ذئبة، تصلب متعدد، رفض زراعة، التهاب وعائي.',
		timing: 'حسب البروتوكول (غالباً 1 جم/يوم 3–5 أيام).',
		category: Category.ANTI_NEOPLASTIC_IMMUNOMODULATING,
		form: 'Vial',
		minAgeMonths: 0,
		maxAgeMonths: 1200,
		minWeight: 2,
		maxWeight: 250,
		calculationRule: () => 'مستشفى فقط. عادة 500–1000 مجم/يوم 3–5 أيام. الجرعة حسب البروتوكول.',
		warnings: [
			'الحمل/الرضاعة: عند الضرورة القصوى.',
			'تداخلات: NSAIDs تزيد نزيف المعدة. مدرات تزيد اضطراب أملاح.',
			'تحذيرات: أرق، تغيّر مزاج، ارتفاع ضغط/سكر. راقب العدوى.',
		],
	},

];

