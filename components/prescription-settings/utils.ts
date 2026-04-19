/**
 * الملف: utils.ts (Prescription Settings)
 * الوصف: ثوابت ودوال مساعدة لإعدادات الروشتة.
 *
 * آلية الطباعة الدقيقة:
 * ┌─────────────────────────────────────────────────┐
 * │  @page { size: W H; margin: 0 }  ← دائماً صفر  │
 * │  #printable-prescription:                        │
 * │    width/height: W×H mm                          │
 * │    padding: marginTop/Right/Bottom/Left (mm)     │  ← هوامش المحتوى الداخلية
 * │  #prescription-scale-container:                  │
 * │    transform: translate(-50%+offsetX, offsetY)   │  ← إزاحة على الصفحة
 * └─────────────────────────────────────────────────┘
 *
 * لماذا @page margin دائماً صفر؟
 * لأن إضافة @page margin تُقلّص منطقة الطباعة لكن #printable-prescription
 * يبقى بأبعاد الورقة الكاملة فيُقطع. الهوامش تُعامَل كـ padding داخلي
 * بينما الشكل النهائي يُرسم مباشرة على المقاس المختار.
 */

import { PaperSizeSettings } from '../../types';

export function stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

export const LABEL_CLASS = 'block text-sm font-bold text-slate-600 mb-2';

/** نسبة التحويل من mm إلى px عند دقة 96 DPI */
export const MM_TO_PX = 3.7795275591;

/** أبعاد المقاسات القياسية بالـ mm */
export const PAPER_SIZE_PRESETS = {
    A5: { widthMm: 148, heightMm: 210 },
    A4: { widthMm: 210, heightMm: 297 },
} as const;

export const PRESCRIPTION_BASE_CANVAS_MM = PAPER_SIZE_PRESETS.A5;

/** إرجاع أبعاد الورقة بالـ mm. الافتراضي: A5 */
export function getPaperDimensions(paperSize?: PaperSizeSettings): { widthMm: number; heightMm: number } {
    if (!paperSize || paperSize.size === 'A5') return { widthMm: 148, heightMm: 210 };
    if (paperSize.size === 'A4') return { widthMm: 210, heightMm: 297 };
    return {
        widthMm: (paperSize.customWidth ?? 0) > 0 ? paperSize.customWidth! : 148,
        heightMm: (paperSize.customHeight ?? 0) > 0 ? paperSize.customHeight! : 210,
    };
}

/** عرض الورقة بالـ px (96 DPI) */
export function getPaperWidthPx(paperSize?: PaperSizeSettings): number {
    return getPaperDimensions(paperSize).widthMm * MM_TO_PX;
}

/** هوامش المحتوى الداخلية بالـ mm (تُطبَّق كـ padding، لا تؤثر على حجم الورقة) */
export function getPaperMargins(paperSize?: PaperSizeSettings) {
    return {
        top: paperSize?.marginTop ?? 0,
        right: paperSize?.marginRight ?? 0,
        bottom: paperSize?.marginBottom ?? 0,
        left: paperSize?.marginLeft ?? 0,
    };
}

/** نسبة التصغير عند الطباعة (1.0 = حجم كامل) */
export function getPrintScale(paperSize?: PaperSizeSettings): number {
    const s = paperSize?.printScale ?? 0.95;
    return Math.max(0.5, Math.min(1.0, s));
}

/** إزاحة الطباعة على الصفحة بالـ mm */
export function getPrintOffset(paperSize?: PaperSizeSettings): { x: number; y: number } {
    return {
        x: paperSize?.printOffsetX ?? 0,
        y: paperSize?.printOffsetY ?? 0,
    };
}

/**
 * تطبيق CSS Variables على :root
 * يُستخدم كبديل احتياطي في المتصفحات التي تدعم CSS vars في @media print
 */
export function applyPaperSizeCssVars(paperSize?: PaperSizeSettings): void {
    const { widthMm, heightMm } = getPaperDimensions(paperSize);
    const { top, right, bottom, left } = getPaperMargins(paperSize);
    const scale = getPrintScale(paperSize);
    const { x, y } = getPrintOffset(paperSize);
    const root = document.documentElement;
    root.style.setProperty('--rx-paper-width', `${widthMm}mm`);
    root.style.setProperty('--rx-paper-height', `${heightMm}mm`);
    root.style.setProperty('--rx-margin-top', `${top}mm`);
    root.style.setProperty('--rx-margin-right', `${right}mm`);
    root.style.setProperty('--rx-margin-bottom', `${bottom}mm`);
    root.style.setProperty('--rx-margin-left', `${left}mm`);
    root.style.setProperty('--rx-print-scale', String(scale));
    root.style.setProperty('--rx-print-offset-x', `${x}mm`);
    root.style.setProperty('--rx-print-offset-y', `${y}mm`);
}

/**
 * حقن قاعدة @page ديناميكياً.
 *
 * القاعدة الأساسية: @page دائماً margin: 0
 * - الهوامش المرئية تُطبَّق كـ padding داخلي على #printable-prescription
 * - الإزاحة (printOffsetX/Y) تُعدّل موضع الروشتة على الورقة
 */
