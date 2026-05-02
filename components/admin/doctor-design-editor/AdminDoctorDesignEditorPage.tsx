// ─────────────────────────────────────────────────────────────────────────────
// AdminDoctorDesignEditorPage — صفحة الأدمن لمساعدة طبيب في تصميم روشتته/إعلانه
// ─────────────────────────────────────────────────────────────────────────────
// الواجهه ٣ خطوات:
//   1) idle/error: حقل إدخال إيميل الطبيب + زر بحث.
//   2) success: كرت يعرض اسم الطبيب + زرّين (تصميم/إعلان) كل واحد بحالته
//      (مفتوح/مقفول حسب إذن الطبيب).
//   3) prescription/ad: الأدمن داخل الواجهه الفعليّه للطبيب (مع زر رجوع).
//
// إذن الطبيب: لو الطبيب قفل إذن مساعدة الإدارة (من زر داخل التطبيق)،
// الزر بيظهر معطّل مع رسالة توضّح إن الطبيب رفض. حتى لو الأدمن حاول يدخل
// يدوياً، قواعد Firestore هترفض الكتابة.
//
// الوصول مقيّد على المستندين دول فقط — ملفات المرضى، التقارير، الماليّه
// كلها مرفوضه على الأدمن من قواعد التطبيق.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useResolveDoctorByEmail } from './useResolveDoctorByEmail';
import { AdminPrescriptionEditFrame } from './AdminPrescriptionEditFrame';
import { AdminAdEditFrame } from './AdminAdEditFrame';

// الوضع النشط للصفحة: لقطه (snapshot) ل state الـUI
type EditorMode = 'select' | 'prescription' | 'ad';

