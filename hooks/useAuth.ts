// استيراد أدوات React الأساسية
import React, { useState, useEffect } from 'react';
// استيراد أنواع بيانات Firebase لإدارة المستخدمين وقاعدة البيانات
import type { User } from 'firebase/auth';
import { auth, authPersistenceReady } from '../services/firebaseConfig';
import { PENDING_GOOGLE_AUTH_ROLE_KEY } from '../services/auth-service/constants';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import {
    getUserProfileDocRef,
    resolveAuthRoleFromProfileData,
} from '../services/firestore/profileRoles';
import {
    signInWithGoogle,
    signOut as authSignOut,
    onAuthStateChanged,
    updateUserProfile as updateUserProfileFromService,
    completePendingGoogleRedirect,
} from '../services/auth-service';
import { clearAllAuth } from '../utils/clearAllAuth';
import { resetUsageTrackingBatch } from '../services/usageTrackingService';
// ─ ثوابت الأدمن — للاستثناء من verification guard (الأدمن يدخل عادي)
import { ADMIN_EMAIL, ROOT_ADMIN_UID } from '../app/drug-catalog/admin';
import { normalizeEmail } from '../services/auth-service/validation';

const PENDING_GOOGLE_AUTH_WAIT_MS = 6000; // مدة انتظار معالجة بيانات جوجل
const PENDING_GOOGLE_AUTH_POLL_MS = 50;   // فترة الاستعلام المتكرر
const LAST_UID_KEY = 'dh_last_uid';        // آخر UID مسجل دخول — لاستعادة optimistic

type ProfileCollectionSource = 'users';

const loadResolvedProfile = async (
    uid: string,
): Promise<{ data: Record<string, any> | null; sourceCollection: ProfileCollectionSource | '' }> => {
    const userSnap = await getDocCacheFirst(getUserProfileDocRef(uid));
    if (!userSnap.exists()) {
        return { data: null, sourceCollection: '' };
    }

    return {
        data: userSnap.data() as Record<string, any>,
        sourceCollection: 'users',
    };
};

/**
 * واجهة المستخدم الممتدة (ExtendedUser):
 * تضيف حقولاً طبية خاصة بـ "دكتور هايبر كينيك" مثل حالة التحقق (verificationStatus)
 * والدور الوظيفي (authRole: طبيب أو مريض/عام).
 */
export interface ExtendedUser extends User {
    verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
    isVerified?: boolean;
    authRole?: 'doctor' | 'public';
    createdAt?: string;
}

// تعريف مخرجات الـ Hook للسياق العام للتطبيق
interface UseAuthReturn {
    user: ExtendedUser | null;      // المستخدم الحالي مع بياناته الممتدة
    loading: boolean;               // حالة التحميل (تمنع عرض الواجهة قبل التأكد من الهوية)
    error: string | null;           // رسائل الخطأ إن وجدت
    signInGoogle: (role?: 'doctor' | 'public') => Promise<void>; // دخول بـ Google
    signOut: () => Promise<void>;                                // خروج ومسح بيانات
    updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>; // تحديث الاسم والصورة
    clearError: () => void;         // تصفية أخطاء الدخول
    forceLoad: () => void;          // إجبار النظام على تخطي عقبة التحميل
}

/**
 * Hook مخصص لإدارة حالة المصادقة (useAuth):
 * المحرك المركزي للأمان في التطبيق، يربط بين Firebase Auth و Firestore Profiles.
 * يضمن تشفير الجلسات، التوجيه الصحيح بعد الدخول، وحماية المحتوى الحساس للطبيب.
 */
/**
 * محاولة استرجاع optimistic user من localStorage — يسمح للتطبيق يعرض
 * صفحة المستخدم فوراً بدل ما ينتظر Firebase يسترجع الجلسة من IndexedDB.
 * لو مفيش بيانات محفوظة → نرجع null ونفضل في loading.
 */
