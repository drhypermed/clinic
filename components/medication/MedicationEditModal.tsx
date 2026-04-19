import React, { useState, useEffect } from 'react';
import { Medication, MedicationCustomization } from '../../types';
import { medicationCustomizationService } from '../../services/medicationCustomizationService';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmModal } from '../modals/ConfirmModal';
import { loadBaseMedications } from '../../app/drug-catalog/medicationsLoader';
import { MedicationEditModalHeader } from './MedicationEditModalHeader';
import { MedicationEditModalFooter } from './MedicationEditModalFooter';
import { MedicationBasicInfoSection } from './MedicationBasicInfoSection';
import { MedicationDosageBuilder } from './MedicationDosageBuilder';

interface MedicationEditModalProps {
    medication: Medication | null;
    onClose: () => void;
    onSave: () => void;
    onShowNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MedicationEditModal: React.FC<MedicationEditModalProps> = ({
    medication,
    onClose,
    onSave,
    onShowNotification
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    const getBaseMedication = async (target: Medication): Promise<Medication> => {
        if (target.isNew) return target;
        const baseCatalog = await loadBaseMedications();
        return baseCatalog.find((m) => m.id === target.id) || target;
    };

    const [formData, setFormData] = useState<MedicationCustomization>({
        medicationId: '',
        name: '',
        genericName: '',
        concentration: '',
        price: undefined,
        usage: '',
        timing: '',
        instructions: '',
        warnings: [],
        minAgeMonths: undefined,
        maxAgeMonths: undefined,
        minWeight: undefined,
        maxWeight: undefined,
        matchKeywords: [],
        dosageConditions: [],
        category: undefined,
        form: undefined
    });

    const isNewMedication = medication?.isNew ?? false;

    useEffect(() => {
        if (!medication || !user?.uid) return;

        let isMounted = true;
        const loadCustomization = async () => {
            try {
                const [customizations, baseMedication] = await Promise.all([
                    medicationCustomizationService.getCustomizations(user.uid),
                    getBaseMedication(medication),
                ]);
                if (!isMounted) return;
                const savedCustomization = customizations[medication.id];

                setFormData({
                    medicationId: baseMedication.id,
                    name: savedCustomization?.name !== undefined ? savedCustomization.name : baseMedication.name,
                    genericName: savedCustomization?.genericName !== undefined ? savedCustomization.genericName : baseMedication.genericName,
                    concentration: savedCustomization?.concentration !== undefined ? savedCustomization.concentration : baseMedication.concentration,
                    price: savedCustomization?.price !== undefined ? savedCustomization.price : baseMedication.price,
                    usage: savedCustomization?.usage !== undefined ? savedCustomization.usage : baseMedication.usage,
                    timing: savedCustomization?.timing !== undefined ? savedCustomization.timing : baseMedication.timing,
                    instructions: savedCustomization?.instructions !== undefined ? savedCustomization.instructions : baseMedication.instructions,
                    warnings: savedCustomization?.warnings !== undefined ? savedCustomization.warnings : baseMedication.warnings || [],
                    minAgeMonths: savedCustomization?.minAgeMonths !== undefined ? savedCustomization.minAgeMonths : baseMedication.minAgeMonths,
                    maxAgeMonths: savedCustomization?.maxAgeMonths !== undefined ? savedCustomization.maxAgeMonths : baseMedication.maxAgeMonths,
                    minWeight: savedCustomization?.minWeight !== undefined ? savedCustomization.minWeight : baseMedication.minWeight,
                    maxWeight: savedCustomization?.maxWeight !== undefined ? savedCustomization.maxWeight : baseMedication.maxWeight,
                    matchKeywords: savedCustomization?.matchKeywords || baseMedication.matchKeywords || [],
                    category: savedCustomization?.category !== undefined ? savedCustomization.category : baseMedication.category,
                    dosageConditions: savedCustomization?.dosageConditions || [],
                    form: savedCustomization?.form !== undefined ? savedCustomization.form : baseMedication.form
                });
            } catch (error) {
                console.error('Error loading customization:', error);
                const baseMedication = await getBaseMedication(medication);
                if (!isMounted) return;

                setFormData({
                    medicationId: baseMedication.id,
                    name: baseMedication.name,
                    genericName: baseMedication.genericName,
                    concentration: baseMedication.concentration,
                    price: baseMedication.price,
                    usage: baseMedication.usage,
                    timing: baseMedication.timing,
                    instructions: baseMedication.instructions,
                    warnings: baseMedication.warnings || [],
                    minAgeMonths: baseMedication.minAgeMonths,
                    maxAgeMonths: baseMedication.maxAgeMonths,
                    minWeight: baseMedication.minWeight,
                    maxWeight: baseMedication.maxWeight,
                    matchKeywords: baseMedication.matchKeywords || [],
                    category: baseMedication.category,
                    dosageConditions: [],
                    form: baseMedication.form
                });
            }
        };

        void loadCustomization();

        return () => {
            isMounted = false;
        };
    }, [medication, user?.uid]);

    const handleSave = async () => {
        if (!user?.uid || !medication) return;

        setLoading(true);
        try {
            const cleanedData: MedicationCustomization = {
                medicationId: formData.medicationId || medication.id,
                name: formData.name?.trim() || '',
                genericName: formData.genericName?.trim() || '',
                concentration: formData.concentration?.trim() || '',
                price: formData.price !== undefined && formData.price !== null ? formData.price : undefined,
                usage: formData.usage?.trim() || '',
                timing: formData.timing?.trim() || '',
                instructions: formData.instructions?.trim() || '',
                warnings: formData.warnings || [],
                minAgeMonths: formData.minAgeMonths !== undefined && formData.minAgeMonths !== null ? formData.minAgeMonths : undefined,
                maxAgeMonths: formData.maxAgeMonths !== undefined && formData.maxAgeMonths !== null ? formData.maxAgeMonths : undefined,
                minWeight: formData.minWeight !== undefined && formData.minWeight !== null ? formData.minWeight : undefined,
                maxWeight: formData.maxWeight !== undefined && formData.maxWeight !== null ? formData.maxWeight : undefined,
                matchKeywords: formData.matchKeywords || [],
                category: formData.category !== undefined ? formData.category : undefined,
                dosageConditions: formData.dosageConditions && formData.dosageConditions.length > 0 ? formData.dosageConditions : undefined,
                form: formData.form,
                isNew: medication.isNew
            };

            await medicationCustomizationService.saveCustomization(user.uid, cleanedData);

            const successMessage = '✅ تم حفظ التعديلات بنجاح!';
            if (onShowNotification) {
                onShowNotification(successMessage, 'success');
            } else {
                setNotification({ message: successMessage, type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            }

            onSave();
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (error) {
            console.error('Error saving customization:', error);
            const err = error as { code?: string; details?: { limit?: number; limitReachedMessage?: string }; message?: string };
            const details = err?.details || {};
            const limit = Number(details?.limit || 0);
            const quotaMessage = String(details?.limitReachedMessage || '').trim();
            const fallbackQuota = limit > 0
                ? `❌ وصلت للحد الأقصى لتخزين الأدوية المعدلة (${limit}).`
                : '❌ وصلت للحد الأقصى لتخزين الأدوية المعدلة.';

            const errorMessage = err?.code === 'resource-exhausted'
                ? (quotaMessage || fallbackQuota)
                : '❌ حدث خطأ أثناء حفظ التعديلات';
            if (onShowNotification) {
                onShowNotification(errorMessage, 'error');
            } else {
                setNotification({ message: errorMessage, type: 'error' });
                setTimeout(() => setNotification(null), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetClick = () => {
        setShowConfirmReset(true);
    };

    const handleResetConfirm = async () => {
        if (!user?.uid || !medication) return;

        setShowConfirmReset(false);
        setLoading(true);
        try {
            await medicationCustomizationService.deleteCustomization(user.uid, medication.id);

            if (medication.isNew) {
                onSave();
                onClose();
                return;
            }

            const baseMedication = await getBaseMedication(medication);

            setFormData({
                medicationId: baseMedication.id,
                name: baseMedication.name,
                genericName: baseMedication.genericName,
                concentration: baseMedication.concentration,
                price: baseMedication.price,
                usage: baseMedication.usage,
                timing: baseMedication.timing,
                instructions: baseMedication.instructions,
                warnings: baseMedication.warnings || [],
                minAgeMonths: baseMedication.minAgeMonths,
                maxAgeMonths: baseMedication.maxAgeMonths,
                minWeight: baseMedication.minWeight,
                maxWeight: baseMedication.maxWeight,
                matchKeywords: baseMedication.matchKeywords || [],
                category: baseMedication.category,
                dosageConditions: [],
                form: baseMedication.form
            });

            onSave();
            const resetMessage = '✅ تم العودة للقيم الافتراضية بنجاح!';
            if (onShowNotification) {
                onShowNotification(resetMessage, 'success');
            } else {
                setNotification({ message: resetMessage, type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (error) {
            console.error('Error resetting customization:', error);
            const errBase = '❌ حدث خطأ أثناء إعادة التعيين';
            if (onShowNotification) {
                onShowNotification(errBase, 'error');
            } else {
                setNotification({ message: errBase, type: 'error' });
                setTimeout(() => setNotification(null), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateField = <K extends keyof MedicationCustomization>(field: K, value: MedicationCustomization[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!medication) return null;

    return (
        <>
            {notification && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[400] animate-fadeIn">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 ${
                        notification.type === 'success' ? 'bg-emerald-600' :
                        notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fadeIn no-print"
                onMouseDown={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); onClose(); } }}
                onClick={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); onClose(); } }}
            >
                <div
                    className="bg-white rounded-[28px] shadow-[0_25px_70px_-30px_rgba(0,0,0,0.65)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MedicationEditModalHeader
                        isNewMedication={isNewMedication}
                        medicationName={medication.name}
                        onClose={onClose}
                    />

                    <div className="p-7 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 flex-1">
                        <MedicationBasicInfoSection
                            formData={formData}
                            isNewMedication={isNewMedication}
                            updateField={updateField}
                        />
                        <MedicationDosageBuilder
                            dosageConditions={formData.dosageConditions}
                            onChange={(conditions) => updateField('dosageConditions', conditions)}
                        />
                    </div>

                    <MedicationEditModalFooter
                        isNewMedication={isNewMedication}
                        loading={loading}
                        onReset={handleResetClick}
                        onClose={onClose}
                        onSave={handleSave}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmReset}
                title={isNewMedication ? 'حذف الدواء' : 'العودة للقيم الافتراضية'}
                message={
                    isNewMedication
                        ? 'هل أنت متأكد من حذف هذا الدواء نهائياً؟ لا يمكن التراجع عن هذا الإجراء.'
                        : 'هل أنت متأكد من العودة للقيم الافتراضية من البيانات المحلية؟ سيتم حذف جميع التعديلات المحفوظة لهذا الدواء.'
                }
                onConfirm={handleResetConfirm}
                onCancel={() => setShowConfirmReset(false)}
                confirmText={isNewMedication ? 'نعم، احذف الدواء' : 'نعم، العودة للافتراضي'}
                cancelText="إلغاء"
                isDanger={isNewMedication}
            />
        </>
    );
};
