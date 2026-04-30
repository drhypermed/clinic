/**
 * printUtils.ts — تصدير الروشتة (طباعة / تنزيل PDF / واتساب)
 *
 * ثلاث عمليات كلها تستخدم نفس الاستراتيجية: window.print() الأصلي.
 *
 *  ─── لماذا window.print() وليس html2canvas? ───
 *  جربنا html2canvas + jsPDF في البداية، لكن فشل لأسباب أساسية:
 *   - Arabic shaping/RTL — محرك html2canvas مش بيفهم تشكيل الحروف العربية
 *     ولا اتجاه RTL، فالنصوص بتطلع مكسّرة ومتداخلة
 *   - CORS — Firebase Storage مش بيرجع CORS headers للصور افتراضياً
 *   - Raster وليس Vector — الجودة محدودة والملف كبير
 *
 *  بدلاً من ذلك نستخدم محرك الطباعة الأصلي للمتصفح (window.print()):
 *   - Arabic shaping صحيح 100% (محرك العرض الأصلي)
 *   - Vector PDF عند حفظ "Save as PDF"
 *   - الصور تعمل بلا CORS (محمّلة فعلاً في DOM)
 *   - نفس المحرك اللي بيرسم الروشتة على الشاشة يرسمها في PDF
 *
 *  ─── الفروق بين الأزرار الثلاثة ───
 *  - printPrescription: يفتح الحوار، المستخدم يختار طابعته
 *  - downloadPrescriptionPdf: يفتح الحوار مع document.title = اسم المريض،
 *    المستخدم يختار "Save as PDF" من قائمة الوجهة
 *  - sharePrescriptionViaWhatsApp: يفتح الحوار، بعدها تُفتح محادثة واتساب
 *    ليُرفق الملف يدوياً
 */

import type { PaperSizeSettings } from '../../types';
import { injectPrintPageStyle, applyPaperSizeCssVars } from '../prescription-settings/utils';

// ─── الأساس: تشغيل حوار الطباعة الأصلي ────────────────────────────

const REENTRY_GUARD_MS = 1200;
const FONTS_READY_TIMEOUT_MS = 3000;
let lastPrintInvocation = 0;

/**
 * يضمن إن خط Cairo (وأي خط CSS لسه بيتحمّل) خلص تحميل قبل ما نفتح حوار الطباعة.
 *
 * المشكلة على الموبايل: index.html بيحمّل Cairo بـ <link media="print" onload="this.media='all'">
 * — أسلوب deferred-load عشان الـ splash يبان بسرعة. على اللابتوب النت بيخلّص الخط
 * في ميلي ثواني قبل ما الطبيب يضغط طباعة. على الموبايل النت أبطأ وممكن الطبيب
 * يضغط الزر قبل ما الـ@font-face حتى تتسجّل في document.fonts، فالـ PDF يطلع
 * بخط fallback (Times/Arial) والتنسيق يتغيّر لأن عرض الحروف مختلف.
 *
 * الحل: قبل الطباعة:
 *   1) نستنى الـ<link> بتاع Cairo يتأكد إنه حُمّل (لو لسه بيتحمّل).
 *   2) نطلب تحميل وزن Cairo الصريح (400/700/800) عشان نضمن إن الـwoff2 موجود.
 *   3) نستنى document.fonts.ready مع timeout ٣ ثواني (أمان لو النت بطيء جداً).
 */
