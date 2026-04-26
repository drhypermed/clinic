// ─────────────────────────────────────────────────────────────────────────────
// TierComparisonTable — جدول مقارنة حي بين الباقات
// ─────────────────────────────────────────────────────────────────────────────
// بيقرأ القيم الفعلية لكل ميزة من إعدادات الأدمن لحظياً، ويعرضها كجدول
// مقارن بين 3 باقات (مجاني / برو / برو ماكس).
//
// لو الأدمن غيّر أي رقم في صفحة "التحكم في أنواع الحساب"، الجدول هنا
// بيتحدّث تلقائياً مع تحديث الصفحة (مفيش hardcoded numbers).
//
// الترتيب: AI features → سعات تخزين → حدود يومية للحفظ → حجوزات.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { LuStar, LuDatabase, LuFileText, LuCalendar, LuLoader, LuTriangleAlert } from 'react-icons/lu';
import {
  getAccountTypeControls,
  type AccountTypeControls,
} from '../../../services/accountTypeControlsService';

type TierKey = 'free' | 'premium' | 'proMax';

type FeatureRow = {
  label: string;
  unit: string; // مثلاً "مرة/يوم" أو "سجل"
  freeKey: keyof AccountTypeControls;
  premiumKey: keyof AccountTypeControls;
  proMaxKey: keyof AccountTypeControls;
};

type FeatureGroup = {
  id: string;
  title: string;
  icon: React.ReactNode;
  rows: FeatureRow[];
};

// ─ تنظيم الميزات في 4 مجموعات منطقية للطبيب ─
const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: 'ai',
    title: 'ميزات الذكاء الاصطناعي (يومياً)',
    icon: <LuStar className="w-4 h-4" />,
    rows: [
      { label: 'تحليل الحالة', unit: 'مرة/يوم',
        freeKey: 'freeDailyLimit', premiumKey: 'premiumDailyLimit', proMaxKey: 'proMaxDailyLimit' },
      { label: 'الترجمة الذكية للروشتة', unit: 'مرة/يوم',
        freeKey: 'freeTranslationDailyLimit', premiumKey: 'premiumTranslationDailyLimit', proMaxKey: 'proMaxTranslationDailyLimit' },
      { label: 'فحص التداخلات الدوائية', unit: 'مرة/يوم',
        freeKey: 'freeInteractionToolDailyLimit', premiumKey: 'premiumInteractionToolDailyLimit', proMaxKey: 'proMaxInteractionToolDailyLimit' },
      { label: 'فحص الدواء أثناء الحمل والرضاعة', unit: 'مرة/يوم',
        freeKey: 'freePregnancyToolDailyLimit', premiumKey: 'premiumPregnancyToolDailyLimit', proMaxKey: 'proMaxPregnancyToolDailyLimit' },
      { label: 'حاسبة جرعات الكلى', unit: 'مرة/يوم',
        freeKey: 'freeRenalToolDailyLimit', premiumKey: 'premiumRenalToolDailyLimit', proMaxKey: 'proMaxRenalToolDailyLimit' },
      { label: 'طباعة تقرير طبي للحالة', unit: 'تقرير/يوم',
        freeKey: 'freeMedicalReportDailyLimit', premiumKey: 'premiumMedicalReportDailyLimit', proMaxKey: 'proMaxMedicalReportDailyLimit' },
    ],
  },
  {
    id: 'capacity',
    title: 'سعات التخزين (حد كلي — يحذف القديم لإضافة جديد)',
    icon: <LuDatabase className="w-4 h-4" />,
    rows: [
      { label: 'حفظ السجلات الطبية', unit: 'سجل',
        freeKey: 'freeRecordsMaxCount', premiumKey: 'premiumRecordsMaxCount', proMaxKey: 'proMaxRecordsMaxCount' },
      { label: 'تخزين الروشتات الجاهزة', unit: 'روشتة',
        freeKey: 'freeReadyPrescriptionsMaxCount', premiumKey: 'premiumReadyPrescriptionsMaxCount', proMaxKey: 'proMaxReadyPrescriptionsMaxCount' },
      { label: 'تخزين الأدوية المعدّلة', unit: 'دواء',
        freeKey: 'freeMedicationCustomizationsMaxCount', premiumKey: 'premiumMedicationCustomizationsMaxCount', proMaxKey: 'proMaxMedicationCustomizationsMaxCount' },
      { label: 'عدد الفروع (إعلان الطبيب)', unit: 'فرع',
        freeKey: 'freeBranchesMaxCount', premiumKey: 'premiumBranchesMaxCount', proMaxKey: 'proMaxBranchesMaxCount' },
      { label: 'شركات التأمين', unit: 'شركة',
        freeKey: 'freeInsuranceCompaniesMaxCount', premiumKey: 'premiumInsuranceCompaniesMaxCount', proMaxKey: 'proMaxInsuranceCompaniesMaxCount' },
    ],
  },
  {
    id: 'daily-actions',
    title: 'إجراءات الروشتة (يومياً)',
    icon: <LuFileText className="w-4 h-4" />,
    rows: [
      { label: 'حفظ روشتة جاهزة', unit: 'روشتة/يوم',
        freeKey: 'freeReadyPrescriptionDailyLimit', premiumKey: 'premiumReadyPrescriptionDailyLimit', proMaxKey: 'proMaxReadyPrescriptionDailyLimit' },
      { label: 'طباعة الروشتة', unit: 'مرة/يوم',
        freeKey: 'freePrescriptionPrintDailyLimit', premiumKey: 'premiumPrescriptionPrintDailyLimit', proMaxKey: 'proMaxPrescriptionPrintDailyLimit' },
      { label: 'تنزيل الروشتة', unit: 'مرة/يوم',
        freeKey: 'freePrescriptionDownloadDailyLimit', premiumKey: 'premiumPrescriptionDownloadDailyLimit', proMaxKey: 'proMaxPrescriptionDownloadDailyLimit' },
      { label: 'إرسال الروشتة عبر واتساب', unit: 'مرة/يوم',
        freeKey: 'freePrescriptionWhatsappDailyLimit', premiumKey: 'premiumPrescriptionWhatsappDailyLimit', proMaxKey: 'proMaxPrescriptionWhatsappDailyLimit' },
    ],
  },
  {
    id: 'bookings',
    title: 'المواعيد والحجوزات (يومياً)',
    icon: <LuCalendar className="w-4 h-4" />,
    rows: [
      { label: 'إضافة الموعد (صفحة المواعيد)', unit: 'موعد/يوم',
        freeKey: 'freePublicBookingDailyLimit', premiumKey: 'premiumPublicBookingDailyLimit', proMaxKey: 'proMaxPublicBookingDailyLimit' },
      { label: 'حجز موعد من فورم الجمهور', unit: 'حجز/يوم',
        freeKey: 'freePublicFormBookingDailyLimit', premiumKey: 'premiumPublicFormBookingDailyLimit', proMaxKey: 'proMaxPublicFormBookingDailyLimit' },
      { label: 'إرسال إلى الطبيب من السكرتارية', unit: 'طلب/يوم',
        freeKey: 'freeSecretaryEntryRequestDailyLimit', premiumKey: 'premiumSecretaryEntryRequestDailyLimit', proMaxKey: 'proMaxSecretaryEntryRequestDailyLimit' },
    ],
  },
];

