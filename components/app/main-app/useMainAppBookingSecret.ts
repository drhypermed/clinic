// ─────────────────────────────────────────────────────────────────────────────
// Hook إدارة "سر الحجز" للفرع النشط (useMainAppBookingSecret)
// ─────────────────────────────────────────────────────────────────────────────
// الـ booking secret هو كود سري بيستخدمه الفرع في فورم الحجز العام.
// كل فرع عنده secret مستقل (عشان السكرتارية تدخل من فرعها فقط).
//
// وظيفتين:
//   1) handleBookingSecretReady: يستدعى لما secret جديد يتولد (مثلاً أول مرة).
//      بيحفظه في الـ state + في Firestore + على الفرع الحالي لو مفيهوش.
//
//   2) effect تلقائي: لما الفرع يتبدل، نحمل secret الفرع الجديد (أو null لو
//      الفرع الرئيسي مفيهوش secret — يتحل بالطريقة القديمة).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect } from 'react';
import { firestoreService } from '../../../services/firestore';
import type { Branch } from '../../../types';

interface UseMainAppBookingSecretParams {
  userId: string;
  activeBranchId: string | null;
  branches: Branch[];
  setBookingSecret: (secret: string | null) => void;
  updateBranch: (branch: Branch) => Promise<void>;
}

export const useMainAppBookingSecret = ({
  userId,
  activeBranchId,
  branches,
  setBookingSecret,
  updateBranch,
}: UseMainAppBookingSecretParams) => {
  /**
   * يستدعى لما bookingConfig يرجع secret جديد.
   * بيحفظه على الفرع النشط فقط لو الفرع ملوش secret من قبل (ما نكتبش فوق القديم).
   */
  const handleBookingSecretReady = useCallback((secret: string) => {
    setBookingSecret(secret);
    // ضمان ربط الـ bookingConfig بالـ userId و branchId (silent — لو فشل ما نكسرش الواجهة)
    firestoreService.ensureBookingConfigUserId(secret, userId, activeBranchId).catch(() => { });

    const currentBranch = branches.find(b => b.id === activeBranchId);
    if (currentBranch && !currentBranch.secretarySecret) {
      updateBranch({ ...currentBranch, secretarySecret: secret }).catch(() => { });
    }
  }, [userId, branches, activeBranchId, setBookingSecret, updateBranch]);

  // لما الفرع يتبدل: نحمل secret الفرع الجديد، أو null للفرع الرئيسي
  useEffect(() => {
    const currentBranch = branches.find(b => b.id === activeBranchId);
    if (currentBranch?.secretarySecret) {
      setBookingSecret(currentBranch.secretarySecret);
      // نتأكد إن bookingConfig مربوط بالـ userId و branchId الحاليين
      firestoreService.ensureBookingConfigUserId(
        currentBranch.secretarySecret,
        userId,
        activeBranchId,
      ).catch(() => { });
    } else {
      // الفرع الرئيسي — نرجع null عشان يتحل بالطريقة العادية
      setBookingSecret(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranchId, branches, userId]);

  return { handleBookingSecretReady };
};
