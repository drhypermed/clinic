import { createImage, getRadianAngle, rotateSize } from './imageCropHelpers';

/**
 * وظيفة القص المستطيل (getRectCroppedImg):
 * تسمح بقص أي منطقة من الصورة وتحجيمها (Resize) اختيارياً للحفاظ على دقة محددة.
 */
export async function getRectCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    outputWidth?: number, // اختياري: لفرض عرض محدد للنتيجة (مع الحفاظ على التناسب)
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

    const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight)
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
        throw new Error('No 2d context')
    }

    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight
    croppedCtx.putImageData(imageData, 0, 0)

    if (!outputWidth || outputWidth <= 0) {
        return croppedCanvas.toDataURL('image/png', 1.0)
    }

    const scaledWidth = Math.max(1, Math.floor(outputWidth))
    const scaledHeight = Math.max(1, Math.floor(scaledWidth / (cropWidth / cropHeight)))
    const scaledCanvas = document.createElement('canvas')
    const scaledCtx = scaledCanvas.getContext('2d')

    if (!scaledCtx) {
        throw new Error('No 2d context')
    }

    scaledCanvas.width = scaledWidth
    scaledCanvas.height = scaledHeight
    scaledCtx.drawImage(croppedCanvas, 0, 0, scaledWidth, scaledHeight)

    // إرجاع الصورة بصيغة Base64 مع تحديد الجودة القصوى
    return scaledCanvas.toDataURL('image/png', 1.0)
}
