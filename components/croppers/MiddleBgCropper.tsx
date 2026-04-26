
import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { getRectCroppedImg } from '../../utils/rectCropImage';
import { CropperModalFrame } from './CropperModalFrame';
import { CropperRangeControl } from './CropperRangeControl';

interface MiddleBgCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string, opacity: number) => void;
  onCancel: () => void;
}

const resizeImageByScale = async (imageDataUrl: string, scale: number): Promise<string> => {
  const img = new Image();
  img.src = imageDataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageDataUrl;

  const newWidth = (img.width * scale) / 100;
  const newHeight = (img.height * scale) / 100;
  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  return canvas.toDataURL('image/png');
};

export const MiddleBgCropper: React.FC<MiddleBgCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [scale, setScale] = useState(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropCompleteHandler = useCallback((_a: any, px: any) => setCroppedAreaPixels(px), []);

  const handleSave = async () => {
    try {
      if (zoom === 1 && crop.x === 0 && crop.y === 0 && scale === 100 && rotation === 0) {
        onCropComplete(imageSrc, opacity / 100);
        return;
      }

      let processedImage = imageSrc;
      if (croppedAreaPixels && (zoom !== 1 || crop.x !== 0 || crop.y !== 0 || rotation !== 0)) {
        processedImage = await getRectCroppedImg(imageSrc, croppedAreaPixels, undefined, rotation);
      }

      if (scale !== 100) {
        processedImage = await resizeImageByScale(processedImage, scale);
      }

      onCropComplete(processedImage, opacity / 100);
    } catch (e) {
      console.error(e);
      onCropComplete(imageSrc, opacity / 100);
    }
  };

  return (
    <CropperModalFrame
      title="تعديل تصميم منتصف الروشتة"
      subtitle="حرك الصورة واضبط الزوم والشفافية"
      cropperContent={
        <div className="relative w-full h-96 bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            objectFit="contain"
            style={{ mediaStyle: { opacity: opacity / 100 } }}
          />
        </div>
      }
      controlsContent={
        <>
          <CropperRangeControl
            label="التكبير (للمعاينة)"
            value={zoom}
            min={0.5}
            max={3}
            step={0.1}
            onChange={setZoom}
            accentClassName="accent-brand-600"
            renderValue={(value) => `${Math.round(value * 100)}%`}
          />
          <CropperRangeControl
            label="حجم الصورة"
            value={scale}
            min={10}
            max={200}
            step={1}
            onChange={setScale}
            accentClassName="accent-success-600"
          />
          <CropperRangeControl
            label="التدوير"
            value={rotation}
            min={-180}
            max={180}
            step={1}
            onChange={setRotation}
            accentClassName="accent-brand-600"
            renderValue={(value) => `${Math.round(value)}°`}
          />
          <CropperRangeControl
            label="الشفافية"
            value={opacity}
            min={10}
            max={100}
            step={5}
            onChange={setOpacity}
            accentClassName="accent-slate-600"
          />
        </>
      }
      onSave={handleSave}
      onCancel={onCancel}
    />
  );
};
