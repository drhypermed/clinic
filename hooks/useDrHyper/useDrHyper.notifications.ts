/**
 * محرك التنبيهات والاشعارات (useDrHyperNotifications):
 * هذا الـ Hook هو المسؤول عن إدارة جميع أنواع التفاعلات اللحظية مع المستخدم.
 * 
 * المهام الرئيسية:
 * 1. عرض التنبيهات (Notifications) في أماكن متغيرة بناءً على موقع النقر.
 * 2. إدارة التنبيهات المستمرة (Persistent) مثل رسائل استهلاك الكوتا.
 * 3. التعامل مع حالة عدم الاتصال (Offline) ومزامنة البيانات عند عودة الانترنت.
 * 4. حفظ واسترجاع حالة الكوتا من الـ LocalStorage لضمان استمرارية الرسائل التحذيرية.
 */

import React, { useEffect, useRef, useState } from 'react';
import { onSnapshotsInSync } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import type { NotificationState } from './useDrHyper.types';
import { playNotificationCue } from '../../utils/notificationSound';

/** هيكلية بيانات رسالة الكوتا الذكية */
interface SmartQuotaNoticeState {
  message: string;
  whatsappNumber: string;
  whatsappUrl: string;
}

interface UseDrHyperNotificationsArgs {
  smartQuotaStorageKey: string; // مفتاح تخزين رسالة الكوتا في الذاكرة المحلية
  offlineSyncPendingKey: string; // مفتاح التحقق من وجود بيانات تنتظر المزامنة
  getCairoDayKey: () => string; // دالة الحصول على مفتاح اليوم الحالي (توقيت القاهرة)
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  buildWhatsAppUrlFromNumber: (number: string, message: string) => string;
  sanitizeExternalHttpUrl: (value?: string) => string;
  onDismissFirestore?: (firestoreId: string) => void;
}

type NotificationOptions = {
  event?: React.MouseEvent<any>; // الحدث الذي أطلق التنبيه (لتحديد الموقع)
  id?: string;
  firestoreId?: string;
};

/** محول لخيارات التنبيه لضمان التعامل مع الأحداث أو الكائنات بشكل موحد */
const toNotificationOptions = (
  eventOrOptions?: React.MouseEvent<any> | NotificationOptions
): NotificationOptions => {
  if (!eventOrOptions) return {};
  if (typeof eventOrOptions === 'object' && 'currentTarget' in eventOrOptions) {
    return { event: eventOrOptions as React.MouseEvent<any> };
  }
  return eventOrOptions as NotificationOptions;
};

