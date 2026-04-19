/**
 * خدمة الملف الشخصي للمستخدم (User Profile Service)
 * تدير هذه الخدمة البيانات الأساسية للطبيب والمستخدم:
 * 1. جلب وتحديث الاسم، التخصص، وصورة الملف الشخصي.
 * 2. متابعة حالة الحساب (مجاني/متميز) وتاريخ انتهاء الاشتراك.
 * 3. المزامنة المزدوجة بين مجموعتي 'users' و 'doctors' لضمان تماسك البيانات.
 */

import { doc, setDoc } from 'firebase/firestore';
import { getDocCacheFirst } from './cacheFirst';
import { db } from '../firebaseConfig';
import { normalizeText } from '../../utils/textEncoding';
import {
    buildDoctorUserProfilePayload,
    getLegacyDoctorProfileDocRef,
    getUserProfileDocRef,
    mergePrimaryProfileData,
} from './profileRoles';

/** هيكل بيانات الملف الشخصي */
interface UserProfileData {
    doctorName?: string;
    doctorSpecialty?: string;
    profileImage?: string;
    doctorWhatsApp?: string;
    accountType?: 'free' | 'premium';
    premiumExpiryDate?: string;
}

/** دالة مساعدة لتنظيف النصوص الاختيارية */
const normalizeOptionalString = (value: unknown): string | undefined => {
    const normalized = normalizeText(value);
    return normalized || undefined;
};

export const userProfileService = {
    /** 
     * الاشتراك في تحديثات الملف الشخصي مع (Smart Cache).
     * تجلب الدالة البيانات من الكاش المحلي فوراً لسرعة العرض، ثم تتابع التحديثات حية.
     */
    subscribeToUserProfile: (
        userId: string,
        onUpdate: (profile: UserProfileData) => void
    ) => {
        const userRef = getUserProfileDocRef(userId);
        const doctorRef = getLegacyDoctorProfileDocRef(userId);

        let lastProfile: UserProfileData | null = null;
        let latestUserData: Record<string, any> | null = null;
        let latestDoctorData: Record<string, any> | null = null;

        /** وظيفة موحدة لاستخراج البيانات وعرضها مع منع التكرار */
        const mapAndNotify = () => {
            const data = mergePrimaryProfileData(latestUserData, latestDoctorData);
            if (Object.keys(data).length === 0) return;
            const nextProfile: UserProfileData = {
                doctorName: normalizeOptionalString(data.doctorName),
                doctorSpecialty: normalizeOptionalString(data.doctorSpecialty),
                profileImage: normalizeOptionalString(data.profileImage),
                doctorWhatsApp: normalizeOptionalString(data.doctorWhatsApp),
                accountType: data.accountType === 'premium' ? 'premium' : (data.accountType === 'free' ? 'free' : undefined),
                premiumExpiryDate: normalizeOptionalString(data.premiumExpiryDate),
            };

            // منع التحديثات المتكررة إذا لم تتغير البيانات الفعلية (Deep comparison bypass)
            if (lastProfile &&
                lastProfile.doctorName === nextProfile.doctorName &&
                lastProfile.doctorSpecialty === nextProfile.doctorSpecialty &&
                lastProfile.profileImage === nextProfile.profileImage &&
                lastProfile.doctorWhatsApp === nextProfile.doctorWhatsApp &&
                lastProfile.accountType === nextProfile.accountType &&
                lastProfile.premiumExpiryDate === nextProfile.premiumExpiryDate
            ) {
                return;
            }

            lastProfile = nextProfile;
            onUpdate(nextProfile);
        };

        // بيانات الملف الشخصي بتتغير نادراً (مرة كل أسبوع/شهر)
        // كاش يكفي بدل 2 listener مفتوحين باستمرار
        let cancelled = false;

        Promise.all([
            getDocCacheFirst(userRef),
            getDocCacheFirst(doctorRef)
        ]).then(([uSnap, dSnap]) => {
            if (cancelled) return;
            latestUserData = uSnap.exists() ? (uSnap.data() as Record<string, any>) : null;
            latestDoctorData = dSnap.exists() ? (dSnap.data() as Record<string, any>) : null;
            mapAndNotify();
        }).catch(() => { });

        return () => { cancelled = true; };
    },

    /** حفظ وتحديث بيانات الملف الشخصي مع دمج التغييرات (Merge) */
    saveUserProfile: async (userId: string, profile: UserProfileData): Promise<void> => {
        const payload: Record<string, any> = {};

        // تعبئة البيانات المراد تحديثها فقط (Payload building)
        if (profile.doctorName !== undefined) {
            payload.doctorName = normalizeText(profile.doctorName);
        }

        if (profile.doctorSpecialty !== undefined) {
            payload.doctorSpecialty = normalizeText(profile.doctorSpecialty);
        }

        if (profile.profileImage !== undefined) {
            payload.profileImage = normalizeText(profile.profileImage);
        }

        if (profile.doctorWhatsApp !== undefined) {
            payload.doctorWhatsApp = normalizeText(profile.doctorWhatsApp);
        }

        if (profile.accountType !== undefined) {
            payload.accountType = profile.accountType;
        }

        if (profile.premiumExpiryDate !== undefined) {
            payload.premiumExpiryDate = normalizeText(profile.premiumExpiryDate);
        }

        if (Object.keys(payload).length === 0) return;

        const userRef = getUserProfileDocRef(userId);
        await setDoc(userRef, buildDoctorUserProfilePayload(payload), { merge: true });
    },
};
