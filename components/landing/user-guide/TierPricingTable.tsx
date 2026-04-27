// ─────────────────────────────────────────────────────────────────────────────
// TierPricingTable — جدول أسعار الباقات الحي
// ─────────────────────────────────────────────────────────────────────────────
// بيقرأ أسعار الاشتراكات الفعلية من Firestore (نفس الأسعار اللي الأدمن
// بيحطها في صفحة "الإحصائيات المالية"). بيعرضها كجدول واضح لـ:
//   • باقة برو       (شهري / 6 شهور / سنوي)
//   • باقة برو ماكس  (شهري / 6 شهور / سنوي)
//
// الأسعار محفوظة شهرياً في `subscriptionPrices/{YYYY-MM}`. لو الشهر الحالي
// لسه ما اتسجلش له أسعار، بنرجع لأقرب شهر سابق فيه أسعار (حتى 12 شهر للخلف).
//
// الباقة المجانية مش في الجدول لأنها بدون اشتراك (الأرقام والحدود ظاهرة في
// جدول مقارنة الميزات اللي قبله).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { doc } from 'firebase/firestore';
import { LuLoader, LuTriangleAlert, LuCrown, LuTag, LuInfo } from 'react-icons/lu';
import { db } from '../../../services/firebaseConfig';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { getCairoDateParts } from '../../../utils/cairoTime';

// شكل الأسعار في Firestore
type Prices = { monthly: number; sixMonths: number; yearly: number };
type PricingDoc = Prices & { proMaxPrices?: Prices };

// كم شهر للخلف نبحث لو الشهر الحالي فاضي (1 سنة).
const MAX_FALLBACK_MONTHS = 12;

