import { useCallback, useEffect, useRef, useState } from 'react';
import {
    downloadPrescriptionPdf,
    printPrescription,
    sharePrescriptionViaWhatsApp,
} from '../components/prescription/printUtils';
import type { PaperSizeSettings } from '../types';
// ─ تشديد أمني 2026-04: نستهلك كوتا قبل أي إجراء تصدير (طباعة/تنزيل/واتساب) ─
import { consumeStorageQuota } from '../services/accountTypeControlsService';
import { isQuotaLimitExceededError } from '../services/account-type-controls/quotaErrors';

/**
 * usePrescriptionExport — Hook موحّد لتصدير الروشتة (طباعة/تنزيل PDF/واتساب).
 *
 * يجمع حالات التحميل المنفصلة لكل عملية مع علم مشترك (isExporting) يستخدمه
 * مكوّن المعاينة لتفعيل isPrintMode (إخفاء أزرار التحرير لحظة الالتقاط).
 *
 * كل العمليات تستخدم حوار الطباعة الأصلي للمتصفح (window.print) لضمان تشكيل
 * الحروف العربية و RTL بشكل صحيح، وإخراج PDF بتنسيق vector (لا raster). ما
 * يطبعه المستخدم هو نفسه ما ينزّله — ومشاركة واتساب تفتح المحادثة ليرفق الملف
 * الذي نزّله يدوياً.
 */

type PrescriptionExportOperation = 'print' | 'download' | 'whatsapp';

interface UsePrescriptionExportOptions {
    paperSize?: PaperSizeSettings;
    patientName?: string;
    phone?: string;
    onError?: (operation: PrescriptionExportOperation, error: unknown) => void;
    onTrack?: (operation: PrescriptionExportOperation) => void;
    /** يُستدعى قبل فتح حوار الطباعة — للتنبيهات التوجيهية (مثلاً: اختر حفظ كـ PDF). */
    onPrompt?: (operation: PrescriptionExportOperation) => void;
    /**
     * 🆕 يُستدعى لو الكوتا (الحد اليومي) انتهت — الـcaller بيعرض مودال
     * فيه رسالة الأدمن + رابط واتساب. لو undefined، الإجراء بيمشي بدون فحص.
     */
    onQuotaLimitReached?: (
        operation: PrescriptionExportOperation,
        details: {
            message: string;
            whatsappNumber: string;
            whatsappUrl: string;
            limit: number;
        }
    ) => void;
}

interface UsePrescriptionExportReturn {
    isPrinting: boolean;
    isDownloading: boolean;
    isSharingViaWhatsApp: boolean;
    isExporting: boolean;
    handlePrint: () => Promise<void>;
    handleDownload: () => Promise<void>;
    handleShareWhatsApp: () => Promise<void>;
}

const REENTRY_GUARD_MS = 1500;

