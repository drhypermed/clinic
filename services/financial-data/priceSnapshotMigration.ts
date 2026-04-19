/**
 * Migration: تثبيت أسعار الكشوفات القديمة في السجل نفسه
 *
 * الهدف: الكشوفات القديمة اللي ما عندهاش `serviceBasePrice` بتستخدم السعر
 * الحالي كـ fallback. لو الدكتور غيّر السعر بعد كده، التقارير القديمة هتتغير.
 * هذا الـ migration بيحفظ السعر الحالي داخل كل سجل قديم مرة واحدة عشان يتثبت.
 *
 * الآلية:
 *  1) قراءة كل سجلات الفرع
 *  2) للسجلات اللي ما عندهاش `serviceBasePrice` → احفظ السعر الحالي المناسب
 *     (exam أو consultation حسب `isConsultationOnly`)
 *  3) استخدام `writeBatch` لتقسيم الكتابة على دفعات (Firestore limit = 500/batch)
 *  4) حفظ flag في users/{uid} لمنع إعادة التشغيل
 */

import { collection, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { DEFAULT_BRANCH_ID } from '../firestore/branches';

const MIGRATION_FLAG_FIELD = (branchId: string) => `priceSnapshotMigrated_${branchId || 'main'}`;
const BATCH_LIMIT = 400; // أقل من 500 علشان margin آمن

/**
 * تنفيذ الـ migration لفرع معين.
 * بيرجع بسرعة من غير أي I/O لو الـ flag موجود بالفعل.
 */
export const migratePriceSnapshots = async (
    userId: string,
    branchId: string | undefined,
    currentExamPrice: number,
    currentConsultPrice: number,
): Promise<{ migrated: number; skipped: boolean }> => {
    if (!userId) return { migrated: 0, skipped: true };

    const targetBranch = branchId || DEFAULT_BRANCH_ID;
    const flagField = MIGRATION_FLAG_FIELD(targetBranch);

    // 1) تحقق من flag الـ migration في مستند المستخدم
    const userRef = doc(db, 'users', userId);
    try {
        const { getDoc } = await import('firebase/firestore');
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data()?.[flagField] === true) {
            return { migrated: 0, skipped: true };
        }
    } catch {
        // لو فشلت قراءة الـ flag، نكمل — أسوأ احتمال إن الـ migration يتنفذ مرتين وده OK
    }

    // 2) التأكد من وجود أسعار صحيحة قبل ما نحفظها
    const exam = Number.isFinite(currentExamPrice) && currentExamPrice > 0 ? currentExamPrice : 0;
    const consult = Number.isFinite(currentConsultPrice) && currentConsultPrice > 0 ? currentConsultPrice : 0;
    if (exam === 0 && consult === 0) {
        // مفيش أسعار محفوظة — متعملش migration لأن هتحط صفر في كل السجلات
        return { migrated: 0, skipped: true };
    }

    // 3) قراءة السجلات اللي تخص الفرع المستهدف
    const recordsCol = collection(db, 'users', userId, 'records');
    let snap;
    try {
        // لو الفرع = main، السجلات القديمة ممكن تكون بدون branchId — نقرأ الكل ونفلتر محلياً
        snap = await getDocs(targetBranch === DEFAULT_BRANCH_ID ? query(recordsCol) : query(recordsCol, where('branchId', '==', targetBranch)));
    } catch {
        return { migrated: 0, skipped: true };
    }

    const pending: Array<{ id: string; basePrice: number }> = [];
    snap.forEach(docSnap => {
        const data = docSnap.data() as { serviceBasePrice?: unknown; isConsultationOnly?: boolean; branchId?: string };

        // فلترة محلية لفرع main (السجلات بدون branchId تخصه)
        if (targetBranch === DEFAULT_BRANCH_ID) {
            const recBranch = data.branchId || DEFAULT_BRANCH_ID;
            if (recBranch !== DEFAULT_BRANCH_ID) return;
        }

        // تخطي السجلات اللي عندها serviceBasePrice صالح
        const existing = Number(data.serviceBasePrice);
        if (Number.isFinite(existing) && existing > 0) return;

        const basePrice = data.isConsultationOnly ? consult : exam;
        if (basePrice > 0) {
            pending.push({ id: docSnap.id, basePrice });
        }
    });

    // 4) كتابة الـ snapshots على دفعات
    let migrated = 0;
    for (let i = 0; i < pending.length; i += BATCH_LIMIT) {
        const slice = pending.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(db);
        slice.forEach(item => {
            batch.set(doc(recordsCol, item.id), { serviceBasePrice: item.basePrice }, { merge: true });
        });
        try {
            await batch.commit();
            migrated += slice.length;
        } catch {
            // لو دفعة فشلت، نكمل بالباقي
        }
    }

    // 5) حفظ flag الـ migration (merge true علشان ما نمسحش حقول تانية)
    try {
        await setDoc(userRef, { [flagField]: true }, { merge: true });
    } catch {
        // فشل كتابة الـ flag → الـ migration هيتنفذ تاني المرة الجاية، وده OK
    }

    return { migrated, skipped: false };
};