/**
 * حقن قواعد @page + أبعاد الورقة ديناميكياً.
 *
 * لماذا JS وليس CSS فقط؟
 * - CSS custom properties (vars) لا تعمل داخل @page في أي متصفح
 * - هذه الدالة تحقن القيم الصحيحة مباشرة قبل الطباعة
 *
 * البنية النهائية أثناء الطباعة:
 *  @page { size: W H; margin: 0 }
 *  #print-prescription-wrapper   → position: fixed، flex centering، height = H
 *    #prescription-scale-container → width/height = W×H، offset
 *      #printable-prescription   → width/height = W×H، transform: scale(S)
 */
export function injectPrintPageStyle(paperSize?: PaperSizeSettings): void {
    const { widthMm, heightMm } = getPaperDimensions(paperSize);
    const scale = getPrintScale(paperSize);
    const { x, y } = getPrintOffset(paperSize);

    // إزالة العنصر القديم وإعادة إنشائه بالكامل
    // — Chrome يُخزّن مؤقتاً قاعدة @page { size } عند أول render
    //   ولا يعيد قراءتها عند تحديث .textContent فقط.
    //   الحل الموثوق هو حذف العنصر وإعادة إنشائه لإجبار إعادة التحليل.
    const old = document.getElementById('rx-dynamic-print-style');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    const styleEl = document.createElement('style');
    styleEl.id = 'rx-dynamic-print-style';
    document.head.appendChild(styleEl);

    // الخلاصة: الروشتة ترتسم مباشرةً بأبعاد الورقة الفعلية المختارة.
    //  - A5 → 148×210mm، A4 → 210×297mm، custom → الأبعاد المدخلة.
    //  - لا canvas ثابت ولا transform: scale صناعي.
    //  - printScale (<1) يُطبَّق كتحجيم يدوي اختياري من إعدادات الطبيب فقط.
    const manualScaleBlock = scale < 1
        ? `transform: scale(${scale}) !important; transform-origin: center center !important;`
        : `transform: none !important;`;

    styleEl.textContent = `
@media print {
  @page {
    size: ${widthMm}mm ${heightMm}mm;
    margin: 0;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    background: #fff !important;
    overflow: visible !important;
  }
  /*
   * استراتيجية الإخفاء/الإظهار (بدون DOM manipulation):
   *
   * المشكلة: الـ wrapper متداخل جوه #root، والـ #root فيه كل التطبيق.
   * لو شلنا height:0 على الأجداد، الـ #root بياخد طول كل التطبيق
   * (sidebar, navigation, إلخ.) والـ wrapper بيظهر في النص = صفحات فاضية.
   *
   * الحل: display: contents على الأجداد = الأجداد بلا box في الـ layout.
   * نتيجة: الـ wrapper فعلياً بيبقى ابن مباشر لـ body، وأبناء الأجداد التانيين
   * اللي اتعملوا display: none مش بياخدوا مساحة.
   */
  body *:not(#print-prescription-wrapper, #print-prescription-wrapper *, :has(#print-prescription-wrapper)) {
    display: none !important;
  }
  body *:has(#print-prescription-wrapper) {
    display: contents !important;
  }
  /*
   * ملاحظة مهمة: لا تستخدم position: fixed هنا.
   * position: fixed في الطباعة بتقيد العنصر بـ viewport (حجم الشاشة) مش
   * بحجم الصفحة الفعلي — على اللابتوب ذو الشاشة القصيرة الفوتر بيتقص.
   * الحل: position: static و @page هو اللي بيحدد حجم الصفحة الفعلي.
   */
  #print-prescription-wrapper {
    position: static !important;
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    max-width: none !important;
    min-width: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    overflow: visible !important;
    transform: none !important;
    background: #fff !important;
  }
  #prescription-scale-container {
    position: relative !important;
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    max-width: none !important;
    margin: ${y}mm 0 0 ${x}mm !important;
    padding: 0 !important;
    display: block !important;
    transform: none !important;
    transform-origin: 0 0 !important;
    transition: none !important;
    background: #fff !important;
  }
  #printable-prescription {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    display: grid !important;
    grid-template-rows: auto minmax(0, 1fr) auto !important;
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    max-width: none !important;
    margin: 0 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    ${manualScaleBlock}
  }
  /*
   * الفوتر في الصف الثالث من الـ grid (auto). خلّيه block عادي يتبع ارتفاعه
   * الطبيعي — min-content كان بيسبب اختفاء في Chrome print؛ auto أأمن.
   */
  #printable-prescription-footer-cell {
    display: block !important;
    min-height: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }
}
`.trim();
}

/**
 * تسجيل مستمع beforeprint يعيد حقن CSS قبل كل طباعة مباشرةً.
 * يضمن أن حجم الورقة الصحيح يُطبَّق حتى لو تغيرت الإعدادات بعد آخر render.
 *
 * @returns دالة لإلغاء التسجيل
 */
export function registerBeforePrintHandler(getPaperSize: () => PaperSizeSettings | undefined): () => void {
    const handler = () => {
        const paperSize = getPaperSize();
        applyPaperSizeCssVars(paperSize);
        injectPrintPageStyle(paperSize);
    };
    window.addEventListener('beforeprint', handler);
    return () => window.removeEventListener('beforeprint', handler);
}

/** عرض المعاينة الافتراضي (A5) بالبكسل */
export const PREVIEW_WIDTH_PX = 560;
