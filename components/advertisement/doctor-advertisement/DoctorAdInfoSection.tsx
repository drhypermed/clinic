/** قسم المعلومات الأساسية: يتيح تعديل سنوات الخبرة، الدرجة العلمية، التخصصات الدقيقة، والخدمات المميزة. */
import React from 'react';

import type { DoctorAdInfoSectionProps } from './types';

export const DoctorAdInfoSection: React.FC<DoctorAdInfoSectionProps> = ({
  adDoctorName,
  yearsExperience,
  academicDegree,
  subSpecialties,
  featuredServicesSummary,
  workplace,
  extraInfo,
  onDoctorNameChange,
  onYearsExperienceChange,
  onAcademicDegreeChange,
  onSubSpecialtiesChange,
  onFeaturedServicesSummaryChange,
  onWorkplaceChange,
  onExtraInfoChange,
}) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
      <h3 className="text-sm font-black text-slate-700 mb-2.5 block">معلومات الإعلان</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">اسم الطبيب</label>
          <input
            value={adDoctorName}
            onChange={(event) => onDoctorNameChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="اسم الطبيب"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">سنوات الخبرة</label>
          <input
            value={yearsExperience}
            onChange={(event) => onYearsExperienceChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="10"
            type="number"
            min={0}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1">الدرجة العلمية</label>
          <input
            value={academicDegree}
            onChange={(event) => onAcademicDegreeChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
            placeholder="مثال: استشاري الباطنة - دكتوراه أمراض القلب"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1">التخصصات الدقيقة</label>
          <textarea
            value={subSpecialties}
            onChange={(event) => onSubSpecialtiesChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[110px]"
            placeholder="مثال: مناظير الجهاز الهضمي - أمراض الكبد - مناظير القولون"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1">الخدمات المميزة</label>
          <textarea
            value={featuredServicesSummary}
            onChange={(event) => onFeaturedServicesSummaryChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold min-h-[95px]"
            placeholder="أبرز الخدمات أو العروض التي تريد ظهورها للجمهور"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1">محل العمل</label>
          <textarea
            value={workplace}
            onChange={(event) => onWorkplaceChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[85px]"
            placeholder="اسم المستشفى/المراكز التي تعمل بها"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1">معلومات إضافية</label>
          <textarea
            value={extraInfo}
            onChange={(event) => onExtraInfoChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold min-h-[95px]"
            placeholder="أي تفاصيل أخرى تريد أن يراها الجمهور"
          />
        </div>
      </div>
    </section>
  );
};
