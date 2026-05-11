// ─────────────────────────────────────────────────────────────────────────────
// Hook إدارة "سر الحجز" للفرع النشط (useMainAppBookingSecret)
// ─────────────────────────────────────────────────────────────────────────────
// الـ booking secret هو كود سري بيستخدمه الفرع في فورم الحجز العام.
// كل فرع عنده secret مستقل (عشان السكرتارية تدخل من فرعها فقط).
//
// 🔒 تشديد أمني 2026-05-10: الـ secret اتنقل من وثيقة الفرع لوثيقة المستخدم
//    (`users/{uid}.bookingSecretByBranch.{branchId}`) عشان السكرتيرة لا تقدر
//    تقراه. الـ map بيتمرّر من `useBranchSecretsMap` في الـ parent.
//
// الترتيب مهم:
//   1) sync lookup من branchSecretsMap (مفيش flicker/race)
//   2) fallback لـ branches[branchId].secretarySecret القديم لو لسه ما اتعملش migration
//   3) لو الاتنين فاضيين → نخلي bookingSecret = null
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { firestoreService } from '../../../services/firestore';
import type { Branch } from '../../../types';

interface UseMainAppBookingSecretParams {
  userId: string;
  activeBranchId: string | null;
  branches: Branch[];
  /** خريطة branchId → secret من المكان الآمن (`users/{uid}.bookingSecretByBranch`) */
  branchSecretsMap: Record<string, string>;
  doctorSpecialty?: string | null;
  setBookingSecret: (secret: string | null) => void;
  /** @deprecated مش مستخدم بعد ما الـ secret اتنقل من وثيقة الفرع */
  updateBranch: (branch: Branch) => Promise<void>;
}

