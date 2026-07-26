import React, { useEffect, useRef, useState } from 'react';
import type { PatientFileData } from './patientFilesShared';
import {
  MAX_PATIENT_IMAGES,
  subscribeToPatientImages,
  uploadPatientImage,
  type PatientImageMetadata,
  type PatientImagesAccountType,
  canUsePatientImages,
  getPatientImagesLimitMessage,
  PATIENT_IMAGES_PRO_MAX_MESSAGE,
} from '../../services/patient-files/images';
import { buildPatientFileDocIdFromNameKey } from '../../services/patient-files/normalizers';
import { PatientImagesNoticeModal } from './PatientImagesNoticeModal';
import { PatientImageUploadProgress } from './PatientImageUploadProgress';
import { PatientImagesGallery } from './PatientImagesGallery';
import type { PatientImageUploadPhase } from '../../services/patient-files/images';

interface PatientFileImagesSectionProps {
  userId?: string;
  patientFile: PatientFileData;
  accountType?: PatientImagesAccountType;
}

export const PatientFileImagesSection: React.FC<PatientFileImagesSectionProps> = ({ userId, patientFile, accountType }) => {
  const patientFileId = patientFile.fileId || buildPatientFileDocIdFromNameKey(patientFile.key);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<PatientImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    phase: PatientImageUploadPhase;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notice, setNotice] = useState<{ title: string; message: string; tone: 'pro' | 'limit' } | null>(null);

  useEffect(() => {
    if (!userId || !patientFileId) {
      setImages([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToPatientImages(
      userId,
      patientFileId,
      (next) => {
        setImages(next);
        setIsLoading(false);
      },
      () => {
        setError('تعذر تحميل صور المريض. تأكد من اتصال الإنترنت.');
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [patientFileId, userId]);

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!userId || selected.length === 0) return;
    if (!canUsePatientImages(accountType)) {
      setNotice({ title: 'ميزة صور المرضى', message: PATIENT_IMAGES_PRO_MAX_MESSAGE, tone: 'pro' });
      return;
    }

    const remaining = Math.max(0, MAX_PATIENT_IMAGES - images.length);
    if (selected.length > remaining) {
      setNotice({ title: 'الصور المختارة أكثر من المتاح', message: getPatientImagesLimitMessage(remaining), tone: 'limit' });
      return;
    }

    setError('');
    setSuccess('');
    setUploadProgress({ current: 1, total: selected.length, percent: 0, phase: 'compressing' });
    let uploaded = 0;
    try {
      for (let index = 0; index < selected.length; index += 1) {
        setUploadProgress({ current: index + 1, total: selected.length, percent: 0, phase: 'compressing' });
        await uploadPatientImage({
          userId,
          patientName: patientFile.name,
          phone: patientFile.phones[0],
          patientFileId,
          patientFileNumber: patientFile.fileNumber,
          patientFileNameKey: patientFile.key,
          file: selected[index],
          onProgress: ({ percent, phase }) => setUploadProgress({
            current: index + 1,
            total: selected.length,
            percent,
            phase,
          }),
        });
        uploaded += 1;
      }
      setSuccess(`تم ضغط ورفع ${uploaded} صورة مع الحفاظ على أبعادها الأصلية.`);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'حدث خطأ أثناء رفع الصور.';
      setError(uploaded > 0 ? `تم رفع ${uploaded} صورة، ثم توقف الرفع: ${message}` : message);
    } finally {
      setUploadProgress(null);
    }
  };

  const isUploading = uploadProgress !== null;
  const atLimit = images.length >= MAX_PATIENT_IMAGES;
  const handleAddClick = () => {
    if (!canUsePatientImages(accountType)) {
      setNotice({ title: 'ميزة صور المرضى', message: PATIENT_IMAGES_PRO_MAX_MESSAGE, tone: 'pro' });
      return;
    }
    if (atLimit) {
      setNotice({ title: 'اكتمل حد الصور', message: getPatientImagesLimitMessage(), tone: 'limit' });
      return;
    }
    inputRef.current?.click();
  };

  return (
    <section className="rounded-2xl border border-sky-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-sky-100 bg-sky-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-black text-sky-800">صور المريض</div>
          <div className="mt-0.5 text-[11px] font-bold text-sky-700">
            {images.length} من {MAX_PATIENT_IMAGES} · تُضغط قبل الرفع بدون تغيير الأبعاد
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!userId || isUploading}
          className={`rounded-xl px-4 py-2 text-xs font-black text-white ${!userId || isUploading ? 'cursor-not-allowed bg-slate-400' : 'bg-sky-600 hover:bg-sky-700'}`}
        >
          {isUploading ? `جاري رفع ${uploadProgress.current}/${uploadProgress.total}` : atLimit ? 'اكتمل الحد الأقصى' : 'إضافة صور'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      <div className="px-4 py-3">
        {error && <div className="mb-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] font-black text-danger-700">{error}</div>}
        {success && <div className="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-[11px] font-black text-success-700">{success}</div>}
        {uploadProgress && <PatientImageUploadProgress {...uploadProgress} />}

        {isLoading ? (
          <div className="py-5 text-center text-xs font-bold text-slate-500">جاري تحميل الصور...</div>
        ) : userId ? (
          <PatientImagesGallery
            userId={userId}
            images={images}
            onDeleted={(imageId) => setImages((current) => current.filter((image) => image.id !== imageId))}
          />
        ) : null}
      </div>

      <PatientImagesNoticeModal open={Boolean(notice)} title={notice?.title || ''} message={notice?.message || ''} tone={notice?.tone} onClose={() => setNotice(null)} />
    </section>
  );
};
