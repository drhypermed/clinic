import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const cleanupModule = require(
  '../../functions/src/functions/patientImageMetadataCleanupFunctions.js',
) as ((context: Record<string, unknown>) => {
  cleanupPatientImageObjectOnMetadataDelete: (event: unknown) => Promise<{ deleted: boolean; reason?: string }>;
}) & {
  getDeletedImageStoragePath: (input: { userId: string; imageData: unknown }) => string;
};

describe('patient image metadata cleanup', () => {
  it('accepts only an object path belonging to the deleted image owner', () => {
    expect(cleanupModule.getDeletedImageStoragePath({
      userId: 'doctor-1',
      imageData: { storagePath: 'patient-images/doctor-1/file-1/image-1.webp' },
    })).toBe('patient-images/doctor-1/file-1/image-1.webp');

    expect(cleanupModule.getDeletedImageStoragePath({
      userId: 'doctor-1',
      imageData: { storagePath: 'patient-images/doctor-2/file-1/image-1.webp' },
    })).toBe('');
  });

  it('deletes the storage object using idempotent ignoreNotFound semantics', async () => {
    const deleteObject = vi.fn().mockResolvedValue(undefined);
    const file = vi.fn(() => ({ delete: deleteObject }));
    const bucket = vi.fn(() => ({ file }));
    const handler = cleanupModule({
      admin: { storage: () => ({ bucket }) },
    }).cleanupPatientImageObjectOnMetadataDelete;

    await expect(handler({
      params: { userId: 'doctor-1', imageId: 'image-1' },
      data: { data: () => ({ storagePath: 'patient-images/doctor-1/file-1/image-1.webp' }) },
    })).resolves.toEqual({ deleted: true });

    expect(file).toHaveBeenCalledWith('patient-images/doctor-1/file-1/image-1.webp');
    expect(deleteObject).toHaveBeenCalledWith({ ignoreNotFound: true });
  });

  it('does not touch storage when deleted metadata contains an unsafe path', async () => {
    const bucket = vi.fn();
    const handler = cleanupModule({
      admin: { storage: () => ({ bucket }) },
    }).cleanupPatientImageObjectOnMetadataDelete;

    await expect(handler({
      params: { userId: 'doctor-1', imageId: 'image-1' },
      data: { data: () => ({ storagePath: 'homepage-banners/banner.webp' }) },
    })).resolves.toEqual({ deleted: false, reason: 'invalid-metadata' });
    expect(bucket).not.toHaveBeenCalled();
  });
});

