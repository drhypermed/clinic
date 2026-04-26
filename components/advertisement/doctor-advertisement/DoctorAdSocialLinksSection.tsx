/**
 * قسم روابط السوشيال ميديا — قسم عالمي للطبيب (مش لكل فرع).
 * اتفصل عن قسم التواصل عشان تعدد الفروع: كل فرع له رقمه لكن السوشيال
 * بتاعة الطبيب واحدة لكل فروعه.
 */
import React from 'react';

import { createSocialId } from './utils';
import type { DoctorSocialLink } from './types';

interface DoctorAdSocialLinksSectionProps {
  socialLinks: DoctorSocialLink[];
  onSocialPlatformChange: (id: string, value: string) => void;
  onSocialUrlChange: (id: string, value: string) => void;
  onSocialRemove: (id: string) => void;
  onSocialAdd: () => void;
}

export const DoctorAdSocialLinksSection: React.FC<DoctorAdSocialLinksSectionProps> = ({
  socialLinks,
  onSocialPlatformChange,
  onSocialUrlChange,
  onSocialRemove,
  onSocialAdd,
}) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
      <h3 className="text-sm font-black text-slate-700 mb-2.5 block">روابط السوشيال ميديا</h3>
      <div className="space-y-2">
        {socialLinks.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
            <select
              value={item.platform}
              onChange={(event) => onSocialPlatformChange(item.id, event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-semibold"
            >
              <option value="">اختر المنصة</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="X">X</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
            <input
              value={item.url}
              onChange={(event) => onSocialUrlChange(item.id, event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
              placeholder="https://..."
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => onSocialRemove(item.id)}
              className="px-3 py-2.5 rounded-xl bg-danger-50 text-danger-700 border border-danger-200 font-bold text-xs hover:bg-danger-100 transition-colors"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onSocialAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          إضافة رابط
        </button>
      </div>
    </section>
  );
};

/** عشان الكود الخارجي يقدر يضيف صف فارغ جديد. */
export const createSocialLinkDraft = (): DoctorSocialLink => ({
  id: createSocialId(),
  platform: '',
  url: '',
});
