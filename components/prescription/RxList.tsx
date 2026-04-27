import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PrescriptionItem, Medication, AlternativeMed, TextStyle } from '../../types';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { useMedicationSearch } from '../../hooks/medications';
import { formatMinAge } from '../../utils/formatMinAge';

/**
 * الملف: RxList.tsx
 * الوصف: هذا الجزء هو "جوهر الروشتة" حيث تُعرض قائمة الأدوية (Prescriptions). 
 * يسمح للطبيب بالبحث المباشر عن الأدوية، اختيار البدائل، وكتابة التعليمات بالعربية. 
 * يتميز بدعم التقنيات المتقدمة لتنسيق النص (Line Height, Text Stroke, Background Highlights) 
 * لضمان وضوح الأدوية والجرعات عند الطباعة، مع إمكانية إضافة "ملاحظات حرة" بين الأدوية.
 */

interface RxListProps {
  rxItems: PrescriptionItem[];
  medNameSize: string;      // حجم خط اسم الدواء (className افتراضي)
  medInstSize: string;      // حجم خط التعليمات (className افتراضي)
  /** Override بالـ inline style من إعدادات المستخدم — يطغى على className لو مُمرَّر */
  medNamePx?: number;
  medInstPx?: number;
  notePx?: number;
  /** ألوان لكل عنصر */
  medNameColor?: string;
  medInstColor?: string;
  noteColor?: string;
  /** نوع الخط لكل عنصر */
  medNameFontFamily?: string;
  medInstFontFamily?: string;
  noteFontFamily?: string;
  /** المسافة الرأسية حول كل صف دواء (افتراضي 2px) */
  drugRowPaddingPx?: number;
  /** سُمك الخط الفاصل بين الأدوية بالـ px (افتراضي 1، 0 = بدون) */
  drugBorderWidthPx?: number;
  /** لون الخط الفاصل بين الأدوية */
  drugBorderColor?: string;
  leading: string;          // المسافة بين السطور
  itemPad: string;          // الهوامش الداخلية لكل دواء
  listGap: string;          // المسافة بين الأدوية في القائمة
  isDataOnlyMode: boolean;   // وضع البيانات فقط
  isPrintMode: boolean;      // وضع الطباعة (يخفي أدوات التحرير)
  usageStats?: Record<string, number>;
  onUpdateItemName: (idx: number, name: string) => void;
  onUpdateItemInstruction: (idx: number, inst: string) => void;
  onMedicationClick: (med: Medication) => void;
  onRemoveItem: (idx: number) => void;
  onSetAltModal: (data: { index: number, alts: AlternativeMed[] }) => void;
  onSelectMedication?: (idx: number, med: Medication) => void;
  englishStyle?: TextStyle; // أنماط مخصصة للنصوص الإنجليزية (أسماء الأدوية)
  arabicStyle?: TextStyle;  // أنماط مخصصة للنصوص العربية (التعليمات)
}

