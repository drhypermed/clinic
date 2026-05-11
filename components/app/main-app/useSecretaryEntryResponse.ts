/**
 * useSecretaryEntryResponse — استجابة الطبيب لطلبات دخول السكرتارية
 *
 * يُستخرج هذا الـ hook من `MainApp` ليعالج استجابة الطبيب لطلبات السكرتارية
 * للدخول إلى حالة مريض (approve / reject). الوظائف المغلّفة:
 *   1. `respondToSecretaryEntry` — الدالة المركزية التي تنفذ الاستجابة.
 *   2. `handleApproveSecretaryEntry` — موافقة مع toast نجاح.
 *   3. `handleRejectSecretaryEntry`  — رفض مع toast معلومة.
 *
 * بعد تنفيذ الاستجابة، يتم أيضاً إغلاق أي إشعارات push مفتوحة مرتبطة
 * بنفس الموعد عبر `closePushNotificationsByContext`.
 */

import React from 'react';
import { firestoreService } from '../../../services/firestore';
import { entryConversations } from '../../../services/firestore/entryConversations';
import { closePushNotificationsByContext } from '../../../services/messagingService';

interface SecretaryEntryRequest {
    appointmentId: string;
    /** الفرع الذي أرسل منه السكرتير الطلب — حتى يوجَّه الرد لنفس الفرع. */
    branchId?: string;
    /** الـsecret اللي الطلب اتكتب تحته — لو موجود، نستخدمه بدل bookingSecret
     *  عشان نمسح الـdoc الصح حتى لو الطبيب على فرع نشط مختلف. */
    sourceSecret?: string;
}

interface UseSecretaryEntryResponseArgs {
    bookingSecret: string;
    secretaryEntryRequest: SecretaryEntryRequest | null;
    setSecretaryEntryRequest: React.Dispatch<React.SetStateAction<any>>;
    showNotification: (msg: string, type?: 'success' | 'error' | 'info', opts?: any) => void;
}

export const useSecretaryEntryResponse = ({
    bookingSecret,
    secretaryEntryRequest,
    setSecretaryEntryRequest,
    showNotification,
}: UseSecretaryEntryResponseArgs) => {
    const respondToSecretaryEntry = React.useCallback(
        async (
            status: 'approved' | 'rejected',
            message: string,
            type: 'success' | 'info',
        ) => {
            if (!secretaryEntryRequest) return;
            const currentRequest = secretaryEntryRequest;
            // ⚠️ نستخدم sourceSecret (الـsecret اللي الطلب اتكتب تحته) بدل
            // bookingSecret (الفرع النشط حالياً). لو الطبيب على فرع تاني،
            // الـsourceSecret هو اللي يضمن إن المسح والرد يحصلوا على نفس الـdoc.
            const responseSecret = currentRequest.sourceSecret || bookingSecret;
            if (!responseSecret) return;
            setSecretaryEntryRequest(null);
            try {
                // تمرير branchId حتى يُمسح طلب الفرع الصحيح ويُسجَّل الرد عليه
                // الواجهة الموحدة — direction='S2D' لأن السكرتيرة طلبت والطبيب بيرد
                await entryConversations.respond({
                    secret: responseSecret,
                    direction: 'S2D',
                    appointmentId: currentRequest.appointmentId,
                    status,
                    branchId: currentRequest.branchId,
                });
                showNotification(message, type);
                void closePushNotificationsByContext({
                    type: 'secretary_entry_request',
                    appointmentId: currentRequest.appointmentId,
                    secret: responseSecret,
                });
            } catch (err) {
                console.error('Error responding to secretary entry:', err);
            }
        },
        [bookingSecret, secretaryEntryRequest, setSecretaryEntryRequest, showNotification]
    );

    const handleApproveSecretaryEntry = React.useCallback(
        () => respondToSecretaryEntry('approved', 'تمت الموافقة على دخول الحالة ✅', 'success'),
        [respondToSecretaryEntry]
    );

    const handleRejectSecretaryEntry = React.useCallback(
        () => respondToSecretaryEntry('rejected', 'تم إعلام السكرتارية بالانتظار ⏳', 'info'),
        [respondToSecretaryEntry]
    );

    return {
        handleApproveSecretaryEntry,
        handleRejectSecretaryEntry,
    };
};
