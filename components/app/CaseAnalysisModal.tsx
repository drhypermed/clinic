// ═══════════════════════════════════════════════════════════════════════════
// نافذة تحليل الحالة المنبثقة (Case Analysis Modal)
// ───────────────────────────────────────────────────────────────────────────
// تعرض هذه النافذة نتيجة تحليل الذكاء الاصطناعي للحالة بتنسيق منظّم:
//   1) التشخيصات التفريقية (DDx) — أعلى 3 مع توضيح "الأكثر احتمالاً".
//   2) حالات لا يجب تفويتها (Must Not Miss) — ⚠️ للمكرر مع الـ DDx.
//   3) فحوصات مقترحة — زر إضافة لكل فحص (يروح للروشتة).
//   4) تعليمات هامة — زر إضافة لكل تعليمة (تروح للنصائح في الروشتة).
//   5) معلومات ناقصة + علامات خطر — عرض فقط.
//
// مهم: لا يُحفَظ أي شيء تلقائياً. فقط ما يضغط الطبيب زر "إضافة" قدامه يدخل
// الروشتة. عند الإغلاق بدون إضافة تشخيص، حقل التشخيص يبقى فارغاً مع
// placeholder "Dx" يلفت انتباه الطبيب لكتابته يدوياً.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';
import type { CaseAnalysisResult } from '../../services/geminiCaseAnalysisService';

interface CaseAnalysisModalProps {
  isOpen: boolean;                          // حالة فتح النافذة
  onClose: () => void;                      // زر الإغلاق / ESC / الخلفية
  result: CaseAnalysisResult | null;        // نتيجة التحليل (null = جاري التحميل)
  loading: boolean;                         // هل التحليل ما زال جارياً؟
  onAddDiagnosis: (diagnosisEn: string) => void;   // إضافة تشخيص لحقل Dx
  // إضافة فحص للروشتة — بيستقبل الاسم الإنجليزي والسبب العربي عشان
  // يتضافوا مع بعض في سطر واحد في الروشتة بصيغة: "CBC (سبب الطلب)"
  onAddInvestigation: (nameEn: string, reasonAr: string) => void;
  onAddInstruction: (textAr: string) => void;      // إضافة تعليمة للنصائح
  /** تتبع ما تمت إضافته عشان نعطّل الزر ونمنع التكرار */
  addedDiagnoses: string[];                 // أسماء DDx التي تمت إضافتها
  addedInvestigations: string[];            // أسماء فحوصات تمت إضافتها
  addedInstructions: string[];              // تعليمات تمت إضافتها
}

// ─── أيقونة قسم — SVG احترافية بدل الأرقام ──────────────────────────────
// كل قسم ليه أيقونة طبية مميزة عشان البريميوم يبان: stethoscope, shield, flask, sparkles, info, flag
type SectionIconKind = 'ddx' | 'must-not-miss' | 'investigations' | 'instructions' | 'missing' | 'red-flag';

const SECTION_ICON_PATHS: Record<SectionIconKind, React.ReactNode> = {
  // ddx: فرع متشعّب (تفريق) — يشبه مخطط قرار
  ddx: (
    <>
      <path d="M6 3v4a3 3 0 003 3h6a3 3 0 013 3v5" />
      <circle cx="6" cy="3" r="1.5" fill="currentColor" />
      <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      <circle cx="6" cy="14" r="1.5" fill="currentColor" />
      <path d="M6 10v2" />
    </>
  ),
  // must-not-miss: درع تحذير
  'must-not-miss': (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.6-8 9.5-4.6-.9-8-5-8-9.5V6l8-3z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" />
    </>
  ),
  // investigations: دورق/قارورة مختبر
  investigations: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a2 2 0 001.8 3h10.4a2 2 0 001.8-3l-5-9V3" />
      <path d="M8 14h8" />
    </>
  ),
  // instructions: ورقة تعليمات
  instructions: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  // missing: علامة استفهام في دائرة
  missing: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 3.5" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
    </>
  ),
  // red-flag: علم خطر
  'red-flag': (
    <>
      <path d="M5 21V4l12 3-3 4 3 4-12 3" />
    </>
  ),
};

