/** قسم صور العيادة: يتيح رفع ما يصل إلى 6 صور لاستعراض العيادة أو الطاقم الطبي للجمهور. */
import React from 'react';

import type { DoctorAdImagesSectionProps } from './types';

export const DoctorAdImagesSection: React.FC<DoctorAdImagesSectionProps> = ({
  imageUrls,
  deletingImageIndex,
  onAddImageFromFile,
  onRemoveImage,
}) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
      <h3 className="text-sm font-black text-slate-700 mb-2.5 block">الصور</h3>
      <div>
        {/* زر رفع الصورة: نفس تدرج الأزرق المستخدم في أزرار "إضافة" بباقي أقسام الإعلان */}
        <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 font-bold text-white text-xs cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onAddImageFromFile(file);
              event.currentTarget.value = '';
            }}
          />
          رفع صورة من الجهاز
        </label>
        <p className="text-[10px] text-slate-500 mt-1.5 font-semibold">يمكنك إضافة حتى 6 صور (حد أقصى 10 ميجا لكل صورة)</p>
      </div>
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {imageUrls.map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <img src={src} alt={`doctor-ad-${idx}`} className="w-full h-24 object-cover" />
              <button
                type="button"
                onClick={() => void onRemoveImage(idx)}
                disabled={deletingImageIndex === idx}
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-danger-600 text-white text-xs font-black hover:bg-danger-700 transition-colors disabled:opacity-50"
              >
                {deletingImageIndex === idx ? '…' : '×'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
