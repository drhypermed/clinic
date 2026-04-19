/**
 * helpers — ثوابت وأنواع + buildVitalConfigForPreview
 *
 * مستخرج من `PrescriptionSettingsPreview.tsx` لتقليل حجمه:
 *   - ارتفاعات ثابتة لأقسام الروشتة.
 *   - بيانات تجريبية لتبويب الطباعة.
 *   - ألوان التبويبات للشريط العلوي.
 *   - تسميات التبويبات.
 *   - buildVitalConfigForPreview — بناء قائمة الـ vitals + custom boxes للمعاينة.
 */

import type { PrescriptionItem, PrescriptionSettings } from '../../../types';
import type { SettingsTabId } from '../PrescriptionSettingsTabs';

/** ارتفاعات ثابتة تقريبية لأقسام الروشتة (بالبكسل، بدون هوامش) */
export const HEADER_H_PX = 146;
export const INFOBAR_H_PX = 42;
export const FOOTER_H_PX = 80;

/** ──────────────────────────────────────────────────────────────────
 *  حالة طبية نموذجية للمعاينة: التهاب لوزتين حاد بكتيري (Acute Tonsillopharyngitis)
 *  المريض: ٤٢ سنة، شاكي من حُمى وألم بالحلق وسعال منذ ٣ أيام.
 *  كل البيانات (شكوى/تاريخ/فحص/تشخيص/فحوصات/أدوية/تعليمات) متسقة طبياً
 *  وممثّلة لروشتة حقيقية يمكن الطبيب يكتبها فعلاً.
 *  ──────────────────────────────────────────────────────────────── */

const buildPreviewMed = (id: string, name: string) => ({
    id, name, genericName: '', concentration: '', price: 0, usage: '',
    indications: [], contraindications: [], sideEffects: [], dosage: '',
    interactions: [], pregnancyCategory: '', pediatricUse: '', lactation: '',
    elderlyUse: '', alternatives: [], category: '',
} as unknown as PrescriptionItem['medication']);

/** ٤ أدوية: مضاد حيوي + مضاد التهاب + واقي معدة + أقراص استحلاب للحلق */
export const PRINT_PREVIEW_RX_ITEMS: PrescriptionItem[] = [
    {
        id: 'p1',
        type: 'medication',
        medication: buildPreviewMed('m1', 'AUGMENTIN 1G TABLETS'),
        instructions: 'قرص كل 12 ساعة لمدة 7 أيام بعد الأكل',
    },
    {
        id: 'p2',
        type: 'medication',
        medication: buildPreviewMed('m2', 'BRUFEN 400 MG TABLETS'),
        instructions: 'قرص كل 8 ساعات عند الحاجة بعد الأكل (لخفض الحرارة وتسكين الألم)',
    },
    {
        id: 'p3',
        type: 'medication',
        medication: buildPreviewMed('m3', 'NEXIUM 40 MG CAPSULES'),
        instructions: 'كبسولة واحدة يومياً قبل الإفطار بنصف ساعة (لحماية المعدة)',
    },
    {
        id: 'p4',
        type: 'medication',
        medication: buildPreviewMed('m4', 'STREPSILS LOZENGES'),
        instructions: 'قرص استحلاب كل 3 ساعات لتسكين ألم الحلق',
    },
];

/** ٢ فحوصات تتناسب مع حالة التهاب حاد */
export const PRINT_PREVIEW_LABS: string[] = [
    'CBC (لتحديد نوع وشدة الالتهاب)',
    'CRP (لقياس مستوى الالتهاب في الدم)',
];

/** ٣ تعليمات هامة لحالة التهاب الحلق */
export const PRINT_PREVIEW_ADVICE: string[] = [
    'الإكثار من السوائل الدافئة وخاصة الماء والمشروبات العشبية',
    'الراحة التامة وتجنب الإجهاد لمدة 3 أيام على الأقل',
    'الغرغرة بمحلول ملحي دافئ 3 مرات يومياً',
];

/** بيانات الكشف الإكلينيكية النموذجية (شكوى، تاريخ، فحص، تشخيص) */
export const PRINT_PREVIEW_CLINICAL = {
    complaintEn: 'Fever, sore throat, and productive cough for 3 days',
    historyEn: 'Smoker 1 pack/day for 10 years. No chronic illness. No known drug allergy',
    examEn: 'T 38.5°C, congested pharynx with tonsillar exudate, cervical lymphadenopathy, chest clear bilaterally',
    diagnosisEn: 'Acute Bacterial Tonsillopharyngitis',
};

/** ألوان التبويبات للشريط العلوي للمعاينة */
export const TAB_COLORS: Record<SettingsTabId, { bg: string; text: string; badge: string }> = {
    header: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    footer: { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    vitals: { bg: 'from-rose-500 to-pink-600', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
    middle: { bg: 'from-violet-500 to-purple-600', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
    print: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
};

/** تسميات التبويبات في الشريط العلوي للمعاينة */
export const TAB_LABELS: Record<SettingsTabId, string> = {
    header: 'الجزء العلوي',
    footer: 'الجزء السفلي',
    vitals: 'الجزء الجانبي',
    middle: 'منتصف الروشتة',
    print: 'إعدادات الطباعة',
};

/** بناء قائمة الـ vitals + custom boxes بقيم تجريبية للمعاينة */
export const buildVitalConfigForPreview = (
    activeTab: SettingsTabId,
    localSettings: PrescriptionSettings
) => {
    if (activeTab !== 'vitals' && activeTab !== 'middle' && activeTab !== 'print') return [];

    const vitalsSettings = localSettings?.vitals || [];
    const enabledVitals = vitalsSettings.filter(v => v.enabled).sort((a, b) => a.order - b.order);
    const valueMap: Record<string, string> = {
        weight: '75', height: '175', bmi: '24.5', bp: '120/80',
        pulse: '72', temp: '36.5', rbs: '95', spo2: '98', rr: '16',
    };
    const vitalItems = enabledVitals.map(v => ({
        key: v.key,
        label: v.labelAr || v.label,
        unit: v.unit,
        value: valueMap[v.key] || '',
        isCustom: false,
        order: v.order,
    }));
    const customBoxes = (localSettings?.customBoxes || []).filter(b => b.enabled).sort((a, b) => a.order - b.order);
    const customItems = customBoxes.map(box => ({
        label: box.label,
        unit: '',
        value: box.value || '',
        isCustom: true,
        order: box.order,
    }));
    return [...vitalItems, ...customItems].sort((a, b) => a.order - b.order);
};
