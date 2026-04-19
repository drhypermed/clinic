/**
 * محرر عناصر الروشتة (createItemEditors):
 * يحتوي هذا الملف على جميع العمليات التي تتم على الأدوية، الملحوظات، النصائح، أو التحاليل
 * داخل الروشتة بعد إضافتها.
 * 
 * المهام الرئيسية:
 * 1. تحديث بيانات الدواء (الاسم، التعليمات).
 * 2. حذف عناصر من الروشتة (أدوية، تحاليل، نصائح).
 * 3. تبديل الدواء ببديل آخر (Swap/Alternative).
 * 4. إضافة نصائح (Advice) أو تحاليل (Labs) يدوياً.
 * 5. إدارة أحجام الخطوط والتمرير التلقائي.
 */

import React from 'react';
import { AlternativeMed, Medication, PrescriptionItem } from '../../types';
import { buildAlternativesSameScientific, sanitizeDosageText } from '../../utils/rx/rxUtils';

type SetRxItems = React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
type SetStringArray = React.Dispatch<React.SetStateAction<string[]>>;

interface CreateItemEditorsParams {
    saveHistory: () => void;
    setLabInvestigations: SetStringArray;
    setGeneralAdvice: SetStringArray;
    prescriptionRef: React.RefObject<HTMLDivElement | null>;
    setRxItems: SetRxItems;
    trackMedUsage: (medId: string) => void;
    rxItems: PrescriptionItem[];
    weight: string;
    totalAgeInMonths: number;
    buildRxInstructions: (dose: string, baseInstructions?: string | null) => string;
    medications: Medication[];
    generalAdvice: string[];
    labInvestigations: string[];
}

