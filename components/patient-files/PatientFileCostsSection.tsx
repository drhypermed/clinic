/**
 * PatientFileCostsSection:
 * قسم "تكاليف أخرى" في ملف المريض — يدمج الكاش + مطالبات التأمين ويغذي
 * التقارير المالية تلقائيًا. بعد التقسيم أصبح المكوّن الرئيسي خفيفًا:
 * - useCostInvoiceSelection: إدارة اختيارات الفاتورة.
 * - CostFormPanel / InsuranceFormPanel: نماذج الإدخال.
 * - CashCostList / InsuranceClaimsList / InvoiceSelectionPanel: عرض القوائم.
 */
import React, { useEffect, useRef, useState } from 'react';
import { LoadingText } from '../ui/LoadingText';
import type { PatientFileData } from './patientFilesShared';
import {
  insuranceService,
  resolvePatientSharePercentForBranch,
  type InsuranceCompany,
} from '../../services/insuranceService';
import {
  type PatientCostItem,
  type PatientInsuranceItem,
  loadPatientFileCosts,
  loadPatientFileInsurance,
  syncCostsToFirestore,
  subscribeToPatientFileCosts,
} from '../../services/patientCostService';
import {
  getTodayDateKey,
  handleDeleteCostOperation,
  handleDeleteInsuranceOperation,
  handleSaveCostOperation,
  handleSaveInsuranceOperation,
} from './patient-file-costs/costsHandlers';
import { usePrescriptionSettings } from '../../hooks/usePrescriptionSettings';
import { useCostInvoiceSelection } from './patient-file-costs/useCostInvoiceSelection';
import { CostFormPanel } from './patient-file-costs/CostFormPanel';
import { InsuranceFormPanel } from './patient-file-costs/InsuranceFormPanel';
import {
  CashCostList,
  InsuranceClaimsList,
  InvoiceSelectionPanel,
} from './patient-file-costs/CostItemsLists';

interface PatientFileCostsSectionProps {
  patientFile: PatientFileData | null;
  userId: string | undefined;
  /** الفرع النشط — يُستخدم لفصل العناصر الجديدة عن بعضها بين الفروع */
  branchId?: string;
}

