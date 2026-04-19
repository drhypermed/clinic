/**
 * مودال قص الصور (Crop Modal)
 * يوفر واجهة للمسؤول لقص وتعديل أبعاد الصور المرفوعة لتناسب مقاسات البانر القياسية
 * (1600 بكسل عرض) قبل إرسالها إلى التخزين السحابي.
 */

import React from 'react';
import { ImageCropperShell } from '../../ui/ImageCropperShell';
import { CropAreaPixels } from './types';

interface CropModalProps {
  open: boolean;
  image: string | null;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  bannerWidth: number;
  bannerHeight: number;
  onClose: () => void;
  onCropChange: (value: { x: number; y: number }) => void;
  onZoomChange: (value: number) => void;
  onCropComplete: (
    croppedArea: { x: number; y: number; width: number; height: number },
    croppedAreaPixels: CropAreaPixels
  ) => void;
  onApply: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  open,
  image,
  crop,
  zoom,
  aspect,
  bannerWidth,
  bannerHeight,
  onClose,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onApply,
}) => {
  return (
    <ImageCropperShell
      isOpen={open}
      image={image}
      crop={crop}
      zoom={zoom}
      aspect={aspect}
      title="تعديل صورة البانر قبل الإضافة"
      subtitle={`المقاس النهائي: ${bannerWidth} × ${bannerHeight} بكسل`}
      onClose={onClose}
      onCropChange={onCropChange}
      onZoomChange={onZoomChange}
      onCropComplete={onCropComplete}
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
            إلغاء
          </button>
          <button type="button" onClick={onApply} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
            إضافة الصورة
          </button>
        </>
      }
    />
  );
};
