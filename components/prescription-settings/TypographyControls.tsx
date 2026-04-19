/**
 * TypographyControls — متحكّمات كاملة في أحجام وألوان وخطوط الروشتة + المسافات + الحدود.
 * مقسّم لأقسام:
 *   A. عناصر النص (لكل عنصر: حجم + لون + خط)
 *   B. المسافات والحدود
 *   C. الألوان العامة (عناوين الأقسام، فاصل الأدوية)
 */

import React, { useState } from 'react';
import type { PrescriptionTypographySettings } from '../../app/drug-catalog/types';

interface TypographyControlsProps {
    typography: PrescriptionTypographySettings | undefined;
    onChange: (updates: Partial<PrescriptionTypographySettings>) => void;
}

/** قائمة الخطوط المتاحة — مزيج من خطوط عربية محمّلة + احتياطيات النظام */
const FONT_FAMILIES: Array<{ value: string; label: string }> = [
    { value: '', label: 'افتراضي (من النظام)' },
    { value: 'Cairo, sans-serif', label: 'Cairo — عصري' },
    { value: 'Tajawal, sans-serif', label: 'Tajawal — عصري' },
    { value: '"El Messiri", serif', label: 'El Messiri — كلاسيكي' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: '"Courier New", monospace', label: 'Courier New (للأرقام)' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
];

// ─── المكونات الداخلية ──────────────────────────────────────────

interface SliderRowProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (v: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step = 1, onChange }) => (
    <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-600 w-20 shrink-0">{label}</label>
        <input
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-amber-500"
        />
        <div className="flex items-center gap-1 shrink-0">
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
                }}
                className="w-14 px-1.5 py-1 text-center text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-bold">px</span>
        </div>
    </div>
);

interface ColorRowProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}

const ColorRow: React.FC<ColorRowProps> = ({ label, value, onChange }) => (
    <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-600 w-20 shrink-0">{label}</label>
        <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded-md border border-slate-200 cursor-pointer shrink-0"
        />
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-2 py-1 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-400 focus:outline-none"
        />
    </div>
);

interface FontRowProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}

const FontRow: React.FC<FontRowProps> = ({ label, value, onChange }) => (
    <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-600 w-20 shrink-0">{label}</label>
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-400 focus:outline-none"
            style={{ fontFamily: value || 'inherit' }}
        >
            {FONT_FAMILIES.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>{f.label}</option>
            ))}
        </select>
    </div>
);

// ─── كارت لعنصر نص واحد (حجم + لون + خط) ───────────────────

interface TextElementCardProps {
    title: string;
    description?: string;
    sizeValue: number;
    sizeMin: number;
    sizeMax: number;
    sizeStep?: number;
    onSizeChange: (v: number) => void;
    colorValue?: string;
    defaultColor: string;
    onColorChange: (v: string) => void;
    fontFamilyValue?: string;
    onFontFamilyChange: (v: string) => void;
}

const TextElementCard: React.FC<TextElementCardProps> = ({
    title, description,
    sizeValue, sizeMin, sizeMax, sizeStep,
    onSizeChange,
    colorValue, defaultColor, onColorChange,
    fontFamilyValue, onFontFamilyChange,
}) => (
    <details className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
        <summary className="px-3.5 py-2.5 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors list-none">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div>
                    <div className="text-sm font-bold text-slate-800">{title}</div>
                    {description && <div className="text-[10px] text-slate-400 mt-0.5">{description}</div>}
                </div>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </summary>
        <div className="px-3.5 pb-3 pt-1 space-y-2.5 border-t border-slate-100 bg-slate-50/30">
            <SliderRow label="الحجم" value={sizeValue} min={sizeMin} max={sizeMax} step={sizeStep} onChange={onSizeChange} />
            <ColorRow label="اللون" value={colorValue || defaultColor} onChange={onColorChange} />
            <FontRow label="الخط" value={fontFamilyValue || ''} onChange={onFontFamilyChange} />
        </div>
    </details>
);

// ─── المكوّن الرئيسي ────────────────────────────────────────

