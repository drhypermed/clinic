import { deleteObject, getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from './firebaseConfig';
import { auth } from './firebaseConfig';

/**
 * خدمة التخزين السحابي (Storage Service)
 * مسؤولة عن رفع وحذف ومعالجة الصور والملفات في Firebase Storage
 * تشمل: الصور الشخصية، مستندات التحقق، وصور الإعلانات للأطباء.
 */

const storage = getStorage(app);

// ─── ضغط الصور قبل الرفع ───
// صور البروفايل: 800×800، WebP بجودة 78% — ~100–250KB (كان 100-300KB @JPEG)
// صور الإعلان: 1280×1280، WebP بجودة 82% — جودة عرض أعلى بنفس التكلفة تقريباً
const MAX_IMAGE_DIMENSION_PROFILE = 800;
const MAX_IMAGE_DIMENSION_AD = 1280;
const IMAGE_QUALITY_PROFILE = 0.78;
const IMAGE_QUALITY_AD = 0.82;

/** فحص دعم المتصفح لـ WebP عند التصدير من canvas (مرة واحدة وبيتكاش) */
let webpSupportCache: boolean | null = null;
const supportsWebpEncoding = (): boolean => {
  if (webpSupportCache !== null) return webpSupportCache;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    webpSupportCache = dataUrl.startsWith('data:image/webp');
  } catch {
    webpSupportCache = false;
  }
  return webpSupportCache;
};

interface CompressOptions {
  /** الحد الأقصى لأطول بُعد بالبكسل (default: 800) */
  maxDimension?: number;
  /** جودة الضغط من 0 إلى 1 للـ JPEG/WebP (default: 0.78) */
  quality?: number;
}

/**
 * ضغط صورة من Blob/File باستخدام Canvas.
 * يصغّر الأبعاد عند تخطي maxDimension ويفضّل WebP (أصغر من JPEG بنحو 25–35%)
 * مع fallback لـ JPEG لأي متصفح قديم. يحافظ على الشفافية للـ PNG.
 */
const compressImage = async (input: Blob, options: CompressOptions = {}): Promise<Blob> => {
  const maxDimension = options.maxDimension ?? MAX_IMAGE_DIMENSION_PROFILE;
  const quality = options.quality ?? IMAGE_QUALITY_PROFILE;

  // لو مش صورة (مثلاً PDF)، ارجعها زي ما هي
  if (!input.type.startsWith('image/')) return input;
  // SVG و GIF ما نضغطهمش (SVG vector, GIF ممكن animated)
  if (input.type === 'image/svg+xml' || input.type === 'image/gif') return input;
  // لو الصورة أصلاً صغيرة (أقل من 200 كيلو)، مش محتاج ضغط
  if (input.size < 200 * 1024) return input;

  // اختيار الصيغة: PNG يحافظ على الشفافية، غير كده نستخدم WebP لو مدعوم وإلا JPEG.
  const isPng = input.type === 'image/png';
  const outputType = isPng
    ? 'image/png'
    : (supportsWebpEncoding() ? 'image/webp' : 'image/jpeg');
  const outputQuality = outputType === 'image/png' ? undefined : quality;

  return new Promise<Blob>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(input);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // تصغير الأبعاد مع الحفاظ على النسبة
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { canvas.width = canvas.height = 0; resolve(input); return; }

      ctx.drawImage(img, 0, 0, width, height);

      let blobResolved = false;
      const blobTimeout = window.setTimeout(() => {
        if (!blobResolved) { blobResolved = true; canvas.width = canvas.height = 0; resolve(input); }
      }, 10_000);

      canvas.toBlob(
        (blob) => {
          if (blobResolved) return;
          blobResolved = true;
          window.clearTimeout(blobTimeout);
          // تنظيف الـ canvas لتحرير ذاكرة الـ GPU (مهم على الموبايل)
          canvas.width = canvas.height = 0;
          resolve(blob || input);
        },
        outputType,
        outputQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(input); // لو فشل الضغط، ارفع الأصلية
    };

    img.src = url;
  });
};

/**
 * رفع صورة الملف الشخصي من كائن File
 */
