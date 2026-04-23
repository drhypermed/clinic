/**
 * useDoctorProfileData:
 * hook لتحميل بيانات الطبيب من Firestore (بيانات أساسيه + حالة الاشتراك).
 * بقى بقراءه واحده من users/{uid} — كانت قبل كده 2 reads بسبب alias قديم لنفس الـdoc.
 */
import { useEffect, useState } from 'react';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { getUserProfileDocRef } from '../../../services/firestore/profileRoles';

export type DoctorAccountType = 'free' | 'premium' | 'pro_max';

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
    const applyData = (data: Record<string, unknown> | null) => {
      if (!data || Object.keys(data).length === 0) {
        setAccountType('free');
        setProStartDate('');
        setProEndDate('');
        setSpecialtyEditedOnce(false);
        return;
      }
      const hasProfileImageField = Object.prototype.hasOwnProperty.call(data, 'profileImage');
      const resolvedProfileImage = hasProfileImageField
        ? (data.profileImage as string) || ''
        : currentProfileImage || '';
      const resolvedAccountType: DoctorAccountType =
        data.accountType === 'premium' ? 'premium'
          : data.accountType === 'pro_max' ? 'pro_max'
          : 'free';
      const resolvedProStartDate =
        typeof data.premiumStartDate === 'string' ? data.premiumStartDate : '';
      const resolvedProEndDate =
        typeof data.premiumExpiryDate === 'string'
          ? data.premiumExpiryDate
          : typeof data.lastProExpiryDate === 'string'
            ? data.lastProExpiryDate
            : '';

      setName((data.doctorName as string) || currentName);
      setSpecialty((data.doctorSpecialty as string) || currentSpecialty);
      setWhatsapp((data.doctorWhatsApp as string) || '');
      setProfileImage(resolvedProfileImage);
      setAccountType(resolvedAccountType);
      setProStartDate(resolvedProStartDate);
      setProEndDate(resolvedProEndDate);
      // قراءه علم استهلاك فرصة تعديل التخصص (الحسابات القديمة بدون تخصص تحصل على فرصة واحدة)
      setSpecialtyEditedOnce(data.specialtyEditedOnce === true);
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
        applyData(data);
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
