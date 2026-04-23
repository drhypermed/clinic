import React, { useEffect, useState } from 'react';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';

/**
 * الملف: ClinicalDetails.tsx
 * الوصف: هذا المكون مسؤول عن عرض "البيانات السريرية" (Clinical Info) للمريض. 
 * يعتمد الأطباء لغة اختصارات موحدة (C/O, Hx, O/E, Inv, Dx). 
 * يتميز هذا المكون بالذكاء في إخفاء الأقسام الفارغة أو التي تحتوي على كلمات نفي (مثل: None أو N/A) 
 * لضمان أن تظهر الروشتة نظيفة ومركزة فقط على المعلومات المفيدة طبياً.
 */

interface ClinicalDetailsProps {
  complaint: string;
  complaintEn: string;
  setComplaintEn: (val: string) => void;
  medicalHistory: string;
  historyEn: string;
  setHistoryEn: (val: string) => void;
  examination: string;
  examEn: string;
  setExamEn: (val: string) => void;
  investigations?: string;
  investigationsEn?: string;
  setInvestigationsEn?: (val: string) => void;
  diagnosisEn: string;
  setDiagnosisEn: (val: string) => void;
  clinicalInfoSize: string; // التحكم في حجم الخط الكلي (className افتراضي)
  /** Override بالـ inline px من إعدادات المستخدم */
  clinicalInfoPx?: number;
  /** لون نص الكشف الإكلينيكي */
  clinicalInfoColor?: string;
  /** نوع خط الكشف الإكلينيكي */
  clinicalInfoFontFamily?: string;
  /** لون خلفية مربع الكشف */
  clinicalBoxBgColor?: string;
  /** لون حدود مربع الكشف */
  clinicalBoxBorderColor?: string;
  /** سُمك حدود مربع الكشف */
  clinicalBoxBorderWidthPx?: number;
  isDataOnlyMode: boolean;   // وضع البيانات فقط (يخفي التنسيقات الخلفية)
  isPrintMode: boolean;      // وضع الطباعة (يخفي أزرار المسح ويجعل الحقول للقراءة فقط)
  /**
   * إجبار عرض صف التشخيص (Dx) حتى لو فاضي — يُستخدم بعد تحليل الحالة
   * لتنبيه الطبيب إن يكتبه يدوياً بدلاً من إخفاء الصف تماماً.
   */
  forceShowDx?: boolean;
}

