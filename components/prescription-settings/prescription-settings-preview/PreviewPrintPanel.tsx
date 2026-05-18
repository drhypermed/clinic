/**
 * PreviewPrintPanel:
 * Uses the same prescription paper body used by the printable prescription.
 * The surrounding settings preview can still scale/offset the paper visually.
 */
import React from 'react';
import type { PrescriptionItem, PrescriptionSettings } from '../../../types';
import { PrescriptionPaper } from '../../prescription/PrescriptionPaper';
import { getPaperDimensions, MM_TO_PX } from '../utils';
import {
  PREVIEW_PATIENT_FILE_NUMBER,
  PRINT_PREVIEW_ADVICE,
  PRINT_PREVIEW_CLINICAL,
  PRINT_PREVIEW_LABS,
} from './helpers';
import { VitalsSidebar } from '../../prescription/VitalsSidebar';

interface Props {
  localSettings: PrescriptionSettings;
  paperHeightPx: number;
  paperMargins: { top: number; right: number; bottom: number; left: number };
  printScale: number;
  printOffset: { x: number; y: number };
  printRxItems: PrescriptionItem[];
  vitalConfig: React.ComponentProps<typeof VitalsSidebar>['vitalConfig'];
}

const noop = () => {};

export const PreviewPrintPanel: React.FC<Props> = ({
  localSettings,
  paperHeightPx,
  paperMargins,
  printScale,
  printOffset,
  printRxItems,
  vitalConfig,
}) => {
  const paperDims = getPaperDimensions(localSettings?.paperSize);
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
        direction: 'rtl',
        boxSizing: 'border-box',
        transform,
        transformOrigin: 'center center',
      }}
    >
      <PrescriptionPaper
        paperDims={paperDims}
        paperMargins={paperMargins}
        usePrintIds={false}
        patientName="أحمد محمد علي"
        setPatientName={noop}
        patientFileNumber={PREVIEW_PATIENT_FILE_NUMBER}
        ageString="42 سنة"
        vitalConfig={vitalConfig}
        complaint=""
        complaintEn={PRINT_PREVIEW_CLINICAL.complaintEn}
        setComplaintEn={noop}
        medicalHistory=""
        historyEn={PRINT_PREVIEW_CLINICAL.historyEn}
        setHistoryEn={noop}
        examination=""
        examEn={PRINT_PREVIEW_CLINICAL.examEn}
        setExamEn={noop}
        investigations=""
        investigationsEn=""
        setInvestigationsEn={noop}
        diagnosisEn={PRINT_PREVIEW_CLINICAL.diagnosisEn}
        setDiagnosisEn={noop}
        rxItems={printRxItems}
        labInvestigations={PRINT_PREVIEW_LABS}
        generalAdvice={PRINT_PREVIEW_ADVICE}
        onUpdateItemName={noop}
        onUpdateItemInstruction={noop}
        onMedicationClick={noop}
        onRemoveItem={noop}
        onSetAltModal={noop}
        onUpdateLab={noop}
        onRemoveLab={noop}
        onAddLab={noop}
        onUpdateAdvice={noop}
        onRemoveAdvice={noop}
        onAddAdvice={noop}
        isDataOnlyMode={false}
        isPrintMode={true}
        consultationDate={new Date().toISOString()}
        prescriptionSettings={localSettings}
      />
    </div>
  );
};
