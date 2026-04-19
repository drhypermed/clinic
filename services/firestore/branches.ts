/**
 * خدمة إدارة فروع العيادة (Branches Service)
 *
 * تدير هذه الخدمة عمليات CRUD للفروع:
 * 1. إنشاء / تعديل / حذف فرع.
 * 2. جلب قائمة الفروع مع اشتراك لحظي.
 * 3. إدارة الفرع النشط (المحفوظ في localStorage).
 *
 * مسار Firestore: `users/{userId}/branches/{branchId}`
 *
 * يبدأ النظام بفرع افتراضي واحد (DEFAULT_BRANCH_ID = "main") ويُنشأ تلقائياً
 * عند أول استخدام، بحيث لا تحتاج البيانات القديمة لترحيل يدوي.
 */

import { db } from '../firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    onSnapshot,
    getDocs,
    writeBatch,
} from 'firebase/firestore';
import { getDocsCacheFirst } from './cacheFirst';
import type { Branch } from '../../types';

/** معرّف الفرع الافتراضي — يُستخدم للبيانات القديمة والفرع الأول */
export const DEFAULT_BRANCH_ID = 'main';

/** مفتاح localStorage لحفظ الفرع النشط */
const ACTIVE_BRANCH_KEY = 'dh_active_branch';

/** إنشاء كائن الفرع الافتراضي */
export const createDefaultBranch = (): Branch => ({
    id: DEFAULT_BRANCH_ID,
    name: 'الفرع الرئيسي',
    createdAt: new Date().toISOString(),
});