interface SectionHeaderProps {
  icon: SectionIconKind;
  title: string;
  tone: 'violet' | 'rose' | 'blue' | 'emerald' | 'amber' | 'crimson';
  dir?: 'ltr' | 'rtl';
}

const SECTION_TONE: Record<SectionHeaderProps['tone'], { bg: string; ring: string; iconBg: string; iconText: string; text: string; border: string }> = {
  violet: {
    bg: 'bg-gradient-to-r from-violet-50/90 via-indigo-50/70 to-transparent',
    ring: 'ring-violet-100',
    iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',
    iconText: 'text-white',
    text: 'text-violet-900',
    border: 'border-violet-100/80',
  },
  rose: {
    bg: 'bg-gradient-to-r from-rose-50/90 via-red-50/70 to-transparent',
    ring: 'ring-rose-100',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
    iconText: 'text-white',
    text: 'text-rose-900',
    border: 'border-rose-100/80',
  },
  blue: {
    bg: 'bg-gradient-to-r from-sky-50/90 via-blue-50/70 to-transparent',
    ring: 'ring-sky-100',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    iconText: 'text-white',
    text: 'text-sky-900',
    border: 'border-sky-100/80',
  },
  emerald: {
    bg: 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-transparent',
    ring: 'ring-emerald-100',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconText: 'text-white',
    text: 'text-emerald-900',
    border: 'border-emerald-100/80',
  },
  amber: {
    bg: 'bg-gradient-to-r from-amber-50/90 via-yellow-50/70 to-transparent',
    ring: 'ring-amber-100',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconText: 'text-white',
    text: 'text-amber-900',
    border: 'border-amber-100/80',
  },
  crimson: {
    bg: 'bg-gradient-to-r from-red-100/95 via-rose-100/70 to-transparent',
    ring: 'ring-red-200',
    iconBg: 'bg-gradient-to-br from-red-600 to-rose-700',
    iconText: 'text-white',
    text: 'text-red-900',
    border: 'border-red-200/80',
  },
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, tone, dir = 'rtl' }) => {
  const style = SECTION_TONE[tone];
  return (
    <div className={`px-4 py-3.5 flex items-center gap-3 border-b ${style.bg} ${style.border}`} dir={dir}>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg} ${style.iconText} shadow-md ring-1 ring-white/30`}
        aria-hidden
      >
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {SECTION_ICON_PATHS[icon]}
        </svg>
      </span>
      <h3 className={`flex-1 min-w-0 font-black text-[15px] sm:text-base ${style.text} ${dir === 'ltr' ? 'text-left' : 'text-right'} tracking-tight`}>
        {title}
      </h3>
    </div>
  );
};

// ─── زر "إضافة" عام — تصميم بريميوم ─────────────────────────────────────
// gradient emerald + shadow elevated + hover glow + حالة "مضاف" واضحة
interface AddButtonProps {
  onClick: () => void;
  added: boolean;
  label?: string;                // نص الزر قبل الإضافة (افتراضي: "إضافة")
  addedLabel?: string;           // نص الزر بعد الإضافة (افتراضي: "✓ مضاف")
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, added, label = 'إضافة', addedLabel = '✓ مضاف' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={added}
    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-[11.5px] font-black transition-all active:scale-95 ${
      added
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200'
        : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_4px_12px_-2px_rgba(5,150,105,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(5,150,105,0.55)] ring-1 ring-emerald-400/50'
    }`}
  >
    {added ? addedLabel : label}
  </button>
);

