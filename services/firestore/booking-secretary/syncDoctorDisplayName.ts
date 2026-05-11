/**
 * syncDoctorDisplayName — مزامنة اسم الطبيب على كل أسرار الحجز.
 *
 * المشكلة قبل الإصلاح:
 *   - اسم الطبيب اللي بتشوفه السكرتيرة في "الملف الشخصي" بيتقرأ من
 *     `bookingConfig/{secret}.doctorDisplayName`.
 *   - كل فرع له `secret` خاص به (ومستند `bookingConfig` خاص به).
 *   - حفظ بروفايل الطبيب (modal تعديل الاسم) بيكتب على `users/{uid}.doctorName`
 *     فقط، ومش بيلمس `bookingConfig`. النتيجة: الاسم بيظهر فاضي عند السكرتيرة
 *     (أو بيختلف بين الفروع لو الطبيب حفظ "إعدادات السكرتارية" من فرع واحد بس).
 *
 * الإصلاح:
 *   - بعد حفظ الاسم على البروفايل، نمرّر القيمة على كل فروع الطبيب:
 *     1) الفرع الرئيسي → `users/{uid}.bookingSecret`
 *     2) الفروع الفرعية → `users/{uid}.bookingSecretByBranch.{branchId}`
 *        (🔒 2026-05-10: اتنقل من Branch.secretarySecret لمنع تسرب للسكرتيرة)
 *   - كل مستند `bookingConfig/{secret}` بيتحدّث merge على حقل واحد فقط
 *     (`doctorDisplayName`) — كتابة آمنة بدون مساس بباقي الإعدادات.
 *
 * التكلفة: عدد الكتابات = 1 + عدد الفروع. الطبيب بيغيّر اسمه نادراً جداً
 * (تقريباً مرة في عمر الحساب)، فالأثر التراكمي مهمل حتى عند آلاف الأطباء.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { sanitizeDocSegment, toOptionalText, normalizeBookingSecret } from './helpers';
import { getAllBranchSecretsMap } from '../branches';

/**
 * يجلب كل الـsecrets المرتبطة بطبيب: secret الفرع الرئيسي + secret كل فرع فرعي.
 * Set علشان نمنع الـduplicates لو فيه فرع فرعي مكرر بنفس الـsecret (ما يفترض يحصل).
 */
const collectDoctorBookingSecrets = async (userId: string): Promise<string[]> => {
  const secrets = new Set<string>();

  // الفرع الرئيسي — secret محفوظ على وثيقة المستخدم نفسه
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    const mainSecret = normalizeBookingSecret(
      String((userSnap.data() as { bookingSecret?: string } | undefined)?.bookingSecret || '')
    );
    if (mainSecret) secrets.add(mainSecret);
  } catch (err) {
    // فشل قراءة الـuser doc — مش هنوقف العملية، هنكمل بفروع فقط
    console.warn('[syncDoctorDisplayName] Failed to read user main secret:', err);
  }

  // الفروع الفرعية — أسرار كل فرع من المكان الآمن (مع fallback تلقائي للقديم)
  try {
    const branchSecretsMap = await getAllBranchSecretsMap(userId);
    Object.values(branchSecretsMap).forEach((secret) => {
      const normalized = normalizeBookingSecret(secret);
      if (normalized) secrets.add(normalized);
    });
  } catch (err) {
    // فشل قراءة أسرار الفروع — هنكمل باللي معانا (الفرع الرئيسي على الأقل)
    console.warn('[syncDoctorDisplayName] Failed to read branch secrets:', err);
  }

  return Array.from(secrets);
};

/**
 * نسخ `doctorDisplayName` على كل مستندات `bookingConfig` التابعة للطبيب.
 *
 * - لو الاسم فاضي → بنحفظ نص فاضي (مش deleteField) عشان الـreader عنده
 *   منطق fallback جاهز (`doctorEmail` → "غير محدد").
 * - أي فشل في فرع واحد ما بيوقفش الباقي — Promise.allSettled بدلاً من Promise.all
 *   عشان فرع شغال يفضل سليم لو فرع واحد مش متاح صلاحياته أو متشال من قاعدة البيانات.
 */
export const syncDoctorDisplayNameToAllBookingConfigs = async (
  userId: string,
  doctorDisplayName: string,
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return;

  const nameValue = toOptionalText(doctorDisplayName) || '';
  const secrets = await collectDoctorBookingSecrets(normalizedUserId);
  if (secrets.length === 0) return;

  const updatedAt = new Date().toISOString();
  await Promise.allSettled(
    secrets.map((secret) =>
      setDoc(
        doc(db, 'bookingConfig', secret),
        { doctorDisplayName: nameValue, updatedAt },
        { merge: true },
      ),
    ),
  );
};
