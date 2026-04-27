/**
 * PlanMessagesForm — محتوى تعديل رسائل خطة داخل التوسيع inline
 *
 * اسم الملف محفوظ للتوافق. التصميم موحد:
 *   - حدود بيضاء + slate-200 + focus أزرق (زي كشف جديد).
 *   - label خفيف + أيقونة صغيرة للتفريق بين مجاني/مميز.
 */

import React from 'react';
import { FaCrown, FaUser, FaWhatsapp, FaArrowLeft } from 'react-icons/fa6';
import { AccountTypeControlsForm, PlanConfig } from './types';
import { buildWhatsAppUrl } from './utils';

interface PlanConfigCardProps {
  plan: PlanConfig;
  form: AccountTypeControlsForm;
  setForm: React.Dispatch<React.SetStateAction<AccountTypeControlsForm>>;
  whatsappNumber: string;
}

export const PlanConfigCard: React.FC<PlanConfigCardProps> = ({
  plan,
  form,
  setForm,
  whatsappNumber,
}) => {
  const previewUrl = buildWhatsAppUrl(whatsappNumber, form[plan.whatsappMessageKey]);
  // نعرف لو الخطة "برو" أو "برو ماكس" (الاتنين مدفوعين)
  // ملاحظة: `name` بقى 'برو' أو 'برو ماكس' بعد التحويل من 'مميز'
  const isPro = plan.name === 'برو' || plan.name === 'برو ماكس';
  const isProMax = plan.name === 'برو ماكس';
  const messageValue = form[plan.messageKey] as string;
  const whatsappMessageValue = form[plan.whatsappMessageKey] as string;

  return (
    // ─ min-w-0 ضروري عشان البطاقة تـshrink داخل الـgrid على الموبايل ─
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden min-w-0">
      {/* Mini-header — subtle */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 bg-slate-50/60 min-w-0">
        {isPro ? (
          <>
            <FaCrown className="w-3 h-3 text-warning-500 shrink-0" />
            <h4 className="text-xs font-black text-warning-700 truncate">{plan.name}</h4>
          </>
        ) : (
          <>
            <FaUser className="w-3 h-3 text-slate-500 shrink-0" />
            <h4 className="text-xs font-black text-slate-700 truncate">{plan.name}</h4>
          </>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* System message */}
        <div>
          <label className="block mb-1.5 text-[12px] font-black text-slate-700 px-1">{plan.messageLabel}</label>
          <textarea
            value={messageValue}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [plan.messageKey]: e.target.value.slice(0, 500),
              }))
            }
            placeholder={plan.messagePlaceholder}
            rows={3}
            maxLength={500}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors resize-none"
          />
          <p className="mt-1 text-[10px] text-slate-400 text-left" dir="ltr">
            {(messageValue || '').length}/500
          </p>
        </div>

        {/* WhatsApp message */}
        <div>
          <label className="block mb-1.5 text-[12px] font-black text-slate-700 px-1">{plan.whatsappLabel}</label>
          <textarea
            value={whatsappMessageValue}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [plan.whatsappMessageKey]: e.target.value.slice(0, 500),
              }))
            }
            placeholder={plan.whatsappPlaceholder}
            rows={3}
            maxLength={500}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors resize-none"
          />
          <p className="mt-1 text-[10px] text-slate-400 text-left" dir="ltr">
            {(whatsappMessageValue || '').length}/500
          </p>
        </div>

        {/* Preview button */}
        {previewUrl ? (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border-2 border-success-200 bg-success-50/80 hover:bg-success-100 px-3 py-2 transition group min-w-0"
          >
            <FaWhatsapp className="w-3 h-3 text-success-600 shrink-0" />
            <span className="flex-1 min-w-0 text-[11px] font-bold text-success-700 truncate">معاينة رسالة الواتساب</span>
            <FaArrowLeft className="w-2.5 h-2.5 text-success-500 shrink-0 transition-transform group-hover:-translate-x-1" />
          </a>
        ) : (
          <p className="text-[10px] font-bold text-slate-400 text-center">
            أدخل رقم واتساب لتفعيل المعاينة
          </p>
        )}
      </div>
    </div>
  );
};
