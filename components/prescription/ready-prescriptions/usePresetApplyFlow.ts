/**
 * usePresetApplyFlow:
 * hook لإدارة تدفق "تطبيق القالب على الروشتة الحالية":
 * - يفحص إذا كانت الروشتة الحالية فيها بيانات حقيقية.
 * - إذا كانت فارغة → يُطبّق فوراً (merge).
 * - إذا كانت ممتلئة → يعرض نافذة خيارات الدمج/الاستبدال.
 */
import { useState } from 'react';
import type { PrescriptionItem, ReadyPrescription } from '../../../types';
import type { ApplyMode } from './PresetConfirmDialogs';

interface ApplyOptions {
  medicationsMode?: ApplyMode;
  adviceMode?: ApplyMode;
  labsMode?: ApplyMode;
}

interface HookArgs {
  currentRxItems: PrescriptionItem[];
  currentGeneralAdvice: string[];
  currentLabInvestigations: string[];
  onApply: (preset: ReadyPrescription, options?: ApplyOptions) => void;
}

export function usePresetApplyFlow({
  currentRxItems,
  currentGeneralAdvice,
  currentLabInvestigations,
  onApply,
}: HookArgs) {
  const [applyCandidate, setApplyCandidate] = useState<ReadyPrescription | null>(null);
  const [medicationsMode, setMedicationsMode] = useState<ApplyMode>('merge');
  const [adviceMode, setAdviceMode] = useState<ApplyMode>('merge');
  const [labsMode, setLabsMode] = useState<ApplyMode>('merge');

  // هل توجد بيانات حقيقية (تستخدم لعرض خيارات الدمج بذكاء)
  const [hasRealMedsState, setHasRealMedsState] = useState(false);
  const [hasRealAdviceState, setHasRealAdviceState] = useState(false);
  const [hasRealLabsState, setHasRealLabsState] = useState(false);

  const handleStartApplyPreset = (preset: ReadyPrescription) => {
    // فحص الروشتة الحالية:
    // - ملاحظة لها نص؟
    // - دواء له جرعة أو تعليمات؟
    const hasRealMeds = currentRxItems.some((item) => {
      if (item.type === 'note') return String(item.instructions || '').trim().length > 0;
      return (
        item.type === 'medication' &&
        item.medication &&
        (String(item.dosage || '').trim() || String(item.instructions || '').trim())
      );
    });
    const hasRealAdvice = currentGeneralAdvice.some((s) => String(s || '').trim().length > 0);
    const hasRealLabs = currentLabInvestigations.some((s) => String(s || '').trim().length > 0);

    // الروشتة فارغة → طبّق فوراً بدون سؤال
    if (!hasRealMeds && !hasRealAdvice && !hasRealLabs) {
      onApply(preset, { medicationsMode: 'merge', adviceMode: 'merge', labsMode: 'merge' });
      return;
    }

    // وُجدت بيانات → اعرض نافذة الخيارات
    setHasRealMedsState(hasRealMeds);
    setHasRealAdviceState(hasRealAdvice);
    setHasRealLabsState(hasRealLabs);
    setMedicationsMode('merge');
    setAdviceMode('merge');
    setLabsMode('merge');
    setApplyCandidate(preset);
  };

  // زر سريع: ضبط كل الأنماط على قيمة واحدة (dmj كلي أو استبدال كلي)
  const setAllApplyModes = (mode: ApplyMode) => {
    setMedicationsMode(mode);
    setLabsMode(mode);
    setAdviceMode(mode);
  };

  // تأكيد التطبيق بعد اختيار الأنماط في النافذة
  const confirmApply = () => {
    if (applyCandidate) {
      onApply(applyCandidate, { medicationsMode, adviceMode, labsMode });
      setApplyCandidate(null);
    }
  };

  return {
    applyCandidate,
    medicationsMode,
    adviceMode,
    labsMode,
    hasRealMedsState,
    hasRealAdviceState,
    hasRealLabsState,
    setMedicationsMode,
    setAdviceMode,
    setLabsMode,
    setApplyCandidate,
    setAllApplyModes,
    handleStartApplyPreset,
    confirmApply,
  };
}