async function ensureFontsReady(): Promise<void> {
    if (typeof document === 'undefined') return;

    // (1) لو لينك Cairo Google Fonts لسه بيتحمّل، استنى يخلّص.
    const cairoLink = document.querySelector<HTMLLinkElement>(
        'link[rel="stylesheet"][href*="fonts.googleapis.com"][href*="Cairo"]',
    );
    if (cairoLink && !cairoLink.sheet) {
        await new Promise<void>((resolve) => {
            const cleanup = () => {
                cairoLink.removeEventListener('load', cleanup);
                cairoLink.removeEventListener('error', cleanup);
                resolve();
            };
            cairoLink.addEventListener('load', cleanup, { once: true });
            cairoLink.addEventListener('error', cleanup, { once: true });
            // أمان: لو الـlink مش هيخلّص (مثلاً: انقطاع شبكة)، استمر بعد ثانيتين.
            window.setTimeout(cleanup, 2000);
        });
    }

    // (2) نجبر تحميل أوزان Cairo الشائعة قبل ما نطبع — fail silent على كل وزن.
    if (document.fonts && typeof document.fonts.load === 'function') {
        await Promise.all(
            ['400 1em "Cairo"', '700 1em "Cairo"', '800 1em "Cairo"'].map((spec) =>
                document.fonts.load(spec).catch(() => undefined),
            ),
        );
    }

    // (3) ننتظر document.fonts.ready مع timeout أمان عشان ما نعلّقش حوار الطباعة.
    if (document.fonts && document.fonts.ready) {
        await Promise.race([
            document.fonts.ready.then(() => undefined),
            new Promise<void>((resolve) => window.setTimeout(resolve, FONTS_READY_TIMEOUT_MS)),
        ]);
    }
}

async function waitForPreviewLayout(): Promise<void> {
    // أولاً: نضمن إن الخطوط حمّلت (Cairo + أي خط CSS) — ده اللي بيظبط
    // الموبايل لما الطبيب يضغط طباعة قبل ما deferred-load Google Fonts يخلّص.
    await ensureFontsReady();
    // بعدين ننتظر إطارين عشان React يطبّق isPrintMode (تخفي أزرار التحرير)
    // و ResizeObserver يعيد حساب auto-scale بناءً على الخط الصح، قبل
    // ما DOM يُلتقط في حوار الطباعة.
    await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
}

/**
 * تشغيل حوار الطباعة الأصلي للمتصفح على الصفحة الحالية.
 * يضمن أن إعدادات الورقة (size/@page) محدَّثة قبل فتح الحوار.
 * يُحَل الوعد بعد إغلاق الحوار (عبر afterprint) مع timeout احتياطي.
 */
async function triggerNativePrintDialog(paperSize?: PaperSizeSettings): Promise<void> {
    const now = Date.now();
    if (now - lastPrintInvocation < REENTRY_GUARD_MS) return;
    lastPrintInvocation = now;

    // نُحدّث قواعد @page و CSS variables قبل الطباعة مباشرةً
    // (قد تكون الإعدادات تغيّرت بعد آخر render).
    applyPaperSizeCssVars(paperSize);
    injectPrintPageStyle(paperSize);

    await waitForPreviewLayout();

    return new Promise<void>((resolve) => {
        let settled = false;
        let fallback: number | undefined;

        // مسار واحد للإنهاء يزيل الـ listener والـ timeout معاً.
        // يضمن عدم تسرّب أي مرجع في مسار الطباعة الناجحة، الفاشلة، أو الـ fallback.
        const finish = () => {
            if (settled) return;
            settled = true;
            window.removeEventListener('afterprint', finish);
            if (fallback !== undefined) window.clearTimeout(fallback);
            resolve();
        };

        window.addEventListener('afterprint', finish);
        // احتياط على المتصفحات التي لا تُطلق afterprint (iOS Safari القديم)
        fallback = window.setTimeout(finish, 120_000);

        // في Firefox window.print() قد يرمي إذا كانت الصفحة غير جاهزة —
        // نُغلّفها بـ try/catch ونحلّ الوعد فوراً.
        try {
            window.print();
        } catch {
            finish();
        }
    });
}

// ─── (1) الطباعة ──────────────────────────────────────────────────

/**
 * طباعة الروشتة — يفتح حوار الطباعة الأصلي للمتصفح.
 * المستخدم يختار الطابعة من الحوار. ما يُطبع هو العنصر الحقيقي
 * #printable-prescription كما يظهر على الشاشة تماماً.
 */
export async function printPrescription(paperSize?: PaperSizeSettings): Promise<void> {
    await triggerNativePrintDialog(paperSize);
}

// ─── (2) تنزيل PDF عبر حوار الطباعة الأصلي ──────────────────────

