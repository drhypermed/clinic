/**
 * useAdminListManagement — إدارة قائمة المسؤولين (Admins)
 *
 * hook مستخرج من `ComprehensiveAdminDashboard` يُغلّف المنطق الكامل لإدارة
 * قائمة الـ admins في Firestore:
 *   1. الاشتراك اللحظي بتغييرات collection `admins`.
 *   2. إضافة admin جديد (مع التحقق من صيغة البريد + عدم التكرار).
 *   3. حذف admin (مع منع حذف root admin أو النفس).
 *   4. إدارة رسائل الأخطاء والنجاح الخاصة بالعمليات.
 *
 * يُرجع state القائمة والـ handlers المطلوبة للعرض في `SettingsSection`.
 */

import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getAdminActionError } from './utils';
import { normalizeEmail } from '../../../services/auth-service/validation';
import type { AdminListItem } from './types';

/**
 * حد أقصى لعدد المسؤولين — حماية ضد المبالغة العرضية أو الخبيثة في حشو الـ collection.
 * عند الوصول للحد، الإضافة تُرفض مع رسالة واضحة.
 * 5 admins كافية للفريق الفعلي (الأدمن الأساسي + شركاء/مساعدين محدودين).
 */
const MAX_ADMINS_ALLOWED = 5;

/**
 * S3: تسجيل audit لأي عملية إضافة/حذف أدمن.
 * Append-only: الوثائق لا تُعدَّل أو تُحذف بعد الإنشاء (فرض في firestore.rules).
 */
