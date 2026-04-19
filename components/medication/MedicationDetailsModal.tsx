import React, { useState, useMemo, Suspense } from 'react';
import { Medication } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useMedications } from '../../hooks/medications';
import { sanitizeDosageText } from '../../utils/rx/rxUtils';
import { LoadingStateScreen } from '../app/LoadingStateScreen';

const MedicationEditModal = React.lazy(() =>
  import('./MedicationEditModal').then((m) => ({ default: m.MedicationEditModal }))
);

/**
 * مكون نافذة تفاصيل الدواء (Medication Details Modal)
 * يعرض هذا المكون معلومات شاملة عن الدواء المختار، بما في ذلك:
 * 1. حساب الجرعة المناسبة فورياً بناءً على وزن وعمر المريض الحاليين.
 * 2. عرض السعر، التصنيف، والاسم العلمي.
 * 3. عرض التعليمات والتحذيرات الطبية.
 * 4. إتاحة خيار "تعديل المعلومات" للطبيب (فقط إذا كان مسجلاً للدخول).
 */

interface MedicationDetailsModalProps {
  medication: Medication | null;    // الدواء المراد عرض تفاصيله
  onClose: () => void;              // دالة إغلاق النافذة
  weight: string;                   // وزن المريض الحالي (يستخدم لحساب الجرعة)
  totalAgeInMonths: number;         // عمر المريض بالشهور (يستخدم لحساب الجرعة)
}

