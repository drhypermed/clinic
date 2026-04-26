/**
 * الملف: PublicBookingPublicSlotsSection.tsx
 * الوصف: واجهة "إدارة الحجز الإلكتروني". 
 * يُستخدم هذا المكون من قبل السكرتير لتنظيم عملية الحجز عبر الإنترنت: 
 * - إنشاء "فتحات زمنية" (Time Slots) متاحة للجمهور. 
 * - عرض ونسخ "رابط العيادة" لمشاركته مع المرضى عبر الواتساب. 
 * - متابعة المواعيد المفتوحة حالياً وحذف القديم أو الملغي منها. 
 * - يتميز بتصميم برتقالي اللون للتمييز عن المواعيد المحجوزة يدوياً.
 */
import React from 'react';
import { LoadingText } from '../../ui/LoadingText';
import type { Branch, PublicBookingSlot } from '../../../types';

/**
 * الخصائص (Props) الخاصة بقسم مواعيد الجمهور
 * تشمل رابط الحجز، فتحات المواعيد المتاحة، ودوال الإضافة والحذف
 */
type PublicBookingPublicSlotsSectionProps = {
  publicSectionOpen: boolean;
  onToggleOpen: () => void;
  publicBookingLink: string | null; // الرابط الذي يفتح فورم الحجز للمرضى (الجمهور)
  publicLinkCopied: boolean;
  onCopyPublicBookingLink: () => void;
  publicSlotDateStr: string;
  publicSlotTodayStr: string;
  onPublicSlotDateChange: (value: string) => void;
  publicSlotTimeStr: string;
  publicTimeMin: string | undefined;
  onPublicSlotTimeChange: (value: string) => void;
  /** كل الفروع — عشان نعرض قسم العناوين لو عنده أكثر من فرع */
  branches: Branch[];
  /** الفرع النشط حالياً — الموعد المضاف سيُحفظ على هذا الفرع تلقائياً */
  currentBranchId: string;
  branchAddresses: Record<string, string>;
  branchAddressesSaving: boolean;
  onSaveBranchAddress: (branchId: string, address: string) => void | Promise<void>;
  onAddPublicSlot: (e: React.FormEvent) => void;
  publicSecret: string | null;
  publicSlotAdding: boolean;
  publicSlotError: string | null;
  publicSlotsLoading: boolean;
  /** قائمة المواعيد المفلترة على الفرع النشط فقط */
  publicSlots: PublicBookingSlot[];
  onRemovePublicSlot: (slotId: string) => void;
  formatSlotLabel: (dateTime: string) => string;
};

/**
 * مكون "إدارة مواعيد الجمهور" (PublicBookingPublicSlotsSection)
 * يتيح للسكرتارية فتح "فتحات" وقت محددة ليقوم المرضى بحجزها بأنفسهم عبر الإنترنت
 */
