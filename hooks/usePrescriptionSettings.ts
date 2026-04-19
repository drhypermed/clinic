import { useState, useEffect, useCallback } from 'react';
import { PrescriptionSettings } from '../types';
import { prescriptionSettingsService, getDefaultSettings } from '../services/prescriptionSettingsService';

/** واجهة مخرجات Hook إعدادات الروشتة */
interface UsePrescriptionSettingsReturn {
    settings: PrescriptionSettings;      // قيم الإعدادات الحالية (العنوان، الشعار، الألوان)
    loading: boolean;                    // حالة التحميل من الـ Cloud
    error: string | null;                // رسائل الخطأ
    saveSettings: (settings: PrescriptionSettings) => Promise<void>; // حفظ التغييرات
    resetToDefault: () => Promise<void>; // العودة للضبط المصنعي
}

/**
 * Hook إدارة إعدادات الروشتة (usePrescriptionSettings):
 * يسمح للطبيب بتخصيص شكل الروشتة التي تظهر للمريض وتُطبع.
 * يتضمن ذلك (اسم العيادة، التخصص، العناوين، الهواتف، اللوجو، وألوان العرض).
 * @param branchId - الفرع النشط — كل فرع ليه إعدادات روشتة مستقلة
 */
export const usePrescriptionSettings = (userId: string | null, branchId?: string): UsePrescriptionSettingsReturn => {
    // البدء بالإعدادات الافتراضية لحين اكتمال التحميل
    const [settings, setSettings] = useState<PrescriptionSettings>(getDefaultSettings());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * المزامنة مع Firestore:
     * يشترك الـ Hook في وثيقة الإعدادات الخاصة بالطبيب/الفرع ليتم تحديث الواجهة
     * تلقائياً فور حفظ أي تعديل من أي جهاز آخر.
     */
    useEffect(() => {
        if (!userId) {
            setSettings(getDefaultSettings());
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = prescriptionSettingsService.subscribeToSettings(
            userId,
            (newSettings) => {
                setSettings(newSettings);
                setLoading(false);
                setError(null);
            },
            (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
            branchId,
        );

        return () => unsubscribe();
    }, [userId, branchId]);

    /** حفظ الإعدادات الجديدة في قاعدة بيانات الطبيب */
    const saveSettings = useCallback(async (newSettings: PrescriptionSettings) => {
        if (!userId) {
            setError('يجب تسجيل الدخول لحفظ الإعدادات');
            throw new Error('User not authenticated');
        }

        const previousSettings = settings;
        try {
            setError(null);
            await prescriptionSettingsService.saveSettings(userId, newSettings, branchId);
            setSettings(newSettings);
        } catch (err) {
            setSettings(previousSettings);
            const message = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الإعدادات';
            setError(message);
            throw err;
        }
    }, [settings, userId, branchId]);

    /** استعادة الإعدادات الافتراضية للنظام (Reset) */
    const resetToDefault = useCallback(async () => {
        if (!userId) {
            setSettings(getDefaultSettings());
            return;
        }

        try {
            setError(null);
            await prescriptionSettingsService.saveSettings(userId, getDefaultSettings(), branchId);
            setSettings(getDefaultSettings());
        } catch (err) {
            const message = err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة الإعدادات';
            setError(message);
            throw err;
        }
    }, [userId, branchId]);

    return {
        settings,
        loading,
        error,
        saveSettings,
        resetToDefault
    };
};
