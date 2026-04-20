import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency, branchLocalKey } from '../utils/formatters';
import type { DailyInsuranceExtraEntry } from '../hooks/useFinancialData';
import type { PatientDailyBreakdown } from '../hooks/useFinancialStats.shared';
import {
    editCostItemInDateIndex, deleteCostItemFromDateIndex,
    deleteInsuranceExtraFromDate,
    syncCostsToFirestore, loadCostsFromFirestore,
} from '../../../services/patientCostService';
import { financialDataService, type DailyFinancialData } from '../../../services/financial-data';
import { PatientCard, RevenueSection } from './daily-revenue/PatientCard';

interface CashCostEntry {
    id: string;
    patientFileId?: string;
    patientName: string;
    amount: number;
    type: 'interventions' | 'other';
    dateKey: string;
    note?: string;
}

interface DailyRevenueSectionProps {
    formattedSelectedDay: string;
    selectedDayKey: string;
    selectedDayExamBreakdowns: PatientDailyBreakdown[];
    selectedDayConsultBreakdowns: PatientDailyBreakdown[];
    interventionsValue: string;
    interventionsLabel: string;
    onUpdateInterventionsLabel: (value: string) => void;
    otherValue: string;
    otherLabel: string;
    onUpdateOtherLabel: (value: string) => void;
    totalDailyRevenue: number;
    dailyInsuranceTotal: number;
    dailyInsuranceExtras: DailyInsuranceExtraEntry[];
    userId: string;
    /** الفرع النشط — يُستخدم لفصل مفاتيح localStorage بين الفروع */
    branchId?: string;
    /** خريطة Firestore اليومية (مفلترة بالفرع) — لجلب cashCostItems لليوم المختار */
    yearlyDailyMap: Record<string, DailyFinancialData>;
}

// PatientCard و RevenueSection مُستخرجان إلى `./daily-revenue/PatientCard.tsx`

interface CostEditState {
    item: CashCostEntry;
    amount: string;
    note: string;
    type: 'interventions' | 'other';
}

interface InsEditState {
    entry: DailyInsuranceExtraEntry;
    amount: string;
    type: 'interventions' | 'other';
    note: string;
}

