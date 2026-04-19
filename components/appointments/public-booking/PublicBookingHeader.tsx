/**
 * الملف: PublicBookingHeader.tsx
 * الوصف: "الشريط العلوي" (The Header). 
 * يمثل الهوية البصرية لصفحة السكرتير، ويحتوي على: 
 * - عنوان الصفحة الديناميكي (اسم العيادة أو الفورم). 
 * - قائمة الملف الشخصي (Profile Menu) لتغيير اسم السكرتير. 
 * - زر "تسجيل الخروج" لإنهاء الجلسة وتأمين البيانات. 
 * - التصميم يعتمد على خلفية شفافة (Glassmorphism) لتعزيز المظهر العصري.
 */
import React from 'react';

/**
 * الخصائص الخاصة برأس صفحة السكرتارية
 * تشمل بيانات الملف الشخصي (الاسم، صورة رمزية) ووظيفة تسجيل الخروج
 */
type PublicBookingHeaderProps = {
  profileMenuRef: React.RefObject<HTMLDivElement | null>; // مرجع لقائمة الملف الشخصي لإغلاقها عند النقر بالخارج
  profileMenuOpen: boolean; // هل قائمة الملف الشخصي مفتوحة؟
  onToggleProfileMenu: () => void;
  secretaryAvatarText: string; // النص المختصر الذي يظهر في دائرة البروفايل (أول حرف من الاسم)
  secretaryNameInput: string;
  onSecretaryNameInputChange: (value: string) => void;
  profileSaving: boolean;
  onSaveSecretaryName: () => void;
  doctorDisplayName: string; // اسم الطبيب الذي تتبعه هذه السكرتارية
  profileSaveMessage: string;
  onLogout: () => void;
  fixedTitle: string; // العنوان الرئيسي الظاهر في أعلى الصفحة
};

/**
 * مكون "رأس الصفحة" (PublicBookingHeader)
 * يظهر في الجزء العلوي بشكل ثابت (Fixed) ويحتوي على العنوان وقائمة التحكم في حساب السكرتارية
 */
export const PublicBookingHeader: React.FC<PublicBookingHeaderProps> = ({
  profileMenuRef,
  profileMenuOpen,
  onToggleProfileMenu,
  secretaryAvatarText,
  secretaryNameInput,
  onSecretaryNameInputChange,
  profileSaving,
  onSaveSecretaryName,
  doctorDisplayName,
  profileSaveMessage,
  onLogout,
  fixedTitle,
}) => {
  return (
    /* خلفية بيضاء نصف شفافة مع تأثير blur لتعطي لمسة جمالية حديثة */
    <div className="fixed top-0 inset-x-0 z-40 border-b border-teal-200 bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* جزء الملف الشخصي (البروفايل) */}
          <div ref={profileMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={onToggleProfileMenu}
              className="h-11 min-w-[44px] px-2 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-white border-2 border-white shadow-md flex items-center justify-center font-black text-[11px] leading-tight text-center whitespace-nowrap"
              title="الملف التعريفي"
              aria-label="الملف التعريفي للسكرتيرة"
            >
              {secretaryAvatarText}
            </button>
            {/* القائمة المنسدلة عند النقر على البروفايل لضبط الاسم أو تسجيل الخروج */}
            {profileMenuOpen && (
              <div className="absolute top-14 right-0 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-right z-50">
                <div className="px-4 py-3 bg-gradient-to-r from-sky-600 to-cyan-600">
                  <p className="text-sm font-black text-white">الملف التعريفي للسكرتيرة</p>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الاسم</label>
                    <input
                      type="text"
                      value={secretaryNameInput}
                      onChange={(e) => onSecretaryNameInputChange(e.target.value)}
                      placeholder="اكتب اسم السكرتيرة"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onSaveSecretaryName}
                      disabled={profileSaving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60"
                    >
                      {profileSaving ? 'جاري الحفظ' : 'حفظ الاسم'}
                    </button>
                  </div>
                  <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
                    <p className="text-[11px] text-slate-500 font-bold mb-1">اسم الطبيب المرتبط</p>
                    <p className="text-base text-sky-800 font-black leading-tight">{doctorDisplayName}</p>
                  </div>
                  {profileSaveMessage && <p className="text-[11px] text-emerald-600 font-bold">{profileSaveMessage}</p>}
                  {/* زر تسجيل الخروج للأمان */}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
                      />
                    </svg>
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* عنوان الصفحة الرئيسي */}
          <h1 className="min-w-0 flex-1 text-base sm:text-xl font-black text-slate-800 leading-tight break-words">{fixedTitle}</h1>
        </div>
      </div>
    </div>
  );
};

