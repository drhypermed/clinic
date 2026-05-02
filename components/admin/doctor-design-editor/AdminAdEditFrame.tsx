// ─────────────────────────────────────────────────────────────────────────────
// AdminAdEditFrame — الأدمن يعدّل صفحة إعلان طبيب معيّن
// ─────────────────────────────────────────────────────────────────────────────
// الفكرة: نفس مكوّن `AdvertisementAndPublicPage` اللي الطبيب بيستعمله، بس
// بنمرّر `doctorId` بتاع الطبيب المستهدف. المكوّن مصمّم أصلاً ياخد doctorId
// كـprop فماحتاجش أي تعديل في الكود الأساسي.
//
// قواعد Firestore: `doctorAds/{doctorId}` بتسمح للأدمن يعمل update من غير
// أي تغيير (موجود من قبل في firestore.rules السطر 569-574).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { AdvertisementAndPublicPage } from '../../advertisement/AdvertisementAndPublicPage';

interface AdminAdEditFrameProps {
  // الطبيب المستهدف
  targetUserId: string;
  targetDoctorName: string;
  targetDoctorSpecialty: string;
  targetDoctorEmail: string;
  targetProfileImage?: string;
  // الرجوع لقائمة الاختيار
  onBack: () => void;
}

export const AdminAdEditFrame: React.FC<AdminAdEditFrameProps> = ({
  targetUserId,
  targetDoctorName,
  targetDoctorSpecialty,
  targetDoctorEmail,
  targetProfileImage,
  onBack,
}) => {
  return (
    <div dir="rtl">
      {/* شريط تعريفي + زر رجوع — عشان الأدمن مايتلخبطش بين شاشاته
          والشاشات اللي بيعدّلها لطبيب تاني */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3">
        <p className="font-bold text-warning-800">
          تعدّل الآن إعلان الطبيب: <span className="text-warning-900">{targetDoctorName || targetDoctorEmail}</span>
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-800"
        >
          رجوع
        </button>
      </div>

      {/* تنبيه للأدمن عن قيد الأسعار: التطبيق عند الطبيب بيـauto-fill سعر الكشف
          والاستشارة من التقارير الماليه. الأدمن مش عنده صلاحيه قراءه التقارير
          الماليه (للحمايه)، فلازم يعرف إن لو الحقول دي ظهرت فاضيه يكتبها يدوياً
          أو يسأل الطبيب. */}
      <div className="mb-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-bold text-brand-800 mb-1">قبل ما تبدأ — معلومة مهمة عن الأسعار</p>
        <p className="leading-relaxed">
          عند الطبيب، حقول <span className="font-bold">سعر الكشف</span> و
          <span className="font-bold"> سعر الاستشارة</span> بتتملّى تلقائياً من
          التقارير الماليه. الإدارة <span className="font-bold">مش عندها صلاحيه</span> قراءة التقارير الماليه (للحمايه)،
          فلو الحقلين دول ظهرولك فاضيين، اطلب الأسعار من الطبيب أو سيبها زي ما هي
          (الطبيب نفسه ممكن يحفظها بعدين). أي سعر إنت تكتبه هنا بيتحفظ في الإعلان مباشرةً.
        </p>
      </div>

      <AdvertisementAndPublicPage
        doctorId={targetUserId}
        doctorName={targetDoctorName}
        doctorSpecialty={targetDoctorSpecialty}
        profileImage={targetProfileImage}
      />
    </div>
  );
};
