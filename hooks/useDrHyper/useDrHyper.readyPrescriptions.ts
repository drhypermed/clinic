/**
 * إدارة الروشتات الجاهزة (createReadyPrescriptionActions):
 * يسمح هذا الملف للطبيب بإنشاء "قوالب" أو "روشتات جاهزة" (Templates) للحالات الشائعة.
 * المزايا:
 * 1. حفظ الحالة الحالية كروشتة جاهزة جديدة.
 * 2. تطبيق (Apply) روشتة جاهزة على المريض الحالي (مع خيار الدمج أو الاستبدال).
 * 3. تحديث، إعادة تسمية، أو حذف القوالب الموجودة.
 * 4. إدارة "كوتة" التخزين (Quota Management) لمنع تجاوز حدود الحساب.
 */

import React from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { PrescriptionItem, ReadyPrescription } from '../../types';
import { normalizeAdviceList } from '../../utils/rx/rxUtils';
import { SmartQuotaLimitErrorDetails } from '../../services/accountTypeControlsService';
import { isQuotaTransientError } from '../../services/account-type-controls/quotaErrors';
import {
    extractDoctorFinalInstruction,
    sanitizeReadyPrescriptionRxItems,
    sanitizeReadyPrescriptionText,
} from '../../utils/readyPrescriptionUtils';

type ShowNotification = (
    message: string,
    type?: 'success' | 'error' | 'info',
    options?: React.MouseEvent<any> | { event?: React.MouseEvent<any>; id?: string; firestoreId?: string }
) => void;

interface CreateReadyPrescriptionActionsParams {
    user: any;
    db: any;
    rxItems: PrescriptionItem[];
    generalAdvice: string[];
    labInvestigations: string[];
    readyPrescriptions: ReadyPrescription[];
    sanitizeRxItemsForSave: (items: PrescriptionItem[]) => PrescriptionItem[];
    sanitizeForFirestore: (value: unknown) => unknown;
    showNotification: ShowNotification;
    getAccountTypeControls: () => Promise<any>;
    resolveCurrentUserAccountType: () => Promise<'free' | 'premium'>;
    applyLimitPlaceholder: (template: string, limit: number, fallback: string) => string;
    dismissNotification: (id?: string, manual?: boolean) => void;
    openQuotaNoticeModal: (payload: { message: string; whatsappNumber?: string; whatsappUrl?: string; dayKey?: string; persist?: boolean }) => void;
    buildWhatsAppUrlFromNumber: (number: string, message: string) => string;
    consumeStorageQuota: (feature: 'recordSave' | 'readyPrescriptionSave') => Promise<any>;
    extractSmartQuotaErrorDetails: (error: any) => SmartQuotaLimitErrorDetails | null;
    getQuotaReachedMessage: (details: SmartQuotaLimitErrorDetails, fallback: string) => string;
    saveHistory: () => void;
    setRxItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
    setGeneralAdvice: React.Dispatch<React.SetStateAction<string[]>>;
    setLabInvestigations: React.Dispatch<React.SetStateAction<string[]>>;
    setLastSavedHash: React.Dispatch<React.SetStateAction<string>>;
    uniqTextList: (items: string[]) => string[];
    activeBranchId?: string;
}

