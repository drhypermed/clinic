import React, { forwardRef, useState, useMemo, useEffect } from 'react';
import { PrescriptionItem, Medication, AlternativeMed, PrescriptionSettings, VitalSignConfig } from '../../types';
import { PrescriptionHeader } from './PrescriptionHeader';
import { PrescriptionFooter } from './PrescriptionFooter';
import { AlternativesModal } from './AlternativesModal';
import { InfoBar } from './InfoBar';
import { VitalsSidebar } from './VitalsSidebar';
import { ClinicalDetails } from './ClinicalDetails';
import { RxList } from './RxList';
import { AdditionalNotes } from './AdditionalNotes';
import { getPaperDimensions, getPaperMargins, applyPaperSizeCssVars, injectPrintPageStyle, registerBeforePrintHandler } from '../prescription-settings/utils';

/**
 * الملف: PrescriptionPreview.tsx
 * الوصف: هذا هو المكون "الرئيسي" (Master Component) لمعاينة الروشتة. 
 * يقوم بتجميع كافة المكونات الفرعية (هيدر، فوتر، قائمة أدوية، سايدبار) في صفحة A5 متكاملة. 
 * يتضمن منطقاً معقداً للتحكم في مقياس الرسم (Scaling) لضمان ظهور الروشتة بشكل صحيح 
 * على كافة أحجام الشاشات قبل الطباعة، كما يدعم "وضع البيانات فقط" للطباعة على ورق مطبوع مسبقاً.
 */

interface PrescriptionPreviewProps {
  patientName: string;
  setPatientName: (name: string) => void;
  ageYears: string;
  ageMonths: string;
  ageDays: string;
  weight: string;
  setWeight?: (value: string) => void;
  height?: string;
  setHeight?: (value: string) => void;
  bmi?: string;
  vitals: { bp: string; pulse: string; temp: string; rbs: string; spo2: string; rr: string };
  complaint: string;
  complaintEn: string;
  setComplaintEn: (val: string) => void;
  medicalHistory: string;
  historyEn: string;
  setHistoryEn: (val: string) => void;
  examination: string;
  examEn?: string;
  setExamEn?: (val: string) => void;
  investigations?: string;
  investigationsEn?: string;
  setInvestigationsEn?: (val: string) => void;
  diagnosisEn: string;
  setDiagnosisEn: (val: string) => void;
  rxItems: PrescriptionItem[];
  generalAdvice?: string[];
  labInvestigations?: string[];
  usageStats?: Record<string, number>;
  onRemoveItem: (index: number) => void;
  onUpdateItemName: (index: number, name: string) => void;
  onUpdateItemInstruction: (index: number, instruction: string) => void;
  onUpdateItemFontSize?: (index: number, size: string) => void;
  onUpdateAdvice?: (index: number, val: string) => void;
  onRemoveAdvice?: (index: number) => void;
  onUpdateLab?: (index: number, val: string) => void;
  onRemoveLab?: (index: number) => void;
  onMedicationClick: (med: Medication) => void;
  onSwapItem: (index: number, newMed: AlternativeMed) => void;
  onSelectMedication?: (idx: number, med: Medication) => void;
  isDataOnlyMode?: boolean;      // هل نعرض البيانات فقط (بدون خلفيات وتصميم الطبيب)
  isPrintMode?: boolean;         // وضع الطباعة الحقيقي
  actionsBar?: React.ReactNode;  // شريط الأزرار فوق الروشتة (حفظ، طباعة، الخ)
  consultationDate?: string | null;
  prescriptionSettings?: PrescriptionSettings; // إعدادات الطبيب المخصصة من قاعدة البيانات
  /** إجبار عرض صف Dx فاضي لتنبيه الطبيب بعد تحليل الحالة (بدون اختيار DDx) */
  forceShowDx?: boolean;
}

