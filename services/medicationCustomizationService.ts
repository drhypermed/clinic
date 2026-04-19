import { db } from './firebaseConfig';
import {
    FieldPath, doc, setDoc, updateDoc, deleteField
} from 'firebase/firestore';
import { getDocCacheFirst } from './firestore/cacheFirst';
import { MedicationCustomization } from '../types';
import { getAccountTypeControls } from './accountTypeControlsService';
import { resolveEffectiveAccountTypeFromData } from '../utils/accountStatusTime';
import { getTrustedNowMs, syncTrustedTime } from '../utils/trustedTime';
import { getLegacyDoctorProfileDocRef, getUserProfileDocRef, mergePrimaryProfileData } from './firestore/profileRoles';

const resolveEffectiveAccountType = async (userId: string): Promise<'free' | 'premium'> => {
    const doctorRef = getLegacyDoctorProfileDocRef(userId);
    const userRef = getUserProfileDocRef(userId);
    const [doctorSnap, userSnap] = await Promise.all([
        getDocCacheFirst(doctorRef),
        getDocCacheFirst(userRef),
    ]);

    const merged = mergePrimaryProfileData(
        userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : null,
        doctorSnap.exists() ? (doctorSnap.data() as Record<string, unknown>) : null,
    ) as Record<string, unknown>;

    await syncTrustedTime();
    return resolveEffectiveAccountTypeFromData(merged, getTrustedNowMs());
};

const applyLimitPlaceholder = (template: string, limit: number, fallback: string): string => {
    const raw = String(template || '').trim();
    if (!raw) return fallback;
    return raw.replace(/\{\s*limit\s*\}/gi, String(limit));
};