const getOptimisticUserFromCache = (): ExtendedUser | null => {
    if (typeof window === 'undefined') return null;
    try {
        const lastUid = (localStorage.getItem(LAST_UID_KEY) || '').trim();
        if (!lastUid) return null;
        const profileRaw = localStorage.getItem(`dh_user_profile_${lastUid}`);
        if (!profileRaw) return null;
        const profile = JSON.parse(profileRaw) as {
            verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
            isVerified?: boolean;
            authRole?: 'doctor' | 'public';
            createdAt?: string;
        };
        // نبني user مؤقت بالبيانات المحفوظة — Firebase هيحدّثه لما يجهز.
        return {
            uid: lastUid,
            email: null,
            emailVerified: false,
            displayName: null,
            photoURL: null,
            phoneNumber: null,
            providerId: 'firebase',
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: () => Promise.resolve(),
            getIdToken: () => Promise.resolve(''),
            getIdTokenResult: () => Promise.resolve({} as any),
            reload: () => Promise.resolve(),
            toJSON: () => ({}),
            verificationStatus: profile.verificationStatus,
            isVerified: profile.isVerified,
            authRole: profile.authRole,
            createdAt: profile.createdAt,
        } as ExtendedUser;
    } catch {
        return null;
    }
};

export const useAuth = (): UseAuthReturn => {
    // استرجاع optimistic من الكاش — لو في، نفضّل نعرض UI فوراً بدل null.
    // useRef عشان ما نستدعيش getOptimisticUserFromCache مرتين.
    const optimisticUserRef = React.useRef<ExtendedUser | null | undefined>(undefined);
    if (optimisticUserRef.current === undefined) {
        optimisticUserRef.current = getOptimisticUserFromCache();
    }
    const [user, setUser] = useState<ExtendedUser | null>(optimisticUserRef.current);
    const [loading, setLoading] = useState<boolean>(!optimisticUserRef.current);
    const [error, setError] = useState<string | null>(null);

    /** استرجاع "الدور" المحفوظ مؤقتاً في localStorage أثناء عملية الـ Redirect الخاصة بـ Google */
    const getPendingGoogleAuthRole = (): 'doctor' | 'public' | null => {
        if (typeof window === 'undefined') return null;
        try {
            const role = (localStorage.getItem(PENDING_GOOGLE_AUTH_ROLE_KEY) || '').trim();
            return role === 'doctor' || role === 'public' ? role : null;
        } catch {
            return null;
        }
    };

    /** 
     * وظيفة الانتظار (Polling Logic):
     * تمنع التطبيق من المتابعة حتى نربط الـ UID الجديد مع الـ Role المختار (طبيب/عام).
     */
    const waitForPendingGoogleAuthResolution = async (uid: string) => {
        if (typeof window === 'undefined') return;
        if (!getPendingGoogleAuthRole()) return;

        const startedAt = Date.now();
        while (Date.now() - startedAt < PENDING_GOOGLE_AUTH_WAIT_MS) {
            if (!getPendingGoogleAuthRole()) return;
            if ((auth.currentUser?.uid || '') !== uid) return;
            await new Promise((resolve) => setTimeout(resolve, PENDING_GOOGLE_AUTH_POLL_MS));
        }
    };

    useEffect(() => {
        let isMounted = true;
        let unsubscribe: (() => void) | undefined;
        let authListenerTimeout: ReturnType<typeof setTimeout> | undefined;

        /** 
         * تشغيل مستمع المصادقة (Auth Listener):
         * يتم تفعيله عند أي تغيير في حالة المستخدم (دخول، خروج، تغيير كلمة مرور).
         */
        const startAuthListener = () => {
            unsubscribe = onAuthStateChanged(async (authUser: User | null) => {
                // تصفية أي مؤقتات سابقة لتجنب تعارض الحالة
                if (authListenerTimeout) {
                    clearTimeout(authListenerTimeout);
                    authListenerTimeout = undefined;
                }

                if (authUser) {
                    setError(null);
                    try {
                        // لو عندنا user من optimistic cache لنفس الـ UID، منعرضش loading
                        // تاني — نحدّث البيانات في الخلفية بدون ما نعمل flash على الـ UI.
                        const lastUid = (localStorage.getItem(LAST_UID_KEY) || '').trim();
                        const isSameOptimisticUser = lastUid === authUser.uid;
                        if (!isSameOptimisticUser) {
                            setLoading(true);
                        }
                        // معالجة بيانات جوجل المعلقة
                        await waitForPendingGoogleAuthResolution(authUser.uid);
                        if (!isMounted) return;

                        // التحقق المزدوج من استقرار الهوية
                        if ((auth.currentUser?.uid || '') !== authUser.uid) {
                            if (!auth.currentUser) {
                                setUser(null);
                                setLoading(false);
                            }
                            return;
                        }

                        const profileCacheKey = `dh_user_profile_${authUser.uid}`;
                        const { data: userData, sourceCollection } = await loadResolvedProfile(authUser.uid);
                        const resolvedAuthRole = resolveAuthRoleFromProfileData(userData);

                        // ─ إجراء أمان: محدش يدخل التطبيق غير الأطباء المعتمدين فقط ─
                        // الـguard ده بيشتغل في كل auth state change عشان يغطي:
                        //   1) الطبيب الجديد بعد signup (verificationStatus = 'submitted')
                        //   2) الطبيب القديم في حالة 'pending' أو 'rejected'
                        //   3) محاولات تسجيل دخول من حسابات قديمة غير معتمدة
                        // ↓ أي حالة غير 'approved' = signout تلقائي
                        // الاستثناء الوحيد: الأدمن الجذر — بيدخل عادي (لإدارة اللوحة)
                        const adminEmailNormalized = normalizeEmail(ADMIN_EMAIL);
                        const userEmailNormalized = normalizeEmail(authUser.email);
                        const isRootAdmin =
                            authUser.uid === ROOT_ADMIN_UID ||
                            (!!userEmailNormalized && userEmailNormalized === adminEmailNormalized);

                        if (
                            !isRootAdmin &&
                            resolvedAuthRole === 'doctor' &&
                            userData?.verificationStatus !== 'approved'
                        ) {
                            console.warn(
                                `Doctor not approved (status: ${userData?.verificationStatus || 'missing'}) - auto signout`,
                            );
                            await authSignOut();
                            setUser(null);
                            setLoading(false);
                            return;
                        }

                        // دمج البيانات المستخرجة وتحديث الحالة العامة للمستخدِم
                        if (userData) {

                            const enrichedUser = {
                                ...authUser,
                                verificationStatus: userData?.verificationStatus,
                                isVerified: userData?.isVerified,
                                authRole: resolvedAuthRole,
                                createdAt: userData?.createdAt,
                            } as ExtendedUser;

                            setUser(enrichedUser);
                            // تخزين نسخة محلية للاستخدام في الـ Hooks الأخرى دون استعلام Firestore
                            localStorage.setItem(profileCacheKey, JSON.stringify({
                                verificationStatus: userData?.verificationStatus,
                                isVerified: userData?.isVerified,
                                authRole: resolvedAuthRole,
                                createdAt: userData?.createdAt,
                                sourceCollection,
                            }));
                            // تخزين آخر UID — عشان الفتحة الجاية نقدر نعمل optimistic render.
                            localStorage.setItem(LAST_UID_KEY, authUser.uid);
                        } else {
                            // مستخدم جديد مسجل بـ Google لم ينشئ ملفاً شخصياً بعد
                            setUser({ ...authUser } as ExtendedUser);
                        }
                        setLoading(false);
                    } catch (fetchError) {
                        console.warn('Error fetching user data:', fetchError);
                        setUser({ ...authUser } as ExtendedUser);
                        setLoading(false);
                    }
                } else {
                    // المستخدم غير مسجل دخول (Logged Out)
                    setUser(null);
                    setLoading(false);
                }
            });
        };

        /** تهيئة نظام المصادقة عند بدء التشغيل */
        const initializeAuth = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            // باراميتر للطوارئ لتخطي التحميل اللانهائي
            if (urlParams.get('forceLoad') === 'true') {
                if (isMounted) {
                    setLoading(false);
                    setError(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
                return;
            }

            // مؤقت أمان: إذا فشل الاتصال بقواعد البيانات، يسمح للمستخدم بالدخول بوضع محدود بدلاً من التعليق
            const timeout = setTimeout(() => {
                if (isMounted && loading) {
                    console.warn("Auth initialization timed out. Safe-mode enabled.");
                    setLoading(false);
                }
            }, 6000);

            try {
                await authPersistenceReady; // التأكد من استقرار IndexedDB الخاص بـ Firebase
                await completePendingGoogleRedirect(); // معالجة عودة المستخدم من نافذة جوجل
            } catch (redirectError: any) {
                console.warn('Google redirect completion failed:', redirectError);
                if (isMounted) {
                    const message = String(redirectError?.message || '');
                    const isStorageInitializationError = /indexeddb|internal assertion/i.test(message);
                    if (!isStorageInitializationError) {
                        setError(message || 'حدث خطأ في استعادة الجلسة');
                    }
                }
            } finally {
                clearTimeout(timeout);
                if (isMounted) {
                    startAuthListener();

                    // تحرير واجهة المستخدم في حال تأخر Firebase Auth في الاستجابة
                    authListenerTimeout = setTimeout(() => {
                        if (isMounted) {
                            setLoading((prev) => prev ? false : prev);
                        }
                    }, 5000);
                }
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
            if (authListenerTimeout) clearTimeout(authListenerTimeout);
            unsubscribe?.();
        };
    }, []);

    /** تفعيل تسجيل الدخول بـ Google مع تحديد غرض الحساب (طبيب أم مستخدم عام) */
    const signInGoogle = async (role: 'doctor' | 'public' = 'doctor') => {
        try {
            setError(null);
            setLoading(true);
            await signInWithGoogle(role);
        } catch (err: any) {
            const errorMsg = err.message || 'فشل تسجيل الدخول بـ Google';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** تسجيل الخروج: عملية تنظيف شاملة للبيانات الحساسة لضمان الخصوصية */
    const signOut = async () => {
        try {
            setError(null);
            setLoading(true);
            const currentUid = auth.currentUser?.uid;

            if (currentUid) {
                try {
                    const {
                        unregisterPushTokenForDoctor,
                        unregisterPushTokenForPublic,
                    } = await import('../services/messagingService');
                    const currentRole = (user?.authRole === 'public' ? 'public' : 'doctor');
                    if (currentRole === 'public') {
                        await unregisterPushTokenForPublic(currentUid);
                    } else {
                        await unregisterPushTokenForDoctor(currentUid);
                    }
                } catch (unregisterError) {
                    console.warn('Failed to unregister push token on logout:', unregisterError);
                }
            }

            // استدعاء المساعدة لمسح كافة بيانات الكاش والرموز السرية
            resetUsageTrackingBatch(); // مسح أحداث التتبع المعلقة لمنع تسجيلها تحت الحساب الخاطئ
            await clearAllAuth();
            await authSignOut();

            if (currentUid) {
                localStorage.removeItem(`dh_user_profile_${currentUid}`);
            }
            // مسح optimistic hint عشان الفتحة الجاية متعرضش صفحة مستخدم خارج.
            localStorage.removeItem(LAST_UID_KEY);
            setUser(null);
        } catch (err: any) {
            const errorMsg = err.message || 'حدث خطأ أثناء الخروج';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);
    const forceLoad = () => { setLoading(false); setError(null); };

    /** تحديث بيانات الملف الشخصي (الاسم المعروض وصورة العيادة) */
    const updateUserProfile = async (displayName: string, photoURL?: string) => {
        try {
            setError(null);
            setLoading(true);
            await updateUserProfileFromService(displayName, photoURL);

            if (auth.currentUser) {
                // إعادة مزامنة البيانات من Firestore لضمان توافق الحقول الممتدة
                const { data: userData } = await loadResolvedProfile(auth.currentUser.uid);
                setUser({
                    ...auth.currentUser,
                    verificationStatus: userData?.verificationStatus,
                    isVerified: userData?.isVerified,
                    authRole: resolveAuthRoleFromProfileData(userData),
                    createdAt: userData?.createdAt,
                } as ExtendedUser);
            }
        } catch (err: any) {
            const errorMsg = err.message || 'فشل تحديث ملفك الشخصي';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        signInGoogle,
        signOut,
        updateUserProfile,
        clearError,
        forceLoad,
    };
};
