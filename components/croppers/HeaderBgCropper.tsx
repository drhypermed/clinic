
import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { getRectCroppedImg } from '../../utils/rectCropImage';
import { CropperModalFrame } from './CropperModalFrame';
import { CropperRangeControl } from './CropperRangeControl';

interface HeaderBgCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string, opacity: number) => void;
  onCancel: () => void;
}

export const HeaderBgCropper: React.FC<HeaderBgCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropCompleteHandler = useCallback((_a: any, px: any) => setCroppedAreaPixels(px), []);

  const handleSave = async () => {
    try {
      if (zoom === 1 && crop.x === 0 && crop.y === 0 && rotation === 0) {
        onCropComplete(imageSrc, opacity / 100);
        return;
      }
      const img = await getRectCroppedImg(imageSrc, croppedAreaPixels, undefined, rotation);
      onCropComplete(img, opacity / 100);
    } catch (e) {
      console.error(e);
      onCropComplete(imageSrc, opacity / 100);
    }
  };

  return (
    <CropperModalFrame
      title="تعديل تصميم الهيدر"
      subtitle="حرك الصورة واضبط الزوم والشفافية"
      cropperContent={
        <div className="relative w-full h-64 bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={6.5}
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
            label="التكبير"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={setZoom}
            accentClassName="accent-blue-600"
            renderValue={(value) => `${Math.round(value * 100)}%`}
          />
          <CropperRangeControl
            label="التدوير"
            value={rotation}
            min={-180}
            max={180}
            step={1}
            onChange={setRotation}
            accentClassName="accent-indigo-600"
            renderValue={(value) => `${Math.round(value)}°`}
          />
          <CropperRangeControl
            label="الشفافية"
            value={opacity}
            min={10}
            max={100}
            step={5}
            onChange={setOpacity}
            accentClassName="accent-purple-600"
          />
        </>
      }
      onSave={handleSave}
      onCancel={onCancel}
    />
  );
};
