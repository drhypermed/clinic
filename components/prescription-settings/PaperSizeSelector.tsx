/**
 * الملف: PaperSizeSelector.tsx
 * إعدادات الطباعة الكاملة:
 * 1. مقاس الورقة: A5 / A4 / مخصص
 * 2. هوامش المحتوى: padding داخلي (لا يُقلص الورقة)
 * 3. ضبط الطباعة: تصغير المحتوى + إزاحة (حل مشكلة القص)
 */

import React from 'react';
import { PaperSizeSettings } from '../../types';

interface PaperSizeSelectorProps {
    paperSize: PaperSizeSettings | undefined;
    onChange: (updates: Partial<PaperSizeSettings>) => void;
}

const DEFAULT_PAPER: PaperSizeSettings = {
    size: 'A5',
    marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
    printScale: 0.95, printOffsetX: 0, printOffsetY: 0,
};

/** حقل إدخال أبعاد الورقة المخصصة — يتيح الكتابة الحرة بما لا يزيد عن 3 أرقام */
const DimInput: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
}> = ({ label, value, onChange, min }) => {
    const [text, setText] = React.useState(String(value));
    React.useEffect(() => { setText(String(value)); }, [value]);
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-600 font-bold">{label}</span>
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={text}
                    onChange={e => {
                        const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                        setText(raw);
                        const v = parseInt(raw, 10);
                        if (!isNaN(v) && v >= min) onChange(v);
                    }}
                    onBlur={() => {
                        const v = parseInt(text, 10);
                        const clamped = isNaN(v) || v < min ? min : Math.min(v, 999);
                        setText(String(clamped));
                        onChange(clamped);
                    }}
                    className="w-16 text-center text-xs font-bold border-2 border-amber-300 rounded-xl py-1.5 px-1 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
                <span className="text-[10px] text-slate-400 font-semibold">mm</span>
            </div>
        </label>
    );
};

/** بطاقة اختيار مقاس */
const SizeCard: React.FC<{
    label: string; subLabel: string; selected: boolean;
    onClick: () => void; aspectW: number; aspectH: number;
}> = ({ label, subLabel, selected, onClick, aspectW, aspectH }) => {
    const cardW = 48;
    const cardH = Math.round(cardW * (aspectH / aspectW));
    return (
        <button type="button" onClick={onClick}
            className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer select-none ${selected
                ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-100'
                : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md'}`}
        >
            <div className={`rounded-md flex items-center justify-center transition-all ${selected
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm'
                : 'bg-slate-100 border border-slate-200'}`}
                style={{ width: cardW, height: cardH }}>
                <span className={`text-[9px] font-black ${selected ? 'text-white' : 'text-slate-400'}`}>{label}</span>
            </div>
            <div className="text-center leading-tight">
                <div className={`text-xs font-black ${selected ? 'text-amber-700' : 'text-slate-600'}`}>{label}</div>
                <div className="text-[9px] text-slate-400">{subLabel}</div>
            </div>
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
        </button>
    );
};

/** حقل إدخال بوحدة mm */
const MmInput: React.FC<{
    label: string; value: number | undefined;
    onChange: (v: number) => void; min?: number; max?: number;
}> = ({ label, value, onChange, min = 0, max = 50 }) => (
    <label className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] text-slate-500 font-bold">{label}</span>
        <div className="flex items-center gap-1">
            <input type="number" min={min} max={max} step={0.5} value={value ?? 0}
                onChange={e => onChange(Math.max(min, Math.min(max, parseFloat(e.target.value) || 0)))}
                className="w-14 text-center text-xs font-bold border-2 border-slate-200 rounded-xl py-1.5 px-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white transition-all"
            />
            <span className="text-[9px] text-slate-400 font-semibold">mm</span>
        </div>
    </label>
);

