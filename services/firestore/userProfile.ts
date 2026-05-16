/**
 * خدمة الملف الشخصي للمستخدم (User Profile Service)
 * تدير هذه الخدمة البيانات الأساسية للطبيب والمستخدم:
 * 1. جلب وتحديث الاسم، التخصص، وصورة الملف الشخصي.
 * 2. متابعة حالة الحساب (مجاني/متميز) وتاريخ انتهاء الاشتراك.
 * 3. المزامنة المزدوجة بين مجموعتي 'users' و 'doctors' لضمان تماسك البيانات.
 */

import { getDoc, setDoc } from 'firebase/firestore';
import { subscribeDocCacheFirst } from './cacheFirst';
import { normalizeText } from '../../utils/textEncoding';
import {
    buildDoctorUserProfilePayload,
    buildPublicUserProfilePayload,
    getUserProfileDocRef,
} from './profileRoles';
import { normalizeEmail } from '../auth-service/validation';

/** هيكل بيانات الملف الشخصي */
interface UserProfileData {
    doctorName?: string;
    doctorSpecialty?: string;
    profileImage?: string;
    doctorWhatsApp?: string;
    accountType?: 'free' | 'premium' | 'pro_max';
    premiumExpiryDate?: string;
}

export interface PublicUserProfileData {
    name?: string;
    email?: string;
    phone?: string;
    emailVerified?: boolean;
}

/** دالة مساعدة لتنظيف النصوص الاختيارية */
const normalizeOptionalString = (value: unknown): string | undefined => {
    const normalized = normalizeText(value);
    return normalized || undefined;
};

const normalizeShortText = (value: unknown, maxLength: number): string => {
    const normalized = normalizeText(value);
    return normalized ? normalized.slice(0, maxLength) : '';
};

const normalizePublicProfileData = (data: Record<string, any> | null | undefined): PublicUserProfileData => {
    const nested = data?.publicProfile && typeof data.publicProfile === 'object'
        ? data.publicProfile as Record<string, unknown>
        : {};

    return {
        name:
            normalizeShortText(nested.name, 80) ||
            normalizeShortText(data?.name, 80) ||
            normalizeShortText(data?.displayName, 80),
        email: normalizeEmail(nested.email || data?.email),
        phone:
            normalizeShortText(nested.phone, 30) ||
            normalizeShortText(data?.phone, 30),
    };
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

    subscribeToPublicUserProfile: (
        userId: string,
        onUpdate: (profile: PublicUserProfileData) => void
    ) => {
        const userRef = getUserProfileDocRef(userId);
        return subscribeDocCacheFirst(userRef, {
            next: (snap) => {
                const data = snap.exists() ? (snap.data() as Record<string, any>) : null;
                onUpdate(normalizePublicProfileData(data));
            },
        });
    },

    savePublicUserProfile: async (
        userId: string,
        profile: PublicUserProfileData,
        options: { preserveExistingWhenEmpty?: boolean; preferExisting?: boolean } = {}
    ): Promise<PublicUserProfileData> => {
        const userRef = getUserProfileDocRef(userId);
        const nowIso = new Date().toISOString();
        let exists = false;
        let existingProfile: PublicUserProfileData = {};

        try {
            const snap = await getDoc(userRef);
            exists = snap.exists();
            existingProfile = exists
                ? normalizePublicProfileData(snap.data() as Record<string, any>)
                : {};
        } catch {
            // لو القراءة فشلت مؤقتاً، نكمّل بالحفظ merge. قواعد Firestore ستحمي الملكية.
        }

        const incomingName = normalizeShortText(profile.name, 80);
        const incomingEmail = normalizeEmail(profile.email);
        const incomingPhone = normalizeShortText(profile.phone, 30);
        const existingName = normalizeShortText(existingProfile.name, 80);
        const existingEmail = normalizeEmail(existingProfile.email);
        const existingPhone = normalizeShortText(existingProfile.phone, 30);

        const nextName =
            (options.preferExisting ? existingName : '') ||
            incomingName ||
            (options.preserveExistingWhenEmpty ? existingName : '');
        const nextEmail =
            (options.preferExisting ? existingEmail : '') ||
            incomingEmail ||
            (options.preserveExistingWhenEmpty ? existingEmail : '');
        const nextPhone =
            (options.preferExisting ? existingPhone : '') ||
            incomingPhone ||
            (options.preserveExistingWhenEmpty ? existingPhone : '');

        const savedProfile: PublicUserProfileData = {
            name: nextName,
            email: nextEmail,
            phone: nextPhone,
        };

        const basePayload: Record<string, unknown> = {
            publicProfile: savedProfile,
            name: nextName,
            displayName: nextName,
            email: nextEmail,
            phone: nextPhone,
            updatedAt: nowIso,
        };

        if (profile.emailVerified) {
            basePayload.emailVerified = true;
            basePayload.publicVerifiedAt = nowIso;
        }

        const payload = exists
            ? basePayload
            : buildPublicUserProfilePayload({
                ...basePayload,
                createdAt: nowIso,
            });

        await setDoc(userRef, payload, { merge: true });
        return savedProfile;
    },
};
