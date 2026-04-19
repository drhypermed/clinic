import { Medication, Category } from '../../types';

export const PENICILLIN_GROUP: Medication[] = [
	{
		id: 'depo-pen-1-2miu-vial',
		name: 'Depo-Pen 1.2 miu vial.',
		genericName: 'penicillin g',
		concentration: '1.2 MIU',
		price: 25,
		matchKeywords: [
			'depo-pen', 'depo pen', 'penicillin g', 'benzathine penicillin', 'بنسلين', 'ديبو بن', 'بنسلين بنزاثين',
			'streptococcal', 'tonsillitis', 'pharyngitis', 'rheumatic fever', 'rheumatic fever prophylaxis',
			'syphilis', 'الزهري', 'الحمى الروماتيزمية', 'وقاية', 'التهاب الحلق', 'التهاب اللوزتين',
			'#antibiotics', '#penicillin',
		],
		usage: 'بنسلين بنزاثين طويل المفعول للالتهابات العقدية/وقاية الحمى الروماتيزمية/الزهري.',
		timing: 'جرعة عضل واحدة',
		category: Category.PENICILLIN,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: (w) => w < 27
			? '٦٠٠٬٠٠٠ وحدة عضل عميق ببطء — جرعة واحدة (يُحل في ٤ مل ماء معقم)'
			: '١٫٢ مليون وحدة عضل عميق ببطء — جرعة واحدة (يُحل في ٤ مل ماء معقم)',
		warnings: [
			'تحسس البنسلين قد يسبب صدمة تحسسية: ممنوع لمرضى حساسية البنسلين/السيفالوسبورين.',
			'لو ظهر طفح شديد/ضيق نفس/تورم: طوارئ فوراً.',
			'لا يُحقن وريدياً أبداً.',
		],
	},

	{
		id: 'pencitard-1-2miu-vial',
		name: 'Pencitard 1200000 i.u. / vial',
		genericName: 'benzathine benzylpenicillin',
		concentration: '1,200,000 IU',
		price: 25,
		matchKeywords: [
			'pencitard', 'benzathine penicillin', 'benzylpenicillin', 'بنسلين بنزاثين', 'بنسيتارد',
			'strep throat', 'tonsillitis', 'rheumatic fever prophylaxis', 'streptococcal', 'pharyngitis',
			'syphilis', 'الزهري', 'الحمى الروماتيزمية', 'وقاية', 'التهاب الحلق', 'التهاب اللوزتين',
			'#antibiotics', '#penicillin',
		],
		usage: 'بنسلين بنزاثين طويل المفعول للالتهاب البكتيري الحساس للبنسلين (خصوصاً التهاب الحلق العقدي/وقاية الحمى الروماتيزمية).',
		timing: 'جرعة عضل واحدة أو كل ٣–٤ أسابيع',
		category: Category.PENICILLIN,
		form: 'Vial',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: (w) => w < 27
			? '٦٠٠٬٠٠٠ وحدة عضل عميق ببطء — جرعة واحدة أو كل ٣–٤ أسابيع للوقاية (يُحل في ٤ مل ماء معقم)'
			: '١٫٢ مليون وحدة عضل عميق ببطء — جرعة واحدة أو كل ٣–٤ أسابيع للوقاية (يُحل في ٤ مل ماء معقم)',
		warnings: [
			'تحسس البنسلين: ممنوع لمرضى حساسية البنسلين/السيفالوسبورين.',
			'قد يكون الحقن مؤلم—يُحقن ببطء وبعمق.',
			'لا يُحقن وريدياً أبداً.',
		],
	},
];
