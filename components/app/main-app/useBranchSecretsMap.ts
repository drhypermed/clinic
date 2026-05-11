// ─────────────────────────────────────────────────────────────────────────────
// Hook قراءة أسرار الفروع (useBranchSecretsMap)
// ─────────────────────────────────────────────────────────────────────────────
// 🔒 تشديد أمني 2026-05-10:
// أسرار الفروع اتنقلت من `users/{uid}/branches/{id}.secretarySecret` لـ
// `users/{uid}.bookingSecretByBranch.{branchId}` (وثيقة المستخدم — السكرتيرة
// ممنوعة من قراءتها).
//
// الـ hook ده يجلب الـ map للطبيب، ويعمل refresh لما الفروع تتغير (إنشاء/حذف).
// مش بيـsubscribe على الوثيقة بشكل لحظي عشان وثيقة المستخدم بتتغير كتير
// (FCM tokens مثلاً) → يسبب re-renders زيادة بدون فايدة.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getAllBranchSecretsMap } from '../../../services/firestore/branches';

interface UseBranchSecretsMapResult {
  /** خريطة branchId → secret (الفرع الرئيسي مش فيها — secret المُذاكرة `users/{uid}.bookingSecret`) */
  secretsMap: Record<string, string>;
  /** يستدعي القراءة من جديد (مفيد بعد إنشاء/حذف فرع) */
  refresh: () => void;
}

export const useBranchSecretsMap = (
  userId: string | null,
  branchesSignature: string,
): UseBranchSecretsMapResult => {
  const [secretsMap, setSecretsMap] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      setSecretsMap({});
      return;
    }
    let cancelled = false;
    getAllBranchSecretsMap(userId)
      .then((map) => { if (!cancelled) setSecretsMap(map); })
      .catch(() => { if (!cancelled) setSecretsMap({}); });
    return () => { cancelled = true; };
    // branchesSignature في الـ deps عشان نعيد القراءة عند إنشاء/حذف فرع
  }, [userId, branchesSignature, refreshKey]);

  return {
    secretsMap,
    refresh: () => setRefreshKey((k) => k + 1),
  };
};
