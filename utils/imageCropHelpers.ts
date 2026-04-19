/**
 * مساعدات مشتركة لقص الصور (Image Cropping Shared Helpers)
 *
 * يجمع هذا الملف الدوال المتكررة التي كانت مُعرَّفة في:
 *  - utils/cropImage.ts (قص دائري)
 *  - utils/rectCropImage.ts (قص مستطيل)
 *
 * الهدف: مصدر واحد موثوق لعمليات تحميل الصورة، حساب الدوران، وحجم
 * الصندوق المحيط بعد الدوران — دون تغيير أي منطق في دوال القص الأصلية.
 */

/** تحويل رابط الصورة إلى كائن Image الخاص بالمتصفح. */
export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

/** تحويل الزاوية من درجات إلى راديان. */
export const getRadianAngle = (degreeValue: number): number => (degreeValue * Math.PI) / 180;

/**
 * حساب أبعاد الصندوق المحيط (Bounding Box) بعد دوران صورة بزاوية معينة.
 * يُستخدم لضبط حجم الـ canvas قبل الرسم.
 */
export const rotateSize = (width: number, height: number, rotation: number) => {
    const rotationRad = getRadianAngle(rotation);
    return {
        width: Math.abs(Math.cos(rotationRad) * width) + Math.abs(Math.sin(rotationRad) * height),
        height: Math.abs(Math.sin(rotationRad) * width) + Math.abs(Math.cos(rotationRad) * height),
    };
};
