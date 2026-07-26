import React, { useEffect, useState } from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';
import {
  loadPatientImageObjectUrl,
  type PatientImageMetadata,
} from '../../services/patient-files/images';

interface PatientImageLightboxProps {
  image: PatientImageMetadata | null;
  sourceUrl?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

const clampZoom = (value: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatUploadDate = (uploadedAtMs: number): string => {
  if (!Number.isFinite(uploadedAtMs) || uploadedAtMs <= 0) return '';
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    .format(new Date(uploadedAtMs));
};

export const PatientImageLightbox: React.FC<PatientImageLightboxProps> = ({
  image,
  sourceUrl,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    setZoom(MIN_ZOOM);
    setLoadError(false);
    setImageUrl(sourceUrl || '');
    if (!image || sourceUrl) return undefined;

    let active = true;
    let objectUrl = '';
    loadPatientImageObjectUrl(image.storagePath)
      .then((url) => {
        if (!active) return URL.revokeObjectURL(url);
        objectUrl = url;
        setImageUrl(url);
      })
      .catch(() => active && setLoadError(true));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image?.id, image?.storagePath, sourceUrl]);

  useEffect(() => {
    if (!image) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '+' || event.key === '=') {
        setZoom((current) => clampZoom(current + ZOOM_STEP));
      } else if (event.key === '-') {
        setZoom((current) => clampZoom(current - ZOOM_STEP));
      } else if (event.key === '0') {
        setZoom(MIN_ZOOM);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image]);

  const uploadedAt = image ? formatUploadDate(image.uploadedAtMs) : '';

  return (
    <ModalOverlay
      isOpen={Boolean(image)}
      onClose={onClose}
      zIndex={10100}
      backdropClass="bg-slate-950/95"
      overlayClassName="p-0"
      contentClassName="flex h-[100dvh] w-screen flex-col overflow-hidden"
      labelledBy="patient-image-viewer-title"
      animateIn="fade"
    >
      {image && (
        <>
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/90 px-3 py-2 text-white sm:px-5 sm:py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-black hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="الرجوع من عرض الصورة"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
              رجوع
            </button>

            <div className="min-w-0 flex-1 text-right" dir="rtl">
              <div id="patient-image-viewer-title" className="truncate text-xs font-black sm:text-sm">{image.originalName}</div>
              <div className="truncate text-[10px] font-bold text-slate-300 sm:text-xs">
                {image.width}×{image.height} · {formatBytes(image.compressedSizeBytes)}
                {uploadedAt ? ` · ${uploadedAt}` : ''}
              </div>
            </div>

            {imageUrl && (
              <a
                href={imageUrl}
                download={image.originalName || 'patient-image'}
                className="hidden min-h-10 items-center rounded-xl bg-sky-600 px-3 py-2 text-xs font-black text-white hover:bg-sky-700 sm:inline-flex"
              >
                تنزيل
              </a>
            )}
          </header>

          <div className="relative min-h-0 flex-1 overflow-auto bg-black/40">
            <div
              className="flex min-h-full min-w-full items-center justify-center p-2 sm:p-4"
              style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={image.originalName}
                  draggable={false}
                  className="max-h-[calc(100dvh-9rem)] max-w-[calc(100vw-1rem)] select-none object-contain transition-transform duration-200 sm:max-w-[calc(100vw-2rem)]"
                  style={{ transform: `scale(${zoom})` }}
                />
              ) : (
                <div className="rounded-xl bg-white/10 px-5 py-4 text-center text-sm font-bold text-white">
                  {loadError ? 'تعذر تحميل الصورة. حاول فتحها مرة أخرى.' : 'جاري تحميل الصورة...'}
                </div>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3 sm:bottom-6">
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-white/15 bg-slate-950/90 p-1.5 text-white shadow-2xl backdrop-blur sm:gap-2 sm:p-2">
              <button
                type="button"
                onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
                disabled={zoom <= MIN_ZOOM}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl font-black hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="تصغير الصورة"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoom(MIN_ZOOM)}
                className="min-w-[68px] rounded-xl bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"
                aria-label="إرجاع حجم الصورة إلى 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
                disabled={zoom >= MAX_ZOOM}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-xl font-black hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="تكبير الصورة"
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </ModalOverlay>
  );
};
