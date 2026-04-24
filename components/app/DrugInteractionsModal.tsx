// ═══════════════════════════════════════════════════════════════════════════
// نافذة عرض نتيجة فحص التداخلات الدوائية (Drug Interactions Modal)
// ───────────────────────────────────────────────────────────────────────────
// تعرض نتيجة فحص التداخلات بين الأدوية المكتوبة في الروشتة:
//   1) قائمة التداخلات مجمعة حسب الخطورة (contraindicated → major → moderate → minor)
//   2) ملخص عام مختصر
//   3) حالة "لا يوجد تداخلات" بشكل واضح لما الأدوية تكون آمنة مع بعض
// لا تحفظ أي حاجة — عرض فقط. الطبيب يقرأها ويقرر.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';
import type {
  DrugInteraction,
  DrugInteractionsResult,
  InteractionSeverity,
} from '../../services/geminiDrugInteractionsService';

interface DrugInteractionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DrugInteractionsResult | null; // null = جاري التحميل
  loading: boolean;
  drugCount: number; // عدد الأدوية اللي اتبعتت للفحص (للعرض في الهيدر)
}

// ─── تصميم الـ severity — كل مستوى له لون + أيقونة + تسمية عربية ──────────
interface SeverityStyle {
  labelAr: string;
  bg: string;
  border: string;
  iconBg: string;
  text: string;
  order: number; // للترتيب من الأخطر للأخف
}

const SEVERITY_STYLES: Record<InteractionSeverity, SeverityStyle> = {
  contraindicated: {
    labelAr: 'ممنوع',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    iconBg: 'bg-rose-600 text-white',
    text: 'text-rose-900',
    order: 1,
  },
  major: {
    labelAr: 'خطر كبير',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    iconBg: 'bg-orange-500 text-white',
    text: 'text-orange-900',
    order: 2,
  },
  moderate: {
    labelAr: 'متوسط',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    iconBg: 'bg-amber-500 text-white',
    text: 'text-amber-900',
    order: 3,
  },
  minor: {
    labelAr: 'بسيط',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    iconBg: 'bg-sky-500 text-white',
    text: 'text-sky-900',
    order: 4,
  },
};

