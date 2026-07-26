import React, { useEffect, useRef, useState } from 'react';
import {
  deletePatientImage,
  loadPatientImageObjectUrl,
  type PatientImageMetadata,
} from '../../services/patient-files/images';
import { PatientImageLightbox } from './PatientImageLightbox';

interface PatientImagesGalleryProps {
  userId: string;
  images: PatientImageMetadata[];
  sourceUrls?: Record<string, string>;
  onDeleted: (imageId: string) => void;
  emptyMessage?: string;
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const PatientImageThumbnail: React.FC<{
  image: PatientImageMetadata;
  sourceUrl?: string;
  onOpen: (image: PatientImageMetadata, url?: string) => void;
}> = ({ image, sourceUrl, onOpen }) => {
  const hostRef = useRef<HTMLButtonElement | null>(null);
  const [src, setSrc] = useState(sourceUrl || '');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (sourceUrl) {
      setSrc(sourceUrl);
      return undefined;
    }

    const host = hostRef.current;
    if (!host) return undefined;
    let active = true;
    let objectUrl = '';

    const load = () => {
      loadPatientImageObjectUrl(image.storagePath)
        .then((url) => {
          if (!active) return URL.revokeObjectURL(url);
          objectUrl = url;
          setSrc(url);
        })
        .catch(() => active && setFailed(true));
    };

    if (typeof IntersectionObserver === 'undefined') {
      load();
    } else {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      }, { rootMargin: '180px' });
      observer.observe(host);
      return () => {
        active = false;
        observer.disconnect();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image.storagePath, sourceUrl]);

  return (
    <button
      ref={hostRef}
      type="button"
      onClick={() => onOpen(image, src || undefined)}
      className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-sky-100 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      title="اضغط لعرض الصورة بالكامل"
      aria-label={`فتح الصورة ${image.originalName}`}
    >
      {src ? (
        <img src={src} alt={image.originalName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      ) : (
        <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-bold text-slate-500">
          {failed ? 'تعذر عرض الصورة' : 'جاري التحميل...'}
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 truncate bg-slate-950/70 px-2 py-1 text-[9px] font-bold text-white">
        {image.width}×{image.height} · {formatBytes(image.compressedSizeBytes)}
      </span>
    </button>
  );
};

export const PatientImagesGallery: React.FC<PatientImagesGalleryProps> = ({
  userId,
  images,
  sourceUrls = {},
  onDeleted,
  emptyMessage = 'لا توجد صور مضافة لهذا المريض.',
  className = 'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
}) => {
  const [openImage, setOpenImage] = useState<{ image: PatientImageMetadata; url?: string } | null>(null);
  const [deletingId, setDeletingId] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const handleDelete = async (image: PatientImageMetadata) => {
    if (!userId || deletingId) return;
    const confirmed = window.confirm(
      'هل تريد حذف هذه الصورة نهائيًا من السجل وصور المريض والسحابة؟ لا يمكن استرجاعها بعد الحذف.',
    );
    if (!confirmed) return;

    setDeletingId(image.id);
    setFeedback(null);
    try {
      await deletePatientImage(userId, image);
      if (openImage?.image.id === image.id) setOpenImage(null);
      onDeleted(image.id);
      setFeedback({ tone: 'success', message: 'تم حذف الصورة نهائيًا من السجل وصور المريض والسحابة.' });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'تعذر حذف الصورة نهائيًا. حاول مرة أخرى.',
      });
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      {feedback && (
        <div className={`mb-3 rounded-lg border px-3 py-2 text-[11px] font-black ${feedback.tone === 'success' ? 'border-success-200 bg-success-50 text-success-700' : 'border-danger-200 bg-danger-50 text-danger-700'}`}>
          {feedback.message}
        </div>
      )}

      {images.length === 0 ? (
        <div className="py-5 text-center text-xs font-bold text-slate-500">{emptyMessage}</div>
      ) : (
        <div className={className}>
          {images.map((image) => (
            <div key={image.id} className="min-w-0 space-y-1.5">
              <PatientImageThumbnail
                image={image}
                sourceUrl={sourceUrls[image.id]}
                onOpen={(selectedImage, url) => setOpenImage({ image: selectedImage, url })}
              />
              <div className="truncate px-1 text-[10px] font-bold text-slate-600" title={image.originalName}>
                {image.originalName}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(image)}
                disabled={Boolean(deletingId)}
                className="w-full rounded-lg bg-danger-600 px-2 py-1.5 text-[10px] font-black text-white hover:bg-danger-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                aria-label={`حذف الصورة ${image.originalName} نهائيًا`}
              >
                {deletingId === image.id ? 'جاري الحذف...' : 'حذف نهائي'}
              </button>
            </div>
          ))}
        </div>
      )}

      <PatientImageLightbox
        image={openImage?.image || null}
        sourceUrl={openImage?.url || (openImage ? sourceUrls[openImage.image.id] : undefined)}
        onClose={() => setOpenImage(null)}
      />
    </>
  );
};
