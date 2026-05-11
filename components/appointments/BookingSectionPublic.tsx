import React, { useState } from 'react';
import { LoadingText } from '../ui/LoadingText';
import type { Branch, PublicBookingSlot } from '../../types';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';

// خدمة QR خارجية مجانية — اختيار مقصود لتوفير bundle size (مكتبة QR محلية ~20KB
// لكل مستخدم × آلاف الأطباء). الخدمة المستخدمة (qrserver.com) عامة ومجانية وما
// بتحتاجش API key. الروابط اللي بتمرّ هنا عامة أصلاً (روابط الحجز للجمهور).
const buildQrImageUrl = (data: string, size = 400) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(data)}`;
};

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
  /** قائمة الفروع — لتوليد رابط منفصل لكل فرع لو في أكتر من فرع */
  branches?: Branch[];
  /** الإعداد الحالي لاشتراط جوجل قبل تأكيد الحجز */
  requireGoogleSignIn: boolean;
  onRequireGoogleSignInChange: (value: boolean) => void;
}

const formatPublicSlotLabel = (dateTime: string) => (
  `${formatUserDate(dateTime, { weekday: 'short', month: 'short', day: 'numeric' }, 'ar-EG')} — ${formatUserTime(dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}`
);

// مودال QR — يعرض كود QR كبير للرابط، مع زرار حفظ كصورة
// التصميم: full-screen overlay بسيط، يقفل بالضغط خارج الكارت أو زرار X
const QrModal: React.FC<{
  open: boolean;
  branchName: string;
  link: string;
  onClose: () => void;
}> = ({ open, branchName, link, onClose }) => {
  if (!open) return null;
  const qrUrl = buildQrImageUrl(link, 500);
  // اسم الملف عند التحميل — نشيل المسافات والرموز عشان مايعملش مشاكل في اسم الملف
  const safeName = branchName.replace(/[^؀-ۿa-zA-Z0-9]/g, '_').slice(0, 30);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-800">رمز QR لفرع: {branchName}</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">
              المريض يصوّر الكود ده بكاميرا الموبايل فيفتحله رابط الحجز مباشرة.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="إغلاق"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-xl border-2 border-slate-200">
          {/* الصورة من خدمة خارجية — لو الاتصال فشل، المستخدم يشوف placeholder */}
          <img
            src={qrUrl}
            alt={`QR Code - ${branchName}`}
            className="w-full max-w-xs h-auto"
            loading="lazy"
          />
        </div>

        <p className="text-[10px] text-slate-400 font-bold break-all dir-ltr text-left">{link}</p>

        <div className="flex gap-2">
          {/* زرار التحميل — a tag بـ download attribute لحفظ الصورة محلياً */}
          <a
            href={qrUrl}
            download={`qr-${safeName}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm"
          >
            📥 تحميل الصورة
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

// قسم الرابط الرئيسي (الشامل) — مع زرار نسخ وزرار QR
const MainLinkRow: React.FC<{
  publicBookingLink: string | null;
  publicLinkCopied: boolean;
  onCopyPublicLink: () => void;
  isMultiBranch: boolean;
}> = ({ publicBookingLink, publicLinkCopied, onCopyPublicLink, isMultiBranch }) => {
  const [qrOpen, setQrOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-slate-600 font-bold text-sm">
        {isMultiBranch
          ? '🔗 الرابط الشامل (يعرض كل الفروع — يطلب من المريض اختيار الفرع):'
          : 'انسخ الرابط وارسله للجمهور ليتمكنوا من حجز المواعيد المتاحة لديهم.'}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-slate-400 font-bold text-xs break-all dir-ltr text-left flex-1 min-w-0">
          {publicBookingLink ?? <LoadingText>جاري تحميل الرابط</LoadingText>}
        </p>
        <button
          type="button"
          onClick={onCopyPublicLink}
          disabled={!publicBookingLink}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning-100 hover:bg-warning-200 text-warning-800 text-sm font-bold shrink-0 disabled:opacity-50"
        >
          {publicLinkCopied ? 'تم النسخ' : 'نسخ الرابط'}
        </button>
        {/* زرار QR للرابط الشامل — يفتح مودال يعرض QR قابل للتحميل */}
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          disabled={!publicBookingLink}
          className="px-3 py-1.5 rounded-lg bg-brand-100 hover:bg-brand-200 text-brand-800 text-sm font-bold shrink-0 disabled:opacity-50 flex items-center gap-1"
          title="عرض رمز QR لطباعته"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2z" />
          </svg>
          QR
        </button>
      </div>
      {publicBookingLink && (
        <QrModal
          open={qrOpen}
          branchName="الرابط العام"
          link={publicBookingLink}
          onClose={() => setQrOpen(false)}
        />
      )}
    </div>
  );
};

// زرار نسخ رابط فرع منفصل — كل فرع يحتاج state نسخ مستقل عشان نعرض "تم النسخ"
// للزرار اللي اتضغط هو بالذات (لو شيرنا useCopyFeedback واحد، كل الأزرار هتتغير سوا).
const BranchLinkRow: React.FC<{
  branch: Branch;
  baseLink: string;
}> = ({ branch, baseLink }) => {
  const { copied, copy } = useCopyFeedback();
  const [qrOpen, setQrOpen] = useState(false);
  // الرابط لفرع معين = الرابط العام + ?branch=branchId (الفورم العام بيتعرّف عليه)
  const branchLink = `${baseLink}${baseLink.includes('?') ? '&' : '?'}branch=${encodeURIComponent(branch.id)}`;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white border border-slate-100">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-700">📍 {branch.name}</p>
          <p className="text-[10px] font-bold text-slate-400 break-all dir-ltr text-left mt-0.5">{branchLink}</p>
        </div>
        <button
          type="button"
          onClick={() => copy(branchLink)}
          className="px-2.5 py-1 rounded-lg bg-warning-100 hover:bg-warning-200 text-warning-800 text-xs font-bold shrink-0"
        >
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
        {/* زرار QR — يفتح مودال يعرض الكود قابل للتحميل والطباعة */}
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-brand-100 hover:bg-brand-200 text-brand-800 text-xs font-bold shrink-0 flex items-center gap-1"
          title="عرض رمز QR لطباعته"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2z" />
          </svg>
          QR
        </button>
      </div>
      <QrModal
        open={qrOpen}
        branchName={branch.name}
        link={branchLink}
        onClose={() => setQrOpen(false)}
      />
    </>
  );
};

