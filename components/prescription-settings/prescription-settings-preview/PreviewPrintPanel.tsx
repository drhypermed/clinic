/**
 * PreviewPrintPanel:
 * Uses the same prescription paper body used by the printable prescription.
 * The surrounding settings preview can still scale/offset the paper visually.
 */
import React from 'react';
import type { PrescriptionItem, PrescriptionSettings } from '../../../types';
import { PrescriptionPaper } from '../../prescription/PrescriptionPaper';
import { getPaperDimensions } from '../utils';
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
  const contentWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const paperDims = getPaperDimensions(localSettings?.paperSize);
  const paperTransform = printScale < 1 ? `scale(${printScale})` : undefined;

  React.useLayoutEffect(() => {
    const el = contentWrapperRef.current;
    if (!el) return;

    let rafId = 0;
    const recalc = () => {
      el.style.zoom = '1';

      const available = el.clientHeight;
      const natural = el.scrollHeight;
      if (natural > available && available > 0) {
        const MIN_ZOOM = 0.58;
        const nextZoom = Math.max(MIN_ZOOM, Math.min(1, (available - 6) / natural));
        el.style.zoom = String(nextZoom);
      }
    };

    const recalcAsync = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recalc);
    };

    const ro = new ResizeObserver(recalcAsync);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    recalcAsync();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
      el.style.zoom = '1';
    };
  }, [localSettings, printRxItems, vitalConfig]);

  return (
    <div
      style={{
        width: '100%',
        height: `${paperHeightPx}px`,
        backgroundColor: '#fff',
        overflow: 'hidden',
        direction: 'rtl',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: `${paperDims.widthMm}mm`,
          height: `${paperDims.heightMm}mm`,
          marginTop: `${printOffset.y}mm`,
          marginLeft: `${printOffset.x}mm`,
          position: 'relative',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            width: `${paperDims.widthMm}mm`,
            height: `${paperDims.heightMm}mm`,
            transform: paperTransform,
            transformOrigin: 'center center',
          }}
        >
          <PrescriptionPaper
            paperDims={paperDims}
            paperMargins={paperMargins}
            contentWrapperRef={contentWrapperRef}
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
      </div>
    </div>
  );
};
