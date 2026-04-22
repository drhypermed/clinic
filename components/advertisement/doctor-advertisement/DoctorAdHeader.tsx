/** ترويسة صفحة الإعلان: تعرض اسم الطبيب وتخصصه والدرجة العلمية كملخص سريع في أعلى الصفحة. */
import React from 'react';

import type { DoctorAdHeaderProps } from './types';

export const DoctorAdHeader: React.FC<DoctorAdHeaderProps> = ({
  adDoctorName,
  doctorSpecialty,
  academicDegree,
}) => {
  return (
    // ترويسة الإعلان: شلنا العنوان والوصف (توحيد مع باقي الصفحات النظيفه زي
    // سجلات المرضى وملفات المرضى — الخلفيه بيضاء بدون حشو فوق).
    // بقيت بس بطاقات ملخّص بيانات الطبيب بخلفيه بيضاء + حدود خفيفه
    // بدل التدرّج الأزرق اللي كان واقف فوق.
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-3">
        <p className="text-xs text-slate-500">اسم الطبيب</p>
        <p className="font-black text-lg text-slate-900">{adDoctorName || 'غير محدد'}</p>
      </div>
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-3">
        <p className="text-xs text-slate-500">التخصص الطبي</p>
        <p className="font-black text-lg text-slate-900">{doctorSpecialty || 'غير محدد'}</p>
      </div>
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-3 sm:col-span-2">
        <p className="text-xs text-slate-500">الدرجة العلمية</p>
        <p className="font-black text-base text-slate-900">{academicDegree || 'غير محددة'}</p>
      </div>
    </section>
  );
};