export const DailyRevenueSection: React.FC<DailyRevenueSectionProps> = ({
    formattedSelectedDay, selectedDayKey,
    selectedDayExamBreakdowns, selectedDayConsultBreakdowns,
    interventionsValue, interventionsLabel, onUpdateInterventionsLabel,
    otherValue, otherLabel, onUpdateOtherLabel,
    totalDailyRevenue, dailyInsuranceTotal, dailyInsuranceExtras,
    userId, branchId, yearlyDailyMap,
}) => {
    const [cashCostItems, setCashCostItems] = useState<CashCostEntry[]>([]);
    const [localInsExtras, setLocalInsExtras] = useState<DailyInsuranceExtraEntry[]>(dailyInsuranceExtras);
    const [costEditState, setCostEditState] = useState<CostEditState | null>(null);
    const [insEditState, setInsEditState] = useState<InsEditState | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Keep local insurance extras in sync with Firestore-driven prop
    useEffect(() => { setLocalInsExtras(dailyInsuranceExtras); }, [dailyInsuranceExtras]);

    const readFromStorage = useCallback(() => {
        // الأولوية: Firestore daily doc (cashCostItems مفلترة بالفرع أصلاً في الـ doc)
        const firestoreItems = yearlyDailyMap[selectedDayKey]?.cashCostItems;
        if (Array.isArray(firestoreItems) && firestoreItems.length > 0) {
            setCashCostItems(firestoreItems as CashCostEntry[]);
            return;
        }
        // fallback: localStorage (للتحديثات اللحظية بعد add/edit/delete محلي قبل ما Firestore ترد)
        try {
            const raw = localStorage.getItem(`patientCostItems_${selectedDayKey}`) ?? '[]';
            const all = JSON.parse(raw) as Array<CashCostEntry & { branchId?: string }>;
            const target = branchId || 'main';
            const filtered = all.filter(item => (item.branchId || 'main') === target);
            setCashCostItems(filtered);
        } catch {
            setCashCostItems([]);
        }
    }, [selectedDayKey, branchId, yearlyDailyMap]);

    useEffect(() => {
        readFromStorage();
        const onUpdate = () => readFromStorage();
        const onVisible = () => { if (document.visibilityState === 'visible') readFromStorage(); };
        window.addEventListener('financialDataUpdated', onUpdate);
        window.addEventListener('storage', onUpdate);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener('financialDataUpdated', onUpdate);
            window.removeEventListener('storage', onUpdate);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [readFromStorage]);

    // Re-read when totals change (upstream Firestore update)
    useEffect(() => { readFromStorage(); }, [interventionsValue, otherValue, readFromStorage]);

    // ── Sync helpers ─────────────────────────────────────────────────────────────────

    const syncDailyToFirestore = useCallback(async (dateKey: string) => {
        const intv  = parseFloat(localStorage.getItem(`${branchLocalKey('interventionsRevenue', branchId)}_${dateKey}`) || '0') || 0;
        const other = parseFloat(localStorage.getItem(`${branchLocalKey('otherRevenue', branchId)}_${dateKey}`)         || '0') || 0;
        let extras: unknown[] = [];
        try { extras = JSON.parse(localStorage.getItem(`${branchLocalKey('insuranceExtra', branchId)}_${dateKey}`) || '[]'); } catch { /* noop */ }
        let cashItems: unknown[] = [];
        try {
            const allItems = JSON.parse(localStorage.getItem(`${branchLocalKey('patientCostItems', branchId)}_${dateKey}`) || '[]');
            cashItems = allItems.filter((i: Record<string, unknown>) => i.patientFileId);
        } catch { /* noop */ }
        await financialDataService.saveDailyData(userId, dateKey, {
            interventionsRevenue: intv, otherRevenue: other, insuranceExtras: extras, cashCostItems: cashItems,
        }, branchId).catch(console.error);
        window.dispatchEvent(new Event('financialDataUpdated'));
    }, [userId, branchId]);

    // ── Cash: Delete ────────────────────────────────────────────────────────────────

    const handleDeleteCash = useCallback(async (item: CashCostEntry) => {
        if (!window.confirm(`حذف هذا الإدخال (${formatCurrency(item.amount)} ج.م)؟`)) return;
        setIsSaving(true);
        try {
            // 1. حذف فوري من فهرس التاريخ (يعمل دائماً حتى للعناصر القديمة)
            deleteCostItemFromDateIndex(item.dateKey, item.id);
            readFromStorage();

            // 2. تحديث ملف المريض في Firestore إن وُجد
            if (item.patientFileId && userId) {
                try {
                    const { costItems: freshCosts, insuranceItems: freshIns } =
                        await loadCostsFromFirestore(userId, item.patientFileId);
                    // loadCostsFromFirestore قد يعيد العنصر لفهرس التاريخ، أزله مرة أخرى
                    deleteCostItemFromDateIndex(item.dateKey, item.id);
                    const updatedCosts = freshCosts.filter(c => c.id !== item.id);
                    await syncCostsToFirestore(userId, item.patientFileId, updatedCosts, freshIns);
                } catch { /* best-effort — تحديث التقرير اليومي يكفي */ }
            }

            // 3. تحديث وثيقة Firestore اليومية
            await syncDailyToFirestore(item.dateKey);
        } finally {
            setIsSaving(false);
        }
    }, [readFromStorage, syncDailyToFirestore, userId]);

    // ── Cash: Edit ─────────────────────────────────────────────────────────────────

    const openEditCash = useCallback((item: CashCostEntry) => {
        setCostEditState({ item, amount: String(item.amount), note: item.note ?? '', type: item.type });
    }, []);

    const handleSaveCostEdit = useCallback(async () => {
        if (!costEditState) return;
        const amount = parseFloat(costEditState.amount);
        if (!amount || amount <= 0) return;
        setIsSaving(true);
        try {
            const { item } = costEditState;
            const changes = { amount, note: costEditState.note || undefined, type: costEditState.type };

            // 1. تعديل فوري في فهرس التاريخ
            editCostItemInDateIndex(item.dateKey, item.id, changes);
            readFromStorage();
            setCostEditState(null);

            // 2. تحديث ملف المريض في Firestore
            if (item.patientFileId && userId) {
                try {
                    const { costItems: freshCosts, insuranceItems: freshIns } =
                        await loadCostsFromFirestore(userId, item.patientFileId);
                    // إعادة تطبيق التعديل بعد إعادة تحميل loadCostsFromFirestore
                    editCostItemInDateIndex(item.dateKey, item.id, changes);
                    const updatedCosts = freshCosts.map(c => c.id === item.id ? { ...c, ...changes } : c);
                    await syncCostsToFirestore(userId, item.patientFileId, updatedCosts, freshIns);
                } catch { /* best-effort */ }
            }

            // 3. تحديث وثيقة Firestore اليومية
            await syncDailyToFirestore(item.dateKey);
            readFromStorage();
        } finally {
            setIsSaving(false);
        }
    }, [costEditState, readFromStorage, syncDailyToFirestore, userId]);

    // ── Insurance: Delete ─────────────────────────────────────────────────────────

    const handleDeleteIns = useCallback(async (entry: DailyInsuranceExtraEntry) => {
        if (!window.confirm(`حذف مطالبة التأمين (${formatCurrency(entry.amount)} ج.م)؟`)) return;
        setIsSaving(true);
        try {
            // 1. حذف فوري من insuranceExtra localStorage
            deleteInsuranceExtraFromDate(selectedDayKey, entry.id);
            setLocalInsExtras(prev => prev.filter(e => e.id !== entry.id));

            // 2. تحديث ملف المريض في Firestore
            if (entry.fromPatientFile && entry.patientFileId && userId) {
                try {
                    const { costItems: freshCosts, insuranceItems: freshIns } =
                        await loadCostsFromFirestore(userId, entry.patientFileId);
                    // loadCostsFromFirestore قد يعيد العنصر، أزله مرة أخرى
                    deleteInsuranceExtraFromDate(selectedDayKey, entry.id);
                    const updatedIns = freshIns.filter(i => i.id !== entry.id);
                    await syncCostsToFirestore(userId, entry.patientFileId, freshCosts, updatedIns);
                } catch { /* best-effort */ }
            }

            // 3. تحديث وثيقة Firestore اليومية
            await syncDailyToFirestore(selectedDayKey);
        } finally {
            setIsSaving(false);
        }
    }, [selectedDayKey, syncDailyToFirestore, userId]);

    // ── Insurance: Edit ───────────────────────────────────────────────────────────────

    const openEditIns = useCallback((entry: DailyInsuranceExtraEntry) => {
        setInsEditState({ entry, amount: String(entry.amount), type: entry.type, note: entry.note ?? '' });
    }, []);

    const handleSaveInsEdit = useCallback(async () => {
        if (!insEditState) return;
        const amount = parseFloat(insEditState.amount);
        if (!amount || amount <= 0) return;
        setIsSaving(true);
        try {
            const { entry, type } = insEditState;
            const note = insEditState.note.trim() || undefined;
            const extraKey = `${branchLocalKey('insuranceExtra', branchId)}_${selectedDayKey}`;

            // Bug #5 fix: إعادة ترتيب العمليات عشان نتجنّب race condition:
            // 1. نحدّث React state أولاً عشان UI feedback فوري
            setLocalInsExtras(prev => prev.map(e => e.id === entry.id ? { ...e, amount, type, note } : e));
            setInsEditState(null);

            // 2. لو العنصر مربوط بملف مريض، نقرأ من Firestore (هذا سيُحدّث localStorage بالنسخة القديمة)
            //    ثم نطبّق التعديل على النسخة المدمجة ونكتب مرة واحدة نهائية
            if (entry.fromPatientFile && entry.patientFileId && userId) {
                try {
                    const { costItems: freshCosts, insuranceItems: freshIns } =
                        await loadCostsFromFirestore(userId, entry.patientFileId);
                    const updatedIns = freshIns.map(i => i.id === entry.id ? { ...i, amount, type, note } : i);
                    // نكتب إلى Firestore (ملف المريض)
                    await syncCostsToFirestore(userId, entry.patientFileId, freshCosts, updatedIns);
                } catch { /* best-effort */ }
            }

            // 3. الكتابة النهائية إلى localStorage — مرة واحدة، بعد أي تدخّل محتمل من loadCostsFromFirestore
            let extrasFinal: any[] = [];
            try { extrasFinal = JSON.parse(localStorage.getItem(extraKey) ?? '[]'); } catch { /* noop */ }
            const mergedExtras = extrasFinal.map((e: any) => e.id === entry.id ? { ...e, amount, type, note } : e);
            localStorage.setItem(extraKey, JSON.stringify(mergedExtras));
            localStorage.setItem(`${extraKey}_timestamp`, Date.now().toString());

            // 4. تحديث وثيقة Firestore اليومية (يقرأ من localStorage اللي للتو اتحدّث)
            await syncDailyToFirestore(selectedDayKey);
        } finally {
            setIsSaving(false);
        }
    }, [insEditState, selectedDayKey, syncDailyToFirestore, userId, branchId]);

    // ── Derived data ─────────────────────────────────────────────────────────────────

    const cashInterventions  = cashCostItems.filter(i => i.type === 'interventions');
    const cashOtherItems     = cashCostItems.filter(i => i.type === 'other');
    const insInterventions   = localInsExtras.filter(e => e.type === 'interventions');
    const insOtherItems      = localInsExtras.filter(e => e.type === 'other');

    const examCashTotal      = selectedDayExamBreakdowns.reduce((s, b) => s + b.cashAmount, 0);
    const examInsEntries     = selectedDayExamBreakdowns.filter(b => b.insuranceAmount > 0);
    const consultCashTotal   = selectedDayConsultBreakdowns.reduce((s, b) => s + b.cashAmount, 0);
    const consultInsEntries  = selectedDayConsultBreakdowns.filter(b => b.insuranceAmount > 0);

    // إجماليات كل فئة (كاش + تأمين) — تُعرض في بطاقات الملخص العلوية مثل الشاشة الشهرية
    const examsIncomeTotal =
        examCashTotal + examInsEntries.reduce((s, b) => s + b.insuranceAmount, 0);
    const consultsIncomeTotal =
        consultCashTotal + consultInsEntries.reduce((s, b) => s + b.insuranceAmount, 0);
    const interventionsIncomeTotal =
        cashInterventions.reduce((s, i) => s + i.amount, 0) +
        insInterventions.reduce((s, e) => s + e.amount, 0);
    const otherIncomeTotal =
        cashOtherItems.reduce((s, i) => s + i.amount, 0) +
        insOtherItems.reduce((s, e) => s + e.amount, 0);

    const examsCountToday = selectedDayExamBreakdowns.length;
    const consultsCountToday = selectedDayConsultBreakdowns.length;

    const displayInterventionsLabel = (interventionsLabel || '').trim() || 'التداخلات';
    const displayOtherLabel = (otherLabel || '').trim() || 'دخل آخر';

    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            {/* Edit modal: cash item */}
            {costEditState && (
                <div className="fixed inset-0 z-[10100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCostEditState(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()} dir="rtl">
                        <h3 className="text-base font-black text-slate-800">تعديل الإدخال</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">المبلغ (ج.م)</label>
                                <input type="number" value={costEditState.amount}
                                    onChange={e => setCostEditState(s => s ? { ...s, amount: e.target.value } : null)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">الفئة</label>
                                <select value={costEditState.type}
                                    onChange={e => setCostEditState(s => s ? { ...s, type: e.target.value as 'interventions' | 'other' } : null)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none">
                                    <option value="interventions">التداخلات</option>
                                    <option value="other">دخل آخر</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">ملاحظة (اختياري)</label>
                                <input type="text" value={costEditState.note}
                                    onChange={e => setCostEditState(s => s ? { ...s, note: e.target.value } : null)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none"
                                    placeholder="ملاحظة..." />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSaveCostEdit} disabled={isSaving}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl py-2 text-sm font-black disabled:opacity-60">
                                {isSaving ? 'جاري الحفظ' : 'حفظ'}
                            </button>
                            <button onClick={() => setCostEditState(null)}
                                className="flex-1 bg-slate-100 text-slate-600 rounded-xl py-2 text-sm font-black hover:bg-slate-200">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal: insurance item */}
            {insEditState && (
                <div className="fixed inset-0 z-[10100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInsEditState(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()} dir="rtl">
                        <h3 className="text-base font-black text-slate-800">تعديل مطالبة التأمين</h3>
                        <p className="text-xs text-slate-500 -mt-2">{insEditState.entry.companyName}{insEditState.entry.patientName ? ` · ${insEditState.entry.patientName}` : ''}</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">المبلغ (ج.م)</label>
                                <input type="number" value={insEditState.amount}
                                    onChange={e => setInsEditState(s => s ? { ...s, amount: e.target.value } : null)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">الفئة</label>
                                <select value={insEditState.type}
                                    onChange={e => setInsEditState(s => s ? { ...s, type: e.target.value as 'interventions' | 'other' } : null)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none">
                                    <option value="interventions">التداخلات</option>
                                    <option value="other">دخل آخر</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">ملاحظة (اختياري)</label>
                                <input type="text" value={insEditState.note}
                                    onChange={e => setInsEditState(s => s ? { ...s, note: e.target.value } : null)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none"
                                    placeholder="ملاحظة..." />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSaveInsEdit} disabled={isSaving}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl py-2 text-sm font-black disabled:opacity-60">
                                {isSaving ? 'جاري الحفظ' : 'حفظ'}
                            </button>
                            <button onClick={() => setInsEditState(null)}
                                className="flex-1 bg-slate-100 text-slate-600 rounded-xl py-2 text-sm font-black hover:bg-slate-200">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600">
                <span className="text-base">💵</span>
                <span className="text-sm font-black text-white">إيرادات اليوم</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{formattedSelectedDay}</span>
            </div>

            <div className="bg-white p-4 space-y-4">
                {/* ملخص بطاقات الفئات (نفس أسلوب الإيرادات الشهرية) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">الكشوفات</label>
                        <div className="bg-blue-50 rounded-xl border-2 border-blue-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-blue-700 text-center break-words">
                                {formatCurrency(examsIncomeTotal)}
                            </div>
                            <div className="text-xs text-center text-blue-500 font-bold mt-1">
                                {examsCountToday} كشف
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">الاستشارات</label>
                        <div className="bg-indigo-50 rounded-xl border-2 border-indigo-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-indigo-700 text-center break-words">
                                {formatCurrency(consultsIncomeTotal)}
                            </div>
                            <div className="text-xs text-center text-indigo-500 font-bold mt-1">
                                {consultsCountToday} استشارة
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">{displayInterventionsLabel}</label>
                        <div className="bg-purple-50 rounded-xl border-2 border-purple-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-purple-700 text-center break-words">
                                {formatCurrency(interventionsIncomeTotal)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">{displayOtherLabel}</label>
                        <div className="bg-teal-50 rounded-xl border-2 border-teal-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-teal-700 text-center break-words">
                                {formatCurrency(otherIncomeTotal)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* تفاصيل المرضى (تحت الملخص) — تبقى للتحرير والحذف */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RevenueSection emoji="💉" title="الكشوفات">
                        <PatientCard label="كشوفات كاش" amount={examCashTotal} />
                        {examInsEntries.map((b, i) => (
                            <PatientCard key={i} isInsurance label="مطالبات التأمين - كشف" sublabel={b.companyName} amount={b.insuranceAmount} patientName={b.patientName} />
                        ))}
                    </RevenueSection>
                    <RevenueSection emoji="💬" title="الاستشارات">
                        <PatientCard label="استشارات كاش" amount={consultCashTotal} />
                        {consultInsEntries.map((b, i) => (
                            <PatientCard key={i} isInsurance label="مطالبات التأمين - استشارة" sublabel={b.companyName} amount={b.insuranceAmount} patientName={b.patientName} />
                        ))}
                    </RevenueSection>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RevenueSection title={
                        <div className="flex items-center gap-1 w-full min-w-0">
                            <input type="text" value={interventionsLabel}
                                onChange={(e) => onUpdateInterventionsLabel(e.target.value)}
                                className="bg-transparent outline-none font-black text-white min-w-0 flex-1"
                                placeholder="اسم الفئة..." />
                        </div>
                    }>
                        {cashInterventions.map(item => (
                            <PatientCard key={item.id} label="تداخل كاش"
                                amount={item.amount} patientName={item.patientName} note={item.note}
                                onEdit={() => openEditCash(item)} onDelete={() => handleDeleteCash(item)} />
                        ))}
                        {insInterventions.map(extra => (
                            <PatientCard key={extra.id} isInsurance label="مطالبات التأمين - تداخل" sublabel={extra.companyName} amount={extra.amount} patientName={extra.patientName ?? undefined} note={extra.note}
                                onEdit={() => openEditIns(extra)} onDelete={() => handleDeleteIns(extra)} />
                        ))}
                        {cashInterventions.length === 0 && insInterventions.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-2">لا توجد تداخلات لهذا اليوم</p>
                        )}
                    </RevenueSection>

                    <RevenueSection title={
                        <div className="flex items-center gap-1 w-full min-w-0">
                            <input type="text" value={otherLabel}
                                onChange={(e) => onUpdateOtherLabel(e.target.value)}
                                className="bg-transparent outline-none font-black text-white min-w-0 flex-1"
                                placeholder="اسم الفئة..." />
                        </div>
                    }>
                        {cashOtherItems.map(item => (
                            <PatientCard key={item.id} label="دخل آخر كاش"
                                amount={item.amount} patientName={item.patientName} note={item.note}
                                onEdit={() => openEditCash(item)} onDelete={() => handleDeleteCash(item)} />
                        ))}
                        {insOtherItems.map(extra => (
                            <PatientCard key={extra.id} isInsurance label="مطالبات التأمين - دخل آخر" sublabel={extra.companyName} amount={extra.amount} patientName={extra.patientName ?? undefined} note={extra.note}
                                onEdit={() => openEditIns(extra)} onDelete={() => handleDeleteIns(extra)} />
                        ))}
                        {cashOtherItems.length === 0 && insOtherItems.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center py-2">لا يوجد دخل آخر لهذا اليوم</p>
                        )}
                    </RevenueSection>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl p-3">
                        <span className="font-bold text-white">💰 إجمالي اليوم</span>
                        <span className="text-base sm:text-xl font-black text-white">{formatCurrency((totalDailyRevenue || 0) + (dailyInsuranceTotal || 0))}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl px-3 py-2.5">
                        <span className="text-sm font-bold text-white">💵 نقد محصّل</span>
                        <span className="text-sm font-black text-white">{formatCurrency(totalDailyRevenue || 0)}</span>
                    </div>
                    {(dailyInsuranceTotal || 0) > 0 && (
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl px-3 py-2.5">
                            <span className="text-sm font-bold text-white">🏢 مطالبات تأمين</span>
                            <span className="text-sm font-black text-white">{formatCurrency(dailyInsuranceTotal || 0)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};