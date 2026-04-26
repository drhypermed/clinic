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
        header: 'from-brand-50 to-white text-brand-800 border-brand-200 hover:from-brand-100',
        active: 'bg-brand-50/50 border-brand-200',
        border: 'border-brand-100',
        icon: 'text-brand-500'
    },
    indigo: {
        header: 'from-brand-50 to-white text-brand-800 border-brand-200 hover:from-brand-100',
        active: 'bg-brand-50/50 border-brand-200',
        border: 'border-brand-100',
        icon: 'text-brand-500'
    },
    emerald: {
        header: 'from-success-50 to-white text-success-800 border-success-200 hover:from-success-100',
        active: 'bg-success-50/50 border-success-200',
        border: 'border-success-100',
        icon: 'text-success-500'
    },
    amber: {
        header: 'from-warning-50 to-white text-warning-800 border-warning-200 hover:from-warning-100',
        active: 'bg-warning-50/50 border-warning-200',
        border: 'border-warning-100',
        icon: 'text-warning-500'
    },
    rose: {
        header: 'from-danger-50 to-white text-danger-800 border-danger-200 hover:from-danger-100',
        active: 'bg-danger-50/50 border-danger-200',
        border: 'border-danger-100',
        icon: 'text-danger-500'
    },
    violet: {
        header: 'from-slate-50 to-white text-slate-800 border-slate-200 hover:from-slate-100',
        active: 'bg-slate-50/50 border-slate-200',
        border: 'border-slate-100',
        icon: 'text-slate-500'
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
