import React from 'react';
import { createPortal } from 'react-dom';
import { NotificationState } from '../../hooks/useDrHyper/useDrHyper.types';

/**
 * مكون إشعارات الـ Toast (Notification Toast Component)
 * المسؤول عن إظهار الرسائل العائمة في أعلى الصفحة.
 * يدعم 3 أنواع من الإشعارات:
 * 1. النجاح (Success - أخضر): يظهر عند حفظ روشتة أو تسجيل دخول بنجاح.
 * 2. الخطأ (Error - أحمر): يظهر عند فشل الاتصال بالخادم أو نقص في البيانات.
 * 3. المعلومات (Info - أزرق): يظهر للتنبيهات العامة.
 */

interface NotificationToastProps {
  notifications: NotificationState[]; // مصفوفة الإشعارات النشطة حالياً
  onDismiss: (id: string) => void;     // وظيفة لإزالة الإشعار يدوياً عند النقر على زر الإغلاق
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  // لا يتم عرض أي شيء إذا كانت مصفوفة الإشعارات فارغة
  if (notifications.length === 0) return null;

  const toastContent = (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100000] w-[min(94vw,420px)] max-h-[80vh] overflow-y-auto flex flex-col gap-3 pointer-events-none"
      dir="rtl"
    >
      {notifications.map((notif) => {
        // تحديد لون الخلفية بناءً على نوع الإشعار
        const bgClass =
          notif.type === 'success'
            ? 'bg-success-600'
            : notif.type === 'error'
              ? 'bg-danger-600'
              : 'bg-brand-600';

        return (
          <div
            key={notif.id}
            className={`${bgClass} text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl shadow-2xl font-bold text-sm sm:text-base flex items-center gap-3 w-full border-2 border-white/30 animate-fadeIn pointer-events-auto relative overflow-hidden`}
          >
            {/* أيقونة الحالة */}
            <div className="flex-shrink-0">
              {notif.type === 'success' && (
                <div className="p-1 bg-white/20 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
              {notif.type === 'error' && (
                <div className="p-1 bg-white/20 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              )}
              {notif.type === 'info' && (
                <div className="p-1 bg-white/20 rounded-full">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              )}
            </div>

            {/* نص الإشعار */}
            <div className="flex-1 min-w-0 text-right pr-1">
              <span className="font-black block leading-relaxed">{notif.message}</span>
            </div>

            {/* زر الإغلاق */}
            <button
              onClick={() => onDismiss(notif.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="إغلاق"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );

  if (typeof document === 'undefined') return toastContent;
  return createPortal(toastContent, document.body);
};
