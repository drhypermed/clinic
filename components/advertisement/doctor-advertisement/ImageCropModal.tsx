/** نافذة قص الصور: تتيح للطبيب تعديل أبعاد الصورة وتكبيرها لضمان ظهورها بشكل مثالي في الإعلان. */
import React from 'react';

import { ImageCropperShell } from '../../ui/ImageCropperShell';

interface ImageCropModalProps {
  pendingCropImage: string | null;
  crop: { x: number; y: number };
  zoom: number;
  aspect?: number;
  uploading?: boolean;
  onCropChange: (value: { x: number; y: number }) => void;
  onZoomChange: (value: number) => void;
  onCropComplete: (
    croppedArea: { x: number; y: number; width: number; height: number },
    croppedPixels: { x: number; y: number; width: number; height: number }
  ) => void;
  onCancel: () => void;
  onSaveEdited: () => void | Promise<void>;
  onSaveOriginal: () => void | Promise<void>;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  pendingCropImage,
  crop,
  zoom,
  aspect,
  uploading,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onSaveEdited,
  onSaveOriginal,
}) => {
  return (
    <ImageCropperShell
      isOpen={Boolean(pendingCropImage)}
      image={pendingCropImage}
      crop={crop}
      zoom={zoom}
      aspect={aspect}
      title="تعديل الصورة قبل الرفع"
      onClose={onCancel}
      onCropChange={onCropChange}
      onZoomChange={onZoomChange}
      onCropComplete={onCropComplete}
      footer={
        <>
          <button
            type="button"
            onClick={() => void onSaveOriginal()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold disabled:opacity-60"
          >
            رفع الأصل كما هي
          </button>
          <button
            type="button"
            onClick={() => void onSaveEdited()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
          >
            {uploading ? 'جاري الرفع' : 'تعديل ثم رفع'}
          </button>
        </>
      }
    />
  );
};