export const AdminDoctorDesignEditorPage: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [mode, setMode] = useState<EditorMode>('select');
  const { status, doctor, error, resolve, reset } = useResolveDoctorByEmail();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMode('select');
    await resolve(emailInput);
  };

  const handleResetSearch = () => {
    setEmailInput('');
    setMode('select');
    reset();
  };

  // ─── الوضع 2: الأدمن داخل تعديل تصميم الروشتة ───
  if (mode === 'prescription' && doctor) {
    return (
      <AdminPrescriptionEditFrame
        targetUserId={doctor.uid}
        targetDoctorName={doctor.doctorName}
        targetDoctorEmail={doctor.doctorEmail}
        branches={doctor.branches}
        onBack={() => setMode('select')}
      />
    );
  }

  // ─── الوضع 3: الأدمن داخل تعديل الإعلان ───
  if (mode === 'ad' && doctor) {
    return (
      <AdminAdEditFrame
        targetUserId={doctor.uid}
        targetDoctorName={doctor.doctorName}
        targetDoctorSpecialty={doctor.doctorSpecialty}
        targetDoctorEmail={doctor.doctorEmail}
        targetProfileImage={doctor.profileImage}
        onBack={() => setMode('select')}
      />
    );
  }

  // ─── الوضع 1: شاشه البحث + الاختيار (الافتراضي) ───
  return (
    <div className="space-y-4" dir="rtl">
      {/* شرح مختصر — يوضح للأدمن إن وصوله محدود */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-slate-700">
        <p className="font-bold text-brand-700 mb-1">مساعدة طبيب في تصميم شاشاته</p>
        <p className="text-sm leading-relaxed">
          ادخل إيميل الطبيب — هتقدر تفتح صفحتين فقط: <span className="font-bold">تصميم الروشتة</span> و
          <span className="font-bold"> صفحة الإعلان</span>. أي بيانات تانيه (مرضى، مواعيد، تقارير ماليه)
          مش هتظهر هنا، ومش هتقدر توصلّها — حماية من قواعد التطبيق نفسه.
        </p>
        <p className="text-xs leading-relaxed mt-2 text-slate-600">
          ملاحظة: الطبيب يقدر يقفل إذن المساعدة من داخل التطبيق (زر في إعدادات الطباعة + زر في صفحة الإعلان).
          لو قفله، الزر هنا هيظهر معطّل.
        </p>
      </div>

      {/* نموذج البحث */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
      >
        <label className="block text-sm font-bold text-slate-700">
          إيميل الطبيب
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="example@gmail.com"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            dir="ltr"
            autoComplete="off"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !emailInput.trim()}
            className="rounded-lg bg-brand-600 px-5 py-2 font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {status === 'loading' ? 'جاري البحث...' : 'بحث'}
          </button>
        </div>

        {/* رسالة خطأ — إيميل ناقص أو طبيب مش موجود */}
        {status === 'error' && error && (
          <div className="rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm font-bold text-danger-700">
            {error}
          </div>
        )}
      </form>

      {/* كرت الطبيب + زرّين الانتقال — يظهر فقط لمّا البحث ينجح */}
      {status === 'success' && doctor && (
        <div className="rounded-2xl border border-success-300 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-success-700 mb-1">تم العثور على الطبيب</p>
              <p className="text-lg font-black text-slate-900">
                {doctor.doctorName || '(اسم غير مسجّل)'}
              </p>
              {doctor.doctorSpecialty && (
                <p className="text-sm text-slate-600">{doctor.doctorSpecialty}</p>
              )}
              <p className="text-xs text-slate-500 mt-1" dir="ltr">{doctor.doctorEmail}</p>
              {doctor.branches.length > 1 && (
                <p className="text-xs text-brand-700 font-bold mt-1">
                  عدد الفروع: {doctor.branches.length} (هتختار الفرع داخل صفحة التصميم)
                </p>
              )}
            </div>
            <button
              onClick={handleResetSearch}
              className="text-sm font-bold text-slate-500 hover:text-slate-700"
            >
              تغيير الطبيب
            </button>
          </div>

          {/* الزرّين: تصميم الروشتة + الإعلان — كل واحد بيحترم إذن الطبيب */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* زر تصميم الروشتة */}
            {doctor.allowAdminPrescriptionEdit ? (
              <button
                onClick={() => setMode('prescription')}
                className="rounded-xl border-2 border-brand-300 bg-brand-50 hover:bg-brand-100 p-5 text-right transition"
              >
                <p className="text-base font-black text-brand-700 mb-1">تعديل تصميم الروشتة</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  نفس واجهه الطبيب (هيدر، فوتر، قياسات، طباعة) — أي حفظ بيتسجل عند الطبيب مباشرةً.
                </p>
              </button>
            ) : (
              <div
                aria-disabled
                className="rounded-xl border-2 border-slate-200 bg-slate-100 p-5 text-right cursor-not-allowed"
              >
                <p className="text-base font-black text-slate-500 mb-1">تعديل تصميم الروشتة</p>
                <p className="text-xs text-danger-700 leading-relaxed font-bold">
                  الطبيب قافل إذن المساعدة. اطلب منه يفعّل الزر من تبويب "إعدادات الطباعة" في صفحة تصميم الروشتة.
                </p>
              </div>
            )}

            {/* زر تعديل الإعلان */}
            {doctor.allowAdminAdEdit ? (
              <button
                onClick={() => setMode('ad')}
                className="rounded-xl border-2 border-success-300 bg-success-50 hover:bg-success-100 p-5 text-right transition"
              >
                <p className="text-base font-black text-success-700 mb-1">تعديل صفحة الإعلان</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  البيانات الشخصية، الفروع، المواعيد، الأسعار، الصور، السوشيال — تقدر تعدّلها وتنشرها للجمهور.
                </p>
              </button>
            ) : (
              <div
                aria-disabled
                className="rounded-xl border-2 border-slate-200 bg-slate-100 p-5 text-right cursor-not-allowed"
              >
                <p className="text-base font-black text-slate-500 mb-1">تعديل صفحة الإعلان</p>
                <p className="text-xs text-danger-700 leading-relaxed font-bold">
                  الطبيب قافل إذن المساعدة. اطلب منه يفعّل الزر من داخل صفحة الإعلان.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
