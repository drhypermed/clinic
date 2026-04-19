/**
 * useDoctorProfileData:
 * hook لتحميل بيانات الطبيب من Firestore (بيانات أساسية + حالة الاشتراك)
 * ودمج الوثيقة الحديثة (users/{uid}) مع القديمة (doctors/{uid})
 * وإدارة الحالات المرتبطة بالنموذج.
 */
import { useEffect, useState } from 'react';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import {
  getLegacyDoctorProfileDocRef,
  getUserProfileDocRef,
  mergePrimaryProfileData,
} from '../../../services/firestore/profileRoles';

export type DoctorAccountType = 'free' | 'premium';

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
  const [premiumStartDate, setPremiumStartDate] = useState('');
  const [premiumEndDate, setPremiumEndDate] = useState('');

  useEffect(() => {
    if (!isOpen || !userId) return;

    // تحديث الحالة من بيانات Firestore المجمَّعة
    const applyData = (data: Record<string, unknown> | null) => {
      if (!data || Object.keys(data).length === 0) {
        setAccountType('free');
        setPremiumStartDate('');
        setPremiumEndDate('');
        return;
      }
      const hasProfileImageField = Object.prototype.hasOwnProperty.call(data, 'profileImage');
      const resolvedProfileImage = hasProfileImageField
        ? (data.profileImage as string) || ''
        : currentProfileImage || '';
      const resolvedAccountType: DoctorAccountType =
        data.accountType === 'premium' ? 'premium' : 'free';
      const resolvedPremiumStartDate =
        typeof data.premiumStartDate === 'string' ? data.premiumStartDate : '';
      const resolvedPremiumEndDate =
        typeof data.premiumExpiryDate === 'string'
          ? data.premiumExpiryDate
          : typeof data.lastPremiumExpiryDate === 'string'
            ? data.lastPremiumExpiryDate
            : '';

      setName((data.doctorName as string) || currentName);
      setSpecialty((data.doctorSpecialty as string) || currentSpecialty);
      setWhatsapp((data.doctorWhatsApp as string) || '');
      setProfileImage(resolvedProfileImage);
      setAccountType(resolvedAccountType);
      setPremiumStartDate(resolvedPremiumStartDate);
      setPremiumEndDate(resolvedPremiumEndDate);
    };

    const loadDoctorData = async () => {
      // لا نُظهر شاشة التحميل إذا كانت هناك بيانات أولية موجودة (لمنع "الرعشة")
      const hasInitialData = Boolean(currentName || currentProfileImage);
      if (!hasInitialData) setIsLoading(true);

      setLoadError('');
      try {
        // تحميل الوثيقتين بالتوازي + دمجهما (الحديثة لها الأولوية)
        const [userDoc, legacyDoctorDoc] = await Promise.all([
          getDocCacheFirst(getUserProfileDocRef(userId)),
          getDocCacheFirst(getLegacyDoctorProfileDocRef(userId)),
        ]);
        const mergedData = mergePrimaryProfileData(
          userDoc.exists() ? (userDoc.data() as Record<string, unknown>) : null,
          legacyDoctorDoc.exists() ? (legacyDoctorDoc.data() as Record<string, unknown>) : null,
        );
        applyData(mergedData);
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
    setName,
    setSpecialty,
    setWhatsapp,
    setProfileImage,
  };
}
