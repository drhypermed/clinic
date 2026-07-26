import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadPatientImageObjectUrl, subscribeToPatientImages, uploadPatientImage } = vi.hoisted(() => ({
  loadPatientImageObjectUrl: vi.fn(),
  subscribeToPatientImages: vi.fn(),
  uploadPatientImage: vi.fn(),
}));

vi.mock('../../../services/patient-files/images', () => ({
  MAX_PATIENT_IMAGES: 50,
  PATIENT_IMAGES_PRO_MAX_MESSAGE:
    'إضافة صور الفحوصات وملفات المرضى متاحة حصرياً في باقة برو ماكس.',
  canUsePatientImages: (accountType?: string) => accountType === 'pro_max',
  getPatientImagesLimitMessage: () =>
    'تم الوصول إلى الحد الأقصى (50 صورة لكل مريض). يرجى حذف بعض الصور القديمة حتى تتمكن من إضافة صور جديدة.',
  loadPatientImageObjectUrl,
  subscribeToPatientImages,
  uploadPatientImage,
}));

import { InvestigationImagesField } from '../../../components/consultation/InvestigationImagesField';

const renderField = (overrides: Partial<React.ComponentProps<typeof InvestigationImagesField>> = {}) => {
  const props: React.ComponentProps<typeof InvestigationImagesField> = {
    userId: 'doctor-1',
    accountType: 'pro_max',
    patientName: 'مريض تجريبي',
    patientFileId: 'patient-1',
    images: [],
    onChange: vi.fn(),
    ...overrides,
  };
  return render(<InvestigationImagesField {...props} />);
};

describe('InvestigationImagesField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeToPatientImages.mockImplementation(
      (_userId: string, _patientFileId: string, onImages: (images: unknown[]) => void) => {
        onImages([]);
        return vi.fn();
      },
    );
    loadPatientImageObjectUrl.mockResolvedValue('blob:cloud-preview');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:local-preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  });

  it('shows the Pro Max notice instead of opening the picker for other tiers', () => {
    renderField({ accountType: 'plus' });

    fireEvent.click(screen.getByRole('button', { name: 'إضافة صور' }));

    expect(screen.getByText('ميزة صور الفحوصات')).toBeInTheDocument();
    expect(screen.getByText(/متاحة حصرياً في باقة برو ماكس/)).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveClass('rounded-t-[1.75rem]', 'sm:rounded-[1.75rem]', 'sm:max-w-md');
    expect(dialog.parentElement).toHaveClass('items-end', 'sm:items-center');
  });

  it('requires a patient name before a Pro Max upload', () => {
    renderField({ patientName: '   ' });

    fireEvent.click(screen.getByRole('button', { name: 'إضافة صور' }));

    expect(screen.getByText('أدخل اسم المريض أولاً')).toBeInTheDocument();
  });

  it('shows the delete-some-images notice when the patient already has 50 images', () => {
    subscribeToPatientImages.mockImplementationOnce(
      (_userId: string, _patientFileId: string, onImages: (images: unknown[]) => void) => {
        onImages(Array.from({ length: 50 }, (_, index) => ({ id: String(index) })));
        return vi.fn();
      },
    );
    renderField();

    fireEvent.click(screen.getByRole('button', { name: 'إضافة صور' }));

    expect(screen.getByText('اكتمل حد الصور')).toBeInTheDocument();
    expect(screen.getByText(/50 صورة لكل مريض/)).toBeInTheDocument();
    expect(screen.getByText(/حذف بعض الصور القديمة/)).toBeInTheDocument();
  });

  it('uploads an investigation image to the shared patient gallery and links it to the visit', async () => {
    const onChange = vi.fn();
    const uploadedImage = {
      id: 'image-1',
      patientFileId: 'patient-1',
      patientFileNameKey: 'test-patient',
      originalName: 'lab-result.jpg',
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
    uploadPatientImage.mockResolvedValueOnce(uploadedImage);
    const { container, rerender } = renderField({ onChange });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['image-data'], 'lab-result.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(uploadPatientImage).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'doctor-1',
      patientFileId: 'patient-1',
      file,
      source: 'investigations',
    })));
    expect(onChange).toHaveBeenCalledWith([uploadedImage]);
    rerender(
      <InvestigationImagesField
        userId="doctor-1"
        accountType="pro_max"
        patientName="مريض تجريبي"
        patientFileId="patient-1"
        images={[uploadedImage]}
        onChange={onChange}
      />,
    );
    expect(await screen.findByRole('img', { name: 'lab-result.jpg' })).toHaveAttribute('src', 'blob:local-preview');
    expect(loadPatientImageObjectUrl).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /^فتح الصورة lab-result\.jpg$/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تكبير الصورة' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تصغير الصورة' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'تكبير الصورة' }));
    expect(screen.getByRole('button', { name: 'إرجاع حجم الصورة إلى 100%' })).toHaveTextContent('150%');

    fireEvent.click(screen.getByRole('button', { name: 'الرجوع من عرض الصورة' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows byte upload progress while an investigation image is being uploaded', async () => {
    let finishUpload: ((value: unknown) => void) | undefined;
    uploadPatientImage.mockImplementationOnce((input: { onProgress?: (value: unknown) => void }) => {
      input.onProgress?.({ phase: 'uploading', percent: 63 });
      return new Promise((resolve) => { finishUpload = resolve; });
    });
    const { container } = renderField();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['image-data'], 'scan.jpg', { type: 'image/jpeg' })] },
    });

    const progressbar = await screen.findByRole('progressbar', { name: 'تقدم رفع صورة المريض' });
    expect(progressbar).toHaveAttribute('aria-valuenow', '63');
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText(/جاري رفع الصورة للسحابة/)).toBeInTheDocument();

    await act(async () => {
      finishUpload?.({
        id: 'progress-image',
        patientFileId: 'patient-1',
        status: 'ready',
      });
    });
  });
});
