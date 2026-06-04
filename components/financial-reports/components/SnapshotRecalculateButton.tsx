/**
 * SnapshotRecalculateButton — زر إعادة حساب الشهر المغلق
 *
 * يظهر فوق التقرير الشهري لما الشهر المعروض يكون مغلق (عنده snapshot).
 * بيدّي الطبيب القدرة على إعادة حساب أرقام الشهر من الكشوفات والاستشارات
 * الحقيقية لو الـsnapshot اتحفظ بأصفار أو بأرقام غلط.
 */

import React from 'react';

interface SnapshotRecalculateButtonProps {
    monthLabel: string;
    onRecalculate: () => Promise<void>;
}

export const SnapshotRecalculateButton: React.FC<SnapshotRecalculateButtonProps> = ({
    monthLabel,
    onRecalculate,
}) => {
    const [isRecalculating, setIsRecalculating] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleClick = async () => {
        if (isRecalculating) return;
        setIsRecalculating(true);
        setError('');
        setShowSuccess(false);
        try {
            await onRecalculate();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
            console.error('[SnapshotRecalculate] failed:', err);
            setError('تعذر إعادة الحساب. حاول مرة أخرى.');
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
                {/* أيقونة القفل */}
                <div className="shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-900">
                        شهر {monthLabel} مُغلق (إقفال محاسبي)
                    </p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        الأرقام ثابتة من لحظة الإقفال. لو الأرقام مش مظبوطة، اضغط "إعادة حساب" عشان يتم حسابها من جديد بناءً على الكشوفات والاستشارات الفعلية.
                    </p>

                    {/* زر إعادة الحساب */}
                    <button
                        type="button"
                        onClick={handleClick}
                        disabled={isRecalculating}
                        className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            isRecalculating
                                ? 'bg-amber-200 text-amber-500 cursor-wait'
                                : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95 shadow-sm hover:shadow-md'
                        }`}
                    >
                        {isRecalculating ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                جاري إعادة الحساب...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                إعادة حساب من الكشوفات
                            </>
                        )}
                    </button>

                    {/* رسالة نجاح */}
                    {showSuccess && (
                        <p className="text-xs text-emerald-700 mt-2 font-semibold flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            تم إعادة الحساب بنجاح ✓
                        </p>
                    )}

                    {/* رسالة خطأ */}
                    {error && (
                        <p className="text-xs text-red-600 mt-2 font-semibold">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
