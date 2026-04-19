import { useEffect, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { firestoreService } from '../../../services/firestore';
import { unregisterPushTokenForSecretary } from '../../../services/messagingService';
import { getSecretaryLoginErrorMessage, secretaryLogin } from '../../../services/secretaryLoginService';
import { SECRETARY_LAST_SECRET_KEY } from './constants';
import { secretaryAuthSecretKey, secretaryAuthUserKey, secretaryBranchKey } from './helpers';
import { sanitizeSecretaryName } from './securityUtils';
import type { SecretaryAuthCredentials } from '../../../types';

type UsePublicBookingAuthProfileParams = {
  secret: string;
  userId: string;
  navigate: NavigateFunction;
};

const normalizeFirestoreErrorCode = (error: unknown): string =>
  String((error as { code?: unknown })?.code || '')
    .trim()
    .toLowerCase()
    .replace(/^firebase\//, '')
    .replace(/^firestore\//, '');

const isAuthPermissionError = (error: unknown): boolean => {
  const code = normalizeFirestoreErrorCode(error);
  if (code === 'permission-denied' || code === 'insufficient-permission' || code === 'unauthenticated') {
    return true;
  }
  const message = String((error as { message?: unknown })?.message || '').toLowerCase();
  return (
    message.includes('missing or insufficient permissions') ||
    message.includes('permission-denied') ||
    message.includes('insufficient permissions') ||
    message.includes('unauthenticated')
  );
};

const extractEmail = (value: string): string =>
  value.match(/[^\s@]+@[^\s@]+\.[^\s@]+/i)?.[0].toLowerCase() || '';

export const usePublicBookingAuthProfile = ({
  secret,
  userId,
  navigate,
}: UsePublicBookingAuthProfileParams) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [doctorEmailInput, setDoctorEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [secretaryNameInput, setSecretaryNameInput] = useState('');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const activeAuthCredentialsRef = useRef<SecretaryAuthCredentials>({});
  const isAuthenticatedRef = useRef(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const getCurrentSessionToken = (): string | undefined => {
    const tokenFromSecret =
      secret ? String(localStorage.getItem(secretaryAuthSecretKey(secret)) || '').trim() : '';
    const tokenFromRef = String(activeAuthCredentialsRef.current.sessionToken || '').trim();
    const tokenFromUser =
      userId ? String(localStorage.getItem(secretaryAuthUserKey(userId)) || '').trim() : '';

    const resolvedToken = tokenFromSecret || tokenFromRef || tokenFromUser;

    if (resolvedToken && secret && tokenFromSecret !== resolvedToken) {
      localStorage.setItem(secretaryAuthSecretKey(secret), resolvedToken);
    }
    if (resolvedToken && userId && tokenFromUser !== resolvedToken) {
      localStorage.setItem(secretaryAuthUserKey(userId), resolvedToken);
    }

    activeAuthCredentialsRef.current = {
      ...activeAuthCredentialsRef.current,
      sessionToken: resolvedToken || undefined,
    };

    return resolvedToken || undefined;
  };

  const invalidateSecretarySession = (
    message = 'انتهت جلسة السكرتارية. يرجى تسجيل الدخول مرة أخرى.'
  ) => {
    if (secret) {
      localStorage.removeItem(secretaryAuthSecretKey(secret));
    }
    if (userId) {
      localStorage.removeItem(secretaryAuthUserKey(userId));
    }

    activeAuthCredentialsRef.current = {
      ...activeAuthCredentialsRef.current,
      sessionToken: undefined,
    };
    setProfileMenuOpen(false);
    setIsAuthenticated(false);
    setAuthChecking(false);
    setPasswordInput('');
    setAuthError(message);
  };

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) {
      setAuthError('تعذر تحديد رابط السكرتارية لهذا الحساب.');
      return;
    }

    const normalizedDoctorEmail = extractEmail(doctorEmailInput);
    if (!normalizedDoctorEmail) {
      setAuthError('يرجى إدخال إيميل الطبيب الصحيح');
      return;
    }

    if (!passwordInput.trim()) {
      setAuthError('يرجى إدخال الرقم السري');
      return;
    }

    try {
      const data = await secretaryLogin({
        secret,
        doctorEmail: normalizedDoctorEmail,
        secretaryPassword: passwordInput,
      });

      if (data.secret !== secret || (userId && data.userId && data.userId !== userId)) {
        setAuthError('بيانات الدخول غير صحيحة');
        return;
      }

      localStorage.setItem(secretaryAuthSecretKey(secret), data.sessionToken);
      if (userId) {
        localStorage.setItem(secretaryAuthUserKey(userId), data.sessionToken);
      }
      localStorage.setItem(secretaryBranchKey(secret), data.branchId);
      localStorage.setItem(SECRETARY_LAST_SECRET_KEY, secret);

      activeAuthCredentialsRef.current = {
        sessionToken: data.sessionToken,
        doctorEmail: normalizedDoctorEmail,
      };
      setIsAuthenticated(true);
      setAuthError('');
    } catch (error) {
      setAuthError(getSecretaryLoginErrorMessage(error));
    }
  };

  const handleSecretaryLogout = async () => {
    if (secret) {
      try {
        await unregisterPushTokenForSecretary(secret);
      } catch (error) {
        console.warn('[Secretary] Failed to unregister push token on logout:', error);
      }
    }

    if (secret) {
      localStorage.removeItem(secretaryAuthSecretKey(secret));
      localStorage.removeItem(secretaryBranchKey(secret));
    }
    if (userId) {
      localStorage.removeItem(secretaryAuthUserKey(userId));
    }
    localStorage.removeItem(SECRETARY_LAST_SECRET_KEY);

    try {
      const { clearAllAuth } = await import('../../../utils/clearAllAuth');
      await clearAllAuth();
    } catch (err) {
      console.error('Failed to clear all auth:', err);
    }

    activeAuthCredentialsRef.current = {};
    setProfileMenuOpen(false);
    setIsAuthenticated(false);
    setDoctorEmailInput('');
    setPasswordInput('');
    setAuthError('');
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (!secret || !isAuthenticated) {
      setSecretaryName('');
      setSecretaryNameInput('');
      setProfileSaveMessage('');
      return;
    }

    const profileKey = `dh_secretary_profile_name_${secret}`;
    const cachedName = localStorage.getItem(profileKey) || '';
    if (cachedName) {
      setSecretaryName(cachedName);
      setSecretaryNameInput(cachedName);
    }

    return firestoreService.subscribeToSecretaryProfile(
      secret,
      (profile) => {
        const remoteName = (profile?.name || '').trim();
        setSecretaryName(remoteName);
        setSecretaryNameInput(remoteName);
        if (remoteName) {
          localStorage.setItem(profileKey, remoteName);
        } else {
          localStorage.removeItem(profileKey);
        }
      },
      (error) => {
        if (isAuthPermissionError(error)) {
          return;
        }
        console.error('[Secretary] Failed to load profile from cloud:', error);
        setProfileSaveMessage('تعذر تحميل الاسم من السحابة');
      }
    );
  }, [secret, isAuthenticated]);

  const handleSaveSecretaryName = async () => {
    if (!secret || !isAuthenticated || profileSaving) return;
    const profileKey = `dh_secretary_profile_name_${secret}`;
    const trimmed = sanitizeSecretaryName(secretaryNameInput);
    setProfileSaving(true);
    setProfileSaveMessage('');
    setSecretaryName(trimmed);
    setSecretaryNameInput(trimmed);
    if (trimmed) {
      localStorage.setItem(profileKey, trimmed);
    } else {
      localStorage.removeItem(profileKey);
    }

    try {
      await firestoreService.saveSecretaryProfile(secret, { name: trimmed });
      setProfileSaveMessage(trimmed ? 'تم حفظ الاسم' : 'تم حذف الاسم المحفوظ');
    } catch (error) {
      if (isAuthPermissionError(error)) {
        setProfileSaveMessage(
          trimmed ? 'تم حفظ الاسم على هذا الجهاز' : 'تم حذف الاسم المحفوظ من هذا الجهاز'
        );
        return;
      } else {
        console.error('[Secretary] Failed to save profile in cloud:', error);
        setProfileSaveMessage(
          trimmed
            ? 'تم حفظ الاسم على هذا الجهاز وتعذرت المزامنة السحابية الآن'
            : 'تم حذف الاسم المحفوظ من هذا الجهاز وتعذرت المزامنة السحابية الآن'
        );
      }
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileMenuOpen]);

  return {
    isAuthenticated,
    setIsAuthenticated,
    authChecking,
    setAuthChecking,
    doctorEmailInput,
    setDoctorEmailInput,
    passwordInput,
    setPasswordInput,
    authError,
    setAuthError,
    secretaryName,
    setSecretaryName,
    secretaryNameInput,
    setSecretaryNameInput,
    profileSaveMessage,
    setProfileSaveMessage,
    profileSaving,
    profileMenuOpen,
    setProfileMenuOpen,
    activeAuthCredentialsRef,
    isAuthenticatedRef,
    profileMenuRef,
    handleLogin,
    handleSecretaryLogout,
    handleSaveSecretaryName,
    sessionToken: getCurrentSessionToken(),
    getCurrentSessionToken,
    /** الفرع المربوط بالسكرتارية الحالية (من session). 'main' افتراضياً للتوافقية. */
    sessionBranchId: (secret ? (localStorage.getItem(secretaryBranchKey(secret)) || 'main') : 'main'),
    invalidateSecretarySession,
  };
};