export const PaperSizeSelector: React.FC<PaperSizeSelectorProps> = ({ paperSize, onChange }) => {
    const current: PaperSizeSettings = { ...DEFAULT_PAPER, ...paperSize };
    const {
        size, customWidth, customHeight,
        marginTop, marginRight, marginBottom, marginLeft,
        printScale = 0.95, printOffsetX = 0, printOffsetY = 0,
    } = current;

    const hasMargins = (marginTop ?? 0) > 0 || (marginRight ?? 0) > 0 || (marginBottom ?? 0) > 0 || (marginLeft ?? 0) > 0;
    const scalePercent = Math.round((printScale ?? 0.95) * 100);
    const hasPrintAdjust = scalePercent !== 95 || (printOffsetX ?? 0) !== 0 || (printOffsetY ?? 0) !== 0;

    return (
        <div dir="rtl" className="space-y-6">

            {/* ══════════ 1. مقاس الورقة ══════════ */}
            <div>
                <SectionTitle icon="paper" label="مقاس ورقة الروشتة" />
                <div className="flex flex-wrap gap-3 mt-3" dir="ltr">
                    <SizeCard label="A5" subLabel="148 × 210 mm" selected={size === 'A5'}
                        onClick={() => onChange({ size: 'A5' })} aspectW={148} aspectH={210} />
                    <SizeCard label="A4" subLabel="210 × 297 mm" selected={size === 'A4'}
                        onClick={() => onChange({ size: 'A4' })} aspectW={210} aspectH={297} />
                    <SizeCard label="مخصص" subLabel="أبعاد يدوية" selected={size === 'custom'}
                        onClick={() => onChange({ size: 'custom' })}
                        aspectW={customWidth || 148} aspectH={customHeight || 210} />
                </div>

                {size === 'custom' && (
                    <div className="mt-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
                        <p className="text-xs font-black text-amber-700 mb-3">أبعاد الورقة المخصصة (بالـ mm):</p>
                        <div className="flex flex-wrap gap-4 items-center">
                            <DimInput label="العرض" value={customWidth ?? 148} min={50}
                                onChange={v => onChange({ customWidth: v })} />
                            <span className="text-slate-400 font-bold">×</span>
                            <DimInput label="الارتفاع" value={customHeight ?? 210} min={50}
                                onChange={v => onChange({ customHeight: v })} />
                        </div>
                    </div>
                )}

                {/* ملخص المقاس */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {(() => {
                        const w = size === 'A5' ? 148 : size === 'A4' ? 210 : (customWidth ?? 148);
                        const h = size === 'A5' ? 210 : size === 'A4' ? 297 : (customHeight ?? 210);
                        return <span className="text-[11px] text-amber-700 font-black bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">الورقة: {w} × {h} mm</span>;
                    })()}
                </div>
            </div>

            {/* ══════════ 2. هوامش المحتوى ══════════ */}
            <div>
                <SectionTitle icon="margin" label="هوامش المحتوى"
                    badge={hasMargins ? 'مُفعَّلة' : undefined} badgeColor="amber" />
                <p className="text-[10px] text-slate-500 mt-1 mb-3 leading-relaxed">
                    مسافة فارغة بين حواف الورقة ومحتوى الروشتة (لا تُقلص حجم الورقة)
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex flex-col items-center gap-3 select-none">
                        <MmInput label="أعلى ↑" value={marginTop} onChange={v => onChange({ marginTop: v })} />
                        <div className="flex items-center gap-4">
                            <MmInput label="← يمين" value={marginRight} onChange={v => onChange({ marginRight: v })} />
                            <div className="relative">
                                <div className="border-2 border-dashed rounded-lg flex items-center justify-center"
                                    style={{ width: 56, height: 76, borderColor: hasMargins ? '#f59e0b' : '#cbd5e1', backgroundColor: hasMargins ? 'rgba(245,158,11,0.06)' : 'rgba(203,213,225,0.3)' }}>
                                    <div className="rounded" style={{ width: 30, height: 50, backgroundColor: hasMargins ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.2)', border: `1px solid ${hasMargins ? '#f59e0b' : '#94a3b8'}` }} />
                                </div>
                            </div>
                            <MmInput label="يسار →" value={marginLeft} onChange={v => onChange({ marginLeft: v })} />
                        </div>
                        <div className="mt-1"><MmInput label="↓ أسفل" value={marginBottom} onChange={v => onChange({ marginBottom: v })} /></div>
                    </div>
                </div>
            </div>

            {/* ══════════ 3. ضبط الطباعة (حل القص) ══════════ */}
            <div>
                <SectionTitle icon="print-fix" label="ضبط دقة الطباعة"
                    badge={hasPrintAdjust ? 'مُخصَّص' : undefined} badgeColor="blue" />

                {/* شرح المشكلة والحل */}
                <div className="mt-3 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-[11px] text-blue-800 font-bold mb-1">
                        لو المحتوى مقصوص من الأطراف عند الطباعة:
                    </p>
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                        كل طابعة لها منطقة غير قابلة للطباعة في الأطراف. قلّل <strong>نسبة المحتوى</strong>
                        قليلاً (مثلاً 95%) حتى يظهر الكل داخل منطقة الطباعة بدون قص.
                    </p>
                </div>

                {/* ---- نسبة تصغير المحتوى ---- */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                نسبة حجم المحتوى عند الطباعة
                            </label>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${scalePercent < 100 ? 'text-blue-700 bg-blue-100' : 'text-slate-500 bg-slate-100'}`}>
                                    {scalePercent}%
                                </span>
                                {scalePercent !== 95 && (
                                    <button type="button" onClick={() => onChange({ printScale: 0.95 })}
                                        className="text-[9px] text-slate-400 hover:text-slate-600 underline">
                                        إعادة للافتراضي
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* slider */}
                        <input type="range" min={70} max={100} step={1}
                            value={scalePercent}
                            onChange={e => onChange({ printScale: parseInt(e.target.value) / 100 })}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500 bg-gradient-to-r from-blue-200 to-slate-200"
                        />

                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5">
                            <span>70% (أصغر)</span>
                            <span className="text-slate-500 font-semibold">الافتراضي: 95%</span>
                            <span>100% (كامل)</span>
                        </div>

                        {/* توصية سريعة */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {[{ v: 100, label: '100% (كامل)' }, { v: 97, label: '97%' }, { v: 95, label: '95% (الافتراضي)' }, { v: 90, label: '90%' }].map(({ v, label }) => (
                                <button key={v} type="button"
                                    onClick={() => onChange({ printScale: v / 100 })}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all ${scalePercent === v
                                        ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ---- إزاحة الطباعة ---- */}
                    <div>
                        <p className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                            إزاحة الموضع على الورقة
                        </p>
                        <p className="text-[10px] text-slate-500 mb-3">
                            إذا كانت الطابعة تُزيح الطباعة باستمرار لجهة معينة، استخدم هذا لتعويضها.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-slate-500 font-bold">إزاحة أفقية ←→</span>
                                <div className="flex items-center gap-1">
                                    <input type="number" min={-20} max={20} step={0.5} value={printOffsetX ?? 0}
                                        onChange={e => onChange({ printOffsetX: Math.max(-20, Math.min(20, parseFloat(e.target.value) || 0)) })}
                                        className="w-16 text-center text-xs font-bold border-2 border-slate-200 rounded-xl py-1.5 px-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                                    <span className="text-[9px] text-slate-400 font-semibold">mm</span>
                                </div>
                                <span className="text-[9px] text-slate-400">سالب=يسار / موجب=يمين</span>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-slate-500 font-bold">إزاحة رأسية ↑↓</span>
                                <div className="flex items-center gap-1">
                                    <input type="number" min={-20} max={20} step={0.5} value={printOffsetY ?? 0}
                                        onChange={e => onChange({ printOffsetY: Math.max(-20, Math.min(20, parseFloat(e.target.value) || 0)) })}
                                        className="w-16 text-center text-xs font-bold border-2 border-slate-200 rounded-xl py-1.5 px-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                                    <span className="text-[9px] text-slate-400 font-semibold">mm</span>
                                </div>
                                <span className="text-[9px] text-slate-400">سالب=أعلى / موجب=أسفل</span>
                            </label>
                            {hasPrintAdjust && (
                                <button type="button"
                                    onClick={() => onChange({ printScale: 0.95, printOffsetX: 0, printOffsetY: 0 })}
                                    className="self-end mb-1 text-[10px] text-slate-400 hover:text-slate-600 underline">
                                    إعادة كل الضبط للافتراضي
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* مكون عنوان القسم */
const SectionTitle: React.FC<{
    icon: 'paper' | 'margin' | 'print-fix';
    label: string;
    badge?: string;
    badgeColor?: 'amber' | 'blue';
}> = ({ icon, label, badge, badgeColor = 'amber' }) => {
    const icons = {
        paper: (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        margin: (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
        ),
        'print-fix': (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    };
    const gradients = { paper: 'from-amber-500 to-orange-500', margin: 'from-slate-500 to-slate-600', 'print-fix': 'from-blue-500 to-indigo-600' };
    const badgeStyles = {
        amber: 'text-amber-600 bg-amber-100 border-amber-200',
        blue: 'text-blue-600 bg-blue-100 border-blue-200',
    };
    return (
        <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-lg bg-gradient-to-br ${gradients[icon]} flex items-center justify-center shrink-0`}>
                {icons[icon]}
            </span>
            <span className="text-sm font-black text-slate-700">{label}</span>
            {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}>
                    {badge}
                </span>
            )}
        </div>
    );
};
