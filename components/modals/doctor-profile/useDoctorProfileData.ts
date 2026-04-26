/**
 * useDoctorProfileData:
 * hook لتحميل بيانات الطبيب من Firestore (بيانات أساسيه + حالة الاشتراك).
 * بقى بقراءه واحده من users/{uid} — كانت قبل كده 2 reads بسبب alias قديم لنفس الـdoc.
 *
 * Admin override: لو المستخدم أدمن (ROOT_ADMIN_UID أو موجود في /admins)، بنعرض
 * tier="pro_max" مدى الحياة في الملف الشخصي — حتى لو Firestore لسه ما اتحدّثش.
 * ده بيصلح bug إن الأدمن كان بيشوف "مجاني" في بروفايله لو ما فتحش لوحة الإدارة
 * قبل كده (لوحة الإدارة هي اللي كانت بتـ sync الـ tier في Firestore).
 */
import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { getUserProfileDocRef } from '../../../services/firestore/profileRoles';
import { ROOT_ADMIN_UID } from '../../../app/drug-catalog/admin';

type DoctorAccountType = 'free' | 'premium' | 'pro_max';

// نفس PERMANENT_EXPIRY المستخدمة في useDoctorsPagination — الأدمن تيره "مدى الحياة"
const ADMIN_PERMANENT_EXPIRY = '9999-12-31T23:59:59.000Z';

/** فحص هل المستخدم أدمن — UID جذري أو بريده في /admins collection */
const checkIsAdminUser = async (userId: string, email: string): Promise<boolean> => {
  // 1) الـ UID الجذري — طبقة حماية ثابتة (نفس القيمة في firestore.rules)
  if (userId === ROOT_ADMIN_UID) return true;

  // 2) فحص /admins/<normalizedEmail> — قائمة أدمن ديناميكية
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return false;
  try {
    const adminDoc = await getDocCacheFirst(doc(db, 'admins', normalizedEmail));
    return adminDoc.exists();
  } catch {
    // فشل الوصول لـ /admins (صلاحيات/شبكة) — نعتبره مش أدمن بدل ما نكسر البروفايل
    return false;
  }
};

interface HookArgs {
  isOpen: boolean;
  userId: string;
  currentName: string;
  currentSpecialty: string;
  currentProfileImage?: string;
}

interface HookReturn {
  isLoading: boolean;
  loadError: string;
  name: string;
  specialty: string;
  whatsapp: string;
  profileImage: string;
  accountType: DoctorAccountType;
  premiumStartDate: string;
  premiumEndDate: string;
  // ─── تعديل التخصص لمرة واحدة للحسابات القديمة ───
  // لو التخصص فاضي في Firestore والحساب قديم → نسمح بتعديله مرة واحدة
  // بعد أول حفظ → نخزن specialtyEditedOnce: true ونقفل الحقل نهائياً
  specialtyEditedOnce: boolean;
  setName: (v: string) => void;
  setSpecialty: (v: string) => void;
  setWhatsapp: (v: string) => void;
  setProfileImage: (v: string) => void;
}

