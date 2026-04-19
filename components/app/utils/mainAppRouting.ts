
export type AppView =
  | 'home'              // لوحة التحكم الرئيسية
  | 'prescription'      // صفحة الروشتة والكشف
  | 'records'           // سجلات المرضى
  | 'patientFiles'      // ملفات المرضى الموحدة
  | 'appointments'      // المواعيد والحجوزات
  | 'financialReports'  // التقارير المالية والأرباح
  | 'drugtools'         // قاعدة بيانات الأدوية
  | 'medicationEdit'    // تعديل بيانات دواء
  | 'settings'          // إعدادات الروشتة والتصميم
  | 'branchSettings'   // إعدادات الفروع
  | 'advertisement'    // إعلانات الطبيب والعيادة
  | 'secretary';       // صفحة السكرتارية

export const VIEW_TO_PATH: Record<AppView, string> = {
  home: '/home',
  prescription: '/prescription',
  records: '/records',
  patientFiles: '/patient-files',
  appointments: '/appointments',
  financialReports: '/financial-reports',
  drugtools: '/drug-tools',
  medicationEdit: '/drug-tools/edit',
  settings: '/settings',
  branchSettings: '/branch-settings',
  advertisement: '/advertisement',
  secretary: '/secretary',
};

const ARABIC_PATH_MAP: Record<string, AppView> = {
  '/الرئيسية': 'home',
  '/الصفحة-الرئيسية': 'home',
  '/كشف-جديد': 'prescription',
  '/الكشف': 'prescription',
  '/روشتة': 'prescription',
  '/سجلات-المرضى': 'records',
  '/السجلات': 'records',
  '/الملفات': 'patientFiles',
  '/ملفات-المرضى': 'patientFiles',
  '/الملفات-الطبية': 'patientFiles',
  '/المواعيد': 'appointments',
  '/الحجوزات': 'appointments',
  '/التقارير-المالية': 'financialReports',
  '/التقارير': 'financialReports',
  '/المالية': 'financialReports',
  '/أدوات-الأدوية': 'drugtools',
  '/الأدوية': 'drugtools',
  '/تعديل-الأدوية': 'medicationEdit',
  '/تعديل-دواء': 'medicationEdit',
  '/إعدادات-الروشتة': 'settings',
  '/الإعدادات': 'settings',
  '/تصميم-الروشتة': 'settings',
  '/إعدادات-الفروع': 'branchSettings',
  '/الفروع': 'branchSettings',
  '/الإعلان': 'advertisement',
  '/إعلانات': 'advertisement',
  '/السكرتارية': 'secretary',
  '/سكرتارية': 'secretary',
};

export const resolveViewFromPath = (pathname: string): AppView | null => {
  if (ARABIC_PATH_MAP[pathname]) {
    return ARABIC_PATH_MAP[pathname];
  }

  switch (pathname) {
    case '/':
    case '/home':
    case '/app':
    case '/app/home':
      return 'home';
    case '/prescription':
    case '/app/prescription':
      return 'prescription';
    case '/records':
    case '/app/records':
      return 'records';
    case '/patient-files':
    case '/app/patient-files':
      return 'patientFiles';
    case '/appointments':
    case '/app/appointments':
      return 'appointments';
    case '/financial-reports':
    case '/app/financial-reports':
      return 'financialReports';
    case '/drug-tools':
    case '/app/drug-tools':
      return 'drugtools';
    case '/drug-tools/edit':
    case '/app/drug-tools/edit':
      return 'medicationEdit';
    case '/settings':
    case '/app/settings':
      return 'settings';
    case '/branch-settings':
    case '/app/branch-settings':
      return 'branchSettings';
    case '/advertisement':
    case '/app/advertisement':
      return 'advertisement';
    case '/secretary':
    case '/app/secretary':
      return 'secretary';
    default:
      return null;
  }
};

