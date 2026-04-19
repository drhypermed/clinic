/**
 * إضافات الروشتة اليدوية (createManualItemActions):
 * يحتوي هذا الملف على العمليات البسيطة لإضافة عناصر فارغة للروشتة.
 * 
 * المهام الرئيسية:
 * 1. إضافة سطر دواء فارغ (Empty Medication) ليدخل الطبيب بياناته يدوياً.
 * 2. إضافة ملاحظة مخصصة (Custom Note) لكتابة تعليمات إضافية أو ملاحظات.
 * 3. التعامل مع التمرير التلقائي ونقل التركيز (Focus) للحقول الجديدة.
 */

import React from 'react';
import { PrescriptionItem } from '../../types';

interface CreateManualItemActionsParams {
    saveHistory: () => void;
    lastAddedItemIdRef: React.MutableRefObject<string | null>;
    setRxItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
    prescriptionRef: React.RefObject<HTMLDivElement | null>;
}

export const createManualItemActions = ({
    saveHistory,
    lastAddedItemIdRef,
    setRxItems,
    prescriptionRef,
}: CreateManualItemActionsParams) => {
    /** إضافة سطر دواء جديد فارغ */
    const handleAddEmptyMedication = () => {
        saveHistory();
        const newId = `empty-${Date.now()}`;
        lastAddedItemIdRef.current = newId;
        
        // إضافة العنصر لمصفوفة الأدوية
        setRxItems(prev => [...prev, { 
            id: newId, 
            type: 'medication', 
            medication: undefined, 
            dosage: '', 
            instructions: '', 
            reasonForUse: 'Manual entry', 
            source: 'Local Database', 
            alternatives: [] 
        }]);

        // انتظار الرندر ثم التمرير للعنصر الجديد وتوجيه المؤشر لاسم الدواء
        setTimeout(() => {
            if (lastAddedItemIdRef.current) {
                const lastItem = document.querySelector(`[data-rx-item-id="${lastAddedItemIdRef.current}"]`) as HTMLElement;
                if (lastItem) {
                    lastItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });

                    const nameInput = lastItem.querySelector(`textarea[placeholder*="Name"]`) as HTMLTextAreaElement;
                    if (nameInput) nameInput.focus();
                } else if (prescriptionRef.current) {
                    prescriptionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
        }, 300);
    };

    /** إضافة ملاحظة مخصصة (Note) أسفل الروشتة */
    const handleAddCustomItem = () => {
        saveHistory();
        const newId = `note-${Date.now()}`;
        lastAddedItemIdRef.current = newId;
        
        setRxItems(prev => [...prev, { 
            id: newId, 
            type: 'note', 
            instructions: '', 
            customFontSize: 'text-[15px]', 
            reasonForUse: 'Manual Note', 
            source: 'Local Database', 
            alternatives: [] 
        }]);

        setTimeout(() => {
            if (lastAddedItemIdRef.current) {
                const lastItem = document.querySelector(`[data-rx-item-id="${lastAddedItemIdRef.current}"]`) as HTMLElement;
                if (lastItem) {
                    lastItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                } else if (prescriptionRef.current) {
                    prescriptionRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
        }, 300);
    };

    return {
        handleAddEmptyMedication,
        handleAddCustomItem,
    };
};