interface DownloadOptions {
    /** اسم الملف بدون امتداد. افتراضي: 'روشتة'. يُستخدم كـ document.title
     *  مؤقتاً عشان Chrome/Edge يقترحه كاسم افتراضي في حوار "Save as PDF". */
    fileName?: string;
    /** تنبيه اختياري يُستدعى قبل فتح حوار الطباعة لإرشاد المستخدم. */
    onPrompt?: () => void;
}

/**
 * تنزيل الروشتة كملف PDF عبر حوار الطباعة الأصلي للمتصفح.
 *
 * لماذا حوار الطباعة وليس html2canvas؟
 *  - html2canvas مش بيدعم Arabic shaping/RTL كويس — النصوص العربية بتطلع مكسّرة
 *  - html2canvas بيطلب CORS للصور من Firebase Storage — بيفشل بدون تكوين
 *  - حوار الطباعة بيستخدم محرك العرض الأصلي للمتصفح:
 *    • Arabic shaping/ligatures صحيحة 100%
 *    • RTL text flow صحيح
 *    • vector PDF (مش raster) = جودة لا محدودة
 *    • CORS مش مشكلة (الصور محمّلة فعلاً في DOM)
 *
 * الآلية:
 *  1) نغيّر document.title مؤقتاً لاسم المريض — Chrome/Edge بياخد الـ title
 *     كاسم افتراضي مقترَح في حوار "Save as PDF".
 *  2) نستدعي onPrompt لإرشاد المستخدم لاختيار "Save as PDF" من قائمة الوجهة.
 *  3) نفتح حوار الطباعة الأصلي (نفس آلية زر الطباعة).
 *  4) المستخدم يختار "Save as PDF" ويضغط Save — Chrome ينزّل الملف باسم
 *     المريض تلقائياً.
 *  5) بعد إغلاق الحوار نرجّع الـ title الأصلي.
 */
export async function downloadPrescriptionPdf(
    paperSize?: PaperSizeSettings,
    options: DownloadOptions = {},
): Promise<void> {
    applyPaperSizeCssVars(paperSize);

    // اسم الملف الآمن — إزالة الرموز الممنوعة في أسماء الملفات
    const safeName = (options.fileName || 'روشتة')
        .replace(/[\\/:*?"<>|]+/g, '_')
        .trim() || 'روشتة';

    // تغيير document.title مؤقتاً — Chrome بياخده كاسم افتراضي للـ PDF
    const originalTitle = document.title;
    document.title = safeName;

    try {
        options.onPrompt?.();
        await triggerNativePrintDialog(paperSize);
    } finally {
        document.title = originalTitle;
    }
}

// ─── (3) إرسال عبر واتساب ───────────────────────────────────────

interface ShareOptions {
    phone?: string;
    patientName?: string;
    message?: string;
}

/**
 * تطبيع رقم الهاتف لصيغة wa.me الدولية:
 *  - يُسقط أي محارف غير رقمية
 *  - يُسقط 00 الدولية إن وُجدت
 *  - يحوّل الصفر المحلي (مصر) إلى 20
 */
function sanitizePhoneForWhatsApp(rawPhone?: string): string {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/[^\d]/g, '');
    if (!digits) return '';
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = `20${digits.slice(1)}`;
    return digits;
}

/**
 * فتح محادثة واتساب لإرسال الروشتة.
 *
 * ملاحظة: هذه الدالة لا تُشغّل حوار الطباعة — المفترض أن المستخدم يكون قد
 * نزّل ملف PDF مسبقاً عبر زر التنزيل. هنا فقط نفتح محادثة wa.me:
 *  - إن وُجد رقم المريض: تُفتح المحادثة مباشرة معه
 *  - إن لم يُوجد: تُفتح واجهة اختيار محادثة واتساب الفارغة
 * ثم يُرفق الطبيب الملف يدوياً في المحادثة.
 */
export function sharePrescriptionViaWhatsApp(options: ShareOptions = {}): void {
    const phone = sanitizePhoneForWhatsApp(options.phone);
    const message = options.message
        || (options.patientName
            ? `الروشتة الطبية للمريض ${options.patientName}`
            : 'الروشتة الطبية');

    const waBase = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
    const waUrl = `${waBase}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
}
