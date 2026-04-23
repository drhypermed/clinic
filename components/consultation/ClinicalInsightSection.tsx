import React from 'react';

/**
 * مكون المعلومات السريرية (Clinical Insight Section)
 * يمثل هذا القسم واجهة إدخال البيانات الطبية الأساسية للمريض (الشكوى، التاريخ المرضي، الفحص، الفحوصات).
 * 
 * بروات:
 * 1. يدعم الإدخال باللغة العربية والعامية.
 * 2. يتميز بخاصية التوسيع التلقائي لصناديق النصوص (Auto-resize) لتوفير مساحة رؤية أفضل.
 * 3. يحتوي على نظام ذكي للتعرف على رسائل "الكوتا" (Quota) الخاصة بالذكاء الاصطناعي.
 */

interface ClinicalInsightSectionProps {
  complaint: string; setComplaint: (v: string) => void;         // الشكوى الحالية ودالة تحديثها
  history: string; setHistory: (v: string) => void;             // التاريخ المرضي ودالة تحديثه
  exam: string; setExam: (v: string) => void;                   // الفحص السريري ودالة تحديثه
  investigations: string; setInvestigations: (v: string) => void; // نتائج الفحوصات ودالة تحديثها
  errorMsg: string | null;                                     // رسالة الخطأ في حال فشل الاتصال أو التحليل
}

export const ClinicalInsightSection: React.FC<ClinicalInsightSectionProps> = ({
  complaint, setComplaint, history, setHistory, exam, setExam, investigations, setInvestigations, errorMsg
}) => {
  const complaintRef = React.useRef<HTMLTextAreaElement | null>(null);
  const historyRef = React.useRef<HTMLTextAreaElement | null>(null);
  const examRef = React.useRef<HTMLTextAreaElement | null>(null);
  const investigationsRef = React.useRef<HTMLTextAreaElement | null>(null);
  
  /** 
   * فحص نوع الخطأ: هل هو يتعلق بالـ Quota (نفاد الرصيد اليومي)؟
   * يتم استخدامه لإخفاء رسائل الخطأ العامة إذا كان الخطأ متعلقاً بقيود الاشتراك، 
   * حيث يتم التعامل مع أخطاء الكوتا في مكونات عليا أخرى بشكل أكثر تفصيلاً.
   */
  const isQuotaMessage =
    typeof errorMsg === 'string' &&
    (errorMsg.includes('تم استهلاك الحد اليومي') ||
      errorMsg.includes('النسخة المجانية') ||
      errorMsg.includes('الحساب برو'));

  /** 
   * وظيفة التوسيع التلقائي (Auto-resize):
   * تجعل صناديق النصوص تتوسع رأسياً بشكل ديناميكي بناءً على حجم المحتوى المدخل،
   * مما يمنع ظهور أشرطة التمرير الداخلية (Scrollbars) المزعجة للطبيب.
   */
  const resizeTextarea = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    resizeTextarea(e.currentTarget);
  };

  const fieldTitleClass = 'text-[12px] font-black text-slate-700 mb-1.5 px-1 tracking-[0.01em]';

  React.useEffect(() => {
    resizeTextarea(complaintRef.current);
    resizeTextarea(historyRef.current);
    resizeTextarea(examRef.current);
    resizeTextarea(investigationsRef.current);
  }, [complaint, history, exam, investigations]);

  return (
    <section className="clinic-section clinic-section--clinical p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-right" dir="rtl">
      {/* عنوان القسم */}
      <div className="clinic-section-header mb-4">
        <div className="clinic-section-header__group">
          <div className="clinic-section-header__bar"></div>
          <div>
            <h2 className="clinic-section-header__title">المعلومات السريرية</h2>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* حقل إدخال الشكوى الرئيسية */}
        <div className="flex flex-col">
          <p className={fieldTitleClass}>الشكوى</p>
          <textarea
            ref={complaintRef}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            onInput={autoResize}
            rows={1}
            className="clinic-field w-full min-h-[44px] py-2.5 px-4 rounded-2xl font-bold text-sm resize-none overflow-hidden text-right !bg-white !border-2 !border-slate-200 focus:!border-violet-400 hover:!border-violet-300 transition-colors dropdown-shadow"
            placeholder="مثال: اسهال وترجيع"
          />
        </div>

        {/* حقل إدخال التاريخ المرضي (Previous medical history) */}
        <div className="flex flex-col">
          <p className={fieldTitleClass}>التاريخ المرضي</p>
          <textarea
            ref={historyRef}
            value={history}
            onChange={(e) => setHistory(e.target.value)}
            onInput={autoResize}
            rows={1}
            className="clinic-field w-full min-h-[44px] py-2.5 px-4 rounded-2xl font-bold text-sm resize-none overflow-hidden text-right !bg-white !border-2 !border-slate-200 focus:!border-violet-400 hover:!border-violet-300 transition-colors dropdown-shadow"
            placeholder="مثال: ضغط وسكر"
          />
        </div>

        {/* حقل إدخال الملاحظات السريرية للفحص (Examination findings) */}
        <div className="flex flex-col">
          <p className={fieldTitleClass}>ملاحظات الكشف</p>
          <textarea
            ref={examRef}
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            onInput={autoResize}
            rows={1}
            className="clinic-field w-full min-h-[44px] py-2.5 px-4 rounded-2xl font-bold text-sm resize-none overflow-hidden text-right !bg-white !border-2 !border-slate-200 focus:!border-violet-400 hover:!border-violet-300 transition-colors dropdown-shadow"
            placeholder="مثال: احتقان في الحلق وتزييق في الصدر"
          />
        </div>

        {/* حقل إدخال نتائج التحاليل والأشعة (Investigations) */}
        <div className="flex flex-col">
          <p className={fieldTitleClass}>نتائج الفحوصات</p>
          <textarea
            ref={investigationsRef}
            value={investigations}
            onChange={(e) => setInvestigations(e.target.value)}
            onInput={autoResize}
            rows={1}
            className="clinic-field w-full min-h-[44px] py-2.5 px-4 rounded-2xl font-bold text-sm resize-none overflow-hidden text-right !bg-white !border-2 !border-slate-200 focus:!border-violet-400 hover:!border-violet-300 transition-colors dropdown-shadow"
            placeholder="مثال: الهيموجلوبين 9.5 والكرياتنين 1.5"
          />
        </div>
      </div>

      {/* عرض رسالة الخطأ الفنية فقط (نتجاهل أخطاء الكوتا هنا لعدم تكرار التنبيهات) */}
      {errorMsg && !isQuotaMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold text-xs text-right">
          ⚠️ {errorMsg}
        </div>
      )}
    </section>
  );
};

