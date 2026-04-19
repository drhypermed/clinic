/**
 * costsHandlers — Handlers لـ PatientFileCostsSection
 *
 * دوال factory تُنشئ handlers للـ cost/insurance operations. تفصل المنطق
 * عن الـ component الرئيسي مع تمرير setters + state عبر معاملات.
 *
 * مستخرج من `PatientFileCostsSection.tsx` لتقليل حجمه.
 *
 * ملاحظة عن الفروع: كل عنصر تكلفة/تأمين بيتحفظ معاه `branchId` (الفرع النشط
 * وقت الإضافة). وقت المزامنة للتقارير المالية اليومية، بنفلتر العناصر بحيث
 * كل فرع يشوف بياناته فقط في تقاريره.
 */

import type React from 'react';
import { financialDataService } from '../../../services/financial-data';
import {
    addCostItem,
    addInsuranceItem,
    deleteCostItem,
    deleteInsuranceItem,
    editCostItem,
    editInsuranceItem,
    loadPatientFileCosts,
    loadPatientFileInsurance,
    syncCostsToFirestore,
    type PatientCostItem,
    type PatientInsuranceItem,
} from '../../../services/patientCostService';
import type { InsuranceCompany } from '../../../services/insuranceService';

export const getTodayDateKey = () =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });

/**
 * الفرع الفعلي لعنصر (backward compat): العناصر القديمة بدون branchId تخص 'main'.
 */
const resolveItemBranch = (item: { branchId?: string } | null | undefined): string =>
    (item && item.branchId) ? item.branchId : 'main';

/** مفتاح localStorage متوافق مع الفرع (main → بدون prefix). */
const branchLocalKey = (key: string, branchId?: string): string => {
    if (!branchId || branchId === 'main') return key;
    return `${branchId}__${key}`;
};

interface DoSyncArgs {
    userId: string | undefined;
    fileId: string | undefined;
    costs: PatientCostItem[];
    insurance: PatientInsuranceItem[];
    extraDateKeys?: Set<string>;
    /** الفرع النشط وقت المزامنة — بيحدد الفرع اللي هيتكتب عليه الـ daily Firestore doc */
    branchId?: string;
}

/**
 * مزامنة التكاليف إلى Firestore + تحديث ملخصات الأيام المتأثرة في
 * financial-data + إطلاق حدث لتحديث التقارير المالية.
 *
 * بيفلتر العناصر بحيث الـ daily Firestore doc لفرع معين يحتوي فقط على
 * العناصر اللي تخصه.
 */
export const doSyncCostsToFirestore = ({
    userId,
    fileId,
    costs,
    insurance,
    extraDateKeys,
    branchId,
}: DoSyncArgs): void => {
    if (!userId || !fileId) return;
    // حفظ بيانات ملف المريض كاملة (shared across branches)
    syncCostsToFirestore(userId, fileId, costs, insurance).catch(console.error);
    // تجميع كل مفاتيح التواريخ المتأثرة (بما فيها تواريخ العناصر المحذوفة أو القديمة عند التعديل)
    const dateKeys = new Set([
        ...costs.map(c => c.dateKey),
        ...insurance.map(i => i.dateKey),
        ...(extraDateKeys ?? []),
    ]);
    const targetBranch = branchId || 'main';
    for (const dk of dateKeys) {
        // القيم الحالية لفرعنا من localStorage (بعد recomputeDailyTotals)
        const intvKey = `${branchLocalKey('interventionsRevenue', targetBranch)}_${dk}`;
        const otherKey = `${branchLocalKey('otherRevenue', targetBranch)}_${dk}`;
        const intv = parseFloat(localStorage.getItem(intvKey) || '0') || 0;
        const other = parseFloat(localStorage.getItem(otherKey) || '0') || 0;

        // insuranceExtras: نقرأ الكل ونفلتر على الفرع
        let allExtras: any[] = [];
        try { allExtras = JSON.parse(localStorage.getItem(`${branchLocalKey('insuranceExtra', targetBranch)}_${dk}`) || '[]'); } catch { /* ignore */ }
        // fallback للمفتاح العام (كان بيُستخدم قبل التقسيم بالفرع)
        if (allExtras.length === 0) {
            try { allExtras = JSON.parse(localStorage.getItem(`insuranceExtra_${dk}`) || '[]'); } catch { /* ignore */ }
        }
        const extras = allExtras.filter((e: any) => resolveItemBranch(e) === targetBranch);

        // cashCostItems: نقرأ كل العناصر لليوم ده ونفلتر حسب الفرع
        let allCashItems: any[] = [];
        try {
            allCashItems = JSON.parse(localStorage.getItem(`patientCostItems_${dk}`) || '[]');
        } catch { /* ignore */ }
        const cashItems = allCashItems.filter((i: any) =>
            i.patientFileId && resolveItemBranch(i) === targetBranch
        );

        financialDataService.saveDailyData(userId, dk, {
            interventionsRevenue: intv,
            otherRevenue: other,
            insuranceExtras: extras,
            cashCostItems: cashItems,
        }, branchId).catch(console.error);
    }
    window.dispatchEvent(new Event('financialDataUpdated'));
};

