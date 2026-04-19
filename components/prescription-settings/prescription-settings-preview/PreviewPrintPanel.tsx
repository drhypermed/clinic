/**
 * PreviewPrintPanel:
 * معاينة كاملة للروشتة في تبويب الطباعة (هيدر + وسط + فوتر بهوامش الورقة).
 */
import React from 'react';
import type { PrescriptionSettings, PrescriptionItem } from '../../../types';
import { PrescriptionHeader } from '../../prescription/PrescriptionHeader';
import { InfoBar } from '../../prescription/InfoBar';
import { PrescriptionFooter } from '../../prescription/PrescriptionFooter';
import { VitalsSidebar } from '../../prescription/VitalsSidebar';
import { RxList } from '../../prescription/RxList';
import { AdditionalNotes } from '../../prescription/AdditionalNotes';
import { ClinicalDetails } from '../../prescription/ClinicalDetails';
import { MM_TO_PX } from '../utils';
import {
  PRINT_PREVIEW_LABS,
  PRINT_PREVIEW_ADVICE,
  PRINT_PREVIEW_CLINICAL,
} from './helpers';
import { PreviewMiddleBackground } from './PreviewMiddleBackground';

interface Props {
  localSettings: PrescriptionSettings;
  paperHeightPx: number;
  paperMargins: { top: number; right: number; bottom: number; left: number };
  printScale: number;
  printOffset: { x: number; y: number };
  middleBgColor: string;
  printRxItems: PrescriptionItem[];
  // نوع vitalConfig معقّد ويأتي من buildVitalConfigForPreview — نستخدم ReturnType لتجنّب تكراره
  vitalConfig: React.ComponentProps<typeof VitalsSidebar>['vitalConfig'];
}

