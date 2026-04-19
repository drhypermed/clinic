/** تعريفات الواجهات (Interfaces) والأنواع المستخدمة في دليل الأطباء العام. */
import type { User } from 'firebase/auth';


export interface PublicDoctorsDirectoryPageProps {
  user: User;
  profile: { name?: string; email?: string; phone?: string } | null;
  onLogout: () => Promise<void>;
}
