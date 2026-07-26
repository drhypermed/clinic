import {
  collection,
  documentId,
  getDocs,
  onSnapshot,
  query,
  type Unsubscribe,
  where,
} from 'firebase/firestore';
import {
  getBlob,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, functions, storage } from '../firebaseConfig';
import { ensurePatientFileReference } from './patientFileReference';
import { toPositiveInteger, toTrimmedText } from './normalizers';
import {
  getPatientImagesLimitMessage,
  MAX_CASE_ANALYSIS_IMAGES,
  MAX_PATIENT_IMAGE_BYTES,
  MAX_PATIENT_IMAGES,
} from './patientImagePolicy';

export {
  canUsePatientImages,
  getPatientImagesLimitMessage,
  MAX_CASE_ANALYSIS_IMAGES,
  MAX_PATIENT_IMAGE_BYTES,
  MAX_PATIENT_IMAGES,
  PATIENT_IMAGES_PRO_MAX_MESSAGE,
  PATIENT_IMAGES_REQUIRED_ACCOUNT_TYPE,
} from './patientImagePolicy';
export type { PatientImagesAccountType } from './patientImagePolicy';

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// نبدأ بجودة مرتفعة وننزل تدريجيًا حتى حد آمن للتفاصيل الدقيقة في الأشعة/التحاليل.
// الهدف يتغير حسب عدد البكسلات، مع سقف 1 MB لتقليل تكلفة التخزين دون تغيير الأبعاد.
const WEBP_QUALITIES = [0.8, 0.74, 0.68, 0.62];
const MIN_DETAIL_SAFE_TARGET_BYTES = 320 * 1024;
const MAX_DETAIL_SAFE_TARGET_BYTES = 1024 * 1024;
const STALE_UPLOAD_RESERVATION_MS = 2 * 60 * 60 * 1000;
let webpEncodingSupport: boolean | null = null;
const staleReservationsBeingReleased = new Set<string>();

type PatientImageUploadFailurePhase = 'reservation' | 'storage' | 'finalize';

const toPatientImageUploadError = (error: unknown, phase: PatientImageUploadFailurePhase): Error => {
  const code = String((error as { code?: unknown })?.code || '').toLowerCase();
  const message = String((error as { message?: unknown })?.message || '').toLowerCase();
  if (code.includes('resource-exhausted') || message.includes('patient_images_limit_reached')) {
    return new Error(getPatientImagesLimitMessage());
  }
  if (message.includes('patient_images_require_pro_max')) {
    return new Error('ميزة صور ملفات المرضى متاحة فقط ضمن باقة برو ماكس.');
  }
  const isPermissionError = code.includes('permission-denied')
    || code.includes('unauthorized')
    || message.includes('missing or insufficient permissions');
  if (isPermissionError) {
    if (phase === 'storage') {
      return new Error('تم حجز الصورة، لكن التخزين رفض رفعها. حاول مرة أخرى بعد لحظات.');
    }
    return new Error('تعذر التحقق من صلاحية رفع صور المريض على الخادم. حاول مرة أخرى.');
  }
  return error instanceof Error ? error : new Error('حدث خطأ أثناء ضغط ورفع الصورة. حاول مرة أخرى.');
};

export interface PatientImageMetadata {
  id: string;
  patientFileId: string;
  patientFileNameKey: string;
  originalName: string;
  storagePath: string;
  contentType: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  uploadedAtMs: number;
  status: 'uploading' | 'ready';
  source?: 'patient_file' | 'investigations';
}

export interface CaseAnalysisImage {
  id: string;
  mimeType: 'image/jpeg';
  data: string;
}

export type PatientImageUploadPhase = 'compressing' | 'reserving' | 'uploading' | 'finalizing' | 'completed';

export interface PatientImageUploadProgress {
  phase: PatientImageUploadPhase;
  percent: number;
}

interface UploadPatientImageInput {
  userId: string;
  patientName: string;
  file: File;
  phone?: string;
  patientFileId?: string;
  patientFileNumber?: number;
  patientFileNameKey?: string;
  source?: PatientImageMetadata['source'];
  onProgress?: (progress: PatientImageUploadProgress) => void;
}

interface CompressedPatientImage {
  blob: Blob;
  width: number;
  height: number;
  contentType: string;
  extension: 'jpg' | 'png' | 'webp';
}

const extensionForType = (contentType: string): 'jpg' | 'png' | 'webp' => {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
};

