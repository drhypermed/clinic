/**
 * الملف: PublicBookingAlerts.tsx
 * الوصف: "نظام التنبيهات اللحظية" للسكرتارية. 
 * يعرض هذا المكون رسائل منبثقة (Toasts) تخبر السكرتير بآخر المستجدات: 
 * - رد الطبيب بالموافقة أو طلب الانتظار (Decision Toasts). 
 * - تأكيد إتمام العمليات (Action Toasts). 
 * - تنبيه "طلب الدخول" (Entry Alert) الذي يظهر في شاشة كاملة عند 
 *   رغبة الطبيب في إدخال مريض محدد الآن.
 */
import React from 'react';
import { formatUserTime } from '../../../utils/cairoTime';
import type { EntryAlert, SecretaryActionToastState } from './types';

/**
 * الخصائص (Props) الخاصة بالمكون المسؤول عن عرض التنبيهات والاشعارات
 * تشمل تنبيهات رد فعل الطبيب (موافقة/انتظار) وتنبيهات طلبات الدخول
 */
type PublicBookingAlertsProps = {
  // التوست بياخد status + source — كل مصدر بيغير نص الرسالة (راجع types.ts)
  secretaryActionToast: SecretaryActionToastState;
  onCloseSecretaryToast: () => void;
  entryAlert: EntryAlert | null; // تفاصيل تنبيه طلب الدخول القادم من الطبيب
  entryResponding: boolean;
  onApproveEntry: () => void;
  onRejectEntry: () => void;
};

/**
 * مكون "التنبيهات" (PublicBookingAlerts)
 * يعرض واجهات منبثقة (Toasts/Modals) لإبلاغ السكرتارية بأفعال الطبيب أو طلبات الدخول اللحظية
 */
export const PublicBookingAlerts: React.FC<PublicBookingAlertsProps> = ({
  secretaryActionToast,
  onCloseSecretaryToast,
  entryAlert,
  entryResponding,
  onApproveEntry,
  onRejectEntry,
}) => {
  return (
    <>
      {/* توست الموافقة: نفس النص للحالتين — موافقة من أي طرف معناها الحالة جاهزة للدخول. */}
      {secretaryActionToast?.status === 'approved' && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto flex items-center gap-3 p-4 rounded-xl bg-success-600 text-white shadow-xl border border-success-700 animate-fadeIn">
          <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">تم الموافقة بالدخول ✅</p>
            <p className="text-white/90 text-xs mt-0.5">يمكن إدخال الحالة الآن</p>
          </div>
          <button type="button" onClick={onCloseSecretaryToast} className="p-1.5 rounded-lg hover:bg-white/20 shrink-0" title="إغلاق">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* توست الرفض: النص يختلف حسب المصدر —
          * secretary-action: السكرتيرة ضغطت "لا" على طلب الطبيب → نقولها تم إبلاغ الطبيب.
          * doctor-response: الطبيب رفض طلب السكرتيرة → نقولها استني، الطبيب مش جاهز. */}
      {secretaryActionToast?.status === 'rejected' && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto flex items-center gap-3 p-4 rounded-xl bg-warning-600 text-white shadow-xl border border-warning-700 animate-fadeIn">
          <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            {secretaryActionToast.source === 'secretary-action' ? (
              <>
                <p className="font-bold text-sm">تم إبلاغ الطبيب ⛔</p>
                <p className="text-white/90 text-xs mt-0.5">بأن الحالة غير موجودة</p>
              </>
            ) : (
              <>
                <p className="font-bold text-sm">في الانتظار قليلاً ⏳</p>
                <p className="text-white/90 text-xs mt-0.5">الطبيب لم يطلب الدخول حالياً</p>
              </>
            )}
          </div>
          <button type="button" onClick={onCloseSecretaryToast} className="p-1.5 rounded-lg hover:bg-white/20 shrink-0" title="إغلاق">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* التنبيه اللحظي: الطبيب يطلب فلان بالاسم من السكرتارية الآن */}
      {/* أزرق متدرج (brand) — يلفت النظر للطلب العاجل من الطبيب بدل الرمادي الباهت */}
      {entryAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto p-4 rounded-xl bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 text-white shadow-xl border border-brand-700 animate-fadeIn flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">الطبيب يطلب دخول حالة: {entryAlert.caseName}</p>
              <p className="text-white/90 text-xs font-bold mt-1">
                الوقت: {formatUserTime(entryAlert.createdAt, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/20">
            <span className="text-xs font-bold text-white/90">الحالة موجودة؟</span>
            <button
              type="button"
              disabled={entryResponding}
              onClick={onApproveEntry}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success-500 hover:bg-success-600 text-white font-bold text-sm disabled:opacity-60"
              title="نعم - تمت الموافقة"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              نعم
            </button>
            <button
              type="button"
              disabled={entryResponding}
              onClick={onRejectEntry}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-danger-500 hover:bg-danger-600 text-white font-bold text-sm disabled:opacity-60"
              title="لا - غير موجود"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              لا
            </button>
          </div>
        </div>
      )}
    </>
  );
};
