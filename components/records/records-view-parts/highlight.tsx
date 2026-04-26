/**
 * highlight — تظليل كلمة البحث داخل نص
 *
 * يُستخدم من CasePanel و DailyGroup لتظليل الكلمة المطابقة للبحث الحالي
 * داخل أي نص معروض في واجهة السجلات.
 */

import React from 'react';

export const highlight = (text: string, term: string) => {
    if (!term.trim() || !text) return text;
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safe})`, 'gi'));
    return (
        <>
            {parts.map((part, i) => part.toLowerCase() === term.toLowerCase()
                ? <mark key={i} className="bg-warning-200 rounded px-0.5">{part}</mark>
                : <React.Fragment key={i}>{part}</React.Fragment>)}
        </>
    );
};
