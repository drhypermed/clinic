/**
 * saveDoctorProfile:
 * دالة حفظ تعديلات الملف الشخصي للطبيب:
 * 1) رفع/حذف صورة البروفايل من Firebase Storage.
 * 2) تحديث وثيقة users/{uid} بالـ merge + wallback).
 * 3) مزامنة بيانات الإعلان (doctorAds/{uid}) إن وُجد.
 * 4) استدعاء callbacks لتحديث الحالة في الواجهة.
 */
import { setDoc } from 'firebase/firestore';
import {
  deleteDoctorProfileImage,
  uploadDoctorProfileImageBase64,
} from '../../../services/storageService';
import {
  buildDoctorUserProfilePayload,
  getUserProfileDocRef,
} from '../../../services/firestore/profileRoles';
// مزامنة اسم الطبيب على bookingConfig كل الفروع — السكرتيرة بتقرأ منهم.
import { firestoreService } from '../../../services/firestore';

interface SaveArgs {
  userId: string;
  name: string;
  specialty: string;
  currentSpecialty: string;
  whatsapp: string;
  profileImage: string;
  currentProfileImage?: string;
  // ─── دعم تعديل التخصص لمرة واحدة للحسابات القديمة ───
  // لو الحساب قديم بدون تخصص → حقل قابل للتعديل → نحفظ العلم بعد أول حفظ ناجح
  shouldMarkSpecialtyEdited?: boolean;
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
  shouldMarkSpecialtyEdited,
  onNameUpdate,
  onSpecialtyUpdate,
  onProfileImageUpdate,
}: SaveArgs): Promise<void> {
  let finalImageUrl = profileImage;
  const resolvedSpecialty = (specialty || '').trim() || (currentSpecialty || '').trim();
  // نحفظ العلم فقط لو الطبيب استهلك الفرصة فعلاً (قدّم تخصصاً غير فارغ والحساب كان بدون تخصص)
  const markSpecialtyEdited = Boolean(shouldMarkSpecialtyEdited && resolvedSpecialty);

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
      // نختم الحساب بـ specialtyEditedOnce لمنع أي تعديل لاحق على التخصص
      ...(markSpecialtyEdited ? { specialtyEditedOnce: true } : {}),
    }),
    { merge: true },
  );

  // (3) مزامنة مع الإعلان العام إن وُجد — قد يفشل إن لم يُنشئه الطبيب بعد
  try {
    const existingAd = await firestoreService.getDoctorAdByDoctorId(userId);
    if (existingAd) {
      await firestoreService.saveDoctorAdByDoctorId(userId, {
        ...existingAd,
        doctorName: name.trim(),
        doctorSpecialty: resolvedSpecialty || existingAd.doctorSpecialty,
        profileImage: finalImageUrl || '',
      });
    }
  } catch (adErr) {
    // آمن لتجاهله: ربما الطبيب لم ينشر إعلانًا أو الصلاحيات لم تُفعَّل
    console.info('No doctor ad document found to sync, or permission deferred.', adErr);
  }

  // (3.1) مزامنة اسم الطبيب على bookingConfig كل الفروع — كده السكرتيرة بتشوف
  // الاسم الصحيح والثابت في كل فرع تدخل عليه. آمن لتجاهل الفشل (best-effort):
  // الفروع اللي وصلتها التحديث هتعرض الاسم الجديد، والباقي هيتحدّث في أقرب
  // مرة الطبيب يحفظ "إعدادات السكرتارية" منها.
  try {
    await firestoreService.syncDoctorDisplayNameToAllBookingConfigs(userId, name.trim());
  } catch (syncErr) {
    console.warn('[Profile] Failed to sync doctor name to booking configs:', syncErr);
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