// ─ مغلّف بـ React.memo لمنع re-render كامل لقائمة الأدوية في كل state change.
//   الـRxList بيتعمله re-render مع أي تغيير في الـparent (تايمر، notification، إلخ).
//   الـmemo بيقارن props الـshallow ولو ما اتغيّرتش، ميعملش re-render — توفير
//   كبير في صفحة كشف جديد على الموبايل.
const RxListComponent: React.FC<RxListProps> = ({
  rxItems, medNameSize, medInstSize, medNamePx, medInstPx, notePx,
  medNameColor, medInstColor, noteColor,
  medNameFontFamily, medInstFontFamily, noteFontFamily,
  drugRowPaddingPx, drugBorderWidthPx, drugBorderColor,
  leading, itemPad, listGap, isDataOnlyMode, isPrintMode, usageStats = {},
  onUpdateItemName, onUpdateItemInstruction, onMedicationClick, onRemoveItem, onSetAltModal, onSelectMedication,
  englishStyle, arabicStyle
}) => {
  const [activeSearchIdx, setActiveSearchIdx] = useState<number | null>(null);
  const wrapperRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /** إغلاق قائمة الاقتراحات عند الضغط خارج الحاوية الكاملة (الحقل + القائمة) */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeSearchIdx === null) return;
      const activeWrapper = wrapperRefs.current[activeSearchIdx];
      if (activeWrapper && !activeWrapper.contains(e.target as Node)) {
        setActiveSearchIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeSearchIdx]);

  /** 
   * إعادة ضبط ارتفاع جميع حقول النصوص التلقائية (Auto-Resize).
   * هذه الخطوة حيوية لضمان أن كل تعليمات الدواء (الجرعة) تظهر كاملة دون انقطاع، 
   * خاصة عند التحويل لوضع الطباعة حيث يختفي شريط التمرير.
   */
  useEffect(() => {
    if (isPrintMode) return;
    const resizeTextareas = () => {
      const textareas = document.querySelectorAll('textarea[data-auto-resize="true"]');
      textareas.forEach((textarea) => {
        const el = textarea as HTMLTextAreaElement;
        if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
      });
    };
    resizeTextareas();
    const timeoutId = setTimeout(() => { requestAnimationFrame(() => { resizeTextareas(); }); }, 150);
    return () => clearTimeout(timeoutId);
  }, [rxItems, isPrintMode]);

  const { search } = useMedicationSearch();
  const suggestions = useMemo(() => {
    if (activeSearchIdx === null) return [];
    const query = activeSearchIdx < rxItems.length && rxItems[activeSearchIdx] && rxItems[activeSearchIdx].medication
      ? rxItems[activeSearchIdx].medication!.name
      : '';
    return search(query, [], usageStats);
  }, [activeSearchIdx, rxItems, search, usageStats]);

  return (
    <div className={`flex-1 flex flex-col ${listGap} pl-2 pr-1 relative z-40 min-h-0 overflow-visible`}>
      {rxItems.map((item, idx) => (
        <div
          key={item.id || idx}
          data-rx-item-id={item.id || `item-${idx}`}
          className={`group relative flex flex-col gap-0 last:border-0 ${itemPad} ${isDataOnlyMode ? 'border-transparent' : ''} ${(!item.medication?.name && item.type !== 'note') ? 'print:hidden' : ''}`}
          style={{
            paddingTop: `${drugRowPaddingPx ?? 2}px`,
            paddingBottom: `${drugRowPaddingPx ?? 2}px`,
            borderBottomWidth: `${drugBorderWidthPx ?? 1}px`,
            borderBottomStyle: 'solid',
            borderBottomColor: isDataOnlyMode ? 'transparent' : (drugBorderColor || '#f1f5f9'),
          }}
        >

          {/* حالة الملاحظة الحرة (Note) - تظهر بين الأدوية بوسط الروشتة */}
          {item.type === 'note' ? (
            <div className="w-full flex items-center gap-2" dir="rtl">
              <div className="flex-1">
                <AutoResizeTextarea
                  value={item.instructions}
                  onChange={(e) => onUpdateItemInstruction(idx, e.target.value)}
                  className={`font-black text-slate-800 w-full bg-transparent outline-none border-none text-center font-cairo resize-none p-2 m-0 leading-relaxed ${item.customFontSize || 'text-[15px]'} overflow-visible focus:bg-brand-50/20 rounded`}
                  /* الإعدادات العامة للملاحظات (الحجم/اللون/الخط) تطغى على الـ default — إلا لو الملاحظة لها customFontSize خاص بها */
                  style={{
                    ...(item.customFontSize ? {} : (notePx ? { fontSize: `${notePx}px` } : {})),
                    ...(noteColor ? { color: noteColor } : {}),
                    ...(noteFontFamily ? { fontFamily: noteFontFamily } : {}),
                  }}
                  readOnlyMode={isPrintMode}
                  placeholder="اكتب ملاحظة حرة هنا في الروشتة..."
                  autoFocus={item.instructions === ''}
                />
              </div>
              {!isPrintMode && (
                <button onClick={() => onRemoveItem(idx)} className="no-print text-slate-300 hover:text-danger-600 text-xl font-bold px-1 transition-colors opacity-0 group-hover:opacity-100 shrink-0">×</button>
              )}
            </div>
          ) : (
            <div className="w-full pl-1">
              <div className="flex justify-between items-start gap-2 relative" dir="ltr">
                {/* اسم الدواء (بالإنجليزية) */}
                <div ref={(el) => { wrapperRefs.current[idx] = el; }} className="flex-1 min-w-0">
                  <AutoResizeTextarea
                    value={item.medication?.name || ''}
                    onChange={(e) => { onUpdateItemName(idx, e.target.value); setActiveSearchIdx(idx); }}
                    onFocus={() => setActiveSearchIdx(idx)}
                    className={`font-black text-slate-900 text-left font-sans ${medNameSize} block uppercase bg-transparent outline-none border-none resize-none overflow-visible p-0 w-full focus:bg-brand-50/50 rounded`}
                    style={{
                      lineHeight: englishStyle?.lineHeight ? `${englishStyle.lineHeight}` : 'inherit',
                      letterSpacing: englishStyle?.letterSpacing ? `${englishStyle.letterSpacing}px` : undefined,
                      transform: (englishStyle?.xOffset || englishStyle?.yOffset) ? `translate(${englishStyle.xOffset || 0}px, ${englishStyle.yOffset || 0}px)` : undefined,
                      WebkitTextStroke: englishStyle?.textStrokeWidth ? `${englishStyle.textStrokeWidth}px ${englishStyle.textStrokeColor || '#000'}` : undefined,
                      backgroundColor: englishStyle?.textBgColor ? `${englishStyle.textBgColor}${Math.round((englishStyle.textBgOpacity || 1) * 255).toString(16).padStart(2, '0')}` : undefined,
                      borderRadius: englishStyle?.textBgRadius ? `${englishStyle.textBgRadius}px` : undefined,
                      paddingTop: englishStyle?.textBgPaddingTop ? `${englishStyle.textBgPaddingTop}px` : undefined,
                      paddingRight: englishStyle?.textBgPaddingRight ? `${englishStyle.textBgPaddingRight}px` : undefined,
                      paddingBottom: englishStyle?.textBgPaddingBottom ? `${englishStyle.textBgPaddingBottom}px` : undefined,
                      paddingLeft: englishStyle?.textBgPaddingLeft ? `${englishStyle.textBgPaddingLeft}px` : undefined,
                      borderWidth: englishStyle?.textBgBorderWidth ? `${englishStyle.textBgBorderWidth}px` : undefined,
                      borderColor: englishStyle?.textBgBorderColor,
                      // الأولوية: نمط مخصص للدواء > إعداد المستخدم العام > className افتراضي
                      color: englishStyle?.color || medNameColor,
                      fontSize: englishStyle?.fontSize ?? (medNamePx ? `${medNamePx}px` : undefined),
                      fontWeight: englishStyle?.fontWeight,
                      fontStyle: englishStyle?.fontStyle,
                      fontFamily: englishStyle?.fontFamily || medNameFontFamily || 'inherit'
                    }}
                    readOnlyMode={isPrintMode}
                    placeholder="Medication Name..."
                    autoFocus={item.id?.startsWith('empty-')}
                  />


                  {/* قائمة الاقتراحات المنسدلة (تظهر تحت حفل الكتابة الحالي) */}
                  {!isPrintMode && activeSearchIdx === idx && (
                    <div
                      className="absolute left-0 top-full mt-1 w-full bg-white border border-brand-100 shadow-xl rounded-xl z-[99999] max-h-[320px] overflow-y-auto ring-2 ring-black/5"
                    >
                      {suggestions.length > 0 ? (
                        suggestions.map(s => {
                          const ageLabel = formatMinAge(s.minAgeMonths);
                          return (
                            <div
                              key={s.id}
                              onMouseDown={(e) => { e.preventDefault(); onSelectMedication?.(idx, s); setActiveSearchIdx(null); }}
                              className="px-3 py-2 hover:bg-success-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group/item"
                              dir="ltr"
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-black text-slate-800 text-[13px] group-hover/item:text-success-700 transition-colors leading-snug">{s.name}</span>
                                  {s.price ? <span className="text-[10px] font-black text-success-700 bg-success-50 px-1.5 py-0.5 rounded border border-success-100 shrink-0">{s.price} ج.م</span> : null}
                                </div>
                                {s.genericName && <div className="text-[11px] text-slate-500 italic leading-snug">{s.genericName}</div>}
                                {(s.form || ageLabel) && (
                                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                    {s.form && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">{s.form}</span>}
                                    {ageLabel && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-100">{ageLabel}</span>}
                                  </div>
                                )}
                                {s.usage && <div className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{s.usage}</div>}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        item.medication?.name ? (
                          <div className="px-3 py-2" dir="rtl">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span className="text-xs font-bold">لم يتم العثور على نتائج</span>
                              <span className="text-sm leading-none">🤔</span>
                            </div>
                          </div>
                        ) : (
                          <div className="px-3 py-2" dir="rtl">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <span className="text-xs font-bold">ابحث عن دواء لإضافته</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 pr-5">Search by name, generic, or category</div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات (بدائل، تفاصيل، حذف) - تختفي في الطباعة */}
                <div className={`flex items-center gap-1.5 no-print shrink-0 transition-opacity duration-200 ${isPrintMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
                  {item.alternatives && item.alternatives.length > 0 && (
                    <button
                      onClick={() => onSetAltModal({ index: idx, alts: item.alternatives! })}
                      className="text-brand-700 hover:text-brand-900 text-[10px] font-black px-2 py-0.5 bg-brand-100 rounded-md border border-brand-200 transition-all active:scale-95"
                    >
                      بدائل
                    </button>
                  )}

                  {item.medication && (
                    <button
                      onClick={() => onMedicationClick(item.medication!)}
                      className="text-brand-500 hover:text-brand-700 p-0.5 bg-slate-50 rounded-full border border-slate-200"
                      title="تفاصيل الدواء"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}

                  <button onClick={() => onRemoveItem(idx)} className="text-slate-300 hover:text-danger-600 text-xl font-bold px-1 transition-colors">×</button>
                </div>
              </div>

              {/* تعليمات الدواء (بالعربية) */}
              <div className="w-full text-right pr-1" dir="rtl">
                <AutoResizeTextarea
                  value={item.instructions}
                  onChange={(e) => onUpdateItemInstruction(idx, e.target.value)}
                  className={`font-bold text-slate-700 w-full bg-transparent outline-none border-none text-right font-cairo resize-none p-0 m-0 ${medInstSize} overflow-visible focus:bg-brand-50/30 rounded`}
                  style={{
                    lineHeight: arabicStyle?.lineHeight ? `${arabicStyle.lineHeight}` : 'inherit',
                    paddingTop: arabicStyle?.textBgPaddingTop ? `${arabicStyle.textBgPaddingTop}px` : 0,
                    paddingBottom: arabicStyle?.textBgPaddingBottom ? `${arabicStyle.textBgPaddingBottom}px` : 0,
                    letterSpacing: arabicStyle?.letterSpacing ? `${arabicStyle.letterSpacing}px` : undefined,
                    transform: (arabicStyle?.xOffset || arabicStyle?.yOffset) ? `translate(${arabicStyle.xOffset || 0}px, ${arabicStyle.yOffset || 0}px)` : undefined,
                    WebkitTextStroke: arabicStyle?.textStrokeWidth ? `${arabicStyle.textStrokeWidth}px ${arabicStyle.textStrokeColor || '#000'}` : undefined,
                    backgroundColor: arabicStyle?.textBgColor ? `${arabicStyle.textBgColor}${Math.round((arabicStyle.textBgOpacity || 1) * 255).toString(16).padStart(2, '0')}` : undefined,
                    borderRadius: arabicStyle?.textBgRadius ? `${arabicStyle.textBgRadius}px` : undefined,
                    paddingRight: arabicStyle?.textBgPaddingRight ? `${arabicStyle.textBgPaddingRight}px` : undefined,
                    paddingLeft: arabicStyle?.textBgPaddingLeft ? `${arabicStyle.textBgPaddingLeft}px` : undefined,
                    borderWidth: arabicStyle?.textBgBorderWidth ? `${arabicStyle.textBgBorderWidth}px` : undefined,
                    borderColor: arabicStyle?.textBgBorderColor,
                    // الأولوية: نمط مخصص للدواء > إعداد المستخدم العام > className افتراضي
                    color: arabicStyle?.color || medInstColor,
                    fontSize: arabicStyle?.fontSize ?? (medInstPx ? `${medInstPx}px` : undefined),
                    fontWeight: arabicStyle?.fontWeight,
                    fontStyle: arabicStyle?.fontStyle,
                    fontFamily: arabicStyle?.fontFamily || medInstFontFamily || 'inherit'
                  }}
                  readOnlyMode={isPrintMode}
                  placeholder="الجرعة والتعليمات ..."
                  autoFocus={item.id?.startsWith('manual-') && item.instructions === ''}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const RxList = React.memo(RxListComponent);