export const BookingSectionPublic: React.FC<BookingSectionPublicProps> = ({
  publicBookingLink, isOpen, onToggleOpen, publicLinkCopied, onCopyPublicLink,
  publicFormTitle, onPublicFormTitleChange, publicFormContactInfo,
  onPublicFormContactInfoChange, publicFormSaving, onSavePublicFormSettings,
  publicSlotDateStr, onPublicSlotDateStrChange, publicSlotTimeStr,
  onPublicSlotTimeStrChange, publicSlotTodayStr, publicTimeMin,
  publicSlotAdding, onAddPublicSlot, publicSlots, onRemovePublicSlot, isSaved,
  branches,
  requireGoogleSignIn, onRequireGoogleSignInChange,
}) => (
  <section className="bg-white rounded-2xl shadow-lg border border-warning-200 overflow-hidden">
    {/* زر التحكم في فتح/غلق القسم */}
    <button
      type="button"
      onClick={onToggleOpen}
      className="w-full bg-gradient-to-r from-warning-500 to-warning-600 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-right"
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
        {/* رابط الحجز الرئيسي — للنشر العام (المريض يختار الفرع من شاشة الاختيار) */}
        <MainLinkRow
          publicBookingLink={publicBookingLink}
          publicLinkCopied={publicLinkCopied}
          onCopyPublicLink={onCopyPublicLink}
          isMultiBranch={Boolean(branches && branches.length > 1)}
        />

        {/* روابط منفصلة لكل فرع — تظهر فقط لو في أكثر من فرع نشط */}
        {/* الفائدة: الطبيب ينشر كل رابط للمنطقة الجغرافية المناسبة لفرعها */}
        {/* مثلاً: رابط فرع المعادي في جروب واتساب لمرضى المعادي، وهكذا */}
        {branches && branches.length > 1 && publicBookingLink && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
            <p className="text-emerald-800 font-black text-sm">
              🎯 روابط مباشرة لكل فرع (موصى بها)
            </p>
            <p className="text-emerald-700 text-xs font-bold">
              كل رابط من دول بيفتح الفورم مباشرة على فرع معين — المريض ميشوفش شاشة اختيار. مناسب لو هتنشر رابط في منطقة معينة.
            </p>
            <div className="space-y-1.5">
              {branches.map((branch) => (
                <BranchLinkRow key={branch.id} branch={branch} baseLink={publicBookingLink} />
              ))}
            </div>
          </div>
        )}

        {/* إعدادات الفورم (العنوان والبيانات) */}
        <form onSubmit={onSavePublicFormSettings} className="border-t border-slate-100 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">عنوان الفورم الرئيسي</label>
            <textarea
              value={publicFormTitle}
              onChange={(e) => onPublicFormTitleChange(e.target.value)}
              placeholder="مثال: حجز موعد — عيادة د. عبدالرحمن"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-warning-500 outline-none text-slate-800 font-bold text-sm resize-none"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-warning-500 outline-none text-slate-800 font-bold text-sm resize-none"
            />
          </div>
          {/* إعداد حماية الحجز بـ Google — قرار الطبيب نفسه يفعّله أو يقفله */}
          <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={requireGoogleSignIn}
              onChange={(e) => onRequireGoogleSignInChange(e.target.checked)}
              className="mt-1 w-4 h-4 accent-warning-600 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-black text-slate-800">اشترط تسجيل دخول بـ Google قبل تأكيد الحجز</p>
              <p className="text-xs text-slate-600 font-bold mt-0.5">
                لو فعّلت ده، أي مريض يحجز من رابطك (أو من دليل Dr Hyper) لازم يسجّل بحساب Google قبل ما الحجز يتم. بيقلّل الحجوزات الوهميه لكن بيمنع المرضى اللي مش عندهم حساب Google.
              </p>
            </div>
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={publicFormSaving} className="px-3 py-1.5 rounded-lg bg-warning-600 hover:bg-warning-700 text-white font-bold text-sm disabled:opacity-60">
              {publicFormSaving ? 'جاري الحفظ' : 'حفظ إعدادات الفورم'}
            </button>
            {isSaved && <span className="text-success-600 font-bold text-sm animate-pulse">تم الحفظ بنجاح</span>}
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
            <button type="submit" disabled={publicSlotAdding || !publicSlotDateStr || !publicSlotTimeStr} className="px-3 py-1.5 rounded-lg bg-warning-600 hover:bg-warning-700 text-white font-bold text-sm disabled:opacity-50">
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
                  <button onClick={() => onRemovePublicSlot(slot.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-danger-50 hover:text-danger-600" title="حذف">
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
