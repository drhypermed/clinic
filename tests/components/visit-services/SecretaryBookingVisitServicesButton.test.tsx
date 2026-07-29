import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecretaryBookingVisitServicesButton } from '../../../components/visit-services/SecretaryBookingVisitServicesButton';
import { loadSecretaryVisitServiceTemplates } from '../../../services/visit-services/secretaryVisitServicesService';

vi.mock('../../../services/visit-services/secretaryVisitServicesService', () => ({
  loadSecretaryVisitServiceTemplates: vi.fn(),
}));

describe('SecretaryBookingVisitServicesButton', () => {
  beforeEach(() => {
    vi.mocked(loadSecretaryVisitServiceTemplates).mockResolvedValue([]);
  });

  it('keeps the service as a booking draft until the appointment is submitted', async () => {
    const onChange = vi.fn();
    render(
      <SecretaryBookingVisitServicesButton
        userId="doctor-1"
        secret="booking-secret"
        sessionToken="session-token"
        patientName="مريض تجريبي"
        drafts={[]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /\+ إضافة خدمة\/رسوم/ }));
    await waitFor(() => expect(loadSecretaryVisitServiceTemplates).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('اسم الخدمة'), {
      target: { value: 'رسم قلب' },
    });
    fireEvent.change(screen.getByLabelText('السعر'), {
      target: { value: '250' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'إضافة إلى الزيارة' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'رسم قلب',
        amount: 250,
        type: 'interventions',
        paymentType: 'cash',
        saveAsTemplate: true,
      }),
    ]));
  });
});
