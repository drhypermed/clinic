import React from 'react';
import type {
  AlternativeMed,
  Medication,
  PrescriptionItem,
  PrescriptionSettings,
  ReadyPrescription,
} from '../../types';
import { AdditionalNotes } from './AdditionalNotes';
import { ClinicalDetails } from './ClinicalDetails';
import { InfoBar } from './InfoBar';
import { PrescriptionFooter } from './PrescriptionFooter';
import { PrescriptionHeader } from './PrescriptionHeader';
import { RxList } from './RxList';
import { VitalsSidebar } from './VitalsSidebar';

type VitalConfig = React.ComponentProps<typeof VitalsSidebar>['vitalConfig'];

interface PrescriptionPaperProps {
  paperDims: { widthMm: number; heightMm: number };
  paperMargins: { top: number; right: number; bottom: number; left: number };
  paperRef?: React.ForwardedRef<HTMLDivElement>;
  contentWrapperRef?: React.Ref<HTMLDivElement>;
  usePrintIds?: boolean;

  patientName: string;
  setPatientName: (name: string) => void;
  patientFileNumber?: number | null;
  ageString: string;
  vitalConfig: VitalConfig;

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
  forceShowDx?: boolean;

  rxItems: PrescriptionItem[];
  generalAdvice?: string[];
  labInvestigations?: string[];
  readyPrescriptions?: ReadyPrescription[];
  usageStats?: Record<string, number>;

  onRemoveItem: (index: number) => void;
  onUpdateItemName: (index: number, name: string) => void;
  onUpdateItemInstruction: (index: number, instruction: string) => void;
  onUpdateAdvice?: (index: number, val: string) => void;
  onRemoveAdvice?: (index: number) => void;
  onAddAdvice?: () => void;
  onUpdateLab?: (index: number, val: string) => void;
  onRemoveLab?: (index: number) => void;
  onAddLab?: () => void;
  onMedicationClick: (med: Medication) => void;
  onSwapItem?: (index: number, newMed: AlternativeMed) => void;
  onSelectMedication?: (idx: number, med: Medication) => void;
  onSetAltModal: (data: { index: number; alts: AlternativeMed[] }) => void;

  isDataOnlyMode?: boolean;
  isPrintMode?: boolean;
  consultationDate?: string | null;
  prescriptionSettings?: PrescriptionSettings;
}

