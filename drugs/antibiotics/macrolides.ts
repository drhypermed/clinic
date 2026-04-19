
import { Medication, Category } from '../../types';

// Helper
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

const formatMl = (ml: number) => `${toAr(roundVol(ml))} مل`;

const AZITHRO_WARNINGS: string[] = [
	'قد يطيل QT: الحذر مع اضطراب النظم/أدوية تطيل QT.',
	'اضطرابات معدية/إسهال ممكنة.',
	'الحذر في قصور كبدي شديد.',
];

const CLARITHRO_WARNINGS: string[] = [
	'قد يطيل QT: الحذر مع اضطراب النظم/أدوية تطيل QT.',
	'تداخلات دوائية مهمة (خصوصاً مع بعض أدوية الكوليسترول/الوارفارين/مضادات اضطراب النظم).',
	'الحذر في قصور كبدي/كلوي.',
];

const azithroPediatricRule = (mgPer5ml: number) => {
	const mgPerMl = mgPer5ml / 5;

	return (weight: number, ageMonths: number) => {
		if (ageMonths < 6) return 'غير موصى به أقل من ٦ أشهر.';

		const day1Mg = 10 * weight;
		const day1Ml = day1Mg / mgPerMl;
		const day2to5Mg = 5 * weight;
		const day2to5Ml = day2to5Mg / mgPerMl;

		return `اليوم ١: ${formatMl(day1Ml)} مرة يومياً | اليوم ٢–٥: ${formatMl(day2to5Ml)} مرة يومياً بعد الأكل`;
	};
};

const clarithroPediatricRule = (mgPer5ml: number) => {
	const mgPerMl = mgPer5ml / 5;

	return (weight: number, ageMonths: number) => {
		if (ageMonths < 6) return 'غير موصى به أقل من ٦ أشهر.';

		const doseMg = Math.min(7.5 * weight, 500);
		const doseMl = doseMg / mgPerMl;
		return `${formatMl(doseMl)} كل ١٢ ساعة بعد الأكل لمدة ٧–١٠ أيام`;
	};
};

type SolidForm = 'Tablet' | 'Tablets' | 'Capsule' | 'Capsules' | 'F.C. Tablets' | 'Film-coated Tablets' | 'Film-coated Tablet';

const makeAzithroSolid = (args: {
	id: string;
	name: string;
	genericName?: string;
	strengthMg: number;
	price: number;
	form: SolidForm;
	packHint?: '3days' | '5days' | '6caps250-zpak' | '3days600' | 'general';
	matchKeywords?: string[];
}): Medication => {
	const genericName = args.genericName ?? 'azithromycin';

	const adultRule = () => {
		if (args.packHint === '6caps250-zpak' && args.strengthMg === 250) {
			return 'اليوم ١: ٢ كبسولة (٥٠٠ مجم) | اليوم ٢–٥: كبسولة (٢٥٠ مجم) يومياً بعد الأكل';
		}
		if (args.packHint === '3days') return `${toAr(args.strengthMg)} مجم مرة يومياً بعد الأكل لمدة ٣ أيام`;
		if (args.packHint === '5days') return `${toAr(args.strengthMg)} مجم مرة يومياً بعد الأكل لمدة ٥ أيام`;
		if (args.packHint === '3days600' && args.strengthMg === 600) return '٦٠٠ مجم مرة يومياً بعد الأكل لمدة ٣ أيام';

		return `${toAr(args.strengthMg)} مجم مرة يومياً بعد الأكل (٣ أيام) أو ٥٠٠ مجم يوم ١ ثم ٢٥٠ مجم يوم ٢–٥`;
	};

	return {
		id: args.id,
		name: args.name,
		genericName,
		concentration: `${args.strengthMg}mg`,
		price: args.price,
		usage: 'مضاد حيوي ماكرولايد (أزيثرومايسين) لالتهابات الجهاز التنفسي/الأذن/الجلد وبعض عدوى الجهاز التناسلي.',
		timing: 'مرة يومياً بعد الأكل – ٣ أو ٥ أيام',
		category: Category.MACROLIDES,
		form: args.form,
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: adultRule,
		warnings: AZITHRO_WARNINGS,
		matchKeywords: [...(args.matchKeywords ?? []), 'azithro', 'azithromycin', '#antibiotics', '#macrolide'],
	};
};