const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
    try {
        // نمسح الصور القديمة الأول عشان ما تتراكمش وتكلف فلوس تخزين
        await cleanupOldFilesInFolder(`users/${userId}/profile`);
        const compressed = await compressImage(file);
        const fileName = `profile_${Date.now()}.jpg`;
        const storageRef = ref(storage, `users/${userId}/profile/${fileName}`);
        const snapshot = await uploadBytes(storageRef, compressed);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error('[Storage] Error uploading photo:', error);
        throw new Error(error.message || 'حدث خطأ أثناء رفع الصورة');
    }
};

/**
 * رفع صورة من بيانات Base64 (مفيد عند استخدام كاميرا الويب أو تعديل الصور في المتصفح)
 */
const uploadBase64Photo = async (userId: string, base64Data: string): Promise<string> => {
    try {
        await cleanupOldFilesInFolder(`users/${userId}/profile`);
        const response = await fetch(base64Data);
        const blob = await response.blob();
        const compressed = await compressImage(blob);
        const fileName = `profile_${Date.now()}.jpg`;
        const storageRef = ref(storage, `users/${userId}/profile/${fileName}`);
        const snapshot = await uploadBytes(storageRef, compressed);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error('[Storage] Error uploading photo:', error);
        throw new Error(error.message || 'حدث خطأ أثناء رفع الصورة');
    }
};

/**
 * رفع مستندات التحقق (مثل كارنيه النقابة) لغرض توثيق حساب الطبيب
 */
