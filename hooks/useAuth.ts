// استيراد أدوات React الأساسية
import React, { useState, useEffect } from 'react';
// استيراد أنواع بيانات Firebase لإدارة المستخدمين وقاعدة البيانات
import type { User } from 'firebase/auth';
import { auth, authPersistenceReady } from '../services/firebaseConfig';
import {
    PENDING_GOOGLE_AUTH_ROLE_KEY,
    ROLE_RESOLUTION_ERROR_KEY,
} from '../services/auth-service/constants';
// مفتاح authFlowGuard — لما يكون نشط، يعني المستخدم في عمليه signup/login حساسه،
// والحارس ميـsignout-ش حتى لو الدور لسه مش متحدد (العمليه لسه شغّاله بتحفظ البروفايل).
import { AUTH_FLOW_GUARD_KEY } from '../components/app/core/constants';
// helper بيمسح الحارس + يطلق event عشان useAuthFlowGuard hook يعرف يـrefresh.
// مهم نستخدم ده بدل sessionStorage.removeItem المباشر — لأن الـhook بيعتمد على
// الـevent عشان يحدّث state الـin-memory، ومن غيره الـguard يفضل ظاهر "نشط".
import { clearAuthFlowGuard } from '../components/auth/authFlowGuard';
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

// حارس الوقت لتحديد دور المستخدم (Role Resolution Timeout):
// لو فضل user مسجَّل دخول لكن بدون authRole أكتر من المهلة دي (مثلاً Firestore بطيء،
// أو البروفايل ناقص، أو فشل قراءة البيانات)، نعمل محاوله أخيره لجلب البروفايل،
// ولو فشلت نعمل signout تلقائي مع رساله واضحه عشان المستخدم ميتعلّقش على شاشه تحميل.
const ROLE_RESOLUTION_TIMEOUT_MS = 6000;
const ROLE_RESOLUTION_FAILURE_MESSAGE =
    'تعذَّر تحديد نوع حسابك. تأكَّد من اتصالك بالإنترنت ثم سجَّل دخول مرة أخرى.';

/**
 * فحص لو في authFlowGuard نشط في sessionStorage.
 * authFlowGuard بيتفعّل قبل عمليه signup/login حساسه (مثلاً قبل signInWithPopup
 * في DoctorSignupPage). أثناء ما العمليه شغّاله، الـuser ممكن يكون authenticated
 * بـGoogle لكن لسه ما عملش setDoc للبروفايل — فالدور غير محدد بشكل طبيعي.
 * الحارس ميشتغلش في الحاله دي عشان ميقطعش العمليه قبل ما تخلص.
 */
