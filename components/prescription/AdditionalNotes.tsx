import React from 'react';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { FOLLOWUP_WITHIN_WEEK_NOTE_AR_VARIANTS } from '../../utils/prescriptionText';

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
}

export const AdditionalNotes: React.FC<AdditionalNotesProps> = ({
  labInvestigations,
  generalAdvice,
  labSize,
  leading,
  containerGap,
  notesFontSizePx,
  notesColor,
  notesFontFamily,
  rowMinHeightPx,
  sectionTitlePx,
  sectionTitleColor,
  sectionTitleFontFamily,
  isDataOnlyMode,
  isPrintMode,
  middleBackgroundColor,
  onUpdateLab,
  onRemoveLab,
  onUpdateAdvice,
  onRemoveAdvice,
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
                  <AutoResizeTextarea
                    value={isPrintMode
                      ? (() => {
                          const p = parseLab(lab);
                          const test = (p.test || '').toUpperCase().replace(/\s+/g, ' ').trim();
                          const reason = (p.reason || '').trim();
                          return reason ? `${test} - ${reason}` : test;
                        })()
                      : lab}
                    onChange={(e) => onUpdateLab && onUpdateLab(i, e.target.value)}
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
                  <AutoResizeTextarea
                    value={advice}
                    onChange={(e) => onUpdateAdvice && onUpdateAdvice(i, e.target.value)}
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