interface SaveCostInput {
    fileId: string | undefined;
    patientName: string;
    costFormAmount: string;
    costFormDate: string;
    costFormType: 'interventions' | 'other';
    costFormNote: string;
    editingCostId: string | null;
    costItems: PatientCostItem[];
    insuranceItems: PatientInsuranceItem[];
    userId: string | undefined;
    branchId?: string;
    setCostItems: React.Dispatch<React.SetStateAction<PatientCostItem[]>>;
    setCostError: (value: string | null) => void;
    setEditingCostId: (value: string | null) => void;
    resetCostForm: () => void;
}

export const handleSaveCostOperation = (input: SaveCostInput): void => {
    const { fileId, patientName, costFormAmount, costFormDate, costFormType, costFormNote, branchId } = input;

    if (!fileId) { input.setCostError('ملف المريض غير مكتمل.'); return; }
    const amount = parseFloat(costFormAmount);
    if (!amount || amount <= 0) { input.setCostError('يرجى إدخال مبلغ صحيح أكبر من الصفر.'); return; }
    const dk = costFormDate || getTodayDateKey();
    input.setCostError(null);

    if (input.editingCostId) {
        const oldItem = input.costItems.find(c => c.id === input.editingCostId);
        editCostItem(fileId, input.editingCostId, { amount, type: costFormType, dateKey: dk, note: costFormNote || undefined });
        const updated = loadPatientFileCosts(fileId);
        input.setCostItems(updated);
        doSyncCostsToFirestore({
            userId: input.userId,
            fileId,
            costs: updated,
            insurance: input.insuranceItems,
            extraDateKeys: oldItem && oldItem.dateKey !== dk ? new Set([oldItem.dateKey]) : undefined,
            branchId,
        });
        input.setEditingCostId(null);
    } else {
        addCostItem(fileId, patientName, { amount, type: costFormType, dateKey: dk, note: costFormNote || undefined }, branchId);
        const updated = loadPatientFileCosts(fileId);
        input.setCostItems(updated);
        doSyncCostsToFirestore({
            userId: input.userId,
            fileId,
            costs: updated,
            insurance: input.insuranceItems,
            branchId,
        });
    }
    input.resetCostForm();
};

interface DeleteCostInput {
    fileId: string | undefined;
    itemId: string;
    costItems: PatientCostItem[];
    insuranceItems: PatientInsuranceItem[];
    userId: string | undefined;
    branchId?: string;
    setCostItems: React.Dispatch<React.SetStateAction<PatientCostItem[]>>;
}

export const handleDeleteCostOperation = ({
    fileId,
    itemId,
    costItems,
    insuranceItems,
    userId,
    branchId,
    setCostItems,
}: DeleteCostInput): void => {
    if (!fileId) return;
    const deletedItem = costItems.find(c => c.id === itemId);
    deleteCostItem(fileId, itemId);
    const updated = loadPatientFileCosts(fileId);
    setCostItems(updated);
    doSyncCostsToFirestore({
        userId,
        fileId,
        costs: updated,
        insurance: insuranceItems,
        extraDateKeys: deletedItem ? new Set([deletedItem.dateKey]) : undefined,
        branchId,
    });
};

