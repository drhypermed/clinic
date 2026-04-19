import React, { useRef, useState, useEffect } from 'react';
import type { PrescriptionMiddleSettings, Medication, TextStyle } from '../../types';
import { CollapsibleSection } from './CollapsibleSection';
import { useMedicationSearch } from '../../hooks/medications';
import { StyleControl } from '../editors/StyleControl';
interface MiddleSettingsTabProps {
    middle: PrescriptionMiddleSettings; // إعدادات المنتصف الحالية
    updateMiddle: (u: Partial<PrescriptionMiddleSettings>) => void; // دالة التحديث
    openSection: string; // القسم المفتوح حالياً في الإعدادات
    setOpenSection: (s: string) => void; 
    showNotification: (type: 'success' | 'error', msg: string) => void; // لإظهار تنبيهات النجاح/الفشل
    setMiddleBgToCrop: (v: string | null) => void;
    previewTextAr: string; // نص المعاينة العربي
    setPreviewTextAr: (v: string) => void;
    previewTextEn: string; // نص المعاينة الإنجليزي
    setPreviewTextEn: (v: string) => void;
    onAddMedicationToPreview?: (med: Medication) => void; // إضافة دواء للمعاينة
}
export const MiddleSettingsTab: React.FC<MiddleSettingsTabProps> = ({
    middle,
    updateMiddle,
    openSection,
    setOpenSection,
    showNotification,
    setMiddleBgToCrop,
    previewTextAr,
    setPreviewTextAr,
    previewTextEn,
    setPreviewTextEn,
    onAddMedicationToPreview
}) => {
    const toggle = (id: string) => setOpenSection(openSection === id ? '' : id);
    const { search } = useMedicationSearch();
    const [suggestions, setSuggestions] = useState<Medication[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const arabicInputRef = useRef<HTMLInputElement>(null);
    const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0, width: 0 });
        const handleEnChange = (val: string) => {
        setPreviewTextEn(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!val.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        searchTimeout.current = setTimeout(() => {
            const results = search(val);
            setSuggestions(results.slice(0, 5));
            setShowSuggestions(true);
        }, 300);
    };
        useEffect(() => {
        const updatePos = () => {
            if (showSuggestions && inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setSuggestionPos({
                    top: rect.bottom,
                    left: rect.left,
                    width: rect.width
                });
            }
        };
        updatePos();
        if (showSuggestions) {
            window.addEventListener('scroll', updatePos, true); 
            window.addEventListener('resize', updatePos);
        }
        return () => {
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
        };
    }, [showSuggestions, suggestions]);
        const selectMedication = (med: Medication) => {
        if (onAddMedicationToPreview) {
            onAddMedicationToPreview(med);
        } else {
            setPreviewTextEn(med.name);
            if (med.instructions && med.instructions.trim()) {
                setPreviewTextAr(med.instructions);
            }
        }
        setShowSuggestions(false);
    };
        useEffect(() => {
        if (inputRef.current && middle.englishStyle) {
            const s = middle.englishStyle;
            const style = inputRef.current.style;
            style.fontFamily = s.fontFamily || middle.englishFont || 'inherit';
            style.fontWeight = s.fontWeight || 'normal';
            style.fontStyle = s.fontStyle || 'normal';
            style.color = s.color || '';
            style.fontSize = s.fontSize || '';
            style.letterSpacing = s.letterSpacing ? `${s.letterSpacing}px` : '';
            if (s.xOffset || s.yOffset) {
                style.transform = `translate(${s.xOffset || 0}px, ${s.yOffset || 0}px)`;
            } else {
                style.transform = '';
            }
            if (s.textStrokeWidth) {
                style.webkitTextStroke = `${s.textStrokeWidth}px ${s.textStrokeColor || '#000'}`;
            } else {
                style.webkitTextStroke = '';
            }
            if (s.textBgOpacity !== undefined) {
                const alpha = Math.round((s.textBgOpacity) * 255).toString(16).padStart(2, '0');
                style.backgroundColor = `${s.textBgColor || '#ffffff'}${alpha}`;
                style.borderRadius = s.textBgRadius ? `${s.textBgRadius}px` : '0px';
                style.paddingTop = s.textBgPaddingTop ? `${s.textBgPaddingTop}px` : '8px';
                style.paddingRight = s.textBgPaddingRight ? `${s.textBgPaddingRight}px` : '8px';
                style.paddingBottom = s.textBgPaddingBottom ? `${s.textBgPaddingBottom}px` : '8px';
                style.paddingLeft = s.textBgPaddingLeft ? `${s.textBgPaddingLeft}px` : '8px';
                style.borderWidth = s.textBgBorderWidth ? `${s.textBgBorderWidth}px` : '0px';
                style.borderColor = s.textBgBorderColor || 'transparent';
                style.borderStyle = s.textBgBorderWidth ? 'solid' : 'none';
            } else {
                style.backgroundColor = '#f8fafc';
                style.borderRadius = '8px';
                style.padding = '8px';
                style.borderWidth = '1px';
                style.borderColor = '#e2e8f0';
                style.borderStyle = 'solid';
            }
        }
    }, [middle.englishStyle, middle.englishFont]);
        useEffect(() => {
        if (arabicInputRef.current && middle.arabicStyle) {
            const s = middle.arabicStyle;
            const style = arabicInputRef.current.style;
            style.fontFamily = s.fontFamily || middle.arabicFont || 'inherit';
            style.fontWeight = s.fontWeight || 'normal';
            style.fontStyle = s.fontStyle || 'normal';
            style.color = s.color || '';
            style.fontSize = s.fontSize || '';
            style.letterSpacing = s.letterSpacing ? `${s.letterSpacing}px` : '';
            if (s.xOffset || s.yOffset) {
                style.transform = `translate(${s.xOffset || 0}px, ${s.yOffset || 0}px)`;
            } else {
                style.transform = '';
            }
            if (s.textStrokeWidth) {
                style.webkitTextStroke = `${s.textStrokeWidth}px ${s.textStrokeColor || '#000'}`;
            } else {
                style.webkitTextStroke = '';
            }
            if (s.textBgOpacity !== undefined) {
                const alpha = Math.round((s.textBgOpacity) * 255).toString(16).padStart(2, '0');
                style.backgroundColor = `${s.textBgColor || '#ffffff'}${alpha}`;
                style.borderRadius = s.textBgRadius ? `${s.textBgRadius}px` : '0px';
                style.paddingTop = s.textBgPaddingTop ? `${s.textBgPaddingTop}px` : '8px';
                style.paddingRight = s.textBgPaddingRight ? `${s.textBgPaddingRight}px` : '8px';
                style.paddingBottom = s.textBgPaddingBottom ? `${s.textBgPaddingBottom}px` : '8px';
                style.paddingLeft = s.textBgPaddingLeft ? `${s.textBgPaddingLeft}px` : '8px';
                style.borderWidth = s.textBgBorderWidth ? `${s.textBgBorderWidth}px` : '0px';
                style.borderColor = s.textBgBorderColor || 'transparent';
                style.borderStyle = s.textBgBorderWidth ? 'solid' : 'none';
            } else {
                style.backgroundColor = '#f8fafc';
                style.borderRadius = '8px';
                style.padding = '8px';
                style.borderWidth = '1px';
                style.borderColor = '#e2e8f0';
                style.borderStyle = 'solid';
            }
        }
    }, [middle.arabicStyle, middle.arabicFont]);
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
            <CollapsibleSection
                title="🔤 اعدادات الخط داخل منتصف الروشتة"
                isOpen={openSection === 'middleFonts'}
                onToggle={() => toggle('middleFonts')}
                className="p-4 bg-gradient-to-br from-indigo-50 to-white"
                color="indigo"
            >
                <div className="space-y-6">
                    <p className="text-sm text-slate-600">
                        تحكم في شكل الخطوط وتنسيقاتها (اللون، الحجم، نوع الخط) للنصوص في الروشتة.
                    </p>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 relative">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <label className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                                    <span>🇺🇸</span> اعدادات الخط الانجليزي
                                </label>
                            </div>
                            <StyleControl
                                style={middle.englishStyle || { fontFamily: middle.englishFont || '' }}
                                onChange={(s) => updateMiddle({ englishStyle: s, englishFont: s.fontFamily })}
                            />
                            <div className="mt-2 space-y-1 relative">
                                <label className="text-[10px] font-bold text-slate-400">معاينة النص الانجليزي (Medication Preview):</label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={previewTextEn}
                                    onChange={e => handleEnChange(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => previewTextEn && setShowSuggestions(true)}
                                    placeholder="Type Drug Name..."
                                    className="w-full p-2 rounded-lg text-sm outline-none transition-all"
                                    dir="ltr"
                                    style={{
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <label className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                                    <span>🇪🇬</span> اعدادات الخط العربي
                                </label>
                            </div>
                            <StyleControl
                                style={middle.arabicStyle || { fontFamily: middle.arabicFont || '' }}
                                onChange={(s) => updateMiddle({ arabicStyle: s, arabicFont: s.fontFamily })}
                            />
                            <div className="mt-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-400">معاينة النص العربي:</label>
                                <input
                                    ref={arabicInputRef}
                                    type="text"
                                    value={previewTextAr}
                                    onChange={e => setPreviewTextAr(e.target.value)}
                                    placeholder="اكتب نصاً عربياً للمعاينة..."
                                    className="w-full p-2 rounded-lg text-sm outline-none transition-all"
                                    style={{
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>
            {showSuggestions && suggestions.length > 0 && (
                <div
                    style={{
                        position: 'fixed',
                        top: suggestionPos.top,
                        left: suggestionPos.left,
                        width: suggestionPos.width,
                        zIndex: 9999, 
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                    className="bg-white border border-slate-200 shadow-xl rounded-lg mt-1"
                >
                    {suggestions.map(med => (
                        <button
                            key={med.id}
                            onClick={() => selectMedication(med)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between border-b border-light"
                        >
                            <span className="font-bold text-slate-700">{med.name}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">{med.category}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

