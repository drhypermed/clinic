import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VisitServicesModal } from '../../../components/visit-services/VisitServicesModal';
import type { VisitServiceTemplate } from '../../../services/visit-services/types';

const template: VisitServiceTemplate = {
  id: 'svc_i_ecg',
  name: 'رسم قلب',
  normalizedName: 'رسم قلب',
  type: 'interventions',
  defaultPrice: 250,
  branchId: 'main',
  active: true,
  usageCount: 3,
  createdAt: 1,
  updatedAt: 1,
  lastUsedAt: 1,
  createdByRole: 'doctor',
};

describe('VisitServicesModal', () => {
  it('fills a saved template and adds it to the current visit', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(
      <VisitServicesModal
        isOpen
        onClose={vi.fn()}
        patientName="مريض تجريبي"
        templates={[template]}
        items={[]}
        onAdd={onAdd}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /رسم قلب/ }));

    expect(screen.getByLabelText('اسم الخدمة')).toHaveValue('رسم قلب');
    expect(screen.getByLabelText('السعر')).toHaveValue(250);

    fireEvent.click(screen.getByRole('button', { name: 'إضافة إلى الزيارة' }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith({
      name: 'رسم قلب',
      amount: 250,
      type: 'interventions',
      paymentType: 'cash',
      saveAsTemplate: true,
    }));
  });
});
