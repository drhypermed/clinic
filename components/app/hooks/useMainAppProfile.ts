import { useEffect, useState } from 'react';
import { firestoreService } from '../../../services/firestore';
import { safeStorageGetItem, safeStorageSetItem } from '../../../services/auth-service/storage';
import {
  getAccountTypeCacheKey,
  getDoctorNameCacheKey,
  getDoctorSpecialtyCacheKey,
  getDoctorWhatsAppCacheKey,
  getPremiumExpiryCacheKey,
  getProfileImageCacheKey,
} from '../utils';

/**
 * Hook إدارة ملف الطبيب الشخصي (useMainAppProfile)
 * المسؤول عن جلب وتحديث بيانات الطبيب (الاسم، التخصص، الصورة، نوع الحساب).
 * الاستراتيجية المتبعة:
 * 1. تحميل البيانات من التخزين المحلي (LocalStorage) فوراً لسرعة العرض.
 * 2. الاشتراك في Firestore لجلب أحدث البيانات ومزامنتها لحظياً.
 * 3. توفير وظائف لتحديث البيانات (مثل تغيير صورة الملف الشخصي أو تعديل الاسم).
 * 4. إدارة مفتاح التحديث (ProfileKey) لإعادة رندر المكونات التي تعتمد على الصورة بنجاح.
 */

interface MainAppUser {
  uid: string;
  photoURL?: string | null;
  displayName?: string | null;
}

interface UseMainAppProfileParams {
  user: MainAppUser | null;
  userId: string;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

export const useMainAppProfile = ({ user, userId, updateUserProfile }: UseMainAppProfileParams) => {
  const [profileKey, setProfileKey] = useState(0);
  const [profileImage, setProfileImage] = useState<string | undefined>(() => {
    return user?.photoURL || (userId ? safeStorageGetItem(getProfileImageCacheKey(userId)) : undefined) || undefined;
  });
  const [doctorName, setDoctorName] = useState(() => {
    return userId ? safeStorageGetItem(getDoctorNameCacheKey(userId)) : '';
  });
  const [doctorSpecialty, setDoctorSpecialty] = useState(() => {
    return userId ? safeStorageGetItem(getDoctorSpecialtyCacheKey(userId)) : '';
  });
  const [doctorWhatsApp, setDoctorWhatsApp] = useState(() => {
    return userId ? safeStorageGetItem(getDoctorWhatsAppCacheKey(userId)) : '';
  });
  const [accountType, setAccountType] = useState<'free' | 'premium'>(() => {
    return (userId ? safeStorageGetItem(getAccountTypeCacheKey(userId)) : 'free') as 'free' | 'premium' || 'free';
  });
  const [premiumExpiryDate, setPremiumExpiryDate] = useState(() => {
    return userId ? safeStorageGetItem(getPremiumExpiryCacheKey(userId)) : '';
  });

  // 1. التحميل الأولي من LocalStorage لسرعة عرض البيانات (Hydration)
  useEffect(() => {
    if (!user) {
      setProfileImage(undefined); setDoctorName(''); setDoctorSpecialty(''); setDoctorWhatsApp(''); setAccountType('free'); setPremiumExpiryDate('');
      return;
    }

    const uid = user.uid;
    setProfileImage((user.photoURL as string) || safeStorageGetItem(getProfileImageCacheKey(uid)) || undefined);
    setDoctorName(safeStorageGetItem(getDoctorNameCacheKey(uid)) || '');
    setDoctorSpecialty(safeStorageGetItem(getDoctorSpecialtyCacheKey(uid)) || '');
    setDoctorWhatsApp(safeStorageGetItem(getDoctorWhatsAppCacheKey(uid)) || '');
    setAccountType((safeStorageGetItem(getAccountTypeCacheKey(uid)) as 'free' | 'premium') || 'free');
    setPremiumExpiryDate(safeStorageGetItem(getPremiumExpiryCacheKey(uid)) || '');
  }, [user?.uid]);

  // 2. المزامنة اللحظية مع Firestore وتحديث التخزين المحلي عند التغيير
  useEffect(() => {
    if (!userId || !user) return;

    const unsubscribe = firestoreService.subscribeToUserProfile(userId, (profile) => {
      const { doctorName: n, doctorSpecialty: s, profileImage: img, doctorWhatsApp: wa, accountType: at, premiumExpiryDate: exp } = profile;
      
      const nextName = n ?? '';
      const nextSpecialty = s ?? '';
      const nextImg = img ?? ((user.photoURL as string) || undefined);
      
      setDoctorName(nextName);
      setDoctorSpecialty(nextSpecialty);
      setDoctorWhatsApp(wa ?? '');
      setAccountType(at ?? 'free');
      setPremiumExpiryDate(exp ?? '');
      setProfileImage(nextImg);

      // حفظ القيم المحدثة في LocalStorage لإتاحتها عند إعادة تحميل الصفحة القادمة
      const uid = user.uid;
      safeStorageSetItem(getDoctorNameCacheKey(uid), nextName);
      safeStorageSetItem(getDoctorSpecialtyCacheKey(uid), nextSpecialty);
      if (wa) safeStorageSetItem(getDoctorWhatsAppCacheKey(uid), wa);
      if (at) safeStorageSetItem(getAccountTypeCacheKey(uid), at);
      if (exp) safeStorageSetItem(getPremiumExpiryCacheKey(uid), exp);
      if (nextImg) safeStorageSetItem(getProfileImageCacheKey(uid), nextImg);
    });

    return () => unsubscribe();
  }, [userId, user?.photoURL]);

  // 3. وظيفة تحديث صورة الملف الشخصي (Profile Image Update)
  const handleProfileImageUpdate = async (base64: string) => {
    if (!user) return;
    const prev = profileImage;
    setProfileImage(base64 || undefined); // تحديث فوري في الواجهة (Optimistic Update)

    try {
      const name = (doctorName || user.displayName || '').trim();
      await Promise.all([
        updateUserProfile(name, base64), // تحديث في Firebase Auth
        firestoreService.saveUserProfile(user.uid, { doctorName: name, profileImage: base64 }), // تحديث في Firestore
      ]);
      if (base64) safeStorageSetItem(getProfileImageCacheKey(user.uid), base64);
      setProfileKey((k) => k + 1); // تغيير المفتاح لإجبار الصور على التحديث
    } catch (error) {
      setProfileImage(prev); // العودة للصورة السابقة عند الفشل
      console.error('Profile image update failed:', error);
      throw error;
    }
  };

  // 4. وظيفة تحديث اسم الطبيب
  const handleDoctorNameUpdate = async (name: string) => {
    if (!user) return;
    const normalized = name.trim();
    await Promise.all([
      updateUserProfile(normalized),
      firestoreService.saveUserProfile(user.uid, { doctorName: normalized, profileImage: profileImage || '' }),
    ]);
    setDoctorName(normalized);
    setProfileKey((k) => k + 1);
  };

  // 5. وظيفة تحديث التخصص الطبي
  const handleDoctorSpecialtyUpdate = async (specialty: string) => {
    if (!user) return;
    const normalized = specialty.trim();
    await firestoreService.saveUserProfile(user.uid, {
      doctorName: doctorName || user.displayName || '',
      doctorSpecialty: normalized,
      profileImage: profileImage || '',
    });
    setDoctorSpecialty(normalized);
    setProfileKey((k) => k + 1);
  };

  return {
    profileKey, profileImage, doctorName, doctorSpecialty, doctorWhatsApp, accountType, premiumExpiryDate,
    handleProfileImageUpdate, handleDoctorNameUpdate, handleDoctorSpecialtyUpdate,
  };
};