export const useDrHyperNotifications = ({
  smartQuotaStorageKey,
  offlineSyncPendingKey,
  getCairoDayKey,
  setErrorMsg,
  buildWhatsAppUrlFromNumber,
  sanitizeExternalHttpUrl,
  onDismissFirestore,
}: UseDrHyperNotificationsArgs) => {
  // قائمة التنبيهات النشطة حالياً على الشاشة
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // حالة رسالة الكوتا (الحد الأقصى للاستخدام) - يتم تحميلها من الذاكرة المحلية عند البدء if exists
  const [smartQuotaNotice, setSmartQuotaNotice] = useState<SmartQuotaNoticeState | null>(() => {
    try {
      const raw = localStorage.getItem(smartQuotaStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        dayKey?: string;
        message?: string;
        whatsappNumber?: string;
        whatsappUrl?: string;
      };
      // التأكد من أن الرسالة تخص اليوم الحالي فقط
      if (!parsed?.dayKey || parsed.dayKey !== getCairoDayKey()) return null;
      const message = String(parsed.message || '').trim();
      if (!message) return null;
      return {
        message,
        whatsappNumber: String(parsed.whatsappNumber || ''),
        whatsappUrl: sanitizeExternalHttpUrl(String(parsed.whatsappUrl || '')),
      };
    } catch {
      return null;
    }
  });
  
  // حالة فتح/إغلاق نافذة (Modal) تنبيه الكوتا
  const [smartQuotaModalOpen, setSmartQuotaModalOpen] = useState(false);

  /** وظيفة إظهار تنبيه جديد على الشاشة */
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    eventOrOptions?: React.MouseEvent<any> | NotificationOptions
  ) => {
    const options = toNotificationOptions(eventOrOptions);
    let position = undefined;
    const event = options?.event;

    // حساب موقع التنبيه ليكون قريباً من مكان النقر (Smart Positioning)
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const notificationHeight = 80;
      const notificationWidth = Math.min(400, viewportWidth * 0.9);

      let top = rect.top - notificationHeight - 10;
      if (top < 10) {
        top = rect.bottom + 10;
      }
      if (top + notificationHeight > viewportHeight - 10) {
        top = viewportHeight - notificationHeight - 10;
      }

      let left = rect.left + (rect.width / 2);
      if (left - (notificationWidth / 2) < 10) {
        left = notificationWidth / 2 + 10;
      }
      if (left + (notificationWidth / 2) > viewportWidth - 10) {
        left = viewportWidth - (notificationWidth / 2) - 10;
      }

      position = { top, left };
    }

    const id = options?.id || Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationState = {
      id,
      message,
      type,
      position,
      createdAt: Date.now(),
      isPersistent: false,
      firestoreId: options?.firestoreId,
    };

    let notificationInserted = false;

    setNotifications((prev) => {
      // منع تكرار نفس التنبيه في وقت قصير (Anti-Spam)
      const isDuplicate = prev.some(n => 
        (n.id === id) || 
        (n.message === message && Date.now() - n.createdAt < 3000)
      );
      if (isDuplicate) return prev;

      notificationInserted = true;

      // إذا كان التنبيه يحمل ID محدد، نقوم بتحديث النسخة القديمة منه
      if (options?.id) {
        const filtered = prev.filter(n => n.id !== id);
        return [...filtered, newNotification];
      }

      return [...prev, newNotification];
    });

    if (notificationInserted) {
      const cue = type === 'error' ? 'error' : type === 'info' ? 'info' : 'success';
      void playNotificationCue(cue);
    }

    // الإخفاء التلقائي بعد 5 ثوانٍ (بدلاً من 10 لتكون الواجهة أسرع)
    setTimeout(() => {
      dismissNotification(id, false);
    }, 5000);
  };

  /** فتح نافذة تنبيه الوصول للحد الأقصى (Quota Modal) */
  const openQuotaNoticeModal = (payload: {
    message: string;
    whatsappNumber?: string;
    whatsappUrl?: string;
    dayKey?: string;
    persist?: boolean;
  }) => {
    const message = String(payload.message || '').trim();
    if (!message) return;
    const whatsappNumber = String(payload.whatsappNumber || '').trim();
    const generatedWhatsappUrl = buildWhatsAppUrlFromNumber(whatsappNumber, message);
    const fallbackWhatsappUrl = sanitizeExternalHttpUrl(String(payload.whatsappUrl || '').trim());
    const whatsappUrl = generatedWhatsappUrl || fallbackWhatsappUrl;

    setErrorMsg(message);
    setSmartQuotaNotice({ message, whatsappNumber, whatsappUrl });
    setSmartQuotaModalOpen(true);

    // حفظ التنبيه في الذاكرة المحلية إذا طلب ذلك (ليظهر للبروفايل عند إعادة التحميل)
    if (payload.persist) {
      try {
        localStorage.setItem(
          smartQuotaStorageKey,
          JSON.stringify({
            dayKey: payload.dayKey || getCairoDayKey(),
            message,
            whatsappNumber,
            whatsappUrl,
          })
        );
      } catch {
        // تجاهل أخطاء الذاكرة المحلية
      }
    }
  };

  /** إغلاق أو حذف تنبيه معين */
  const dismissNotification = (id?: string, manual: boolean = true) => {
    setNotifications((prev) => {
      if (!id) {
        // حذف جميع التنبيهات
        if (manual && onDismissFirestore) {
          prev.forEach((notif) => {
            if (notif.firestoreId) onDismissFirestore(notif.firestoreId);
          });
        }
        return [];
      }
      const notif = prev.find((n) => n.id === id);
      if (notif?.firestoreId && onDismissFirestore && manual) {
        onDismissFirestore(notif.firestoreId);
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  /** إغلاق نافذة الكوتا */
  const dismissSmartQuotaNotice = () => {
    setSmartQuotaModalOpen(false);
  };

  /** وسم وجود عمليات تنتظر المزامنة (تستخدم عند فقدان الانترنت) */
  const markOfflineSyncPendingIfNeeded = (): boolean => {
    if (typeof navigator === 'undefined' || navigator.onLine) return false;
    try {
      localStorage.setItem(offlineSyncPendingKey, '1');
    } catch {
      // تجاهل أخطاء الذاكرة المحلية
    }
    return true;
  };

  // مراقبة حالة المزامنة مع Firestore لإعلام المستخدم عند عودة الانترنت بنجاح
  useEffect(() => {
    const unsubscribeSnapshotsSync = onSnapshotsInSync(db, () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine && localStorage.getItem(offlineSyncPendingKey) === '1') {
          localStorage.removeItem(offlineSyncPendingKey);
          showNotification('تمت مزامنة البيانات التي حُفظت بدون إنترنت', 'success');
        }
      } catch {
        // تجاهل أخطاء الذاكرة المحلية
      }
    });

    return () => unsubscribeSnapshotsSync();
  }, [offlineSyncPendingKey]);

  // فحص دوري لمسح تنبيهات الكوتا القديمة (بعد منتصف الليل)
  useEffect(() => {
    const interval = setInterval(() => {
      const todayKey = getCairoDayKey();
      try {
        const raw = localStorage.getItem(smartQuotaStorageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { dayKey?: string };
        if (parsed?.dayKey !== todayKey) {
          try {
            localStorage.removeItem(smartQuotaStorageKey);
          } catch {
            // ignore
          }
          setSmartQuotaNotice(null);
          setSmartQuotaModalOpen(false);
        }
      } catch {
        try {
          localStorage.removeItem(smartQuotaStorageKey);
        } catch {
          // ignore
        }
        setSmartQuotaNotice(null);
        setSmartQuotaModalOpen(false);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [getCairoDayKey, smartQuotaStorageKey]);

  return {
    notifications,
    setNotifications,
    smartQuotaNotice,
    setSmartQuotaNotice,
    smartQuotaModalOpen,
    setSmartQuotaModalOpen,
    showNotification,
    openQuotaNoticeModal,
    dismissNotification,
    dismissSmartQuotaNotice,
    markOfflineSyncPendingIfNeeded,
  };
};

export type DrHyperNotificationsState = ReturnType<typeof useDrHyperNotifications>;
