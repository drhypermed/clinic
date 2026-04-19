/**
 * ImageCropperShell — هيكل مشترك لنوافذ قص الصور
 *
 * يوفر الـ chrome المشترك (backdrop + حاوية + Cropper + زر التكبير) لأي
 * نافذة قص صور في التطبيق، ويترك أزرار الحفظ/الإلغاء للمستهلك عبر `footer`.
 *
 * المستهلكون الحاليون:
 *   - `components/admin/homepage-banner-management/CropModal.tsx`
 *   - `components/advertisement/doctor-advertisement/ImageCropModal.tsx`
 *
 * يعتمد على:
 *   - `react-easy-crop` لعرض الـ cropper
 *   - `components/ui/ModalOverlay` للـ backdrop الموحّد
 */

import React from 'react';
import Cropper from 'react-easy-crop';
import { ModalOverlay } from './ModalOverlay';

export interface CropAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperShellProps {
  /** هل المودال مفتوح؟ */
  isOpen: boolean;
  /** مسار الصورة المراد قصّها (data URL أو URL عادي) */
  image: string | null;
  /** موضع القص الحالي */
  crop: { x: number; y: number };
  /** مستوى التكبير الحالي */
  zoom: number;
  /** النسبة المستهدفة (عرض/ارتفاع) */
  aspect?: number;
  /** عنوان النافذة */
  title: string;
  /** سطر وصفي اختياري تحت العنوان */
  subtitle?: string;
  /** شكل القص — rect أو round */
  cropShape?: 'rect' | 'round';
  /** محدود أدنى للتكبير */
  minZoom?: number;
  /** حد أعلى للتكبير */
  maxZoom?: number;
  /** خطوة التكبير */
  zoomStep?: number;
  onClose: () => void;
  onCropChange: (value: { x: number; y: number }) => void;
  onZoomChange: (value: number) => void;
  onCropComplete: (
    croppedArea: { x: number; y: number; width: number; height: number },
    croppedAreaPixels: CropAreaPixels
  ) => void;
  /** أزرار التحكم في الأسفل (حفظ/إلغاء/...) */
  footer: React.ReactNode;
}

export const ImageCropperShell: React.FC<ImageCropperShellProps> = ({
  isOpen,
  image,
  crop,
  zoom,
  aspect,
  title,
  subtitle,
  cropShape = 'rect',
  minZoom = 1,
  maxZoom = 3,
  zoomStep = 0.05,
  onClose,
  onCropChange,
  onZoomChange,
  onCropComplete,
  footer,
}) => {
  if (!image) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      zIndex={50}
      backdropClass="bg-slate-900/75 backdrop-blur-sm"
      contentClassName="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-4"
    >
      <h4 className="text-lg font-black text-slate-800">{title}</h4>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      <div
        className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-600 mb-1">التكبير</label>
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={zoomStep}
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex flex-wrap gap-2 justify-end">{footer}</div>
    </ModalOverlay>
  );
};
