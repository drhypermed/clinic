// ─────────────────────────────────────────────────────────────────────────────
// محمّل كتالوج الأدوية الكسول (Lazy Medications Loader)
// ─────────────────────────────────────────────────────────────────────────────
// الوظيفة: تحميل قاعدة الأدوية (اللي حجمها كبير) بشكل كسول (on-demand) بدل
// ما يتحملوا كلهم مع الصفحة الرئيسية. ده بيخلي التطبيق يفتح أسرع، والكتالوج
// بيتحمل لما المستخدم يدوس أول مرة على شاشة الأدوية أو الروشتة.
//
// آلية الكاش: بعد أول تحميل ناجح، بنخزن النتيجة في cachedBaseMedications
// علشان أي استدعاء بعد كده يرجع مباشرة من الذاكرة بدون انتظار.
// ─────────────────────────────────────────────────────────────────────────────

import { Medication } from '../../types';

// الكاش المحفوظ في الذاكرة بعد أول تحميل ناجح
let cachedBaseMedications: Medication[] | null = null;

// وعد التحميل الجاري — لو استدعى مكانين في نفس الوقت، يستنوا نفس الـ promise
// (مش هنعمل import مرتين بالغلط).
let baseMedicationsLoader: Promise<Medication[]> | null = null;

/** إرجاع الكتالوج من الكاش لو موجود (بدون تحميل) — مفيد للتحقق السريع */
export const getCachedBaseMedications = (): Medication[] | null => cachedBaseMedications;

/**
 * تحميل قاعدة الأدوية بشكل كسول:
 *  1) لو الكاش موجود، يرجعه مباشرة.
 *  2) لو في تحميل شغال، يستنى عليه.
 *  3) غير كده، يبدأ تحميل جديد من ./constants (اللي هو chunk مستقل في الـ bundle).
 *
 * في حالة الفشل: بيمسح الـ loader من الذاكرة عشان أي محاولة جاية تبدأ من جديد،
 * ويرجع قائمة فاضية كـ fallback آمن عشان ما نكسرش الواجهة.
 */
export const loadBaseMedications = async (): Promise<Medication[]> => {
  if (cachedBaseMedications) return cachedBaseMedications;

  if (!baseMedicationsLoader) {
    baseMedicationsLoader = import('./constants')
      .then((mod) => {
        // تحقق دفاعي: لو الاستيراد رجع شيء غير مصفوفة (نادر جداً)، نرجع مصفوفة فاضية
        const meds = Array.isArray(mod.MEDICATIONS) ? mod.MEDICATIONS : [];
        cachedBaseMedications = meds;
        return meds;
      })
      .catch((error) => {
        console.error('[medicationsLoader] Failed to load base medications catalog:', error);
        // إعادة المحاولة ممكنة: نمسح الـ loader عشان أول استدعاء جاي يبدأ من جديد
        baseMedicationsLoader = null;
        return [];
      });
  }

  return baseMedicationsLoader;
};
