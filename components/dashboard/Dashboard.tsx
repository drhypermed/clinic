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
            {/* خلفية بريميوم — قاعدة شبه بيضاء بـtint أزرق فاتح */}
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-50/70 via-white to-emerald-50/40 pointer-events-none" />
            {/* دائرة أزرق متدرج (blue-only) في الزاوية العلوية */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/30 via-blue-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            {/* دائرة أخضر متدرج (green-only) في الزاوية السفلية — منفصلة تماماً عن الأزرق */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-emerald-300/30 via-emerald-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />

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
                    HEADER — كرت ترحيب بخلفية صلبة (مش شفاف عشان الكلام يبان)
                ═══════════════════════════════════════════ */}
                <div className="dh-stagger-1 relative rounded-2xl p-4 sm:p-5 bg-white border border-blue-200 shadow-[0_2px_8px_rgba(37,99,235,0.08),0_8px_24px_-6px_rgba(37,99,235,0.12)]">
                    {/* طبقة لون داخلية خفيفة جداً (decoration بس، مش بتأثر على قراءة الكلام) */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-bl from-blue-50/60 via-transparent to-blue-50/40 pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                {/* اسم الطبيب: تدرج أزرق فقط (blue-700 → blue-500) */}
                                {greeting}{displayName ? <> يا <span className="bg-gradient-to-l from-blue-700 via-blue-600 to-blue-500 bg-clip-text text-transparent">{displayName}</span></> : ''}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-slate-600 text-[11px] sm:text-xs font-medium">
                                {/* بادج الوقت: خلفية صلبة (مش شفافة) */}
                                <div className="flex items-center gap-1.5 bg-blue-100 rounded-full px-2.5 py-1 border border-blue-300">
                                    <FaClock className="w-2.5 h-2.5 text-blue-700 shrink-0" />
                                    <span className="font-numeric font-bold text-blue-900">{timeStr}</span>
                                </div>
                                <span className="text-blue-400 hidden sm:inline">|</span>
                                <span className="hidden sm:inline text-slate-700">{dateStr}</span>
                            </div>
                        </div>
                        {/* زر كشف جديد — أزرق متدرج (نفس عائلة الـsidebar) */}
                        <button
                            onClick={onStartNewExam}
                            className="group flex items-center gap-2 bg-gradient-to-l from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:via-blue-700 hover:to-blue-600 active:from-blue-900 active:via-blue-800 active:to-blue-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45)] hover:shadow-[0_8px_22px_-4px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-100 transition-all duration-200 shrink-0"
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
                    /* كرت "تم الانتهاء" — أخضر متدرج بخلفية صلبة (إنجاز/نجاح) */
                    <div className="dh-stagger-2 bg-gradient-to-bl from-emerald-100 via-emerald-50 to-emerald-100 border border-emerald-300 rounded-2xl p-5 sm:p-6 text-center shadow-[0_2px_8px_-2px_rgba(5,150,105,0.2)]">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-[0_6px_16px_-2px_rgba(5,150,105,0.5)]">
                            <FaCircleCheck className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-base sm:text-lg font-black text-emerald-900">تم الانتهاء من جميع المواعيد</p>
                        <p className="text-xs text-emerald-800 font-medium mt-1">تم كشف {completedCount} {completedCount === 1 ? 'مريض' : 'مرضى'} اليوم</p>
                    </div>
                ) : null}

                {/* ═══════════════════════════════════════════
                    TODAY'S PROGRESS — خلفية صلبة + بادجات صلبة (تباين عالي)
                ═══════════════════════════════════════════ */}
                <div className="dh-stagger-3 bg-white rounded-2xl border border-blue-200 shadow-[0_2px_8px_rgba(37,99,235,0.08),0_8px_24px_-6px_rgba(37,99,235,0.10)] p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_2px_6px_-1px_rgba(37,99,235,0.4)]">
                                <FaChartLine className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-blue-900">تقدم اليوم</span>
                        </div>
                        {/* بادج صلب */}
                        <div className="bg-blue-100 rounded-full px-3 py-1 border border-blue-300">
                            <span className="text-[11px] sm:text-xs font-black text-blue-900 font-numeric">{completedCount} / {totalToday}</span>
                        </div>
                    </div>
                    {/* قاعدة الشريط: صلبة (مش شفافة) */}
                    <div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
                        {/* الشريط نفسه: أخضر متدرج (إنجاز) */}
                        <div className="h-full bg-gradient-to-l from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out dh-progress-glow" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-[10px] sm:text-[11px] font-bold">
                        {/* بادجات صلبة (عشان الكلام يبان واضح) */}
                        <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full px-2.5 py-1"><FaCircleCheck className="w-2.5 h-2.5" />تم: {completedCount}</span>
                        <span className="flex items-center gap-1.5 text-amber-800 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-1"><FaHourglassHalf className="w-2.5 h-2.5" />متبقي: {pendingCount}</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    STATS GRID — اليوم/الشهر/السنة
                    قاعدة بصرية: اليوم = أزرق متدرج فقط، الشهر = أخضر متدرج فقط،
                    السنة = أزرق غامق premium dark (blue-only)
                ═══════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

                    {/* ─── TODAY — أزرق متدرج بخلفية صلبة ─── */}
                    <div className="dh-stagger-4">
                        <PeriodCard
                            icon={<FaCalendarDay />}
                            title="إحصائيات اليوم"
                            accentFrom="from-blue-500"
                            accentTo="to-blue-700"
                            headerBg="bg-gradient-to-l from-blue-50 via-blue-50 to-blue-100"
                            headerBorder="border-blue-200"
                            headerIcon="text-blue-700"
                            headerText="text-blue-900"
                            data={periodStats.today}
                            fmtMoney={fmtMoney}
                            labels={labels}
                        />
                    </div>

                    {/* ─── THIS MONTH — أخضر متدرج بخلفية صلبة ─── */}
                    <div className="dh-stagger-5">
                        <PeriodCard
                            icon={<FaCalendar />}
                            title="إحصائيات الشهر"
                            accentFrom="from-emerald-500"
                            accentTo="to-emerald-700"
                            headerBg="bg-gradient-to-l from-emerald-50 via-emerald-50 to-emerald-100"
                            headerBorder="border-emerald-200"
                            headerIcon="text-emerald-700"
                            headerText="text-emerald-900"
                            data={periodStats.month}
                            fmtMoney={fmtMoney}
                            labels={labels}
                        />
                    </div>

                    {/* ─── THIS YEAR — أزرق غامق premium dark ─── */}
                    <div className="dh-stagger-6 md:col-span-2 xl:col-span-1">
                        <PeriodCard
                            icon={<FaChartLine />}
                            title={`إحصائيات ${currentYear}`}
                            accentFrom="from-blue-800"
                            accentTo="to-blue-950"
                            iconFrom="from-blue-400"
                            iconTo="to-blue-600"
                            headerBg="bg-gradient-to-l from-blue-950 via-blue-900 to-blue-950"
                            headerBorder="border-blue-950"
                            headerIcon="text-white"
                            headerText="text-white"
                            data={periodStats.year}
                            fmtMoney={fmtMoney}
                            labels={labels}
                        />
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    TODAY'S SCHEDULE — خلفية صلبة بـheader واضح
                ═══════════════════════════════════════════ */}
                <div className="dh-stagger-7 bg-white rounded-2xl border border-blue-200 shadow-[0_2px_8px_rgba(37,99,235,0.08),0_8px_24px_-6px_rgba(37,99,235,0.10)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-blue-200 bg-gradient-to-l from-blue-50 via-blue-50 to-blue-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_2px_6px_-1px_rgba(37,99,235,0.4)]">
                                <FaClipboardList className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h2 className="text-sm sm:text-base font-black text-blue-900">جدول مواعيد اليوم</h2>
                        </div>
                        {totalToday > 0 && (
                            <button onClick={() => onNavigate('appointments')} className="group text-[11px] sm:text-xs text-blue-800 hover:text-blue-900 font-bold flex items-center gap-1 transition-all bg-white hover:bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5">
                                إدارة المواعيد<FaArrowLeft className="w-2.5 h-2.5 transition-transform group-hover:-translate-x-0.5" />
                            </button>
                        )}
                    </div>
                    {sortedAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14">
                            {/* الحالة الفارغة: ألوان واضحة بدل الباهت */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center mb-4">
                                <FaCalendarCheck className="w-7 h-7 text-blue-400" />
                            </div>
                            <p className="text-sm font-bold text-blue-800">لا توجد مواعيد محجوزة اليوم</p>
                            <p className="text-[11px] text-blue-600 mt-1">المواعيد الجديدة ستظهر هنا تلقائياً</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-blue-100">
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
