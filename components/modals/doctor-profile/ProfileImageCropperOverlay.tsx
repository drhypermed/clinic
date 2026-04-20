/**
 * ProfileImageCropperOverlay — نافذة قص صورة البروفايل
 *
 * نافذة قص مربعة الشكل تُستخدم من `DoctorProfileModal` لتعديل صورة
 * البروفايل قبل رفعها إلى Firebase Storage. تعتمد على `react-easy-crop`
 * وترجع القصاصة كـ data URL عبر `onConfirm` (يُحسب خارجياً من croppedAreaPixels).
 */

import React from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';

interface ProfileImageCropperOverlayProps {
    imageToCrop: string;
    crop: { x: number; y: number };
    zoom: number;
    onCropChange: (value: { x: number; y: number }) => void;
    onZoomChange: (value: number) => void;
    onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export const ProfileImageCropperOverlay: React.FC<ProfileImageCropperOverlayProps> = ({
    imageToCrop,
    crop,
    zoom,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onConfirm,
    onCancel,
}) => {
    return createPortal(
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10001] flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between z-10">
                    <h3 className="text-xl font-black">قص الصورة</h3>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative flex-1 w-full bg-slate-900">
                    <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropComplete}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center gap-4 px-2">
                        <span className="text-xs font-bold text-slate-500">تصغير</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => onZoomChange(Number(e.target.value))}
                            className="flex-1 accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-500">تكبير</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => void onConfirm()}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-black hover:shadow-lg transition-all"
                        >
                            اعتماد الصورة
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-black hover:bg-slate-50 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
