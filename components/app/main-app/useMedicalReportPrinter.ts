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
import { isQuotaLimitExceededError } from '../../../services/account-type-controls/quotaErrors';
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
                await consumeStorageQuota('medicalReportPrint');
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

                const rawMessage = error instanceof Error ? error.message : '';
                const normalized = rawMessage.toLowerCase();
                const isAuthFailure = normalized.includes('unauthenticated') || rawMessage.includes('فشلت المصادقة');
                const isAppCheckFailure = normalized.includes('app check') || rawMessage.includes('App Check');

                // في بيئة التطوير على الجهاز المحلي: لو فشل التحقق بسبب App Check أو المصادقة
                // (بسبب عدم تسجيل Debug Token)، نسمح بمواصلة الطباعة عشان ما نعطّلش التطوير.
                const isDevEnv = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;
                const isLocalhost = typeof window !== 'undefined' && (
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '[::1]'
                );
                if ((isDevEnv || isLocalhost) && (isAuthFailure || isAppCheckFailure)) {
                    console.warn('[dev] تجاوز فحص حد الطباعة بسبب فشل App Check/المصادقة في بيئة التطوير:', error);
                } else if (isAuthFailure) {
                    throw new Error(
                        rawMessage
                        || (payload.language === 'ar'
                            ? 'فشلت المصادقة. أعد تسجيل الدخول ثم حاول مرة أخرى.'
                            : 'Authentication failed. Please sign in again and retry.')
                    );
                } else {
                    console.error('Failed to consume medical report print quota:', error);
                    throw new Error(
                        payload.language === 'ar'
                            ? 'تعذر التحقق من حد طباعة التقرير الآن. حاول مرة أخرى بعد قليل.'
                            : 'Unable to verify report printing quota right now. Please try again shortly.'
                    );
                }
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