const logAdminAction = async (
  action: 'add_admin' | 'remove_admin',
  targetEmail: string,
  actorEmail: string,
): Promise<void> => {
  try {
    await addDoc(collection(db, 'adminAuditLogs'), {
      action,
      targetEmail,
      actorEmail,
      timestampIso: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // الأخطاء في السجل لا يجب أن تُفشل العملية الأصلية
    console.warn('[adminAuditLog] Could not write audit entry:', err);
  }
};

interface UseAdminListManagementArgs {
    isAdminUser: boolean;
    userEmail: string | null | undefined;
    rootAdminEmail: string;
}

interface UseAdminListManagementReturn {
    adminList: AdminListItem[];
    adminListLoading: boolean;
    newAdminEmail: string;
    adminActionLoading: boolean;
    adminActionMessage: string;
    setNewAdminEmail: (value: string) => void;
    handleAddAdmin: () => Promise<void>;
    handleRemoveAdmin: (email: string) => Promise<void>;
}

export const useAdminListManagement = ({
    isAdminUser,
    userEmail,
    rootAdminEmail,
}: UseAdminListManagementArgs): UseAdminListManagementReturn => {
    const [adminList, setAdminList] = useState<AdminListItem[]>([]);
    const [adminListLoading, setAdminListLoading] = useState(true);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [adminActionLoading, setAdminActionLoading] = useState(false);
    const [adminActionMessage, setAdminActionMessage] = useState('');

    useEffect(() => {
        if (!isAdminUser) {
            setAdminList([]);
            setAdminListLoading(false);
            return;
        }

        setAdminListLoading(true);
        const unsub = onSnapshot(
            collection(db, 'admins'),
            (snapshot) => {
                const items = snapshot.docs.map((d) => {
                    const data = d.data() as Record<string, any>;
                    const email = normalizeEmail(data.email || d.id);
                    return {
                        email,
                        addedBy: data.addedBy,
                        createdAt: data.createdAt,
                        isRoot: email === rootAdminEmail,
                    } as AdminListItem;
                });

                const hasRoot = items.some((item) => item.email === rootAdminEmail);
                if (!hasRoot) {
                    items.unshift({ email: rootAdminEmail, isRoot: true, addedBy: 'system' });
                }

                items.sort((a, b) => {
                    if (a.isRoot) return -1;
                    if (b.isRoot) return 1;
                    return a.email.localeCompare(b.email);
                });

                setAdminList(items);
                setAdminListLoading(false);
            },
            (error) => {
                console.error('Error loading admins list:', error);
                setAdminListLoading(false);
            },
        );

        return () => unsub();
    }, [isAdminUser, rootAdminEmail]);

    const handleAddAdmin = async () => {
        if (!isAdminUser) {
            setAdminActionMessage('غير مصرح لك بإدارة المسؤولين.');
            return;
        }

        const email = normalizeEmail(newAdminEmail);
        if (!email) {
            setAdminActionMessage('يرجى إدخال بريد إلكتروني صحيح.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setAdminActionMessage('صيغة البريد الإلكتروني غير صحيحة.');
            return;
        }

        if (adminList.some((item) => item.email === email)) {
            setAdminActionMessage('هذا البريد مضاف بالفعل كمسؤول.');
            return;
        }

        // حماية من المبالغة في عدد المسؤولين
        if (adminList.length >= MAX_ADMINS_ALLOWED) {
            setAdminActionMessage(
                `وصلت للحد الأقصى من المسؤولين (${MAX_ADMINS_ALLOWED}). احذف أحدهم أولاً قبل الإضافة.`,
            );
            return;
        }

        setAdminActionLoading(true);
        setAdminActionMessage('');

        try {
            await setDoc(
                doc(db, 'admins', email),
                {
                    email,
                    addedBy: normalizeEmail(userEmail),
                    createdAt: new Date().toISOString(),
                },
                { merge: true },
            );
            await logAdminAction('add_admin', email, normalizeEmail(userEmail));
            setNewAdminEmail('');
            setAdminActionMessage('✅ تم إضافة الأدمن بنجاح.');
        } catch (error: unknown) {
            setAdminActionMessage(`❌ فشل إضافة الأدمن: ${getAdminActionError(error, 'تعذر إضافة الأدمن حاليًا.')}`);
        } finally {
            setAdminActionLoading(false);
        }
    };

    const handleRemoveAdmin = async (email: string) => {
        if (!isAdminUser) {
            setAdminActionMessage('غير مصرح لك بإدارة المسؤولين.');
            return;
        }

        const normalized = normalizeEmail(email);
        if (normalized === rootAdminEmail) {
            setAdminActionMessage('لا يمكن حذف الأدمن الأساسي من النظام.');
            return;
        }

        if (normalizeEmail(userEmail) === normalized) {
            setAdminActionMessage('لا يمكنك حذف نفسك من المسؤولين أثناء الجلسة الحالية.');
            return;
        }

        // S4: تأكيد قوي — يجب على الأدمن كتابة بريد المستهدف حرفياً لمنع الضغط العرضي.
        const typed = window.prompt(
            `⚠️ حذف صلاحية أدمن\n\n` +
            `المستهدف: ${normalized}\n\n` +
            `اكتب البريد بالكامل أدناه للتأكيد:`
        );
        if (typed === null) return; // ألغى المستخدم
        if (normalizeEmail(typed) !== normalized) {
            setAdminActionMessage('❌ البريد الذي كتبته لا يطابق. تم الإلغاء حمايةً للمسؤول.');
            return;
        }

        setAdminActionLoading(true);
        setAdminActionMessage('');

        try {
            await deleteDoc(doc(db, 'admins', normalized));
            await logAdminAction('remove_admin', normalized, normalizeEmail(userEmail));
            setAdminActionMessage('✅ تم حذف صلاحية الأدمن بنجاح.');
        } catch (error: unknown) {
            setAdminActionMessage(`❌ فشل حذف الأدمن: ${getAdminActionError(error, 'تعذر حذف الأدمن حاليًا.')}`);
        } finally {
            setAdminActionLoading(false);
        }
    };

    return {
        adminList,
        adminListLoading,
        newAdminEmail,
        adminActionLoading,
        adminActionMessage,
        setNewAdminEmail,
        handleAddAdmin,
        handleRemoveAdmin,
    };
};