const uploadVerificationDoc = async (userId: string, file: File): Promise<string> => {
    try {
        const fileName = `verification_${Date.now()}.${file.type.split('/')[1] || 'jpg'}`;
        const storageRef = ref(storage, `verification_docs/${userId}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error('[Storage] Error uploading verification doc:', error);
        throw new Error(error.message || 'حدث خطأ أثناء رفع ملف التحقق');
    }
};

/** وظيفة مساعدة لاستخراج الامتداد من نوع MIME */
const getExtensionFromMime = (mimeType: string) => {
    const subtype = (mimeType || '').split('/')[1] || 'jpg';
    return subtype.split(';')[0].trim() || 'jpg';
};

/** التحقق مما إذا كان الخطأ بسبب عدم وجود الملف */
const isNotFoundStorageError = (error: any) => {
    const code = typeof error?.code === 'string' ? error.code : '';
    return code === 'storage/object-not-found';
};

/** التحقق مما إذا كان الخطأ بسبب رابط غير صالح */
const isInvalidStorageUrlError = (error: any) => {
    const code = typeof error?.code === 'string' ? error.code : '';
    return code === 'storage/invalid-url' || code === 'storage/invalid-argument';
};

/**
 * حذف الصور القديمة من مجلد قبل رفع صورة جديدة.
 * بيمنع تراكم الصور القديمة اللي محدش بيستعملها وبتكلف فلوس تخزين.
 */
const cleanupOldFilesInFolder = async (folderPath: string): Promise<void> => {
    try {
        const { listAll } = await import('firebase/storage');
        const folderRef = ref(storage, folderPath);
        const result = await listAll(folderRef);
        // امسح كل الملفات القديمة — الملف الجديد هيترفع بعدها
        await Promise.all(
            result.items.map(async (itemRef) => {
                try { await deleteObject(itemRef); } catch { /* تجاهل لو الملف مش موجود */ }
            })
        );
    } catch {
        // لو المجلد مش موجود أصلاً أو حصل خطأ — مش مشكلة، الصورة الجديدة هتترفع عادي
    }
};

/** حذف ملف من التخزين بشكل آمن (تجاهل الأخطاء إذا كان الملف أصلاً محذوفاً) */
const safeDeleteStorageRef = async (target: string): Promise<void> => {
    const normalized = (target || '').trim();
    if (!normalized) return;
    try {
        const targetRef = ref(storage, normalized);
        await deleteObject(targetRef);
    } catch (error: any) {
        if (isNotFoundStorageError(error) || isInvalidStorageUrlError(error)) return;
        throw error;
    }
};

/** رفع صورة الطبيب الشخصية الرسمية (Base64).
 *  ملاحظة أمان: لازم المستخدم يكون مسجل دخول. بنتجاهل أي doctorId من الـ client
 *  ونستخدم الـ uid من Firebase Auth فقط، عشان منع رفع صورة على حساب مستخدم تاني. */
export const uploadDoctorProfileImageBase64 = async (_doctorId: string, base64Data: string): Promise<string> => {
    try {
        const ownerId = auth.currentUser?.uid;
        if (!ownerId) {
            throw new Error('يجب تسجيل الدخول قبل رفع الصورة.');
        }
        const response = await fetch(base64Data);
        const blob = await response.blob();
        const compressed = await compressImage(blob);
        const storageRef = ref(storage, `profile_images/${ownerId}.jpg`);
        const snapshot = await uploadBytes(storageRef, compressed);
        return await getDownloadURL(snapshot.ref);
    } catch (error: any) {
        console.error('[Storage] Error uploading doctor profile image:', error);
        throw new Error(error?.message || 'حدث خطأ أثناء رفع الصورة الشخصية');
    }
};

/** حذف صورة الطبيب الشخصية بجميع امتداداتها المتوقعة لضمان التنظيف الشامل */
export const deleteDoctorProfileImage = async (doctorId: string, imageUrl?: string): Promise<void> => {
    const ownerId = auth.currentUser?.uid || doctorId;

    try {
        if (imageUrl) {
            await safeDeleteStorageRef(imageUrl);
        }

        const fallbackPaths = [
            `profile_images/${ownerId}.png`,
            `profile_images/${ownerId}.jpg`,
            `profile_images/${ownerId}.jpeg`,
            `profile_images/${ownerId}.webp`,
        ];

        for (const path of fallbackPaths) {
            await safeDeleteStorageRef(path);
        }
    } catch (error: any) {
        console.error('[Storage] Error deleting doctor profile image:', error);
        throw new Error(error?.message || 'حدث خطأ أثناء حذف الصورة الشخصية من السحابة');
    }
};

/** استخراج امتداد الملف من نوع MIME للـ Blob المضغوط — للحفاظ على اتساق الرابط */
const getExtensionFromBlob = (blob: Blob): string => {
    const type = (blob.type || '').toLowerCase();
    if (type === 'image/webp') return 'webp';
    if (type === 'image/png') return 'png';
    return 'jpg';
};

/** إعدادات ضغط مناسبة لصور الإعلان (أكبر وأعلى جودة من البروفايل، بنفس ترتيب التكلفة تقريباً بفضل WebP) */
const AD_COMPRESSION_OPTIONS = { maxDimension: MAX_IMAGE_DIMENSION_AD, quality: IMAGE_QUALITY_AD } as const;

/** رفع صور إعلانات الطبيب من ملف */
export const uploadDoctorAdImageFile = async (doctorId: string, file: File): Promise<string> => {
    try {
        const ownerId = auth.currentUser?.uid || doctorId;
        const compressed = await compressImage(file, AD_COMPRESSION_OPTIONS);
        const ext = getExtensionFromBlob(compressed);
        const fileName = `${ownerId}_doctor_ad_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const storageRef = ref(storage, `profile_images/${fileName}`);
        const snapshot = await uploadBytes(storageRef, compressed);
        return await getDownloadURL(snapshot.ref);
    } catch (error: any) {
        console.error('[Storage] Error uploading doctor ad image file:', error);
        throw new Error(error.message || 'حدث خطأ أثناء رفع صورة الإعلان');
    }
};

/** رفع صور إعلانات الطبيب (Base64) مع توليد اسم فريد للصور المتعددة */
export const uploadDoctorAdImageBase64 = async (doctorId: string, base64Data: string): Promise<string> => {
    try {
        const ownerId = auth.currentUser?.uid || doctorId;
        const response = await fetch(base64Data);
        const blob = await response.blob();
        const compressed = await compressImage(blob, AD_COMPRESSION_OPTIONS);
        const ext = getExtensionFromBlob(compressed);
        const fileName = `${ownerId}_doctor_ad_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const storageRef = ref(storage, `profile_images/${fileName}`);
        const snapshot = await uploadBytes(storageRef, compressed);
        return await getDownloadURL(snapshot.ref);
    } catch (error: any) {
        console.error('[Storage] Error uploading doctor ad image base64:', error);
        throw new Error(error.message || 'حدث خطأ أثناء رفع صورة الإعلان');
    }
};

/** حذف صورة إعلان معينة باستخدام الرابط الخاص بها */
export const deleteDoctorAdImageByUrl = async (imageUrl: string): Promise<void> => {
    const normalized = (imageUrl || '').trim();
    if (!normalized) return;

    try {
        await safeDeleteStorageRef(normalized);
    } catch (error: any) {
        console.error('[Storage] Error deleting doctor ad image:', error);
        throw new Error(error?.message || 'حدث خطأ أثناء حذف الصورة من السحابة');
    }
};
