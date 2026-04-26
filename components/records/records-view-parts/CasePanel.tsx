/**
 * CasePanel — لوحة عرض زيارة واحدة (كشف/استشارة)
 *
 * تعرض تفاصيل زيارة واحدة مع:
 *   - العلامات الحيوية.
 *   - الحقول الإكلينيكية (تاريخ، شكوى، فحص، فحوصات).
 *   - قائمة الأدوية + التعليمات + الفحوصات المطلوبة.
 *
 * المكونات الداخلية (Field, DualField, MedsBlock, ListBlock) مستخدمة
 * حصرياً داخل هذا الملف، وتم الإبقاء عليها هنا لعدم تكاثر الملفات.
 */

import React from 'react';
import type { PatientRecord } from '../../../types';
import { SecretaryVitalsPills } from '../../common/SecretaryVitalsPills';
import { type CaseData, NO_PERTINENT_EN, formatDateTime, getFieldFallback, hasText } from './helpers';
import { highlight } from './highlight';

/** مكون عرض حقل نصي منفرد */
const Field: React.FC<{ title: string; value: string; term: string; titleTone?: string }> = ({ title, value, term, titleTone = 'border-slate-200 bg-slate-50 text-slate-600' }) => {
    const isNoInfo = (value || '').trim() === NO_PERTINENT_EN;
    if (!hasText(value) && !isNoInfo) return null;
    return (
        <div className="rounded-xl bg-white border border-slate-100 p-2.5">
            <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black mb-1.5 ${titleTone}`}>{title}</div>
            {isNoInfo
                ? <div className="text-xs text-slate-400 italic py-0.5">{getFieldFallback(title)}</div>
                : <div className="text-sm font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">{highlight((value || '').trim(), term)}</div>
            }
        </div>
    );
};

/** مكون عرض قائمة الأدوية داخل السجل */
const MedsBlock: React.FC<{ items: PatientRecord['rxItems']; term: string; titleTone?: string }> = ({ items, term, titleTone = 'border-slate-200 bg-slate-50 text-slate-600' }) => (
    <div className="rounded-xl bg-white border border-slate-100 p-2.5">
        <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black mb-2 ${titleTone}`}>الأدوية</div>
        {items.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-1">لا توجد أدوية</div>
        ) : (
            <ul className="space-y-2">
                {items.map((m, i) => (
                    <li key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                        <div className="text-sm font-bold text-slate-800 whitespace-pre-wrap">{highlight(m.medication?.name || 'دواء', term)}</div>
                        <div className="text-xs font-medium text-slate-500 whitespace-pre-wrap mt-0.5">{highlight((m.instructions || '').trim() || 'بدون تعليمات', term)}</div>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

/** مكون عرض حقل مزدوج (للنسخ المترجمة أو المعالجة بواسطة الذكاء الاصطناعي) */
// arValue = نص عربي خام كتبه الطبيب، aiValue = الترجمة الإنجليزية الناتجة عن "تحليل الحالة"
// نعرض الإنجليزي لو موجود، ولو الطبيب حفظ من غير ما يشغّل التحليل نعرض العربي كـ fallback
// علشان بيانات الكشف اللي اتكتبت بس في "المعلومات السريرية" ما تضيعش من العرض.
const DualField: React.FC<{ title: string; aiValue: string; arValue?: string; term: string; titleTone?: string }> = ({ title, aiValue, arValue, term, titleTone = 'border-slate-200 bg-slate-50 text-slate-600' }) => {
    const isNoInfo = (aiValue || '').trim() === NO_PERTINENT_EN;
    // نختار أفضل نص متاح حسب الأولوية:
    //   1) لو الـAI قال "No pertinent information" والطبيب كاتب عربي → نعرض العربي (مش رسالة AI السلبية)
    //   2) لو الإنجليزي موجود ومفيد → نعرضه (حالة التحليل الكامل)
    //   3) لو الإنجليزي فاضي والعربي موجود → نعرض العربي (حالة الحفظ بدون AI)
    //   4) لو كلاهما فاضي والـAI ما قالش "لا يوجد" نخفي الحقل
    const hasEn = hasText(aiValue);
    const hasAr = hasText(arValue);
    const useArabicFallback = (isNoInfo || !hasEn) && hasAr;
    const displayValue = useArabicFallback ? (arValue || '') : (hasEn ? aiValue : '');
    if (!hasEn && !hasAr && !isNoInfo) return null;
    return (
        <div className="rounded-xl bg-white border border-slate-100 p-2.5">
            <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black mb-1.5 ${titleTone}`}>{title}</div>
            {isNoInfo && !hasAr
                ? <div className="text-xs text-slate-400 italic py-0.5">{getFieldFallback(title)}</div>
                : <div className="text-sm font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">{highlight(displayValue.trim(), term)}</div>
            }
        </div>
    );
};

/** مكون عرض قوائم نصية (تعليمات، تحاليل، إلخ) */
const ListBlock: React.FC<{ title: string; items: string[]; term: string; empty: string; titleTone?: string }> = ({ title, items, term, empty, titleTone = 'border-slate-200 bg-slate-50 text-slate-600' }) => (
    <div className="rounded-xl bg-white border border-slate-100 p-2.5">
        <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black mb-2 ${titleTone}`}>{title}</div>
        {items.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-1">{empty}</div>
        ) : (
            <ul className="space-y-1">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-1.5 text-sm font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                        <span className="text-slate-300 shrink-0 mt-0.5 select-none">•</span>
                        <span>{highlight(item || '', term)}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

/**
 * لوحة عرض الحالة (Case Panel):
 * مكون يعرض تفاصيل زيارة واحدة (شكوى، تاريخ، فحص، تشخيص، أدوية).
 */
export const CasePanel: React.FC<{ data: CaseData; term: string; onDeleteCase?: () => void; vitals?: Record<string, string> }> = ({ data, term, onDeleteCase, vitals }) => {
    const meds = data.rxItems.filter(i => i.type === 'medication');
    const notes = data.rxItems.filter(i => i.type === 'note').map(i => (i.instructions || '').trim()).filter(Boolean);

    const titleTone = 'border-brand-200 bg-brand-50 text-brand-700';
    const borderAccent = 'border-r-[3px] border-r-blue-500';
    const headerBadge = 'bg-brand-600 text-white';

    return (
        <div className={`rounded-2xl bg-white border border-slate-200 overflow-hidden ${borderAccent}`}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${headerBadge}`}>
                    {data.title}
                </span>
                <div className="flex items-center gap-2.5">
                    {onDeleteCase && (
                        <button
                            type="button"
                            onClick={onDeleteCase}
                            className="px-2.5 py-1 rounded-lg bg-danger-600 text-white text-[11px] font-bold hover:bg-danger-700 transition-colors shadow-sm"
                        >
                            حذف
                        </button>
                    )}
                    <span className="text-[11px] font-medium text-slate-400">{formatDateTime(data.date)}</span>
                </div>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {vitals && Object.keys(vitals).length > 0 && (
                    <div className="md:col-span-2 rounded-xl bg-white border border-slate-100 p-2.5">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black mb-1.5 ${titleTone}`}>القياسات والعلامات الحيوية</div>
                        <SecretaryVitalsPills vitals={vitals} compact separator=" | " title="" />
                    </div>
                )}
                {/* نمرّر النسخة العربية كـ fallback للعرض — لما يحفظ بدون "تحليل الحالة" نعرض اللي كتبه بايده */}
                <DualField title="الشكوى" aiValue={data.complaintEn} arValue={data.complaintAr} term={term} titleTone={titleTone} />
                <DualField title="التاريخ المرضي" aiValue={data.historyEn} arValue={data.historyAr} term={term} titleTone={titleTone} />
                <DualField title="ملاحظات الكشف" aiValue={data.examEn} arValue={data.examAr} term={term} titleTone={titleTone} />
                <DualField title="الفحوصات الموجودة" aiValue={data.investigationsEn} arValue={data.investigationsAr} term={term} titleTone={titleTone} />
                {(hasText(data.diagnosisEn) || (data.diagnosisEn || '').trim() === NO_PERTINENT_EN) && (
                    <div className="md:col-span-2"><Field title="التشخيص" value={data.diagnosisEn} term={term} titleTone={titleTone} /></div>
                )}
            </div>

            <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <MedsBlock items={meds} term={term} titleTone={titleTone} />
                <ListBlock title="الفحوصات المطلوبة" items={data.labInvestigations} term={term} empty="لا توجد فحوصات" titleTone={titleTone} />
                <ListBlock title="التعليمات" items={data.generalAdvice} term={term} empty="لا توجد تعليمات" titleTone={titleTone} />
                <ListBlock title="ملاحظات مكتوبة" items={notes} term={term} empty="لا توجد ملاحظات" titleTone={titleTone} />
            </div>
        </div>
    );
};
