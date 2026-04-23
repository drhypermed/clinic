/**
 * خدمة الملف الشخصي للمستخدم (User Profile Service)
 * تدير هذه الخدمة البيانات الأساسية للطبيب والمستخدم:
 * 1. جلب وتحديث الاسم، التخصص، وصورة الملف الشخصي.
 * 2. متابعة حالة الحساب (مجاني/متميز) وتاريخ انتهاء الاشتراك.
 * 3. المزامنة المزدوجة بين مجموعتي 'users' و 'doctors' لضمان تماسك البيانات.
 */

import { doc, setDoc } from 'firebase/firestore';
import { subscribeDocCacheFirst } from './cacheFirst';
import { db } from '../firebaseConfig';
import { normalizeText } from '../../utils/textEncoding';
import {
    buildDoctorUserProfilePayload,
    getUserProfileDocRef,
} from './profileRoles';

/** هيكل بيانات الملف الشخصي */
interface UserProfileData {
    doctorName?: string;
    doctorSpecialty?: string;
    profileImage?: string;
    doctorWhatsApp?: string;
    accountType?: 'free' | 'premium' | 'pro_max';
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
        // اشتراك حقيقي على users/{uid} (cache-first + onSnapshot).
        // قبل كده كان one-shot، فلو الإداره غيّرت verificationStatus أو premiumExpiryDate
        // الـUI ما كانش بيشوف التغيير لحد الـrefresh.
        const userRef = getUserProfileDocRef(userId);
        return subscribeDocCacheFirst(userRef, {
            next: (snap) => {
                const data = snap.exists() ? (snap.data() as Record<string, any>) : null;
                if (!data) return;
                onUpdate({
                    doctorName: normalizeOptionalString(data.doctorName),
                    doctorSpecialty: normalizeOptionalString(data.doctorSpecialty),
                    profileImage: normalizeOptionalString(data.profileImage),
                    doctorWhatsApp: normalizeOptionalString(data.doctorWhatsApp),
                    accountType:
                        data.accountType === 'premium' ? 'premium'
                        : data.accountType === 'pro_max' ? 'pro_max'
                        : data.accountType === 'free' ? 'free'
                        : undefined,
                    premiumExpiryDate: normalizeOptionalString(data.premiumExpiryDate),
                });
            },
        });
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