const supportsWebpEncoding = (): boolean => {
  if (webpEncodingSupport !== null) return webpEncodingSupport;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    webpEncodingSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpEncodingSupport = false;
  }
  return webpEncodingSupport;
};

const loadImage = (file: File): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('تعذر قراءة الصورة. استخدم JPG أو PNG أو WebP.'));
  };
  image.src = objectUrl;
});

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  contentType: string,
  quality?: number,
): Promise<Blob | null> => new Promise((resolve) => {
  canvas.toBlob(resolve, contentType, quality);
});

/**
 * يعيد ترميز الصورة لتقليل الحجم من دون تغيير العرض أو الارتفاع نهائياً.
 * نحتفظ بالأصل فقط إذا كان أصغر من كل النسخ المعاد ترميزها (أي إنه مضغوط أفضل بالفعل).
 */
export const compressPatientImagePreservingDimensions = async (
  file: File,
): Promise<CompressedPatientImage> => {
  const inputType = String(file.type || '').toLowerCase();
  if (!SUPPORTED_IMAGE_TYPES.has(inputType)) {
    throw new Error('نوع الصورة غير مدعوم. الأنواع المتاحة: JPG وPNG وWebP.');
  }

  const image = await loadImage(file);
  const width = Math.max(1, image.naturalWidth || image.width);
  const height = Math.max(1, image.naturalHeight || image.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    canvas.width = 0;
    canvas.height = 0;
    throw new Error('المتصفح لم يتمكن من تجهيز الصورة للضغط.');
  }
  context.drawImage(image, 0, 0, width, height);

  const canUseWebp = supportsWebpEncoding();
  const outputType = canUseWebp ? 'image/webp' : (inputType === 'image/png' ? 'image/png' : 'image/jpeg');
  const candidates: Blob[] = [];
  const detailSafeTargetBytes = Math.min(
    MAX_DETAIL_SAFE_TARGET_BYTES,
    Math.max(MIN_DETAIL_SAFE_TARGET_BYTES, Math.round(width * height * 0.09)),
  );

  if (outputType === 'image/png') {
    const pngBlob = await canvasToBlob(canvas, outputType);
    if (pngBlob) candidates.push(pngBlob);
  } else {
    for (const quality of WEBP_QUALITIES) {
      const candidate = await canvasToBlob(canvas, outputType, quality);
      if (candidate) candidates.push(candidate);
      // أول نسخة تحقق الهدف هي الأعلى جودة الممكنة؛ لا ننزل بالجودة بلا داعٍ.
      if (candidate && candidate.size <= detailSafeTargetBytes) break;
    }
  }

  canvas.width = 0;
  canvas.height = 0;

  const smallestEncoded = candidates.reduce<Blob | null>(
    (smallest, candidate) => (!smallest || candidate.size < smallest.size ? candidate : smallest),
    null,
  );
  const chosen = smallestEncoded && smallestEncoded.size < file.size ? smallestEncoded : file;
  if (chosen.size >= MAX_PATIENT_IMAGE_BYTES) {
    throw new Error('الصورة ما زالت أكبر من 5 MB بعد الضغط. جرّب صورة أقل حجماً.');
  }

  const contentType = chosen.type || inputType;
  return {
    blob: chosen,
    width,
    height,
    contentType,
    extension: extensionForType(contentType),
  };
};

const reservePatientImageUploadCallable = httpsCallable<
  Omit<PatientImageMetadata, 'id' | 'storagePath' | 'uploadedAtMs' | 'status'> & { patientFileNumber: number },
  { image: PatientImageMetadata }
>(functions, 'reservePatientImageUpload');
const finalizePatientImageUploadCallable = httpsCallable<{ imageId: string }, { ok: boolean }>(
  functions,
  'finalizePatientImageUpload',
);
const deletePatientImageCallable = httpsCallable<{ imageId: string }, { ok: boolean }>(
  functions,
  'deletePatientImage',
);

