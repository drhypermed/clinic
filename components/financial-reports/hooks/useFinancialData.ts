import { useState, useEffect, useCallback, useRef } from 'react';
import { financialDataService } from '../../../services/financial-data';
import { formatDateKey, formatMonthKey, branchLocalKey } from '../utils/formatters';
interface MonthlyExpenses {
    rentExpense: string;      // الإيجار
    salariesExpense: string;  // المرتبات
    toolsExpense: string;     // الأدوات
    electricityExpense: string; // الكهرباء
    otherExpense: string;     // أخرى
}
interface DailyRevenue {
    interventions: string;    // التداخلات
    other: string;           // دخل آخر
}
interface DailyExpense {
    amount: string;          // مبلغ المصروفات
}
interface RevenueLabels {
    interventionsLabel: string;  // اسم فئة التداخلات
    otherRevenueLabel: string;   // اسم فئة الدخل الآخر
}
export interface DailyInsuranceExtraEntry {
    id: string;
    companyId: string;
    companyName: string;
    type: 'interventions' | 'other';
    amount: number;
    insuranceMembershipId?: string;
    insuranceApprovalCode?: string;
    note?: string;
    /** true when entry was created from a patient file (not free-typed here) */
    fromPatientFile?: boolean;
    patientFileId?: string;
    patientName?: string;
}
const DEFAULT_INTERVENTIONS_LABEL = 'التداخلات';
const DEFAULT_OTHER_REVENUE_LABEL = 'دخل آخر';
// ملاحظة: تنظيف لاحقة "(كاش)" القديمة يتم مركزياً في services/financial-data/labels.ts (auto-migration)
const normalizeRevenueLabel = (
    value: string | null | undefined,
    key: 'interventions' | 'other'
): string => {
    const normalized = String(value || '').trim();
    if (!normalized) {
        return key === 'interventions' ? DEFAULT_INTERVENTIONS_LABEL : DEFAULT_OTHER_REVENUE_LABEL;
    }
    return normalized;
};
// مفاتيح localStorage بتراعي الفرع: الفرع الرئيسي يحتفظ بالمفتاح الأصلي (توافق مع البيانات القديمة)،
// والفروع الأخرى بتحصل على prefix عشان ما يحصلش تعارض بين البيانات.
const getMonthValue = (key: string, monthKey: string, branchId?: string): string =>
    localStorage.getItem(`${branchLocalKey(key, branchId)}_${monthKey}`) || '';
const getMonthUpdatedAt = (key: string, monthKey: string, branchId?: string): number => {
    const val = localStorage.getItem(`${branchLocalKey(key, branchId)}_${monthKey}_timestamp`);
    return val ? parseInt(val) : 0;
};
const setMonthValue = (key: string, monthKey: string, value: string, branchId?: string): void => {
    const fullKey = `${branchLocalKey(key, branchId)}_${monthKey}`;
    localStorage.setItem(fullKey, value);
    localStorage.setItem(`${fullKey}_timestamp`, Date.now().toString());
};
const getDailyValue = (key: string, dateKey: string, branchId?: string): string =>
    localStorage.getItem(`${branchLocalKey(key, branchId)}_${dateKey}`) || '';
