/**
 * Breadcrumb Configuration
 * يحدد هيكل التنقل الهرمي (Breadcrumbs) لكل صفحة في التطبيق.
 * يُستخدم لبناء مسار التنقل الذي يظهر للمستخدم ويوضح موقعه الحالي.
 */

import type { AppView } from './mainAppRouting';

/** شريحة واحدة من مسار التنقل */
export interface BreadcrumbSegment {
  /** النص العربي المعروض */
  label: string;
  /** الواجهة للتنقل عند الضغط (undefined = غير قابل للضغط = الصفحة الحالية) */
  view?: AppView;
}

/** التسميات العربية لكل واجهة */
export const VIEW_LABELS: Record<AppView, string> = {
  home: 'الرئيسية',
  prescription: 'كشف جديد',
  records: 'سجلات المرضى',
  patientFiles: 'ملفات المرضى',
  appointments: 'المواعيد',
  financialReports: 'التقارير المالية',
  drugtools: 'أدوات الأدوية',
  medicationEdit: 'تعديل الأدوية',
  settings: 'تصميم الروشتة',
  branchSettings: 'إدارة الفروع',
  advertisement: 'الإعلان والجمهور',
  secretary: 'السكرتارية',
};

/** العلاقة الأبوية: أي واجهة هي فرع من واجهة أخرى */
const VIEW_PARENT: Partial<Record<AppView, AppView>> = {
  medicationEdit: 'drugtools',
};

/** تسميات التابات للتقارير المالية */
export const FINANCIAL_TAB_LABELS: Record<string, string> = {
  daily: 'يومي',
  monthly: 'شهري',
  yearly: 'سنوي',
  settings: 'الإعدادات',
};

/** تسميات التابات لإعدادات الروشتة */
export const SETTINGS_TAB_LABELS: Record<string, string> = {
  header: 'الجزء العلوي',
  footer: 'الجزء السفلي',
  vitals: 'الجزء الجانبي',
  middle: 'الوسط',
  print: 'الطباعة',
};

/** تسميات أدوات الأدوية */
export const DRUG_TOOL_LABELS: Record<string, string> = {
  interactions: 'التفاعلات الدوائية',
  renal: 'جرعات الكلى',
  pregnancy: 'الأمان في الحمل',
};

/** مفتاح الـ search param لكل واجهة تدعم تابات فرعية */
export const VIEW_TAB_PARAM: Partial<Record<AppView, string>> = {
  financialReports: 'tab',
  settings: 'tab',
  drugtools: 'tool',
};

/** خريطة تسميات التابات لكل واجهة */
const VIEW_TAB_LABELS: Partial<Record<AppView, Record<string, string>>> = {
  financialReports: FINANCIAL_TAB_LABELS,
  settings: SETTINGS_TAB_LABELS,
  drugtools: DRUG_TOOL_LABELS,
};

/**
 * يبني مصفوفة شرائح مسار التنقل (Breadcrumbs) بناءً على الواجهة الحالية والتاب المفتوح.
 */
export function buildBreadcrumbs(
  currentView: AppView,
  tabValue?: string | null,
): BreadcrumbSegment[] {
  const crumbs: BreadcrumbSegment[] = [];

  // الجذر دائماً "الرئيسية" (إلا لو إحنا فيها)
  if (currentView !== 'home') {
    crumbs.push({ label: VIEW_LABELS.home, view: 'home' });
  }

  // لو الواجهة ليها أب (مثلاً تعديل الأدوية → أدوات الأدوية)
  const parent = VIEW_PARENT[currentView];
  if (parent) {
    crumbs.push({ label: VIEW_LABELS[parent], view: parent });
  }

  // الواجهة الحالية
  const tabParamKey = VIEW_TAB_PARAM[currentView];
  const hasActiveTab = tabParamKey && tabValue;

  crumbs.push({
    label: VIEW_LABELS[currentView],
    view: hasActiveTab ? currentView : undefined, // قابل للضغط فقط لو فيه تاب أعمق
  });

  // التاب الفرعي (إن وُجد)
  if (hasActiveTab) {
    const tabLabels = VIEW_TAB_LABELS[currentView];
    const tabLabel = tabLabels?.[tabValue] || tabValue;
    crumbs.push({ label: tabLabel });
  }

  return crumbs;
}