export function useDoctorProfileData({
  isOpen,
  userId,
  currentName,
  currentSpecialty,
  currentProfileImage,
}: HookArgs): HookReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // حالات الحقول القابلة للتعديل
  const [name, setName] = useState(currentName);
  const [specialty, setSpecialty] = useState(currentSpecialty);
  const [whatsapp, setWhatsapp] = useState('');
  const [profileImage, setProfileImage] = useState(currentProfileImage || '');

  // حالات الاشتراك (للعرض فقط)
  const [accountType, setAccountType] = useState<DoctorAccountType>('free');
  const [premiumStartDate, setProStartDate] = useState('');
  const [premiumEndDate, setProEndDate] = useState('');

  // علم قراءه للتحقق إذا الطبيب استهلك فرصة تعديل التخصص مسبقًا
  const [specialtyEditedOnce, setSpecialtyEditedOnce] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    // تحديث الحالة من بيانات Firestore المجمَّعة
    // isAdmin: لو true نـ override الـ tier لـ pro_max مدى الحياة
    const applyData = (data: Record<string, unknown> | null, isAdmin: boolean) => {
      if (!data || Object.keys(data).length === 0) {
        // حتى لو المستند فاضي، الأدمن يشوف pro_max في الـ UI
        setAccountType(isAdmin ? 'pro_max' : 'free');
        setProStartDate('');
        setProEndDate(isAdmin ? ADMIN_PERMANENT_EXPIRY : '');
        setSpecialtyEditedOnce(false);
        return;
      }
      const hasProfileImageField = Object.prototype.hasOwnProperty.call(data, 'profileImage');
      const resolvedProfileImage = hasProfileImageField
        ? (data.profileImage as string) || ''
        : currentProfileImage || '';
      // الـ tier الأصلي من Firestore — نستخدمه لو المستخدم عادي
      const firestoreAccountType: DoctorAccountType =
        data.accountType === 'premium' ? 'premium'
          : data.accountType === 'pro_max' ? 'pro_max'
          : 'free';
      const firestoreProStartDate =
        typeof data.premiumStartDate === 'string' ? data.premiumStartDate : '';
      const firestoreProEndDate =
        typeof data.premiumExpiryDate === 'string'
          ? data.premiumExpiryDate
          : typeof data.lastProExpiryDate === 'string'
            ? data.lastProExpiryDate
            : '';

      // Admin override: الأدمن دايماً pro_max مدى الحياة — بغض النظر عن Firestore
      const resolvedAccountType = isAdmin ? 'pro_max' : firestoreAccountType;
      const resolvedProStartDate = isAdmin
        ? (firestoreProStartDate || new Date().toISOString())
        : firestoreProStartDate;
      const resolvedProEndDate = isAdmin ? ADMIN_PERMANENT_EXPIRY : firestoreProEndDate;

      setName((data.doctorName as string) || currentName);
      setSpecialty((data.doctorSpecialty as string) || currentSpecialty);
      setWhatsapp((data.doctorWhatsApp as string) || '');
      setProfileImage(resolvedProfileImage);
      setAccountType(resolvedAccountType);
      setProStartDate(resolvedProStartDate);
      setProEndDate(resolvedProEndDate);
      // قراءه علم استهلاك فرصة تعديل التخصص (الحسابات القديمة بدون تخصص تحصل على فرصة واحدة)
      setSpecialtyEditedOnce(data.specialtyEditedOnce === true);

      // Sync في الخلفية: لو الأدمن لسه ما اتعدّلش في Firestore، نعدله دلوقتي
      // عشان لوحة الإدارة وأي screen تاني يقروا نفس الحالة. مش ننتظر الـ promise
      // عشان الـ UI يظهر فوراً.
      const needsSync = isAdmin && (
        firestoreAccountType !== 'pro_max' ||
        !firestoreProEndDate.startsWith('9999')
      );
      if (needsSync) {
        setDoc(
          doc(db, 'users', userId),
          {
            accountType: 'pro_max',
            premiumStartDate: resolvedProStartDate,
            premiumExpiryDate: ADMIN_PERMANENT_EXPIRY,
          },
          { merge: true },
        ).catch((syncErr) => {
          // لو فشل الـ sync (صلاحيات/شبكة) ما نكسرش البروفايل — الـ UI override كافٍ
          console.warn('[useDoctorProfileData] admin tier sync failed:', syncErr);
        });
      }
    };

    const loadDoctorData = async () => {
      // لا نُظهر شاشة التحميل إذا كانت هناك بيانات أولية موجودة (لمنع "الرعشة")
      const hasInitialData = Boolean(currentName || currentProfileImage);
      if (!hasInitialData) setIsLoading(true);

      setLoadError('');
      try {
        // قراءه واحده من users/{uid}
        const userDoc = await getDocCacheFirst(getUserProfileDocRef(userId));
        const data = userDoc.exists() ? (userDoc.data() as Record<string, unknown>) : null;
        // نفحص لو المستخدم أدمن عشان نـ override الـ tier بـ pro_max في الـ UI
        // (بدل ما ننتظر الطبيب يفتح لوحة الإدارة عشان الحالة تتعدّل)
        const email = (data?.doctorEmail as string) || '';
        const isAdmin = await checkIsAdminUser(userId, email);
        applyData(data, isAdmin);
      } catch (err) {
        console.error('Error loading doctor data:', err);
        setLoadError('فشل تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorData();
  }, [isOpen, userId, currentName, currentSpecialty, currentProfileImage]);

  return {
    isLoading,
    loadError,
    name,
    specialty,
    whatsapp,
    profileImage,
    accountType,
    premiumStartDate,
    premiumEndDate,
    specialtyEditedOnce,
    setName,
    setSpecialty,
    setWhatsapp,
    setProfileImage,
  };
}
