/**
 * PregnancyCalculatorCard — كرت إدخال LMP + عرض الأسبوع وميعاد الولاده
 *
 * الإدخال: تاريخ آخر دوره شهريه (LMP).
 * المخرجات (محسوبه live):
 *   - الأسبوع النهارده (مثلاً "16+3 أسبوع")
 *   - الترايمستر (1/2/3)
 *   - ميعاد الولاده المتوقع
 *
 * كل حسابات الحمل في services/specialty-packs/gynecology/calculations.ts
 */

import React, { useMemo } from 'react';
import {
    calculateGestationalWeek, formatGestationalAge,
    getTodayDateKey, getTrimester,
} from '../../../services/specialty-packs/gynecology';

interface PregnancyCalculatorCardProps {
    lmp: string | undefined;
    edd: string | undefined;
    onChangeLMP: (value: string) => void;
    closed?: boolean;
}

// ─ صياغه التاريخ بالعربي (DD/MM/YYYY) — أوضح للدكتوره من الـISO ─
const formatDateArabic = (iso?: string | null): string => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

const TRIMESTER_LABEL: Record<1 | 2 | 3, string> = {
    1: 'الثلث الأول',
    2: 'الثلث الثاني',
    3: 'الثلث الثالث',
};

export const PregnancyCalculatorCard: React.FC<PregnancyCalculatorCardProps> = ({
    lmp, edd, onChangeLMP, closed,
}) => {
    // الأسبوع وقت اليوم — يتعاد حسابه بشكل lazy لما الـlmp يتغيّر
    const todayWeek = useMemo(() => calculateGestationalWeek(lmp, getTodayDateKey()), [lmp]);
    const ageLabel = useMemo(() => formatGestationalAge(lmp, getTodayDateKey()), [lmp]);
    const trimester = useMemo(() => getTrimester(todayWeek), [todayWeek]);

    return (
        <div className="bg-white rounded-2xl border border-pink-200/80 shadow-sm p-3 sm:p-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3 min-w-0">
                <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white rounded-lg p-1.5 shrink-0 shadow-sm">
                    <span aria-hidden className="text-base">🤰</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-800">
                    حاسبه الحمل
                </h3>
                {closed && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-slate-600">
                        الحمل مغلق
                    </span>
                )}
            </div>

            {/* ─ إدخال LMP ─ */}
            <div className="space-y-1.5">
                <label className="block text-[11px] sm:text-xs font-black text-slate-600">
                    تاريخ آخر دوره شهريه (LMP)
                </label>
                <input
                    type="date"
                    value={lmp || ''}
                    onChange={(e) => onChangeLMP(e.target.value)}
                    disabled={closed}
                    className="w-full max-w-xs h-11 rounded-xl border-2 border-pink-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-pink-400 hover:border-pink-300 focus:outline-none transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] sm:text-[11px] text-pink-700 font-bold">
                    💡 بعد التسجيل، حقل "الحامل" والأسبوع في الكشف هيتحدثوا تلقائياً + الحسابات تطلع لوحدها.
                </p>
            </div>

            {/* ─ النتائج المحسوبه ─ */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-pink-50 border border-pink-200 p-2.5 text-center">
                    <p className="text-[10px] sm:text-[11px] font-bold text-pink-700/80">
                        الأسبوع النهارده
                    </p>
                    <p className="mt-1 text-base sm:text-lg font-black text-pink-700">
                        {ageLabel || '—'}
                    </p>
                </div>
                <div className="rounded-xl bg-pink-50 border border-pink-200 p-2.5 text-center">
                    <p className="text-[10px] sm:text-[11px] font-bold text-pink-700/80">
                        الثلث
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-black text-pink-700">
                        {trimester ? TRIMESTER_LABEL[trimester] : '—'}
                    </p>
                </div>
                <div className="rounded-xl bg-pink-50 border border-pink-200 p-2.5 text-center">
                    <p className="text-[10px] sm:text-[11px] font-bold text-pink-700/80">
                        ميعاد الولاده المتوقع
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-black text-pink-700">
                        {formatDateArabic(edd)}
                    </p>
                </div>
            </div>
        </div>
    );
};