export const PatientFileCostsSection: React.FC<PatientFileCostsSectionProps> = ({
  patientFile,
  userId,
  branchId,
}) => {
  const { settings: rxSettings } = usePrescriptionSettings(userId || null);
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [costItems, setCostItems] = useState<PatientCostItem[]>([]);
  const [insuranceItems, setInsuranceItems] = useState<PatientInsuranceItem[]>([]);
  const [isCostSectionOpen, setIsCostSectionOpen] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);

  // نموذج تكلفة الكاش
  const [showAddCost, setShowAddCost] = useState(false);
  const [costFormAmount, setCostFormAmount] = useState('');
  const [costFormDate, setCostFormDate] = useState<string>(getTodayDateKey);
  const [costFormType, setCostFormType] = useState<'interventions' | 'other'>('interventions');
  const [costFormNote, setCostFormNote] = useState('');
  const [editingCostId, setEditingCostId] = useState<string | null>(null);

  // نموذج مطالبة التأمين
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [insFormCompanyId, setInsFormCompanyId] = useState('');
  const [insFormAmount, setInsFormAmount] = useState('');
  const [insFormDate, setInsFormDate] = useState<string>(getTodayDateKey);
  const [insFormType, setInsFormType] = useState<'interventions' | 'other'>('interventions');
  const [insFormMembership, setInsFormMembership] = useState('');
  const [insFormApproval, setInsFormApproval] = useState('');
  const [insFormNote, setInsFormNote] = useState('');
  // نسبة تحمل المريض % — بتتعبأ افتراضياً من الشركة، الطبيب يقدر يعدّلها
  const [insFormSharePercent, setInsFormSharePercent] = useState('');
  const [editingInsId, setEditingInsId] = useState<string | null>(null);

  // حالة لوحة اختيار بنود الفاتورة
  const [showInvoiceSelection, setShowInvoiceSelection] = useState(false);

  // منطق الفاتورة (اختيار بنود + طباعة) مستخرج في hook منفصل
  const {
    dateGroups,
    selectedCostIds,
    selectedInsIds,
    selectedCount,
    toggleItem,
    toggleDay,
    resetSelections,
    handlePrintCostsInvoice,
  } = useCostInvoiceSelection({ costItems, insuranceItems, patientFile, rxSettings });

  // الاشتراك في شركات التأمين من Firestore
  useEffect(() => {
    if (!userId) return;
    const unsub = insuranceService.subscribeToCompanies(userId, setInsuranceCompanies);
    return () => unsub();
  }, [userId]);

  // إعادة تهيئة كل الحالة عند تغيير ملف المريض
  useEffect(() => {
    setIsCostSectionOpen(false);
    setCostItems([]);
    setInsuranceItems([]);
    setCostError(null);
    setShowAddCost(false);
    setCostFormAmount('');
    setCostFormDate(getTodayDateKey());
    setCostFormType('interventions');
    setCostFormNote('');
    setEditingCostId(null);
    setShowAddInsurance(false);
    setInsFormCompanyId('');
    setInsFormAmount('');
    setInsFormDate(getTodayDateKey());
    setInsFormType('interventions');
    setInsFormMembership('');
    setInsFormApproval('');
    setInsFormNote('');
    setInsFormSharePercent('');
    setEditingInsId(null);
    setShowInvoiceSelection(false);
    resetSelections();
  }, [patientFile?.fileId, resetSelections]);

  // ─── مزامنة لحظية مع Firestore (onSnapshot) ─────────────────────────
  // يبدأ الاشتراك عند فتح القسم ويُلغى عند إغلاقه أو تغيير ملف المريض
  const didReceiveFirstSnapshotRef = useRef(false);
  useEffect(() => {
    if (!isCostSectionOpen || !userId || !patientFile?.fileId) return;
    const fileId = patientFile.fileId;
    setIsLoadingCosts(true);
    didReceiveFirstSnapshotRef.current = false;

    // cancelled flag: يمنع أي استجابة متأخرة من تحديث state بعد cleanup
    // (لو اتغيّر fileId أو اتقفل القسم والاستجابة لسه على الطريق).
    let cancelled = false;

    // مؤقت أمان: إذا لم يستجب Firestore خلال 5 ثوانٍ → اعرض البيانات المحلية
    const safetyTimer = setTimeout(() => {
      if (cancelled) return;
      if (!didReceiveFirstSnapshotRef.current) {
        didReceiveFirstSnapshotRef.current = true;
        const localCosts = loadPatientFileCosts(fileId);
        const localIns = loadPatientFileInsurance(fileId);
        setCostItems(localCosts);
        setInsuranceItems(localIns);
        setIsLoadingCosts(false);
      }
    }, 5000);

    const unsubscribe = subscribeToPatientFileCosts(
      userId,
      fileId,
      (firestoreCosts, firestoreIns) => {
        if (cancelled) return;
        clearTimeout(safetyTimer);
        if (!didReceiveFirstSnapshotRef.current) {
          didReceiveFirstSnapshotRef.current = true;
          setIsLoadingCosts(false);
          // Firestore فارغة لكن localStorage يحتوي بيانات → ارفعها للسحابة واعرضها
          if (firestoreCosts.length === 0 && firestoreIns.length === 0) {
            const localCosts = loadPatientFileCosts(fileId);
            const localIns = loadPatientFileInsurance(fileId);
            if (localCosts.length > 0 || localIns.length > 0) {
              setCostItems(localCosts);
              setInsuranceItems(localIns);
              syncCostsToFirestore(userId, fileId, localCosts, localIns)
                .catch((err) => console.error('Costs sync error:', err));
              return;
            }
          }
        }
        setCostItems(firestoreCosts);
        setInsuranceItems(firestoreIns);
      },
    );

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [isCostSectionOpen, userId, patientFile?.fileId]);

  // ─── Auto-fill نسبة تحمل المريض من الشركة عند اختيارها ──────────────
  // مفعّل فقط أثناء "إضافة" (مش "تعديل") عشان منغيّرش نسبة محفوظة قديماً
  useEffect(() => {
    if (editingInsId) return;
    if (!insFormCompanyId) {
      setInsFormSharePercent('');
      return;
    }
    const company = insuranceCompanies.find((c) => c.id === insFormCompanyId);
    if (!company) return;
    // ناخد نسبة الفرع لو فيها override، وإلا الـ default للشركة
    const share = resolvePatientSharePercentForBranch(company, branchId);
    setInsFormSharePercent(String(share));
  }, [insFormCompanyId, insuranceCompanies, branchId, editingInsId]);

  // ─── handlers العمليات (حفظ / حذف / بدء تعديل) ──────────────────────
  const handleSaveCost = () => {
    handleSaveCostOperation({
      fileId: patientFile?.fileId,
      patientName: patientFile?.name ?? '',
      costFormAmount,
      costFormDate,
      costFormType,
      costFormNote,
      editingCostId,
      costItems,
      insuranceItems,
      userId,
      branchId,
      setCostItems,
      setCostError,
      setEditingCostId,
      resetCostForm: () => {
        setCostFormAmount('');
        setCostFormNote('');
        setShowAddCost(false);
      },
    });
  };

  const handleDeleteCost = (itemId: string) => {
    handleDeleteCostOperation({
      fileId: patientFile?.fileId,
      itemId,
      costItems,
      insuranceItems,
      userId,
      branchId,
      setCostItems,
    });
  };

  const startEditCost = (item: PatientCostItem) => {
    setEditingCostId(item.id);
    setCostFormAmount(item.amount.toString());
    setCostFormDate(item.dateKey);
    setCostFormType(item.type);
    setCostFormNote(item.note ?? '');
    setShowAddCost(true);
    setShowAddInsurance(false);
  };

  const handleSaveInsurance = () => {
    handleSaveInsuranceOperation({
      fileId: patientFile?.fileId,
      patientName: patientFile?.name ?? '',
      insFormCompanyId,
      insFormAmount,
      insFormDate,
      insFormType,
      insFormMembership,
      insFormApproval,
      insFormNote,
      insFormSharePercent,
      editingInsId,
      costItems,
      insuranceItems,
      insuranceCompanies,
      userId,
      branchId,
      setInsuranceItems,
      setCostError,
      setEditingInsId,
      resetInsForm: () => {
        setInsFormCompanyId('');
        setInsFormAmount('');
        setInsFormMembership('');
        setInsFormApproval('');
        setInsFormNote('');
        setInsFormSharePercent('');
        setShowAddInsurance(false);
      },
    });
  };

  const handleDeleteInsurance = (itemId: string) => {
    handleDeleteInsuranceOperation({
      fileId: patientFile?.fileId,
      itemId,
      costItems,
      insuranceItems,
      userId,
      branchId,
      setInsuranceItems,
    });
  };

  const startEditInsurance = (item: PatientInsuranceItem) => {
    setEditingInsId(item.id);
    const company = insuranceCompanies.find(
      (c) => c.id === item.companyId || c.name === item.companyName,
    );
    setInsFormCompanyId(company?.id ?? '');
    setInsFormAmount(item.amount.toString());
    setInsFormDate(item.dateKey);
    setInsFormType(item.type);
    setInsFormMembership(item.insuranceMembershipId ?? '');
    setInsFormApproval(item.insuranceApprovalCode ?? '');
    setInsFormNote(item.note ?? '');
    // عند التعديل: نستخدم النسبة المحفوظة، أو نسبة الشركة لو العنصر قديم بدون قيمة
    setInsFormSharePercent(
      typeof item.patientSharePercent === 'number'
        ? String(item.patientSharePercent)
        : company
          ? String(resolvePatientSharePercentForBranch(company, branchId))
          : '',
    );
    setShowAddInsurance(true);
    setShowAddCost(false);
  };

  if (!patientFile) return null;

  return (
    <div className="dh-day-shell rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="dh-day-head px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-black text-white">تكاليف أخرى</div>
            <div className="text-[11px] font-medium text-brand-100 mt-0.5">
              تداخلات ودخل آخر كاش + مطالبات تأمين — تُغذِّي التقارير المالية تلقائيًا
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCostSectionOpen((v) => !v)}
            className="shrink-0 rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-white/25"
          >
            {isCostSectionOpen ? 'إغلاق' : 'عرض / إضافة'}
          </button>
        </div>
        {(costItems.length > 0 || insuranceItems.length > 0) && !isCostSectionOpen && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {costItems.length > 0 && (
              <span className="inline-flex items-center bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black">
                {costItems.length} تكلفة كاش
              </span>
            )}
            {insuranceItems.length > 0 && (
              <span className="inline-flex items-center bg-slate-200/30 border border-slate-400/40 text-slate-100 rounded-full px-2.5 py-0.5 text-[11px] font-black">
                {insuranceItems.length} مطالبة تأمين
              </span>
            )}
          </div>
        )}
      </div>

      {isCostSectionOpen && (
        <div className="bg-white px-3 py-3 space-y-3">
          {isLoadingCosts && (
            <div className="py-4 text-center text-xs text-slate-400 font-black">
              <LoadingText>جاري تحميل البيانات</LoadingText>
            </div>
          )}
          {costError && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] font-black text-danger-700">
              {costError}
            </div>
          )}

          {/* أزرار الإجراءات: إضافة كاش / تأمين / طباعة فاتورة */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddCost((v) => !v);
                setShowAddInsurance(false);
                setEditingCostId(null);
                setCostFormAmount('');
                setCostFormNote('');
                setCostFormDate(getTodayDateKey());
                setCostFormType('interventions');
                setCostError(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-brand-700"
            >
              + إضافة تكلفة كاش
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddInsurance((v) => !v);
                setShowAddCost(false);
                setEditingInsId(null);
                setInsFormCompanyId('');
                setInsFormAmount('');
                setInsFormDate(getTodayDateKey());
                setInsFormType('interventions');
                setInsFormMembership('');
                setInsFormApproval('');
                setInsFormNote('');
                setInsFormSharePercent('');
                setCostError(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-slate-700"
            >
              + إضافة مطالبة تأمين
            </button>
            {(costItems.length > 0 || insuranceItems.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceSelection((v) => !v);
                  setShowAddCost(false);
                  setShowAddInsurance(false);
                  if (!showInvoiceSelection) {
                    resetSelections();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-brand-700"
              >
                {showInvoiceSelection ? 'إلغاء طباعة الفاتورة' : 'طباعة فاتورة'}
              </button>
            )}
          </div>

          {/* لوحة اختيار بنود الفاتورة */}
          {showInvoiceSelection && (
            <InvoiceSelectionPanel
              dateGroups={dateGroups}
              selectedCostIds={selectedCostIds}
              selectedInsIds={selectedInsIds}
              selectedCount={selectedCount}
              onToggleItem={toggleItem}
              onToggleDay={toggleDay}
              onPrint={handlePrintCostsInvoice}
            />
          )}

          {/* نموذج تكلفة الكاش */}
          {showAddCost && (
            <CostFormPanel
              editingCostId={editingCostId}
              costFormDate={costFormDate}
              costFormAmount={costFormAmount}
              costFormType={costFormType}
              costFormNote={costFormNote}
              setCostFormDate={setCostFormDate}
              setCostFormAmount={setCostFormAmount}
              setCostFormType={setCostFormType}
              setCostFormNote={setCostFormNote}
              onCancel={() => {
                setShowAddCost(false);
                setEditingCostId(null);
              }}
              onSave={handleSaveCost}
            />
          )}

          {/* نموذج مطالبة التأمين */}
          {showAddInsurance && (
            <InsuranceFormPanel
              editingInsId={editingInsId}
              insuranceCompanies={insuranceCompanies}
              insFormCompanyId={insFormCompanyId}
              insFormDate={insFormDate}
              insFormAmount={insFormAmount}
              insFormType={insFormType}
              insFormMembership={insFormMembership}
              insFormApproval={insFormApproval}
              insFormNote={insFormNote}
              insFormSharePercent={insFormSharePercent}
              setInsFormCompanyId={setInsFormCompanyId}
              setInsFormDate={setInsFormDate}
              setInsFormAmount={setInsFormAmount}
              setInsFormType={setInsFormType}
              setInsFormMembership={setInsFormMembership}
              setInsFormApproval={setInsFormApproval}
              setInsFormNote={setInsFormNote}
              setInsFormSharePercent={setInsFormSharePercent}
              onCancel={() => {
                setShowAddInsurance(false);
                setEditingInsId(null);
              }}
              onSave={handleSaveInsurance}
            />
          )}

          {/* قوائم العرض */}
          <CashCostList items={costItems} onEdit={startEditCost} onDelete={handleDeleteCost} />
          <InsuranceClaimsList
            items={insuranceItems}
            onEdit={startEditInsurance}
            onDelete={handleDeleteInsurance}
          />

          {costItems.length === 0 &&
            insuranceItems.length === 0 &&
            !isLoadingCosts &&
            !showAddCost &&
            !showAddInsurance && (
              <div className="py-4 text-center text-xs text-slate-400 font-bold">
                لا توجد تكاليف مسجَّلة لهذا المريض
              </div>
            )}
        </div>
      )}
    </div>
  );
};
