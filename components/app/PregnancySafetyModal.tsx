// ═══════════════════════════════════════════════════════════════════════════
// نافذة فحص الدواء أثناء الحمل والرضاعة (Pregnancy + Lactation Safety Modal)
// ───────────────────────────────────────────────────────────────────────────
// نافذة متعددة المراحل:
//   المرحلة 1 (selection): تعرض قائمة الأدوية من الروشتة — الطبيب يختار
//     واحد / أكتر / الكل باستخدام checkboxes.
//   المرحلة 2 (loading): جاري الفحص.
//   المرحلة 3 (result): بطاقة علمية مختصرة لكل دواء:
//     - اسم الدواء + شارة المستوى العام (آمن/حذر/تجنب/ممنوع)
//     - FDA Category (الحمل) + LactMed L1-L5 (الرضاعة)
//     - سطر واحد-اتنين فيهم السبب العلمي (≤20 كلمة)
//     - مصدر موثوق واحد-اتنين (FDA/LactMed/Briggs/ACOG)
// لا تحفظ أي حاجة — عرض فقط. الطبيب يقرأ ويقرر.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';
import type {
  PregnancyDrugAssessment,
  PregnancySafetyLevel,
  PregnancySafetyResult,
  RiskTrimester,
} from '../../services/geminiPregnancySafetyService';

interface PregnancySafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** قائمة أسماء الأدوية من الروشتة (تُستخدم في مرحلة الاختيار) */
  availableDrugs: string[];
  /** نتيجة الفحص — null قبل ما يضغط "فحص"، وأثناء التحميل */
  result: PregnancySafetyResult | null;
  loading: boolean;
  /** يستدعى عند الضغط على زر "ابدأ الفحص" بقائمة الأدوية المختارة */
  onStartCheck: (selectedDrugs: string[]) => void;
  /** يُمسح عند الإغلاق لإعادة البدء في المرة القادمة */
  onReset: () => void;
}

// ─── تصميم مستوى السلامة ─────────────────────────────────────────────────
interface LevelStyle {
  labelAr: string;
  bg: string;
  border: string;
  badge: string;
  text: string;
  order: number;
  icon: React.ReactNode;
}

