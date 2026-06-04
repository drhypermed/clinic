// ─────────────────────────────────────────────────────────────────────────────
// بيانات دليل المستخدم (User Guide Content)
// ─────────────────────────────────────────────────────────────────────────────
// الترتيب نفس ترتيب الـsidebar في التطبيق (components/layout/Sidebar.tsx).
// كل حقيقه هنا اتأكّدت من الكود الفعلي، مش من التخمين.
//
// الترتيب:
//   1. الرئيسية          (home)
//   2. كشف جديد            (prescription)
//   3. سجلات المرضى       (records)
//   4. ملفات المرضى       (patientFiles)
//   5. المواعيد           (appointments)
//   6. التقارير الماليّه   (financialReports)
//   7. المساعد الطبي      (medicalAssistant)
//   8. مكتبة الجايدلاينز  (guidelinesLibrary)
//   9. أدوات الأدوية      (drugtools)
//   10. السكرتارية        (secretary)
//   11. تصميم الروشتة     (settings)
//   12. الإعلان           (advertisement)
//   13. إدارة الفروع      (branchSettings)
//   14. الأذونات          (permissions)
// ─────────────────────────────────────────────────────────────────────────────

export type GuideSection = {
  heading?: string;
  body?: string;
  steps?: string[];
  tip?: string;
  warning?: string;
  // 🆕 يعرض جدول مقارنة حي بين الباقات — يقرأ القيم الفعلية من إعدادات الأدمن
  tierComparison?: boolean;
  // 🆕 يعرض جدول أسعار الباقات الحي — يقرأ الأسعار من Firestore (subscriptionPrices)
  tierPricing?: boolean;
};

export type GuideTopic = {
  id: string;
  title: string;
  summary: string;
  readMinutes: number;
  sections: GuideSection[];
};

type GuideCategory = {
  id: string;
  title: string;
  description: string;
  topics: GuideTopic[];
};

// التصنيف 1 — "ابدأ من هنا" منقول لملف منفصل (userGuideData.intro.ts) عشان
// نخليّ الملف ده تحت حدّ الحجم. مفيش تغيير في الـAPI الخارجي.

import { INTRO_TOPICS } from './userGuideData.intro';
import { SIDEBAR_TOPICS } from './userGuideData.sidebar';
import { SPECIALTY_PACK_TOPICS } from './userGuideData.specialty';

export const USER_GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'intro',
    title: 'ابدأ من هنا',
    description: 'مقدّمه عن التطبيق + خطوات التسجيل',
    topics: INTRO_TOPICS,
  },
  {
    id: 'sidebar',
    title: 'ميزات التطبيق (نفس ترتيب القائمة الجانبية)',
    description: 'كل حاجة في القائمة الجانبية — بالترتيب',
    topics: SIDEBAR_TOPICS,
  },
  {
    id: 'specialty',
    title: 'حزم التخصصات',
    description: 'ميزات إضافيه بتظهر تلقائياً لتخصصات معينه (نسا، أطفال، ...)',
    topics: SPECIALTY_PACK_TOPICS,
  },
];

/** جرد تلقائي لكل المواضيع بترتيبها الكامل */
export const USER_GUIDE_ALL_TOPICS: GuideTopic[] = USER_GUIDE_CATEGORIES.flatMap((c) => c.topics);
