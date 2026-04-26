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

interface DoSyncArgs {
    userId: string | undefined;
    fileId: string | undefined;
    costs: PatientCostItem[];
    insurance: PatientInsuranceItem[];
    extraDateKeys?: Set<string>;
    /** الفرع النشط وقت المزامنة — بيحدد الفرع اللي هيتكتب عليه الـ daily Firestore doc */
    branchId?: string;
}

/** يحوّل PatientInsuranceItem إلى شكل insuranceExtra المتخزن في الـ daily doc. */
const toInsuranceExtra = (ins: PatientInsuranceItem) => ({
    id: ins.id,
    companyId: ins.companyId ?? '',
    companyName: ins.companyName,
    type: ins.type,
    amount: ins.amount,
    branchId: ins.branchId,
    insuranceMembershipId: ins.insuranceMembershipId,
    insuranceApprovalCode: ins.insuranceApprovalCode,
    note: ins.note,
    // نسبة تحمل المريض — بتروح للـ daily doc عشان الكشف التفصيلي يستخدمها
    patientSharePercent: ins.patientSharePercent,
    fromPatientFile: true,
    patientFileId: ins.patientFileId,
    patientName: ins.patientName,
});

/**
 * مزامنة التكاليف إلى Firestore + تحديث ملخصات الأيام المتأثرة في
 * financial-data + إطلاق حدث لتحديث التقارير المالية.
 *
 * بيفلتر العناصر بحيث الـ daily Firestore doc لفرع معين يحتوي فقط على
 * العناصر اللي تخصه. بيدمج بيانات هذا الملف مع بيانات الملفات الأخرى
 * الموجودة في Firestore daily doc بحيث ما نمسحش بياناتهم.
 */
const doSyncCostsToFirestore = ({
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

    const syncOneDay = async (dk: string): Promise<void> => {
        // نجيب الحالة الحالية من Firestore (cache-first — سريع) عشان نحافظ على
        // بيانات الملفات الأخرى في نفس اليوم/الفرع.
        const currentDoc = await financialDataService.getDailyData(userId, dk, branchId).catch(() => null);
        const currentCash: any[] = Array.isArray(currentDoc?.cashCostItems) ? currentDoc!.cashCostItems : [];
        const currentExtras: any[] = Array.isArray(currentDoc?.insuranceExtras) ? currentDoc!.insuranceExtras : [];

        // شيل عناصر هذا الملف من الحالة الحالية، بعدين ضيف عناصره المحدّثة
        const otherFilesCash = currentCash.filter((c: any) => c.patientFileId !== fileId);
        const thisFileCashForDay = costs.filter(c => c.dateKey === dk && resolveItemBranch(c) === targetBranch);
        const mergedCash = [...otherFilesCash, ...thisFileCashForDay];

        const otherFilesExtras = currentExtras.filter((e: any) => e.patientFileId !== fileId);
        const thisFileInsForDay = insurance
            .filter(i => i.dateKey === dk && resolveItemBranch(i) === targetBranch)
            .map(toInsuranceExtra);
        const mergedExtras = [...otherFilesExtras, ...thisFileInsForDay];

        // إعادة حساب الإجماليات من العناصر المدمجة (للفرع الحالي فقط — الـ doc per-branch)
        const intv = mergedCash
            .filter((c: any) => c.type === 'interventions')
            .reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
        const other = mergedCash
            .filter((c: any) => c.type === 'other')
            .reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);

        await financialDataService.saveDailyData(userId, dk, {
            interventionsRevenue: intv,
            otherRevenue: other,
            insuranceExtras: mergedExtras,
            cashCostItems: mergedCash,
        }, branchId);
    };

    Promise.all(Array.from(dateKeys).map((dk) => syncOneDay(dk).catch(console.error)))
        .finally(() => {
            window.dispatchEvent(new Event('financialDataUpdated'));
        });
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
    /** نسبة تحمل المريض كنص (string) — بتتحول لرقم وقت الحفظ، فاضي = 0 */
    insFormSharePercent: string;
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
    // نسبة التحمل: رقم بين 0 و100. فاضي → undefined (يتعامل كـ 0 في الحسبة).
    const rawShare = parseFloat(input.insFormSharePercent);
    const sharePercent = Number.isFinite(rawShare) ? Math.max(0, Math.min(100, rawShare)) : undefined;
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
        patientSharePercent: sharePercent,
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
