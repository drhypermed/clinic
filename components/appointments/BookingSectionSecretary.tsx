import React from 'react';
import type {
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../types';
import { isSecretaryFieldEnabled } from '../../utils/secretaryVitals';
import { useCopyFeedback } from '../../hooks/useCopyFeedback';

/**
 * الملف: BookingSectionSecretary.tsx
 * الوصف: مكون التحكم في "إعدادات السكرتارية". 
 * يوفر للطبيب واجهة لضبط: 
 * - عنوان صفحة السكرتير (التي تظهر للسكرتارية عند الدخول). 
 * - كلمة مرور السكرتارية (التي تضمن عدم دخول أي شخص غير مفوض). 
 * يتميز بتنبيهات فورية عند نجاح الحفظ لضمان تأكد الطبيب من تطبيق الإعدادات.
 */
interface BookingSectionSecretaryProps {
  isOpen: boolean;                      // حالة فتح/غلق القسم
  onToggleOpen: () => void;
  doctorEmail?: string | null;
  /** اسم الفرع الحالي — يظهر لتوضيح أن كلمة السر مرتبطة بهذا الفرع */
  currentBranchLabel?: string;
  /** هل الدكتور عنده أكثر من فرع (يفعّل لافتة توضيحية) */
  hasMultipleBranches?: boolean;
  bookingFormTitle: string;             // الاسم الذي سيظهر للسكرتيرة في تطبيقها
  onBookingFormTitleChange: (value: string) => void;
  secretaryPassword: string;            // كلمة المرور المطلوبة لدخول السكرتارية
  onSecretaryPasswordChange: (value: string) => void;
  secretaryVitalFields: SecretaryVitalFieldDefinition[];
  secretaryVitalsVisibility: SecretaryVitalsVisibility;
  onSecretaryVitalVisibilityChange: (fieldId: string, enabled: boolean) => void;
  credentialsSaving: boolean;           // جاري حفظ التعديلات
  credentialsError: string | null;
  credentialsSuccess?: boolean;
  onSaveCredentials: (e: React.FormEvent) => void; // وظيفة الحفظ
  alwaysExpanded?: boolean;             // عرض مباشر بدون زر طي/فتح (عند استخدامها كصفحة مستقلة)
}

export const BookingSectionSecretary: React.FC<BookingSectionSecretaryProps> = ({
  isOpen, onToggleOpen,
  doctorEmail,
  currentBranchLabel,
  hasMultipleBranches = false,
  bookingFormTitle, onBookingFormTitleChange, secretaryPassword,
  secretaryVitalFields,
  secretaryVitalsVisibility, onSecretaryVitalVisibilityChange,
  onSecretaryPasswordChange, credentialsSaving, credentialsError,
  credentialsSuccess, onSaveCredentials, alwaysExpanded = false,
}) => {
  const normalizedDoctorEmail = String(doctorEmail || '').trim().toLowerCase();
  const { copied: doctorEmailCopied, copy: copyEmailToClipboard } = useCopyFeedback({ resetMs: 1800 });
  const sortedSecretaryFields = [...(secretaryVitalFields || [])].sort((left, right) => left.order - right.order);
  const enabledVitalsCount = sortedSecretaryFields.filter((field) =>
    isSecretaryFieldEnabled(secretaryVitalsVisibility, field.id, field.key)
  ).length;
  const allVitalsEnabled =
    sortedSecretaryFields.length > 0 &&
    enabledVitalsCount === sortedSecretaryFields.length;

  const toggleAllVitals = () => {
    const nextEnabled = !allVitalsEnabled;
    sortedSecretaryFields.forEach((field) => {
      const isFieldEnabled = isSecretaryFieldEnabled(secretaryVitalsVisibility, field.id, field.key);
      if (isFieldEnabled !== nextEnabled) {
        onSecretaryVitalVisibilityChange(field.id, nextEnabled);
      }
    });
  };

  const copyDoctorEmail = () => {
    if (normalizedDoctorEmail) copyEmailToClipboard(normalizedDoctorEmail);
  };

  return (
  <section className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
    {/* زر التحكم في فتح/غلق القسم */}
    {!alwaysExpanded && (
    <button
      type="button"
      onClick={onToggleOpen}
      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-right"
    >
      <h3 className="text-base font-black text-white flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        إعدادات حساب السكرتارية
      </h3>
      <span className="text-white/90">
        {isOpen ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>}
      </span>
    </button>
    )}
    {alwaysExpanded && (
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-4 py-3 rounded-t-2xl">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          إعدادات حساب السكرتارية
        </h3>
      </div>
    )}

    {(isOpen || alwaysExpanded) && (
      <div className="p-4 space-y-4">
        {/* إعدادات السكرتارية (العنوان وكلمة المرور) */}
        <form onSubmit={onSaveCredentials} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">عنوان صفحة السكرتارية</label>
            <textarea
              value={bookingFormTitle}
              onChange={(e) => onBookingFormTitleChange(e.target.value)}
              placeholder="مثال: إدارة مواعيد سكرتارية عيادة د. أحمد"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold text-sm resize-none"
              rows={1}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">إيميل الطبيب</label>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold text-sm dir-ltr text-left select-none"
                onCopy={(e) => e.preventDefault()}
              >
                {normalizedDoctorEmail || 'لا يوجد إيميل مسجل لحساب الطبيب'}
              </div>
              <button
                type="button"
                onClick={copyDoctorEmail}
                disabled={!normalizedDoctorEmail}
                title="نسخ إيميل الطبيب"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50"
                aria-label="نسخ إيميل الطبيب"
              >
                {doctorEmailCopied ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">يمكن نسخ الإيميل من علامة النسخ فقط.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              كلمة مرور السكرتارية
              {hasMultipleBranches && currentBranchLabel && (
                <span className="mr-2 text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-black">
                  فرع: {currentBranchLabel}
                </span>
              )}
            </label>
            <input
              type="text"
              value={secretaryPassword}
              onChange={(e) => onSecretaryPasswordChange(e.target.value)}
              placeholder="اكتب كلمة سر خاصة بالسكرتارية"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold text-sm"
            />
            {hasMultipleBranches ? (
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                ⚠️ كل فرع له كلمة سر مستقلة. الكلمة دي تخص <b>الفرع النشط حالياً</b>. لتحديد كلمة سر لفرع آخر، بدّل الفرع النشط من التطبيق.
                السكرتارية اللي هتدخل بالكلمة دي هتشوف مواعيد هذا الفرع فقط.
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">الدخول للسكرتارية يتم من صفحة تسجيل دخول السكرتارية فقط باستخدام إيميل الطبيب + الرقم السري.</p>
            )}
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black text-blue-800">حقول القياسات والعلامات الحيوية للسكرتارية</div>
                <p className="mt-0.5 text-[11px] font-bold text-slate-600">
                  الحقول المفعلة تظهر للسكرتارية اسفل سبب الزيارة، وتنتقل تلقائيا للطبيب.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAllVitals}
                  className="inline-flex items-center rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-black text-blue-700 hover:bg-blue-100"
                >
                  {allVitalsEnabled ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-black text-blue-700">
                  مفعل {enabledVitalsCount} / {sortedSecretaryFields.length}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sortedSecretaryFields.map((field) => {
                const isEnabled = isSecretaryFieldEnabled(secretaryVitalsVisibility, field.id, field.key);
                const label = String(field.labelAr || field.label || '').trim() || 'حقل';
                const helperText = field.kind === 'customBox'
                  ? 'مربع مخصص من تصميم الروشتة'
                  : `${String(field.key || '').toUpperCase()}${field.unit ? ` - ${field.unit}` : ''}`;
                return (
                  <label
                    key={field.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition-all ${
                      isEnabled
                        ? 'border-blue-300 bg-blue-100/70'
                        : 'border-slate-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-800">{label}</div>
                      <div className="text-[10px] font-bold text-slate-500">{helperText}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(event) => onSecretaryVitalVisibilityChange(field.id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                );
              })}
            </div>
            {sortedSecretaryFields.length === 0 && (
              <p className="mt-2 text-xs font-bold text-slate-500">
                لا توجد حقول متاحة حالياً. راجع تصميم الروشتة لتفعيل القياسات أو المربعات المخصصة.
              </p>
            )}
          </div>

          <div className="sm:col-span-2 mt-2">
            <div
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold"
              role="status"
              aria-live="polite"
            >
              {credentialsSaving ? (
                <span className="flex items-center gap-2 text-blue-700">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 80" />
                  </svg>
                  جاري الحفظ...
                </span>
              ) : credentialsError ? (
                <span className="text-red-600">⚠️ {credentialsError}</span>
              ) : credentialsSuccess ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  تم الحفظ تلقائياً
                </span>
              ) : (
                <span className="text-slate-500">✓ الحفظ تلقائي — أي تعديل يُحفظ خلال ثانية.</span>
              )}
            </div>
          </div>
          {/* زر احتياطي مخفي لدعم ضغط Enter داخل أي حقل (form submit fallback) */}
          <button type="submit" disabled={credentialsSaving} className="hidden" aria-hidden="true" tabIndex={-1}>
            حفظ
          </button>
        </form>
      </div>
    )}
  </section>
);
};
