/**
 * secretConfig.settings.updateBooking — تحديث إعدادات الحجز الكاملة
 *
 * يُغلّف هذا الملف الدالة `updateBookingSettings` التي تُنفّذ تحديثاً شاملاً
 * على:
 *   - مستند المستخدم (`users/{uid}`).
 *   - مستند إعدادات الحجز (`bookingConfig/{secret}`).
 *   - مستند المصادقة (`bookingConfigAuth/{secret}`).
 *   - فهرس دخول السكرتارية (`secretaryLoginIndex/{email}`).
 *
 * تتضمن:
 *   1. تطبيع البيانات (formTitle، doctorEmail، العلامات الحيوية).
 *   2. hash كلمة المرور الجديدة (مع التحقق من المطابقة مع الـ hash الحالي).
 *   3. الكتابة المتوازية إلى الثلاث collections.
 *   4. التحقق من الكتابة على السيرفر (`getDocFromServer`).
 *   5. مزامنة فهرس الدخول.
 *
 * مستخرج من `secretConfig.settings.ts` لتقليل حجمه.
 */

import { deleteField, doc, getDoc, getDocFromServer, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { hashPassword, verifyPassword } from '../../../utils/bookingAuth';
import {
    normalizeSecretaryVitalFieldDefinitions,
    normalizeSecretaryVitalsVisibility,
} from '../../../utils/secretaryVitals';
import type {
    SecretaryVitalFieldDefinition,
    SecretaryVitalsVisibility,
} from '../../../types';
import { normalizeBookingSecret, normalizeEmail, sanitizeDocSegment, toOptionalText } from './helpers';
import { getSecretaryAuthRef } from './secretaryAuthStorage';

interface UpdateSecretaryLoginIndexFn {
    (doctorEmail: string, userId: string, hasPasswordHash: boolean): Promise<void>;
}

export const updateBookingSettings = async (
    userId: string,
    secret: string,
    formTitle: string,
    doctorDisplayName: string,
    secretaryPassword: string | undefined,
    doctorEmail: string | undefined,
    secretaryVitalsVisibility: SecretaryVitalsVisibility | undefined,
    secretaryVitalFields: SecretaryVitalFieldDefinition[] | undefined,
    upsertSecretaryLoginIndex: UpdateSecretaryLoginIndexFn,
    /** الفرع النشط — لمنع الكتابة على الـ global secret لما يكون فرع غير الرئيسي */
    branchId?: string,
): Promise<void> => {
    const normalizedUserId = sanitizeDocSegment(userId);
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedUserId || !normalizedSecret) return;

    const formTitleValue = toOptionalText(formTitle) || '';
    const doctorDisplayNameValue = toOptionalText(doctorDisplayName) || '';
    const doctorEmailValue = normalizeEmail(doctorEmail);
    const hasSecretaryVitalsVisibilityInput = secretaryVitalsVisibility !== undefined;
    const normalizedSecretaryVitalsVisibility = hasSecretaryVitalsVisibilityInput
        ? normalizeSecretaryVitalsVisibility(secretaryVitalsVisibility)
        : undefined;
    const hasSecretaryVitalFieldsInput = Array.isArray(secretaryVitalFields);
    const normalizedSecretaryVitalFields = hasSecretaryVitalFieldsInput
        ? normalizeSecretaryVitalFieldDefinitions(secretaryVitalFields)
        : undefined;

    const userRef = doc(db, 'users', normalizedUserId);
    const configRef = doc(db, 'bookingConfig', normalizedSecret);
    const authRef = getSecretaryAuthRef(normalizedSecret);

    const currentAuthSnap = await getDoc(authRef);
    const currentAuthData = currentAuthSnap.exists()
        ? (currentAuthSnap.data() as Record<string, unknown>)
        : {};
    const currentHash =
        typeof currentAuthData?.secretaryPasswordHash === 'string'
            ? String(currentAuthData.secretaryPasswordHash).trim()
            : '';

    const configData: Record<string, unknown> = {
        userId: normalizedUserId,
        formTitle: formTitleValue,
        doctorDisplayName: doctorDisplayNameValue,
        doctorEmail: doctorEmailValue || deleteField(),
        secretaryPasswordHash: deleteField(),
        secretarySessionToken: deleteField(),
        secretarySessionTokenUpdatedAt: deleteField(),
        secretaryPassword: deleteField(),
        updatedAt: new Date().toISOString(),
    };

    const isNonMainBranch = branchId && branchId !== 'main';
    // فقط الفرع الرئيسي يحدّث الحقول العامة (legacy top-level) للتوافق الرجعي.
    if (!isNonMainBranch) {
        if (hasSecretaryVitalsVisibilityInput && normalizedSecretaryVitalsVisibility) {
            configData.secretaryVitalsVisibility = normalizedSecretaryVitalsVisibility;
        }
        if (hasSecretaryVitalFieldsInput && normalizedSecretaryVitalFields) {
            configData.secretaryVitalFields = normalizedSecretaryVitalFields;
        }
    }

    const userData: Record<string, unknown> = {
        // فقط الفرع الرئيسي يكتب على users/{uid}.bookingSecret — الفروع التانية بتستخدم Branch.secretarySecret
        ...(isNonMainBranch ? {} : { bookingSecret: normalizedSecret }),
        bookingFormTitle: formTitleValue,
        doctorEmail: doctorEmailValue || deleteField(),
        secretaryPassword: deleteField(),
    };

    if (!isNonMainBranch) {
        if (hasSecretaryVitalsVisibilityInput && normalizedSecretaryVitalsVisibility) {
            userData.secretaryVitalsVisibility = normalizedSecretaryVitalsVisibility;
        }
        if (hasSecretaryVitalFieldsInput && normalizedSecretaryVitalFields) {
            userData.secretaryVitalFields = normalizedSecretaryVitalFields;
        }
    }

    const authData: Record<string, unknown> = {
        userId: normalizedUserId,
        doctorEmail: doctorEmailValue || deleteField(),
        updatedAt: new Date().toISOString(),
    };

    let expectedSecretaryHash: string | null = null;
    // مرجع كلمة سر الفرع الفرعي (non-main) — يستخدم subcollection
    const branchAuthRef = isNonMainBranch
        ? doc(db, 'secretaryAuth', normalizedSecret, 'branches', branchId!)
        : null;

    if (secretaryPassword !== undefined) {
        const normalizedSecretaryPassword = String(secretaryPassword).trim();
        if (normalizedSecretaryPassword) {
            // قراءة الـ hash الحالي حسب المسار (main أو branch)
            let currentBranchHash = '';
            if (isNonMainBranch && branchAuthRef) {
                try {
                    const s = await getDoc(branchAuthRef);
                    currentBranchHash = typeof s.data()?.passwordHash === 'string' ? String(s.data()?.passwordHash).trim() : '';
                } catch {
                    currentBranchHash = '';
                }
            }
            const hashToCompare = isNonMainBranch ? currentBranchHash : currentHash;
            const passwordMatchesCurrentHash =
                hashToCompare &&
                (await verifyPassword(normalizedSecretaryPassword, hashToCompare).catch(() => false));
            expectedSecretaryHash = passwordMatchesCurrentHash
                ? hashToCompare
                : await hashPassword(normalizedSecretaryPassword);

            if (isNonMainBranch) {
                // الفرع الفرعي: اكتب في subcollection فقط. لا تلمس المستند الأساسي ولا users/.
                // configData.secretaryAuthRequired = true لأن فيه فرع محمي
                configData.secretaryAuthRequired = true;
            } else {
                // الفرع الرئيسي: نفس السلوك القديم
                userData.secretaryPasswordHash = expectedSecretaryHash;
                authData.secretaryPasswordHash = expectedSecretaryHash;
                authData.secretarySessionToken = deleteField();
                authData.secretarySessionTokenUpdatedAt = deleteField();
                configData.secretaryAuthRequired = true;
            }
        } else {
            // إزالة كلمة السر
            if (isNonMainBranch) {
                // سيتم حذف مستند الفرع الفرعي بعد شوية
            } else {
                userData.secretaryPasswordHash = deleteField();
                authData.secretaryPasswordHash = deleteField();
                authData.secretarySessionToken = deleteField();
                authData.secretarySessionTokenUpdatedAt = deleteField();
                configData.secretaryAuthRequired = false;
            }
        }
    }

    await setDoc(userRef, userData, { merge: true });
    await setDoc(configRef, configData, { merge: true });

    // كتابة إعدادات العلامات الحيوية per-branch إلى حقل map (يحافظ على باقي الفروع).
    const branchMapKey = !branchId || branchId === 'main' ? 'main' : branchId;
    const userMapUpdates: Record<string, unknown> = {};
    const configMapUpdates: Record<string, unknown> = {};
    if (hasSecretaryVitalsVisibilityInput && normalizedSecretaryVitalsVisibility) {
        userMapUpdates[`secretaryVitalsVisibilityByBranch.${branchMapKey}`] = normalizedSecretaryVitalsVisibility;
        configMapUpdates[`secretaryVitalsVisibilityByBranch.${branchMapKey}`] = normalizedSecretaryVitalsVisibility;
    }
    if (hasSecretaryVitalFieldsInput && normalizedSecretaryVitalFields) {
        userMapUpdates[`secretaryVitalFieldsByBranch.${branchMapKey}`] = normalizedSecretaryVitalFields;
        configMapUpdates[`secretaryVitalFieldsByBranch.${branchMapKey}`] = normalizedSecretaryVitalFields;
    }
    if (Object.keys(userMapUpdates).length > 0) {
        await updateDoc(userRef, userMapUpdates).catch(() => undefined);
    }
    if (Object.keys(configMapUpdates).length > 0) {
        await updateDoc(configRef, configMapUpdates).catch(() => undefined);
    }

    if (isNonMainBranch && branchAuthRef && secretaryPassword !== undefined) {
        const normalizedSecretaryPassword = String(secretaryPassword).trim();
        if (normalizedSecretaryPassword && expectedSecretaryHash) {
            // كتابة hash كلمة سر الفرع + إبطال الـ session الحالية
            await setDoc(branchAuthRef, {
                passwordHash: expectedSecretaryHash,
                sessionToken: deleteField(),
                sessionTokenUpdatedAt: deleteField(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        } else {
            // مسح كلمة سر الفرع نهائياً
            await setDoc(branchAuthRef, {
                passwordHash: deleteField(),
                sessionToken: deleteField(),
                sessionTokenUpdatedAt: deleteField(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
    } else if (!isNonMainBranch) {
        // الفرع الرئيسي: نفس السلوك القديم
        if (secretaryPassword !== undefined || !currentAuthSnap.exists()) {
            await setDoc(authRef, authData, { merge: true });
        } else if (doctorEmailValue) {
            await setDoc(authRef, { userId: normalizedUserId, doctorEmail: doctorEmailValue }, { merge: true });
        }
    }

    // التحقق من أن الكتابة نجحت فعلاً على السيرفر
    const serverConfigSnap = await getDocFromServer(configRef);
    const serverConfigData = serverConfigSnap.data();
    const serverTitle =
        typeof serverConfigData?.formTitle === 'string' ? toOptionalText(serverConfigData.formTitle) || '' : '';
    if (serverTitle !== formTitleValue) {
        throw new Error('Cloud save verification failed for secretary form title.');
    }

    let hasPasswordHash = false;
    if (secretaryPassword !== undefined) {
        if (isNonMainBranch && branchAuthRef) {
            // التحقق من الكتابة في subcollection للفرع الفرعي
            const serverBranchAuthSnap = await getDocFromServer(branchAuthRef);
            const serverBranchData = serverBranchAuthSnap.data();
            const serverBranchHash =
                typeof serverBranchData?.passwordHash === 'string'
                    ? String(serverBranchData.passwordHash)
                    : '';

            if (expectedSecretaryHash) {
                if (serverBranchHash !== expectedSecretaryHash) {
                    throw new Error('Cloud save verification failed for branch secretary password hash.');
                }
                hasPasswordHash = true;
            } else if (serverBranchHash) {
                throw new Error('Cloud save verification failed for branch secretary password removal.');
            }
        } else {
            // الفرع الرئيسي: نفس التحقق القديم
            const serverAuthSnap = await getDocFromServer(authRef);
            const serverAuthData = serverAuthSnap.data();
            const serverHash =
                typeof serverAuthData?.secretaryPasswordHash === 'string'
                    ? String(serverAuthData.secretaryPasswordHash)
                    : '';

            if (expectedSecretaryHash) {
                if (serverHash !== expectedSecretaryHash) {
                    throw new Error('Cloud save verification failed for secretary password hash.');
                }
                hasPasswordHash = true;
            } else if (serverHash) {
                throw new Error('Cloud save verification failed for secretary password removal.');
            }
        }
    } else {
        hasPasswordHash = Boolean(currentHash);
    }

    // الفرع الرئيسي بس يحدث فهرس الدخول — الفروع التانية بتستخدم الرابط مباشرة
    if (doctorEmailValue && !isNonMainBranch) {
        try {
            await upsertSecretaryLoginIndex(doctorEmailValue, normalizedUserId, hasPasswordHash);
        } catch (error) {
            console.warn('[Firestore] Failed to sync secretary login index after updateBookingSettings:', error);
        }
    }
};