export const branchesService = {
    /**
     * الاشتراك في قائمة الفروع لمستخدم معين مع تحديث لحظي.
     * إذا لم يكن هناك فروع، يتم إنشاء الفرع الافتراضي تلقائياً.
     */
    subscribeToBranches: (userId: string, onUpdate: (branches: Branch[]) => void) => {
        const branchesRef = collection(db, 'users', userId, 'branches');

        const processBranches = (docs: any[]): Branch[] => {
            const branches = docs.map(d => ({
                ...d.data(),
                id: d.id,
            })) as Branch[];

            return branches.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        };

        // تحميل من الكاش أولاً
        getDocsCacheFirst(branchesRef).then(cachedSnapshot => {
            if (!cachedSnapshot.empty) {
                onUpdate(processBranches(cachedSnapshot.docs));
            }
        }).catch(() => { });

        // اشتراك لحظي
        const unsubscribe = onSnapshot(branchesRef, async (snapshot) => {
            const branches = processBranches(snapshot.docs);

            // إنشاء الفرع الافتراضي تلقائياً لو مفيش فروع
            if (branches.length === 0) {
                const defaultBranch = createDefaultBranch();
                await branchesService.saveBranch(userId, defaultBranch);
                // الـ onSnapshot هيتفعل تاني بعد الحفظ
                return;
            }

            onUpdate(branches);
        }, (error) => {
            console.error('[Firestore] Error subscribing to branches:', error);
            onUpdate([]);
        });

        return unsubscribe;
    },

    /** حفظ فرع جديد أو تحديث فرع موجود */
    saveBranch: async (userId: string, branch: Branch) => {
        try {
            const ref = doc(db, 'users', userId, 'branches', branch.id);
            await setDoc(ref, {
                ...branch,
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('[Firestore] Error saving branch:', error);
            throw error;
        }
    },

    /**
     * حذف فرع مع نقل كل بياناته (مواعيد + سجلات) للفرع الرئيسي.
     * لا يمكن حذف الفرع الافتراضي (main).
     */
    deleteBranch: async (userId: string, branchId: string) => {
        if (branchId === DEFAULT_BRANCH_ID) {
            throw new Error('لا يمكن حذف الفرع الرئيسي');
        }
        try {
            // نقل المواعيد التابعة للفرع المحذوف إلى الفرع الرئيسي
            const appointmentsRef = collection(db, 'users', userId, 'appointments');
            const appointmentsSnap = await getDocs(appointmentsRef);
            const batch1 = writeBatch(db);
            let batchCount = 0;

            appointmentsSnap.forEach((d) => {
                if (d.data().branchId === branchId) {
                    batch1.update(d.ref, { branchId: DEFAULT_BRANCH_ID });
                    batchCount++;
                }
            });
            if (batchCount > 0) await batch1.commit();

            // نقل سجلات المرضى التابعة للفرع المحذوف إلى الفرع الرئيسي
            const recordsRef = collection(db, 'users', userId, 'records');
            const recordsSnap = await getDocs(recordsRef);
            const batch2 = writeBatch(db);
            let batchCount2 = 0;

            recordsSnap.forEach((d) => {
                if (d.data().branchId === branchId) {
                    batch2.update(d.ref, { branchId: DEFAULT_BRANCH_ID });
                    batchCount2++;
                }
            });
            if (batchCount2 > 0) await batch2.commit();

            // تنظيف الـ slots و secretaryAuth المرتبطين بالفرع المحذوف
            try {
                const userRootSnap = await getDoc(doc(db, 'users', userId));
                const userData = userRootSnap.exists() ? (userRootSnap.data() as { bookingSecret?: string; publicBookingSecret?: string }) : {};
                const bookingSecret = String(userData?.bookingSecret || '').trim();
                const publicSecret = String(userData?.publicBookingSecret || '').trim();

                // مسح الـ slots المتاحة للحجز العام اللي تخص الفرع المحذوف
                if (publicSecret) {
                    const slotsRef = collection(db, 'publicBookingConfig', publicSecret, 'slots');
                    const slotsSnap = await getDocs(slotsRef);
                    const batch3 = writeBatch(db);
                    let batchCount3 = 0;
                    slotsSnap.forEach((s) => {
                        if (s.data()?.branchId === branchId) {
                            batch3.delete(s.ref);
                            batchCount3++;
                        }
                    });
                    if (batchCount3 > 0) await batch3.commit();
                }

                // مسح كلمة سر السكرتارية المرتبطة بالفرع (يبطل أي session نشطة)
                if (bookingSecret) {
                    await deleteDoc(doc(db, 'secretaryAuth', bookingSecret, 'branches', branchId)).catch(() => {
                        // best-effort: المستند قد لا يكون موجوداً أصلاً
                    });
                }
            } catch (cleanupError) {
                console.warn('[Firestore] Branch cleanup (slots/auth) failed (non-blocking):', cleanupError);
            }

            // حذف الفرع نفسه
            const ref = doc(db, 'users', userId, 'branches', branchId);
            await deleteDoc(ref);
        } catch (error) {
            console.error('[Firestore] Error deleting branch:', error);
            throw error;
        }
    },

    /** قراءة الفرع النشط من localStorage (سريع ومتزامن) */
    getActiveBranchId: (userId: string): string => {
        try {
            const key = `${ACTIVE_BRANCH_KEY}_${userId}`;
            return localStorage.getItem(key) || DEFAULT_BRANCH_ID;
        } catch {
            return DEFAULT_BRANCH_ID;
        }
    },

    /** حفظ الفرع النشط في localStorage + Firestore (لمزامنته عبر الأجهزة) */
    setActiveBranchId: (userId: string, branchId: string) => {
        try {
            const key = `${ACTIVE_BRANCH_KEY}_${userId}`;
            localStorage.setItem(key, branchId);
        } catch {
            // تجاهل أخطاء localStorage
        }
        // مزامنة مع Firestore (best-effort) حتى يتذكر الجهاز التالي آخر فرع استخدمه الطبيب
        try {
            const userRef = doc(db, 'users', userId);
            setDoc(userRef, { lastActiveBranchId: branchId, lastActiveBranchUpdatedAt: new Date().toISOString() }, { merge: true }).catch(() => {
                // فشل الكتابة لا يعطل التبديل — localStorage كفيل بتذكّر الفرع على نفس الجهاز
            });
        } catch {
            // تجاهل
        }
    },

    /** قراءة آخر فرع نشط من Firestore (لاستعماله عند فتح التطبيق على جهاز جديد) */
    fetchRemoteActiveBranchId: async (userId: string): Promise<string | null> => {
        try {
            const userRef = doc(db, 'users', userId);
            const snap = await getDoc(userRef);
            if (!snap.exists()) return null;
            const raw = (snap.data() as { lastActiveBranchId?: unknown }).lastActiveBranchId;
            return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
        } catch {
            return null;
        }
    },
};