const buildWhatsAppUrlFromNumber = (number: string, message: string): string => {
    const digits = String(number || '').replace(/\D/g, '');
    if (!digits) return '';
    const text = encodeURIComponent(String(message || '').trim());
    return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

/**
 * خدمة تخصيص الأدوية (Medication Customization Service)
 * تسمح للطبيب بتعديل بيانات الأدوية الافتراضية (مثل التركيزات، تعليمات الاستخدام، والأسعار)
 * وحفظ هذه التعديلات خاصة بحسابه فقط لتسهيل كتابة الروشتة لاحقاً.
 */

export const medicationCustomizationService = {
    /**
     * جلب جميع تخصيصات الأدوية الخاصة بالمستخدم من مستند المستخدم في Firestore
     */
    getCustomizations: async (userId: string): Promise<Record<string, MedicationCustomization>> => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDocCacheFirst(userRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                return (data.medicationCustomizations || {}) as Record<string, MedicationCustomization>;
            }
            return {};
        } catch (error) {
            console.error('[MedicationCustomization] Error getting customizations:', error);
            return {};
        }
    },

    /**
     * الاشتراك اللحظي في تغييرات تخصيصات الأدوية
     */
    subscribeToCustomizations: (
        userId: string,
        onUpdate: (customizations: Record<string, MedicationCustomization>) => void
    ) => {
        const userRef = doc(db, 'users', userId);
        let cancelled = false;

        getDocCacheFirst(userRef).then((snap) => {
            if (cancelled) return;
            if (snap.exists()) {
                const data = snap.data();
                onUpdate(data.medicationCustomizations || {});
            } else {
                onUpdate({});
            }
        }).catch(() => {});

        return () => { cancelled = true; };
    },

    /**
     * حفظ تخصيص لدواء معين (تعديل دواء موجود أو إضافة دواء جديد بالكامل)
     */
    saveCustomization: async (
        userId: string,
        customization: MedicationCustomization
    ): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDocCacheFirst(userRef);
            const medicationId = String(customization.medicationId || '').trim();
            if (!medicationId) {
                throw new Error('invalid-medication-id');
            }

            const currentCustomizations = (userDoc.exists()
                ? (userDoc.data()?.medicationCustomizations || {})
                : {}) as Record<string, MedicationCustomization>;
            const isNewCustomization = !currentCustomizations[medicationId];

            if (isNewCustomization) {
                const [controls, accountType] = await Promise.all([
                    getAccountTypeControls(),
                    resolveEffectiveAccountType(userId),
                ]);
                const limit = accountType === 'premium'
                    ? controls.premiumMedicationCustomizationsMaxCount
                    : controls.freeMedicationCustomizationsMaxCount;
                const used = Object.keys(currentCustomizations).length;

                if (used >= limit) {
                    const messageTemplate = accountType === 'premium'
                        ? controls.premiumMedicationCustomizationsCapacityMessage
                        : controls.freeMedicationCustomizationsCapacityMessage;
                    const fallbackMessage = accountType === 'premium'
                        ? `وصلت للحد الأقصى لتخزين الأدوية المعدلة (${limit}) للحساب المميز.`
                        : `وصلت للحد الأقصى لتخزين الأدوية المعدلة (${limit}) للحساب المجاني.`;
                    const whatsappTemplate = accountType === 'premium'
                        ? controls.premiumMedicationCustomizationsCapacityWhatsappMessage
                        : controls.freeMedicationCustomizationsCapacityWhatsappMessage;
                    const limitReachedMessage = applyLimitPlaceholder(messageTemplate, limit, fallbackMessage);

                    const error = new Error('MEDICATION_CUSTOMIZATION_CAPACITY_REACHED') as Error & {
                        code?: string;
                        details?: Record<string, unknown>;
                    };
                    error.code = 'resource-exhausted';
                    error.details = {
                        accountType,
                        limit,
                        used,
                        remaining: 0,
                        whatsappNumber: controls.whatsappNumber,
                        whatsappUrl: buildWhatsAppUrlFromNumber(controls.whatsappNumber, whatsappTemplate || limitReachedMessage),
                        limitReachedMessage,
                    };
                    throw error;
                }
            }

            /**
             * تجهيز كائن البيانات للحفظ مع التأكد من وجود القيم أو استخدام افتراضات
             */
            const customizationData: Record<string, unknown> = {
                medicationId,
                name: customization.name ?? '',
                genericName: customization.genericName ?? '',
                concentration: customization.concentration ?? '',
                usage: customization.usage ?? '',
                timing: customization.timing ?? '',
                instructions: customization.instructions ?? '',
                warnings: customization.warnings ?? [],
                matchKeywords: customization.matchKeywords ?? [],
                dateModified: Date.now()
            };

            // معالجة الحقول الإضافية للأدوية الجديدة المضافة يدوياً بواسطة الطبيب
            if (customization.isNew) {
                customizationData.isNew = true;
            }
            if (customization.form) {
                customizationData.form = customization.form;
            }

            // إضافة السعر إذا تم تحديده
            if (customization.price !== undefined && customization.price !== null) {
                customizationData.price = customization.price;
            }

            // إضافة قيود السن والوزن للجرعات المقترحة
            if (customization.minAgeMonths !== undefined && customization.minAgeMonths !== null) {
                customizationData.minAgeMonths = customization.minAgeMonths;
            }
            if (customization.maxAgeMonths !== undefined && customization.maxAgeMonths !== null) {
                customizationData.maxAgeMonths = customization.maxAgeMonths;
            }
            if (customization.minWeight !== undefined && customization.minWeight !== null) {
                customizationData.minWeight = customization.minWeight;
            }
            if (customization.maxWeight !== undefined && customization.maxWeight !== null) {
                customizationData.maxWeight = customization.maxWeight;
            }

            // إضافة التصنيف الطبي للدواء
            if (customization.category !== undefined && customization.category !== null) {
                customizationData.category = customization.category;
            }

            /**
             * معالجة حقول الجرعات (Dosage)
             * نستخدم deleteField() لحذف الحقل نهائياً من Firestore إذا كان فارغاً
             */
            if (customization.dosageText !== undefined && customization.dosageText !== null && customization.dosageText.trim() !== '') {
                customizationData.dosageText = customization.dosageText.trim();
            } else {
                customizationData.dosageText = deleteField();
            }

            if (customization.dosageFormula !== undefined && customization.dosageFormula !== null && customization.dosageFormula.trim() !== '') {
                customizationData.dosageFormula = customization.dosageFormula.trim();
            } else {
                customizationData.dosageFormula = deleteField();
            }

            if (customization.dosageFullText !== undefined && customization.dosageFullText !== null && customization.dosageFullText.trim() !== '') {
                customizationData.dosageFullText = customization.dosageFullText.trim();
            } else {
                customizationData.dosageFullText = deleteField();
            }

            // معالجة حالات الجرعات المركبة (Dosage Conditions)
            if (customization.dosageConditions !== undefined && customization.dosageConditions !== null && Array.isArray(customization.dosageConditions) && customization.dosageConditions.length > 0) {
                customizationData.dosageConditions = customization.dosageConditions;
            } else {
                customizationData.dosageConditions = deleteField();
            }

            // كتابة Atomic على مفتاح الدواء فقط لتفادي ضياع التعديلات المتزامنة.
            await setDoc(
                userRef,
                {
                    medicationCustomizations: {
                        [medicationId]: customizationData,
                    },
                },
                { merge: true }
            );
            console.log('[MedicationCustomization] Customization saved for medication:', medicationId);
        } catch (error) {
            console.error('[MedicationCustomization] Error saving customization:', error);
            throw error;
        }
    },

    /**
     * حذف تخصيص دواء معين للعودة إلى البيانات الافتراضية للنظام
     */
    deleteCustomization: async (userId: string, medicationId: string): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);
            const normalizedMedicationId = String(medicationId || '').trim();
            if (!normalizedMedicationId) return;

            const userDoc = await getDocCacheFirst(userRef);
            if (!userDoc.exists()) {
                return;
            }

            // حذف Atomic لمفتاح الدواء فقط بدون استبدال الخريطة بالكامل.
            await updateDoc(
                userRef,
                new FieldPath('medicationCustomizations', normalizedMedicationId),
                deleteField()
            );

            console.log('[MedicationCustomization] Customization deleted for medication:', normalizedMedicationId);
        } catch (error) {
            console.error('[MedicationCustomization] Error deleting customization:', error);
            throw error;
        }
    }
};