export const ClinicalDetails: React.FC<ClinicalDetailsProps> = ({
  complaint,
  complaintEn,
  setComplaintEn,
  medicalHistory,
  historyEn,
  setHistoryEn,
  examination,
  examEn,
  setExamEn,
  investigations,
  investigationsEn,
  setInvestigationsEn,
  diagnosisEn,
  setDiagnosisEn,
  clinicalInfoSize,
  clinicalInfoPx,
  clinicalInfoColor,
  clinicalInfoFontFamily,
  clinicalBoxBgColor,
  clinicalBoxBorderColor,
  clinicalBoxBorderWidthPx,
  isDataOnlyMode,
  isPrintMode,
  forceShowDx = false,
}) => {
  const clinicalContainerStyle = {
    ...(clinicalInfoPx ? { fontSize: `${clinicalInfoPx}px` } : {}),
    ...(clinicalInfoColor ? { color: clinicalInfoColor } : {}),
    ...(clinicalInfoFontFamily ? { fontFamily: clinicalInfoFontFamily } : {}),
    ...(clinicalBoxBgColor ? { backgroundColor: clinicalBoxBgColor } : {}),
    ...(clinicalBoxBorderColor ? { borderColor: clinicalBoxBorderColor } : {}),
    ...(clinicalBoxBorderWidthPx !== undefined ? { borderWidth: `${clinicalBoxBorderWidthPx}px`, borderStyle: 'solid' as const } : {}),
  };
  /** أنماط زر المسح (X) الذي يظهر عند الوقوف على الحقل */
  const clearButtonClass = `no-print font-black px-1.5 rounded transition-all ${
    isDataOnlyMode
      ? 'invisible pointer-events-none'
      : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50'
  }`;

  /** دالة لتنظيف النصوص ومقارنتها بالقيم الشائعة التي تعني "لا يوجد بيانات" */
  const normalizePlaceholder = (value?: string) =>
    (value || '')
      .toLowerCase()
      .replace(/[\s._\-:;!?,/]+/g, ' ')
      .trim();

  /** 
   * التحقق مما إذا كان النص يحتوي على معلومة طبية حقيقية (Meaningful).
   * يقوم هذا المنطق بفلترة الكلمات الشائعة التي لا تضيف قيمة طبية (مثل 'None' أو 'N/A') 
   * لضمان عدم حجز مساحة في الروشتة المطبوعة بدون داعٍ.
   */
  const isMeaningful = (value?: string) => {
    const normalized = normalizePlaceholder(value);
    if (!normalized) return false;
    const placeholders = new Set([
      'n a', 'na', 'none', 'not provided', 'not available',
      'no pertinent information', 'no data', 'no data provided',
      'no data available', 'no investigations performed', 'no investigation performed',
    ]);
    return !placeholders.has(normalized);
  };

  /** حالات التحكم في ظهور كل قسم بناءً على وجود بيانات ذات معنى */
  const [complaintVisible, setComplaintVisible] = useState<boolean>(() => isMeaningful(complaintEn));
  const [historyVisible, setHistoryVisible] = useState<boolean>(() => isMeaningful(historyEn));
  const [examVisible, setExamVisible] = useState<boolean>(() => isMeaningful(examEn));
  const [investigationsVisible, setInvestigationsVisible] = useState<boolean>(() => isMeaningful(investigationsEn));
  const [dxVisible, setDxVisible] = useState<boolean>(() => isMeaningful(diagnosisEn));

  /** تحديث الرؤية تلقائياً عند تغيير المحتوى من المصدر (AI مثلاً) */
  useEffect(() => { if (isMeaningful(complaintEn)) setComplaintVisible(true); }, [complaintEn]);
  useEffect(() => { if (isMeaningful(historyEn)) setHistoryVisible(true); }, [historyEn]);
  useEffect(() => { if (isMeaningful(examEn)) setExamVisible(true); }, [examEn]);
  useEffect(() => { if (isMeaningful(investigationsEn)) setInvestigationsVisible(true); }, [investigationsEn]);
  useEffect(() => { if (isMeaningful(diagnosisEn)) setDxVisible(true); }, [diagnosisEn]);

  const showComplaint = complaintVisible && isMeaningful(complaintEn);
  const showHistory = historyVisible && isMeaningful(historyEn);
  const showExam = examVisible && isMeaningful(examEn);
  const showInvestigations = investigationsVisible && isMeaningful(investigationsEn);
  // forceShowDx يُجبر عرض صف Dx حتى لو فاضي (بعد تحليل الحالة — ما نخفيش الصف
  // عشان الطبيب يشوف خانة فاضية ويكتب التشخيص يدوياً). في وضع الطباعة نخفيه لو فاضي
  // عشان ما يطلعش سطر فاضي في الروشتة المطبوعة.
  const showDx = (dxVisible && isMeaningful(diagnosisEn))
    || (forceShowDx && !isPrintMode);
  const hasVisibleSection = showComplaint || showHistory || showExam || showInvestigations || showDx;

  const handleDeleteField = (clearValue: () => void) => { clearValue(); };

  // إذا لم يكن هناك أي سطر لعرضه، لا نعرض الحاوية بالكامل
  if (!hasVisibleSection) return null;

  return (
    <div className="flex flex-col px-1 shrink-0 overflow-visible" style={{ gap: '0px', lineHeight: '1.1' }}>
      <div
        className={`p-1.5 rounded ${clinicalInfoSize} text-slate-800 border bg-slate-50/50 ${
          isDataOnlyMode ? 'border-transparent' : 'border-slate-100'
        }`}
        dir="ltr"
        style={{ display: 'flex', flexDirection: 'column', gap: '0px', lineHeight: '1.1', ...clinicalContainerStyle }}
      >
        {/* قسم الشكوى والتاريخ المرضي (يعرضان بجوار بعضهما إذا وجدا) */}
        {(showComplaint || showHistory) && (
          <div
            className={`grid gap-0 border-b border-transparent ${showComplaint && showHistory ? 'grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}
            style={{ minHeight: '0px', marginBottom: '0px' }}
          >
            {showComplaint && (
              <div className="group flex gap-0.5 items-start border-l border-slate-200/50 pl-1">
                <span className="font-black text-red-800 uppercase text-right pr-1 shrink-0 w-[30px]">C/O:</span>
                <div className="flex-1 min-w-0">
                  <AutoResizeTextarea
                    value={complaintEn || ''}
                    onChange={(e) => { setComplaintVisible(true); setComplaintEn(e.target.value); }}
                    className="font-bold w-full bg-transparent outline-none border-none resize-none p-0 m-0 overflow-visible"
                    style={{ lineHeight: '1.1', minHeight: '0px', textAlign: 'left' }}
                    dir="ltr"
                    readOnlyMode={isPrintMode}
                  />
                </div>
                {!isPrintMode && (
                  <button onClick={() => handleDeleteField(() => { setComplaintVisible(false); setComplaintEn(''); })} className={clearButtonClass}>x</button>
                )}
              </div>
            )}

            {showHistory && (
              <div className="group flex gap-0.5 items-start pr-1">
                <span className="font-black text-red-800 uppercase text-right pr-1 shrink-0 w-[25px]">Hx:</span>
                <div className="flex-1 min-w-0">
                  <AutoResizeTextarea
                    value={historyEn || ''}
                    onChange={(e) => { setHistoryVisible(true); setHistoryEn(e.target.value); }}
                    className="font-bold w-full bg-transparent outline-none border-none resize-none p-0 m-0 overflow-visible"
                    style={{ lineHeight: '1.1', minHeight: '0px', textAlign: 'left' }}
                    dir="ltr"
                    readOnlyMode={isPrintMode}
                  />
                </div>
                {!isPrintMode && (
                  <button onClick={() => handleDeleteField(() => { setHistoryVisible(false); setHistoryEn(''); })} className={clearButtonClass}>x</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* قسم الفحص والأبحاث (Inv) */}
        {(showExam || showInvestigations) && (
          <div
            className={`grid gap-0 border-b border-transparent ${showExam && showInvestigations ? 'grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}
            style={{ minHeight: '0px', marginBottom: '0px' }}
          >
            {showExam && (
              <div className="group grid grid-cols-[30px_1fr_auto] gap-0.5 items-start border-l border-slate-200/50 pl-1">
                <span className="font-black text-red-800 uppercase text-right pr-1 shrink-0">O/E:</span>
                <div className="flex-1 min-w-0">
                  <AutoResizeTextarea
                    value={examEn || ''}
                    onChange={(e) => { setExamVisible(true); setExamEn(e.target.value); }}
                    className="font-bold w-full bg-transparent outline-none border-none resize-none p-0 m-0 overflow-visible"
                    style={{ lineHeight: '1.1', minHeight: '0px', textAlign: 'left' }}
                    dir="ltr"
                    readOnlyMode={isPrintMode}
                  />
                </div>
                {!isPrintMode && (
                  <button onClick={() => handleDeleteField(() => { setExamVisible(false); setExamEn(''); })} className={clearButtonClass}>x</button>
                )}
              </div>
            )}

            {showInvestigations && (
              <div className="group grid grid-cols-[30px_1fr_auto] gap-0.5 items-start pr-1">
                <span className="font-black text-red-800 uppercase text-right pr-1 shrink-0">Inv:</span>
                <div className="flex-1 min-w-0">
                  <AutoResizeTextarea
                    value={investigationsEn || ''}
                    onChange={(e) => { setInvestigationsVisible(true); if (setInvestigationsEn) setInvestigationsEn(e.target.value); }}
                    className="font-bold w-full bg-transparent outline-none border-none resize-none p-0 m-0 overflow-visible text-slate-900"
                    style={{ lineHeight: '1.1', minHeight: '0px', textAlign: 'left' }}
                    dir="ltr"
                    readOnlyMode={isPrintMode}
                  />
                </div>
                {!isPrintMode && (
                  <button onClick={() => handleDeleteField(() => { setInvestigationsVisible(false); if (setInvestigationsEn) setInvestigationsEn(''); })} className={clearButtonClass}>x</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* قسم التشخيص (Dx) - يظهر دائماً في سطر مستقل لضمان وضوحه */}
        {/* لو التشخيص فاضي (صف التنبيه بس) نحط no-print عشان الصف كله ما يطلعش */}
        {/* في الطباعة حتى لو المستخدم طبع بـ Ctrl+P (مش زر التطبيق اللي بيفعّل isPrintMode) */}
        {showDx && (
          <div className={`group grid grid-cols-[30px_1fr_auto] gap-0.5 items-start ${!diagnosisEn ? 'no-print' : ''}`} style={{ minHeight: '0px', marginBottom: '0px' }}>
            <span className="font-black text-red-800 uppercase text-right pr-1 shrink-0">Dx:</span>
            <div className="flex-1 min-w-0">
              <AutoResizeTextarea
                value={diagnosisEn}
                onChange={(e) => { setDxVisible(true); setDiagnosisEn(e.target.value); }}
                className="font-black text-slate-900 w-full bg-transparent outline-none border-none resize-none p-0 m-0 overflow-visible"
                style={{ lineHeight: '1.1', minHeight: '0px', textAlign: 'left' }}
                dir="ltr"
                readOnlyMode={isPrintMode}
                // placeholder للتنبيه فقط — نخفيه في isPrintMode احترازياً بجانب no-print
                placeholder={!isPrintMode && forceShowDx && !diagnosisEn ? 'اكتب التشخيص هنا يدوياً…' : undefined}
              />
            </div>
            {!isPrintMode && (
              <button onClick={() => handleDeleteField(() => { setDxVisible(false); setDiagnosisEn(''); })} className={clearButtonClass}>x</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