export const uploadPatientImage = async (
  input: UploadPatientImageInput,
): Promise<PatientImageMetadata> => {
  const userId = toTrimmedText(input.userId);
  const patientName = toTrimmedText(input.patientName);
  if (!userId || !patientName) throw new Error('بيانات ملف المريض غير مكتملة.');

  input.onProgress?.({ phase: 'compressing', percent: 2 });
  const compressed = await compressPatientImagePreservingDimensions(input.file);
  input.onProgress?.({ phase: 'compressing', percent: 18 });
  let patientFileId = toTrimmedText(input.patientFileId);
  let patientFileNameKey = toTrimmedText(input.patientFileNameKey);
  let patientFileNumber = toPositiveInteger(input.patientFileNumber);
  if (!patientFileId || !patientFileNameKey || !patientFileNumber) {
    const ensured = await ensurePatientFileReference(userId, patientName, toTrimmedText(input.phone) || undefined);
    if (!ensured) throw new Error('تعذر تجهيز مرجع ملف المريض.');
    patientFileId = patientFileId || ensured.patientFileId;
    patientFileNameKey = patientFileNameKey || ensured.patientFileNameKey;
    patientFileNumber = patientFileNumber || ensured.patientFileNumber;
  }
  let metadata: PatientImageMetadata;
  try {
    input.onProgress?.({ phase: 'reserving', percent: 20 });
    const reservation = await reservePatientImageUploadCallable({
      patientFileId,
      patientFileNameKey,
      originalName: String(input.file.name || 'صورة مريض').slice(0, 180),
      contentType: compressed.contentType,
      width: compressed.width,
      height: compressed.height,
      originalSizeBytes: input.file.size,
      compressedSizeBytes: compressed.blob.size,
      patientFileNumber,
      source: input.source || 'patient_file',
    });
    metadata = reservation.data.image;
    input.onProgress?.({ phase: 'reserving', percent: 25 });
  } catch (error) {
    throw toPatientImageUploadError(error, 'reservation');
  }

  try {
    const uploadTask = uploadBytesResumable(ref(storage, metadata.storagePath), compressed.blob, {
      contentType: compressed.contentType,
      cacheControl: 'private,max-age=86400',
      customMetadata: {
        patientFileId,
        patientImageId: metadata.id,
        uploadedAtMs: String(metadata.uploadedAtMs),
      },
    });
    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed', (snapshot) => {
        const transferredRatio = snapshot.totalBytes > 0
          ? snapshot.bytesTransferred / snapshot.totalBytes
          : 0;
        input.onProgress?.({
          phase: 'uploading',
          percent: Math.min(95, Math.max(25, Math.round(25 + transferredRatio * 70))),
        });
      }, reject, resolve);
    });
  } catch (error) {
    await deletePatientImageCallable({ imageId: metadata.id }).catch(() => undefined);
    throw toPatientImageUploadError(error, 'storage');
  }

  try {
    input.onProgress?.({ phase: 'finalizing', percent: 97 });
    await finalizePatientImageUploadCallable({ imageId: metadata.id });
    input.onProgress?.({ phase: 'completed', percent: 100 });
    return { ...metadata, status: 'ready' };
  } catch (error) {
    await deletePatientImageCallable({ imageId: metadata.id }).catch(() => undefined);
    throw toPatientImageUploadError(error, 'finalize');
  }
};

export const deletePatientImage = async (
  _userId: string,
  image: PatientImageMetadata,
): Promise<void> => {
  await deletePatientImageCallable({ imageId: image.id });
};

export const deletePatientImagesByIds = async (
  _userId: string,
  imageIds: string[],
): Promise<void> => {
  const uniqueIds = Array.from(new Set(imageIds.map(toTrimmedText).filter(Boolean))).slice(0, MAX_PATIENT_IMAGES);
  await Promise.all(uniqueIds.map((imageId) => deletePatientImageCallable({ imageId })));
};

