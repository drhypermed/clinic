import React from 'react';
import type { User } from 'firebase/auth';
import type { ClinicAppointment, PatientRecord } from '../../types';
import { AdBanner } from '../common/AdBanner';
import { PremiumExpiryWarning } from '../common/PremiumExpiryWarning';
import { usePremiumExpiryCheck } from '../../hooks/usePremiumExpiryCheck';
import { useHomepageBanner } from '../../hooks/useHomepageBanner';
import { formatUserDate, formatUserTime, getUserHour } from '../../utils/cairoTime';
import { computePaymentBreakdownForBasePrice } from '../../utils/paymentDiscount';
import { financialDataService } from '../../services/financial-data';
import {
    FaCalendarCheck, FaPlus, FaClock,
    FaClipboardList, FaArrowLeft,
    FaCircleCheck, FaHourglassHalf,
    FaCalendarDay, FaCalendar, FaChartLine,
} from 'react-icons/fa6';
import { PeriodCard } from './PeriodStatsCard';
import { NextPatientCard } from './NextPatientCard';
import { AppointmentRow } from './AppointmentRow';

/* ──────────────────────────────────────────────────────── */

interface DashboardProps {
    user: User | null;
    stats: {
        appointments: number;
        examinations: number;
        consultations: number;
    };
    onNavigate: (view: string) => void;
    onStartNewExam: () => void;
    doctorName?: string;
    todayAppointments?: ClinicAppointment[];
    records?: PatientRecord[];
    userId?: string;
    activeBranchId?: string;
}

/* ──────────────────────────────────────────────────────── */

/** format YYYY-MM-DD from Date */
const toDayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** format YYYY-MM from Date */
const toMonthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/* ──────────────────────────────────────────────────────── */

