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
    deleteField,
    onSnapshot,
    getDocs,
    query,
    where,
    writeBatch,
    updateDoc,
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

// ─────────────────────────────────────────────────────────────────────────────
// أسرار الفروع (Branch Secrets) — معزولة عن السكرتيرة بالـ rules
// ─────────────────────────────────────────────────────────────────────────────
// قبل 2026-05-10: الـ secret كان محفوظ في `users/{uid}/branches/{id}.secretarySecret`.
// المشكلة: الـ rules بتسمح لأي سكرتيرة (أي فرع) تقرا كل وثائق الفروع → سكرتيرة فرع A
// كانت تطلع secret فرع B وتقرا بياناته من `bookingConfig/{secretB}` (تسرب خصوصية).
// بعد الإصلاح: الـ secret محفوظ في `users/{uid}.bookingSecretByBranch.{branchId}`،
// والوثيقة دي السكرتيرة ممنوعة من قراءتها أصلاً (rules: auth.uid == userId only).
//
// الـ helpers اللي تحت بتدعم القراءة من المكان الجديد + fallback للقديم +
// migration كسول لما نقرا من القديم لأول مرة.

/**
 * يقرا secret فرع معين من المكان الآمن (وثيقة المستخدم)، مع fallback للقديم.
 * لو لقاه في القديم بس → بيعمل migration كسول للجديد ويمسح من القديم.
 *
 * ⚠️ الـ migration ترتيبها مهم: لازم نكتب الجديد الأول (يضمن الـ secret آمن
 * في المكان الجديد)، وبعدين نمسح القديم. لو عكسناه، فشل write بعد delete
 * يضيع الـ secret خالص.
 */
export const getBranchSecretSafe = async (
    userId: string,
    branchId: string,
): Promise<string> => {
    if (!userId || !branchId) return '';
    // 1) المكان الآمن — خريطة على وثيقة المستخدم
    try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        const map = (userSnap.data() as { bookingSecretByBranch?: Record<string, unknown> } | undefined)
            ?.bookingSecretByBranch;
        const newSecret = String((map && map[branchId]) || '').trim();
        if (newSecret) return newSecret;
    } catch {
        // فشل قراءة الوثيقة — نكمل للـ fallback
    }
    // 2) Fallback للقديم — من وثيقة الفرع
    try {
        const branchSnap = await getDoc(doc(db, 'users', userId, 'branches', branchId));
        const oldSecret = String(
            (branchSnap.data() as { secretarySecret?: string } | undefined)?.secretarySecret || ''
        ).trim();
        if (!oldSecret) return '';
        // migration كسول مرتّب: write → delete (بدل parallel) عشان لا تحصل data loss
        void (async () => {
            try {
                await setDoc(
                    doc(db, 'users', userId),
                    { bookingSecretByBranch: { [branchId]: oldSecret } },
                    { merge: true },
                );
                // الـ delete بيتعمل بس بعد ما نتأكد إن الجديد وصل سيرفر بنجاح
                await updateDoc(doc(db, 'users', userId, 'branches', branchId), {
                    secretarySecret: deleteField(),
                });
            } catch {
                // فشل migration — الـ secret لسه موجود في الاتنين، هنحاول تاني المرة الجاية
            }
        })();
        return oldSecret;
    } catch {
        return '';
    }
};

/**
 * يقرا كل أسرار الفروع للطبيب (key = branchId, value = secret).
 * بيدمج المكان الجديد + fallback للقديم. مفيد للأكواد اللي عايزة قائمة شاملة
 * (مثلاً الاشتراكات على الـsecrets المتعددة في MainApp).
 */
