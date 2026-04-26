/**
 * useProfileImageCropper:
 * hook لإدارة حالة قص صورة الملف الشخصي (Cropper):
 * - فتح النافذة عند اختيار صورة (مع تحقق من الحجم والنوع).
 * - تتبّع إزاحة/تكبير القص.
 * - تطبيق القص النهائي عبر getCroppedImg.
 */
import React, { useCallback, useState } from 'react';
import { getCroppedImg } from '../../../utils/cropImage';

interface HookArgs {
  onCroppedReady: (base64: string) => void;
  onError: (message: string) => void;
}

// نوع croppedAreaPixels من react-easy-crop (x/y/width/height بالبكسل)
interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useProfileImageCropper({ onCroppedReady, onError }: HookArgs) {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // معالجة اختيار صورة جديدة من الجهاز + تحقق من الحجم والنوع
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }
    if (!file.type.startsWith('image/')) {
      onError('يرجى اختيار صورة صالحة');
      return;
    }

    // تحويل الصورة لـ base64 ثم فتح نافذة القص
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageToCrop(base64);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // يُستدعى من react-easy-crop في كل حركة (يخزّن المساحة النهائية فقط)
  const onCropComplete = useCallback(
    (_croppedArea: unknown, cropPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(cropPixels);
    },
    [],
  );

  // تطبيق القص النهائي → base64 صورة مقصوصة 300px
  const handleConfirmCrop = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels, 300);
      onCroppedReady(croppedImage);
      setIsCropping(false);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      onError('حدث خطأ أثناء قص الصورة');
    }
  };

  // إلغاء القص وإغلاق النافذة
  const cancelCrop = () => {
    setIsCropping(false);
    setImageToCrop(null);
  };

  return {
    imageToCrop,
    crop,
    zoom,
    isCropping,
    setCrop,
    setZoom,
    handleImageChange,
    onCropComplete,
    handleConfirmCrop,
    cancelCrop,
  };
}