export const subscribeToPatientImages = (
  userId: string,
  patientFileId: string,
  onImages: (images: PatientImageMetadata[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const imagesRef = collection(db, 'users', userId, 'patientImages');
  const patientQuery = query(imagesRef, where('patientFileId', '==', patientFileId));
  return onSnapshot(patientQuery, (snapshot) => {
    const allImages = snapshot.docs.map((item) => {
      const data = item.data();
      const serverCreatedAtMs = typeof data.createdAt?.toMillis === 'function'
        ? Number(data.createdAt.toMillis())
        : 0;
      return {
        id: item.id,
        ...data,
        uploadedAtMs: serverCreatedAtMs || Number(data.uploadedAtMs || 0),
      } as PatientImageMetadata;
    });

    // لو المتصفح اتقفل وسط الرفع، نحرر الحجز القديم ونحذف أي object جزئي/يتيم.
    // ساعتان أكبر كثيراً من زمن رفع 5 MB، فلا نمس رفعاً فعلياً ما زال جارياً.
    allImages
      .filter((item) => item.status === 'uploading'
        && item.uploadedAtMs > 0
        && item.uploadedAtMs < Date.now() - STALE_UPLOAD_RESERVATION_MS)
      .forEach((item) => {
        const reservationKey = `${userId}:${item.id}`;
        if (staleReservationsBeingReleased.has(reservationKey)) return;
        staleReservationsBeingReleased.add(reservationKey);
        deletePatientImage(userId, item)
          .catch(() => undefined)
          .finally(() => staleReservationsBeingReleased.delete(reservationKey));
      });

    const images = allImages
      .filter((item) => item.patientFileId === patientFileId && item.status === 'ready')
      .sort((left, right) => right.uploadedAtMs - left.uploadedAtMs);
    onImages(images);
  }, (error) => onError?.(error));
};

export const loadPatientImageObjectUrl = async (storagePath: string): Promise<string> => {
  const blob = await getBlob(ref(storage, storagePath), MAX_PATIENT_IMAGE_BYTES);
  return URL.createObjectURL(blob);
};

/**
 * يجلب صور زيارة بعينها من مراجع السجل. نقسم الاستعلامات إلى مجموعات لأن Firestore
 * يضع حداً على عدد القيم في عامل in.
 */
export const loadPatientImagesByIds = async (
  userId: string,
  imageIds: string[],
): Promise<PatientImageMetadata[]> => {
  const uniqueIds = Array.from(new Set(imageIds.map(toTrimmedText).filter(Boolean))).slice(0, MAX_PATIENT_IMAGES);
  if (!userId || uniqueIds.length === 0) return [];

  const chunks: string[][] = [];
  for (let index = 0; index < uniqueIds.length; index += 30) {
    chunks.push(uniqueIds.slice(index, index + 30));
  }
  const snapshots = await Promise.all(chunks.map((ids) => getDocs(query(
    collection(db, 'users', userId, 'patientImages'),
    where(documentId(), 'in', ids),
  ))));
  const byId = new Map<string, PatientImageMetadata>();
  snapshots.forEach((snapshot) => snapshot.docs.forEach((item) => {
    const data = item.data();
    if (data.status !== 'ready') return;
    byId.set(item.id, { id: item.id, ...data } as PatientImageMetadata);
  }));
  return uniqueIds.map((id) => byId.get(id)).filter((item): item is PatientImageMetadata => Boolean(item));
};

const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
  reader.onerror = () => reject(new Error('تعذر تجهيز الصورة للتحليل.'));
  reader.readAsDataURL(blob);
});

/**
 * ينشئ نسخة مؤقتة للتحليل فقط (حد أقصى 1600px وجودة JPEG اقتصادية).
 * النسخة المحفوظة في ملف المريض لا تتغير وتظل بأبعادها الأصلية.
 */
export const loadPatientImagesForCaseAnalysis = async (
  images: PatientImageMetadata[],
): Promise<CaseAnalysisImage[]> => {
  const selectedImages = images.slice(0, MAX_CASE_ANALYSIS_IMAGES);
  const targetBytesPerImage = Math.max(70 * 1024, Math.floor((5.5 * 1024 * 1024) / Math.max(1, selectedImages.length)));
  const initialMaxSide = selectedImages.length <= 6 ? 1600 : selectedImages.length <= 15 ? 1200 : 900;

  return Promise.all(selectedImages.map(async (image) => {
  const sourceBlob = await getBlob(ref(storage, image.storagePath), MAX_PATIENT_IMAGE_BYTES);
  const file = new File([sourceBlob], image.originalName || `${image.id}.jpg`, { type: sourceBlob.type || image.contentType });
  const loaded = await loadImage(file);
  const canvas = document.createElement('canvas');
  let analysisBlob: Blob | null = null;
  for (const sizeFactor of [1, 0.8, 0.65, 0.5]) {
    const maxSide = Math.round(initialMaxSide * sizeFactor);
    const scale = Math.min(1, maxSide / Math.max(loaded.naturalWidth, loaded.naturalHeight));
    canvas.width = Math.max(1, Math.round(loaded.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(loaded.naturalHeight * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('تعذر تجهيز الصورة للتحليل.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(loaded, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.68, 0.55, 0.42]) {
      const candidate = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (candidate && (!analysisBlob || candidate.size < analysisBlob.size)) analysisBlob = candidate;
      if (candidate && candidate.size <= targetBytesPerImage) break;
    }
    if (analysisBlob && analysisBlob.size <= targetBytesPerImage) break;
  }
  canvas.width = 0;
  canvas.height = 0;
  if (!analysisBlob) throw new Error('تعذر ضغط الصورة للتحليل.');
  return { id: image.id, mimeType: 'image/jpeg' as const, data: await blobToBase64(analysisBlob) };
  }));
};
