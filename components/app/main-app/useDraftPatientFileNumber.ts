import { useEffect, useMemo, useState } from 'react';
import {
  buildPatientFileDocIdFromNameKey,
  buildPatientFileNameKey,
  patientFilesService,
} from '../../../services/patient-files';

interface UseDraftPatientFileNumberParams {
  userId: string;
  patientName: string;
  activePatientFileId: string | null;
  activePatientFileNumber: number | null;
  activePatientFileNameKey: string | null;
}

const toPositiveFileNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
};

interface DraftPatientFileNumber {
  patientFileNameKey: string;
  patientFileNumber: number;
}

export const useDraftPatientFileNumber = ({
  userId,
  patientName,
  activePatientFileId,
  activePatientFileNumber,
  activePatientFileNameKey,
}: UseDraftPatientFileNumberParams): number | null => {
  const activeNumber = toPositiveFileNumber(activePatientFileNumber);
  const [draftNumber, setDraftNumber] = useState<DraftPatientFileNumber | null>(null);

  const patientFileNameKey = useMemo(() => buildPatientFileNameKey(patientName), [patientName]);
  const expectedPatientFileId = useMemo(
    () => (patientFileNameKey ? buildPatientFileDocIdFromNameKey(patientFileNameKey) : ''),
    [patientFileNameKey]
  );
  const activeNameKey = String(activePatientFileNameKey || '').trim();
  const activeFileId = String(activePatientFileId || '').trim();
  const activeMatchesCurrentPatient = Boolean(
    patientFileNameKey
    && activeNumber
    && (
      (activeNameKey && activeNameKey === patientFileNameKey)
      || (!activeNameKey && activeFileId && activeFileId === expectedPatientFileId)
    )
  );

  useEffect(() => {
    if (!userId || !patientFileNameKey || activeMatchesCurrentPatient) {
      setDraftNumber(null);
      return;
    }

    let cancelled = false;
    setDraftNumber(null);
    const timer = window.setTimeout(() => {
      patientFilesService
        .getPatientFileNumberPreview(userId, patientName)
        .then((preview) => {
          if (cancelled) return;
          if (preview?.patientFileNameKey !== patientFileNameKey) return;
          const patientFileNumber = toPositiveFileNumber(preview.patientFileNumber);
          setDraftNumber(patientFileNumber ? { patientFileNameKey, patientFileNumber } : null);
        })
        .catch(() => {
          if (!cancelled) setDraftNumber(null);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [userId, patientName, patientFileNameKey, activeMatchesCurrentPatient]);

  if (!patientFileNameKey) return null;
  if (activeMatchesCurrentPatient) return activeNumber;
  return draftNumber?.patientFileNameKey === patientFileNameKey ? draftNumber.patientFileNumber : null;
};