/** قراءة آمنة لقيمة من الإعدادات — لو غير موجودة بيرجع شرطة */
const getValue = (controls: AccountTypeControls | null, key: keyof AccountTypeControls): string => {
  if (!controls) return '—';
  const value = controls[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('ar-EG').format(value);
  }
  return '—';
};

const TierColumnHeader: React.FC<{ tier: TierKey; label: string }> = ({ tier, label }) => {
  const colorByTier: Record<TierKey, string> = {
    free: 'bg-slate-100 text-slate-700 border-slate-200',
    premium: 'bg-warning-50 text-warning-800 border-warning-200',
    proMax: 'bg-gradient-to-br from-[#FFF8E1] to-[#FFE0B2] text-[#B45309] border-[#FFCC80]',
  };
  return (
    <th className={`text-center text-[11px] sm:text-xs font-black px-2 sm:px-3 py-2.5 border-b-2 ${colorByTier[tier]}`}>
      {label}
    </th>
  );
};

export const TierComparisonTable: React.FC = () => {
  const [controls, setControls] = React.useState<AccountTypeControls | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAccountTypeControls()
      .then((data) => { if (mounted) { setControls(data); setError(null); } })
      .catch((err) => {
        console.warn('[TierComparison] Failed to load controls:', err);
        if (mounted) setError('تعذّر تحميل بيانات الباقات. حاول إعادة فتح الصفحة.');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="my-4 p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3">
        <LuLoader className="w-5 h-5 text-slate-500 animate-spin" />
        <span className="text-sm font-bold text-slate-600">جاري تحميل بيانات الباقات…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl bg-danger-50 border border-danger-200 flex items-start gap-3">
        <LuTriangleAlert className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
        <span className="text-sm font-bold text-danger-800">{error}</span>
      </div>
    );
  }

  return (
    <div className="my-5 space-y-5" dir="rtl">
      {/* تنبيه: الأرقام لحظية من إعدادات الأدمن */}
      <div className="text-[11px] sm:text-xs font-bold text-slate-500 px-1">
        ℹ️ الأرقام دي بتتحدّث تلقائياً مع آخر إعدادات الإدارة.
      </div>

      {FEATURE_GROUPS.map((group) => (
        <div key={group.id} className="rounded-2xl border-2 border-slate-200 overflow-hidden bg-white shadow-sm">
          {/* رأس المجموعة */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-l from-brand-50 to-white border-b border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
              {group.icon}
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900">{group.title}</h4>
          </div>

          {/* جدول الميزات */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-right text-[11px] sm:text-xs font-black text-slate-700 px-3 py-2.5 bg-slate-50 border-b-2 border-slate-200">
                    الميزة
                  </th>
                  <TierColumnHeader tier="free" label="مجاني" />
                  <TierColumnHeader tier="premium" label="برو" />
                  <TierColumnHeader tier="proMax" label="برو ماكس" />
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="text-right text-[12px] sm:text-sm font-semibold text-slate-800 px-3 py-2.5 border-b border-slate-100">
                      {row.label}
                    </td>
                    <td className="text-center text-[12px] sm:text-sm font-black text-slate-800 px-2 sm:px-3 py-2.5 border-b border-slate-100">
                      {getValue(controls, row.freeKey)}
                      <span className="text-[10px] font-bold text-slate-400 mr-1">{row.unit}</span>
                    </td>
                    <td className="text-center text-[12px] sm:text-sm font-black text-warning-800 px-2 sm:px-3 py-2.5 border-b border-slate-100 bg-warning-50/30">
                      {getValue(controls, row.premiumKey)}
                      <span className="text-[10px] font-bold text-warning-600 mr-1">{row.unit}</span>
                    </td>
                    <td className="text-center text-[12px] sm:text-sm font-black text-[#B45309] px-2 sm:px-3 py-2.5 border-b border-slate-100 bg-gradient-to-br from-[#FFF8E1]/40 to-[#FFE0B2]/40">
                      {getValue(controls, row.proMaxKey)}
                      <span className="text-[10px] font-bold text-[#B45309]/70 mr-1">{row.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
