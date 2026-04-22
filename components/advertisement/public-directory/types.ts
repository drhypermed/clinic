/** تعريفات الواجهات (Interfaces) والأنواع المستخدمة في دليل الأطباء العام. */
import type { User } from 'firebase/auth';


// user = null لمّا يكون الدليل مفتوح للضيوف (Googlebot أو مستخدم قبل تسجيل الدخول).
// بنسمح بـnull عشان الصفحه تبقى indexable في جوجل وتزوّد الظهور في البحث.
export interface PublicDoctorsDirectoryPageProps {
  user: User | null;
  profile: { name?: string; email?: string; phone?: string } | null;
  onLogout: () => Promise<void>;
}
