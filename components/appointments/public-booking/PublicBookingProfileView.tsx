import React from 'react';

type PublicBookingProfileViewProps = {
  secretaryAvatarText: string;
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
  secretaryAvatarText,
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
    <div className="px-3 py-4 sm:px-5 sm:py-6 max-w-md mx-auto" dir="rtl">
      {/* كارت واحد متصل — نفس نمط بروفايل الطبيب */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

        {/* الهيدر — الأفاتار */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-6 flex flex-col items-center">
          <div className="rounded-full p-[3px] bg-gradient-to-tr from-white/40 via-white/20 to-white/10 w-20 h-20 shadow-lg mb-3">
            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-white font-black text-2xl border-2 border-white/60">
              {secretaryAvatarText}
            </div>
          </div>
          <p className="text-white font-black text-base">{secretaryNameInput || 'السكرتيرة'}</p>
          <p className="text-white/70 text-xs font-bold mt-1">الملف التعريفي</p>
        </div>

        {/* المحتوى */}
        <div className="p-5 space-y-4">

          {/* اسم السكرتيرة */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم السكرتيرة</label>
            <input
              type="text"
              value={secretaryNameInput}
              onChange={(e) => onSecretaryNameInputChange(e.target.value)}
              placeholder="اكتب اسم السكرتيرة"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold text-base transition-all"
            />
          </div>

          {/* زر الحفظ */}
          <button
            type="button"
            onClick={onSaveSecretaryName}
            disabled={profileSaving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/60 hover:brightness-105 font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {profileSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الحفظ
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                حفظ الاسم
              </>
            )}
          </button>

          {profileSaveMessage && (
            <p className="text-sm text-emerald-600 font-bold text-center">{profileSaveMessage}</p>
          )}

          {/* خط فاصل */}
          <div className="border-t border-slate-100" />

          {/* الطبيب المرتبط */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 font-bold">الطبيب المرتبط</p>
              <p className="text-sm text-slate-800 font-black leading-tight truncate">{doctorDisplayName}</p>
            </div>
          </div>

          {/* الفرع */}
          {hasMultipleBranches && branchName && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-bold">الفرع</p>
                <p className="text-sm text-violet-800 font-black leading-tight truncate">{branchName}</p>
              </div>
            </div>
          )}

          {/* خط فاصل */}
          <div className="border-t border-slate-100" />

          {/* تسجيل الخروج */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm border border-red-200 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};
