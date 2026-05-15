import React from 'react';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import type { ReadyPrescription } from '../../types';
import { FOLLOWUP_WITHIN_WEEK_NOTE_AR_VARIANTS } from '../../utils/prescriptionText';
import { buildReadyPrescriptionTextSuggestions } from '../../utils/readyPrescriptionUtils';

/**
 * الملف: AdditionalNotes.tsx
 * الوصف: هذا المكون مسؤول عن عرض "الملاحظات والطلبات الإضافية" في نهاية الروشتة. 
 * يتضمن ذلك تحاليل الدم المطلوبة أو الأشعات (Investigations) والنصائح العامة للمريض (Advice). 
 * يتميز بمنطق ذكي (Parsing) لفصل اسم التحليل بالإنجليزية عن سببه بالعربية، 
 * مما يعطي مظهراً غاية في الدقة والاحترافية عند الطباعة.
 */

interface AdditionalNotesProps {
  labInvestigations: string[];
  generalAdvice: string[];
  labSize: string;      // حجم خط التحاليل (className افتراضي)
  leading: string;      // تباعد الأسطر
  containerGap: string; // المسافة بين الأقسام
  /** Override لحجم خط الفحوصات/التعليمات بالـ px من إعدادات المستخدم */
  notesFontSizePx?: number;
  /** لون نص الفحوصات والتعليمات */
  notesColor?: string;
  /** نوع خط الفحوصات والتعليمات */
  notesFontFamily?: string;
  /** Override للمسافة بين الأسطر بالـ px من إعدادات المستخدم */
  rowMinHeightPx?: number;
  /** حجم عناوين الأقسام (فحوصات مطلوبة / تعليمات هامة) */
  sectionTitlePx?: number;
  /** لون عناوين الأقسام */
  sectionTitleColor?: string;
  /** خط عناوين الأقسام */
  sectionTitleFontFamily?: string;
  isDataOnlyMode: boolean;
  isPrintMode: boolean;
  middleBackgroundColor?: string;
  onUpdateLab?: (idx: number, val: string) => void;
  onRemoveLab?: (idx: number) => void;
  onUpdateAdvice?: (idx: number, val: string) => void;
  onRemoveAdvice?: (idx: number) => void;
  readyPrescriptions?: ReadyPrescription[];
}

type SuggestionField = 'generalAdvice' | 'labInvestigations';

interface SuggestionTextareaProps {
  value: string;
  field: SuggestionField;
  readyPrescriptions: ReadyPrescription[];
  onChange: (value: string) => void;
  className: string;
  style: React.CSSProperties;
  dir?: string;
  placeholder?: string;
  readOnlyMode: boolean;
  autoFocus?: boolean;
}

