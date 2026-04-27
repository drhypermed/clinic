/**
 * useMedicalReportPrinter — طباعة تقرير الحالة الطبي عبر AI
 *
 * يُستخرج هذا الـ hook من `MainApp` ليغلف منطق طباعة تقرير المريض (AI report):
 *   1. استهلاك حصة `medicalReportPrint` من backend.
 *   2. معالجة أخطاء الحصة (ترجمتها للعربية/الإنجليزية مع دعم WhatsApp support line).
 *   3. معالجة أخطاء المصادقة (توجيه المستخدم لإعادة تسجيل الدخول).
 *   4. استدعاء `createAndOpenClinicalAiPatientReport` لتوليد التقرير.
 *   5. تتبع الاستخدام (usageTrackingService) بعد نجاح التوليد.
 *
 * يعتمد على عدة خدمات: accountTypeControlsService، usageTrackingService،
 * clinical-ai-report، وsystemRequestLineSettings.
 */

import React from 'react';
import type { User } from 'firebase/auth';
import {
    createAndOpenClinicalAiPatientReport,
    type ClinicalReportLanguage,
    type ClinicalReportPageSize,
} from '../../reports/clinical-ai-report';
import type { PatientFileData } from '../../patient-files/patientFilesShared';
import { consumeStorageQuota } from '../../../services/accountTypeControlsService';
import {
    getQuotaVerificationFailureMessage,
    isQuotaLimitExceededError,
    retryOnTransientError,
} from '../../../services/account-type-controls/quotaErrors';
import { usageTrackingService } from '../../../services/usageTrackingService';
import { applyQuotaPlaceholders, extractQuotaErrorDetails } from './helpers';

interface UseMedicalReportPrinterArgs {
    userId: string;
    user: User | null | undefined;
    doctorName: string;
    systemRequestLineSettings: unknown;
}

interface GeneratePatientMedicalReportPayload {
    patientFile: PatientFileData;
    language: ClinicalReportLanguage;
    pageSize: ClinicalReportPageSize;
    fontSize: number;
}

export const useMedicalReportPrinter = ({
    userId,
    user,
    doctorName,
    systemRequestLineSettings,
}: UseMedicalReportPrinterArgs) => {
    const handleGeneratePatientMedicalReport = React.useCallback(
        async (payload: GeneratePatientMedicalReportPayload) => {
            try {
                // retry تلقائي على أخطاء النت العابرة (3 محاولات بـbackoff)
                await retryOnTransientError(() => consumeStorageQuota('medicalReportPrint'));
            } catch (error) {
                const quotaDetails = extractQuotaErrorDetails(error);

                if (isQuotaLimitExceededError(error)) {
                    const fallback = payload.language === 'ar'
                        ? 'تم استهلاك الحد اليومي لطباعة تقرير الحالة لهذا الحساب.'
                        : 'Daily medical case report printing limit has been reached for this account.';
                    const fromBackend = quotaDetails
                        ? applyQuotaPlaceholders(quotaDetails.limitReachedMessage || '', quotaDetails)
                        : '';

                    const supportLine = quotaDetails?.whatsappUrl
                        ? (payload.language === 'ar'
                            ? `\nللدعم والاشتراك: ${quotaDetails.whatsappUrl}`
                            : `\nSupport and subscription: ${quotaDetails.whatsappUrl}`)
                        : '';

                    throw new Error(`${fromBackend || fallback}${supportLine}`.trim());
                }

                console.warn('Medical report quota check failed; blocking print:', error);
                throw new Error(getQuotaVerificationFailureMessage(
                    payload.language === 'ar'
                        ? 'تعذر التحقق من حد طباعة التقرير الطبي الآن. حاول مرة أخرى.'
                        : 'Could not verify the medical report print limit. Please try again.',
                ));

            }

            const doctorSignature = (doctorName || user?.displayName || '').trim() || 'الطبيب المعالج';
            const result = await createAndOpenClinicalAiPatientReport({
                patientFile: payload.patientFile,
                language: payload.language,
                pageSize: payload.pageSize,
                fontSize: payload.fontSize,
                doctorName: doctorSignature,
                systemRequestSettings: systemRequestLineSettings as any,
            });

            if (userId) {
                usageTrackingService.trackEvent({
                    doctorId: userId,
                    eventType: 'print',
                    metadata: {
                        type: 'medical_case_report',
                        language: payload.language,
                        pageSize: payload.pageSize,
                        generatedByAi: result.generatedByAi,
                        visitsCount: payload.patientFile.visits.length,
                    },
                }).catch((err) => console.error('Failed to track AI medical report print:', err));
            }
        },
        [doctorName, systemRequestLineSettings, user, userId]
    );

    return { handleGeneratePatientMedicalReport };
};