const hasAuthFlowGuardActive = (): boolean => {
    if (typeof window === 'undefined') return false;
    try { return Boolean(sessionStorage.getItem(AUTH_FLOW_GUARD_KEY)); }
    catch { return false; }
};

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

    // حارس وقت تحديد الدور — يلغى لما الدور يتحدّد بنجاح، أو يطلق المعالجة
    // الاضطرارية (retry → signout) لو الدور فضل ناقص بعد المهلة.
    const roleResolutionTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearRoleResolutionTimer = React.useCallback(() => {
        if (roleResolutionTimerRef.current) {
            clearTimeout(roleResolutionTimerRef.current);
            roleResolutionTimerRef.current = null;
        }
    }, []);

    /**
     * يبدأ مؤقت يقوم بمحاولة أخيرة لقراءة البروفايل وتحديد الدور بعد ROLE_RESOLUTION_TIMEOUT_MS.
     * لو فشلت المحاوله، يعمل signout تلقائي ويحفظ رساله واضحه في localStorage
     * عشان صفحه الدخول تعرضها للمستخدم بدل ما يتعلّق على شاشه تحميل.
     */
    const startRoleResolutionTimer = React.useCallback((uid: string) => {
        clearRoleResolutionTimer();
        roleResolutionTimerRef.current = setTimeout(async () => {
            try {
                // محاوله أخيره: ممكن Firestore يكون رد متأخّر، أو الأدمن أكمل البروفايل
                const { data: retryData } = await loadResolvedProfile(uid);
                const retryRole = resolveAuthRoleFromProfileData(retryData);
                const stillSameUser = (auth.currentUser?.uid || '') === uid;

                if (retryRole && stillSameUser && auth.currentUser) {
                    // نجحت — حدّث الـstate وكمل عادي بدون signout
                    setUser({
                        ...auth.currentUser,
                        verificationStatus: retryData?.verificationStatus,
                        isVerified: retryData?.isVerified,
                        authRole: retryRole,
                        createdAt: retryData?.createdAt,
                    } as ExtendedUser);
                    return;
                }

                // فشلت — signout مع رساله واضحه للمستخدم
                console.warn('[useAuth] Role resolution timeout — forcing signout');
                try { localStorage.setItem(ROLE_RESOLUTION_ERROR_KEY, ROLE_RESOLUTION_FAILURE_MESSAGE); } catch { /* تجاهل: storage مغلق */ }
                try { await authSignOut(); } catch { /* تجاهل: ممكن يكون متسجّل خروج بالفعل */ }
                setUser(null);
                setLoading(false);
            } catch (retryError) {
                console.warn('[useAuth] Role resolution retry failed:', retryError);
                try { localStorage.setItem(ROLE_RESOLUTION_ERROR_KEY, ROLE_RESOLUTION_FAILURE_MESSAGE); } catch { /* تجاهل */ }
                try { await authSignOut(); } catch { /* تجاهل */ }
                setUser(null);
                setLoading(false);
            }
        }, ROLE_RESOLUTION_TIMEOUT_MS);
    }, [clearRoleResolutionTimer]);

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
                        if (userData && resolvedAuthRole) {
                            // نجح تحديد الدور — ألغي حارس الوقت لو كان شغّال من محاوله سابقه
                            clearRoleResolutionTimer();

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
                            // مستخدم بدون بروفايل أو بدون دور صالح — ابدأ حارس الوقت.
                            // الحارس هيعمل retry بعد المهله، ولو فشل هيعمل signout مع رساله.
                            // الاستثناء: لو في authFlowGuard نشط (مثلاً signup شغّال بيحفظ البروفايل)،
                            // الحارس ميشتغلش عشان ميقطعش العمليه قبل ما تخلص.
                            setUser({ ...authUser } as ExtendedUser);
                            if (!hasAuthFlowGuardActive()) {
                                startRoleResolutionTimer(authUser.uid);
                            }
                        }
                        setLoading(false);
                    } catch (fetchError) {
                        console.warn('Error fetching user data:', fetchError);
                        setUser({ ...authUser } as ExtendedUser);
                        // فشل قراءة البروفايل — حارس الوقت هيحاول تاني وبعدها signout لو لسه فاشل.
                        // نفس الاستثناء: مفيش حارس لو signup/login حساس شغّال.
                        if (!hasAuthFlowGuardActive()) {
                            startRoleResolutionTimer(authUser.uid);
                        }
                        setLoading(false);
                    }
                } else {
                    // المستخدم غير مسجل دخول (Logged Out) — ألغي أي حارس وقت شغّال
                    clearRoleResolutionTimer();
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
                // ─ فك authFlowGuard بعد الرجوع من signInWithRedirect ─
                // صفحات الـlogin (DoctorGoogleLoginPage / PublicLoginPage) بتعمل
                // setAuthFlowGuard قبل signInGoogle و clearAuthFlowGuardSoon بعده.
                // لكن في حالة popup-blocked، signInGoogle ينتقل لـsignInWithRedirect
                // اللي بيـreload الصفحه — فالأسطر اللي بعد الـawait مش بتتنفّذ
                // ويفضل الـguard نشط. الـguard النشط بيمنع useAppRedirectEffect من
                // توجيه المستخدم لـ/home بعد الـlogin، فيعلق على شاشه الدخول.
                // الحل المركزي: نفك الـguard هنا بعد ما الـredirect يخلص. مهم نستخدم
                // clearAuthFlowGuard() بدل sessionStorage.removeItem المباشر — لأن
                // الـhelper بيطلق AUTH_FLOW_GUARD_EVENT اللي useAuthFlowGuard بيستمع
                // له عشان يـrefresh state الـin-memory. بدون الـevent، الـhook يفضل
                // يقرا القيمه القديمه ويعتبر الـguard نشط فيمنع الـredirect لـ/home.
                try { clearAuthFlowGuard(); } catch { /* تجاهل */ }
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
            clearRoleResolutionTimer();
            unsubscribe?.();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- الـeffect لازم يشتغل مرّه واحده فقط عند mount
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
