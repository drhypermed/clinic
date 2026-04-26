import React from 'react';

/**
 * الملف: SecretaryResponseToast.tsx
 * الوصف: شريط "الرد على طلب الدخول". 
 * يظهر هذا التنبيه في أعلى الشاشة ليخبر الطبيب بنتيجة طلبه السابق: 
 * - اللون الأخضر (Approved): يعني أن السكرتيرة وافقت، والمريض الآن في طريقة للغرفة. 
 * - اللون البرتقالي (Rejected): يعني أن السكرتيرة أبلغت أن المريض غير متاح الآن. 
 * يساعد هذا النظام في تقليل الحديث الشفهي والحفاظ على خصوصية غرفة الكشف.
 */

interface SecretaryResponseToastData {
  status: 'approved' | 'rejected';
  appointmentId: string;
}

interface SecretaryResponseToastProps {
  toast: SecretaryResponseToastData;
  onCloseApproved: () => void;
  onCloseRejected: () => void;
}

export const SecretaryResponseToast: React.FC<SecretaryResponseToastProps> = ({
  toast,
  onCloseApproved,
  onCloseRejected,
}) => (
  <div className="fixed top-4 left-4 right-4 z-[9999] max-w-2xl mx-auto px-4 animate-fadeIn" aria-live="polite" dir="rtl">
    {toast.status === 'approved' ? (
      // تنبيه بالموافقة (الأخضر)
      <div className="bg-white rounded-2xl shadow-xl border-2 border-success-400 p-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm">رد السكرتارية</p>
          <p className="font-bold text-success-700 text-sm">تم دخول الحالة</p>
        </div>
        <button onClick={onCloseApproved} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500" title="إغلاق">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    ) : (
      // تنبيه بالرفض أو عدم التواجد (البرتقالي)
      <div className="bg-white rounded-2xl shadow-xl border-2 border-warning-400 p-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm">رد السكرتارية</p>
          <p className="font-bold text-warning-700 text-sm">الحالة غير موجوده</p>
        </div>
        <button onClick={onCloseRejected} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500" title="إغلاق">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    )}
  </div>
);
