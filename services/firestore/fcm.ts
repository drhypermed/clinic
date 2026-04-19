/**
 * خدمة الإشعارات السحابية (FCM Service)
 * هذا الملف مسؤول عن إدارة رموز الإشعارات (Tokens) لشركة Google Firebase (FCM):
 * 1. حفظ وتحديث رموز الطبيب لتلقي تنبيهات الحجز الجديدة.
 * 2. حفظ رموز السكرتارية لتلقي تنبيهات الموافقة على الدخول.
 * 3. المزامنة بين بيانات المستخدم (User) والرموز المخصصة للسكرتارية.
 */

import { db } from '../firebaseConfig';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, getDocFromCache, updateDoc } from 'firebase/firestore';
import { getDocCacheFirst } from './cacheFirst';
import { buildDoctorUserProfilePayload, buildPublicUserProfilePayload } from './profileRoles';

/** أقصى عدد رموز إشعارات لكل مستخدم — الزيادة عن كده بتتحذف تلقائي */
const MAX_FCM_TOKENS = 10;

/**
 * بعد إضافة رمز جديد، لو القائمة أكبر من الحد الأقصى، نشيل الأقدم.
 * دا بيمنع تراكم رموز أجهزة قديمة ميتة مالهاش لازمة.
 */
async function trimFcmTokensIfNeeded(refPath: string): Promise<void> {
  try {
    const docRef = doc(db, refPath);
    // نستعمل الكاش (مش السيرفر) لتوفير قراءة — الكتابة اللي فاتت حدثت الكاش المحلي
    const snap = await getDocFromCache(docRef);
    if (!snap.exists()) return;

    const tokens: unknown[] = snap.data()?.fcmTokens ?? [];
    if (!Array.isArray(tokens) || tokens.length <= MAX_FCM_TOKENS) return;

    // نبقي آخر 10 رموز (الأحدث) ونشيل الأقدم
    const trimmed = tokens.slice(-MAX_FCM_TOKENS);
    await updateDoc(docRef, { fcmTokens: trimmed });
  } catch {
    // خطأ غير حرج — الرمز الجديد اتحفظ والتنظيف يتعاد المرة الجاية
  }
}

export const fcmService = {
    /** حفظ رمز FCM للطبيب لاستخدامه في إشعارات الحجز والسكرتارية */
    saveFcmToken: async (userId: string, token: string): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);
            
            // نستخدم arrayUnion لإضافة الرمز الجديد دون حذف القديم (في حال استخدام عدة أجهزة)
            const payload = {
                fcmToken: token,
                fcmTokens: arrayUnion(token),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(userRef, buildDoctorUserProfilePayload(payload), { merge: true });
            // تنظيف الرموز القديمة لو زادت عن 10
            void trimFcmTokensIfNeeded(`users/${userId}`);
        } catch (error) {
            console.error('[Firestore] Error saving FCM token:', error);
            throw error;
        }
    },

    /** حفظ رمز FCM للسكرتارية لاستخدامه في تنبيهات طلبات الدخول.
     *  يقبل branchId اختياري لعزل الإشعارات بين الفروع — السكرتيرة الجديدة ما تستقبلش إشعارات فروع تانية.
     *  التخزين في tokensByBranch.{branchId} (حديث) + fcmTokens (قديم للتوافق مع الـ tokens اللي قبل التحديث). */
    saveSecretaryFcmToken: async (secret: string, token: string, branchId?: string): Promise<void> => {
        try {
            const ref = doc(db, 'secretaryFcmTokens', secret);
            let userId = '';

            try {
                // محاولة ربط الموبايل بمعرف الطبيب (UserId) لتسهيل توجيه الإشعارات من السيرفر
                const configSnap = await getDocCacheFirst(doc(db, 'bookingConfig', secret));
                if (configSnap.exists()) {
                    userId = String(configSnap.data()?.userId || '').trim();
                }
            } catch {
                // خطأ غير حرج: يمكن تخزين الرمز حتى لو لم نجد المعرف حالياً
            }

            // تطبيع branchId — نستخدم 'main' لو مش محدد (الفرع الافتراضي)
            const normalizedBranchId = (branchId || 'main').trim() || 'main';
            const nowIso = new Date().toISOString();

            // ⚠️ عزل الفروع: قبل إضافة الـ token للفرع الحالي، نزيله من أي فرع
            //    سابق (لو نفس الجهاز سجل دخول على فرع مختلف قبل كده). بدون هذه الخطوة،
            //    الإشعار المخصص لفرع A يصل للجهاز الذي يعرض فرع B — تسريب.
            const writePayload: Record<string, unknown> = {
                fcmToken: token,
                fcmTokens: arrayUnion(token),
                [`tokensByBranch.${normalizedBranchId}`]: arrayUnion(token),
                [`tokensByBranchUpdatedAt.${normalizedBranchId}`]: nowIso,
                ...(userId ? { userId } : {}),
                updatedAt: nowIso,
            };

            try {
                const snap = await getDoc(ref).catch(() => null);
                const existingTokensByBranch =
                    snap?.exists() && snap.data()?.tokensByBranch && typeof snap.data().tokensByBranch === 'object'
                        ? (snap.data().tokensByBranch as Record<string, unknown>)
                        : {};
                Object.keys(existingTokensByBranch).forEach((otherBranchId) => {
                    if (otherBranchId === normalizedBranchId) return;
                    const branchTokens = existingTokensByBranch[otherBranchId];
                    if (Array.isArray(branchTokens) && branchTokens.includes(token)) {
                        writePayload[`tokensByBranch.${otherBranchId}`] = arrayRemove(token);
                    }
                });
            } catch {
                // Non-fatal — الكتابة الأساسية لسه تشتغل
            }

            await setDoc(ref, writePayload, { merge: true });
            void trimFcmTokensIfNeeded(`secretaryFcmTokens/${secret}`);
        } catch (error) {
            console.error('[Firestore] Error saving secretary FCM token:', error);
            throw error;
        }
    },

    /** حفظ رمز FCM لمستخدم الجمهور داخل users لتوحيد إدارة الاستهداف */
    savePublicFcmToken: async (userId: string, token: string): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);

            const payload = {
                fcmToken: token,
                fcmTokens: arrayUnion(token),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(userRef, buildPublicUserProfilePayload(payload), { merge: true });
            void trimFcmTokensIfNeeded(`users/${userId}`);
        } catch (error) {
            console.error('[Firestore] Error saving public FCM token:', error);
            throw error;
        }
    },
};
