import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * نافذة تنبيه استهلاك "الكوتا" الذكية (Smart Quota Notice Modal)
 * تظهر هذه النافذة عندما يستهلك الطبيب الحد اليومي المجاني لتحليلات الذكاء الاصطناعي.
 * توفر الرسالة شرحاً للطبيب وتسمح له بالتواصل مع الدعم الفني عبر واتساب لطلب زيادة الحد أو الاشتراك في الباقات المميزة.
 */

interface SmartQuotaNotice {
  message: string;        // نص الرسالة التوضيحية
  whatsappNumber?: string;
  whatsappUrl?: string;   // رابط الواتساب الجاهز للمراسلة
}

interface SmartQuotaNoticeModalProps {
  notice: SmartQuotaNotice | null; // بيانات التنبيه (إذا كانت موجودة يتم عرض النافذة)
  onClose: () => void;
}

export const SmartQuotaNoticeModal: React.FC<SmartQuotaNoticeModalProps> = ({ notice, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // إدارة الأنيميشن عند الفتح
  useEffect(() => {
    if (notice) {
      setIsVisible(true);
    }
  }, [notice]);

  // استخدام Portal لعرض النافذة فوق كافة عناصر الصفحة
  if (!notice) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* الخلفية المعتمة مع تأثير الضباب */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      
      {/* المحتوى الرئيسي للنافذة */}
      <div className={`relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-emerald-100 p-5 sm:p-6 transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="text-center space-y-3" dir="rtl">
          {/* أيقونة الواتساب الترحيبية */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center animate-in fade-in zoom-in duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 26, height: 26 }} fill="currentColor" viewBox="0 0 448 512" aria-hidden="true">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.9 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
          </div>
          
          {/* نص الرسالة من السيرفر */}
          <p className="text-black font-black text-base sm:text-lg leading-8 whitespace-pre-wrap">{notice.message}</p>
          
          {/* أزرار الإجراءات */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-colors"
            >
              إغلاق
            </button>
            {/* زر الواتساب (يظهر فقط إذا تم توفير رابط) */}
            {notice.whatsappUrl && (
              <a
                href={notice.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-colors"
              >
                تواصل واتساب
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