const DEFAULT_PREVIEW_VITALS: VitalSignConfig[] = [
  { key: 'weight', label: 'Weight', labelAr: 'الوزن', unit: 'kg', enabled: true, order: 1 },
  { key: 'height', label: 'Height', labelAr: 'الطول', unit: 'cm', enabled: true, order: 2 },
  { key: 'bmi', label: 'BMI', labelAr: 'مؤشر الكتلة', unit: '', enabled: true, order: 3 },
  { key: 'rbs', label: 'RBS', labelAr: 'سكر الدم', unit: 'mg/dl', enabled: true, order: 4 },
  { key: 'bp', label: 'BP', labelAr: 'الضغط', unit: 'mmHg', enabled: true, order: 5 },
  { key: 'pulse', label: 'Pulse', labelAr: 'النبض', unit: 'bpm', enabled: true, order: 6 },
  { key: 'temp', label: 'Temp', labelAr: 'الحرارة', unit: '°C', enabled: true, order: 7 },
  { key: 'spo2', label: 'SpO2', labelAr: 'تشبع الأكسجين', unit: '%', enabled: true, order: 8 },
  { key: 'rr', label: 'RR', labelAr: 'التنفس', unit: '/min', enabled: true, order: 9 },
];

// ─── PrescriptionPreview ملفوف بـ React.memo ────────────────────────────
// السبب: الـ component ده ضخم وفيه ResizeObserver + auto-scale + 103 props.
// قبل التغيير: أي state change في الـ parent (مثل interactionsLoading,
// addedDiagnosesFromModal، حروف بتتكتب في خانات إنجليزية مش متمررة هنا) كان
// بيعمل re-render كامل للـ component والـ children كلهم. مع memo، الـ shallow
// compare بيمنع re-render لو الـ props ما اتغيرتش reference (المهم إن الـ
// parent يمرر callbacks مستقرة و actionsBar memoized).
export const PrescriptionPreview = React.memo(forwardRef<HTMLDivElement, PrescriptionPreviewProps>(({
  patientName, setPatientName,
  ageYears, ageMonths, ageDays,
  weight, setWeight, height, setHeight, bmi,
  vitals,
  complaint, complaintEn, setComplaintEn,
  medicalHistory, historyEn, setHistoryEn,
  examination, examEn = '', setExamEn,
  investigations, investigationsEn = '', setInvestigationsEn,
  diagnosisEn, setDiagnosisEn,
  rxItems, generalAdvice = [], labInvestigations = [],
  usageStats,
  onRemoveItem, onUpdateItemName, onUpdateItemInstruction, onUpdateItemFontSize,
  onUpdateAdvice, onRemoveAdvice, onUpdateLab, onRemoveLab,
  onMedicationClick, onSwapItem, onSelectMedication,
  isDataOnlyMode = false,
  isPrintMode = false,
  actionsBar,
  consultationDate,
  prescriptionSettings,
  forceShowDx = false,
}, ref) => {

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [altModalData, setAltModalData] = useState<{ index: number, alts: AlternativeMed[] } | null>(null);

  /**
   * Auto-scale: تصغير محتوى الروشتة تلقائياً لو زاد عن المساحة المتاحة.
   * بنستخدم CSS zoom لأنه بيأثر على الـ layout فعلاً (مش بصري بس زي transform).
   */
  const contentWrapperRef = React.useRef<HTMLDivElement>(null);


  /** أحجام الخطوط والمسافات والألوان والـ fontFamily — من إعدادات المستخدم مع قيم افتراضية */
  const typo = prescriptionSettings?.typography;
  const medNamePx = typo?.medNamePx ?? 13;
  const medInstPx = typo?.medInstPx ?? 12;
  const notesPx = typo?.notesPx ?? 12;
  const notePx = typo?.notePx ?? 15;
  const clinicalInfoPx = typo?.clinicalInfoPx ?? 8.5;
  const rxSymbolPx = typo?.rxSymbolPx ?? 20;
  const rowMinHeightPx = typo?.rowMinHeightPx ?? 18;
  const drugRowPaddingPx = typo?.drugRowPaddingPx ?? 2;
  const drugBorderWidthPx = typo?.drugBorderWidthPx ?? 1;
  const drugBorderColor = typo?.drugBorderColor ?? '#f1f5f9';
  const sectionTitleColor = typo?.sectionTitleColor ?? '#7f1d1d';

  /** أحجام الخطوط والتنسيقات الموحدة للروشتة */
  const theme = {
    medNameSize: `text-[${medNamePx}px]`,
    medInstSize: `text-[${medInstPx}px]`,
    labSize: `text-[${notesPx}px]`,
    clinicalInfoSize: 'text-[8.5px]',
    containerGap: 'gap-0',
    listGap: 'gap-0',
    itemPad: 'pb-0',
    leading: 'leading-[1.25]',
    footerSize: 'text-[8px]',
    headerFontSize: 'text-[13px]',
    medNamePx,
    medInstPx,
    notesPx,
    notePx,
    clinicalInfoPx,
    rxSymbolPx,
    rowMinHeightPx,
    drugRowPaddingPx,
    drugBorderWidthPx,
    drugBorderColor,
    sectionTitleColor,
  };

  // أبعاد الورقة الفعلية المختارة (A4/A5/مخصص) — الروشتة ترتسم بهذه الأبعاد
  // مباشرةً: A5 = 148×210mm، A4 = 210×297mm، custom = الأبعاد المُدخَلة.
  const paperDims = useMemo(() => getPaperDimensions(prescriptionSettings?.paperSize), [prescriptionSettings?.paperSize]);
  const paperMargins = useMemo(() => getPaperMargins(prescriptionSettings?.paperSize), [prescriptionSettings?.paperSize]);
  const paperWidthPx = paperDims.widthMm * 3.7795275591;

  /**
   * تطبيق أبعاد الورقة على CSS Variables وحقن قاعدة @page ديناميكياً.
   * يُحدَّث عند كل تغيير في إعدادات الورقة.
   */
  useEffect(() => {
    applyPaperSizeCssVars(prescriptionSettings?.paperSize);
    injectPrintPageStyle(prescriptionSettings?.paperSize);
  }, [prescriptionSettings?.paperSize]);

  /**
   * مستمع beforeprint: يضمن تطبيق حجم الورقة الصحيح لحظة الطباعة
   * (حتى لو تأخر تحميل الإعدادات من Firebase).
   */
  useEffect(() => {
    const getPaperSize = () => prescriptionSettings?.paperSize;
    return registerBeforePrintHandler(getPaperSize);
  // prescriptionSettings reference changes when Firebase loads, keeping it in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionSettings]);

  /** معالجة حجم المعاينة (Scale) تلقائياً لتناسب عرض الشاشة */
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.clientWidth || containerRef.current.clientWidth;
        const isMobile = window.innerWidth < 640;
        const padding = isMobile ? 12 : 24;
        const availableWidth = Math.max(parentWidth - padding * 2, 0);
        // استخدام عرض الورقة الفعلي للحساب بدلاً من القيمة الثابتة 559
        const nextScale = availableWidth / paperWidthPx;
        const minScale = isMobile ? 0.45 : 0.6;
        const maxScale = 3;
        setScale(Math.max(minScale, Math.min(maxScale, nextScale)));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperWidthPx]);

  /**
   * Auto-scale: تصغير المحتوى تلقائياً لو تجاوز المساحة المتاحة.
   * - بنقيس الارتفاع الحقيقي (scrollHeight) مقارنة بالمتاح (clientHeight)
   * - لو فيه overflow → نحسب zoom ونطبقه (الحد الأدنى 0.6)
   * - لو وصلنا للحد الأدنى ولسه فيه overflow → المحتوى ينزل تحت عادي
   *
   * ملاحظة: الحساب متزامن (sync) حتى نقدر ننفذه من beforeprint قبل فتح
   * حوار الطباعة مباشرةً — يضمن أن الطباعة ترى نفس الـ zoom اللي في المعاينة.
   */
  useEffect(() => {
    const el = contentWrapperRef.current;
    if (!el) return;

    const recalcSync = () => {
      // 1) نرجّع zoom لـ 1 مؤقتاً عشان نقيس الارتفاع الحقيقي
      const prevZoom = el.style.zoom;
      el.style.zoom = '1';

      const available = el.clientHeight;
      const natural = el.scrollHeight;

      if (natural > available && available > 0) {
        const MIN_ZOOM = 0.6;
        const needed = available / natural;
        const newZoom = Math.max(MIN_ZOOM, needed);
        el.style.zoom = String(newZoom);
      } else {
        el.style.zoom = prevZoom === '' ? '1' : prevZoom;
      }
    };

    let rafId = 0;
    const recalcAsync = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recalcSync);
    };

    const ro = new ResizeObserver(recalcAsync);
    ro.observe(el);
    recalcAsync();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rxItems.length, generalAdvice?.length, labInvestigations?.length, complaintEn, historyEn, examEn, diagnosisEn, investigationsEn]);

  /**
   * توليد نص العمر المنسق (Age Formatting).
   * يحول أرقام السنوات والشهور والأيام إلى جملة عربية فصيحة (مثل: 5 سنوات و شهرين و 10 أيام). 
   * يراعي هذا المنطق قواعد المثنى والجمع في اللغة العربية لضمان احترافية النص المطبوع.
   */
  const ageString = useMemo(() => {
    const fmt = (n: number, one: string, two: string, unit: (x: number) => string) => {
      if (n === 1) return one;
      if (n === 2) return two;
      return `${n} ${unit(n)}`;
    };
    const unitY = (n: number) => (n >= 3 && n <= 10) ? 'سنوات' : 'سنة';
    const unitM = (n: number) => (n >= 3 && n <= 10) ? 'أشهر' : 'شهر';
    const unitD = (n: number) => (n >= 3 && n <= 10) ? 'أيام' : 'يوم';
    const parts: string[] = [];
    const years = parseInt(ageYears || '0', 10);
    const months = parseInt(ageMonths || '0', 10);
    const days = parseInt(ageDays || '0', 10);
    if (years > 0) parts.push(fmt(years, 'سنة', 'سنتين', unitY));
    if (months > 0) parts.push(fmt(months, 'شهر', 'شهرين', unitM));
    if (days > 0) parts.push(fmt(days, 'يوم', 'يومين', unitD));
    return parts.length > 0 ? parts.join(' و ') : '';
  }, [ageYears, ageMonths, ageDays]);

  const hasContent = rxItems.length > 0 || !!(complaintEn || historyEn || examEn || diagnosisEn || investigationsEn);

  /** إعداد تهيئة القياسات الحيوية بناءً على خيارات الطبيب في لوحة الإعدادات */
  const vitalConfig = useMemo(() => {
    const vitalsSettings = prescriptionSettings?.vitals;
    const baseSettings = Array.isArray(vitalsSettings) && vitalsSettings.length > 0
      ? vitalsSettings
      : DEFAULT_PREVIEW_VITALS;
    const enabledVitals = baseSettings.filter(v => v.enabled !== false).sort((a, b) => a.order - b.order);

    const valueMap: Record<string, string> = {
      'weight': weight, 'height': height || '', 'bmi': bmi || '',
      'bp': vitals.bp, 'pulse': vitals.pulse, 'temp': vitals.temp,
      'rbs': vitals.rbs, 'spo2': vitals.spo2, 'rr': vitals.rr,
    };

    return enabledVitals.map(v => ({
      key: v.key,
      label: v.labelAr || v.label,
      unit: v.unit,
      value: valueMap[v.key] || ''
    }));
  }, [prescriptionSettings?.vitals, weight, height, bmi, vitals]);

  const showClinicalSection = useMemo(() => {
    // forceShowDx يفعّل ظهور القسم حتى لو Dx فاضي (لتنبيه الطبيب بعد التحليل)
    return !!(complaintEn?.trim() || historyEn?.trim() || examEn?.trim() || diagnosisEn?.trim() || investigationsEn?.trim() || forceShowDx);
  }, [complaintEn, historyEn, examEn, diagnosisEn, investigationsEn, forceShowDx]);

  const middleBackgroundColor = prescriptionSettings?.middle?.middleBgColor
    ? `${prescriptionSettings.middle.middleBgColor}${Math.round((prescriptionSettings.middle.middleBgColorOpacity ?? 0) * 255).toString(16).padStart(2, '0')}`
    : '#ffffff';

  return (
    <>
      {/* حاوية المعاينة (تظهر في وضع التصميم والطباعة) */}
      <div ref={containerRef} className="prescription-preview-root flex flex-col items-center w-full min-h-0 bg-transparent relative pt-1 sm:pt-2 pb-2 print:bg-white print:p-0 print:min-h-0 print:overflow-visible print:pt-0" dir="rtl">

        <div
          id="print-prescription-wrapper"
          style={{ width: `${paperWidthPx * scale}px`, maxWidth: '100%' }}
          className="flex flex-col items-center"
        >
          <div
            id="prescription-scale-container"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: `${paperDims.widthMm}mm`,
              height: `${paperDims.heightMm}mm`,
              marginBottom: `${(scale - 1) * paperDims.heightMm}mm`,
              position: 'relative',
              backgroundColor: '#fff',
            }}
            className="transition-transform duration-200 ease-out"
          >
            {/*
              صفحة الروشتة — ترتسم مباشرةً بأبعاد الورقة الفعلية المختارة:
              A5 = 148×210mm، A4 = 210×297mm، custom = الأبعاد المُدخَلة.
              لا scale صناعي ولا canvas ثابت — نفس منطق A5 مطبّق على أي مقاس.
              Layout: CSS Grid بثلاثة صفوف (auto / minmax(0,1fr) / min-content)
              لضمان ظهور الفوتر دائماً بغض النظر عن ارتفاع المحتوى الأوسط.
            */}
            <div
              id="printable-prescription"
              ref={ref}
              className="rx-paper shadow-xl bg-white text-black box-border print:shadow-none print:border-none print:m-0"
              style={{
                width: `${paperDims.widthMm}mm`,
                height: `${paperDims.heightMm}mm`,
                paddingTop: `${paperMargins.top}mm`,
                paddingRight: `${paperMargins.right}mm`,
                paddingBottom: `${paperMargins.bottom}mm`,
                paddingLeft: `${paperMargins.left}mm`,
                overflow: 'hidden',
                direction: 'rtl',
                display: 'grid',
                gridTemplateRows: 'auto minmax(0, 1fr) min-content',
                boxSizing: 'border-box',
              }}
            >
              {/* الصف الأول: هيدر + بيانات المريض */}
              <div className="flex flex-col">
                <PrescriptionHeader isDataOnlyMode={isDataOnlyMode} headerSettings={prescriptionSettings?.header} />
                <InfoBar
                  patientName={patientName} setPatientName={setPatientName}
                  ageString={ageString} headerFontSize={theme.headerFontSize}
                  isDataOnlyMode={isDataOnlyMode} isPrintMode={isPrintMode}
                  hasContent={hasContent} date={consultationDate}
                  headerSettings={prescriptionSettings?.header}
                />
              </div>

              {/* الصف الثاني: البيانات السريرية + الأدوية + شريط القياسات */}
              <div className="flex min-h-0 relative overflow-hidden" style={{ backgroundColor: middleBackgroundColor }}>
                {/* علامة مائية (Watermark) في الخلفية */}
                {!isDataOnlyMode && prescriptionSettings?.middle?.middleBackgroundImage && (
                  <div
                    style={{
                      position: 'absolute',
                      width: `${prescriptionSettings.middle.middleBgScale ?? 100}%`,
                      height: `${prescriptionSettings.middle.middleBgScale ?? 100}%`,
                      left: `${prescriptionSettings.middle.middleBgPosX ?? 50}%`,
                      top: `${prescriptionSettings.middle.middleBgPosY ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: `url(${prescriptionSettings.middle.middleBackgroundImage})`,
                      backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                      opacity: prescriptionSettings.middle.middleBgOpacity ?? 1, zIndex: 0, pointerEvents: 'none'
                    }}
                  />
                )}
                {/* شريط القياسات الجانبي */}
                <VitalsSidebar vitalConfig={vitalConfig} isDataOnlyMode={isDataOnlyMode} vitalsSection={prescriptionSettings?.vitalsSection} />

                {/* المحتوى النصي: شكوى المريض -> شعار Rx -> قائمة الأدوية -> التعليمات */}
                <div ref={contentWrapperRef} className="flex-1 p-1 flex flex-col overflow-visible relative" style={{ zIndex: 40 }}>
                  {showClinicalSection && (
                    <div className="shrink-0">
                      <ClinicalDetails
                        complaint={complaint} complaintEn={complaintEn} setComplaintEn={setComplaintEn}
                        medicalHistory={medicalHistory} historyEn={historyEn} setHistoryEn={setHistoryEn}
                        examination={examination} examEn={examEn} setExamEn={setExamEn || (() => { })}
                        investigations={investigations} investigationsEn={investigationsEn} setInvestigationsEn={setInvestigationsEn || (() => { })}
                        diagnosisEn={diagnosisEn} setDiagnosisEn={setDiagnosisEn}
                        clinicalInfoSize={theme.clinicalInfoSize} clinicalInfoPx={theme.clinicalInfoPx}
                        clinicalInfoColor={typo?.clinicalInfoColor}
                        clinicalInfoFontFamily={typo?.clinicalInfoFontFamily}
                        clinicalBoxBgColor={typo?.clinicalBoxBgColor}
                        clinicalBoxBorderColor={typo?.clinicalBoxBorderColor}
                        clinicalBoxBorderWidthPx={typo?.clinicalBoxBorderWidthPx}
                        isDataOnlyMode={isDataOnlyMode} isPrintMode={isPrintMode}
                        forceShowDx={forceShowDx}
                      />
                    </div>
                  )}

                  {rxItems.length > 0 && <div className="font-serif font-black italic mb-4 pl-2 shrink-0 text-left" dir="ltr" style={{
                    fontSize: `${theme.rxSymbolPx}px`,
                    color: typo?.rxSymbolColor ?? '#7f1d1d',
                    fontFamily: typo?.rxSymbolFontFamily,
                  }}>Rx</div>}

                  <div className="shrink-0">
                    <RxList
                      rxItems={rxItems} medNameSize={theme.medNameSize} medInstSize={theme.medInstSize}
                      medNamePx={theme.medNamePx} medInstPx={theme.medInstPx}
                      notePx={theme.notePx} drugRowPaddingPx={theme.drugRowPaddingPx}
                      drugBorderWidthPx={theme.drugBorderWidthPx} drugBorderColor={theme.drugBorderColor}
                      medNameColor={typo?.medNameColor} medInstColor={typo?.medInstColor} noteColor={typo?.noteColor}
                      medNameFontFamily={typo?.medNameFontFamily} medInstFontFamily={typo?.medInstFontFamily} noteFontFamily={typo?.noteFontFamily}
                      leading={theme.leading} itemPad={theme.itemPad} listGap={theme.listGap}
                      isDataOnlyMode={isDataOnlyMode} isPrintMode={isPrintMode} usageStats={usageStats}
                      onUpdateItemName={onUpdateItemName} onUpdateItemInstruction={onUpdateItemInstruction}
                      onMedicationClick={onMedicationClick} onRemoveItem={onRemoveItem}
                      onSetAltModal={setAltModalData} onSelectMedication={onSelectMedication}
                    />
                  </div>

                  {/* نصائح عامة وطلبات معامل في الأسفل */}
                  <div className="mt-auto shrink-0">
                    <AdditionalNotes
                      labInvestigations={labInvestigations} generalAdvice={generalAdvice}
                      labSize={theme.labSize} leading={theme.leading} containerGap={theme.containerGap}
                      notesFontSizePx={theme.notesPx} rowMinHeightPx={theme.rowMinHeightPx}
                      notesColor={typo?.notesColor} notesFontFamily={typo?.notesFontFamily}
                      sectionTitlePx={typo?.sectionTitlePx}
                      sectionTitleColor={theme.sectionTitleColor}
                      sectionTitleFontFamily={typo?.sectionTitleFontFamily}
                      isDataOnlyMode={isDataOnlyMode} isPrintMode={isPrintMode}
                      middleBackgroundColor={middleBackgroundColor}
                      onUpdateLab={onUpdateLab} onRemoveLab={onRemoveLab}
                      onUpdateAdvice={onUpdateAdvice} onRemoveAdvice={onRemoveAdvice}
                    />
                  </div>
                </div>
              </div>

              {/*
                الصف الثالث: الفوتر — مضمون الظهور بفضل CSS Grid.
                نستخدم min-h-fit بدل min-h-0 لضمان أن الخلية تأخذ على الأقل
                ارتفاع محتوى الفوتر الطبيعي ولا تنكمش لصفر في حال ضغط الصف
                الأوسط. كما نلف الفوتر في id مخصص لتسهيل الاستهداف في CSS
                الطباعة لو احتجنا قواعد إضافية.
              */}
              <div id="printable-prescription-footer-cell" style={{ minHeight: 'fit-content', display: 'block' }}>
                <PrescriptionFooter
                  isDataOnlyMode={isDataOnlyMode}
                  footerSize={theme.footerSize}
                  footerSettings={prescriptionSettings?.footer}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* شريط الإجراءات العائم (لا يظهر في الطباعة) */}
      {actionsBar && (
        <div className="prescription-preview-toolbar w-full flex justify-center no-print px-2 sm:px-3 pb-3 mt-3 relative z-10">
          <div className="w-full max-w-[148mm] md:max-w-[188mm] lg:max-w-[196mm]">
            {actionsBar}
          </div>
        </div>
      )}

      {/* نافذة اختيار البدائل الدوائية */}
      <AlternativesModal
        isOpen={!!altModalData}
        onClose={() => setAltModalData(null)}
        alternatives={altModalData?.alts || []}
        onSelect={(alt) => {
          if (altModalData) {
            onSwapItem(altModalData.index, alt);
            setAltModalData(null);
          }
        }}
      />
    </>
  );
}));

PrescriptionPreview.displayName = 'PrescriptionPreview';
