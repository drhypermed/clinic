// ─────────────────────────────────────────────────────────────────────────────
// Hook: useHostAwareMeta
// ─────────────────────────────────────────────────────────────────────────────
// Hook بيحدّث الـmeta tags مع كل navigation داخلي في React Router —
// عشان الـcanonical يتبع الـURL الحالي (كل صفحه ليها canonical خاص).
//
// المنطق الفعلي في utils/hostAwareMeta.ts (دالّه نقيّه) عشان نقدر نستدعيها
// pre-mount في index.tsx قبل ما React يشتغل.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyHostAwareMeta } from '../../../utils/hostAwareMeta';

export const useHostAwareMeta = () => {
  // useLocation عشان الـhook يعيد الحساب مع كل navigation داخلي
  const { pathname } = useLocation();

  useEffect(() => {
    applyHostAwareMeta(pathname);
  }, [pathname]);
};
