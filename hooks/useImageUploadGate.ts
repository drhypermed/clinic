/**
 * useImageUploadGate — يتحقق هل الطبيب الحالي مسموح له برفع صور.
 *
 * القاعدة (مأخوذة من إعدادات الأدمن في settings/accountTypeControls):
 *   - الـPro و Pro Max: مسموح دائماً.
 *   - الـFree: مسموح فقط لو الأدمن فعّل `freeImageUploadsEnabled = true`.
 *
 * استثناء: صورة الترخيص في إنشاء حساب لا تمر بهذا الفحص (الفحص
 * يحتاج user مسجّل دخول، والترخيص بيتم رفعه قبل الإنشاء).
 *
 * 💰 التكلفة: قراءتان cache-first عند أول استخدام (user doc + settings).
 *    الـcache بيتعامل مع التكرار، فلو نفس الصفحة فيها كذا upload، قراءة واحدة فقط.
 */

import { useCallback, useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import { useAuth } from './useAuth';
import { resolveEffectiveAccountTypeFromData } from '../utils/accountStatusTime';
import { ACCOUNT_TYPE_CONTROL_DOC_ID, DEFAULT_CONTROLS } from '../services/account-type-controls/defaults';

interface ImageUploadGateState {
  /** هل الفحص خلص؟ قبل ما يخلص، الزر بيظهر بس الضغط يعرض loader قصير */
  ready: boolean;
  /** هل الطبيب يقدر يرفع صور دلوقتي؟ */
  canUpload: boolean;
  /** رسالة الترقية (من إعدادات الأدمن) — تعرض في المودال */
  upgradeMessage: string;
  /** رابط واتساب الإدارة مع رسالة جاهزة للترقية */
  whatsappUrl: string;
}

/** يبني wa.me URL من رقم + رسالة (encoded) */
const buildWhatsAppUrl = (rawNumber: string, message: string): string => {
  const digits = String(rawNumber || '').replace(/\D/g, '').replace(/^00/, '');
  if (!digits) return '';
  const safeMessage = String(message || '').trim();
  return safeMessage
    ? `https://wa.me/${digits}?text=${encodeURIComponent(safeMessage)}`
    : `https://wa.me/${digits}`;
};

export const useImageUploadGate = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ImageUploadGateState>({
    ready: false,
    canUpload: true, // optimistic — مايبانش زر معطل قبل الـcheck
    upgradeMessage: DEFAULT_CONTROLS.freeImageUploadsUpgradeMessage,
    whatsappUrl: '',
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      if (!user?.uid) {
        if (!cancelled) setState((s) => ({ ...s, ready: true, canUpload: true }));
        return;
      }

      try {
        // ─ نقرا user doc + settings parallel — كاش-أول لتقليل التكلفة
        const [userDocSnap, settingsSnap] = await Promise.all([
          getDocCacheFirst(doc(db, 'users', user.uid)),
          getDocCacheFirst(doc(db, 'settings', ACCOUNT_TYPE_CONTROL_DOC_ID)),
        ]);

        if (cancelled) return;

        const userData = userDocSnap.exists() ? (userDocSnap.data() as Record<string, unknown>) : {};
        const tier = resolveEffectiveAccountTypeFromData(userData as any, Date.now());
        const settings = settingsSnap.exists() ? (settingsSnap.data() as Record<string, unknown>) : {};

        // ـ Pro / Pro Max → دايماً مسموح، مفيش حاجة تانية محتاجين نفحصها
        if (tier === 'premium' || tier === 'pro_max') {
          setState({
            ready: true,
            canUpload: true,
            upgradeMessage: '',
            whatsappUrl: '',
          });
          return;
        }

        // ـ Free → نشوف الـsetting + نجهز رسالة الترقية
        const enabled = Boolean(settings?.freeImageUploadsEnabled);
        const upgradeMsg = String(
          settings?.freeImageUploadsUpgradeMessage ||
          DEFAULT_CONTROLS.freeImageUploadsUpgradeMessage,
        );
        const whatsappMsg = String(
          settings?.freeImageUploadsUpgradeWhatsappMessage ||
          DEFAULT_CONTROLS.freeImageUploadsUpgradeWhatsappMessage,
        );
        const whatsappNumber = String(settings?.whatsappNumber || DEFAULT_CONTROLS.whatsappNumber);

        setState({
          ready: true,
          canUpload: enabled,
          upgradeMessage: upgradeMsg,
          whatsappUrl: buildWhatsAppUrl(whatsappNumber, whatsappMsg),
        });
      } catch (err) {
        // ـ لو فشل الفحص لأي سبب → نسمح (fail open) عشان مانوقفش الطبيب بالغلط
        console.warn('[useImageUploadGate] Check failed, allowing upload:', err);
        if (!cancelled) setState((s) => ({ ...s, ready: true, canUpload: true }));
      }
    };

    void runCheck();
    return () => { cancelled = true; };
  }, [user?.uid]);

  /**
   * Gate رئيسي — استدعها قبل ما تفتح متصفح الملفات. ترجع true لو الطبيب
   * مسموح له، أو false وتفتح مودال "ترقية للـPro" تلقائياً.
   *
   * استخدام شائع — على label أو زر يفتح input file:
   *   onClick={(e) => { if (!requestImageUpload()) e.preventDefault(); }}
   *
   * استخدام بديل — لو الـonClick صعب، يتعمل في الـonChange بتاع الـinput:
   *   onChange={(e) => {
   *     if (!requestImageUpload()) { e.target.value = ''; return; }
   *     existingHandler(e);
   *   }}
   */
  const requestImageUpload = useCallback((): boolean => {
    if (state.canUpload) return true;
    setShowUpgradeModal(true);
    return false;
  }, [state.canUpload]);

  const closeUpgradeModal = useCallback(() => setShowUpgradeModal(false), []);

  return {
    ready: state.ready,
    canUpload: state.canUpload,
    upgradeMessage: state.upgradeMessage,
    whatsappUrl: state.whatsappUrl,
    showUpgradeModal,
    closeUpgradeModal,
    requestImageUpload,
  };
};