export const PrescriptionPaper: React.FC<PrescriptionPaperProps> = ({
  paperDims,
  paperMargins,
  paperRef,
  contentWrapperRef,
  usePrintIds = false,

  patientName,
  setPatientName,
  patientFileNumber,
  ageString,
  vitalConfig,

  complaint,
  complaintEn,
  setComplaintEn,
  medicalHistory,
  historyEn,
  setHistoryEn,
  examination,
  examEn = '',
  setExamEn,
  investigations,
  investigationsEn = '',
  setInvestigationsEn,
  diagnosisEn,
  setDiagnosisEn,
  forceShowDx = false,

  rxItems,
  generalAdvice = [],
  labInvestigations = [],
  readyPrescriptions = [],
  usageStats,

  onRemoveItem,
  onUpdateItemName,
  onUpdateItemInstruction,
  onUpdateAdvice,
  onRemoveAdvice,
  onAddAdvice,
  onUpdateLab,
  onRemoveLab,
  onAddLab,
  onMedicationClick,
  onSelectMedication,
  onSetAltModal,

  isDataOnlyMode = false,
  isPrintMode = false,
  consultationDate,
  prescriptionSettings,
}) => {
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

  const hasContent = rxItems.length > 0 || !!(
    complaintEn || historyEn || examEn || diagnosisEn || investigationsEn
  );
  const showClinicalSection = !!(
    complaintEn?.trim()
    || historyEn?.trim()
    || examEn?.trim()
    || diagnosisEn?.trim()
    || investigationsEn?.trim()
    || forceShowDx
  );
  const middleBackgroundColor = prescriptionSettings?.middle?.middleBgColor
    ? `${prescriptionSettings.middle.middleBgColor}${Math.round(
        (prescriptionSettings.middle.middleBgColorOpacity ?? 0) * 255,
      ).toString(16).padStart(2, '0')}`
    : '#ffffff';

  return (
    <div
      id={usePrintIds ? 'printable-prescription' : undefined}
      ref={paperRef}
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
      <div className="flex flex-col">
        <PrescriptionHeader
          isDataOnlyMode={isDataOnlyMode}
          headerSettings={prescriptionSettings?.header}
        />
        <InfoBar
          patientName={patientName}
          setPatientName={setPatientName}
          patientFileNumber={patientFileNumber}
          ageString={ageString}
          headerFontSize="text-[13px]"
          isDataOnlyMode={isDataOnlyMode}
          isPrintMode={isPrintMode}
          hasContent={hasContent}
          date={consultationDate}
          headerSettings={prescriptionSettings?.header}
        />
      </div>

      <div className="flex min-h-0 relative overflow-hidden" style={{ backgroundColor: middleBackgroundColor }}>
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
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: prescriptionSettings.middle.middleBgOpacity ?? 1,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}

        <VitalsSidebar
          vitalConfig={vitalConfig}
          isDataOnlyMode={isDataOnlyMode}
          vitalsSection={prescriptionSettings?.vitalsSection}
        />

        <div ref={contentWrapperRef} className="flex-1 p-1 flex flex-col overflow-visible relative" style={{ zIndex: 40 }}>
          {showClinicalSection && (
            <div className="shrink-0">
              <ClinicalDetails
                complaint={complaint}
                complaintEn={complaintEn}
                setComplaintEn={setComplaintEn}
                medicalHistory={medicalHistory}
                historyEn={historyEn}
                setHistoryEn={setHistoryEn}
                examination={examination}
                examEn={examEn}
                setExamEn={setExamEn || (() => {})}
                investigations={investigations}
                investigationsEn={investigationsEn}
                setInvestigationsEn={setInvestigationsEn || (() => {})}
                diagnosisEn={diagnosisEn}
                setDiagnosisEn={setDiagnosisEn}
                clinicalInfoSize="text-[8.5px]"
                clinicalInfoPx={clinicalInfoPx}
                clinicalInfoColor={typo?.clinicalInfoColor}
                clinicalInfoFontFamily={typo?.clinicalInfoFontFamily}
                clinicalBoxBgColor={typo?.clinicalBoxBgColor}
                clinicalBoxBorderColor={typo?.clinicalBoxBorderColor}
                clinicalBoxBorderWidthPx={typo?.clinicalBoxBorderWidthPx}
                isDataOnlyMode={isDataOnlyMode}
                isPrintMode={isPrintMode}
                forceShowDx={forceShowDx}
              />
            </div>
          )}

          {rxItems.length > 0 && (
            <div
              className="font-serif font-black italic mb-4 pl-2 shrink-0 text-left"
              dir="ltr"
              style={{
                fontSize: `${rxSymbolPx}px`,
                color: typo?.rxSymbolColor ?? '#7f1d1d',
                fontFamily: typo?.rxSymbolFontFamily,
              }}
            >
              Rx
            </div>
          )}

          <div className="shrink-0">
            <RxList
              rxItems={rxItems}
              medNameSize={`text-[${medNamePx}px]`}
              medInstSize={`text-[${medInstPx}px]`}
              medNamePx={medNamePx}
              medInstPx={medInstPx}
              notePx={notePx}
              drugRowPaddingPx={drugRowPaddingPx}
              drugBorderWidthPx={drugBorderWidthPx}
              drugBorderColor={drugBorderColor}
              medNameColor={typo?.medNameColor}
              medInstColor={typo?.medInstColor}
              noteColor={typo?.noteColor}
              medNameFontFamily={typo?.medNameFontFamily}
              medInstFontFamily={typo?.medInstFontFamily}
              noteFontFamily={typo?.noteFontFamily}
              leading="leading-[1.25]"
              itemPad="pb-0"
              listGap="gap-0"
              isDataOnlyMode={isDataOnlyMode}
              isPrintMode={isPrintMode}
              usageStats={usageStats}
              onUpdateItemName={onUpdateItemName}
              onUpdateItemInstruction={onUpdateItemInstruction}
              onMedicationClick={onMedicationClick}
              onRemoveItem={onRemoveItem}
              onSetAltModal={onSetAltModal}
              onSelectMedication={onSelectMedication}
              englishStyle={prescriptionSettings?.middle?.englishStyle}
              arabicStyle={prescriptionSettings?.middle?.arabicStyle}
            />
          </div>

          <div className="mt-auto shrink-0">
            <AdditionalNotes
              labInvestigations={labInvestigations}
              generalAdvice={generalAdvice}
              labSize={`text-[${notesPx}px]`}
              leading="leading-[1.25]"
              containerGap="gap-0"
              notesFontSizePx={notesPx}
              rowMinHeightPx={rowMinHeightPx}
              notesColor={typo?.notesColor}
              notesFontFamily={typo?.notesFontFamily}
              sectionTitlePx={typo?.sectionTitlePx}
              sectionTitleColor={sectionTitleColor}
              sectionTitleFontFamily={typo?.sectionTitleFontFamily}
              isDataOnlyMode={isDataOnlyMode}
              isPrintMode={isPrintMode}
              middleBackgroundColor={middleBackgroundColor}
              onUpdateLab={onUpdateLab}
              onRemoveLab={onRemoveLab}
              onAddLab={onAddLab}
              onUpdateAdvice={onUpdateAdvice}
              onRemoveAdvice={onRemoveAdvice}
              onAddAdvice={onAddAdvice}
              readyPrescriptions={readyPrescriptions}
            />
          </div>
        </div>
      </div>

      <div
        id={usePrintIds ? 'printable-prescription-footer-cell' : undefined}
        style={{ minHeight: 'fit-content', display: 'block' }}
      >
        <PrescriptionFooter
          isDataOnlyMode={isDataOnlyMode}
          footerSize="text-[8px]"
          footerSettings={prescriptionSettings?.footer}
        />
      </div>
    </div>
  );
};