export const createItemEditors = ({
    saveHistory,
    setLabInvestigations,
    setGeneralAdvice,
    prescriptionRef,
    setRxItems,
    trackMedUsage,
    rxItems,
    weight,
    totalAgeInMonths,
    buildRxInstructions,
    medications,
    generalAdvice,
    labInvestigations,
}: CreateItemEditorsParams) => {
    
    /** إضافة سطر تحليل طبي (Lab Investigation) يدوياً */
    const handleAddManualLab = () => {
        saveHistory();
        setLabInvestigations(prev => [...prev, '']);
        setTimeout(() => {
            if (prescriptionRef.current) {
                prescriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 200);
    };

    /** إضافة سطر نصيحة عامة (General Advice) يدوياً */
    const handleAddManualAdvice = () => {
        saveHistory();
        setGeneralAdvice(prev => ([...(prev || []).map(x => (x ?? '').toString()), '']));
        setTimeout(() => {
            if (prescriptionRef.current) {
                prescriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 200);
    };

    /** تحديث تعليمات دواء معين بناءً على ترتيبه (Index) */
    const updateItemInstruction = (index: number, newInstruction: string) => {
        setRxItems(prev => { 
            const newArr = [...prev]; 
            newArr[index] = { ...newArr[index], instructions: newInstruction }; 
            return newArr; 
        });
    };

    /** اختيار دواء من القائمة وربطه بسطر فارغ في الروشتة */
    const selectMedicationForItem = (index: number, med: Medication) => {
        saveHistory();
        trackMedUsage(med.id);
        const selectedItemId = rxItems[index]?.id || `item-${index}`;
        const w = parseFloat(weight) || 0;
        const isWeightValid = Number.isFinite(w) && w > 0;
        const isAgeValid = Number.isFinite(totalAgeInMonths) && totalAgeInMonths > 0;
        const hasValidDoseInputs = isWeightValid && isAgeValid;

        // حساب الجرعة المقترحة بناءً على وزن وعمر المريض
        const doseRaw = hasValidDoseInputs
            ? (typeof med.calculationRule === 'function' ? med.calculationRule(w, totalAgeInMonths) : 'الجرعة غير متاحة')
            : '';
        const dose = sanitizeDosageText(doseRaw);
        
        // بناء جملة التعليمات الكاملة
        const fullInstructions = hasValidDoseInputs ? buildRxInstructions(dose, med.instructions) : '';
        
        // جلب البدائل التي تطابق نفس المادة الفعالة
        const alternatives = buildAlternativesSameScientific(med, w, totalAgeInMonths, medications);

        setRxItems(prev => {
            if (index < 0 || index >= prev.length) return prev;
            const newArr = [...prev];
            newArr[index] = {
                ...newArr[index],
                type: 'medication',
                medication: med,
                dosage: dose,
                instructions: fullInstructions,
                alternatives
            };

            // إضافة سطر فارغ تلقائياً إذا كان هذا هو آخر سطر (بحد أقصى 4 أدوية)
            if (index === prev.length - 1 && prev.length < 4) {
                const emptyId = `empty-${Date.now()}`;
                newArr.push({
                    id: emptyId,
                    type: 'medication',
                    medication: undefined,
                    dosage: '',
                    instructions: '',
                    reasonForUse: 'Auto-add',
                    source: 'Local Database',
                    alternatives: []
                });
            }

            return newArr;
        });

        // توجيه المؤشر (Focus) إلى حقل التعليمات بعد اختيار الدواء
        requestAnimationFrame(() => {
            setTimeout(() => {
                const itemElement = document.querySelector(`[data-rx-item-id="${selectedItemId}"]`) as HTMLElement | null;
                if (!itemElement) return;
                const instInput = itemElement.querySelector('textarea[placeholder*="التعليمات"]') as HTMLTextAreaElement | null;
                if (instInput) {
                    instInput.focus();
                    const val = instInput.value || '';
                    instInput.setSelectionRange(val.length, val.length);
                }
            }, 120);
        });
    };

    /** تحديث اسم الدواء (في حالة الإدخال الحر غير المرتبط بقاعدة بيانات) */
    const updateItemName = (index: number, newName: string) => {
        setRxItems(prev => {
            if (index < 0 || index >= prev.length) return prev;
            const newArr = [...prev];
            if (newArr[index].type === 'medication') {
                newArr[index] = {
                    ...newArr[index],
                    medication: newArr[index].medication
                        ? { ...newArr[index].medication!, name: newName }
                        : { id: 'temp', name: newName } as any
                };
            }
            return newArr;
        });
    };

    /** حذف دواء من الروشتة */
    const removeItem = (index: number) => { 
        saveHistory(); 
        setRxItems(prev => prev.filter((_, i) => i !== index)); 
    };

    /** تغيير حجم خط عنصر معين */
    const updateItemFontSize = (index: number, size: string) => { 
        setRxItems(prev => { 
            const newArr = [...prev]; 
            newArr[index] = { ...newArr[index], customFontSize: size }; 
            return newArr; 
        }); 
    };

    /** تبديل الدواء ببديل (Alternative) من القائمة المقترحة */
    const handleSwapItem = (index: number, newAlt: AlternativeMed) => {
        saveHistory();
        const fullMed = medications.find(m => m.name === newAlt.name);

        if (fullMed) {
            // إذا كان البديل موجوداً في قاعدة البيانات، نحسب جرعته وتعليماته بدقة
            const w = parseFloat(weight) || 0;
            const calculatedDosage = typeof fullMed.calculationRule === 'function'
                ? fullMed.calculationRule(w, totalAgeInMonths)
                : 'الجرعة غير متاحة';
            const safeDosage = sanitizeDosageText(calculatedDosage);
            const fullInstructions = buildRxInstructions(safeDosage, fullMed.instructions);

            setRxItems(prev => {
                const newArr = [...prev];
                newArr[index] = { 
                    ...newArr[index], 
                    type: 'medication',
                    medication: fullMed, 
                    dosage: safeDosage, 
                    instructions: fullInstructions, 
                    alternatives: prev[index].alternatives,
                    source: 'Local Database'
                };
                return newArr;
            });
        } else {
            // حالة احتياطية (Fallback) إذا لم نجد بيانات البديل الكاملة
            const fallbackMed = {
                id: `alt-${Math.random()}`, name: newAlt.name, genericName: 'Alternative', concentration: newAlt.concentration, price: newAlt.price, form: newAlt.form as any, category: 'General' as any, usage: 'Alternative', timing: '', minAgeMonths: 0, maxAgeMonths: 1200, minWeight: 0, maxWeight: 200, calculationRule: () => newAlt.dosage, instructions: newAlt.instructions, warnings: []
            };
            setRxItems(prev => {
                const newArr = [...prev];
                newArr[index] = { 
                    ...newArr[index], 
                    type: 'medication',
                    medication: fallbackMed as Medication, 
                    dosage: newAlt.dosage, 
                    instructions: newAlt.instructions, 
                    alternatives: prev[index].alternatives,
                    source: 'Local Database'
                };
                return newArr;
            });
        }
    };

    /** تحديث نصيحة عامة */
    const updateAdvice = (index: number, val: string) => {
        const newArr = [...generalAdvice];
        newArr[index] = val;
        setGeneralAdvice(newArr);
    };

    /** حذف نصيحة */
    const removeAdvice = (index: number) => {
        saveHistory();
        setGeneralAdvice(prev => prev.filter((_, i) => i !== index));
    };

    /** تحديث طلب تحليل */
    const updateLab = (index: number, val: string) => { 
        const newArr = [...labInvestigations]; 
        newArr[index] = val; 
        setLabInvestigations(newArr); 
    };

    /** حذف طلب تحليل */
    const removeLab = (index: number) => { 
        saveHistory(); 
        setLabInvestigations(prev => prev.filter((_, i) => i !== index)); 
    };

    return {
        handleAddManualLab,
        handleAddManualAdvice,
        updateItemInstruction,
        selectMedicationForItem,
        updateItemName,
        removeItem,
        updateItemFontSize,
        handleSwapItem,
        updateAdvice,
        removeAdvice,
        updateLab,
        removeLab,
    };
};