export const createReadyPrescriptionActions = ({
    user,
    db,
    rxItems,
    generalAdvice,
    labInvestigations,
    readyPrescriptions,
    sanitizeRxItemsForSave,
    sanitizeForFirestore,
    showNotification,
    getAccountTypeControls,
    resolveCurrentUserAccountType,
    applyLimitPlaceholder,
    dismissNotification,
    openQuotaNoticeModal,
    buildWhatsAppUrlFromNumber,
    consumeStorageQuota,
    extractSmartQuotaErrorDetails,
    getQuotaReachedMessage,
    saveHistory,
    setRxItems,
    setGeneralAdvice,
    setLabInvestigations,
    setLastSavedHash,
    uniqTextList,
    activeBranchId,
}: CreateReadyPrescriptionActionsParams) => {
    const OFFLINE_SYNC_PENDING_KEY = 'dh_offline_sync_pending';

    type ReadyPrescriptionPayload = {
        name: string;
        rxItems: PrescriptionItem[];
        generalAdvice: string[];
        labInvestigations: string[];
    };

    const getReadableErrorMessage = (error: unknown, fallback: string): string => {
        const message = String((error as { message?: unknown })?.message || '').trim();
        return message || fallback;
    };

    const normalizeReadyPrescriptionPayload = (payload: ReadyPrescriptionPayload): ReadyPrescriptionPayload => {
        const normalizedName = String(payload.name || '').trim();
        const normalizedRxItems = sanitizeReadyPrescriptionRxItems(payload.rxItems || [], sanitizeRxItemsForSave);
        const normalizedAdvice = normalizeAdviceList(payload.generalAdvice || []).filter(v => !!String(v || '').trim());
        const normalizedLabs = (payload.labInvestigations || []).map(v => String(v || '').trim()).filter(v => !!v);

        return {
            name: normalizedName,
            rxItems: normalizedRxItems,
            generalAdvice: normalizedAdvice,
            labInvestigations: normalizedLabs,
        };
    };

    const hasReadyPrescriptionContent = (payload: ReadyPrescriptionPayload): boolean => {
        return payload.rxItems.length > 0 || payload.generalAdvice.length > 0 || payload.labInvestigations.length > 0;
    };

    const buildReadyPrescriptionWritePayload = (
        payload: ReadyPrescriptionPayload,
        includeCreatedAt: boolean
    ): Record<string, unknown> => {
        return {
            name: payload.name,
            rxItems: sanitizeForFirestore(payload.rxItems),
            generalAdvice: sanitizeForFirestore(payload.generalAdvice),
            labInvestigations: sanitizeForFirestore(payload.labInvestigations),
            ...(includeCreatedAt ? { createdAt: serverTimestamp() } : {}),
            updatedAt: serverTimestamp(),
        };
    };

    const notifyOfflineAwareSave = (
        onlineMessage: string,
        offlineMessage: string,
        e?: React.MouseEvent<any>
    ) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            localStorage.setItem(OFFLINE_SYNC_PENDING_KEY, '1');
            showNotification(offlineMessage, 'info', e);
            return;
        }

        showNotification(onlineMessage, 'success', e);
    };

    const ensureReadyPrescriptionCapacity = async (): Promise<boolean> => {
        try {
            const [controls, accountType] = await Promise.all([
                getAccountTypeControls(),
                resolveCurrentUserAccountType(),
            ]);

            const maxReady = accountType === 'premium'
                ? controls.premiumReadyPrescriptionsMaxCount
                : controls.freeReadyPrescriptionsMaxCount;

            if ((readyPrescriptions || []).length < maxReady) {
                return true;
            }

            const fallbackMsg = `تم الوصول إلى الحد الأقصى للروشتات الجاهزة (${maxReady}). احذف عنصرًا قديمًا لإضافة جديد.`;
            const template = accountType === 'premium'
                ? controls.premiumReadyPrescriptionsCapacityMessage
                : controls.freeReadyPrescriptionsCapacityMessage;
            const capacityMessage = applyLimitPlaceholder(template, maxReady, fallbackMsg);
            const capacityWhatsAppMessage = accountType === 'premium'
                ? controls.premiumReadyPrescriptionsCapacityWhatsappMessage
                : controls.freeReadyPrescriptionsCapacityWhatsappMessage;

            dismissNotification();
            openQuotaNoticeModal({
                message: capacityMessage,
                whatsappNumber: controls.whatsappNumber,
                whatsappUrl: buildWhatsAppUrlFromNumber(controls.whatsappNumber, capacityWhatsAppMessage || capacityMessage),
            });

            return false;
        } catch (capacityError) {
            console.error('Error checking ready prescriptions capacity:', capacityError);
            return true;
        }
    };

    const ensureReadyPrescriptionDailyQuota = async (): Promise<boolean> => {
        try {
            await consumeStorageQuota('readyPrescriptionSave');
            return true;
        } catch (quotaError: any) {
            const isDailyLimit = quotaError?.code === 'resource-exhausted'
                || quotaError?.message?.includes?.('STORAGE_DAILY_LIMIT_REACHED');
            const details = extractSmartQuotaErrorDetails(quotaError);

            if (isDailyLimit && details) {
                const fallback = details.accountType === 'free'
                    ? 'تم استهلاك حد حفظ الروشتات الجاهزة اليومي (مجاني)'
                    : 'تم استهلاك حد حفظ الروشتات الجاهزة اليومي (مميز)';

                dismissNotification();
                openQuotaNoticeModal({
                    message: getQuotaReachedMessage(details, fallback),
                    whatsappNumber: details.whatsappNumber,
                    whatsappUrl: details.whatsappUrl,
                    dayKey: details.dayKey,
                });
                return false;
            }

            if (isQuotaTransientError(quotaError)) {
                console.warn('Ready prescription quota check transient/offline failure, continuing local-first save:', quotaError);
                return true;
            }

            console.error('Error consuming ready prescription save quota:', quotaError);
            showNotification(getReadableErrorMessage(quotaError, 'حدث خطأ أثناء التحقق من حد الحفظ اليومي للروشتات'), 'error');
            return false;
        }
    };

    /** حفظ الروشتة الحالية كقالب جديد */
    const handleSaveReadyPrescription = async (name: string, e?: React.MouseEvent<any>): Promise<boolean> => {
        const normalizedPayload = normalizeReadyPrescriptionPayload({
            name,
            rxItems,
            generalAdvice,
            labInvestigations,
        });

        if (!normalizedPayload.name) {
            showNotification('يرجى إدخال اسم الروشتة الجاهزة', 'error', e);
            return false;
        }

        if (!user) {
            showNotification('يجب تسجيل الدخول أولاً', 'error', e);
            return false;
        }

        if (!hasReadyPrescriptionContent(normalizedPayload)) {
            showNotification('لا يمكن حفظ روشتة بدون أدوية أو تعليمات أو فحوصات', 'error', e);
            return false;
        }

        const hasCapacity = await ensureReadyPrescriptionCapacity();
        if (!hasCapacity) {
            return false;
        }

        const hasDailyQuota = await ensureReadyPrescriptionDailyQuota();
        if (!hasDailyQuota) {
            return false;
        }

        try {
            // إضافة السجل لـ Firestore
            await addDoc(collection(db, 'users', user.uid, 'readyPrescriptions'), {
                ...buildReadyPrescriptionWritePayload(normalizedPayload, true),
            });

            notifyOfflineAwareSave(
                'تم حفظ الروشتة في الروشتات الجاهزة',
                'تم حفظ الروشتة محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال',
                e
            );
            return true;
        } catch (error: unknown) {
            console.error('Error saving ready prescription:', error);
            const friendly = 'حدث خطأ أثناء حفظ الروشتة';
            showNotification(friendly, 'error', e);
            return false;
        }
    };

    /** تغيير اسم القالب مع الحفاظ على محتوياته */
    const handleRenameReadyPrescription = async (id: string, name: string) => {
        if (!user) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return;
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
            showNotification('يرجى كتابة اسم جديد للروشتة', 'error');
            return;
        }

        try {
            await setDoc(doc(db, 'users', user.uid, 'readyPrescriptions', id), {
                name: trimmedName,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            notifyOfflineAwareSave(
                'تم تعديل اسم الروشتة الجاهزة',
                'تم تعديل الاسم محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال'
            );
        } catch (error) {
            console.error('Error renaming ready prescription:', error);
            showNotification('حدث خطأ أثناء تعديل الاسم', 'error');
        }
    };

    /** تحديث بيانات قالب موجود من واقع الحالة الحالية */
    const handleUpdateReadyPrescription = async (
        id: string,
        payload: { name: string; rxItems: PrescriptionItem[]; generalAdvice: string[]; labInvestigations: string[] }
    ): Promise<boolean> => {
        if (!user) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return false;
        }

        const normalizedPayload = normalizeReadyPrescriptionPayload(payload);
        if (!normalizedPayload.name) {
            showNotification('يرجى إدخال اسم للروشتة', 'error');
            return false;
        }

        if (!hasReadyPrescriptionContent(normalizedPayload)) {
            showNotification('لا يمكن حفظ روشتة فارغة', 'error');
            return false;
        }

        try {
            await setDoc(
                doc(db, 'users', user.uid, 'readyPrescriptions', id),
                buildReadyPrescriptionWritePayload(normalizedPayload, false),
                { merge: true }
            );

            notifyOfflineAwareSave(
                'تم تحديث الروشتة الجاهزة',
                'تم تحديث الروشتة محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال'
            );
            return true;
        } catch (error: unknown) {
            console.error('Error updating ready prescription:', error);
            showNotification('حدث خطأ أثناء تحديث الروشتة', 'error');
            return false;
        }
    };

    /** إنشاء قالب جديد يدوياً */
    const handleCreateReadyPrescription = async (
        payload: { name: string; rxItems: PrescriptionItem[]; generalAdvice: string[]; labInvestigations: string[] }
    ): Promise<boolean> => {
        if (!user) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return false;
        }

        const normalizedPayload = normalizeReadyPrescriptionPayload(payload);
        if (!normalizedPayload.name) {
            showNotification('يرجى إدخال اسم للروشتة', 'error');
            return false;
        }

        if (!hasReadyPrescriptionContent(normalizedPayload)) {
            showNotification('لا يمكن حفظ روشتة فارغة', 'error');
            return false;
        }

        const hasCapacity = await ensureReadyPrescriptionCapacity();
        if (!hasCapacity) {
            return false;
        }

        const hasDailyQuota = await ensureReadyPrescriptionDailyQuota();
        if (!hasDailyQuota) {
            return false;
        }

        try {
            await addDoc(collection(db, 'users', user.uid, 'readyPrescriptions'), {
                ...buildReadyPrescriptionWritePayload(normalizedPayload, true),
            });

            showNotification('تم إنشاء الروشتة الجاهزة بنجاح', 'success');
            return true;
        } catch (error: unknown) {
            console.error('Error creating ready prescription:', error);
            showNotification('حدث خطأ أثناء إنشاء الروشتة', 'error');
            return false;
        }
    };

    /** حذف القالب نهائياً */
    const handleDeleteReadyPrescription = async (id: string): Promise<boolean> => {
        if (!user) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return false;
        }

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'readyPrescriptions', id));
            showNotification('تم حذف الروشتة الجاهزة من القائمة', 'success');
            return true;
        } catch (error: unknown) {
            console.error('Error deleting ready prescription:', error);
            showNotification('حدث خطأ أثناء حذف الروشتة', 'error');
            return false;
        }
    };

    /** تطبيق القالب على المريض الحالي باختيارات مرنة (دمج أو استبدال) */
    const handleApplyReadyPrescription = (
        preset: ReadyPrescription,
        e?: React.MouseEvent<any>,
        options?: { medicationsMode?: 'merge' | 'replace'; adviceMode?: 'merge' | 'replace'; labsMode?: 'merge' | 'replace' }
    ) => {
        // حفظ لقطة قبل التغيير لتمكين التراجع
        saveHistory();

        const medicationsMode = options?.medicationsMode || 'merge';
        const adviceMode = options?.adviceMode || 'merge';
        const labsMode = options?.labsMode || 'merge';

        // إنشاء نُسخ جديدة من الأدوية مع IDs فريدة لتجنب مشاكل مفاتيح React
        const currentRxIds = new Set(
            (medicationsMode === 'merge' ? (rxItems || []) : [])
                .map(item => item.id)
                .filter(Boolean)
        );
        const clonedItems = (preset.rxItems || []).map((item, idx) => {
            const sourceId = item.id || `preset-${idx}`;
            const generatedId = currentRxIds.has(sourceId)
                ? `${sourceId}-${Date.now()}-${idx}`
                : sourceId;

            const normalizedItem = item.type === 'medication'
                ? {
                    ...item,
                    dosage: sanitizeReadyPrescriptionText(item.dosage),
                    instructions: extractDoctorFinalInstruction(item),
                }
                : {
                    ...item,
                    instructions: sanitizeReadyPrescriptionText(item.instructions),
                };

            return {
                ...normalizedItem,
                id: generatedId,
            } as PrescriptionItem;
        });

        if (medicationsMode === 'replace') {
            setRxItems(clonedItems);
        } else {
            // تنظيف السطر الفارغ الذكي قبل دمج القالب
            const filteredCurrent = (rxItems || []).filter(
                item => !(item.type === 'medication' && !item.medication && !String(item.dosage || '').trim() && !String(item.instructions || '').trim())
            );
            setRxItems(() => [...filteredCurrent, ...clonedItems]);
        }

        const presetAdvice = normalizeAdviceList((preset.generalAdvice || []).filter(v => !!String(v || '').trim()));
        const presetLabs = (preset.labInvestigations || []).map(v => String(v || '').trim()).filter(v => !!v);

        if (adviceMode === 'replace') {
            setGeneralAdvice(presetAdvice);
        } else {
            const currentAdvice = (generalAdvice || []).filter(v => !!String(v || '').trim());
            setGeneralAdvice(() => uniqTextList([...currentAdvice, ...presetAdvice]));
        }

        if (labsMode === 'replace') {
            setLabInvestigations(presetLabs);
        } else {
            const currentLabs = (labInvestigations || []).filter(v => !!String(v || '').trim());
            setLabInvestigations(() => uniqTextList([...currentLabs, ...presetLabs]));
        }
        setLastSavedHash('');

        const medsAction = medicationsMode === 'replace' ? 'استبدال الأدوية' : 'دمج الأدوية';
        const adviceAction = adviceMode === 'replace' ? 'استبدال التعليمات' : 'دمج التعليمات';
        const labsAction = labsMode === 'replace' ? 'استبدال الفحوصات' : 'دمج الفحوصات';
        showNotification(`تم تطبيق الروشتة الجاهزة: ${preset.name} (${medsAction} + ${adviceAction} + ${labsAction})`, 'success', e);
    };

    return {
        handleSaveReadyPrescription,
        handleRenameReadyPrescription,
        handleUpdateReadyPrescription,
        handleCreateReadyPrescription,
        handleDeleteReadyPrescription,
        handleApplyReadyPrescription,
    };
};
