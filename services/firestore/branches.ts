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
            // ⚠️ Firestore بيحدد كل batch بـ500 عملية. لو فرع نشط عنده آلاف
            // المواعيد/السجلات، batch واحد بيرفض → الحذف بيفشل تماماً.
            // الإصلاح: نقسم العمليات على chunks آمنة. نختار 450 عشان نسيب
            // مساحة لو احتجنا نضيف عمليات إضافية لنفس الـ batch مستقبلاً.
            const BATCH_CHUNK_SIZE = 450;

            // مساعد عام: ينفذ دالة على docs على شكل chunks ويـcommit كل chunk منفصل.
            // كل chunk في batch مستقل → فشل chunk ميمنعش الباقي + ميتعديش حد الـ500.
            const commitInChunks = async <T extends { ref: import('firebase/firestore').DocumentReference }>(
                docs: T[],
                applyToBatch: (batch: ReturnType<typeof writeBatch>, docSnap: T) => void
            ) => {
                for (let i = 0; i < docs.length; i += BATCH_CHUNK_SIZE) {
                    const chunk = docs.slice(i, i + BATCH_CHUNK_SIZE);
                    const batch = writeBatch(db);
                    chunk.forEach((d) => applyToBatch(batch, d));
                    await batch.commit();
                }
            };

            // نقل المواعيد التابعه للفرع المحذوف إلى الفرع الرئيسي.
            // الـwhere('branchId') بيخلّي الـquery يجيب اللي تخص الفرع فقط (مش كل المواعيد).
            const appointmentsRef = collection(db, 'users', userId, 'appointments');
            const appointmentsSnap = await getDocs(query(appointmentsRef, where('branchId', '==', branchId)));
            if (!appointmentsSnap.empty) {
                await commitInChunks(appointmentsSnap.docs, (batch, d) => {
                    batch.update(d.ref, { branchId: DEFAULT_BRANCH_ID });
                });
            }

            // نقل سجلات المرضى التابعه للفرع المحذوف — نفس التقسيم لتجنب حد الـ500.
            const recordsRef = collection(db, 'users', userId, 'records');
            const recordsSnap = await getDocs(query(recordsRef, where('branchId', '==', branchId)));
            if (!recordsSnap.empty) {
                await commitInChunks(recordsSnap.docs, (batch, d) => {
                    batch.update(d.ref, { branchId: DEFAULT_BRANCH_ID });
                });
            }

            // تنظيف الـ slots و secretaryAuth المرتبطين بالفرع المحذوف.
            // مهم: الفرع الفرعي بيخزن سرّ السكرتيرة في Branch.secretarySecret (مش في users/{uid}.bookingSecret).
            // بما إن الفرع الرئيسي ممنوع حذفه أصلاً، فالـcleanup هنا دايماً لفرع فرعي → لازم نقرأ الـsecret من document الفرع نفسه.
            try {
                // قراءة document الفرع للحصول على الـ secretarySecret الخاص به
                const branchSnap = await getDoc(doc(db, 'users', userId, 'branches', branchId));
                const branchSecret = String((branchSnap.data() as Partial<Branch> | undefined)?.secretarySecret || '').trim();

                // الـ publicBookingSecret موحّد لكل العيادة (مش لكل فرع) → قراءته من user root
                const userRootSnap = await getDoc(doc(db, 'users', userId));
                const publicSecret = String((userRootSnap.data() as { publicBookingSecret?: string } | undefined)?.publicBookingSecret || '').trim();

                // مسح الـslots المتاحه للحجز العام اللي تخص الفرع المحذوف فقط (الـwhere بيفلتر بالـbranchId)
                if (publicSecret) {
                    const slotsRef = collection(db, 'publicBookingConfig', publicSecret, 'slots');
                    const slotsSnap = await getDocs(query(slotsRef, where('branchId', '==', branchId)));
                    if (!slotsSnap.empty) {
                        await commitInChunks(slotsSnap.docs, (batch, s) => {
                            batch.delete(s.ref);
                        });
                    }
                }

                // مسح كلمة سر السكرتيرة المرتبطة بالفرع (يبطل أي session نشطة فوراً)
                if (branchSecret) {
                    await deleteDoc(doc(db, 'secretaryAuth', branchSecret, 'branches', branchId)).catch(() => {
                        // best-effort: المستند قد لا يكون موجوداً أصلاً (لو الفرع ما عيّنش كلمة سر)
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
