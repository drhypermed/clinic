import React from 'react';
import type { PrescriptionMiddleSettings } from '../../types';
import { CollapsibleSection } from './CollapsibleSection';

interface MiddleSettingsTabProps {
    middle: PrescriptionMiddleSettings; // إعدادات المنتصف الحالية
    updateMiddle: (u: Partial<PrescriptionMiddleSettings>) => void; // دالة التحديث
    openSection: string; // القسم المفتوح حالياً في الإعدادات
    setOpenSection: (s: string) => void;
    showNotification: (type: 'success' | 'error', msg: string) => void; // لإظهار تنبيهات النجاح/الفشل
    setMiddleBgToCrop: (v: string | null) => void;
}

export const MiddleSettingsTab: React.FC<MiddleSettingsTabProps> = ({
    middle,
    updateMiddle,
    openSection,
    setOpenSection,
    showNotification,
    setMiddleBgToCrop,
}) => {
    const toggle = (id: string) => setOpenSection(openSection === id ? '' : id);

    return (
        <div className="space-y-6">
            <CollapsibleSection
                title="🖼️ تصميم خلفية منتصف الروشتة"
                isOpen={openSection === 'middleBg'}
                onToggle={() => toggle('middleBg')}
                className="p-4 bg-gradient-to-br from-blue-50 to-white"
                color="blue"
            >
                <p className="text-xs text-slate-500 mb-3">ارفع تصميم جاهز لخلفية منتصف الروشتة (صورة PNG أو JPG)</p>
                <input
                    type="file"
                    accept="image/*"
                    id="middleBgInput"
                    onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                            if (f.size > 5 * 1024 * 1024) {
                                showNotification('error', 'حجم الصورة كبير جداً (أقصى 5MB)');
                                return;
                            }
                            const r = new FileReader();
                            r.onload = () => {
                                setMiddleBgToCrop(r.result as string);
                                showNotification('success', 'تم تحميل الصورة. عدّل القص/التدوير ثم احفظ.');
                            };
                            r.readAsDataURL(f);
                            e.target.value = '';
                        }
                    }}
                    className="hidden"
                />
                {!middle.middleBackgroundImage ? (
                    <button
                        onClick={() => document.getElementById('middleBgInput')?.click()}
                        className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 text-slate-500 hover:text-blue-600"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-bold">رفع تصميم جاهز مع التعديل عليه</span>
                    </button>
                ) : (
                    <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border border-slate-200">
                            <img src={middle.middleBackgroundImage} alt="Middle Background" className="w-full h-24 object-cover" />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => document.getElementById('middleBgInput')?.click()}
                                className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-all text-sm"
                            >
                                🖼️ رفع صورة جديدة
                            </button>
                            <button
                                onClick={() => {
                                    updateMiddle({ middleBackgroundImage: undefined });
                                    showNotification('success', 'تم حذف تصميم منتصف الروشتة');
                                }}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all"
                            >
                                🗑️ حذف
                            </button>
                        </div>
                    </div>
                )}
                <div className="border-t border-slate-200 my-4 pt-4 space-y-4">
                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">🎨 لون خلفية المنتصف</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">🎨 اللون</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={middle.middleBgColor || '#ffffff'}
                                    onChange={e => updateMiddle({ 
                                        middleBgColor: e.target.value, 
                                        middleBgColorOpacity: middle.middleBgColorOpacity ?? 1 
                                    })}
                                    className="w-16 h-10 rounded-lg border-2 border-slate-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={middle.middleBgColor || '#ffffff'}
                                    onChange={e => updateMiddle({ 
                                        middleBgColor: e.target.value, 
                                        middleBgColorOpacity: middle.middleBgColorOpacity ?? 1 
                                    })}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                                    placeholder="#ffffff"
                                />
                                {middle.middleBgColor && middle.middleBgColor !== '#ffffff' && (
                                    <button
                                        onClick={() => updateMiddle({ middleBgColor: '#ffffff', middleBgColorOpacity: 0 })}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-bold"
                                        title="إزالة اللون"
                                    >
                                        ✖
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">💧 الشفافية: {Math.round((middle.middleBgColorOpacity ?? 0) * 100)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round((middle.middleBgColorOpacity ?? 0) * 100)}
                                onChange={e => updateMiddle({ middleBgColorOpacity: parseInt(e.target.value) / 100 })}
                                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                {middle.middleBackgroundImage && (
                    <div className="border-t border-slate-200 my-4 pt-4 space-y-4">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">⚙️ إعدادات الصورة</h4>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">📏 حجم الصورة: {middle.middleBgScale ?? 100}%</label>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                value={middle.middleBgScale ?? 100}
                                onChange={e => updateMiddle({ middleBgScale: parseInt(e.target.value) })}
                                className="w-full accent-green-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">↔️ الموضع الأفقي (يمين/يسار): {middle.middleBgPosX ?? 50}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={middle.middleBgPosX ?? 50}
                                onChange={e => updateMiddle({ middleBgPosX: parseInt(e.target.value) })}
                                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">↕️ الموضع الرأسي (فوق/تحت): {middle.middleBgPosY ?? 50}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={middle.middleBgPosY ?? 50}
                                onChange={e => updateMiddle({ middleBgPosY: parseInt(e.target.value) })}
                                className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">💧 الشفافية: {Math.round((middle.middleBgOpacity ?? 1) * 100)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round((middle.middleBgOpacity ?? 1) * 100)}
                                onChange={e => updateMiddle({ middleBgOpacity: parseInt(e.target.value) / 100 })}
                                className="w-full accent-orange-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </CollapsibleSection>
        </div>
    );
};

