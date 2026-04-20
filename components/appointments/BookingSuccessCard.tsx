import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';

/**
 * الملف: BookingSuccessCard.tsx
 * الوصف: "كارت الحجز" الذي يظهر للمريض بعد حجز موعد عبر الرابط العام. 
 * يُعتبر هذا الوجيه هو ختام عملية الحجز، ويتميز بـ: 
 * - تصميم بصري جذاب (Premium UI) يبعث بالاطمئنان للمريض. 
 * - تقنية "نسخ لقطة الشاشة" (Image Snapshot): حيث يستطيع المريض الضغط 
 *   على زر لحفظ بيانات حجزه كصورة PNG بجودة عالية على هاتفه. 
 * - معالجة خاصة لضمان وضوح الخطوط العربية عند تحويل الكود البرمجي لصورة.
 */

interface BookingSuccessCardProps {
  clinicName?: string;
  patientName: string;
  dateTime: Date;
  clinicContact?: string;
  appointmentType?: 'exam' | 'consultation';
}

export const BookingSuccessCard: React.FC<BookingSuccessCardProps> = ({
  clinicName, patientName, dateTime, clinicContact, appointmentType,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  /** 
   * وظيفة التقاط الصورة (Take Snapshot). 
   * تستخدم مكتبة html2canvas لتحويل الـ DOM إلى صورة. 
   * - نرفع الـ Scale لضمان دقة الحروف (Sharper Text). 
   * - نستخدم onclone لمعالجة استايلات الخطوط العربية لحظة التصوير فقط 
   *   لضمان عدم ظهور حروف مقطعة أو مشاكل في الاتجاه (RTL).
   */
  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // انتظار بسيط لاستقرار الأنميشن
 
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,           // دقة عالية جداً (Retina)
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // معالجة النصوص في النسخة المستنسخة لضمان عدم ظهور مشاكل في التباعد أو الحروف المتقطعة
          const clonedCard = clonedDoc.body.querySelector('[data-card-root="true"]');
          if (clonedCard instanceof HTMLElement) {
            clonedCard.style.fontFamily = 'Arial, sans-serif';
            const textElements = clonedCard.querySelectorAll('h1, h2, h3, p, span, div');
            textElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.letterSpacing = '0px';
                el.style.fontFamily = 'Arial, sans-serif';
                el.style.textDecoration = 'none';
              }
            });
          }
        }
      });
 
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Booking-${patientName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to save image:', err);
      alert('فشل حفظ الصورة، يرجى المحاولة مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = formatUserDate(dateTime, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, 'ar-EG');
  const formattedTime = formatUserTime(dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG');

  // لوحة الألوان المعتمدة للكارت (هوية العيادة)
  const theme = {
    primary: '#1e3a8a', accent: '#b45309', textDark: '#0f172a',
    textGray: '#475569', white: '#ffffff', warningBg: '#fff1f2',
    warningText: '#be123c', border: '#e2e8f0',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full min-h-[50vh]" style={{ fontFamily: "'Cairo', sans-serif" }}>

      {/* الحاوية التي سيتم تصويرها */}
      <div
        ref={cardRef}
        data-card-root="true"
        className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl relative border border-slate-200"
        dir="rtl"
      >
        {/* الجزء العلوي - خلفية زرقاء */}
        <div className="relative px-6 pt-10 pb-12 text-center" style={{ backgroundColor: theme.primary }}>
          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-white transform rotate-3">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-0 text-white">تم تأكيد الحجز</h2>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-white rounded-t-[2.5rem]"></div>
        </div>

        {/* محتوى الكارت */}
        <div className="px-8 pb-8 pt-0">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-1" style={{ color: theme.primary }}>{clinicName || 'العيادة الطبية'}</h3>
            <p className="text-sm font-semibold" style={{ color: theme.textGray }}>{clinicContact}</p>
          </div>

          <div className="space-y-4 mb-8">
            {/* نوع الحجز (كشف/استشارة) */}
            {appointmentType && (
              <div className="flex items-center p-4 rounded-2xl border" style={{ backgroundColor: appointmentType === 'exam' ? '#fef3c7' : '#f3e8ff', borderColor: appointmentType === 'exam' ? '#fcd34d' : '#e9d5ff' }}>
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: appointmentType === 'exam' ? '#fde68a' : '#f3e8ff' }}>
                   <svg className="w-6 h-6" style={{ color: appointmentType === 'exam' ? '#b45309' : '#7c3aed' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {appointmentType === 'exam' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00(2 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div className="mr-5">
                  <p className="text-xs font-bold mb-1 opacity-70">نوع الحجز</p>
                  <p className="text-lg font-black">{appointmentType === 'exam' ? 'كشف' : 'استشارة'}</p>
                </div>
              </div>
            )}

            {/* بيانات المريض */}
            <div className="flex items-center p-4 rounded-2xl border bg-slate-50 border-slate-200">
              <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-100">
                <svg className="w-6 h-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="mr-5">
                <p className="text-xs font-bold mb-1 opacity-70">اسم المريض</p>
                <p className="text-lg font-black">{patientName}</p>
              </div>
            </div>

            {/* موعد الزيارة */}
            <div className="flex items-center p-4 rounded-2xl border border-amber-200 bg-amber-50">
              <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-amber-100">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mr-5">
                <p className="text-xs font-bold mb-1 opacity-70">موعد الزيارة</p>
                <div className="flex gap-2 items-center">
                  <span className="text-lg font-bold">{formattedDate}</span>
                  <span className="text-xl font-black text-amber-800" dir="ltr">{formattedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* تنبيه الحضور */}
          <div className="p-4 rounded-xl text-center mb-6 bg-rose-50 border border-rose-100">
            <p className="text-sm font-bold text-rose-700 m-0">يرجى الحضور قبل الموعد بـ 10 دقائق</p>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold opacity-60">شكراً لاستخدامكم نظام الحجز الالكتروني</p>
            <p className="text-sm font-bold text-amber-800">مع تمنياتنا لكم بالشفاء العاجل</p>
          </div>
        </div>

        {/* تذييل الكارت */}
        <div className="py-3 px-2 text-center bg-slate-100">
          <p className="text-[10px] font-bold opacity-50">Dr hyper Med أقوى نظام لإدارة العيادات وطباعة الروشتات في مصر</p>
          <p className="text-[10px] font-bold opacity-50 mt-0.5" dir="ltr">www.drhypermed.com</p>
        </div>
      </div>

      {/* زر الحفظ كصورة */}
      <div className="mt-8 w-full max-w-md">
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="w-full py-4 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 bg-gradient-to-br from-blue-900 to-slate-900"
        >
          {saving ? 'جاري الحفظ' : (
            <>
              <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>حفظ صورة الحجز</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