const makeAzithroSuspension = (args: {
	id: string;
	name: string;
	mgPer5ml: 100 | 200;
	volumeMl: number;
	price: number;
	matchKeywords?: string[];
}): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'azithromycin',
	concentration: `${args.mgPer5ml}mg/5ml (${args.volumeMl}ml)`,
	price: args.price,
	usage: 'مضاد حيوي ماكرولايد (أزيثرومايسين) للأطفال لالتهابات الجهاز التنفسي/الأذن/الجلد.',
	timing: 'مرة يومياً بعد الأكل – ٣ أو ٥ أيام',
	category: Category.MACROLIDES,
	form: 'Suspension',
	minAgeMonths: 6,
	maxAgeMonths: 144,
	minWeight: 5,
	maxWeight: 50,
	calculationRule: azithroPediatricRule(args.mgPer5ml),
	warnings: AZITHRO_WARNINGS,
	matchKeywords: [...(args.matchKeywords ?? []), 'azithro', 'azithromycin', '#antibiotics', '#macrolide'],
});

const makeClarithroSolid = (args: {
	id: string;
	name: string;
	strengthMg: 250 | 500;
	price: number;
	form: SolidForm | 'Sustained-release Film-coated Tablet' | 'Prolonged Release Tablet';
	isXR?: boolean;
	matchKeywords?: string[];
}): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'clarithromycin',
	concentration: `${args.strengthMg}mg`,
	price: args.price,
	usage: 'مضاد حيوي ماكرولايد (كلاريثروميسين) لالتهابات الجهاز التنفسي/الجلد وبعض عدوى الأسنان.',
	timing: args.isXR ? 'مرة يومياً بعد الأكل – ٧–١٤ يوم' : 'كل ١٢ ساعة بعد الأكل – ٧–١٤ يوم',
	category: Category.MACROLIDES,
	form: args.form,
	minAgeMonths: 144,
	maxAgeMonths: 1200,
	minWeight: 40,
	maxWeight: 200,
	calculationRule: () => {
		if (args.isXR) return '٥٠٠ مجم مرة يومياً بعد الأكل لمدة ٧–١٤ يوم (قد تُزاد لـ ١٠٠٠ مجم/يوم في الشديد)';
		return `${toAr(args.strengthMg)} مجم كل ١٢ ساعة بعد الأكل لمدة ٧–١٤ يوم`;
	},
	warnings: CLARITHRO_WARNINGS,
	matchKeywords: [...(args.matchKeywords ?? []), 'clarithro', 'clarithromycin', '#antibiotics', '#macrolide'],
});

const makeClarithroSuspension = (args: {
	id: string;
	name: string;
	mgPer5ml: 125 | 250;
	volumeMl: number;
	price: number;
	matchKeywords?: string[];
}): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'clarithromycin',
	concentration: `${args.mgPer5ml}mg/5ml (${args.volumeMl}ml)`,
	price: args.price,
	usage: 'مضاد حيوي ماكرولايد (كلاريثروميسين) للأطفال لالتهابات الجهاز التنفسي/الأذن/الجلد.',
	timing: 'كل ١٢ ساعة بعد الأكل – ٧–١٠ أيام',
	category: Category.MACROLIDES,
	form: 'Suspension',
	minAgeMonths: 6,
	maxAgeMonths: 144,
	minWeight: 5,
	maxWeight: 50,
	calculationRule: clarithroPediatricRule(args.mgPer5ml),
	warnings: CLARITHRO_WARNINGS,
	matchKeywords: [...(args.matchKeywords ?? []), 'clarithro', 'clarithromycin', '#antibiotics', '#macrolide'],
});

const makeAzithroIV = (args: { id: string; name: string; price: number; matchKeywords?: string[] }): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'azithromycin',
	concentration: '500mg vial',
	price: args.price,
	usage: 'أزيثرومايسين وريدي لعدوى شديدة (مثال: CAP) مع التحويل للفم عند التحسن.',
	timing: 'مرة يومياً تسريب وريدي ≥١ ساعة – ٧–١٠ أيام',
	category: Category.MACROLIDES,
	form: 'I.V. Infusion Vial',
	minAgeMonths: 216,
	maxAgeMonths: 1200,
	minWeight: 45,
	maxWeight: 200,
	calculationRule: () => '٥٠٠ مجم IV infusion مرة يومياً لمدة ٧–١٠ أيام',
	warnings: AZITHRO_WARNINGS,
	matchKeywords: [...(args.matchKeywords ?? []), 'azithro iv', 'azithromycin iv', '#antibiotics', '#macrolide'],
});

