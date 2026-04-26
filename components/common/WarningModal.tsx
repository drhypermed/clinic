/**
 * مكون نافذة التحذير الطبي (Warning Modal)
 * تظهر هذه النافذة عندما يحاول الطبيب إضافة دواء لا يتناسب مع عمر أو وزن المريض.
 * 
 * الميزات:
 * 1. عرض تفصيلي للمشكلة (العمر المطلوب مقابل المكتوب، أو الوزن).
 * 2. تقديم توصية طبية بديلة أو إرشادية.
 * 3. خيار المتابعة على "المسؤولية الطبية" أو الإلغاء.
 * 4. تعطيل الطباعة تلقائياً للنافذة لضمان عدم ظهورها في الروشتة المطبوعة.
 */

import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';

interface WarningModalProps {
  isOpen: boolean; // حالة فتح النافذة
  onClose: () => void; // دالة عند النقر على إلغاء
  onConfirm: () => void; // دالة عند التأكيد والمتابعة
  title: string; // عنوان التحذير (غالباً اسم الدواء)
  warnings: Array<{ // قائمة التحذيرات المحددة
    icon: string; // أيقونة تعبيرية (عمر، وزن، إلخ)
    label: string; // نص التحذير (مثل: فحص ملاءمة العمر)
    expected: string; // النطاق الطبي المطلوب
    actual: string; // القيمة الفعلية للمريض
  }>;
  recommendation: string; // نص التوصية الطبية
}

export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  warnings,
  recommendation
}) => {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      zIndex={200}
      backdropClass="bg-slate-900/70 backdrop-blur-sm"
      noPrint
      animateIn="fade"
      contentClassName="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto animate-slideUp"
    >
      <>
        {/* رأس النافذة التنبيهي */}
        <div className="bg-gradient-to-r from-danger-500 to-danger-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">
              ⚠️
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black mb-0.5">{title}</h2>
              <p className="text-danger-100 text-xs font-bold">يرجى المراجعة قبل المتابعة</p>
            </div>
          </div>
        </div>

        {/* محتوى التحذيرات */}
        <div className="p-4 space-y-3">
          {/* قائمة التحذيرات التفصيلية */}
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div key={idx} className="bg-danger-50 border-2 border-danger-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">{warning.icon}</span>
                  <div className="flex-1">
                    <div className="font-black text-danger-700 text-xs mb-1.5">{warning.label}</div>
                    <div className="space-y-1 text-[11px] font-bold text-danger-600">
                      {/* مقارنة بين النطاق المطلوب والقيمة الحالية */}
                      <div className="flex justify-between items-center bg-white rounded-lg px-2.5 py-1.5 border border-danger-100">
                        <span className="text-slate-500">النطاق المسموح:</span>
                        <span className="text-danger-700">{warning.expected}</span>
                      </div>
                      <div className="flex justify-between items-center bg-danger-100 rounded-lg px-2.5 py-1.5 border border-danger-200">
                        <span className="text-danger-600">القيمة الحالية:</span>
                        <span className="text-danger-800 font-black">{warning.actual}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* التوصية الطبية والبدائل */}
          <div className="bg-warning-50 border-2 border-warning-300 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚕️</span>
              <div className="flex-1">
                <div className="font-black text-warning-800 text-xs mb-1">توصية طبية</div>
                <p className="text-warning-700 text-[11px] font-bold leading-relaxed" dir="rtl">{recommendation}</p>
              </div>
            </div>
          </div>

          {/* عبارة إخلاء المسؤولية */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-center">
            <p className="text-slate-700 font-black text-xs">
              هل تريد الاستمرار وإضافة الدواء <span className="text-danger-600">على مسؤوليتك الطبية</span>؟
            </p>
          </div>
        </div>

        {/* أزرار اتخاذ القرار */}
        <div className="bg-slate-50 p-3 flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 bg-danger-600 hover:bg-danger-700 text-white font-black py-2.5 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">نعم، أضف على مسؤوليتي</span>
            </div>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-black py-2.5 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">إلغاء واختيار بديل</span>
            </div>
          </button>
        </div>
      </>
    </ModalOverlay>
  );
};