export const PublicBookingPublicSlotsSection: React.FC<PublicBookingPublicSlotsSectionProps> = ({
  publicSectionOpen,
  onToggleOpen,
  publicBookingLink,
  publicLinkCopied,
  onCopyPublicBookingLink,
  publicSlotDateStr,
  publicSlotTodayStr,
  onPublicSlotDateChange,
  publicSlotTimeStr,
  publicTimeMin,
  onPublicSlotTimeChange,
  branches,
  currentBranchId,
  branchAddresses,
  branchAddressesSaving,
  onSaveBranchAddress,
  onAddPublicSlot,
  publicSecret,
  publicSlotAdding,
  publicSlotError,
  publicSlotsLoading,
  publicSlots,
  onRemovePublicSlot,
  formatSlotLabel,
}) => {
  const hasMultipleBranches = branches.length > 1;
  const currentBranchName = branches.find((b) => b.id === currentBranchId)?.name || '';
  return (
    <div>
      {publicSectionOpen && (
        <div className="space-y-4">
          {/* جزء عرض ونسخ رابط الحجز الإلكتروني */}
          <div className="rounded-xl border border-warning-200 bg-warning-50/60 p-3">
            <p className="text-warning-800 font-black text-xs mb-2">رابط فورم الجمهور</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-warning-700 font-bold text-xs break-all dir-ltr text-left flex-1 min-w-0">
                {publicBookingLink ?? 'جاري تجهيز فورم الجمهور'}
              </p>
              <button
                type="button"
                onClick={onCopyPublicBookingLink}
                disabled={!publicBookingLink}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning-200 hover:bg-warning-300 text-warning-900 text-sm font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publicLinkCopied ? 'تم النسخ' : 'نسخ الرابط'}
              </button>
            </div>
          </div>

          {/* لافتة توضح الفرع الحالي — تظهر لو عنده أكتر من فرع */}
          {hasMultipleBranches && currentBranchName && (
            <div className="rounded-xl border border-warning-300 bg-warning-100/60 p-3 text-warning-900 text-sm font-black">
              🏥 أنت تدير مواعيد فرع: <span className="underline">{currentBranchName}</span>
              <span className="block text-xs font-bold text-warning-700 mt-1">
                المواعيد اللي هتضيفها هتتحفظ على هذا الفرع فقط. لتغيير الفرع بدّله من قائمة الفروع في التطبيق.
              </span>
            </div>
          )}

          {/* قسم عناوين الفروع — يظهر فقط لما عنده أكثر من فرع */}
          {hasMultipleBranches && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <p className="text-slate-700 font-black text-xs mb-1">عناوين الفروع (تظهر للمريض عند الحجز)</p>
              {branches.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 w-24 shrink-0">{b.name}</span>
                  <input
                    type="text"
                    defaultValue={branchAddresses[b.id] || ''}
                    onBlur={(e) => {
                      const newVal = e.target.value.trim();
                      if (newVal !== (branchAddresses[b.id] || '')) onSaveBranchAddress(b.id, newVal);
                    }}
                    placeholder="مثال: شارع 9 - المعادي"
                    disabled={branchAddressesSaving}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm font-bold focus:ring-2 focus:ring-warning-500 outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* نموذج إضافة فتجة موعد جديدة (تاريخ ووقت + فرع) */}
          <form onSubmit={onAddPublicSlot} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">التاريخ</label>
              <input
                type="date"
                value={publicSlotDateStr}
                min={publicSlotTodayStr}
                onChange={(e) => onPublicSlotDateChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-warning-500 outline-none text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">الساعة</label>
              <input
                type="time"
                value={publicSlotTimeStr}
                min={publicTimeMin}
                onChange={(e) => onPublicSlotTimeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-warning-500 outline-none text-slate-800 font-bold"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={!publicSecret || publicSlotAdding}
                className="px-4 py-2 rounded-xl bg-warning-500 hover:bg-warning-600 text-white font-bold text-sm disabled:opacity-60"
              >
                {publicSlotAdding ? 'جاري الإضافة' : 'إضافة ميعاد للجمهور'}
              </button>
              {publicSlotError && <span className="text-danger-600 text-sm font-bold">{publicSlotError}</span>}
            </div>
          </form>

          {/* عرض قائمة الفتحات التي تم فتحها بالفعل ولم يتم حجزها بعد */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">المواعيد المتاحة حاليًا</label>
            {publicSlotsLoading ? (
              <p className="text-slate-500 font-bold text-sm"><LoadingText>جاري تحميل المواعيد</LoadingText></p>
            ) : publicSlots.length === 0 ? (
              <p className="text-warning-600 font-bold text-sm">لا توجد مواعيد متاحة حاليًا.</p>
            ) : (
              <ul className="space-y-2 max-h-52 overflow-y-auto">
                {publicSlots.map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-sm font-bold text-slate-700">{formatSlotLabel(slot.dateTime)}</span>
                    <button
                      type="button"
                      onClick={() => onRemovePublicSlot(slot.id)}
                      className="px-3 py-1.5 rounded-lg bg-danger-50 text-danger-600 font-bold text-xs border border-danger-100 hover:bg-danger-100"
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