const makeClarithroIV = (args: { id: string; name: string; price: number; matchKeywords?: string[] }): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'clarithromycin',
	concentration: '500mg vial',
	price: args.price,
	usage: 'كلاريثروميسين وريدي لعدوى شديدة مع التحويل للفم عند التحسن.',
	timing: 'كل ١٢ ساعة تسريب وريدي ٦٠ دقيقة – ٧–١٤ يوم',
	category: Category.MACROLIDES,
	form: 'I.V. Infusion Vial',
	minAgeMonths: 216,
	maxAgeMonths: 1200,
	minWeight: 45,
	maxWeight: 200,
	calculationRule: () => '٥٠٠ مجم IV infusion كل ١٢ ساعة لمدة ٧–١٤ يوم',
	warnings: CLARITHRO_WARNINGS,
	matchKeywords: [...(args.matchKeywords ?? []), 'clarithro iv', 'clarithromycin iv', '#antibiotics', '#macrolide'],
});

const makeHpyloriKit = (args: {
	id: string;
	name: string;
	clarithroMg: 250 | 500;
	price: number;
	countHint?: '14' | '28';
	matchKeywords?: string[];
}): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'clarithromycin & omeprazole & tinidazole',
	concentration: `${args.clarithroMg}/20/500mg`,
	price: args.price,
	usage: 'علاج جرثومة المعدة (ثلاثي: أوميبرازول + كلاريثروميسين + تينيدازول).',
	timing: 'مرتين يومياً بعد الأكل – ١٤ يوم',
	category: Category.H_PYLORI,
	form: 'Tablet/Capsule Pack',
	minAgeMonths: 216,
	maxAgeMonths: 1200,
	minWeight: 45,
	maxWeight: 200,
	calculationRule: () => `أوميبرازول ٢٠ مجم + كلاريثروميسين ${toAr(args.clarithroMg)} مجم + تينيدازول ٥٠٠ مجم مرتين يومياً بعد الأكل لمدة ١٤ يوم`,
	warnings: [
		'يُتجنب الكحول مع تينيدازول.',
		'الحمل (خصوصاً أول ٣ شهور): يفضل بدائل حسب التشخيص والحالة.',
		...CLARITHRO_WARNINGS,
	],
	matchKeywords: [...(args.matchKeywords ?? []), 'h pylori', 'helicobacter', 'heli-cure', 'peptic care', '#h.pylori'],
});

const makeAntiAcneGel = (args: { id: string; name: string; price: number; sizeGm: number; matchKeywords?: string[] }): Medication => ({
	id: args.id,
	name: args.name,
	genericName: 'erythromycin & isotretinoin',
	concentration: `${args.sizeGm}gm`,
	price: args.price,
	usage: 'جل موضعي لحب الشباب (مضاد حيوي + ريتينويد).',
	timing: 'مرة مساءً على بشرة نظيفة – ٦–٨ أسابيع',
	category: Category.ANTI_ACNE,
	form: 'Gel',
	minAgeMonths: 144,
	maxAgeMonths: 1200,
	minWeight: 35,
	maxWeight: 200,
	calculationRule: () => 'طبقة رقيقة على المناطق المصابة مرة مساءً لمدة ٦–٨ أسابيع',
	warnings: ['تهيج/جفاف شائع. أوقفه عند التهاب شديد.', 'تجنب استخدامه مع مقشرات قوية في نفس الوقت.'],
	matchKeywords: [...(args.matchKeywords ?? []), 'acne', 'erythromycin', 'isotretinoin', '#anti acne'],
});