// ─── بطاقة تداخل واحد ────────────────────────────────────────────────────
const InteractionCard: React.FC<{ item: DrugInteraction; index: number }> = ({ item, index }) => {
  const style = SEVERITY_STYLES[item.severity];
  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-3.5 shadow-sm`}>
      <div className="flex items-start gap-2.5">
        {/* دائرة رقم + أيقونة الخطورة */}
        <span className={`shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full ${style.iconBg} font-black text-sm shadow-sm`}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          {/* شريط علوي: اسم الدواءين + شارة الخطورة */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="font-bold text-slate-900 text-[0.95rem]">{item.drugA}</span>
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 17l-5-5 5-5M16 7l5 5-5 5M3 12h18" />
            </svg>
            <span className="font-bold text-slate-900 text-[0.95rem]">{item.drugB}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${style.iconBg} shadow-sm`}>
              {style.labelAr}
            </span>
          </div>
          {/* الآلية */}
          {item.mechanism && (
            <div className={`${style.text} text-[0.82rem] leading-relaxed`}>
              <span className="font-bold">الآلية: </span>
              <span>{item.mechanism}</span>
            </div>
          )}
          {/* التوصية */}
          {item.recommendation && (
            <div className={`${style.text} text-[0.82rem] leading-relaxed mt-1`}>
              <span className="font-bold">التوصية: </span>
              <span>{item.recommendation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── المكون الرئيسي ──────────────────────────────────────────────────────
export const DrugInteractionsModal: React.FC<DrugInteractionsModalProps> = ({
  isOpen,
  onClose,
  result,
  loading,
  drugCount,
}) => {
  // ترتيب التداخلات من الأخطر للأخف
  const sortedInteractions = React.useMemo(() => {
    if (!result?.interactions) return [];
    return [...result.interactions].sort(
      (a, b) => SEVERITY_STYLES[a.severity].order - SEVERITY_STYLES[b.severity].order,
    );
  }, [result]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      animateIn="both"
      backdropClass="bg-slate-900/60 backdrop-blur-sm"
      overlayClassName="p-2 sm:p-4"
      contentClassName="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
      labelledBy="drug-interactions-modal-title"
    >
      {/* ─── الهيدر الذهبي البريميوم ─── */}
      <div className="relative overflow-hidden bg-gradient-to-l from-amber-500 via-yellow-500 to-amber-600 px-5 py-4 text-amber-950">
        {/* shimmer ذهبي خلفي */}
        <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="absolute -top-1/2 -left-full h-[200%] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[dh-btn-shine_4s_ease-in-out_infinite]" />
        </span>
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25 ring-1 ring-white/50 shadow-inner">
              {/* أيقونة: كبسولتين متقاطعتين (تداخل) */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10.5 20.5a4.95 4.95 0 01-7-7l7-7a4.95 4.95 0 017 7l-7 7z" />
                <path d="M8.5 8.5l7 7" />
              </svg>
            </span>
            <div>
              <h2 id="drug-interactions-modal-title" className="text-lg sm:text-xl font-black leading-tight">
                فحص التداخلات الدوائية
              </h2>
              <p className="text-xs sm:text-[13px] font-bold mt-0.5 opacity-90">
                {loading
                  ? `جاري فحص ${drugCount} دواء…`
                  : `تم فحص ${drugCount} دواء`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 hover:bg-white/40 active:scale-95 transition text-amber-950"
            aria-label="إغلاق"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── المحتوى: scroll عمودي ─── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 bg-slate-50/70">
        {/* حالة التحميل */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative w-14 h-14 mb-3">
              <span className="absolute inset-0 rounded-full border-4 border-amber-200" />
              <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin" />
            </div>
            <p className="text-slate-700 font-bold text-sm">الذكاء الاصطناعي بيفحص التداخلات…</p>
            <p className="text-slate-500 text-xs mt-1">ثواني ومعاك النتيجة</p>
          </div>
        )}

        {/* حالة البيانات غير كافية / خطأ */}
        {!loading && result?.insufficientData && (
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-2">
              <svg className="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-amber-900 font-bold text-sm">
              {result.insufficientDataNote || 'محتاج على الأقل دوائين في الروشتة.'}
            </p>
          </div>
        )}

        {/* حالة "لا يوجد تداخلات" */}
        {!loading && result && !result.insufficientData && !result.hasInteractions && (
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white mb-2 shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-900 font-black text-base mb-1">لا توجد تداخلات ذات أهمية إكلينيكية</p>
            {result.summaryAr && (
              <p className="text-emerald-800 text-sm leading-relaxed">{result.summaryAr}</p>
            )}
          </div>
        )}

        {/* حالة: في تداخلات */}
        {!loading && result && result.hasInteractions && (
          <div className="flex flex-col gap-3">
            {/* ملخص عام */}
            {result.summaryAr && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </span>
                  <p className="text-slate-800 text-[0.88rem] leading-relaxed font-medium">
                    {result.summaryAr}
                  </p>
                </div>
              </div>
            )}

            {/* عدد التداخلات */}
            <div className="flex items-center gap-2 text-slate-600 text-xs font-bold px-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <span>تم اكتشاف {sortedInteractions.length} تداخل — مرتبة من الأخطر للأخف</span>
            </div>

            {/* بطاقات التداخلات */}
            {sortedInteractions.map((item, idx) => (
              <InteractionCard key={`${item.drugA}-${item.drugB}-${idx}`} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* ─── الفوتر: زر إغلاق واحد ─── */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition active:scale-[0.98]"
        >
          تمام — إغلاق
        </button>
      </div>
    </ModalOverlay>
  );
};
