import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('firebase/functions', () => ({ httpsCallable: vi.fn(() => vi.fn()) }));
vi.mock('../../services/firebaseConfig', () => ({ db: {}, functions: {}, storage: {} }));

import {
  compressPatientImagePreservingDimensions,
  MAX_PATIENT_IMAGES,
  canUsePatientImages,
  getPatientImagesLimitMessage,
  PATIENT_IMAGES_PRO_MAX_MESSAGE,
} from '../../services/patient-files/images';

describe('patient file images', () => {
  let encodedSize = 120;
  let encodedSizes: number[] = [];
  let encodedQualities: number[] = [];
  let drawImage: ReturnType<typeof vi.fn>;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    encodedSize = 120;
    encodedSizes = [];
    encodedQualities = [];
    drawImage = vi.fn();
    originalCreateElement = document.createElement.bind(document);

    class MockImage {
      naturalWidth = 4032;
      naturalHeight = 3024;
      width = 4032;
      height = 3024;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal('Image', MockImage);
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:test') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });

    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
      if (tagName !== 'canvas') return originalCreateElement(tagName, options);
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({ drawImage })),
        toDataURL: vi.fn(() => 'data:image/webp;base64,AA=='),
        toBlob: vi.fn((callback: BlobCallback, contentType?: string, quality?: number) => {
          if (typeof quality === 'number') encodedQualities.push(quality);
          const nextSize = encodedSizes.length > 0 ? encodedSizes.shift()! : encodedSize;
          callback(new Blob([new Uint8Array(nextSize)], { type: contentType || 'image/webp' }));
        }),
      } as unknown as HTMLCanvasElement;
    }) as typeof document.createElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps the exact original width and height while re-encoding', async () => {
    const file = new File([new Uint8Array(800)], 'xray.jpg', { type: 'image/jpeg' });

    const result = await compressPatientImagePreservingDimensions(file);

    expect(result.width).toBe(4032);
    expect(result.height).toBe(3024);
    expect(result.blob.size).toBe(encodedSize);
    expect(result.contentType).toBe('image/webp');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 4032, 3024);
  });

  it('keeps an already smaller original instead of increasing storage cost', async () => {
    encodedSize = 1_000;
    const file = new File([new Uint8Array(200)], 'optimized.webp', { type: 'image/webp' });

    const result = await compressPatientImagePreservingDimensions(file);

    expect(result.blob).toBe(file);
    expect(result.blob.size).toBe(200);
  });

  it('uses the highest WebP quality that reaches the detail-safe storage target', async () => {
    encodedSizes = [1_500_000, 1_250_000, 900_000];
    const file = new File([new Uint8Array(3_000_000)], 'large-scan.jpg', { type: 'image/jpeg' });

    const result = await compressPatientImagePreservingDimensions(file);

    expect(result.width).toBe(4032);
    expect(result.height).toBe(3024);
    expect(result.blob.size).toBe(900_000);
    expect(encodedQualities).toEqual([0.8, 0.74, 0.68]);
  });

  it('rejects formats that cannot be compressed safely and fixes the limit at 50', async () => {
    const gif = new File([new Uint8Array(100)], 'animated.gif', { type: 'image/gif' });

    await expect(compressPatientImagePreservingDimensions(gif)).rejects.toThrow('نوع الصورة غير مدعوم');
    expect(MAX_PATIENT_IMAGES).toBe(50);
  });

  it('allows uploads only for Pro Max and provides clear responsive-dialog copy', () => {
    expect(canUsePatientImages('pro_max')).toBe(true);
    expect(canUsePatientImages('free')).toBe(false);
    expect(canUsePatientImages('premium')).toBe(false);
    expect(canUsePatientImages('plus')).toBe(false);
    expect(PATIENT_IMAGES_PRO_MAX_MESSAGE).toContain('برو ماكس');
  });

  it('asks the doctor to delete images when the patient reaches 50', () => {
    expect(getPatientImagesLimitMessage()).toContain('50');
    expect(getPatientImagesLimitMessage()).toContain('حذف');
    expect(getPatientImagesLimitMessage(2)).toContain('2');
  });
});