export const MACROLIDES_GROUP: Medication[] = [
	// 1) Clarithromycin (brands)
	makeClarithroSolid({
		id: 'klacid-500mg-14-fc-tabs',
		name: 'Klacid 500mg 14 f.c. tablets',
		strengthMg: 500,
		price: 257,
		form: 'F.C. Tablets',
		matchKeywords: ['klacid', 'كلاثيد'],
	}),
	makeClarithroSolid({
		id: 'klacid-250mg-14-fc-tabs',
		name: 'Klacid 250mg 14 f.c. tablets',
		strengthMg: 250,
		price: 146,
		form: 'F.C. Tablets',
		matchKeywords: ['klacid', 'كلاثيد'],
	}),
	makeClarithroIV({
		id: 'klacid-500mg-vial',
		name: 'Klacid 500mg vial',
		price: 127,
		matchKeywords: ['klacid', 'clarithro iv'],
	}),
	makeClarithroSolid({
		id: 'klacid-xl-500mg-14-fc-tabs',
		name: 'Klacid XL 500mg 14 f.c. tas.',
		strengthMg: 500,
		price: 299,
		form: 'Sustained-release Film-coated Tablet',
		isXR: true,
		matchKeywords: ['klacid xl', 'xl', 'كلاثيد اكس ال'],
	}),
	makeClarithroSolid({
		id: 'clarithro-500mg-14-fc-tabs',
		name: 'Clarithro 500mg 14 f.c. tab',
		strengthMg: 500,
		price: 179,
		form: 'F.C. Tablets',
		matchKeywords: ['clarithro'],
	}),
	makeClarithroSolid({
		id: 'clarithro-250mg-14-fc-tabs',
		name: 'Clarithro 250mg 14 f.c.tab',
		strengthMg: 250,
		price: 104,
		form: 'F.C. Tablets',
		matchKeywords: ['clarithro'],
	}),
	makeClarithroSolid({
		id: 'klarimix-500mg-14-tabs',
		name: 'Klarimix 500mg 14 tab.',
		strengthMg: 500,
		price: 144,
		form: 'F.C. Tablets',
		matchKeywords: ['klarimix'],
	}),
	makeClarithroSolid({
		id: 'clarikan-sr-500mg-14-fc-tabs',
		name: 'Clarikan s.r. 500mg 14 f.c. tab.',
		strengthMg: 500,
		price: 158,
		form: 'Sustained-release Film-coated Tablet',
		isXR: true,
		matchKeywords: ['clarikan', 's.r'],
	}),
	makeClarithroSolid({
		id: 'infectocure-250mg-14-fc-tabs',
		name: 'Infectocure 250 mg 14 f.c.tabs',
		strengthMg: 250,
		price: 91,
		form: 'F.C. Tablets',
		matchKeywords: ['infectocure'],
	}),
	makeClarithroSolid({
		id: 'infectocure-500mg-14-fc-tabs',
		name: 'Infectocure 500 mg 14 f.c.tabs.',
		strengthMg: 500,
		price: 156,
		form: 'F.C. Tablets',
		matchKeywords: ['infectocure'],
	}),
	makeClarithroSuspension({
		id: 'infectocure-125mg-5ml-susp-60ml',
		name: 'Infectocure 125mg/5ml susp. 60 ml',
		mgPer5ml: 125,
		volumeMl: 60,
		price: 86,
		matchKeywords: ['infectocure'],
	}),
	makeClarithroSuspension({
		id: 'infectocure-250mg-5ml-susp-60ml',
		name: 'Infectocure 250mg/5ml susp. 60 ml',
		mgPer5ml: 250,
		volumeMl: 60,
		price: 135,
		matchKeywords: ['infectocure'],
	}),
	makeClarithroSuspension({
		id: 'klacid-125mg-5ml-susp-70ml',
		name: 'Klacid 125mg/5 ml susp. 70 ml',
		mgPer5ml: 125,
		volumeMl: 70,
		price: 97.5,
		matchKeywords: ['klacid'],
	}),

	// 2) Azithromycin suspensions (200/5)
	makeAzithroSuspension({
		id: 'unizithrin-200mg-5ml-susp-30ml',
		name: 'Unizithrin 200mg/5ml susp. 30ml',
		mgPer5ml: 200,
		volumeMl: 30,
		price: 62.5,
		matchKeywords: ['unizithrin'],
	}),
	makeAzithroSuspension({
		id: 'xithrone-200mg-5ml-susp-15ml',
		name: 'Xithrone 200 mg/5ml susp. 15ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 63,
		matchKeywords: ['xithrone'],
	}),
	makeAzithroSuspension({
		id: 'xithrone-200mg-5ml-susp-25ml',
		name: 'Xithrone 200 mg/5ml susp. 25 ml',
		mgPer5ml: 200,
		volumeMl: 25,
		price: 89,
		matchKeywords: ['xithrone'],
	}),
	makeAzithroSuspension({
		id: 'zithrokan-200mg-5ml-susp-15ml',
		name: 'Zithrokan 200mg/5ml pd. for oral susp. 15 ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 62,
		matchKeywords: ['zithrokan'],
	}),
	makeAzithroSuspension({
		id: 'zithromax-200mg-5ml-susp-15ml',
		name: 'Zithromax 200mg/5ml pd for susp. 15 ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 89,
		matchKeywords: ['zithromax'],
	}),
	makeAzithroSuspension({
		id: 'azrolid-200mg-5ml-susp-30ml',
		name: 'Azrolid 200mg/ 5 ml for oral 30ml susp',
		mgPer5ml: 200,
		volumeMl: 30,
		price: 62,
		matchKeywords: ['azrolid'],
	}),
	makeAzithroSuspension({
		id: 'azrolid-200mg-5ml-susp-15ml',
		name: 'Azrolid 200mg/5ml pd. for oral susp. 15ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 45,
		matchKeywords: ['azrolid'],
	}),
	makeAzithroSuspension({
		id: 'azrolid-200mg-5ml-susp-22-5ml',
		name: 'Azrolid 200mg/ 5 ml for oral 22.5 ml susp',
		mgPer5ml: 200,
		volumeMl: 22.5,
		price: 37,
		matchKeywords: ['azrolid'],
	}),
	makeAzithroSuspension({
		id: 'epizithro-200mg-5ml-susp-15ml',
		name: 'Epizithro 200mg/5ml 15ml susp.',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 47,
		matchKeywords: ['epizithro'],
	}),
	makeAzithroSuspension({
		id: 'epizithro-200mg-5ml-susp-30ml',
		name: 'Epizithro 200mg/5ml 30ml susp.',
		mgPer5ml: 200,
		volumeMl: 30,
		price: 68,
		matchKeywords: ['epizithro'],
	}),
	makeAzithroSuspension({
		id: 'rame-zithro-200mg-5ml-susp-15ml',
		name: 'Rame-zithro 200mg/5ml susp. 15 ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 33,
		matchKeywords: ['rame-zithro'],
	}),
	makeAzithroSuspension({
		id: 'rame-zithro-200mg-5ml-susp-30ml',
		name: 'Rame-zithro 200mg/5ml susp. 30 ml',
		mgPer5ml: 200,
		volumeMl: 30,
		price: 62.5,
		matchKeywords: ['rame-zithro'],
	}),
	makeAzithroSuspension({
		id: 'zithromax-1200mg-30ml-200mg-5ml-susp',
		name: 'Zithromax 1200mg/30ml (200mg/5ml) susp.',
		mgPer5ml: 200,
		volumeMl: 30,
		price: 126,
		matchKeywords: ['zithromax', '1200'],
	}),
	makeAzithroSuspension({
		id: 'zithromax-600mg-15ml-200mg-5ml-susp',
		name: 'Zithromax 600mg/15ml (200mg/5ml) susp.',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 89,
		matchKeywords: ['zithromax', '600'],
	}),
	makeAzithroSuspension({
		id: 'zithromax-900mg-22-5ml-200mg-5ml-susp',
		name: 'Zithromax 900mg/22.5ml (200mg/5ml) susp.',
		mgPer5ml: 200,
		volumeMl: 22.5,
		price: 100,
		matchKeywords: ['zithromax', '900'],
	}),
	makeAzithroSuspension({
		id: 'azi-once-200mg-5ml-susp-15ml',
		name: 'Azi-once 200mg/5ml susp. 15 ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 54,
		matchKeywords: ['azi-once'],
	}),
	makeAzithroSuspension({
		id: 'azi-once-200mg-5ml-susp-22-5ml',
		name: 'Azi-once 200mg/5ml susp. 22.5ml',
		mgPer5ml: 200,
		volumeMl: 22.5,
		price: 34,
		matchKeywords: ['azi-once'],
	}),

	// 3) Azithromycin suspensions (100/5)
	makeAzithroSuspension({
		id: 'zithrokan-100mg-5ml-susp-15ml',
		name: 'Zithrokan 100mg/5ml pd. for oral susp. 15 ml',
		mgPer5ml: 100,
		volumeMl: 15,
		price: 33,
		matchKeywords: ['zithrokan'],
	}),
	makeAzithroSuspension({
		id: 'unizithrin-100mg-5ml-susp-30ml',
		name: 'Unizithrin 100mg/5ml susp. 30ml',
		mgPer5ml: 100,
		volumeMl: 30,
		price: 37,
		matchKeywords: ['unizithrin'],
	}),
	makeAzithroSuspension({
		id: 'zithrodose-100mg-5ml-susp-45ml',
		name: 'Zithrodose 100mg/5ml susp. 45 ml',
		mgPer5ml: 100,
		volumeMl: 45,
		price: 52,
		matchKeywords: ['zithrodose'],
	}),
	makeAzithroSuspension({
		id: 'zithrodose-100mg-5ml-susp-30ml',
		name: 'Zithrodose 100mg/5ml susp. 30 ml',
		mgPer5ml: 100,
		volumeMl: 30,
		price: 24,
		matchKeywords: ['zithrodose'],
	}),
	makeAzithroSuspension({
		id: 'zithrodose-100mg-5ml-susp-60ml',
		name: 'Zithrodose 100mg/5ml susp. 60 ml',
		mgPer5ml: 100,
		volumeMl: 60,
		price: 62,
		matchKeywords: ['zithrodose'],
	}),
	makeAzithroSuspension({
		id: 'zithrodose-100mg-5ml-susp-15ml',
		name: 'Zithrodose 100mg/5ml susp. 15 ml',
		mgPer5ml: 100,
		volumeMl: 15,
		price: 12,
		matchKeywords: ['zithrodose'],
	}),
	makeAzithroSuspension({
		id: 'xerexomair-100mg-5ml-susp-30ml',
		name: 'Xerexomair 100mg/5ml pd. for oral susp. 30ml',
		mgPer5ml: 100,
		volumeMl: 30,
		price: 37,
		matchKeywords: ['xerexomair'],
	}),

	// 4) Azithromycin solids
	makeAzithroSolid({
		id: 'xithrone-500mg-3-fc-tab',
		name: 'Xithrone 500mg 3 f.c.tab.',
		strengthMg: 500,
		price: 63,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['xithrone'],
	}),
	makeAzithroSolid({
		id: 'xithrone-500mg-5-fc-tab',
		name: 'Xithrone 500mg 5 f.c.tab.',
		strengthMg: 500,
		price: 86,
		form: 'F.C. Tablets',
		packHint: '5days',
		matchKeywords: ['xithrone'],
	}),
	makeAzithroSolid({
		id: 'zithrokan-500mg-3-cap',
		name: 'Zithrokan 500mg 3 cap',
		strengthMg: 500,
		price: 77,
		form: 'Capsules',
		packHint: '3days',
		matchKeywords: ['zithrokan'],
	}),
	makeAzithroSolid({
		id: 'unizithrin-500mg-3-caps',
		name: 'Unizithrin 500mg 3 caps.',
		strengthMg: 500,
		price: 41,
		form: 'Capsules',
		packHint: '3days',
		matchKeywords: ['unizithrin'],
	}),
	makeAzithroSolid({
		id: 'azrolid-500mg-3-tabs',
		name: 'Azrolid 500mg 3 tablets',
		strengthMg: 500,
		price: 63,
		form: 'Tablets',
		packHint: '3days',
		matchKeywords: ['azrolid'],
	}),
	makeAzithroSolid({
		id: 'delzosin-600mg-3-fc-tabs',
		name: 'Delzosin 600 mg 3 f.c.tabs.',
		strengthMg: 600,
		price: 52,
		form: 'F.C. Tablets',
		packHint: '3days600',
		matchKeywords: ['delzosin'],
	}),
	makeAzithroSolid({
		id: 'infectomycin-500mg-6-fc-tabs',
		name: 'Infectomycin 500mg 6 f.c. tabs.',
		strengthMg: 500,
		price: 97,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['infectomycin'],
	}),
	makeAzithroSolid({
		id: 'zisrocin-500mg-3-cap',
		name: 'Zisrocin 500mg 3 cap',
		strengthMg: 500,
		price: 71,
		form: 'Capsules',
		packHint: '3days',
		matchKeywords: ['zisrocin'],
	}),
	makeAzithroSolid({
		id: 'zithrodose-500mg-5-caps',
		name: 'Zithrodose 500mg 5 capsules',
		strengthMg: 500,
		price: 79,
		form: 'Capsules',
		packHint: '5days',
		matchKeywords: ['zithrodose'],
	}),
	makeAzithroSolid({
		id: 'rame-zithro-500mg-3-fc-tabs',
		name: 'Rame-zithro 500mg 3 f.c.tabs.',
		strengthMg: 500,
		price: 44,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['rame-zithro'],
	}),
	makeAzithroSolid({
		id: 'rame-zithro-500mg-6-fc-tabs',
		name: 'Rame-zithro 500 mg 6 f.c.tabs.',
		strengthMg: 500,
		price: 88,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['rame-zithro'],
	}),
	makeAzithroSolid({
		id: 'delzosin-600mg-6-fc-tabs',
		name: 'Delzosin 600mg 6 f.c. tabs.',
		strengthMg: 600,
		price: 104,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['delzosin'],
	}),
	makeAzithroSolid({
		id: 'epizithro-500mg-3-caps',
		name: 'Epizithro 500 mg 3 caps.',
		strengthMg: 500,
		price: 62,
		form: 'Capsules',
		packHint: '3days',
		matchKeywords: ['epizithro'],
	}),
	makeAzithroSolid({
		id: 'zithotrac-500mg-3-tabs',
		name: 'Zithotrac 500 mg 3 tabs.',
		strengthMg: 500,
		price: 50,
		form: 'Tablets',
		packHint: '3days',
		matchKeywords: ['zithotrac'],
	}),
	makeAzithroSolid({
		id: 'unizithrin-500mg-6-caps',
		name: 'Unizithrin 500mg 6 caps.',
		strengthMg: 500,
		price: 82,
		form: 'Capsules',
		packHint: 'general',
		matchKeywords: ['unizithrin'],
	}),
	makeAzithroSolid({
		id: 'xerexomair-500mg-3-fc-tab',
		name: 'Xerexomair 500mg 3 f.c.tab.',
		strengthMg: 500,
		price: 63,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['xerexomair'],
	}),
	makeAzithroSolid({
		id: 'delzosin-500mg-3-fc-tabs',
		name: 'Delzosin 500 mg 3 f.c. tabs.',
		strengthMg: 500,
		price: 48,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['delzosin'],
	}),
	makeAzithroSolid({
		id: 'delzosin-500mg-6-fc-tabs',
		name: 'Delzosin 500 mg 6 f.c.tabs.',
		strengthMg: 500,
		price: 96,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['delzosin'],
	}),
	makeAzithroSolid({
		id: 'azrolid-500mg-6-fc-tabs',
		name: 'Azrolid 500mg 6 f.c. tab.',
		strengthMg: 500,
		price: 126,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['azrolid'],
	}),
	makeAzithroSolid({
		id: 'azithromash-500mg-3-fc-tabs',
		name: 'Azithromash 500 mg 3 f.c. tabs.',
		strengthMg: 500,
		price: 48,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['azithromash'],
	}),
	makeAzithroSolid({
		id: 'azithromash-500mg-6-fc-tabs',
		name: 'Azithromash 500 mg 6 f.c. tabs.',
		strengthMg: 500,
		price: 65,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['azithromash'],
	}),
	makeAzithroSolid({
		id: 'azithromycin-aug-500mg-3-fc-tabs',
		name: 'Azithromycin-aug 500 mg 3 f.c.tabs.',
		genericName: 'azithromycin dihydrate',
		strengthMg: 500,
		price: 32.5,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['azithromycin-aug'],
	}),
	makeAzithroSolid({
		id: 'azithromycin-aug-500mg-6-fc-tabs',
		name: 'Azithromycin-aug 500 mg 6 f.c.tabs.',
		strengthMg: 500,
		price: 126,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['azithromycin-aug'],
	}),
	makeAzithroSolid({
		id: 'azimacron-500mg-3-fc-tabs',
		name: 'Azimacron 500 mg 3 f.c. tabs',
		strengthMg: 500,
		price: 63,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['azimacron'],
	}),
	makeAzithroSolid({
		id: 'zathrotrue-500mg-3-fc-tabs',
		name: 'Zathrotrue 500 mg 3 f.c. tabs.',
		strengthMg: 500,
		price: 48,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['zathrotrue'],
	}),
	makeAzithroSolid({
		id: 'zathrotrue-500mg-6-fc-tabs',
		name: 'Zathrotrue 500 mg 6 f.c. tabs.',
		strengthMg: 500,
		price: 96,
		form: 'F.C. Tablets',
		packHint: 'general',
		matchKeywords: ['zathrotrue'],
	}),

	// 5) Azithromycin special packs
	makeAzithroSolid({
		id: 'zithromax-250mg-6-cap',
		name: 'Zithromax 250mg 6 cap',
		strengthMg: 250,
		price: 79,
		form: 'Capsules',
		packHint: '6caps250-zpak',
		matchKeywords: ['zithromax', '250'],
	}),

	// 6) Azithromycin IV
	makeAzithroIV({
		id: 'zithromax-500mg-vial',
		name: 'Zithromax 500mg vial',
		price: 160,
		matchKeywords: ['zithromax', 'iv'],
	}),
	makeAzithroIV({
		id: 'rame-zithro-500mg-powder-iv-inf',
		name: 'Rame-zithro 500mg pd. for i.v. inf. (hospitals only)',
		price: 75,
		matchKeywords: ['rame-zithro', 'iv'],
	}),

	// 7) H.Pylori kits
	makeHpyloriKit({
		id: 'heli-cure-500-20-500-14-ec-tab',
		name: 'Heli-cure 500/20/500 mg 14 enteric coated tab.',
		clarithroMg: 500,
		price: 240,
		countHint: '14',
		matchKeywords: ['heli-cure'],
	}),
	makeHpyloriKit({
		id: 'heli-cure-250-20-500-14-ec-tab',
		name: 'Heli-cure 250/20/500 mg 14 enteric coated tab.',
		clarithroMg: 250,
		price: 164,
		countHint: '14',
		matchKeywords: ['heli-cure'],
	}),
	makeHpyloriKit({
		id: 'peptic-care-14-enteric-coated-tab',
		name: 'Peptic care 14 enteric 250 mg coated tab',
		clarithroMg: 250,
		price: 230,
		countHint: '14',
		matchKeywords: ['peptic care'],
	}),
	makeHpyloriKit({
		id: 'peptic-care-28-enteric-coated-tab',
		name: 'Peptic care 28 enteric coated tab',
		clarithroMg: 250,
		price: 170,
		countHint: '28',
		matchKeywords: ['peptic care'],
	}),

	// 8) Anti-acne gels
	makeAntiAcneGel({
		id: 'isoromyderm-gel-30gm',
		name: 'Isoromyderm topical gel 30 gm',
		price: 71,
		sizeGm: 30,
		matchKeywords: ['isoromyderm'],
	}),
	makeAntiAcneGel({
		id: 'sebanoin-acne-gel-15gm',
		name: 'Sebanoin acne gel 15 gm',
		price: 33,
		sizeGm: 15,
		matchKeywords: ['sebanoin'],
	}),

	// 9) Azithromycin eye drops
	{
		id: 'cyanaro-1percent-eye-drops-2-5ml',
		name: 'Cyanaro 1% eye drops 2.5 ml',
		genericName: 'azithromycin',
		concentration: '1% (2.5ml)',
		price: 34,
		usage: 'قطرة عين مضاد حيوي (أزيثرومايسين) لالتهاب الملتحمة البكتيري.',
		timing: 'يوم ١–٢: مرتين يومياً، يوم ٣–٧: مرة يومياً',
		category: Category.ANTIBIOTICS_OPHTHALMIC,
		form: 'Eye Drops',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: () => 'نقطة في العين المصابة: يوم ١–٢ مرتين يومياً ثم يوم ٣–٧ مرة يومياً',
		warnings: ['قد يسبب حرقان بسيط/زغللة مؤقتة.', 'تجنب العدسات اللاصقة أثناء العلاج.'],
		matchKeywords: ['cyanaro', 'azithromycin eye', 'قطرة ازيثرومايسين', '#ophthalmic'],
	},

	// 10) Remaining azithro items (misc)
	makeAzithroSolid({
		id: 'zithromax-500mg-3-fc-tabs',
		name: 'Zithromax 500 mg 3 f.c.tabs.',
		strengthMg: 500,
		price: 160,
		form: 'F.C. Tablets',
		packHint: '3days',
		matchKeywords: ['zithromax', '500'],
	}),
	makeAzithroSolid({
		id: 'azi-once-250mg-6-caps',
		name: 'Azi-once 250mg 6 caps.',
		strengthMg: 250,
		price: 54,
		form: 'Capsules',
		packHint: '6caps250-zpak',
		matchKeywords: ['azi-once', '250'],
	}),
	{
		id: 'zithrodose-2gm-60ml-powder-oral-susp',
		name: 'Zithrodose 2gm/60ml pd. for oral susp',
		genericName: 'azithromycin',
		concentration: '2g/60ml',
		price: 34.25,
		usage: 'أزيثرومايسين جرعة عالية (عادةً جرعة واحدة في بروتوكولات محددة).',
		timing: 'جرعة واحدة بعد الأكل',
		category: Category.MACROLIDES,
		form: 'Powder',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 45,
		maxWeight: 200,
		calculationRule: () => '٢ جم جرعة واحدة بعد الأكل',
		warnings: AZITHRO_WARNINGS,
		matchKeywords: ['zithrodose', '2g', '2gm', 'single dose', '#antibiotics', '#macrolide'],
	},
	makeAzithroSuspension({
		id: 'unizithrocure-200mg-5ml-susp-15ml',
		name: 'Unizithrocure 200mg/5ml pd. for oral susp. 15ml',
		mgPer5ml: 200,
		volumeMl: 15,
		price: 24,
		matchKeywords: ['unizithrocure'],
	}),
];

