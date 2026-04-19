/**
 * محرر ومعاينة البانر (Banner Preview Editor)
 * مكون يعرض معاينة حية للبانر كما سيظهر للمستخدمين، ويتيح تعديل 
 * بيانات كل صورة على حدة (العنوان، الوصف، رابط التوجيه، تاريخ الانتهاء).
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
        <p className="text-slate-300 text-sm">معاينة البانر</p>
        <p className="text-cyan-300 text-xs font-bold">المقاس المطلوب: 1600 × {safeHeight} px</p>
      </div>

      <div className="rounded-xl border border-slate-500 bg-slate-800 p-3 min-h-[220px]">
        {previewImage ? (
          <AdBanner
            items={items}
            imageUrls={imageUrls}
            imageUrl={imageUrl}
            displayHeight={safeHeight}
            rotationSeconds={safeRotationSeconds}
            className="border border-slate-600"
          />
        ) : (
          <div className="w-full h-44 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
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
                  className={`w-full h-16 rounded-lg overflow-hidden border ${
                    idx === activePreviewIndex ? 'border-cyan-400' : 'border-slate-600'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={`banner-${idx}`}
                    className="w-full h-full object-contain bg-slate-700"
                  />
                </button>
                <div className="absolute bottom-1 right-1 bg-black/65 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {getExpiryInfo(item.expiresAt, nowMs)}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-black"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeItem && (
        <div className="space-y-3 p-3 rounded-xl border border-slate-500 bg-slate-800">
          <div>
            <p className="text-white font-bold text-sm">🖼️ إعدادات الصورة الحالية (صورة رقم {activePreviewIndex + 1})</p>
            <p className="text-slate-300 text-xs mt-1">هذه الخانات تخص الصورة المحددة فقط ولن تؤثر على باقي الصور.</p>
          </div>

          <div>
            <label className="block text-slate-300 text-xs mb-1">عنوان الصورة</label>
            <input
              type="text"
              value={activeItem.title}
              onChange={(event) => onUpdateActiveItem({ title: event.target.value })}
              placeholder="عنوان الصورة"
              className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs mb-1">وصف الصورة</label>
            <input
              type="text"
              value={activeItem.subtitle}
              onChange={(event) => onUpdateActiveItem({ subtitle: event.target.value })}
              placeholder="وصف الصورة"
              className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs mb-1">نص زر الصورة</label>
            <input
              type="text"
              value={activeItem.ctaText}
              onChange={(event) => onUpdateActiveItem({ ctaText: event.target.value })}
              placeholder="نص الزر"
              className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs mb-1">رابط هذه الصورة فقط (اختياري)</label>
            <input
              type="url"
              value={activeItem.targetUrl}
              onChange={(event) => onUpdateActiveItem({ targetUrl: event.target.value })}
              placeholder="رابط هذه الصورة"
              className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs mb-1">تاريخ/وقت انتهاء الإعلان لهذه الصورة</label>
            <input
              type="datetime-local"
              value={activeItem.expiresAt || ''}
              onChange={(event) => onUpdateActiveItem({ expiresAt: event.target.value })}
              className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
            />
            <p className="text-[11px] text-slate-400 mt-1">عند انتهاء الوقت سيتم إخفاء الصورة تلقائياً من التقليب.</p>
          </div>

          <div className="rounded-lg bg-slate-700/60 border border-slate-600 p-2">
            <p className="text-cyan-300 text-xs font-bold">مؤشر الانتهاء: {getExpiryInfo(activeItem.expiresAt, nowMs)}</p>
          </div>

          <label className="flex items-center gap-2 text-slate-200 text-sm">
            <input
              type="checkbox"
              checked={activeItem.isActive}
              onChange={(event) => onUpdateActiveItem({ isActive: event.target.checked })}
              className="h-4 w-4"
            />
            تفعيل هذه الصورة في التقليب
          </label>
        </div>
      )}
    </div>
  );
};