export const PreviewPrintPanel: React.FC<Props> = ({
  localSettings,
  paperHeightPx,
  paperMargins,
  printScale,
  printOffset,
  middleBgColor,
  printRxItems,
  vitalConfig,
}) => {
  // محاكاة لحظية لنسبة التصغير والإزاحة (بدلاً من ظهورهما فقط عند الطباعة)
  const transform =
    printScale < 1
      ? `scale(${printScale}) translate(${printOffset.x * MM_TO_PX}px, ${printOffset.y * MM_TO_PX}px)`
      : printOffset.x || printOffset.y
        ? `translate(${printOffset.x * MM_TO_PX}px, ${printOffset.y * MM_TO_PX}px)`
        : undefined;

  return (
    <div
      style={{
        width: '100%',
        height: `${paperHeightPx}px`,
        backgroundColor: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
        boxSizing: 'border-box',
        paddingTop: `${paperMargins.top * MM_TO_PX}px`,
        paddingRight: `${paperMargins.right * MM_TO_PX}px`,
        paddingBottom: `${paperMargins.bottom * MM_TO_PX}px`,
        paddingLeft: `${paperMargins.left * MM_TO_PX}px`,
        transform,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          direction: 'rtl',
          boxSizing: 'border-box',
        }}
      >
        {/* الهيدر + بيانات المريض */}
        <div className="flex flex-col shrink-0">
          <PrescriptionHeader headerSettings={localSettings.header} isDataOnlyMode={false} />
          <InfoBar
            patientName="أحمد محمد علي"
            setPatientName={() => {}}
            ageString="42 سنة"
            headerFontSize="text-[13px]"
            isDataOnlyMode={false}
            isPrintMode={true}
            hasContent={true}
            date={new Date().toISOString()}
            headerSettings={localSettings.header}
          />
        </div>

        {/* القسم الأوسط: قياسات + أدوية */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            direction: 'rtl',
            position: 'relative',
            backgroundColor: middleBgColor,
            overflow: 'hidden',
          }}
        >
          <PreviewMiddleBackground middle={localSettings.middle} />
          <VitalsSidebar
            vitalConfig={vitalConfig}
            isDataOnlyMode={false}
            vitalsSection={localSettings.vitalsSection}
          />
          <div
            style={{
              flex: 1,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            {/* قسم معلومات الكشف الإكلينيكية (شكوى/تاريخ/فحص/تشخيص) */}
            <div className="shrink-0 mb-1">
              <ClinicalDetails
                complaint=""
                complaintEn={PRINT_PREVIEW_CLINICAL.complaintEn}
                setComplaintEn={() => {}}
                medicalHistory=""
                historyEn={PRINT_PREVIEW_CLINICAL.historyEn}
                setHistoryEn={() => {}}
                examination=""
                examEn={PRINT_PREVIEW_CLINICAL.examEn}
                setExamEn={() => {}}
                investigations=""
                investigationsEn=""
                setInvestigationsEn={() => {}}
                diagnosisEn={PRINT_PREVIEW_CLINICAL.diagnosisEn}
                setDiagnosisEn={() => {}}
                clinicalInfoSize=""
                clinicalInfoPx={localSettings.typography?.clinicalInfoPx ?? 8.5}
                clinicalInfoColor={localSettings.typography?.clinicalInfoColor}
                clinicalInfoFontFamily={localSettings.typography?.clinicalInfoFontFamily}
                clinicalBoxBgColor={localSettings.typography?.clinicalBoxBgColor}
                clinicalBoxBorderColor={localSettings.typography?.clinicalBoxBorderColor}
                clinicalBoxBorderWidthPx={localSettings.typography?.clinicalBoxBorderWidthPx}
                isDataOnlyMode={false}
                isPrintMode={true}
              />
            </div>
            <div
              className="font-serif font-black italic mb-2 shrink-0 text-left"
              dir="ltr"
              style={{
                fontSize: `${localSettings.typography?.rxSymbolPx ?? 20}px`,
                color: localSettings.typography?.rxSymbolColor ?? '#7f1d1d',
                fontFamily: localSettings.typography?.rxSymbolFontFamily,
              }}
            >
              Rx
            </div>
            <RxList
              rxItems={printRxItems}
              medNameSize=""
              medInstSize=""
              medNamePx={localSettings.typography?.medNamePx ?? 13}
              medInstPx={localSettings.typography?.medInstPx ?? 12}
              notePx={localSettings.typography?.notePx ?? 15}
              medNameColor={localSettings.typography?.medNameColor}
              medInstColor={localSettings.typography?.medInstColor}
              noteColor={localSettings.typography?.noteColor}
              medNameFontFamily={localSettings.typography?.medNameFontFamily}
              medInstFontFamily={localSettings.typography?.medInstFontFamily}
              noteFontFamily={localSettings.typography?.noteFontFamily}
              drugRowPaddingPx={localSettings.typography?.drugRowPaddingPx ?? 2}
              drugBorderWidthPx={localSettings.typography?.drugBorderWidthPx ?? 1}
              drugBorderColor={localSettings.typography?.drugBorderColor ?? '#f1f5f9'}
              leading="leading-[1.1]"
              itemPad="py-1"
              listGap="gap-0.5"
              isDataOnlyMode={false}
              isPrintMode={true}
              onUpdateItemName={() => {}}
              onUpdateItemInstruction={() => {}}
              onMedicationClick={() => {}}
              onRemoveItem={() => {}}
              onSetAltModal={() => {}}
              /* لا نمرر englishStyle/arabicStyle في معاينة الطباعة عشان إعدادات typography تظهر صافية */
            />
            {/* الفحوصات والتعليمات في نفس مكانها بالروشتة الحقيقية (أسفل قائمة الأدوية) */}
            <div className="mt-auto shrink-0">
              <AdditionalNotes
                labInvestigations={PRINT_PREVIEW_LABS}
                generalAdvice={PRINT_PREVIEW_ADVICE}
                labSize=""
                leading="leading-[1.1]"
                containerGap="gap-0"
                notesFontSizePx={localSettings.typography?.notesPx ?? 12}
                notesColor={localSettings.typography?.notesColor}
                notesFontFamily={localSettings.typography?.notesFontFamily}
                rowMinHeightPx={localSettings.typography?.rowMinHeightPx ?? 18}
                sectionTitlePx={localSettings.typography?.sectionTitlePx}
                sectionTitleColor={localSettings.typography?.sectionTitleColor ?? '#7f1d1d'}
                sectionTitleFontFamily={localSettings.typography?.sectionTitleFontFamily}
                isDataOnlyMode={false}
                isPrintMode={true}
              />
            </div>
          </div>
        </div>

        {/* الفوتر */}
        <div className="shrink-0 mt-auto">
          <PrescriptionFooter
            footerSettings={localSettings.footer}
            isDataOnlyMode={false}
            footerSize="medium"
          />
        </div>
      </div>
    </div>
  );
};
