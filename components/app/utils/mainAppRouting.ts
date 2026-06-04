export type AppView =
  | 'home'              // لوحة التحكم الرئيسية
  | 'prescription'      // صفحة الروشتة والكشف
  | 'records'           // سجلات المرضى
  | 'patientFiles'      // ملفات المرضى الموحدة
  | 'appointments'      // المواعيد والحجوزات
  | 'financialReports'  // التقارير المالية والأرباح
  | 'medicalAssistant'  // المساعد الطبي الذكي
  | 'guidelinesLibrary' // مكتبة الجايدلاينز الطبية
  | 'drugtools'         // قاعدة بيانات الأدوية
  | 'medicationEdit'    // تعديل بيانات دواء
  | 'settings'          // إعدادات الروشتة والتصميم
  | 'branchSettings'   // إعدادات الفروع
  | 'advertisement'    // إعلانات الطبيب والعيادة
  | 'permissions'      // إدارة أذونات الجهاز (الإشعارات وغيرها)
  | 'secretary';       // صفحة السكرتارية

export const VIEW_TO_PATH: Record<AppView, string> = {
  home: '/home',
  prescription: '/prescription',
  records: '/records',
  patientFiles: '/patient-files',
  appointments: '/appointments',
  financialReports: '/financial-reports',
  medicalAssistant: '/medical-assistant',
  guidelinesLibrary: '/guidelines-library',
  drugtools: '/drug-tools',
  medicationEdit: '/drug-tools/edit',
  settings: '/settings',
  branchSettings: '/branch-settings',
  advertisement: '/advertisement',
  permissions: '/permissions',
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
  '/المساعد-الطبي': 'medicalAssistant',
  '/المساعد': 'medicalAssistant',
  '/مكتبة-الجايدلاينز': 'guidelinesLibrary',
  '/الجايدلاينز': 'guidelinesLibrary',
  '/الدلائل-الطبية': 'guidelinesLibrary',
  '/guidelines': 'guidelinesLibrary',
  '/أدوات-الأدوية': 'drugtools',
  '/تصميم-الروشتة': 'settings',
  '/إعدادات-الفروع': 'branchSettings',
  '/الفروع': 'branchSettings',
  '/الإعلان': 'advertisement',
  '/إعلانات': 'advertisement',
  '/الأذونات': 'permissions',
  '/أذونات': 'permissions',
  '/السكرتارية': 'secretary',
  '/سكرتارية': 'secretary',
};

export const resolveViewFromPath = (pathname: string): AppView | null => {
  // فك الترميز قبل المطابقة — لو URL اتلصق من واتساب أو رسالة بصيغة %D8%A7%D9...
  // الـlocation.pathname بيرجع encoded في الحاله دي، فالمطابقه المباشره مع المفتاح
  // العربي بتفشل. decodeURIComponent بترجع النص العربي الأصلي.
  let normalized = pathname;
  try { normalized = decodeURIComponent(pathname); } catch { /* تجاهل: invalid sequence */ }

  if (ARABIC_PATH_MAP[normalized]) {
    return ARABIC_PATH_MAP[normalized];
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
    case '/medical-assistant':
    case '/app/medical-assistant':
      return 'medicalAssistant';
    case '/guidelines-library':
    case '/app/guidelines-library':
    case '/guidelines': // للتوافق مع الروابط القديمة
    case '/app/guidelines': // للتوافق مع الروابط القديمة
      return 'guidelinesLibrary';
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
    case '/permissions':
    case '/app/permissions':
      return 'permissions';
    case '/secretary':
    case '/app/secretary':
      return 'secretary';
    default:
      return null;
  }
};

