import { Medication, Category } from '../../types';

const toAr = (n: number | string) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);

export const ANTIFUNGAL_GROUP: Medication[] = [
	// ملاحظة: الجرعات هنا “شائعة الاستخدام” وتختلف حسب مكان الإصابة وشدتها.
	// تم تجنب عبارات (حسب الطبيب/استشر/تحت إشراف/طبقاً للنشرة/البروتوكول) في النص الموجّه للمريض.

	// ==========================================
	// SYSTEMIC ANTIFUNGALS (Oral)
	// ==========================================

	// 1) itranox 100mg 15 caps.
	{
		id: 'itranox-100-15-caps',
		name: 'Itranox 100mg 15 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 108,
		matchKeywords: ['itranox', 'itraconazole', 'ايترا نوكس', 'فطريات', 'تينيا', 'فطريات اظافر', 'مضاد فطريات', 'fungal', 'antifungal', '#antifungal'],
		usage: 'كبسولات إتراكونازول لعلاج عدوى فطرية محددة (مثل التينيا وفطريات الأظافر).',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل لزيادة الامتصاص.', 'يتداخل مع أدوية كثيرة (مثبط CYP3A4 قوي): انتبه للتداخلات.', 'غير مناسب مع قصور القلب.', 'سمية كبدية محتملة: متابعة إنزيمات الكبد عند الاستخدام المطول.']
	},

	// 2) itranox 100mg 5 caps.
	{
		id: 'itranox-100-5-caps',
		name: 'Itranox 100mg 5 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 36,
		matchKeywords: ['itranox 5', 'itranox', 'itraconazole', 'ايترا نوكس', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'عبوة صغيرة لإتراكونازول (كورس قصير/استكمال) لعدوى فطرية محددة.',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل.', 'يتداخل مع أدوية كثيرة (مثبط CYP3A4 قوي).', 'غير مناسب مع قصور القلب.', 'سمية كبدية محتملة: متابعة إنزيمات الكبد.']
	},

	// 3) itrapex 100mg 15 caps.
	{
		id: 'itrapex-100-15',
		name: 'Itrapex 100mg 15 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 141,
		matchKeywords: ['itrapex', 'itraconazole', 'ايترا بكس', 'فطريات', 'تينيا', 'فطريات اظافر'],
		usage: 'مضاد فطريات واسع المجال (للعدوى الفطرية الجلدية، التينيا، وفطريات الأظافر).',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل مباشرة.', 'غير مناسب مع قصور القلب.', 'يتداخل مع أدوية كثيرة (مثبط CYP3A4 قوي).', 'سمية كبدية محتملة: متابعة إنزيمات الكبد.']
	},

	// 11) diflucan 150mg 1 caps.
	{
		id: 'diflucan-150-1-cap',
		name: 'Diflucan 150mg 1 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 111,
		matchKeywords: ['diflucan', 'fluconazole', 'ديفلوكان', 'كانديدا', 'فطريات مهبل', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'فلوكونازول ١٥٠ مجم (جرعة واحدة شائعة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 13) flucoral 150mg 2 caps.
	{
		id: 'flucoral-150-2-caps',
		name: 'Flucoral 150mg 2 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 30,
		matchKeywords: ['flucoral', 'fluconazole', 'فلوكورال', 'كانديدا', 'فطريات مهبل', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'فلوكونازول ١٥٠ مجم (عبوة ٢ كبسولة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 14) fungican 150mg 2 caps.
	{
		id: 'fungican-150-caps',
		name: 'Fungican 150mg 2 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 47,
		matchKeywords: ['fungican', 'fluconazole', 'فنجيكان', 'كانديدا', 'فطريات مهبل', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'فلوكونازول ١٥٠ مجم (جرعة واحدة شائعة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 18) itracon 100mg 4 caps.
	{
		id: 'itracon-100-4-caps',
		name: 'Itracon 100mg 4 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 26,
		matchKeywords: ['itracon', 'itraconazole', 'ايتراكون', 'فطريات'],
		usage: 'إتراكونازول (عبوة صغيرة) لعدوى فطرية محددة.',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل.', 'غير مناسب مع قصور القلب.', 'يتداخل مع أدوية كثيرة.']
	},

	// 19) itracon 100mg 14 caps.
	{
		id: 'itracon-100-14-caps',
		name: 'Itracon 100mg 14 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 130,
		matchKeywords: ['itracon 14', 'itracon', 'itraconazole', 'ايتراكون'],
		usage: 'إتراكونازول لعلاج عدوى فطرية محددة (مثل التينيا وبعض فطريات الأظافر).',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل.', 'يتداخل مع أدوية كثيرة (مثبط CYP3A4 قوي).', 'غير مناسب مع قصور القلب.', 'سمية كبدية محتملة: متابعة إنزيمات الكبد.']
	},

	// 20) itrafungex 100mg 15 caps.
	{
		id: 'itrafungex-100-15-caps',
		name: 'Itrafungex 100mg 15 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 114,
		matchKeywords: ['itrafungex', 'itraconazole', 'ايترافونجكس', 'فطريات'],
		usage: 'إتراكونازول لعلاج عدوى فطرية محددة (مثل التينيا وفطريات الأظافر).',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل.', 'يتداخل مع أدوية كثيرة (مثبط CYP3A4 قوي).', 'غير مناسب مع قصور القلب.', 'سمية كبدية محتملة: متابعة إنزيمات الكبد.']
	},

	// 25) treflucan 150mg 1 caps.
	{
		id: 'treflucan-150-1-cap',
		name: 'Treflucan 150mg 1 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 28,
		matchKeywords: ['treflucan', 'fluconazole', 'تري فلوكان', 'كانديدا', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'فلوكونازول ١٥٠ مجم (جرعة واحدة شائعة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 31) unifungi 150mg 2 caps.
	{
		id: 'unifungi-150-2-caps',
		name: 'Unifungi 150mg 2 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 53,
		matchKeywords: ['unifungi', 'fluconazole', 'يوني فانجي', 'كانديدا', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'فلوكونازول ١٥٠ مجم (عبوة ٢ كبسولة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 34) nazowell 150 mg 1 cap.
	{
		id: 'nazowell-150-1-cap',
		name: 'Nazowell 150 mg 1 cap.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 36,
		matchKeywords: ['nazowell', 'fluconazole', 'نازوويل', 'كانديدا', 'فطريات', 'مضاد فطريات', 'fungal', '#antifungal'],
		usage: 'فلوكونازول ١٥٠ مجم (جرعة واحدة شائعة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// ==========================================
	// TOPICAL ANTIFUNGALS (Skin / Mouth)
	// ==========================================

	// 4) lamifen 1% cream 15 gm
	{
		id: 'lamifen-cream-15',
		name: 'Lamifen 1% cream 15 gm',
		genericName: 'Terbinafine',
		concentration: '1%',
		price: 18,
		matchKeywords: ['lamifen cream', 'terbinafine', 'لاميفين كريم', 'تينيا', 'فطريات القدم', 'بين الاصابع'],
		usage: 'كريم تيربينافين لعلاج فطريات الجلد (مثل تينيا القدم/الجسم/بين الفخذين).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.', 'تجنب ملامسة العين.']
	},

	// 5) miconaz 2% cream 20 gm
	{
		id: 'miconaz-cream-2-20',
		name: 'Miconaz 2% cream 20 gm',
		genericName: 'Miconazole Nitrate',
		concentration: '2%',
		price: 15,
		matchKeywords: ['miconaz cream', 'miconazole', 'ميكوناز كريم', 'فطريات جلد', 'كانديدا جلد'],
		usage: 'كريم ميكونازول للجلد لعلاج فطريات الجلد والخمائر.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.', 'اغسل وجفف الجلد قبل الاستخدام.']
	},

	// 6) miconaz 2% oral gel 20 gm
	{
		id: 'miconaz-oral-gel',
		name: 'Miconaz 2% oral gel 20 gm',
		genericName: 'Miconazole',
		concentration: '2%',
		price: 23,
		matchKeywords: ['miconaz gel', 'miconazole gel', 'ميكوناز جل', 'فطريات فم', 'لسان ابيض'],
		usage: 'جل للفم لعلاج فطريات اللسان والفم (القلاع) للأطفال والكبار.',
		timing: '٤ مرات يومياً – ٧–١٤ يوم',
		category: Category.ANTIFUNGAL,
		form: 'Gel',
		minAgeMonths: 4,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: (_w, ageMonths) => (ageMonths < 24 ? '¼ ملعقة صغيرة' : '½ ملعقة صغيرة'),
		warnings: ['للرضع: توضع كميات صغيرة على أجزاء متفرقة لتقليل خطر الاختناق.']
	},

	// 8) miconaz 2% powder 20 gm
	{
		id: 'miconaz-powder-2-20',
		name: 'Miconaz 2% powder 20 gm',
		genericName: 'Miconazole',
		concentration: '2%',
		price: 16,
		matchKeywords: ['miconaz powder', 'miconazole powder', 'ميكوناز بودرة', 'تسلخات', 'ثنايا'],
		usage: 'بودرة مضاد فطريات للتسلخات وثنايا الجلد والقدم.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Powder',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['تجنب الاستنشاق.', 'للاستخدام الخارجي فقط.']
	},

	// 9) wellofung 2% topical cream 40 gm
	{
		id: 'wellofung-cream-2-40',
		name: 'Wellofung 2% topical cream 40 gm',
		genericName: 'Ketoconazole',
		concentration: '2%',
		price: 48,
		matchKeywords: ['wellofung', 'ketoconazole', 'ويلوفنج', 'فطريات جلد'],
		usage: 'كريم كيتوكونازول ٢٪ لعلاج فطريات الجلد والخمائر.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 26) closol 10mg/ml topical spray 40 ml
	{
		id: 'closol-spray-10mgml-40',
		name: 'Closol 10mg/ml topical spray 40 ml',
		genericName: 'Clotrimazole',
		concentration: '10mg/ml',
		price: 44,
		matchKeywords: ['closol', 'clotrimazole', 'كلوسول', 'سبراي فطريات'],
		usage: 'سبراي كلوتريمازول لفطريات الجلد خاصة المناطق الواسعة أو صعبة الوصول.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Spray',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'تجنب العين والوجه.', 'للاستخدام الخارجي فقط.']
	},

	// 35) butaximark 1% topical cream 15 gm
	{
		id: 'butaximark-butenafine-1-15',
		name: 'Butaximark 1% topical cream 15 gm',
		genericName: 'Butenafine HCl',
		concentration: '1%',
		price: 23,
		matchKeywords: ['butaximark', 'butenafine', 'بوتاكسي مارك', 'فطريات القدم'],
		usage: 'كريم بوتينافين ١٪ لفطريات الجلد (مثل قدم الرياضي/تينيا الجسم).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 36) candicure 1% topical cream 30 gm
	{
		id: 'candicure-isoconazole-1-30',
		name: 'Candicure 1% topical cream 30 gm',
		genericName: 'Isoconazole Nitrate',
		concentration: '1%',
		price: 36,
		matchKeywords: ['candicure', 'isoconazole', 'كانديكيور', 'فطريات جلد'],
		usage: 'كريم إيزوكونازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 37) candistan 1% topical powder. 40 gm
	{
		id: 'candistan-clotrimazole-powder-1-40',
		name: 'Candistan 1% topical powder 40 gm',
		genericName: 'Clotrimazole',
		concentration: '1%',
		price: 10,
		matchKeywords: ['candistan powder', 'clotrimazole powder', 'كانديستان بودرة', 'تسلخات'],
		usage: 'بودرة كلوتريمازول للتسلخات وفطريات ثنايا الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Powder',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['تجنب الاستنشاق.', 'للاستخدام الخارجي فقط.']
	},

	// 41) terbin 1% cream 15 gm
	{
		id: 'terbin-terbinafine-cream-1-15',
		name: 'Terbin 1% cream 15 gm',
		genericName: 'Terbinafine',
		concentration: '1%',
		price: 16.5,
		matchKeywords: ['terbin cream', 'terbinafine', 'تيربين', 'فطريات القدم'],
		usage: 'كريم تيربينافين لفطريات الجلد (مثل تينيا القدم/الجسم).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 44) biosertazol 2% top. cream 30 gm
	{
		id: 'biosertazol-sertaconazole-2-30',
		name: 'Biosertazol 2% top. cream 30 gm',
		genericName: 'Sertaconazole',
		concentration: '2%',
		price: 46,
		matchKeywords: ['biosertazol', 'sertaconazole', 'بيوسرتازول', 'فطريات'],
		usage: 'كريم سيرتاكونازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 45) candistan 1% topical cream 40 gm
	{
		id: 'candistan-clotrimazole-cream-1-40',
		name: 'Candistan 1% topical cream 40 gm',
		genericName: 'Clotrimazole',
		concentration: '1%',
		price: 36,
		matchKeywords: ['candistan cream', 'clotrimazole', 'كانديستان كريم', 'فطريات جلد'],
		usage: 'كريم كلوتريمازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 46) dermatin 1% top. cream 14 gm
	{
		id: 'dermatin-clotrimazole-cream-1-14',
		name: 'Dermatin 1% top. cream 14 gm',
		genericName: 'Clotrimazole',
		concentration: '1%',
		price: 15,
		matchKeywords: ['dermatin', 'clotrimazole', 'درماتين', 'فطريات'],
		usage: 'كريم كلوتريمازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 48) miconaz 2% liquid spray 60 ml
	{
		id: 'miconaz-liquid-spray-2-60',
		name: 'Miconaz 2% liquid spray 60 ml',
		genericName: 'Miconazole',
		concentration: '2%',
		price: 43,
		matchKeywords: ['miconaz spray', 'miconazole spray', 'ميكوناز سبراي', 'فطريات'],
		usage: 'سبراي ميكونازول لفطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Spray',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'تجنب العين.', 'للاستخدام الخارجي فقط.']
	},

	// 49) miconaz 2% powder spray 60 ml
	{
		id: 'miconaz-powder-spray-2-60',
		name: 'Miconaz 2% powder spray 60 ml',
		genericName: 'Miconazole Nitrate',
		concentration: '2%',
		price: 47,
		matchKeywords: ['miconaz powder spray', 'miconazole powder spray', 'ميكوناز سبراي بودرة', 'تسلخات'],
		usage: 'سبراي بودرة ميكونازول للتسلخات وفطريات القدم/الثنايا.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Spray',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['تجنب الاستنشاق.', 'قابل للاشتعال: بعيداً عن النار.', 'للاستخدام الخارجي فقط.']
	},

	// 51) terbifungin 1% cream 15 gm
	{
		id: 'terbifungin-terbinafine-cream-1-15',
		name: 'Terbifungin 1% cream 15 gm',
		genericName: 'Terbinafine HCl',
		concentration: '1%',
		price: 7.5,
		matchKeywords: ['terbifungin cream', 'terbinafine', 'تيربيفنجين', 'فطريات'],
		usage: 'كريم تيربينافين لعلاج فطريات الجلد.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 52) terbin 1% topical solution 15 ml
	{
		id: 'terbin-terbinafine-solution-1-15',
		name: 'Terbin 1% topical solution 15 ml',
		genericName: 'Terbinafine HCl',
		concentration: '1%',
		price: 10.5,
		matchKeywords: ['terbin solution', 'terbinafine solution', 'تيربين محلول', 'فطريات'],
		usage: 'محلول تيربينافين لفطريات الجلد خاصة بين الأصابع.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Solution',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: () => 'مسح على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'للاستخدام الخارجي فقط.']
	},

	// ==========================================
	// SHAMPOOS
	// ==========================================

	// 7) nizapex 20mg/gm shampoo 80 ml
	{
		id: 'nizapex-shampoo-80',
		name: 'Nizapex 20mg/gm shampoo 80 ml',
		genericName: 'Ketoconazole',
		concentration: '2%',
		price: 68,
		matchKeywords: ['nizapex', 'ketoconazole shampoo', 'نيزابكس', 'قشرة', 'التهاب دهني'],
		usage: 'شامبو كيتوكونازول ٢٪ لعلاج القشرة والالتهاب الدهني وفطريات فروة الرأس.',
		timing: 'مرتين أسبوعياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Lotion',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => 'كمية مناسبة على الفروة مرتين أسبوعياً لمدة ٢–٤ أسابيع',
		warnings: ['تجنب ملامسة العين.', 'للاستخدام الخارجي فقط.']
	},

	// 22) nizoral 2% shampoo 60 ml
	{
		id: 'nizoral-shampoo-2-60',
		name: 'Nizoral 2% shampoo 60 ml',
		genericName: 'Ketoconazole',
		concentration: '2%',
		price: 68,
		matchKeywords: ['nizoral', 'ketoconazole shampoo', 'نيزورال', 'قشرة', 'التهاب دهني'],
		usage: 'شامبو كيتوكونازول ٢٪ لعلاج القشرة والالتهاب الدهني.',
		timing: 'مرتين أسبوعياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Lotion',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => 'كمية مناسبة على الفروة مرتين أسبوعياً لمدة ٢–٤ أسابيع',
		warnings: ['تجنب ملامسة العين.', 'للاستخدام الخارجي فقط.']
	},

	// ==========================================
	// COMBINATION CREAMS (Antifungal + Steroid)
	// ==========================================

	// 12) elica-m cream 30 gm
	{
		id: 'elica-m-cream-30',
		name: 'Elica-M cream 30 gm',
		genericName: 'Mometasone Furoate + Miconazole Nitrate',
		concentration: 'Cream',
		price: 52,
		matchKeywords: ['elica-m', 'mometasone miconazole', 'اليكا ام', 'فطريات ملتهبة'],
		usage: 'كريم للفطريات المصحوبة بالتهاب/حكة (مضاد فطري + كورتيزون).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون: تجنب الاستخدام لفترات طويلة، وتجنب الوجه والثنايا قدر الإمكان.']
	},

	// 38) daktacort cream 15 gm
	{
		id: 'daktacort-cream-15',
		name: 'Daktacort cream 15 gm',
		genericName: 'Hydrocortisone + Miconazole Nitrate',
		concentration: 'Cream',
		price: 48,
		matchKeywords: ['daktacort', 'hydrocortisone miconazole', 'دكتاكورت', 'تسلخات', 'فطريات ملتهبة'],
		usage: 'للالتهابات الفطرية المصحوبة باحمرار وحكة (مضاد فطري + كورتيزون خفيف).',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['تجنب الاستخدام المطوّل، خصوصاً على الوجه والأطفال.']
	},

	// 42) travodermal topical cream 15 gm
	{
		id: 'travodermal-cream-15',
		name: 'Travodermal topical cream 15 gm',
		genericName: 'Diflucortolone Valerate + Isoconazole Nitrate',
		concentration: 'Cream',
		price: 76,
		matchKeywords: ['travodermal 15', 'diflucortolone isoconazole', 'ترافوديرمال', 'فطريات ملتهبة'],
		usage: 'كريم للفطريات الملتهبة (مضاد فطري + كورتيزون قوي نسبياً).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون قوي نسبياً: تجنب الوجه والثنايا والاستخدام الطويل.']
	},

	// 43) betapronate plus cream 30 gm
	{
		id: 'betapronate-plus-cream-30',
		name: 'Betapronate plus cream 30 gm',
		genericName: 'Betamethasone + Clotrimazole',
		concentration: 'Cream',
		price: 28,
		matchKeywords: ['betapronate plus', 'betamethasone clotrimazole', 'بيتابرونات بلس', 'فطريات ملتهبة'],
		usage: 'مضاد فطري + كورتيزون لحالات الحكة/الالتهاب الشديد لفترة قصيرة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون: تجنب الوجه والثنايا والأطفال والاستخدام المطوّل.']
	},

	// 53) travodermal topical cream 30 gm
	{
		id: 'travodermal-cream-30',
		name: 'Travodermal topical cream 30 gm',
		genericName: 'Diflucortolone Valerate + Isoconazole Nitrate',
		concentration: 'Cream',
		price: 76,
		matchKeywords: ['travodermal 30', 'diflucortolone isoconazole', 'ترافوديرمال', 'فطريات ملتهبة'],
		usage: 'كريم للفطريات الملتهبة (مضاد فطري + كورتيزون قوي نسبياً).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون قوي نسبياً: تجنب الوجه والثنايا والاستخدام الطويل.']
	},

	// ==========================================
	// VAGINAL PREPARATIONS
	// ==========================================

	// 10) gynozol 400mg 3 vag. ovules
	{
		id: 'gynozol-400-3-ovules',
		name: 'Gynozol 400mg 3 vag. ovules',
		genericName: 'Miconazole Nitrate',
		concentration: '400mg (3 ovules)',
		price: 30,
		matchKeywords: ['gynozol 400', 'miconazole 400', 'جينوزول 400', 'فطريات مهبل'],
		usage: 'تحاميل/أوفول مهبلي لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.', 'قد يضعف الواقي الذكري أثناء الاستخدام.']
	},

	// 15) gynoconazol 0.8% vaginal cream 30 gm
	{
		id: 'gynoconazol-vaginal-cream-0-8-30',
		name: 'Gynoconazol 0.8% vaginal cream 30 gm',
		genericName: 'Terconazole',
		concentration: '0.8%',
		price: 46,
		matchKeywords: ['gynoconazol 0.8', 'terconazole 0.8', 'جينوكونازول', 'فطريات مهبل'],
		usage: 'كريم مهبلي تيركونازول لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['قد يضعف الواقي الذكري.', 'يفضل ملابس داخلية قطنية.']
	},

	// 16) gynoconazol 80mg 3 vag. supp
	{
		id: 'gynoconazol-80-3-supp',
		name: 'Gynoconazol 80mg 3 vag. supp',
		genericName: 'Terconazole',
		concentration: '80mg (3 vaginal suppositories)',
		price: 53,
		matchKeywords: ['gynoconazol 80', 'terconazole 80', 'جينوكونازول 80', 'فطريات مهبل'],
		usage: 'تحاميل مهبلية تيركونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 17) gynoconazol 0.4% vag. cream 30 gm
	{
		id: 'gynoconazol-vaginal-cream-0-4-30',
		name: 'Gynoconazol 0.4% vag. cream 30 gm',
		genericName: 'Terconazole',
		concentration: '0.4%',
		price: 36,
		matchKeywords: ['gynoconazol 0.4', 'terconazole 0.4', 'جينوكونازول 0.4', 'فطريات مهبل'],
		usage: 'كريم مهبلي تيركونازول لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['قد يضعف الواقي الذكري.', 'يفضل ملابس داخلية قطنية.']
	},

	// 27) gynozol 2% vaginal cream 40 gm
	{
		id: 'gynozol-vaginal-cream-2-40',
		name: 'Gynozol 2% vaginal cream 40 gm',
		genericName: 'Miconazole',
		concentration: '2%',
		price: 58,
		matchKeywords: ['gynozol 2%', 'miconazole vaginal cream', 'جينوزول كريم مهبلي', 'فطريات مهبل'],
		usage: 'كريم مهبلي ميكونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['قد يضعف الواقي الذكري.', 'يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 32) viatrazo 0.8% vaginal cream 30 gm
	{
		id: 'viatrazo-vaginal-cream-0-8-30',
		name: 'Viatrazo 0.8% vaginal cream 30 gm',
		genericName: 'Terconazole',
		concentration: '0.8%',
		price: 36,
		matchKeywords: ['viatrazo 0.8', 'terconazole', 'فيا ترازو', 'فطريات مهبل'],
		usage: 'كريم مهبلي تيركونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['قد يضعف الواقي الذكري.']
	},

	// 33) viatrazo 80 mg 3 vag. supp.
	{
		id: 'viatrazo-80-3-supp',
		name: 'Viatrazo 80 mg 3 vag. supp.',
		genericName: 'Terconazole',
		concentration: '80mg (3 vaginal suppositories)',
		price: 53,
		matchKeywords: ['viatrazo 80', 'terconazole 80', 'فيا ترازو 80', 'فطريات مهبل'],
		usage: 'تحاميل مهبلية تيركونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 39) gynotrazonagen 600mg 3 vaginal ovules+applicator
	{
		id: 'gynotrazonagen-600-3-ovules',
		name: 'Gynotrazonagen 600mg 3 vaginal ovules + applicator',
		genericName: 'Isoconazole Nitrate',
		concentration: '600mg (3 ovules)',
		price: 33,
		matchKeywords: ['gynotrazonagen', 'isoconazole 600', 'جينو ترازو', 'فطريات مهبل'],
		usage: 'أوفول/تحميلة مهبلية إيزوكونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 40) gynozol 200mg 6 vag. ovules
	{
		id: 'gynozol-200-6-ovules',
		name: 'Gynozol 200mg 6 vag. ovules',
		genericName: 'Miconazole',
		concentration: '200mg (6 ovules)',
		price: 32,
		matchKeywords: ['gynozol 200', 'miconazole 200', 'جينوزول 200', 'فطريات مهبل'],
		usage: 'أوفول/تحميلة مهبلية ميكونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 47) gynomonix 80 mg 3 vag. ovules
	{
		id: 'gynomonix-80-3-ovules',
		name: 'Gynomonix 80 mg 3 vag. ovules',
		genericName: 'Terconazole',
		concentration: '80mg (3 ovules)',
		price: 41,
		matchKeywords: ['gynomonix 80', 'terconazole', 'جينومونيكس', 'فطريات مهبل'],
		usage: 'أوفول/تحميلة مهبلية تيركونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 50) sedalostate 2% vaginal cream 5 gm
	{
		id: 'sedalostate-butoconazole-vag-cream-2-5',
		name: 'Sedalostate 2% vaginal cream 5 gm',
		genericName: 'Butoconazole',
		concentration: '2% (5g)',
		price: 23,
		matchKeywords: ['sedalostate', 'butoconazole', 'سيدالوستات', 'فطريات مهبل'],
		usage: 'كريم مهبلي بيوتوكونازول لعلاج فطريات المهبل.',
		timing: 'جرعة واحدة مساءً',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// ==========================================
	// OTHER FORMS
	// ==========================================

	// 21) lamifen 125mg 14 tab
	{
		id: 'lamifen-125-14-tabs',
		name: 'Lamifen 125mg 14 tab',
		genericName: 'Terbinafine',
		concentration: '125mg',
		price: 78,
		matchKeywords: ['lamifen 125', 'terbinafine 125', 'لاميفين 125', 'فطريات'],
		usage: 'تيربينافين أقراص لعلاج عدوى فطرية محددة (مثل بعض حالات فروة الرأس/الأظافر).',
		timing: 'مرة يومياً – ٢–٦ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Tablets',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 10,
		maxWeight: 200,
		calculationRule: () => '١ قرص مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['قد يؤثر على الكبد: أوقفه عند اصفرار/بول داكن/ألم شديد بالبطن.', 'انتبه للتداخلات الدوائية.']
	},

	// 30) lamifen 250mg 14 tab
	{
		id: 'lamifen-250-14-tabs',
		name: 'Lamifen 250mg 14 tab',
		genericName: 'Terbinafine',
		concentration: '250mg',
		price: 112,
		matchKeywords: ['lamifen 250', 'terbinafine 250', 'لاميفين 250', 'فطريات اظافر'],
		usage: 'تيربينافين أقراص لعلاج فطريات الأظافر وبعض عدوى الجلد.',
		timing: 'مرة يومياً – ٢–٦ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ قرص مرة يومياً مع الأكل لمدة ٢–٦ أسابيع',
		warnings: ['قد يؤثر على الكبد: أوقفه عند اصفرار/بول داكن/ألم شديد بالبطن.', 'انتبه للتداخلات الدوائية.']
	},

	// 23) nystatin 100 000 i.u./ml 30ml susp.
	{
		id: 'nystatin-100k-oral-susp-30',
		name: 'Nystatin 100 000 i.u./ml 30ml susp.',
		genericName: 'Nystatin',
		concentration: '100,000 IU/ml',
		price: 30,
		matchKeywords: ['nystatin', 'nyastatin', 'نيستاتين', 'القلاع', 'فطريات فم'],
		usage: 'معلق فموي لعلاج فطريات الفم (القلاع).',
		timing: '٤ مرات يومياً – ٧–١٤ يوم',
		category: Category.ANTIFUNGAL,
		form: 'Oral Suspension',
		minAgeMonths: 1,
		maxAgeMonths: 1200,
		minWeight: 3,
		maxWeight: 200,
		calculationRule: (_w, ageMonths) => (ageMonths < 12 ? '١ مل' : ageMonths < 72 ? '٢ مل' : '٤ مل'),
		warnings: ['لا تُخلط الجرعة في زجاجة الرضاعة.', 'قد يسبب طعم غير مستساغ أو غثيان خفيف.']
	},

	// 24) otocort ear drops 10 ml
	{
		id: 'otocort-ear-drops-10',
		name: 'Otocort ear drops 10 ml',
		genericName: 'Flumethasone Pivalate + Clioquinol',
		concentration: 'Ear drops',
		price: 26,
		matchKeywords: ['otocort', 'ear drops', 'اوتوكورت', 'حكة الاذن', 'التهاب اذن خارجي'],
		usage: 'قطرة للأذن لالتهاب القناة الخارجية مع حكة/التهاب وعدوى سطحية.',
		timing: '٢–٣ مرات يومياً – ٥–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Drops',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '٢–٣ نقط في الأذن ٢–٣ مرات يومياً لمدة ٥–٧ أيام',
		warnings: ['لا تُستخدم عند وجود ثقب في طبلة الأذن.', 'إذا ظهر ألم شديد/إفرازات كثيرة: يلزم تقييم.']
	},

	// 28) itrafungex 100mg 4 caps.
	{
		id: 'itrafungex-100-4-caps',
		name: 'Itrafungex 100mg 4 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 18,
		matchKeywords: ['itrafungex 4', 'itraconazole', 'ايترافونجكس 4'],
		usage: 'عبوة صغيرة لإتراكونازول (كورس قصير) لعدوى فطرية محددة.',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل.', 'غير مناسب مع قصور القلب.', 'يتداخل مع أدوية كثيرة.']
	},

	// 29) itrapex 100mg 4 caps.
	{
		id: 'itrapex-100-4',
		name: 'Itrapex 100mg 4 caps.',
		genericName: 'Itraconazole',
		concentration: '100mg',
		price: 38,
		matchKeywords: ['itrapex 4', 'itraconazole', 'ايترا بكس 4', 'تينيا ملونة'],
		usage: 'كورس قصير لإتراكونازول (مثل التينيا الملونة وبعض العدوى الفطرية السطحية).',
		timing: 'مرة يومياً مع الأكل – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٢–٤ أسابيع',
		warnings: ['يؤخذ بعد الأكل.', 'يتداخل مع أدوية كثيرة (مثبط CYP3A4 قوي).', 'غير مناسب مع قصور القلب.', 'سمية كبدية محتملة: متابعة إنزيمات الكبد.']
	},

	// ==========================================
	// PART 2 (54–93)
	// ==========================================

	// 54) nazowell 150 mg 3 caps.
	{
		id: 'nazowell-150-3-caps',
		name: 'Nazowell 150 mg 3 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 108,
		matchKeywords: ['nazowell 150 3', 'nazowell', 'fluconazole 150', 'نازوويل ٣ كبسولات', 'كانديدا'],
		usage: 'فلوكونازول ١٥٠ مجم لعلاج عدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 55) sedalostate 2% vaginal cream 15 gm
	{
		id: 'sedalostate-butoconazole-vag-cream-2-15',
		name: 'Sedalostate 2% vaginal cream 15 gm',
		genericName: 'Butoconazole',
		concentration: '2% (15g)',
		price: 79,
		matchKeywords: ['sedalostate 15', 'sedalostate', 'butoconazole', 'سيدالوستات ١٥', 'فطريات مهبل'],
		usage: 'كريم مهبلي بيوتوكونازول لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 56) candicure 1 - 600mg 3 vag. ovules
	{
		id: 'candicure-isoconazole-600-3-ovules',
		name: 'Candicure 1 - 600mg 3 vag. ovules',
		genericName: 'Isoconazole Nitrate',
		concentration: '600mg (3 ovules)',
		price: 50,
		matchKeywords: ['candicure 600', 'candicure 1', 'isoconazole 600', 'كانديكيور ٦٠٠', 'فطريات مهبل'],
		usage: 'أوفول/تحميلة مهبلية لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 57) candistan 1% topical cream 15 gm
	{
		id: 'candistan-clotrimazole-cream-1-15',
		name: 'Candistan 1% topical cream 15 gm',
		genericName: 'Clotrimazole',
		concentration: '1%',
		price: 7.25,
		matchKeywords: ['candistan 15', 'candistan', 'clotrimazole', 'كانديستان ١٥', 'فطريات جلد'],
		usage: 'كريم كلوتريمازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 58) clotrisone cream 15 gm
	{
		id: 'clotrisone-clotrimazole-betamethasone-cream-15',
		name: 'Clotrisone cream 15 gm',
		genericName: 'Clotrimazole + Betamethasone',
		concentration: 'Cream',
		price: 20,
		matchKeywords: ['clotrisone', 'clotrimazole betamethasone', 'كلوتريزون', 'فطريات ملتهبة'],
		usage: 'كريم للفطريات المصحوبة بالتهاب/حكة شديدة (مضاد فطري + كورتيزون).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون: تجنب الاستخدام المطوّل وخصوصاً على الوجه والثنايا.']
	},

	// 59) cutacort cream 15 gm
	{
		id: 'cutacort-diflucortolone-isoconazole-cream-15',
		name: 'Cutacort cream 15 gm',
		genericName: 'Isoconazole Nitrate + Diflucortolone Valerate',
		concentration: 'Cream',
		price: 28,
		matchKeywords: ['cutacort', 'isoconazole diflucortolone', 'كيوتاكورت', 'فطريات ملتهبة'],
		usage: 'كريم للفطريات الملتهبة (مضاد فطري + كورتيزون).',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 35,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون: تجنب الاستخدام المطوّل وخصوصاً على الوجه والثنايا.']
	},

	// 60) diflucan 2mg/ml (50ml) i.v. infusion
	{
		id: 'diflucan-fluconazole-iv-2mgml-50',
		name: 'Diflucan 2mg/ml (50ml) i.v. infusion',
		genericName: 'Fluconazole',
		concentration: '2mg/ml (50ml)',
		price: 140,
		matchKeywords: ['diflucan iv 50', 'fluconazole iv', 'ديفلوكان وريدي ٥٠', 'فلوكونازول وريدي'],
		usage: 'محلول فلوكونازول للتسريب الوريدي لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'I.V. Infusion Vial',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: (weight) => {
			const w = Math.max(8, Math.min(200, weight ?? 8));
			const d1Lo = Math.round(w * 6);
			const d1Hi = Math.round(w * 12);
			const d2Lo = Math.round(w * 3);
			const d2Hi = Math.round(w * 6);
			return `تسريب وريدي. يوم ١: ٦–١٢ مجم/كجم (≈ ${toAr(d1Lo)}–${toAr(d1Hi)} مجم). ثم ٣–٦ مجم/كجم/يوم (≈ ${toAr(d2Lo)}–${toAr(d2Hi)} مجم).`;
		},
		warnings: ['يُستخدم داخل منشأة طبية فقط.', 'انتبه للتداخلات الدوائية ووظائف الكلى.']
	},

	// 61) diflucan 2mg/ml (100ml) i.v. infusion
	{
		id: 'diflucan-fluconazole-iv-2mgml-100',
		name: 'Diflucan 2mg/ml (100ml) i.v. infusion',
		genericName: 'Fluconazole',
		concentration: '2mg/ml (100ml)',
		price: 98,
		matchKeywords: ['diflucan iv 100', 'fluconazole iv', 'ديفلوكان وريدي ١٠٠', 'فلوكونازول وريدي'],
		usage: 'محلول فلوكونازول للتسريب الوريدي لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'I.V. Infusion Vial',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: (weight) => {
			const w = Math.max(8, Math.min(200, weight ?? 8));
			const d1Lo = Math.round(w * 6);
			const d1Hi = Math.round(w * 12);
			const d2Lo = Math.round(w * 3);
			const d2Hi = Math.round(w * 6);
			return `تسريب وريدي. يوم ١: ٦–١٢ مجم/كجم (≈ ${toAr(d1Lo)}–${toAr(d1Hi)} مجم). ثم ٣–٦ مجم/كجم/يوم (≈ ${toAr(d2Lo)}–${toAr(d2Hi)} مجم).`;
		},
		warnings: ['يُستخدم داخل منشأة طبية فقط.', 'انتبه للتداخلات الدوائية ووظائف الكلى.']
	},

	// 62) diflucan 50mg 7 caps.
	{
		id: 'diflucan-50-7-caps',
		name: 'Diflucan 50mg 7 caps.',
		genericName: 'Fluconazole',
		concentration: '50mg',
		price: 179,
		matchKeywords: ['diflucan 50', 'fluconazole 50', 'ديفلوكان ٥٠', 'فلوكونازول ٥٠'],
		usage: 'فلوكونازول ٥٠ مجم لعلاج عدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٦ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٧–١٤ يوم',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 63) econazole 1%topical spray 120 ml
	{
		id: 'econazole-spray-1-120',
		name: 'Econazole 1%topical spray 120 ml',
		genericName: 'Econazole',
		concentration: '1%',
		price: 82,
		matchKeywords: ['econazole spray', 'ايكونازول', 'سبراي ايكونازول', 'فطريات'],
		usage: 'سبراي إيكونازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Spray',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'للاستخدام الخارجي فقط.']
	},

	// 64) naviluca 200 mg 7 caps
	{
		id: 'naviluca-200-7-caps',
		name: 'Naviluca 200 mg 7 caps',
		genericName: 'Fluconazole',
		concentration: '200mg',
		price: 255,
		matchKeywords: ['naviluca 200 7', 'naviluca', 'fluconazole 200', 'نافي لوكا ٢٠٠'],
		usage: 'فلوكونازول ٢٠٠ مجم لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٧–١٤ يوم',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 65) locasten 1% cream 20 gm
	{
		id: 'locasten-cream-1-20',
		name: 'Locasten 1% cream 20 gm',
		genericName: 'Clotrimazole',
		concentration: '1%',
		price: 29,
		matchKeywords: ['locasten cream', 'locasten', 'clotrimazole', 'لوكاستن كريم'],
		usage: 'كريم كلوتريمازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 66) locasten 1% top. solution 20 ml
	{
		id: 'locasten-solution-1-20',
		name: 'Locasten 1% top. solution 20 ml',
		genericName: 'Clotrimazole',
		concentration: '1%',
		price: 18,
		matchKeywords: ['locasten solution', 'locasten', 'clotrimazole solution', 'لوكاستن محلول'],
		usage: 'محلول كلوتريمازول لفطريات الجلد، مناسب للمناطق المشعّرة/بين الأصابع.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Solution',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'مسح على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'للاستخدام الخارجي فقط.']
	},

	// 67) miconaz-h topical emulgel 20 gm
	{
		id: 'miconaz-h-emulgel-20',
		name: 'Miconaz-H topical emulgel 20 gm',
		genericName: 'Miconazole Nitrate + Hydrocortisone',
		concentration: 'Emulgel',
		price: 10,
		matchKeywords: ['miconaz-h', 'miconazole hydrocortisone', 'ميكوناز اتش', 'فطريات ملتهبة'],
		usage: 'جل للفطريات الملتهبة (مضاد فطري + كورتيزون خفيف).',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Gel',
		minAgeMonths: 6,
		maxAgeMonths: 1200,
		minWeight: 5,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['يحتوي على كورتيزون: تجنب الاستخدام المطوّل.']
	},

	// 68) monicure 400mg 3 vaginal supp
	{
		id: 'monicure-400-3-vag-supp',
		name: 'Monicure 400mg 3 vaginal supp',
		genericName: 'Miconazole Nitrate',
		concentration: '400mg (3 suppositories)',
		price: 24,
		matchKeywords: ['monicure 400', 'monicure', 'miconazole 400', 'مونيكيور', 'فطريات مهبل'],
		usage: 'تحاميل مهبلية لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Suppositories',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'تحميلة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 69) natamycin 5% eye drops 10 ml
	{
		id: 'natamycin-eye-drops-5-10',
		name: 'Natamycin 5% eye drops 10 ml',
		genericName: 'Natamycin',
		concentration: '5%',
		price: 51,
		matchKeywords: ['natamycin', 'eye drops', 'ناتامايسين', 'قطرة فطريات عين'],
		usage: 'قطرة عين مضاد فطري لعدوى سطحية محددة بالقرنية/الملتحمة.',
		timing: '٤–٦ مرات يومياً – حسب الشدة',
		category: Category.ANTIFUNGAL,
		form: 'Eye Drops',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'نقطة في العين ٤–٦ مرات يومياً حسب الشدة',
		warnings: ['لا تلمس طرف القطارة العين.', 'أزل العدسات اللاصقة أثناء العلاج.']
	},

	// 70) terbinafine 1% topical aerosol powder.
	{
		id: 'terbinafine-aerosol-powder-1',
		name: 'Terbinafine 1% topical aerosol powder',
		genericName: 'Terbinafine HCl',
		concentration: '1%',
		price: 87,
		matchKeywords: ['terbinafine aerosol', 'terbinafine powder spray', 'تيربينافين سبراي', 'فطريات القدم'],
		usage: 'سبراي/بودرة تيربينافين لفطريات القدم والتعرق بين الأصابع.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Spray',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 30,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'تجنب الاستنشاق.', 'للاستخدام الخارجي فقط.']
	},

	// 71) tineacure 1% top. cream 20 gm
	{
		id: 'tineacure-tolnaftate-cream-1-20',
		name: 'Tineacure 1% top. cream 20 gm',
		genericName: 'Tolnaftate',
		concentration: '1%',
		price: 13,
		matchKeywords: ['tineacure', 'tolnaftate', 'تينياكيور', 'قدم رياضي'],
		usage: 'كريم تولنافتيت لفطريات الجلد (خصوصاً قدم الرياضي).',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 72) tiocon 1% cream 20 gm
	{
		id: 'tiocon-tioconazole-cream-1-20',
		name: 'Tiocon 1% cream 20 gm',
		genericName: 'Tioconazole',
		concentration: '1%',
		price: 29,
		matchKeywords: ['tiocon', 'tioconazole', 'تيوكون', 'فطريات جلد'],
		usage: 'كريم تيوكونازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 73) andocandoxin 600 mg 1 vaginal caps.
	{
		id: 'andocandoxin-fenticonazole-600-1-vag-cap',
		name: 'Andocandoxin 600 mg 1 vaginal caps.',
		genericName: 'Fenticonazole Nitrate',
		concentration: '600mg (1 vaginal capsule)',
		price: 61,
		matchKeywords: ['andocandoxin 600', 'fenticonazole', 'اندو كاندوكسين ٦٠٠', 'فطريات مهبل'],
		usage: 'كبسولة مهبلية لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'كبسولة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 74) glensert 2% topical cream 20 gm
	{
		id: 'glensert-sertaconazole-cream-2-20',
		name: 'Glensert 2% topical cream 20 gm',
		genericName: 'Sertaconazole Nitrate',
		concentration: '2%',
		price: 52,
		matchKeywords: ['glensert', 'sertaconazole', 'جلينسرت', 'فطريات جلد'],
		usage: 'كريم سيرتاكونازول لعلاج فطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 75) gyno-daktarin 2% vaginal cream 40 gm
	{
		id: 'gyno-daktarin-vag-cream-2-40',
		name: 'Gyno-daktarin 2% vaginal cream 40 gm',
		genericName: 'Miconazole',
		concentration: '2%',
		price: 59,
		matchKeywords: ['gyno-daktarin', 'miconazole vaginal', 'داكتارين مهبلي', 'فطريات مهبل'],
		usage: 'كريم مهبلي ميكونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.', 'قد يضعف الواقي الذكري أثناء الاستخدام.']
	},

	// 76) gynomonix 0.8% vag. cream 30 gm
	{
		id: 'gynomonix-vag-cream-0-8-30',
		name: 'Gynomonix 0.8% vag. cream 30 gm',
		genericName: 'Terconazole',
		concentration: '0.8%',
		price: 50,
		matchKeywords: ['gynomonix 0.8', 'terconazole 0.8', 'جينومونيكس كريم', 'فطريات مهبل'],
		usage: 'كريم مهبلي تيركونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['قد يضعف الواقي الذكري أثناء الاستخدام.']
	},

	// 77) locasten 2% vaginal cream 20 gm
	{
		id: 'locasten-vag-cream-2-20',
		name: 'Locasten 2% vaginal cream 20 gm',
		genericName: 'Clotrimazole',
		concentration: '2%',
		price: 29,
		matchKeywords: ['locasten vaginal', 'locasten 2', 'clotrimazole', 'لوكاستن مهبلي', 'فطريات مهبل'],
		usage: 'كريم مهبلي كلوتريمازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 78) naviluca 200 mg 14 caps
	{
		id: 'naviluca-200-14-caps',
		name: 'Naviluca 200 mg 14 caps',
		genericName: 'Fluconazole',
		concentration: '200mg',
		price: 218.5,
		matchKeywords: ['naviluca 200 14', 'naviluca 14', 'fluconazole 200', 'نافي لوكا ١٤'],
		usage: 'فلوكونازول ٢٠٠ مجم لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٧–١٤ يوم',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 79) terbifungin 250 mg 14 tab.
	{
		id: 'terbifungin-250-14-tabs',
		name: 'Terbifungin 250 mg 14 tab.',
		genericName: 'Terbinafine',
		concentration: '250mg',
		price: 38,
		matchKeywords: ['terbifungin 250', 'terbinafine 250', 'تيربيفنجين', 'فطريات اظافر'],
		usage: 'تيربينافين أقراص لعلاج فطريات الأظافر وبعض عدوى الجلد.',
		timing: 'مرة يومياً – ٢–٦ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ قرص مرة يومياً مع الأكل لمدة ٢–٦ أسابيع',
		warnings: ['قد يؤثر على الكبد: أوقفه عند اصفرار/بول داكن/ألم شديد بالبطن.']
	},

	// 80) terbin 250mg 14 tab.
	{
		id: 'terbin-250-14-tabs',
		name: 'Terbin 250mg 14 tab.',
		genericName: 'Terbinafine',
		concentration: '250mg',
		price: 120,
		matchKeywords: ['terbin 250', 'terbinafine 250', 'تيربين ٢٥٠', 'فطريات اظافر'],
		usage: 'تيربينافين أقراص لعلاج فطريات الأظافر وبعض عدوى الجلد.',
		timing: 'مرة يومياً – ٢–٦ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ قرص مرة يومياً مع الأكل لمدة ٢–٦ أسابيع',
		warnings: ['قد يؤثر على الكبد: أوقفه عند اصفرار/بول داكن/ألم شديد بالبطن.']
	},

	// 81) vagizole 2% vaginal cream 15 gm+3 applicat...
	{
		id: 'vagizole-butoconazole-vag-cream-2-15',
		name: 'Vagizole 2% vaginal cream 15 gm + 3 applicators',
		genericName: 'Butoconazole',
		concentration: '2% (15g)',
		price: 123,
		matchKeywords: ['vagizole', 'butoconazole', 'فاجيزول', 'فطريات مهبل'],
		usage: 'كريم مهبلي بيوتوكونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 82) viotic ear drops 10 ml
	{
		id: 'viotic-ear-drops-10',
		name: 'Viotic ear drops 10 ml',
		genericName: 'Flumethasone Pivalate + Clioquinol',
		concentration: 'Ear drops',
		price: 23,
		matchKeywords: ['viotic', 'ear drops', 'فايوتيك', 'التهاب اذن خارجي'],
		usage: 'قطرة للأذن لالتهاب القناة الخارجية مع حكة/التهاب وعدوى سطحية.',
		timing: '٢–٣ مرات يومياً – ٥–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Drops',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '٢–٣ نقط في الأذن ٢–٣ مرات يومياً لمدة ٥–٧ أيام',
		warnings: ['لا تُستخدم عند وجود ثقب في طبلة الأذن.', 'إذا ظهر ألم شديد/إفرازات كثيرة: يلزم تقييم.']
	},

	// 83) naviluca 200 mg 21 caps.
	{
		id: 'naviluca-200-21-caps',
		name: 'Naviluca 200 mg 21 caps.',
		genericName: 'Fluconazole',
		concentration: '200mg',
		price: 327.75,
		matchKeywords: ['naviluca 200 21', 'naviluca 21', 'fluconazole 200', 'نافي لوكا ٢١'],
		usage: 'فلوكونازول ٢٠٠ مجم لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٧–١٤ يوم',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'تداخلات دوائية متعددة (مثبط CYP2C9/CYP3A4): انتبه للأدوية المصاحبة.', 'في القصور الكلوي قد يلزم تعديل الجرعة.', 'سمية كبدية محتملة: راجع عند اصفرار/ألم بطن علوي.']
	},

	// 84) fungiclear 200 mg 2 capsule
	{
		id: 'fungiclear-200-2-caps',
		name: 'Fungiclear 200 mg 2 capsule',
		genericName: 'Fluconazole',
		concentration: '200mg',
		price: 74,
		matchKeywords: ['fungiclear 200', 'fungiclear', 'fluconazole 200', 'فانجي كلير'],
		usage: 'فلوكونازول ٢٠٠ مجم لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٧–١٤ يوم',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'انتبه للتداخلات الدوائية.']
	},

	// 85) flocazole 150 mg 1 caps.
	{
		id: 'flocazole-150-1-cap',
		name: 'Flocazole 150 mg 1 caps.',
		genericName: 'Fluconazole',
		concentration: '150mg',
		price: 27,
		matchKeywords: ['flocazole 150', 'flocazole', 'fluconazole 150', 'فلوكازول', 'كانديدا'],
		usage: 'فلوكونازول ١٥٠ مجم (جرعة واحدة شائعة) لعدوى فطرية محددة.',
		timing: 'جرعة واحدة',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة جرعة واحدة (يُعاد بعد ٧٢ ساعة عند الحاجة)',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'انتبه للتداخلات الدوائية.']
	},

	// 86) actriazole 200mg 7 caps.
	{
		id: 'actriazole-200-7-caps',
		name: 'Actriazole 200mg 7 caps.',
		genericName: 'Fluconazole',
		concentration: '200mg',
		price: 46.5,
		matchKeywords: ['actriazole 200', 'actriazole', 'fluconazole 200', 'اكتريازول'],
		usage: 'فلوكونازول ٢٠٠ مجم لعدوى فطرية محددة.',
		timing: 'مرة يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => '١ كبسولة مرة يومياً مع الأكل لمدة ٧–١٤ يوم',
		warnings: ['يمكن تناوله مع أو بدون طعام.', 'انتبه للتداخلات الدوائية.']
	},

	// 87) andocandoxin 200 mg 3 vaginal caps.
	{
		id: 'andocandoxin-fenticonazole-200-3-vag-caps',
		name: 'Andocandoxin 200 mg 3 vaginal caps.',
		genericName: 'Fenticonazole Nitrate',
		concentration: '200mg (3 vaginal capsules)',
		price: 58,
		matchKeywords: ['andocandoxin 200', 'fenticonazole', 'اندو كاندوكسين ٢٠٠', 'فطريات مهبل'],
		usage: 'كبسولات مهبلية لعلاج فطريات المهبل (كانديدا).',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Capsule',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'كبسولة مهبلية قبل النوم لمدة ٣ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	},

	// 88) conazoglob 200mg 10 f.c. tabs.
	{
		id: 'conazoglob-voriconazole-200-10-tabs',
		name: 'Conazoglob 200mg 10 f.c. tabs.',
		genericName: 'Voriconazole',
		concentration: '200mg',
		price: 932,
		matchKeywords: ['conazoglob 200 tab', 'conazoglob', 'voriconazole', 'كونازوجلوب', 'فوريكونازول'],
		usage: 'فوريكونازول أقراص لعدوى فطرية شديدة/معقدة.',
		timing: 'كل ١٢ ساعة – ٢–٦ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'F.C. Tablets',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => '١ قرص كل ١٢ ساعة لمدة ٢–٦ أسابيع',
		warnings: ['تداخلات دوائية كثيرة ومهمة.', 'قد يسبب حساسية للضوء واضطراب بالرؤية.']
	},

	// 89) conazoglob 200mg vial
	{
		id: 'conazoglob-voriconazole-200-vial',
		name: 'Conazoglob 200mg vial',
		genericName: 'Voriconazole',
		concentration: '200mg',
		price: 837,
		matchKeywords: ['conazoglob vial', 'voriconazole vial', 'كونازوجلوب فيال', 'فوريكونازول فيال'],
		usage: 'فوريكونازول وريدي لعدوى فطرية شديدة/معقدة.',
		timing: 'كل ١٢ ساعة – وريدي',
		category: Category.ANTIFUNGAL,
		form: 'Powder for I.V. Infusion Vial',
		minAgeMonths: 24,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: (weight) => {
			const w = Math.max(8, Math.min(200, weight ?? 8));
			const load = Math.round(w * 6);
			const maint = Math.round(w * 4);
			return `تسريب وريدي. تحميل ٦ مجم/كجم كل ١٢ ساعة×٢ (≈ ${toAr(load)} مجم). ثم ٤ مجم/كجم كل ١٢ ساعة (≈ ${toAr(maint)} مجم).`;
		},
		warnings: ['يُستخدم داخل منشأة طبية فقط.', 'تداخلات دوائية كثيرة ومهمة.']
	},

	// 90) daktarin 2% cream 15 gm
	{
		id: 'daktarin-cream-2-15',
		name: 'Daktarin 2% cream 15 gm',
		genericName: 'Miconazole',
		concentration: '2%',
		price: 28,
		matchKeywords: ['daktarin', 'miconazole', 'داكتارين كريم', 'فطريات جلد'],
		usage: 'كريم ميكونازول لعلاج فطريات الجلد والخمائر.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'طبقة رقيقة على المنطقة المصابة مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['للاستخدام الخارجي فقط.']
	},

	// 91) glensert 2% topical spray 15 ml
	{
		id: 'glensert-sertaconazole-spray-2-15',
		name: 'Glensert 2% topical spray 15 ml',
		genericName: 'Sertaconazole Nitrate',
		concentration: '2%',
		price: 44,
		matchKeywords: ['glensert spray', 'sertaconazole spray', 'جلينسرت سبراي', 'فطريات'],
		usage: 'سبراي سيرتاكونازول لفطريات الجلد.',
		timing: 'مرتين يومياً – ٢–٤ أسابيع',
		category: Category.ANTIFUNGAL,
		form: 'Spray',
		minAgeMonths: 12,
		maxAgeMonths: 1200,
		minWeight: 8,
		maxWeight: 200,
		calculationRule: () => 'رش على جلد جاف مرتين يومياً لمدة ٢–٤ أسابيع',
		warnings: ['قابل للاشتعال: بعيداً عن النار.', 'للاستخدام الخارجي فقط.']
	},

	// 92) gynomonix 0.4% vag. cream 30 gm
	{
		id: 'gynomonix-vag-cream-0-4-30',
		name: 'Gynomonix 0.4% vag. cream 30 gm',
		genericName: 'Terconazole',
		concentration: '0.4%',
		price: 36,
		matchKeywords: ['gynomonix 0.4', 'terconazole 0.4', 'جينومونيكس 0.4', 'فطريات مهبل'],
		usage: 'كريم مهبلي تيركونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['قد يضعف الواقي الذكري أثناء الاستخدام.']
	},

	// 93) treatocandivag 2% vaginal cream 15 gm
	{
		id: 'treatocandivag-butoconazole-vag-cream-2-15',
		name: 'Treatocandivag 2% vaginal cream 15 gm',
		genericName: 'Butoconazole',
		concentration: '2% (15g)',
		price: 123,
		matchKeywords: ['treatocandivag', 'butoconazole', 'تريتوكانديفاج', 'فطريات مهبل'],
		usage: 'كريم مهبلي بيوتوكونازول لعلاج فطريات المهبل.',
		timing: 'مرة مساءً – ٣–٧ أيام',
		category: Category.ANTIFUNGAL,
		form: 'Cream',
		minAgeMonths: 144,
		maxAgeMonths: 1200,
		minWeight: 40,
		maxWeight: 200,
		calculationRule: () => 'أبليكيتور كامل قبل النوم لمدة ٣–٧ ليالٍ',
		warnings: ['يفضل استخدام فوطة صحية أثناء العلاج.']
	}
];

