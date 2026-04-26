/**
 * أدوات التحكم في البانر (Banner Controls)
 * مكون يتيح للمسؤول ضبط الإعدادات العامة للبانر (الطول، سرعة التقلب، تفعيل/تعطيل)
 * بالإضافة إلى أدوات إضافة صور جديدة يدوياً أو برفعها.
 *
 * ─ الألوان (2026-04): light theme موحّد مع باقي شاشات الأدمن (إدارة الحسابات/فئات الاشتراك).
 *   خلفية بيضاء + حدود slate-200 + accent متدرج أزرق (brand) للأزرار الرئيسية.
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

// ─ كلاسات مشتركة للحقول — موحّدة مع نمط Account Management
const fieldClass =
  'w-full rounded-lg border-2 border-slate-200 bg-white text-slate-900 px-4 py-2 placeholder-slate-400 focus:border-brand-400 focus:outline-none transition-colors';
const labelClass = 'block text-slate-700 text-sm font-bold mb-1';

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
  // ─ تحديد نوع رسالة الحالة من البادئة (✅/❌/⚠️) لاختيار اللون المناسب
  const statusTone: 'success' | 'error' | 'warning' | 'neutral' = (() => {
    const trimmed = statusMessage.trim();
    if (trimmed.startsWith('✅')) return 'success';
    if (trimmed.startsWith('❌')) return 'error';
    if (trimmed.startsWith('⚠️')) return 'warning';
    return 'neutral';
  })();
  const statusToneClass = {
    success: 'border-success-200 bg-success-50 text-success-700',
    error: 'border-danger-200 bg-danger-50 text-danger-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  }[statusTone];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/70">
        <p className="text-brand-700 font-black text-sm">⚙️ إعدادات عامة للبانر</p>
        <p className="text-slate-600 text-xs mt-1">هذه الإعدادات تؤثر على البانر بالكامل في الصفحة الرئيسية.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>عرض البانر</label>
          <input
            type="number"
            value={BANNER_WIDTH}
            disabled
            className="w-full rounded-lg border-2 border-slate-200 bg-slate-100 text-slate-500 px-4 py-2 cursor-not-allowed"
          />
        </div>
        <div>
          <label className={labelClass}>طول البانر (px)</label>
          <input
            type="number"
            min={120}
            value={bannerHeight}
            onChange={(event) =>
              onChangeBannerHeight(Math.max(120, Number(event.target.value) || DEFAULT_BANNER_HEIGHT))
            }
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>مدة بقاء كل صورة (ثواني)</label>
        <input
          type="number"
          min={1}
          value={rotationSeconds}
          onChange={(event) =>
            onChangeRotationSeconds(Math.max(1, Number(event.target.value) || DEFAULT_ROTATION_SECONDS))
          }
          className={fieldClass}
        />
        <p className="text-[11px] text-slate-500 mt-1">الصور ستتقلب في الرئيسية بنفس المدة المحددة هنا بشكل مباشر.</p>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>إضافة صورة برابط مباشر</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(event) => onChangeNewImageUrl(event.target.value)}
            className={`${fieldClass} flex-1`}
            placeholder="https://.../banner.jpg"
            dir="ltr"
          />
          <button
            type="button"
            onClick={onAddImageUrl}
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white font-bold shadow-sm transition-colors"
          >
            إضافة
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>أو ارفع صورة (مع التعديل قبل الرفع)</label>
        <input
          type="file"
          accept="image/*"
          onChange={onSelectImage}
          className="w-full rounded-lg border-2 border-slate-200 bg-white text-slate-700 px-4 py-2 file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700 file:font-bold hover:file:bg-brand-100"
        />
      </div>

      <label className="flex items-center gap-3 text-slate-700 font-bold cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => onChangeIsActive(event.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
        تفعيل عرض البانر في الصفحة الرئيسية
      </label>

      <button
        type="button"
        onClick={onSave}
        disabled={saving || uploading}
        className="w-full py-3 bg-gradient-to-r from-success-600 to-brand-600 hover:from-success-700 hover:to-brand-700 text-white rounded-xl font-black shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving || uploading ? 'جاري الحفظ...' : 'حفظ إعدادات البانر'}
      </button>

      {statusMessage && (
        <div className={`text-sm font-bold rounded-xl p-3 border-2 ${statusToneClass}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};