const LEVEL_STYLES: Record<PregnancySafetyLevel, LevelStyle> = {
  contraindicated: {
    labelAr: 'ممنوع تماماً',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    badge: 'bg-rose-600 text-white',
    text: 'text-rose-900',
    order: 1,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M5 5l14 14" />
      </svg>
    ),
  },
  avoid: {
    labelAr: 'يُفضّل التجنب',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-500 text-white',
    text: 'text-orange-900',
    order: 2,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
  caution: {
    labelAr: 'بحذر',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    badge: 'bg-amber-500 text-white',
    text: 'text-amber-900',
    order: 3,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  safe: {
    labelAr: 'آمن',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badge: 'bg-emerald-500 text-white',
    text: 'text-emerald-900',
    order: 4,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

// ─── تسميات الثلث بالعربي ────────────────────────────────────────────────
const TRIMESTER_LABELS: Record<RiskTrimester, string> = {
  first: 'الثلث الأول',
  second: 'الثلث الثاني',
  third: 'الثلث الثالث',
  all: 'طوال الحمل',
  unknown: 'غير محدد',
};

// ─── بطاقة تقييم دواء واحد (مختصرة — سطر سبب + مصدر) ──────────────────────
const AssessmentCard: React.FC<{ item: PregnancyDrugAssessment }> = ({ item }) => {
  const style = LEVEL_STYLES[item.level];
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-3 shadow-sm`}>
      {/* شريط علوي: أيقونة + اسم + شارات التصنيف (حمل + رضاعة) */}
      <div className="flex items-start gap-2 mb-1.5">
        <span className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg ${style.badge} shadow-sm`}>
          {style.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            {/* اسم الدواء */}
            <h3 className="font-black text-slate-900 text-[0.92rem] leading-tight">{item.drugName}</h3>
            {/* شارة المستوى العام */}
            <span className={`inline-flex items-center px-1.5 py-[1px] rounded-full text-[9.5px] font-black tracking-wide ${style.badge} shadow-sm`}>
              {style.labelAr}
            </span>
            {/* تصنيف الحمل (FDA) — لون داكن مميز */}
            {item.fdaCategory && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[9.5px] font-black tracking-wide bg-slate-800 text-white"
                title="تصنيف الحمل حسب FDA"
              >
                حمل FDA {item.fdaCategory}
              </span>
            )}
            {/* تصنيف الرضاعة (LactMed L1-L5) — لون هادي مختلف */}
            {item.lactationCategory && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[9.5px] font-black tracking-wide bg-indigo-700 text-white"
                title="تصنيف الرضاعة حسب LactMed/Hale"
              >
                رضاعة {item.lactationCategory}
              </span>
            )}
            {/* الثلث الأخطر — يظهر فقط لو فيه خطر محدد */}
            {item.riskTrimester !== 'unknown' && item.level !== 'safe' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {TRIMESTER_LABELS[item.riskTrimester]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* السبب العلمي المختصر — سطر أو سطرين كحد أقصى */}
      {item.evidence && (
        <p className={`${style.text} text-[0.82rem] leading-snug`}>
          {item.evidence}
        </p>
      )}

      {/* المصادر الموثوقة (FDA / LactMed / Briggs / ACOG) */}
      {item.references.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className="text-[10px] text-slate-500 font-bold">المصدر:</span>
          {item.references.map((ref, i) => (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-[1px] rounded-md text-[10px] font-bold bg-white/80 text-slate-700 border border-slate-200"
            >
              {ref}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── المكون الرئيسي ─────────────────────────────────────────────────────
export const PregnancySafetyModal: React.FC<PregnancySafetyModalProps> = ({
  isOpen,
  onClose,
  availableDrugs,
  result,
  loading,
  onStartCheck,
  onReset,
}) => {
  // state محلي للاختيار — Set لأداء أسرع في toggle
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // لما المودال يتقفل نمسح الاختيار + نـ reset الحالة الخارجية
  React.useEffect(() => {
    if (!isOpen) {
      setSelected(new Set());
    }
  }, [isOpen]);

  // لما الأدوية المتاحة تتغير (الطبيب ضاف/شال دواء من الروشتة)
  // نمسح أي اختيار لدواء مش موجود دلوقتي
  React.useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      const available = new Set(availableDrugs);
      prev.forEach((d) => {
        if (available.has(d)) next.add(d);
      });
      return next;
    });
  }, [availableDrugs]);

  const toggleDrug = (drug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(drug)) next.delete(drug);
      else next.add(drug);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(availableDrugs));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const handleStartCheck = () => {
    if (selected.size === 0) return;
    onStartCheck(Array.from(selected));
  };

  const handleClose = () => {
    onReset();
    onClose();
  };

  const handleBackToSelection = () => {
    onReset();
  };

  // ترتيب التقييمات من الأخطر للآمن
  const sortedAssessments = React.useMemo(() => {
    if (!result?.assessments) return [];
    return [...result.assessments].sort(
      (a, b) => LEVEL_STYLES[a.level].order - LEVEL_STYLES[b.level].order,
    );
  }, [result]);

  // تحديد المرحلة الحالية
  const inResultPhase = !loading && result !== null;
  const inLoadingPhase = loading;
  const inSelectionPhase = !loading && result === null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={handleClose}
      animateIn="both"
      backdropClass="bg-slate-900/60 backdrop-blur-sm"
      overlayClassName="p-2 sm:p-4"
      contentClassName="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
      labelledBy="pregnancy-safety-modal-title"
    >
      {/* ─── الهيدر الذهبي البريميوم ─── */}
      <div className="relative overflow-hidden bg-gradient-to-l from-amber-500 via-yellow-500 to-amber-600 px-5 py-4 text-amber-950">
        <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="absolute -top-1/2 -left-full h-[200%] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[dh-btn-shine_4s_ease-in-out_infinite]" />
        </span>
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25 ring-1 ring-white/50 shadow-inner">
              {/* أيقونة: حامل — امرأة مع قلب */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2.5" />
                <path d="M9 11a3 3 0 016 0v3a5 5 0 01-1 3.5" />
                <path d="M12 15c-2 1.5-3 3-3 5" />
                <path d="M14 18c.8-.6 1.5-1.4 2-2.4" />
              </svg>
            </span>
            <div>
              <h2 id="pregnancy-safety-modal-title" className="text-lg sm:text-xl font-black leading-tight">
                فحص الدواء أثناء الحمل والرضاعة
              </h2>
              <p className="text-xs sm:text-[13px] font-bold mt-0.5 opacity-90">
                {inSelectionPhase && 'اختر الأدوية المراد فحصها'}
                {inLoadingPhase && `جاري فحص ${selected.size} دواء…`}
                {inResultPhase && `تم فحص ${sortedAssessments.length} دواء`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 hover:bg-white/40 active:scale-95 transition text-amber-950"
            aria-label="إغلاق"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── المحتوى ─── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 bg-slate-50/70">
        {/* ─── مرحلة الاختيار ─── */}
        {inSelectionPhase && (
          <>
            {availableDrugs.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-2">
                  <svg className="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <p className="text-amber-900 font-bold text-sm">
                  لا توجد أدوية في الروشتة. اكتب على الأقل دواء واحد ثم افتح الفحص.
                </p>
              </div>
            ) : (
              <>
                {/* شريط أدوات: اختر الكل / امسح */}
                <div className="flex items-center justify-between gap-2 mb-3 px-1">
                  <span className="text-slate-700 text-xs font-bold">
                    {selected.size > 0 ? `تم اختيار ${selected.size} من ${availableDrugs.length}` : `${availableDrugs.length} دواء متاح`}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition active:scale-95"
                    >
                      اختر الكل
                    </button>
                    {selected.size > 0 && (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition active:scale-95"
                      >
                        مسح
                      </button>
                    )}
                  </div>
                </div>

                {/* قائمة الأدوية مع checkboxes */}
                <div className="flex flex-col gap-2">
                  {availableDrugs.map((drug) => {
                    const isChecked = selected.has(drug);
                    return (
                      <label
                        key={drug}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 cursor-pointer transition active:scale-[0.99] ${
                          isChecked
                            ? 'border-amber-400 bg-amber-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDrug(drug)}
                          className="sr-only"
                        />
                        {/* checkbox مخصص */}
                        <span
                          className={`shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md border-2 transition ${
                            isChecked
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={`flex-1 text-[0.92rem] font-bold ${isChecked ? 'text-amber-900' : 'text-slate-800'}`}>
                          {drug}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ─── مرحلة التحميل ─── */}
        {inLoadingPhase && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative w-14 h-14 mb-3">
              <span className="absolute inset-0 rounded-full border-4 border-amber-200" />
              <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin" />
            </div>
            <p className="text-slate-700 font-bold text-sm">جاري مراجعة الأدلة العلمية…</p>
            <p className="text-slate-500 text-xs mt-1">FDA · ACOG · Briggs · LactMed</p>
          </div>
        )}

        {/* ─── مرحلة النتيجة ─── */}
        {inResultPhase && result && (
          <>
            {result.insufficientData ? (
              <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-center">
                <p className="text-amber-900 font-bold text-sm">
                  {result.insufficientDataNote || 'تعذّر إجراء الفحص. حاول مرة أخرى.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* ملخص عام */}
                {result.overallSummaryAr && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                      </span>
                      <p className="text-slate-800 text-[0.88rem] leading-relaxed font-medium">
                        {result.overallSummaryAr}
                      </p>
                    </div>
                  </div>
                )}

                {/* بطاقات التقييم */}
                {sortedAssessments.map((item, idx) => (
                  <AssessmentCard key={`${item.drugName}-${idx}`} item={item} />
                ))}

                {/* تنبيه قانوني بسيط */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold">ملاحظة: </span>
                  التقييم مستند على المراجع الطبية المعتمدة للمساعدة الإكلينيكية فقط، والقرار النهائي للطبيب المعالج.
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── الفوتر: أزرار مختلفة حسب المرحلة ─── */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex justify-between items-center gap-2">
        {inSelectionPhase && (
          <>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition active:scale-[0.98]"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleStartCheck}
              disabled={selected.size === 0 || availableDrugs.length === 0}
              className="relative px-5 py-2 rounded-xl gold-premium-btn font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="gold-premium-shimmer" aria-hidden />
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ابدأ الفحص ({selected.size})
              </span>
            </button>
          </>
        )}

        {inLoadingPhase && (
          <button
            type="button"
            disabled
            className="w-full px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm cursor-not-allowed"
          >
            جاري الفحص…
          </button>
        )}

        {inResultPhase && (
          <>
            <button
              type="button"
              onClick={handleBackToSelection}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition active:scale-[0.98]"
            >
              فحص أدوية أخرى
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition active:scale-[0.98]"
            >
              تمام — إغلاق
            </button>
          </>
        )}
      </div>
    </ModalOverlay>
  );
};
