/**
 * saveDoctorProfile:
 * دالة حفظ تعديلات الملف الشخصي للطبيب:
 * 1) رفع/حذف صورة البروفايل من Firebase Storage.
 * 2) تحديث وثيقة users/{uid} بالـ merge + wallback).
 * 3) مزامنة بيانات الإعلان (doctorAds/{uid}) إن وُجد.
 * 4) استدعاء callbacks لتحديث الحالة في الواجهة.
 */
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import {
  deleteDoctorProfileImage,
  uploadDoctorProfileImageBase64,
} from '../../../services/storageService';
import {
  buildDoctorUserProfilePayload,
  getUserProfileDocRef,
} from '../../../services/firestore/profileRoles';

interface SaveArgs {
  userId: string;
  name: string;
  specialty: string;
  currentSpecialty: string;
  whatsapp: string;
  profileImage: string;
  currentProfileImage?: string;
  onNameUpdate: (name: string) => void;
  onSpecialtyUpdate?: (specialty: string) => void;
  onProfileImageUpdate: (base64: string) => void;
}

export async function saveDoctorProfile({
  userId,
  name,
  specialty,
  currentSpecialty,
  whatsapp,
  profileImage,
  currentProfileImage,
  onNameUpdate,
  onSpecialtyUpdate,
  onProfileImageUpdate,
}: SaveArgs): Promise<void> {
  let finalImageUrl = profileImage;
  const resolvedSpecialty = (specialty || '').trim() || (currentSpecialty || '').trim();

  // (1) رفع الصورة الجديدة أو حذف القديمة
  if (
    profileImage &&
    profileImage !== currentProfileImage &&
    profileImage.startsWith('data:image')
  ) {
    const downloadUrl = await uploadDoctorProfileImageBase64(userId, profileImage);
    // cache-buster لضمان تحديث عرض الصورة فوراً بعد الرفع
    finalImageUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  } else if (!profileImage && currentProfileImage) {
    await deleteDoctorProfileImage(userId, currentProfileImage);
  }

  // (2) تحديث وثيقة الطبيب (users/{uid})
  await setDoc(
    getUserProfileDocRef(userId),
    buildDoctorUserProfilePayload({
      doctorName: name.trim(),
      doctorSpecialty: resolvedSpecialty,
      doctorWhatsApp: whatsapp.trim(),
      profileImage: finalImageUrl || '',
      updatedAt: new Date().toISOString(),
    }),
    { merge: true },
  );

  // (3) مزامنة مع الإعلان العام إن وُجد — قد يفشل إن لم يُنشئه الطبيب بعد
  try {
    await setDoc(
      doc(db, 'doctorAds', userId),
      {
        doctorName: name.trim(),
        profileImage: finalImageUrl || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (adErr) {
    // آمن لتجاهله: ربما الطبيب لم ينشر إعلانًا أو الصلاحيات لم تُفعَّل
    console.info('No doctor ad document found to sync, or permission deferred.', adErr);
  }

  // (4) تحديث الواجهة عبر callbacks
  const updatePromises: Promise<void>[] = [];
  updatePromises.push(Promise.resolve(onNameUpdate(name.trim())));
  if (onSpecialtyUpdate) {
    updatePromises.push(Promise.resolve(onSpecialtyUpdate(resolvedSpecialty)));
  }
  if (finalImageUrl !== currentProfileImage) {
    updatePromises.push(Promise.resolve(onProfileImageUpdate(finalImageUrl)));
  }

  await Promise.all(updatePromises);
}
