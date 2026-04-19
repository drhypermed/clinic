
import { Medication, Category } from '../../types';

export const PSORIASIS_MEDS: Medication[] = [

	// 1. treczimus 0.03% topical oint. 20 gm
	{
		id: 'treczimus-tacrolimus-oint-0-03-20',
		name: 'treczimus 0.03% topical oint. 20 gm',
		genericName: 'Tacrolimus',
		concentration: '0.03%',
		price: 114,
		matchKeywords: ['treczimus 0.03', 'treczimus', 'tacrolimus 0.03', 'تاكروليمس', 'تريزيمس', 'صدفية الوجه', 'intertriginous', 'صدفية', 'psoriasis', 'إكزيما', 'eczema', 'atopic dermatitis', 'التهاب جلد تأتبي', 'calcineurin inhibitor'],
		usage: 'مثبط مناعي موضعي يُستخدم غالباً للصدفية في مناطق حساسة (الوجه/الثنيات) كبديل لتقليل مخاطر الكورتيزون الموضعي (حسب التشخيص).',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.PSORIASIS,
		form: 'Ointment',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
		warnings: [
			'الحمل: بيانات بشرية محدودة للاستعمال الموضعي؛ الامتصاص عادة منخفض على مساحات صغيرة، لكن يُفضّل استخدامه بأقل كمية ولمدة أقصر بعد تقييم الفائدة والخطر.',
			'تداخلات: لا تُتوقع تداخلات جهازية مهمة عادةً موضعياً، لكن راجع تداخلات المريض ومناعته.',
			'تحذير (Black Box): خطر نظري من زيادة خطر أورام الجلد/اللمفوما مع مثبطات الكالسينيورين—تجنب الشمس/الأشعة فوق البنفسجية واستخدم واقي شمس. يُستخدم كخط ثانٍ فقط.',
			'قد يسبب حرقان/لسعة واحمرار في الأيام الأولى (شائع)؛ أوقفه وأعد التقييم عند تهيج شديد/عدوى جلدية.'
		]
	},

	// 2. treczimus 0.1% topical oint. 30 gm
	{
		id: 'treczimus-tacrolimus-oint-0-1-30',
		name: 'treczimus 0.1% topical oint. 30 gm',
		genericName: 'Tacrolimus',
		concentration: '0.1%',
		price: 219,
		matchKeywords: ['treczimus 0.1', 'tacrolimus 0.1', 'تريزيمس 0.1', 'تاكروليمس 0.1', 'psoriasis', 'صدفية', 'إكزيما', 'eczema', 'calcineurin inhibitor'],
		usage: 'تاكروليمس موضعي (تركيز أعلى) يُستخدم للصدفية في مناطق مختارة خصوصاً الوجه/الثنيات حسب التشخيص والمنطقة.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.PSORIASIS,
		form: 'Ointment',
		minAgeMonths: 192,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
		warnings: [
			'الحمل: يُستخدم فقط إذا اقتضى التشخيص وبأقل كمية ممكنة.',
			'تداخلات: نادرة موضعياً؛ راجع تداخلات المريض.',
			'تحذير (Black Box): خطر نظري لأورام الجلد/اللمفوما مع مثبطات الكالسينيورين. تجنب التعرض للشمس/UV واستخدم واقي شمس.',
			'لا يُستخدم على جلد مصاب بعدوى غير معالجة.',
			'قد يسبب حرقان/لسعة بالبداية؛ أعد التقييم إذا لم تتحسن خلال 2–4 أسابيع.'
		]
	},

	// 3. tarolimus 0.03% topical oint. 15 gm
	{
		id: 'tarolimus-tacrolimus-oint-0-03-15',
		name: 'tarolimus 0.03% topical oint. 15 gm',
		genericName: 'Tacrolimus',
		concentration: '0.03%',
		price: 129,
		matchKeywords: ['tarolimus 0.03', 'tarolimus', 'tacrolimus', 'تاروليمس', 'تاكروليمس', 'صدفية الوجه', 'صدفية', 'psoriasis', 'إكزيما', 'eczema', 'calcineurin inhibitor'],
		usage: 'تاكروليمس موضعي بتركيز 0.03% يُستخدم غالباً للصدفية في مناطق حساسة (حسب التشخيص والمنطقة).',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.PSORIASIS,
		form: 'Ointment',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
		warnings: [
			'الحمل: بيانات محدودة—استخدمه عند الضرورة فقط وبعد تقييم الفائدة والخطر.',
			'تداخلات: قليلة موضعياً.',
			'تحذير (Black Box): خطر نظري لأورام الجلد/اللمفوما مع مثبطات الكالسينيورين. تجنب الشمس/UV واستخدم واقي شمس.',
			'لا يُستخدم على عدوى جلدية نشطة؛ قد يسبب لسعة/حرقان.'
		]
	},

	// 4. diacalderm topical oint. 20 gm
	{
		id: 'diacalderm-betamethasone-calcipotriol-oint-20',
		name: 'diacalderm topical oint. 20 gm',
		genericName: 'Betamethasone + Calcipotriol',
		concentration: 'Ointment',
		price: 88,
		matchKeywords: ['diacalderm', 'دياكالدرم', 'betamethasone', 'calcipotriol', 'كالسيبوتريول', 'بيتاميثازون', 'psoriasis', 'صدفية', 'plaque psoriasis', 'صدفية لويحية'],
		usage: 'علاج موضعي مركب للصدفية اللويحية (Plaque psoriasis) يقلل الالتهاب والقشور (حسب التشخيص والمنطقة).',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.PSORIASIS,
		form: 'Ointment',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
		warnings: [
			'الحمل: يُستخدم بحذر—وجود كورتيزون قوي + نظير فيتامين د؛ تجنب المساحات الكبيرة/الضمادات المحكمة ؛ أعد التقييم عند الحاجة.',
			'تداخلات: تجنب استخدام منتجات فيتامين د الموضعية الأخرى على نفس المنطقة بدون توجيه (خطر زيادة الكالسيوم).',
			'تحذيرات خاصة: الإفراط قد يسبب ترقق الجلد/خطوط/كدمات (من الكورتيزون)، وقد يسبب اضطراب كالسيوم نادر إذا استُخدم بكميات كبيرة.',
			'لا يُستخدم على عدوى جلدية غير معالجة. لا يوضع على الجروح المفتوحة.'
		]
	},

	// 5. zarojel 0.1% topical gel 15 gm
	{
		id: 'zarojel-tazarotene-gel-0-1-15',
		name: 'zarojel 0.1% topical gel 15 gm',
		genericName: 'Tazarotene',
		concentration: '0.1%',
		price: 19,
		matchKeywords: ['zarojel', 'زاروجيل', 'tazarotene 0.1', 'تازاروتين', 'psoriasis gel', 'صدفية', 'psoriasis', 'ريتينويد', 'retinoid', 'حب شباب', 'acne'],
		usage: 'ريتينويد موضعي للصدفية اللويحية (وقد يستخدم أيضاً لحب الشباب حسب التشخيص).',
		timing: 'ليلاً – ٤–٦ أسابيع',
		category: Category.PSORIASIS,
		form: 'Gel',
		minAgeMonths: 216,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
		warnings: [
			'الحمل: ممنوع تماماً (فئة X—ريتينويد—خطر تشوهات جنينية شديدة). يلزم منع حمل فعّال أثناء الاستخدام.',
			'تداخلات: التهيج يزيد مع المقشرات القوية/الكحوليات/العطور أو علاجات حب الشباب القوية—يفصل حسب التشخيص والمنطقة.',
			'تحذيرات خاصة: يسبب تهيجاً/احمراراً/حرقاناً وحساسية للشمس؛ تجنب التعرض للشمس واستخدم واقي شمس.',
			'تجنب وضعه على الأكزيما/الجلد المتشقق لأنه يزيد التهيج.'
		]
	},
];

