/**
 * الملف: CollapsibleSection.tsx
 * الوصف: مكون واجهة مستخدم (UI Template) للأجزاء القابلة للطي (Accordion). 
 * يُستخدم لتنظيم إعدادات الروشتة الكثيرة في مجموعات منطقية، 
 * مما يقلل من تشتت المستخدم ويوفر مساحة أكبر للمعاينة الحية.
 */

import React from 'react';

interface CollapsibleSectionProps {
    title: React.ReactNode; // عنوان القسم (نص أو أيقونات)
    isOpen: boolean; // هل القسم مفتوح أم مغلق
    onToggle: () => void; // دالة التبديل بين الفتح والإغلاق
    children: React.ReactNode; // المحتوى الداخلي للقسم
    className?: string;
    color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'; // سمة اللون الخاصة بالقسم
}

const COLOR_STYLES = {
    blue: {
        header: 'from-blue-50 to-white text-blue-800 border-blue-200 hover:from-blue-100',
        active: 'bg-blue-50/50 border-blue-200',
        border: 'border-blue-100',
        icon: 'text-blue-500'
    },
    indigo: {
        header: 'from-indigo-50 to-white text-indigo-800 border-indigo-200 hover:from-indigo-100',
        active: 'bg-indigo-50/50 border-indigo-200',
        border: 'border-indigo-100',
        icon: 'text-indigo-500'
    },
    emerald: {
        header: 'from-emerald-50 to-white text-emerald-800 border-emerald-200 hover:from-emerald-100',
        active: 'bg-emerald-50/50 border-emerald-200',
        border: 'border-emerald-100',
        icon: 'text-emerald-500'
    },
    amber: {
        header: 'from-amber-50 to-white text-amber-800 border-amber-200 hover:from-amber-100',
        active: 'bg-amber-50/50 border-amber-200',
        border: 'border-amber-100',
        icon: 'text-amber-500'
    },
    rose: {
        header: 'from-rose-50 to-white text-rose-800 border-rose-200 hover:from-rose-100',
        active: 'bg-rose-50/50 border-rose-200',
        border: 'border-rose-100',
        icon: 'text-rose-500'
    },
    violet: {
        header: 'from-violet-50 to-white text-violet-800 border-violet-200 hover:from-violet-100',
        active: 'bg-violet-50/50 border-violet-200',
        border: 'border-violet-100',
        icon: 'text-violet-500'
    },
    slate: {
        header: 'from-slate-50 to-white text-slate-700 border-slate-200 hover:from-slate-100',
        active: 'bg-slate-50 border-slate-200',
        border: 'border-slate-200',
        icon: 'text-slate-400'
    }
} as const;

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    isOpen,
    onToggle,
    children,
    className,
    color = 'slate'
}) => {
    const s = COLOR_STYLES[color];
    return (
        <div className={`border ${s.border} rounded-xl overflow-hidden bg-white mb-3 shadow-sm transition-all duration-200`}>
            <button
                onClick={onToggle}
                className={`w-full p-4 flex items-center justify-between text-right transition-all bg-gradient-to-l ${isOpen ? s.active + ' border-b' : s.header}`}
                type="button"
            >
                <div className="font-bold flex items-center gap-2 text-sm sm:text-base">
                    {title}
                </div>
                <div className={`transform transition-transform duration-200 ${s.icon} ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className={className ?? 'p-4'}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
