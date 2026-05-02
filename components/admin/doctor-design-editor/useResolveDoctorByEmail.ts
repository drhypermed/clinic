// ─────────────────────────────────────────────────────────────────────────────
// useResolveDoctorByEmail — البحث عن طبيب بإيميله (للأدمن فقط)
// ─────────────────────────────────────────────────────────────────────────────
// الهدف: الأدمن بيدخل إيميل الطبيب → بنرجّع ليه الـUID + الاسم + التخصص
// عشان نقدر نفتحله صفحات تصميم الروشتة والإعلان الخاصة بالطبيب ده.
//
// آليّة البحث: نفس الباترن المستخدم في `getSecretaryLoginTargetByUserEmail`
// — استعلامين بالتوازي على الحقلين `doctorEmail` و`email` (الـusers الأقدم
// خزّنوا الإيميل تحت اسم مختلف). أول نتيجة موجودة هي اللي بنرجّعها.
//
// قواعد Firestore بتسمح للأدمن يقرا أي مستند `users/{uid}` (من firestore.rules
// السطر 192)، فالاستعلام ده هيشتغل من غير ما نحتاج Cloud Function.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { normalizeEmail, validateEmail } from '../../../services/auth-service/validation';

// تعريف فرع للأدمن — بنحتاج id واسم بس عشان نعرض dropdown اختيار الفرع
export interface DoctorBranchOption {
  id: string;
  name: string;
}

// نتيجة البحث: بيانات الطبيب اللي محتاجينها لفتح صفحات التصميم
export interface ResolvedDoctorTarget {
  uid: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorEmail: string;
  profileImage?: string;
  // أذونات الطبيب (مفتوح/مقفول) — undefined = مفتوح (الافتراضي)
  allowAdminPrescriptionEdit: boolean;
  allowAdminAdEdit: boolean;
  // قائمة فروع الطبيب — بنعرضها كـdropdown للأدمن لاختيار فرع التصميم
  branches: DoctorBranchOption[];
}

// حالة الهوك: idle (لسه ما حصلش بحث) / loading / success / error
type ResolveStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseResolveDoctorByEmailReturn {
  status: ResolveStatus;
  doctor: ResolvedDoctorTarget | null;
  error: string | null;
  // البحث: بياخد إيميل خام، بيتأكد من صحته، وبيرجّع الطبيب لو لقيه
  resolve: (rawEmail: string) => Promise<void>;
  // إعادة الضبط للحالة الابتدائية (لما الأدمن يرجع للقائمة الرئيسية)
  reset: () => void;
}

export const useResolveDoctorByEmail = (): UseResolveDoctorByEmailReturn => {
  const [status, setStatus] = useState<ResolveStatus>('idle');
  const [doctor, setDoctor] = useState<ResolvedDoctorTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setDoctor(null);
    setError(null);
  }, []);

  const resolve = useCallback(async (rawEmail: string) => {
    const normalized = normalizeEmail(rawEmail);

    // تحقّق أوّلي من شكل الإيميل قبل ما نرسل أي استعلام (نوفّر reads)
    if (!normalized) {
      setStatus('error');
      setError('من فضلك ادخل إيميل الطبيب');
      setDoctor(null);
      return;
    }
    if (!validateEmail(normalized)) {
      setStatus('error');
      setError('شكل الإيميل غير صحيح');
      setDoctor(null);
      return;
    }

    setStatus('loading');
    setError(null);
    setDoctor(null);

    try {
      const usersRef = collection(db, 'users');
      // استعلامين بالتوازي: الحقول `doctorEmail` (الجديد) و`email` (القديم)
      // limit(1) عشان أي طبيب ليه مستند واحد فقط بإيميله
      const qByDoctorEmail = query(usersRef, where('doctorEmail', '==', normalized), limit(1));
      const qByEmail = query(usersRef, where('email', '==', normalized), limit(1));

      const [snap1, snap2] = await Promise.all([
        getDocs(qByDoctorEmail),
        getDocs(qByEmail),
      ]);

      const userSnap = snap1.docs[0] || snap2.docs[0];
      if (!userSnap) {
        setStatus('error');
        setError('لا يوجد طبيب بهذا الإيميل');
        return;
      }

      const data = userSnap.data() as Record<string, any>;
      // الاسم: نجرّب أكتر من مفتاح (الكود اتطوّر عبر الوقت)
      const doctorName: string =
        data?.doctorName || data?.displayName || data?.name || '';
      const doctorSpecialty: string = data?.doctorSpecialty || '';
      const profileImage: string | undefined =
        data?.profileImage || data?.photoURL || undefined;
      // أذونات الطبيب — undefined أو true = مفتوح، false = مقفول
      const allowAdminPrescriptionEdit = data?.allowAdminPrescriptionEdit !== false;
      const allowAdminAdEdit = data?.allowAdminAdEdit !== false;

      // قراءة قائمة فروع الطبيب — لو فشلت (طبيب جديد بدون فروع)، نرجّع الفرع
      // الافتراضي 'main' عشان الواجهه مش تتعطّل
      let branches: DoctorBranchOption[] = [{ id: 'main', name: 'الفرع الرئيسي' }];
      try {
        const branchesSnap = await getDocs(collection(db, 'users', userSnap.id, 'branches'));
        if (!branchesSnap.empty) {
          branches = branchesSnap.docs.map((d) => {
            const bd = d.data() as Record<string, any>;
            return {
              id: d.id,
              name: bd?.name || (d.id === 'main' ? 'الفرع الرئيسي' : d.id),
            };
          });
          // ترتيب: الفرع الرئيسي أولاً
          branches.sort((a, b) => (a.id === 'main' ? -1 : b.id === 'main' ? 1 : 0));
        }
      } catch (branchErr) {
        console.warn('[useResolveDoctorByEmail] branches read failed:', branchErr);
        // نستمر بالـbranches الافتراضي
      }

      setDoctor({
        uid: userSnap.id,
        doctorName,
        doctorSpecialty,
        doctorEmail: normalized,
        profileImage,
        allowAdminPrescriptionEdit,
        allowAdminAdEdit,
        branches,
      });
      setStatus('success');
    } catch (err) {
      // أي فشل في الاستعلام (شبكة/صلاحيات) — نعرض رسالة عامة للأدمن
      console.error('[useResolveDoctorByEmail] lookup failed:', err);
      setStatus('error');
      setError('تعذّر البحث الآن — حاول مرة تانية');
    }
  }, []);

  return { status, doctor, error, resolve, reset };
};
