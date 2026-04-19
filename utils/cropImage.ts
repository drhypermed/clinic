/**
 * أداة قص الصور الدائرية (Circular Image Cropper):
 * تُستخدم هذه الأداة بشكل أساسي لقص صور الـ Profile للأطباء
 * ليتم عرضها بشكل دائري واحترافي داخل الروشتة أو لوحة التحكم.
 */

import { createImage, getRadianAngle, rotateSize } from './imageCropHelpers';

/**
 * وظيفة قص ومعالجة الصورة (getCroppedImg):
 * تقوم بقص جزء محدد من الصورة وتحويله إلى شكل دائري (Circle Clip)
 * ثم إخراجه بصيغة Base64 وبحجم 300x300 بكسل كحد افتراضي.
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    targetSize: number = 300, // الحجم النهائي (عرض/ارتفاع)
    rotation: number = 0
): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    const safeRotation = Number.isFinite(rotation) ? rotation : 0
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, safeRotation)

    canvas.width = Math.max(1, Math.floor(bBoxWidth))
    canvas.height = Math.max(1, Math.floor(bBoxHeight))

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(getRadianAngle(safeRotation))
    ctx.translate(-image.width / 2, -image.height / 2)
    ctx.drawImage(image, 0, 0)

    const cropX = Math.max(0, Math.floor(pixelCrop.x))
    const cropY = Math.max(0, Math.floor(pixelCrop.y))
    const cropWidth = Math.max(1, Math.min(Math.floor(pixelCrop.width), canvas.width - cropX))
    const cropHeight = Math.max(1, Math.min(Math.floor(pixelCrop.height), canvas.height - cropY))

    const croppedImageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight)
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
        throw new Error('No 2d context')
    }

    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight
    croppedCtx.putImageData(croppedImageData, 0, 0)

    // تهيئة مساحة الرسم (Canvas) بالحجم المطلوب
    canvas.width = targetSize
    canvas.height = targetSize

    /** بداية عملية القص الدائري (Circular Clipping) */
    ctx.beginPath()
    ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, 2 * Math.PI)
    ctx.clip()
    /** نهاية عملية القص الدائري */

    // رسم الجزء المقصوص من الصورة الأصلية داخل المساحة الجديدة
    ctx.drawImage(
        croppedCanvas,
        0,
        0,
        cropWidth,
        cropHeight,
        0,
        0,
        targetSize,
        targetSize
    )

    // إرجاع النتيجة بصيغة Base64 (PNG لدعم شفافية الحواف الدائرية)
    return canvas.toDataURL('image/png')
}