interface SaveInsuranceInput {
    fileId: string | undefined;
    patientName: string;
    insFormCompanyId: string;
    insFormAmount: string;
    insFormDate: string;
    insFormType: 'interventions' | 'other';
    insFormMembership: string;
    insFormApproval: string;
    insFormNote: string;
    editingInsId: string | null;
    costItems: PatientCostItem[];
    insuranceItems: PatientInsuranceItem[];
    insuranceCompanies: InsuranceCompany[];
    userId: string | undefined;
    branchId?: string;
    setInsuranceItems: React.Dispatch<React.SetStateAction<PatientInsuranceItem[]>>;
    setCostError: (value: string | null) => void;
    setEditingInsId: (value: string | null) => void;
    resetInsForm: () => void;
}

export const handleSaveInsuranceOperation = (input: SaveInsuranceInput): void => {
    const { fileId, patientName, insFormCompanyId, insFormAmount, insFormDate, insFormType, branchId } = input;

    if (!fileId) { input.setCostError('ملف المريض غير مكتمل.'); return; }
    const company = input.insuranceCompanies.find(c => c.id === insFormCompanyId);
    if (!company) { input.setCostError('يرجى اختيار شركة التأمين.'); return; }
    const amount = parseFloat(insFormAmount);
    if (!amount || amount <= 0) { input.setCostError('يرجى إدخال مبلغ صحيح أكبر من الصفر.'); return; }
    const dk = insFormDate || getTodayDateKey();
    input.setCostError(null);
    const fields = {
        companyId: company.id,
        companyName: company.name,
        amount,
        type: insFormType,
        dateKey: dk,
        insuranceMembershipId: input.insFormMembership.trim() || undefined,
        insuranceApprovalCode: input.insFormApproval.trim() || undefined,
        note: input.insFormNote.trim() || undefined,
    };
    if (input.editingInsId) {
        const oldItem = input.insuranceItems.find(i => i.id === input.editingInsId);
        editInsuranceItem(fileId, input.editingInsId, fields);
        const updated = loadPatientFileInsurance(fileId);
        input.setInsuranceItems(updated);
        doSyncCostsToFirestore({
            userId: input.userId,
            fileId,
            costs: input.costItems,
            insurance: updated,
            extraDateKeys: oldItem && oldItem.dateKey !== dk ? new Set([oldItem.dateKey]) : undefined,
            branchId,
        });
        input.setEditingInsId(null);
    } else {
        addInsuranceItem(fileId, patientName, fields, branchId);
        const updated = loadPatientFileInsurance(fileId);
        input.setInsuranceItems(updated);
        doSyncCostsToFirestore({
            userId: input.userId,
            fileId,
            costs: input.costItems,
            insurance: updated,
            branchId,
        });
    }
    input.resetInsForm();
};

interface DeleteInsuranceInput {
    fileId: string | undefined;
    itemId: string;
    costItems: PatientCostItem[];
    insuranceItems: PatientInsuranceItem[];
    userId: string | undefined;
    branchId?: string;
    setInsuranceItems: React.Dispatch<React.SetStateAction<PatientInsuranceItem[]>>;
}

export const handleDeleteInsuranceOperation = ({
    fileId,
    itemId,
    costItems,
    insuranceItems,
    userId,
    branchId,
    setInsuranceItems,
}: DeleteInsuranceInput): void => {
    if (!fileId) return;
    const deletedItem = insuranceItems.find(i => i.id === itemId);
    deleteInsuranceItem(fileId, itemId);
    const updated = loadPatientFileInsurance(fileId);
    setInsuranceItems(updated);
    doSyncCostsToFirestore({
        userId,
        fileId,
        costs: costItems,
        insurance: updated,
        extraDateKeys: deletedItem ? new Set([deletedItem.dateKey]) : undefined,
        branchId,
    });
};
