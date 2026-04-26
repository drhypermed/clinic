import { Medication } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

const uniq = (values: Array<string | undefined | null>) => {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const v of values) {
		const s = (v || '').toString().trim();
		if (!s) continue;
		const key = s.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(s);
	}
	return out;
};

const appendIfMissing = (text: string, addition: string, needles: string[]) => {
	const base = (text || '').trim();
	const lower = base.toLowerCase();
	if (needles.some(n => lower.includes(n.toLowerCase()))) return base;
	return base ? `${base} ${addition}` : addition;
};

const makePatientUsage = (m: Medication) => {
	let text = (m.usage || '').toString().trim();
	text = appendIfMissing(text, 'هذا الدواء مُخصص للحالات النفسية/العصبية حسب التشخيص والمتابعة الطبية.', [
		'حسب التشخيص',
		'متابعة',
		'بوصفة',
		'تحت إشراف',
	]);
	return text;
};

const antipsychoticKeywordBoost = (m: Medication) => {
	const g = (m.genericName || '').toString().toLowerCase();
	const base = [
		'#anti-psychotic',
		'antipsychotic',
		'anti psychotic',
		'psychosis',
		'schizophrenia',
		'bipolar',
		'mania',
		'ذهان',
		'فصام',
		'ثنائي القطب',
		'هوس',
		'هلاوس',
		'ضلالات',
	];

	const dose = (m.concentration || '').toString();
	const doseAr = dose ? toAr(dose) : '';
	const dosePlain = dose
		.replace(/\s+/g, '')
		.replace(/\./g, '')
		.toLowerCase();

	const genericBoost: string[] = [];
	if (g.includes('quetiapine')) genericBoost.push('quetiapine', 'quetiapine fumarate', 'كويتيابين', 'سيروكويل', 'seroquel');
	else if (g.includes('risperidone')) genericBoost.push('risperidone', 'ريسبيريدون', 'risperdal', 'ريسبردال');
	else if (g.includes('olanzapine') && g.includes('fluoxetine')) genericBoost.push('symbyax', 'سيمبياكس', 'olanzapine fluoxetine', 'أولانزابين فلوكسيتين');
	else if (g.includes('olanzapine')) genericBoost.push('olanzapine', 'أولانزابين', 'اولانزابين', 'zyprexa', 'زيبريكسا');
	else if (g.includes('aripiprazole')) genericBoost.push('aripiprazole', 'أريبيبرازول', 'اريبيبرازول', 'abilify', 'ابيليفاي');
	else if (g.includes('clozapine')) genericBoost.push('clozapine', 'كلوزابين', 'clozaril', 'كلوزاريل');
	else if (g.includes('haloperidol')) genericBoost.push('haloperidol', 'هالوبيريدول', 'haldol', 'هالدول');
	else if (g.includes('amisulpride')) genericBoost.push('amisulpride', 'أميسولبرايد', 'اميسولبرايد', 'solian', 'سوليان');
	else if (g.includes('ziprasidone')) genericBoost.push('ziprasidone', 'زيبراسيدون', 'geodon', 'جيودون');
	else if (g.includes('paliperidone')) genericBoost.push('paliperidone', 'باليبيريدون', 'invega', 'إنفيجا');
	else if (g.includes('iloperidone')) genericBoost.push('iloperidone', 'إيلوبيريدون', 'fanapt');
	else if (g.includes('lurasidone')) genericBoost.push('lurasidone', 'لوراسيدون', 'latuda', 'لاتودا');
	else if (g.includes('cariprazine')) genericBoost.push('cariprazine', 'كاريبرازين', 'vraylar', 'فرايلار');
	else if (g.includes('brexpiprazole')) genericBoost.push('brexpiprazole', 'بريكسبيبرازول', 'rexulti', 'ريكسولتي');
	else if (g.includes('pimozide')) genericBoost.push('pimozide', 'بيموزيد', 'orap', 'أوراب');
	else if (g.includes('chlorpromazine')) genericBoost.push('chlorpromazine', 'كلوربرومازين', 'largactil', 'لارجاكتيل');
	else if (g.includes('sulpiride')) genericBoost.push('sulpiride', 'سلبيريد', 'dogmatil', 'دوجماتيل');
	else if (g.includes('trifluoperazine')) genericBoost.push('trifluoperazine', 'تريفلو بيرازين', 'stelazine', 'ستلازين');

	return uniq([...base, ...genericBoost, dose, dosePlain, doseAr]);
};

const enhanceAntipsychoticMedication = (m: Medication): Medication => {
	const boosted = antipsychoticKeywordBoost(m);
	return {
		...m,
		matchKeywords: uniq([...(m.matchKeywords || []), ...boosted]),
		usage: makePatientUsage(m),
	};
};

export const enhanceAntipsychoticList = (list: Medication[]): Medication[] => list.map(enhanceAntipsychoticMedication);

