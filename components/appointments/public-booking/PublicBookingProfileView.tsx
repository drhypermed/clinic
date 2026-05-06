/**
 * الملف التعريفي للسكرتيرة — تصميم متطابق مع DoctorProfileModal
 * (أزرق متدرج للهيدر، حقول بحدود زرقاء، زر حفظ أخضر، خروج أحمر)
 * بدون صور (السكرتيرة ما عندهاش avatar/profile image).
 */
import React from 'react';

type PublicBookingProfileViewProps = {
  /** غير مستخدم (نُبقيه للتوافق مع callers) */
  secretaryAvatarText?: string;
  secretaryNameInput: string;
  onSecretaryNameInputChange: (value: string) => void;
  profileSaving: boolean;
  onSaveSecretaryName: () => void;
  doctorDisplayName: string;
  profileSaveMessage: string;
  branchName?: string;
  hasMultipleBranches?: boolean;
  onLogout: () => void;
};

export const PublicBookingProfileView: React.FC<PublicBookingProfileViewProps> = ({
  secretaryNameInput,
  onSecretaryNameInputChange,
  profileSaving,
  onSaveSecretaryName,
  doctorDisplayName,
  profileSaveMessage,
  branchName,
  hasMultipleBranches,
  onLogout,
}) => {
  return (
    <div className="px-3 py-4 sm:px-5 sm:py-6 max-w-2xl mx-auto" dir="rtl">
      {/* الكارت الرئيسي — نفس بنية كارت بروفايل الطبيب */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">

        {/* الهيدر — أزرق متدرج (نفس DoctorProfileModal) */}
        <div className="bg-gradient-to-l from-blue-700 via-blue-600 to-blue-500 text-white px-6 py-4 shadow-[0_2px_12px_-2px_rgba(8,112,184,0.4)]">
          <h2 className="text-2xl font-black">الملف الشخصي</h2>
          <p className="text-white/80 text-xs font-bold mt-1">بيانات السكرتيرة والطبيب المرتبط</p>
        </div>

        {/* المحتوى */}
        <div className="p-6 space-y-6">

          {/* رسالة نجاح/معلومة بعد الحفظ — أخضر دلالي */}
          {profileSaveMessage && (
            <div className="bg-emerald-50 border-r-4 border-emerald-500 p-4 rounded-lg">
              <p className="text-emerald-700 font-bold text-sm">{profileSaveMessage}</p>
            </div>
          )}

          {/* اسم السكرتيرة — input editable */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              اسم السكرتيرة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={secretaryNameInput}
              onChange={(e) => onSecretaryNameInputChange(e.target.value)}
              placeholder="اكتب اسم السكرتيرة"
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-semibold"
            />
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              الاسم يظهر للطبيب لتمييز كل سكرتيرة
            </p>
          </div>

          {/* الطبيب المرتبط — read-only بخلفية زرقاء فاتحة (نفس حقل الإيميل عند الطبيب) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              الطبيب المرتبط
            </label>
            <div className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 text-slate-800 font-semibold truncate">
              {doctorDisplayName}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-semibold">
              لا يمكن تغيير الطبيب المرتبط من هنا
            </p>
          </div>

          {/* الفرع — يظهر لو الطبيب عنده فروع متعددة */}
          {hasMultipleBranches && branchName && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                الفرع
              </label>
              <div className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 text-slate-800 font-semibold truncate">
                {branchName}
              </div>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                الفرع المسجَّل عليه الجلسة الحالية
              </p>
            </div>
          )}

          {/* الأزرار — حفظ أخضر متدرج / خروج أحمر متدرج (نفس DoctorProfileModal) */}
          <div className="flex gap-3 pt-2">
            {/* زر حفظ — أخضر متدرج (CTA إيجابي) */}
            <button
              type="button"
              onClick={onSaveSecretaryName}
              disabled={profileSaving}
              className="flex-1 bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-500 hover:from-emerald-800 hover:via-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-black shadow-[0_4px_14px_-2px_rgba(5,150,105,0.45)] hover:shadow-[0_6px_22px_-2px_rgba(5,150,105,0.55)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ
                </span>
              ) : (
                'حفظ التعديلات'
              )}
            </button>

            {/* زر تسجيل خروج — أحمر متدرج (action سلبي/خروج) */}
            <button
              type="button"
              onClick={onLogout}
              disabled={profileSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-l from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-black shadow-[0_4px_12px_-2px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_18px_-2px_rgba(225,29,72,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
