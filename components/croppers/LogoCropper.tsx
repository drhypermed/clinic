/**
 * مكون قص شعار العيادة (Logo Cropper)
 * يتيح للطبيب قص شعار العيادة بدقة، مع الحفاظ على النسب الصحيحة للحصول على أفضل جودة في الروشتة.
 */

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import { CropperRangeControl } from './CropperRangeControl';

interface LogoCropperProps {
    imageSrc: string;
    onCropComplete: (croppedBase64: string) => void;
    onCancel: () => void;
}

export const LogoCropper: React.FC<LogoCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => { setCrop(crop); };
    const onZoomChange = (zoom: number) => { setZoom(zoom); };
    const onCropCompleteHandler = useCallback((_area: any, croppedAreaPx: any) => { setCroppedAreaPixels(croppedAreaPx); }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 300, rotation);
            onCropComplete(croppedImage);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold text-slate-800">قص وتعديل الشعار</h3>
                    <p className="text-sm text-slate-500">حرك الصورة وضعها داخل الدائرة</p>
                </div>
                <div className="relative w-full h-80 bg-slate-900">
                    <Cropper 
                        image={imageSrc} 
                        crop={crop} 
                        zoom={zoom} 
                        aspect={1} 
                        cropShape="round" 
                        showGrid={false} 
                        restrictPosition={false}
                        rotation={rotation}
                        onCropChange={onCropChange} 
                        onCropComplete={onCropCompleteHandler} 
                        onZoomChange={onZoomChange} 
                        onRotationChange={setRotation}
                    />
                </div>
                <div className="p-6 space-y-4">
                    <CropperRangeControl
                        label="التكبير"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={setZoom}
                        accentClassName="accent-brand-600"
                        renderValue={(value) => `${Math.round(value * 100)}%`}
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
                    <div className="flex items-center gap-2">
                        <button onClick={() => setRotation((prev) => prev - 90)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold">↺ 90°</button>
                        <button onClick={() => setRotation((prev) => prev + 90)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold">↻ 90°</button>
                        <button onClick={() => setRotation(0)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold">تصفير</button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSave} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition">✓ قص وحفظ</button>
                        <button onClick={onCancel} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
