import React, { useEffect, useRef, useState } from 'react';
import {
  canUsePatientImages,
  deletePatientImage,
  getPatientImagesLimitMessage,
  loadPatientImageObjectUrl,
  MAX_PATIENT_IMAGES,
  PATIENT_IMAGES_PRO_MAX_MESSAGE,
  subscribeToPatientImages,
  uploadPatientImage,
  type PatientImageMetadata,
  type PatientImagesAccountType,
} from '../../services/patient-files/images';
import { PatientImagesNoticeModal } from '../patient-files/PatientImagesNoticeModal';
import { PatientImageUploadProgress } from '../patient-files/PatientImageUploadProgress';
import { PatientImageLightbox } from '../patient-files/PatientImageLightbox';
import type { PatientImageUploadPhase } from '../../services/patient-files/images';

interface InvestigationImagesFieldProps {
  userId: string;
  accountType?: PatientImagesAccountType;
  patientName: string;
  phone?: string;
  patientFileId?: string | null;
  patientFileNumber?: number | null;
  patientFileNameKey?: string | null;
  images: PatientImageMetadata[];
  onChange: (images: PatientImageMetadata[]) => void;
}

const InvestigationImageThumbnail: React.FC<{
  image: PatientImageMetadata;
  localUrl?: string;
  onOpen: () => void;
}> = ({ image, localUrl, onOpen }) => {
  const [src, setSrc] = useState(localUrl || '');

  useEffect(() => {
    if (localUrl) {
      setSrc(localUrl);
      return undefined;
    }
    let active = true;
    let objectUrl = '';
    loadPatientImageObjectUrl(image.storagePath)
      .then((url) => {
        if (!active) return URL.revokeObjectURL(url);
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image.storagePath, localUrl]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-200 bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      aria-label={`فتح الصورة ${image.originalName}`}
      title="اضغط لعرض الصورة بالكامل"
    >
      {src ? (
        <img src={src} alt={image.originalName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-sky-500" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.5M3 16.5l4-4 3 3 3-3 8 6" />
        </svg>
      )}
    </button>
  );
};

export const InvestigationImagesField: React.FC<InvestigationImagesFieldProps> = ({
  userId,
  accountType,
  patientName,
  phone,
  patientFileId,
  patientFileNumber,
  patientFileNameKey,
  images,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const localPreviewUrlsRef = useRef(new Map<string, string>());
  const [localPreviewUrls, setLocalPreviewUrls] = useState<Record<string, string>>({});
  const [patientImageCount, setPatientImageCount] = useState(0);
  const [openImage, setOpenImage] = useState<PatientImageMetadata | null>(null);
  const [deletingImageId, setDeletingImageId] = useState('');
  const [uploading, setUploading] = useState<{
    current: number;
    total: number;
    percent: number;
    phase: PatientImageUploadPhase;
  } | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string; tone: 'pro' | 'limit' | 'error' } | null>(null);

  useEffect(() => {
    if (!userId || !patientFileId) return setPatientImageCount(0);
    return subscribeToPatientImages(userId, patientFileId, (all) => setPatientImageCount(all.length));
  }, [patientFileId, userId]);

  useEffect(() => () => {
    localPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    localPreviewUrlsRef.current.clear();
  }, []);

  const deleteFromVisitAndCloud = async (image: PatientImageMetadata) => {
    if (!userId || deletingImageId) return;
    const confirmed = window.confirm(
      'هل تريد حذف هذه الصورة نهائيًا من الكشف وملف المريض والتخزين السحابي؟ لا يمكن استرجاعها بعد الحذف.',
    );
    if (!confirmed) return;

    setDeletingImageId(image.id);
    try {
      await deletePatientImage(userId, image);
      if (openImage?.id === image.id) setOpenImage(null);
      const localUrl = localPreviewUrlsRef.current.get(image.id);
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
        localPreviewUrlsRef.current.delete(image.id);
        setLocalPreviewUrls((current) => {
          const next = { ...current };
          delete next[image.id];
          return next;
        });
      }
      onChange(images.filter((item) => item.id !== image.id));
    } catch (error) {
      setNotice({
        title: 'تعذر حذف الصورة',
        message: error instanceof Error
          ? error.message
          : 'لم يتم حذف الصورة من التخزين السحابي. حاول مرة أخرى.',
        tone: 'error',
      });
    } finally {
      setDeletingImageId('');
    }
  };

  const openPicker = () => {
    if (!canUsePatientImages(accountType)) {
      setNotice({ title: 'ميزة صور الفحوصات', message: PATIENT_IMAGES_PRO_MAX_MESSAGE, tone: 'pro' });
      return;
    }
    if (!patientName.trim()) {
      setNotice({ title: 'أدخل اسم المريض أولاً', message: 'يلزم إدخال اسم المريض قبل إضافة الصور حتى يتم ربطها بملفه الصحيح.', tone: 'error' });
      return;
    }
    if (patientImageCount >= MAX_PATIENT_IMAGES) {
      setNotice({ title: 'اكتمل حد الصور', message: getPatientImagesLimitMessage(), tone: 'limit' });
      return;
    }
    inputRef.current?.click();
  };

  const handleSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;
    const available = Math.max(0, MAX_PATIENT_IMAGES - patientImageCount);
    if (selected.length > available) {
      setNotice({ title: 'الصور المختارة أكثر من المتاح', message: getPatientImagesLimitMessage(available), tone: 'limit' });
      return;
    }

    const uploaded: PatientImageMetadata[] = [];
    try {
      for (let index = 0; index < selected.length; index += 1) {
        setUploading({ current: index + 1, total: selected.length, percent: 0, phase: 'compressing' });
        const uploadedImage = await uploadPatientImage({
          userId,
          patientName,
          phone,
          patientFileId: patientFileId || undefined,
          patientFileNumber: patientFileNumber || undefined,
          patientFileNameKey: patientFileNameKey || undefined,
          file: selected[index],
          source: 'investigations',
          onProgress: ({ percent, phase }) => setUploading({
            current: index + 1,
            total: selected.length,
            percent,
            phase,
          }),
        });
        uploaded.push(uploadedImage);
        if (typeof URL.createObjectURL === 'function') {
          const previewUrl = URL.createObjectURL(selected[index]);
          localPreviewUrlsRef.current.set(uploadedImage.id, previewUrl);
          setLocalPreviewUrls((current) => ({ ...current, [uploadedImage.id]: previewUrl }));
        }
      }
      onChange([...images, ...uploaded]);
      // عند وجود ملف فعلي، الاشتراك اللحظي هو مصدر العدد الوحيد حتى لا نحسب
      // نفس الصورة مرتين (مرة من onSnapshot ومرة محلياً). قبل إنشاء الملف فقط
      // نحتفظ بعدد مؤقت لباقي الصور المضافة في نفس الكشف.
      if (!patientFileId) setPatientImageCount((count) => count + uploaded.length);
    } catch (error) {
      if (uploaded.length) onChange([...images, ...uploaded]);
      setNotice({
        title: 'تعذر إكمال رفع الصور',
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء ضغط ورفع الصور. حاول مرة أخرى.',
        tone: 'error',
      });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="mt-2 rounded-2xl border border-dashed border-sky-300 bg-sky-50/70 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-black text-sky-900">صور الفحوصات</div>
          <div className="mt-0.5 text-[10px] font-bold leading-5 text-sky-700">تُضغط قبل الرفع، تُحلل مع الحالة، وتظهر في ملف المريض والسجل.</div>
        </div>
        <button type="button" onClick={openPicker} disabled={Boolean(uploading)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-sky-700 disabled:bg-slate-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.5M12 8v6m-3-3h6M3 16.5l4-4 3 3 3-3 8 6" /></svg>
          {uploading ? `ضغط ورفع ${uploading.current}/${uploading.total}` : 'إضافة صور'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleSelected} />
      </div>

      {uploading && <PatientImageUploadProgress {...uploading} />}

      {images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((image) => (
            <div key={image.id} className="flex w-full max-w-full items-center gap-2 rounded-xl border border-sky-200 bg-white p-2 text-[10px] font-bold text-slate-700 shadow-sm sm:w-auto">
              <InvestigationImageThumbnail
                image={image}
                localUrl={localPreviewUrls[image.id]}
                onOpen={() => setOpenImage(image)}
              />
              <span className="min-w-0 flex-1 sm:max-w-[180px]">
                <span className="block truncate">{image.originalName}</span>
                <span className="mt-0.5 block text-[9px] text-slate-400">{image.width}×{image.height}</span>
              </span>
              <button
                type="button"
                onClick={() => void deleteFromVisitAndCloud(image)}
                disabled={Boolean(deletingImageId)}
                className="shrink-0 rounded-lg bg-danger-600 px-2 py-1 text-white hover:bg-danger-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                aria-label={`حذف ${image.originalName} نهائيًا من الكشف والسحابة`}
              >
                {deletingImageId === image.id ? 'جاري الحذف...' : 'حذف نهائي'}
              </button>
            </div>
          ))}
        </div>
      )}

      <PatientImageLightbox
        image={openImage}
        sourceUrl={openImage ? localPreviewUrls[openImage.id] : undefined}
        onClose={() => setOpenImage(null)}
      />
      <PatientImagesNoticeModal open={Boolean(notice)} title={notice?.title || ''} message={notice?.message || ''} tone={notice?.tone} onClose={() => setNotice(null)} />
    </div>
  );
};