const ReadyPrescriptionSuggestionTextarea: React.FC<SuggestionTextareaProps> = ({
  value,
  field,
  readyPrescriptions,
  onChange,
  className,
  style,
  dir,
  placeholder,
  readOnlyMode,
  autoFocus,
}) => {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const suggestions = React.useMemo(() => {
    if (readOnlyMode || !open) return [];
    return buildReadyPrescriptionTextSuggestions(readyPrescriptions, field, value);
  }, [field, open, readyPrescriptions, readOnlyMode, value]);

  const suggestionTitle = value.trim()
    ? 'اقتراحات من الروشتات الجاهزة'
    : 'آخر 5 من الروشتات الجاهزة';

  return (
    <div ref={wrapperRef} className="relative">
      <AutoResizeTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className={className}
        style={style}
        dir={dir}
        placeholder={placeholder}
        readOnlyMode={readOnlyMode}
        autoFocus={autoFocus}
      />

      {!readOnlyMode && open && suggestions.length > 0 && (
        <div
          className="no-print absolute right-0 bottom-full mb-1 w-full min-w-[180px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 z-[99999]"
          dir="rtl"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-black text-slate-500 bg-slate-50 border-b border-slate-100">
            {suggestionTitle}
          </div>
          <div className="max-h-44 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(suggestion);
                  setOpen(false);
                }}
                className="block w-full px-2.5 py-2 text-right text-[11px] font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 border-b border-slate-50 last:border-b-0"
                dir="auto"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AdditionalNotes: React.FC<AdditionalNotesProps> = ({
  labInvestigations,
  generalAdvice,
  labSize,
  notesFontSizePx,
  notesColor,
  notesFontFamily,
  rowMinHeightPx,
  sectionTitlePx,
  sectionTitleColor,
  sectionTitleFontFamily,
  isPrintMode,
  middleBackgroundColor,
  onUpdateLab,
  onRemoveLab,
  onUpdateAdvice,
  onRemoveAdvice,
  readyPrescriptions = [],
}) => {
  const effectiveRowMinHeight = `${rowMinHeightPx ?? 18}px`;
  const fontSizeOverride = notesFontSizePx ? { fontSize: `${notesFontSizePx}px` } : {};
  const colorOverride = notesColor ? { color: notesColor } : {};
  const fontFamilyOverride = notesFontFamily ? { fontFamily: notesFontFamily } : {};
  const textStyleOverride = { ...fontSizeOverride, ...colorOverride, ...fontFamilyOverride };
  const titleStyle: React.CSSProperties | undefined = (sectionTitleColor || sectionTitlePx || sectionTitleFontFamily)
    ? {
        ...(sectionTitleColor ? { color: sectionTitleColor } : {}),
        ...(sectionTitlePx ? { fontSize: `${sectionTitlePx}px` } : {}),
        ...(sectionTitleFontFamily ? { fontFamily: sectionTitleFontFamily } : {}),
      }
    : undefined;
  /** 
   * وظيفة لتحليل نص التحليل (Parsing). 
   * تقوم بفصل اسم التحليل بالإنجليزية عن سببه (الموجود بين أقواس أو بعد فاصلة). 
   * هذا يسمح بعرض اسم التحليل بشكل غامق (Bold) وسبب الطلب بجانبه بشكل منظم.
   */
  const parseLab = (raw: string): { test: string; reason?: string } => {
    const s = (raw ?? '').toString().trim();
    if (!s) return { test: '' };
    const mParen = s.match(/^\s*([^()]+?)\s*\((.+)\)\s*$/);
    if (mParen) return { test: mParen[1].trim(), reason: mParen[2].trim() };
    const parts = s.split(/\s*[-:|،]\s*/).filter(Boolean);
    if (parts.length >= 2) return { test: parts[0].trim(), reason: parts.slice(1).join(' - ').trim() };
    return { test: s };
  };

  /** قائمة المتغيرات اللغوية لملحوظة "المتابعة خلال أسبوع" لاستثنائها من العرض إذا لزم الأمر */
  const followUpVariants = new Set(FOLLOWUP_WITHIN_WEEK_NOTE_AR_VARIANTS.map((v) => (v || '').toString().trim()));

  /** فلترة العناصر الفارغة أو المكررة (مثل ملحوظة المتابعة) في وضع الطباعة فقط */
  const filteredLabs = isPrintMode
    ? labInvestigations.filter((lab) => lab && lab.trim() !== '')
    : labInvestigations;

  const filteredAdvice = isPrintMode
    ? generalAdvice
        .filter((advice) => advice && advice.trim() !== '')
        .filter((advice) => !followUpVariants.has((advice || '').toString().trim()))
    : generalAdvice;

  const displayLabs = !isPrintMode ? labInvestigations : filteredLabs;
  const displayAdvice = !isPrintMode ? generalAdvice : filteredAdvice;

  // إخفاء المكون بالكامل إذا لم يكن هناك شيء لعرضه في وضع الطباعة
  if (isPrintMode && displayLabs.length === 0 && displayAdvice.length === 0) return null;

  const showLabsSection = displayLabs.length > 0;
  const showAdviceSection = displayAdvice.length > 0;

  return (
    <div
      className={`shrink-0 flex flex-col p-0 bg-transparent relative z-10 overflow-visible pb-2`}
      style={{ gap: '2px' }}
    >
      {/* قسم التحاليل والفحوصات */}
      {showLabsSection && (
        <div className="w-full" dir="rtl" style={{ backgroundColor: middleBackgroundColor }}>
          <div className="w-full text-right flex items-center gap-1.5 mb-0">
            <span className={`text-danger-900 font-black ${labSize}`} style={titleStyle}>فحوصات مطلوبة :</span>
          </div>

          <div className="pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '0px', minHeight: 'auto' }}>
            {displayLabs.map((lab, i) => (
              /* min-height ثابت لكل صف يضمن تطابق ارتفاع التحرير (textarea) والطباعة (div) — يمنع ضيق المسافة في الطباعة */
              <div key={i} className="flex items-start gap-2 group overflow-visible" style={{ minHeight: effectiveRowMinHeight }}>
                <span className={`text-danger-700 font-black shrink-0 ${labSize} flex items-center`} style={{ lineHeight: '1.1' }}>•</span>

                {/* بنية موحّدة بين التحرير والطباعة: نفس الـ container ونفس className.
                    في التحرير يرسم AutoResizeTextarea كـ textarea (قابل للكتابة).
                    في الطباعة يرسمه كـ div (نفس styling) — بنفس الارتفاع والمسافات. */}
                <div className="flex-1 min-w-0" dir="ltr">
                  <ReadyPrescriptionSuggestionTextarea
                    value={isPrintMode
                      ? (() => {
                          const p = parseLab(lab);
                          const test = (p.test || '').toUpperCase().replace(/\s+/g, ' ').trim();
                          const reason = (p.reason || '').trim();
                          return reason ? `${test} - ${reason}` : test;
                        })()
                      : lab}
                    field="labInvestigations"
                    readyPrescriptions={readyPrescriptions}
                    onChange={(value) => onUpdateLab && onUpdateLab(i, value)}
                    className={`w-full bg-transparent outline-none border-none resize-none text-slate-900 font-bold ${labSize} overflow-visible p-0 text-left block`}
                    style={{ lineHeight: '1.1', minHeight: '0px', ...textStyleOverride }}
                    dir="ltr"
                    placeholder="CBC (سبب الطلب وفائدته)"
                    readOnlyMode={isPrintMode}
                    autoFocus={!isPrintMode && lab === ''}
                  />
                </div>

                {!isPrintMode ? (
                  <button onClick={() => onRemoveLab?.(i)} className="no-print opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-slate-400 hover:text-danger-500 font-bold px-1 text-xs shrink-0 self-center">×</button>
                ) : (
                  /* spacer فاضي بعرض زر المسح ليحفظ نفس مساحة التحرير في الطباعة (بدون أي نص ظاهر) */
                  <span className="shrink-0 self-center" aria-hidden="true" style={{ width: '20px', display: 'inline-block' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قسم النصائح والتعليمات العامة */}
      {showAdviceSection && (
        <div className="w-full" dir="rtl" style={{ backgroundColor: middleBackgroundColor }}>
          <div className="flex items-center gap-1.5 mb-1.5 h-auto">
            <span className={`text-danger-900 font-black ${labSize}`} style={titleStyle}>تعليمات هامة :</span>
          </div>

          <div className="pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '0px', minHeight: 'auto' }}>
            {displayAdvice.map((advice, i) => (
              /* min-height ثابت لكل صف يضمن تطابق ارتفاع التحرير (textarea) والطباعة (div) — يمنع ضيق المسافة في الطباعة */
              <div key={i} className="flex items-start gap-2 group overflow-visible" style={{ minHeight: effectiveRowMinHeight }}>
                <span className={`text-success-700 font-black shrink-0 ${labSize} flex items-center`} style={{ lineHeight: '1.1' }}>•</span>
                <div className="flex-1 min-w-0">
                  <ReadyPrescriptionSuggestionTextarea
                    value={advice}
                    field="generalAdvice"
                    readyPrescriptions={readyPrescriptions}
                    onChange={(value) => onUpdateAdvice && onUpdateAdvice(i, value)}
                    className={`w-full bg-transparent outline-none border-none resize-none text-slate-900 font-bold ${labSize} overflow-visible p-0 text-right block`}
                    style={{ lineHeight: '1.1', minHeight: '0px', ...textStyleOverride }}
                    placeholder="..."
                    readOnlyMode={isPrintMode}
                    autoFocus={advice === ''}
                  />
                </div>
                {!isPrintMode ? (
                  <button onClick={() => onRemoveAdvice?.(i)} className="no-print opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-slate-400 hover:text-danger-500 font-bold px-1 text-xs shrink-0 self-center">×</button>
                ) : (
                  /* spacer فاضي بعرض زر المسح ليحفظ نفس مساحة التحرير في الطباعة (بدون أي نص ظاهر) */
                  <span className="shrink-0 self-center" aria-hidden="true" style={{ width: '20px', display: 'inline-block' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