export function usePrescriptionExport(
    options: UsePrescriptionExportOptions,
): UsePrescriptionExportReturn {
    const { paperSize, patientName, phone, onError, onTrack, onPrompt, onQuotaLimitReached } = options;

    /**
     * 🆕 فحص الكوتا قبل أي إجراء تصدير. بيرجع true لو نقدر نكمل، false لو الكوتا
     * انتهت أو في خطأ (في الحالتين الـcaller المسؤول يعرض رسالة).
     * - quota انتهت → بنستدعي onQuotaLimitReached مع تفاصيل الرسالة
     * - أي خطأ تاني → نمنع الإجراء + onError (تشديد أمني — مفيش continue-on-transient)
     */
    const checkQuota = useCallback(
        async (
            op: PrescriptionExportOperation,
            feature: 'prescriptionPrint' | 'prescriptionDownload' | 'prescriptionWhatsapp',
        ): Promise<boolean> => {
            try {
                await consumeStorageQuota(feature);
                return true;
            } catch (err: unknown) {
                if (isQuotaLimitExceededError(err) && onQuotaLimitReached) {
                    const details = (err as { details?: Record<string, unknown> })?.details || {};
                    const limit = Number(details.limit || 0);
                    const message = String(details.limitReachedMessage || '').trim()
                        .replace(/\{\s*limit\s*\}/gi, String(limit));
                    onQuotaLimitReached(op, {
                        message: message || 'تم استهلاك الحد اليومي. للترقية تواصل عبر واتساب.',
                        whatsappNumber: String(details.whatsappNumber || ''),
                        whatsappUrl: String(details.whatsappUrl || ''),
                        limit,
                    });
                } else {
                    onError?.(op, err);
                }
                return false;
            }
        },
        [onError, onQuotaLimitReached],
    );

    const [isPrinting, setIsPrinting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharingViaWhatsApp, setIsSharingViaWhatsApp] = useState(false);

    const isExporting = isPrinting || isDownloading || isSharingViaWhatsApp;

    const lastTriggerRef = useRef<Record<PrescriptionExportOperation, number>>({
        print: 0,
        download: 0,
        whatsapp: 0,
    });

    // زر واتساب يتطلّب تنزيل الروشتة أولاً. هذا العلم يتحوّل true بعد أول تنزيل
    // ناجح ويُعاد إلى false عند تغيّر المريض/الهاتف (روشتة جديدة).
    const hasDownloadedRef = useRef(false);

    useEffect(() => {
        hasDownloadedRef.current = false;
    }, [patientName, phone]);

    const guard = useCallback(
        (op: PrescriptionExportOperation): boolean => {
            const now = Date.now();
            if (isExporting) return false;
            if (now - lastTriggerRef.current[op] < REENTRY_GUARD_MS) return false;
            lastTriggerRef.current[op] = now;
            return true;
        },
        [isExporting],
    );

    const handlePrint = useCallback(async () => {
        if (!guard('print')) return;
        // 🆕 فحص الحد اليومي قبل الطباعة
        if (!(await checkQuota('print', 'prescriptionPrint'))) return;
        onTrack?.('print');
        setIsPrinting(true);
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        try {
            await printPrescription(paperSize);
        } catch (err) {
            onError?.('print', err);
        } finally {
            setIsPrinting(false);
        }
    }, [guard, onError, onTrack, paperSize, checkQuota]);

    const handleDownload = useCallback(async () => {
        if (!guard('download')) return;
        // 🆕 فحص الحد اليومي قبل التنزيل
        if (!(await checkQuota('download', 'prescriptionDownload'))) return;
        onTrack?.('download');
        setIsDownloading(true);
        // ننتظر إطارين من rAF عشان React يعمل commit للـ loading state
        // (الـ spinner + "جاري التنزيل…") قبل ما html2canvas يبدأ ويحبس
        // الـ main thread. بدون ده الـ spinner مش بيظهر.
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        try {
            // اسم الملف = اسم المريض كما هو، أو "روشتة" لو مفيش اسم
            const trimmedName = patientName?.trim();
            const fileName = trimmedName && trimmedName.length > 0 ? trimmedName : 'روشتة';
            await downloadPrescriptionPdf(paperSize, {
                fileName,
                onPrompt: () => onPrompt?.('download'),
            });
            hasDownloadedRef.current = true;
        } catch (err) {
            onError?.('download', err);
        } finally {
            setIsDownloading(false);
        }
    }, [guard, onError, onPrompt, onTrack, paperSize, patientName, checkQuota]);

    const handleShareWhatsApp = useCallback(async () => {
        if (!guard('whatsapp')) return;

        // خطوة 1: لو المستخدم لسه ما نزّلش الروشتة، اعرض تنبيه يوجّهه للتنزيل
        // أولاً، من غير ما نفتح واتساب. بعد التنزيل يضغط زر واتساب مرة أخرى.
        if (!hasDownloadedRef.current) {
            onPrompt?.('whatsapp');
            return;
        }

        // 🆕 فحص الحد اليومي قبل فتح واتساب
        if (!(await checkQuota('whatsapp', 'prescriptionWhatsapp'))) return;

        // خطوة 2: بعد التنزيل، افتح محادثة واتساب مباشرة بالرقم المسجّل.
        onTrack?.('whatsapp');
        setIsSharingViaWhatsApp(true);
        try {
            sharePrescriptionViaWhatsApp({ patientName, phone });
            // نعيد ضبط العلم — لو الطبيب عايز يبعت تاني لازم ينزّل مرة أخرى
            // (أو يضغط تنزيل بعد تعديل الروشتة).
            hasDownloadedRef.current = false;
        } catch (err) {
            onError?.('whatsapp', err);
        } finally {
            setIsSharingViaWhatsApp(false);
        }
    }, [guard, onError, onPrompt, onTrack, patientName, phone, checkQuota]);

    return {
        isPrinting,
        isDownloading,
        isSharingViaWhatsApp,
        isExporting,
        handlePrint,
        handleDownload,
        handleShareWhatsApp,
    };
}
