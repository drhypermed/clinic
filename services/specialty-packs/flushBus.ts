/**
 * Flush Bus — موّحد لقفل الحفظ التلقائي للودجتس قبل حفظ سجل المريض
 *
 * المشكله: الودجتس (حمل/أطفال) عندها auto-save بـdebounce 800ms.
 * لو الدكتور ضغط "حفظ الكشف" فوراً بعد ما عدّل في الودجت، الـauto-sync
 * بيقرا من Firestore داتا قديمه (لأن الـauto-save لسه ما اتنفذش).
 *
 * الحل: قبل ما السجل يتحفظ، نقول لكل الودجتس "احفظوا اللي عندكم فوراً"
 * (flush). الودجتس بتسجل دالّه flush في الباص ده، وحفظ السجل بينادي كل
 * الدوال قبل ما يستمر.
 */

type FlushFn = () => Promise<void>;

const registeredFlushers = new Set<FlushFn>();

/** الودجت بيسجل دالّه flush وقت ما يـmount */
export const registerFlusher = (fn: FlushFn): (() => void) => {
    registeredFlushers.add(fn);
    return () => {
        registeredFlushers.delete(fn);
    };
};

/**
 * تشغيل كل الـflushers بالتوازي. بيرجع لما كلهم يخلصوا.
 * يطلق exception فقط في حالات نادره — الـcaller ممكن يتجاهل الأخطاء.
 */
export const flushAllSpecialtyPackSaves = async (): Promise<void> => {
    if (registeredFlushers.size === 0) return;
    const all = Array.from(registeredFlushers).map((fn) =>
        fn().catch(() => undefined),
    );
    await Promise.all(all);
};
