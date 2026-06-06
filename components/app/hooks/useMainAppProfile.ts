import { useEffect, useState } from 'react';
import { firestoreService } from '../../../services/firestore';
import { safeStorageGetItem, safeStorageRemoveItem, safeStorageSetItem } from '../../../services/auth-service/storage';
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
  const [accountType, setAccountType] = useState<'free' | 'premium' | 'plus' | 'pro_max'>(() => {
    return (userId ? safeStorageGetItem(getAccountTypeCacheKey(userId)) : 'free') as 'free' | 'premium' | 'plus' | 'pro_max' || 'free';
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
    setAccountType((safeStorageGetItem(getAccountTypeCacheKey(uid)) as 'free' | 'premium' | 'plus' | 'pro_max') || 'free');
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
  const handleProfileImageUpdate = async (imageUrl: string) => {
    if (!user) return;
    const prev = profileImage;
    setProfileImage(imageUrl || undefined); // تحديث فوري في الواجهة (Optimistic Update)

    try {
      const name = (doctorName || user.displayName || '').trim();
      await Promise.all([
        updateUserProfile(name, imageUrl), // تحديث في Firebase Auth
        firestoreService.saveUserProfile(user.uid, { doctorName: name, profileImage: imageUrl }), // تحديث في Firestore
      ]);
      if (imageUrl) {
        safeStorageSetItem(getProfileImageCacheKey(user.uid), imageUrl);
      } else {
        safeStorageRemoveItem(getProfileImageCacheKey(user.uid));
      }
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
      firestoreService.saveUserProfile(user.uid, { doctorName: normalized }),
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
    });
    setDoctorSpecialty(normalized);
    setProfileKey((k) => k + 1);
  };

  return {
    profileKey, profileImage, doctorName, doctorSpecialty, doctorWhatsApp, accountType, premiumExpiryDate,
    handleProfileImageUpdate, handleDoctorNameUpdate, handleDoctorSpecialtyUpdate,
  };
};