export const useMainAppBookingSecret = ({
  userId,
  activeBranchId,
  branches,
  branchSecretsMap,
  doctorSpecialty,
  setBookingSecret,
}: UseMainAppBookingSecretParams) => {
  /**
   * يستدعى لما bookingConfig يرجع secret جديد للفرع النشط.
   * بيحفظه على وثيقة المستخدم (مكان آمن) — مش على وثيقة الفرع.
   *
   * ⚠️ مصالحة 2026-05-10: الكود القديم كان بيكتب أي سر داخل لو الـmap فاضي،
   * حتى لو فيه سر تاني محفوظ (race condition: الـmap لسه ما اتحمّلش من Firestore
   * بس فعلاً السر موجود). النتيجة: سرّان مختلفان لنفس الفرع — السكرتيرة بتشوف
   * واحد، الطبيب بيكتب على التاني.
   * الإصلاح: قبل الكتابة، نقرا fresh من Firestore (مش من state).
   *   - لو فيه سر موجود مختلف → نستخدمه (السكرتيرة عارفاه فعلاً)، ما نكتبش
   *   - لو القديم legacy موجود مختلف → نهاجره ونستخدمه
   *   - لو مفيش حاجة → نكتب اللي وصلنا
   */
  const handleBookingSecretReady = useCallback(async (secret: string) => {
    setBookingSecret(secret);
    // ضمان ربط الـ bookingConfig بالـ userId و branchId (silent — لو فشل ما نكسرش الواجهة)
    firestoreService.ensureBookingConfigUserId(secret, userId, activeBranchId, doctorSpecialty).catch(() => { });

    if (!activeBranchId || activeBranchId === 'main') return;

    try {
      // قراءة fresh من Firestore — ما نعتمدش على state ممكن يكون stale
      const userSnap = await getDoc(doc(db, 'users', userId));
      const userData = (userSnap.exists() ? userSnap.data() : {}) as { bookingSecretByBranch?: Record<string, string> };
      const existingNew = String(userData?.bookingSecretByBranch?.[activeBranchId] || '').trim();

      if (existingNew && existingNew !== secret) {
        // تعارض: في سر تاني محفوظ في المكان الآمن، السكرتيرة بتشوفه على الأرجح.
        // ما نكتبش السر الجديد — نستخدم القديم.
        console.warn('[bookingSecret] conflict in safe map — using existing', { branchId: activeBranchId, existingNew, incoming: secret });
        setBookingSecret(existingNew);
        firestoreService.ensureBookingConfigUserId(existingNew, userId, activeBranchId, doctorSpecialty).catch(() => { });
        return;
      }
      if (existingNew) return; // متطابق — مفيش حاجة نعملها

      // مفيش في المكان الآمن — نشوف القديم
      const branchSnap = await getDoc(doc(db, 'users', userId, 'branches', activeBranchId));
      const legacy = String((branchSnap.exists() ? branchSnap.data()?.secretarySecret : '') || '').trim();
      if (legacy && legacy !== secret) {
        // legacy موجود ومختلف — هذا هو السر اللي السكرتيرة عارفاه. هاجره واستخدمه.
        console.warn('[bookingSecret] using legacy over incoming', { branchId: activeBranchId, legacy, incoming: secret });
        await setDoc(
          doc(db, 'users', userId),
          { bookingSecretByBranch: { [activeBranchId]: legacy } },
          { merge: true },
        ).catch(() => { });
        setBookingSecret(legacy);
        firestoreService.ensureBookingConfigUserId(legacy, userId, activeBranchId, doctorSpecialty).catch(() => { });
        return;
      }

      // لا تعارض — اكتب السر الجديد آمناً
      await setDoc(
        doc(db, 'users', userId),
        { bookingSecretByBranch: { [activeBranchId]: secret } },
        { merge: true },
      ).catch(() => { });
    } catch (err) {
      console.warn('[bookingSecret] reconciliation failed:', err);
    }
  }, [userId, activeBranchId, doctorSpecialty, setBookingSecret]);

  // لما الفرع يتبدل: نحدد الـ secret من المكان الآمن (sync) أو القديم (fallback)
  useEffect(() => {
    if (!activeBranchId || activeBranchId === 'main') {
      // الفرع الرئيسي — يستخدم السر الموحد من `users/{uid}.bookingSecret`.
      // نقراه فوراً علشان لو الطبيب بدّل من فرع فرعي للرئيسي يلاقي السر الصح،
      // مش يفضل null والـ alerts ما توصلش للسكرتيرة.
      if (!userId) {
        setBookingSecret(null);
        return;
      }
      firestoreService
        .getOrCreateBookingSecret(userId, doctorSpecialty)
        .then((unifiedSecret) => {
          setBookingSecret(unifiedSecret);
          firestoreService.ensureBookingConfigUserId(unifiedSecret, userId, 'main', doctorSpecialty).catch(() => { });
        })
        .catch(() => setBookingSecret(null));
      return;
    }
    // 1) المكان الآمن الجديد (sync)
    const fromMap = branchSecretsMap[activeBranchId];
    if (fromMap) {
      setBookingSecret(fromMap);
      firestoreService.ensureBookingConfigUserId(fromMap, userId, activeBranchId, doctorSpecialty).catch(() => { });
      return;
    }
    // 2) Fallback للقديم (sync — من state branches اللي محفوظ فيه legacy secretarySecret)
    const legacyBranch = branches.find((b) => b.id === activeBranchId);
    const legacySecret = legacyBranch?.secretarySecret || '';
    if (legacySecret) {
      setBookingSecret(legacySecret);
      firestoreService.ensureBookingConfigUserId(legacySecret, userId, activeBranchId, doctorSpecialty).catch(() => { });
      // ⚠️ migration: انقل للمكان الآمن — best-effort (الـcleanup من الوثيقة القديمة
      // بيحصل في getAllBranchSecretsMap اللي بيـtrigger من useBranchSecretsMap).
      setDoc(
        doc(db, 'users', userId),
        { bookingSecretByBranch: { [activeBranchId]: legacySecret } },
        { merge: true },
      ).catch(() => { });
      return;
    }
    // 3) لا يوجد secret — مش هنعرف نكتب على bookingConfig حالياً
    setBookingSecret(null);
  }, [activeBranchId, branches, branchSecretsMap, doctorSpecialty, userId, setBookingSecret]);

  // 🛠️ مصالحة دفعية لكل الفروع لمرة واحدة عند فتح التطبيق:
  // لو فرع عنده legacy secretarySecret مختلف عن السر في المكان الآمن، نفضّل
  // الـlegacy (السكرتيرة عارفاه فعلاً) ونحدّث المكان الآمن. ده يصلح حالات
  // الـrace السابقة اللي خلقت سرّين مختلفين لنفس الفرع.
  useEffect(() => {
    if (!userId || !branches.length) return;
    let cancelled = false;
    void (async () => {
      try {
        for (const b of branches) {
          if (!b.id || b.id === 'main') continue;
          const legacy = String(b.secretarySecret || '').trim();
          if (!legacy) continue;
          const fromMap = branchSecretsMap[b.id];
          if (fromMap && fromMap !== legacy) {
            // تعارض حقيقي: المكان الآمن فيه سر، والـlegacy فيه سر مختلف.
            // السكرتيرة على الأرجح عارفة الـlegacy (أقدم وأكثر استخداماً).
            console.warn('[bookingSecret] reconciling branch — preferring legacy', { branchId: b.id, fromMap, legacy });
            if (cancelled) return;
            await setDoc(
              doc(db, 'users', userId),
              { bookingSecretByBranch: { [b.id]: legacy } },
              { merge: true },
            ).catch(() => { });
          }
        }
      } catch (err) {
        console.warn('[bookingSecret] batch reconciliation failed:', err);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, branches.map((b) => `${b.id}:${b.secretarySecret || ''}`).join(',')]);

  return { handleBookingSecretReady };
};
