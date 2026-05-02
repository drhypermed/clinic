// ─────────────────────────────────────────────────────────────────────────────
// استرداد صورة ترخيص الطبيب من Storage (findDoctorLicenseInStorage)
// ─────────────────────────────────────────────────────────────────────────────
// المشكلة: الحسابات القديمة في الكثير من الحالات صورة الترخيص متاحة في Storage
// لكن رابطها (verificationDocUrl) مش محفوظ في Firestore — يا إما لبج قديم في
// الـsignup، يا إما لأن الحساب اتعمل من الإدارة مباشرة بدون رفع.
//
// الحل: نحاول نلاقي الصورة في فولدر الطبيب على Storage. لو لقيناها، نرجّع
// الـURL ونحفظها في Firestore عشان المرة الجاية تكون فورية بدون أي قائمة (list)
// إضافية في Storage.
//
// التكلفه: عمليه list واحده + getDownloadURL واحده + setDoc واحده — كل مرّة
// بس لو الحقل فاضي، وبعدين الإصلاح دائم.
// ─────────────────────────────────────────────────────────────────────────────

import { listAll, ref, getDownloadURL } from 'firebase/storage';
import { setDoc } from 'firebase/firestore';
import { storage } from '../../../services/firebaseConfig';
import { getUserProfileDocRef } from '../../../services/firestore/profileRoles';

// مسارات Storage اللي ممكن تكون فيها صورة ترخيص قديمة (المسار الأول هو الحالي،
// والثاني legacy استخدمه نسخه قديمه من signup).
const LICENSE_STORAGE_PATHS = ['doctor-verification', 'verification_docs'] as const;

/**
 * يحاول يلاقي صورة ترخيص للطبيب في Storage. يرجّع رابط أول ملف يلاقيه، أو null.
 * بيجرّب كل مسار محتمل بالترتيب — أول واحد يلاقي فيه ملف يرجّعه فوراً.
 */
export const findDoctorLicenseInStorage = async (doctorId: string): Promise<string | null> => {
  for (const basePath of LICENSE_STORAGE_PATHS) {
    try {
      // قائمة الملفات داخل فولدر الطبيب (الـrules بتسمح للأدمن باللست)
      const folderRef = ref(storage, `${basePath}/${doctorId}`);
      const result = await listAll(folderRef);

      // مفيش ملفات في المسار ده — جرّب التالي
      if (result.items.length === 0) continue;

      // أول ملف هو غالباً الصورة المرفوعة. لو في أكتر من ملف، الترتيب
      // افتراضي حسب الاسم — ومش مهم لأن الكل من نفس الرفعة.
      const firstFile = result.items[0];
      const downloadUrl = await getDownloadURL(firstFile);
      return downloadUrl;
    } catch (err) {
      // فشل قائمة المسار ده (permission denied / مش موجود) — جرّب التالي
      console.warn(`[findDoctorLicenseInStorage] Failed to list ${basePath}/${doctorId}:`, err);
      continue;
    }
  }
  // مفيش صورة في أي مسار
  return null;
};

/**
 * إصلاح دائم: بعد ما نلاقي صورة في Storage، نحفظ الرابط في Firestore عشان
 * المرة الجاية تكون فورية. بنستخدم setDoc بـmerge:true عشان ما نلمسش باقي
 * الحقول. لو الحفظ فشل (شبكة/صلاحيات)، الـUI لسه بيشتغل بالرابط من الـmemory.
 */
export const persistRecoveredLicenseUrl = async (
  doctorId: string,
  licenseUrl: string,
): Promise<void> => {
  try {
    await setDoc(
      getUserProfileDocRef(doctorId),
      { verificationDocUrl: licenseUrl, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (err) {
    // الحفظ في Firestore فشل — مش مشكلة، الـUI لسه بيعرض الصورة من الـState
    console.warn('[persistRecoveredLicenseUrl] Failed to persist recovered URL:', err);
  }
};
