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
    type ReportPediatricTracking,
    type ReportPregnancyTracking,
} from '../../reports/clinical-ai-report';
import type { PatientFileData } from '../../patient-files/patientFilesShared';
import { consumeStorageQuota } from '../../../services/accountTypeControlsService';
import { getCachedSpecialtyPacks } from '../../../services/specialty-packs';
import {
    calculateGestationalWeek,
    getTodayDateKey as gynToday,
    loadPregnancyFile,
} from '../../../services/specialty-packs/gynecology';
import {
    EGYPTIAN_VACCINATION_SCHEDULE,
    buildPediatricFileStorageKey,
    loadPediatricFile,
} from '../../../services/specialty-packs/pediatrics';
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

            // ─ جلب بيانات حزم التخصصات لو الباكدج مفعّل — تضاف كملحق في التقرير
            //   صفر تكلفه على الأطباء اللي مش متفعّل عندهم الباكدج (الـif بيكسر مبكراً).
            const packs = getCachedSpecialtyPacks();
            let pregnancyTracking: ReportPregnancyTracking | undefined;
            let pediatricTracking: ReportPediatricTracking | undefined;
            if (userId && payload.patientFile.key) {
                try {
                    if (packs?.packs.gynecology?.enabled) {
                        const file = await loadPregnancyFile(userId, payload.patientFile.key);
                        if (file.lastMenstrualPeriod || file.visits.length > 0) {
                            const week = calculateGestationalWeek(file.lastMenstrualPeriod, gynToday());
                            pregnancyTracking = {
                                lmp: file.lastMenstrualPeriod,
                                edd: file.estimatedDueDate,
                                currentWeek: week ?? undefined,
                                closedAt: file.closedAt,
                                closureType: file.closureType,
                                visits: file.visits.map((v) => ({
                                    dateKey: v.dateKey,
                                    gestationalWeek: v.gestationalWeek,
                                    fetalWeight: v.fetalWeight,
                                    fetalHeartRate: v.fetalHeartRate,
                                    fetalMovement: v.fetalMovement || undefined,
                                    maternalWeight: v.maternalWeight,
                                    ultrasoundNotes: v.ultrasoundNotes,
                                    notes: v.notes,
                                })),
                            };
                        }
                    }
                    if (packs?.packs.pediatrics?.enabled) {
                        const pediatricFileKey = buildPediatricFileStorageKey({
                            patientFileId: payload.patientFile.fileId,
                            patientFileNumber: payload.patientFile.fileNumber,
                            patientFileNameKey: payload.patientFile.key,
                        }) || payload.patientFile.key;
                        const file = await loadPediatricFile(userId, pediatricFileKey, payload.patientFile.key);
                        const hasData = Boolean(file.dateOfBirth)
                            || file.growthEntries.length > 0
                            || Object.keys(file.vaccinations).length > 0;
                        if (hasData) {
                            pediatricTracking = {
                                dateOfBirth: file.dateOfBirth,
                                sex: file.sex,
                                growthEntries: file.growthEntries.map((g) => ({
                                    dateKey: g.dateKey,
                                    weightKg: g.weightKg,
                                    heightCm: g.heightCm,
                                    headCircCm: g.headCircCm,
                                    notes: g.notes,
                                })),
                                vaccinations: EGYPTIAN_VACCINATION_SCHEDULE.map((s) => {
                                    const rec = file.vaccinations[s.id];
                                    return {
                                        shortName: s.shortName,
                                        vaccine: s.vaccine,
                                        ageLabel: s.ageLabel,
                                        status: rec?.status || 'pending',
                                        givenDate: rec?.givenDate,
                                    };
                                }),
                            };
                        }
                    }
                } catch {
                    // أي فشل في القراءه — التقرير يكمل بدون الملحق
                }
            }

            const result = await createAndOpenClinicalAiPatientReport({
                patientFile: payload.patientFile,
                language: payload.language,
                pageSize: payload.pageSize,
                fontSize: payload.fontSize,
                doctorName: doctorSignature,
                systemRequestSettings: systemRequestLineSettings as any,
                pregnancyTracking,
                pediatricTracking,
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
