import React from 'react';
import { createPortal } from 'react-dom';

/**
 * نافذة حفظ الروشتة الجاهزة (Save Ready Prescription Modal)
 * تظهر هذه النافذة عندما يقرر الطبيب حفظ الكشف الحالي كـ "قالب" (Template) لاستخدامه مستقبلاً.
 * يطلب من الطبيب إدخال اسم للقالب (غالباً ما يكون اسم التشخيص) لسهولة البحث عنه لاحقاً.
 */

interface SaveReadyPrescriptionModalProps {
  isOpen: boolean;                // حالة فتح النافذة
  isClosing: boolean;             // حالة الإغلاق (للأنيميشن)
  isSaving: boolean;              // حالة الحفظ (لتعطيل الأزرار أثناء المعالجة)
  readyPrescriptionName: string;  // الاسم المقترح للروشتة
  onNameChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const SaveReadyPrescriptionModal: React.FC<SaveReadyPrescriptionModalProps> = ({
  isOpen,
  isClosing,
  isSaving,
  readyPrescriptionName,
  onNameChange,
  onClose,
  onConfirm,
}) => {
  // لا يتم العرض إذا كانت مغلقة
  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[10030] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={() => {
        // منع الإغلاق العرضي أثناء الحفظ
        if (!isSaving) onClose();
      }}
    >
      <div
        className={`w-full max-w-md my-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-2">حفظ الروشتة الجاهزة</h3>
        <p className="text-sm font-bold text-slate-600 mb-4 leading-relaxed">
          ادخل اسم التشخيص أو عنواناً مميزاً ليتم حفظ الروشتة به في قائمة "الروشتات الجاهزة".
        </p>

        {/* حقل إدخال الاسم مع التركيز التلقائي */}
        <input
          autoFocus
          value={readyPrescriptionName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onConfirm();
            }
          }}
          placeholder="مثال: نزلة شعبية حادة"
          className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:border-slate-500"
        />

        {/* أزرار الإجراءات */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold disabled:opacity-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving || !readyPrescriptionName.trim()}
            className="px-4 py-2 rounded-xl bg-slate-600 text-white text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'جاري الحفظ' : 'حفظ الروشتة'}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modalContent;
  return createPortal(modalContent, document.body);
};
