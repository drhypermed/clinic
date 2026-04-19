import React from 'react';
import { LoadingText } from '../ui/LoadingText';
import type { PublicBookingSlot } from '../../types';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';

/**
 * الملف: BookingSectionPublic.tsx
 * الوصف: هذا المكون مسؤول عن "إدارة الحجوزات الخارجية" (الجمهور). 
 * يسمح للطبيب بـ: 
 * - نسخ رابط الحجز العام لنشره على منصات التواصل الاجتماعي. 
 * - تخصيص عنوان ورسالة ترحيبية تظهر للمرضى عند فتح الرابط. 
 * - إدارة "الفترات الزمنية المتاحة" (Slots) يدوياً، حيث يمكنه تحديد أيام 
 *   وساعات معينة يظهر فيها المواعيد للمرضى ليختاروا منها.
 */
interface BookingSectionPublicProps {
  publicBookingLink: string | null;     // الرابط الكامل للفورم
  isOpen: boolean;                      // حالة فتح/غلق القسم
  onToggleOpen: () => void;
  publicLinkCopied: boolean;            // حالة نجاح النسخ
  onCopyPublicLink: () => void;
  publicFormTitle: string;              // العنوان المعروض للجمهور
  onPublicFormTitleChange: (value: string) => void;
  publicFormContactInfo: string;        // بيانات الاتصال المعروضة للجمهور
  onPublicFormContactInfoChange: (value: string) => void;
  publicFormSaving: boolean;            // جاري حفظ الإعدادات
  onSavePublicFormSettings: (e: React.FormEvent) => void;
  publicSlotDateStr: string;            // التاريخ المختار لإضافة ميعاد جديد
  onPublicSlotDateStrChange: (value: string) => void;
  publicSlotTimeStr: string;            // الوقت المختار لإضافة ميعاد جديد
  onPublicSlotTimeStrChange: (value: string) => void;
  publicSlotTodayStr: string;           // تاريخ اليوم (لمنع حجز تواريخ ماضية)
  publicTimeMin: string | undefined;    // الحد الأدنى للوقت
  publicSlotAdding: boolean;            // جاري إضافة ميعاد متاح
  onAddPublicSlot: (e: React.FormEvent) => void;
  publicSlots: PublicBookingSlot[];    // قائمة المواعيد المتاحة حالياً
  onRemovePublicSlot: (slotId: string) => void;
  isSaved?: boolean;                    // تأكيد نجاح الحفظ الأخير
}

const formatPublicSlotLabel = (dateTime: string) => (
  `${formatUserDate(dateTime, { weekday: 'short', month: 'short', day: 'numeric' }, 'ar-EG')} — ${formatUserTime(dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}`
);

export const BookingSectionPublic: React.FC<BookingSectionPublicProps> = ({
  publicBookingLink, isOpen, onToggleOpen, publicLinkCopied, onCopyPublicLink,
  publicFormTitle, onPublicFormTitleChange, publicFormContactInfo,
  onPublicFormContactInfoChange, publicFormSaving, onSavePublicFormSettings,
  publicSlotDateStr, onPublicSlotDateStrChange, publicSlotTimeStr,
  onPublicSlotTimeStrChange, publicSlotTodayStr, publicTimeMin,
  publicSlotAdding, onAddPublicSlot, publicSlots, onRemovePublicSlot, isSaved,
}) => (
  <section className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
    {/* زر التحكم في فتح/غلق القسم */}
    <button
      type="button"
      onClick={onToggleOpen}
      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-right"
    >
      <h3 className="text-base font-black text-white flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9a9 9 0 019 9m-9 9a9 9 0 019-9" /></svg>
        رابط الفورم العام للجمهور
      </h3>
      <span className="text-white/90">
        {isOpen ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>}
      </span>
    </button>

    {isOpen && (
      <div className="p-4 space-y-4">
        {/* رابط الحجز */}
        <div className="space-y-2">
          <p className="text-slate-600 font-bold text-sm">انسخ الرابط وارسله للجمهور ليتمكنوا من حجز المواعيد المتاحة لديهم.</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-slate-400 font-bold text-xs break-all dir-ltr text-left flex-1 min-w-0">
              {publicBookingLink ?? <LoadingText>جاري تحميل الرابط</LoadingText>}
            </p>
            <button
              type="button"
              onClick={onCopyPublicLink}
              disabled={!publicBookingLink}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-bold shrink-0 disabled:opacity-50"
            >
              {publicLinkCopied ? 'تم النسخ' : 'نسخ الرابط'}
            </button>
          </div>
        </div>

        {/* إعدادات الفورم (العنوان والبيانات) */}
        <form onSubmit={onSavePublicFormSettings} className="border-t border-slate-100 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">عنوان الفورم الرئيسي</label>
            <textarea
              value={publicFormTitle}
              onChange={(e) => onPublicFormTitleChange(e.target.value)}
              placeholder="مثال: حجز موعد — عيادة د. عبدالرحمن"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-bold text-sm resize-none"
              rows={1}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">أرقام التواصل أو العنوان التفصيلي</label>
            <textarea
              value={publicFormContactInfo}
              onChange={(e) => onPublicFormContactInfoChange(e.target.value)}
              placeholder="مثال: للاستفسار: 01092805293 — العنوان: بنها"
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-bold text-sm resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={publicFormSaving} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm disabled:opacity-60">
              {publicFormSaving ? 'جاري الحفظ' : 'حفظ إعدادات الفورم'}
            </button>
            {isSaved && <span className="text-green-600 font-bold text-sm animate-pulse">تم الحفظ بنجاح</span>}
          </div>
        </form>

        {/* إدارة المواعيد المتاحة (Add Slots) */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-slate-600 font-bold text-sm mb-2">إضافة ميعاد متاح للجمهور</p>
          <form onSubmit={onAddPublicSlot} className="flex flex-wrap items-end gap-2">
            <div className="min-w-[120px]">
              <label className="block text-xs font-bold text-slate-500 mb-0.5">التاريخ</label>
              <input type="date" value={publicSlotDateStr} min={publicSlotTodayStr} onChange={(e) => onPublicSlotDateStrChange(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-bold" />
            </div>
            <div className="min-w-[100px]">
              <label className="block text-xs font-bold text-slate-500 mb-0.5">الوقت</label>
              <input type="time" value={publicSlotTimeStr} min={publicTimeMin} onChange={(e) => onPublicSlotTimeStrChange(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-bold" />
            </div>
            <button type="submit" disabled={publicSlotAdding || !publicSlotDateStr || !publicSlotTimeStr} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm disabled:opacity-50">
              {publicSlotAdding ? 'جاري الإضافة' : 'إضافة'}
            </button>
          </form>
        </div>

        {/* عرض المواعيد المضافة وحذفها */}
        {publicSlots.length > 0 && (
          <div className="pt-2">
            <p className="text-slate-600 font-bold text-sm mb-2">المواعيد المفعّلة ({publicSlots.length})</p>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              {publicSlots.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-white border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">
                    {formatPublicSlotLabel(slot.dateTime)}
                  </span>
                  <button onClick={() => onRemovePublicSlot(slot.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600" title="حذف">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </section>
);
