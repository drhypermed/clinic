import React from 'react';
import { TextStyle } from '../../types';
interface StyleControlProps {
    style?: TextStyle;
    onChange: (style: TextStyle) => void;
    onApplyPreset?: (htmlStyle: string) => void;
}
const FONTS = [
    { label: 'الخط الإفتراضي', value: '' },
    { label: 'Playfair Display (Luxury)', value: '"Playfair Display", serif' },
    { label: 'Inter (Modern)', value: '"Inter", sans-serif' },
    { label: 'Roboto (Standard)', value: '"Roboto", sans-serif' },
    { label: 'Open Sans (Clean)', value: '"Open Sans", sans-serif' },
    { label: 'Lato (Friendly)', value: '"Lato", sans-serif' },
    { label: 'Montserrat (Geometric)', value: '"Montserrat", sans-serif' },
    { label: 'Merriweather (Serif)', value: '"Merriweather", serif' },
    { label: 'El Messiri (Luxury)', value: '"El Messiri", serif' },
    { label: 'Cairo (Modern)', value: '"Cairo", sans-serif' },
    { label: 'Tajawal (Clean)', value: '"Tajawal", sans-serif' },
    { label: 'Almarai (Standard)', value: '"Almarai", sans-serif' },
    { label: 'Amiri (Classic)', value: '"Amiri", serif' },
    { label: 'IBM Plex Sans (Corporate)', value: '"IBM Plex Sans Arabic", sans-serif' },
    { label: 'Noto Kufi (Kufi)', value: '"Noto Kufi Arabic", sans-serif' },
    { label: 'Alyamama (Bold)', value: '"Alyamama", sans-serif' },
    { label: 'Droid Arabic Kufi (Bold)', value: '"Droid Arabic Kufi", sans-serif' },
    { label: 'Boutros News (Bold)', value: '"Boutros News", sans-serif' },
    { label: 'Rosemery (Script)', value: '"Rosemery", serif' },
    { label: 'AH Naskh Hadith (Islamic)', value: '"AH Naskh Hadith", serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
];
const PRESETS = [
    { id: 'none', label: 'تأثيرات (Effects)', style: '' },
    { id: 'gold', label: '✨ ذهبي فخم', style: 'color: #cfc09f; background: linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); font-weight: 800;' },
    { id: 'apple', label: '🍎 ابل ستيشن', style: 'color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: -0.02em; text-shadow: 0 1px 0 rgba(255,255,255,0.5);' },
    { id: 'bento', label: '🍱 بينتو', style: 'color: #444; background: #f3f3f3; padding: 2px 6px; border-radius: 6px; border: 1px solid #e5e5e5; display: inline-block;' },
    { id: 'neon', label: '🟣 نيون', style: 'color: #fff; text-shadow: 0 0 5px #ff00de, 0 0 10px #ff00de;' },
    { id: 'outline', label: '🔲 حدود', style: 'color: white; -webkit-text-stroke: 1px #000; text-stroke: 1px #000;' },
    { id: 'shadow', label: '👥 ظل قوي', style: 'text-shadow: 2px 2px 0px #eee, 4px 4px 0px #ccc;' },
];
export const StyleControl: React.FC<StyleControlProps> = ({ style, onChange, onApplyPreset }) => {
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const fontSizeNum = style?.fontSize ? parseInt(style.fontSize.replace('px', '')) : 11;
    const color = style?.color || '#000000';
    const fontFamily = style?.fontFamily || '';
    const [selectedPreset, setSelectedPreset] = React.useState('none');
    const fw = style?.fontWeight;
    const isBold = fw === 'bold' || fw === '700' || fw === '800' || fw === '900' || (typeof fw === 'number' && fw >= 700);
    const isItalic = style?.fontStyle === 'italic';
    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => { onChange({ ...style, fontFamily: e.target.value }); };
    const toggleBold = () => { onChange({ ...style, fontWeight: isBold ? 'normal' : 'bold' }); };
    const toggleItalic = () => { onChange({ ...style, fontStyle: isItalic ? 'normal' : 'italic' }); };
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm relative z-10 max-w-full">
                <select value={fontFamily} onChange={handleFontChange} className="text-[10px] border border-slate-200 rounded p-1 max-w-[110px] outline-none focus:border-brand-500 font-sans" title="نوع الخط">
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                {onApplyPreset && (
                    <>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select value={selectedPreset} onChange={(e) => { const val = e.target.value; setSelectedPreset(val); const p = PRESETS.find(x => x.id === val); if (p?.style) onApplyPreset(p.style); else if (val === 'none') onApplyPreset(''); }} className="text-[10px] border border-slate-200 rounded p-1 max-w-[80px] outline-none focus:border-brand-500" title="تأثيرات جاهزة">
                            <option value="none"> بدون تأثيرات </option>
                            {PRESETS.filter(p => p.id !== 'none').map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                    </>
                )}
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="flex bg-slate-50 rounded border border-slate-200">
                    <button onMouseDown={e => e.preventDefault()} onClick={toggleBold} className={`px-2 py-0.5 text-xs font-bold transition-colors rounded-r ${isBold ? 'bg-brand-100 text-brand-700' : 'text-slate-500 hover:bg-slate-100'}`} title="عريض (Bold)">B</button>
                    <div className="w-px bg-slate-200"></div>
                    <button onMouseDown={e => e.preventDefault()} onClick={toggleItalic} className={`px-2 py-0.5 text-xs italic font-serif transition-colors rounded-l ${isItalic ? 'bg-brand-100 text-brand-700' : 'text-slate-500 hover:bg-slate-100'}`} title="مائل (Italic)">I</button>
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <input type="color" value={color} onChange={e => onChange({ ...style, color: e.target.value })} className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" title="لون الخط" />
                <div className="flex items-center gap-1">
                    <input type="number" value={fontSizeNum} min={6} max={60} onChange={e => onChange({ ...style, fontSize: `${e.target.value}px` })} className="w-10 h-5 text-[10px] text-center border border-slate-200 rounded focus:border-brand-500 outline-none" title="حجم الخط" />
                    <span className="text-[9px] text-slate-400">px</span>
                </div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded border transition-colors ${showAdvanced ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`} title="أدوات متقدمة">
                    <span className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>⌄</span>
                    <span>أدوات متقدمة</span>
                </button>
            </div>
            <style>{`
                .slider-wrapper {
                    position: relative;
                    width: 100%;
                    height: 14px;
                    display: flex;
                    align-items: center;
                    direction: rtl;
                }
                .slider-track {
                    position: absolute;
                    width: 100%;
                    height: 10px;
                    border-radius: 10px;
                    background: #e2e8f0;
                    z-index: 1;
                    left: 0;
                    right: 0;
                }
                .slider-fill {
                    position: absolute;
                    height: 10px;
                    border-radius: 10px;
                    right: 0;
                    z-index: 2;
                    transition: none;
                    will-change: width;
                }
                .modern-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 14px;
                    border-radius: 0;
                    background: transparent;
                    outline: none;
                    cursor: pointer;
                    position: relative;
                    z-index: 3;
                    margin: 0;
                    padding: 0;
                    direction: rtl;
                }
                .modern-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #fff;
                    border: 4px solid #3b82f6;
                    cursor: grab;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(59, 130, 246, 0.15);
                    transition: box-shadow 0.15s ease, transform 0.15s ease;
                    position: relative;
                    z-index: 4;
                }
                .modern-slider::-webkit-slider-thumb:active {
                    cursor: grabbing;
                    transform: scale(1.15);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
                }
                .modern-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
                }
                .modern-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #fff;
                    border: 4px solid #3b82f6;
                    cursor: grab;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
                    transition: box-shadow 0.15s ease, transform 0.15s ease;
                }
                .modern-slider::-moz-range-thumb:active {
                    cursor: grabbing;
                    transform: scale(1.15);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .modern-slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .modern-slider::-moz-range-track {
                    background: transparent;
                    height: 10px;
                }
                .slider-blue::-webkit-slider-thumb {
                    border-color: #3b82f6;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(59, 130, 246, 0.15);
                }
                .slider-blue::-webkit-slider-thumb:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
                }
                .slider-blue::-moz-range-thumb {
                    border-color: #3b82f6;
                }
                .slider-purple::-webkit-slider-thumb {
                    border-color: #a855f7;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(168, 85, 247, 0.15);
                }
                .slider-purple::-webkit-slider-thumb:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(168, 85, 247, 0.2);
                }
                .slider-purple::-moz-range-thumb {
                    border-color: #a855f7;
                }
                .slider-teal::-webkit-slider-thumb {
                    border-color: #14b8a6;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(20, 184, 166, 0.15);
                }
                .slider-teal::-webkit-slider-thumb:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(20, 184, 166, 0.2);
                }
                .slider-teal::-moz-range-thumb {
                    border-color: #14b8a6;
                }
                .slider-rose::-webkit-slider-thumb {
                    border-color: #e11d48;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(225, 29, 72, 0.15);
                }
                .slider-rose::-webkit-slider-thumb:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(225, 29, 72, 0.2);
                }
                .slider-rose::-moz-range-thumb {
                    border-color: #e11d48;
                }
                .slider-orange::-webkit-slider-thumb {
                    border-color: #f97316;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(249, 115, 22, 0.15);
                }
                .slider-orange::-webkit-slider-thumb:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(249, 115, 22, 0.2);
                }
                .slider-orange::-moz-range-thumb {
                    border-color: #f97316;
                }
                .slider-emerald::-webkit-slider-thumb {
                    border-color: #10b981;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(16, 185, 129, 0.15);
                }
                .slider-emerald::-webkit-slider-thumb:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(16, 185, 129, 0.2);
                }
                .slider-emerald::-moz-range-thumb {
                    border-color: #10b981;
                }
            `}</style>
            {showAdvanced && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-lg animate-in slide-in-from-top-2 duration-200 w-full max-w-full mt-2">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-2"><span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">🔲</span><span>حدود النص Outlines</span></label>
                            </div>
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-slate-500 font-medium">السمك</span>
                                            <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{(style?.textStrokeWidth || 0).toFixed(2)}px</span>
                                        </div>
                                        <div className="slider-wrapper">
                                            <div className="slider-track"></div>
                                            <div className="slider-fill" style={{ width: `${Math.max(0, Math.min(100, ((style?.textStrokeWidth || 0) / 4) * 100))}%`, backgroundColor: style?.textStrokeColor || '#3b82f6' }}></div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="400"
                                                step="1"
                                                value={Math.round((style?.textStrokeWidth || 0) * 100)}
                                                onInput={e => {
                                                    const value = parseInt((e.target as HTMLInputElement).value);
                                                    const strokeWidth = value / 100;
                                                    onChange({ ...style, textStrokeWidth: strokeWidth });
                                                }}
                                                onChange={e => {
                                                    const value = parseInt(e.target.value);
                                                    const strokeWidth = value / 100;
                                                    onChange({ ...style, textStrokeWidth: strokeWidth });
                                                }}
                                                className="modern-slider slider-blue"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] text-slate-500">اللون</span>
                                        <input type="color" value={style?.textStrokeColor || '#000000'} onChange={e => onChange({ ...style, textStrokeColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5 bg-white shadow-sm hover:border-brand-400 transition-colors" />
                                    </div>
                            </div>
                        </div>
                    </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={style?.textBgOpacity !== undefined}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                onChange({ ...style, textBgOpacity: style?.textBgOpacity ?? 0.5, textBgColor: style?.textBgColor || '#ffffff' });
                                            } else {
                                                const newStyle = { ...style };
                                                delete newStyle.textBgOpacity;
                                                delete newStyle.textBgColor;
                                                delete newStyle.textBgRadius;
                                                delete newStyle.textBgPadding;
                                                delete newStyle.textBgPaddingTop;
                                                delete newStyle.textBgPaddingRight;
                                                delete newStyle.textBgPaddingBottom;
                                                delete newStyle.textBgPaddingLeft;
                                                delete newStyle.textBgBorderWidth;
                                                delete newStyle.textBgBorderColor;
                                                onChange(newStyle);
                                            }
                                        }}
                                        className="w-4 h-4 rounded text-slate-600 focus:ring-slate-500 border-slate-300 cursor-pointer"
                                    />
                                    <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">🎨</span>
                                    <span>خلفية النص Background</span>
                                </label>
                                {style?.textBgOpacity !== undefined ? <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-mono font-bold">{Math.round((style.textBgOpacity || 0) * 100)}%</span> : null}
                            </div>
                            {style?.textBgOpacity !== undefined && (
                                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[9px] text-slate-500">اللون</span>
                                            <input type="color" value={style?.textBgColor || '#ffffff'} onChange={e => onChange({ ...style, textBgColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5 bg-white shadow-sm hover:border-slate-400 transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] text-slate-500 font-medium">الشفافية</span>
                                                <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">{Math.round((style?.textBgOpacity || 0) * 100)}</span>
                                            </div>
                                            <div className="slider-wrapper">
                                                <div className="slider-track"></div>
                                                <div className="slider-fill" style={{ width: `${(style?.textBgOpacity || 0) * 100}%`, backgroundColor: style?.textBgColor || '#a855f7' }}></div>
                                                <input type="range" min="0" max="100" step="1" value={Math.round((style?.textBgOpacity || 0) * 100)} onChange={e => onChange({ ...style, textBgOpacity: parseInt(e.target.value) / 100 })} className="modern-slider slider-purple" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 font-medium">استدارة</span>
                                                <span className="text-[11px] font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">{Math.round(((style?.textBgRadius || 0) / 20) * 100)}%</span>
                                            </div>
                                            <div className="slider-wrapper">
                                                <div className="slider-track"></div>
                                                <div className="slider-fill" style={{ width: `${((style?.textBgRadius || 0) / 20) * 100}%`, backgroundColor: style?.textBgColor || '#e11d48' }}></div>
                                                <input type="range" min="1" max="100" step="1" value={Math.round(((style?.textBgRadius || 0) / 20) * 100) || 1} onChange={e => onChange({ ...style, textBgRadius: Math.round((parseInt(e.target.value) / 100) * 20) })} className="modern-slider slider-rose" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 border-t border-slate-200 pt-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-600">حدود (Stroke)</label>
                                            {style?.textBgBorderWidth ? <span className="text-[9px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">{style.textBgBorderWidth}px</span> : null}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[9px] text-slate-500">اللون</span>
                                                <input type="color" value={style?.textBgBorderColor || '#000000'} onChange={e => onChange({ ...style, textBgBorderColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5 bg-white shadow-sm hover:border-slate-400 transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] text-slate-500 font-medium">السمك</span>
                                                    <span className="text-[11px] font-bold text-warning-600 bg-warning-50 px-2 py-0.5 rounded-full">{Math.round(((style?.textBgBorderWidth || 0) / 10) * 100)}</span>
                                                </div>
                                                <div className="slider-wrapper">
                                                    <div className="slider-track"></div>
                                                    <div className="slider-fill" style={{ width: `${((style?.textBgBorderWidth || 0) / 10) * 100}%`, backgroundColor: style?.textBgBorderColor || '#f97316' }}></div>
                                                    <input type="range" min="0" max="100" step="1" value={Math.round(((style?.textBgBorderWidth || 0) / 10) * 100)} onChange={e => onChange({ ...style, textBgBorderWidth: (parseInt(e.target.value) / 100) * 10 })} className="modern-slider slider-orange" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 border-t border-slate-200 pt-3">
                                        <label className="text-[10px] font-bold text-slate-600 block">الهوامش (Padding)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500 font-medium">أعلى</span>
                                                    <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">{Math.round(((style?.textBgPaddingTop || 0) / 20) * 100)}%</span>
                                                </div>
                                                <div className="slider-wrapper">
                                                    <div className="slider-track"></div>
                                                    <div className="slider-fill" style={{ width: `${((style?.textBgPaddingTop || 0) / 20) * 100}%`, backgroundColor: style?.textBgColor || '#10b981' }}></div>
                                                    <input type="range" min="1" max="100" step="1" value={Math.round(((style?.textBgPaddingTop || 0) / 20) * 100) || 1} onChange={e => onChange({ ...style, textBgPaddingTop: Math.round((parseInt(e.target.value) / 100) * 20) })} className="modern-slider slider-emerald" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500 font-medium">أسفل</span>
                                                    <span className="text-[11px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">{Math.round(((style?.textBgPaddingBottom || 0) / 20) * 100)}</span>
                                                </div>
                                                <div className="slider-wrapper">
                                                    <div className="slider-track"></div>
                                                    <div className="slider-fill" style={{ width: `${((style?.textBgPaddingBottom || 0) / 20) * 100}%`, backgroundColor: style?.textBgColor || '#10b981' }}></div>
                                                    <input type="range" min="1" max="100" step="1" value={Math.round(((style?.textBgPaddingBottom || 0) / 20) * 100) || 1} onChange={e => onChange({ ...style, textBgPaddingBottom: Math.round((parseInt(e.target.value) / 100) * 20) })} className="modern-slider slider-emerald" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500 font-medium">يمين</span>
                                                    <span className="text-[11px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">{Math.round(((style?.textBgPaddingRight || 0) / 20) * 100)}</span>
                                                </div>
                                                <div className="slider-wrapper">
                                                    <div className="slider-track"></div>
                                                    <div className="slider-fill" style={{ width: `${((style?.textBgPaddingRight || 0) / 20) * 100}%`, backgroundColor: style?.textBgColor || '#10b981' }}></div>
                                                    <input type="range" min="1" max="100" step="1" value={Math.round(((style?.textBgPaddingRight || 0) / 20) * 100) || 1} onChange={e => onChange({ ...style, textBgPaddingRight: Math.round((parseInt(e.target.value) / 100) * 20) })} className="modern-slider slider-emerald" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500 font-medium">يسار</span>
                                                    <span className="text-[11px] font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">{Math.round(((style?.textBgPaddingLeft || 0) / 20) * 100)}</span>
                                                </div>
                                                <div className="slider-wrapper">
                                                    <div className="slider-track"></div>
                                                    <div className="slider-fill" style={{ width: `${((style?.textBgPaddingLeft || 0) / 20) * 100}%`, backgroundColor: style?.textBgColor || '#10b981' }}></div>
                                                    <input type="range" min="1" max="100" step="1" value={Math.round(((style?.textBgPaddingLeft || 0) / 20) * 100) || 1} onChange={e => onChange({ ...style, textBgPaddingLeft: Math.round((parseInt(e.target.value) / 100) * 20) })} className="modern-slider slider-emerald" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-2"><span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">↔️</span><span>تباعد الحروف Spacing</span></label>
                                <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{Math.round((((style?.letterSpacing || 0) + 2) / 12) * 100)}</span>
                            </div>
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <div className="slider-wrapper">
                                    <div className="slider-track"></div>
                                    <div className="slider-fill" style={{ width: `${(((style?.letterSpacing || 0) + 2) / 12) * 100}%`, backgroundColor: '#14b8a6' }}></div>
                                    <input type="range" min="1" max="100" step="1" value={Math.round((((style?.letterSpacing || 0) + 2) / 12) * 100) || 1} onChange={e => onChange({ ...style, letterSpacing: ((parseInt(e.target.value) / 100) * 12) - 2 })} className="modern-slider slider-teal" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-2"><span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">🎮</span><span>التحريك الدقيق Position</span></label>
                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-medium">أفقي (X)</span>
                                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{style?.xOffset || 0}px</span>
                                    </div>
                                    <div className="slider-wrapper">
                                        <div className="slider-track"></div>
                                        <div className="slider-fill" style={{
                                            width: `${Math.max(0, Math.min(100, ((style?.xOffset || 0) + 50) / 100 * 100))}%`,
                                            backgroundColor: '#3b82f6',
                                            left: 'auto',
                                            right: 0
                                        }}></div>
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            step="1"
                                            value={style?.xOffset || 0}
                                            onChange={e => onChange({ ...style, xOffset: parseInt(e.target.value) || 0 })}
                                            className="modern-slider slider-blue"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-medium">رأسي (Y)</span>
                                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{style?.yOffset || 0}px</span>
                                    </div>
                                    <div className="slider-wrapper">
                                        <div className="slider-track"></div>
                                        <div className="slider-fill" style={{
                                            width: `${Math.max(0, Math.min(100, ((style?.yOffset || 0) + 50) / 100 * 100))}%`,
                                            backgroundColor: '#3b82f6',
                                            left: 'auto',
                                            right: 0
                                        }}></div>
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            step="1"
                                            value={style?.yOffset || 0}
                                            onChange={e => onChange({ ...style, yOffset: parseInt(e.target.value) || 0 })}
                                            className="modern-slider slider-blue"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                    <button
                                        onClick={() => onChange({ ...style, xOffset: 0, yOffset: 0 })}
                                        className="w-full px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg transition text-xs border border-brand-200"
                                    >
                                        🎯 إعادة تعيين الموضع (0, 0)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