export const MedicationDetailsModal: React.FC<MedicationDetailsModalProps> = ({
  medication: initialMedication,
  onClose,
  weight,
  totalAgeInMonths
}) => {
  const { user } = useAuth();
  
  // جلب قائمة الأدوية (التي قد تحتوي على تخصيصات الطبيب الحالية)
  const medications = useMedications();
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * دمج البيانات (Data Merging):
   * نبحث عن الدواء في قائمة "الأدوية المحدثة" (التي تشمل تعديلات الطبيب من Firestore).
   * إذا لم نجدها، نستخدم البيانات الأساسية من ملف الثوابت المحلي.
   */
  const medication = useMemo(() => {
    if (!initialMedication) return null;

    // البحث في الأدوية المخصصة أولاً
    const customized = medications.find(m => m.id === initialMedication.id);
    if (customized) return customized;

    // إذا لم يوجد تخصيص بعد، نرجع للدواء القادم من الـ props
    return initialMedication;
  }, [initialMedication?.id, medications, refreshKey]);

  if (!medication) return null;

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    /**
     * عند حفظ التعديلات، نقوم بتحديث refreshKey لإجبار useMemo على إعادة 
     * حساب بيانات الدواء وجلب النسخة الجديدة من useMedications.
     */
    setRefreshKey(prev => prev + 1);
  };

  /** معالجة عرض تعليمات التحضير (تصفية النصوص المتكررة) */
  const displayInstructions = (text?: string) => {
    const t = (text ?? '').toString().trim();
    if (!t) return '';
    // إخفاء النصوص التي تبدأ بكلمات معينة إذا كانت زائدة
    if (t.startsWith('طريقة التحضير') || t.startsWith('تحضير ')) return '';
    return t;
  };

  /** تنسيق العمر للعرض النصي (مثلاً: 2 سنة، 6 شهر) */
  const formatAge = (months?: number) => {
    if (!Number.isFinite(months) || (months ?? 0) <= 0) return 'غير محدد';
    if ((months || 0) < 12) return `${months} شهر`;
    return `${Math.floor((months || 0) / 12)} سنة`;
  };

  /**
   * حساب الجرعة المعتمدة (Calculated Dosage):
   * تستخدم هذه الدالة نفس القواعد البرمجية المستخدمة في توليد الروشتة النهائية.
   * يتم تمرير الوزن والعمر لحل الدوال الحسابية (Calculation Rules) المرتبطة بكل دواء.
   */
  const getDosageText = () => {
    const safeWeight = parseFloat(weight) || 0;

    // حساب الجرعة الخام بناءً على القاعدة (إذا كانت دالة) أو القيمة الثابتة
    const raw = typeof medication.calculationRule === 'function'
      ? medication.calculationRule(safeWeight, totalAgeInMonths)
      : (medication as any).dosage;

    // تنظيف وتطهير النص الناتج (إزالة الفواصل الزائدة، تنسيق الوحدات)
    return sanitizeDosageText(raw);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn no-print"
      onMouseDown={(e) => {
        // إغلاق النافذة عند النقر خارج المحتوى الأبيض
        if (!showEditModal && e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
      onClick={(e) => {
        if (!showEditModal && e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-[28px] shadow-[0_25px_70px_-30px_rgba(0,0,0,0.65)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ترويسة النافذة (Header) - تحتوي على الاسم والاسم العلمي والتصنيف */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-5 flex justify-between items-start border-b border-slate-700">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black tracking-tight leading-tight">{medication.name}</h3>
            <p className="text-[11px] text-emerald-200 font-semibold uppercase tracking-[0.2em] opacity-90">{medication.genericName}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-full border border-white/10">{medication.form}</span>
              <span className="text-[10px] font-black bg-emerald-500/15 px-2 py-1 rounded-full border border-emerald-400/30 text-emerald-100">{medication.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all active:scale-90 border border-white/15">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* محتوى النافذة (Body) */}
        <div className="p-7 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50">
          {/* قسم بطاقات المعلومات السريعة (السعر، العمر الآمن، الوزن) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">السعر التقريبي</div>
              <div className="text-xl font-black text-emerald-600">{medication.price} <span className="text-[10px]">EGP</span></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">نقطة العمر الآمنة</div>
              <div className="text-sm font-black text-blue-600">{formatAge(medication.minAgeMonths)}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">الوزن المسموح</div>
              <div className="text-sm font-black text-slate-800">{medication.minWeight} - {medication.maxWeight} كجم</div>
            </div>
          </div>

          {/* قسم الجرعة المحسوبة - يتأثر بوزن المريض المدخل في شاشة الفحص */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_45%)]" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="flex-1">
                <div className="text-[11px] uppercase text-emerald-200 font-black tracking-[0.2em] mb-1">الجرعة المعتمدة</div>
                <div className="text-xl font-black leading-tight mb-2">{getDosageText()}</div>
                <p className="text-[12px] text-emerald-100 font-semibold">للحساب الدقيق أدخل الوزن والعمر وسيتم تحديث الجرعة أوتوماتيكياً.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* دواعي الاستعمال والتوقيت */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">دواعي الاستعمال</div>
              <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-line">{medication.usage}</p>
              <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">التوقيت</div>
              <p className="text-sm font-bold text-slate-700">{medication.timing || 'حسب تعليمات الطبيب'}</p>
              <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">التصنيف</div>
              <p className="text-sm font-bold text-slate-700">{medication.category || 'غير محدد'}</p>
            </div>
            {/* تعليمات خاصة وتحذيرات */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">تعليمات هامة</div>
              <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">{displayInstructions(medication.instructions) || 'لا توجد تعليمات خاصة.'}</p>
              {medication.warnings && medication.warnings.length > 0 && (
                <div className="mt-3 space-y-2">
                  {medication.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-amber-800 text-xs font-bold">
                      <span className="text-sm">⚠️</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* أزرار التحكم (Footer) */}
        <div className="p-5 bg-white border-t border-slate-100 flex justify-between">
          {user && (
            <button
              onClick={handleEdit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل المعلومات
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
      
      {/* نافذة التعديل (تظهر عند النقر على "تعديل المعلومات") */}
      {showEditModal && (
        <Suspense fallback={<div className="fixed inset-0 z-[9999]"><LoadingStateScreen message="جاري التحميل" /></div>}>
          <MedicationEditModal
            key={`edit-${medication.id}-${refreshKey}`}
            medication={medication}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditSave}
          />
        </Suspense>
      )}
    </div>
  );
};