// تحويل (YYYY, MM) لـ key زي "2026-04"
const formatMonthKey = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}`;

// رجوع شهر واحد للخلف (يعدّل السنة لو لازم)
const previousMonth = (year: number, month: number): { year: number; month: number } => {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
};

// تحقّق إن السعر صالح للعرض (موجود وأكبر من صفر)
const hasValidPrice = (prices?: Prices): boolean =>
  !!prices && (prices.monthly > 0 || prices.sixMonths > 0 || prices.yearly > 0);

// تنسيق رقم بالعربي مع فاصلة الآلاف
const formatPrice = (n: number): string => new Intl.NumberFormat('ar-EG').format(n);

// حساب نسبة التوفير مقارنة بالسعر الشهري × عدد الشهور (لباقات 6 شهور والسنوي).
// لو السعر الشهري صفر، مفيش حساب — نرجع null.
const computeSavingsPercent = (totalPrice: number, monthlyPrice: number, monthsCount: number): number | null => {
  if (!monthlyPrice || !totalPrice || !monthsCount) return null;
  const fullPrice = monthlyPrice * monthsCount;
  if (fullPrice <= totalPrice) return null;
  const saved = ((fullPrice - totalPrice) / fullPrice) * 100;
  return Math.round(saved);
};

// كرت سعر واحد (مدة من المدد الـ3) داخل عمود باقة
const PriceCell: React.FC<{
  label: string;
  price: number;
  monthlyPrice: number;
  monthsCount: number;
  variant: 'pro' | 'proMax';
}> = ({ label, price, monthlyPrice, monthsCount, variant }) => {
  const savings = monthsCount > 1 ? computeSavingsPercent(price, monthlyPrice, monthsCount) : null;
  // لون النص الأساسي للسعر — برتقالي للبرو، ذهبي للبرو ماكس
  const priceTextColor = variant === 'proMax' ? 'text-[#B45309]' : 'text-warning-700';
  // لون خلفية الكرت الداخلي
  const cellBg = variant === 'proMax'
    ? 'bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] border-[#FFE082]'
    : 'bg-warning-50/60 border-warning-100';

  return (
    <div className={`rounded-xl border p-3 sm:p-4 text-center ${cellBg} min-w-0`}>
      <p className="text-[11px] sm:text-xs font-black text-slate-600 mb-1.5">{label}</p>
      {price > 0 ? (
        <>
          <p className={`text-lg sm:text-2xl font-black ${priceTextColor} leading-tight`}>
            {formatPrice(price)}
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 mr-1">ج.م</span>
          </p>
          {savings !== null && (
            <p className="text-[10px] sm:text-[11px] font-black text-success-700 mt-1.5 inline-flex items-center gap-1 bg-success-50 px-2 py-0.5 rounded-full border border-success-200">
              <LuTag className="w-2.5 h-2.5" />
              توفير {formatPrice(savings)}%
            </p>
          )}
        </>
      ) : (
        <p className="text-xs sm:text-sm font-bold text-slate-400">—</p>
      )}
    </div>
  );
};

// عمود باقة كاملة (3 مدد)
const TierColumn: React.FC<{
  title: string;
  subtitle: string;
  prices: Prices;
  variant: 'pro' | 'proMax';
}> = ({ title, subtitle, prices, variant }) => {
  // ستايل ترويسة العمود — يتغير حسب الباقة
  const headerBg = variant === 'proMax'
    ? 'bg-gradient-to-l from-[#FFE082] via-[#FFD54F] to-[#FFB300] text-[#7A4F01]'
    : 'bg-gradient-to-l from-warning-100 to-warning-200 text-warning-900';

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
      <div className={`flex items-center justify-center gap-2 px-3 py-3 ${headerBg}`}>
        <LuCrown className="w-4 h-4 shrink-0" />
        <div className="text-center min-w-0">
          <h4 className="text-sm sm:text-base font-black truncate">{title}</h4>
          <p className="text-[10px] sm:text-[11px] font-bold opacity-80 truncate">{subtitle}</p>
        </div>
      </div>
      <div className="p-2.5 sm:p-3 grid grid-cols-1 gap-2.5 sm:gap-3">
        <PriceCell label="اشتراك شهري"  price={prices.monthly}   monthlyPrice={prices.monthly} monthsCount={1}  variant={variant} />
        <PriceCell label="اشتراك 6 شهور" price={prices.sixMonths} monthlyPrice={prices.monthly} monthsCount={6}  variant={variant} />
        <PriceCell label="اشتراك سنوي"   price={prices.yearly}    monthlyPrice={prices.monthly} monthsCount={12} variant={variant} />
      </div>
    </div>
  );
};

export const TierPricingTable: React.FC = () => {
  const [proPrices, setProPrices] = React.useState<Prices | null>(null);
  const [proMaxPrices, setProMaxPrices] = React.useState<Prices | null>(null);
  // الشهر اللي ظهرت منه الأسعار (للعرض في تحت الجدول لو مش الشهر الحالي)
  const [pricesMonth, setPricesMonth] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadPrices = async () => {
      // نبدأ من الشهر الحالي بتوقيت القاهرة، ونرجع للخلف لو الشهر فاضي
      const cairoNow = getCairoDateParts(new Date());
      let { year, month } = { year: cairoNow.year, month: cairoNow.month };

      try {
        for (let attempt = 0; attempt < MAX_FALLBACK_MONTHS; attempt += 1) {
          const monthKey = formatMonthKey(year, month);
          const snap = await getDocCacheFirst(doc(db, 'subscriptionPrices', monthKey));
          if (snap.exists()) {
            const data = snap.data() as PricingDoc;
            const pro: Prices = {
              monthly: Number(data.monthly) || 0,
              sixMonths: Number(data.sixMonths) || 0,
              yearly: Number(data.yearly) || 0,
            };
            const proMaxRaw = data.proMaxPrices;
            const proMax: Prices = {
              monthly: Number(proMaxRaw?.monthly) || 0,
              sixMonths: Number(proMaxRaw?.sixMonths) || 0,
              yearly: Number(proMaxRaw?.yearly) || 0,
            };
            // لو الباقة برو فيها أي سعر صالح، اعتمد الشهر ده
            if (hasValidPrice(pro) || hasValidPrice(proMax)) {
              if (!mounted) return;
              setProPrices(pro);
              setProMaxPrices(proMax);
              setPricesMonth(monthKey);
              return;
            }
          }
          // نرجع شهر للخلف
          ({ year, month } = previousMonth(year, month));
        }
        // مفيش شهر فيه أسعار خلال آخر سنة
        if (!mounted) return;
        setError('لسه ما تم تحديد أسعار الاشتراكات. تواصل عبر الواتساب لمعرفة العروض الحالية.');
      } catch (err) {
        console.warn('[TierPricing] Failed to load prices:', err);
        if (!mounted) return;
        setError('تعذّر تحميل الأسعار الآن. حاول إعادة فتح الصفحة.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPrices();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="my-4 p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3">
        <LuLoader className="w-5 h-5 text-slate-500 animate-spin" />
        <span className="text-sm font-bold text-slate-600">جاري تحميل الأسعار…</span>
      </div>
    );
  }

  if (error || !proPrices || !proMaxPrices) {
    return (
      <div className="my-4 p-4 rounded-xl bg-warning-50 border border-warning-200 flex items-start gap-3">
        <LuTriangleAlert className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
        <span className="text-sm font-bold text-warning-800">
          {error || 'الأسعار مش متاحة حالياً.'}
        </span>
      </div>
    );
  }

  // تنسيق الشهر للعرض (مثلاً "أبريل 2026")
  const monthLabel = pricesMonth
    ? new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long' })
        .format(new Date(`${pricesMonth}-01T12:00:00`))
    : '';

  return (
    <div className="my-5 space-y-3" dir="rtl">
      {/* تنبيه: الأسعار من إعدادات الأدمن */}
      <div className="text-[11px] sm:text-xs font-bold text-slate-500 px-1 inline-flex items-center gap-1.5">
        <LuInfo className="w-3.5 h-3.5 shrink-0" />
        أسعار شهر {monthLabel} — بتتحدّث تلقائياً مع آخر إعدادات الإدارة.
      </div>

      {/* عمودين: برو + برو ماكس. على الموبايل عمود واحد تحت التاني */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <TierColumn
          title="باقة برو"
          subtitle="الفئة المدفوعة الأساسية"
          prices={proPrices}
          variant="pro"
        />
        <TierColumn
          title="باقة برو ماكس"
          subtitle="الفئة الأعلى — حدود أوسع"
          prices={proMaxPrices}
          variant="proMax"
        />
      </div>

      {/* ملاحظة عن التوفير */}
      <p className="text-[11px] sm:text-xs font-bold text-slate-500 px-1 leading-relaxed">
        * نسبة التوفير محسوبة مقارنةً بسعر الاشتراك الشهري مضروب في عدد الشهور.
        كل ما تختار مدّة أطول، السعر الإجمالي بيقل.
      </p>
    </div>
  );
};
