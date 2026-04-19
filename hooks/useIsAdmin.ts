/**
 * Hook للتحقق من صلاحيات المدير (Admin Check Hook)
 * يستخدم هذا الـ Hook للتحقق مما إذا كان المستخدم الحالي يمتلك صلاحيات المسؤول (Admin):
 * 1. التحقق من وجود البريد الإلكتروني في مجموعة 'admins' في Firestore.
 * 2. التحقق من UID المسؤول الجذر (Root Admin) المثبت في قواعد الأمان.
 * 3. دعم التحقق عبر البريد الإلكتروني مباشرة أو كائن المستخدم.
 */

import { useEffect, useMemo, useState } from 'react';
import { doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import { ADMIN_EMAIL, ROOT_ADMIN_UID } from '../app/drug-catalog/admin';

/** توحيد تنسيق البريد الإلكتروني للمقارنة بشكل صحيح */
const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();

/**
 * Hook للتحقق مما إذا كان المستخدم مسؤولاً.
 * يدعم التحقق عبر البريد الإلكتروني في مجموعة 'admins' والـ Root Admin UID.
 * 
 * @param userOrEmail يمكن أن يكون بريداً إلكترونياً أو كائن مستخدم يحتوي على { email, uid }.
 */
export const useIsAdmin = (userOrEmail?: string | { email?: string | null, uid?: string | null } | null) => {
    const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email;
    const uid = typeof userOrEmail === 'string' ? null : userOrEmail?.uid;

    const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
    const [isAdminFromStore, setIsAdminFromStore] = useState(false);

    useEffect(() => {
        if (!normalizedEmail) {
            setIsAdminFromStore(false);
            return;
        }

        // جلب صلاحيات الأدمن من الكاش أو السيرفر (مرة واحدة بدل مراقبة مستمرة)
        // بيانات الأدمن نادراً ما تتغير — الكاش يكفي
        const docRef = doc(db, 'admins', normalizedEmail);
        let cancelled = false;

        getDocCacheFirst(docRef)
            .then(snap => {
                if (!cancelled) setIsAdminFromStore(snap.exists());
            })
            .catch(() => {
                if (!cancelled) setIsAdminFromStore(false);
            });

        return () => { cancelled = true; };
    }, [normalizedEmail]);

    // التحقق مما إذا كان هو المسؤول الجذر أو يطابق البريد الإلكتروني الأساسي للمدير
    // الـ UID الجذر معرف في app/drug-catalog/admin.ts (مصدر واحد للقيمة).
    const isRootAdmin = (normalizedEmail && normalizedEmail === normalizeEmail(ADMIN_EMAIL)) || (uid === ROOT_ADMIN_UID);
    
    return isRootAdmin || isAdminFromStore;
};
