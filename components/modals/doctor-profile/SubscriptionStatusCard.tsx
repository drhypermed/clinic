/**
 * SubscriptionStatusCard — بطاقة حالة اشتراك الطبيب
 *
 * يعرض فئة الحساب (برو ماكس / برو / مجاني) مع:
 *   - شعار مميز (ذهبي لامع للـ برو ماكس، ذهبي للـ برو، أزرق للمجاني).
 *   - علامة صح خضراء للحسابات المدفوعة النشطة.
 *   - تواريخ بداية/نهاية الاشتراك.
 *   - رسالة + زر تجديد عبر واتساب للحسابات المنتهية.
 */

import React from 'react';

type SubscriptionTier = 'free' | 'pro' | 'pro_max';

interface SubscriptionStatusCardProps {
    isProAccount: boolean;
    isProExpired: boolean;
    /** الفئة الفعلية — لما الطبيب يكون pro_max نعرض ستايل مختلف عن pro */
    tier?: SubscriptionTier;
    premiumStartDate: string;
    premiumEndDate: string;
    formatSubscriptionDate: (dateValue: string) => string;
    formatSubscriptionTime: (dateValue: string) => string;
    onContactRenewalWhatsApp: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
    isProAccount,
    isProExpired,
    tier,
    premiumStartDate,
    premiumEndDate,
    formatSubscriptionDate,
    formatSubscriptionTime,
    onContactRenewalWhatsApp,
}) => {
    // نحدد الفئة — لو tier مش معطى، نستخدم isProAccount كـ fallback (backward compat)
    const effectiveTier: SubscriptionTier =
        tier === 'pro_max' ? 'pro_max'
        : tier === 'pro' ? 'pro'
        : isProAccount ? 'pro'
        : 'free';

    const isProMax = effectiveTier === 'pro_max';
    const isPro = effectiveTier === 'pro';
    const isPaid = isPro || isProMax;

    // لون بطاقة الخلفية
    const cardBg = isProMax
        // برو ماكس: ذهبي لامع مع تدرّج أقوى
        ? 'bg-gradient-to-r from-[#FFF176] via-[#FFD54F] to-[#FFB300] border-[#FF8F00] shadow-[0_4px_16px_-2px_rgba(255,193,7,0.5)]'
        : isPro
            ? 'bg-gradient-to-r from-[#FFF9C4] via-[#FFF59D] to-[#FFE082] border-[#FFD54F]'
            : 'bg-gradient-to-r from-sky-50 via-cyan-50 to-sky-100 border-sky-300';

    const titleColor = isProMax ? 'text-[#E65100]' : isPro ? 'text-[#FF6F00]' : 'text-sky-800';
    const crownColor = isProMax ? 'text-[#E65100]' : isPro ? 'text-[#FF8F00]' : 'text-sky-700';
    const tierBadgeBg = isPaid ? 'bg-white/70 text-amber-900' : 'bg-white/70 text-sky-800';
    const tierLabel = isProMax ? 'برو ماكس' : isPro ? 'برو' : 'حساب مجاني';

    return (
        <div className={`relative w-full max-w-md mt-2 mb-4 rounded-2xl border-2 px-4 py-3 overflow-hidden ${cardBg}`}>
            {/* Shine overlay مخصص لبرو ماكس — إحساس بريميوم */}
            {isProMax && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                        background:
                            'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)',
                    }}
                />
            )}

            <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {isPaid ? (
                        <svg className={`w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${crownColor}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-sky-700" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    )}
                    <span className={`text-sm font-black tracking-wide ${titleColor}`}>
                        {tierLabel}
                    </span>
                    {/* علامة صح خضراء للحسابات المدفوعة النشطة (برو أو برو ماكس) — تأكيد التفعيل */}
                    {isPaid && !isProExpired && (
                        <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-300"
                            aria-label="مفعّل"
                            title="مفعّل"
                        >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L20 7" />
                            </svg>
                        </span>
                    )}
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-1 rounded-full ${tierBadgeBg}`}>
                    نوع الحساب
                </span>
            </div>

            {isPaid ? (
                <div className="relative mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                    <div className="rounded-xl bg-white/70 border border-white/90 px-3 py-2">
                        <p className="text-[11px] font-bold text-slate-600">تاريخ بداية الاشتراك</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 break-words">
                            {formatSubscriptionDate(premiumStartDate)}
                        </p>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-white/90 px-3 py-2">
                        <p className="text-[11px] font-bold text-slate-600">تاريخ نهاية الاشتراك</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 break-words">
                            {formatSubscriptionDate(premiumEndDate)}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative mt-3 space-y-2 text-right">
                    <p className="text-sm font-bold text-sky-900">
                        هذا الحساب يعمل بخطة مجانية مع كامل صلاحيات الحساب المجاني.
                    </p>
                    {isProExpired && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                            <p className="text-sm font-black text-amber-900 leading-6">
                                اشتراكك برو انتهى بتاريخ {formatSubscriptionDate(premiumEndDate)} الساعة {formatSubscriptionTime(premiumEndDate)}.
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-bold text-amber-800">
                                    يرجى التواصل لتجديد الاشتراك.
                                </p>
                                <button
                                    type="button"
                                    onClick={onContactRenewalWhatsApp}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-black text-white hover:bg-green-700 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                                    </svg>
                                    تواصل واتساب
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
