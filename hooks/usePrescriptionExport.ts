import { useCallback, useEffect, useRef, useState } from 'react';
import {
    downloadPrescriptionPdf,
    printPrescription,
    sharePrescriptionViaWhatsApp,
} from '../components/prescription/printUtils';
import type { PaperSizeSettings } from '../types';

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

// زدنا من 1500 → 3000ms عشان iOS Safari أحياناً بيرسل touchstart + click
// متعاقبين مع فاصل أكبر من 1.5 ثانية على نت بطيء (المستخدم بيضغط مرتين بدون
// ما يلاحظ). 3 ثواني آمنة لأن window.print() نفسها بتاخد ثانية على الأقل.
const REENTRY_GUARD_MS = 3000;

export function usePrescriptionExport(
    options: UsePrescriptionExportOptions,
): UsePrescriptionExportReturn {
    const { paperSize, patientName, phone, onError, onTrack, onPrompt } = options;

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
        // ـ نـset isPrinting=true فوراً (قبل أي async) — يخلي الزر disabled قبل
        //   ما الـbrowser يرسل أي click event ثاني (iOS bug: double-click).
        setIsPrinting(true);
        try {
            onTrack?.('print');
            await printPrescription(paperSize);
        } catch (err) {
            onError?.('print', err);
        } finally {
            setIsPrinting(false);
        }
    }, [guard, onError, onTrack, paperSize]);

    const handleDownload = useCallback(async () => {
        if (!guard('download')) return;
        // ـ نـset isDownloading=true فوراً قبل أي async — يحمي من double-click
        //   على الموبايل (نفس الـpattern في handlePrint).
        setIsDownloading(true);
        try {
            onTrack?.('download');
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
    }, [guard, onError, onPrompt, onTrack, paperSize, patientName]);

    const handleShareWhatsApp = useCallback(async () => {
        if (!guard('whatsapp')) return;

        // خطوة 1: لو المستخدم لسه ما نزّلش الروشتة، اعرض تنبيه يوجّهه للتنزيل
        // أولاً، من غير ما نفتح واتساب. بعد التنزيل يضغط زر واتساب مرة أخرى.
        if (!hasDownloadedRef.current) {
            onPrompt?.('whatsapp');
            return;
        }

        // ـ نـset isSharingViaWhatsApp=true فوراً (حماية من double-click) ـ
        setIsSharingViaWhatsApp(true);
        try {
            // خطوة 2: بعد التنزيل، افتح محادثة واتساب مباشرة بالرقم المسجّل.
            onTrack?.('whatsapp');
            sharePrescriptionViaWhatsApp({ patientName, phone });
            // نعيد ضبط العلم — لو الطبيب عايز يبعت تاني لازم ينزّل مرة أخرى
            // (أو يضغط تنزيل بعد تعديل الروشتة).
            hasDownloadedRef.current = false;
        } catch (err) {
            onError?.('whatsapp', err);
        } finally {
            setIsSharingViaWhatsApp(false);
        }
    }, [guard, onError, onPrompt, onTrack, patientName, phone]);

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
