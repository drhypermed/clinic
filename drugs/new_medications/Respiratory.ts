import { Medication, Category } from '../../types';

export const NEW_RESPIRATORY_MEDS: Medication[] = [
    {
        id: 'nanodam-nasal-spray-75ml',
        name: 'Nanodam nasal spray 75 ml',
        genericName: 'Sea water & Hyaluronic acid & Panthenol & Bee propolis',
        concentration: 'Standard',
        price: 100,
        matchKeywords: [
            'nanodam', 'nasal spray', 'sea water', 'hyaluronic', 'propolis',
            'نانودام', 'بخاخ أنف', 'ماء بحر', 'هيالورونيك', 'بانثينول', 'عكبر', 'بروبوليس', 'جهاز تنفسي'
        ],
        usage: 'تنظيف وترطيب الأنف والمساعدة في تخفيف الاحتقان وترميم الغشاء المخاطي.',
        timing: 'عند الحاجة – حسب التعليمات',
        category: Category.SALINE,
        form: 'Nasal Spray',
        minAgeMonths: 12,
        maxAgeMonths: 1200,
        minWeight: 8,
        maxWeight: 150,
        calculationRule: (weight: number, ageMonths: number) => '١–٢ بخة في كل فتحة أنف — عند الحاجة (٢–٣ مرات يومياً) — بدون اعتبار للأكل — حسب التعليمات.',
        warnings: [
            'للاستعمال الشخصي فقط.',
            'يحفظ بعيداً عن متناول الأطفال.',
            'قد يسبب حساسية لمن لديهم تحسس من منتجات النحل (العكبر/البروبوليس).'
        ]
    }
];

