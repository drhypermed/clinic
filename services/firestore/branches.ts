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
    query,
    where,
    writeBatch,
} from 'firebase/firestore';
import { getDocsCacheFirst } from './cacheFirst';
import type { Branch } from '../../types';

/** معرّف الفرع الافتراضي — يُستخدم للبيانات القديمة والفرع الأول */
export const DEFAULT_BRANCH_ID = 'main';

/** مفتاح localStorage لحفظ الفرع النشط */
const ACTIVE_BRANCH_KEY = 'dh_active_branch';

/** إنشاء كائن الفرع الافتراضي */
const createDefaultBranch = (): Branch => ({
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

            // إنشاء الفرع الافتراضي تلقائياً لو مفيش فروع.
            // الـbug القديم: لو saveBranch فشل (rules/شبكه)، الـreturn هنا
            // كان يخلّي الـUI شاشه بيضا للأبد. دلوقت لو فشل، نرجّع defaultBranch
            // محلياً للـUI عشان الدكتور يقدر يكمل شغله.
            if (branches.length === 0) {
                const defaultBranch = createDefaultBranch();
                try {
                    await branchesService.saveBranch(userId, defaultBranch);
                    // الـonSnapshot هيتفعل تاني بعد الحفظ
                } catch (saveError) {
                    console.warn('[Firestore] Default branch save failed (UI fallback applied):', saveError);
                    onUpdate([defaultBranch]);
                }
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
            // نقل المواعيد التابعه للفرع المحذوف إلى الفرع الرئيسي.
            // الـbug القديم: getDocs(appointmentsRef) كان بيقرا كل المواعيد للدكتور
            // (10K+ reads). الـwhere('branchId') بيخلّي الـquery يجيب اللي تخص الفرع فقط.
            const appointmentsRef = collection(db, 'users', userId, 'appointments');
            const appointmentsSnap = await getDocs(query(appointmentsRef, where('branchId', '==', branchId)));
            if (!appointmentsSnap.empty) {
                const batch1 = writeBatch(db);
                appointmentsSnap.forEach((d) => batch1.update(d.ref, { branchId: DEFAULT_BRANCH_ID }));
                await batch1.commit();
            }

            // نقل سجلات المرضى التابعه للفرع المحذوف — نفس التحسين.
            const recordsRef = collection(db, 'users', userId, 'records');
            const recordsSnap = await getDocs(query(recordsRef, where('branchId', '==', branchId)));
            if (!recordsSnap.empty) {
                const batch2 = writeBatch(db);
                recordsSnap.forEach((d) => batch2.update(d.ref, { branchId: DEFAULT_BRANCH_ID }));
                await batch2.commit();
            }

            // تنظيف الـ slots و secretaryAuth المرتبطين بالفرع المحذوف
            try {
                const userRootSnap = await getDoc(doc(db, 'users', userId));
                const userData = userRootSnap.exists() ? (userRootSnap.data() as { bookingSecret?: string; publicBookingSecret?: string }) : {};
                const bookingSecret = String(userData?.bookingSecret || '').trim();
                const publicSecret = String(userData?.publicBookingSecret || '').trim();

                // مسح الـslots المتاحه للحجز العام اللي تخص الفرع المحذوف.
                // نفس تحسين الـquery: where('branchId') بدل قراءه كل الـslots ثم الفلتره client-side.
                if (publicSecret) {
                    const slotsRef = collection(db, 'publicBookingConfig', publicSecret, 'slots');
                    const slotsSnap = await getDocs(query(slotsRef, where('branchId', '==', branchId)));
                    if (!slotsSnap.empty) {
                        const batch3 = writeBatch(db);
                        slotsSnap.forEach((s) => batch3.delete(s.ref));
                        await batch3.commit();
                    }
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
