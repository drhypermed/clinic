/** ترويسة صفحة الإعلان: تعرض اسم الطبيب وتخصصه والدرجة العلمية كملخص سريع في أعلى الصفحة. */
import React from 'react';

import type { DoctorAdHeaderProps } from './types';

export const DoctorAdHeader: React.FC<DoctorAdHeaderProps> = ({
  adDoctorName,
  doctorSpecialty,
  academicDegree,
}) => {
  return (
    // ترويسة الإعلان: نفس تدرج الأزرق الموحّد في باقي التطبيق (ReportsHeader / Sidebar)
    <section className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl text-white p-6 shadow-lg shadow-blue-900/20">
      <h2 className="text-2xl font-black">صفحة الإعلان</h2>
      <p className="text-blue-100 mt-2 font-semibold">
        هذه الصفحة هي التي تظهر للجمهور. كل تعديل هنا ينعكس مباشرة بعد النشر.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <div className="bg-white/15 rounded-xl p-3">
          <p className="text-xs text-blue-100">اسم الطبيب</p>
          <p className="font-black text-lg">{adDoctorName || 'غير محدد'}</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3">
          <p className="text-xs text-blue-100">التخصص الطبي</p>
          <p className="font-black text-lg">{doctorSpecialty || 'غير محدد'}</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 sm:col-span-2">
          <p className="text-xs text-blue-100">الدرجة العلمية</p>
          <p className="font-black text-base">{academicDegree || 'غير محددة'}</p>
        </div>
      </div>
    </section>
  );
};
