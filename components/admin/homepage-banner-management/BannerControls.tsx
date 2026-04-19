/**
 * أدوات التحكم في البانر (Banner Controls)
 * مكون يتيح للمسؤول ضبط الإعدادات العامة للبانر (الطول، سرعة التقلب، تفعيل/تعطيل)
 * بالإضافة إلى أدوات إضافة صور جديدة يدوياً أو برفعها.
 */

import React from 'react';
import { BANNER_WIDTH, DEFAULT_BANNER_HEIGHT, DEFAULT_ROTATION_SECONDS } from './constants';

interface BannerControlsProps {
  bannerHeight: number;
  rotationSeconds: number;
  isActive: boolean;
  newImageUrl: string;
  saving: boolean;
  uploading: boolean;
  statusMessage: string;
  onChangeBannerHeight: (value: number) => void;
  onChangeRotationSeconds: (value: number) => void;
  onChangeNewImageUrl: (value: string) => void;
  onAddImageUrl: () => void;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIsActive: (value: boolean) => void;
  onSave: () => void;
}

export const BannerControls: React.FC<BannerControlsProps> = ({
  bannerHeight,
  rotationSeconds,
  isActive,
  newImageUrl,
  saving,
  uploading,
  statusMessage,
  onChangeBannerHeight,
  onChangeRotationSeconds,
  onChangeNewImageUrl,
  onAddImageUrl,
  onSelectImage,
  onChangeIsActive,
  onSave,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border border-slate-500 bg-slate-800/70">
        <p className="text-white font-bold text-sm">⚙️ إعدادات عامة للبانر</p>
        <p className="text-slate-300 text-xs mt-1">هذه الإعدادات تؤثر على البانر بالكامل في الصفحة الرئيسية.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 text-sm mb-1">عرض البانر</label>
          <input
            type="number"
            value={BANNER_WIDTH}
            disabled
            className="w-full rounded-lg border border-slate-500 bg-slate-700 text-slate-300 px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1">طول البانر (px)</label>
          <input
            type="number"
            min={120}
            value={bannerHeight}
            onChange={(event) =>
              onChangeBannerHeight(Math.max(120, Number(event.target.value) || DEFAULT_BANNER_HEIGHT))
            }
            className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm mb-1">مدة بقاء كل صورة (ثواني)</label>
        <input
          type="number"
          min={1}
          value={rotationSeconds}
          onChange={(event) =>
            onChangeRotationSeconds(Math.max(1, Number(event.target.value) || DEFAULT_ROTATION_SECONDS))
          }
          className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-4 py-2"
        />
        <p className="text-[11px] text-slate-400 mt-1">الصور ستتقلب في الرئيسية بنفس المدة المحددة هنا بشكل مباشر.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-slate-300 text-sm">إضافة صورة برابط مباشر</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(event) => onChangeNewImageUrl(event.target.value)}
            className="flex-1 rounded-lg border border-slate-500 bg-slate-600 text-white px-4 py-2"
            placeholder="https://.../banner.jpg"
            dir="ltr"
          />
          <button
            type="button"
            onClick={onAddImageUrl}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
          >
            إضافة
          </button>
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm mb-1">أو ارفع صورة (مع التعديل قبل الرفع)</label>
        <input
          type="file"
          accept="image/*"
          onChange={onSelectImage}
          className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-4 py-2 file:mr-3 file:rounded file:border-0 file:bg-fuchsia-600 file:px-3 file:py-1 file:text-white"
        />
      </div>

      <label className="flex items-center gap-3 text-slate-200">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => onChangeIsActive(event.target.checked)}
          className="h-4 w-4"
        />
        تفعيل عرض البانر في الصفحة الرئيسية
      </label>

      <button
        type="button"
        onClick={onSave}
        disabled={saving || uploading}
        className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-bold disabled:opacity-50"
      >
        {saving || uploading ? 'جاري الحفظ' : 'حفظ إعدادات البانر'}
      </button>

      {statusMessage && <div className="text-sm text-white bg-slate-600 rounded-lg p-3">{statusMessage}</div>}
    </div>
  );
};
