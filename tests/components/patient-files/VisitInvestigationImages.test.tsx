import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  deletePatientImage,
  loadPatientImageObjectUrl,
  loadPatientImagesByIds,
} = vi.hoisted(() => ({
  deletePatientImage: vi.fn(),
  loadPatientImageObjectUrl: vi.fn(),
  loadPatientImagesByIds: vi.fn(),
}));

vi.mock('../../../services/patient-files/images', () => ({
  deletePatientImage,
  loadPatientImageObjectUrl,
  loadPatientImagesByIds,
}));

import { VisitInvestigationImages } from '../../../components/patient-files/VisitInvestigationImages';

const image = {
  id: 'image-1',
  patientFileId: 'patient-1',
  patientFileNameKey: 'patient-key',
  originalName: 'scan.jpg',
  storagePath: 'patient-images/doctor-1/patient-1/image-1.jpg',
  contentType: 'image/jpeg',
  width: 1200,
  height: 800,
  originalSizeBytes: 1000,
  compressedSizeBytes: 600,
  uploadedAtMs: 1,
  status: 'ready' as const,
  source: 'investigations' as const,
};

describe('VisitInvestigationImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadPatientImagesByIds.mockResolvedValue([image]);
    loadPatientImageObjectUrl.mockResolvedValue('blob:visit-image');
    deletePatientImage.mockResolvedValue(undefined);
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows that record images are in the patient gallery and deletes them permanently', async () => {
    render(<VisitInvestigationImages userId="doctor-1" imageIds={['image-1']} />);

    expect(await screen.findByRole('img', { name: 'scan.jpg' })).toHaveAttribute('src', 'blob:visit-image');
    expect(screen.getByText('محفوظة أيضًا داخل صور المريض')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'حذف الصورة scan.jpg نهائيًا' }));

    await waitFor(() => expect(deletePatientImage).toHaveBeenCalledWith('doctor-1', image));
    expect(screen.queryByRole('img', { name: 'scan.jpg' })).not.toBeInTheDocument();
    expect(screen.getByText('تم حذف الصورة نهائيًا من السجل وصور المريض والسحابة.')).toBeInTheDocument();
  });
});
