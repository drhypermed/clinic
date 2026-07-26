import React, { useEffect, useState } from 'react';
import {
  loadPatientImagesByIds,
  type PatientImageMetadata,
} from '../../services/patient-files/images';
import { PatientImagesGallery } from './PatientImagesGallery';

export const VisitInvestigationImages: React.FC<{
  userId?: string;
  imageIds?: string[];
}> = ({ userId, imageIds = [] }) => {
  const [images, setImages] = useState<PatientImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId || imageIds.length === 0) {
      setImages([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    let active = true;
    loadPatientImagesByIds(userId, imageIds)
      .then((next) => active && setImages(next))
      .catch(() => active && setImages([]))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [userId, imageIds.join('|')]);

  if (!userId || imageIds.length === 0) return null;

  return (
    <div className="md:col-span-2 rounded-xl border border-sky-100 bg-white p-2.5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-black text-sky-700">
          صور الفحوصات ({isLoading ? imageIds.length : images.length})
        </div>
        <div className="text-[10px] font-bold text-sky-700">محفوظة أيضًا داخل صور المريض</div>
      </div>

      {isLoading ? (
        <div className="py-5 text-center text-xs font-bold text-slate-500">جاري تحميل الصور...</div>
      ) : (
        <PatientImagesGallery
          userId={userId}
          images={images}
          onDeleted={(imageId) => setImages((current) => current.filter((image) => image.id !== imageId))}
          emptyMessage="لا توجد صور متاحة في هذا السجل."
        />
      )}
    </div>
  );
};