export const Dashboard: React.FC<DashboardProps> = ({
    user,
    stats,
    onNavigate,
    onStartNewExam,
    doctorName,
    todayAppointments = [],
    records = [],
    userId = '',
    activeBranchId,
}) => {
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [bannerAssetReady, setBannerAssetReady] = React.useState(false);
    const [examPrice, setExamPrice] = React.useState(0);
    const [consultPrice, setConsultPrice] = React.useState(0);
    const [yearlyDaily, setYearlyDaily] = React.useState<Record<string, { interventions: number; other: number; interventionsIns: number; otherIns: number; expense: number }>>({});
    const [yearlyMonthly, setYearlyMonthly] = React.useState<Record<string, number>>({});
    const [labels, setLabels] = React.useState<{ interventionsLabel: string; otherRevenueLabel: string }>({
        interventionsLabel: 'التداخلات',
        otherRevenueLabel: 'دخل آخر',
    });

    const expiryWarning = usePremiumExpiryCheck(user);
    const { banner, loading: bannerLoading, isVisible: isHomepageBannerVisible } = useHomepageBanner('doctors');

    const bannerPrimaryImageUrl = React.useMemo(() => {
        const mainImage = (banner?.imageUrl || '').trim();
        if (mainImage) return mainImage;
        const firstFromList = (banner?.imageUrls || []).find((item) => String(item || '').trim());
        return (firstFromList || '').trim();
    }, [banner?.imageUrl, banner?.imageUrls]);

    // Clock tick
    React.useEffect(() => {
        let intervalId: number | undefined;
        const tick = () => setCurrentTime(new Date());
        const msToNextMinute = 60_000 - (Date.now() % 60_000);
        const timeoutId = window.setTimeout(() => { tick(); intervalId = window.setInterval(tick, 60_000); }, msToNextMinute);
        return () => { window.clearTimeout(timeoutId); if (intervalId !== undefined) window.clearInterval(intervalId); };
    }, []);

    // Banner preload
    React.useEffect(() => {
        if (!isHomepageBannerVisible || bannerLoading) { setBannerAssetReady(false); return; }
        if (!bannerPrimaryImageUrl) { setBannerAssetReady(true); return; }
        let cancelled = false;
        const img = new Image();
        const ready = () => { if (!cancelled) setBannerAssetReady(true); };
        setBannerAssetReady(false);
        img.onload = ready; img.onerror = ready; img.src = bannerPrimaryImageUrl;
        if (img.complete) ready();
        const fallback = window.setTimeout(ready, 4000);
        return () => { cancelled = true; window.clearTimeout(fallback); };
    }, [bannerLoading, bannerPrimaryImageUrl, isHomepageBannerVisible]);

    // Fetch exam/consultation prices
    React.useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        financialDataService.getPrices(userId, activeBranchId).then((p) => {
            if (cancelled) return;
            setExamPrice(parseFloat(p.examinationPrice || '0') || 0);
            setConsultPrice(parseFloat(p.consultationPrice || '0') || 0);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [userId, activeBranchId]);

    // جلب البيانات المالية السنوية — نشتق السنة من currentTime (يتحدث كل دقيقة) حتى تُعاد الجلب تلقائياً عند بداية سنة جديدة
    const effectiveYear = currentTime.getFullYear();
    React.useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const year = effectiveYear;

        financialDataService.getYearlyDailyEntries(userId, year, activeBranchId).then((entries) => {
            if (cancelled) return;
            const agg: Record<string, { interventions: number; other: number; interventionsIns: number; otherIns: number; expense: number }> = {};
            Object.entries(entries || {}).forEach(([dateKey, data]) => {
                const interventions = Number(data?.interventionsRevenue) || 0;
                const other = Number(data?.otherRevenue) || 0;
                const expense = Number(data?.dailyExpense) || 0;
                let interventionsIns = 0;
                let otherIns = 0;
                const extras = Array.isArray(data?.insuranceExtras) ? data!.insuranceExtras : [];
                for (const ex of extras) {
                    const amt = Number((ex as any)?.amount) || 0;
                    const type = (ex as any)?.type;
                    if (type === 'interventions') interventionsIns += amt;
                    else if (type === 'other') otherIns += amt;
                }
                agg[dateKey] = { interventions, other, interventionsIns, otherIns, expense };
            });
            setYearlyDaily(agg);
        }).catch(() => {});

        // Yearly monthly fixed expenses (rent, salaries, tools, electricity, other)
        financialDataService.getYearlyMonthlyEntries(userId, year, activeBranchId).then((entries) => {
            if (cancelled) return;
            const agg: Record<string, number> = {};
            Object.entries(entries || {}).forEach(([monthKey, data]) => {
                const total =
                    (Number(data?.rentExpense) || 0) +
                    (Number(data?.salariesExpense) || 0) +
                    (Number(data?.toolsExpense) || 0) +
                    (Number(data?.electricityExpense) || 0) +
                    (Number(data?.otherExpense) || 0);
                agg[monthKey] = total;
            });
            setYearlyMonthly(agg);
        }).catch(() => {});

        // المسميات بتوصل مُنظّفة من services/financial-data/labels.ts (auto-migration للاحقة "(كاش)" القديمة)
        financialDataService.getLabels(userId, activeBranchId).then((l) => {
            if (cancelled) return;
            setLabels({
                interventionsLabel: (l?.interventionsLabel || '').trim() || 'التداخلات',
                otherRevenueLabel: (l?.otherRevenueLabel || '').trim() || 'دخل آخر',
            });
        }).catch(() => {});

        return () => { cancelled = true; };
    }, [userId, activeBranchId, effectiveYear]);

    const hour = getUserHour(currentTime);
    const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';
    const displayName = (doctorName || user?.displayName || '').trim();
    const dateStr = formatUserDate(currentTime, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, 'ar-EG');
    const timeStr = formatUserTime(currentTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG');
    const showBanner = isHomepageBannerVisible && !bannerLoading && bannerAssetReady;

    /* ── Appointments ── */
    const sortedAppointments = React.useMemo(() =>
        [...todayAppointments].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [todayAppointments]);

    const completedCount = React.useMemo(() => sortedAppointments.filter(a => a.examCompletedAt).length, [sortedAppointments]);
    const pendingCount = sortedAppointments.length - completedCount;
    const nextPatient = React.useMemo(() => sortedAppointments.find(a => !a.examCompletedAt), [sortedAppointments]);
    const totalToday = sortedAppointments.length;
    const progressPercent = totalToday > 0 ? Math.round((completedCount / totalToday) * 100) : 0;

    /* ── Daily / Monthly / Yearly Stats from records ── */
    // مشتق من currentTime (يتحدث كل دقيقة) حتى تتغير مفاتيح اليوم/الشهر/السنة تلقائياً عند منتصف الليل أو بداية شهر/سنة جديدة.
    const todayKey = React.useMemo(() => toDayKey(currentTime), [currentTime]);
    const monthKey = React.useMemo(() => toMonthKey(currentTime), [currentTime]);
    const currentYear = React.useMemo(() => currentTime.getFullYear(), [currentTime]);

    const periodStats = React.useMemo(() => {
        let todayExams = 0, todayConsults = 0;
        let monthExams = 0, monthConsults = 0;
        let yearExams = 0, yearConsults = 0;
        let todayRevenue = 0, todayCash = 0, todayInsurance = 0;
        let monthRevenue = 0, monthCash = 0, monthInsurance = 0;
        let yearRevenue = 0, yearCash = 0, yearInsurance = 0;

        // خصومات الأسعار (discountAmount) بتتحسب كمصروف — مطابقة للتقارير المالية
        let todayDiscountExp = 0, monthDiscountExp = 0, yearDiscountExp = 0;

        const addExam = (dayKey: string, mKey: string, yr: number, bd: { billedIncome: number; collectedCash: number; insuranceClaims: number; discountAmount: number }) => {
            if (yr === currentYear) { yearExams++; yearRevenue += bd.billedIncome; yearCash += bd.collectedCash; yearInsurance += bd.insuranceClaims; yearDiscountExp += bd.discountAmount; }
            if (mKey === monthKey) { monthExams++; monthRevenue += bd.billedIncome; monthCash += bd.collectedCash; monthInsurance += bd.insuranceClaims; monthDiscountExp += bd.discountAmount; }
            if (dayKey === todayKey) { todayExams++; todayRevenue += bd.billedIncome; todayCash += bd.collectedCash; todayInsurance += bd.insuranceClaims; todayDiscountExp += bd.discountAmount; }
        };
        const addConsult = (dayKey: string, mKey: string, yr: number, bd: { billedIncome: number; collectedCash: number; insuranceClaims: number; discountAmount: number }) => {
            if (yr === currentYear) { yearConsults++; yearRevenue += bd.billedIncome; yearCash += bd.collectedCash; yearInsurance += bd.insuranceClaims; yearDiscountExp += bd.discountAmount; }
            if (mKey === monthKey) { monthConsults++; monthRevenue += bd.billedIncome; monthCash += bd.collectedCash; monthInsurance += bd.insuranceClaims; monthDiscountExp += bd.discountAmount; }
            if (dayKey === todayKey) { todayConsults++; todayRevenue += bd.billedIncome; todayCash += bd.collectedCash; todayInsurance += bd.insuranceClaims; todayDiscountExp += bd.discountAmount; }
        };

        const calcBreakdown = (r: PatientRecord, basePrice: number) =>
            computePaymentBreakdownForBasePrice({ basePrice, paymentType: r.paymentType, patientSharePercent: r.patientSharePercent, discountAmount: r.discountAmount, discountPercent: r.discountPercent });

        for (const r of records) {
            let d: Date;
            try { d = new Date(r.date); } catch { continue; }
            const recDayKey = toDayKey(d);
            const recMonthKey = toMonthKey(d);
            const recYear = d.getFullYear();

            if (r.isConsultationOnly) {
                const bp = (Number.isFinite(r.serviceBasePrice) && (r.serviceBasePrice ?? 0) > 0) ? r.serviceBasePrice! : consultPrice;
                addConsult(recDayKey, recMonthKey, recYear, calcBreakdown(r, bp));
                continue;
            }

            // Exam
            const bp = (Number.isFinite(r.serviceBasePrice) && (r.serviceBasePrice ?? 0) > 0) ? r.serviceBasePrice! : examPrice;
            addExam(recDayKey, recMonthKey, recYear, calcBreakdown(r, bp));

            // الاستشارات المنفصلة (المربوطة بـ consultationRecordId) محسوبة بالفعل
            // كسجلات isConsultationOnly مستقلة، فلا نكررها هنا. نعد فقط الاستشارة
            // القديمة المضمّنة (legacy inline) اللي مالهاش سجل منفصل.
            if (r.consultation?.date && !r.consultationRecordId) {
                let d3: Date;
                try { d3 = new Date(r.consultation.date); } catch { continue; }
                const cbp = (r.consultationServiceBasePrice ?? 0) > 0 ? r.consultationServiceBasePrice! : consultPrice;
                addConsult(toDayKey(d3), toMonthKey(d3), d3.getFullYear(), calcBreakdown(r, cbp));
            }
        }

        // Aggregate interventions & other revenue + daily expenses from yearly daily entries
        let todayInterventions = 0, monthInterventions = 0, yearInterventions = 0;
        let todayOther = 0, monthOther = 0, yearOther = 0;
        let todayDailyExp = 0, monthDailyExp = 0, yearDailyExp = 0;
        Object.entries(yearlyDaily).forEach(([dateKey, v]) => {
            const interventionsTotal = (v.interventions || 0) + (v.interventionsIns || 0);
            const otherTotal = (v.other || 0) + (v.otherIns || 0);
            const exp = v.expense || 0;
            // year already filtered on fetch
            yearInterventions += interventionsTotal;
            yearOther += otherTotal;
            yearDailyExp += exp;
            if (dateKey.startsWith(monthKey)) {
                monthInterventions += interventionsTotal;
                monthOther += otherTotal;
                monthDailyExp += exp;
            }
            if (dateKey === todayKey) {
                todayInterventions += interventionsTotal;
                todayOther += otherTotal;
                todayDailyExp += exp;
            }
        });

        // Fixed monthly expenses (rent, salaries, tools, electricity, other)
        let monthFixedExp = 0, yearFixedExp = 0;
        Object.entries(yearlyMonthly).forEach(([mKey, total]) => {
            yearFixedExp += total;
            if (mKey === monthKey) monthFixedExp += total;
        });

        // المصروفات = مصروفات يومية + مصروفات ثابتة شهرية + خصومات الأسعار
        // (خصومات الأسعار بتتحسب كمصروف في التقارير المالية، فلازم تتطابق هنا)
        const todayExpenses = todayDailyExp + todayDiscountExp;
        const monthExpenses = monthDailyExp + monthFixedExp + monthDiscountExp;
        const yearExpenses = yearDailyExp + yearFixedExp + yearDiscountExp;

        return {
            today: { exams: todayExams, consults: todayConsults, revenue: todayRevenue + todayInterventions + todayOther, expenses: todayExpenses, insurance: todayInsurance, interventions: todayInterventions, other: todayOther },
            month: { exams: monthExams, consults: monthConsults, revenue: monthRevenue + monthInterventions + monthOther, expenses: monthExpenses, insurance: monthInsurance, interventions: monthInterventions, other: monthOther },
            year:  { exams: yearExams,  consults: yearConsults,  revenue: yearRevenue + yearInterventions + yearOther, expenses: yearExpenses, insurance: yearInsurance, interventions: yearInterventions, other: yearOther },
        };
    }, [records, examPrice, consultPrice, yearlyDaily, yearlyMonthly, todayKey, monthKey, currentYear]);

    const fmtMoney = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="dh-dashboard animate-fadeIn min-h-screen font-sans relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-50 via-white to-blue-50/30 pointer-events-none" />
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-100/20 via-blue-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-indigo-100/20 via-purple-50/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

                {/* ─── Ad Banner ─── */}
                {showBanner && (
                    <AdBanner
                        imageUrl={banner?.imageUrl || ''} imageUrls={banner?.imageUrls || []}
                        items={banner?.items || []} altText={banner?.title || 'إعلان'}
                        link={banner?.targetUrl || undefined} displayHeight={banner?.bannerHeight}
                        rotationSeconds={banner?.rotationSeconds || 5}
                    />
                )}

                {/* ─── Pro Warning ─── */}
                {expiryWarning.isExpired && expiryWarning.expiryDate ? (
                    <PremiumExpiryWarning expiryDate={expiryWarning.expiryDate} mode="expired" />
                ) : expiryWarning.show && expiryWarning.expiryDate ? (
                    <PremiumExpiryWarning expiryDate={expiryWarning.expiryDate} mode="expiring" />
                ) : null}

                {/* ═══════════════════════════════════════════
                    HEADER — Glassmorphism welcome card
                ═══════════════════════════════════════════ */}
                <div className="dh-stagger-1 relative rounded-2xl p-4 sm:p-5 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)]">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-bl from-teal-500/[0.03] via-transparent to-indigo-500/[0.03] pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                                {greeting}{displayName ? <> يا <span className="bg-gradient-to-l from-teal-700 to-teal-500 bg-clip-text text-transparent">{displayName}</span></> : ''}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-slate-400 text-[11px] sm:text-xs font-medium">
                                <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-full px-2.5 py-1">
                                    <FaClock className="w-2.5 h-2.5 text-teal-500 shrink-0" />
                                    <span className="font-numeric font-bold text-slate-600">{timeStr}</span>
                                </div>
                                <span className="text-slate-300 hidden sm:inline">|</span>
                                <span className="hidden sm:inline text-slate-500">{dateStr}</span>
                            </div>
                        </div>
                        {/* زر كشف جديد — ظل teal أعمق + scale خفيف على الـhover عشان يبان CTA أقوى */}
                        <button
                            onClick={onStartNewExam}
                            className="group flex items-center gap-2 bg-gradient-to-l from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 active:from-teal-800 active:to-teal-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-[0_6px_20px_-4px_rgba(13,148,136,0.55),0_2px_6px_-2px_rgba(13,148,136,0.35)] hover:shadow-[0_10px_28px_-6px_rgba(13,148,136,0.65),0_4px_10px_-2px_rgba(13,148,136,0.45)] hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-100 transition-all duration-200 shrink-0"
                        >
                            <FaPlus className="w-3 h-3 transition-transform duration-200 group-hover:rotate-90" />
                            <span className="hidden sm:inline">كشف جديد</span>
                            <span className="sm:hidden">كشف</span>
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    NEXT PATIENT
                ═══════════════════════════════════════════ */}
                {nextPatient ? (
                    <div className="dh-stagger-2">
                        <NextPatientCard appointment={nextPatient} onStartExam={onStartNewExam} />
                    </div>
                ) : totalToday > 0 ? (
                    <div className="dh-stagger-2 bg-gradient-to-bl from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/40 rounded-2xl p-5 sm:p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)]">
                            <FaCircleCheck className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-base sm:text-lg font-black text-emerald-800">تم الانتهاء من جميع المواعيد</p>
                        <p className="text-xs text-emerald-600/70 font-medium mt-1">تم كشف {completedCount} {completedCount === 1 ? 'مريض' : 'مرضى'} اليوم</p>
                    </div>
                ) : null}

                {/* ═══════════════════════════════════════════
                    TODAY'S PROGRESS
                ═══════════════════════════════════════════ */}
                <div className="dh-stagger-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
                                <FaChartLine className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-700">تقدم اليوم</span>
                        </div>
                        <div className="bg-slate-100/80 rounded-full px-3 py-1">
                            <span className="text-[11px] sm:text-xs font-black text-slate-700 font-numeric">{completedCount} / {totalToday}</span>
                        </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-l from-teal-400 via-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out dh-progress-glow" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-[10px] sm:text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1"><FaCircleCheck className="w-2.5 h-2.5" />تم: {completedCount}</span>
                        <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 rounded-full px-2.5 py-1"><FaHourglassHalf className="w-2.5 h-2.5" />متبقي: {pendingCount}</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    STATS GRID — Daily / Monthly / Yearly
                ═══════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

                    {/* ─── TODAY ─── */}
                    {/* اليوم: teal أعمق ومشبع (primary) — بدل 400→600 بقى 500→700 عشان feel premium */}
                    <div className="dh-stagger-4">
                        <PeriodCard
                            icon={<FaCalendarDay />}
                            title="إحصائيات اليوم"
                            accentFrom="from-teal-500"
                            accentTo="to-teal-700"
                            headerBg="bg-gradient-to-l from-teal-50 via-white to-teal-50/40"
                            headerBorder="border-teal-100"
                            headerIcon="text-teal-700"
                            headerText="text-teal-900"
                            data={periodStats.today}
                            fmtMoney={fmtMoney}
                            labels={labels}
                        />
                    </div>

                    {/* ─── THIS MONTH ─── */}
                    {/* الشهر: لمسة ناعمة من slate مع tint خفيف (Linear/Vercel feel) */}
                    <div className="dh-stagger-5">
                        <PeriodCard
                            icon={<FaCalendar />}
                            title="إحصائيات الشهر"
                            accentFrom="from-slate-500"
                            accentTo="to-slate-700"
                            headerBg="bg-gradient-to-l from-slate-50 via-white to-slate-50/40"
                            headerBorder="border-slate-200/80"
                            headerIcon="text-slate-700"
                            headerText="text-slate-900"
                            data={periodStats.month}
                            fmtMoney={fmtMoney}
                            labels={labels}
                        />
                    </div>

                    {/* ─── THIS YEAR ─── */}
                    {/* السنة: obsidian/dark premium — الـheader كله غامق زي dashboards الـSaaS */}
                    {/* الأيقونة teal مضيئة عشان تتباين مع الخلفية الغامقة (accent على dark) */}
                    <div className="dh-stagger-6 md:col-span-2 xl:col-span-1">
                        <PeriodCard
                            icon={<FaChartLine />}
                            title={`إحصائيات ${currentYear}`}
                            accentFrom="from-slate-700"
                            accentTo="to-slate-900"
                            iconFrom="from-teal-400"
                            iconTo="to-teal-600"
                            headerBg="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900"
                            headerBorder="border-slate-900/60"
                            headerIcon="text-white"
                            headerText="text-white"
                            data={periodStats.year}
                            fmtMoney={fmtMoney}
                            labels={labels}
                        />
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    TODAY'S SCHEDULE
                ═══════════════════════════════════════════ */}
                <div className="dh-stagger-7 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100/80">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-sm">
                                <FaClipboardList className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h2 className="text-sm sm:text-base font-black text-slate-800">جدول مواعيد اليوم</h2>
                        </div>
                        {totalToday > 0 && (
                            <button onClick={() => onNavigate('appointments')} className="group text-[11px] sm:text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 transition-all bg-teal-50 hover:bg-teal-100 rounded-full px-3 py-1.5">
                                إدارة المواعيد<FaArrowLeft className="w-2.5 h-2.5 transition-transform group-hover:-translate-x-0.5" />
                            </button>
                        )}
                    </div>
                    {sortedAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-slate-300">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                <FaCalendarCheck className="w-7 h-7 text-slate-200" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">لا توجد مواعيد محجوزة اليوم</p>
                            <p className="text-[11px] text-slate-300 mt-1">المواعيد الجديدة ستظهر هنا تلقائياً</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50/80">
                            {sortedAppointments.map((appt) => (
                                <AppointmentRow key={appt.id} appointment={appt} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// المكونات الفرعية اتنقلت لملفات مستقلة:
//   - PeriodCard + MiniStat + NetProfitStat → PeriodStatsCard.tsx
//   - NextPatientCard → NextPatientCard.tsx
//   - AppointmentRow → AppointmentRow.tsx
