/**
 * محرر ومعاينة البانر (Banner Preview Editor)
 * مكون يعرض معاينة حية للبانر كما سيظهر للمستخدمين، ويتيح تعديل
 * بيانات كل صورة على حدة (العنوان، الوصف، رابط التوجيه، تاريخ الانتهاء).
 *
 * ─ الألوان (2026-04): light theme موحّد مع باقي شاشات الأدمن.
 *   منطقة المعاينة بخلفية slate-50 خفيفة لتمييزها عن الفورم.
 */

import React from 'react';
import { AdBanner } from '../../common/AdBanner';
import { getExpiryInfo } from './constants';
import { BannerItem } from '../../../types';
import { useTrustedNow } from '../../../hooks/useTrustedNow';

interface BannerPreviewEditorProps {
  items: BannerItem[];
  imageUrls: string[];
  imageUrl: string;
  safeHeight: number;
  safeRotationSeconds: number;
  activePreviewIndex: number;
  activeItem: BannerItem | null;
  onSelectPreviewIndex: (index: number) => void;
  onRemoveImage: (index: number) => void;
  onUpdateActiveItem: (patch: Partial<BannerItem>) => void;
}

// ─ كلاسات مشتركة موحّدة مع BannerControls
const fieldClass =
  'w-full rounded-lg border-2 border-slate-200 bg-white text-slate-900 px-3 py-2 placeholder-slate-400 focus:border-brand-400 focus:outline-none transition-colors';
const labelClass = 'block text-slate-700 text-xs font-bold mb-1';

export const BannerPreviewEditor: React.FC<BannerPreviewEditorProps> = ({
  items,
  imageUrls,
  imageUrl,
  safeHeight,
  safeRotationSeconds,
  activePreviewIndex,
  activeItem,
  onSelectPreviewIndex,
  onRemoveImage,
  onUpdateActiveItem,
}) => {
  const { nowMs } = useTrustedNow();
  const previewImage = activeItem?.imageUrl || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 gap-3">
        <p className="text-slate-700 text-sm font-bold">معاينة البانر</p>
        <p className="text-brand-700 text-xs font-bold bg-brand-50 px-2 py-1 rounded-md">
          المقاس المطلوب: 1600 × {safeHeight} px
        </p>
      </div>

      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 min-h-[220px]">
        {previewImage ? (
          <AdBanner
            items={items}
            imageUrls={imageUrls}
            imageUrl={imageUrl}
            displayHeight={safeHeight}
            rotationSeconds={safeRotationSeconds}
            className="border border-slate-200"
          />
        ) : (
          <div className="w-full h-44 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-500 text-sm">
            لا توجد صور حالياً
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {items.map((item, idx) => (
              <div key={`${item.imageUrl}-${idx}`} className="relative">
                <button
                  type="button"
                  onClick={() => onSelectPreviewIndex(idx)}
                  className={`w-full h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === activePreviewIndex
                      ? 'border-brand-500 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={`banner-${idx}`}
                    className="w-full h-full object-contain bg-white"
                  />
                </button>
                <div className="absolute bottom-1 right-1 bg-slate-900/75 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {getExpiryInfo(item.expiresAt, nowMs)}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-danger-600 hover:bg-danger-700 text-white text-sm font-black shadow-sm transition-colors"
                  aria-label="حذف الصورة"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeItem && (
        <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="pb-2 border-b border-slate-100">
            <p className="text-slate-900 font-black text-sm">🖼️ إعدادات الصورة الحالية (صورة رقم {activePreviewIndex + 1})</p>
            <p className="text-slate-500 text-xs mt-1">هذه الخانات تخص الصورة المحددة فقط ولن تؤثر على باقي الصور.</p>
          </div>

          <div>
            <label className={labelClass}>عنوان الصورة</label>
            <input
              type="text"
              value={activeItem.title}
              onChange={(event) => onUpdateActiveItem({ title: event.target.value })}
              placeholder="عنوان الصورة"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>وصف الصورة</label>
            <input
              type="text"
              value={activeItem.subtitle}
              onChange={(event) => onUpdateActiveItem({ subtitle: event.target.value })}
              placeholder="وصف الصورة"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>نص زر الصورة</label>
            <input
              type="text"
              value={activeItem.ctaText}
              onChange={(event) => onUpdateActiveItem({ ctaText: event.target.value })}
              placeholder="نص الزر"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>رابط هذه الصورة فقط (اختياري)</label>
            <input
              type="url"
              value={activeItem.targetUrl}
              onChange={(event) => onUpdateActiveItem({ targetUrl: event.target.value })}
              placeholder="رابط هذه الصورة"
              className={fieldClass}
              dir="ltr"
            />
          </div>

          <div>
            <label className={labelClass}>تاريخ/وقت انتهاء الإعلان لهذه الصورة</label>
            <input
              type="datetime-local"
              value={activeItem.expiresAt || ''}
              onChange={(event) => onUpdateActiveItem({ expiresAt: event.target.value })}
              className={fieldClass}
            />
            <p className="text-[11px] text-slate-500 mt-1">عند انتهاء الوقت سيتم إخفاء الصورة تلقائياً من التقليب.</p>
          </div>

          <div className="rounded-lg bg-brand-50 border border-brand-200 p-2">
            <p className="text-brand-700 text-xs font-bold">مؤشر الانتهاء: {getExpiryInfo(activeItem.expiresAt, nowMs)}</p>
          </div>

          <label className="flex items-center gap-2 text-slate-700 text-sm font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={activeItem.isActive}
              onChange={(event) => onUpdateActiveItem({ isActive: event.target.checked })}
              className="h-4 w-4 accent-brand-600"
            />
            تفعيل هذه الصورة في التقليب
          </label>
        </div>
      )}
    </div>
  );
};
