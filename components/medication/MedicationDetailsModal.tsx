import React, { useState, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9990] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn no-print"
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92dvh] sm:my-auto border border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ترويسة النافذة (Header) - تحتوي على الاسم والاسم العلمي والتصنيف */}
        <div className="bg-white px-5 sm:px-6 py-4 flex justify-between items-start gap-3 border-b border-slate-200">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-success-50 text-success-600 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-tight text-slate-900 truncate">{medication.name}</h3>
            </div>
            {medication.genericName && (
              <p className="text-xs text-slate-500 font-semibold pr-10 truncate">{medication.genericName}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1 pr-10">
              {medication.form && (
                <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{medication.form}</span>
              )}
              {medication.category && (
                <span className="text-[11px] font-bold bg-success-50 text-success-700 px-2 py-0.5 rounded-full border border-success-100">{medication.category}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-colors active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* محتوى النافذة (Body) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar bg-slate-50">
          {/* قسم بطاقات المعلومات السريعة (السعر، العمر الآمن، الوزن) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">السعر</div>
              <div className="text-base sm:text-lg font-bold text-success-600">{medication.price} <span className="text-[10px] font-semibold text-slate-500">EGP</span></div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">العمر الآمن</div>
              <div className="text-sm font-bold text-slate-800">{formatAge(medication.minAgeMonths)}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">الوزن المسموح</div>
              <div className="text-sm font-bold text-slate-800">{medication.minWeight} - {medication.maxWeight} <span className="text-[10px] font-semibold text-slate-500">كجم</span></div>
            </div>
          </div>

          {/* قسم الجرعة المحسوبة - يتأثر بوزن المريض المدخل في شاشة الفحص */}
          <div className="bg-white border border-success-200 rounded-xl overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="bg-success-50 p-2.5 rounded-lg shrink-0">
                <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase text-success-700 font-bold tracking-wider mb-1">الجرعة المعتمدة</div>
                <div className="text-base sm:text-lg font-bold leading-snug text-slate-900 mb-1.5 break-words">{getDosageText()}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">للحساب الدقيق أدخل الوزن والعمر في شاشة الفحص وسيتم تحديث الجرعة أوتوماتيكياً.</p>
              </div>
            </div>
          </div>

          {/* دواعي الاستعمال */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">دواعي الاستعمال</div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{medication.usage || 'غير محدد'}</p>
          </div>

          {/* التوقيت والتصنيف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">التوقيت</div>
              <p className="text-sm text-slate-800 leading-relaxed">{medication.timing || 'حسب تعليمات الطبيب'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">التصنيف</div>
              <p className="text-sm text-slate-800 leading-relaxed">{medication.category || 'غير محدد'}</p>
            </div>
          </div>

          {/* تعليمات هامة */}
          {displayInstructions(medication.instructions) && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">تعليمات هامة</div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{displayInstructions(medication.instructions)}</p>
            </div>
          )}

          {/* تحذيرات */}
          {medication.warnings && medication.warnings.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-warning-200">
              <div className="text-[10px] font-bold text-warning-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                تحذيرات
              </div>
              <ul className="space-y-1.5">
                {medication.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-800 leading-relaxed">
                    <span className="text-warning-500 mt-0.5 shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* أزرار التحكم (Footer) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm"
          >
            إغلاق
          </button>
          {user && (
            <button
              onClick={handleEdit}
              className="w-full sm:w-auto bg-success-600 hover:bg-success-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل المعلومات
            </button>
          )}
        </div>
      </div>
      
      {/* نافذة التعديل (تظهر عند النقر على "تعديل المعلومات") */}
      {showEditModal && (
        <Suspense fallback={<div className="fixed inset-0 z-[10002]"><LoadingStateScreen message="جاري التحميل" /></div>}>
          <MedicationEditModal
            key={`edit-${medication.id}-${refreshKey}`}
            medication={medication}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditSave}
          />
        </Suspense>
      )}
    </div>,
    document.body
  );
};