// ─── المكون الرئيسي ──────────────────────────────────────────────────────
export const CaseAnalysisModal: React.FC<CaseAnalysisModalProps> = ({
  isOpen,
  onClose,
  result,
  loading,
  onAddDiagnosis,
  onAddInvestigation,
  onAddInstruction,
  addedDiagnoses,
  addedInvestigations,
  addedInstructions,
}) => {
  // مجموعات للبحث السريع عما تمت إضافته (O(1) بدلاً من array.includes كل رسم)
  const addedDiagnosesSet = React.useMemo(
    () => new Set(addedDiagnoses.map((s) => s.toLowerCase())),
    [addedDiagnoses],
  );
  const addedInvestigationsSet = React.useMemo(
    () => new Set(addedInvestigations.map((s) => s.toLowerCase())),
    [addedInvestigations],
  );
  const addedInstructionsSet = React.useMemo(
    () => new Set(addedInstructions.map((s) => s.trim())),
    [addedInstructions],
  );

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      zIndex={1100}
      backdropClass="bg-slate-950/70 backdrop-blur-md"
      noPrint
      animateIn="both"
      overlayClassName="p-2 sm:p-4"
      contentClassName="case-analysis-modal relative bg-white rounded-[1.75rem] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
      labelledBy="case-analysis-title"
    >
      {/* حلقة gradient رفيعة حوالين النافذة لمسة بريميوم */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/80"
      />

      {/* ═══ رأس النافذة (بريميوم: gradient عميق + pattern خفيف + شارة Pro Max) ═══ */}
      <div
        className="relative px-5 sm:px-7 py-5 text-white overflow-hidden"
        dir="rtl"
        style={{
          background:
            'linear-gradient(130deg, #4c1d95 0%, #5b21b6 25%, #4338ca 55%, #1e40af 100%)',
        }}
      >
        {/* نمط نقاط خفيف (SVG) */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* توهج ذهبي خفيف على الركن */}
        <span
          aria-hidden
          className="absolute -top-12 -left-12 w-44 h-44 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)' }}
        />

        <div className="relative flex items-center gap-3.5">
          {/* أيقونة مخ داخل إطار زجاجي */}
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/40 flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8.4 4.8a3.3 3.3 0 0 0-2.9 5 3.8 3.8 0 0 0 .5 7.2 3.6 3.6 0 0 0 6 2.2" />
              <path d="M15.6 4.8a3.3 3.3 0 0 1 2.9 5 3.8 3.8 0 0 1-.5 7.2 3.6 3.6 0 0 1-6 2.2" />
              <path d="M12 6.2v11.2" />
              <path d="M10 9.5c.9.1 1.7.7 2 1.6" />
              <path d="M14 9.5c-.9.1-1.7.7-2 1.6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="case-analysis-title" className="text-[1.15rem] sm:text-[1.3rem] font-black tracking-tight">تحليل الحالة</h2>
              {/* شارة Pro Max الذهبية */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-500 text-amber-950 text-[9.5px] font-black tracking-widest shadow-[0_2px_8px_rgba(251,191,36,0.55)] ring-1 ring-amber-200 uppercase">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
                Pro Max
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-white/80 font-bold mt-1 leading-relaxed">
              تحليل سريري استشاري مدعوم بالذكاء الاصطناعي — لن يُضاف للروشتة إلا ما تختاره
            </p>
          </div>
          {/* زر الإغلاق (X) — محسّن */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="shrink-0 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 ring-1 ring-white/25 flex items-center justify-center transition-colors active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══ المحتوى (Scrollable) — خلفية ناعمة متدرجة ═══ */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
        dir="rtl"
        style={{
          background:
            'linear-gradient(180deg, #fafafa 0%, #f8fafc 40%, #f1f5f9 100%)',
        }}
      >
        {/* ─── حالة التحميل — بريميوم ─── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-14 h-14" aria-hidden>
              {/* حلقة خارجية دائرة */}
              <div className="absolute inset-0 rounded-full border-[3px] border-violet-100" />
              {/* حلقة متحركة */}
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-violet-600 border-r-indigo-600 animate-spin" />
              {/* نقطة مركز */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-inner" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-slate-700">جاري تحليل الحالة</p>
              <p className="text-[11px] font-bold text-slate-500">الذكاء الاصطناعي يراجع البيانات…</p>
            </div>
          </div>
        )}

        {/* ─── تحذير بيانات غير كافية ─── */}
        {!loading && result?.insufficientData && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-black text-amber-800 text-sm mb-1">بيانات غير كافية للتحليل الدقيق</h3>
              <p className="text-amber-700 text-xs font-bold leading-relaxed">
                {result.insufficientDataNote || 'من فضلك أدخل الشكوى والفحص والعلامات الحيوية بشكل أوضح ثم أعد المحاولة.'}
              </p>
            </div>
          </div>
        )}

        {/* ─── 1) التشخيصات التفريقية (DDx) ─── */}
        {!loading && result && result.differentialDiagnoses.length > 0 && (
          <section className="bg-white rounded-2xl ring-1 ring-violet-100 shadow-[0_4px_16px_-4px_rgba(109,40,217,0.08)] overflow-hidden">
            <SectionHeader icon="ddx" title="Differential Diagnosis" tone="violet" dir="ltr" />
            {/* المحتوى كله إنجليزي — LTR ومحاذاة شمال */}
            <div className="p-4 space-y-3" dir="ltr">
              {/* جملة المقدمة (اربط الأعراض بالاحتمالات) */}
              {result.differentialDiagnosesIntro && (
                <p className="text-[12px] font-bold text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 text-left">
                  {result.differentialDiagnosesIntro}
                </p>
              )}

              {result.differentialDiagnoses.map((dd, idx) => {
                const isAdded = addedDiagnosesSet.has(dd.diagnosis.toLowerCase());
                return (
                  <div
                    key={`${dd.diagnosis}-${idx}`}
                    className={`rounded-xl p-3.5 ring-1 transition-all ${
                      dd.isMostLikely
                        ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50 ring-emerald-300 shadow-[0_2px_10px_-2px_rgba(5,150,105,0.2)]'
                        : 'bg-white ring-slate-200 hover:ring-violet-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* رقم محاط بدائرة بلون القسم */}
                          <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                            dd.isMostLikely ? 'bg-emerald-600 text-white shadow-sm' : 'bg-violet-100 text-violet-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-black text-slate-800 text-[14px] tracking-tight">
                            {dd.diagnosis}
                          </span>
                          {dd.isMostLikely && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-[9.5px] font-black tracking-[0.12em] shadow-sm">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.4L12 16.8 5.7 21.2 8 13.8 2 9.4h7.6L12 2z" />
                              </svg>
                              MOST LIKELY
                            </span>
                          )}
                        </div>
                        {dd.reasoning && (
                          <p className="text-[12px] text-slate-600 font-bold leading-relaxed mt-2 text-left">
                            {dd.reasoning}
                          </p>
                        )}
                      </div>
                      {/* زر إضافة DDx كتشخيص — نص الزر عربي فنخليه rtl محلياً */}
                      <div dir="rtl" className="shrink-0">
                        <AddButton
                          onClick={() => onAddDiagnosis(dd.diagnosis)}
                          added={isAdded}
                          label="اختر كتشخيص"
                          addedLabel="✓ تم الاختيار"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 2) Must Not Miss ─── */}
        {!loading && result && result.mustNotMiss.length > 0 && (
          <section className="bg-white rounded-2xl ring-1 ring-rose-100 shadow-[0_4px_16px_-4px_rgba(225,29,72,0.08)] overflow-hidden">
            <SectionHeader icon="must-not-miss" title="Must Not Miss" tone="rose" dir="ltr" />
            <div className="p-4 space-y-2" dir="ltr">
              {result.mustNotMiss.map((m, idx) => (
                <div
                  key={`${m.diagnosis}-${idx}`}
                  className={`rounded-xl p-3 border-2 text-left ${
                    m.alreadyInDDx
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">{m.alreadyInDDx ? '⚠️' : '🚨'}</span>
                    <div className="flex-1 text-left">
                      <div className="font-black text-slate-800 text-sm">{m.diagnosis}</div>
                      {m.reasoning && (
                        <p className="text-[12px] text-slate-600 font-bold leading-relaxed mt-1">
                          {m.reasoning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3) Suggested Investigations ─── */}
        {!loading && result && result.suggestedInvestigations.length > 0 && (
          <section className="bg-white rounded-2xl ring-1 ring-sky-100 shadow-[0_4px_16px_-4px_rgba(2,132,199,0.08)] overflow-hidden">
            <SectionHeader icon="investigations" title="Suggested Investigations" tone="blue" dir="ltr" />
            {/* حاوية LTR: الاسم الإنجليزي على الشمال، السبب العربي بين قوسين بجنبه */}
            <div className="p-4 space-y-2" dir="ltr">
              {result.suggestedInvestigations.map((inv, idx) => {
                const isAdded = addedInvestigationsSet.has(inv.nameEn.toLowerCase());
                return (
                  <div
                    key={`${inv.nameEn}-${idx}`}
                    className="rounded-xl p-3 bg-blue-50/60 border border-blue-200 flex items-center gap-3"
                  >
                    {/* سطر واحد: اسم الفحص + (سبب بالعربي) — نفس صيغة ما هيتضاف للروشتة */}
                    <p className="flex-1 min-w-0 text-left text-sm font-bold text-slate-800 leading-relaxed">
                      <span className="font-black text-blue-900">{inv.nameEn}</span>
                      {inv.reasonAr && (
                        <span className="text-slate-600"> ({inv.reasonAr})</span>
                      )}
                    </p>
                    {/* زر إضافة — عربي، فنحطه في حاوية rtl محلية */}
                    <div dir="rtl" className="shrink-0">
                      <AddButton
                        onClick={() => onAddInvestigation(inv.nameEn, inv.reasonAr)}
                        added={isAdded}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 4) Important Instructions (عربي) ─── */}
        {!loading && result && result.importantInstructionsAr.length > 0 && (
          <section className="bg-white rounded-2xl ring-1 ring-emerald-100 shadow-[0_4px_16px_-4px_rgba(5,150,105,0.08)] overflow-hidden">
            {/* قسم 4 عربي فالهيدر RTL */}
            <SectionHeader icon="instructions" title="تعليمات هامة" tone="emerald" dir="rtl" />
            <div className="p-4 space-y-2">
              {result.importantInstructionsAr.map((ins, idx) => {
                const isAdded = addedInstructionsSet.has(ins.trim());
                return (
                  <div
                    key={`${ins}-${idx}`}
                    className="rounded-xl p-3 bg-emerald-50/60 border border-emerald-200 flex items-center gap-3"
                  >
                    <p className="flex-1 text-[13px] text-slate-800 font-bold leading-relaxed">
                      • {ins}
                    </p>
                    <AddButton onClick={() => onAddInstruction(ins)} added={isAdded} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 5) Missing Information ─── */}
        {!loading && result && result.missingInformation.length > 0 && (
          <section className="bg-white rounded-2xl ring-1 ring-amber-100 shadow-[0_4px_16px_-4px_rgba(217,119,6,0.08)] overflow-hidden">
            <SectionHeader icon="missing" title="Missing Information" tone="amber" dir="ltr" />
            <div className="p-4" dir="ltr">
              <ul className="space-y-1.5">
                {result.missingInformation.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[12.5px] text-slate-700 font-bold text-left">
                    <span className="text-amber-600 shrink-0">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── 6) Red Flags ─── */}
        {!loading && result && result.redFlags.length > 0 && (
          <section className="bg-white rounded-2xl ring-1 ring-red-200 shadow-[0_4px_16px_-2px_rgba(220,38,38,0.12)] overflow-hidden">
            <SectionHeader icon="red-flag" title="Red Flags" tone="crimson" dir="ltr" />
            <div className="p-4" dir="ltr">
              <ul className="space-y-2">
                {result.redFlags.map((flag, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-[13px] text-red-800 font-black bg-red-50 rounded-lg px-3 py-2 border border-red-200 text-left"
                  >
                    <span className="shrink-0">🚩</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── لا توجد نتيجة (حالة استثنائية) ─── */}
        {!loading && result && result.differentialDiagnoses.length === 0 && !result.insufficientData && (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-black text-slate-600">
              لم يتمكن المحلل من استخلاص تشخيصات. حاول إضافة تفاصيل أكثر وأعد المحاولة.
            </p>
          </div>
        )}
      </div>

      {/* ═══ تذييل النافذة — بريميوم ═══ */}
      <div
        className="shrink-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3"
        dir="rtl"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[10.5px] font-bold text-slate-500 leading-relaxed flex items-start gap-1.5">
            <svg className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>الطبيب هو المسؤول الأول والأخير عن التشخيص طبقاً لمناظرته للحالة</span>
          </p>
          <p className="text-[10.5px] font-bold text-emerald-700 leading-relaxed flex items-start gap-1.5">
            <svg className="w-3 h-3 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.8 2l4.2 4.2L8.4 19.8l-5.6 1.4L4.2 15.6 17.8 2z" />
            </svg>
            <span>أي حاجة بتضيفها من هنا تقدر تعدّلها أو تمسحها من الروشتة عادي</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-black text-sm transition-all active:scale-95 shadow-md ring-1 ring-slate-700/50"
        >
          إغلاق
        </button>
      </div>
    </ModalOverlay>
  );
};