const getDailyUpdatedAt = (key: string, dateKey: string, branchId?: string): number => {
    const val = localStorage.getItem(`${branchLocalKey(key, branchId)}_${dateKey}_timestamp`);
    return val ? parseInt(val) : 0;
};
const setDailyValue = (key: string, dateKey: string, value: string, branchId?: string): void => {
    const fullKey = `${branchLocalKey(key, branchId)}_${dateKey}`;
    localStorage.setItem(fullKey, value);
    localStorage.setItem(`${fullKey}_timestamp`, Date.now().toString());
};
interface UseFinancialDataProps {
    userId: string;
    selectedDate: Date;      // الشهر المحدد
    selectedDay: Date;       // اليوم المحدد
    /** الفرع النشط — لفلترة البيانات المالية حسب الفرع */
    branchId?: string;
}
interface UseFinancialDataReturn {
    monthlyExpenses: MonthlyExpenses;
    updateMonthlyExpense: (key: keyof MonthlyExpenses, value: string) => void;
    dailyRevenue: DailyRevenue;
    dailyExpense: string;
    updateDailyExpense: (value: string) => void;
    labels: RevenueLabels;
    updateLabel: (key: keyof RevenueLabels, value: string) => void;
    dailyInsuranceExtras: DailyInsuranceExtraEntry[];
    lastSyncTime: number;
}
export const useFinancialData = ({
    userId,
    selectedDate,
    selectedDay,
    branchId
}: UseFinancialDataProps): UseFinancialDataReturn => {
    const selectedMonthKey = formatMonthKey(selectedDate);
    const selectedDayKey = formatDateKey(selectedDay);
    const [lastSyncTime, setLastSyncTime] = useState<number>(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenses>({
        rentExpense: '',
        salariesExpense: '',
        toolsExpense: '',
        electricityExpense: '',
        otherExpense: ''
    });
    const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue>({
        interventions: '',
        other: ''
    });
    const [dailyExpense, setDailyExpense] = useState<string>('');
    const branchSuffix = branchId ? `_${branchId}` : '';
    const [labels, setLabels] = useState<RevenueLabels>({
        interventionsLabel: normalizeRevenueLabel(localStorage.getItem(`revenueLabel_interventions${branchSuffix}`), 'interventions'),
        otherRevenueLabel: normalizeRevenueLabel(localStorage.getItem(`revenueLabel_other${branchSuffix}`), 'other')
    });
    const [dailyInsuranceExtras, setDailyInsuranceExtras] = useState<DailyInsuranceExtraEntry[]>([]);
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const year = selectedDate.getFullYear();
        const targetBranch = branchId || 'main';

        // Bug #B2 fix helper: دمج العناصر المفلترة من Firestore (لفرع معيّن)
        // داخل المفتاح الموحّد بدون ما نمسح عناصر الفروع الأخرى.
        // - بنشيل العناصر اللي بتخص الفرع الحالي من القايمة القديمة
        // - بنحط العناصر القادمة من Firestore (مع التأكد إن ليها branchId)
        const mergeBranchItemsIntoUnifiedKey = (
            unifiedKey: string,
            branchItems: any[],
        ): void => {
            let existing: any[] = [];
            try { existing = JSON.parse(localStorage.getItem(unifiedKey) || '[]'); } catch { /* ignore */ }
            if (!Array.isArray(existing)) existing = [];
            const otherBranches = existing.filter(
                (it: any) => (it?.branchId || 'main') !== targetBranch
            );
            const currentBranchTagged = (branchItems || []).map((it: any) => ({
                ...it,
                branchId: (it && it.branchId) ? it.branchId : targetBranch,
            }));
            const merged = [...otherBranches, ...currentBranchTagged];
            localStorage.setItem(unifiedKey, JSON.stringify(merged));
        };

        financialDataService.getYearlyDailyEntries(userId, year, branchId).then(daily => {
            if (cancelled) return;
            Object.entries(daily).forEach(([k, v]) => {
                // Bug #B1 fix: كتابة المجاميع بمفاتيح branch-aware عن طريق الـ setters الموجودة
                if (v.interventionsRevenue !== undefined)
                    setDailyValue('interventionsRevenue', k, v.interventionsRevenue.toString(), branchId);
                if (v.otherRevenue !== undefined)
                    setDailyValue('otherRevenue', k, v.otherRevenue.toString(), branchId);
                if (v.dailyExpense !== undefined)
                    setDailyValue('dailyExpense', k, v.dailyExpense.toString(), branchId);
                // Bug #B2 fix: دمج بدل overwrite للمفاتيح الموحّدة (insuranceExtra / patientCostItems)
                if (v.insuranceExtras) {
                    mergeBranchItemsIntoUnifiedKey(`insuranceExtra_${k}`, v.insuranceExtras);
                    localStorage.setItem(`insuranceExtra_${k}_timestamp`, Date.now().toString());
                }
                if (v.cashCostItems !== undefined) {
                    mergeBranchItemsIntoUnifiedKey(`patientCostItems_${k}`, v.cashCostItems);
                    localStorage.setItem(`patientCostItems_${k}_timestamp`, Date.now().toString());
                }
            });
            setLastSyncTime(Date.now());
            window.dispatchEvent(new Event('financialDataUpdated'));
        }).catch(err => { if (!cancelled) console.error('[Financial] Failed to load yearly daily entries:', err); });

        financialDataService.getYearlyMonthlyEntries(userId, year, branchId).then(monthly => {
            if (cancelled) return;
            Object.entries(monthly).forEach(([k, v]) => {
                // Bug #B3 fix: المصروفات الشهرية بمفاتيح branch-aware
                const fields: Array<keyof MonthlyExpenses> = ['rentExpense', 'salariesExpense', 'toolsExpense', 'electricityExpense', 'otherExpense'];
                fields.forEach(field => {
                    const val = (v as any)[field];
                    if (val !== undefined && val !== null) setMonthValue(field, k, val.toString(), branchId);
                });
            });
            setLastSyncTime(Date.now());
        }).catch(err => { if (!cancelled) console.error('[Financial] Failed to load yearly monthly entries:', err); });
        return () => { cancelled = true; };
    }, [userId, selectedDate.getFullYear(), branchId]);  // Bug #B4 fix: branchId في الـ dep array
    useEffect(() => {
        const localData = {
            rentExpense: getMonthValue('rentExpense', selectedMonthKey, branchId),
            salariesExpense: getMonthValue('salariesExpense', selectedMonthKey, branchId),
            toolsExpense: getMonthValue('toolsExpense', selectedMonthKey, branchId),
            electricityExpense: getMonthValue('electricityExpense', selectedMonthKey, branchId),
            otherExpense: getMonthValue('otherExpense', selectedMonthKey, branchId)
        };
        setMonthlyExpenses(localData);
        if (userId) {
            financialDataService.getMonthlyData(userId, selectedMonthKey, branchId).then((data) => {
                const serverTime = data.updatedAt || 0;
                setMonthlyExpenses(prev => {
                    const resolve = (field: keyof MonthlyExpenses, serverVal: number | undefined, localVal: string) => {
                        const localTime = getMonthUpdatedAt(field, selectedMonthKey, branchId);
                        if (serverTime > localTime && serverVal !== undefined) return serverVal.toString();
                        return localVal;
                    };
                    return {
                        rentExpense: resolve('rentExpense', data.rentExpense, prev.rentExpense),
                        salariesExpense: resolve('salariesExpense', data.salariesExpense, prev.salariesExpense),
                        toolsExpense: resolve('toolsExpense', data.toolsExpense, prev.toolsExpense),
                        electricityExpense: resolve('electricityExpense', data.electricityExpense, prev.electricityExpense),
                        otherExpense: resolve('otherExpense', data.otherExpense, prev.otherExpense)
                    };
                });
            });
        }
    }, [selectedMonthKey, userId, branchId]);
    // قراءة البيانات اليومية من localStorage ثم التحديث من Firestore
    //
    // استراتيجية المفاتيح:
    //   - المجاميع (interventionsRevenue / otherRevenue / dailyExpense): branch-aware
    //     لأنها بتعبّر عن إجماليات خاصة بكل فرع.
    //   - insuranceExtras و patientCostItems: cross-branch (مفاتيح موحدة)،
    //     كل عنصر جواه `branchId` field؛ الفلترة بتحصل في الذاكرة عند الحاجة.
    //     ده ضروري عشان patientCostService يدير نفس الـ storage من صفحات المرضى
    //     بدون اختلاف في الكيز.
    useEffect(() => {
        // قراءة فورية من localStorage كقيمة ابتدائية
        setDailyRevenue({
            interventions: getDailyValue('interventionsRevenue', selectedDayKey, branchId),
            other: getDailyValue('otherRevenue', selectedDayKey, branchId),
        });
        setDailyExpense(getDailyValue('dailyExpense', selectedDayKey, branchId));

        // insuranceExtras من المفتاح الموحد، مع فلترة على الفرع النشط
        const targetBranch = branchId || 'main';
        try {
            const extraStr = localStorage.getItem(`insuranceExtra_${selectedDayKey}`) || '';
            const allExtras = extraStr ? JSON.parse(extraStr) : [];
            const filtered = Array.isArray(allExtras)
                ? allExtras.filter((e: any) => (e?.branchId || 'main') === targetBranch)
                : [];
            setDailyInsuranceExtras(filtered);
        } catch { setDailyInsuranceExtras([]); }

        if (!userId) return;

        const unsubscribe = financialDataService.subscribeToDailyData(userId, selectedDayKey, (data) => {
            // المجاميع الخاصة بهذا الفرع فقط
            if (data.interventionsRevenue !== undefined)
                setDailyValue('interventionsRevenue', selectedDayKey, data.interventionsRevenue.toString(), branchId);
            if (data.otherRevenue !== undefined)
                setDailyValue('otherRevenue', selectedDayKey, data.otherRevenue.toString(), branchId);
            if (data.dailyExpense !== undefined)
                setDailyValue('dailyExpense', selectedDayKey, data.dailyExpense.toString(), branchId);

            // ملاحظة: insuranceExtras و cashCostItems الجاية من Firestore daily doc
            // هي subset مفلتر لهذا الفرع. ما بنكتبهاش في المفتاح الموحد عشان ما نمسحش
            // بيانات فروع أخرى. بدل كده نحدّث الـ state مباشرة وقت وصولها.
            // المصدر الرئيسي (patientCostService) هو اللي بيدير المفاتيح الموحدة.

            // تحديث الحالة
            setDailyRevenue({
                interventions: data.interventionsRevenue !== undefined
                    ? data.interventionsRevenue.toString()
                    : getDailyValue('interventionsRevenue', selectedDayKey, branchId),
                other: data.otherRevenue !== undefined
                    ? data.otherRevenue.toString()
                    : getDailyValue('otherRevenue', selectedDayKey, branchId),
            });
            if (data.dailyExpense !== undefined) setDailyExpense(data.dailyExpense.toString());
            if (data.insuranceExtras !== undefined) {
                // البيانات الجاية مفلترة لهذا الفرع من الـ Firestore doc
                setDailyInsuranceExtras(data.insuranceExtras);
            }
            if (data.cashCostItems !== undefined) {
                // إطلاق حدث للـ UI تعيد قراءة patientCostItems_${dk} المصدر الموحد
                window.dispatchEvent(new Event('financialDataUpdated'));
            }
        }, undefined, branchId);
        return () => unsubscribe();
    }, [userId, selectedDayKey, branchId]);
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        financialDataService.getLabels(userId, branchId).then((data) => {
            if (cancelled) return;
            if (data.interventionsLabel) {
                setLabels(prev => ({
                    ...prev,
                    interventionsLabel: normalizeRevenueLabel(data.interventionsLabel, 'interventions')
                }));
            }
            if (data.otherRevenueLabel) {
                setLabels(prev => ({
                    ...prev,
                    otherRevenueLabel: normalizeRevenueLabel(data.otherRevenueLabel, 'other')
                }));
            }
        }).catch(err => { if (!cancelled) console.error('[Financial] Failed to load labels:', err); });
        return () => { cancelled = true; };
    }, [userId, branchId]);
    const pendingMonthlyChanges = useRef<Record<string, Partial<Record<keyof MonthlyExpenses, number>>>>({});
    const pendingDailyExpenseChanges = useRef<Record<string, number>>({});
    const pendingLabelChanges = useRef<Partial<RevenueLabels>>({});
    const monthlySaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    const dailyExpenseSaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    const labelsSaveTimeout = useRef<NodeJS.Timeout | null>(null);
    const updateMonthlyExpense = useCallback((key: keyof MonthlyExpenses, value: string) => {
        setMonthlyExpenses(prev => ({ ...prev, [key]: value }));
        setMonthValue(key, selectedMonthKey, value, branchId);
        if (userId) {
            if (!pendingMonthlyChanges.current[selectedMonthKey]) {
                pendingMonthlyChanges.current[selectedMonthKey] = {};
            }
            pendingMonthlyChanges.current[selectedMonthKey][key] = parseFloat(value) || 0;
            if (monthlySaveTimeouts.current[selectedMonthKey]) {
                clearTimeout(monthlySaveTimeouts.current[selectedMonthKey]);
            }
            monthlySaveTimeouts.current[selectedMonthKey] = setTimeout(() => {
                const changes = pendingMonthlyChanges.current[selectedMonthKey];
                delete pendingMonthlyChanges.current[selectedMonthKey];
                delete monthlySaveTimeouts.current[selectedMonthKey];
                if (changes) {
                    financialDataService.saveMonthlyData(userId, selectedMonthKey, changes as any, branchId)
                        .then(() => console.log(`Saved monthly data for ${selectedMonthKey}`))
                        .catch(console.error);
                }
            }, 1000);
        }
    }, [userId, selectedMonthKey, branchId]);
    const updateDailyExpenseHandler = useCallback((value: string) => {
        setDailyExpense(value);
        setDailyValue('dailyExpense', selectedDayKey, value, branchId);
        if (userId) {
            pendingDailyExpenseChanges.current[selectedDayKey] = parseFloat(value) || 0;
            if (dailyExpenseSaveTimeouts.current[selectedDayKey]) {
                clearTimeout(dailyExpenseSaveTimeouts.current[selectedDayKey]);
            }
            dailyExpenseSaveTimeouts.current[selectedDayKey] = setTimeout(() => {
                const amount = pendingDailyExpenseChanges.current[selectedDayKey];
                delete pendingDailyExpenseChanges.current[selectedDayKey];
                delete dailyExpenseSaveTimeouts.current[selectedDayKey];
                if (amount !== undefined) {
                    financialDataService.saveDailyData(userId, selectedDayKey, { dailyExpense: amount }, branchId)
                        .then(() => console.log(`Saved daily expense for ${selectedDayKey}`))
                        .catch(console.error);
                }
            }, 1000);
        }
    }, [userId, selectedDayKey, branchId]);

    // Bug #4 fix: عند تغيير الفرع، بنفلش أي كتابات معلّقة فوراً باستخدام branchId القديم (الصحيح لهذه التعديلات).
    // كده التعديلات اللي كان عليها debounce ما تضيعش، ولا تتكتب على الفرع الغلط.
    useEffect(() => {
        const monthlyTimeouts = monthlySaveTimeouts.current;
        const monthlyChanges = pendingMonthlyChanges.current;
        const dailyTimeouts = dailyExpenseSaveTimeouts.current;
        const dailyChanges = pendingDailyExpenseChanges.current;
        const currentBranchId = branchId;
        const currentUserId = userId;
        return () => {
            if (currentUserId) {
                Object.entries(monthlyTimeouts).forEach(([monthKey, timeout]) => {
                    clearTimeout(timeout);
                    const changes = monthlyChanges[monthKey];
                    if (changes) {
                        financialDataService.saveMonthlyData(currentUserId, monthKey, changes as any, currentBranchId)
                            .catch(console.error);
                    }
                });
                Object.entries(dailyTimeouts).forEach(([dayKey, timeout]) => {
                    clearTimeout(timeout);
                    const amount = dailyChanges[dayKey];
                    if (amount !== undefined) {
                        financialDataService.saveDailyData(currentUserId, dayKey, { dailyExpense: amount }, currentBranchId)
                            .catch(console.error);
                    }
                });
            }
            monthlySaveTimeouts.current = {};
            pendingMonthlyChanges.current = {};
            dailyExpenseSaveTimeouts.current = {};
            pendingDailyExpenseChanges.current = {};
        };
    }, [branchId, userId]);
    const updateLabel = useCallback((key: keyof RevenueLabels, value: string) => {
        setLabels(prev => ({ ...prev, [key]: value }));
        const baseKey = key === 'interventionsLabel' ? 'revenueLabel_interventions' : 'revenueLabel_other';
        localStorage.setItem(`${baseKey}${branchId ? `_${branchId}` : ''}`, value);
        if (userId) {
            pendingLabelChanges.current[key] = value;
            if (labelsSaveTimeout.current) {
                clearTimeout(labelsSaveTimeout.current);
            }
            labelsSaveTimeout.current = setTimeout(() => {
                const changes = pendingLabelChanges.current;
                pendingLabelChanges.current = {};
                labelsSaveTimeout.current = null;
                if (changes) {
                    financialDataService.saveLabels(userId, changes, branchId)
                        .then(() => console.log('Saved labels'))
                        .catch(console.error);
                }
            }, 1000);
        }
    }, [userId, branchId]);
    // تنظيف جميع الـ timeouts المعلقة عند إلغاء تحميل المكون
    useEffect(() => {
        return () => {
            Object.values(monthlySaveTimeouts.current).forEach(clearTimeout);
            Object.values(dailyExpenseSaveTimeouts.current).forEach(clearTimeout);
            if (labelsSaveTimeout.current) clearTimeout(labelsSaveTimeout.current);
        };
    }, []);
    return {
        monthlyExpenses,
        updateMonthlyExpense,
        dailyRevenue,
        dailyExpense,
        updateDailyExpense: updateDailyExpenseHandler,
        labels,
        updateLabel,
        dailyInsuranceExtras,
        lastSyncTime
    };
};