export const getAllBranchSecretsMap = async (
    userId: string,
): Promise<Record<string, string>> => {
    if (!userId) return {};
    const result: Record<string, string> = {};
    // 1) من وثيقة المستخدم (الجديد)
    try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        const map = (userSnap.data() as { bookingSecretByBranch?: Record<string, unknown> } | undefined)
            ?.bookingSecretByBranch;
        if (map && typeof map === 'object') {
            Object.keys(map).forEach((branchId) => {
                const value = String(map[branchId] || '').trim();
                if (value) result[branchId] = value;
            });
        }
    } catch {
        // نكمل للـ fallback
    }
    // 2) Fallback للقديم — أي branch لسه فيه secretarySecret على وثيقته
    try {
        const branchesSnap = await getDocs(collection(db, 'users', userId, 'branches'));
        const legacyEntries: Array<{ branchId: string; secret: string }> = [];
        branchesSnap.forEach((branchDoc) => {
            const branchId = branchDoc.id;
            if (result[branchId]) return; // الجديد متوفر بالفعل
            const oldSecret = String(
                (branchDoc.data() as { secretarySecret?: string } | undefined)?.secretarySecret || ''
            ).trim();
            if (!oldSecret) return;
            result[branchId] = oldSecret;
            legacyEntries.push({ branchId, secret: oldSecret });
        });
        if (legacyEntries.length > 0) {
            // migration مرتّب: write الكل في وثيقة المستخدم الأول، بعدين delete من الفروع.
            // ده يضمن إن لو فشل delete، الـ secrets آمنة في المكان الجديد فعلاً.
            void (async () => {
                try {
                    const writePayload: Record<string, string> = {};
                    legacyEntries.forEach(({ branchId, secret }) => {
                        writePayload[branchId] = secret;
                    });
                    await setDoc(
                        doc(db, 'users', userId),
                        { bookingSecretByBranch: writePayload },
                        { merge: true },
                    );
                    // الـ deletes بعد التأكد إن الجديد كله كُتب
                    await Promise.all(
                        legacyEntries.map(({ branchId }) =>
                            updateDoc(doc(db, 'users', userId, 'branches', branchId), {
                                secretarySecret: deleteField(),
                            }).catch(() => { /* فشل delete واحد ما يوقفش الباقي */ }),
                        ),
                    );
                } catch {
                    // فشل الـ write — هنحاول تاني المرة الجاية
                }
            })();
        }
    } catch {
        // ما عملناش fallback — نرجع اللي معانا
    }
    return result;
};

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

        // ـــ retry-on-permission-denied ـــ
        // Firebase Auth ساعات بياخد جزء من ثانية لتسوية الـ token أول ما الصفحة تتفتح.
        // في الفترة دي أي onSnapshot على /users/{uid}/branches بيرجع permission-denied،
        // وFirestore ما بيعملش retry تلقائي → الفروع بتفضل [] للأبد. الحل: لو الخطأ
        // permission-denied نـresubscribe بعد backoff قصير عشان نديل لـ Auth وقت يتسوّى.
        let activeUnsub: (() => void) | null = null;
        let cancelled = false;
        let retryCount = 0;
        const MAX_RETRIES = 4;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;
        // علامة: هل سبق ووصّلنا data للـUI؟ لو نعم، أي خطأ بعد كده ميمسحش
        // الفروع — نسيب آخر قيمة عرفناها على الـUI عشان لافتة "اسم الفرع"
        // متختفيش لحظياً عند token refresh أو انقطاع شبكي مؤقت.
        let hasDeliveredData = false;

        // تحميل من الكاش أولاً (قبل بدء الـsubscribe — يضمن ظهور سريع للفروع)
        getDocsCacheFirst(branchesRef).then(cachedSnapshot => {
            if (!cachedSnapshot.empty) {
                hasDeliveredData = true;
                onUpdate(processBranches(cachedSnapshot.docs));
            }
        }).catch(() => { });

        const startSubscription = () => {
            if (cancelled) return;
            activeUnsub = onSnapshot(branchesRef, async (snapshot) => {
                retryCount = 0; // نجح → reset counter
                const branches = processBranches(snapshot.docs);

                // إنشاء الفرع الافتراضي تلقائياً لو مفيش فروع.
                // الـbug القديم: لو saveBranch فشل (rules/شبكه)، الـreturn هنا
                // كان يخلّي الـUI شاشه بيضا للأبد. دلوقت لو فشل، نرجّع defaultBranch
                // محلياً للـUI عشان الدكتور يقدر يكمل شغله.
                if (branches.length === 0) {
                    const defaultBranch = createDefaultBranch();
                    try {
                        await branchesService.saveBranch(userId, defaultBranch);
                    } catch (saveError) {
                        console.warn('[Firestore] Default branch save failed (UI fallback applied):', saveError);
                        hasDeliveredData = true;
                        onUpdate([defaultBranch]);
                    }
                    return;
                }

                hasDeliveredData = true;
                onUpdate(branches);
            }, (error) => {
                const code = (error as { code?: string })?.code || '';
                const isPermDenied = code === 'permission-denied';

                // permission-denied غالباً race مع Firebase Auth — نعيد المحاولة بـbackoff.
                if (isPermDenied && retryCount < MAX_RETRIES && !cancelled) {
                    retryCount += 1;
                    const delay = Math.min(500 * Math.pow(2, retryCount - 1), 4000);
                    console.warn(`[Firestore] Branches permission-denied (auth race?). Retry ${retryCount}/${MAX_RETRIES} after ${delay}ms`);
                    if (activeUnsub) { activeUnsub(); activeUnsub = null; }
                    retryTimer = setTimeout(() => {
                        if (!cancelled) startSubscription();
                    }, delay);
                    return;
                }

                // لو سبق ووصّلنا فروع، خلي آخر قيمة على الـUI بدل ما نمسحها.
                // ده يمنع اختفاء "اسم الفرع" من السايد بار عند أخطاء عابرة بعد ما
                // البيانات اتحمّلت بنجاح (token refresh، انقطاع لحظي، إلخ).
                if (hasDeliveredData) {
                    console.warn('[Firestore] Branches subscription error after data was delivered — keeping last known data:', error);
                    return;
                }

                console.error('[Firestore] Error subscribing to branches:', error);
                onUpdate([]);
            });
        };

        startSubscription();

        // unsubscribe الموحّد: يلغي الـsubscription الحالي + يمنع أي retry معلّق
        return () => {
            cancelled = true;
            if (retryTimer) clearTimeout(retryTimer);
            if (activeUnsub) activeUnsub();
        };
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

            // تنظيف الـ slots و كل البيانات المرتبطة بالفرع المحذوف.
            // 🔒 تشديد أمني 2026-05-10: secretarySecret اتنقل لـ users/{uid}.bookingSecretByBranch
            //    → نقراه من المكان الآمن (مع fallback للقديم عبر getBranchSecretSafe).
            // بما إن الفرع الرئيسي ممنوع حذفه أصلاً، فالـcleanup هنا دايماً لفرع فرعي.
            try {
                // قراءة الـ secretarySecret من المكان الآمن (مع fallback للقديم + migration كسول)
                const branchSecret = await getBranchSecretSafe(userId, branchId);

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

                // ⚠️ تنظيف كل بيانات الفرع الفرعي بـ branchSecret.
                //
                // الترتيب مهم جداً (Firestore rules):
                //   - rules لـ `secretaryFcmTokens`/`secretaryProfiles`/إلخ. تستخدم
                //     `isBookingOwner(secret)` اللي بيشترط `bookingConfig/{secret}` موجود.
                //   - subcollections في `bookingConfig/{secret}` (insurance/discount/prices)
                //     تشترط الـ parent موجود.
                //   - لذلك: نحذف subcollections أولاً، ثم secretary docs، أخيراً bookingConfig.
                //
                // كل عملية best-effort — فشل واحدة ما يوقفش الباقي عشان الفرع
                // الأساسي يتمسح حتى لو cleanup فشل في حاجة.
                if (branchSecret) {
                    // (أ) subcollections داخل bookingConfig/{branchSecret}
                    const insuranceMirrorSnap = await getDocs(
                        collection(db, 'bookingConfig', branchSecret, 'insuranceCompanies'),
                    ).catch(() => null);
                    if (insuranceMirrorSnap && !insuranceMirrorSnap.empty) {
                        await commitInChunks(insuranceMirrorSnap.docs, (batch, d) => {
                            batch.delete(d.ref);
                        });
                    }

                    const discountMirrorSnap = await getDocs(
                        collection(db, 'bookingConfig', branchSecret, 'discountReasons'),
                    ).catch(() => null);
                    if (discountMirrorSnap && !discountMirrorSnap.empty) {
                        await commitInChunks(discountMirrorSnap.docs, (batch, d) => {
                            batch.delete(d.ref);
                        });
                    }

                    const pricesMirrorSnap = await getDocs(
                        collection(db, 'bookingConfig', branchSecret, 'monthlyPrices'),
                    ).catch(() => null);
                    if (pricesMirrorSnap && !pricesMirrorSnap.empty) {
                        await commitInChunks(pricesMirrorSnap.docs, (batch, d) => {
                            batch.delete(d.ref);
                        });
                    }

                    // (ب) docs اللي rules تستخدم isBookingOwner — تتطلب bookingConfig موجود
                    // ⚠️ كلمة سر الفرع الفرعي بتنحفظ تحت secretaryAuth/{mainSecret}/branches/{branchId}
                    // مش تحت branchSecret (الـlogin بيقرأ من mainSecret). فلازم نحذفها
                    // من الـpath الصحيح كمان عشان ما تفضلش متروكه ورا حذف الفرع.
                    const userRootMain = String((userRootSnap.data() as { bookingSecret?: string } | undefined)?.bookingSecret || '').trim();
                    await Promise.all([
                        deleteDoc(doc(db, 'secretaryFcmTokens', branchSecret)).catch(() => undefined),
                        deleteDoc(doc(db, 'secretaryProfiles', branchSecret)).catch(() => undefined),
                        deleteDoc(doc(db, 'secretaryEntryRequests', branchSecret)).catch(() => undefined),
                        deleteDoc(doc(db, 'secretaryEntryAlertResponse', branchSecret)).catch(() => undefined),
                        deleteDoc(doc(db, 'secretaryApprovedEntryIds', branchSecret)).catch(() => undefined),
                        // legacy path (لو فيه data قديمة من قبل الإصلاح)
                        deleteDoc(doc(db, 'secretaryAuth', branchSecret, 'branches', branchId)).catch(() => undefined),
                        deleteDoc(doc(db, 'secretaryAuth', branchSecret)).catch(() => undefined),
                        // الـpath الصحيح (تحت mainSecret)
                        userRootMain
                            ? deleteDoc(doc(db, 'secretaryAuth', userRootMain, 'branches', branchId)).catch(() => undefined)
                            : Promise.resolve(),
                    ]);

                    // (ج) أخيراً: bookingConfig/{branchSecret} نفسه — بعد ما كل
                    //     اللي يعتمد عليه اتمسح.
                    await deleteDoc(doc(db, 'bookingConfig', branchSecret)).catch(() => undefined);
                }

                // (د) تنظيف entries الفرع المحذوف من الخرائط على users/{uid}
                //     (إعدادات العلامات الحيوية + كلمة سر السكرتيرة المعروضة + سرّ الفرع).
                //     deleteField على key مش موجود = no-op (آمن).
                // 🔒 2026-05-10: bookingSecretByBranch.{branchId} هو المكان الآمن لسرّ الفرع.
                await updateDoc(doc(db, 'users', userId), {
                    [`secretaryVitalsVisibilityByBranch.${branchId}`]: deleteField(),
                    [`secretaryVitalFieldsByBranch.${branchId}`]: deleteField(),
                    [`secretaryPasswordPlainByBranch.${branchId}`]: deleteField(),
                    [`bookingSecretByBranch.${branchId}`]: deleteField(),
                }).catch(() => undefined);
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
