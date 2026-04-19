import { useEffect } from 'react';
import { DOCTOR_PAGE_TITLE, PUBLIC_PAGE_TITLE } from './constants';
import type { BreadcrumbSegment } from '../utils/breadcrumbConfig';

/**
 * Hook تحديث عنوان الصفحة (usePageTitle Hook)
 * يقوم بتغيير الاسم الظاهر في تبويب المتصفح (Tab Title) بناءً على المسار الحالي.
 * التمييز الأساسي يكون بين:
 * - واجهة الأطباء (إدارة العيادة الذكية).
 * - واجهة الجمهور (دليل العيادات والأطباء).
 */

export const usePageTitle = (pathname: string) => {
  useEffect(() => {
    // صفحات الجمهور فقط — صفحات الدكتور يتولاها useBreadcrumbPageTitle
    const isPublicPage = pathname === '/public' || pathname.startsWith('/public/');
    if (isPublicPage) {
      document.title = PUBLIC_PAGE_TITLE;
    }
  }, [pathname]);
};

/**
 * Hook تحديث عنوان الصفحة بناءً على مسار التنقل (Breadcrumbs).
 * يعرض العنوان بالشكل: "التاب - الصفحة | إدارة العيادة الذكية"
 * مثلاً: "شهري - التقارير المالية | إدارة العيادة الذكية"
 */
export const useBreadcrumbPageTitle = (breadcrumbs: BreadcrumbSegment[]) => {
  useEffect(() => {
    if (breadcrumbs.length === 0) return;

    // تجاهل الرئيسية من بداية المسار (لا فائدة من عرضها في العنوان)
    const meaningful = breadcrumbs.filter(s => s.view !== 'home');

    if (meaningful.length === 0) {
      document.title = DOCTOR_PAGE_TITLE;
      return;
    }

    // عكس الترتيب ليكون الأعمق أولاً: "تاب - صفحة | اسم التطبيق"
    const trail = meaningful.map(s => s.label).reverse().join(' - ');
    document.title = `${trail} | ${DOCTOR_PAGE_TITLE}`;
  }, [breadcrumbs]);
};