export const TypographyControls: React.FC<TypographyControlsProps> = ({ typography, onChange }) => {
    const t = typography || {};
    const [activeSection, setActiveSection] = useState<'text' | 'layout' | 'colors'>('text');

    const sectionBtn = (id: typeof activeSection, label: string) => (
        <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-1 px-3 py-2 text-xs font-black rounded-lg transition-all ${
                activeSection === id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200'
                    : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
            }`}
        >{label}</button>
    );

    return (
        <div className="mt-5">
            {/* رأس القسم */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-black text-slate-800 text-sm">تنسيق الروشتة</h3>
                    <p className="text-[11px] text-slate-500">الخطوط، الألوان، المسافات والحدود</p>
                </div>
            </div>

            {/* تبويبات فرعية */}
            <div className="flex gap-2 mb-3">
                {sectionBtn('text', 'عناصر النص')}
                {sectionBtn('layout', 'المسافات والحدود')}
                {sectionBtn('colors', 'الألوان العامة')}
            </div>

            {/* A. عناصر النص — كارت لكل عنصر */}
            {activeSection === 'text' && (
                <div className="space-y-2">
                    <TextElementCard
                        title="اسم الدواء"
                        description="افتراضي: 13px"
                        sizeValue={t.medNamePx ?? 13}
                        sizeMin={8} sizeMax={24}
                        onSizeChange={(v) => onChange({ medNamePx: v })}
                        colorValue={t.medNameColor} defaultColor="#0f172a"
                        onColorChange={(v) => onChange({ medNameColor: v })}
                        fontFamilyValue={t.medNameFontFamily}
                        onFontFamilyChange={(v) => onChange({ medNameFontFamily: v })}
                    />
                    <TextElementCard
                        title="جرعة الدواء"
                        description="افتراضي: 12px"
                        sizeValue={t.medInstPx ?? 12}
                        sizeMin={8} sizeMax={22}
                        onSizeChange={(v) => onChange({ medInstPx: v })}
                        colorValue={t.medInstColor} defaultColor="#334155"
                        onColorChange={(v) => onChange({ medInstColor: v })}
                        fontFamilyValue={t.medInstFontFamily}
                        onFontFamilyChange={(v) => onChange({ medInstFontFamily: v })}
                    />
                    <TextElementCard
                        title="الفحوصات والتعليمات الهامة"
                        description="افتراضي: 12px"
                        sizeValue={t.notesPx ?? 12}
                        sizeMin={8} sizeMax={22}
                        onSizeChange={(v) => onChange({ notesPx: v })}
                        colorValue={t.notesColor} defaultColor="#0f172a"
                        onColorChange={(v) => onChange({ notesColor: v })}
                        fontFamilyValue={t.notesFontFamily}
                        onFontFamilyChange={(v) => onChange({ notesFontFamily: v })}
                    />
                    <TextElementCard
                        title="الملاحظات الحرة بين الأدوية"
                        description="افتراضي: 15px"
                        sizeValue={t.notePx ?? 15}
                        sizeMin={8} sizeMax={28}
                        onSizeChange={(v) => onChange({ notePx: v })}
                        colorValue={t.noteColor} defaultColor="#1e293b"
                        onColorChange={(v) => onChange({ noteColor: v })}
                        fontFamilyValue={t.noteFontFamily}
                        onFontFamilyChange={(v) => onChange({ noteFontFamily: v })}
                    />
                    <TextElementCard
                        title="معلومات الكشف الإكلينيكية"
                        description="الشكوى/التاريخ/الفحص/التشخيص — افتراضي: 8.5px"
                        sizeValue={t.clinicalInfoPx ?? 8.5}
                        sizeMin={6} sizeMax={18} sizeStep={0.5}
                        onSizeChange={(v) => onChange({ clinicalInfoPx: v })}
                        colorValue={t.clinicalInfoColor} defaultColor="#1e293b"
                        onColorChange={(v) => onChange({ clinicalInfoColor: v })}
                        fontFamilyValue={t.clinicalInfoFontFamily}
                        onFontFamilyChange={(v) => onChange({ clinicalInfoFontFamily: v })}
                    />
                    <TextElementCard
                        title="رمز Rx"
                        description="أعلى قائمة الأدوية — افتراضي: 20px"
                        sizeValue={t.rxSymbolPx ?? 20}
                        sizeMin={12} sizeMax={40}
                        onSizeChange={(v) => onChange({ rxSymbolPx: v })}
                        colorValue={t.rxSymbolColor} defaultColor="#7f1d1d"
                        onColorChange={(v) => onChange({ rxSymbolColor: v })}
                        fontFamilyValue={t.rxSymbolFontFamily}
                        onFontFamilyChange={(v) => onChange({ rxSymbolFontFamily: v })}
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-700 leading-relaxed">
                        <div className="font-bold mb-1">ℹ️ ملاحظة:</div>
                        <div>إعدادات <strong>شريط بيانات المريض</strong> (الاسم/السن/التاريخ) موجودة في تاب <strong>"الجزء العلوي"</strong>.</div>
                        <div>إعدادات <strong>نص الفوتر</strong> (العنوان/التليفون/الأوقات) موجودة في تاب <strong>"الجزء السفلي"</strong>.</div>
                        <div>إعدادات <strong>القياسات الحيوية</strong> موجودة في تاب <strong>"الجزء الجانبي"</strong>.</div>
                    </div>
                </div>
            )}

            {/* B. المسافات والحدود */}
            {activeSection === 'layout' && (
                <div className="space-y-2.5 bg-white border border-slate-200 rounded-xl p-3.5">
                    <SliderRow
                        label="بين الأسطر"
                        value={t.rowMinHeightPx ?? 18}
                        min={10} max={40}
                        onChange={(v) => onChange({ rowMinHeightPx: v })}
                    />
                    <div className="text-[10px] text-slate-400 pr-20">المسافة العمودية بين أسطر الفحوصات والتعليمات</div>

                    <div className="pt-2 border-t border-slate-100">
                        <SliderRow
                            label="حول الدواء"
                            value={t.drugRowPaddingPx ?? 2}
                            min={0} max={15}
                            onChange={(v) => onChange({ drugRowPaddingPx: v })}
                        />
                        <div className="text-[10px] text-slate-400 pr-20 mt-1">المسافة الرأسية حول كل صف دواء</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <SliderRow
                            label="سُمك الفاصل"
                            value={t.drugBorderWidthPx ?? 1}
                            min={0} max={5}
                            onChange={(v) => onChange({ drugBorderWidthPx: v })}
                        />
                        <div className="text-[10px] text-slate-400 pr-20 mt-1">سُمك الخط الفاصل بين الأدوية — 0 = إخفاء</div>
                    </div>

                    <div className="pt-3 mt-1 border-t-2 border-slate-200">
                        <div className="text-xs font-bold text-slate-700 mb-2">مربع الكشف الإكلينيكي</div>
                        <div className="space-y-2.5">
                            <ColorRow
                                label="لون الخلفية"
                                value={t.clinicalBoxBgColor ?? '#f8fafc80'}
                                onChange={(v) => onChange({ clinicalBoxBgColor: v })}
                            />
                            <ColorRow
                                label="لون الحدود"
                                value={t.clinicalBoxBorderColor ?? '#f1f5f9'}
                                onChange={(v) => onChange({ clinicalBoxBorderColor: v })}
                            />
                            <SliderRow
                                label="سُمك الحدود"
                                value={t.clinicalBoxBorderWidthPx ?? 1}
                                min={0} max={5}
                                onChange={(v) => onChange({ clinicalBoxBorderWidthPx: v })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* C. الألوان العامة + عناوين الأقسام */}
            {activeSection === 'colors' && (
                <div className="space-y-2.5">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                        <ColorRow
                            label="خط فاصل"
                            value={t.drugBorderColor ?? '#f1f5f9'}
                            onChange={(v) => onChange({ drugBorderColor: v })}
                        />
                        <div className="text-[10px] text-slate-400 pr-20">لون الخط الفاصل بين الأدوية</div>
                    </div>

                    <TextElementCard
                        title='عناوين الأقسام ("فحوصات مطلوبة" / "تعليمات هامة")'
                        description="افتراضي: نفس حجم الفحوصات"
                        sizeValue={t.sectionTitlePx ?? t.notesPx ?? 12}
                        sizeMin={8} sizeMax={22}
                        onSizeChange={(v) => onChange({ sectionTitlePx: v })}
                        colorValue={t.sectionTitleColor} defaultColor="#7f1d1d"
                        onColorChange={(v) => onChange({ sectionTitleColor: v })}
                        fontFamilyValue={t.sectionTitleFontFamily}
                        onFontFamilyChange={(v) => onChange({ sectionTitleFontFamily: v })}
                    />
                </div>
            )}
        </div>
    );
};
