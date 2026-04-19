/**
 * محرك التنقل وإحصائيات الاستخدام (useDrHyperViewAndUsage):
 * هذا الـ Hook هو المسؤول عن تذكر الواجهة الحالية التي يقف عليها الطبيب،
 * وكذلك تتبع الأدوية الأكثر استخداماً لتحسين ترتيب نتائج البحث مستقبلاً.
 * 
 * المهام الرئيسية:
 * 1. إدارة التنقل بين الصفحات (Home, Prescription, Records, etc).
 * 2. حفظ الصفحة الحالية في الـ LocalStorage ليعود الطبيب إليها عند تحديث المتصفح.
 * 3. تتبع عدد مرات استخدام كل دواء (Usage Stats) لترتيب المقترحات.
 */

import { useEffect, useState } from 'react';

/** أنواع الصفحات/الواجهات المتاحة في تطبيق DrHyper */
type DrHyperView =
  | 'home'             // الصفحة الرئيسية
  | 'prescription'     // صفحة كتابة الروشتة
  | 'records'          // أرشيف المرضى
  | 'patientFiles'     // ملفات المرضى الموحدة
  | 'appointments'     // المواعيد والحجوزات
  | 'financialReports' // التقارير المالية
  | 'drugtools'        // الأدوات الطبية (التفاعلات، إلخ)
  | 'medicationEdit'   // تعديل قاعدة بيانات الأدوية
  | 'settings'         // إعدادات الروشتة والحساب
  | 'branchSettings'   // إعدادات الفروع
  | 'advertisement'    // إدارة الإعلانات والبروفايل العام
  | 'secretary';       // صفحة السكرتارية

const ALLOWED_VIEWS: ReadonlyArray<DrHyperView> = [
  'home',
  'prescription',
  'records',
  'patientFiles',
  'appointments',
  'financialReports',
  'drugtools',
  'medicationEdit',
  'settings',
  'branchSettings',
  'advertisement',
  'secretary',
];

export const useDrHyperViewAndUsage = () => {
  // حالة الواجهة الحالية - يتم تحميلها من الذاكرة المحلية (LocalStorage) if exists
  const [currentView, setCurrentView] = useState<DrHyperView>(() => {
    try {
      const savedView = localStorage.getItem('dh_current_view');
      if (savedView && ALLOWED_VIEWS.includes(savedView as DrHyperView)) {
        return savedView as DrHyperView;
      }
    } catch {
      // تجاهل أخطاء الذاكرة المحلية
    }
    return 'home';
  });

  // حفظ الواجهة الحالية فور تغييرها لضمان استمرارية الجلسة
  useEffect(() => {
    try {
      localStorage.setItem('dh_current_view', currentView);
    } catch {
      // تجاهل أخطاء الذاكرة المحلية
    }
  }, [currentView]);

  // إحصائيات استخدام الأدوية (عدد مرات اختيار كل دواء)
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('dr_hyper_usage_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // حفظ الإحصائيات في الذاكرة المحلية عند تحديثها
  useEffect(() => {
    try {
      localStorage.setItem('dr_hyper_usage_stats', JSON.stringify(usageStats));
    } catch {
      // تجاهل أخطاء الذاكرة المحلية
    }
  }, [usageStats]);

  /** زيادة عداد استخدام دواء معين بمقدار 1 */
  const trackMedUsage = (medId: string) => {
    setUsageStats((prev) => ({
      ...prev,
      [medId]: (prev[medId] || 0) + 1,
    }));
  };

  return {
    currentView,
    setCurrentView,
    usageStats,
    trackMedUsage,
  };
};

export type DrHyperViewAndUsageState = ReturnType<typeof useDrHyperViewAndUsage>;
